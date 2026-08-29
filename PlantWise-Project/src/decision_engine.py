"""
Plantwise Actionable Decision Engine - Khairpur & Sindh Regional Context
Provides localized agronomic recommendations, chemical spray formulations,
per-acre dosages, urgency levels, and weather safety guardrails for cotton farmers.
"""

from typing import Dict, Any, Optional

# Sindh Agronomic Rules Matrix for Cotton (Gossypium hirsutum)
SINDH_AGRONOMIC_RULES: Dict[str, Dict[str, Any]] = {
    "Bacterial Blight": {
        "disease_name_urdu": "بیکٹیریل بلائٹ (Bacterial Blight)",
        "chemical_treatment": "Copper Oxychloride @ 250g/acre + Streptocycline @ 6g/acre",
        "primary_chemical": "Copper Oxychloride + Streptocycline",
        "dosage_per_acre": "250g Copper Oxychloride + 6g Streptocycline in 100L water per acre",
        "urgency_level": "HIGH",
        "application_instructions": "Spray during early morning or cool evening. Ensure thorough coverage on lower and upper leaf surfaces.",
        "field_context_sindh": "Bacterial blight spreads rapidly in hot, humid monsoon weather in Sindh cotton belts. Clear infected debris around field boundaries.",
        "requires_chemical_spray": True,
    },
    "Aphids": {
        "disease_name_urdu": "سست تیلا / سست ڈنگ (Aphids)",
        "chemical_treatment": "Imidacloprid 200 SL @ 60 ml/acre OR Acetamiprid @ 100g/acre",
        "primary_chemical": "Imidacloprid 200 SL or Acetamiprid",
        "dosage_per_acre": "60 ml/acre (Imidacloprid) OR 100g/acre (Acetamiprid) in 100-120L water",
        "urgency_level": "MODERATE_TO_HIGH",
        "application_instructions": "Target undersides of upper young leaves where sucking pest colonies aggregate.",
        "field_context_sindh": "Aphids cause honeydew secretion and honeydew mold in Sindh cotton belts during mid-season dry spells.",
        "requires_chemical_spray": True,
    },
    "Army worm": {
        "disease_name_urdu": "لشکری سنڈی (Army worm)",
        "chemical_treatment": "Emamectin Benzoate 5% SG @ 75g/acre",
        "primary_chemical": "Emamectin Benzoate 5% SG",
        "dosage_per_acre": "75g/acre in 100L water",
        "urgency_level": "CRITICAL",
        "application_instructions": "MUST be applied strictly during evening hours (after 5:30 PM) when nocturnal caterpillars emerge to feed.",
        "field_context_sindh": "Fall Armyworm can cause complete field defoliation within 48 hours in Sindh cotton fields. Immediate evening spraying is mandatory.",
        "requires_chemical_spray": True,
    },
    "Powdery Mildew": {
        "disease_name_urdu": "پاؤڈری ملڈیو (Powdery Mildew)",
        "chemical_treatment": "Water-Soluble Sulfur @ 1 kg/acre OR Hexaconazole @ 250 ml/acre",
        "primary_chemical": "Water-Soluble Sulfur or Hexaconazole",
        "dosage_per_acre": "1 kg/acre (Sulfur) OR 250 ml/acre (Hexaconazole) in 100L water",
        "urgency_level": "MODERATE",
        "application_instructions": "Apply upon initial observation of white powder-like fungal spots on foliage.",
        "field_context_sindh": "Common during post-monsoon dry weather with heavy morning dew in Sindh cotton zones.",
        "requires_chemical_spray": True,
    },
    "Target spot": {
        "disease_name_urdu": "ٹارگٹ اسپاٹ (Target Spot)",
        "chemical_treatment": "Azoxystrobin + Difenoconazole @ 200 ml/acre",
        "primary_chemical": "Azoxystrobin + Difenoconazole",
        "dosage_per_acre": "200 ml/acre in 100L water",
        "urgency_level": "MODERATE_TO_HIGH",
        "application_instructions": "Spray when leaf lesions with concentric rings appear on lower canopy foliage.",
        "field_context_sindh": "Fungal spot promoted by dense plant canopy and lingering humidity in Sindh fields.",
        "requires_chemical_spray": True,
    },
    "Healthy": {
        "disease_name_urdu": "صحت مند فصل (Healthy Leaf)",
        "chemical_treatment": "No chemical intervention needed",
        "primary_chemical": "None",
        "dosage_per_acre": "N/A",
        "urgency_level": "LOW",
        "application_instructions": "Maintain normal irrigation and nitrogen management schedule.",
        "field_context_sindh": "Plant displays robust foliage health. Continue regular field scouting every 4-5 days.",
        "requires_chemical_spray": False,
    },
}


