import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { NationalGovernancePage } from './pages/NationalGovernancePage';
import { CpseOnboardingPage } from './pages/CpseOnboardingPage';
import { CpseAdminPage } from './pages/CpseAdminPage';
import { CnmcMaterialPage } from './pages/CnmcMaterialPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<string>('national');

  if (!isAuthenticated) {
    return <LoginPage onSuccessLogin={(role) => setCurrentPage(role === 'NATIONAL_GOVERNANCE' ? 'national' : 'admin')} />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  switch (currentPage) {
    case 'national':
      return <NationalGovernancePage onNavigate={handleNavigate} />;
    case 'onboarding':
      return <CpseOnboardingPage onNavigate={handleNavigate} />;
    case 'admin':
      return <CpseAdminPage onNavigate={handleNavigate} />;
    case 'cnmc':
      return <CnmcMaterialPage onNavigate={handleNavigate} />;
    default:
      return <NotFoundPage onNavigate={handleNavigate} />;
  }
}
