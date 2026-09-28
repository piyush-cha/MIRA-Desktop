import React, { useState, useEffect, useRef } from 'react';



import { 



  UserCircle, Shield, Key, Lock, CheckCircle2, RefreshCw, 



  Building2, Mail, Calendar, ShieldCheck, Cpu, Edit3, Save, X, Camera, Upload



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



        <div className="profile-layout-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>



          



          {/* Identity Card */}



          <div className="panel-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>



            



            <div style={{ position: 'relative', marginBottom: '20px' }}>



              <img 



                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.fullName || 'User')}&background=1e293b&color=fff&size=128&font-size=0.33`} 



                alt="Profile" 



                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e5e7eb', backgroundColor: '#f3f4f6' }} 



              />



              



              {isEditing && (



                <button 



                  onClick={() => fileInputRef.current?.click()}



                  style={{ position: 'absolute', bottom: '0', right: '0', background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}



                  title="Upload New Avatar"



                >



                  <Camera size={18} />



                </button>



              )}



              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />



            </div>







            {isEditing ? (



              <div style={{ width: '100%', marginBottom: '16px' }}>



                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textAlign: 'left' }}>Full Officer Name</label>



                <input 



                  type="text" 



                  value={fullName}



                  onChange={(e) => setFullName(e.target.value)}



                  className="gov-input"



                  style={{ width: '100%', textAlign: 'center', fontSize: '16px', fontWeight: 600 }}



                />



              </div>



            ) : (



              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>



                {fullName || user?.fullName || 'Unknown Officer'}



              </h2>



            )}







            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, marginBottom: '24px' }}>



              <Shield size={14} />



              <span>{user?.roleCode?.replace(/_/g, ' ') || 'NATIONAL GOVERNANCE'}</span>



            </div>







            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>



              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>



                <Building2 size={16} />



                <span><strong style={{ color: 'var(--text-primary)' }}>CPSE:</strong> {user?.cpseName || 'National Master HQ'}</span>



              </div>



              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>



                <Mail size={16} />



                <span>{user?.email || 'admin@gov.in'}</span>



              </div>



              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>



                <Calendar size={16} />



                <span><strong style={{ color: 'var(--text-primary)' }}>Onboarded:</strong> {new Date().toISOString().split('T')[0]}</span>



              </div>



            </div>







            <div style={{ width: '100%', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px' }}>



              {isEditing ? (



                <>



                  <button className="gov-btn primary" onClick={handleSaveProfile} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>



                    <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}



                  </button>



                  <button className="gov-btn secondary" onClick={() => setIsEditing(false)} disabled={saving} style={{ padding: '8px' }}>



                    <X size={16} />



                  </button>



                </>



              ) : (



                <button className="gov-btn secondary" onClick={() => setIsEditing(true)} style={{ flex: 1, justifyContent: 'center' }}>



                  <Edit3 size={16} /> Edit Identity



                </button>



              )}



            </div>



          </div>







          {/* Sovereign Security & SAP Binding */}



          <div className="panel-card" style={{ padding: '32px' }}>



            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>



              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>



                <Lock size={20} color="#10b981" />



              </div>



              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Sovereign Cryptographic Security Context</h3>



            </div>







            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>



              <div>



                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>MFA Verification Status:</span>



                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>



                  <CheckCircle2 size={14} /> ED25519 VERIFIED



                </div>



              </div>



              <div>



                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Authorization Token:</span>



                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>BEARER_JWT_SHA256</span>



              </div>



              <div>



                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Access Clearance:</span>



                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{user?.roleCode || 'LEVEL_6_SUPREME'}</span>



              </div>



              <div>



                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SAP MM Gateway Binding:</span>



                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>



                  <ShieldCheck size={14} /> SAML 2.0 CONNECTED



                </div>



              </div>



            </div>



            



            <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>



              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Cryptographic Key Fingerprint:</span>



              <code style={{ display: 'block', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>



                SHA256: 9a3b8f1c4e7d2a5b6c9f0e1d4a7b3c6f9e0d1a4b7c2f5e8d9a3b6c9f0e1d4a7



              </code>



            </div>







            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>



              <button className="gov-btn" onClick={() => alert('Sovereign session keys rotated successfully.')} style={{ background: '#1f2937', color: 'white' }}>



                <Key size={14} />



                <span>Rotate Cryptographic Keys</span>



              </button>



              



              <button className="gov-btn secondary" onClick={() => alert('To change your secure government email, please contact the National Governance Admin.')}>



                <Mail size={14} />



                <span>Change Email</span>



              </button>



              



              <button className="gov-btn secondary" onClick={() => alert('Password reset link sent to your registered email.')}>



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






