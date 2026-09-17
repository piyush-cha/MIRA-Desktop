import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, UserCheck, RefreshCw, 
  Search, Filter, AlertTriangle, ArrowRight, Eye, Check, Clock
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const ExpertReviewsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getExpertReviews();
      setReviews(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (reviewId: string, action: 'APPROVE' | 'REJECT' | 'REASSIGN') => {
    setActionInProgress(reviewId);
    try {
      await api.expertReviewAction(reviewId, {
        action,
        expert_name: 'Dr. A. P. Sharma',
        notes: `Action ${action} executed from Expert Review queue.`
      });
      // Refresh list
      await fetchReviews();
    } catch (err) {
      alert(`Review action failed: ${getApiErrorMessage(err)}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRisk = filterRisk === 'ALL' || r.risk_level === filterRisk;
    const matchesSearch = 
      r.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.suggested_cnmc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cpse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <AppShell
      currentPage="expert-reviews"
      onNavigate={onNavigate}
      title="Expert Review Queue"
      subtitle="Verification, Human-in-the-Loop Alignment & Critical Candidate Approvals"
    >
      <div className="gov-page-container">
        {/* Top Control Bar */}
        <div className="intel-top-bar">
          <div className="search-box-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Filter by legacy code, description, or CNMC..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="intel-filters">
            <select 
              className="gov-select"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk (&lt; 80% Match)</option>
              <option value="MEDIUM">Medium Risk (80-92%)</option>
              <option value="LOW">Low Risk (&gt; 92%)</option>
            </select>

            <button className="gov-refresh-btn" onClick={fetchReviews} title="Refresh Queue">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="gov-table-card">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Legacy Code & CPSE</th>
                <th>Raw Material Description</th>
                <th>Suggested CNMC Standard</th>
                <th>AI Confidence</th>
                <th>Risk Level</th>
                <th>Assigned Expert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">
                    {loading ? 'Fetching expert reviews from database...' : 'No pending reviews matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.review_id}>
                    <td>
                      <div className="font-mono font-bold text-primary">{r.material_code}</div>
                      <div className="text-xs text-muted">{r.cpse}</div>
                    </td>
                    <td className="max-w-xs">{r.description}</td>
                    <td>
                      <div className="font-mono font-bold text-emerald">{r.suggested_cnmc}</div>
                      <div className="text-xs text-muted">ASME / ISO Aligned</div>
                    </td>
                    <td>
                      <div className="confidence-wrapper">
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ 
                              width: `${(r.confidence_score || 0.85) * 100}%`,
                              backgroundColor: r.confidence_score > 0.9 ? '#10b981' : r.confidence_score > 0.8 ? '#f59e0b' : '#ef4444'
                            }} 
                          />
                        </div>
                        <span className="font-mono text-xs">{((r.confidence_score || 0.85) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${r.risk_level.toLowerCase()}`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="text-sm">
                      {r.assigned_expert || <span className="text-muted italic">Unassigned</span>}
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button 
                          className="action-btn-circle approve"
                          title="Approve Mapping"
                          disabled={actionInProgress === r.review_id}
                          onClick={() => handleAction(r.review_id, 'APPROVE')}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          className="action-btn-circle reject"
                          title="Reject Mapping"
                          disabled={actionInProgress === r.review_id}
                          onClick={() => handleAction(r.review_id, 'REJECT')}
                        >
                          <XCircle size={16} />
                        </button>
                        <button 
                          className="action-btn-circle reassign"
                          title="Reassign to Specialist"
                          disabled={actionInProgress === r.review_id}
                          onClick={() => handleAction(r.review_id, 'REASSIGN')}
                        >
                          <UserCheck size={16} />
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
