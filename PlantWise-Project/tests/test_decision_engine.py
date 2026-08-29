import pytest
import sys
import os

# Add src/ to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from decision_engine import get_agronomic_advisory, evaluate_weather_safety, KHAIRPUR_AGRONOMIC_RULES


def test_decision_engine_disease_mappings():
    """Verify all 6 disease classes map to correct chemical remedies and per-acre dosages."""
    expected_classes = ["Bacterial Blight", "Aphids", "Army worm", "Powdery Mildew", "Target spot", "Healthy"]

    for disease in expected_classes:
        res = get_agronomic_advisory(predicted_class=disease, confidence=0.88, confidence_threshold=0.70)
        assert res["status"] == "SUCCESS"
        assert res["diagnosis"]["predicted_class"] == disease
        assert res["diagnosis"]["confidence_score"] == 0.88

        action = res["actionable_decision"]
        if disease == "Bacterial Blight":
            assert "Copper Oxychloride" in action["chemical_recommendation"]
            assert "Streptocycline" in action["chemical_recommendation"]
            assert "250g" in action["dosage_per_acre"]
            assert "6g" in action["dosage_per_acre"]
        elif disease == "Aphids":
            assert "Imidacloprid" in action["chemical_recommendation"] or "Acetamiprid" in action["chemical_recommendation"]
            assert "60 ml" in action["dosage_per_acre"] or "100g" in action["dosage_per_acre"]
        elif disease == "Army worm":
            assert "Emamectin Benzoate" in action["chemical_recommendation"]
            assert "75g" in action["dosage_per_acre"]
            assert "evening hours" in action["application_instructions"].lower()
        elif disease == "Powdery Mildew":
            assert "Sulfur" in action["chemical_recommendation"] or "Hexaconazole" in action["chemical_recommendation"]
        elif disease == "Target spot":
            assert "Azoxystrobin" in action["chemical_recommendation"] or "Difenoconazole" in action["chemical_recommendation"]
            assert "200 ml" in action["dosage_per_acre"]
        elif disease == "Healthy":
            assert action["requires_chemical_spray"] is False
            assert "No chemical intervention" in action["chemical_recommendation"]


def test_low_confidence_threshold_rejection():
    """Verify predictions below confidence threshold (e.g. 0.64 < 0.70) return photo re-request."""
    res = get_agronomic_advisory(predicted_class="Army worm", confidence=0.64, confidence_threshold=0.70)
    assert res["status"] == "LOW_CONFIDENCE"
    assert res["recommendation"] is None
    assert "clearer, well-lit photograph" in res["action_required"]


def test_khairpur_high_wind_weather_guardrail():
    """Verify wind speed > 15 km/h postpones chemical spray due to drift risk."""
    weather_data = {"temperature_c": 30.0, "wind_speed_kmh": 18.5, "humidity_pct": 50.0}
    res = get_agronomic_advisory(predicted_class="Aphids", confidence=0.90, weather_data=weather_data)

    assert res["status"] == "SUCCESS"
    weather_info = res["weather_safety_khairpur"]
    assert weather_info["can_spray"] is False
    assert weather_info["spray_status"] == "POSTPONED_HIGH_WIND"
    assert any("HIGH WIND WARNING" in w for w in weather_info["weather_warnings"])
    assert res["actionable_decision"]["requires_chemical_spray"] is False


def test_khairpur_heatwave_weather_guardrail():
    """Verify temperature > 40°C restricts spraying to early morning or evening."""
    weather_data = {"temperature_c": 42.5, "wind_speed_kmh": 8.0, "humidity_pct": 40.0}
    res = get_agronomic_advisory(predicted_class="Bacterial Blight", confidence=0.85, weather_data=weather_data)

    assert res["status"] == "SUCCESS"
    weather_info = res["weather_safety_khairpur"]
    assert weather_info["can_spray"] is True
    assert weather_info["spray_status"] == "RESTRICTED_HEATWAVE"
    assert "Early Morning" in weather_info["recommended_window"]


def test_khairpur_high_humidity_weather_guardrail():
    """Verify humidity > 85% postpones spraying due to wash-off risk."""
    weather_data = {"temperature_c": 28.0, "wind_speed_kmh": 6.0, "humidity_pct": 90.0}
    res = get_agronomic_advisory(predicted_class="Target spot", confidence=0.92, weather_data=weather_data)

    assert res["status"] == "SUCCESS"
    weather_info = res["weather_safety_khairpur"]
    assert weather_info["can_spray"] is False
    assert weather_info["spray_status"] == "POSTPONED_HIGH_HUMIDITY"
    assert res["actionable_decision"]["requires_chemical_spray"] is False
