import os
import json
from typing import Tuple, Dict
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator


def get_data_generators(
    dataset_dir: str,
    target_size: Tuple[int, int] = (224, 224),
    batch_size: int = 32,
    validation_split: float = 0.20,
    save_class_indices: bool = True,
    class_indices_path: str = "config/class_indices.json",
) -> Tuple[ImageDataGenerator, ImageDataGenerator, Dict[str, int]]:
    """
    Creates train and validation data generators with data augmentation suitable
    for outdoor field conditions in Khairpur, Sindh (bright sunlight, angle variations).
    """
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory '{dataset_dir}' does not exist.")

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.20,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
        validation_split=validation_split if not os.path.exists(os.path.join(dataset_dir, "train")) else 0.0,
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=validation_split if not os.path.exists(os.path.join(dataset_dir, "train")) else 0.0,
    )

    train_path = os.path.join(dataset_dir, "train") if os.path.exists(os.path.join(dataset_dir, "train")) else dataset_dir
    val_path = os.path.join(dataset_dir, "val") if os.path.exists(os.path.join(dataset_dir, "val")) else dataset_dir

    if os.path.exists(os.path.join(dataset_dir, "train")):
        train_generator = train_datagen.flow_from_directory(
            train_path,
            target_size=target_size,
            batch_size=batch_size,
            class_mode="categorical",
            shuffle=True,
        )
        val_generator = val_datagen.flow_from_directory(
            val_path,
            target_size=target_size,
            batch_size=batch_size,
            class_mode="categorical",
            shuffle=False,
        )
    else:
        train_generator = train_datagen.flow_from_directory(
            dataset_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode="categorical",
            subset="training",
            shuffle=True,
        )
        val_generator = val_datagen.flow_from_directory(
            dataset_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode="categorical",
            subset="validation",
            shuffle=False,
        )

    class_indices = train_generator.class_indices

    if save_class_indices:
        os.makedirs(os.path.dirname(class_indices_path), exist_ok=True)
        with open(class_indices_path, "w", encoding="utf-8") as f:
            json.dump(class_indices, f, indent=2)
        print(f"[DATA LOADER] Saved class indices mapping to '{class_indices_path}': {class_indices}")

    return train_generator, val_generator, class_indices


def load_and_preprocess_single_image(image_bytes_or_path, target_size=(224, 224)):
    """
    Utility function to load, resize, and normalize a single input image for inference.
    """
    from PIL import Image
    import io
    import numpy as np

    if isinstance(image_bytes_or_path, bytes):
        img = Image.open(io.BytesIO(image_bytes_or_path)).convert("RGB")
    elif isinstance(image_bytes_or_path, str):
        img = Image.open(image_bytes_or_path).convert("RGB")
    else:
        img = image_bytes_or_path.convert("RGB")

    img = img.resize(target_size)
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_batch = np.expand_dims(img_array, axis=0)
    return img_batch
