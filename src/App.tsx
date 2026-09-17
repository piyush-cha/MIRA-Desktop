import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { NationalGovernancePage } from './pages/NationalGovernancePage';
import { CpseDirectoryPage } from './pages/CpseDirectoryPage';
import { CpseOnboardingPage } from './pages/CpseOnboardingPage';
import { CpseAdminPortalPage } from './pages/CpseAdminPortalPage';
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
import { PlantAreaDashboardPage } from './pages/PlantAreaDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MiraFloatingBot } from './components/ai/MiraFloatingBot';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<string>('national');

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onSuccessLogin={(role) => {
          if (role === 'NATIONAL_GOVERNANCE') {
            setCurrentPage('national');
          } else if (role === 'PLANT_USER' || role === 'AREA_ADMIN') {
            setCurrentPage('plant-dashboard');
          } else {
            setCurrentPage('admin');
          }
        }} 
      />
    );
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
      case 'cpse-portal':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="overview" />;
      case 'admin-collab':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="collaboration" />;
      case 'admin-hierarchy':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="hierarchy" />;
      case 'admin-catalog':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="catalog" />;
      case 'plant-dashboard':
      case 'plant-inv':
        return <PlantAreaDashboardPage onNavigate={handleNavigate} initialTab="inventory" />;
      case 'plant-transfers':
        return <PlantAreaDashboardPage onNavigate={handleNavigate} initialTab="transfers" />;
      case 'plant-indents':
        return <PlantAreaDashboardPage onNavigate={handleNavigate} initialTab="indents" />;
      case 'plant-consumption':
        return <PlantAreaDashboardPage onNavigate={handleNavigate} initialTab="consumption" />;
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
