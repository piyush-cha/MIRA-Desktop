#import React, { useState, useEffect } from 'react';

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

        'cnmc', 'cross-cpse', 'expert-reviews', 'data-quality', 

        'legacy-codes', 'policies', 'users-roles'

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

�4import React, { useState, useEffect } from 'react';

import { useAuthStore } from './store/authStore';

import { LoginPage } from './pages/LoginPage/LoginPage';

import { NationalGovernancePage } from './pages/NationalGovernancePage/NationalGovernancePage';

import { CpseDirectoryPage } from './pages/CpseDirectoryPage/CpseDirectoryPage';

import { CpseOnboardingPage } from './pages/CpseOnboardingPage/CpseOnboardingPage';

import { CpseAdminPortalPage } from './pages/CpseAdminPortalPage/CpseAdminPortalPage';

import { MiraUnifiedCatalogPage } from './pages/MiraUnifiedCatalogPage/MiraUnifiedCatalogPage';

import { CrossCpseIntelPage } from './pages/CrossCpseIntelPage/CrossCpseIntelPage';

import { ExpertReviewsPage } from './pages/ExpertReviewsPage/ExpertReviewsPage';

import { DataQualityPage } from './pages/DataQualityPage/DataQualityPage';

import { LegacyCodesPage } from './pages/LegacyCodesPage/LegacyCodesPage';

import { SystemPoliciesPage } from './pages/SystemPoliciesPage/SystemPoliciesPage';

import { AuditCompliancePage } from './pages/AuditCompliancePage/AuditCompliancePage';

import { UsersRolesPage } from './pages/UsersRolesPage/UsersRolesPage';

import { SapSettingsPage } from './pages/SapSettingsPage/SapSettingsPage';

import { ProfilePage } from './pages/ProfilePage/ProfilePage';

import { TierWorkflowTicketsPage } from './pages/TierWorkflowTicketsPage/TierWorkflowTicketsPage';

import { GovMasterApprovalsPage } from './pages/GovMasterApprovalsPage/GovMasterApprovalsPage';

import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';

import { MiraFloatingBot } from './components/ai/MiraFloatingBot';



export default function App() {

  const { isAuthenticated, user } = useAuthStore();

  const rawRole = user?.roleCode || '';

  const normalizedRole = 

    rawRole.includes('TIER_5') || rawRole.includes('CPSE_ADMIN') || rawRole.includes('CPSE_HQ') ? 'CPSE_ADMIN' :

    rawRole.includes('TIER_4') || rawRole.includes('ZONE') ? 'ZONE_ADMIN' :

    rawRole.includes('TIER_3') || rawRole.includes('AREA') ? 'AREA_ADMIN' :

    rawRole.includes('TIER_2') || rawRole.includes('TIER_1') || rawRole.includes('PLANT') ? 'PLANT_USER' :

    rawRole.includes('GOV') || rawRole.includes('NATIONAL') ? 'NATIONAL_GOVERNANCE' :

    rawRole;

  const isEnterpriseUser = ['CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER'].includes(normalizedRole);

  const isCpseAdmin = normalizedRole === 'CPSE_ADMIN';

  const [currentPage, setCurrentPage] = useState<string>(() => {

    const path = window.location.pathname.replace(/^\//, '');

    if (path) return path;

    return isEnterpriseUser ? 'cpse-overview' : 'national';

  });



  useEffect(() => {

    const handlePopState = () => {

      const path = window.location.pathname.replace(/^\//, '');

      if (path) setCurrentPage(path);

    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);

  }, []);



  // Guard routes if role is CPSE Admin

  useEffect(() => {

    if (isAuthenticated && isEnterpriseUser) {

      const nationalOnly = [

        'national', 'onboarding', 'cpses', 'onboard-new', 

        'cross-cpse', 'master-approvals', 'gov-approvals', 'master-nominations',

        'data-quality', 'policies'

      ];

      if (nationalOnly.includes(currentPage)) {

        setCurrentPage('cpse-overview');

      }

    }

  }, [isAuthenticated, isEnterpriseUser, currentPage]);



  if (!isAuthenticated) {

    return <LoginPage onSuccessLogin={(role) => setCurrentPage(['CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER'].includes(role) ? 'cpse-overview' : 'national')} />;

  }



  const handleNavigate = (page: string) => {

    setCurrentPage(page);

    window.history.pushState(null, '', `/${page}`);

  };



  const renderPage = () => {

    switch (currentPage) {

      case 'national':

        return isEnterpriseUser 

          ? <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="overview" /> 

          : <NationalGovernancePage onNavigate={handleNavigate} />;

      case 'onboarding':

      case 'cpses':

        return isEnterpriseUser 

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

      case 'mira-catalog':

      case 'national-master':

        return <MiraUnifiedCatalogPage onNavigate={handleNavigate} />;

      case 'master-approvals':

      case 'gov-approvals':

      case 'master-nominations':

        return isEnterpriseUser 

          ? <CpseAdminPortalPage onNavigate={handleNavigate} initialTab="catalog" /> 

          : <GovMasterApprovalsPage onNavigate={handleNavigate} />;

      case 'tier-tickets':

      case 'tier-workflow':

      case 'request-tickets':

        return <TierWorkflowTicketsPage onNavigate={handleNavigate} />;

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

2˗������8"��
H