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

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();

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
            <span>CPSEs</span>
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

      {/* Profile Bar */}
      <div className="sidebar-profile-row">
        <div 
          className="sidebar-profile" 
          style={{ cursor: 'pointer', flex: 1 }} 
          onClick={() => onNavigate('profile')} 
          title="View Sovereign Profile"
        >
          <div className="profile-avatar">
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'User'}
            </div>
            <div className="profile-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.roleCode ? user.roleCode.replace(/_/g, ' ') : ''}
            </div>
          </div>
        </div>

        <button 
          className="sidebar-logout-btn"
          onClick={logout}
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
};
