# 🛡️ AI Governance & RBAC Security Suite for Frappe Framework

An enterprise-grade **AI Security, Governance, and DLP Interception Suite** built on Frappe v15. Designed to enforce real-time ISO 42001 AI Risk Management, dynamic Role-Based Access Control (RBAC), and automated Data Loss Prevention (DLP) for LLM prompts (ChatGPT, Claude).

---

## 🚀 Key Features

* **Real-time LLM Prompt Interceptor:** Browser extension (`llm_interceptor_ext`) for ChatGPT and Claude that intercepts inputs at the DOM level before submission.
* **Automated DLP & CNIC Masking:**
  * **CNIC Auto-Masking:** Automatically detects Pakistani CNIC patterns (`35202-*******-9`) and masks them dynamically without breaking workflow.
  * **API Key & Credential Blocking:** Intercepts and blocks prompts containing API keys (`sk-...`), passwords, or bearer tokens with instant UI warning alerts.
* **Interactive AI Security Dashboard:** Dark-themed real-time dashboard displaying:
  * Total Access Requests & ML Anomaly Counters
  * High-Risk Ratio Metrics
  * Live Telemetry & Audit Log Feed (User Email, Event Type, Severity, Masked Details)
  * Quick Approval/Rejection Action Buttons for Pending Requests
* **Machine Learning Risk Engine:** Isolation Forest-based dynamic risk scoring for Access Requests based on role severity, duration, and justification length.
* **Role-Based Access Control (RBAC):** Customized `AI Security Officer` roles with granular DocPerm security policies.

---

## 🛠️ Architecture & Workflow

```text
[ User Prompt (ChatGPT / Claude) ]
               │
               ▼
   [ Browser Interceptor Ext ] ──(Sensitive Data Detected?)
               │                                │
      (CNIC Pattern Found)             (API Key / Password)
               │                                │
               ▼                                ▼
     [ Auto-Mask Text ]                [ Hard Block Input ]
               │                                │
               └───────────────┬────────────────┘
                               │ (HTTP POST Payload)
                               ▼
            [ Frappe Backend Proxy API (/llm_proxy.py) ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ AI Security Audit Log DB ]          [ WebSocket Real-time Alert ]
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
           [ AI Security Intelligence Dashboard UI ]
⚙️ Installation & Deployment
1. Prerequisite Requirements
Frappe Framework v15.x

Python 3.10+ with scikit-learn and numpy

MariaDB v10.6+ or v11.x

Redis Server
2. Install App to Bench
cd ~/frappe-bench
bench get-app [https://github.com/databyhassan/ai_governance_rbac.git](https://github.com/databyhassan/ai_governance_rbac.git)
bench --site test.localhost install-app ai_governance_rbac
bench --site test.localhost migrate
3. Install ML Dependencies
./env/bin/pip install numpy scikit-learn
. Install Browser Extension (Chrome / Edge)
Open Edge or Chrome and navigate to edge://extensions or chrome://extensions.

Enable Developer Mode.

Click Load Unpacked and select the llm_interceptor_ext folder from the repository root or Desktop.
📡 API Endpoints
1. Intercept Prompt API
Endpoint: /api/method/ai_governance_rbac.ai_governance_rbac.llm_proxy.intercept_prompt

Method: POST

Payload:
{
  "user": "officer@example.com",
  "event_type": "CNIC Auto-Masked",
  "severity": "Medium",
  "prompt": "Mera CNIC 35202-*******-9 hai"
}
2. Get Security Metrics API
Endpoint: /api/method/ai_governance_rbac.dashboard_api.get_security_metrics

Method: GET / POST

Response: Returns JSON object containing KPI counts, recent access requests, and recent audit logs.
📂 Repository Structure
ai_governance_rbac/
├── ai_governance_rbac/
│   ├── doctype/
│   │   ├── access_request/        # Access Request Schema & Hooks
│   │   └── ai_security_audit_log/ # Audit Log Schema
│   ├── page/
│   │   └── ai_security_dashboard/ # Dashboard HTML & JS Frontend
│   ├── dashboard_api.py           # Metrics Engine API
│   ├── llm_proxy.py               # Interceptor Proxy API
│   └── risk_engine.py            # ML Isolation Forest Engine
├── llm_interceptor_ext/           # Chrome / Edge Browser Extension
└── README.md                      # Documentation
👤 Author
Developed by Hassan (databyhassan) - Enterprise AI Governance & Security Engineering.
