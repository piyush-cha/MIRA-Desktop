import React from 'react';
import { 
  Globe2, 
  Building2, 
  Layers, 
  Search, 
  LogOut, 
  ShieldCheck,
  FileCheck,
  Activity,
  AlertTriangle,
  FileText,
  UserCircle,
  FolderTree,
  Network,
  Cpu,
  Lock,
  LayoutDashboard,
  Factory,
  Package,
  ArrowRightLeft,
  FilePlus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const getOfficerMeta = (fullName?: string, roleCode?: string, cpseName?: string) => {
  if (!fullName) {
    return {
      displayName: 'Authorized Officer',
      designation: roleCode === 'CPSE_ADMIN' ? (cpseName || 'CPSE Admin') : (roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance'),
      initials: 'AO',
      roleLabel: roleCode === 'CPSE_ADMIN' ? 'Enterprise' : 'Governance'
    };
  }

  // Handle compound titles like "Dr. A. P. Sharma — DG, DPE"
  const parts = fullName.split(/\s*[—–-]\s*/);
  const displayName = parts[0].trim();
  const designation = parts[1]?.trim() || (
    roleCode === 'CPSE_ADMIN'
      ? (cpseName || 'CPSE Enterprise Nodal')
      : (roleCode === 'NATIONAL_GOVERNANCE' ? 'DG, DPE' : roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance')
  );

  // Compute smart monogram initials: "Dr. A. P. Sharma" -> "AS", "COALINDIA Nodal Administrator" -> "CA"
  const nameWithoutHonorific = displayName.replace(/^(Dr\.|Prof\.|Shri\.|Smt\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const tokens = nameWithoutHonorific.split(/\s+/).filter(Boolean);

  let initials = 'AO';
  if (tokens.length === 1) {
    initials = tokens[0].slice(0, 2).toUpperCase();
  } else if (tokens.length >= 2) {
    const firstChar = tokens[0].replace(/[^a-zA-Z]/g, '')[0] || tokens[0][0];
    const lastChar = tokens[tokens.length - 1].replace(/[^a-zA-Z]/g, '')[0] || tokens[tokens.length - 1][0];
    initials = (firstChar + lastChar).toUpperCase();
  } else {
    initials = displayName.slice(0, 2).toUpperCase();
  }

  const roleLabel = roleCode === 'CPSE_ADMIN' ? 'CPSE Admin' : (roleCode === 'NATIONAL_GOVERNANCE' ? 'National Governance' : roleCode ? roleCode.replace(/_/g, ' ') : 'Sovereign');

  return { displayName, designation, initials, roleLabel };
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();
  const isPlantUser = user?.roleCode === 'PLANT_USER' || user?.roleCode === 'AREA_ADMIN';
  const isCpseAdmin = user?.roleCode === 'CPSE_ADMIN';
  const officer = getOfficerMeta(user?.fullName, user?.roleCode, user?.cpseName || user?.cpseCode || undefined);

  return (
    <div className="sidebar">
      {/* Brand Header: Bifurcated for Plant Operations, CPSE Enterprise, or Sovereign Governance */}
      {isPlantUser ? (
        <div className="sidebar-logo">
          <img 
            src="/mira-logo.png" 
            alt="MIRA Logo" 
            style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'contain' }} 
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sidebar-logo-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.cpseCode || 'PLANT'} OPERATIONS
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.roleCode === 'AREA_ADMIN' ? 'Area Materials HQ' : 'Plant Operations'}
            </div>
          </div>
        </div>
      ) : isCpseAdmin ? (
        <div className="sidebar-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <img 
              src="/mira-logo.png" 
              alt="MIRA Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} 
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="sidebar-logo-text" style={{ fontSize: '13px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>MIRA ENTERPRISE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.cpseName || 'Coal India Limited'}
              </div>
            </div>
          </div>
          <div style={{ 
            fontSize: '9.5px', 
            fontWeight: 700, 
            padding: '3px 8px', 
            background: 'rgba(37,99,235,0.08)', 
            color: '#2563eb', 
            borderRadius: '12px', 
            border: '1px solid rgba(37,99,235,0.22)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Lock size={10} color="#2563eb" />
            <span>ENTERPRISE SILO: <b>{user?.cpseCode || 'COALINDIA'}</b></span>
          </div>
        </div>
      ) : (
        <div className="sidebar-logo">
          <img 
            src="/mira-logo.png" 
            alt="MIRA Logo" 
            style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'contain' }} 
          />
          <div>
            <div className="sidebar-logo-text">MIRA SOVEREIGN</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
              National Governance
            </div>
          </div>
        </div>
      )}

      {/* Global or Local Search */}
      <div className="sidebar-search">
        <Search size={14} />
        <input 
          type="text" 
          placeholder={isPlantUser ? "Search local store inventory, bins..." : isCpseAdmin ? `Search ${user?.cpseCode || 'CPSE'} inventory, plants...` : "Search materials, CNMC, CPSEs..."} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--text-primary)', 
            fontSize: '12px',
            width: '100%'
          }} 
        />
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {isPlantUser ? (
          <>
            <div className="nav-section-title">Plant Operations</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'plant-dashboard' || currentPage === 'plant-inv' ? 'active' : ''}`}
                onClick={() => onNavigate('plant-dashboard')}
              >
                <Package size={16} />
                <span>Store Inventory & Bins</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'plant-transfers' ? 'active' : ''}`}
                onClick={() => onNavigate('plant-transfers')}
              >
                <ArrowRightLeft size={16} />
                <span>Inter-Plant Corridors</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'plant-indents' ? 'active' : ''}`}
                onClick={() => onNavigate('plant-indents')}
              >
                <FilePlus size={16} />
                <span>Fast Indents & SAP PR</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'plant-consumption' ? 'active' : ''}`}
                onClick={() => onNavigate('plant-consumption')}
              >
                <Activity size={16} />
                <span>Buffer Health & Runway</span>
              </button>
            </div>

            <div className="nav-section-title">Enterprise Systems</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'sap-settings' ? 'active' : ''}`}
                onClick={() => onNavigate('sap-settings')}
              >
                <Cpu size={16} />
                <span>SAP S/4HANA Gateway</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}
                onClick={() => onNavigate('audit')}
              >
                <FileCheck size={16} />
                <span>Enterprise Audit Trail</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cnmc' ? 'active' : ''}`}
                onClick={() => onNavigate('cnmc')}
              >
                <Globe2 size={16} />
                <span>CNMC Golden Master</span>
              </button>
            </div>
          </>
        ) : isCpseAdmin ? (
          <>
            <div className="nav-section-title">Enterprise Operations</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'admin' || currentPage === 'cpse-portal' || currentPage === 'cpse-overview' ? 'active' : ''}`}
                onClick={() => onNavigate('cpse-overview')}
              >
                <LayoutDashboard size={16} />
                <span>Executive Dashboard</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'plant-dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('plant-dashboard')}
              >
                <Factory size={16} color="#2563EB" />
                <span style={{ fontWeight: 700, color: '#2563EB' }}>Plant & Area Portal</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cpse-catalog' || currentPage === 'admin-catalog' ? 'active' : ''}`}
                onClick={() => onNavigate('cpse-catalog')}
              >
                <Layers size={16} />
                <span>Material Catalog Studio</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cpse-hierarchy' || currentPage === 'admin-hierarchy' ? 'active' : ''}`}
                onClick={() => onNavigate('cpse-hierarchy')}
              >
                <FolderTree size={16} />
                <span>Plant Hierarchy & Nodes</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cpse-collaboration' || currentPage === 'admin-collab' ? 'active' : ''}`}
                onClick={() => onNavigate('cpse-collaboration')}
              >
                <Network size={16} />
                <span>Inter-Plant Collaboration</span>
              </button>
            </div>

            <div className="nav-section-title">ERP & Compliance</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'cpse-sap' ? 'active' : ''}`}
                onClick={() => onNavigate('cpse-sap')}
              >
                <Cpu size={16} />
                <span>SAP S/4HANA & PRs</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}
                onClick={() => onNavigate('audit')}
              >
                <FileCheck size={16} />
                <span>Enterprise Audit Trail</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'sap-settings' ? 'active' : ''}`}
                onClick={() => onNavigate('sap-settings')}
              >
                <Activity size={16} />
                <span>SAP Gateway Settings</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="nav-section-title">National Governance</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'national' ? 'active' : ''}`}
                onClick={() => onNavigate('national')}
              >
                <Globe2 size={16} />
                <span>Overview</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'onboarding' || currentPage === 'cpses' ? 'active' : ''}`}
                onClick={() => onNavigate('onboarding')}
              >
                <Building2 size={16} />
                <span>CPSEs Directory</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cnmc' ? 'active' : ''}`}
                onClick={() => onNavigate('cnmc')}
              >
                <Layers size={16} />
                <span>CNMC Governance</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'expert-reviews' ? 'active' : ''}`}
                onClick={() => onNavigate('expert-reviews')}
              >
                <ShieldCheck size={16} />
                <span>Expert Reviews</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'data-quality' ? 'active' : ''}`}
                onClick={() => onNavigate('data-quality')}
              >
                <AlertTriangle size={16} />
                <span>Data Quality</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'cross-cpse' ? 'active' : ''}`}
                onClick={() => onNavigate('cross-cpse')}
              >
                <Activity size={16} />
                <span>Cross-CPSE Intel</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`}
                onClick={() => onNavigate('admin')}
              >
                <Building2 size={16} color="#2563eb" />
                <span style={{ fontWeight: 600, color: '#2563eb' }}>CPSE Silo Inspector</span>
              </button>
            </div>

            <div className="nav-section-title">System & Governance</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'legacy-codes' ? 'active' : ''}`}
                onClick={() => onNavigate('legacy-codes')}
              >
                <Layers size={16} />
                <span>Legacy Codes</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'policies' ? 'active' : ''}`}
                onClick={() => onNavigate('policies')}
              >
                <FileText size={16} />
                <span>Policies</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}
                onClick={() => onNavigate('audit')}
              >
                <FileCheck size={16} />
                <span>Audit & Compliance</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'users-roles' ? 'active' : ''}`}
                onClick={() => onNavigate('users-roles')}
              >
                <UserCircle size={16} />
                <span>Users & Roles</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'sap-settings' ? 'active' : ''}`}
                onClick={() => onNavigate('sap-settings')}
              >
                <Cpu size={16} />
                <span>SAP S/4HANA Gateway</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Sovereign Officer Profile Bar (SAP S/4HANA Enterprise Layout) */}
      <div className="sidebar-profile-row">
        <div 
          className="sidebar-profile" 
          onClick={() => onNavigate('profile')} 
          title="Open Sovereign Officer Profile & Security MFA"
        >
          <div className="sidebar-avatar-wrapper">
            <div className="profile-avatar">
              {officer.initials}
            </div>
            <span className="sidebar-avatar-status" title="Active Sovereign Session" />
          </div>

          <div className="sidebar-profile-info">
            <div className="profile-name" title={officer.displayName}>
              {officer.displayName}
            </div>
            <div className="profile-role-meta">
              <span className="profile-designation-badge">{officer.designation}</span>
              <span className="profile-role-text">{officer.roleLabel}</span>
            </div>
          </div>
        </div>

        <button 
          className="sidebar-logout-btn"
          onClick={logout}
          title="Sign Out (Sovereign Session)"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
};
