import beam
from pydantic import BaseModel
from typing import List
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# 1. Define the Beam Image
image = (
    beam.Image()
    .add_python_packages([
        "torch",
        "transformers",
        "safetensors"
    ])
)

# 2. Define Request/Response
class ClassifyRequest(BaseModel):
    text: str

# 3. Define the Global Inference Function
@beam.endpoint(
    name="convoguard-neural-brain",
    cpu=2,
    memory="4Gi",
    image=image,
    keep_warm_seconds=60
)
def classify(request: ClassifyRequest):
    # Load model (cached in the container)
    model_path = "./models/distilbert"
    tokenizer = DistilBertTokenizer.from_pretrained(model_path)
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    
    # Inference
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
        pred_idx = probs.argmax().item()
        
    labels = ["SAFE", "RISKY", "CRISIS"]
    
    return {
        "label": labels[pred_idx],
        "confidence": float(probs[pred_idx]),
        "model": "distilbert-ultra-beam-v2"
    }
