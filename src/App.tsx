import React, { useState, useEffect } from 'react';
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
import { ExpertReviewerPage } from './pages/ExpertReviewerPage';
import { MiraFloatingBot } from './components/ai/MiraFloatingBot';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const isCpseAdmin = user?.roleCode === 'CPSE_ADMIN';

  const getDefaultPage = () => {
    if (user?.roleCode === 'EXPERT_REVIEWER' || user?.roleCode === 'REVIEWER') return 'expert-reviewer';
    if (user?.roleCode === 'PLANT_USER' || user?.roleCode === 'AREA_ADMIN') return 'plant-dashboard';
    if (user?.roleCode === 'CPSE_ADMIN') return 'cpse-overview';
    return 'national';
  };

  const [currentPage, setCurrentPage] = useState<string>(getDefaultPage());

  // Guard routes if role is CPSE Admin
  useEffect(() => {
    if (isAuthenticated && isCpseAdmin) {
      const nationalOnly = [
        'national', 'onboarding', 'cpses', 'onboard-new', 
        'cnmc', 'cross-cpse', 'expert-reviews', 'data-quality', 
        'legacy-codes', 'policies', 'users-roles'
      ];
      if (nationalOnly.includes(currentPage)) {
        setCurrentPage('cpse-overview');
      }
    }
  }, [isAuthenticated, isCpseAdmin, currentPage]);

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onSuccessLogin={(role) => {
          if (role === 'EXPERT_REVIEWER' || role === 'REVIEWER') setCurrentPage('expert-reviewer');
          else if (role === 'PLANT_USER' || role === 'AREA_ADMIN') setCurrentPage('plant-dashboard');
          else if (role === 'CPSE_ADMIN') setCurrentPage('cpse-overview');
          else setCurrentPage('national');
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
        return isCpseAdmin 
          ? <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="overview" /> 
          : <NationalGovernancePage onNavigate={handleNavigate} />;
      case 'onboarding':
      case 'cpses':
        return isCpseAdmin 
          ? <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="overview" /> 
          : <CpseDirectoryPage onNavigate={handleNavigate} />;
      case 'onboard-new':
        return <CpseOnboardingPage onNavigate={handleNavigate} />;
      case 'admin':
      case 'cpse-portal':
      case 'cpse-overview':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="overview" />;
      case 'admin-collab':
      case 'cpse-collaboration':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="collaboration" />;
      case 'admin-hierarchy':
      case 'cpse-hierarchy':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="hierarchy" />;
      case 'admin-catalog':
      case 'cpse-catalog':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="catalog" />;
      case 'cpse-sap':
        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="sap" />;
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
      case 'expert-reviewer':
      case 'reviewer':
        return <ExpertReviewerPage onNavigate={handleNavigate} />;
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
