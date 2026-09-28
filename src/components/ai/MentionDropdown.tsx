import React from 'react';
import { Building2, Layout, Component, Bot } from 'lucide-react';
import { MentionItem } from '../../store/voiceStore';


interface MentionDropdownProps {
  query: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({ query, onSelect, onClose }) => {
  const filterText = query.toLowerCase();

  const allItems: MentionItem[] = [

    // Pages
    { id: 'page-national', type: 'page', label: '@NationalGovernance', description: 'National Sovereign Grid' },
    { id: 'page-onboarding', type: 'page', label: '@CpseOnboarding', description: 'Onboard CPSE & Dispatch Credentials' },
    { id: 'page-cnmc', type: 'page', label: '@CnmcMaterials', description: 'MIRA Category A, B, C Strategic Materials' },
    { id: 'page-admin', type: 'page', label: '@CpseAdmin', description: 'Scoped CPSE Admin View' },

    // Components
    { id: 'comp-kpi', type: 'component', label: '@KPIStrip', description: 'National Sovereign KPI Matrix' },
    { id: 'comp-escalation', type: 'component', label: '@EscalationQueue', description: 'Cross-CPSE Priority Queue' },
    { id: 'comp-mat-matrix', type: 'component', label: '@MaterialCategorization', description: 'MIRA Strategic Tier Matrix' },

    // Bots
    { id: 'bot-jarvis', type: 'bot', label: '@MIRA_Jarvis', description: 'Autonomous Governance Voice Core' },
  ];

  const filteredItems = allItems.filter(item =>
    item.label.toLowerCase().includes(filterText) ||
    item.description.toLowerCase().includes(filterText)
  );

  return (
    <div className="mention-popup">
      <div style={{ padding: '8px 14px', background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Select Mention (@)
        </span>
        <span onClick={onClose} style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close</span>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
          No mentions matching "{query}"
        </div>
      ) : (
        filteredItems.map(item => (
          <div
            key={item.id}
            className="mention-item"
            onClick={() => onSelect(item)}
          >
            <div>
              <div className="mention-item-title">{item.label}</div>
              <div className="mention-item-desc">{item.description}</div>
            </div>
            <span className="badge badge-gray">{item.type}</span>
          </div>
        ))
      )}
    </div>
  );
};
