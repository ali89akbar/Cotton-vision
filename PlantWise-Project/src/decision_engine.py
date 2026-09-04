"""
Plantwise Actionable Decision Engine - Khairpur & Sindh Regional Context
Provides localized agronomic recommendations, chemical spray formulations,
per-acre dosages, urgency levels, and weather safety guardrails for cotton farmers.
Wired with multi-lingual Qwen LLM text-generation advisory.
"""

from typing import Dict, Any, Optional
try:
    from qwen_advisory import get_advisory
except ImportError:
    from src.qwen_advisory import get_advisory

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

# Multi-lingual regional translations for instructions & field context
MULTI_LANG_DECISIONS = {
    "ur": {
        "Bacterial Blight": {
            "application_instructions": "صبح سویرے یا شام کے ٹھنڈے اوقات میں اسپرے کریں۔ پتیوں کی نچلی اور اوپری دونوں سطحوں پر مکمل کوریج کو یقینی بنائیں۔",
            "field_context_sindh": "سندھ کے کپاس کے علاقوں میں گرم اور مرطوب مون سون کے موسم میں بیکٹیریل بلائٹ تیزی سے پھیلتی ہے۔ کھیت کے اطراف سے متاثرہ پودے صاف کریں۔",
        },
        "Aphids": {
            "application_instructions": "پودے کے اوپری نئے پتیوں کی نچلی سطح کو نشانہ بنائیں جہاں کیڑوں کی کالونیاں جمع ہوتی ہیں۔",
            "field_context_sindh": "سندھ کی کپاس کی فصل میں درمیانی سیزن کی خشک سالی کے دوران سست تیلا بلیک سوٹ تشکیل دیتا ہے۔",
        },
        "Army worm": {
            "application_instructions": "شام 5:30 بجے کے بعد اسپرے کرنا لازمی ہے جب رات کے وقت سنڈیاں نکلتی ہیں۔",
            "field_context_sindh": "لشکری سنڈی 48 گھنٹوں کے اندر کپاس کے کھیت کو مکمل تباہ کر سکتی ہے۔ فوری شام کا اسپرے ضروری ہے۔",
        },
        "Powdery Mildew": {
            "application_instructions": "پتوں پر سفید پاؤڈر نما دھبے ظاہر ہوتے ہی فوری طور پر استعمال کریں۔",
            "field_context_sindh": "سندھ کے کپاس کے علاقوں میں صبح کی شبنم اور خشک موسم کے دوران عام ہے۔",
        },
        "Target spot": {
            "application_instructions": "جب نچلی سطح کے پتوں پر دائرہ نما دھبے ظاہر ہوں تو اسپرے کریں۔",
            "field_context_sindh": "سندھ کے کھیتوں میں گھنے پودوں اور نمی کی وجہ سے پھیلتا ہے۔",
        },
        "Healthy": {
            "application_instructions": "معمول کے مطابق آبپاشی اور نائٹروجن کی دیکھ بھال کا شیڈول برقرار رکھیں۔",
            "field_context_sindh": "پودا صحتمند ظاہر ہو رہا ہے۔ ہر 4-5 دن بعد کھیت کی باقاعدہ دیکھ بھال جاری رکھیں۔",
        },
    },
    "sd": {
        "Bacterial Blight": {
            "application_instructions": "صبح جو سوير يا شام جي ٿڌي وقت اسپري ڪريو. پنن جي هيٺين ۽ مٿئين ٻنهي پاسن تي مڪمل ڪوريج کي يقيني بڻايو.",
            "field_context_sindh": "سنڌ جي ڪپھ جي علائقن ۾ گرم ۽ نمي واري مون سون جي موسم ۾ بئڪٽيريل بلائٽ تيزيءَ سان پکڙجي ٿي.",
        },
        "Aphids": {
            "application_instructions": "پکي جي مٿئين نئين پنن جي هيٺين پاسي کي نشانو بڻايو جتي سست تيلي جي برادري جمع ٿئي ٿي.",
            "field_context_sindh": "سنڌ جي ڪپھ جي فصل ۾ خشڪي واري موسم دوران سست تيلي جو حملو وڌي ويندو آهي.",
        },
        "Army worm": {
            "application_instructions": "شام 5:30 کان پوءِ اسپري ڪرڻ لازمي آهي جڏهن سنڊيون نڪرن ٿيون.",
            "field_context_sindh": "لشكري سُنڊي 48 ڪلاڪن اندر ڪپھ جي ٻنيءَ کي باقاعده تباھ ڪري سگهي ٿي. فوري شام جو اسپري ضروري آهي.",
        },
        "Powdery Mildew": {
            "application_instructions": "پنن تي اڇا پاؤڊر جهڙا نشان ظاهر ٿيندي ئي فوري اسپري ڪريو.",
            "field_context_sindh": "سنڌ جي علائقن ۾ صبح جي شبنم ۽ سڪي موسم دوران عام آهي.",
        },
        "Target spot": {
            "application_instructions": "جڏهن پنن تي دائري جهڙا نشان ظاهر ٿين ته اسپري ڪريو.",
            "field_context_sindh": "سنڌ جي ٻنين ۾ گھڻن ٻوٽن ۽ نمي جي ڪري پکڙجي ٿو.",
        },
        "Healthy": {
            "application_instructions": "معمول موجب پاڻي ۽ سنڀال جو وقت مقرر رکو.",
            "field_context_sindh": "ٻوٽو صحت مند نظر اچي ٿو. هر 4-5 ڏينهن کان پوءِ باقاعدي سان سنڀال جاري رکو.",
        },
    },
    "pa": {
        "Bacterial Blight": {
            "application_instructions": "صبح سویرے یا شام دے ٹھنڈے ویلے اسپرے کرو۔ پتاں دے تھلویں تے اتلے پاسے تے چنگی طرح اسپرے کرو۔",
            "field_context_sindh": "کپاہ وچ بیکٹیریل بلائٹ گرمی تے مون سون دے موسم وچ تیزی نال پھیلدی اے۔",
        },
        "Aphids": {
            "application_instructions": "نويں پتاں دے تھلویں پاسے نوں نشانہ بناؤ جتھے کیڑے اکٹھے ہوندے نیں۔",
            "field_context_sindh": "خشکی دے دناں وچ سست تیلا کپاہ دی فصل نوں نقصان پہنچاندا اے۔",
        },
        "Army worm": {
            "application_instructions": "شام 5:30 توں بعد اسپرے کرنا لازمی اے جدوں سنڈیاں نکلدیاں نیں۔",
            "field_context_sindh": "لشکری سنڈی 48 گھنٹیاں وچ کھیت تباہ کر سکدی اے۔ شام دا فورا اسپرے کرو۔",
        },
        "Powdery Mildew": {
            "application_instructions": "پتاں تے چٹا پاؤڈر نظر آؤندے ہی فورا اسپرے کرو۔",
            "field_context_sindh": "صبح دی شبنم تے سکھے موسم وچ عام ہوندی اے۔",
        },
        "Target spot": {
            "application_instructions": "تھلویں پتاں تے گول داغ بنن تے اسپرے کرو۔",
            "field_context_sindh": "گھنی فصل تے سلھ والے موسم وچ پھیلدی اے۔",
        },
        "Healthy": {
            "application_instructions": "عام رواج مطابق پانی تے گوڈی دا ٹائم برقرار رکھو۔",
            "field_context_sindh": "فصل ماشاءاللہ ٹھیک اے۔ ہر 4-5 دن بعد معائنہ جاری رکھو۔",
        },
    },
    "skr": {
        "Bacterial Blight": {
            "application_instructions": "صبح فجرے یا شام دے ٹھڈے ویلے اسپرے کرو۔ پتیاں دے ہیٹھلے تے اتلے پاسے اسپرے کرو۔",
            "field_context_sindh": "کپاہ وچ بیکٹیریل بلائٹ گرمی تے مون سون دے ویلے تیزی نال پھیلدی ہے۔",
        },
        "Aphids": {
            "application_instructions": "اوپر والے نویں پتیاں دی ہیٹھلی سائیڈ تے اسپرے کرو جتھاں کیڑے اکٹھے تھیندن۔",
            "field_context_sindh": "خشکی دے موسم وچ سست تیلا کپاہ کوں نقصان پہنچیندا ہے۔",
        },
        "Army worm": {
            "application_instructions": "شام 5:30 توں بعد اسپرے کرو جتھاں رات کوں سنڈیاں نکھردرن۔",
            "field_context_sindh": "لشکری سنڈی 48 گھنٹیاں وچ فصل تباھ کر سگدی ہے۔ شام دا اسپرے ضروری ہے۔",
        },
        "Powdery Mildew": {
            "application_instructions": "پتیاں تے چٹا سفوف نظر آندے ہی فورا اسپرے کرو۔",
            "field_context_sindh": "صبح دی شبنم دے موسم وچ عام تھیندی ہے۔",
        },
        "Target spot": {
            "application_instructions": "پتیاں تے گول نشان بنن تے اسپرے کرو۔",
            "field_context_sindh": "گھنے پودیاں تے نمی دی وجہ توں پھیلدی ہے۔",
        },
        "Healthy": {
            "application_instructions": "معمول مطابق پانی تے دیکھ بھال جاری رکھو۔",
            "field_context_sindh": "فصل ماشاءاللہ بالکل صحت مند ہے۔ باقاعدہ معائنہ کرو۔",
        },
    },
    "ps": {
        "Bacterial Blight": {
            "application_instructions": "د سهار وختي یا ماښام په سړه هوا کې سپرې کړئ. د پاڼو په لاندې او پورتنۍ برخه کامل پوښښ ډاډمن کړئ.",
            "field_context_sindh": "په توده او مرطوبه هوا کې باکتریایي بلایټ په چټکۍ سره خپریږي.",
        },
        "Aphids": {
            "application_instructions": "د پاڼو لاندې برخه په نښه کړئ چیرې چې مېږیان راټولیږي.",
            "field_context_sindh": "د وچې هوا پر مهال سست مېږیان فصل ته زیان رسوي.",
        },
        "Army worm": {
            "application_instructions": "د ماښام له ۵:۳۰ وروسته سپرې کول اړین دي کله چې چينجي راوځي.",
            "field_context_sindh": "لښکري چينجي کولی شي په ۴۸ ساعتونو کې ټول پټی خراب کړي.",
        },
        "Powdery Mildew": {
            "application_instructions": "په پاڼو د سپین پوډر په لیدلو سره سمدستي سپرې وکړئ.",
            "field_context_sindh": "د سهار په پرخه او وچ موسم کې عام لیدل کیږي.",
        },
        "Target spot": {
            "application_instructions": "کله چې په پاڼو گردي داغونه ولیدل شي سپرې وکړئ.",
            "field_context_sindh": "په ګڼو بوټو او مرطوبه هوا کې خپریږي.",
        },
        "Healthy": {
            "application_instructions": "د معمول مطابق خړوبول او پاملرنه جاري وساتئ.",
            "field_context_sindh": "فصل پوره روغ دی. هر ۴-۵ ورځو کې معائنه وکړئ.",
        },
    },
}

