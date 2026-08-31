"""
Plantwise Weather Service - Live OpenWeatherMap API Integration
Fetches real-time, accurate weather data (temperature, wind speed, relative humidity)
for Khairpur, Sindh, Pakistan or any requested city/village using OpenWeatherMap API with fallback support.
"""

import os
import requests
from typing import Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# User OpenWeatherMap API Key (Reads from .env or uses default fallback key)
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "2c68cac827dd9e327fdd97b4e39326ed")

KHAIRPUR_LAT = 27.5295
KHAIRPUR_LON = 68.7592


def fetch_open_weather_map(city_name: str, api_key: str = None) -> Optional[Dict[str, Any]]:
    """
    Attempts to fetch live weather from OpenWeatherMap API.
    """
    active_key = api_key or os.getenv("OPENWEATHER_API_KEY", OPENWEATHER_API_KEY)
    try:
        query = f"{city_name},PK" if "," not in city_name else city_name
        url = f"https://api.openweathermap.org/data/2.5/weather?q={query}&appid={active_key}&units=metric"
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            main = data.get("main", {})
            wind = data.get("wind", {})
            weather = data.get("weather", [{}])[0]

            temp_c = main.get("temp", 33.0)
            humidity_pct = main.get("humidity", 55.0)
            wind_speed_ms = wind.get("speed", 2.2)
            wind_speed_kmh = wind_speed_ms * 3.6

            location_name = f"{data.get('name')}, {data.get('sys', {}).get('country', 'PK')}"
            condition_desc = weather.get("description", "Clear").title()

            return {
                "temperature_c": round(float(temp_c), 1),
                "wind_speed_kmh": round(float(wind_speed_kmh), 1),
                "humidity_pct": round(float(humidity_pct), 1),
                "weather_condition": condition_desc,
                "location": location_name,
                "latitude": data.get("coord", {}).get("lat", KHAIRPUR_LAT),
                "longitude": data.get("coord", {}).get("lon", KHAIRPUR_LON),
                "source": "OpenWeatherMap Real-Time API",
                "api_status": "OPENWEATHERMAP_LIVE_SUCCESS",
            }
        else:
            print(f"[WEATHER SERVICE WARNING] OpenWeatherMap API returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[WEATHER SERVICE ERROR] OpenWeatherMap request failed: {e}")

    return None


def fetch_open_meteo_fallback(city_name: str) -> Dict[str, Any]:
    """
    Fallback weather fetch using Open-Meteo Geocoding + Forecast API.
    """
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1&language=en&format=json"
        geo_res = requests.get(geo_url, timeout=5)
        lat, lon, resolved_name = KHAIRPUR_LAT, KHAIRPUR_LON, "Khairpur, Sindh, Pakistan"

        if geo_res.status_code == 200 and "results" in geo_res.json():
            res = geo_res.json()["results"][0]
            lat = res.get("latitude", KHAIRPUR_LAT)
            lon = res.get("longitude", KHAIRPUR_LON)
            resolved_name = f"{res.get('name')}, {res.get('admin1', '')}, {res.get('country', '')}".strip(", ")

        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,wind_speed_10m&"
            f"wind_speed_unit=kmh"
        )
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            current = response.json().get("current", {})
            return {
                "temperature_c": round(float(current.get("temperature_2m", 34.0)), 1),
                "wind_speed_kmh": round(float(current.get("wind_speed_10m", 8.0)), 1),
                "humidity_pct": round(float(current.get("relative_humidity_2m", 50.0)), 1),
                "weather_condition": "Clear",
                "location": resolved_name,
                "latitude": lat,
                "longitude": lon,
                "source": "Open-Meteo Real-Time Weather API (Secondary Provider)",
                "api_status": "OPEN_METEO_LIVE_SUCCESS",
            }
    except Exception as e:
        print(f"[WEATHER SERVICE ERROR] Open-Meteo request failed: {e}")

    return {
        "temperature_c": 34.0,
        "wind_speed_kmh": 10.0,
        "humidity_pct": 50.0,
        "weather_condition": "Clear",
        "location": "Khairpur, Sindh, Pakistan (Default)",
        "latitude": KHAIRPUR_LAT,
        "longitude": KHAIRPUR_LON,
        "source": "Khairpur Climate Model Fallback",
        "api_status": "OFFLINE_FALLBACK",
    }


def get_current_weather(
    city_name: str = "Khairpur",
    api_key: str = None,
) -> Dict[str, Any]:
    """
    Main function fetching live current weather for any city or village.
    """
    owm_data = fetch_open_weather_map(city_name=city_name, api_key=api_key)
    if owm_data is not None:
        return owm_data

    return fetch_open_meteo_fallback(city_name=city_name)
