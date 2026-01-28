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
# CONFIGURATION
# ------------------------------------------------

# 1. WINDOWS TESSERACT PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# 2. ROBUST API KEY LOADING
# This specifically looks for the .env file in the root 'med' folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GROQ_API_KEY")

print("--------------------------------------------------")
if api_key:
    print(f"✅ SUCCESS: API Key loaded! Starts with: {api_key[:10]}...")
else:
    print("❌ ERROR: API Key NOT found. Check your .env file location.")
print("--------------------------------------------------")

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
# DATA & PROMPTS
# ------------------------------------------------

doctor_names = [
    "Dr. Anil Sharma", "Dr. Priya Verma", "Dr. Rakesh Kumar", 
    "Dr. Neha Singh", "Dr. Amit Patel"
]

sessions = {}
chat_state = {} 
question_counter = {}

EMERGENCY_CHECK_PROMPT = """
You are a medical safety triage assistant.
Consider severity, duration, danger signs, and wording.
Answer ONLY yes or no.
Does this situation likely need immediate medical attention right now?
"""

FIRST_AID_PROMPT = """
Give calm, clear first-aid steps for this situation.
Rules:
- Use very simple language
- Step-by-step
- No panic
- No diagnosis
- End with EXACTLY ONE important follow-up question
"""

MAIN_PROMPT = """
You are a calm medical assistant.
Rules:
- You are NOT a doctor
- Do NOT diagnose diseases
- Use simple language
- Ask at most ONE question per reply
- Stop asking questions once enough info is known
- If confident, return FINAL JSON ONLY

FINAL JSON FORMAT:
{
  "analysis":"short clear explanation",
  "possible_conditions":["likely category","second category"],
  "severity":"mild | moderate | severe | emergency",
  "first_aid_or_home_remedy":"simple safe advice",
  "recommended_specialist":"doctor type",
  "department":"department",
  "disclaimer":"short disclaimer"
}
"""

PRESCRIPTION_PROMPT = """
You are an expert pharmacist AI. Analyze the extracted prescription text.
The patient has provided their symptoms/condition (if any). Use this to explain the PURPOSE of the medicine accurately.

Return ONLY a raw JSON object:
{
    "medicines": [
        {
            "name": "Medicine Name + Strength",
            "type": "Category (e.g. Antibiotic, Painkiller)",
            "purpose": "Explain why THIS patient is taking it based on their symptoms. Keep it simple (e.g., 'For your throat infection' or 'To control your blood pressure').",
            "standard": "Dosage instructions (e.g. 1 tab twice daily)"
        }
    ]
}
If the text is messy, use medical knowledge to correct spelling.
"""

# ------------------------------------------------
# UTILITIES
# ------------------------------------------------

def clean(text: str):
    return " ".join(text.replace("\n", " ").split())

def extract_json(text):
    try:
        s, e = text.find("{"), text.rfind("}")
        return json.loads(text[s:e+1])
    except:
        return None

def call_llm(messages, max_tokens=250, json_mode=False):
    params = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": 0.1 if json_mode else 0.2,
        "max_tokens": max_tokens
    }
    if json_mode:
        params["response_format"] = {"type": "json_object"}
        
    return llm.chat.completions.create(**params).choices[0].message.content.strip()

# ------------------------------------------------
# LOCATION HELPERS
# ------------------------------------------------

def geocode_address(address):
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": "medical-ai"},
            timeout=10
        ).json()
        if not r: return None
        return float(r[0]["lat"]), float(r[0]["lon"])
    except: return None

def find_nearby_hospital(lat, lon):
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:3000,{lat},{lon});
      node["amenity"="clinic"](around:3000,{lat},{lon});
    );
    out tags center;
    """
    try:
        r = requests.post("https://overpass-api.de/api/interpreter", data=query, timeout=10).json()
        for e in r.get("elements", []):
            tags = e.get("tags", {})
            return {
                "name": tags.get("name", "Nearby Hospital"),
                "address": ", ".join(v for k, v in tags.items() if k.startswith("addr:")) or "Address unavailable",
                "phone": tags.get("phone") or "Check locally",
                "type": tags.get("amenity", "hospital")
            }
    except: pass
    return {"name": "Nearest Hospital", "address": "Check Maps", "phone": "112", "type": "hospital"}

# ------------------------------------------------
# ENDPOINTS
# ------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    address: str | None = None

@app.post("/chat")
def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    sessions.setdefault(sid, [])
    chat_state.setdefault(sid, "chat")
    question_counter.setdefault(sid, 0)

    sessions[sid].append({"role": "user", "content": req.message})
    sessions[sid] = sessions[sid][-6:]

    # Emergency Check
    emergency_check = call_llm([
        {"role": "system", "content": EMERGENCY_CHECK_PROMPT},
        {"role": "user", "content": req.message}
    ], max_tokens=5)

    if "yes" in emergency_check.lower() and chat_state[sid] == "chat":
        chat_state[sid] = "emergency"
        first_aid = call_llm([
            {"role": "system", "content": FIRST_AID_PROMPT},
            {"role": "user", "content": req.message}
        ])
        return {"session_id": sid, "reply": clean(first_aid)}

    # Conversation Limiter
    if chat_state[sid] == "chat":
        question_counter[sid] += 1
        if question_counter[sid] >= 3:
            chat_state[sid] = "final"

    # Main Response
    reply = call_llm([{"role": "system", "content": MAIN_PROMPT}] + sessions[sid])
    data = extract_json(reply)

    if data and chat_state[sid] in ["final", "emergency"]:
        data["doctor_name"] = random.choice(doctor_names)
        data["emergency_number"] = "112"
        
        if req.address:
            coords = geocode_address(req.address)
            data["nearby_hospital"] = find_nearby_hospital(*coords) if coords else {"name": "Nearest Hospital"}
        else:
            data["nearby_hospital"] = {"name": "Nearest Hospital", "address": "Address not provided"}
            
        return JSONResponse({"session_id": sid, "final_analysis": data})

    return {"session_id": sid, "reply": clean(reply)}

@app.post("/analyze")
async def analyze_prescription(
    file: UploadFile = File(...), 
    user_symptoms: str = Form(None)
):
    try:
        # 1. Read Image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # 2. Tesseract OCR
        extracted_text = pytesseract.image_to_string(image)

        # 3. Grok Analysis with Symptoms Context
        context_message = f"Patient Condition/Symptoms: {user_symptoms or 'Unknown'}\n\nPrescription Text:\n{extracted_text}"

        response_text = call_llm([
            {"role": "system", "content": PRESCRIPTION_PROMPT},
            {"role": "user", "content": context_message}
        ], json_mode=True)
        
        structured_data = extract_json(response_text)

        if not structured_data:
            return {"medicines": [{"name": "Error Parsing", "type": "Error", "purpose": "Try clearer image", "standard": "N/A"}]}

        return {
            "id": str(uuid.uuid4()),
            "timestamp": "Today",
            "medicines": structured_data.get("medicines", [])
        }

    except Exception as e:
        print(f"Server Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)