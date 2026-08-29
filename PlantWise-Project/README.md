# Plantwise Detection - Cotton Plant Disease & Actionable Decision Engine

Production-ready, modular AI classification & weather-aware decision system for **Cotton (*Gossypium hirsutum*)** farmers in **Khairpur, Sindh, Pakistan**.

---

## 📁 Clean Project Directory Structure

```
PlantWise-Project/
├── README.md                   # Hackathon Documentation & Quickstart Guide
├── main.py                     # Main Entry Point - Launches REST API Server
├── requirements.txt            # Python Package Dependencies
├── COLAB_KAGGLE_GUIDE.md       # GPU Training Guide (Google Colab / Kaggle)
│
├── config/                     # Configuration Files
│   └── class_indices.json      # Locked class index mapping (6 Cotton Disease Classes)
│
├── models/                     # Model Checkpoints & Edge Artifacts
│   ├── best_cotton_model.keras # Trained Keras Transfer Learning Model
│   └── cotton_disease_model.tflite # Optimized Edge/Mobile Model (8.8 MB)
│
├── src/                        # Core Python Source Package
│   ├── __init__.py
│   ├── app.py                  # FastAPI REST Service & Routing logic
│   ├── data_loader.py          # Data augmentation & image preprocessing pipeline
│   ├── train.py                # Transfer learning training pipeline (MobileNetV2 / EfficientNet)
│   ├── inference.py            # Model inference engine & prediction parser
│   ├── decision_engine.py      # Khairpur agronomic rules & weather spray safety guardrails
│   └── weather_service.py      # OpenWeatherMap & Open-Meteo live weather API service
│
├── scripts/                    # Demonstration & Evaluation Tools
│   ├── test_demo.py            # Interactive 5-scenario demo script
│   └── evaluate_accuracy.py    # Model validation accuracy & per-class evaluation tool
│
├── tests/                      # Automated Unit Test Suite
│   ├── test_api.py             # REST API endpoint tests
│   └── test_decision_engine.py # Decision engine & weather guardrail tests
│
└── loginPage/                  # Web Frontend Application Interface
```

---

## 🚀 How to Run (Quickstart Guide for Team & Judges)

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Launch the FastAPI REST API Server
```powershell
python main.py
```
- **Interactive Swagger UI**: Open `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **Live Weather API**: `http://localhost:8000/weather?city=Khairpur`

### 3. Run the Interactive Weather & Decision Demo
```powershell
python scripts/test_demo.py
```

### 4. Run Automated Unit Tests (`pytest`)
```powershell
pytest tests/
```

### 5. Evaluate Model Accuracy on Validation Data
```powershell
python scripts/evaluate_accuracy.py --dataset_dir /path/to/cotton_dataset
```

---

## 🌾 Khairpur, Sindh Agronomic Remedies & Weather Guardrails

| Disease / Condition | Urdu Name | Chemical Spray & Dosage per Acre | Urgency | Weather Safety Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| **Bacterial Blight** | بیکٹیریل بلائٹ | Copper Oxychloride @ 250g/acre + Streptocycline @ 6g/acre | High | **High Wind (>15 km/h)**: Postpone spray due to drift risk. |
| **Aphids** | سست تیلا / سست ڈنگ | Imidacloprid 200 SL @ 60 ml/acre OR Acetamiprid @ 100g/acre | Moderate-High | **Heatwave (>40°C)**: Restrict spray to early morning/evening. |
| **Army worm** | لشکری سنڈی | Emamectin Benzoate 5% SG @ 75g/acre (Evening hours) | Critical | **High Humidity (>85% RH)**: Postpone spray due to wash-off risk. |
| **Powdery Mildew** | پاؤڈری ملڈیو | Water-Soluble Sulfur @ 1 kg/acre OR Hexaconazole @ 250 ml/acre | Moderate | Clear photo request if prediction confidence $< 70\%$. |
| **Target spot** | ٹارگٹ اسپاٹ | Azoxystrobin + Difenoconazole @ 200 ml/acre | Moderate-High | Live city/village weather fetched via OpenWeatherMap API. |
| **Healthy** | صحت مند فصل | No chemical intervention needed. Maintain normal irrigation. | Low | Routine scouting every 4-5 days. |
