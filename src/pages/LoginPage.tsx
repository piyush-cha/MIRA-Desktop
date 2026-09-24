import React, { useState } from 'react';
import { UserCircle, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';
import { api } from '../api/client';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onSuccessLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useAuthStore();
  const [username, setUsername] = useState('national.admin');
  const [password, setPassword] = useState('MIRA2026!super');
  const [role, setRole] = useState<UserRole>('NATIONAL_GOVERNANCE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let email = username;
      // Provide easy mapping for the demo accounts from seed script
      if (!username.includes('@')) {
         if (username === 'national.admin') email = 'national.admin@gov.in';
         else if (username === 'coalindia.admin') email = 'coalindia.admin@cil.gov.in';
         else email = `${username}@cpse.gov.in`;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const appMetadata = data.user?.app_metadata || {};
      const mappedRole: UserRole = appMetadata.tier_level || (role === 'NATIONAL_GOVERNANCE' ? 'NATIONAL_GOVERNANCE' : 'CPSE_ADMIN');
      
      const cpseNameMap: Record<string, string> = {
        COALINDIA: 'Coal India Limited',
        BHEL: 'Bharat Heavy Electricals Limited',
        ONGC: 'Oil & Natural Gas Corporation',
        SAIL: 'Steel Authority of India Limited',
        NTPC: 'NTPC Limited',
        IOCL: 'Indian Oil Corporation',
      };
      
      const resolvedCpseCode = appMetadata.cpse_id;
      const resolvedCpseName = resolvedCpseCode ? cpseNameMap[resolvedCpseCode] || resolvedCpseCode : null;

      login(data.session?.access_token || '', {
        id: data.user?.id || '',
        username: email,
        fullName: email.split('@')[0],
        roleCode: mappedRole,
        cpseId: appMetadata.cpse_id,
        cpseCode: resolvedCpseCode,
        cpseName: resolvedCpseName,
        email: email,
      });

      onSuccessLogin(mappedRole);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or backend unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
      <div className="panel-card" style={{ width: '420px', padding: '34px 30px', alignItems: 'center' }}>
        {/* Official MIRA Logo */}
        <img 
          src="/mira-logo.png" 
          alt="MIRA Logo" 
          style={{ width: '64px', height: '64px', borderRadius: '12px', marginBottom: '16px', objectFit: 'contain' }} 
        />
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>
          MIRA Sovereign Grid
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          National Material Governance & Autonomous CPSE Portal
        </p>

        {/* Role Switch Tabs */}
        <div className="tab-row" style={{ width: '100%', justifyContent: 'center', marginBottom: '18px', background: 'var(--bg-card-alt)', padding: '4px', borderRadius: '25px', border: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className={`tab ${role === 'NATIONAL_GOVERNANCE' ? 'active' : ''}`}
            onClick={() => {
              setRole('NATIONAL_GOVERNANCE');
              setUsername('national.admin');
            }}
            style={{ flex: 1 }}
          >
            National Gov
          </button>
          <button
            type="button"
            className={`tab ${role === 'CPSE_ADMIN' ? 'active' : ''}`}
            onClick={() => {
              setRole('CPSE_ADMIN');
              setUsername('coalindia.admin');
            }}
            style={{ flex: 1 }}
          >
            CPSE Admin
          </button>
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
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px', fontSize: '13px' }}
          >
            <span>{loading ? 'Authenticating with Backend...' : 'Authenticate Sovereign Session'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ marginTop: '22px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
          Demo Accounts: <br />
          <b>national.admin</b> (National Governance) | <b>coalindia.admin</b> (CPSE Admin)
        </div>
      </div>
    </div>
  );
};
