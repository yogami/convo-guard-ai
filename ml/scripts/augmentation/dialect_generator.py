"""
ConvoGuard: Dialect & Slang Augmentation Generator
Generates German dialect variants of crisis templates to improve local ML recall.
Targets: Bavarian (Bayrisch), Saxonian (Sächsisch), Berlin (Berlinerisch), Swiss (Schwiizerdütsch)
"""

import json
from pathlib import Path

# Base high-risk templates (Hochdeutsch)
BASE_TEMPLATES = [
    {"label": "CRISIS", "text": "Ich kann nicht mehr, ich will alles beenden."},
    {"label": "CRISIS", "text": "Ich habe Suizidgedanken und brauche Hilfe."},
    {"label": "CRISIS", "text": "Mir ist alles egal, ich möchte mir wehtun."},
    {"label": "RISKY", "text": "Ich fühle mich so hoffnungslos und leer."},
    {"label": "RISKY", "text": "Keiner versteht mich, es macht keinen Sinn mehr."},
]

# Dialect transformation rules (Simplified mappings for augmentation)
DIALECT_MAPPINGS = {
    "Bayrisch": {
        "Ich": "I",
        "nicht mehr": "nimma",
        "nicht": "ned",
        "möchte": "mog",
        "will": "ui",
        "alles": "ois",
        "beenden": "aufhern",
        "habe": "hob",
        "Hilfe": "Hilf",
        "mir": "mia",
        "egal": "wurscht",
        "wehtun": "wehdoa",
        "fühle": "fui",
        "Keiner": "Keina",
        "versteht": "vasteht",
    },
    "Berlinerisch": {
        "Ich": "Icke",
        "nicht": "nich",
        "beenden": "beenden, wa",
        "egal": "ejaal",
        "habe": "hab",
        "wehtun": "weh tun",
    },
    "Schwiizerdütsch": {
        "Ich": "I",
        "nicht mehr": "nüme",
        "nicht": "nöd",
        "habe": "han",
        "Hilfe": "Hilf",
        "alles": "alles",
        "beenden": "ufhöre",
        "möchte": "möcht",
        "wehtun": "weh tue",
    }
}

def generate_variants():
    augmented_data = []
    
    for template in BASE_TEMPLATES:
        # Add the original
        augmented_data.append(template)
        
        # Add dialect variants
        for dialect, rules in DIALECT_MAPPINGS.items():
            text = template["text"]
            for original, replacement in rules.items():
                text = text.replace(original, replacement)
            
            augmented_data.append({
                "label": template["label"],
                "text": text,
                "metadata": {"dialect": dialect, "original": template["text"]}
            })
            
    return augmented_data

if __name__ == "__main__":
    out_dir = Path(__file__).parent.parent.parent / "data" / "augmented"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    variants = generate_variants()
    
    with open(out_dir / "dialect_variants.json", "w", encoding="utf-8") as f:
        json.dump(variants, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Generated {len(variants)} dialect variants in {out_dir}")
