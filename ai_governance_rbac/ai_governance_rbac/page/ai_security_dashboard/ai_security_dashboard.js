frappe.pages['ai_security_dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'AI Security & Governance Dashboard',
        single_column: true
    });

    var $parent = $(page.body);$parent.empty();

    var dashboard_html = `
    <div style="background-color: #0f172a; min-height: 100vh; padding: 30px; color: #f8fafc; font-family: sans-serif; margin: -15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
            <div>
                <h2 style="color: #38bdf8; font-weight: 700; margin: 0; font-size: 1.8rem;">
                    🛡️ AI Governance & Security Intelligence
                </h2>
                <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 0.95rem;">
                    Real-time ISO 42001 Risk Assessment, DLP Interception Telemetry & ML Scoring
                </p>
            </div>
            <button id="btn-refresh-dashboard" class="btn btn-primary" style="background: #0284c7; border: none; padding: 10px 20px; font-weight: 600; border-radius: 8px;">
                🔄 Refresh Telemetry
            </button>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px;">
                    <div style="color: #94a3b8; font-size: 0.75rem; font-weight: 700;">TOTAL ACCESS REQUESTS</div>
                    <div id="kpi-total-req" style="color: #f8fafc; font-size: 2rem; font-weight: 800; margin-top: 8px;">0</div>
                </div>
            </div>
            <div class="col-md-3">
                <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(239, 68, 68, 0.4); padding: 20px; border-radius: 12px;">
                    <div style="color: #f87171; font-size: 0.75rem; font-weight: 700;">CRITICAL ANOMALIES</div>
                    <div id="kpi-critical-req" style="color: #ef4444; font-size: 2rem; font-weight: 800; margin-top: 8px;">0</div>
                </div>
            </div>
            <div class="col-md-3">
                <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(56, 189, 248, 0.4); padding: 20px; border-radius: 12px;">
                    <div style="color: #38bdf8; font-size: 0.75rem; font-weight: 700;">CRITICAL RISK RATIO</div>
                    <div id="kpi-risk-ratio" style="color: #38bdf8; font-size: 2rem; font-weight: 800; margin-top: 8px;">0%</div>
                </div>
            </div>
            <div class="col-md-3">
                <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.4); padding: 20px; border-radius: 12px;">
                    <div style="color: #c084fc; font-size: 0.75rem; font-weight: 700;">AUDIT EVENTS LOGGED</div>
                    <div id="kpi-audit-events" style="color: #c084fc; font-size: 2rem; font-weight: 800; margin-top: 8px;">0</div>
                </div>
            </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px;">
            <h4 style="color: #f8fafc; font-size: 1.1rem; font-weight: 700; margin-bottom: 20px;">Evaluated Access Requests (ML Anomaly Engine)</h4>
            <div class="table-responsive">
                <table class="table" style="color: #cbd5e1; width: 100%;">
                    <thead>
                        <tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th>REQUEST ID</th>
                            <th>APPLICANT</th>
                            <th>TARGET ROLE</th>
                            <th>DURATION</th>
                            <th>ML RISK SCORE</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody id="dash-activity-tbody"></tbody>
                </table>
            </div>
        </div>
    </div>
    `;

    $parent.append(dashboard_html);

    function load_data() {
        frappe.call({
            method: 'ai_governance_rbac.dashboard_api.get_security_metrics',
            callback: function(r) {
                if(r.message) {
                    var d = r.message;
                    $('#kpi-total-req').text(d.kpis.total_requests);
                    $('#kpi-critical-req').text(d.kpis.high_risk_count);
                    $('#kpi-risk-ratio').text(d.kpis.high_risk_ratio);
                    $('#kpi-audit-events').text(d.kpis.total_audit_events);

                    var $tbody =$('#dash-activity-tbody');
                    $tbody.empty();

                    if(d.recent_activity && d.recent_activity.length > 0) {
                        d.recent_activity.forEach(function(row) {
                            var badge = row.risk_level === 'CRITICAL' ? 
                                '<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.75rem;">CRITICAL</span>' :
                                '<span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid #22c55e; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.75rem;">LOW</span>';

                            $tbody.append(`
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="color: #38bdf8; font-weight: 700; padding: 12px;">${row.name}</td>
                                    <td style="padding: 12px;">${row.applicant}</td>
                                    <td style="padding: 12px;">${row.target_role}</td>
                                    <td style="padding: 12px;">${row.duration_type}</td>
                                    <td style="font-weight: 700; padding: 12px;">${row.risk_score}</td>
                                    <td style="padding: 12px;">${badge}</td>
                                </tr>
                            `);
                        });
                    }
                }
            }
        });
    }

    $('#btn-refresh-dashboard').on('click', function() {
        load_data();
        frappe.show_alert({message: __('Telemetry Refreshed!'), indicator: 'green'});
    });

    load_data();
};
