"""
Plantwise Detection - Quick Interactive Test Script
Run this script to test recommendations for different Khairpur weather scenarios and disease diagnoses.
"""

import sys
import os
import io
import json

# Add src/ to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from decision_engine import get_agronomic_advisory


def run_test_scenarios():
    print("=" * 70)
    print("PLANTWISE DETECTION - KHAIRPUR SINDH FARMER ADVISORY DEMO")
    print("=" * 70)

    scenarios = [
        {
            "title": "Scenario 1: Bacterial Blight under Normal Clear Weather",
            "class": "Bacterial Blight",
            "confidence": 0.92,
            "weather": {"temperature_c": 34.0, "wind_speed_kmh": 10.0, "humidity_pct": 55.0}
        },
        {
            "title": "Scenario 2: Army Worm with High Wind Warning (>15 km/h)",
            "class": "Army worm",
            "confidence": 0.88,
            "weather": {"temperature_c": 36.0, "wind_speed_kmh": 22.0, "humidity_pct": 50.0}
        },
        {
            "title": "Scenario 3: Aphids under Extreme Heatwave (>40°C)",
            "class": "Aphids",
            "confidence": 0.95,
            "weather": {"temperature_c": 42.5, "wind_speed_kmh": 8.0, "humidity_pct": 40.0}
        },
        {
            "title": "Scenario 4: Target Spot under High Humidity / Rain Risk (>85%)",
            "class": "Target spot",
            "confidence": 0.89,
            "weather": {"temperature_c": 28.0, "wind_speed_kmh": 6.0, "humidity_pct": 92.0}
        },
        {
            "title": "Scenario 5: Low Confidence Image (<0.70 threshold)",
            "class": "Powdery Mildew",
            "confidence": 0.58,
            "weather": {"temperature_c": 32.0, "wind_speed_kmh": 10.0, "humidity_pct": 60.0}
        }
    ]

    for scenario in scenarios:
        print(f"\n--- {scenario['title']} ---")
        advisory = get_agronomic_advisory(
            predicted_class=scenario["class"],
            confidence=scenario["confidence"],
            confidence_threshold=0.70,
            weather_data=scenario["weather"]
        )
        print(json.dumps(advisory, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_test_scenarios()
