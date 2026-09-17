import React from 'react';

interface MiraLogoBadgeProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  dark?: boolean;
}

export const MiraLogoBadge: React.FC<MiraLogoBadgeProps> = ({
  size = 32,
  showText = false,
  subtitle,
  dark = false,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      {/* Crisp Vector MIRA Emblem */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size > 30 ? '8px' : '6px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0D9488 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* M Geometric Lattice */}
          <path
            d="M3 19V5L12 12L21 5V19"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#34D399" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: dark ? '#FFFFFF' : '#0F172A',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            MIRA
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: dark ? 'rgba(255,255,255,0.6)' : '#64748B',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
