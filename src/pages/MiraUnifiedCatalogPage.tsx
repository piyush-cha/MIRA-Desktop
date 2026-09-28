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
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedCpseCards, setExpandedCpseCards] = useState<Record<string, boolean>>({});

  // Create Form State
  const [createForm, setCreateForm] = useState({
    domain_code: 'MECH',
    category_code: 'VAL',
    extracted_noun: '',
    core_physics: '',
    variant: '',
    raw_material_composition: '',
    criticality: 'Category B',
    approval_reason: '',
    human_code: 'MIRA-7842019',
    custom_attribute_key: '',
    custom_attribute_value: '',
    technical_attributes: {} as Record<string, string>
  });
  const [creating, setCreating] = useState<boolean>(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

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

  const fetchSuggestedCode = async (mode: 'random' | 'sequential' = 'random') => {
    try {
      const res = await api.suggestUnifiedCode({ mode, category: createForm.category_code });
      if (res && res.code) {
        setCreateForm(prev => ({
          ...prev,
          human_code: res.code
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch suggested code from API:', e);
      const rand = Math.floor(1000000 + Math.random() * 9000000);
      setCreateForm(prev => ({ ...prev, human_code: `MIRA-${rand}` }));
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      fetchSuggestedCode('random');
    }
  }, [showCreateModal]);

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

  const handleAddAttribute = () => {
    if (createForm.custom_attribute_key.trim() && createForm.custom_attribute_value.trim()) {
      setCreateForm({
        ...createForm,
        technical_attributes: {
          ...createForm.technical_attributes,
          [createForm.custom_attribute_key.trim()]: createForm.custom_attribute_value.trim()
        },
        custom_attribute_key: '',
        custom_attribute_value: ''
      });
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const next = { ...createForm.technical_attributes };
    delete next[key];
    setCreateForm({ ...createForm, technical_attributes: next });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.extracted_noun.trim() || !createForm.core_physics.trim()) {
      alert("Please provide the Extracted Noun and Core Physics Description.");
      return;
    }

    setCreating(true);
    try {
      const res = await api.createUnifiedCode({
        domain_code: createForm.domain_code,
        category_code: createForm.category_code,
        extracted_noun: createForm.extracted_noun,
        core_physics: createForm.core_physics,
        variant: createForm.variant,
        raw_material_composition: createForm.raw_material_composition,
        criticality: createForm.criticality,
        approval_reason: createForm.approval_reason || "Approved by National Governance Authority as sovereign unified engineering standard.",
        technical_attributes: createForm.technical_attributes,
        human_code: previewHumanCode,
        created_by: user?.email || 'national.admin@gov.in'
      });

      setCreateSuccessMsg(`MIRA Standard ${res.data?.human_code || previewHumanCode} ratified successfully by Government!`);
      setTimeout(() => {
        setCreateSuccessMsg(null);
        setShowCreateModal(false);
        // Reset form
        setCreateForm({
          domain_code: 'MECH',
          category_code: 'VAL',
          extracted_noun: '',
          core_physics: '',
          variant: '',
          raw_material_composition: '',
          criticality: 'Category B',
          approval_reason: '',
          human_code: 'MIRA-1000014',
          custom_attribute_key: '',
          custom_attribute_value: '',
          technical_attributes: {}
        });
      }, 1600);

      await fetchCatalog();
    } catch (err) {
      alert(`Creation failed: ${getApiErrorMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  // Preview generated codes for creation modal - 7 digit numeric standard
  const codeNumMatch = (createForm.human_code || '').match(/\d{7}/);
  const previewCodeNum = codeNumMatch ? codeNumMatch[0] : (1000000 + materials.length + 1).toString();
  const previewHumanCode = `MIRA-${previewCodeNum}`;
  const previewSlug = (createForm.core_physics || 'standard-spec')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 32)
    .replace(/^-|-$/g, '') || 'standard-spec';
  const previewUrn = `urn:mira:${previewCodeNum}:${createForm.category_code.toLowerCase()}:${previewSlug}:v1`;

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
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="National Unified Master"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
        
        {/* Sovereign National Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-40px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#6ee7b7', marginBottom: '10px' }}>
                <ShieldCheck size={13} />
                OFFICIALLY APPROVED BY GOVERNMENT OF INDIA • MIRA NATIONAL MASTER
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                MIRA Sovereign Unified Material Master
              </h1>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8', maxWidth: '720px', lineHeight: 1.5 }}>
                Displaying exclusively Government Approved & Ratified MIRA Standard Codes. Each sovereign material displays its standardized physical definition, formal ratification order, and verified identical cross-CPSE ERP links.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => fetchCatalog()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <Plus size={15} />
                Propose & Mint Sovereign Code
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Gov-Approved Standards</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{materials.length} Standard Codes</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Taxonomy Domains</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa', marginTop: '2px' }}>8 Technical Sectors</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Cross-CPSE Silo Bridges</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>44 Multi-Plant Links</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Ratification Status</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>100% Gov Approved</div>
            </div>
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
                placeholder="Search by 7-digit MIRA Code (e.g. MIRA-6321523), URN, Noun, Grade, or CPSE local code..."
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
                  border: selectedCategory === cat.code ? '1px solid #2563eb' : '1px solid var(--border-light)',
                  background: selectedCategory === cat.code ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card)',
                  color: selectedCategory === cat.code ? '#2563eb' : 'var(--text-secondary)',
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
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Querying verified MIRA Unified codes, approval orders, and cross-CPSE bridges</div>
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
              Only materials officially approved & ratified by the Government are displayed here. You can mint a new sovereign standard proposal.
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              Propose Sovereign Standard
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
                    borderRadius: '14px',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Government Approval Header Banner */}
                  <div style={{
                    padding: '12px 18px',
                    background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
                    borderBottom: '1px solid #bbf7d0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <ShieldCheck size={16} color="#059669" />
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065f46', letterSpacing: '0.02em' }}>
                        APPROVED BY GOVERNMENT OF INDIA
                      </span>
                    </div>

                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: critColor.bg,
                      color: critColor.text,
                      border: `1px solid ${critColor.border}`
                    }}>
                      {mat.criticality}
                    </span>
                  </div>

                  {/* Card Main Body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    
                    {/* SECTION 1: Our MIRA Sovereign Material Code */}
                    <div style={{ background: 'var(--bg-card-alt)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} />
                          SOVEREIGN MIRA UNIFIED CODE (7-DIGIT)
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>
                          Order: {mat.ratification_order || 'GOV-RAT-2026-STD'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div
                          onClick={() => handleCopy(mat.human_code)}
                          title="Click to copy 7-digit MIRA Code"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#2563eb',
                            color: '#ffffff',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                            letterSpacing: '0.03em'
                          }}
                        >
                          <Hash size={13} />
                          <code>{mat.human_code}</code>
                          {copiedText === mat.human_code ? <Check size={12} color="#ffffff" /> : <Copy size={12} style={{ opacity: 0.8 }} />}
                        </div>

                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={11} /> RATIFIED
                        </span>
                      </div>

                      {/* Explicit Connection to Machine Code */}
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.05)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>
                          <Cpu size={11} />
                          <span>CONNECTED SOVEREIGN MACHINE CODE:</span>
                        </div>
                        <div
                          onClick={() => handleCopy(mat.machine_urn)}
                          title="Click to copy Connected Machine URN"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-card)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            color: '#475569',
                            fontFamily: 'monospace',
                            border: '1px solid var(--border-light)',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {mat.machine_urn}
                          </span>
                          {copiedText === mat.machine_urn ? <Check size={11} color="#16a34a" /> : <Copy size={11} style={{ flexShrink: 0, marginLeft: '6px' }} />}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: What is it? (Standard Description & Physics) */}
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                        WHAT IS THIS MATERIAL? (SPECIFICATION)
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {mat.extracted_noun}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                        {mat.core_physics}
                      </div>

                      {/* Technical Specs Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                          <b>Spec:</b> {mat.raw_material_composition}
                        </span>
                        {mat.variant && (
                          <span style={{ fontSize: '11px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                            <b>Variant:</b> {mat.variant}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                          <b>Domain:</b> {mat.category_name} ({mat.category_code})
                        </span>
                      </div>
                    </div>

                    {/* SECTION 3: Government Approval Reason & Ratification Basis */}
                    <div style={{
                      background: '#fffbeb',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#92400e' }}>
                        <Award size={13} color="#d97706" />
                        GOVERNMENT APPROVAL REASON & RATIFICATION BASIS:
                      </div>
                      <div style={{ fontSize: '12px', color: '#78350f', lineHeight: 1.45, fontStyle: 'italic' }}>
                        "{mat.approval_reason}"
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #fef3c7', fontSize: '10.5px', color: '#b45309' }}>
                        <span>Approving Body: <b>{mat.approval_authority || mat.approved_by}</b></span>
                        <span>Ref: {mat.ratification_order || 'GOV-RAT-2026-STD'}</span>
                      </div>
                    </div>

                    {/* SECTION 4: Same Material Code Linked from Different CPSEs */}
                    <div style={{
                      background: 'var(--bg-app)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          <LinkIcon size={12} color="#2563eb" />
                          SAME MATERIAL LINKED FROM DIFFERENT CPSEs:
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#2563eb', background: 'rgba(37,99,235,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                          {mat.mapped_cpses?.length || 0} CPSEs Pooling
                        </span>
                      </div>

                      {/* CPSE Rows */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {visibleCpses.map((c, idx) => {
                          const badge = getCpseBadgeColor(c.cpse);
                          return (
                            <div
                              key={idx}
                              style={{
                                background: 'var(--bg-card)',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '3px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: badge.bg,
                                    color: badge.text,
                                    border: `1px solid ${badge.border}`
                                  }}>
                                    {c.cpse}
                                  </span>
                                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {c.plant || 'Main Operating Plant'}
                                  </span>
                                </div>
                                {c.unit_price && (
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                                    {c.unit_price}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                                  {c.local_code || 'Mapped'}
                                </span>
                                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckSquare size={10} /> 100% Identical Material
                                </span>
                              </div>

                              {c.local_description && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.local_description}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Expand / Collapse Button if more than 2 CPSEs */}
                      {mat.mapped_cpses && mat.mapped_cpses.length > 2 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandCpses(mat.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '4px 0',
                            marginTop: '2px'
                          }}
                        >
                          {isExpanded ? (
                            <>Show Fewer CPSEs <ChevronUp size={12} /></>
                          ) : (
                            <>+ View All {mat.mapped_cpses.length} Linked CPSE Equivalents <ChevronDown size={12} /></>
                          )}
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div style={{ padding: '12px 18px', background: 'var(--bg-card-alt)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Ratified: {mat.created_at ? new Date(mat.created_at).toLocaleDateString() : 'Gov Master Active'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <Eye size={13} />
                      Inspect Full Sovereign Spec &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
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
                      <div style={{ fontSize: '11px', color: '#78350f', background: '#fffbeb', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fde68a', lineHeight: 1.4 }}>
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
          justifyContent: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            maxWidth: '620px',
            background: 'var(--bg-card)',
            height: '100%',
            boxShadow: '-6px 0 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#065f46' }}>
                  <ShieldCheck size={14} color="#059669" />
                  GOVERNMENT RATIFIED SPECIFICATION POINTER
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
              <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  WHAT IS THIS MATERIAL? (CORE SPECIFICATION)
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedMaterial.extracted_noun}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{selectedMaterial.core_physics}</div>
              </div>

              {/* 2. Government Ratification Reason */}
              <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#92400e', marginBottom: '6px' }}>
                  <Award size={15} color="#d97706" />
                  GOVERNMENT APPROVAL REASON & RATIFICATION BASIS:
                </div>
                <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{selectedMaterial.approval_reason}"
                </div>
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #fef3c7', fontSize: '11px', color: '#b45309', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Approving Body: <b>{selectedMaterial.approval_authority}</b></span>
                  <span>Order Ref: <b>{selectedMaterial.ratification_order}</b></span>
                </div>
              </div>

              {/* 3. Machine Code Connection */}
              <div style={{ background: 'rgba(37, 99, 235, 0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Cpu size={13} color="#2563eb" />
                    CONNECTED SOVEREIGN MACHINE CODE (URN)
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                    Sovereign Twin Bound
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMaterial.machine_urn}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMaterial.machine_urn)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}
                  >
                    <Copy size={12} /> Copy URN
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Sovereign Standard Code <b>{selectedMaterial.human_code}</b> is bi-directionally mapped to this machine URN for zero-error ERP & SCADA procurement interchange.
                </div>
              </div>

              {/* 4. Same Material Linked Across CPSEs */}
              {selectedMaterial.mapped_cpses && selectedMaterial.mapped_cpses.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={14} color="#2563eb" />
                    SAME PHYSICAL MATERIAL LINKED ACROSS CPSEs ({selectedMaterial.mapped_cpses.length} ENTERPRISES):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedMaterial.mapped_cpses.map((m, idx) => {
                      const badge = getCpseBadgeColor(m.cpse);
                      return (
                        <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card-alt)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                {m.cpse}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#18181b' }}>{m.plant || 'National Reserve'}</span>
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

      {/* Create Unified Code Modal */}
      {showCreateModal && (
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
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>NATIONAL SOVEREIGN REGISTRATION</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Mint & Ratify New MIRA Standard Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              {createSuccessMsg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  {createSuccessMsg}
                </div>
              )}

              {/* Domain & Category Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Domain</label>
                  <select
                    value={createForm.domain_code}
                    onChange={(e) => setCreateForm({ ...createForm, domain_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="ELEC">Electrical & Power (ELEC)</option>
                    <option value="PIPE">Piping & Boiler Pressure (PIPE)</option>
                    <option value="FAST">Fasteners & Hardware (FAST)</option>
                    <option value="INST">Instrumentation & Controls (INST)</option>
                    <option value="STL">Structural & Alloy Steel (STL)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Category Code</label>
                  <select
                    value={createForm.category_code}
                    onChange={(e) => setCreateForm({ ...createForm, category_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="VAL">VAL — Valves & Actuators</option>
                    <option value="BRG">BRG — Bearings & Bushings</option>
                    <option value="MOT">MOT — Motors & Drivers</option>
                    <option value="PIPE">PIPE — Pipes & Tubes</option>
                    <option value="PUMP">PUMP — Process Pumps</option>
                    <option value="FAST">FAST — Studs & Fasteners</option>
                    <option value="XMIT">XMIT — Transmitters & Gauges</option>
                    <option value="PLT">PLT — Steel Plates & Structurals</option>
                  </select>
                </div>
              </div>

              {/* Suggested 7-Digit MIRA Code & Generation Buttons */}
              <div style={{ background: 'var(--bg-card-alt)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={12} color="#2563eb" />
                    Suggested MIRA Unified Code (7-Digit Numeric) *
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => fetchSuggestedCode('random')}
                      title="Generate a random 7-digit identifier"
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#2563eb'
                      }}
                    >
                      <Sparkles size={11} /> Random 7-Digit
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchSuggestedCode('sequential')}
                      title="Use the next sequential 7-digit serial number"
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#16a34a'
                      }}
                    >
                      <Hash size={11} /> Next Sequential
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="e.g. MIRA-7842019"
                  value={createForm.human_code}
                  onChange={(e) => setCreateForm({ ...createForm, human_code: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #2563eb',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    background: 'var(--bg-card)'
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Standard Sovereign Format: <b>MIRA-1XXXXXX</b> (7-digit number) directly bound to the sovereign machine code below.
                </div>
              </div>

              {/* Standard Extracted Noun */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Standard Extracted Noun *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUTTERFLY VALVE, BALL BEARING, CENTRIFUGAL PUMP"
                  value={createForm.extracted_noun}
                  onChange={(e) => setCreateForm({ ...createForm, extracted_noun: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Core Physics Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  What is this material? (Core Physics Description) *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Triple Offset High Performance Butterfly Valve 6-Inch Class 150 Lug Type Lugged Inconel Seat"
                  value={createForm.core_physics}
                  onChange={(e) => setCreateForm({ ...createForm, core_physics: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Approval Reason Input */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Government Approval Reason & Ratification Basis *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved under National Standard Harmonization Order #GOV-2026: Standardized across Indian PSUs to eliminate multi-enterprise redundant inventory and institute unified sovereign rate parity."
                  value={createForm.approval_reason}
                  onChange={(e) => setCreateForm({ ...createForm, approval_reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Variant & Material Grade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Variant / Sizing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 INCH / CLASS 150 / LUG"
                    value={createForm.variant}
                    onChange={(e) => setCreateForm({ ...createForm, variant: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Material Composition / Grade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASTM A216 WCB / Disc SS316"
                    value={createForm.raw_material_composition}
                    onChange={(e) => setCreateForm({ ...createForm, raw_material_composition: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Criticality Tier */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Criticality Tier
                </label>
                <select
                  value={createForm.criticality}
                  onChange={(e) => setCreateForm({ ...createForm, criticality: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                >
                  <option value="Category A">Category A — Strategic & Critical (24/7 Zero Breach Protocol)</option>
                  <option value="Category B">Category B — Essential Operational Supplies</option>
                  <option value="Category C">Category C — Standard Consumable Stores</option>
                </select>
              </div>

              {/* Technical Attributes Builder */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Technical Parameters (Physical Attributes)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Key (e.g. pressure_rating)"
                    value={createForm.custom_attribute_key}
                    onChange={(e) => setCreateForm({ ...createForm, custom_attribute_key: e.target.value })}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 150 Bar)"
                    value={createForm.custom_attribute_value}
                    onChange={(e) => setCreateForm({ ...createForm, custom_attribute_value: e.target.value })}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    style={{ padding: '7px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-medium)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>

                {Object.keys(createForm.technical_attributes).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'var(--bg-app)', padding: '8px', borderRadius: '6px' }}>
                    {Object.entries(createForm.technical_attributes).map(([k, v]) => (
                      <span key={k} style={{ fontSize: '11px', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <b>{k}:</b> {v}
                        <X size={11} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => handleRemoveAttribute(k)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Preview Box */}
              <div style={{ background: 'var(--bg-card-alt)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                  <Sparkles size={13} />
                  LIVE SOVEREIGN POINTER & MACHINE URN BINDING PREVIEW
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#1e40af' }}>
                  <Hash size={14} />
                  <code>{previewHumanCode}</code>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                    7-Digit Sovereign Serial
                  </span>
                </div>

                {/* Connected Machine Code */}
                <div style={{ marginTop: '8px', padding: '8px 10px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                    <Cpu size={12} />
                    CONNECTED SOVEREIGN MACHINE CODE (URN):
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#334155', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {previewUrn}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontStyle: 'italic' }}>
                    * Bi-directional sovereign resolution: <b>{previewCodeNum}</b> directly binds the human master to the machine URN.
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-medium)', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '8px 20px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {creating ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Mint & Ratify Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};
�import React, { useState, useEffect } from 'react';
import { 
  Globe2, Search, Filter, Plus, ShieldCheck, Copy, Check, ExternalLink,
  Layers, Cpu, Building2, Hash, AlertTriangle, ArrowRight, Eye, Sparkles,
  BookOpen, CheckCircle2, ChevronRight, X, Info, Tag, RefreshCw, LayoutGrid, List,
  Award, FileCheck, CheckSquare, ChevronDown, ChevronUp, Link as LinkIcon,
  GitPullRequest
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
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedCpseCards, setExpandedCpseCards] = useState<Record<string, boolean>>({});

  // Tier 1 Intake Requisition Form State
  const [createForm, setCreateForm] = useState({
    cpse_name: user?.cpseCode || 'BHEL',
    plant_name: 'Trichy Heavy Boiler Plant',
    legacy_code: '',
    domain_code: 'MECH',
    category_code: 'VAL',
    extracted_noun: '',
    core_physics: '',
    variant: '',
    raw_material_composition: '',
    criticality: 'Category B',
    approval_reason: '',
    human_code: 'MIRA-7842019',
    custom_attribute_key: '',
    custom_attribute_value: '',
    technical_attributes: {} as Record<string, string>,
    created_by: user?.fullName || 'Store Incharge'
  });
  const [creating, setCreating] = useState<boolean>(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

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

  const fetchSuggestedCode = async (mode: 'random' | 'sequential' = 'random') => {
    try {
      const res = await api.suggestUnifiedCode({ mode, category: createForm.category_code });
      if (res && res.code) {
        setCreateForm(prev => ({
          ...prev,
          human_code: res.code
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch suggested code from API:', e);
      const rand = Math.floor(1000000 + Math.random() * 9000000);
      setCreateForm(prev => ({ ...prev, human_code: `MIRA-${rand}` }));
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      fetchSuggestedCode('random');
    }
  }, [showCreateModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedCriticality]);

  useEffect(() => {
    const handleSelectMaterial = (e: any) => {
      const item = e.detail;
      if (!item) return;
      if (item.human_code || item.code) {
        setSearchQuery(item.human_code || item.code);
      }
      if (item.mapped_cpses) {
        setSelectedMaterial(item);
      } else {
        const found = materials.find(m => m.human_code === (item.human_code || item.code));
        if (found) {
          setSelectedMaterial(found);
        } else {
          setSelectedMaterial({
            id: item.id,
            human_code: item.human_code || item.code,
            machine_urn: item.machine_urn || `urn:mira:std:${item.human_code || item.code}`,
            extracted_noun: item.noun || item.extracted_noun,
            core_physics: item.description || item.core_physics,
            variant: item.variant || 'Standard',
            raw_material_composition: item.spec || item.raw_material_composition || 'Industrial Grade',
            status: item.status || 'RATIFIED',
            domain_code: item.domain_code || 'MECH',
            category_code: item.category_code || 'GEN',
            category_name: item.category_name || item.domain || 'Engineering',
            criticality: item.criticality || 'Category B',
            technical_attributes: item.physics_attributes || {},
            mapped_cpses: item.all_mapped_cpses || (item.own_code ? [{
              cpse: item.user_cpse || user?.cpseCode || 'BHEL',
              plant: item.own_plant,
              local_code: item.own_code,
              local_description: item.own_description,
              unit_price: item.own_price,
              match_confidence: '100% Identical Physical Match'
            }] : []),
            approval_reason: 'Ratified sovereign standard specification.',
            approval_authority: 'MIRA Sovereign Technical Council',
            ratification_order: item.ratification_order || 'GOV-RAT-2026',
            created_by: 'MIRA National Vault',
            approved_by: 'Sovereign Ratification Council',
            created_at: new Date().toISOString()
          });
        }
      }
    };

    window.addEventListener('mira-select-material', handleSelectMaterial);
    return () => window.removeEventListener('mira-select-material', handleSelectMaterial);
  }, [materials, user?.cpseCode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const toggleExpandCpses = (id: string) => {
    setExpandedCpseCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddAttribute = () => {
    if (createForm.custom_attribute_key.trim() && createForm.custom_attribute_value.trim()) {
      setCreateForm({
        ...createForm,
        technical_attributes: {
          ...createForm.technical_attributes,
          [createForm.custom_attribute_key.trim()]: createForm.custom_attribute_value.trim()
        },
        custom_attribute_key: '',
        custom_attribute_value: ''
      });
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const next = { ...createForm.technical_attributes };
    delete next[key];
    setCreateForm({ ...createForm, technical_attributes: next });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.extracted_noun.trim() || !createForm.core_physics.trim()) {
      alert("Please provide the Item Standard Name and Core Engineering Description.");
      return;
    }

    setCreating(true);
    try {
      const cpse = createForm.cpse_name || user?.cpseCode || 'BHEL';
      const legacy = createForm.legacy_code.trim() || `${cpse}-${createForm.category_code}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const res = await api.createTierTicket({
        cpse_name: cpse,
        plant_name: createForm.plant_name || 'Plant Unit 1',
        item_name: createForm.extracted_noun,
        legacy_code: legacy,
        raw_description: createForm.core_physics,
        specification: createForm.variant || 'Standard Engineering Specification',
        priority: createForm.criticality,
        domain_code: createForm.domain_code,
        category_code: createForm.category_code,
        initial_reason: createForm.approval_reason || `Statutory indent intake for ${createForm.extracted_noun}.`,
        created_by: createForm.created_by || user?.fullName || 'Store Incharge'
      });

      setCreateSuccessMsg(`Tier 1 Requisition Ticket ${res.ticket_number || 'TCK-2026'} created successfully! Dispatched into Tier 1 ➔ Tier 7 pipeline. It will be added to this National Master only after Tier 7 Government Approval.`);
      setTimeout(() => {
        setCreateSuccessMsg(null);
        setShowCreateModal(false);
        onNavigate('tier-tickets');
      }, 2500);
    } catch (err) {
      alert(`Requisition submission failed: ${getApiErrorMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  // Preview generated codes for creation modal - 7 digit numeric standard
  const codeNumMatch = (createForm.human_code || '').match(/\d{7}/);
  const previewCodeNum = codeNumMatch ? codeNumMatch[0] : (1000000 + materials.length + 1).toString();
  const previewHumanCode = `MIRA-${previewCodeNum}`;
  const previewSlug = (createForm.core_physics || 'standard-spec')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 32)
    .replace(/^-|-$/g, '') || 'standard-spec';
  const previewUrn = `urn:mira:${previewCodeNum}:${createForm.category_code.toLowerCase()}:${previewSlug}:v1`;

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
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="National Unified Master"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
        
        {/* Sovereign National Hero Header - Compact & Sleek */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#ffffff',
          boxShadow: '0 6px 18px -4px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700, color: '#6ee7b7', marginBottom: '4px' }}>
                <ShieldCheck size={12} />
                OFFICIALLY APPROVED BY GOV OF INDIA • MIRA NATIONAL MASTER
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                MIRA Sovereign Unified Material Master
              </h1>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.4 }}>
                Displaying exclusively Government Approved & Ratified MIRA Standard Codes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fetchCatalog()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Statutory 7-Tier Mandate & Compact Metrics in 1 neat bar */}
          <div style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}><b>{materials.length}</b> Standard Codes</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ color: '#a78bfa', fontWeight: 700 }}><b>{new Set(materials.map(m => m.category_code || m.domain_code).filter(Boolean)).size}</b> Domains</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}><b>{materials.reduce((acc, m) => acc + (m.mapped_cpses?.length || 0), 0)}</b> Multi-Plant Links</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}><b>{materials.length > 0 ? '100%' : '0%'}</b> Gov Ratified</span>
            </div>
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
                placeholder="Search by 7-digit MIRA Code, Machine URN, Technical Noun, Grade, or CPSE local code..."
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
                  border: selectedCategory === cat.code ? '1px solid #2563eb' : '1px solid var(--border-light)',
                  background: selectedCategory === cat.code ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card)',
                  color: selectedCategory === cat.code ? '#2563eb' : 'var(--text-secondary)',
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
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Querying verified MIRA Unified codes, approval orders, and cross-CPSE bridges</div>
          </div>
        ) : error ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 700 }}>Error loading Unified Master Catalog</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{error}</div>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldCheck size={28} color="#10b981" />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {searchQuery || selectedCategory !== 'ALL' || selectedCriticality !== 'ALL' ? 'No Matching Standard Codes Found' : 'No Mock Records Active — Sovereign Master Awaiting Ratification'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '540px', margin: '8px auto 20px auto', lineHeight: 1.5 }}>
              {searchQuery || selectedCategory !== 'ALL' || selectedCriticality !== 'ALL' 
                ? 'Try broadening your search or resetting filters to locate verified MIRA standard codes.'
                : 'All mock and synthetic sample records have been removed. In strict compliance with Government of India governance mandates, Sovereign Standard Codes (MIRA-XXXXXXX) are minted exclusively when real uncataloged plant indents pass through the 7-Tier confirmation pipeline up to Tier 7 Cabinet Ratification.'}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate('cpse-catalog')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-card-alt)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Upload / Manage Enterprise Catalog
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tier-tickets')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Track 7-Tier Statutory Workflow
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View - Ultra Compact & Short */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '12px' }}>
            {materials.map((mat) => {
              const critColor = 
                mat.criticality === 'Category A' ? { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' } :
                mat.criticality === 'Category B' ? { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' } :
                { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };

              return (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  {/* Top Bar: Code + Status + Ref + Criticality */}
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(90deg, #f0fdf4 0%, #f8fafc 100%)',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(mat.human_code);
                        }}
                        title="Click to copy 7-digit MIRA Code"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#2563eb',
                          color: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Hash size={11} />
                        <code>{mat.human_code}</code>
                        {copiedText === mat.human_code ? <Check size={10} /> : <Copy size={10} style={{ opacity: 0.7 }} />}
                      </button>

                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '1px 5px', borderRadius: '3px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <CheckCircle2 size={9} /> RATIFIED
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'monospace' }}>
                        {mat.ratification_order || 'GOV-RAT-2026'}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        background: critColor.bg,
                        color: critColor.text,
                        border: `1px solid ${critColor.border}`
                      }}>
                        {mat.criticality}
                      </span>
                    </div>
                  </div>

                  {/* Body: Title + 1-Line Description + Specs & CPSEs */}
                  <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {mat.extracted_noun}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>
                        {mat.category_name}
                      </span>
                    </div>

                    {/* Single-line Core Physics */}
                    <div style={{
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {mat.core_physics}
                    </div>

                    {/* Own CPSE local code & plant highlight */}
                    {(() => {
                      const activeCpse = (user?.cpseCode || 'BHEL').toUpperCase();
                      const ownMapping = (mat.mapped_cpses || []).find(c => c.cpse?.toUpperCase() === activeCpse);
                      if (ownMapping && ownMapping.local_code) {
                        return (
                          <div style={{
                            margin: '3px 0',
                            padding: '3px 8px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#15803d'
                          }}>
                            <span>🏢 <b>Your {user?.cpseCode || 'BHEL'} Code:</b> <code style={{ fontWeight: 800, background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>{ownMapping.local_code}</code></span>
                            <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#166534' }}>{ownMapping.plant || 'Primary Strategic Hub'}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Compact Specs & Linked CPSEs inline */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {mat.raw_material_composition && (
                          <span style={{ fontSize: '9.5px', background: 'var(--bg-app)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                            {mat.raw_material_composition}
                          </span>
                        )}
                        {mat.variant && (
                          <span style={{ fontSize: '9.5px', background: 'var(--bg-app)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                            {mat.variant}
                          </span>
                        )}
                      </div>

                      {/* Linked CPSE badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>CPSEs:</span>
                        {(mat.mapped_cpses || []).slice(0, 3).map((c, idx) => {
                          const badge = getCpseBadgeColor(c.cpse);
                          return (
                            <span
                              key={idx}
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '1px 4px',
                                borderRadius: '2px',
                                background: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              {c.cpse}
                            </span>
                          );
                        })}
                        {(mat.mapped_cpses?.length || 0) > 3 && (
                          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>
                            +{mat.mapped_cpses.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slim Footer: URN + Inspect Specs */}
                  <div style={{
                    padding: '5px 12px',
                    background: 'var(--bg-card-alt)',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(mat.machine_urn);
                      }}
                      title={`Click to copy Machine URN: ${mat.machine_urn}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '9.5px',
                        fontFamily: 'monospace',
                        color: '#64748b',
                        cursor: 'pointer',
                        maxWidth: '220px'
                      }}
                    >
                      <Cpu size={10} color="#2563eb" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mat.machine_urn.split(':').slice(-2).join(':')}
                      </span>
                      {copiedText === mat.machine_urn ? <Check size={9} color="#16a34a" /> : <Copy size={9} />}
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                      <span>Inspect Specs</span>
                      <ChevronRight size={11} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
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
                      <div style={{ fontSize: '11px', color: '#78350f', background: '#fffbeb', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fde68a', lineHeight: 1.4 }}>
                        {mat.approval_reason}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {mat.mapped_cpses?.map((c, idx) => {
                          const isOwn = c.cpse?.toUpperCase() === (user?.cpseCode || 'BHEL').toUpperCase();
                          return (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '10.5px',
                              padding: isOwn ? '2px 6px' : '0',
                              background: isOwn ? '#f0fdf4' : 'transparent',
                              borderRadius: isOwn ? '4px' : '0',
                              border: isOwn ? '1px solid #bbf7d0' : 'none'
                            }}>
                              <span style={{ fontWeight: 800, padding: '1px 5px', borderRadius: '3px', background: isOwn ? '#dcfce7' : 'rgba(37,99,235,0.08)', color: isOwn ? '#15803d' : '#2563eb' }}>
                                {c.cpse} {isOwn ? '(You)' : ''}
                              </span>
                              <span style={{ fontFamily: 'monospace', fontWeight: isOwn ? 700 : 500, color: isOwn ? '#15803d' : 'var(--text-secondary)' }}>
                                {c.local_code}
                              </span>
                              {isOwn && c.plant && (
                                <span style={{ fontSize: '9.5px', color: '#166534', fontWeight: 600 }}>• {c.plant}</span>
                              )}
                            </div>
                          );
                        })}
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

      {/* Centered Popup Modal: Government Ratified Specification Pointer */}
      {selectedMaterial && (
        <div 
          onClick={() => setSelectedMaterial(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-light, #e2e8f0)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden',
              animation: 'modalScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-light, #e2e8f0)',
              background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#065f46', letterSpacing: '0.04em' }}>
                  <ShieldCheck size={15} color="#059669" />
                  GOVERNMENT RATIFIED SPECIFICATION POINTER
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)', fontFamily: 'monospace' }}>
                    {selectedMaterial.human_code}
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMaterial.human_code)}
                    title="Click to copy Sovereign Code"
                    className={copiedText === selectedMaterial.human_code ? 'mira-pop-pulse' : ''}
                    style={{
                      background: copiedText === selectedMaterial.human_code ? '#ecfdf5' : '#f1f5f9',
                      border: `1px solid ${copiedText === selectedMaterial.human_code ? '#86efac' : '#cbd5e1'}`,
                      borderRadius: '4px',
                      color: copiedText === selectedMaterial.human_code ? '#15803d' : '#64748b',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedText === selectedMaterial.human_code ? (
                      <>
                        <Check size={12} color="#15803d" className="mira-bounce" />
                        <span style={{ fontWeight: 700 }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                    Sovereign Ratified Master
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Close Popup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
              
              {/* 1. What is this Material? */}
              <div style={{ background: 'var(--bg-app, #f8fafc)', padding: '16px 18px', borderRadius: '10px', border: '1px solid var(--border-light, #e2e8f0)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  WHAT IS THIS MATERIAL? (CORE SPECIFICATION)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>{selectedMaterial.extracted_noun}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary, #475569)', marginTop: '4px', lineHeight: 1.55 }}>{selectedMaterial.core_physics}</div>
              </div>

              {/* 2. Government Ratification Reason */}
              <div style={{ background: '#fffbeb', padding: '16px 18px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#92400e', marginBottom: '6px' }}>
                  <Award size={15} color="#d97706" />
                  GOVERNMENT APPROVAL REASON & RATIFICATION BASIS:
                </div>
                <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{selectedMaterial.approval_reason}"
                </div>
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #fef3c7', fontSize: '11px', color: '#b45309', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Approving Body: <b>{selectedMaterial.approval_authority}</b></span>
                  <span>Order Ref: <b>{selectedMaterial.ratification_order}</b></span>
                </div>
              </div>

              {/* 3. Machine Code Connection */}
              <div style={{ background: 'rgba(37, 99, 235, 0.04)', padding: '15px 18px', borderRadius: '10px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Cpu size={14} color="#2563eb" />
                    CONNECTED SOVEREIGN MACHINE CODE (URN)
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 7px', borderRadius: '4px', border: '1px solid #86efac' }}>
                    Sovereign Twin Bound
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-medium, #cbd5e1)',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMaterial.machine_urn}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMaterial.machine_urn)}
                    className={copiedText === selectedMaterial.machine_urn ? 'mira-pop-pulse' : ''}
                    style={{
                      background: copiedText === selectedMaterial.machine_urn ? '#ecfdf5' : 'transparent',
                      border: copiedText === selectedMaterial.machine_urn ? '1px solid #86efac' : 'none',
                      borderRadius: '4px',
                      padding: copiedText === selectedMaterial.machine_urn ? '3px 8px' : '2px 6px',
                      color: copiedText === selectedMaterial.machine_urn ? '#15803d' : '#2563eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      flexShrink: 0,
                      marginLeft: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedText === selectedMaterial.machine_urn ? (
                      <>
                        <Check size={12} color="#15803d" className="mira-bounce" />
                        <span style={{ fontWeight: 700 }}>Copied URN!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy URN</span>
                      </>
                    )}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #475569)', marginTop: '6px' }}>
                  Sovereign Standard Code <b>{selectedMaterial.human_code}</b> is bi-directionally mapped to this machine URN for zero-error ERP & SCADA procurement interchange.
                </div>
              </div>

              {/* 4. Same Material Linked Across CPSEs */}
              {selectedMaterial.mapped_cpses && selectedMaterial.mapped_cpses.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LinkIcon size={14} color="#2563eb" />
                    SAME PHYSICAL MATERIAL LINKED ACROSS CPSEs ({selectedMaterial.mapped_cpses.length} ENTERPRISES):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedMaterial.mapped_cpses.map((m, idx) => {
                      const isOwn = m.cpse?.toUpperCase() === (user?.cpseCode || 'BHEL').toUpperCase();
                      const badge = getCpseBadgeColor(m.cpse);
                      return (
                        <div key={idx} style={{ 
                          padding: '12px 14px', 
                          borderRadius: '8px', 
                          border: isOwn ? '2px solid #10b981' : '1px solid var(--border-light, #e2e8f0)', 
                          background: isOwn ? '#f0fdf4' : 'var(--bg-card-alt, #f8fafc)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '6px' 
                        }}>
                          {isOwn && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 800, color: '#15803d' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                              YOUR ENTERPRISE ({m.cpse}) INTERNAL ERP MAPPING & STOCK DETAILS
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: isOwn ? '#dcfce7' : badge.bg, color: isOwn ? '#15803d' : badge.text, border: `1px solid ${isOwn ? '#86efac' : badge.border}` }}>
                                {m.cpse} {isOwn ? '(You)' : ''}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '12.5px', color: '#18181b' }}>{m.plant || 'National Reserve'}</span>
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                              {m.unit_price}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 700, color: isOwn ? '#15803d' : '#1d4ed8', background: isOwn ? '#dcfce7' : 'var(--bg-card, #ffffff)', padding: '2px 8px', borderRadius: '4px', border: isOwn ? '1px solid #86efac' : '1px solid var(--border-light, #e2e8f0)' }}>
                              Local Code: {m.local_code || 'Mapped'}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700 }}>
                              ✓ 100% Identical Physical Match
                            </span>
                          </div>

                          {m.local_description && (
                            <div style={{ fontSize: '12px', color: isOwn ? '#166534' : 'var(--text-secondary, #475569)', marginTop: '2px', fontStyle: 'italic' }}>
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
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: '8px' }}>Standard Technical Parameters</div>
                <div style={{ border: '1px solid var(--border-light, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', background: 'var(--bg-card-alt, #f8fafc)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary, #475569)', width: '38%' }}>Material Composition</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{selectedMaterial.raw_material_composition}</td>
                      </tr>
                      {selectedMaterial.variant && (
                        <tr style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Variant / Sizing</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-primary, #0f172a)' }}>{selectedMaterial.variant}</td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', background: 'var(--bg-card-alt, #f8fafc)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Domain / Category</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary, #0f172a)' }}>{selectedMaterial.domain_code} — {selectedMaterial.category_name} ({selectedMaterial.category_code})</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>Criticality Tier</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary, #0f172a)' }}>{selectedMaterial.criticality}</td>
                      </tr>
                      {Object.entries(selectedMaterial.technical_attributes || {}).map(([k, v], idx) => (
                        <tr key={k} style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', background: idx % 2 === 1 ? 'var(--bg-card-alt, #f8fafc)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary, #475569)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-primary, #0f172a)', fontFamily: typeof v === 'number' ? 'monospace' : 'inherit' }}>{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sovereign Governance Footnote */}
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light, #e2e8f0)', fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>Ratified by: <b>{selectedMaterial.approval_authority}</b></div>
                <div>Ratification Gazette: <b>{selectedMaterial.ratification_order}</b></div>
                <div>Approval Timestamp: {selectedMaterial.created_at ? new Date(selectedMaterial.created_at).toLocaleString() : 'Active Sovereign State'}</div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div style={{
              padding: '14px 24px',
              backgroundColor: 'var(--bg-card-alt, #f8fafc)',
              borderTop: '1px solid var(--border-light, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>
                Sovereign Code: <b style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedMaterial.human_code}</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedMaterial.human_code)}
                  className={copiedText === selectedMaterial.human_code ? 'mira-pop-pulse' : ''}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: copiedText === selectedMaterial.human_code ? '#ecfdf5' : '#ffffff',
                    border: `1.5px solid ${copiedText === selectedMaterial.human_code ? '#10b981' : '#cbd5e1'}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: copiedText === selectedMaterial.human_code ? '#065f46' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: copiedText === selectedMaterial.human_code ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: copiedText === selectedMaterial.human_code 
                      ? '0 0 0 3px rgba(16, 185, 129, 0.2), 0 2px 8px rgba(16, 185, 129, 0.25)' 
                      : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {copiedText === selectedMaterial.human_code ? (
                    <>
                      <Check size={14} color="#059669" className="mira-bounce" />
                      <span style={{ fontWeight: 700, color: '#047857' }}>Copied Code!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating Copy Toast Pill */}
      {copiedText && (
        <div 
          className="mira-toast-slide"
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: '30px',
            boxShadow: '0 14px 34px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12.5px',
            fontWeight: 600,
            zIndex: 100000,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
          }}>
            <Check size={12} color="#ffffff" strokeWidth={3} className="mira-bounce" />
          </div>
          <span>
            Copied <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{copiedText.length > 28 ? copiedText.slice(0, 28) + '...' : copiedText}</b> to clipboard!
          </span>
        </div>
      )}

      {/* Create Unified Code Modal */}
      {showCreateModal && (
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
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', background: 'var(--bg-card-alt)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STATUTORY 7-TIER MATERIAL INTAKE
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Initiate Tier 1 Material Requisition Indent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mandatory Statutory Notice */}
            <div style={{
              margin: '16px 24px 0 24px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: '12px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45
            }}>
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <b>Statutory Governance Rule:</b> Materials <b>cannot</b> be added directly to this National Master.
                Your requisition enters at <b>Tier 1 (Plant Floor)</b> and must receive progressive confirmation across 
                <b>Tier 1 ➔ Tier 7 (Cabinet Sovereign Oversight)</b>. Only after Government Approval at Tier 7 is the official 
                7-digit MIRA code minted and published to this catalog.
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '16px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              {createSuccessMsg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{createSuccessMsg}</span>
                </div>
              )}

              {/* CPSE & Plant Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    CPSE Enterprise *
                  </label>
                  <select
                    value={createForm.cpse_name}
                    onChange={(e) => setCreateForm({ ...createForm, cpse_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="BHEL">BHEL</option>
                    <option value="NTPC">NTPC</option>
                    <option value="ONGC">ONGC</option>
                    <option value="SAIL">SAIL</option>
                    <option value="IOCL">IOCL</option>
                    <option value="COAL INDIA">COAL INDIA</option>
                    <option value="GAIL">GAIL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Plant / Operating Unit *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Trichy Heavy Boiler Plant"
                    value={createForm.plant_name}
                    onChange={(e) => setCreateForm({ ...createForm, plant_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Item Name & Legacy Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Item Standard Name / Noun *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Pressure Butterfly Valve 600#"
                    value={createForm.extracted_noun}
                    onChange={(e) => setCreateForm({ ...createForm, extracted_noun: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    CPSE Legacy Material Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BHEL-TR-VLV-4910"
                    value={createForm.legacy_code}
                    onChange={(e) => setCreateForm({ ...createForm, legacy_code: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Domain & Category Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Domain</label>
                  <select
                    value={createForm.domain_code}
                    onChange={(e) => setCreateForm({ ...createForm, domain_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="ELEC">Electrical & Power (ELEC)</option>
                    <option value="PIPE">Piping & Boiler Pressure (PIPE)</option>
                    <option value="FAST">Fasteners & Hardware (FAST)</option>
                    <option value="INST">Instrumentation & Controls (INST)</option>
                    <option value="STL">Structural & Alloy Steel (STL)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>Category Code</label>
                  <select
                    value={createForm.category_code}
                    onChange={(e) => setCreateForm({ ...createForm, category_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="VAL">VAL — Valves & Actuators</option>
                    <option value="BRG">BRG — Bearings & Bushings</option>
                    <option value="MOT">MOT — Motors & Drivers</option>
                    <option value="PIPE">PIPE — Pipes & Tubes</option>
                    <option value="PUMP">PUMP — Process Pumps</option>
                    <option value="FAST">FAST — Studs & Fasteners</option>
                    <option value="XMIT">XMIT — Transmitters & Gauges</option>
                    <option value="PLT">PLT — Steel Plates & Structurals</option>
                  </select>
                </div>
              </div>

              {/* Core Physics Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Raw Engineering Description (Core Physics) *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Triple eccentric high pressure steam isolation butterfly valve with stellite hardfaced seat"
                  value={createForm.core_physics}
                  onChange={(e) => setCreateForm({ ...createForm, core_physics: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Variant / Specs & Criticality */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Physical Specification / Variant
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DN 300, PN 100, WCB Body, RTJ Flanged"
                    value={createForm.variant}
                    onChange={(e) => setCreateForm({ ...createForm, variant: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Criticality Tier
                  </label>
                  <select
                    value={createForm.criticality}
                    onChange={(e) => setCreateForm({ ...createForm, criticality: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-card)', fontSize: '12.5px' }}
                  >
                    <option value="Category A">Category A — Critical (Breakdown / Overhaul Risk)</option>
                    <option value="Category B">Category B — Standard Operating Spares</option>
                    <option value="Category C">Category C — General Consumables</option>
                  </select>
                </div>
              </div>

              {/* Initial Requisition Justification */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Initial Requisition Justification *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Urgent boiler replacement unit requested for Unit 3 annual overhaul schedule."
                  value={createForm.approval_reason}
                  onChange={(e) => setCreateForm({ ...createForm, approval_reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Indenting Officer */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Indenting Storekeeper / Officer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. R. Sundaram (Store Incharge)"
                  value={createForm.created_by}
                  onChange={(e) => setCreateForm({ ...createForm, created_by: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border-medium)', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '8px 22px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {creating ? <RefreshCw size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                  <span>Submit Tier 1 Indent & Dispatch to Tier 2</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};
2ө�����
8��	"P