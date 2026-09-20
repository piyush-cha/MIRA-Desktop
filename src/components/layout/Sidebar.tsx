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
  UserCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const getOfficerMeta = (fullName?: string, roleCode?: string) => {
  if (!fullName) {
    return {
      displayName: 'Authorized Officer',
      designation: roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance',
      initials: 'AO',
      roleLabel: 'Governance'
    };
  }

  // Handle compound titles like "Dr. A. P. Sharma — DG, DPE"
  const parts = fullName.split(/\s*[—–-]\s*/);
  const displayName = parts[0].trim();
  const designation = parts[1]?.trim() || (roleCode === 'NATIONAL_GOVERNANCE' ? 'DG, DPE' : roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance');

  // Compute smart monogram initials: "Dr. A. P. Sharma" -> "AS"
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

  const roleLabel = roleCode === 'NATIONAL_GOVERNANCE' ? 'National Governance' : roleCode ? roleCode.replace(/_/g, ' ') : 'Sovereign';

  return { displayName, designation, initials, roleLabel };
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();
  const officer = getOfficerMeta(user?.fullName, user?.roleCode);

  return (
    <div className="sidebar">
      {/* Official MIRA Logo Header */}
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

      {/* Global Search Placeholder */}
      <div className="sidebar-search">
        <Search size={14} />
        <input 
          type="text" 
          placeholder="Search materials, CNMC, CPSEs..." 
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
            className={`nav-item ${currentPage === 'onboarding' ? 'active' : ''}`}
            onClick={() => onNavigate('onboarding')}
          >
            <Building2 size={16} />
            <span>CPSEs Directory</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'admin' || currentPage === 'cpse-portal' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            <Building2 size={16} color="#2563eb" />
            <span style={{ fontWeight: 700, color: '#2563eb' }}>CPSE Admin Portal</span>
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
            <Activity size={16} />
            <span>SAP S/4HANA Gateway</span>
          </button>
        </div>
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
