chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "send_prompt" && request.prompt) {
        fetch('http://test.localhost:8000/api/method/ai_governance_rbac.ai_governance_rbac.llm_proxy.intercept_prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: request.user || 'officer@example.com',
                event_type: request.event_type || 'DLP Interception',
                severity: request.severity || 'High',
                prompt: request.prompt
            })
        })
        .then(res => res.json())
        .then(data => console.log('Audit Log Saved to Frappe DB:', data))
        .catch(err => console.error('Fetch Error:', err));
    }
});
