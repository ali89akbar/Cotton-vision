"""
Autonomous AI Agronomist Agent Module for Plantwise Cotton Diagnostics.
Uses Qwen Function-Calling (DashScope OpenAI-compatible API) to execute tool-call loops,
evaluating weather safety, disease severity, pesticide costs, and dispatching farmer alerts.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from openai import OpenAI

try:
    from tools import TOOLS, AVAILABLE_TOOLS
except ImportError:
    from src.tools import TOOLS, AVAILABLE_TOOLS

logger = logging.getLogger("AgronomistAgent")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
MODEL_NAME = "qwen-plus"
MAX_STEPS = 5
PLACEHOLDER_KEYS = {"", "your_key_here", "your_dashscope_qwen_api_key_here", "none", "null"}

SYSTEM_PROMPT = (
    "You are an expert Autonomous AI Agronomist Agent for cotton crops in Sindh and Pakistan. "
    "Your mission is to diagnose cotton leaf conditions, assess micro-climate weather safety, "
    "calculate pesticide spray cost and ROI, and dispatch an official alert to the farmer.\n\n"
    "WORKFLOW & GUIDELINES:\n"
    "1. Call 'get_disease_severity' to evaluate foliage damage for the leaf image ID or disease.\n"
    "2. Call 'get_weather_forecast' to check micro-climate weather conditions in the target region.\n"
    "3. Call 'get_pesticide_cost' to retrieve exact chemical formulation, per-acre dosage, and cost.\n"
    "4. ALWAYS finish your analysis by calling 'send_farmer_alert' with the final urgency level and clear, practical spray instructions.\n"
    "Keep chemical formulation names strictly in English for agro-dealer clarity."
)


def get_qwen_api_key() -> str:
    """
    Retrieves the Qwen API key safely from environment variables without hardcoding.
    """
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    for key_name in ["QWEN_API", "QWEN_API_KEY", "DASHSCOPE_API_KEY"]:
        val = os.getenv(key_name, "").strip()
        if val and val.lower() not in PLACEHOLDER_KEYS:
            return val
    return ""


ALERT_LANG_TEMPLATES = {
    "ur": {
        "Bacterial Blight": "خیرپور اور سندھ کے کپاس کے کھیتوں میں بیکٹیریل بلائٹ کی تشخیص ہوئی ہے۔ تجویز کردہ دوائی: {chemical}۔ خوراک فی ایکڑ: {dosage}۔ اسپرے کا بہترین وقت: {window}۔",
        "Aphids": "کپاس کی فصل پر سست تیلا (Aphids) کی تشخیص ہوئی ہے۔ تجویز کردہ دوائی: {chemical}۔ خوراک: {dosage}۔ اسپرے کا وقت: {window}۔",
        "Army worm": "لشکری سنڈی (Army worm) کا شدید حملہ ظاہر ہوا ہے۔ فوری کیمیائی علاج: {chemical}۔ خوراک: {dosage}۔ شام 5:30 کے بعد فورا اسپرے کریں۔",
        "Powdery Mildew": "پاؤڈری ملڈیو (Powdery Mildew) کی تشخیص ہوئی ہے۔ تجویز کردہ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے کا بہترین وقت: {window}۔",
        "Target spot": "ٹارگٹ اسپاٹ (Target spot) کی تشخیص ہوئی ہے۔ تجویز کردہ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے کا وقت: {window}۔",
        "Healthy": "آپ کی کپاس کی فصل الحمدللہ صحت مند ہے۔ معمول کے مطابق دیکھ بھال جاری رکھیں۔",
    },
    "sd": {
        "Bacterial Blight": "خيرپور ۽ سنڌ جي ڪپھ ۾ بئڪٽيريل بلائٽ جي سڃاڻپ ٿي آهي. تجويز ڪيل دوائون: {chemical}. مقدار في ايڪڙ: {dosage}. اسپري جو وقت: {window}.",
        "Aphids": "ڪپھ جي فصل تي سست تيلي جي سڃاڻپ ٿي آهي. تجويز ڪيل دوائون: {chemical}. مقدار: {dosage}. اسپري جو وقت: {window}.",
        "Army worm": "لشكري سُنڊي جو خطرناڪ حملو ظاهر ٿيو آهي. فوري اسپري: {chemical}. مقدار: {dosage}. شام جو فوري اسپري ڪريو.",
        "Powdery Mildew": "پاؤڊري ملڊيو جي سڃاڻپ ٿي آهي. تجويز ڪيل علاج: {chemical}. مقدار: {dosage}. اسپري جو وقت: {window}.",
        "Target spot": "ٽارگيٽ اسپاٽ بيماري جي سڃاڻپ ٿي آهي. علاج: {chemical}. مقدار: {dosage}. اسپري جو وقت: {window}.",
        "Healthy": "توهان جي ڪپھ جي فصل صحت مند آهي. معمول موجب سنڀال جاري رکو.",
    },
    "pa": {
        "Bacterial Blight": "کپاہ وچ بیکٹیریل بلائٹ دی سُنڄاݨ ہوئی اے۔ تجویز کردہ دوائی: {chemical}۔ خوراک فی ایکڑ: {dosage}۔ اسپرے دا ویلہ: {window}۔",
        "Aphids": "کپاہ تے سست تیلا ظاہر ہویا اے۔ تجویز کردہ دوائی: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلہ: {window}۔",
        "Army worm": "لشکری سنڈی دا حملہ ہویا اے۔ فوری علاج: {chemical}۔ خوراک: {dosage}۔ شام دے ویلے اسپرے کرو۔",
        "Powdery Mildew": "پاؤڈری ملڈیو دی سُنڄاݨ ہوئی اے۔ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلہ: {window}۔",
        "Target spot": "ٹارگٹ اسپاٹ دی سُنڄاݨ ہوئی اے۔ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلہ: {window}۔",
        "Healthy": "تہاڈی کپاہ دی فصل ماشاءاللہ بالکل ٹھیک تے صحت مند اے۔",
    },
    "skr": {
        "Bacterial Blight": "کپاہ وِچ بیکٹیریل بلائٹ دی سنڄاݨ تھئی اے۔ تجویز کردہ دوائی: {chemical}۔ خوراک فی ایکڑ: {dosage}۔ اسپرے دا ویلا: {window}۔",
        "Aphids": "کپاہ تے سست تیلا ظاہر تھئے ۔ تجویز کردہ دوائی: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلا: {window}۔",
        "Army worm": "لشکری سنڈی دا حملہ تھئے ۔ فوری علاج: {chemical}۔ خوراک: {dosage}۔ شام وِچ فورا اسپرے کرو۔",
        "Powdery Mildew": "پاؤڈری ملڈیو دی سنڄاݨ تھئی اے۔ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلا: {window}۔",
        "Target spot": "ٹارگٹ اسپاٹ دی سنڄاݨ تھئی اے۔ علاج: {chemical}۔ خوراک: {dosage}۔ اسپرے دا ویلا: {window}۔",
        "Healthy": "تہاڈی کپاہ دی فصل ماشاءاللہ بالکل ٹھیک تے صحت مند اے۔",
    },
    "ps": {
        "Bacterial Blight": "په پنبې فصل کې د باکتریایي بلایټ تشخیص شوی. سپارښتنه شوې درمل: {chemical}. اندازه: {dosage}. د سپری وخت: {window}.",
        "Aphids": "په پنبې فصل کې د شتې (Aphids) تشخیص شوی. سپارښتنه شوې درمل: {chemical}. اندازه: {dosage}. د سپری وخت: {window}.",
        "Army worm": "د لښکري چینجي برید شوی. سمدستي درملنه: {chemical}. اندازه: {dosage}. ماښام مهال سپری وکړئ.",
        "Powdery Mildew": "د پاوډري ملډیو تشخیص شوی. درملنه: {chemical}. اندازه: {dosage}. د سپری وخت: {window}.",
        "Target spot": "د ټارګټ سپاټ تشخیص شوی. درملنه: {chemical}. اندازه: {dosage}. د سپری وخت: {window}.",
        "Healthy": "ستاسو د پنبې فصل روغ او جوړ دی.",
    },
    "en": {
        "Bacterial Blight": "Diagnosed Bacterial Blight in {region}. Recommended Remedy: {chemical}. Dosage: {dosage}. Spray Window: {window}.",
        "Aphids": "Diagnosed Aphids in {region}. Recommended Remedy: {chemical}. Dosage: {dosage}. Spray Window: {window}.",
        "Army worm": "CRITICAL: Diagnosed Fall Armyworm in {region}. Recommended Remedy: {chemical}. Dosage: {dosage}. Apply strictly during evening hours after 5:30 PM.",
        "Powdery Mildew": "Diagnosed Powdery Mildew in {region}. Recommended Remedy: {chemical}. Dosage: {dosage}. Spray Window: {window}.",
        "Target spot": "Diagnosed Target Spot in {region}. Recommended Remedy: {chemical}. Dosage: {dosage}. Spray Window: {window}.",
        "Healthy": "Crop foliage is healthy in {region}. Continue regular field scouting and routine management.",
    }
}


def run_deterministic_agent_fallback(
    disease: str,
    region: str,
    image_id: str,
    language: str,
    reason: str = "API Fallback",
) -> Dict[str, Any]:
    """
    Fallback agent execution loop that simulates the 4-step tool sequence
    if the external Qwen API times out, errors out, or hits MAX_STEPS.
    """
    logger.info(f"Executing deterministic agent loop fallback (Reason: {reason})")
    tool_trace: List[Dict[str, Any]] = []

    # Step 1: Severity
    severity_res = AVAILABLE_TOOLS["get_disease_severity"](image_id=image_id)
    tool_trace.append({
        "step": 1,
        "tool_name": "get_disease_severity",
        "arguments": {"image_id": image_id},
        "result_status": "SUCCESS",
        "result_summary": severity_res,
    })

    # Step 2: Weather
    weather_res = AVAILABLE_TOOLS["get_weather_forecast"](region=region)
    tool_trace.append({
        "step": 2,
        "tool_name": "get_weather_forecast",
        "arguments": {"region": region},
        "result_status": "SUCCESS",
        "result_summary": weather_res,
    })

    # Step 3: Pesticide Cost
    cost_res = AVAILABLE_TOOLS["get_pesticide_cost"](disease=disease)
    tool_trace.append({
        "step": 3,
        "tool_name": "get_pesticide_cost",
        "arguments": {"disease": disease},
        "result_status": "SUCCESS",
        "result_summary": cost_res,
    })

    # Step 4: Farmer Alert (Localized in regional language with English medicine name)
    lang_code = str(language).lower().strip()
    lang_dict = ALERT_LANG_TEMPLATES.get(lang_code, ALERT_LANG_TEMPLATES["en"])
    matched_dis = cost_res.get("disease", "Healthy")
    template_msg = lang_dict.get(matched_dis, lang_dict.get("Healthy"))

    msg = template_msg.format(
        region=region,
        chemical=cost_res.get("chemical_treatment", "Copper Oxychloride"),
        dosage=cost_res.get("dosage_per_acre", "As per label"),
        window=weather_res.get("recommended_window", "Early Morning (6:00 - 9:00 AM)"),
    )

    urgency = cost_res.get("urgency_level", "HIGH")
    alert_res = AVAILABLE_TOOLS["send_farmer_alert"](message=msg, urgency=urgency)
    tool_trace.append({
        "step": 4,
        "tool_name": "send_farmer_alert",
        "arguments": {"message": msg, "urgency": urgency},
        "result_status": "SUCCESS",
        "result_summary": alert_res,
    })

    return {
        "status": "SUCCESS_FALLBACK",
        "disease": disease,
        "region": region,
        "steps_taken": 4,
        "max_steps": MAX_STEPS,
        "tool_trace": tool_trace,
        "final_alert": alert_res,
        "fallback_reason": reason,
        "agent_response": msg,
    }


def run_agronomist_agent(
    disease: str,
    region: str = "Khairpur",
    image_id: str = "test_001",
    language: str = "en",
) -> Dict[str, Any]:
    """
    Executes an autonomous agent loop powered by Qwen Function-Calling.

    Args:
        disease: Detected cotton disease name (e.g., 'Bacterial Blight', 'Aphids', 'Army worm').
        region: Target region/city (e.g., 'Khairpur', 'Sukkur', 'Multan').
        image_id: Unique leaf image identifier.
        language: Preferred advisory language ('en', 'ur', 'sd', 'pa', 'skr', 'ps').

    Returns:
        Dict containing agent status, execution trace, final alert response, and recommendation.
    """
    api_key = get_qwen_api_key()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

    # Try Primary Qwen API or Secondary Gemini API
    clients_to_try = []
    if api_key:
        clients_to_try.append({"name": "Qwen", "client": OpenAI(api_key=api_key, base_url=DASHSCOPE_BASE_URL), "model": MODEL_NAME})
    if gemini_key:
        clients_to_try.append({"name": "Gemini", "client": OpenAI(api_key=gemini_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/"), "model": "gemini-3.5-flash-lite"})

    if not clients_to_try:
        logger.warning("No API keys found for Qwen or Gemini. Using fallback agent loop.")
        return run_deterministic_agent_fallback(disease, region, image_id, language, reason="No API Keys Configured")

    user_prompt = (
        f"Perform an autonomous agronomic analysis for cotton disease '{disease}' "
        f"in region '{region}' for image ID '{image_id}'. Language preference: {language}."
    )

    for provider in clients_to_try:
        provider_name = provider["name"]
        client = provider["client"]
        model_name = provider["model"]

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        tool_trace: List[Dict[str, Any]] = []
        alert_delivered: Optional[Dict[str, Any]] = None
        step = 0

        logger.info(f"--- Starting Autonomous AI Agronomist Agent Loop with Provider: '{provider_name}' (Model: '{model_name}') ---")

        try:
            while step < MAX_STEPS:
                step += 1
                logger.info(f"Agent Step {step}/{MAX_STEPS} ({provider_name}): Sending prompt & tools...")

                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    tools=TOOLS,
                    temperature=0.3,
                )

                response_message = response.choices[0].message
                tool_calls = getattr(response_message, "tool_calls", None)

                if tool_calls:
                    messages.append(response_message)

                    for tool_call in tool_calls:
                        func_name = tool_call.function.name
                        tool_call_id = tool_call.id

                        try:
                            func_args = json.loads(tool_call.function.arguments)
                        except Exception:
                            func_args = {}

                        logger.info(f"[{provider_name} TRACE STEP {step}] Tool Requested: '{func_name}' with args: {func_args}")

                        # Execute target tool safely
                        target_tool = AVAILABLE_TOOLS.get(func_name)
                        if target_tool:
                            try:
                                tool_result = target_tool(**func_args)
                            except Exception as err:
                                logger.warning(f"Error executing tool '{func_name}': {err}")
                                tool_result = {"error": f"Execution failure in '{func_name}': {str(err)}"}
                        else:
                            tool_result = {"error": f"Unknown tool name '{func_name}'"}

                        # Record tool-call trace evidence
                        trace_entry = {
                            "step": step,
                            "tool_name": func_name,
                            "arguments": func_args,
                            "result_status": "ERROR" if "error" in tool_result else "SUCCESS",
                            "result_summary": tool_result,
                        }
                        tool_trace.append(trace_entry)

                        if func_name == "send_farmer_alert":
                            alert_delivered = tool_result

                        # Feed tool result back as 'role: tool' message
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call_id,
                            "name": func_name,
                            "content": json.dumps(tool_result, ensure_ascii=False),
                        })

                    if alert_delivered:
                        logger.info(f"Agent successfully dispatched final farmer alert using {provider_name}!")
                        return {
                            "status": "SUCCESS",
                            "provider_used": provider_name,
                            "model_used": model_name,
                            "disease": disease,
                            "region": region,
                            "steps_taken": step,
                            "max_steps": MAX_STEPS,
                            "tool_trace": tool_trace,
                            "final_alert": alert_delivered,
                            "agent_response": messages[-1].get("content") if messages else None,
                        }

                else:
                    # Assistant produced final text response without requesting further tool calls
                    final_text = response_message.content or ""
                    logger.info(f"Agent ({provider_name}) provided final textual response.")
                    messages.append({"role": "assistant", "content": final_text})
                    return {
                        "status": "COMPLETED_WITHOUT_ALERT",
                        "provider_used": provider_name,
                        "model_used": model_name,
                        "disease": disease,
                        "region": region,
                        "steps_taken": step,
                        "max_steps": MAX_STEPS,
                        "tool_trace": tool_trace,
                        "agent_response": final_text,
                    }

        except Exception as e:
            logger.error(f"Provider '{provider_name}' failed with error: {e}. Trying next provider...")
            continue

    logger.warning("All LLM providers failed or reached MAX_STEPS. Using deterministic fallback agent loop.")
    return run_deterministic_agent_fallback(disease, region, image_id, language, reason="All LLM Providers Failed")


# Standalone Test Scenario
if __name__ == "__main__":
    print("=" * 70)
    print("[TEST] TESTING AUTONOMOUS AI AGRONOMIST AGENT WITH MULTI-PROVIDER FALLBACK")
    print("=" * 70)

    test_disease = "Bacterial Blight"
    test_region = "Multan"
    test_image_id = "test_001"

    try:
        agent_result = run_agronomist_agent(
            disease=test_disease,
            region=test_region,
            image_id=test_image_id,
            language="en",
        )

        print("\n[SUCCESS] AGENT EXECUTION COMPLETED SUCCESSFULLY!")
        print(f"Status: {agent_result.get('status')}")
        print(f"Provider Used: {agent_result.get('provider_used', 'Fallback Engine')}")
        print(f"Model Used: {agent_result.get('model_used', 'N/A')}")
        print(f"Steps Taken: {agent_result.get('steps_taken')} / {agent_result.get('max_steps')}")

        print("\n[EVIDENCE OF AI REASONING - TOOL-CALL TRACE]:")
        for idx, trace in enumerate(agent_result.get("tool_trace", []), 1):
            print(f"  [{idx}] Step {trace['step']} -> Tool: {trace['tool_name']}({trace['arguments']})")
            print(f"      Result Status: {trace['result_status']}")

        if agent_result.get("final_alert"):
            print("\n[FINAL DELIVERED FARMER ALERT]:")
            print(json.dumps(agent_result["final_alert"], indent=2))

    except Exception as exc:
        print(f"\n[ERROR] Agent execution failed: {exc}")
