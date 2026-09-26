import re
import frappe
import spacy

# Load English NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

PATTERNS = {
    "CNIC": r"\b\d{5}-\d{7}-\d{1}\b",
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
    "API_KEY": r"(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['\"]?([a-zA-Z0-9_\-]{16,})['\"]?"
}

def scan_and_mask_text(text):
    if not text or not isinstance(text, str):
        return text, []

    findings = []
    masked_text = text

    # 1. Regex Scanning (CNIC, Keys, Cards)
    for data_type, pattern in PATTERNS.items():
        if re.search(pattern, masked_text):
            findings.append(data_type)
            masked_text = re.sub(pattern, f"[REDACTED_{data_type}]", masked_text)

    # 2. Advanced NLP Entity Recognition (spaCy)
    if nlp:
        doc = nlp(masked_text)
        for ent in doc.ents:
            # Mask Names, Organizations, and Locations
            if ent.label_ in ["PERSON", "ORG", "GPE"]:
                findings.append(f"PII_{ent.label_}")
                masked_text = masked_text.replace(ent.text, f"[REDACTED_{ent.label_}]")

    return masked_text, list(set(findings))

@frappe.whitelist()
def inspect_prompt(prompt_text):
    clean_text, detected_types = scan_and_mask_text(prompt_text)
    return {
        "original_prompt": prompt_text,
        "clean_prompt": clean_text,
        "flagged": len(detected_types) > 0,
        "detected_types": detected_types
    }
