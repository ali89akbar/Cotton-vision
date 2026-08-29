# Plantwise Detection - Model Training & Execution Guide

Step-by-step instructions to train the **Cotton Plant Disease Classification Model** and export the `.tflite` model for deployment locally, on **Google Colab**, or **Kaggle Notebooks**.

---

## 1. Dataset Context & Setup

- **Kaggle Dataset**: [`dhamur/cotton-plant-disease`](https://www.kaggle.com/datasets/dhamur/cotton-plant-disease)
- **Target Classes**:
  1. `Aphids`
  2. `Army worm`
  3. `Bacterial Blight`
  4. `Healthy`
  5. `Powdery Mildew`
  6. `Target spot`

---

## 2. Running on Google Colab (GPU Accelerated)

### Step 2.1: Mount Google Drive or Download Dataset via Kaggle API
In a Colab cell, install Kaggle CLI and download the dataset:

```python
# Install Kaggle API
!pip install -q kaggle

# Upload your kaggle.json API key or set environment variables
import os
os.environ['KAGGLE_USERNAME'] = "your_kaggle_username"
os.environ['KAGGLE_KEY'] = "your_kaggle_api_key"

# Download and unzip dataset
!kaggle datasets download -d dhamur/cotton-plant-disease
!unzip -q cotton-plant-disease.zip -d ./cotton_dataset
```

### Step 2.2: Clone or Copy Project Files
Upload `data_loader.py`, `train.py`, `decision_engine.py`, `inference.py`, `app.py`, `class_indices.json`, and `requirements.txt` into your Colab environment or run:

```bash
!pip install -r requirements.txt
```

### Step 2.3: Execute Model Training
Run `train.py` with GPU acceleration enabled:

```bash
!python train.py \
  --dataset_dir ./cotton_dataset \
  --epochs 15 \
  --batch_size 32 \
  --lr 0.001 \
  --arch MobileNetV2 \
  --output_h5 best_cotton_model.h5 \
  --output_tflite cotton_disease_model.tflite
```

### Step 2.4: Test Decision Engine & Inference
```python
from inference import get_farmer_recommendation

# Test with an image from your validation set
sample_image_path = "./cotton_dataset/val/Bacterial Blight/sample_leaf.jpg"

recommendation = get_farmer_recommendation(
    image_path_or_bytes=sample_image_path,
    confidence_threshold=0.70,
    weather_data={
        "temperature_c": 38.0,
        "wind_speed_kmh": 12.0,
        "humidity_pct": 60.0
    }
)

import json
print(json.dumps(recommendation, indent=2, ensure_ascii=False))
```

---

## 3. Running on Kaggle Notebooks

1. Create a new Kaggle Notebook.
2. Under **Input**, click **Add Data** and search for `dhamur/cotton-plant-disease`.
3. In the code cell, run:

```python
import os
import tensorflow as tf
from train import train_model

# Kaggle dataset directory path
dataset_dir = "/kaggle/input/cotton-plant-disease"

history, model = train_model(
    dataset_dir=dataset_dir,
    epochs=15,
    batch_size=32,
    learning_rate=0.001,
    architecture="MobileNetV2",
    model_save_path="best_cotton_model.h5",
    tflite_save_path="cotton_disease_model.tflite"
)
```

---

## 4. Local Execution & REST API Server

### Step 4.1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4.2: Start FastAPI REST API Server
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4.3: Test API Prediction with cURL
```bash
curl -X POST "http://localhost:8000/predict?confidence_threshold=0.70&temperature_c=36&wind_speed_kmh=10&humidity_pct=50" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/cotton_leaf.jpg"
```

### Step 4.4: Run Automated Test Suite
```bash
pytest tests/
```
