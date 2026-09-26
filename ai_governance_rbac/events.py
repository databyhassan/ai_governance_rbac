import frappe
from frappe import _

def check_role_assignment(doc, method):
    """Pre-save validation hook on User document"""
    if doc.is_new():
        return

    old_doc = doc.get_doc_before_save()
    if not old_doc:
        return

    old_roles = set(r.role for r in old_doc.roles)
    new_roles = set(r.role for r in doc.roles)
    added_roles = new_roles - old_roles

    if "System Manager" in added_roles:
        approved = frappe.db.exists(
            "Access Request",
            {
                "applicant": doc.name,
                "target_role": "System Manager",
                "approval_status": "Approved"
            }
        )
        if not approved and frappe.session.user != "Administrator":
            frappe.throw(
                _("Direct System Manager assignment blocked! Approved 'Access Request' required.")
            )

def log_governance_audit(title, message, log_type="Info"):
    """Utility function to record AI Governance security events"""
    frappe.get_doc({
        "doctype": "Activity Log",
        "subject": title,
        "full_name": frappe.session.user,
        "status": log_type,
        "operation": message
    }).insert(ignore_permissions=True)
