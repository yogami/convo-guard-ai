"""
ConvoGuard: Real DistilBERT Fine-Tuning
Fine-tunes distilbert-base-multilingual-cased for German crisis detection
"""

import json
import os
from pathlib import Path
from datetime import datetime

# Check for required libraries
try:
    import torch
    from transformers import (
        DistilBertTokenizer,
        DistilBertForSequenceClassification,
        TrainingArguments,
        Trainer,
        EarlyStoppingCallback
    )
    from datasets import Dataset
    import numpy as np
    from sklearn.metrics import precision_recall_fscore_support, accuracy_score
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    print("⚠️ transformers/torch not installed. Run:")
    print("   pip install transformers torch datasets scikit-learn")

# Paths
ML_DIR = Path(__file__).parent.parent
DATA_DIR = ML_DIR / "data" / "processed"
ADVANCED_DIR = ML_DIR / "data" / "advanced"
MODEL_DIR = ML_DIR / "models" / "distilbert"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Label mapping
LABEL2ID = {"SAFE": 0, "RISKY": 1, "CRISIS": 2}
ID2LABEL = {v: k for k, v in LABEL2ID.items()}


def load_training_data():
    """Load and combine all training data"""
    all_data = []
    
    # Load processed data
    for split in ["train", "val", "test"]:
        file_path = DATA_DIR / f"{split}.jsonl"
        if file_path.exists():
            with open(file_path) as f:
                for line in f:
                    item = json.loads(line)
                    all_data.append({
                        "text": item["text"],
                        "label": LABEL2ID[item["label"]],
                        "split": split
                    })
    
    # Load therapy arcs flattened
    arcs_file = ADVANCED_DIR / "therapy_arcs_flat.jsonl"
    if arcs_file.exists():
        with open(arcs_file) as f:
            arc_samples = [json.loads(line) for line in f]
            # Sample to avoid overwhelming training
            import random
            random.seed(42)
            arc_samples = random.sample(arc_samples, min(500, len(arc_samples)))
            for item in arc_samples:
                all_data.append({
                    "text": item["text"],
                    "label": LABEL2ID[item["label"]],
                    "split": "train"  # Add arcs to training
                })
    
    return all_data


