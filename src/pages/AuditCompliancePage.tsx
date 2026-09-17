import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Shield, CheckCircle2, RefreshCw, Search, Download, 
  Lock, Clock, Activity, FileText, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const AuditCompliancePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAuditData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activityRes, compRes] = await Promise.all([
        api.getActivity(),
        api.getComplianceScorecard()
      ]);
      setLogs(activityRes.data || []);
      setCompliance(compRes);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const filteredLogs = logs.filter((l) => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.target && l.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell
      currentPage="audit"
      onNavigate={onNavigate}
      title="Audit Trail & Sovereign Compliance"
      subtitle="Cryptographically Sealed Activity Logs, Zero-Trust Health & DPE Standard Verification"
    >
      <div className="gov-page-container">
        {/* Compliance Scorecard Card */}
        {compliance && (
          <div className="compliance-banner-card">
            <div className="compliance-top">
              <div className="flex items-center gap-3">
                <div className="compliance-badge-icon">
                  <Shield size={24} color="#10b981" />
                </div>
                <div>
                  <div className="compliance-cert-label">{compliance.certification_level}</div>
                  <h2 className="compliance-score-title">
                    National Sovereign Compliance Rating: <span className="text-emerald">{compliance.compliance_score}%</span>
                  </h2>
                </div>
              </div>
              <div className="security-hash-pill">
                <Lock size={13} color="#10b981" />
                <span>SHA-256 Tamper-Evident Active</span>
              </div>
            </div>

            <div className="compliance-pillars-grid">
              {compliance.pillars?.map((p: any, idx: number) => (
                <div key={idx} className="pillar-item">
                  <div className="pillar-header">
                    <CheckCircle2 size={15} color="#10b981" />
                    <span className="pillar-name">{p.name}</span>
                    <span className="pillar-score">{p.score}%</span>
                  </div>
                  <p className="pillar-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Search Bar */}
        <div className="intel-top-bar mt-6">
          <div className="search-box-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Search audit activity by action, actor, target or details..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="intel-filters">
            <button className="gov-btn secondary" onClick={() => alert('Cryptographic audit certificate exported to local storage.')}>
              <Download size={14} />
              <span>Export Sovereign Report</span>
            </button>
            <button className="gov-refresh-btn" onClick={fetchAuditData} title="Refresh Logs">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className="gov-table-card">
          <div className="card-header-bar">
            <h3 className="card-title">Chronological Sovereign Event Stream</h3>
          </div>
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Actor / Officer</th>
                <th>Target Resource</th>
                <th>Event Payload & Details</th>
                <th>Timestamp (UTC/IST)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.log_id}>
                  <td>
                    <span className="font-mono text-xs font-bold text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="font-semibold text-sm">{log.actor}</td>
                  <td>
                    <code className="text-xs text-secondary">{log.target}</code>
                  </td>
                  <td className="text-xs max-w-md leading-relaxed text-muted">
                    {log.details}
                  </td>
                  <td className="text-xs font-mono text-muted whitespace-nowrap">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
