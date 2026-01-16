"""
ConvoGuard: FastAPI Inference Server
Serves the ONNX DistilBERT model for real ML classification
Deploy to Railway as separate service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import json
from pathlib import Path

# Initialize app
app = FastAPI(
    title="ConvoGuard ML Inference",
    description="Real DistilBERT inference for German crisis detection",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
MODEL_DIR = Path(__file__).parent.parent / "models" / "onnx"

# Label mapping
ID2LABEL = {0: "SAFE", 1: "RISKY", 2: "CRISIS"}
LABEL2ID = {"SAFE": 0, "RISKY": 1, "CRISIS": 2}

# Global model and tokenizer (loaded on startup)
model = None
tokenizer = None


class ClassifyRequest(BaseModel):
    text: str
    

class ClassifyResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict
    latency_ms: float
    model: str = "distilbert-onnx-v1"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str


@app.on_event("startup")
async def load_model():
    """Load ONNX model on startup"""
    global model, tokenizer
    
    try:
        from optimum.onnxruntime import ORTModelForSequenceClassification
        from transformers import DistilBertTokenizer
        import torch
        
        print(f"Loading ONNX model from {MODEL_DIR}...")
        tokenizer = DistilBertTokenizer.from_pretrained(str(MODEL_DIR))
        model = ORTModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
        print("✅ Model loaded successfully!")
        
    except Exception as e:
        print(f"⚠️ Failed to load model: {e}")
        print("Falling back to mock inference")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        version="1.0.0"
    )


@app.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    """Classify text for crisis/risk detection"""
    global model, tokenizer
    
    start_time = time.perf_counter()
    
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        import torch
        
        # Tokenize
        inputs = tokenizer(
            request.text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        )
        
        # Inference
        outputs = model(**inputs)
        
        # Get probabilities
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        pred_idx = probs.argmax().item()
        
        latency_ms = (time.perf_counter() - start_time) * 1000
        
        return ClassifyResponse(
            label=ID2LABEL[pred_idx],
            confidence=round(probs[pred_idx].item(), 4),
            probabilities={
                "SAFE": round(probs[0].item(), 4),
                "RISKY": round(probs[1].item(), 4),
                "CRISIS": round(probs[2].item(), 4)
            },
            latency_ms=round(latency_ms, 2),
            model="distilbert-onnx-v1"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch")
async def batch_classify(texts: List[str]):
    """Batch classification for multiple texts"""
    results = []
    for text in texts[:50]:  # Limit to 50
        req = ClassifyRequest(text=text)
        result = await classify(req)
        results.append(result.dict())
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
