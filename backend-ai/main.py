from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv 
from pathlib import Path       
import os, uuid, json, random, requests, io, shutil
from PIL import Image
import pytesseract

# ------------------------------------------------
# CONFIGURATION
# ------------------------------------------------

# 1. ROBUST TESSERACT SETUP
def find_tesseract_binary():
    path_in_env = shutil.which("tesseract")
    if path_in_env: return path_in_env
    common_paths = [
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        "/usr/bin/tesseract"
    ]
    for p in common_paths:
        if os.path.exists(p): return p
    return None

tesseract_cmd = find_tesseract_binary()
if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    print(f"✅ SUCCESS: Tesseract found at: {tesseract_cmd}")
else:
    print("⚠️ WARNING: Tesseract NOT found. OCR will fail.")

# 2. SECURE API KEY LOADING (FROM .ENV)
# We look in the current folder AND the parent folder
env_locations = [
    Path(__file__).resolve().parent / ".env",
    Path(__file__).resolve().parent.parent / ".env"
]

api_key = None
for env_path in env_locations:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            print(f"✅ SUCCESS: API Key loaded securely from .env")
            break

if not api_key:
    print("❌ ERROR: API Key NOT found. Make sure you have a .env file with GROQ_API_KEY=...")

# Initialize Client
try:
    llm = Groq(api_key=api_key)
except Exception as e:
    print(f"❌ GROQ CLIENT ERROR: {e}")
    llm = None

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

doctor_names = ["Dr. Anil Sharma", "Dr. Priya Verma", "Dr. Rakesh Kumar"]
sessions = {}
chat_state = {} 

EMERGENCY_CHECK_PROMPT = """
You are a medical safety triage assistant.
Answer ONLY yes or no.
Does this situation likely need immediate medical attention right now?
"""

FIRST_AID_PROMPT = """
Give calm, clear first-aid steps. Use simple language. No diagnosis.
"""

MAIN_PROMPT = """
You are a calm medical assistant.
If confident, return FINAL JSON ONLY.
FINAL JSON FORMAT:
{
  "analysis":"short clear explanation",
  "possible_conditions":["likely category"],
  "severity":"mild | moderate | severe | emergency",
  "first_aid_or_home_remedy":"simple safe advice",
  "recommended_specialist":"doctor type",
  "department":"department",
  "disclaimer":"short disclaimer"
}
"""

PRESCRIPTION_PROMPT = """
You are an expert pharmacist AI. Analyze the extracted prescription text.
Return ONLY a raw JSON object:
{
    "medicines": [
        {
            "name": "Medicine Name + Strength",
            "type": "Category",
            "purpose": "Explain why THIS patient is taking it based on symptoms.",
            "standard": "Dosage instructions"
        }
    ]
}
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
    if not llm: return '{"error": "API Key missing"}'
    params = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": 0.1 if json_mode else 0.2,
        "max_tokens": max_tokens
    }
    if json_mode: params["response_format"] = {"type": "json_object"}
    return llm.chat.completions.create(**params).choices[0].message.content.strip()

# ------------------------------------------------
# ENDPOINTS
# ------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    address: str | None = None

@app.get("/")
def home():
    return {"status": "Backend AI is running!"}

@app.post("/chat")
def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    sessions.setdefault(sid, [])
    chat_state.setdefault(sid, "chat")

    sessions[sid].append({"role": "user", "content": req.message})
    
    # Emergency check
    check = call_llm([{"role": "system", "content": EMERGENCY_CHECK_PROMPT}, {"role": "user", "content": req.message}], max_tokens=5)
    if "yes" in check.lower() and chat_state[sid] == "chat":
        chat_state[sid] = "emergency"
        aid = call_llm([{"role": "system", "content": FIRST_AID_PROMPT}, {"role": "user", "content": req.message}])
        return {"session_id": sid, "reply": clean(aid)}

    # Main Chat
    reply = call_llm([{"role": "system", "content": MAIN_PROMPT}] + sessions[sid])
    data = extract_json(reply)

    if data:
        data["doctor_name"] = random.choice(doctor_names)
        data["nearby_hospital"] = {"name": "Nearest Hospital", "address": "Check Maps"}
        return JSONResponse({"session_id": sid, "final_analysis": data})

    return {"session_id": sid, "reply": clean(reply)}

@app.post("/analyze")
async def analyze_prescription(file: UploadFile = File(...), user_symptoms: str = Form(None)):
    try:
        if not tesseract_cmd: raise RuntimeError("Tesseract not configured")
        
        img = Image.open(io.BytesIO(await file.read()))
        text = pytesseract.image_to_string(img)
        print(f"✅ OCR: {text[:30]}...")

        resp = call_llm([
            {"role": "system", "content": PRESCRIPTION_PROMPT},
            {"role": "user", "content": f"Symptoms: {user_symptoms}\nRx: {text}"}
        ], json_mode=True)
        
        data = extract_json(resp) or {"medicines": []}
        return {"id": str(uuid.uuid4()), "medicines": data.get("medicines", [])}

    except Exception as e:
        print(f"❌ Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)