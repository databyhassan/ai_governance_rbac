import frappe
from ai_governance_rbac.dashboard_api import get_security_metrics

def execute(filters=None):
    columns = [
        {"fieldname": "name", "label": "Request ID", "fieldtype": "Data", "width": 160},
        {"fieldname": "applicant", "label": "Applicant Email", "fieldtype": "Data", "width": 220},
        {"fieldname": "target_role", "label": "Target Role", "fieldtype": "Data", "width": 150},
        {"fieldname": "duration_type", "label": "Duration", "fieldtype": "Data", "width": 120},
        {"fieldname": "risk_score", "label": "ML Risk Score", "fieldtype": "Float", "width": 130},
        {"fieldname": "risk_level", "label": "ISO Risk Status", "fieldtype": "Data", "width": 140}
    ]
    
    try:
        metrics = get_security_metrics()
        data = metrics.get("recent_activity", [])
    except Exception as e:
        data = []
    
    return columns, data
