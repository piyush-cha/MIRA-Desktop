import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { MaterialCategorization } from '../components/cnmc/MaterialCategorization';

interface CnmcMaterialPageProps {
  onNavigate: (page: string) => void;
}

export const CnmcMaterialPage: React.FC<CnmcMaterialPageProps> = ({ onNavigate }) => {
  return (
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="CNMC Material Registry"
    >
      <div style={{ marginBottom: '8px' }}>
        <h1 className="greeting-text">CNMC Strategic Material Categorization</h1>
        <div className="greeting-sub">Coal & National Mineral Criticality Tiering — Category A, Category B, Category C</div>
      </div>

      <MaterialCategorization />
    </AppShell>
  );
};
