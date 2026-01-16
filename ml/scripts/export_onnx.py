"""
ConvoGuard: Export DistilBERT to ONNX for Fast Inference
Uses HuggingFace optimum for ONNX conversion
"""

import json
from pathlib import Path

# Paths
ML_DIR = Path(__file__).parent.parent
MODEL_DIR = ML_DIR / "models" / "distilbert"
ONNX_DIR = ML_DIR / "models" / "onnx"
ONNX_DIR.mkdir(parents=True, exist_ok=True)

def export_to_onnx():
    """Export trained DistilBERT to ONNX format"""
    try:
        from optimum.onnxruntime import ORTModelForSequenceClassification
        from transformers import DistilBertTokenizer
    except ImportError:
        print("⚠️ optimum not installed. Run:")
        print("   pip install optimum[onnxruntime]")
        return False
    
    print("=" * 60)
    print("ConvoGuard: ONNX Export")
    print("=" * 60)
    
    # Load model and tokenizer
    print("\n[1/3] Loading trained model...")
    tokenizer = DistilBertTokenizer.from_pretrained(str(MODEL_DIR))
    
    # Convert to ONNX
    print("\n[2/3] Converting to ONNX...")
    model = ORTModelForSequenceClassification.from_pretrained(
        str(MODEL_DIR),
        export=True
    )
    
    # Save ONNX model
    print("\n[3/3] Saving ONNX model...")
    model.save_pretrained(str(ONNX_DIR))
    tokenizer.save_pretrained(str(ONNX_DIR))
    
    # Save config
    config = {
        "model_type": "onnx",
        "base_model": "distilbert-base-multilingual-cased",
        "exported_from": str(MODEL_DIR),
        "labels": ["SAFE", "RISKY", "CRISIS"]
    }
    with open(ONNX_DIR / "onnx_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"\n✅ ONNX model saved to: {ONNX_DIR}")
    return True


def test_onnx_inference():
    """Test ONNX inference speed"""
    try:
        from optimum.onnxruntime import ORTModelForSequenceClassification
        from transformers import DistilBertTokenizer
        import time
    except ImportError:
        print("Cannot test - optimum not installed")
        return
    
    print("\n[Test] Loading ONNX model...")
    tokenizer = DistilBertTokenizer.from_pretrained(str(ONNX_DIR))
    model = ORTModelForSequenceClassification.from_pretrained(str(ONNX_DIR))
    
    # Test samples
    samples = [
        "Ich fühle mich heute gut.",
        "Ich habe Suizidgedanken und weiß nicht weiter.",
        "Alles ist hoffnungslos und leer.",
    ]
    
    print("\n[Test] Running inference...")
    for text in samples:
        start = time.perf_counter()
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        outputs = model(**inputs)
        latency = (time.perf_counter() - start) * 1000
        
        pred_idx = outputs.logits.argmax(-1).item()
        labels = ["SAFE", "RISKY", "CRISIS"]
        
        print(f"  '{text[:40]}...' → {labels[pred_idx]} ({latency:.1f}ms)")
    
    print("\n✅ ONNX inference working!")


if __name__ == "__main__":
    if export_to_onnx():
        test_onnx_inference()
