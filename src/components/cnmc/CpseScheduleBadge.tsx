import React from 'react';

interface CpseScheduleBadgeProps {
  schedule: 'Schedule A' | 'Schedule B' | 'Schedule C' | string;
  category?: string;
}

export const CpseScheduleBadge: React.FC<CpseScheduleBadgeProps> = ({ schedule, category }) => {
  const getBadgeClass = () => {
    switch (schedule) {
      case 'Schedule A':
        return 'badge badge-amber';
      case 'Schedule B':
        return 'badge badge-blue';
      case 'Schedule C':
        return 'badge badge-gray';
      default:
        return 'badge badge-gray';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span className={getBadgeClass()}>{schedule}</span>
      {category && (
        <span className="badge badge-gray" style={{ fontSize: '9.5px', fontFamily: 'monospace' }}>
          {category}
        </span>
      )}
    </div>
  );
};
