frappe.pages['ai_security_dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'AI Security & Risk Intelligence Dashboard',
        single_column: true
    });

    $(frappe.render_template('ai_security_dashboard', {})).appendTo(page.body);

    function load_dashboard_data() {
        frappe.call({
            method: 'ai_governance_rbac.dashboard_api.get_security_metrics',
            callback: function(r) {
                if (r.message) {
                    var data = r.message;
                    $('#total-requests').text(data.kpis.total_requests);
                    $('#high-risk-count').text(data.kpis.high_risk_count);
                    $('#high-risk-ratio').text(data.kpis.high_risk_ratio);
                    $('#total-audit-events').text(data.kpis.total_audit_events);

                    var reqRows = '';
                    (data.recent_requests || []).forEach(function(req) {
                        var status_badge = req.status === 'Approved' ? 'badge-success' : (req.status === 'Rejected' ? 'badge-danger' : 'badge-warning');
                        var action_btns = req.status === 'Pending' ? 
                            `<button class="btn btn-xs btn-success btn-approve" data-name="${req.name}">Approve</button>
                             <button class="btn btn-xs btn-danger btn-reject ml-1" data-name="${req.name}">Reject</button>` : 
                            `<span class="badge ${status_badge}">${req.status}</span>`;

                        reqRows += `<tr>
                            <td><strong>${req.name}</strong></td>
                            <td>${req.user}</td>
                            <td><span class="badge ${req.risk_score >= 0.8 ? 'badge-danger' : (req.risk_score >= 0.4 ? 'badge-warning' : 'badge-info')}">${req.risk_score}</span></td>
                            <td>${action_btns}</td>
                        </tr>`;
                    });
                    $('#recent-requests-table tbody').html(reqRows || '<tr><td colspan="4" class="text-center text-muted">No requests found</td></tr>');

                    var logRows = '';
                    (data.recent_audit_logs || []).forEach(function(log) {
                        var sev_badge = log.severity === 'Critical' || log.severity === 'High' ? 'badge-danger' : (log.severity === 'Medium' ? 'badge-warning' : 'badge-info');
                        logRows += `<tr>
                            <td><strong>${log.name}</strong></td>
                            <td><span class="text-info">${log.user_email || 'officer@example.com'}</span></td>
                            <td><span class="badge badge-secondary">${log.event_type}</span></td>
                            <td><span class="badge ${sev_badge}">${log.severity}</span></td>
                            <td><small style="color:#cbd5e1;">${log.details}</small></td>
                        </tr>`;
                    });
                    $('#recent-audit-logs-table tbody').html(logRows || '<tr><td colspan="5" class="text-center text-muted">No interception audit events logged yet</td></tr>');
                }
            }
        });
    }

    load_dashboard_data();
};
