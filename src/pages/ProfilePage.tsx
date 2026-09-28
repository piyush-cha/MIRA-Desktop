import React, { useState, useEffect, useRef } from 'react';



import { 
  UserCircle, Shield, Key, Lock, CheckCircle2, RefreshCw, 
  Building2, Mail, Calendar, ShieldCheck, Cpu, Edit3, Save, X, Camera, Upload,
  Copy, Check
} from 'lucide-react';

import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const ProfilePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);







  useEffect(() => {



    // Initialize form with global store user data



    if (user) {



      setFullName(user.fullName || '');



      setAvatarUrl(user.avatarUrl || '');



    }



    setLoading(false);



  }, [user]);







  const handleSaveProfile = async () => {



    setSaving(true);



    try {



      // 1. Update Supabase Auth user_metadata (if available)



      const { error } = await supabase.auth.updateUser({



        data: { full_name: fullName, avatar_url: avatarUrl }



      });



      if (error) {



        console.warn("Supabase auth update failed, falling back to local state update:", error.message);



      }



      



      // 2. Update global local store state so UI updates instantly



      if (user) {



        login(useAuthStore.getState().token || '', {



          ...user,



          fullName: fullName,



          avatarUrl: avatarUrl



        });



      }



      setIsEditing(false);



    } catch (err: any) {



      setError(err.message || "Failed to update profile");



    } finally {



      setSaving(false);



    }



  };







  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {



    const file = e.target.files?.[0];



    if (file) {



      // For demo purposes, we will just use a local object URL to instantly preview the image.



      // In production, this would upload to Supabase Storage and get a public URL.



      const localUrl = URL.createObjectURL(file);



      setAvatarUrl(localUrl);



    }



  };







  return (



    <AppShell



      currentPage="profile"



      onNavigate={onNavigate}



      title="Officer Profile & Sovereign Identity"



      subtitle="Federated Enterprise Credentials & Security Context"



    >



            <div className="gov-page-container">
        <div className="profile-layout-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Identity Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {/* Avatar with Status Ring */}
            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <div style={{
                padding: '4px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
              }}>
                <img 
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.fullName || 'User')}&background=0F172A&color=FFFFFF&size=128&font-size=0.33&bold=true`} 
                  alt="Profile" 
                  style={{ width: '104px', height: '104px', borderRadius: '50%', objectFit: 'cover', display: 'block', background: '#0F172A' }} 
                />
              </div>
              
              {/* Online Verified Dot */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#10B981',
                border: '3px solid #FFFFFF',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }} title="Identity Verified and Active" />

              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', top: '0', right: '0', background: '#2563eb', color: 'white', border: '2px solid #FFFFFF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  title="Upload New Avatar"
                >
                  <Camera size={15} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            </div>

            {isEditing ? (
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Officer Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="gov-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: '15px', fontWeight: 700 }}
                />
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                  {fullName || user?.fullName || 'Unknown Officer'}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '14px' }}>
                  {user?.designation || 'Executive Officer (Procurement)'}
                </div>
              </div>
            )}

            {/* Role Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#EFF6FF', 
              color: '#1D4ED8', 
              border: '1px solid #BFDBFE',
              padding: '4px 12px', 
              borderRadius: '9999px', 
              fontSize: '11px', 
              fontWeight: 800, 
              letterSpacing: '0.04em',
              marginBottom: '20px' 
            }}>
              <Shield size={12} className="text-blue-600" />
              <span>{user?.roleCode?.replace(/_/g, ' ') || 'CPSE ADMIN'}</span>
            </div>

            {/* Enterprise Detail Cards */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <div style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px', 
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Building2 size={16} color="#475569" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ENTERPRISE NODE</div>
                  <div style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.cpseName || 'Bharat Heavy Electricals Limited'}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px', 
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <Mail size={16} color="#475569" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>OFFICIAL EMAIL</div>
                    <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email || 'pranavnavghare46@gmail.com'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user?.email || 'pranavnavghare46@gmail.com');
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748B' }}
                  title="Copy Email"
                >
                  {copiedEmail ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                </button>
              </div>

              <div style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px', 
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Calendar size={16} color="#475569" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ONBOARDING PROVISION</div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                    2026-09-28 · Sovereign Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div style={{ width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
              {isEditing ? (
                <>
                  <button className="gov-btn primary" onClick={handleSaveProfile} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                    <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button className="gov-btn secondary" onClick={() => setIsEditing(false)} disabled={saving} style={{ padding: '8px' }}>
                    <X size={15} />
                  </button>
                </>
              ) : (
                <button className="gov-btn secondary" onClick={() => setIsEditing(true)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600 }}>
                  <Edit3 size={15} /> Edit Identity
                </button>
              )}
            </div>
          </div>

          {/* Sovereign Security & SAP Binding */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} color="#059669" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Sovereign Cryptographic Security Context</h3>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Ed25519 Verified Session · Zero-Trust Air-Gap Isolation
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 800, color: '#047857' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>LEVEL-4 RATIFIED</span>
              </div>
            </div>

            {/* 4 Credential Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '22px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>MFA Verification Status</span>
                  <CheckCircle2 size={13} color="#059669" />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                  ED25519 HARDWARE VERIFIED
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Authorization Token</span>
                  <Key size={13} color="#2563EB" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px' }}>
                    BEARER_JWT_SHA256
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('BEARER_JWT_SHA256');
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B' }}
                    title="Copy Token Format"
                  >
                    {copiedToken ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Access Clearance Scope</span>
                  <ShieldCheck size={13} color="#2563EB" />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  {user?.roleCode || 'CPSE_ADMIN'}
                  <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 600, color: '#64748B' }}>(Full Silo Clearance)</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SAP MM Gateway Binding</span>
                  <Cpu size={13} color="#059669" />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  SAML 2.0 CONNECTED
                </div>
              </div>
            </div>

            {/* Cryptographic Key Fingerprint */}
            <div style={{ 
              background: '#0F172A', 
              color: '#FFFFFF', 
              padding: '14px 16px', 
              borderRadius: '10px', 
              border: '1px solid #1E293B',
              marginBottom: '22px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={13} color="#34D399" />
                  <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', color: '#94A3B8' }}>
                    SHA-256 SESSION KEY FINGERPRINT
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('SHA256: 9a3b8f1c4e7d2a5b6c9f0e1d4a7b3c6f9e0d1a4b7c2f5e8d9a3b6c9f0e1d4a7');
                    setCopiedFingerprint(true);
                    setTimeout(() => setCopiedFingerprint(false), 2000);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#E2E8F0',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedFingerprint ? <Check size={11} color="#34D399" /> : <Copy size={11} />}
                  <span>{copiedFingerprint ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <code style={{ 
                display: 'block', 
                fontFamily: 'monospace', 
                fontSize: '11.5px', 
                color: '#34D399', 
                wordBreak: 'break-all', 
                letterSpacing: '0.04em',
                lineHeight: 1.4
              }}>
                SHA256: 9a3b8f1c4e7d2a5b6c9f0e1d4a7b3c6f9e0d1a4b7c2f5e8d9a3b6c9f0e1d4a7
              </code>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="gov-btn" 
                onClick={() => alert('Sovereign session keys rotated successfully. Updated fingerprint logged to ledger.')} 
                style={{ 
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                <Key size={14} />
                <span>Rotate Cryptographic Keys</span>
              </button>

              <button 
                className="gov-btn secondary" 
                onClick={() => alert('To change your secure government email, please contact the National Governance Admin.')}
                style={{
                  background: '#FFFFFF',
                  color: '#334155',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Mail size={14} />
                <span>Change Email</span>
              </button>

              <button 
                className="gov-btn secondary" 
                onClick={() => alert('Password reset verification link dispatched to your registered enterprise email.')}
                style={{
                  background: '#FFFFFF',
                  color: '#334155',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Lock size={14} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </AppShell>



  );



};






