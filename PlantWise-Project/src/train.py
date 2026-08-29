import os
import argparse
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2, EfficientNetB0
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from data_loader import get_data_generators


def build_transfer_learning_model(
    num_classes: int,
    input_shape: tuple = (224, 224, 3),
    architecture: str = "MobileNetV2",
    dropout_rate: float = 0.3,
) -> Model:
    """
    Builds a transfer learning image classification model using MobileNetV2 or EfficientNetB0.
    """
    if architecture.lower() == "mobilenetv2":
        base_model = MobileNetV2(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape,
        )
    elif architecture.lower() == "efficientnetb0":
        base_model = EfficientNetB0(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape,
        )
    else:
        raise ValueError(f"Unsupported architecture '{architecture}'. Choose 'MobileNetV2' or 'EfficientNetB0'.")

    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dropout(dropout_rate)(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(dropout_rate / 2)(x)
    outputs = Dense(num_classes, activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=outputs, name=f"Cotton_{architecture}")
    return model


def export_to_tflite(keras_model_path: str, tflite_output_path: str = "models/cotton_disease_model.tflite"):
    """
    Converts a saved Keras model into a lightweight TFLite model for mobile and edge deployment.
    """
    print(f"[TFLITE EXPORT] Loading model from '{keras_model_path}' for conversion...")
    os.makedirs(os.path.dirname(tflite_output_path), exist_ok=True)
    model = tf.keras.models.load_model(keras_model_path, compile=False)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    with open(tflite_output_path, "wb") as f:
        f.write(tflite_model)
    print(f"[TFLITE EXPORT] Saved lightweight TFLite model to '{tflite_output_path}' ({len(tflite_model) / 1024 / 1024:.2f} MB).")


def train_model(
    dataset_dir: str,
    epochs: int = 15,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    architecture: str = "MobileNetV2",
    model_save_path: str = "models/best_cotton_model.keras",
    tflite_save_path: str = "models/cotton_disease_model.tflite",
):
    """
    Executes model training with early stopping, checkpointing, and TFLite export.
    """
    print(f"[TRAIN] Loading dataset from: '{dataset_dir}'")
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    train_gen, val_gen, class_indices = get_data_generators(
        dataset_dir=dataset_dir,
        target_size=(224, 224),
        batch_size=batch_size,
        class_indices_path="config/class_indices.json",
    )

    num_classes = len(class_indices)
    print(f"[TRAIN] Found {num_classes} classes: {list(class_indices.keys())}")

    model = build_transfer_learning_model(
        num_classes=num_classes,
        input_shape=(224, 224, 3),
        architecture=architecture,
    )

    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")],
    )

    print(model.summary())

    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        ModelCheckpoint(
            filepath=model_save_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
    ]

    print(f"[TRAIN] Starting training for {epochs} epochs...")
    history = model.fit(
        train_gen,
        epochs=epochs,
        validation_data=val_gen,
        callbacks=callbacks,
    )

    print(f"[TRAIN] Training complete. Best model saved to '{model_save_path}'.")

    export_to_tflite(model_save_path, tflite_save_path)
    return history, model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Cotton Plant Disease Classification Model")
    parser.add_argument("--dataset_dir", type=str, required=True, help="Path to cotton plant disease dataset directory")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate for Adam optimizer")
    parser.add_argument("--arch", type=str, default="MobileNetV2", choices=["MobileNetV2", "EfficientNetB0"], help="Base architecture")
    parser.add_argument("--output_keras", type=str, default="models/best_cotton_model.keras", help="Path to save best Keras model")
    parser.add_argument("--output_tflite", type=str, default="models/cotton_disease_model.tflite", help="Path to save TFLite model")

    args = parser.parse_args()

    train_model(
        dataset_dir=args.dataset_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        architecture=args.arch,
        model_save_path=args.output_keras,
        tflite_save_path=args.output_tflite,
    )
