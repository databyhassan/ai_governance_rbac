console.log("AI Governance Complete Interceptor Loaded!");

const cnicRegex = /\b(\d{5})[-–]?\d{7}[-–]?(\d)\b/g;
const apiKeyRegex = /\b(sk-[a-zA-Z0-9]{20,}|api[_-]?key|bearer\s+[a-zA-Z0-9_\-\.]+)\b/i;
const sensitiveWordsRegex = /\b(password|secret_key|private_key|access_token|my_secret_pass)\b/i;

function getLoggedUserEmail() {
    let email = "";
    let profileBtn = document.querySelector('div[data-testid="profile-button"]') || 
                        document.querySelector('button[id^="headlessui-menu-button"]') ||
                        document.querySelector('button[data-testid="user-menu"]');
    if (profileBtn) {
        email = profileBtn.innerText || profileBtn.getAttribute('aria-label') || "";
    }
    let match = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : "officer@example.com";
}

function processAndIntercept(e) {
    let inputElem = document.querySelector('#prompt-textarea') || 
                    document.querySelector('div[contenteditable="true"]') ||
                    document.querySelector('textarea');

    if (!inputElem) return;

    let promptText = inputElem.value || inputElem.innerText || inputElem.textContent || "";
    if (!promptText.trim()) return;

    let userEmail = getLoggedUserEmail();

    // 1. STEP ONE: CNIC AUTOMATIC MASKING FIRST
    cnicRegex.lastIndex = 0;
    if (cnicRegex.test(promptText)) {
        cnicRegex.lastIndex = 0;
        promptText = promptText.replace(cnicRegex, "$1-*******-$2");

        if (inputElem.value !== undefined) {
            inputElem.value = promptText;
        } else {
            inputElem.innerText = promptText;
            inputElem.textContent = promptText;
        }
        inputElem.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("CNIC Auto-Masked:", promptText);
        sendDirectAudit("CNIC Auto-Masked", "Medium", userEmail, `Masked Prompt: ${promptText}`);
    }

    // 2. STEP TWO: CHECK FOR SENSITIVE KEYWORDS / PASSWORDS & BLOCK
    let isApiKey = apiKeyRegex.test(promptText);
    let isSensitive = sensitiveWordsRegex.test(promptText);

    if (isApiKey || isSensitive) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }

        if (inputElem.value !== undefined) inputElem.value = "";
        else inputElem.innerText = "";

        alert(`⚠️ PROMPT BLOCKED BY AI GOVERNANCE!\n\nUser: ${userEmail}\nReason: Detected Password / API Secret Credentials.\n\nYour prompt was BLOCKED.`);

        sendDirectAudit("API Key / Password Blocked", "Critical", userEmail, `[BLOCKED PROMPT] ${promptText}`);
        return false;
    }
}

// Direct HTTP Fetch to Frappe API to guarantee audit count increase
function sendDirectAudit(eventType, severity, userEmail, text) {
    fetch('http://test.localhost:8000/api/method/ai_governance_rbac.ai_governance_rbac.llm_proxy.intercept_prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: userEmail,
            event_type: eventType,
            severity: severity,
            prompt: text
        })
    })
    .then(res => res.json())
    .then(data => console.log("Audit Log Successfully Logged to DB:", data))
    .catch(err => console.error("Audit Direct Post Error:", err));
}

window.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        processAndIntercept(e);
    }
}, true);

window.addEventListener('submit', function(e) {
    processAndIntercept(e);
}, true);
