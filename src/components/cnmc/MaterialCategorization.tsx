import React, { useState } from 'react';
import { ShieldAlert, Package, Layers, Search, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
const MOCK_CNMC_MATERIALS: any[] = [
  {
    id: 'cnmc-001',
    code: 'CNMC-COAL-COK-001',
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
    code: 'CNMC-MEC-VLV-002',
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
    code: 'CNMC-ELE-TRF-008',
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
    code: 'CNMC-PMP-SUB-014',
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
    code: 'CNMC-MEC-BRG-222',
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
    code: 'CNMC-CHE-LUB-505',
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

  const filteredMaterials = MOCK_CNMC_MATERIALS.filter((mat) => {
    const matchesCat = selectedCategory === 'ALL' || mat.category === selectedCategory;
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.cpseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mat.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 3 Tier Overview Cards */}
      <div className="cnmc-grid">
        {/* Category A */}
        <div className="cnmc-card tier-a">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-cat-a">CATEGORY A</span>
            <ShieldAlert size={18} color="var(--accent-red)" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Strategic & Critical Materials
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Prime Coking Coal, Rare Earths, High-Grade Alloys. 24/7 autonomous monitoring & zero-inventory breach protocols.
          </div>
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tracked Assets:</span>
            <span style={{ color: 'var(--accent-red)' }}>3 Critical Items</span>
          </div>
        </div>

        {/* Category B */}
        <div className="cnmc-card tier-b">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-cat-b">CATEGORY B</span>
            <Package size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Essential Operational Supplies
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Thermal Coal, Heavy Haul Dump Spares, Subsea Assemblies. Automated lead time tracking & replenishment.
          </div>
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tracked Assets:</span>
            <span style={{ color: '#92700a' }}>3 Essential Items</span>
          </div>
        </div>

        {/* Category C */}
        <div className="cnmc-card tier-c">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge badge-cat-c">CATEGORY C</span>
            <Layers size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Standard Consumable Stores
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Industrial Lubricants, Hardware, Fasteners, General Store Items. Scheduled batch compliance audits.
          </div>
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tracked Assets:</span>
            <span style={{ color: 'var(--accent-blue)' }}>2 Standard Items</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="panel-card" style={{ padding: '12px 18px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-row">
          {(['ALL', 'Category A', 'Category B', 'Category C'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tab ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="t-search">
          <Search size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search material or CPSE..."
            style={{ width: '220px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-panel">
        <div className="table-panel-header">
          <div className="table-panel-title">CNMC Material Sovereign Registry & Critical Stock Levels</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Material Code & Description</th>
              <th>CNMC Category</th>
              <th>Assigned CPSE</th>
              <th>Stock vs Buffer</th>
              <th>Unit Price</th>
              <th>Lead Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((mat) => {
              const isBreach = mat.status.includes('Low') || mat.criticality.includes('BREACH');

              return (
                <tr key={mat.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mat.name}</div>
                    <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{mat.code}</div>
                  </td>
                  <td>
                    <span className={`badge ${mat.category === 'Category A' ? 'badge-cat-a' : mat.category === 'Category B' ? 'badge-cat-b' : 'badge-cat-c'}`}>
                      {mat.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{mat.cpseName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--accent-blue)' }}>{mat.cpseCode}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{mat.stockLevel}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safety: {mat.safetyBuffer}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {mat.pricePerUnit}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {mat.leadTimeDays} days
                    </span>
                  </td>
                  <td>
                    {isBreach ? (
                      <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={11} /> BREACH RISK
                      </span>
                    ) : (
                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} /> OPTIMAL
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
