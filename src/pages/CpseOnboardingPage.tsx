import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { CpseOnboardForm } from '../components/onboarding/CpseOnboardForm';
import { CredentialDispatchModal } from '../components/onboarding/CredentialDispatchModal';
import { useAuthStore } from '../store/authStore';

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

  const handleTestLoginAsAdmin = (username: string) => {
    const cpseCode = username.split('.')[0].toUpperCase();
    login('mock-cpse-admin-token', {
      id: `usr-${cpseCode.toLowerCase()}-001`,
      username,
      fullName: `${cpseCode} Nodal Administrator`,
      roleCode: 'CPSE_ADMIN',
      cpseId: `cpse-${cpseCode.toLowerCase()}`,
      cpseName: `${cpseCode} Enterprise`,
      cpseCode,
      email: `admin@${cpseCode.toLowerCase()}.in`,
    });
    setActiveCredentials(null);
    onNavigate('admin');
  };

  return (
    <AppShell
      currentPage="onboarding"
      onNavigate={onNavigate}
      title="CPSE Onboarding & Licencing"
    >
      <div style={{ marginBottom: '8px' }}>
        <h1 className="greeting-text">Enterprise Onboarding & Licence Dispatch</h1>
        <div className="greeting-sub">Issue MIRA Licences and configure cryptographic credentials for CPSE admins</div>
      </div>

      <div style={{ maxWidth: '900px' }}>
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
