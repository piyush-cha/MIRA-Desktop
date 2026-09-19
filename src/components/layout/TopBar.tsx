import React from 'react';
import { Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getOfficerMeta } from './Sidebar';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  const { user } = useAuthStore();
  const officer = getOfficerMeta(user?.fullName, user?.roleCode);

  return (
    <div className="top-bar">
      <div className="breadcrumb">
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{title}</span>
        {subtitle && <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>/ {subtitle}</span>}
      </div>

      <div className="top-bar-actions">
        {user?.scope && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '16px' }}>
            Scope: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.scope}</span>
          </div>
        )}
        
        <button className="icon-btn" title="Help">
          <HelpCircle size={16} />
        </button>
        <button className="icon-btn" title="Notifications">
          <Bell size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{officer.displayName}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
              <span className="profile-designation-badge" style={{ fontSize: '9px', padding: '0 4px' }}>{officer.designation}</span>
            </div>
          </div>
          <div className="profile-avatar" style={{ width: '30px', height: '30px', borderRadius: '8px', fontSize: '11px' }}>
            {officer.initials}
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
};
