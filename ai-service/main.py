from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="Shonkot Flood Risk AI Service")


# --------------------------------------------------
# Load trained Random Forest model package
# --------------------------------------------------

MODEL_PATH = Path(__file__).parent / "flood_model.pkl"

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
features = model_package["features"]
risk_thresholds = model_package["risk_thresholds"]

print("✅ AI model loaded successfully")
print(f"✅ Model: {model_package['model_name']}")
print(f"✅ Features: {features}")
print(f"✅ Risk thresholds: {risk_thresholds}")


# --------------------------------------------------
# Request format
# --------------------------------------------------

class FloodInput(BaseModel):
    rainfall: float
    relative_humidity: float
    max_temp: float
    min_temp: float
    cloud_coverage: float
    month: int


# --------------------------------------------------
# Convert probability to application risk level
# --------------------------------------------------

def get_risk_level(probability: float):

    if probability < risk_thresholds["medium"]:
        return "Low"

    elif probability < risk_thresholds["high"]:
        return "Medium"

    return "High"


# --------------------------------------------------
# Health endpoint
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelLoaded": True,
        "model": model_package["model_name"],
        "features": features
    }


# --------------------------------------------------
# Flood prediction endpoint
# --------------------------------------------------

@app.post("/predict")
def predict(data: FloodInput):

    input_data = pd.DataFrame([{
        "Rainfall": data.rainfall,
        "Relative_Humidity": data.relative_humidity,
        "Max_Temp": data.max_temp,
        "Min_Temp": data.min_temp,
        "Cloud_Coverage": data.cloud_coverage,
        "Month": data.month
    }])

    # Keep exact feature order used during training
    input_data = input_data[features]

    flood_probability = float(
        model.predict_proba(input_data)[0][1]
    )

    risk_level = get_risk_level(flood_probability)

    return {
        "floodRisk": risk_level,
        "floodProbability": round(flood_probability, 4),
        "source": "model"
    }