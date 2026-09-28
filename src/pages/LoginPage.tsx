import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Lock, ArrowRight } from 'lucide-react';



import { useAuthStore, UserRole } from '../store/authStore';



import { api } from '../api/client';



import { supabase } from '../lib/supabase';







interface LoginPageProps {



  onSuccessLogin: (role: UserRole) => void;



}







export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {



  const { login } = useAuthStore();



  const [username, setUsername] = useState('');



  const [password, setPassword] = useState('');



  const [loading, setLoading] = useState(false);



  const [error, setError] = useState('');







  const handleLogin = async (e: React.FormEvent) => {



    e.preventDefault();



    setLoading(true);



    setError('');







    try {



      let email = username.trim();



      // Provide easy mapping for accounts



      if (!email.includes('@')) {



         if (email === 'national.admin' || email === 'national') email = 'national.admin@gov.in';



         else if (email === 'pranav' || email === 'pranavnavghare') email = 'pranavnavghare46@gmail.com';



         else if (email === 'bhel.admin' || email === 'admin.bhel' || email === 'admin.2040' || email === '2040' || email === 'bhel') email = 'admin.bhel@cpse.gov.in';



         else if (email.startsWith('admin.')) email = `${email}@cpse.gov.in`;



         else email = `admin.${email.toLowerCase()}@cpse.gov.in`;



      }







      // Allow convenient passwords for demo accounts



      const isBhelAdmin = email === 'admin.bhel@cpse.gov.in' || email === 'pranavnavghare46@gmail.com' || email === 'paragyeole10@gmail.com';



      const isNationalAdmin = email === 'national.admin@gov.in';







      let effectivePassword = password;



      if (isBhelAdmin && (password === 'bhel' || password === '2040')) {



        effectivePassword = 'BHEL2026!';



      } else if (isNationalAdmin && (password === 'national' || password === 'gov' || password === 'admin' || password === 'MIRA2026!super')) {



        effectivePassword = 'BHEL2026!';



      }







      let { data, error: authError } = await supabase.auth.signInWithPassword({



        email,



        password: effectivePassword,



      });







      // If initial attempt fails, try case permutations (e.g. ongc vs ONGC) or with 2026!



      if (authError) {



        const fallbacks = [



          password.toUpperCase(),



          password.toLowerCase(),



          `${password.toUpperCase()}2026!`,



          `${password}2026!`



        ];



        for (const altPwd of fallbacks) {



          if (altPwd !== effectivePassword) {



            const retry = await supabase.auth.signInWithPassword({ email, password: altPwd });



            if (!retry.error && retry.data) {



              data = retry.data;



              authError = null;



              break;



            }



          }



        }



      }







      if (authError || !data?.user) throw authError || new Error('Authentication failed');







      const appMetadata = data.user?.app_metadata || {};



      const detectedRole: UserRole = email.includes('national') ? 'NATIONAL_GOVERNANCE' : 'CPSE_ADMIN';



      const mappedRole: UserRole = appMetadata.tier_level || detectedRole;



      



      const cpseNameMap: Record<string, string> = {



        '2040': 'Bharat Heavy Electricals Limited',



        BHEL: 'Bharat Heavy Electricals Limited',



        ONGC: 'Oil & Natural Gas Corporation',



        SAIL: 'Steel Authority of India Limited',



        NTPC: 'NTPC Limited',



        IOCL: 'Indian Oil Corporation',



      };



      



      const userMetadata = data.user?.user_metadata || {};



      const resolvedCpseCode = appMetadata.cpse_id || (mappedRole === 'NATIONAL_GOVERNANCE' ? null : 'BHEL');



      const resolvedCpseName = appMetadata.cpse_name || userMetadata.cpse_name || (resolvedCpseCode ? cpseNameMap[resolvedCpseCode] || resolvedCpseCode : (mappedRole === 'NATIONAL_GOVERNANCE' ? null : 'Bharat Heavy Electricals Limited'));







      login(data.session?.access_token || '', {



        id: data.user?.id || '',



        username: email,



        fullName: userMetadata.full_name || email.split('@')[0],



        avatarUrl: (userMetadata.avatar_url && userMetadata.avatar_url !== 'null' && userMetadata.avatar_url.trim() !== '') ? userMetadata.avatar_url : null,



        roleCode: mappedRole,



        cpseId: appMetadata.cpse_id,



        cpseCode: resolvedCpseCode,



        cpseName: resolvedCpseName,



        email: userMetadata.real_email || data.user?.email || email,



      });







      try {



        await api.logActivity({



          action: 'USER_LOGIN',



          target: resolvedCpseName || 'MIRA National Grid',



          details: `User ${email} authenticated successfully with role ${mappedRole}.`,



          actor: email



        });



      } catch (logErr) {



        console.error('Failed to log login activity:', logErr);



      }







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







        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>



          <div>



            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>



              SOVEREIGN IDENTIFIER / USERNAME



            </label>



            <div className="search-bar" style={{ width: '100%' }}>



              <UserCircle size={16} color="var(--text-muted)" />



              <input



                type="text"



                value={username}



                onChange={(e) => setUsername(e.target.value)}



                placeholder="Enter username or email"



                required



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



                placeholder="Enter passcode"



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



      </div>



    </div>



  );



};