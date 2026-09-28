import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Building2, 
  Layers, 
  Cpu, 
  FileText, 
  Filter, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface MasterNomination {
  id: string;
  human_code: string;
  machine_urn: string;
  extracted_noun: string;
  core_physics: string;
  variant: string;
  raw_material_composition: string;
  source_cpse: string;
  legacy_code: string;
  working_code: string;
  spec: string;
  raw_specification?: string;
  status: 'PENDING_APPROVAL' | 'RATIFIED' | 'REJECTED';
  created_by: string;
  approved_by?: string;
  created_at: string;
  physics_attributes?: Record<string, any>;
}

interface GovMasterApprovalsPageProps {
  onNavigate: (page: string) => void;
}

export const GovMasterApprovalsPage: React.FC<GovMasterApprovalsPageProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [nominations, setNominations] = useState<MasterNomination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'PENDING_APPROVAL' | 'RATIFIED' | 'REJECTED' | 'ALL'>('PENDING_APPROVAL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Action in-flight state
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<{ code: string; message: string } | null>(null);
  
  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<MasterNomination | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Detail inspection modal
  const [inspectItem, setInspectItem] = useState<MasterNomination | null>(null);

  const fetchNominations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMasterNominations(statusFilter, searchQuery);
      setNominations(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominations();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNominations();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApprove = async (item: MasterNomination) => {
    setActionInProgress(item.id);
    
    // Fast optimistic UI update
    const previousList = [...nominations];
    if (statusFilter === 'PENDING_APPROVAL') {
      setNominations(prev => prev.filter(n => n.id !== item.id));
    } else {
      setNominations(prev => prev.map(n => n.id === item.id ? { ...n, status: 'RATIFIED' } : n));
    }

    try {
      const officerName = 'national.admin@dpe.gov.in';
      await api.approveMasterNomination(item.id, {
        officer_name: officerName,
        remarks: 'Direct Sovereign Clearance & National Master Ratification'
      });
      
      setSuccessToast({
        code: item.human_code,
        message: `Code ${item.human_code} officially ratified! Now published to CNMC Sovereign Master.`
      });
      window.dispatchEvent(new CustomEvent('master-nominations-updated'));
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err) {
      // Rollback on error
      setNominations(previousList);
      alert(`Approval failed: ${getApiErrorMessage(err)}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingItem) return;
    const item = rejectingItem;
    setActionInProgress(item.id);

    // Fast optimistic update
    const previousList = [...nominations];
    if (statusFilter === 'PENDING_APPROVAL') {
      setNominations(prev => prev.filter(n => n.id !== item.id));
    } else {
      setNominations(prev => prev.map(n => n.id === item.id ? { ...n, status: 'REJECTED' } : n));
    }
    setRejectingItem(null);

    try {
      const officerName = 'national.admin@dpe.gov.in';
      await api.rejectMasterNomination(item.id, {
        officer_name: officerName,
        rejection_reason: rejectReason.trim() || 'Specification standards do not align with National Golden Master'
      });
      window.dispatchEvent(new CustomEvent('master-nominations-updated'));
      setSuccessToast({
        code: item.human_code,
        message: `Nomination for ${item.human_code} rejected. Local CPSE notified.`
      });
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      setNominations(previousList);
      alert(`Rejection failed: ${getApiErrorMessage(err)}`);
    } finally {
      setActionInProgress(null);
      setRejectReason('');
    }
  };

  const pendingCount = nominations.filter(n => n.status === 'PENDING_APPROVAL').length;

  return (
    <AppShell 
      currentPage="master-approvals" 
      onNavigate={onNavigate}
      title="National Sovereign Master Approvals"
    >
      <div style={{ flex: 1, padding: '24px 32px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #091e42 0%, #0c2d6b 100%)',
          borderRadius: '12px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              <ShieldCheck size={14} color="#60a5fa" />
              OFFICIAL GOVERNMENT APPROVAL DESK • NATIONAL MASTER RATIFICATION
            </div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              CPSE Material Master Nominations
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#93c5fd', maxWidth: '720px', lineHeight: 1.5 }}>
              Review sovereign 7-digit standard codes proposed by CPSE nodal officers. Ratified items are immediately inducted into the <b>CNMC Sovereign Unified Material Master</b> and broadcast across Indian public enterprises.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '12px 18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase' }}>Awaiting Review</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                {statusFilter === 'PENDING_APPROVAL' ? nominations.length : pendingCount}
              </div>
            </div>

            <button
              onClick={() => onNavigate('mira-catalog')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={16} />
              Open Unified Master
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(16,185,129,0.15)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>
                {successToast.message}
              </span>
            </div>
            <button
              onClick={() => onNavigate('mira-catalog')}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Inspect in Master Catalog <ExternalLink size={12} />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'PENDING_APPROVAL' ? '#2563eb' : '#f1f5f9',
                color: statusFilter === 'PENDING_APPROVAL' ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={14} />
              Pending Review
            </button>

            <button
              onClick={() => setStatusFilter('RATIFIED')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'RATIFIED' ? '#059669' : '#f1f5f9',
                color: statusFilter === 'RATIFIED' ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={14} />
              Ratified Standards
            </button>

            <button
              onClick={() => setStatusFilter('REJECTED')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'REJECTED' ? '#dc2626' : '#f1f5f9',
                color: statusFilter === 'REJECTED' ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <XCircle size={14} />
              Rejected
            </button>

            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'ALL' ? '#334155' : '#f1f5f9',
                color: statusFilter === 'ALL' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              All Records
            </button>
          </div>

          {/* Search Box & Refresh */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              gap: '8px',
              width: '320px'
            }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search CNMC code, CPSE, noun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '12.5px',
                  width: '100%',
                  color: '#1e293b'
                }}
              />
            </div>

            <button
              onClick={fetchNominations}
              disabled={loading}
              title="Refresh nominations"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 10px',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading && nominations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <RefreshCw size={28} className="spinning" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Loading Sovereign Nominations...</div>
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '16px', color: '#b91c1c' }}>
            <b>Error loading nominations:</b> {error}
          </div>
        ) : nominations.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '50px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <ShieldCheck size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
              No {statusFilter === 'PENDING_APPROVAL' ? 'Pending' : statusFilter === 'RATIFIED' ? 'Ratified' : ''} Nominations Found
            </div>
            <div style={{ fontSize: '13px', maxWidth: '440px', margin: '0 auto', color: '#64748b' }}>
              {statusFilter === 'PENDING_APPROVAL' 
                ? 'All CPSE nominations have been processed. New uncataloged material items nominated by CPSE nodal officers will appear here for Government Ratification.'
                : 'No nominations match the selected filter criteria.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {nominations.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: item.status === 'PENDING_APPROVAL' ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  boxShadow: item.status === 'PENDING_APPROVAL' ? '0 3px 12px rgba(37,99,235,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Left: Code, Specs, and Origin */}
                <div style={{ flex: 1 }}>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {/* Sovereign CNMC Code Pill */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                    }}>
                      <span># {item.human_code}</span>
                      <button 
                        onClick={() => copyToClipboard(item.human_code)}
                        title="Copy CNMC Code"
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: 0, cursor: 'pointer', display: 'flex' }}
                      >
                        {copiedCode === item.human_code ? <Check size={12} color="#86efac" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Status Pill */}
                    {item.status === 'PENDING_APPROVAL' ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        <Clock size={11} /> Awaiting Government Ratification
                      </span>
                    ) : item.status === 'RATIFIED' ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        borderRadius: '12px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={11} /> Government Ratified Standard
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        <XCircle size={11} /> Rejected Nomination
                      </span>
                    )}

                    {/* Originating CPSE */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      <Building2 size={11} color="#64748b" />
                      CPSE: <b>{item.source_cpse}</b>
                    </span>

                    {/* Submitter */}
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Nominated by: <b>{item.created_by}</b>
                    </span>
                  </div>

                  {/* Noun and Spec */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginRight: '8px' }}>
                      {item.extracted_noun}
                    </span>
                    <span style={{ fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                      {item.core_physics || item.spec}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{
                      fontSize: '11px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontFamily: 'monospace',
                      color: '#475569'
                    }}>
                      Local CPSE Ref: <b style={{ color: '#2563eb' }}>{item.legacy_code || 'N/A'}</b>
                    </div>

                    {item.working_code && item.working_code !== 'Pending SAP Sync' && (
                      <div style={{
                        fontSize: '11px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontFamily: 'monospace',
                        color: '#475569'
                      }}>
                        SAP Material #: <b>{item.working_code}</b>
                      </div>
                    )}

                    <div style={{
                      fontSize: '11px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      color: '#475569'
                    }}>
                      Grade: <b>{item.raw_material_composition}</b>
                    </div>

                    <div style={{
                      fontSize: '11px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      color: '#475569'
                    }}>
                      Variant: <b>{item.variant}</b>
                    </div>

                    <button
                      onClick={() => setInspectItem(item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '2px 6px'
                      }}
                    >
                      Inspect Attributes <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px', alignItems: 'stretch' }}>
                  {item.status === 'PENDING_APPROVAL' ? (
                    <>
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionInProgress === item.id}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '9px 14px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {actionInProgress === item.id ? (
                          <RefreshCw size={14} className="spinning" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        Approve & Ratify
                      </button>

                      <button
                        onClick={() => setRejectingItem(item)}
                        disabled={actionInProgress === item.id}
                        style={{
                          background: '#ffffff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '7px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </>
                  ) : item.status === 'RATIFIED' ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'block' }}>
                        ✓ Published to Master
                      </span>
                      <button
                        onClick={() => onNavigate('mira-catalog')}
                        style={{
                          marginTop: '6px',
                          background: 'transparent',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#2563eb',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        View in Master <ArrowUpRight size={11} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, display: 'block' }}>
                        Rejected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertCircle size={22} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Reject Master Nomination
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              You are about to reject the sovereign master nomination for <b>#{rejectingItem.human_code}</b> ({rejectingItem.extracted_noun}) submitted by <b>{rejectingItem.source_cpse}</b>.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Reason for Rejection / Scrutiny Remarks:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Incomplete mechanical tolerance specifications; equivalent standard already exists under CNMC-7842019."
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '12.5px',
                  color: '#1e293b',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRejectingItem(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.25)'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '620px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Engineering Specification Audit
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {inspectItem.extracted_noun} ({inspectItem.human_code})
                </h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>Deterministic Machine URN</div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                  {inspectItem.machine_urn}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>Engineering Specification</div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '4px', color: '#1e293b' }}>
                  {inspectItem.core_physics}
                </div>
              </div>

              {inspectItem.physics_attributes && (
                <div>
                  <div style={{ fontWeight: 700, color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>Attributes & Metadata</div>
                  <pre style={{
                    background: '#f8fafc',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                    marginTop: '4px',
                    color: '#334155'
                  }}>
                    {JSON.stringify(inspectItem.physics_attributes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInspectItem(null)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
};