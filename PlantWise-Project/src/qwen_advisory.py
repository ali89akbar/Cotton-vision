"""
Qwen & Gemini LLM Agronomy Advisory Module for Cotton Disease Detection
Uses Alibaba Cloud Qwen API & Google Gemini API (OpenAI-compatible endpoints)
to generate multi-lingual farmer recommendations and interactive chatbot answers.
"""

import os
import json
import logging
import time
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
QWEN_MODEL = "qwen-plus"
GEMINI_MODEL = "gemini-3.5-flash-lite"
TIMEOUT_SECONDS = 5.0
PLACEHOLDER_KEYS = {"", "your_key_here", "your_dashscope_qwen_api_key_here", "none", "null"}

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "rtl": False},
    "ur": {"name": "Urdu", "native": "اردو", "rtl": True},
    "sd": {"name": "Sindhi", "native": "سنڌي", "rtl": True},
    "pa": {"name": "Punjabi", "native": "پنجابی", "rtl": True},
    "skr": {"name": "Saraiki", "native": "سرائیکی", "rtl": True},
    "ps": {"name": "Pashto", "native": "پښتو", "rtl": True},
}

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
        "Bacterial Blight": "د پنبي فصل د باکتریایي بلایټ لپاره وڅارئ. د سهار یا ماښام په سړه هوا کې کپر اکسیکلیورایډ او سټریپټوسایکلین سپرې کړئ.",
        "Aphids": "د مېږیانو (Aphids) کنټرول لپاره د پاڼو لاندې برخه وګورئ او مناسبه درملنه وکړئ.",
        "Army worm": "د لښکري چينجي خلاف د ماښام له ۵:۳۰ وروسته سمدستي سپرې وکړئ.",
        "Powdery Mildew": "د پوډري ملډیو نښو لیدلو سره سمدستي سلفر سپرې کړئ.",
        "Target spot": "د تارګټ سپاٽ ناروغۍ لپاره ایزوکسیسټروبین سپرې کړئ.",
        "Healthy": "ستاسو د پنبي فصل ماشاءالله په بشپړ ډول روغ دی. خپل معمول مراقبت ته دوام ورکړئ.",
    },
}


def _get_llm_clients() -> list:
    """
    Returns available LLM clients in priority order.
    Prioritizes Gemini for lightning-fast <1s responses.
    """
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    clients = []

    # 1. Primary fast client: Gemini API
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if gemini_key and gemini_key.lower() not in PLACEHOLDER_KEYS:
        try:
            from openai import OpenAI
            clients.append({
                "name": "Gemini",
                "client": OpenAI(api_key=gemini_key, base_url=GEMINI_BASE_URL, timeout=2.5),
                "model": GEMINI_MODEL,
            })
        except Exception as e:
            logger.warning(f"Failed to init Gemini client: {e}")

    # 2. Secondary client: Qwen API
    qwen_key = os.getenv("QWEN_API", "").strip() or os.getenv("QWEN_API_KEY", "").strip()
    if qwen_key and qwen_key.lower() not in PLACEHOLDER_KEYS:
        try:
            from openai import OpenAI
            clients.append({
                "name": "Qwen",
                "client": OpenAI(api_key=qwen_key, base_url=DASHSCOPE_BASE_URL, timeout=2.5),
                "model": QWEN_MODEL,
            })
        except Exception as e:
            logger.warning(f"Failed to init Qwen client: {e}")

    return clients


AGRONOMIC_CHAT_KNOWLEDGE = {
    "fertilizer": {
        "en": "Avoid tank-mixing liquid fertilizers directly with Copper Oxychloride or insecticides as it can cause leaf phytotoxicity. Apply Copper Oxychloride separately in early morning or cool evening, and wait 3-5 days before applying foliar fertilizers.",
        "ur": "کاپر آکسی کلورائیڈ کے ساتھ مائع کھاد ملا کر اسپرے نہ کریں، اس سے پتے جلنے کا خدشہ ہوتا ہے۔ کاپر آکسی کلورائیڈ کا صبح یا شام میں الگ اسپرے کریں اور کھاد 3 سے 5 دن بعد دیں۔",
        "sd": "ڪاپر آڪسي ڪلورائيڊ سان مائع ڀاڻ ملائي اسپري نه ڪريو، ان سان پن سڙڻ جو خطرو هوندو آهي. ڪاپر آڪسي ڪلورائيڊ جو صبح يا شام جي وقت ڌار اسپري ڪريو.",
    },
    "spray_time": {
        "en": "The safest spray window is Early Morning (6:00 AM - 9:00 AM) or Cool Evening (5:00 PM - 7:00 PM) when wind speeds are under 15 km/h and temperatures are below 35°C to avoid leaf phytotoxicity.",
        "ur": "اسپرے کا بہترین وقت صبح سویرے (6 سے 9 بجے) یا ٹھنڈی شام (5 سے 7 بجے) ہے جب ہوا کی رفتار کم ہو اور درجہ حرارت 35 ڈگری سے کم ہو۔",
        "sd": "اسپري جو بهترين وقت صبح جو سوير (6 کان 9 بجي) يا شام جي ٿڌي وقت آهي جڏهن هوا تيز نه هجي.",
    },
    "dosage": {
        "en": "Standard per-acre dosage: Bacterial Blight (Copper Oxychloride @ 250g/acre + Streptocycline @ 6g/acre in 100L water); Aphids (Imidacloprid @ 60ml/acre); Powdery Mildew (Sulfur @ 1kg/acre).",
        "ur": "تجویز کردہ خوراک: بیکٹیریل بلائٹ کے لیے 250 گرام کاپر آکسی کلورائیڈ + 6 گرام اسٹریپٹو سائکلین فی ایکڑ 100 لیٹر پانی میں؛ سست تیلے کے لیے ایمیڈا کلوپرڈ 60 ملی لیٹر فی ایکڑ۔",
        "sd": "تجويز ڪيل مقدار: بئڪٽيريل بلائٽ لاءِ 250 گرام ڪاپر آڪسي ڪلورائيڊ + 6 گرام اسٽريپٽو سائڪلين في ايڪڙ 100 ليٽر پاڻي ۾ اسپري ڪريو.",
    }
}


