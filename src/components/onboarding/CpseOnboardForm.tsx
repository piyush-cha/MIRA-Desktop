import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  Send,
  ShieldCheck,
  UserCheck,
  Mail,
  Landmark,
  Layers,
  Hash,
  Loader2,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../../api/client';

interface CpseOnboardFormProps {
  onSuccess: (credentials: {
    cpseName: string;
    cpseCode: string;
    username: string;
    temporaryPassword: string;
    adminEmail: string;
    licenseTier: string;
  }) => void;
}

export const CpseOnboardForm: React.FC<CpseOnboardFormProps> = ({ onSuccess }) => {
  const initialFormState = {
    cpseName: '',
    cpseCode: '',
    ministry: 'Ministry of Coal',
    schedule: 'Schedule A',
    category: 'Category A',
    adminName: '',
    adminEmail: '',
    licenseTier: 'Enterprise MIRA Sovereign',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = () => {
    setFormData(initialFormState);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cpseName.trim() || !formData.cpseCode.trim() || !formData.adminEmail.trim()) {
      setErrorMsg('Please complete all mandatory fields marked with an asterisk (*).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.onboardCpse({
        cpse_name: formData.cpseName.trim(),
        cpse_code: formData.cpseCode.trim().toUpperCase(),
        ministry: formData.ministry,
        schedule: formData.schedule,
        admin_name: formData.adminName.trim(),
        admin_email: formData.adminEmail.trim(),
        license_tier: formData.licenseTier,
      });

      onSuccess({
        cpseName: res.cpse_name,
        cpseCode: res.cpse_code,
        username: res.username,
        temporaryPassword: res.temporary_password,
        adminEmail: res.admin_email,
        licenseTier: res.license_tier,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error communicating with backend database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card" style={{ boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.06)' }}>
      {/* Panel Header */}
      <div className="panel-header" style={{ padding: '22px 28px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FCD34D',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)',
              flexShrink: 0,
            }}
          >
            <Building2 size={22} color="#B45309" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
              Onboard New CPSE & Assign MIRA Licence
            </div>
            <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '2px' }}>
              Register enterprise in National Sovereignty Grid and dispatch cryptographic admin credentials
            </div>
          </div>
        </div>
        <span
          className="badge badge-amber"
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            borderRadius: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          SOVEREIGN PROVISIONING
        </span>
      </div>

      <div className="panel-body" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 600 }}>Provisioning Error:</div>
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Enterprise Profile */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="section-step">1</span>
              <span>Enterprise Profile & Administrative Ministry</span>
            </div>

            <div className="form-grid-split">
              <div className="form-group">
                <label className="form-label">
                  <span>
                    CPSE Full Legal Name <span className="req">*</span>
                  </span>
                  <span className="helper">Official enterprise title</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <Building2 size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.cpseName}
                    onChange={(e) => setFormData({ ...formData, cpseName: e.target.value })}
                    placeholder="e.g. Bharat Heavy Electricals Limited"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>
                    CPSE Short Code <span className="req">*</span>
                  </span>
                  <span className="helper">Username prefix</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.cpseCode}
                    onChange={(e) => setFormData({ ...formData, cpseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. BHEL"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <span>Administrative Ministry</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <Landmark size={16} />
                  </span>
                  <select
                    className="form-select"
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                  >
                    <option value="Ministry of Coal">Ministry of Coal</option>
                    <option value="Ministry of Power">Ministry of Power</option>
                    <option value="Ministry of Steel">Ministry of Steel</option>
                    <option value="Ministry of Petroleum & Natural Gas">Ministry of Petroleum & Natural Gas</option>
                    <option value="Ministry of Heavy Industries">Ministry of Heavy Industries</option>
                    <option value="Ministry of Defense">Ministry of Defense</option>
                    <option value="Ministry of Railways">Ministry of Railways</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>CPSE Schedule Classification</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <Layers size={16} />
                  </span>
                  <select
                    className="form-select"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                  >
                    <option value="Schedule A">Schedule A (Maharatna / Top Navratna)</option>
                    <option value="Schedule B">Schedule B (Miniratna Category I)</option>
                    <option value="Schedule C">Schedule C (Miniratna Category II)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Designated Nodal Administrator */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="section-step">2</span>
              <span>Designated CPSE Nodal Administrator</span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <span>
                    Designated Nodal Admin Name <span className="req">*</span>
                  </span>
                  <span className="helper">Director / HoD IT</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <UserCheck size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="e.g. Shri Rajesh Kumar"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>
                    Nodal Admin Official Gov Email <span className="req">*</span>
                  </span>
                  <span className="helper">Credentials dispatch target</span>
                </label>
                <div className="form-input-wrapper">
                  <span className="input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="e.g. director.it@bhel.in"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture Licence Tier */}
          <div className="form-section">
            <div className="form-section-title">
              <span className="section-step">3</span>
              <span>MIRA Architecture Licence Tier & Capabilities</span>
            </div>

            <div className="licence-tier-grid">
              {[
                {
                  id: 'Enterprise MIRA Sovereign',
                  title: 'Enterprise Sovereign',
                  badge: 'FULL AI SUITE',
                  desc: 'Full AI Voice, Category A 24/7 monitoring, unlimited nodes, and forensic audit trails.',
                  features: ['Voice AI Copilot', 'Unlimited Nodes', '24/7 Monitoring'],
                  highlight: true,
                },
                {
                  id: 'Standard MIRA Governance',
                  title: 'Standard Governance',
                  badge: 'CATEGORY B & C',
                  desc: 'Category B & C tracking, standard API endpoints, and scheduled synchronization.',
                  features: ['Standard API', 'Automated Sync', 'Audit Log'],
                  highlight: false,
                },
                {
                  id: 'Basic MIRA Monitoring',
                  title: 'Basic Monitor',
                  badge: 'READ-ONLY',
                  desc: 'Read-only compliance reporting, schedule tracking, and basic audit exports.',
                  features: ['Read-Only Access', 'Schedule Tracking', 'CSV Reports'],
                  highlight: false,
                },
              ].map((tier) => {
                const isSelected = formData.licenseTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setFormData({ ...formData, licenseTier: tier.id })}
                    className={`licence-tier-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="licence-tier-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="licence-tier-title">{tier.title}</span>
                        {tier.highlight && <Sparkles size={14} color="#D97706" />}
                      </div>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #2563EB' : '2px solid #D1D5DB',
                          background: '#FFFFFF',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </div>

                    <div className="licence-tier-desc">{tier.desc}</div>

                    <div className="licence-tier-badges">
                      {tier.features.map((feat) => (
                        <span key={feat} className="licence-pill">
                          {isSelected && <Check size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '12px' }}>
              <ShieldCheck size={16} color="#16A34A" />
              <span>Zero-Trust Protocol: 256-bit cryptographic access token generated on commit</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  borderRadius: '8px',
                }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'linear-gradient(180deg, #18181B 0%, #09090B 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Provisioning CPSE...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Provision CPSE & Commit to DB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
