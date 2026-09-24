import React, { useState } from 'react';
import { Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getOfficerMeta } from './Sidebar';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onNavigate?: (page: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onNavigate }) => {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const officer = getOfficerMeta(user?.fullName, user?.roleCode, user?.cpseName || user?.cpseCode || undefined);
  return (
    <div className="top-bar">
      <div className="breadcrumb">
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        {subtitle && (
          <span style={{ 
            marginLeft: '8px', 
            color: 'var(--text-muted)', 
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            / {subtitle}
          </span>
        )}
      </div>

      <div className="top-bar-actions">
        {user?.roleCode === 'CPSE_ADMIN' && (
          <span style={{ 
            fontSize: '10.5px', 
            fontWeight: 700, 
            color: '#059669', 
            background: 'rgba(16, 185, 129, 0.08)', 
            padding: '3px 9px', 
            borderRadius: '12px', 
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>ENTERPRISE SILO</span>
          </span>
        )}
        {user?.scope && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '16px', whiteSpace: 'nowrap' }}>
            Scope: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.scope}</span>
          </div>
        )}
        
        <button className="icon-btn" title="Help">
          <HelpCircle size={16} />
        </button>
        <button className="icon-btn" title="Notifications">
          <Bell size={16} />
        </button>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px', cursor: 'pointer', flexShrink: 0, position: 'relative' }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {officer.displayName}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
              <span className="profile-designation-badge" style={{ fontSize: '9px', padding: '1px 5px', whiteSpace: 'nowrap' }}>
                {officer.designation}
              </span>
            </div>
          </div>
          <div className="profile-avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '11px', flexShrink: 0 }}>
            {officer.initials}
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
          
          {showDropdown && (
            <div className="profile-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-dropdown)',
              width: '180px',
              zIndex: 100,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <button className="dropdown-item" onClick={() => { if(onNavigate) onNavigate('profile'); setShowDropdown(false); }} style={{ padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                My Profile
              </button>
              <button className="dropdown-item" onClick={() => { if(onNavigate) onNavigate('sap-settings'); setShowDropdown(false); }} style={{ padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                CIL HQ Settings
              </button>
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
              <button className="dropdown-item" onClick={() => { useAuthStore.getState().logout(); window.location.reload(); }} style={{ padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--accent-red)' }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
