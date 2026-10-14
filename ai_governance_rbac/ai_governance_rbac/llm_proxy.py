import frappe

@frappe.whitelist(allow_guest=True)
def intercept_prompt():
    frappe.response["headers"] = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    if frappe.request.method == "OPTIONS":
        return "OK"

    try:
        data = frappe.request.get_json() or {}
        prompt_text = data.get("prompt", "Test Prompt")
        user_email = data.get("user", "officer@example.com")
        event_type = data.get("event_type", "DLP Interception")
        severity = data.get("severity", "High")

        log = frappe.get_doc({
            "doctype": "AI Security Audit Log",
            "event_type": event_type,
            "severity": severity,
            "user_email": user_email,
            "details": prompt_text
        })
        log.insert(ignore_permissions=True)
        frappe.db.commit()

        return {
            "status": "Success",
            "message": "Audit Log Created",
            "event_id": log.name
        }
    except Exception as e:
        frappe.log_error(f"LLM Proxy Error: {str(e)}")
        return {"status": "Error", "message": str(e)}
