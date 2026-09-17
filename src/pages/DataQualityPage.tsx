import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, XCircle, RefreshCw, Search, Filter, 
  Check, ArrowRight, ShieldAlert, FileWarning, Sliders
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const DataQualityPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDataQuality();
      setIssues(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleResolve = async (issueId: string, action: 'RESOLVE' | 'DISMISS') => {
    setActionInProgress(issueId);
    try {
      await api.resolveDataQuality(issueId, {
        action,
        resolution_notes: `Marked as ${action} by National Governance Admin.`
      });
      await fetchIssues();
    } catch (err) {
      alert(`Resolution failed: ${getApiErrorMessage(err)}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredIssues = issues.filter((i) => {
    const matchesSev = severityFilter === 'ALL' || i.severity === severityFilter;
    const matchesSearch = 
      i.affected_cpse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.affected_material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.material_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <AppShell
      currentPage="data-quality"
      onNavigate={onNavigate}
      title="Data Quality & Anomaly Center"
      subtitle="Autonomous Detection of UOM Discrepancies, Price Spreads & Incomplete Specifications"
    >
      <div className="gov-page-container">
        {/* Top Control Bar */}
        <div className="intel-top-bar">
          <div className="search-box-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Search by affected CPSE, material code, or anomaly details..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="intel-filters">
            <select 
              className="gov-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">All Severity Levels</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>

            <button className="gov-refresh-btn" onClick={fetchIssues} title="Refresh Issues">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Anomaly Cards / Table */}
        <div className="gov-table-card">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Anomaly Type</th>
                <th>Affected CPSE</th>
                <th>Material Code & Text</th>
                <th>Severity</th>
                <th>Discrepancy Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    {loading ? 'Scanning connected CPSE ERP records...' : 'No open data quality issues detected! All connected catalogs are healthy.'}
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} color={issue.severity === 'HIGH' ? '#ef4444' : '#f59e0b'} />
                        <span className="font-semibold text-primary">{issue.issue_type}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{issue.affected_cpse}</td>
                    <td>
                      <div className="font-mono text-xs font-bold">{issue.affected_material_code}</div>
                      <div className="text-xs text-muted max-w-xs">{issue.material_description}</div>
                    </td>
                    <td>
                      <span className={`status-pill ${issue.severity.toLowerCase()}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="text-xs leading-relaxed max-w-md text-secondary">
                      {issue.details}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="gov-btn small primary"
                          disabled={actionInProgress === issue.issue_id}
                          onClick={() => handleResolve(issue.issue_id, 'RESOLVE')}
                        >
                          <Check size={13} />
                          <span>Resolve</span>
                        </button>
                        <button 
                          className="gov-btn small secondary"
                          disabled={actionInProgress === issue.issue_id}
                          onClick={() => handleResolve(issue.issue_id, 'DISMISS')}
                        >
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
