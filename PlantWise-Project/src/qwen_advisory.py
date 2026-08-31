"""
Qwen LLM Agronomy Advisory Module for Cotton Disease Detection
Uses Alibaba Cloud DashScope Qwen API (OpenAI-compatible mode) to generate farmer recommendations
in English, Urdu, Sindhi, Punjabi, Saraiki, or Pashto.
"""

import os
import json
import logging
import time
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
MODEL_NAME = "qwen-plus"
TIMEOUT_SECONDS = 10.0
PLACEHOLDER_KEYS = {"", "your_key_here", "your_dashscope_qwen_api_key_here", "none", "null"}

# Supported Regional Languages Mapping
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "rtl": False},
    "ur": {"name": "Urdu", "native": "اردو", "rtl": True},
    "sd": {"name": "Sindhi", "native": "سنڌي", "rtl": True},
    "pa": {"name": "Punjabi", "native": "پنجابی", "rtl": True},
    "skr": {"name": "Saraiki", "native": "سرائیکی", "rtl": True},
    "ps": {"name": "Pashto", "native": "پښتو", "rtl": True},
}

# Regional Language Fallback Recommendations
REGIONAL_FALLBACK_TEMPLATES = {
    "ur": {
        "Bacterial Blight": "خیرپور اور سندھ کے کپاس کے کھیتوں کا بیکٹیریل بلائٹ کی علامات کے لیے معائنہ کریں۔ کاپر آکسی کلورائڈ اور اسٹریپٹو سائکلین کا صبح یا شام کے ٹھنڈے اوقات میں اسپرے کریں۔",
        "Aphids": "کپاس کی فصل پر سست تیلے / سست ڈنگ کے حملے کو کنٹرول کرنے کے لیے پتیوں کی نچلی سطح کا معائنہ کریں اور ایمیڈا کلوپرڈ کا باقاعدگی سے استعمال کریں۔",
        "Army worm": "لشکری سنڈی کا فوری طور پر شام 5:30 بجے کے بعد کیمیکلی علاج کریں تاکہ فصل کو شدید نقصان سے بچایا جا سکے۔",
        "Powdery Mildew": "پاؤڈری ملڈیو کی سفید پھپھوندی ظاہر ہونے پر سلفر یا ہیکسا کونازول کا فوری اسپرے کریں۔",
        "Target spot": "ٹارگٹ اسپاٹ پھپھوندی کے داغ ظاہر ہونے پر ایزوکسی اسٹروبن + ڈائفینوکونازول کا اسپرے کریں۔",
        "Healthy": "آپ کی کپاس کی فصل ماشاءاللہ صحتمند اور محفوظ ہے۔ معمول کے مطابق آبپاشی اور دیکھ بھال جاری رکھیں۔",
    },
    "sd": {
        "Bacterial Blight": "خيرپور ۽ سنڌ جي ڪپھ جي ٻنين جو بئڪٽيريل بلائٽ لاءِ معائنو ڪريو. ڪاپر آڪسي ڪلورائيڊ ۽ اسٽريپٽو سائڪلين جو صبح يا شام جي ٿڌي وقت اسپري ڪريو.",
        "Aphids": "ڪپھ جي فصل تي سست تيلي جي حملي کي روڪڻ لاءِ پنن جي هيٺين پاسي جو معائنو ڪريو ۽ ايميڊا ڪلوپرڊ جو استعمال ڪريو.",
        "Army worm": "لشكري سُنڊي لاءِ لاهڻ جي وقت (شام 5:30 کان پوءِ) فوري طور تي اسپري ڪريو تاڪي فصل ضايع نه ٿئي.",
        "Powdery Mildew": "پاؤڊري ملڊيو ظاهر ٿيڻ تي سلفر يا هيڪسا ڪونا زول جو فوري اسپري ڪريو.",
        "Target spot": "ٽارگيٽ اسپاٽ جي بيماري لاءِ ايزوڪسي اسٽروبن جو اسپري ڪريو.",
        "Healthy": "توهان جي ڪپھ جي فصل ماشاءالله صحت مند آهي. معمول موجب پاڻي ۽ سنڀال جاري رکو.",
    },
    "pa": {
        "Bacterial Blight": "کپاہ دے کھیتاں دا بیکٹیریل بلائٹ لئی معائنہ کرو۔ کاپر آکسی کلورائیڈ تے اسٹریپٹو سائکلین دا صبح یا شام دے ویلے اسپرے کرو۔",
        "Aphids": "سست تیلا نوں کنٹرول کرن لئی پتیاں دے تھلویں پاسے دا معائنہ کرو تے ایمیڈا کلوپرڈ ورتو۔",
        "Army worm": "لشکری سنڈی لئی شام 5:30 توں بعد فورا اسپرے کرو تاکہ فصل دا نقصان نہ ہووے۔",
        "Powdery Mildew": "پاؤڈری ملڈیو لئی سلفر یا ہیکسا کونازول دا فورا اسپرے کرو۔",
        "Target spot": "ٹارگٹ اسپاٹ دا نشان ملن تے ایزوکسی اسٹروبن دا اسپرے کرو۔",
        "Healthy": "تہاڈی کپاہ دی فصل ماشاءاللہ بالکل ٹھیک تے صحت مند اے۔ معمولی دیکھ بھال جاری رکھو۔",
    },
    "skr": {
        "Bacterial Blight": "کپاہ دے کھیتاں دا بیکٹیریل بلائٹ کیتے معائنہ کرو۔ کاپر آکسی کلورائڈ تے اسٹریپٹو سائکلین دا صبح یا شام دے ٹھڈے ویلے اسپرے کرو۔",
        "Aphids": "سست تیلا نال نبڑݨ کیتے پتیاں دی ہیٹھلی سائیڈ دا معائنہ کرو تے مناسب دوائی دا اسپرے کرو۔",
        "Army worm": "لشکری سنڈی دی روک تھام کیتے شام دے ویلے فوری اسپرے کرو تاں جو فصل بچ سگے۔",
        "Powdery Mildew": "پاؤڈری ملڈیو کیتے سلفر دا فوری اسپرے کرو۔",
        "Target spot": "ٹارگٹ اسپاٹ ظاہر تھیوݨ تے ایزوکسی اسٹروبن دا اسپرے کرو۔",
        "Healthy": "تہاڈی کپاہ دی فصل ماشاءاللہ بالکل صحت مند ہے۔ معمول دی سنبھال جاری رکھو۔",
    },
    "ps": {
        "Bacterial Blight": "د پنبي (ملچلو) فصل د باکتریایي بلایټ لپاره وڅارئ. د سهار یا ماښام په سړه هوا کې کپر اکسیکلیورایډ او سټریپټوسایکلین سپرې کړئ.",
        "Aphids": "د مېږیانو (Aphids) کنټرول لپاره د پاڼو لاندې برخه وګورئ او مناسبه درملنه وکړئ.",
        "Army worm": "د لښکري چينجي (Army worm) خلاف د ماښام له ۵:۳۰ وروسته سمدستي سپرې وکړئ.",
        "Powdery Mildew": "د پوډري ملډیو نښو لیدلو سره سمدستي سلفر سپرې کړئ.",
        "Target spot": "د تارګټ سپاټ ناروغۍ لپاره ایزوکسیسټروبین سپرې کړئ.",
        "Healthy": "ستاسو د پنبي فصل ماشاءالله په بشپړ ډول روغ دی. خپل معمول مراقبت ته دوام ورکړئ.",
    },
}


