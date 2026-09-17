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
  Network,
  FolderTree,
  Cpu,
  Factory,
  Package,
  ArrowRightLeft,
  FilePlus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { MiraLogoBadge } from '../common/MiraLogoBadge';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();

  const isPlantUser = user?.roleCode === 'PLANT_USER' || user?.roleCode === 'AREA_ADMIN';
  const isCpseAdmin = user?.roleCode === 'CPSE_ADMIN';

  return (
    <div className="sidebar">
      {/* Official MIRA Logo Header */}
      <div className="sidebar-logo">
        <MiraLogoBadge size={34} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="sidebar-logo-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isPlantUser 
              ? `${user?.cpseCode || 'PLANT'} OPERATIONS` 
              : isCpseAdmin 
                ? `${user?.cpseCode || 'CPSE'} ENTERPRISE` 
                : 'MIRA SOVEREIGN'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isPlantUser 
              ? (user?.roleCode === 'AREA_ADMIN' ? 'Area Materials HQ' : 'Plant Operations') 
              : isCpseAdmin 
                ? 'Nodal Enterprise Admin' 
                : 'National Governance'}
          </div>
        </div>
      </div>

      {/* Global Search Placeholder */}
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
                className={`nav-item ${currentPage === 'cnmc' ? 'active' : ''}`}
                onClick={() => onNavigate('cnmc')}
              >
                <Globe2 size={16} />
                <span>CNMC Golden Master</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}
                onClick={() => onNavigate('audit')}
              >
                <FileCheck size={16} />
                <span>Audit & Compliance</span>
              </button>
            </div>
          </>
        ) : isCpseAdmin ? (
          <>
            <div className="nav-section-title">{user?.cpseCode || 'CPSE'} Operations</div>
            <div className="nav-grid">
              <button
                className={`nav-item ${currentPage === 'admin' || currentPage === 'cpse-portal' ? 'active' : ''}`}
                onClick={() => onNavigate('admin')}
              >
                <Activity size={16} />
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
                className={`nav-item ${currentPage === 'admin-collab' ? 'active' : ''}`}
                onClick={() => onNavigate('admin-collab')}
              >
                <Network size={16} />
                <span>Inter-Plant Network</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'admin-hierarchy' ? 'active' : ''}`}
                onClick={() => onNavigate('admin-hierarchy')}
              >
                <FolderTree size={16} />
                <span>Plant Hierarchy</span>
              </button>
              <button
                className={`nav-item ${currentPage === 'admin-catalog' ? 'active' : ''}`}
                onClick={() => onNavigate('admin-catalog')}
              >
                <Layers size={16} />
                <span>Catalog Studio</span>
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
                <span>Audit & Compliance</span>
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
                className={`nav-item ${currentPage === 'onboarding' ? 'active' : ''}`}
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
