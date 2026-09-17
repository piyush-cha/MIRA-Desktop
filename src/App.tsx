import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { NationalGovernancePage } from './pages/NationalGovernancePage';
import { CpseDirectoryPage } from './pages/CpseDirectoryPage';
import { CpseOnboardingPage } from './pages/CpseOnboardingPage';
import { CpseAdminPage } from './pages/CpseAdminPage';
import { CnmcMaterialPage } from './pages/CnmcMaterialPage';
import { CrossCpseIntelPage } from './pages/CrossCpseIntelPage';
import { ExpertReviewsPage } from './pages/ExpertReviewsPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { LegacyCodesPage } from './pages/LegacyCodesPage';
import { SystemPoliciesPage } from './pages/SystemPoliciesPage';
import { AuditCompliancePage } from './pages/AuditCompliancePage';
import { UsersRolesPage } from './pages/UsersRolesPage';
import { SapSettingsPage } from './pages/SapSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MiraFloatingBot } from './components/ai/MiraFloatingBot';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<string>('national');

  if (!isAuthenticated) {
    return <LoginPage onSuccessLogin={(role) => setCurrentPage(role === 'NATIONAL_GOVERNANCE' ? 'national' : 'admin')} />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'national':
        return <NationalGovernancePage onNavigate={handleNavigate} />;
      case 'onboarding':
      case 'cpses':
        return <CpseDirectoryPage onNavigate={handleNavigate} />;
      case 'onboard-new':
        return <CpseOnboardingPage onNavigate={handleNavigate} />;
      case 'admin':
        return <CpseAdminPage onNavigate={handleNavigate} />;
      case 'cnmc':
        return <CnmcMaterialPage onNavigate={handleNavigate} />;
      case 'cross-cpse':
        return <CrossCpseIntelPage onNavigate={handleNavigate} />;
      case 'expert-reviews':
        return <ExpertReviewsPage onNavigate={handleNavigate} />;
      case 'data-quality':
        return <DataQualityPage onNavigate={handleNavigate} />;
      case 'legacy-codes':
        return <LegacyCodesPage onNavigate={handleNavigate} />;
      case 'policies':
        return <SystemPoliciesPage onNavigate={handleNavigate} />;
      case 'audit':
        return <AuditCompliancePage onNavigate={handleNavigate} />;
      case 'users-roles':
        return <UsersRolesPage onNavigate={handleNavigate} />;
      case 'sap-settings':
        return <SapSettingsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-root-wrapper">
      {renderPage()}
      {/* Global Multilingual 3D MIRA Copilot & SAP MM MCP */}
      <MiraFloatingBot />
    </div>
  );
}
