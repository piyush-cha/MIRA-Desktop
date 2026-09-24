import React, { useState } from 'react';
import { UserCircle, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';
import { api } from '../api/client';

interface LoginPageProps {
  onSuccessLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useAuthStore();
  const [username, setUsername] = useState('national.admin');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState<UserRole>('NATIONAL_GOVERNANCE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectPreset = (userRole: UserRole, userUname: string) => {
    setRole(userRole);
    setUsername(userUname);
    setPassword('Password@123');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authRes = await api.login(username, password, role === 'NATIONAL_GOVERNANCE' ? 'GOV' : undefined);
      
      const mappedRole: UserRole = 
        authRes.role_code === 'CPSE_ADMIN' ? 'CPSE_ADMIN' :
        authRes.role_code === 'PLANT_USER' ? 'PLANT_USER' :
        authRes.role_code === 'AREA_ADMIN' ? 'AREA_ADMIN' :
        'NATIONAL_GOVERNANCE';
      
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
      setError('Invalid credentials or backend unreachable. Use Password@123.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '20px' }}>
      <div className="panel-card" style={{ width: '460px', padding: '32px 28px', alignItems: 'center', maxHeight: '95vh', overflowY: 'auto' }}>
        {/* Official MIRA Logo */}
        <img 
          src="/mira-logo.png" 
          alt="MIRA Logo" 
          style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '14px', objectFit: 'contain' }} 
        />
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>
          MIRA Sovereign Grid
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
          National Material Governance & Autonomous CPSE Enterprise Portal
        </p>

        {/* Role Switch Tabs */}
        <div className="tab-row" style={{ width: '100%', justifyContent: 'center', marginBottom: '14px', background: 'var(--bg-card-alt)', padding: '4px', borderRadius: '25px', border: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className={`tab ${role === 'NATIONAL_GOVERNANCE' ? 'active' : ''}`}
            onClick={() => selectPreset('NATIONAL_GOVERNANCE', 'national.admin')}
            style={{ flex: 1 }}
          >
            National Gov
          </button>
          <button
            type="button"
            className={`tab ${role === 'CPSE_ADMIN' ? 'active' : ''}`}
            onClick={() => selectPreset('CPSE_ADMIN', 'coalindia.admin')}
            style={{ flex: 1 }}
          >
            CPSE Admin
          </button>
          <button
            type="button"
            className={`tab ${role === 'PLANT_USER' ? 'active' : ''}`}
            onClick={() => selectPreset('PLANT_USER', 'gevra.plant')}
            style={{ flex: 1 }}
          >
            Plant / Area
          </button>
        </div>

        {/* Quick Select Buttons */}
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
            ) : role === 'PLANT_USER' ? (
              <>
                {[
                  { uname: 'gevra.plant', label: 'Gevra Mega Mine (SECL)', unit: 'unit-gevra' },
                  { uname: 'korba.area', label: 'Korba Area HQ (SECL)', unit: 'unit-secl-korba' },
                  { uname: 'haridwar.plant', label: 'HEEP Haridwar (BHEL)', unit: 'unit-har' },
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
              {role === 'NATIONAL_GOVERNANCE' ? 'GOVERNMENT SOVEREIGN ID' : 'CPSE ADMIN DISPATCHED USERNAME'}
            </label>
            <div className="search-bar" style={{ width: '100%' }}>
              <UserCircle size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sharma.ap or coalindia.admin"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && <div style={{ fontSize: '12px', color: 'var(--accent-red)', textAlign: 'center' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', fontSize: '13px' }}
          >
            <span>{loading ? 'Authenticating with Backend...' : `Authenticate as ${role === 'PLANT_USER' ? 'Plant / Area Specialist' : role === 'CPSE_ADMIN' ? 'CPSE Enterprise Admin' : 'National Sovereign'}`}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ marginTop: '16px', padding: '10px', background: 'var(--bg-card-alt)', borderRadius: '8px', border: '1px solid var(--border-light)', width: '100%', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Credential Reference:
          </div>
          <div>Password for all accounts: <code style={{ color: '#2563EB', fontWeight: 700 }}>Password@123</code></div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '2px' }}>
            Gov: <b>national.admin</b> / <b>sharma.ap</b> | CPSE: <b>coalindia.admin</b>, <b>bhel.admin</b>, <b>ongc.admin</b> | Plant: <b>gevra.plant</b>, <b>korba.area</b>, <b>haridwar.plant</b>
          </div>
        </div>
      </div>
    </div>
  );
};
