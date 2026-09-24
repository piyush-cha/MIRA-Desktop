import React, { useState, useEffect } from 'react';
import { 
  FileText, Shield, Sliders, CheckCircle2, RefreshCw, Save, 
  HelpCircle, AlertCircle, ToggleLeft, ToggleRight, Sparkles, Clock, User
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

const formatTimestamp = (ts?: string) => {
  if (!ts) return 'Never';
  try {
    const cleanTs = ts.includes('T') ? ts : ts.replace(' ', 'T');
    const d = new Date(cleanTs);
    if (isNaN(d.getTime())) return ts;
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const time = d.toTimeString().split(' ')[0];
    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return ts;
  }
};

export const SystemPoliciesPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: string }>({});

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPolicies();
      setPolicies(res.data || []);
      const initial: { [key: string]: string } = {};
      (res.data || []).forEach((p: any) => {
        initial[p.policy_key] = p.policy_value;
      });
      setEditedValues(initial);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleUpdate = async (policyKey: string) => {
    const val = editedValues[policyKey];
    setSaveStatus((prev) => ({ ...prev, [policyKey]: 'saving' }));
    try {
      await api.updatePolicy(policyKey, {
        policy_value: val,
        updated_by: 'National Governance Administrator'
      });
      setSaveStatus((prev) => ({ ...prev, [policyKey]: 'saved' }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [policyKey]: '' }));
      }, 2000);
    } catch (err) {
      alert(`Policy update failed: ${getApiErrorMessage(err)}`);
      setSaveStatus((prev) => ({ ...prev, [policyKey]: 'error' }));
    }
  };

  const handleToggle = (policyKey: string, currentVal: string) => {
    const newVal = currentVal.toLowerCase() === 'true' ? 'false' : 'true';
    setEditedValues((prev) => ({ ...prev, [policyKey]: newVal }));
  };

  return (
    <AppShell
      currentPage="policies"
      onNavigate={onNavigate}
      title="System Governance Policies"
      subtitle="Autonomous Standardization Rules, Zero-Trust Thresholds & Sovereign Privacy Parameters"
    >
      <div className="gov-page-container">
        <div className="intel-top-bar">
          <div className="flex items-center gap-2">
            <Shield size={18} color="#10b981" />
            <span className="font-semibold text-sm">Enterprise Governance & Rule Engine</span>
          </div>

          <button className="gov-refresh-btn" onClick={fetchPolicies} title="Reload Policies">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="policies-grid">
          {policies.map((p) => {
            const currentVal = editedValues[p.policy_key] ?? p.policy_value;
            const isChanged = currentVal !== p.policy_value;
            const status = saveStatus[p.policy_key];

            return (
              <div key={p.policy_key} className="policy-card">
                <div className="policy-card-top">
                  <span className={`policy-category-badge ${(p.category || '').toLowerCase().replace(/_/g, '-')}`}>
                    {p.category}
                  </span>
                  <code className="policy-key-text">{p.policy_key}</code>
                </div>

                <h3 className="policy-title">{p.policy_name}</h3>

                <p className="policy-desc">{p.description}</p>

                <div className="policy-control-row">
                  {p.data_type === 'BOOLEAN' ? (
                    <button 
                      className={`policy-toggle-btn ${currentVal.toLowerCase() === 'true' ? 'enabled' : 'disabled'}`}
                      onClick={() => handleToggle(p.policy_key, currentVal)}
                      type="button"
                    >
                      {currentVal.toLowerCase() === 'true' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      <span>{currentVal.toLowerCase() === 'true' ? 'ENFORCED' : 'DISABLED'}</span>
                    </button>
                  ) : (
                    <div className="policy-input-wrapper">
                      <input 
                        type="text" 
                        className="policy-numeric-input"
                        value={currentVal}
                        onChange={(e) => setEditedValues({ ...editedValues, [p.policy_key]: e.target.value })}
                      />
                    </div>
                  )}

                  <button 
                    className={`policy-save-btn ${isChanged ? 'active' : 'idle'}`}
                    disabled={!isChanged || status === 'saving'}
                    onClick={() => handleUpdate(p.policy_key)}
                    type="button"
                  >
                    {status === 'saving' ? (
                      <RefreshCw size={13} className="spinning" />
                    ) : status === 'saved' ? (
                      <CheckCircle2 size={13} color="#10b981" />
                    ) : (
                      <Save size={13} />
                    )}
                    <span>{status === 'saving' ? 'Applying...' : status === 'saved' ? 'Saved' : 'Save Rule'}</span>
                  </button>
                </div>

                <div className="policy-meta-footer">
                  <div className="policy-meta-row">
                    <span className="meta-label">
                      <User size={11} className="meta-icon" />
                      <span>Updated by</span>
                    </span>
                    <span className="meta-val author" title={p.updated_by}>
                      <b>{p.updated_by || 'System Admin'}</b>
                    </span>
                  </div>

                  <div className="policy-meta-row">
                    <span className="meta-label">
                      <Clock size={11} className="meta-icon" />
                      <span>Last modified</span>
                    </span>
                    <span className="meta-val timestamp" title={p.updated_at}>
                      {formatTimestamp(p.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