def evaluate_weather_safety(weather_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates weather safety for pesticide spraying based on live city weather parameters.
    Checks wind speed, extreme temperature (heatwave), and humidity/rain risk.
    """
    if not weather_data:
        return {
            "can_spray": True,
            "spray_status": "CLEAR",
            "weather_warning": None,
            "recommended_window": "Early Morning (6:00 - 9:00 AM) or Cool Evening (5:00 - 7:00 PM)",
        }

    temp_c = float(weather_data.get("temperature_c", 32.0))
    wind_kmh = float(weather_data.get("wind_speed_kmh", 8.0))
    humidity_pct = float(weather_data.get("humidity_pct", 55.0))
    location = weather_data.get("location", "Khairpur, Sindh, Pakistan")

    warnings = []
    can_spray = True
    spray_status = "CLEAR"
    recommended_window = "Early Morning (6:00 - 9:00 AM) or Cool Evening (5:00 - 7:00 PM)"

    # Rule 1: High Wind Speed (> 15 km/h) -> Spray Drift Risk
    if wind_kmh > 15.0:
        can_spray = False
        spray_status = "POSTPONED_HIGH_WIND"
        warnings.append(
            f"HIGH WIND WARNING ({wind_kmh:.1f} km/h in {location}): Postpone chemical spraying due to high risk of spray drift and chemical loss."
        )

    # Rule 2: High Humidity / Rain Risk (> 85% RH) -> Chemical Wash-off
    if humidity_pct > 85.0:
        can_spray = False
        spray_status = "POSTPONED_HIGH_HUMIDITY"
        warnings.append(
            f"HIGH HUMIDITY / RAIN WARNING ({humidity_pct:.1f}% RH): Postpone spraying until leaf canopy dries to prevent pesticide wash-off."
        )

    # Rule 3: Heatwave / High Temperature (> 40°C) -> Phytotoxicity & Evaporation
    if temp_c > 40.0:
        spray_status = "RESTRICTED_HEATWAVE" if can_spray else spray_status
        recommended_window = "STRICTLY Early Morning (before 8:30 AM) or Late Evening (after 6:00 PM)"
        warnings.append(
            f"HEATWAVE WARNING ({temp_c:.1f}°C in {location}): High temperatures can burn crop leaves (phytotoxicity). DO NOT spray during peak midday hours."
        )

    return {
        "can_spray": can_spray,
        "spray_status": spray_status,
        "weather_warnings": warnings,
        "recommended_window": recommended_window,
        "conditions_assessed": {
            "temperature_c": temp_c,
            "wind_speed_kmh": wind_kmh,
            "humidity_pct": humidity_pct,
        },
    }


def get_agronomic_advisory(
    predicted_class: str,
    confidence: float,
    confidence_threshold: float = 0.70,
    weather_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Main decision engine function mapping diagnosis to dynamic location farmer advisory.
    """
    location_name = weather_data.get("location", "Khairpur, Sindh, Pakistan") if weather_data else "Khairpur, Sindh, Pakistan"

    if confidence < confidence_threshold:
        return {
            "status": "LOW_CONFIDENCE",
            "crop": "Cotton (Gossypium hirsutum)",
            "region": location_name,
            "confidence": round(confidence, 4),
            "confidence_threshold": confidence_threshold,
            "diagnosis": "Uncertain / Unclear Image",
            "action_required": (
                f"Prediction confidence ({confidence*100:.1f}%) is below safety threshold ({confidence_threshold*100:.0f}%). "
                "Please capture a clearer, well-lit photograph directly facing the affected leaf surface to avoid improper chemical application."
            ),
            "recommendation": None,
        }

    matched_class = None
    for class_key in SINDH_AGRONOMIC_RULES.keys():
        if class_key.lower() in predicted_class.lower() or predicted_class.lower() in class_key.lower():
            matched_class = class_key
            break

    if not matched_class:
        matched_class = predicted_class if predicted_class in SINDH_AGRONOMIC_RULES else "Healthy"

    rule_info = SINDH_AGRONOMIC_RULES[matched_class]
    weather_assessment = evaluate_weather_safety(weather_data)

    recommendation = {
        "status": "SUCCESS",
        "crop": "Cotton (Gossypium hirsutum)",
        "region": location_name,
        "diagnosis": {
            "predicted_class": matched_class,
            "disease_name_urdu": rule_info["disease_name_urdu"],
            "confidence_percentage": round(confidence * 100, 2),
            "confidence_score": round(confidence, 4),
        },
        "actionable_decision": {
            "urgency_level": rule_info["urgency_level"],
            "requires_chemical_spray": rule_info["requires_chemical_spray"] and weather_assessment["can_spray"],
            "chemical_recommendation": rule_info["chemical_treatment"],
            "primary_active_ingredient": rule_info["primary_chemical"],
            "dosage_per_acre": rule_info["dosage_per_acre"],
            "application_instructions": rule_info["application_instructions"],
            "agronomic_context_sindh": rule_info["field_context_sindh"],
        },
        "weather_safety_advisory": weather_assessment,
    }

    if rule_info["requires_chemical_spray"] and not weather_assessment["can_spray"]:
        recommendation["actionable_decision"]["spray_advisory_note"] = (
            f"CHOSEN CHEMICAL IS IDENTIFIED BUT SPRAYING IS TEMPORARILY POSTPONED DUE TO UNFAVORABLE {location_name.upper()} WEATHER CONDITIONS."
        )

    return recommendation
