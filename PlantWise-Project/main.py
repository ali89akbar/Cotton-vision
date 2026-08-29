import sys
import os

# Add src/ to sys.path so modules can be imported directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

import uvicorn
from src.app import app

if __name__ == "__main__":
    print("=" * 65)
    print("  LAUNCHING PLANTWISE DETECTION API SERVER (KHAIRPUR, SINDH)")
    print("=" * 65)
    print("  Swagger UI Docs : http://localhost:8000/docs")
    print("  Health Check    : http://localhost:8000/health")
    print("  Live Weather API: http://localhost:8000/weather?city=Khairpur")
    print("=" * 65 + "\n")
    uvicorn.run("src.app:app", host="0.0.0.0", port=8000, reload=True)
