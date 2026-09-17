import React, { useState } from 'react';
import { Building2, Sparkles, Send } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    cpseName: '',
    cpseCode: '',
    ministry: 'Ministry of Coal',
    schedule: 'Schedule A',
    category: 'Category A',
    adminName: '',
    adminEmail: '',
    licenseTier: 'Enterprise MIRA Sovereign',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cpseName || !formData.cpseCode || !formData.adminEmail) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.onboardCpse({
        cpse_name: formData.cpseName,
        cpse_code: formData.cpseCode.toUpperCase(),
        ministry: formData.ministry,
        schedule: formData.schedule,
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
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
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--accent-gold)" />
            <span>Onboard New CPSE & Assign MIRA Licence</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Register enterprise in National Sovereignty Grid and dispatch one-time admin credentials
          </div>
        </div>
        <span className="badge badge-amber">SOVEREIGN PROVISIONING</span>
      </div>

      <div className="panel-body">
        {errorMsg && (
          <div style={{ padding: '8px 12px', background: 'rgba(231,76,60,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px', marginBottom: '12px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">CPSE Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.cpseName}
                onChange={(e) => setFormData({ ...formData, cpseName: e.target.value })}
                placeholder="e.g. Bharat Heavy Electricals Limited"
              />
            </div>

            <div className="form-group">
              <label className="form-label">CPSE Short Code *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.cpseCode}
                onChange={(e) => setFormData({ ...formData, cpseCode: e.target.value.toUpperCase() })}
                placeholder="e.g. BHEL"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administrative Ministry</label>
              <select
                className="form-select"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
              >
                <option value="Ministry of Coal">Ministry of Coal</option>
                <option value="Ministry of Power">Ministry of Power</option>
                <option value="Ministry of Steel">Ministry of Steel</option>
                <option value="Ministry of Petroleum">Ministry of Petroleum & Natural Gas</option>
                <option value="Ministry of Heavy Industries">Ministry of Heavy Industries</option>
                <option value="Ministry of Defense">Ministry of Defense</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">CPSE Schedule Classification</label>
              <select
                className="form-select"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              >
                <option value="Schedule A">Schedule A (Maharatna / Top Navratna)</option>
                <option value="Schedule B">Schedule B (Miniratna Category I)</option>
                <option value="Schedule C">Schedule C (Miniratna Category II)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designated CPSE Nodal Admin Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="e.g. Shri Rajesh Kumar"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nodal Admin Official Email *</label>
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

          <div className="form-group">
            <label className="form-label">MIRA Architecture Licence Tier</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { id: 'Enterprise MIRA Sovereign', title: 'Enterprise Sovereign', desc: 'Full AI Voice, Category A 24/7 monitoring, unlimited nodes.' },
                { id: 'Standard MIRA Governance', title: 'Standard Governance', desc: 'Category B & C tracking, standard API endpoints.' },
                { id: 'Basic MIRA Monitoring', title: 'Basic Monitor', desc: 'Read-only compliance reporting & schedule tracking.' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setFormData({ ...formData, licenseTier: tier.id })}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: formData.licenseTier === tier.id ? '2px solid var(--accent-dark)' : '1px solid var(--border-light)',
                    background: formData.licenseTier === tier.id ? 'var(--bg-card-alt)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    {tier.title}
                    {formData.licenseTier === tier.id && <Sparkles size={14} color="var(--accent-gold)" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>
                    {tier.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Send size={14} />
              <span>{loading ? 'Committing to Backend DB...' : 'Provision CPSE & Commit to DB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
