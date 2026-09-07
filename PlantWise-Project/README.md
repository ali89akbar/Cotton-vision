# PlantWise — Cotton Disease Detection & Weather-Aware Decision Platform

PlantWise is a full-stack AI platform for **Cotton (*Gossypium hirsutum*)** farmers in **Sindh, Pakistan**. It combines:

1. A **TensorFlow/Keras transfer-learning model** that classifies cotton leaf diseases from smartphone photos.
2. A **MERN web application** for farmer onboarding, gamified plant history, and an AI chatbot.
3. A **real-time weather risk engine** that issues crop-specific spray advisories and emails alerts when conditions exceed agronomic thresholds.
4. A **WhatsApp integration** that delivers welcome messages and weather warnings to verified farmer phone numbers.

The project is designed to run end-to-end on a farmer’s phone and to be extensible to other crops and regions.

---

## ✨ Features

- **Cotton disease classification** (Bacterial Blight, Aphids, Army Worm, Powdery Mildew, Target Spot, Healthy) with Urdu advisories and Khairpur-specific chemical spray dosages.
- **Live weather** from OpenWeatherMap with fallback to Open-Meteo satellite feed.
- **Crop-specific weather risk engine** — evaluates heat, frost, wind, rain, humidity against a configurable threshold matrix.
- **Scheduled cron job** (`node-cron`) that polls weather for every farmer’s city and emails only those whose crops are affected, with 12-hour deduplication.
- **In-app notification banner** (wind > 15 km/h) aligned with the email alert threshold.
- **Google Sign-In** with a local OpenID Connect `id_token` decoder to avoid userinfo-host TLS resets on restricted networks.
- **JWT-first auth** for register/login/profile, with a legacy Passport session fallback for Google.
- **Gamified profile**: plant history, saved scans, badges, point-wise checklist, saved-plants grid.
- **AI chatbot** (Qwen LLM via Groq) and **3D AR plant viewer**.

---

## 🏗️ Architecture

```
┌──────────────────────┐        ┌─────────────────────┐
│   React Client       │◀─HTTP─▶│   Node.js Server    │
│   (CRA + MUI)        │        │   (Express +        │
│                      │        │    Passport + JWT)  │
└─────────┬────────────┘        └──┬─────┬──────┬─────┘
          │                        │     │      │
          │                        ▼     ▼      ▼
          │                  MongoDB   SMTP   OpenWeatherMap
          │                        (Nodemailer)   API
          ▼
┌──────────────────────┐        ┌───────────────────┐
│   Python ML API      │◀─HTTP─▶│  FastAPI +        │
│   (FastAPI)          │        │  TensorFlow       │
│                      │        │  Keras / TFLite   │
└──────────────────────┘        └───────────────────┘
```

- **Client**: React 18, MUI, styled-components, React Router, axios.
- **Web Server**: Express 4, Passport.js (Google OAuth2), jsonwebtoken, bcrypt, nodemailer, node-cron, mongoose.
- **ML API**: FastAPI, TensorFlow/Keras, TFLite, Uvicorn, python-multipart.

---

## 📁 Project Layout

