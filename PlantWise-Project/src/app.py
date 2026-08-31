import os
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from inference import get_farmer_recommendation
from weather_service import get_current_weather

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

app = FastAPI(
    title="Plantwise Detection API - Khairpur & Sindh Regional",
    description="Cotton Plant Disease Detection, Live OpenWeatherMap API & Multi-lingual Qwen Agronomic Engine REST API",
    version="1.4.0",
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Plantwise Detection API",
        "crop": "Cotton (Gossypium hirsutum)",
        "target_region": "Khairpur, Sindh, Pakistan",
        "languages_supported": ["en", "ur", "sd", "pa", "skr", "ps"],
        "weather_service": "OpenWeatherMap API Integrated",
    }


@app.get("/weather")
async def get_live_weather(
    city: str = Query("Khairpur", description="City/Village name to fetch real-time weather for (e.g. Khairpur, Gambat, Kot Diji, Sukkur)")
):
    """
    Fetches real-time temperature, wind speed, and humidity for a specified city or village
    using the OpenWeatherMap API with automatic fallback.
    """
    try:
        weather_info = get_current_weather(city_name=city)
        return weather_info
    except Exception as e:
        logging.error(f"Error fetching live weather for '{city}': {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")


@app.post("/predict")
async def predict_cotton_disease(
    file: UploadFile = File(...),
    confidence_threshold: float = Query(0.70, ge=0.0, le=1.0, description="Minimum confidence threshold"),
    city: str = Query("Khairpur", description="City or village name to fetch live weather automatically (e.g. Khairpur)"),
    language: str = Query("en", description="Language preference: 'en' (English), 'ur' (Urdu), 'sd' (Sindhi), 'pa' (Punjabi), 'skr' (Saraiki), 'ps' (Pashto)"),
    temperature_c: Optional[float] = Query(None, description="Manual temperature override in °C"),
    wind_speed_kmh: Optional[float] = Query(None, description="Manual wind speed override in km/h"),
    humidity_pct: Optional[float] = Query(None, description="Manual relative humidity override in %"),
):
    """
    Receives an uploaded leaf image file, runs disease classification model inference,
    automatically fetches live weather for the specified city/village,
    evaluates Sindh weather safety rules, and returns actionable farmer recommendation JSON in chosen regional language.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Upload a valid image file (JPEG/PNG).")

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        weather_data = get_current_weather(city_name=city)

        if temperature_c is not None:
            weather_data["temperature_c"] = temperature_c
            weather_data["source"] = "Manual User Override"
        if wind_speed_kmh is not None:
            weather_data["wind_speed_kmh"] = wind_speed_kmh
            weather_data["source"] = "Manual User Override"
        if humidity_pct is not None:
            weather_data["humidity_pct"] = humidity_pct
            weather_data["source"] = "Manual User Override"

        logging.info(f"Processing prediction for '{file.filename}' (lang='{language}') with weather data: {weather_data}")

        result = get_farmer_recommendation(
            image_path_or_bytes=image_bytes,
            confidence_threshold=confidence_threshold,
            weather_data=weather_data,
            language=language,
        )

        return result
    except Exception as e:
        logging.error(f"Error executing prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Inference engine error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