def compute_metrics(eval_pred):
    """Compute metrics for evaluation"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average=None, labels=[0, 1, 2]
    )
    accuracy = accuracy_score(labels, predictions)
    
    # Crisis class metrics (most important)
    crisis_idx = LABEL2ID["CRISIS"]
    
    return {
        "accuracy": accuracy,
        "crisis_recall": recall[crisis_idx],
        "crisis_precision": precision[crisis_idx],
        "crisis_f1": f1[crisis_idx],
        "risky_recall": recall[LABEL2ID["RISKY"]],
        "macro_f1": f1.mean()
    }


def train_distilbert():
    """Main training function"""
    if not HAS_TRANSFORMERS:
        print("Cannot train without transformers. Generating training script instead...")
        generate_colab_notebook()
        return None
    
    print("=" * 60)
    print("ConvoGuard: DistilBERT Fine-Tuning")
    print("=" * 60)
    
    # Load data
    print("\n[1/5] Loading training data...")
    all_data = load_training_data()
    
    train_data = [d for d in all_data if d["split"] == "train"]
    val_data = [d for d in all_data if d["split"] == "val"]
    test_data = [d for d in all_data if d["split"] == "test"]
    
    print(f"  Train: {len(train_data)}")
    print(f"  Val: {len(val_data)}")
    print(f"  Test: {len(test_data)}")
    
    # Load tokenizer and model
    print("\n[2/5] Loading DistilBERT multilingual...")
    model_name = "distilbert-base-multilingual-cased"
    tokenizer = DistilBertTokenizer.from_pretrained(model_name)
    model = DistilBertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=3,
        id2label=ID2LABEL,
        label2id=LABEL2ID
    )
    
    # Tokenize
    print("\n[3/5] Tokenizing...")
    def tokenize(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=128
        )
    
    train_dataset = Dataset.from_list(train_data)
    val_dataset = Dataset.from_list(val_data)
    test_dataset = Dataset.from_list(test_data)
    
    train_dataset = train_dataset.map(tokenize, batched=True)
    val_dataset = val_dataset.map(tokenize, batched=True)
    test_dataset = test_dataset.map(tokenize, batched=True)
    
    # Training arguments
    print("\n[4/5] Training...")
    training_args = TrainingArguments(
        output_dir=str(MODEL_DIR / "checkpoints"),
        num_train_epochs=5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir=str(MODEL_DIR / "logs"),
        logging_steps=50,
        eval_strategy="steps",
        eval_steps=100,
        save_strategy="steps",
        save_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="crisis_recall",
        greater_is_better=True,
        report_to="none"
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    
    # Train
    trainer.train()
    
    # Evaluate on test
    print("\n[5/5] Evaluating on test set...")
    test_results = trainer.evaluate(test_dataset)
    
    print("\n" + "=" * 40)
    print("FINAL TEST RESULTS")
    print("=" * 40)
    print(f"Accuracy: {test_results['eval_accuracy']:.1%}")
    print(f"Crisis Recall: {test_results['eval_crisis_recall']:.1%}")
    print(f"Crisis Precision: {test_results['eval_crisis_precision']:.1%}")
    print(f"Crisis F1: {test_results['eval_crisis_f1']:.1%}")
    
    # Save model
    print(f"\nSaving model to {MODEL_DIR}...")
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    
    # Save results
    results = {
        "model": model_name,
        "trained_at": datetime.now().isoformat(),
        "train_samples": len(train_data),
        "test_results": {
            "accuracy": round(test_results['eval_accuracy'] * 100, 1),
            "crisis_recall": round(test_results['eval_crisis_recall'] * 100, 1),
            "crisis_precision": round(test_results['eval_crisis_precision'] * 100, 1),
            "crisis_f1": round(test_results['eval_crisis_f1'] * 100, 1)
        }
    }
    
    with open(MODEL_DIR / "training_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\n✅ Training complete!")
    return results


def generate_colab_notebook():
    """Generate a Colab notebook for training when local GPU not available"""
    notebook = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": ["# ConvoGuard: DistilBERT Fine-Tuning\n", "Run in Google Colab with GPU"]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "!pip install transformers datasets torch scikit-learn -q\n",
                    "from transformers import DistilBertTokenizer, DistilBertForSequenceClassification\n",
                    "from transformers import TrainingArguments, Trainer\n",
                    "from datasets import Dataset\n",
                    "import json"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Upload your training data (train.jsonl, val.jsonl, test.jsonl)\n",
                    "from google.colab import files\n",
                    "uploaded = files.upload()"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Load data\n",
                    "LABEL2ID = {'SAFE': 0, 'RISKY': 1, 'CRISIS': 2}\n",
                    "train_data = []\n",
                    "with open('train.jsonl') as f:\n",
                    "    for line in f:\n",
                    "        item = json.loads(line)\n",
                    "        train_data.append({'text': item['text'], 'label': LABEL2ID[item['label']]})"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Train\n",
                    "model_name = 'distilbert-base-multilingual-cased'\n",
                    "tokenizer = DistilBertTokenizer.from_pretrained(model_name)\n",
                    "model = DistilBertForSequenceClassification.from_pretrained(model_name, num_labels=3)\n",
                    "# ... training code here"
                ]
            }
        ],
        "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    notebook_path = MODEL_DIR / "train_distilbert.ipynb"
    with open(notebook_path, "w") as f:
        json.dump(notebook, f, indent=2)
    
    print(f"\n📓 Colab notebook saved to: {notebook_path}")
    print("Upload to Google Colab and run with GPU runtime")


if __name__ == "__main__":
    train_distilbert()
