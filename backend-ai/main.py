from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Models for PRO Validation
class SymptomInput(BaseModel):
    symptoms: str = Field(..., min_length=10, max_length=1000)

class Doctor(BaseModel):
    name: str
    experience: str
    availability: str

class BotResponse(BaseModel):
    probable_condition: str
    confidence_level: str
    specialist_required: str
    medical_disclaimer: str
    doctors_available: list[Doctor]

# 2. The AI Endpoint
@app.post("/api/ai/diagnose", response_model=BotResponse)
async def analyze_health(data: SymptomInput):
    # Simulate API Latency for Realism in Demo
    time.sleep(1)
    
    text = data.symptoms.lower()
    
    # --- PROMPT/LOGIC FOR AI ---
    # In a real PRO app, you pass `text` to LangChain/OpenAI here.
    # For Hackathon reliability, we use a smart conditional tree that never fails.

    if "chest" in text or "heart" in text or "breath" in text:
        return BotResponse(
            probable_condition="Angina or potential Cardiac Event",
            confidence_level="High",
            specialist_required="Cardiologist",
            medical_disclaimer="AI is not a substitute for professional diagnosis. Seek emergency help immediately.",
            doctors_available=[
                Doctor(name="Dr. A. Sharma (Cardio)", experience="15 Yrs", availability="Instant ER"),
                Doctor(name="Dr. M. Reddy (Cardio)", experience="12 Yrs", availability="Today, 4:00 PM")
            ]
        )
        
    elif "stomach" in text or "vomit" in text or "nausea" in text:
        return BotResponse(
            probable_condition="Gastroenteritis or Acid Reflux",
            confidence_level="Medium",
            specialist_required="Gastroenterologist",
            medical_disclaimer="Please consult a doctor for a physical examination.",
            doctors_available=[
                Doctor(name="Dr. P. Kumar (Gastro)", experience="10 Yrs", availability="Today, 6:00 PM")
            ]
        )
        
    else:
        return BotResponse(
            probable_condition="Unspecified Viral Infection / Fatigue",
            confidence_level="Low",
            specialist_required="General Physician",
            medical_disclaimer="Please visit a clinic if symptoms persist for 24 hours.",
            doctors_available=[
                Doctor(name="Dr. S. Nair (GP)", experience="8 Yrs", availability="Available Now")
            ]
        )

# RUN: uvicorn main:app --reload --port 8000
# ... (Keep all your existing code above) ...

# ADD THIS AT THE VERY BOTTOM:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)