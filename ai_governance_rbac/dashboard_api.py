import frappe

@frappe.whitelist()
def get_security_metrics():
    try:
        total_requests = frappe.db.count("Access Request") or 0
        high_risk_count = frappe.db.count("Access Request", filters={"risk_score": [">=", 0.80]}) or 0
    except Exception:
        total_requests = 0
        high_risk_count = 0

    high_risk_ratio = f"{(high_risk_count / total_requests * 100):.1f}%" if total_requests > 0 else "0.0%"

    try:
        recent_requests = frappe.get_all(
            "Access Request",
            fields=["name", "user", "risk_score", "status", "creation"],
            order_by="creation desc",
            limit=6,
            ignore_permissions=True
        )
    except Exception:
        recent_requests = []

    try:
        total_audit_events = frappe.db.count("AI Security Audit Log") or 0
        recent_audit_logs = frappe.get_all(
            "AI Security Audit Log",
            fields=["name", "event_type", "severity", "details", "creation"],
            order_by="creation desc",
            limit=6,
            ignore_permissions=True
        )
        # Safe mapping for user_email
        for log in recent_audit_logs:
            log["user_email"] = frappe.db.get_value("AI Security Audit Log", log["name"], "user_email") or "officer@example.com"
    except Exception:
        total_audit_events = 0
        recent_audit_logs = []

    return {
        "kpis": {
            "total_requests": total_requests,
            "high_risk_count": high_risk_count,
            "high_risk_ratio": high_risk_ratio,
            "total_audit_events": total_audit_events
        },
        "recent_requests": recent_requests,
        "recent_audit_logs": recent_audit_logs
    }