def _get_openai_client() -> Optional[Any]:
    """
    Creates and returns an OpenAI client configured for DashScope Qwen compatible endpoint.
    """
    api_key = os.getenv("QWEN_API", "").strip()
    if not api_key or api_key.lower() in PLACEHOLDER_KEYS:
        logger.warning("[QWEN ADVISORY] Valid QWEN_API key not found in environment. Using agronomic fallback.")
        return None

    try:
        from openai import OpenAI
        return OpenAI(
            api_key=api_key,
            base_url=DASHSCOPE_BASE_URL,
            timeout=TIMEOUT_SECONDS,
        )
    except Exception as e:
        logger.error(f"[QWEN ADVISORY] Failed to initialize OpenAI client: {type(e).__name__}")
        return None


def get_advisory(
    disease: str,
    severity: str,
    region: str,
    weather: str,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Generates a concise farmer recommendation using Alibaba Cloud Qwen-plus model.

    Args:
        disease: Name of the cotton disease / pathogen or condition.
        severity: Severity level (e.g. "high", "medium", "low", "critical").
        region: Geographic region / location (e.g. "Khairpur, Sindh, Pakistan").
        weather: Current weather summary string (e.g. "29.8°C, Wind 16.9 km/h, Humidity 62%").
        language: Language code: "en", "ur", "sd" (Sindhi), "pa" (Punjabi), "skr" (Saraiki), "ps" (Pashto).

    Returns:
        Dict: {"recommendation": str, "urgency": "low" | "medium" | "high", "language": str, "language_name": str}
    """
    lang_code = str(language).lower().strip()
    if lang_code not in SUPPORTED_LANGUAGES:
        lang_code = "en"

    lang_meta = SUPPORTED_LANGUAGES[lang_code]
    lang_name = lang_meta["name"]
    lang_native = lang_meta["native"]

    sev_lower = str(severity).lower()
    fallback_urgency = "high" if "crit" in sev_lower or "high" in sev_lower else ("medium" if "mod" in sev_lower or "med" in sev_lower else "low")

    # Select localized fallback template if available
    rec_text = ""
    if lang_code in REGIONAL_FALLBACK_TEMPLATES and disease in REGIONAL_FALLBACK_TEMPLATES[lang_code]:
        rec_text = REGIONAL_FALLBACK_TEMPLATES[lang_code][disease]
    elif lang_code != "en":
        rec_text = f"{region} میں کپاس کی فصل کا {disease} کے لیے معائنہ کریں۔ مقامی موسم ({weather}) کو مدنظر رکھتے ہوئے مناسب تدابیر اختیار کریں۔"
    else:
        rec_text = f"Scout cotton fields in {region} for {disease}. Follow standard agricultural treatment for {disease} under local weather ({weather})."

    fallback_response = {
        "recommendation": rec_text,
        "urgency": fallback_urgency,
        "language": lang_code,
        "language_name": lang_name,
        "language_native": lang_native,
        "is_rtl": lang_meta["rtl"],
    }

    client = _get_openai_client()
    if not client:
        return fallback_response

    system_prompt = (
        f"You are an expert agronomy advisor specializing in cotton (Gossypium hirsutum) crops in Pakistan. "
        f"Provide a concise, direct, 2-3 sentence practical recommendation for the farmer strictly in the {lang_name} ({lang_native}) language. "
        "Respond ONLY with a valid JSON object matching this schema:\n"
        '{"recommendation": "<advisory text in requested language>", "urgency": "low"|"medium"|"high"}'
    )

    user_prompt = (
        f"Cotton Field Diagnosis:\n"
        f"- Disease/Condition: {disease}\n"
        f"- Severity Level: {severity}\n"
        f"- Location: {region}\n"
        f"- Current Weather: {weather}\n\n"
        f"Provide practical farmer advice and urgency level in JSON format strictly in {lang_name} ({lang_native}) language."
    )

    max_attempts = 2
    for attempt in range(1, max_attempts + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=250,
                temperature=0.3,
                response_format={"type": "json_object"},
            )

            raw_content = response.choices[0].message.content.strip()
            parsed = json.loads(raw_content)

            rec = str(parsed.get("recommendation", "")).strip()
            urg = str(parsed.get("urgency", fallback_urgency)).lower().strip()

            if urg not in ["low", "medium", "high"]:
                urg = fallback_urgency

            if rec:
                return {
                    "recommendation": rec,
                    "urgency": urg,
                    "language": lang_code,
                    "language_name": lang_name,
                    "language_native": lang_native,
                    "is_rtl": lang_meta["rtl"],
                }
        except Exception as e:
            logger.error(f"[QWEN ADVISORY] API call attempt {attempt}/{max_attempts} failed for language '{lang_code}': {type(e).__name__}")
            if attempt < max_attempts:
                time.sleep(0.5)

    logger.warning(f"[QWEN ADVISORY] Returning fallback advisory for '{lang_code}' after API retries exhausted.")
    return fallback_response
