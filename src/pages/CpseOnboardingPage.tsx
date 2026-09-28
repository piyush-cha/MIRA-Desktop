import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../components/layout/AppShell';



import { CpseOnboardForm } from '../components/onboarding/CpseOnboardForm';



import { CredentialDispatchModal } from '../components/onboarding/CredentialDispatchModal';



import { useAuthStore } from '../store/authStore';



import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';



import { supabase } from '../lib/supabase';







interface CpseOnboardingPageProps {



  onNavigate: (page: string) => void;



}







export const CpseOnboardingPage: React.FC<CpseOnboardingPageProps> = ({ onNavigate }) => {



  const { login } = useAuthStore();



  const [activeCredentials, setActiveCredentials] = useState<{



    cpseName: string;



    cpseCode: string;



    username: string;



    temporaryPassword: string;



    adminEmail: string;



    licenseTier: string;



  } | null>(null);







  const handleOnboardSuccess = (creds: {



    cpseName: string;



    cpseCode: string;



    username: string;



    temporaryPassword: string;



    adminEmail: string;



    licenseTier: string;



  }) => {



    setActiveCredentials(creds);



  };







  const handleTestLoginAsAdmin = async (username: string) => {



    if (!activeCredentials) return;



    try {



      // Use the exact email format created in governance.py



      const email = `${username}@cpse.gov.in`;



      const { data, error } = await supabase.auth.signInWithPassword({



        email,



        password: activeCredentials.temporaryPassword



      });



      



      if (error) throw error;







      const appMetadata = data.user?.app_metadata || {};



      const mappedRole = appMetadata.tier_level || 'CPSE_ADMIN';



      



      login(data.session?.access_token || 'mock-token', {



        id: data.user?.id || `usr-${activeCredentials.cpseCode.toLowerCase()}-001`,



        username,



        fullName: data.user?.user_metadata?.full_name || `${activeCredentials.cpseCode} Nodal Administrator`,



        roleCode: mappedRole as any,



        cpseId: appMetadata.cpse_id || `cpse-${activeCredentials.cpseCode.toLowerCase()}`,



        cpseName: activeCredentials.cpseName,



        cpseCode: activeCredentials.cpseCode,



        email,



      });



      



      setActiveCredentials(null);



      onNavigate('admin');



    } catch (err: any) {



      console.error('Login failed:', err);



      alert('Test login failed: ' + (err.message || 'Check console'));



    }



  };







  return (



    <AppShell



      currentPage="onboarding"



      onNavigate={onNavigate}



      title="National Governance"



      subtitle="Enterprise Onboarding & Licence Dispatch"



    >



      <div style={{ maxWidth: '1020px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>



        {/* Top Header Card */}



        <div



          style={{



            display: 'flex',



            alignItems: 'center',



            justifyContent: 'space-between',



            flexWrap: 'wrap',



            gap: '16px',



            background: '#FFFFFF',



            border: '1px solid #E5E7EB',



            borderRadius: '12px',



            padding: '20px 24px',



            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',



          }}



        >



          <div>



            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>



              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>



                National Grid Provisioning



              </span>



              <span style={{ color: '#D1D5DB' }}>•</span>



              <span style={{ fontSize: '12px', color: '#6B7280' }}>DPE Sovereign Node</span>



            </div>



            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>



              Enterprise Onboarding & Licence Dispatch



            </h1>



            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>



              Issue sovereign MIRA licenses, register CPSE nodes, and dispatch cryptographic credentials to designated administrators.



            </p>



          </div>







          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>



            <button



              onClick={() => onNavigate('cpses')}



              className="btn-secondary"



              style={{



                display: 'inline-flex',



                alignItems: 'center',



                gap: '8px',



                padding: '8px 14px',



                fontSize: '12.5px',



                fontWeight: 600,



                borderRadius: '8px',



              }}



            >



              <span>View CPSE Directory</span>



              <ArrowRight size={14} />



            </button>



          </div>



        </div>







        {/* Main Onboard Form */}



        <CpseOnboardForm onSuccess={handleOnboardSuccess} />



      </div>







      {activeCredentials && (



        <CredentialDispatchModal



          credentials={activeCredentials}



          onClose={() => setActiveCredentials(null)}



          onLoginAsCpseAdmin={handleTestLoginAsAdmin}



        />



      )}



    </AppShell>



  );



};