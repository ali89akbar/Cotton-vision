import pytest
import sys
import os
import io
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def create_dummy_image_bytes(color=(0, 255, 0), size=(224, 224), format="JPEG") -> bytes:
    """Creates synthetic image bytes for API testing."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


def test_health_check_endpoint():
    """Test GET /health endpoint returns online status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Khairpur" in data["target_region"]


def test_live_weather_endpoint():
    """Test GET /weather endpoint fetches live weather for Khairpur."""
    response = client.get("/weather?city=Khairpur")
    assert response.status_code == 200
    data = response.json()
    assert "temperature_c" in data
    assert "wind_speed_kmh" in data
    assert "humidity_pct" in data
    assert "Khairpur" in data["location"]


def test_predict_endpoint_with_live_city_weather():
    """Test POST /predict with automatic live city weather fetching."""
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
    response = client.post("/predict?city=Khairpur&confidence_threshold=0.50", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "crop" in data
    assert data["crop"] == "Cotton (Gossypium hirsutum)"
    assert "weather_safety_khairpur" in data
    weather_assessed = data["weather_safety_khairpur"]["conditions_assessed"]
    assert "temperature_c" in weather_assessed
    assert "wind_speed_kmh" in weather_assessed


def test_predict_endpoint_with_manual_weather_override():
    """Test POST /predict with manual weather query params overriding live weather."""
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
    params = {
        "confidence_threshold": 0.50,
        "temperature_c": 43.0,
        "wind_speed_kmh": 22.0,
        "humidity_pct": 50.0,
    }
    response = client.post("/predict", files=files, params=params)

    assert response.status_code == 200
    data = response.json()
    if data.get("status") == "SUCCESS":
        weather = data["weather_safety_khairpur"]
        assert weather["can_spray"] is False
        assert weather["spray_status"] == "POSTPONED_HIGH_WIND"