def get_copilot_chat_reply(
    message: str,
    disease: Optional[str] = None,
    language: str = "en",
) -> str:
    """
    Interactive Qwen AI Agronomist Copilot Chatbot Handler.
    Generates intelligent dynamic answers to farmer questions in regional languages using Qwen / Gemini.
    """
    lang_code = str(language).lower().strip()
    if lang_code not in SUPPORTED_LANGUAGES:
        lang_code = "en"

    msg_lower = str(message).lower()

    # Fast Instant Knowledge Matching (< 5ms response time)
    if any(k in msg_lower for k in ["mix", "fertilizer", "کھاد", "ڀاڻ"]):
        return AGRONOMIC_CHAT_KNOWLEDGE["fertilizer"].get(lang_code, AGRONOMIC_CHAT_KNOWLEDGE["fertilizer"]["en"])
    elif any(k in msg_lower for k in ["time", "when", "weather", "وقت", "موسم"]):
        return AGRONOMIC_CHAT_KNOWLEDGE["spray_time"].get(lang_code, AGRONOMIC_CHAT_KNOWLEDGE["spray_time"]["en"])
    elif any(k in msg_lower for k in ["dose", "dosage", "acre", "مقدار", "خوراک"]):
        return AGRONOMIC_CHAT_KNOWLEDGE["dosage"].get(lang_code, AGRONOMIC_CHAT_KNOWLEDGE["dosage"]["en"])

    lang_meta = SUPPORTED_LANGUAGES[lang_code]
    lang_name = lang_meta["name"]
    lang_native = lang_meta["native"]

    disease_context = f"The crop disease identified in this field is '{disease}'." if disease else "General cotton field management."

    system_prompt = (
        f"You are the Qwen AI Agronomist Copilot, an expert cotton crop specialist for Sindh & Pakistan. {disease_context} "
        f"Answer the farmer's question directly, practically, and helpfully in 2-3 sentences. "
        f"Answer strictly in the {lang_name} ({lang_native}) language, but keep chemical medicine names strictly in English (e.g. Copper Oxychloride, Imidacloprid, Hexaconazole) for agro-dealer clarity."
    )

    user_prompt = f"Farmer Question: {message}"

    clients = _get_llm_clients()
    for provider in clients:
        p_name = provider["name"]
        client = provider["client"]
        m_name = provider["model"]

        try:
            logger.info(f"[COPILOT CHAT] Sending request to {p_name} ({m_name})...")
            response = client.chat.completions.create(
                model=m_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=100,
                temperature=0.4,
            )
            reply_text = response.choices[0].message.content.strip()
            if reply_text:
                logger.info(f"[COPILOT CHAT] Successfully generated reply with {p_name}")
                return reply_text
        except Exception as err:
            logger.error(f"[COPILOT CHAT] Provider '{p_name}' error: {err}. Trying next provider...")
            continue

    # Contextual Fallback if all APIs fail
    if lang_code == "ur":
        return f"فصل میں {disease or 'کپاس'} کی دیکھ بھال کے لیے: ہمیشہ ٹھنڈے اوقات (صبح 6-9 یا شام 5-7) میں اسپرے کریں۔ دوائی کا انتخاب اور مقدار مقامی ایگرو ڈیلر سے کیمیکل نام کے ساتھ تائید کریں۔"
    elif lang_code == "sd":
        return f"فصل ۾ {disease or 'ڪپھ'} جي سنڀال لاءِ: هميشه صبح يا شام جي ٿڌي وقت اسپري ڪريو."
    else:
        return f"For cotton crop management ({disease or 'General'}): Always apply chemical sprays separately during early morning (6-9 AM) or evening hours. Ensure proper safety gear and accurate per-acre dosage."


def get_advisory(
    disease: str,
    severity: str,
    region: str,
    weather: str,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Generates a concise farmer recommendation using Qwen / Gemini models.
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

    clients = _get_llm_clients()
    if not clients:
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

    for provider in clients:
        p_name = provider["name"]
        client = provider["client"]
        m_name = provider["model"]

        try:
            response = client.chat.completions.create(
                model=m_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=250,
                temperature=0.3,
            )

            raw_content = response.choices[0].message.content.strip()
            # Clean possible markdown block markers
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:]
            if raw_content.startswith("```"):
                raw_content = raw_content[3:]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
            raw_content = raw_content.strip()

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
            logger.error(f"[QWEN ADVISORY] Provider '{p_name}' failed for '{lang_code}': {e}")
            continue

    logger.warning(f"[QWEN ADVISORY] Returning fallback advisory for '{lang_code}' after LLM providers exhausted.")
    return fallback_response
