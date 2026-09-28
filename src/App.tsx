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

import { MiraUnifiedCatalogPage } from './pages/MiraUnifiedCatalogPage';
import { GovMasterApprovalsPage } from './pages/GovMasterApprovalsPage';
import { TierWorkflowTicketsPage } from './pages/TierWorkflowTicketsPage';
import { AuditCompliancePage } from './pages/AuditCompliancePage';

import { UsersRolesPage } from './pages/UsersRolesPage';

import { SapSettingsPage } from './pages/SapSettingsPage';

import { ProfilePage } from './pages/ProfilePage';

import { NotFoundPage } from './pages/NotFoundPage';

import { MiraFloatingBot } from './components/ai/MiraFloatingBot';



export default function App() {

  const { isAuthenticated, user } = useAuthStore();

  const isCpseAdmin = user?.roleCode === 'CPSE_ADMIN';

  const [currentPage, setCurrentPage] = useState<string>(isCpseAdmin ? 'cpse-overview' : 'national');



  // Guard routes if role is CPSE Admin

  useEffect(() => {

    if (isAuthenticated && isCpseAdmin) {

      const nationalOnly = [

        'national', 'onboarding', 'cpses', 'onboard-new', 

        'cnmc', 'cross-cpse', 'data-quality', 

        'policies', 'users-roles'

      ];

      if (nationalOnly.includes(currentPage)) {

        setCurrentPage('cpse-overview');

      }

    }

  }, [isAuthenticated, isCpseAdmin, currentPage]);



  if (!isAuthenticated) {

    return <LoginPage onSuccessLogin={(role) => setCurrentPage(role === 'CPSE_ADMIN' ? 'cpse-overview' : 'national')} />;

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

      case 'cpse-collaboration':

        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="collaboration" />;

      case 'cpse-hierarchy':

        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="hierarchy" />;

      case 'cpse-catalog':

        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="catalog" />;

      case 'cpse-sap':

        return <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="sap" />;

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
      case 'mira-catalog':
        return <MiraUnifiedCatalogPage onNavigate={handleNavigate} />;
      case 'master-approvals':
        return <GovMasterApprovalsPage onNavigate={handleNavigate} />;
      case 'audit':
        return <AuditCompliancePage onNavigate={handleNavigate} />;
      case 'users-roles':
        return <UsersRolesPage onNavigate={handleNavigate} />;
      case 'sap-settings':
        return <SapSettingsPage onNavigate={handleNavigate} />;
      case 'tier-tickets':
        return <TierWorkflowTicketsPage onNavigate={handleNavigate} />;


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
