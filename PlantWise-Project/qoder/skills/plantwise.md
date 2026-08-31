# Skill: PlantWise Core Architecture & Engineering Standards

## 1. System Overview
- **Product:** PlantWise (Smart Agriculture MVP for Pakistani Farmers / Hackathon focus).
- **Key Features:** Crop disease detection (Cotton, Potato, Tomato) via image classification, weather-triggered farming advisories (Open-Meteo), and multi-lingual output (Urdu, Roman Urdu, English).
- **Target Audience:** Low-bandwidth, mobile-first users primarily interacting via WhatsApp.

---

## 2. Architecture & Tech Stack Matrix
- **Interface Layer:**
  - WhatsApp Bot (Primary entry point via Twilio / Meta Cloud API).
  - Admin/Farmer Web Portal (React.js + Tailwind CSS).
- **API Gateway & Orchestration Layer:**
  - Node.js + Express.js (Handles webhooks, session state, routing, and external API aggregation).
- **ML / Inference Engine:**
  - Python + FastAPI (Serves `.keras` / TensorFlow CNN disease detection model).
- **Data Layer:**
  - MongoDB (Collections: `users`, `scans`, `farm_locations`, `weather_logs`).
- **External Integrations:**
  - Open-Meteo API (Forecasts & agricultural weather risk assessment).

---

## 3. Strict Development Rules & Constraints
1. **Microservices Boundary:** Never combine Node.js gateway logic with Python ML inference. Communication between them must occur via REST endpoints.
2. **Payload & Performance Optimization:** Keep all JSON payloads lightweight. Optimize image buffers and WhatsApp message payloads for 2G/3G network constraints.
3. **Robust Input Validation:** Strictly validate and sanitize inbound webhook payloads and image MIME types/file sizes before forwarding to the ML service.
4. **Resilience & Fault Tolerance:**
   - Always implement `try/catch` (Node.js) and `try/except` (FastAPI) blocks.
   - Include structured error logging with context (`userId`, `scanId`, `timestamp`).
   - If the ML service or Weather API is unreachable, return graceful fallback responses in Urdu/Roman Urdu.
5. **Localization-Aware:** Structure responses to accommodate dual-language outputs (Urdu script & Roman Urdu transliteration).
6. **Architecture Invariance:** Do not modify the database schema conventions, API protocols, or core stack components without explicit user consent.