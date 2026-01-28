from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
import os, uuid, json, random, requests, io
from PIL import Image
import pytesseract

# ------------------------------------------------
# CONFIGURATION & API LOADING
# ------------------------------------------------

# 1. Windows Tesseract Path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# 2. Robust .env Loading
# Finds the .env file in the main folder regardless of where the script starts
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")

print("--------------------------------------------------")
if api_key:
    print(f"✅ SUCCESS: API Key loaded! Starts with: {api_key[:10]}...")
else:
    print("❌ ERROR: API Key NOT found. Check your .env file location.")
print("--------------------------------------------------")

# Initialize AI Client
llm = Groq(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------
# SESSION MEMORY
# ------------------------------------------------
sessions = {}
question_counter = {}

# ------------------------------------------------
# REFINED PROMPTS (Smarter Triage & Simple Language)
# ------------------------------------------------

EMERGENCY_CHECK_PROMPT = """
You are a medical safety monitor. You only trigger 'YES' for LIFE-THREATENING symptoms.
RED FLAGS (Answer YES only for these): 
- Chest pain radiating to arm or jaw
- Difficulty breathing or gasping
- Sudden slurred speech or facial drooping
- Heavy, uncontrollable bleeding
- Unresponsiveness
For common issues like headaches, sinus pain, fever, or stomach aches, answer 'NO'.
"""

MAIN_PROMPT = """
You are 'MediSense AI'. Your goal is to identify the user's condition through simple conversation.
RULES:
1. Speak simply. Use very short sentences.
2. Ask exactly ONE clear question at a time. No long paragraphs.
3. Avoid medical jargon. Be 'on-the-point' (e.g., 'Is the pain sharp?' instead of a detailed explanation).
4. After 7-8 turns, or if you are certain, conclude with the FINAL JSON.

JSON FORMAT:
{
  "analysis": "Brief summary.",
  "possible_conditions": ["Condition name"],
  "severity": "Mild | Moderate | Severe",
  "recommended_specialist": "Doctor type",
  "disclaimer": "Not a diagnosis. See a doctor."
}
"""

PRESCRIPTION_PROMPT = """
You are an expert pharmacist AI. Analyze prescription text and return ONLY a JSON object:
{
    "medicines": [
        {"name": "Name", "type": "Category", "purpose": "Simple reason", "standard": "Dosage"}
    ]
}
"""

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    address: str | None = None

# ------------------------------------------------
# UTILITIES
# ------------------------------------------------

def extract_json(text):
    try:
        s, e = text.find("{"), text.rfind("}")
        return json.loads(text[s:e+1])
    except:
        return None

# ------------------------------------------------
# ENDPOINTS
# ------------------------------------------------

@app.post("/chat")
async def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    sessions.setdefault(sid, [])
    question_counter.setdefault(sid, 0)

    try:
        # 1. Smarter Emergency Check (Red Flags Only)
        emergency_eval = llm.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": EMERGENCY_CHECK_PROMPT}, {"role": "user", "content": req.message}],
            max_tokens=5
        ).choices[0].message.content.strip()

        if "YES" in emergency_eval.upper():
            return {
                "session_id": sid,
                "is_emergency": True,
                "reply": "🚨 This appears to be a critical emergency. Please stop this chat and call 112 or visit the nearest ER immediately."
            }

        # 2. Simplified Chat Logic
        sessions[sid].append({"role": "user", "content": req.message})
        
        response = llm.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": MAIN_PROMPT}] + sessions[sid],
            temperature=0.2, # Lower temperature for more direct, less creative answers
            timeout=15.0
        ).choices[0].message.content
        
        data = extract_json(response)
        if data:
            return {"session_id": sid, "final_analysis": data}

        sessions[sid].append({"role": "assistant", "content": response.strip()})
        question_counter[sid] += 1
        
        return {"session_id": sid, "reply": response.strip(), "count": question_counter[sid]}

    except Exception as e:
        print(f"Error: {e}")
        return {"session_id": sid, "reply": "Connection issue. Please try again.", "error": True}

@app.post("/analyze")
async def analyze_prescription(file: UploadFile = File(...), user_symptoms: str = Form(None)):
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        extracted_text = pytesseract.image_to_string(image)
        
        context_message = f"Patient context: {user_symptoms}\n\nPrescription:\n{extracted_text}"
        
        response = llm.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": PRESCRIPTION_PROMPT}, {"role": "user", "content": context_message}],
            response_format={"type": "json_object"}
        ).choices[0].message.content
        
        data = extract_json(response)
        return {"id": str(uuid.uuid4()), "timestamp": "Today", "medicines": data.get("medicines", []) if data else []}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)