import frappe
import numpy as np
from sklearn.ensemble import IsolationForest

# Train a baseline Isolation Forest model on historical feature vectors
# Features: [Is_System_Manager (0/1), Is_Permanent (0/1), Justification_Length]
baseline_data = np.array([
    [0, 0, 50],   # Normal low-risk access
    [0, 0, 80],   # Normal low-risk access
    [0, 1, 40],   # Standard access
    [0, 0, 120],  # Long justification, low risk
    [1, 1, 10],   # High-risk anomaly (System Manager + Permanent + Short Reason)
    [1, 0, 15]    # High-risk anomaly
])

clf = IsolationForest(n_estimators=50, contamination=0.2, random_state=42)
clf.fit(baseline_data)

def calculate_ml_risk_score(doc):
    """Calculates dynamic risk score using ML Anomaly Score + Rule Engine"""
    is_sys_mgr = 1 if doc.target_role == "System Manager" else 0
    is_perm = 1 if doc.duration_type == "Permanent" else 0
    just_len = len(doc.justification or "")

    # Feature vector for current request
    features = np.array([[is_sys_mgr, is_perm, just_len]])
    
    # Anomaly score from Isolation Forest (-1 = Anomaly/High Risk, 1 = Normal)
    anomaly_score = clf.score_samples(features)[0]
    
    # Normalize ML score to a 0.0 - 1.0 range
    ml_risk = round(float(np.clip(0.5 - anomaly_score, 0.1, 0.99)), 2)

    return ml_risk

def calculate_access_risk(doc, method):
    """DocType Hook for Access Request validate event"""
    doc.risk_score = calculate_ml_risk_score(doc)
