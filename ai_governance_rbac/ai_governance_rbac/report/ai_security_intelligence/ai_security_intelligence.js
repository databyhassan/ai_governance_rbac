frappe.query_reports["AI Security Intelligence"] = {
    "filters": [],
    "onload": function(report) {
        frappe.call({
            method: 'ai_governance_rbac.dashboard_api.get_security_metrics',
            callback: function(r) {
                if (r.message) {
                    var data = r.message;
                    var html = `
                    <div id="ai-custom-dashboard" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: #f8fafc; font-family: sans-serif;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                          <h3 style="font-weight: 700; color: #38bdf8; margin: 0;">🛡️ AI Security & Risk Intelligence Dashboard</h3>
                          <p style="color: #94a3b8; margin-top: 4px; font-size: 0.85rem;">Real-time ISO 42001 Assessment, DLP Interception & ML Anomaly Scoring</p>
                        </div>
                      </div>

                      <div style="display: flex; gap: 15px;">
                        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; flex: 1;">
                          <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;">TOTAL REQUESTS</div>
                          <div style="font-size: 1.6rem; font-weight: 700; color: #f8fafc; margin-top: 4px;">${data.kpis.total_requests}</div>
                        </div>
                        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 15px; flex: 1;">
                          <div style="font-size: 0.75rem; color: #f87171; font-weight: 600;">CRITICAL ANOMALIES</div>
                          <div style="font-size: 1.6rem; font-weight: 700; color: #ef4444; margin-top: 4px;">${data.kpis.high_risk_count}</div>
                        </div>
                        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 15px; flex: 1;">
                          <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 600;">HIGH RISK RATIO</div>
                          <div style="font-size: 1.6rem; font-weight: 700; color: #38bdf8; margin-top: 4px;">${data.kpis.high_risk_ratio}</div>
                        </div>
                        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 15px; flex: 1;">
                          <div style="font-size: 0.75rem; color: #c084fc; font-weight: 600;">AUDIT EVENTS</div>
                          <div style="font-size: 1.6rem; font-weight: 700; color: #c084fc; margin-top: 4px;">${data.kpis.total_audit_events}</div>
                        </div>
                      </div>
                    </div>
                    `;
                    
                    // Prevent duplicate injection
                    report.page.main.find('#ai-custom-dashboard').remove();
                    report.page.main.find('.report-wrapper').before(html);
                }
            }
        });
    }
};
