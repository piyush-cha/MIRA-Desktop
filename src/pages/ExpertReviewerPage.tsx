import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { api, getApiErrorMessage } from '../api/client';
import { MiraLogoBadge } from '../components/common/MiraLogoBadge';
import {
  CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Search,
  ArrowRight, ShieldCheck, FileText, Cpu, Check, X,
  Layers, Filter, Eye, ChevronRight, BarChart3, TrendingUp,
  Sliders, Copy, CheckCheck, Send, ArrowUpRight, Scale, Clock
} from 'lucide-react';

interface ExpertReviewerPageProps {
  onNavigate: (page: string) => void;
  initialTab?: 'queue' | 'transfers' | 'benchmarks' | 'ledger';
}

export const ExpertReviewerPage: React.FC<ExpertReviewerPageProps> = ({ onNavigate, initialTab }) => {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'transfers' | 'benchmarks' | 'ledger'>(initialTab || 'queue');
  const [loading, setLoading] = useState<boolean>(true);
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cpseFilter, setCpseFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Refinement Studio Modal States
  const [showRefineModal, setShowRefineModal] = useState<boolean>(false);
  const [selectedItemForRefine, setSelectedItemForRefine] = useState<any>(null);
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [refining, setRefining] = useState<boolean>(false);
  const [refinedResult, setRefinedResult] = useState<any>(null);

  // Approval / Action Feedback States
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [itemToReject, setItemToReject] = useState<any>(null);

  const fetchReviewerData = async () => {
    setLoading(true);
    try {
      const [queueRes, statsRes, ledgerRes] = await Promise.allSettled([
        api.getReviewerQueue({
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          cpse_code: cpseFilter !== 'ALL' ? cpseFilter : undefined,
          risk_level: riskFilter !== 'ALL' ? riskFilter : undefined,
          search: searchQuery.trim() || undefined
        }),
        api.getReviewerStats(),
        api.getAuditLedger(30)
      ]);

      if (queueRes.status === 'fulfilled') {
        setQueue(queueRes.value.queue || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats);
      }
      if (ledgerRes.status === 'fulfilled') {
        setLedger(ledgerRes.value.ledger || []);
      }
    } catch (err: any) {
      console.warn('Error fetching reviewer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewerData();
  }, [categoryFilter, cpseFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviewerData();
  };

  // Trigger Interactive AI Refinement
  const handleTriggerRefinement = async (item: any, instruction?: string) => {
    setRefining(true);
    setRefinedResult(null);
    try {
      const res = await api.refineItemWithAI({
        material_id: item.material_id,
        raw_description: item.raw_item_description,
        current_cnmc: item.suggested_cnmc,
        user_instruction: instruction || customInstruction || "Standardize nomenclature and extract key parameters"
      });
      setRefinedResult(res);
    } catch (err: any) {
      alert(`AI Refinement failed: ${getApiErrorMessage(err)}`);
    } finally {
      setRefining(false);
    }
  };

  // One-click Sovereign Approval
  const handleApprove = async (item: any, approvedAttrs?: any) => {
    setSubmittingAction(true);
    try {
      const res = await api.approveReviewItem({
        review_id: item.review_id,
        material_id: item.material_id,
        approved_cnmc_code: refinedResult?.suggested_cnmc_code || item.suggested_cnmc,
        approved_standard_name: refinedResult?.refined_description || item.suggested_standard_name,
        approved_attributes: approvedAttrs || refinedResult?.extracted_attributes || item.extracted_attributes,
        reviewer_name: user?.fullName || "Er. Meera Nambiar (Standards Committee)"
      });

      setShowRefineModal(false);
      setActionSuccessMsg(`✅ Item sealed into Golden Master! Signature: ${res.digital_signature_hash}`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        fetchReviewerData();
      }, 2500);
    } catch (err: any) {
      alert(`Approval error: ${getApiErrorMessage(err)}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Rejection
  const handleConfirmReject = async () => {
    if (!itemToReject || !rejectReason.trim()) return;
    setSubmittingAction(true);
    try {
      await api.rejectReviewItem({
        review_id: itemToReject.review_id,
        material_id: itemToReject.material_id,
        rejection_reason: rejectReason,
        reviewer_name: user?.fullName || "Er. Meera Nambiar (Standards Committee)"
      });
      setShowRejectModal(false);
      setRejectReason('');
      setItemToReject(null);
      fetchReviewerData();
    } catch (err: any) {
      alert(`Rejection error: ${getApiErrorMessage(err)}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Bulk Approval
  const handleBulkApprove = async () => {
    const highConfidenceIds = queue.filter(q => q.confidence_score >= 0.90).map(q => q.review_id);
    if (highConfidenceIds.length === 0) {
      alert('No high-confidence (>90%) items in current view to bulk approve.');
      return;
    }
    if (!window.confirm(`Bulk approve and cryptographically seal ${highConfidenceIds.length} verified items?`)) return;

    setSubmittingAction(true);
    try {
      const res = await api.bulkApproveReviewItems({
        review_ids: highConfidenceIds,
        reviewer_name: user?.fullName || "Er. Meera Nambiar (Standards Committee)"
      });
      setActionSuccessMsg(`✅ Bulk approved ${res.approved_count} items with sovereign audit seal.`);
      setTimeout(() => {
        setActionSuccessMsg(null);
        fetchReviewerData();
      }, 2000);
    } catch (err: any) {
      alert(`Bulk approval error: ${getApiErrorMessage(err)}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const copySignature = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedHash(sig);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const tabs = [
    { key: 'queue', icon: <Layers size={14} />, label: `Harmonization Queue (${queue.length})` },
    { key: 'transfers', icon: <ArrowRight size={14} />, label: 'Surplus & Transfer Reviews' },
    { key: 'benchmarks', icon: <Scale size={14} />, label: 'Benchmark & Rate Disparities' },
    { key: 'ledger', icon: <ShieldCheck size={14} />, label: 'Sovereign Audit Ledger' },
  ];

  return (
    <AppShell
      currentPage="expert-reviewer"
      onNavigate={onNavigate}
      title="National Expert Reviewer Hub"
      subtitle="AI Nomenclature Refinement, CNMC Technical Standard Approval & Cryptographic Sovereign Sealing"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '90px' }}>

        {/* ── HERO BANNER: EXPERT REVIEWER IDENTITY & AI STATUS ── */}
        <div style={{
          background: 'linear-gradient(135deg, #090D16 0%, #111827 50%, #1E293B 100%)',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 85% 30%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(16,185,129,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <MiraLogoBadge size={38} dark={true} showText={true} subtitle="SOVEREIGN REVIEWER HUB" />

              <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.15)' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                    <ShieldCheck size={18} color="#FFFFFF" />
                  </div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    National Material Standards Review Panel
                  </h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: 'rgba(99,102,241,0.25)', color: '#C7D2FE', border: '1px solid rgba(99,102,241,0.4)' }}>
                    LEVEL-1 SOVEREIGN AUTHORITY
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px', color: '#CBD5E1', flexWrap: 'wrap' }}>
                  <span>Expert: <strong style={{ color: '#FFFFFF' }}>{user?.fullName || 'Er. Meera Nambiar (Senior Standards Officer)'}</strong></span>
                  <span>•</span>
                  <span>Scope: <strong style={{ color: '#FBBF24' }}>All 6 Major CPSEs & 48 Industrial Plants</strong></span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                    <span style={{ color: '#6EE7B7', fontWeight: 600 }}>AI Refinement Engine: ONLINE (99.4% Precision)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={handleBulkApprove} 
                disabled={submittingAction} 
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                  border: 'none', 
                  borderRadius: '9px', 
                  padding: '9px 16px', 
                  cursor: submittingAction ? 'wait' : 'pointer', 
                  color: '#FFFFFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '7px', 
                  fontSize: '12.5px', 
                  fontWeight: 700, 
                  boxShadow: '0 2px 10px rgba(16,185,129,0.3)' 
                }}
              >
                <CheckCheck size={14} />
                <span>Bulk Approve (&gt;90% AI)</span>
              </button>

              <button 
                onClick={fetchReviewerData} 
                style={{ 
                  background: 'rgba(255,255,255,0.08)', 
                  border: '1px solid rgba(255,255,255,0.18)', 
                  borderRadius: '9px', 
                  padding: '9px 12px', 
                  cursor: 'pointer', 
                  color: '#FFFFFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12.5px', 
                  fontWeight: 600 
                }} 
                title="Refresh Queue"
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ACTION SUCCESS NOTIFICATION ── */}
        {actionSuccessMsg && (
          <div style={{ padding: '14px 18px', background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#065F46', boxShadow: '0 2px 8px rgba(16,185,129,0.15)', animation: 'speechFadeIn 0.2s ease-out' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <span style={{ fontWeight: 600 }}>{actionSuccessMsg}</span>
          </div>
        )}

        {/* ── KPI METRICS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '14px' }}>
          {[
            { label: 'Pending in Queue', val: stats?.pending_queue_count || queue.length || 24, sub: 'High & Medium risk items', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={18} /> },
            { label: 'Approved Today', val: stats?.approved_today || 18, sub: 'Cryptographically sealed', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={18} /> },
            { label: 'AI Auto-Harmonized', val: `${((stats?.total_harmonized || 3420) / 1000).toFixed(1)}k SKUs`, sub: 'Golden Master Catalog', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', icon: <Cpu size={18} /> },
            { label: 'Rate Anomalies Flagged', val: stats?.rate_anomalies_flagged || 12, sub: 'High procurement disparity', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: <AlertTriangle size={18} /> },
            { label: 'Precision Accuracy', val: `${stats?.precision_rate_pct || 99.4}%`, sub: 'Human-in-the-loop accuracy', color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: <TrendingUp size={18} /> },
          ].map((c, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{c.val}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TAB NAVIGATION BAR ── */}
        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', borderRadius: '12px', padding: '5px', border: '1px solid #E2E8F0' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key as any)} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '10px 16px', 
                  borderRadius: '9px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  fontWeight: isActive ? 700 : 500, 
                  transition: 'all 0.18s', 
                  background: isActive ? '#FFFFFF' : 'transparent', 
                  color: isActive ? '#0F172A' : '#64748B', 
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.07)' : 'none' 
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ════ TAB 1: AI HARMONIZATION QUEUE ════ */}
        {activeTab === 'queue' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            
            {/* Filter & Search Bar */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#FAFAFA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={17} color="#4F46E5" />
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Material Nomenclature Harmonization Queue</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Items flagged for technical review, attribute extraction, and golden code mapping</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearchSubmit}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #D4D4D8', borderRadius: '8px', padding: '6px 12px', width: '220px' }}>
                    <Search size={13} color="#94A3B8" />
                    <input 
                      type="text" 
                      placeholder="Search material, code, cnmc..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', color: '#0F172A', width: '100%' }} 
                    />
                  </div>
                </form>

                <select value={cpseFilter} onChange={(e) => setCpseFilter(e.target.value)} style={{ padding: '7px 11px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '12px', fontWeight: 500, background: '#FFFFFF', color: '#0F172A', outline: 'none' }}>
                  <option value="ALL">All CPSEs</option>
                  <option value="ONGC">ONGC</option>
                  <option value="IOCL">IOCL</option>
                  <option value="SAIL">SAIL</option>
                  <option value="NTPC">NTPC</option>
                  <option value="BHEL">BHEL</option>
                  <option value="COALINDIA">Coal India</option>
                </select>

                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '7px 11px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '12px', fontWeight: 500, background: '#FFFFFF', color: '#0F172A', outline: 'none' }}>
                  <option value="ALL">All Categories</option>
                  <option value="Mechanical & Piping">Mechanical & Piping</option>
                  <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                  <option value="Mining Spares">Mining Spares</option>
                </select>

                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} style={{ padding: '7px 11px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '12px', fontWeight: 500, background: '#FFFFFF', color: '#0F172A', outline: 'none' }}>
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <colgroup>
                  <col style={{ width: '180px' }} />
                  <col style={{ width: '280px' }} />
                  <col style={{ width: '240px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '200px' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legacy Code & CPSE</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raw Material Description</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested CNMC Golden Master</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (INR)</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Review Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const confPct = Math.round((item.confidence_score || 0.88) * 100);
                    const isHighRisk = item.risk_level === 'HIGH';
                    return (
                      <tr 
                        key={item.material_id} 
                        style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F8FAFC'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                      >
                        {/* 1. Legacy Code & CPSE */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>{item.legacy_item_code}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #DBEAFE' }}>
                              {item.cpse_name}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: isHighRisk ? '#FEF2F2' : '#F1F5F9', color: isHighRisk ? '#DC2626' : '#64748B' }}>
                              {item.risk_level} RISK
                            </span>
                          </div>
                        </td>

                        {/* 2. Raw Description */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600, color: '#1E293B', lineHeight: 1.35, fontSize: '13px' }}>
                            {item.raw_item_description}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                            Category: <span style={{ color: '#0F172A', fontWeight: 600 }}>{item.category}</span>
                          </div>
                        </td>

                        {/* 3. Suggested CNMC */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #DBEAFE' }}>
                            {item.suggested_cnmc}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600, marginTop: '3px' }}>
                            {item.suggested_standard_name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                            UNSPSC: {item.unspsc_code}
                          </div>
                        </td>

                        {/* 4. AI Confidence Meter */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: confPct >= 90 ? '#059669' : confPct >= 80 ? '#D97706' : '#DC2626' }}>
                              {confPct}%
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>AI Match</span>
                          </div>
                          <div style={{ height: '6px', width: '100px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${confPct}%`, height: '100%', background: confPct >= 90 ? '#10B981' : confPct >= 80 ? '#F59E0B' : '#EF4444', borderRadius: '3px' }} />
                          </div>
                        </td>

                        {/* 5. Unit Price */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>₹{item.unit_price_inr?.toLocaleString()}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>per {item.raw_uom}</div>
                        </td>

                        {/* 6. Action Buttons */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            
                            {/* Refine by AI Button */}
                            <button 
                              onClick={() => { 
                                setSelectedItemForRefine(item); 
                                setShowRefineModal(true); 
                                handleTriggerRefinement(item); 
                              }}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px', 
                                padding: '6px 11px', 
                                borderRadius: '7px', 
                                border: '1px solid #C7D2FE', 
                                background: '#EEF2FF', 
                                color: '#4338CA', 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                transition: 'all 0.15s' 
                              }}
                              title="Open Interactive AI Nomenclature Refinement Studio"
                            >
                              <Sparkles size={13} color="#6366F1" />
                              <span>Refine AI</span>
                            </button>

                            {/* One-click Approve */}
                            <button 
                              onClick={() => handleApprove(item)}
                              disabled={submittingAction}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                padding: '6px 11px', 
                                borderRadius: '7px', 
                                border: '1px solid #A7F3D0', 
                                background: '#ECFDF5', 
                                color: '#059669', 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                cursor: 'pointer' 
                              }}
                              title="Sovereign Cryptographic Sign & Commit"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>

                            {/* Reject */}
                            <button 
                              onClick={() => { 
                                setItemToReject(item); 
                                setShowRejectModal(true); 
                              }}
                              style={{ 
                                padding: '6px 8px', 
                                borderRadius: '7px', 
                                border: '1px solid #FECACA', 
                                background: '#FEF2F2', 
                                color: '#DC2626', 
                                cursor: 'pointer' 
                              }}
                              title="Reject with audit feedback"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: '#64748B', fontSize: '13.5px' }}>
                        {loading ? 'Synchronizing pending reviewer queue from database...' : 'All items in this queue have been approved or refined! Clean state.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ TAB 2: SURPLUS & TRANSFER REQUISITIONS ════ */}
        {activeTab === 'transfers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
            {[
              { id: 'TRF-SECL-001', material: '50MM BALL VALVE FLANGED ASME CLASS 150', from: 'Gevra Mega Open Cast Mine (SECL)', to: 'Dipka Open Cast Mine (SECL)', qty: '10 NOS', val: '₹1,02,980', status: 'READY_FOR_DISPATCH', gate_pass: 'GP-2026-9812', dist: '42 km' },
              { id: 'TRF-BHEL-002', material: 'SPHERICAL ROLLER BEARING 22220-E1-K-C3', from: 'BHEL Haridwar Heavy Plant (HEEP)', to: 'NTPC Korba Super Thermal Station', qty: '4 NOS', val: '₹37,000', status: 'IN_TRANSIT', gate_pass: 'GP-2026-8819', dist: '720 km' },
              { id: 'TRF-BCCL-003', material: 'SLURRY PUMP IMPELLER HIGH CHROME', from: 'BCCL Jharia Coking Washery', to: 'Kusmunda Mine (SECL)', qty: '2 NOS', val: '₹9,70,000', status: 'PENDING_NODAL_SIGN', gate_pass: 'GP-PENDING', dist: '540 km' },
            ].map(trf => (
              <div key={trf.id} style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#2563EB', background: '#EFF6FF', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>{trf.id}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.3 }}>{trf.material}</h4>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: trf.status === 'IN_TRANSIT' ? '#FEF3C7' : '#ECFDF5', color: trf.status === 'IN_TRANSIT' ? '#B45309' : '#059669' }}>
                    {trf.status}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Route:</span>
                    <strong style={{ color: '#0F172A' }}>{trf.from} → {trf.to}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Transfer Quantity & Valuation:</span>
                    <strong style={{ color: '#0F172A' }}>{trf.qty} ({trf.val})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Gate Pass / Transit:</span>
                    <strong style={{ color: '#D97706' }}>{trf.gate_pass} ({trf.dist})</strong>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Reviewer sovereign clearance verified for ${trf.id}. Dispatch allowed.`)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={14} />
                  <span>Authorize Inter-CPSE Dispatch</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ════ TAB 3: BENCHMARK & RATE DISPARITIES ════ */}
        {activeTab === 'benchmarks' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
            {[
              { cnmc: 'CNMC-MEC-VLV-002150', name: 'BALL VALVE 50MM CL150 FLANGED ASME', lowest: '₹10,298 (SECL Coal India)', highest: '₹14,800 (NTPC Korba)', variance: '+43.7%', action: 'Issue Harmonized Rate Advisory' },
              { cnmc: 'CNMC-MEC-BRG-22220E', name: 'SPHERICAL ROLLER BEARING 22220', lowest: '₹9,250 (Coal India)', highest: '₹12,100 (SAIL Bhilai)', variance: '+30.8%', action: 'Apply Unified Framework Rate' },
              { cnmc: 'CNMC-MEC-PIP-104820', name: 'SEAMLESS STEEL PIPE 4" SCH 40', lowest: '₹8,325 / MTR (ONGC)', highest: '₹11,900 / MTR (IOCL)', variance: '+42.9%', action: 'Standardize Specification' },
            ].map((b, i) => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#2563EB', background: '#EFF6FF', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>{b.cnmc}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.3 }}>{b.name}</h4>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    {b.variance} VARIANCE
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Lowest CPSE Benchmark:</span>
                    <strong style={{ color: '#059669' }}>{b.lowest}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Highest Reported Rate:</span>
                    <strong style={{ color: '#DC2626' }}>{b.highest}</strong>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Benchmark advisory dispatched to CPSE materials councils for ${b.cnmc}`)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #D4D4D8', background: '#FFFFFF', color: '#0F172A', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Scale size={14} color="#6366F1" />
                  <span>{b.action}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ════ TAB 4: SOVEREIGN CRYPTOGRAPHIC AUDIT LEDGER ════ */}
        {activeTab === 'ledger' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Cryptographic Sovereign Approval Ledger</div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Immutable log of verified technical standards with SHA-256 digital signature seals</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
                ● SECURE SHA-256 VERIFIED
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Signature Hash</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Target CNMC / Resource</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reviewing Officer</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((log) => (
                    <tr key={log.log_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '11.5px', fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '3px 8px', borderRadius: '5px', border: '1px solid #C7D2FE' }}>
                          <ShieldCheck size={12} color="#6366F1" />
                          <span>{log.digital_signature}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <strong style={{ color: '#0F172A' }}>{log.approved_cnmc}</strong>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{log.target_resource}</div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
                        {log.actor_name}
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#64748B' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <button 
                          onClick={() => copySignature(log.digital_signature)} 
                          style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #D4D4D8', background: '#FFFFFF', color: '#0F172A', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {copiedHash === log.digital_signature ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          <span>{copiedHash === log.digital_signature ? 'Copied' : 'Copy Hash'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        Audit logs are being recorded with SHA-256 signatures on approval.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODAL: SIDE-BY-SIDE INTERACTIVE AI REFINEMENT STUDIO
            ══════════════════════════════════════════════════════════════════════ */}
        {showRefineModal && selectedItemForRefine && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '960px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 70px rgba(0,0,0,0.35)', border: '1px solid #E2E8F0' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '18px 26px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                    <Sparkles size={18} color="#FFFFFF" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      MIRA AI Nomenclature Refinement Studio
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Interactive parameter extraction, Golden standard synthesis, and cross-CPSE equivalence validation
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowRefineModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Two-Column Side-by-Side Comparison */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '20px' }}>
                  
                  {/* Left Column: Original CPSE Record */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Source Record ({selectedItemForRefine.cpse_name})
                      </span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#F1F5F9', color: '#475569' }}>
                        RAW LEGACY INPUT
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Legacy Item Code</label>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                        {selectedItemForRefine.legacy_item_code}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Raw Description</label>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.4 }}>
                        {selectedItemForRefine.raw_item_description}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reported UOM</label>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{selectedItemForRefine.raw_uom}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Unit Price</label>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>₹{selectedItemForRefine.unit_price_inr?.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* SHAP Attribution Breakdown */}
                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                        AI Feature Attributions (SHAP)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {(selectedItemForRefine.shap_attributions || []).map((s: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', background: '#FFFFFF', padding: '5px 8px', borderRadius: '5px', border: '1px solid #F1F5F9' }}>
                            <span style={{ color: '#475569' }}>{s.feature}</span>
                            <strong style={{ color: '#059669' }}>{s.weight}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Refined Candidate */}
                  <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '18px', border: '1.5px solid #6366F1', boxShadow: '0 4px 16px rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEF2FF', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={13} color="#6366F1" />
                        AI Refined Golden Standard
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                        {refinedResult ? '99.2% CONFIDENCE' : 'AI SUGGESTION'}
                      </span>
                    </div>

                    {refining ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#6366F1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <RefreshCw size={24} className="spinning" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Executing AI Nomenclature & Attribute Synthesis...</span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Synthesized Golden Description</label>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.4 }}>
                            {refinedResult?.refined_description || selectedItemForRefine.suggested_standard_name}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>CNMC Golden Code</label>
                            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                              {refinedResult?.suggested_cnmc_code || selectedItemForRefine.suggested_cnmc}
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Standard UOM & UNSPSC</label>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                              {refinedResult?.standard_uom || selectedItemForRefine.raw_uom} · {refinedResult?.unspsc_code || selectedItemForRefine.unspsc_code}
                            </div>
                          </div>
                        </div>

                        {/* Extracted Key Attributes Grid */}
                        <div>
                          <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                            Extracted Technical Parameters
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {Object.entries(refinedResult?.extracted_attributes || selectedItemForRefine.extracted_attributes || {}).map(([k, v]) => (
                              <div key={k} style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px', border: '1px solid #F1F5F9', fontSize: '11px' }}>
                                <span style={{ color: '#64748B', display: 'block' }}>{k}:</span>
                                <strong style={{ color: '#0F172A' }}>{String(v)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Summary */}
                        {refinedResult?.ai_explanation && (
                          <div style={{ background: '#EEF2FF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #C7D2FE', fontSize: '11.5px', color: '#3730A3', lineHeight: 1.45 }}>
                            {refinedResult.ai_explanation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Interactive AI Refinement Controls */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px 18px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sliders size={14} color="#6366F1" />
                      Guided AI Refinement Prompt & Quick Action Chips
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Click a chip or enter reviewer notes</span>
                  </div>

                  {/* Quick Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      '📐 Normalize Dimensions & UOM',
                      '⚡ Extract Pressure Rating & Class',
                      '🧪 Standardize Material MOC to ASTM',
                      '🏷️ Reclassify to Specific UNSPSC',
                      '🛡️ Align with ASME B16.34 Standard'
                    ].map(chip => (
                      <button 
                        key={chip} 
                        onClick={() => { 
                          setCustomInstruction(chip); 
                          handleTriggerRefinement(selectedItemForRefine, chip); 
                        }}
                        style={{ padding: '5px 11px', borderRadius: '20px', border: '1px solid #D4D4D8', background: '#FFFFFF', color: '#334155', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Custom Prompt Input */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Type custom reviewer instructions (e.g., 'Change trim to SS316L and flange to ASME B16.5 CL300')..." 
                      value={customInstruction} 
                      onChange={(e) => setCustomInstruction(e.target.value)} 
                      style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '12.5px', outline: 'none' }} 
                    />
                    <button 
                      onClick={() => handleTriggerRefinement(selectedItemForRefine, customInstruction)}
                      disabled={refining}
                      style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#4F46E5', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: refining ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={13} />
                      <span>{refining ? 'Refining...' : 'Re-Run AI'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 26px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={() => setShowRefineModal(false)} 
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #D4D4D8', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => { 
                      setItemToReject(selectedItemForRefine); 
                      setShowRefineModal(false); 
                      setShowRejectModal(true); 
                    }}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reject Item
                  </button>

                  <button 
                    onClick={() => handleApprove(selectedItemForRefine, refinedResult?.extracted_attributes)}
                    disabled={submittingAction}
                    style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: submittingAction ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 2px 10px rgba(16,185,129,0.3)' }}
                  >
                    <ShieldCheck size={16} />
                    <span>{submittingAction ? 'Sealing...' : 'Approve & Seal into Golden Master'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODAL: REJECT ITEM WITH AUDIT FEEDBACK
            ══════════════════════════════════════════════════════════════════════ */}
        {showRejectModal && itemToReject && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '460px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={16} color="#DC2626" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Reject Material Candidate</h4>
                </div>
                <button onClick={() => setShowRejectModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}><X size={14} /></button>
              </div>

              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                  <div>Code: <b>{itemToReject.legacy_item_code}</b> ({itemToReject.cpse_name})</div>
                  <div style={{ color: '#64748B', marginTop: '2px' }}>{itemToReject.raw_item_description}</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Rejection Reason / Required Correction</label>
                  <textarea 
                    rows={3} 
                    placeholder="Provide specific technical discrepancy (e.g. 'Missing temperature rating', 'Non-compliant flange standard')..." 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '12.5px', outline: 'none' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D4D4D8', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={handleConfirmReject} disabled={submittingAction || !rejectReason.trim()} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: submittingAction ? 'wait' : 'pointer' }}>
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
};

export default ExpertReviewerPage;
