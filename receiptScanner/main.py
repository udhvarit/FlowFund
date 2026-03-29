# main.py
import pytesseract
import requests
import json
import shutil
import uuid
from fastapi import FastAPI, UploadFile, HTTPException
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

SYSTEM_PROMPT = """You are a receipt parser. Given raw OCR text from a receipt,
extract structured data and return ONLY valid JSON matching this schema exactly:
{
  "merchant": string,
  "date": string,
  "items": [{"name": string, "quantity": number, "price": number}],
  "subtotal": number,
  "tax": number,
  "total": number
}
If a field is missing or unclear, use null. Return ONLY the JSON object, no explanation, no markdown."""

app = FastAPI()

def extract_text(image_path: str) -> str:
    img = Image.open(image_path)
    return pytesseract.image_to_string(img, config="--psm 6 --oem 3").strip()

def parse_with_llm(raw_text: str, model: str = "qwen2.5:7b") -> dict:
    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": model,
            "stream": False,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Parse this receipt:\n\n{raw_text}"}
            ]
        }
    )
    content = response.json()["message"]["content"]
    clean = content.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

@app.post("/scan")
async def scan_receipt(file: UploadFile):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    tmp_path = f"C:\\Temp\\{uuid.uuid4()}.jpg"
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    try:
        raw = extract_text(tmp_path)
        result = parse_with_llm(raw)
        return {"raw_ocr": raw, "parsed": result}
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON")
    finally:
        import os
        os.remove(tmp_path)