```
PlantWise-Project/
├── README.md
├── main.py                     # FastAPI entry point
├── requirements.txt            # Python dependencies
├── .env                        # Python API environment variables
├── COLAB_KAGGLE_GUIDE.md
│
├── config/
│   └── class_indices.json      # Disease class index mapping
├── models/
│   ├── best_cotton_model.keras # Trained transfer-learning model
│   └── cotton_disease_model.tflite
│
├── src/                        # Python package
│   ├── app.py                  # FastAPI app, routes
│   ├── data_loader.py
│   ├── train.py                # MobileNetV2 / EfficientNet training
│   ├── inference.py
│   ├── decision_engine.py      # Khairpur agronomic rules
│   ├── weather_service.py
│   ├── qwen_advisory.py        # Qwen LLM advisory endpoint
│   ├── agent.py
│   └── tools.py
│
├── api/
│   ├── main.py                 # Alternative FastAPI entry point
│   ├── main-tf-serving.py      # TensorFlow Serving variant
│   └── requirements.txt
│
├── scripts/
│   ├── test_demo.py            # 5-scenario demo
│   └── evaluate_accuracy.py    # Validation accuracy tool
│
├── tests/                      # pytest suite
│   ├── test_api.py
│   ├── test_decision_engine.py
│   └── test_qwen_advisory.py
│
└── loginPage/Plant-Wise-Plant-Disease-Detection-/
    ├── package.json            # Workspace-level scripts
    ├── client/                 # React application
    │   ├── src/
    │   │   ├── Components/     # Pages & shared UI
    │   │   ├── Services/       # Auth, API clients, storage
    │   │   └── App.js
    │   ├── public/
    │   └── package.json
    │
    └── server/                 # Node.js Express application
        ├── app.js              # Express + Passport + cron wiring
        ├── db/conn.js          # Mongoose connection
        ├── model/              # Mongoose schemas
        │   ├── userSchema.js
        │   ├── plantSchema.js
        │   ├── postSchema.js
        │   └── UserPlantCareProgress.js
        ├── middleware/
        │   └── authMiddleware.js   # JWT-first + Passport session fallback
        ├── routes/
        │   ├── authRoutes.js
        │   ├── userRoutes.js
        │   └── whatsappRoutes.js
        ├── services/
        │   ├── weatherCron.js      # Scheduled weather alert worker
        │   ├── weatherRiskEngine.js# Crop-specific risk evaluator
        │   ├── emailService.js     # Nodemailer transporter
        │   ├── emailTemplates.js   # HTML + plain-text email body
        │   └── whatsappService.js
        ├── config/
        │   └── weatherThresholds.js
        ├── utils/
        │   ├── jwt.js
        │   └── serializeUser.js
        ├── .env
        └── package.json
```

---

## 🚀 Quickstart

### 1. Clone and install both stacks

```powershell
# Python ML API
cd PlantWise-Project
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Web server
cd loginPage\Plant-Wise-Plant-Disease-Detection-\server
npm install

# React client (in a separate terminal)
cd loginPage\Plant-Wise-Plant-Disease-Detection-\client
npm install
```

### 2. Configure environment variables

Create `.env` files from the provided examples:

**Python API (`PlantWise-Project/.env`)** — see `COLAB_KAGGLE_GUIDE.md` for model training details.

**Web Server (`loginPage/.../server/.env`)**

```env
DATABASE=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
SESSION_SECRET=...
CLIENT_ID=...                     # Google OAuth 2.0 Client ID
CLIENT_SECRET=...                 # Google OAuth 2.0 Client Secret
PUBLIC_API_URL=http://localhost:6005
CLIENT_ORIGIN=http://localhost:3000

# JWT auth (register/login/profile)
JWT_SECRET=<64-char hex>
JWT_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10

# Email (cron weather alerts)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=<Gmail App Password>

# Weather cron
OPENWEATHER_API_KEY=<your key>
WEATHER_CRON_SCHEDULE=*/2 * * * *   # every 2 minutes for testing
WEATHER_ALERT_COOLDOWN_MS=43200000  # 12 hours in production

# Qwen LLM
GROQ_API_KEY=...
```

### 3. Run everything

```powershell
# Terminal 1: Python ML API
python main.py
# Swagger UI: http://localhost:8000/docs

# Terminal 2: Node.js server
cd loginPage\Plant-Wise-Plant-Disease-Detection-\server
node app.js
# REST API: http://localhost:6005
# Google OAuth callback: http://localhost:6005/auth/google/callback

# Terminal 3: React client
cd loginPage\Plant-Wise-Plant-Disease-Detection-\client
npm start
# Dev UI: http://localhost:3000
```

### 4. Production build (React)

```powershell
cd loginPage\Plant-Wise-Plant-Disease-Detection-\client
npm run build
# Output: build/
```

---

## 🔐 Authentication Flow

