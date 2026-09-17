import React, { useState, useEffect } from 'react';
import { 
  FileText, Shield, Sliders, CheckCircle2, RefreshCw, Save, 
  HelpCircle, AlertCircle, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

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
                  <div>
                    <span className="policy-category-badge">{p.category}</span>
                    <h3 className="policy-title">{p.policy_name}</h3>
                  </div>
                  <code className="policy-key-text">{p.policy_key}</code>
                </div>

                <p className="policy-desc">{p.description}</p>

                <div className="policy-control-row">
                  {p.data_type === 'BOOLEAN' ? (
                    <button 
                      className={`policy-toggle-btn ${currentVal.toLowerCase() === 'true' ? 'enabled' : 'disabled'}`}
                      onClick={() => handleToggle(p.policy_key, currentVal)}
                    >
                      {currentVal.toLowerCase() === 'true' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      <span>{currentVal.toLowerCase() === 'true' ? 'ENFORCED' : 'DISABLED'}</span>
                    </button>
                  ) : (
                    <div className="policy-input-wrapper">
                      <input 
                        type="text" 
                        className="gov-input font-mono font-bold"
                        value={currentVal}
                        onChange={(e) => setEditedValues({ ...editedValues, [p.policy_key]: e.target.value })}
                      />
                    </div>
                  )}

                  <button 
                    className={`gov-btn primary small ${!isChanged ? 'opacity-50' : ''}`}
                    disabled={!isChanged || status === 'saving'}
                    onClick={() => handleUpdate(p.policy_key)}
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
                  <span>Last updated by: <b>{p.updated_by}</b></span>
                  <span>{p.updated_at}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
