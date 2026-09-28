import React, { useState } from 'react';
import { 
  ShieldAlert, Package, Layers, Search, Clock, AlertTriangle, 
  CheckCircle2, Copy, Check, Building2, Hash 
} from 'lucide-react';

const MOCK_CNMC_MATERIALS: any[] = [
  {
    id: 'cnmc-001',
    code: 'MIRA-COAL-COK-001',
    name: 'Prime Coking Coal (Ash < 10%, CSR > 65%)',
    category: 'Category A',
    cpseName: 'Steel Authority of India (SAIL)',
    cpseCode: 'SAIL-BHI-001',
    stockLevel: '14,200 MT',
    safetyBuffer: '25,000 MT',
    pricePerUnit: '₹28,500 / MT',
    leadTimeDays: 14,
    status: 'Stock Low — BREACH RISK',
    criticality: 'BREACH_HIGH',
  },
  {
    id: 'cnmc-002',
    code: 'MIRA-MEC-VLV-002',
    name: 'High-Pressure Ball Valve 50MM ASME B16.5 1500#',
    category: 'Category A',
    cpseName: 'Oil & Natural Gas Corp (ONGC)',
    cpseCode: 'ONGC-HAZ-101',
    stockLevel: '450 Units',
    safetyBuffer: '300 Units',
    pricePerUnit: '₹145,000 / Unit',
    leadTimeDays: 45,
    status: 'Optimal Stock',
    criticality: 'OPTIMAL',
  },
  {
    id: 'cnmc-003',
    code: 'MIRA-ELE-TRF-008',
    name: 'Power Transformer 400kV 500MVA Class 0.2',
    category: 'Category A',
    cpseName: 'NTPC Limited',
    cpseCode: 'NTPC-KOR-400',
    stockLevel: '2 Spare Units',
    safetyBuffer: '4 Spare Units',
    pricePerUnit: '₹42,50,000 / Unit',
    leadTimeDays: 90,
    status: 'Stock Low',
    criticality: 'BREACH_MED',
  },
  {
    id: 'cnmc-004',
    code: 'MIRA-PMP-SUB-014',
    name: 'Heavy-Duty Submersible Slurry Pump 75kW',
    category: 'Category B',
    cpseName: 'Coal India Limited (CIL)',
    cpseCode: 'CIL-GEV-601',
    stockLevel: '18 Units',
    safetyBuffer: '15 Units',
    pricePerUnit: '₹6,80,000 / Unit',
    leadTimeDays: 21,
    status: 'Optimal Stock',
    criticality: 'OPTIMAL',
  },
  {
    id: 'cnmc-005',
    code: 'MIRA-MEC-BRG-222',
    name: 'Spherical Roller Bearing 22220-E1-K-C3',
    category: 'Category B',
    cpseName: 'Bharat Heavy Electricals (BHEL)',
    cpseCode: 'BHEL-HAR-501',
    stockLevel: '120 Units',
    safetyBuffer: '100 Units',
    pricePerUnit: '₹12,450 / Unit',
    leadTimeDays: 7,
    status: 'Optimal Stock',
    criticality: 'OPTIMAL',
  },
  {
    id: 'cnmc-006',
    code: 'MIRA-CHE-LUB-505',
    name: 'Turbine Synthetic Lubricant ISO VG 46',
    category: 'Category C',
    cpseName: 'Indian Oil Corporation (IOCL)',
    cpseCode: 'IOCL-MAT-201',
    stockLevel: '4,500 Liters',
    safetyBuffer: '2,000 Liters',
    pricePerUnit: '₹340 / L',
    leadTimeDays: 3,
    status: 'Optimal Stock',
    criticality: 'OPTIMAL',
  },
];

