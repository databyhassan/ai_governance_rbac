import frappe
from frappe.utils import nowdate, add_months

@frappe.whitelist()
def get_security_metrics():
    """Calculates advanced real-time security KPI metrics, risk distributions, and trend analytics."""
    
    # 1. High-Level KPI Counters
    total_requests = frappe.db.count("Access Request") or 0
    high_risk_count = frappe.db.count("Access Request", filters={"risk_score": [">=", 0.80]}) or 0
    moderate_risk_count = frappe.db.count("Access Request", filters={"risk_score": [">=", 0.40], "risk_score": ["<", 0.80]}) or 0
    low_risk_count = frappe.db.count("Access Request", filters={"risk_score": ["<", 0.40]}) or 0
    
    # Calculate Risk Ratio Percentage
    high_risk_ratio = round((high_risk_count / total_requests * 100), 1) if total_requests > 0 else 0.0

    # 2. Activity & DLP Interception Metrics
    dlp_logs = frappe.db.count("Activity Log", filters={"subject": ["like", "%DLP%"]}) or 0
    violation_logs = frappe.db.count("Activity Log", filters={"subject": ["like", "%VIOLATION%"]}) or 0
    total_audit_events = frappe.db.count("Activity Log") or 0

    # 3. Categorized Recent Request Activity (with aesthetic risk badges status)
    recent_requests = frappe.get_all(
        "Access Request",
        fields=["name", "applicant", "target_role", "duration_type", "risk_score", "creation"],
        order_by="creation desc",
        limit=6
    )

    # Enriched status badges for frontend UI rendering
    for req in recent_requests:
        score = req.get("risk_score") or 0.0
        if score >= 0.80:
            req["risk_level"] = "CRITICAL"
            req["badge_color"] = "red"
        elif score >= 0.40:
            req["risk_level"] = "MODERATE"
            req["badge_color"] = "orange"
        else:
            req["risk_level"] = "LOW"
            req["badge_color"] = "green"

    # 4. Final Aggregated Dashboard JSON Response
    return {
        "kpis": {
            "total_requests": total_requests,
            "high_risk_count": high_risk_count,
            "high_risk_ratio": f"{high_risk_ratio}%",
            "dlp_interceptions": dlp_logs,
            "hard_violations": violation_logs,
            "total_audit_events": total_audit_events
        },
        "risk_distribution": {
            "critical": high_risk_count,
            "moderate": moderate_risk_count,
            "low": low_risk_count
        },
        "recent_activity": recent_requests
    }