# Alias for backwards compatibility
KHAIRPUR_AGRONOMIC_RULES = SINDH_AGRONOMIC_RULES


def evaluate_weather_safety(weather_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates weather safety for pesticide spraying based on live city weather parameters.
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

    if wind_kmh > 15.0:
        can_spray = False
        spray_status = "POSTPONED_HIGH_WIND"
        warnings.append(
            f"HIGH WIND WARNING ({wind_kmh:.1f} km/h in {location}): Postpone chemical spraying due to high risk of spray drift and chemical loss."
        )

    if humidity_pct > 85.0:
        can_spray = False
        spray_status = "POSTPONED_HIGH_HUMIDITY"
        warnings.append(
            f"HIGH HUMIDITY / RAIN WARNING ({humidity_pct:.1f}% RH): Postpone spraying until leaf canopy dries to prevent pesticide wash-off."
        )

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
    language: str = "en",
) -> Dict[str, Any]:
    """
    Main decision engine function mapping diagnosis to dynamic location farmer advisory.
    Wired to attach Qwen-based LLM advisory text and localized agronomic instructions,
    while keeping the chemical/medicine name strictly in English.
    """
    lang_code = str(language).lower().strip()
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

    # Determine localized application instructions and field context
    app_instructions = rule_info["application_instructions"]
    field_context = rule_info["field_context_sindh"]

    if lang_code in MULTI_LANG_DECISIONS and matched_class in MULTI_LANG_DECISIONS[lang_code]:
        app_instructions = MULTI_LANG_DECISIONS[lang_code][matched_class]["application_instructions"]
        field_context = MULTI_LANG_DECISIONS[lang_code][matched_class]["field_context_sindh"]

    weather_summary = "Normal clear weather"
    if weather_data:
        weather_summary = f"{weather_data.get('temperature_c', 32)}°C, Wind {weather_data.get('wind_speed_kmh', 8)} km/h, Humidity {weather_data.get('humidity_pct', 50)}%"

    # Generate Qwen LLM advisory in selected language
    qwen_res = get_advisory(
        disease=matched_class,
        severity=rule_info["urgency_level"],
        region=location_name,
        weather=weather_summary,
        language=language,
    )

    recommendation = {
        "status": "SUCCESS",
        "crop": "Cotton (Gossypium hirsutum)",
        "region": location_name,
        "language": lang_code,
        "diagnosis": {
            "predicted_class": matched_class,
            "disease_name_urdu": rule_info["disease_name_urdu"],
            "confidence_percentage": round(confidence * 100, 2),
            "confidence_score": round(confidence, 4),
        },
        "actionable_decision": {
            "urgency_level": rule_info["urgency_level"],
            "requires_chemical_spray": rule_info["requires_chemical_spray"] and weather_assessment["can_spray"],
            "chemical_recommendation": rule_info["chemical_treatment"],  # KEPT STRICTLY IN ENGLISH
            "primary_active_ingredient": rule_info["primary_chemical"],   # KEPT STRICTLY IN ENGLISH
            "dosage_per_acre": rule_info["dosage_per_acre"],            # METRIC IN ENGLISH FOR AGRO-DEALER PRECISION
            "application_instructions": app_instructions,                # LOCALIZED IN REGIONAL LANGUAGE
            "agronomic_context_sindh": field_context,                   # LOCALIZED IN REGIONAL LANGUAGE
        },
        "weather_safety_advisory": weather_assessment,
        "weather_safety_khairpur": weather_assessment,
        "qwen_advisory": qwen_res,
    }

    if rule_info["requires_chemical_spray"] and not weather_assessment["can_spray"]:
        recommendation["actionable_decision"]["spray_advisory_note"] = (
            f"CHOSEN CHEMICAL IS IDENTIFIED BUT SPRAYING IS TEMPORARILY POSTPONED DUE TO UNFAVORABLE {location_name.upper()} WEATHER CONDITIONS."
        )

    return recommendation
