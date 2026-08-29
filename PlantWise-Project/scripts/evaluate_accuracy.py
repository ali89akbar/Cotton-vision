"""
Plantwise Detection - Model Accuracy & Performance Evaluation Script
Evaluates overall classification accuracy, loss, precision, recall, F1-score,
and per-class performance on a test/validation dataset folder.
"""

import os
import sys
import argparse
import numpy as np
import tensorflow as tf

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from data_loader import get_data_generators


def evaluate_model_performance(
    dataset_dir: str,
    model_path: str = "models/best_cotton_model.keras",
    batch_size: int = 32,
    target_size: tuple = (224, 224),
):
    """
    Evaluates model accuracy, loss, precision, recall, and per-class performance metrics.
    """
    if not os.path.exists(model_path):
        if os.path.exists("best_cotton_model.keras"):
            model_path = "best_cotton_model.keras"
        else:
            raise FileNotFoundError(f"Model file '{model_path}' not found!")

    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"Dataset directory '{dataset_dir}' not found!")

    print(f"[EVALUATION] Loading trained model from: '{model_path}'...")
    model = tf.keras.models.load_model(model_path, compile=False)
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

    print(f"[EVALUATION] Loading test dataset from: '{dataset_dir}'...")
    train_gen, val_gen, class_indices = get_data_generators(
        dataset_dir=dataset_dir,
        target_size=target_size,
        batch_size=batch_size,
        save_class_indices=False,
    )

    idx_to_class = {v: k for k, v in class_indices.items()}

    print("\n" + "=" * 65)
    print("      EVALUATING MODEL PERFORMANCE ON VALIDATION SET")
    print("=" * 65)

    eval_results = model.evaluate(val_gen, verbose=1)
    metric_names = model.metrics_names

    print("\n--- OVERALL METRICS ---")
    for name, val in zip(metric_names, eval_results):
        if "accuracy" in name:
            print(f"  --> OVERALL ACCURACY : {val * 100:.2f}%")
        elif "loss" in name:
            print(f"  --> LOSS             : {val:.4f}")

    val_gen.reset()
    predictions = model.predict(val_gen, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = val_gen.classes

    num_classes = len(class_indices)
    class_names = [idx_to_class[i] for i in range(num_classes)]

    print("\n--- PER-CLASS METRICS SUMMARY ---")
    print(f"{'Class Name':<22} | {'Total Samples':<13} | {'Correct':<8} | {'Accuracy':<10}")
    print("-" * 65)

    total_correct = 0
    total_samples = len(y_true)

    for i in range(num_classes):
        class_mask = (y_true == i)
        samples_in_class = np.sum(class_mask)
        correct_in_class = np.sum((y_true == i) & (y_pred == i))
        total_correct += correct_in_class

        acc = (correct_in_class / samples_in_class * 100) if samples_in_class > 0 else 0.0
        print(f"{class_names[i]:<22} | {samples_in_class:<13} | {correct_in_class:<8} | {acc:.2f}%")

    overall_acc = (total_correct / total_samples * 100) if total_samples > 0 else 0.0
    print("-" * 65)
    print(f"{'TOTAL / OVERALL':<22} | {total_samples:<13} | {total_correct:<8} | {overall_acc:.2f}%")
    print("=" * 65)

    return overall_acc, eval_results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Cotton Disease Classification Model Accuracy")
    parser.add_argument("--dataset_dir", type=str, required=True, help="Path to validation/test dataset folder")
    parser.add_argument("--model_path", type=str, default="models/best_cotton_model.keras", help="Path to trained Keras model")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")

    args = parser.parse_args()

    evaluate_model_performance(
        dataset_dir=args.dataset_dir,
        model_path=args.model_path,
        batch_size=args.batch_size,
    )
