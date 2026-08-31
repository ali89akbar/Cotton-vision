import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from qwen_advisory import get_advisory


def test_qwen_advisory_standalone_fallback():
    """Verify get_advisory returns structured dict even without QWEN_API set."""
    # Temporarily unset QWEN_API to verify fallback behavior
    old_key = os.environ.get("QWEN_API")
    if "QWEN_API" in os.environ:
        del os.environ["QWEN_API"]

    res = get_advisory(
        disease="Bacterial Blight",
        severity="HIGH",
        region="Khairpur, Sindh",
        weather="34°C, Wind 10 km/h",
    )

    assert isinstance(res, dict)
    assert "recommendation" in res
    assert "urgency" in res
    assert res["urgency"] in ["low", "medium", "high"]
    assert "Bacterial Blight" in res["recommendation"]

    # Restore key if existed
    if old_key:
        os.environ["QWEN_API"] = old_key


def test_qwen_advisory_structure():
    """Verify get_advisory output structure."""
    res = get_advisory(
        disease="Aphids",
        severity="MODERATE",
        region="Sukkur, Sindh",
        weather="28°C, Wind 8 km/h",
    )
    assert "recommendation" in res
    assert "urgency" in res
    assert res["urgency"] in ["low", "medium", "high"]
