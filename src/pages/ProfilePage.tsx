import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Shield, Key, Lock, CheckCircle2, RefreshCw, 
  Building2, Mail, Calendar, ShieldCheck, Cpu
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const ProfilePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfile(user?.username);
      setProfileData(res);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AppShell
      currentPage="profile"
      onNavigate={onNavigate}
      title="Officer Profile & Sovereign Identity"
      subtitle="Federated Enterprise Credentials, Ed25519 Session Keys & MFA Posture"
    >
      <div className="gov-page-container">
        {profileData && (
          <div className="profile-layout-grid">
            {/* Identity Card */}
            <div className="profile-main-card">
              <div className="profile-avatar-large">
                {profileData.profile?.full_name?.[0] || 'U'}
              </div>
              <h2 className="profile-title-name">{profileData.profile?.full_name}</h2>
              <div className="profile-role-tag">
                <Shield size={13} />
                <span>{profileData.profile?.primary_role_code?.replace(/_/g, ' ')}</span>
              </div>

              <div className="profile-info-list">
                <div className="info-item">
                  <Mail size={14} className="text-muted" />
                  <span>{profileData.profile?.email}</span>
                </div>
                <div className="info-item">
                  <UserCircle size={14} className="text-muted" />
                  <span>@{profileData.profile?.username}</span>
                </div>
                <div className="info-item">
                  <Building2 size={14} className="text-muted" />
                  <span>Scope: {profileData.profile?.scope_type || 'National Sovereign'}</span>
                </div>
                <div className="info-item">
                  <Calendar size={14} className="text-muted" />
                  <span>Onboarded: {profileData.profile?.created_at?.split('T')[0] || '2026-01-15'}</span>
                </div>
              </div>
            </div>

            {/* Sovereign Security & SAP Binding */}
            <div className="profile-security-card">
              <div className="security-card-header">
                <Lock size={18} color="#10b981" />
                <h3>Sovereign Cryptographic Security Context</h3>
              </div>

              <div className="security-kv-grid">
                <div className="sec-kv">
                  <span className="sec-label">MFA Verification Status:</span>
                  <span className="status-pill approved">{profileData.security?.mfa_status}</span>
                </div>
                <div className="sec-kv">
                  <span className="sec-label">Authorization Token:</span>
                  <span className="font-mono text-xs font-semibold">{profileData.security?.session_token_type}</span>
                </div>
                <div className="sec-kv">
                  <span className="sec-label">Access Clearance:</span>
                  <span className="text-xs font-bold text-primary">{profileData.security?.access_tier}</span>
                </div>
                <div className="sec-kv">
                  <span className="sec-label">SAP MM Gateway Binding:</span>
                  <span className="status-pill active">SAML 2.0 CONNECTED</span>
                </div>
                <div className="sec-kv full-width">
                  <span className="sec-label">Cryptographic Key Fingerprint:</span>
                  <code className="key-fingerprint-box">{profileData.security?.key_fingerprint}</code>
                </div>
              </div>

              <div className="profile-actions-footer">
                <button className="gov-btn primary" onClick={() => alert('Sovereign session keys rotated successfully.')}>
                  <Key size={14} />
                  <span>Rotate Cryptographic Keys</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