export const MaterialCategorization: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Category A' | 'Category B' | 'Category C'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 1800);
  };

  const filteredMaterials = MOCK_CNMC_MATERIALS.filter((mat) => {
    const matchesCat = selectedCategory === 'ALL' || mat.category === selectedCategory;
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.cpseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.cpseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="cnmc-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '90px' }}>
      {/* 3 Tier Overview Cards */}
      <div className="cnmc-grid">
        {/* Category A */}
        <div className="cnmc-card tier-a">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-cat-a">
              <span className="badge-dot" />
              CATEGORY A
            </span>
            <ShieldAlert size={20} color="var(--accent-red)" />
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Strategic & Critical Materials
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
            Prime Coking Coal, Rare Earths, High-Grade Alloys. 24/7 autonomous monitoring & zero-inventory breach protocols.
          </div>
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#64748B' }}>Tracked Assets:</span>
            <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>3 Critical Items</span>
          </div>
        </div>

        {/* Category B */}
        <div className="cnmc-card tier-b">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-cat-b">
              <span className="badge-dot" />
              CATEGORY B
            </span>
            <Package size={20} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Essential Operational Supplies
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
            Thermal Coal, Heavy Haul Dump Spares, Subsea Assemblies. Automated lead time tracking & replenishment.
          </div>
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#64748B' }}>Tracked Assets:</span>
            <span style={{ color: '#B45309', fontWeight: 700 }}>3 Essential Items</span>
          </div>
        </div>

        {/* Category C */}
        <div className="cnmc-card tier-c">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="badge badge-cat-c">
              <span className="badge-dot" />
              CATEGORY C
            </span>
            <Layers size={20} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Standard Consumable Stores
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
            Industrial Lubricants, Hardware, Fasteners, General Store Items. Scheduled batch compliance audits.
          </div>
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#64748B' }}>Tracked Assets:</span>
            <span style={{ color: '#1D4ED8', fontWeight: 700 }}>2 Standard Items</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="panel-card" style={{ padding: '14px 20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-row">
          {(['ALL', 'Category A', 'Category B', 'Category C'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tab ${selectedCategory === cat ? 'active' : ''}`}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="t-search">
          <Search size={15} color="#64748B" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search material description, CNMC Code or CPSE..."
            style={{ width: '280px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-panel">
        <div className="table-panel-header">
          <div className="table-panel-title">MIRA Material Sovereign Registry & Critical Stock Levels</div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Showing <b>{filteredMaterials.length}</b> standard items
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Material Code & Description</th>
              <th style={{ width: '13%' }}>MIRA Category</th>
              <th style={{ width: '22%' }}>Assigned CPSE</th>
              <th style={{ width: '13%' }}>Stock vs Buffer</th>
              <th style={{ width: '12%' }}>Unit Price</th>
              <th style={{ width: '10%' }}>Lead Time</th>
              <th style={{ width: '10%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((mat) => {
              const isBreach = mat.status.includes('Low') || mat.criticality.includes('BREACH');

              return (
                <tr key={mat.id}>
                  <td>
                    <div className="cnmc-mat-title">{mat.name}</div>
                    <div className="cnmc-code-container">
                      <span 
                        className="cnmc-code-chip" 
                        title="Click to copy Golden Code"
                        onClick={() => handleCopy(mat.code)}
                      >
                        <Hash size={11} className="code-prefix-icon" />
                        <code>{mat.code}</code>
                        {copiedCode === mat.code ? (
                          <span className="copied-pill">
                            <Check size={10} /> Copied
                          </span>
                        ) : (
                          <Copy size={10} className="copy-hover-icon" />
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${mat.category === 'Category A' ? 'badge-cat-a' : mat.category === 'Category B' ? 'badge-cat-b' : 'badge-cat-c'}`}>
                      <span className="badge-dot" />
                      {mat.category}
                    </span>
                  </td>
                  <td>
                    <div className="cnmc-cpse-name">{mat.cpseName}</div>
                    <div className="cnmc-cpse-code-row">
                      <span className="cpse-code-chip" title="Plant / Organization Unit Code">
                        <Building2 size={11} />
                        <code>{mat.cpseCode}</code>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="stock-level-text">{mat.stockLevel}</div>
                    <div className="safety-buffer-text">
                      <span className="buffer-label">Safety:</span>
                      <span className="buffer-val">{mat.safetyBuffer}</span>
                    </div>
                  </td>
                  <td>
                    <div className="unit-price-text">{mat.pricePerUnit}</div>
                  </td>
                  <td>
                    <div className="lead-time-chip">
                      <Clock size={12} className="lead-icon" />
                      <span>{mat.leadTimeDays} days</span>
                    </div>
                  </td>
                  <td>
                    {isBreach ? (
                      <span className="status-badge breach">
                        <AlertTriangle size={12} />
                        <span>BREACH RISK</span>
                      </span>
                    ) : (
                      <span className="status-badge optimal">
                        <CheckCircle2 size={12} />
                        <span>OPTIMAL</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
