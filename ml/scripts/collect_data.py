"""
ConvoGuard ML: Data Collection Script
Downloads public datasets and prepares training data
"""

import os
import json
from pathlib import Path
from datetime import datetime

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

# Create directories
RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def download_clpsych():
    """
    Download CLPsych 2017 crisis detection dataset
    Note: This requires HuggingFace datasets library
    """
    try:
        from datasets import load_dataset
        
        print("Downloading CLPsych 2017 dataset...")
        # This is a proxy - the actual dataset requires application
        # We'll use a similar public dataset
        dataset = load_dataset("tweet_eval", "emotion", split="train[:2000]")
        
        # Save raw data
        output_file = RAW_DIR / "clpsych_sample.jsonl"
        with open(output_file, "w") as f:
            for item in dataset:
                f.write(json.dumps({"text": item["text"], "label": item["label"]}) + "\n")
        
        print(f"Saved {len(dataset)} samples to {output_file}")
        return len(dataset)
        
    except ImportError:
        print("datasets library not installed. Run: pip install datasets")
        return 0


def download_german_sentiment():
    """
    Download German sentiment dataset for language understanding
    """
    try:
        from datasets import load_dataset
        
        print("Downloading German sentiment dataset...")
        dataset = load_dataset("cardiffnlp/tweet_sentiment_multilingual", "german", split="train[:1000]")
        
        output_file = RAW_DIR / "german_sentiment.jsonl"
        with open(output_file, "w") as f:
            for item in dataset:
                f.write(json.dumps({"text": item["text"], "label": item["label"]}) + "\n")
        
        print(f"Saved {len(dataset)} samples to {output_file}")
        return len(dataset)
        
    except ImportError:
        print("datasets library not installed. Run: pip install datasets")
        return 0


def generate_synthetic_german_therapy():
    """
    Generate synthetic German therapy conversations using templates
    Distribution: 80% safe, 15% risky, 5% crisis
    """
    import random
    
    # Safe templates (80%) - everyday concerns
    safe_templates = [
        "Ich fühle mich heute etwas gestresst wegen der Arbeit.",
        "Manchmal habe ich Schwierigkeiten beim Einschlafen.",
        "Die letzte Woche war anstrengend, aber es geht mir gut.",
        "Ich versuche mehr Sport zu machen für meine Gesundheit.",
        "Meine Beziehung ist stabil, aber wir haben kleine Konflikte.",
        "Ich mache mir Sorgen um meine Prüfungen nächste Woche.",
        "Die Arbeit ist fordernd, aber ich schaffe das.",
        "Ich fühle mich manchmal einsam, aber ich habe Freunde.",
        "Mein Schlaf könnte besser sein, aber es ist okay.",
        "Ich bin nervös wegen dem Vorstellungsgespräch morgen.",
        "Heute war ein anstrengender Tag, aber morgen wird besser.",
        "Ich habe Streit mit meinem Partner gehabt.",
        "Die Kinder machen mir manchmal Sorgen.",
        "Ich würde gerne weniger arbeiten.",
        "Das Wetter beeinflusst meine Stimmung.",
    ]
    
    # Risky templates (15%) - hopelessness, despair
    risky_templates = [
        "Ich fühle mich seit Wochen hoffnungslos und leer.",
        "Nichts macht mir mehr Freude, alles fühlt sich sinnlos an.",
        "Ich habe keine Energie mehr und will nur noch schlafen.",
        "Meine Gedanken sind sehr dunkel in letzter Zeit.",
        "Ich frage mich manchmal, ob es einen Sinn hat weiterzumachen.",
        "Ich fühle mich wie eine Last für alle um mich herum.",
        "Die Traurigkeit geht einfach nicht weg, egal was ich tue.",
        "Ich habe aufgegeben mich um mich selbst zu kümmern.",
        "Ich bin so verzweifelt, dass ich nicht mehr klar denken kann.",
        "Alles ist schwarz, ich sehe kein Licht am Ende.",
    ]
    
    # Crisis templates (5%) - explicit self-harm, suicidal ideation
    crisis_templates = [
        "Ich denke darüber nach mir selbst wehzutun.",
        "Ich habe Suizidgedanken und weiß nicht weiter.",
        "Ich will nicht mehr leben, es ist zu schwer.",
        "Ich habe mir heute selbst Schaden zugefügt.",
        "Ich plane mein Leben zu beenden.",
        "Ich fühle mich so verzweifelt dass ich Selbstverletzung erwäge.",
        "Ich möchte mich umbringen, ich halte das nicht mehr aus.",
        "Ich habe an Selbstmord gedacht.",
        "Ich will sterben, alles ist zu viel.",
        "Ich schneide mich selbst, es hilft mir.",
        "Ich habe Tabletten gesammelt um mein Leben zu beenden.",
        "Ich denke ständig an Suizid.",
        "Ich will mir selbst wehtun.",
        "Ich habe mich selbst verletzt.",
        "Meine Suizidgedanken werden immer stärker.",
    ]
    
    samples = []
    
    # Generate samples (no variation suffix - clean text)
    for _ in range(800):  # 80% safe
        samples.append({
            "text": random.choice(safe_templates),
            "label": "SAFE",
            "severity": 0,
            "source": "synthetic"
        })
    
    for _ in range(150):  # 15% risky
        samples.append({
            "text": random.choice(risky_templates),
            "label": "RISKY",
            "severity": 1,
            "source": "synthetic"
        })
    
    for _ in range(50):  # 5% crisis
        samples.append({
            "text": random.choice(crisis_templates),
            "label": "CRISIS",
            "severity": 2,
            "source": "synthetic"
        })
    
    random.shuffle(samples)
    
    output_file = RAW_DIR / "synthetic_german_therapy.jsonl"
    with open(output_file, "w") as f:
        for sample in samples:
            f.write(json.dumps(sample, ensure_ascii=False) + "\n")
    
    print(f"Generated {len(samples)} synthetic German therapy samples")
    return len(samples)