- **Email/Password** → `POST /api/auth/register` / `POST /api/auth/login` → JWT stored in `localStorage`.
- **Google Sign-In** → `/auth/google` (Passport) → callback decodes the OpenID Connect `id_token` locally; the fragile userinfo HTTP call is bypassed via an overridden `_loadUserProfile`.
- **Profile completion** → `POST /api/users/complete-profile` (city, crops, WhatsApp) → unlocks WhatsApp welcome and weather alerts.
- All client API calls go through `src/Services/apiClient.js` which auto-attaches `Authorization: Bearer <token>`.

---

## 🌦️ Weather Risk Alerts (Cron)

A `node-cron` worker runs on the schedule defined by `WEATHER_CRON_SCHEDULE` (default: every 4 hours in production). On each tick it:

1. Queries every user with `notifications.weatherAlerts !== false`.
2. Groups them by city.
3. Fetches current weather once per unique city from **OpenWeatherMap**.
4. Passes the snapshot to `evaluateCropRisk()` which checks each user’s crops against the matrix in `config/weatherThresholds.js`:
   - Heat stress (> 40 °C)
   - Frost (< 4 °C)
   - High winds (> 15 km/h) — aligned with the in-app banner
   - Heavy rain (> 5 mm/h)
   - Humidity + heat (> 80 % RH & > 35 °C)
5. If a crop is affected, emails the user via `emailService.js`.
6. Records the alert in `notifications.lastWeatherAlert` to enforce the 12-hour cooldown.

The in-app header banner uses the same wind threshold so farmers see the same advice inside the app and in their inbox.

---

## 🌾 Khairpur Agronomic Remedies & Weather Guardrails

| Disease / Condition | Urdu Name | Chemical Spray & Dosage per Acre | Urgency | Weather Safety Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| **Bacterial Blight** | بیکٹیریل بلائٹ | Copper Oxychloride @ 250g/acre + Streptocycline @ 6g/acre | High | **High Wind (>15 km/h)**: Postpone spray due to drift risk. |
| **Aphids** | سست تیلا / سست ڈنگ | Imidacloprid 200 SL @ 60 ml/acre OR Acetamiprid @ 100g/acre | Moderate-High | **Heatwave (>40°C)**: Restrict spray to early morning/evening. |
| **Army worm** | لشکری سنڈی | Emamectin Benzoate 5% SG @ 75g/acre (Evening hours) | Critical | **High Humidity (>85% RH)**: Postpone spray due to wash-off risk. |
| **Powdery Mildew** | پاؤڈری ملڈیو | Water-Soluble Sulfur @ 1 kg/acre OR Hexaconazole @ 250 ml/acre | Moderate | Clear photo request if prediction confidence < 70%. |
| **Target spot** | ٹارگٹ اسپاٹ | Azoxystrobin + Difenoconazole @ 200 ml/acre | Moderate-High | Live city/village weather fetched via OpenWeatherMap API. |
| **Healthy** | صحت مند فصل | No chemical intervention needed. Maintain normal irrigation. | Low | Routine scouting every 4-5 days. |

---

## 🧪 Testing

```powershell
# Python unit tests
pytest tests/

# 5-scenario interactive demo
python scripts/test_demo.py

# Model accuracy on a validation dataset
python scripts/evaluate_accuracy.py --dataset_dir /path/to/cotton_dataset
```

The client ships a production build script (`npm run build`) that also runs `eslint` warnings and reports file sizes.

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, MUI, styled-components, React Router, React Three Fiber |
| Web Server | Node.js, Express, Passport, Mongoose, nodemailer, node-cron |
| Auth | JWT, bcrypt, Google OAuth 2.0 (OpenID Connect `id_token`) |
| Database | MongoDB Atlas |
| Weather | OpenWeatherMap + Open-Meteo fallback |
| Email | Gmail SMTP via nodemailer |
| WhatsApp | Twilio-compatible REST webhook (WhatsApp Routes) |
| ML API | Python, FastAPI, TensorFlow/Keras, TFLite |
| LLM | Alibaba Qwen via Groq |
| Edge | TFLite (8.8 MB) |

---

## 📄 License

This project was built for the PlantWise hackathon / capstone. Feel free to fork it for your own research or classroom use.
