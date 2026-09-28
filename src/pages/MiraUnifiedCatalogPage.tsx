import React, { useState, useEffect } from 'react';
import { 
  Globe2, Search, Filter, Plus, ShieldCheck, Copy, Check, ExternalLink,
  Layers, Cpu, Building2, Hash, AlertTriangle, ArrowRight, Eye, Sparkles,
  BookOpen, CheckCircle2, ChevronRight, X, Info, Tag, RefreshCw, LayoutGrid, List,
  Award, FileCheck, CheckSquare, ChevronDown, ChevronUp, Link as LinkIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface MappedCpse {
  cpse: string;
  plant?: string;
  local_code?: string;
  local_description?: string;
  unit_price?: string;
  match_confidence?: string;
  interchangeable?: boolean;
}

interface UnifiedMaterial {
  id: string;
  human_code: string;
  machine_urn: string;
  extracted_noun: string;
  core_physics: string;
  variant: string;
  raw_material_composition: string;
  status: string;
  domain_code: string;
  category_code: string;
  category_name: string;
  criticality: 'Category A' | 'Category B' | 'Category C' | string;
  technical_attributes: Record<string, any>;
  mapped_cpses: MappedCpse[];
  approval_reason: string;
  approval_authority: string;
  ratification_order: string;
  created_by: string;
  approved_by: string;
  created_at: string;
}

export const MiraUnifiedCatalogPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<UnifiedMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Interactive state
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<UnifiedMaterial | null>(null);
  const [expandedCpseCards, setExpandedCpseCards] = useState<Record<string, boolean>>({});

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUnifiedCatalog({
        search: searchQuery,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        criticality: selectedCriticality !== 'ALL' ? selectedCriticality : undefined,
        status: 'RATIFIED' // strictly government approved
      });
      setMaterials(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedCriticality]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const toggleExpandCpses = (id: string) => {
    setExpandedCpseCards(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const categoryOptions = [
    { code: 'ALL', label: 'All Domains' },
    { code: 'BRG', label: 'Bearings' },
    { code: 'VAL', label: 'Valves' },
    { code: 'MOT', label: 'Electric Motors' },
    { code: 'PIPE', label: 'Piping & Tubes' },
    { code: 'PUMP', label: 'Process Pumps' },
    { code: 'FAST', label: 'Fasteners' },
    { code: 'XMIT', label: 'Instruments' },
    { code: 'PLT', label: 'Structural Steel' }
  ];

  const getCpseBadgeColor = (cpse: string) => {
    switch (cpse.toUpperCase()) {
      case 'BHEL':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'NTPC':
        return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
      case 'SAIL':
        return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      case 'ONGC':
        return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
      case 'IOCL':
        return { bg: '#fefce8', text: '#a16207', border: '#fef08a' };
      case 'COAL_INDIA':
      case 'COAL INDIA':
        return { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' };
      default:
        return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
    }
  };

  return (
    <>
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="National Unified Master"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
        
        {/* Clean Sovereign National Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>
              <ShieldCheck size={12} />
              CNMC National MASTER
            </div>
            <h3 className="section-title" style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              MIRA Sovereign Unified Material Master
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '800px' }}>
              Displaying Government Approved & Ratified CNMC Standard Codes with standardized physical definitions and cross-CPSE ERP links.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => fetchCatalog()}
              className="gov-btn secondary small"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('open_tier1_modal', 'true');
                onNavigate('tier-tickets');
              }}
              className="gov-btn primary small"
              title="Propose uncataloged new material through Tier 1 Induction Workflow"
            >
              <Plus size={14} />
              Propose New Material (Tier 1)
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Sovereign Catalog by CNMC Code, URN, Noun, Grade, or CPSE code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-card-alt)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Criticality Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Criticality:</span>
              <div style={{ display: 'flex', background: 'var(--bg-card-alt)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                {['ALL', 'Category A', 'Category B', 'Category C'].map((crit) => (
                  <button
                    key={crit}
                    type="button"
                    onClick={() => setSelectedCriticality(crit)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: selectedCriticality === crit ? 700 : 500,
                      borderRadius: '4px',
                      border: 'none',
                      background: selectedCriticality === crit ? 'var(--bg-card)' : 'transparent',
                      color: selectedCriticality === crit ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: selectedCriticality === crit ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {crit}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid / Table Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-card-alt)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{
                  padding: '6px 9px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'grid' ? '#2563eb' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  padding: '6px 9px',
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'table' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'table' ? '#2563eb' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Domain Category Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {categoryOptions.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => setSelectedCategory(cat.code)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: selectedCategory === cat.code ? 700 : 500,
                  borderRadius: '20px',
                  border: selectedCategory === cat.code ? '1px solid #1B2332' : '1px solid var(--border-light)',
                  background: selectedCategory === cat.code ? '#1B2332' : 'var(--bg-card)',
                  color: selectedCategory === cat.code ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Loading Government-Approved Sovereign Catalog...</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Querying verified CNMC Unified codes, approval orders, and cross-CPSE bridges</div>
          </div>
        ) : error ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 700 }}>Error loading Unified Master Catalog</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{error}</div>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
            <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>No Approved Sovereign Standard Found</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '6px auto 16px auto' }}>
              Only materials officially approved & ratified by the Government are displayed here. You can initiate a new material induction application through the Tier 1 workflow.
            </div>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('open_tier1_modal', 'true');
                onNavigate('tier-tickets');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              Propose New Material (Tier 1 Induction)
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
            {materials.map((mat) => {
              const critColor = 
                mat.criticality === 'Category A' ? { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' } :
                mat.criticality === 'Category B' ? { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' } :
                { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };

              const isExpanded = !!expandedCpseCards[mat.id];
              const visibleCpses = isExpanded ? mat.mapped_cpses : (mat.mapped_cpses || []).slice(0, 2);

              return (
                <div
                  key={mat.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '8px', borderBottom: '1px solid var(--border-light)' }}>
                    <div
                      onClick={() => handleCopy(mat.human_code)}
                      style={{ background: '#4f46e5', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      # {mat.human_code} {copiedText === mat.human_code ? <Check size={10} /> : <Copy size={10} />}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle2 size={10} /> RATIFIED
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{mat.ratification_order || 'GOV-RAT-2026-STD'}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${critColor.border}`, color: critColor.text, background: critColor.bg, fontWeight: 700 }}>
                      {mat.criticality}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{mat.extracted_noun}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{mat.category_name}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mat.core_physics}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569', border: '1px solid #e2e8f0' }}>{mat.raw_material_composition}</span>
                        {mat.variant && (
                          <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569', border: '1px solid #e2e8f0' }}>{mat.variant}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                        CPSEs:
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }} onClick={() => setSelectedMaterial(mat)}>
                      Inspect Specs <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>MIRA Sovereign Code & URN</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>What Is It? (Description)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Gov Approval Reason</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Linked CPSE Equivalents</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Criticality</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#1d4ed8', fontFamily: 'monospace' }}>
                        {mat.human_code}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mat.machine_urn}
                      </div>
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <ShieldCheck size={10} /> GOV APPROVED
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mat.extracted_noun}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '260px' }}>{mat.core_physics}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Spec: {mat.raw_material_composition}</div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: '#fffbeb', padding: '4px 6px', borderRadius: '6px', border: '1px solid #fde68a', lineHeight: 1.4 }}>
                        {mat.approval_reason}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {mat.mapped_cpses?.map((c, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px' }}>
                            <span style={{ fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>
                              {c.cpse}
                            </span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                              {c.local_code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: mat.criticality === 'Category A' ? '#fef2f2' : mat.criticality === 'Category B' ? '#fffbeb' : '#eff6ff',
                        color: mat.criticality === 'Category A' ? '#dc2626' : mat.criticality === 'Category B' ? '#d97706' : '#2563eb'
                      }}>
                        {mat.criticality}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMaterial(mat)}
                        style={{
                          background: 'var(--bg-card-alt)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          color: '#2563eb',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </AppShell>

      {/* Detail Slide-Over / Modal */}
      {selectedMaterial && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '620px',
            background: 'var(--bg-card)',
            maxHeight: '90vh',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  <ShieldCheck size={14} />
                  SPECIFICATION DETAILS
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                  {selectedMaterial.human_code}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* 1. What is this Material? */}
              <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>
                  SPECIFICATION
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedMaterial.extracted_noun}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{selectedMaterial.core_physics}</div>
              </div>

              {/* 2. Government Ratification Reason */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  <Award size={14} />
                  RATIFICATION BASIS:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{selectedMaterial.approval_reason}"
                </div>
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Approving Body: <b style={{ color: 'var(--text-secondary)' }}>{selectedMaterial.approval_authority}</b></span>
                  <span>Order Ref: <b style={{ color: 'var(--text-secondary)' }}>{selectedMaterial.ratification_order}</b></span>
                </div>
              </div>

              {/* 3. Same Material Linked Across CPSEs */}
              {selectedMaterial.mapped_cpses && selectedMaterial.mapped_cpses.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={14} />
                    LINKED CPSEs ({selectedMaterial.mapped_cpses.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedMaterial.mapped_cpses.map((m, idx) => {
                      const badge = getCpseBadgeColor(m.cpse);
                      return (
                        <div key={idx} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-alt)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                {m.cpse}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '11px', color: '#18181b' }}>{m.plant || 'National Reserve'}</span>
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                              {m.unit_price}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              Local Code: {m.local_code || 'Mapped'}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                              ✓ 100% Identical Physical Match
                            </span>
                          </div>

                          {m.local_description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              "{m.local_description}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Specifications Table */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Standard Technical Parameters</div>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card-alt)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)', width: '40%' }}>Material Composition</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMaterial.raw_material_composition}</td>
                      </tr>
                      {selectedMaterial.variant && (
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Variant / Sizing</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{selectedMaterial.variant}</td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card-alt)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Domain / Category</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{selectedMaterial.domain_code} — {selectedMaterial.category_name} ({selectedMaterial.category_code})</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Criticality Tier</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{selectedMaterial.criticality}</td>
                      </tr>
                      {Object.entries(selectedMaterial.technical_attributes || {}).map(([k, v], idx) => (
                        <tr key={k} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 1 ? 'var(--bg-card-alt)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontFamily: typeof v === 'number' ? 'monospace' : 'inherit' }}>{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sovereign Governance Footnote */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>Ratified by: <b>{selectedMaterial.approval_authority}</b></div>
                <div>Ratification Gazette: <b>{selectedMaterial.ratification_order}</b></div>
                <div>Approval Timestamp: {selectedMaterial.created_at ? new Date(selectedMaterial.created_at).toLocaleString() : 'Active Sovereign State'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};