def create_training_dataset():
    """
    Combine all sources into unified training format
    """
    all_samples = []
    
    # Load synthetic data (primary source for German)
    synthetic_file = RAW_DIR / "synthetic_german_therapy.jsonl"
    if synthetic_file.exists():
        with open(synthetic_file) as f:
            for line in f:
                sample = json.loads(line)
                all_samples.append({
                    "text": sample["text"],
                    "label": sample["label"],
                    "severity": sample.get("severity", 0),
                    "source": "synthetic"
                })
    
    # Create train/val/test splits (70/15/15)
    import random
    random.shuffle(all_samples)
    
    n = len(all_samples)
    train_end = int(n * 0.7)
    val_end = int(n * 0.85)
    
    splits = {
        "train": all_samples[:train_end],
        "val": all_samples[train_end:val_end],
        "test": all_samples[val_end:]
    }
    
    for split_name, split_data in splits.items():
        output_file = PROCESSED_DIR / f"{split_name}.jsonl"
        with open(output_file, "w") as f:
            for sample in split_data:
                f.write(json.dumps(sample, ensure_ascii=False) + "\n")
        print(f"Saved {len(split_data)} samples to {output_file}")
    
    # Create dataset info
    info = {
        "created": datetime.now().isoformat(),
        "total_samples": n,
        "splits": {k: len(v) for k, v in splits.items()},
        "label_distribution": {
            "SAFE": sum(1 for s in all_samples if s["label"] == "SAFE"),
            "RISKY": sum(1 for s in all_samples if s["label"] == "RISKY"),
            "CRISIS": sum(1 for s in all_samples if s["label"] == "CRISIS")
        }
    }
    
    with open(PROCESSED_DIR / "dataset_info.json", "w") as f:
        json.dump(info, f, indent=2)
    
    print(f"\nDataset Summary:")
    print(json.dumps(info, indent=2))
    
    return info


if __name__ == "__main__":
    print("=" * 50)
    print("ConvoGuard ML: Data Collection")
    print("=" * 50)
    
    # Step 1: Generate synthetic German data (no external deps needed)
    print("\n[1/3] Generating synthetic German therapy data...")
    generate_synthetic_german_therapy()
    
    # Step 2: Try to download HuggingFace datasets
    print("\n[2/3] Downloading HuggingFace datasets...")
    try:
        download_clpsych()
        download_german_sentiment()
    except Exception as e:
        print(f"HuggingFace download failed (optional): {e}")
    
    # Step 3: Create training dataset
    print("\n[3/3] Creating unified training dataset...")
    create_training_dataset()
    
    print("\n✅ Data collection complete!")
