import React, { useState } from 'react';
import { UserCircle, Lock, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';
import { api } from '../api/client';
import { MiraLogoBadge } from '../components/common/MiraLogoBadge';

interface LoginPageProps {
  onSuccessLogin: (role: UserRole) => void;
}

/* ─── Role Options (Separate Portals) ─────────── */
const ROLE_OPTIONS: { code: UserRole; label: string; color: string }[] = [
  { code: 'NATIONAL_GOVERNANCE', label: 'Governance Admin', color: '#6366F1' },
  { code: 'CPSE_ADMIN', label: 'CPSE Admin', color: '#10B981' },
  { code: 'EXPERT_REVIEWER', label: 'CNMC Expert / Reviewer', color: '#38BDF8' },
  { code: 'PLANT_USER', label: 'Plant / Area Portal', color: '#F59E0B' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useAuthStore();
  const [username, setUsername] = useState('national.admin');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState<UserRole>('NATIONAL_GOVERNANCE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedRole = ROLE_OPTIONS.find(r => r.code === role) || ROLE_OPTIONS[0];

  const selectPreset = (userRole: UserRole, userUname: string) => {
    setRole(userRole);
    setUsername(userUname);
    setPassword('Password@123');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter your User ID'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');

    try {
      const authRes = await api.login(username.trim(), password);
      
      const mappedRole: UserRole = (authRes.role_code as UserRole) || role;
      
      const cpseNameMap: Record<string, string> = {
        COALINDIA: 'Coal India Limited',
        BHEL: 'Bharat Heavy Electricals Limited',
        ONGC: 'Oil & Natural Gas Corporation',
        SAIL: 'Steel Authority of India Limited',
        NTPC: 'NTPC Limited',
        IOCL: 'Indian Oil Corporation',
      };
      const resolvedCpseCode = authRes.cpse_code || (mappedRole === 'CPSE_ADMIN' ? 'COALINDIA' : null);
      const resolvedCpseName = resolvedCpseCode ? (cpseNameMap[resolvedCpseCode] || authRes.cpse_name || resolvedCpseCode) : null;

      login(authRes.access_token, {
        id: authRes.user_id,
        username: authRes.username,
        fullName: authRes.full_name,
        roleCode: mappedRole,
        cpseId: authRes.cpse_id,
        cpseCode: resolvedCpseCode,
        cpseName: resolvedCpseName,
        plantUnitId: authRes.plant_unit_id,
        email: `${authRes.username}@cpse.gov.in`,
      });

      onSuccessLogin(mappedRole);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach backend server. Ensure the API is running on port 8000.');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your User ID and password.');
      } else {
        setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '20px' }}>
      <div className="panel-card" style={{ width: '460px', padding: '34px 30px', alignItems: 'center', maxHeight: '95vh', overflowY: 'auto' }}>
        {/* Official MIRA Logo Badge */}
        <div style={{ marginBottom: '16px' }}>
          <MiraLogoBadge size={56} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px', color: '#0F172A' }}>
          MIRA Sovereign Grid
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '22px', textAlign: 'center' }}>
          National Material Governance, AI Refinement & CPSE Portal
        </p>

        {/* ─── Role Selector Dropdown ─── */}
        <div style={{ width: '100%', marginBottom: '18px', position: 'relative' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block', letterSpacing: '0.5px' }}>
            SELECT PORTAL
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: '#F8FAFC',
              border: `1.5px solid ${selectedRole.color}40`,
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: selectedRole.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedRole.color }} />
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              {selectedRole.label}
            </span>
            <ChevronDown size={15} color="#94A3B8" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              marginTop: '4px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}>
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => { setRole(opt.code); setDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px',
                    background: opt.code === role ? opt.color + '0A' : 'transparent',
                    border: 'none', borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = opt.color + '0A'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = opt.code === role ? opt.color + '0A' : 'transparent'; }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    background: opt.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />
                  </div>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {opt.label}
                  </span>
                  {opt.code === role && (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Demo Login Presets */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Demo Login:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {role === 'NATIONAL_GOVERNANCE' ? (
              <>
                <button
                  type="button"
                  onClick={() => selectPreset('NATIONAL_GOVERNANCE', 'national.admin')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: username === 'national.admin' ? '1px solid #2563EB' : '1px solid var(--border-light)',
                    background: username === 'national.admin' ? '#EFF6FF' : 'var(--bg-card-alt)',
                    color: username === 'national.admin' ? '#2563EB' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  national.admin (DPE)
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('NATIONAL_GOVERNANCE', 'sharma.ap')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: username === 'sharma.ap' ? '1px solid #2563EB' : '1px solid var(--border-light)',
                    background: username === 'sharma.ap' ? '#EFF6FF' : 'var(--bg-card-alt)',
                    color: username === 'sharma.ap' ? '#2563EB' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  sharma.ap (DG, DPE)
                </button>
              </>
            ) : role === 'EXPERT_REVIEWER' ? (
              <>
                <button
                  type="button"
                  onClick={() => selectPreset('EXPERT_REVIEWER', 'expert.cnmc')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: username === 'expert.cnmc' ? '1px solid #2563EB' : '1px solid var(--border-light)',
                    background: username === 'expert.cnmc' ? '#EFF6FF' : 'var(--bg-card-alt)',
                    color: username === 'expert.cnmc' ? '#2563EB' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  expert.cnmc (Standardizer)
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('EXPERT_REVIEWER', 'dr.reviewer')}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: username === 'dr.reviewer' ? '1px solid #2563EB' : '1px solid var(--border-light)',
                    background: username === 'dr.reviewer' ? '#EFF6FF' : 'var(--bg-card-alt)',
                    color: username === 'dr.reviewer' ? '#2563EB' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  dr.reviewer (Metallurgy Lead)
                </button>
              </>
            ) : role === 'PLANT_USER' ? (
              <>
                {[
                  { uname: 'gevra.plant', label: 'Gevra Mega Mine (SECL)' },
                  { uname: 'korba.area', label: 'Korba Area HQ (SECL)' },
                  { uname: 'haridwar.plant', label: 'HEEP Haridwar (BHEL)' },
                ].map((item) => (
                  <button
                    key={item.uname}
                    type="button"
                    onClick={() => selectPreset('PLANT_USER', item.uname)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: username === item.uname ? '1px solid #2563EB' : '1px solid var(--border-light)',
                      background: username === item.uname ? '#EFF6FF' : 'var(--bg-card-alt)',
                      color: username === item.uname ? '#2563EB' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { code: 'COALINDIA', uname: 'coalindia.admin', label: 'Coal India' },
                  { code: 'BHEL', uname: 'bhel.admin', label: 'BHEL' },
                  { code: 'ONGC', uname: 'ongc.admin', label: 'ONGC' },
                  { code: 'IOCL', uname: 'iocl.admin', label: 'IOCL' },
                  { code: 'SAIL', uname: 'sail.admin', label: 'SAIL' },
                  { code: 'NTPC', uname: 'ntpc.admin', label: 'NTPC' },
                ].map((item) => (
                  <button
                    key={item.uname}
                    type="button"
                    onClick={() => selectPreset('CPSE_ADMIN', item.uname)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: username === item.uname ? '1px solid #2563EB' : '1px solid var(--border-light)',
                      background: username === item.uname ? '#EFF6FF' : 'var(--bg-card-alt)',
                      color: username === item.uname ? '#2563EB' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
              SOVEREIGN USERNAME / ID
            </label>
            <div className="search-bar" style={{ width: '100%' }}>
              <UserCircle size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your User ID"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
              CRYPTOGRAPHIC PASSCODE
            </label>
            <div className="search-bar" style={{ width: '100%' }}>
              <Lock size={16} color="var(--text-muted)" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: '12px', color: 'var(--accent-red)', textAlign: 'center', padding: '8px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', fontSize: '13px' }}
          >
            <span>{loading ? 'Authenticating...' : `Authenticate as ${selectedRole.label}`}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-card-alt)', borderRadius: '8px', border: '1px solid var(--border-light)', width: '100%', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Credential Reference:
          </div>
          <div>Password for all accounts: <code style={{ color: '#2563EB', fontWeight: 700 }}>Password@123</code></div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '2px' }}>
            Gov: <b>national.admin</b>, <b>sharma.ap</b> | CPSE: <b>coalindia.admin</b>, <b>bhel.admin</b> | Reviewer: <b>expert.cnmc</b> | Plant: <b>gevra.plant</b>
          </div>
        </div>
      </div>
    </div>
  );
};
