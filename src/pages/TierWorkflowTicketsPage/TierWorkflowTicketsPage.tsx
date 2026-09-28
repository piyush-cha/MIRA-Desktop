import './styles.css';

import React, { useState, useEffect, useMemo } from 'react';

import { 

  GitPullRequest, Search, Filter, Plus, ShieldCheck, CheckCircle2, 

  Clock, AlertTriangle, ArrowRight, Eye, RefreshCw, X, ChevronDown, 

  ChevronUp, Check, Building2, Layers, Cpu, Hash, ExternalLink, 

  Award, FileCheck, UserCheck, Send, AlertCircle, Copy, Sparkles,

  ArrowUpRight, BookmarkCheck, ChevronRight, Info, RotateCcw,

  CornerDownLeft, Lock, Unlock, Edit3

} from 'lucide-react';

import { AppShell } from '../../components/layout/AppShell';

import { api, getApiErrorMessage } from '../../api/client';

import { useAuthStore } from '../../store/authStore';



export interface TierHistoryItem {

  tier: number;

  tier_name: string;

  officer_name: string;

  officer_role: string;

  action: string;

  confirmation_reason: string;

  timestamp: string;

  suggested_mira_code?: string;

}



export interface TierTicket {

  id: string;

  ticket_number: string;

  cpse_name: string;

  plant_name: string;

  item_name: string;

  legacy_code: string;

  raw_description: string;

  specification: string;

  current_tier: number;

  tier_name: string;

  tier_title: string;

  status: 'PENDING_REVIEW' | 'REJECTED' | 'RATIFIED' | 'SENT_BACK' | string;

  priority: string;

  suggested_mira_code?: string | null;

  connected_machine_urn?: string | null;

  domain_code?: string;

  category_code?: string;

  tier_history: TierHistoryItem[];

  created_by: string;

  created_at: string;

  updated_at: string;

}



const TIER_STEPS = [

  { tier: 1, title: 'Tier 1: Plant Data Entry', role: 'Store Incharge / Plant Indenting Officer', scope: 'Plant Store', canCreate: true },

  { tier: 2, title: 'Tier 2: Plant Head Review', role: 'Plant Head / Superintending Engineer', scope: 'Plant Executive', canCreate: false },

  { tier: 3, title: 'Tier 3: Area / Subsidiary Leader', role: 'Area Chief General Manager / Director', scope: 'Intra-Subsidiary', canCreate: false },

  { tier: 4, title: 'Tier 4: CPSE Corporate HQ', role: 'Director (Technical) / ED (Procurement)', scope: 'Enterprise HQ', canCreate: false },

  { tier: 5, title: 'Tier 5: Standardization & AI', role: 'Laya AI Deduplication & Standardization Board', scope: 'Cross-CPSE Board', canCreate: false },

  { tier: 6, title: 'Tier 6: National Technical Council', role: 'National Technical Council / Joint Secretary', scope: 'Ministry Council', canCreate: false },

  { tier: 7, title: 'Tier 7: Cabinet Sovereign Oversight', role: 'Cabinet Secretariat / Sovereign Ratification Council', scope: 'Sovereign Republic', canCreate: false },

];



const PRESET_CONFIRMATION_REASONS: Record<number, string[]> = {

  1: [

    'New uncataloged material identified in plant stores; proposed for Sovereign Unified Codification.',

    'Urgent non-standard component required for capital plant overhaul; submitted for national induction.',

    'Verified physical stock zero and absence in local plant ERP master; submitted to Tier 2.'

  ],

  2: [

    'Plant Head verified technical specifications, criticality, and absence in plant master; cleared for Area review.',

    'Technical parameters and operating tolerances validated against plant standards; approved.',

    'Demand validated against plant machinery requirements. Recommended for intra-subsidiary harmonization.'

  ],

  3: [

    'Intra-subsidiary review confirmed non-existence across all sister plants. Cleared for Corporate HQ.',

    'Unique physical specification confirmed across regional pool. Approved for enterprise induction.',

    'Area technical committee cleared specifications and verified non-duplication with subsidiary assets.'

  ],

  4: [

    'CPSE Corporate Technical Directorate verified standardization compliance and corporate procurement policy.',

    'Corporate clearance granted. Forwarded to National Standardization Board for AI deduplication.',

    'Approved enterprise-wide requirement. Cleared for National Council alignment.'

  ],

  5: [

    'Laya AI deduplication verified 0% collision with existing sovereign master. ISO/ASME attributes normalized.',

    'Physical noun and boundary parameters normalized. Standardized definition approved by Technical Board.',

    'Cross-CPSE duplicate check cleared. Eligible for 7-digit Sovereign MIRA Code generation.'

  ],

  6: [

    'National Technical Council ratifies assigned 7-digit MIRA Standard Code and Machine URN.',

    'Approved unified nomenclature, cross-CPSE equivalence pointer, and technical hierarchy.',

    'Council verified specifications and recommended for Sovereign Cabinet Ratification.'

  ],

  7: [

    'Official Sovereign Seal affixed. Ratified into National Material Master Gazette.',

    'Cabinet Sovereign Oversight granted. Rate parity lock and national gazette order signed.',

    'Full inter-CPSE interchangeability confirmed. Ratified into sovereign public catalog.'

  ]

};



const PRESET_SEND_BACK_REASONS: string[] = [

  'Technical specifications incomplete: Please specify exact material grade (ASTM/IS/DIN) and pressure rating.',

  'Ambiguous physical dimensions: Attach dimensional tolerance drawing and flange rating.',

  'Suspected duplicate: Check if existing plant catalog item matches this specification.',

  'Incomplete operating parameters: Specify fluid medium, temperature limits, and design pressure.',

  'Taxonomy mismatch: Selected domain/category code does not match item noun; please reclassify.'

];



const PRESET_REJECTION_REASONS: string[] = [

  'Duplicate material already exists in MIRA Sovereign Master with an active unified code.',

  'Item obsolete or discontinued under national procurement guidelines.',

  'Does not meet minimum mandatory national technical standard requirements.',

  'Disallowed non-standard specification; standard existing alternative available in national catalog.'

];



export const TierWorkflowTicketsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  const { user } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);



  // Resolve actual user operational tier based on authenticated role

  const resolveUserTier = (role?: string): number => {

    switch (role) {

      case 'PLANT_USER':

        return 1; // Tier 1: Plant Data Entry (Creator)

      case 'ZONE_ADMIN':

        return 2; // Tier 2: Plant Head Review

      case 'AREA_ADMIN':

      case 'TIER_3_AREA_MANAGER':

        return 3; // Tier 3: Area / Subsidiary Leader

      case 'CPSE_ADMIN':

      case 'TIER_4_CPSE_HQ':

        return 4; // Tier 4: CPSE Corporate HQ

      case 'DOMAIN_EXPERT':

        return 5; // Tier 5: Standardization & AI

      case 'PLATFORM_ADMIN':

        return 6; // Tier 6: National Technical Council

      case 'NATIONAL_GOVERNANCE':

      case 'GOV_OVERSEER':

        return 7; // Tier 7: Cabinet Sovereign Oversight

      default:

        return 4; // Default logged-in CPSE user is Tier 4 Corporate HQ

    }

  };



  const actualUserTier = resolveUserTier(user?.roleCode);



  // Active Authority & Operational Tier Mode (defaults to user's real tier, e.g. Tier 4 for CPSE HQ)

  const [activeOperationalTier, setActiveOperationalTier] = useState<number>(() => resolveUserTier(user?.roleCode));



  const isNationalGov = user?.roleCode === 'NATIONAL_GOVERNANCE' || user?.roleCode === 'GOV_OVERSEER' || !user?.cpseCode;



  // Filters

  const [allTickets, setAllTickets] = useState<TierTicket[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [selectedCpse, setSelectedCpse] = useState<string>(() => (isNationalGov ? 'ALL' : (user?.cpseCode || 'BHEL')));



  useEffect(() => {

    if (!isNationalGov && user?.cpseCode) {

      setSelectedCpse(user.cpseCode);

    }

  }, [isNationalGov, user?.cpseCode]);



  // Modals & Action States

  const [confirmModalTicket, setConfirmModalTicket] = useState<TierTicket | null>(null);

  const [confirmAction, setConfirmAction] = useState<'APPROVE' | 'REJECT' | 'SEND_BACK'>('APPROVE');

  const [officerName, setOfficerName] = useState<string>(user?.fullName || 'Dr. K. S. Verma');

  const [officerRole, setOfficerRole] = useState<string>('');

  const [confirmationReason, setConfirmationReason] = useState<string>('');

  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState<boolean>(false);



  // Edit Modal State (when returned/sent back to Tier 1)

  const [editModalTicket, setEditModalTicket] = useState<TierTicket | null>(null);

  const [isUpdatingTicket, setIsUpdatingTicket] = useState<boolean>(false);

  const [editForm, setEditForm] = useState({

    item_name: '',

    legacy_code: '',

    raw_description: '',

    specification: '',

    priority: 'Category A',

    domain_code: 'MECH',

    category_code: 'VAL',

    resubmit_reason: ''

  });



  // Create Ticket Modal State

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);

  const [createForm, setCreateForm] = useState({

    cpse_name: user?.cpseCode || 'BHEL',

    plant_name: 'Trichy Heavy Boiler Plant',

    item_name: '',

    legacy_code: '',

    raw_description: '',

    specification: '',

    priority: 'Category A',

    domain_code: 'MECH',

    category_code: 'VAL',

    initial_reason: '',

    created_by: user?.fullName || 'Store Incharge'

  });



  // Expanded card history toggles

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const [copiedCode, setCopiedCode] = useState<string | null>(null);



  // Toast / notification

  const [toastMessage, setToastMessage] = useState<string | null>(null);



  const showToast = (msg: string) => {

    setToastMessage(msg);

    setTimeout(() => setToastMessage(null), 4500);

  };



  const fetchTickets = async () => {

    setLoading(true);

    setError(null);

    try {

      const activeCpse = !isNationalGov ? (user?.cpseCode || 'BHEL') : (selectedCpse !== 'ALL' ? selectedCpse : undefined);

      const res = await api.getTierTickets({

        cpse: activeCpse,

      });

      setAllTickets(res.data || []);

    } catch (err) {

      setError(getApiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTickets();

  }, [selectedCpse, isNationalGov, user?.cpseCode]);



  const handleSearchSubmit = (e: React.FormEvent) => {

    e.preventDefault();

  };



  // Open confirm modal with intelligent defaults for APPROVE, REJECT, and SEND_BACK

  const openConfirmModal = (ticket: TierTicket, action: 'APPROVE' | 'REJECT' | 'SEND_BACK' = 'APPROVE') => {

    setConfirmModalTicket(ticket);

    setConfirmAction(action);

    const tierMeta = TIER_STEPS.find(s => s.tier === ticket.current_tier);

    setOfficerName(user?.fullName || (user?.username ? user.username.toUpperCase() : 'Authority Officer'));

    setOfficerRole(tierMeta ? tierMeta.role : 'Authorized Reviewing Officer');

    

    if (action === 'APPROVE') {

      const presets = PRESET_CONFIRMATION_REASONS[ticket.current_tier] || [];

      setConfirmationReason(presets[0] || `Confirmed and verified technical parameters for ${ticket.item_name} at Tier ${ticket.current_tier}.`);

    } else if (action === 'SEND_BACK') {

      setConfirmationReason(PRESET_SEND_BACK_REASONS[0] || `Returned to Tier ${Math.max(1, ticket.current_tier - 1)} for technical specification clarification.`);

    } else {

      setConfirmationReason(PRESET_REJECTION_REASONS[0] || `Discrepancy identified in specifications for ${ticket.legacy_code}. Application rejected.`);

    }

  };



  const handleConfirmSubmit = async () => {

    if (!confirmModalTicket) return;

    if (!confirmationReason.trim()) {

      alert(`Please provide a mandatory justification reason before ${confirmAction === 'APPROVE' ? 'approving' : confirmAction === 'SEND_BACK' ? 'sending back' : 'rejecting'}.`);

      return;

    }



    setIsSubmittingConfirm(true);

    try {

      const res = await api.confirmTierTicket(confirmModalTicket.id, {

        officer_name: officerName.trim() || 'Authorizing Officer',

        officer_role: officerRole.trim() || 'Reviewing Authority',

        action: confirmAction,

        confirmation_reason: confirmationReason.trim()

      });



      showToast(res.message || 'Material application updated successfully.');

      setConfirmModalTicket(null);

      await fetchTickets();

    } catch (err) {

      alert(`Action failed: ${getApiErrorMessage(err)}`);

    } finally {

      setIsSubmittingConfirm(false);

    }

  };



  // Open edit modal for Tier 1 officer to correct specifications if sent back

  const openEditModal = (ticket: TierTicket) => {

    setEditModalTicket(ticket);

    setEditForm({

      item_name: ticket.item_name,

      legacy_code: ticket.legacy_code,

      raw_description: ticket.raw_description,

      specification: ticket.specification || '',

      priority: ticket.priority || 'Category A',

      domain_code: ticket.domain_code || 'MECH',

      category_code: ticket.category_code || 'VAL',

      resubmit_reason: 'Updated specifications and addressed reviewer remarks. Resubmitted to Tier 2 Plant Head.'

    });

  };



  const handleEditSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!editModalTicket) return;



    setIsUpdatingTicket(true);

    try {

      // 1. Update the specifications

      await api.updateTierTicket(editModalTicket.id, {

        item_name: editForm.item_name,

        legacy_code: editForm.legacy_code,

        raw_description: editForm.raw_description,

        specification: editForm.specification,

        priority: editForm.priority,

        domain_code: editForm.domain_code,

        category_code: editForm.category_code

      });



      // 2. Re-escalate to Tier 2

      await api.confirmTierTicket(editModalTicket.id, {

        officer_name: user?.fullName || 'Store Incharge',

        officer_role: 'Store Incharge / Plant Indenting Officer',

        action: 'APPROVE',

        confirmation_reason: editForm.resubmit_reason || 'Specifications corrected per reviewer remarks; resubmitted to Tier 2.'

      });



      showToast(`Material ${editForm.item_name} specifications updated and resubmitted to Tier 2!`);

      setEditModalTicket(null);

      await fetchTickets();

    } catch (err) {

      alert(`Failed to update and resubmit: ${getApiErrorMessage(err)}`);

    } finally {

      setIsUpdatingTicket(false);

    }

  };



  const handleCreateTicketSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (activeOperationalTier !== 1) {

      alert('Strict Governance Protocol: Only Tier 1 Plant Data Entry officers can initiate new material applications. Tiers 2–7 possess review, approval, rejection, and return authority only.');

      return;

    }



    if (!createForm.item_name.trim() || !createForm.legacy_code.trim() || !createForm.raw_description.trim()) {

      alert('Please fill in Item Name, Legacy Code, and Material Description.');

      return;

    }



    setIsCreatingTicket(true);

    try {

      const res = await api.createTierTicket({

        cpse_name: createForm.cpse_name.toUpperCase(),

        plant_name: createForm.plant_name,

        item_name: createForm.item_name,

        legacy_code: createForm.legacy_code,

        raw_description: createForm.raw_description,

        specification: createForm.specification,

        priority: createForm.priority,

        domain_code: createForm.domain_code,

        category_code: createForm.category_code,

        initial_reason: createForm.initial_reason || `New material codification proposed for ${createForm.item_name} to mint MIRA Sovereign Unified Code.`,

        created_by: createForm.created_by

      });



      showToast(res.message || 'Tier 1 Material Codification application submitted successfully.');

      setShowCreateModal(false);

      setCreateForm({

        cpse_name: user?.cpseCode || 'BHEL',

        plant_name: 'Trichy Heavy Boiler Plant',

        item_name: '',

        legacy_code: '',

        raw_description: '',

        specification: '',

        priority: 'Category A',

        domain_code: 'MECH',

        category_code: 'VAL',

        initial_reason: '',

        created_by: user?.fullName || 'Store Incharge'

      });

      await fetchTickets();

    } catch (err) {

      alert(`Failed to propose new material: ${getApiErrorMessage(err)}`);

    } finally {

      setIsCreatingTicket(false);

    }

  };



  const toggleCardHistory = (ticketId: string) => {

    setExpandedCards(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));

  };



  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);

    setCopiedCode(text);

    setTimeout(() => setCopiedCode(null), 2500);

  };



  // Filtered tickets based on tier, CPSE, status, searchQuery

  const filteredTickets = useMemo(() => {

    return allTickets.filter(ticket => {

      // 0. CPSE Scoping

      if (!isNationalGov && user?.cpseCode) {

        if (ticket.cpse_name?.toUpperCase() !== user.cpseCode.toUpperCase()) return false;

      } else if (isNationalGov && selectedCpse !== 'ALL') {

        if (ticket.cpse_name?.toUpperCase() !== selectedCpse.toUpperCase()) return false;

      }



      // 1. Fine-grained Tier filter

      if (selectedTier !== 'ALL') {

        if (selectedTier === '8') {

          if (ticket.status !== 'RATIFIED' && ticket.current_tier < 8) return false;

        } else if (ticket.current_tier.toString() !== selectedTier) {

          return false;

        }

      }



      // 2. Status filter

      if (selectedStatus !== 'ALL') {

        if (selectedStatus === 'RATIFIED') {

          if (ticket.status !== 'RATIFIED' && ticket.current_tier < 8) return false;

        } else if (ticket.status !== selectedStatus) {

          return false;

        }

      }



      // 3. Search query

      if (searchQuery.trim()) {

        const q = searchQuery.toLowerCase().trim();

        const matchNumber = ticket.ticket_number?.toLowerCase().includes(q);

        const matchItem = ticket.item_name?.toLowerCase().includes(q);

        const matchLegacy = ticket.legacy_code?.toLowerCase().includes(q);

        const matchMira = ticket.suggested_mira_code?.toLowerCase().includes(q);

        const matchPlant = ticket.plant_name?.toLowerCase().includes(q);

        const matchCpse = ticket.cpse_name?.toLowerCase().includes(q);

        if (!matchNumber && !matchItem && !matchLegacy && !matchMira && !matchPlant && !matchCpse) {

          return false;

        }

      }



      return true;

    });

  }, [allTickets, selectedTier, selectedStatus, searchQuery, selectedCpse, isNationalGov, user?.cpseCode]);



  const tickets = filteredTickets;



  // Pipeline metrics computed from allTickets

  const totalCount = allTickets.length;



  return (

    <AppShell

      currentPage="tier-tickets"

      onNavigate={onNavigate}

      title="New Material & Unified Code Induction"

      subtitle="Standardized national lifecycle for inducting uncataloged new materials (Tier 1) through Multi-Tier Verification, AI Harmonization, and Sovereign Unified Code Minting (Tier 7)"

    >

      <div className="gov-page-container">

        

        {/* Toast Alert Banner */}

        {toastMessage && (

          <div style={{

            position: 'fixed',

            bottom: '24px',

            right: '24px',

            zIndex: 9999,

            backgroundColor: '#0f172a',

            color: '#ffffff',

            padding: '14px 22px',

            borderRadius: '10px',

            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',

            display: 'flex',

            alignItems: 'center',

            gap: '12px',

            border: '1px solid #2563eb',

            animation: 'slideUp 0.3s ease-out'

          }}>

            <Sparkles size={18} color="#60a5fa" />

            <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{toastMessage}</span>

          </div>

        )}



        {/* Top Control Bar & Action Button */}

        <div style={{

          display: 'flex',

          flexWrap: 'wrap',

          alignItems: 'center',

          justifyContent: 'space-between',

          gap: '14px',

          marginBottom: '14px',

          backgroundColor: '#ffffff',

          padding: '14px 18px',

          borderRadius: '12px',

          border: '1px solid #e2e8f0',

          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'

        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <div style={{

              width: '38px',

              height: '38px',

              borderRadius: '9px',

              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',

              border: '1px solid #bfdbfe',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              color: '#2563eb',

              flexShrink: 0

            }}>

              <GitPullRequest size={20} />

            </div>

            <div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

                <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>

                  New Material & Unified Code Induction

                </h1>

                <span style={{

                  fontSize: '11px',

                  fontWeight: 700,

                  padding: '2px 8px',

                  borderRadius: '10px',

                  backgroundColor: '#f1f5f9',

                  color: '#475569',

                  border: '1px solid #e2e8f0'

                }}>

                  {totalCount} Total in Pipeline

                </span>

              </div>

              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>

                7-Tier Sovereign Verification & Codification • Multi-CPSE Harmonization Workflow

              </p>

            </div>

          </div>





        </div>







        {/* Compact Search & Filter Toolbar */}

        <div style={{

          backgroundColor: '#ffffff',

          padding: '8px 12px',

          borderRadius: '10px',

          border: '1px solid #e2e8f0',

          marginBottom: '16px',

          display: 'flex',

          flexWrap: 'wrap',

          gap: '8px',

          alignItems: 'center',

          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'

        }}>

          {/* Search Input */}

          <div style={{ flex: '1 1 220px', position: 'relative' }}>

            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />

            <input

              type="text"

              placeholder="Search ticket #, material name, CPSE, or legacy code..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              style={{

                width: '100%',

                boxSizing: 'border-box',

                padding: '6px 26px 6px 30px',

                borderRadius: '6px',

                border: '1px solid #cbd5e1',

                fontSize: '12px',

                outline: 'none',

                color: '#1e293b'

              }}

            />

            {searchQuery && (

              <button

                type="button"

                onClick={() => setSearchQuery('')}

                style={{

                  position: 'absolute',

                  right: '8px',

                  top: '50%',

                  transform: 'translateY(-50%)',

                  background: 'none',

                  border: 'none',

                  cursor: 'pointer',

                  color: '#94a3b8',

                  padding: 0

                }}

              >

                <X size={13} />

              </button>

            )}

          </div>



          {/* CPSE Select (National Governance only; hidden for specified CPSE users) */}

          {isNationalGov && (

            <select

              value={selectedCpse}

              onChange={(e) => setSelectedCpse(e.target.value)}

              style={{

                padding: '6px 10px',

                borderRadius: '6px',

                border: '1px solid #cbd5e1',

                fontSize: '12px',

                fontWeight: 500,

                color: '#334155',

                backgroundColor: '#ffffff',

                outline: 'none'

              }}

            >

              <option value="ALL">All CPSEs</option>

              <option value="BHEL">BHEL</option>

              <option value="NTPC">NTPC</option>

              <option value="ONGC">ONGC</option>

              <option value="SAIL">SAIL</option>

              <option value="IOCL">IOCL</option>

              <option value="COAL INDIA">COAL INDIA</option>

              <option value="GAIL">GAIL</option>

            </select>

          )}



          {/* Status Select */}

          <select

            value={selectedStatus}

            onChange={(e) => setSelectedStatus(e.target.value)}

            style={{

              padding: '6px 10px',

              borderRadius: '6px',

              border: '1px solid #cbd5e1',

              fontSize: '12px',

              fontWeight: 500,

              color: '#334155',

              backgroundColor: '#ffffff',

              outline: 'none'

            }}

          >

            <option value="ALL">All Statuses</option>

            <option value="PENDING_REVIEW">Pending Review</option>

            <option value="RATIFIED">Ratified Master</option>

            <option value="REJECTED">Rejected</option>

            <option value="SENT_BACK">Sent Back</option>

          </select>



          {/* Micro Tier Pills */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>

            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginRight: '2px' }}>Tier:</span>

            {['ALL', '1', '2', '3', '4', '5', '6', '7'].map((t) => {

              const active = selectedTier === t;

              return (

                <button

                  key={t}

                  type="button"

                  onClick={() => setSelectedTier(t)}

                  style={{

                    padding: '3px 7px',

                    borderRadius: '4px',

                    fontSize: '11px',

                    fontWeight: 600,

                    border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',

                    backgroundColor: active ? '#2563eb' : '#f8fafc',

                    color: active ? '#ffffff' : '#64748b',

                    cursor: 'pointer',

                    transition: 'all 0.1s ease'

                  }}

                  title={t === 'ALL' ? 'All Tiers' : `Tier ${t}`}

                >

                  {t === 'ALL' ? 'All' : `T${t}`}

                </button>

              );

            })}

          </div>



          {/* Results count & reset */}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>

            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>

              Showing <strong>{tickets.length}</strong> of {totalCount}

            </span>

            {(selectedTier !== 'ALL' || selectedStatus !== 'ALL' || (isNationalGov && selectedCpse !== 'ALL') || searchQuery) && (

              <button

                type="button"

                onClick={() => {

                  setSelectedTier('ALL');

                  setSelectedStatus('ALL');

                  if (isNationalGov) {

                    setSelectedCpse('ALL');

                  }

                  setSearchQuery('');

                }}

                style={{

                  fontSize: '11px',

                  fontWeight: 600,

                  color: '#ef4444',

                  background: 'none',

                  border: 'none',

                  cursor: 'pointer',

                  padding: '2px 4px',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '2px'

                }}

              >

                <RotateCcw size={11} />

                <span>Reset</span>

              </button>

            )}

          </div>

        </div>



        {/* Tickets Listing */}

        {loading ? (

          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

            <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />

            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Loading 7-Tier Requisition Tickets...</div>

            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Querying multi-tier audit ledger from PostgreSQL...</div>

          </div>

        ) : tickets.length === 0 ? (

          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

            <AlertCircle size={32} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No Request Tickets Found</div>

            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 16px auto' }}>

              No tickets matched your filter criteria. Try changing filters or submit a new Tier 1 Request Ticket.

            </div>

            <button

              onClick={() => setShowCreateModal(true)}

              style={{

                padding: '8px 16px',

                backgroundColor: '#2563eb',

                color: '#ffffff',

                border: 'none',

                borderRadius: '8px',

                fontSize: '13px',

                fontWeight: 600,

                cursor: 'pointer'

              }}

            >

              + Create First Ticket

            </button>

          </div>

        ) : (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {tickets.map((ticket) => {

              const isExpanded = !!expandedCards[ticket.id];

              const isRatified = ticket.status === 'RATIFIED' || ticket.current_tier >= 8;

              const isRejected = ticket.status === 'REJECTED';

              const isSentBack = ticket.status === 'SENT_BACK';



              return (

                <div

                  key={ticket.id}

                  style={{

                    backgroundColor: '#ffffff',

                    borderRadius: '12px',

                    border: isRatified ? '1px solid #86efac' : isRejected ? '1px solid #fca5a5' : isSentBack ? '1.5px solid #fde68a' : '1px solid #e2e8f0',

                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',

                    overflow: 'hidden',

                    transition: 'all 0.2s ease'

                  }}

                >

                  {/* Card Header */}

                  <div style={{

                    padding: '16px 20px',

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: '12px',

                    backgroundColor: isRatified ? '#f0fdf4' : isSentBack ? '#fffbeb' : '#fafafa',

                    borderBottom: '1px solid #e2e8f0'

                  }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

                      <span style={{

                        fontFamily: 'monospace',

                        fontWeight: 700,

                        fontSize: '14px',

                        color: '#1e293b',

                        backgroundColor: '#ffffff',

                        padding: '4px 10px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1'

                      }}>

                        {ticket.ticket_number}

                      </span>



                      <span style={{

                        fontSize: '12px',

                        fontWeight: 700,

                        color: '#1d4ed8',

                        backgroundColor: '#dbeafe',

                        padding: '3px 9px',

                        borderRadius: '12px'

                      }}>

                        {ticket.cpse_name}

                      </span>



                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>

                        {ticket.plant_name}

                      </span>



                      <span style={{

                        fontSize: '11px',

                        fontWeight: 700,

                        padding: '2px 8px',

                        borderRadius: '10px',

                        backgroundColor: ticket.priority === 'Category A' ? '#fee2e2' : '#fef3c7',

                        color: ticket.priority === 'Category A' ? '#991b1b' : '#92400e'

                      }}>

                        {ticket.priority || 'Category B'}

                      </span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                      {isRatified ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#15803d',

                          backgroundColor: '#dcfce7',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #86efac'

                        }}>

                          <BookmarkCheck size={14} />

                          <span>SOVEREIGN RATIFIED MASTER</span>

                        </span>

                      ) : isRejected ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#b91c1c',

                          backgroundColor: '#fee2e2',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fca5a5'

                        }}>

                          <X size={13} />

                          <span>APPLICATION REJECTED</span>

                        </span>

                      ) : isSentBack ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#b45309',

                          backgroundColor: '#fef3c7',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fde68a'

                        }}>

                          <RotateCcw size={13} />

                          <span>RETURNED TO {ticket.tier_title.toUpperCase()}</span>

                        </span>

                      ) : (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '6px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#c2410c',

                          backgroundColor: '#ffedd5',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fed7aa'

                        }}>

                          <Clock size={13} />

                          <span>CURRENT: {ticket.tier_title}</span>

                        </span>

                      )}

                    </div>

                  </div>



                  {/* Card Body: Item info & MIRA Code if reached Tier 6/7/Ratified */}

                  <div style={{ padding: '18px 20px' }}>

                    {/* Prominent return notice if returned with reason */}

                    {isSentBack && (

                      <div style={{

                        backgroundColor: '#fffbeb',

                        border: '1.5px solid #fde68a',

                        borderRadius: '8px',

                        padding: '12px 14px',

                        marginBottom: '16px',

                        display: 'flex',

                        alignItems: 'flex-start',

                        gap: '10px'

                      }}>

                        <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />

                        <div style={{ flex: 1 }}>

                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#92400e' }}>

                            Application Returned by Reviewing Authority:

                          </div>

                          <div style={{ fontSize: '12.5px', color: '#78350f', marginTop: '3px', fontStyle: 'italic' }}>

                            "{ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.confirmation_reason || 'Returned for specification clarifications.'}"

                          </div>

                          <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px' }}>

                            Reviewing Officer: {ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.officer_name || 'Reviewing Officer'} • {ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.officer_role || 'Reviewer'}

                          </div>

                        </div>

                      </div>

                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', marginBottom: '16px' }}>

                      <div style={{ flex: 1, minWidth: '280px' }}>

                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>

                          {ticket.item_name}

                        </h3>

                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>

                          {ticket.raw_description}

                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>

                          <div><b style={{ color: '#334155' }}>Legacy Code:</b> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{ticket.legacy_code}</code></div>

                          {ticket.specification && (

                            <div><b style={{ color: '#334155' }}>Specs:</b> {ticket.specification}</div>

                          )}

                          <div><b style={{ color: '#334155' }}>Domain:</b> {ticket.domain_code || 'MECH'} / {ticket.category_code || 'VAL'}</div>

                        </div>

                      </div>



                      {/* Authoritative MIRA Code Display Box (When minted at Tier 6 or 7) */}

                      {ticket.suggested_mira_code && (

                        <div style={{

                          backgroundColor: isRatified ? '#ecfdf5' : '#f8fafc',

                          border: isRatified ? '1.5px solid #10b981' : '1px solid #cbd5e1',

                          borderRadius: '10px',

                          padding: '12px 16px',

                          minWidth: '260px'

                        }}>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>

                            <span style={{ fontSize: '11px', fontWeight: 700, color: isRatified ? '#047857' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>

                              {isRatified ? '★ Sovereign Ratified MIRA Code' : '⚡ Minted 7-Digit MIRA Code'}

                            </span>

                            <button

                              onClick={() => copyToClipboard(ticket.suggested_mira_code!)}

                              style={{

                                background: 'transparent',

                                border: 'none',

                                cursor: 'pointer',

                                display: 'flex',

                                alignItems: 'center',

                                gap: '4px',

                                fontSize: '11px',

                                color: copiedCode === ticket.suggested_mira_code ? '#16a34a' : '#2563eb'

                              }}

                            >

                              {copiedCode === ticket.suggested_mira_code ? <Check size={12} /> : <Copy size={12} />}

                              <span>{copiedCode === ticket.suggested_mira_code ? 'Copied' : 'Copy'}</span>

                            </button>

                          </div>



                          <div style={{

                            fontFamily: 'monospace',

                            fontSize: '18px',

                            fontWeight: 800,

                            color: isRatified ? '#065f46' : '#1e293b',

                            letterSpacing: '0.02em'

                          }}>

                            {ticket.suggested_mira_code}

                          </div>



                          {ticket.connected_machine_urn && (

                            <div style={{

                              fontFamily: 'monospace',

                              fontSize: '11px',

                              color: '#64748b',

                              marginTop: '4px',

                              wordBreak: 'break-all'

                            }}>

                              {ticket.connected_machine_urn}

                            </div>

                          )}

                        </div>

                      )}

                    </div>







                    {/* Expandable History Drawer */}

                    {isExpanded && (

                      <div style={{

                        marginTop: '14px',

                        padding: '16px',

                        backgroundColor: '#f8fafc',

                        borderRadius: '10px',

                        border: '1px solid #e2e8f0'

                      }}>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>

                          <ShieldCheck size={16} color="#2563eb" />

                          <span>Tamper-Evident Multi-Tier Review Receipts ({ticket.tier_history?.length || 0})</span>

                        </div>



                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                          {ticket.tier_history?.map((h, idx) => (

                            <div

                              key={idx}

                              style={{

                                backgroundColor: '#ffffff',

                                borderRadius: '8px',

                                padding: '12px 14px',

                                border: '1px solid #e2e8f0',

                                borderLeft: h.action === 'REJECTED' ? '4px solid #ef4444' : '4px solid #10b981'

                              }}

                            >

                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>

                                    {h.tier_name}

                                  </span>

                                  <span style={{ fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>

                                    {h.officer_role}

                                  </span>

                                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>

                                    By: {h.officer_name}

                                  </span>

                                </div>

                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>

                                  {new Date(h.timestamp).toLocaleString()}

                                </span>

                              </div>



                              <div style={{

                                fontSize: '12.5px',

                                color: '#334155',

                                backgroundColor: '#f8fafc',

                                padding: '8px 10px',

                                borderRadius: '6px',

                                marginTop: '6px',

                                border: '1px solid #f1f5f9',

                                fontStyle: 'italic'

                              }}>

                                "{h.confirmation_reason}"

                              </div>

                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>



                  {/* Card Action Footer */}

                  <div style={{

                    padding: '12px 20px',

                    backgroundColor: '#fafafa',

                    borderTop: '1px solid #e2e8f0',

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: '12px'

                  }}>

                    <button

                      onClick={() => toggleCardHistory(ticket.id)}

                      style={{

                        background: 'transparent',

                        border: 'none',

                        color: '#475569',

                        fontSize: '12.5px',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '4px'

                      }}

                    >

                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}

                      <span>{isExpanded ? 'Hide Review Receipts' : `View Audit History (${ticket.tier_history?.length || 0})`}</span>

                    </button>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                      {isRatified ? (

                        <button

                          onClick={() => onNavigate('mira-catalog')}

                          style={{

                            display: 'flex',

                            alignItems: 'center',

                            gap: '6px',

                            padding: '7px 14px',

                            backgroundColor: '#16a34a',

                            color: '#ffffff',

                            border: 'none',

                            borderRadius: '6px',

                            fontSize: '12.5px',

                            fontWeight: 600,

                            cursor: 'pointer'

                          }}

                        >

                          <ExternalLink size={14} />

                          <span>View in National Unified Master</span>

                        </button>

                      ) : !isRejected ? (

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

                          {/* If returned to Tier 1, allow Tier 1 officer to edit specs and resubmit */}

                          {ticket.current_tier === 1 && isSentBack && (

                            <button

                              onClick={() => openEditModal(ticket)}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '5px',

                                padding: '7px 13px',

                                backgroundColor: '#fef3c7',

                                color: '#92400e',

                                border: '1px solid #fde68a',

                                borderRadius: '6px',

                                fontSize: '12.5px',

                                fontWeight: 700,

                                cursor: 'pointer'

                              }}

                            >

                              <Edit3 size={13} />

                              <span>Edit Specs & Resubmit to Tier 2</span>

                            </button>

                          )}



                          {/* Send Back with Reason (available for reviewing tiers >= 2) */}

                          {ticket.current_tier > 1 && (

                            <button

                              onClick={() => openConfirmModal(ticket, 'SEND_BACK')}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '5px',

                                padding: '7px 12px',

                                backgroundColor: '#fffbeb',

                                color: '#b45309',

                                border: '1px solid #fde68a',

                                borderRadius: '6px',

                                fontSize: '12.5px',

                                fontWeight: 600,

                                cursor: 'pointer',

                                transition: 'all 0.15s ease'

                              }}

                              title={`Return to Tier ${ticket.current_tier - 1} with mandatory justification reason`}

                            >

                              <RotateCcw size={13} />

                              <span>Send Back with Reason</span>

                            </button>

                          )}



                          {/* Reject with Reason */}

                          <button

                            onClick={() => openConfirmModal(ticket, 'REJECT')}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '4px',

                              padding: '7px 12px',

                              backgroundColor: '#ffffff',

                              color: '#dc2626',

                              border: '1px solid #fca5a5',

                              borderRadius: '6px',

                              fontSize: '12.5px',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <X size={14} />

                            <span>Reject</span>

                          </button>



                          {/* Approve & Escalate / Ratify */}

                          <button

                            onClick={() => openConfirmModal(ticket, 'APPROVE')}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '6px',

                              padding: '7px 16px',

                              background: ticket.current_tier === 7 

                                ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' 

                                : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',

                              color: '#ffffff',

                              border: 'none',

                              borderRadius: '6px',

                              fontSize: '12.5px',

                              fontWeight: 600,

                              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',

                              cursor: 'pointer'

                            }}

                          >

                            <UserCheck size={14} />

                            <span>

                              {ticket.current_tier === 7 

                                ? 'Affix Sovereign Seal & Ratify Master' 

                                : `Approve & Advance to Tier ${ticket.current_tier + 1}`}

                            </span>

                          </button>

                        </div>

                      ) : (

                        <button

                          onClick={() => openConfirmModal(ticket, 'APPROVE')}

                          style={{

                            padding: '7px 14px',

                            backgroundColor: '#f1f5f9',

                            color: '#334155',

                            border: '1px solid #cbd5e1',

                            borderRadius: '6px',

                            fontSize: '12.5px',

                            fontWeight: 600,

                            cursor: 'pointer'

                          }}

                        >

                          Reopen Application

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}



        {/* Confirmation & Decision Modal (Approve, Send Back with Reason, Reject) */}

        {confirmModalTicket && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '640px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              {/* Modal Header */}

              <div style={{

                padding: '18px 24px',

                backgroundColor: confirmAction === 'APPROVE' 

                  ? '#0f172a' 

                  : confirmAction === 'SEND_BACK' 

                  ? '#78350f' 

                  : '#7f1d1d',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  {confirmAction === 'APPROVE' ? (

                    <ShieldCheck size={20} color="#60a5fa" />

                  ) : confirmAction === 'SEND_BACK' ? (

                    <RotateCcw size={20} color="#fde68a" />

                  ) : (

                    <AlertTriangle size={20} color="#fca5a5" />

                  )}

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      {confirmAction === 'APPROVE' 

                        ? (confirmModalTicket.current_tier === 7 

                            ? 'Affix Sovereign Ratification Seal (Tier 7)' 

                            : `Approve & Advance to Tier ${confirmModalTicket.current_tier + 1}`)

                        : confirmAction === 'SEND_BACK'

                        ? `Send Back Material Application to Tier ${Math.max(1, confirmModalTicket.current_tier - 1)}`

                        : `Reject Material Application (${confirmModalTicket.ticket_number})`}

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>

                      Application {confirmModalTicket.ticket_number} • {confirmModalTicket.cpse_name} ({confirmModalTicket.plant_name})

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setConfirmModalTicket(null)}

                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              {/* Modal Body */}

              <div style={{ padding: '20px 24px' }}>

                <div style={{

                  backgroundColor: '#f8fafc',

                  border: '1px solid #e2e8f0',

                  borderRadius: '8px',

                  padding: '12px 14px',

                  marginBottom: '16px',

                  fontSize: '12.5px'

                }}>

                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{confirmModalTicket.item_name}</div>

                  <div style={{ color: '#64748b', marginTop: '2px' }}>{confirmModalTicket.raw_description}</div>

                  <div style={{ color: '#475569', marginTop: '4px', fontSize: '11.5px' }}>

                    <b>Legacy Code:</b> {confirmModalTicket.legacy_code} • <b>Specs:</b> {confirmModalTicket.specification}

                  </div>

                </div>



                {/* Form Fields */}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>

                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Reviewing Officer Name:

                    </label>

                    <input

                      type="text"

                      value={officerName}

                      onChange={(e) => setOfficerName(e.target.value)}

                      placeholder="e.g. Dr. A. P. Sharma"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>



                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Designation / Authority Role:

                    </label>

                    <input

                      type="text"

                      value={officerRole}

                      onChange={(e) => setOfficerRole(e.target.value)}

                      placeholder="e.g. Superintending Engineer / Reviewer"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>

                </div>



                {/* Reason */}

                <div style={{ marginBottom: '14px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>

                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>

                      {confirmAction === 'APPROVE' 

                        ? 'Mandatory Confirmation Justification / Technical Review Reason:' 

                        : confirmAction === 'SEND_BACK'

                        ? 'Mandatory Reason for Sending Back / Clarification Required:'

                        : 'Mandatory Reason for Rejection:'}

                    </label>

                  </div>

                  <textarea

                    rows={3}

                    value={confirmationReason}

                    onChange={(e) => setConfirmationReason(e.target.value)}

                    placeholder={

                      confirmAction === 'APPROVE'

                        ? 'Enter formal justification for escalating to the next tier...'

                        : confirmAction === 'SEND_BACK'

                        ? 'Specify discrepancies or missing specifications requiring correction...'

                        : 'Enter formal justification for rejecting this application...'

                    }

                    style={{

                      width: '100%',

                      boxSizing: 'border-box',

                      padding: '10px 12px',

                      borderRadius: '8px',

                      border: '1px solid #cbd5e1',

                      fontSize: '13px',

                      fontFamily: 'inherit',

                      resize: 'vertical'

                    }}

                  />



                  {/* Preset Quick Chips */}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>

                    <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>Presets:</span>

                    {(confirmAction === 'APPROVE' 

                      ? (PRESET_CONFIRMATION_REASONS[confirmModalTicket.current_tier] || [])

                      : confirmAction === 'SEND_BACK'

                      ? PRESET_SEND_BACK_REASONS

                      : PRESET_REJECTION_REASONS

                    ).map((p, idx) => (

                      <button

                        key={idx}

                        type="button"

                        onClick={() => setConfirmationReason(p)}

                        style={{

                          backgroundColor: '#f1f5f9',

                          border: '1px solid #cbd5e1',

                          borderRadius: '12px',

                          fontSize: '11px',

                          color: '#334155',

                          padding: '2px 8px',

                          cursor: 'pointer'

                        }}

                      >

                        Preset {idx + 1}

                      </button>

                    ))}

                  </div>

                </div>



                {/* Information / Escalation preview */}

                <div style={{

                  padding: '10px 14px',

                  backgroundColor: confirmAction === 'APPROVE' ? '#eff6ff' : confirmAction === 'SEND_BACK' ? '#fffbeb' : '#fef2f2',

                  border: confirmAction === 'APPROVE' ? '1px solid #bfdbfe' : confirmAction === 'SEND_BACK' ? '1px solid #fde68a' : '1px solid #fecaca',

                  borderRadius: '8px',

                  fontSize: '12px',

                  color: confirmAction === 'APPROVE' ? '#1e40af' : confirmAction === 'SEND_BACK' ? '#92400e' : '#991b1b',

                  display: 'flex',

                  alignItems: 'flex-start',

                  gap: '8px'

                }}>

                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />

                  <div>

                    {confirmAction === 'APPROVE' ? (

                      confirmModalTicket.current_tier === 7 ? (

                        <span>

                          <b>Cabinet Sovereign Ratification:</b> Approving this tier officially affixes the Sovereign Seal, writes the authoritative record into <code>mira_national_master</code>, and syncs with CNMC definitions!

                        </span>

                      ) : confirmModalTicket.current_tier === 5 ? (

                        <span>

                          <b>Standardization Clearance:</b> Approving Tier 5 automatically triggers Laya AI normalization, mints an unused random 7-digit MIRA code (e.g. <code>MIRA-XXXXXXX</code>), and connects the Sovereign Machine URN!

                        </span>

                      ) : (

                        <span>

                          Approving will advance this application from <b>Tier {confirmModalTicket.current_tier}</b> to <b>Tier {confirmModalTicket.current_tier + 1}</b> and record a tamper-evident audit receipt.

                        </span>

                      )

                    ) : confirmAction === 'SEND_BACK' ? (

                      <span>

                        <b>Sending back</b> will return this application to <b>Tier {Math.max(1, confirmModalTicket.current_tier - 1)}</b> ({TIER_STEPS.find(s => s.tier === Math.max(1, confirmModalTicket.current_tier - 1))?.title}). The specified justification will be prominently displayed for correction.

                      </span>

                    ) : (

                      <span>

                        <b>Rejecting</b> will mark this application as <b>REJECTED</b>, logging your justification permanently in the governance audit ledger.

                      </span>

                    )}

                  </div>

                </div>

              </div>



              {/* Modal Footer */}

              <div style={{

                padding: '14px 24px',

                backgroundColor: '#f8fafc',

                borderTop: '1px solid #e2e8f0',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'flex-end',

                gap: '12px'

              }}>

                <button

                  type="button"

                  onClick={() => setConfirmModalTicket(null)}

                  disabled={isSubmittingConfirm}

                  style={{

                    padding: '8px 16px',

                    backgroundColor: '#ffffff',

                    color: '#475569',

                    border: '1px solid #cbd5e1',

                    borderRadius: '6px',

                    fontSize: '13px',

                    fontWeight: 600,

                    cursor: 'pointer'

                  }}

                >

                  Cancel

                </button>



                <button

                  type="button"

                  onClick={handleConfirmSubmit}

                  disabled={isSubmittingConfirm}

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    gap: '6px',

                    padding: '8px 20px',

                    backgroundColor: confirmAction === 'APPROVE' 

                      ? '#16a34a' 

                      : confirmAction === 'SEND_BACK' 

                      ? '#d97706' 

                      : '#dc2626',

                    color: '#ffffff',

                    border: 'none',

                    borderRadius: '6px',

                    fontSize: '13px',

                    fontWeight: 600,

                    cursor: isSubmittingConfirm ? 'not-allowed' : 'pointer',

                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'

                  }}

                >

                  {isSubmittingConfirm && <RefreshCw size={14} className="spinning" />}

                  <span>

                    {confirmAction === 'APPROVE'

                      ? (confirmModalTicket.current_tier === 7 ? 'Affix Sovereign Seal & Ratify Master' : `Approve & Advance to Tier ${confirmModalTicket.current_tier + 1}`)

                      : confirmAction === 'SEND_BACK'

                      ? `Send Back to Tier ${Math.max(1, confirmModalTicket.current_tier - 1)} with Reason`

                      : 'Confirm Permanent Rejection'}

                  </span>

                </button>

              </div>

            </div>

          </div>

        )}



        {/* Edit & Resubmit Modal for Tier 1 (when returned) */}

        {editModalTicket && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '680px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              <div style={{

                padding: '18px 24px',

                backgroundColor: '#78350f',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <Edit3 size={20} color="#fde68a" />

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      Correct Specifications & Resubmit (Tier 1 Plant Data Entry)

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#fde68a', marginTop: '2px' }}>

                      Application {editModalTicket.ticket_number} • Resubmitting to Tier 2 Plant Head

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setEditModalTicket(null)}

                  style={{ background: 'transparent', border: 'none', color: '#fde68a', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              <form onSubmit={handleEditSubmit}>

                <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>

                  {/* Reviewer reason alert */}

                  <div style={{

                    backgroundColor: '#fffbeb',

                    border: '1px solid #fde68a',

                    borderRadius: '8px',

                    padding: '12px 14px',

                    marginBottom: '16px'

                  }}>

                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>

                      Reviewer Return Reason (Remarks to Address):

                    </div>

                    <div style={{ fontSize: '12.5px', color: '#78350f', fontStyle: 'italic' }}>

                      "{editModalTicket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.confirmation_reason || 'Specifications require clarification.'}"

                    </div>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Material Name / Noun:

                      </label>

                      <input

                        type="text"

                        value={editForm.item_name}

                        onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}

                        required

                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                      />

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Legacy Plant Code:

                      </label>

                      <input

                        type="text"

                        value={editForm.legacy_code}

                        onChange={(e) => setEditForm({ ...editForm, legacy_code: e.target.value.toUpperCase() })}

                        required

                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}

                      />

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Technical Description:

                    </label>

                    <textarea

                      rows={2}

                      value={editForm.raw_description}

                      onChange={(e) => setEditForm({ ...editForm, raw_description: e.target.value })}

                      required

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Detailed Specifications & Standards (ASTM / ASME / ISO):

                    </label>

                    <input

                      type="text"

                      value={editForm.specification}

                      onChange={(e) => setEditForm({ ...editForm, specification: e.target.value })}

                      placeholder="e.g. ASTM A216 Gr WCB, Class 600, Stellite Trim, ASME B16.34"

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Resubmission Justification / Changes Made:

                    </label>

                    <textarea

                      rows={2}

                      value={editForm.resubmit_reason}

                      onChange={(e) => setEditForm({ ...editForm, resubmit_reason: e.target.value })}

                      required

                      placeholder="Describe the corrections made in response to the reviewer's remarks..."

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>

                </div>



                <div style={{

                  padding: '14px 24px',

                  backgroundColor: '#f8fafc',

                  borderTop: '1px solid #e2e8f0',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'flex-end',

                  gap: '12px'

                }}>

                  <button

                    type="button"

                    onClick={() => setEditModalTicket(null)}

                    disabled={isUpdatingTicket}

                    style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}

                  >

                    Cancel

                  </button>



                  <button

                    type="submit"

                    disabled={isUpdatingTicket}

                    style={{

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                      padding: '8px 20px',

                      backgroundColor: '#d97706',

                      color: '#ffffff',

                      border: 'none',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: isUpdatingTicket ? 'not-allowed' : 'pointer',

                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'

                    }}

                  >

                    {isUpdatingTicket && <RefreshCw size={14} className="spinning" />}

                    <span>Resubmit Application to Tier 2</span>

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



        {/* Create Tier 1 Ticket Modal */}

        {showCreateModal && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '680px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              {/* Modal Header */}

              <div style={{

                padding: '18px 24px',

                backgroundColor: '#0f172a',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <Plus size={20} color="#10b981" />

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      Propose New Material for Unified Code Induction (Tier 1: Plant Data Entry)

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>

                      Exclusive Tier 1 Privilege: Propose uncataloged new material to mint a Sovereign MIRA Unified Code

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setShowCreateModal(false)}

                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              {/* Modal Form */}

              <form onSubmit={handleCreateTicketSubmit}>

                <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Enterprise:

                      </label>

                      <select

                        value={createForm.cpse_name}

                        onChange={(e) => setCreateForm({ ...createForm, cpse_name: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

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

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Plant / Operating Unit:

                      </label>

                      <input

                        type="text"

                        value={createForm.plant_name}

                        onChange={(e) => setCreateForm({ ...createForm, plant_name: e.target.value })}

                        placeholder="e.g. Trichy Heavy Boiler Plant"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      />

                    </div>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Material Standard Name / Noun:

                      </label>

                      <input

                        type="text"

                        value={createForm.item_name}

                        onChange={(e) => setCreateForm({ ...createForm, item_name: e.target.value })}

                        placeholder="e.g. High Pressure Butterfly Valve 600#"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      />

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Legacy Material Code:

                      </label>

                      <input

                        type="text"

                        value={createForm.legacy_code}

                        onChange={(e) => setCreateForm({ ...createForm, legacy_code: e.target.value.toUpperCase() })}

                        placeholder="e.g. BHEL-TR-VLV-4910"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px',

                          fontFamily: 'monospace'

                        }}

                      />

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Raw Engineering Description:

                    </label>

                    <textarea

                      rows={2}

                      value={createForm.raw_description}

                      onChange={(e) => setCreateForm({ ...createForm, raw_description: e.target.value })}

                      placeholder="e.g. Triple eccentric high pressure steam isolation butterfly valve with stellite hardfaced seat"

                      required

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px',

                        fontFamily: 'inherit'

                      }}

                    />

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Domain:

                      </label>

                      <select

                        value={createForm.domain_code}

                        onChange={(e) => setCreateForm({ ...createForm, domain_code: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="MECH">Mechanical (MECH)</option>

                        <option value="ELEC">Electrical (ELEC)</option>

                        <option value="INST">Instrumentation (INST)</option>

                        <option value="CHEM">Chemical / Fluid (CHEM)</option>

                        <option value="CIVL">Civil / Structural (CIVL)</option>

                      </select>

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Category:

                      </label>

                      <select

                        value={createForm.category_code}

                        onChange={(e) => setCreateForm({ ...createForm, category_code: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="VAL">Valves (VAL)</option>

                        <option value="BRG">Bearings (BRG)</option>

                        <option value="PMP">Pumps (PMP)</option>

                        <option value="MOT">Motors (MOT)</option>

                        <option value="CBL">Cables (CBL)</option>

                        <option value="FST">Fasteners (FST)</option>

                      </select>

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Criticality / Priority:

                      </label>

                      <select

                        value={createForm.priority}

                        onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="Category A">Category A - Critical</option>

                        <option value="Category B">Category B - Standard</option>

                        <option value="Category C">Category C - General</option>

                      </select>

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Physical Specifications / Variant (Optional):

                    </label>

                    <input

                      type="text"

                      value={createForm.specification}

                      onChange={(e) => setCreateForm({ ...createForm, specification: e.target.value })}

                      placeholder="e.g. DN 300, PN 100, WCB Body, RTJ Flanged"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Initial New Material Induction Justification:

                    </label>

                    <textarea

                      rows={2}

                      value={createForm.initial_reason}

                      onChange={(e) => setCreateForm({ ...createForm, initial_reason: e.target.value })}

                      placeholder="e.g. Uncataloged new pump impeller required for plant overhaul; non-existent in current enterprise masters. Submitting for Unified Codification."

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px',

                        fontFamily: 'inherit'

                      }}

                    />

                  </div>



                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Indenting Storekeeper / Officer Name:

                    </label>

                    <input

                      type="text"

                      value={createForm.created_by}

                      onChange={(e) => setCreateForm({ ...createForm, created_by: e.target.value })}

                      placeholder="e.g. R. Sundaram (Store Incharge)"

                      required

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>

                </div>



                {/* Modal Footer */}

                <div style={{

                  padding: '14px 24px',

                  backgroundColor: '#f8fafc',

                  borderTop: '1px solid #e2e8f0',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'flex-end',

                  gap: '12px'

                }}>

                  <button

                    type="button"

                    onClick={() => setShowCreateModal(false)}

                    disabled={isCreatingTicket}

                    style={{

                      padding: '8px 16px',

                      backgroundColor: '#ffffff',

                      color: '#475569',

                      border: '1px solid #cbd5e1',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: 'pointer'

                    }}

                  >

                    Cancel

                  </button>



                  <button

                    type="submit"

                    disabled={isCreatingTicket}

                    style={{

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                      padding: '8px 20px',

                      backgroundColor: '#10b981',

                      color: '#ffffff',

                      border: 'none',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: isCreatingTicket ? 'not-allowed' : 'pointer',

                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'

                    }}

                  >

                    {isCreatingTicket && <RefreshCw size={14} className="spinning" />}

                    <span>Submit New Material Proposal</span>

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



      </div>

    </AppShell>

  );

};

��import './styles.css';

import React, { useState, useEffect, useMemo } from 'react';

import { 

  GitPullRequest, Search, Filter, Plus, ShieldCheck, CheckCircle2, 

  Clock, AlertTriangle, ArrowRight, Eye, RefreshCw, X, ChevronDown, 

  ChevronUp, Check, Building2, Layers, Cpu, Hash, ExternalLink, 

  Award, FileCheck, UserCheck, Send, AlertCircle, Copy, Sparkles,

  ArrowUpRight, BookmarkCheck, ChevronRight, Info, RotateCcw,

  CornerDownLeft, Lock, Unlock, Edit3

} from 'lucide-react';

import { AppShell } from '../../components/layout/AppShell';

import { api, getApiErrorMessage } from '../../api/client';

import { useAuthStore } from '../../store/authStore';



export interface TierHistoryItem {

  tier: number;

  tier_name: string;

  officer_name: string;

  officer_role: string;

  action: string;

  confirmation_reason: string;

  timestamp: string;

  suggested_mira_code?: string;

}



export interface TierTicket {

  id: string;

  ticket_number: string;

  cpse_name: string;

  plant_name: string;

  item_name: string;

  legacy_code: string;

  raw_description: string;

  specification: string;

  current_tier: number;

  tier_name: string;

  tier_title: string;

  status: 'PENDING_REVIEW' | 'REJECTED' | 'RATIFIED' | 'SENT_BACK' | string;

  priority: string;

  suggested_mira_code?: string | null;

  connected_machine_urn?: string | null;

  domain_code?: string;

  category_code?: string;

  tier_history: TierHistoryItem[];

  created_by: string;

  created_at: string;

  updated_at: string;

}



const TIER_STEPS = [

  { tier: 1, title: 'Tier 1: Plant Data Entry', role: 'Store Incharge / Plant Indenting Officer', scope: 'Plant Store', canCreate: true },

  { tier: 2, title: 'Tier 2: Plant Head Review', role: 'Plant Head / Superintending Engineer', scope: 'Plant Executive', canCreate: false },

  { tier: 3, title: 'Tier 3: Area / Subsidiary Leader', role: 'Area Chief General Manager / Director', scope: 'Intra-Subsidiary', canCreate: false },

  { tier: 4, title: 'Tier 4: CPSE Corporate HQ', role: 'Director (Technical) / ED (Procurement)', scope: 'Enterprise HQ', canCreate: false },

  { tier: 5, title: 'Tier 5: Standardization & AI', role: 'Laya AI Deduplication & Standardization Board', scope: 'Cross-CPSE Board', canCreate: false },

  { tier: 6, title: 'Tier 6: National Technical Council', role: 'National Technical Council / Joint Secretary', scope: 'Ministry Council', canCreate: false },

  { tier: 7, title: 'Tier 7: Cabinet Sovereign Oversight', role: 'Cabinet Secretariat / Sovereign Ratification Council', scope: 'Sovereign Republic', canCreate: false },

];



const PRESET_CONFIRMATION_REASONS: Record<number, string[]> = {

  1: [

    'New uncataloged material identified in plant stores; proposed for Sovereign Unified Codification.',

    'Urgent non-standard component required for capital plant overhaul; submitted for national induction.',

    'Verified physical stock zero and absence in local plant ERP master; submitted to Tier 2.'

  ],

  2: [

    'Plant Head verified technical specifications, criticality, and absence in plant master; cleared for Area review.',

    'Technical parameters and operating tolerances validated against plant standards; approved.',

    'Demand validated against plant machinery requirements. Recommended for intra-subsidiary harmonization.'

  ],

  3: [

    'Intra-subsidiary review confirmed non-existence across all sister plants. Cleared for Corporate HQ.',

    'Unique physical specification confirmed across regional pool. Approved for enterprise induction.',

    'Area technical committee cleared specifications and verified non-duplication with subsidiary assets.'

  ],

  4: [

    'CPSE Corporate Technical Directorate verified standardization compliance and corporate procurement policy.',

    'Corporate clearance granted. Forwarded to National Standardization Board for AI deduplication.',

    'Approved enterprise-wide requirement. Cleared for National Council alignment.'

  ],

  5: [

    'Laya AI deduplication verified 0% collision with existing sovereign master. ISO/ASME attributes normalized.',

    'Physical noun and boundary parameters normalized. Standardized definition approved by Technical Board.',

    'Cross-CPSE duplicate check cleared. Eligible for 7-digit Sovereign MIRA Code generation.'

  ],

  6: [

    'National Technical Council ratifies assigned 7-digit MIRA Standard Code and Machine URN.',

    'Approved unified nomenclature, cross-CPSE equivalence pointer, and technical hierarchy.',

    'Council verified specifications and recommended for Sovereign Cabinet Ratification.'

  ],

  7: [

    'Official Sovereign Seal affixed. Ratified into National Material Master Gazette.',

    'Cabinet Sovereign Oversight granted. Rate parity lock and national gazette order signed.',

    'Full inter-CPSE interchangeability confirmed. Ratified into sovereign public catalog.'

  ]

};



const PRESET_SEND_BACK_REASONS: string[] = [

  'Technical specifications incomplete: Please specify exact material grade (ASTM/IS/DIN) and pressure rating.',

  'Ambiguous physical dimensions: Attach dimensional tolerance drawing and flange rating.',

  'Suspected duplicate: Check if existing plant catalog item matches this specification.',

  'Incomplete operating parameters: Specify fluid medium, temperature limits, and design pressure.',

  'Taxonomy mismatch: Selected domain/category code does not match item noun; please reclassify.'

];



const PRESET_REJECTION_REASONS: string[] = [

  'Duplicate material already exists in MIRA Sovereign Master with an active unified code.',

  'Item obsolete or discontinued under national procurement guidelines.',

  'Does not meet minimum mandatory national technical standard requirements.',

  'Disallowed non-standard specification; standard existing alternative available in national catalog.'

];



export const TierWorkflowTicketsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  const { user } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);



  // Resolve actual user operational tier based on authenticated role

  const resolveUserTier = (role?: string): number => {

    if (!role) return 4;

    const r = role.toUpperCase();

    if (r.includes('TIER_1') || r.includes('PLANT')) return 1;

    if (r.includes('TIER_2') || r.includes('ZONE')) return 2;

    if (r.includes('TIER_3') || r.includes('AREA')) return 3;

    if (r.includes('DOMAIN_EXPERT')) return 5;

    if (r.includes('PLATFORM_ADMIN')) return 6;

    if (r.includes('NATIONAL') || r.includes('GOV')) return 7;

    return 4; // Default to Tier 4 / CPSE Admin

  };



  const actualUserTier = resolveUserTier(user?.roleCode);



  // Active Authority & Operational Tier Mode (defaults to user's real tier, e.g. Tier 4 for CPSE HQ)

  const [activeOperationalTier, setActiveOperationalTier] = useState<number>(() => resolveUserTier(user?.roleCode));



  const isNationalGov = user?.roleCode === 'NATIONAL_GOVERNANCE' || user?.roleCode === 'GOV_OVERSEER' || !user?.cpseCode;



  // Filters

  const [allTickets, setAllTickets] = useState<TierTicket[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [selectedCpse, setSelectedCpse] = useState<string>(() => (isNationalGov ? 'ALL' : (user?.cpseCode || 'BHEL')));



  useEffect(() => {

    if (!isNationalGov && user?.cpseCode) {

      setSelectedCpse(user.cpseCode);

    }

  }, [isNationalGov, user?.cpseCode]);



  // Modals & Action States

  const [confirmModalTicket, setConfirmModalTicket] = useState<TierTicket | null>(null);

  const [confirmAction, setConfirmAction] = useState<'APPROVE' | 'REJECT' | 'SEND_BACK'>('APPROVE');

  const [officerName, setOfficerName] = useState<string>(user?.fullName || 'Dr. K. S. Verma');

  const [officerRole, setOfficerRole] = useState<string>('');

  const [confirmationReason, setConfirmationReason] = useState<string>('');

  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState<boolean>(false);



  // Edit Modal State (when returned/sent back to Tier 1)

  const [editModalTicket, setEditModalTicket] = useState<TierTicket | null>(null);

  const [isUpdatingTicket, setIsUpdatingTicket] = useState<boolean>(false);

  const [editForm, setEditForm] = useState({

    item_name: '',

    legacy_code: '',

    raw_description: '',

    specification: '',

    priority: 'Category A',

    domain_code: 'MECH',

    category_code: 'VAL',

    resubmit_reason: ''

  });



  // Create Ticket Modal State

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);

  const [createForm, setCreateForm] = useState({

    cpse_name: user?.cpseCode || 'BHEL',

    plant_name: 'Trichy Heavy Boiler Plant',

    item_name: '',

    legacy_code: '',

    raw_description: '',

    specification: '',

    priority: 'Category A',

    domain_code: 'MECH',

    category_code: 'VAL',

    initial_reason: '',

    created_by: user?.fullName || 'Store Incharge'

  });



  // Expanded card history toggles

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const [copiedCode, setCopiedCode] = useState<string | null>(null);



  // Toast / notification

  const [toastMessage, setToastMessage] = useState<string | null>(null);



  const showToast = (msg: string) => {

    setToastMessage(msg);

    setTimeout(() => setToastMessage(null), 4500);

  };



  const fetchTickets = async () => {

    setLoading(true);

    setError(null);

    try {

      const activeCpse = !isNationalGov ? (user?.cpseCode || 'BHEL') : (selectedCpse !== 'ALL' ? selectedCpse : undefined);

      const res = await api.getTierTickets({

        cpse: activeCpse,

      });

      setAllTickets(res.data || []);

    } catch (err) {

      setError(getApiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTickets();

  }, [selectedCpse, isNationalGov, user?.cpseCode]);



  const handleSearchSubmit = (e: React.FormEvent) => {

    e.preventDefault();

  };



  // Open confirm modal with intelligent defaults for APPROVE, REJECT, and SEND_BACK

  const openConfirmModal = (ticket: TierTicket, action: 'APPROVE' | 'REJECT' | 'SEND_BACK' = 'APPROVE') => {

    setConfirmModalTicket(ticket);

    setConfirmAction(action);

    const tierMeta = TIER_STEPS.find(s => s.tier === ticket.current_tier);

    setOfficerName(user?.fullName || (user?.username ? user.username.toUpperCase() : 'Authority Officer'));

    setOfficerRole(tierMeta ? tierMeta.role : 'Authorized Reviewing Officer');

    

    if (action === 'APPROVE') {

      const presets = PRESET_CONFIRMATION_REASONS[ticket.current_tier] || [];

      setConfirmationReason(presets[0] || `Confirmed and verified technical parameters for ${ticket.item_name} at Tier ${ticket.current_tier}.`);

    } else if (action === 'SEND_BACK') {

      setConfirmationReason(PRESET_SEND_BACK_REASONS[0] || `Returned to Tier ${Math.max(1, ticket.current_tier - 1)} for technical specification clarification.`);

    } else {

      setConfirmationReason(PRESET_REJECTION_REASONS[0] || `Discrepancy identified in specifications for ${ticket.legacy_code}. Application rejected.`);

    }

  };



  const handleConfirmSubmit = async () => {

    if (!confirmModalTicket) return;

    if (!confirmationReason.trim()) {

      alert(`Please provide a mandatory justification reason before ${confirmAction === 'APPROVE' ? 'approving' : confirmAction === 'SEND_BACK' ? 'sending back' : 'rejecting'}.`);

      return;

    }



    setIsSubmittingConfirm(true);

    try {

      const res = await api.confirmTierTicket(confirmModalTicket.id, {

        officer_name: officerName.trim() || 'Authorizing Officer',

        officer_role: officerRole.trim() || 'Reviewing Authority',

        action: confirmAction,

        confirmation_reason: confirmationReason.trim()

      });



      showToast(res.message || 'Material application updated successfully.');

      setConfirmModalTicket(null);

      await fetchTickets();

    } catch (err) {

      alert(`Action failed: ${getApiErrorMessage(err)}`);

    } finally {

      setIsSubmittingConfirm(false);

    }

  };



  // Open edit modal for Tier 1 officer to correct specifications if sent back

  const openEditModal = (ticket: TierTicket) => {

    setEditModalTicket(ticket);

    setEditForm({

      item_name: ticket.item_name,

      legacy_code: ticket.legacy_code,

      raw_description: ticket.raw_description,

      specification: ticket.specification || '',

      priority: ticket.priority || 'Category A',

      domain_code: ticket.domain_code || 'MECH',

      category_code: ticket.category_code || 'VAL',

      resubmit_reason: 'Updated specifications and addressed reviewer remarks. Resubmitted to Tier 2 Plant Head.'

    });

  };



  const handleEditSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!editModalTicket) return;



    setIsUpdatingTicket(true);

    try {

      // 1. Update the specifications

      await api.updateTierTicket(editModalTicket.id, {

        item_name: editForm.item_name,

        legacy_code: editForm.legacy_code,

        raw_description: editForm.raw_description,

        specification: editForm.specification,

        priority: editForm.priority,

        domain_code: editForm.domain_code,

        category_code: editForm.category_code

      });



      // 2. Re-escalate to Tier 2

      await api.confirmTierTicket(editModalTicket.id, {

        officer_name: user?.fullName || 'Store Incharge',

        officer_role: 'Store Incharge / Plant Indenting Officer',

        action: 'APPROVE',

        confirmation_reason: editForm.resubmit_reason || 'Specifications corrected per reviewer remarks; resubmitted to Tier 2.'

      });



      showToast(`Material ${editForm.item_name} specifications updated and resubmitted to Tier 2!`);

      setEditModalTicket(null);

      await fetchTickets();

    } catch (err) {

      alert(`Failed to update and resubmit: ${getApiErrorMessage(err)}`);

    } finally {

      setIsUpdatingTicket(false);

    }

  };



  const handleCreateTicketSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (activeOperationalTier !== 1) {

      alert('Strict Governance Protocol: Only Tier 1 Plant Data Entry officers can initiate new material applications. Tiers 2–7 possess review, approval, rejection, and return authority only.');

      return;

    }



    if (!createForm.item_name.trim() || !createForm.legacy_code.trim() || !createForm.raw_description.trim()) {

      alert('Please fill in Item Name, Legacy Code, and Material Description.');

      return;

    }



    setIsCreatingTicket(true);

    try {

      const res = await api.createTierTicket({

        cpse_name: createForm.cpse_name.toUpperCase(),

        plant_name: createForm.plant_name,

        item_name: createForm.item_name,

        legacy_code: createForm.legacy_code,

        raw_description: createForm.raw_description,

        specification: createForm.specification,

        priority: createForm.priority,

        domain_code: createForm.domain_code,

        category_code: createForm.category_code,

        initial_reason: createForm.initial_reason || `New material codification proposed for ${createForm.item_name} to mint MIRA Sovereign Unified Code.`,

        created_by: createForm.created_by

      });



      showToast(res.message || 'Tier 1 Material Codification application submitted successfully.');

      setShowCreateModal(false);

      setCreateForm({

        cpse_name: user?.cpseCode || 'BHEL',

        plant_name: 'Trichy Heavy Boiler Plant',

        item_name: '',

        legacy_code: '',

        raw_description: '',

        specification: '',

        priority: 'Category A',

        domain_code: 'MECH',

        category_code: 'VAL',

        initial_reason: '',

        created_by: user?.fullName || 'Store Incharge'

      });

      await fetchTickets();

    } catch (err) {

      alert(`Failed to propose new material: ${getApiErrorMessage(err)}`);

    } finally {

      setIsCreatingTicket(false);

    }

  };



  const toggleCardHistory = (ticketId: string) => {

    setExpandedCards(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));

  };



  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);

    setCopiedCode(text);

    setTimeout(() => setCopiedCode(null), 2500);

  };



  // Filtered tickets based on tier, CPSE, status, searchQuery

  const filteredTickets = useMemo(() => {

    return allTickets.filter(ticket => {

      // 0. CPSE Scoping

      if (!isNationalGov && user?.cpseCode) {

        if (ticket.cpse_name?.toUpperCase() !== user.cpseCode.toUpperCase()) return false;

      } else if (isNationalGov && selectedCpse !== 'ALL') {

        if (ticket.cpse_name?.toUpperCase() !== selectedCpse.toUpperCase()) return false;

      }



      // 1. Fine-grained Tier filter

      if (selectedTier !== 'ALL') {

        if (selectedTier === '8') {

          if (ticket.status !== 'RATIFIED' && ticket.current_tier < 8) return false;

        } else if (ticket.current_tier.toString() !== selectedTier) {

          return false;

        }

      }



      // 2. Status filter

      if (selectedStatus !== 'ALL') {

        if (selectedStatus === 'RATIFIED') {

          if (ticket.status !== 'RATIFIED' && ticket.current_tier < 8) return false;

        } else if (ticket.status !== selectedStatus) {

          return false;

        }

      }



      // 3. Search query

      if (searchQuery.trim()) {

        const q = searchQuery.toLowerCase().trim();

        const matchNumber = ticket.ticket_number?.toLowerCase().includes(q);

        const matchItem = ticket.item_name?.toLowerCase().includes(q);

        const matchLegacy = ticket.legacy_code?.toLowerCase().includes(q);

        const matchMira = ticket.suggested_mira_code?.toLowerCase().includes(q);

        const matchPlant = ticket.plant_name?.toLowerCase().includes(q);

        const matchCpse = ticket.cpse_name?.toLowerCase().includes(q);

        if (!matchNumber && !matchItem && !matchLegacy && !matchMira && !matchPlant && !matchCpse) {

          return false;

        }

      }



      return true;

    });

  }, [allTickets, selectedTier, selectedStatus, searchQuery, selectedCpse, isNationalGov, user?.cpseCode]);



  const tickets = filteredTickets;



  // Pipeline metrics computed from allTickets

  const totalCount = allTickets.length;



  return (

    <AppShell

      currentPage="tier-tickets"

      onNavigate={onNavigate}

      title="New Material & Unified Code Induction"

      subtitle="Standardized national lifecycle for inducting uncataloged new materials (Tier 1) through Multi-Tier Verification, AI Harmonization, and Sovereign Unified Code Minting (Tier 7)"

    >

      <div className="gov-page-container">

        

        {/* Toast Alert Banner */}

        {toastMessage && (

          <div style={{

            position: 'fixed',

            bottom: '24px',

            right: '24px',

            zIndex: 9999,

            backgroundColor: '#0f172a',

            color: '#ffffff',

            padding: '14px 22px',

            borderRadius: '10px',

            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',

            display: 'flex',

            alignItems: 'center',

            gap: '12px',

            border: '1px solid #2563eb',

            animation: 'slideUp 0.3s ease-out'

          }}>

            <Sparkles size={18} color="#60a5fa" />

            <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{toastMessage}</span>

          </div>

        )}



        {/* Top Control Bar & Action Button */}

        <div style={{

          display: 'flex',

          flexWrap: 'wrap',

          alignItems: 'center',

          justifyContent: 'space-between',

          gap: '14px',

          marginBottom: '14px',

          backgroundColor: '#ffffff',

          padding: '14px 18px',

          borderRadius: '12px',

          border: '1px solid #e2e8f0',

          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'

        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <div style={{

              width: '38px',

              height: '38px',

              borderRadius: '9px',

              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',

              border: '1px solid #bfdbfe',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              color: '#2563eb',

              flexShrink: 0

            }}>

              <GitPullRequest size={20} />

            </div>

            <div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

                <h1 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>

                  New Material & Unified Code Induction

                </h1>

                <span style={{

                  fontSize: '11px',

                  fontWeight: 700,

                  padding: '2px 8px',

                  borderRadius: '10px',

                  backgroundColor: '#f1f5f9',

                  color: '#475569',

                  border: '1px solid #e2e8f0'

                }}>

                  {totalCount} Total in Pipeline

                </span>

              </div>

              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>

                7-Tier Sovereign Verification & Codification • Multi-CPSE Harmonization Workflow

              </p>

            </div>

          </div>





        </div>







        {/* Compact Search & Filter Toolbar */}

        <div style={{

          backgroundColor: '#ffffff',

          padding: '8px 12px',

          borderRadius: '10px',

          border: '1px solid #e2e8f0',

          marginBottom: '16px',

          display: 'flex',

          flexWrap: 'wrap',

          gap: '8px',

          alignItems: 'center',

          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'

        }}>

          {/* Search Input */}

          <div style={{ flex: '1 1 220px', position: 'relative' }}>

            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />

            <input

              type="text"

              placeholder="Search ticket #, material name, CPSE, or legacy code..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              style={{

                width: '100%',

                boxSizing: 'border-box',

                padding: '6px 26px 6px 30px',

                borderRadius: '6px',

                border: '1px solid #cbd5e1',

                fontSize: '12px',

                outline: 'none',

                color: '#1e293b'

              }}

            />

            {searchQuery && (

              <button

                type="button"

                onClick={() => setSearchQuery('')}

                style={{

                  position: 'absolute',

                  right: '8px',

                  top: '50%',

                  transform: 'translateY(-50%)',

                  background: 'none',

                  border: 'none',

                  cursor: 'pointer',

                  color: '#94a3b8',

                  padding: 0

                }}

              >

                <X size={13} />

              </button>

            )}

          </div>



          {/* CPSE Select (National Governance only; hidden for specified CPSE users) */}

          {isNationalGov && (

            <select

              value={selectedCpse}

              onChange={(e) => setSelectedCpse(e.target.value)}

              style={{

                padding: '6px 10px',

                borderRadius: '6px',

                border: '1px solid #cbd5e1',

                fontSize: '12px',

                fontWeight: 500,

                color: '#334155',

                backgroundColor: '#ffffff',

                outline: 'none'

              }}

            >

              <option value="ALL">All CPSEs</option>

              <option value="BHEL">BHEL</option>

              <option value="NTPC">NTPC</option>

              <option value="ONGC">ONGC</option>

              <option value="SAIL">SAIL</option>

              <option value="IOCL">IOCL</option>

              <option value="COAL INDIA">COAL INDIA</option>

              <option value="GAIL">GAIL</option>

            </select>

          )}



          {/* Status Select */}

          <select

            value={selectedStatus}

            onChange={(e) => setSelectedStatus(e.target.value)}

            style={{

              padding: '6px 10px',

              borderRadius: '6px',

              border: '1px solid #cbd5e1',

              fontSize: '12px',

              fontWeight: 500,

              color: '#334155',

              backgroundColor: '#ffffff',

              outline: 'none'

            }}

          >

            <option value="ALL">All Statuses</option>

            <option value="PENDING_REVIEW">Pending Review</option>

            <option value="RATIFIED">Ratified Master</option>

            <option value="REJECTED">Rejected</option>

            <option value="SENT_BACK">Sent Back</option>

          </select>



          {/* Micro Tier Pills */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>

            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginRight: '2px' }}>Tier:</span>

            {['ALL', '1', '2', '3', '4', '5', '6', '7'].map((t) => {

              const active = selectedTier === t;

              return (

                <button

                  key={t}

                  type="button"

                  onClick={() => setSelectedTier(t)}

                  style={{

                    padding: '3px 7px',

                    borderRadius: '4px',

                    fontSize: '11px',

                    fontWeight: 600,

                    border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',

                    backgroundColor: active ? '#2563eb' : '#f8fafc',

                    color: active ? '#ffffff' : '#64748b',

                    cursor: 'pointer',

                    transition: 'all 0.1s ease'

                  }}

                  title={t === 'ALL' ? 'All Tiers' : `Tier ${t}`}

                >

                  {t === 'ALL' ? 'All' : `T${t}`}

                </button>

              );

            })}

          </div>



          {/* Results count & reset */}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>

            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>

              Showing <strong>{tickets.length}</strong> of {totalCount}

            </span>

            {(selectedTier !== 'ALL' || selectedStatus !== 'ALL' || (isNationalGov && selectedCpse !== 'ALL') || searchQuery) && (

              <button

                type="button"

                onClick={() => {

                  setSelectedTier('ALL');

                  setSelectedStatus('ALL');

                  if (isNationalGov) {

                    setSelectedCpse('ALL');

                  }

                  setSearchQuery('');

                }}

                style={{

                  fontSize: '11px',

                  fontWeight: 600,

                  color: '#ef4444',

                  background: 'none',

                  border: 'none',

                  cursor: 'pointer',

                  padding: '2px 4px',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '2px'

                }}

              >

                <RotateCcw size={11} />

                <span>Reset</span>

              </button>

            )}

          </div>

        </div>



        {/* Tickets Listing */}

        {loading ? (

          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

            <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />

            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>Loading 7-Tier Requisition Tickets...</div>

            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Querying multi-tier audit ledger from PostgreSQL...</div>

          </div>

        ) : tickets.length === 0 ? (

          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

            <AlertCircle size={32} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>No Request Tickets Found</div>

            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 16px auto' }}>

              No tickets matched your filter criteria. Try changing filters or submit a new Tier 1 Request Ticket.

            </div>

            <button

              onClick={() => setShowCreateModal(true)}

              style={{

                padding: '8px 16px',

                backgroundColor: '#2563eb',

                color: '#ffffff',

                border: 'none',

                borderRadius: '8px',

                fontSize: '13px',

                fontWeight: 600,

                cursor: 'pointer'

              }}

            >

              + Create First Ticket

            </button>

          </div>

        ) : (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {tickets.map((ticket) => {

              const isExpanded = !!expandedCards[ticket.id];

              const isRatified = ticket.status === 'RATIFIED' || ticket.current_tier >= 8;

              const isRejected = ticket.status === 'REJECTED';

              const isSentBack = ticket.status === 'SENT_BACK';



              return (

                <div

                  key={ticket.id}

                  style={{

                    backgroundColor: '#ffffff',

                    borderRadius: '12px',

                    border: isRatified ? '1px solid #86efac' : isRejected ? '1px solid #fca5a5' : isSentBack ? '1.5px solid #fde68a' : '1px solid #e2e8f0',

                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',

                    overflow: 'hidden',

                    transition: 'all 0.2s ease'

                  }}

                >

                  {/* Card Header */}

                  <div style={{

                    padding: '16px 20px',

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: '12px',

                    backgroundColor: isRatified ? '#f0fdf4' : isSentBack ? '#fffbeb' : '#fafafa',

                    borderBottom: '1px solid #e2e8f0'

                  }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

                      <span style={{

                        fontFamily: 'monospace',

                        fontWeight: 700,

                        fontSize: '14px',

                        color: '#1e293b',

                        backgroundColor: '#ffffff',

                        padding: '4px 10px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1'

                      }}>

                        {ticket.ticket_number}

                      </span>



                      <span style={{

                        fontSize: '12px',

                        fontWeight: 700,

                        color: '#1d4ed8',

                        backgroundColor: '#dbeafe',

                        padding: '3px 9px',

                        borderRadius: '12px'

                      }}>

                        {ticket.cpse_name}

                      </span>



                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>

                        {ticket.plant_name}

                      </span>



                      <span style={{

                        fontSize: '11px',

                        fontWeight: 700,

                        padding: '2px 8px',

                        borderRadius: '10px',

                        backgroundColor: ticket.priority === 'Category A' ? '#fee2e2' : '#fef3c7',

                        color: ticket.priority === 'Category A' ? '#991b1b' : '#92400e'

                      }}>

                        {ticket.priority || 'Category B'}

                      </span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                      {isRatified ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#15803d',

                          backgroundColor: '#dcfce7',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #86efac'

                        }}>

                          <BookmarkCheck size={14} />

                          <span>SOVEREIGN RATIFIED MASTER</span>

                        </span>

                      ) : isRejected ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#b91c1c',

                          backgroundColor: '#fee2e2',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fca5a5'

                        }}>

                          <X size={13} />

                          <span>APPLICATION REJECTED</span>

                        </span>

                      ) : isSentBack ? (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '5px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#b45309',

                          backgroundColor: '#fef3c7',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fde68a'

                        }}>

                          <RotateCcw size={13} />

                          <span>RETURNED TO {ticket.tier_title.toUpperCase()}</span>

                        </span>

                      ) : (

                        <span style={{

                          display: 'flex',

                          alignItems: 'center',

                          gap: '6px',

                          fontSize: '12px',

                          fontWeight: 700,

                          color: '#c2410c',

                          backgroundColor: '#ffedd5',

                          padding: '4px 10px',

                          borderRadius: '12px',

                          border: '1px solid #fed7aa'

                        }}>

                          <Clock size={13} />

                          <span>CURRENT: {ticket.tier_title}</span>

                        </span>

                      )}

                    </div>

                  </div>



                  {/* Card Body: Item info & MIRA Code if reached Tier 6/7/Ratified */}

                  <div style={{ padding: '18px 20px' }}>

                    {/* Prominent return notice if returned with reason */}

                    {isSentBack && (

                      <div style={{

                        backgroundColor: '#fffbeb',

                        border: '1.5px solid #fde68a',

                        borderRadius: '8px',

                        padding: '12px 14px',

                        marginBottom: '16px',

                        display: 'flex',

                        alignItems: 'flex-start',

                        gap: '10px'

                      }}>

                        <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />

                        <div style={{ flex: 1 }}>

                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#92400e' }}>

                            Application Returned by Reviewing Authority:

                          </div>

                          <div style={{ fontSize: '12.5px', color: '#78350f', marginTop: '3px', fontStyle: 'italic' }}>

                            "{ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.confirmation_reason || 'Returned for specification clarifications.'}"

                          </div>

                          <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px' }}>

                            Reviewing Officer: {ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.officer_name || 'Reviewing Officer'} • {ticket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.officer_role || 'Reviewer'}

                          </div>

                        </div>

                      </div>

                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', marginBottom: '16px' }}>

                      <div style={{ flex: 1, minWidth: '280px' }}>

                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>

                          {ticket.item_name}

                        </h3>

                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>

                          {ticket.raw_description}

                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>

                          <div><b style={{ color: '#334155' }}>Legacy Code:</b> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{ticket.legacy_code}</code></div>

                          {ticket.specification && (

                            <div><b style={{ color: '#334155' }}>Specs:</b> {ticket.specification}</div>

                          )}

                          <div><b style={{ color: '#334155' }}>Domain:</b> {ticket.domain_code || 'MECH'} / {ticket.category_code || 'VAL'}</div>

                        </div>

                      </div>



                      {/* Authoritative MIRA Code Display Box (When minted at Tier 6 or 7) */}

                      {ticket.suggested_mira_code && (

                        <div style={{

                          backgroundColor: isRatified ? '#ecfdf5' : '#f8fafc',

                          border: isRatified ? '1.5px solid #10b981' : '1px solid #cbd5e1',

                          borderRadius: '10px',

                          padding: '12px 16px',

                          minWidth: '260px'

                        }}>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>

                            <span style={{ fontSize: '11px', fontWeight: 700, color: isRatified ? '#047857' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>

                              {isRatified ? '★ Sovereign Ratified MIRA Code' : '⚡ Minted 7-Digit MIRA Code'}

                            </span>

                            <button

                              onClick={() => copyToClipboard(ticket.suggested_mira_code!)}

                              style={{

                                background: 'transparent',

                                border: 'none',

                                cursor: 'pointer',

                                display: 'flex',

                                alignItems: 'center',

                                gap: '4px',

                                fontSize: '11px',

                                color: copiedCode === ticket.suggested_mira_code ? '#16a34a' : '#2563eb'

                              }}

                            >

                              {copiedCode === ticket.suggested_mira_code ? <Check size={12} /> : <Copy size={12} />}

                              <span>{copiedCode === ticket.suggested_mira_code ? 'Copied' : 'Copy'}</span>

                            </button>

                          </div>



                          <div style={{

                            fontFamily: 'monospace',

                            fontSize: '18px',

                            fontWeight: 800,

                            color: isRatified ? '#065f46' : '#1e293b',

                            letterSpacing: '0.02em'

                          }}>

                            {ticket.suggested_mira_code}

                          </div>



                          {ticket.connected_machine_urn && (

                            <div style={{

                              fontFamily: 'monospace',

                              fontSize: '11px',

                              color: '#64748b',

                              marginTop: '4px',

                              wordBreak: 'break-all'

                            }}>

                              {ticket.connected_machine_urn}

                            </div>

                          )}

                        </div>

                      )}

                    </div>







                    {/* Expandable History Drawer */}

                    {isExpanded && (

                      <div style={{

                        marginTop: '14px',

                        padding: '16px',

                        backgroundColor: '#f8fafc',

                        borderRadius: '10px',

                        border: '1px solid #e2e8f0'

                      }}>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>

                          <ShieldCheck size={16} color="#2563eb" />

                          <span>Tamper-Evident Multi-Tier Review Receipts ({ticket.tier_history?.length || 0})</span>

                        </div>



                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                          {ticket.tier_history?.map((h, idx) => (

                            <div

                              key={idx}

                              style={{

                                backgroundColor: '#ffffff',

                                borderRadius: '8px',

                                padding: '12px 14px',

                                border: '1px solid #e2e8f0',

                                borderLeft: h.action === 'REJECTED' ? '4px solid #ef4444' : '4px solid #10b981'

                              }}

                            >

                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>

                                    {h.tier_name}

                                  </span>

                                  <span style={{ fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>

                                    {h.officer_role}

                                  </span>

                                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>

                                    By: {h.officer_name}

                                  </span>

                                </div>

                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>

                                  {new Date(h.timestamp).toLocaleString()}

                                </span>

                              </div>



                              <div style={{

                                fontSize: '12.5px',

                                color: '#334155',

                                backgroundColor: '#f8fafc',

                                padding: '8px 10px',

                                borderRadius: '6px',

                                marginTop: '6px',

                                border: '1px solid #f1f5f9',

                                fontStyle: 'italic'

                              }}>

                                "{h.confirmation_reason}"

                              </div>

                            </div>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>



                  {/* Card Action Footer */}

                  <div style={{

                    padding: '12px 20px',

                    backgroundColor: '#fafafa',

                    borderTop: '1px solid #e2e8f0',

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    gap: '12px'

                  }}>

                    <button

                      onClick={() => toggleCardHistory(ticket.id)}

                      style={{

                        background: 'transparent',

                        border: 'none',

                        color: '#475569',

                        fontSize: '12.5px',

                        fontWeight: 600,

                        cursor: 'pointer',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '4px'

                      }}

                    >

                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}

                      <span>{isExpanded ? 'Hide Review Receipts' : `View Audit History (${ticket.tier_history?.length || 0})`}</span>

                    </button>



                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                      {isRatified ? (

                        <button

                          onClick={() => onNavigate('mira-catalog')}

                          style={{

                            display: 'flex',

                            alignItems: 'center',

                            gap: '6px',

                            padding: '7px 14px',

                            backgroundColor: '#16a34a',

                            color: '#ffffff',

                            border: 'none',

                            borderRadius: '6px',

                            fontSize: '12.5px',

                            fontWeight: 600,

                            cursor: 'pointer'

                          }}

                        >

                          <ExternalLink size={14} />

                          <span>View in National Unified Master</span>

                        </button>

                      ) : !isRejected ? (

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

                          {/* If returned to Tier 1, allow Tier 1 officer to edit specs and resubmit */}

                          {ticket.current_tier === 1 && isSentBack && (

                            <button

                              onClick={() => openEditModal(ticket)}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '5px',

                                padding: '7px 13px',

                                backgroundColor: '#fef3c7',

                                color: '#92400e',

                                border: '1px solid #fde68a',

                                borderRadius: '6px',

                                fontSize: '12.5px',

                                fontWeight: 700,

                                cursor: 'pointer'

                              }}

                            >

                              <Edit3 size={13} />

                              <span>Edit Specs & Resubmit to Tier 2</span>

                            </button>

                          )}



                          {/* Send Back with Reason (available for reviewing tiers >= 2) */}

                          {ticket.current_tier > 1 && (

                            <button

                              onClick={() => openConfirmModal(ticket, 'SEND_BACK')}

                              style={{

                                display: 'flex',

                                alignItems: 'center',

                                gap: '5px',

                                padding: '7px 12px',

                                backgroundColor: '#fffbeb',

                                color: '#b45309',

                                border: '1px solid #fde68a',

                                borderRadius: '6px',

                                fontSize: '12.5px',

                                fontWeight: 600,

                                cursor: 'pointer',

                                transition: 'all 0.15s ease'

                              }}

                              title={`Return to Tier ${ticket.current_tier - 1} with mandatory justification reason`}

                            >

                              <RotateCcw size={13} />

                              <span>Send Back with Reason</span>

                            </button>

                          )}



                          {/* Reject with Reason */}

                          <button

                            onClick={() => openConfirmModal(ticket, 'REJECT')}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '4px',

                              padding: '7px 12px',

                              backgroundColor: '#ffffff',

                              color: '#dc2626',

                              border: '1px solid #fca5a5',

                              borderRadius: '6px',

                              fontSize: '12.5px',

                              fontWeight: 600,

                              cursor: 'pointer'

                            }}

                          >

                            <X size={14} />

                            <span>Reject</span>

                          </button>



                          {/* Approve & Escalate / Ratify */}

                          <button

                            onClick={() => openConfirmModal(ticket, 'APPROVE')}

                            style={{

                              display: 'flex',

                              alignItems: 'center',

                              gap: '6px',

                              padding: '7px 16px',

                              background: ticket.current_tier === 7 

                                ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' 

                                : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',

                              color: '#ffffff',

                              border: 'none',

                              borderRadius: '6px',

                              fontSize: '12.5px',

                              fontWeight: 600,

                              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',

                              cursor: 'pointer'

                            }}

                          >

                            <UserCheck size={14} />

                            <span>

                              {ticket.current_tier === 7 

                                ? 'Affix Sovereign Seal & Ratify Master' 

                                : `Approve & Advance to Tier ${ticket.current_tier + 1}`}

                            </span>

                          </button>

                        </div>

                      ) : (

                        <button

                          onClick={() => openConfirmModal(ticket, 'APPROVE')}

                          style={{

                            padding: '7px 14px',

                            backgroundColor: '#f1f5f9',

                            color: '#334155',

                            border: '1px solid #cbd5e1',

                            borderRadius: '6px',

                            fontSize: '12.5px',

                            fontWeight: 600,

                            cursor: 'pointer'

                          }}

                        >

                          Reopen Application

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}



        {/* Confirmation & Decision Modal (Approve, Send Back with Reason, Reject) */}

        {confirmModalTicket && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '640px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              {/* Modal Header */}

              <div style={{

                padding: '18px 24px',

                backgroundColor: confirmAction === 'APPROVE' 

                  ? '#0f172a' 

                  : confirmAction === 'SEND_BACK' 

                  ? '#78350f' 

                  : '#7f1d1d',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  {confirmAction === 'APPROVE' ? (

                    <ShieldCheck size={20} color="#60a5fa" />

                  ) : confirmAction === 'SEND_BACK' ? (

                    <RotateCcw size={20} color="#fde68a" />

                  ) : (

                    <AlertTriangle size={20} color="#fca5a5" />

                  )}

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      {confirmAction === 'APPROVE' 

                        ? (confirmModalTicket.current_tier === 7 

                            ? 'Affix Sovereign Ratification Seal (Tier 7)' 

                            : `Approve & Advance to Tier ${confirmModalTicket.current_tier + 1}`)

                        : confirmAction === 'SEND_BACK'

                        ? `Send Back Material Application to Tier ${Math.max(1, confirmModalTicket.current_tier - 1)}`

                        : `Reject Material Application (${confirmModalTicket.ticket_number})`}

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>

                      Application {confirmModalTicket.ticket_number} • {confirmModalTicket.cpse_name} ({confirmModalTicket.plant_name})

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setConfirmModalTicket(null)}

                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              {/* Modal Body */}

              <div style={{ padding: '20px 24px' }}>

                <div style={{

                  backgroundColor: '#f8fafc',

                  border: '1px solid #e2e8f0',

                  borderRadius: '8px',

                  padding: '12px 14px',

                  marginBottom: '16px',

                  fontSize: '12.5px'

                }}>

                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{confirmModalTicket.item_name}</div>

                  <div style={{ color: '#64748b', marginTop: '2px' }}>{confirmModalTicket.raw_description}</div>

                  <div style={{ color: '#475569', marginTop: '4px', fontSize: '11.5px' }}>

                    <b>Legacy Code:</b> {confirmModalTicket.legacy_code} • <b>Specs:</b> {confirmModalTicket.specification}

                  </div>

                </div>



                {/* Form Fields */}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>

                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Reviewing Officer Name:

                    </label>

                    <input

                      type="text"

                      value={officerName}

                      onChange={(e) => setOfficerName(e.target.value)}

                      placeholder="e.g. Dr. A. P. Sharma"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>



                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Designation / Authority Role:

                    </label>

                    <input

                      type="text"

                      value={officerRole}

                      onChange={(e) => setOfficerRole(e.target.value)}

                      placeholder="e.g. Superintending Engineer / Reviewer"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>

                </div>



                {/* Reason */}

                <div style={{ marginBottom: '14px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>

                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>

                      {confirmAction === 'APPROVE' 

                        ? 'Mandatory Confirmation Justification / Technical Review Reason:' 

                        : confirmAction === 'SEND_BACK'

                        ? 'Mandatory Reason for Sending Back / Clarification Required:'

                        : 'Mandatory Reason for Rejection:'}

                    </label>

                  </div>

                  <textarea

                    rows={3}

                    value={confirmationReason}

                    onChange={(e) => setConfirmationReason(e.target.value)}

                    placeholder={

                      confirmAction === 'APPROVE'

                        ? 'Enter formal justification for escalating to the next tier...'

                        : confirmAction === 'SEND_BACK'

                        ? 'Specify discrepancies or missing specifications requiring correction...'

                        : 'Enter formal justification for rejecting this application...'

                    }

                    style={{

                      width: '100%',

                      boxSizing: 'border-box',

                      padding: '10px 12px',

                      borderRadius: '8px',

                      border: '1px solid #cbd5e1',

                      fontSize: '13px',

                      fontFamily: 'inherit',

                      resize: 'vertical'

                    }}

                  />



                  {/* Preset Quick Chips */}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>

                    <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>Presets:</span>

                    {(confirmAction === 'APPROVE' 

                      ? (PRESET_CONFIRMATION_REASONS[confirmModalTicket.current_tier] || [])

                      : confirmAction === 'SEND_BACK'

                      ? PRESET_SEND_BACK_REASONS

                      : PRESET_REJECTION_REASONS

                    ).map((p, idx) => (

                      <button

                        key={idx}

                        type="button"

                        onClick={() => setConfirmationReason(p)}

                        style={{

                          backgroundColor: '#f1f5f9',

                          border: '1px solid #cbd5e1',

                          borderRadius: '12px',

                          fontSize: '11px',

                          color: '#334155',

                          padding: '2px 8px',

                          cursor: 'pointer'

                        }}

                      >

                        Preset {idx + 1}

                      </button>

                    ))}

                  </div>

                </div>



                {/* Information / Escalation preview */}

                <div style={{

                  padding: '10px 14px',

                  backgroundColor: confirmAction === 'APPROVE' ? '#eff6ff' : confirmAction === 'SEND_BACK' ? '#fffbeb' : '#fef2f2',

                  border: confirmAction === 'APPROVE' ? '1px solid #bfdbfe' : confirmAction === 'SEND_BACK' ? '1px solid #fde68a' : '1px solid #fecaca',

                  borderRadius: '8px',

                  fontSize: '12px',

                  color: confirmAction === 'APPROVE' ? '#1e40af' : confirmAction === 'SEND_BACK' ? '#92400e' : '#991b1b',

                  display: 'flex',

                  alignItems: 'flex-start',

                  gap: '8px'

                }}>

                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />

                  <div>

                    {confirmAction === 'APPROVE' ? (

                      confirmModalTicket.current_tier === 7 ? (

                        <span>

                          <b>Cabinet Sovereign Ratification:</b> Approving this tier officially affixes the Sovereign Seal, writes the authoritative record into <code>mira_national_master</code>, and syncs with CNMC definitions!

                        </span>

                      ) : confirmModalTicket.current_tier === 5 ? (

                        <span>

                          <b>Standardization Clearance:</b> Approving Tier 5 automatically triggers Laya AI normalization, mints an unused random 7-digit MIRA code (e.g. <code>MIRA-XXXXXXX</code>), and connects the Sovereign Machine URN!

                        </span>

                      ) : (

                        <span>

                          Approving will advance this application from <b>Tier {confirmModalTicket.current_tier}</b> to <b>Tier {confirmModalTicket.current_tier + 1}</b> and record a tamper-evident audit receipt.

                        </span>

                      )

                    ) : confirmAction === 'SEND_BACK' ? (

                      <span>

                        <b>Sending back</b> will return this application to <b>Tier {Math.max(1, confirmModalTicket.current_tier - 1)}</b> ({TIER_STEPS.find(s => s.tier === Math.max(1, confirmModalTicket.current_tier - 1))?.title}). The specified justification will be prominently displayed for correction.

                      </span>

                    ) : (

                      <span>

                        <b>Rejecting</b> will mark this application as <b>REJECTED</b>, logging your justification permanently in the governance audit ledger.

                      </span>

                    )}

                  </div>

                </div>

              </div>



              {/* Modal Footer */}

              <div style={{

                padding: '14px 24px',

                backgroundColor: '#f8fafc',

                borderTop: '1px solid #e2e8f0',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'flex-end',

                gap: '12px'

              }}>

                <button

                  type="button"

                  onClick={() => setConfirmModalTicket(null)}

                  disabled={isSubmittingConfirm}

                  style={{

                    padding: '8px 16px',

                    backgroundColor: '#ffffff',

                    color: '#475569',

                    border: '1px solid #cbd5e1',

                    borderRadius: '6px',

                    fontSize: '13px',

                    fontWeight: 600,

                    cursor: 'pointer'

                  }}

                >

                  Cancel

                </button>



                <button

                  type="button"

                  onClick={handleConfirmSubmit}

                  disabled={isSubmittingConfirm}

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    gap: '6px',

                    padding: '8px 20px',

                    backgroundColor: confirmAction === 'APPROVE' 

                      ? '#16a34a' 

                      : confirmAction === 'SEND_BACK' 

                      ? '#d97706' 

                      : '#dc2626',

                    color: '#ffffff',

                    border: 'none',

                    borderRadius: '6px',

                    fontSize: '13px',

                    fontWeight: 600,

                    cursor: isSubmittingConfirm ? 'not-allowed' : 'pointer',

                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'

                  }}

                >

                  {isSubmittingConfirm && <RefreshCw size={14} className="spinning" />}

                  <span>

                    {confirmAction === 'APPROVE'

                      ? (confirmModalTicket.current_tier === 7 ? 'Affix Sovereign Seal & Ratify Master' : `Approve & Advance to Tier ${confirmModalTicket.current_tier + 1}`)

                      : confirmAction === 'SEND_BACK'

                      ? `Send Back to Tier ${Math.max(1, confirmModalTicket.current_tier - 1)} with Reason`

                      : 'Confirm Permanent Rejection'}

                  </span>

                </button>

              </div>

            </div>

          </div>

        )}



        {/* Edit & Resubmit Modal for Tier 1 (when returned) */}

        {editModalTicket && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '680px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              <div style={{

                padding: '18px 24px',

                backgroundColor: '#78350f',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <Edit3 size={20} color="#fde68a" />

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      Correct Specifications & Resubmit (Tier 1 Plant Data Entry)

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#fde68a', marginTop: '2px' }}>

                      Application {editModalTicket.ticket_number} • Resubmitting to Tier 2 Plant Head

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setEditModalTicket(null)}

                  style={{ background: 'transparent', border: 'none', color: '#fde68a', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              <form onSubmit={handleEditSubmit}>

                <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>

                  {/* Reviewer reason alert */}

                  <div style={{

                    backgroundColor: '#fffbeb',

                    border: '1px solid #fde68a',

                    borderRadius: '8px',

                    padding: '12px 14px',

                    marginBottom: '16px'

                  }}>

                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>

                      Reviewer Return Reason (Remarks to Address):

                    </div>

                    <div style={{ fontSize: '12.5px', color: '#78350f', fontStyle: 'italic' }}>

                      "{editModalTicket.tier_history?.filter(h => h.action === 'SENT_BACK').slice(-1)[0]?.confirmation_reason || 'Specifications require clarification.'}"

                    </div>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Material Name / Noun:

                      </label>

                      <input

                        type="text"

                        value={editForm.item_name}

                        onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}

                        required

                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                      />

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Legacy Plant Code:

                      </label>

                      <input

                        type="text"

                        value={editForm.legacy_code}

                        onChange={(e) => setEditForm({ ...editForm, legacy_code: e.target.value.toUpperCase() })}

                        required

                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}

                      />

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Technical Description:

                    </label>

                    <textarea

                      rows={2}

                      value={editForm.raw_description}

                      onChange={(e) => setEditForm({ ...editForm, raw_description: e.target.value })}

                      required

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Detailed Specifications & Standards (ASTM / ASME / ISO):

                    </label>

                    <input

                      type="text"

                      value={editForm.specification}

                      onChange={(e) => setEditForm({ ...editForm, specification: e.target.value })}

                      placeholder="e.g. ASTM A216 Gr WCB, Class 600, Stellite Trim, ASME B16.34"

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Resubmission Justification / Changes Made:

                    </label>

                    <textarea

                      rows={2}

                      value={editForm.resubmit_reason}

                      onChange={(e) => setEditForm({ ...editForm, resubmit_reason: e.target.value })}

                      required

                      placeholder="Describe the corrections made in response to the reviewer's remarks..."

                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}

                    />

                  </div>

                </div>



                <div style={{

                  padding: '14px 24px',

                  backgroundColor: '#f8fafc',

                  borderTop: '1px solid #e2e8f0',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'flex-end',

                  gap: '12px'

                }}>

                  <button

                    type="button"

                    onClick={() => setEditModalTicket(null)}

                    disabled={isUpdatingTicket}

                    style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}

                  >

                    Cancel

                  </button>



                  <button

                    type="submit"

                    disabled={isUpdatingTicket}

                    style={{

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                      padding: '8px 20px',

                      backgroundColor: '#d97706',

                      color: '#ffffff',

                      border: 'none',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: isUpdatingTicket ? 'not-allowed' : 'pointer',

                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'

                    }}

                  >

                    {isUpdatingTicket && <RefreshCw size={14} className="spinning" />}

                    <span>Resubmit Application to Tier 2</span>

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



        {/* Create Tier 1 Ticket Modal */}

        {showCreateModal && (

          <div style={{

            position: 'fixed',

            top: 0,

            left: 0,

            right: 0,

            bottom: 0,

            backgroundColor: 'rgba(15, 23, 42, 0.65)',

            backdropFilter: 'blur(4px)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            zIndex: 10000,

            padding: '20px'

          }}>

            <div style={{

              backgroundColor: '#ffffff',

              borderRadius: '14px',

              maxWidth: '680px',

              width: '100%',

              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',

              overflow: 'hidden',

              animation: 'scaleIn 0.2s ease-out'

            }}>

              {/* Modal Header */}

              <div style={{

                padding: '18px 24px',

                backgroundColor: '#0f172a',

                color: '#ffffff',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'space-between'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <Plus size={20} color="#10b981" />

                  <div>

                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>

                      Propose New Material for Unified Code Induction (Tier 1: Plant Data Entry)

                    </h3>

                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>

                      Exclusive Tier 1 Privilege: Propose uncataloged new material to mint a Sovereign MIRA Unified Code

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setShowCreateModal(false)}

                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}

                >

                  <X size={18} />

                </button>

              </div>



              {/* Modal Form */}

              <form onSubmit={handleCreateTicketSubmit}>

                <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Enterprise:

                      </label>

                      <select

                        value={createForm.cpse_name}

                        onChange={(e) => setCreateForm({ ...createForm, cpse_name: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

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

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Plant / Operating Unit:

                      </label>

                      <input

                        type="text"

                        value={createForm.plant_name}

                        onChange={(e) => setCreateForm({ ...createForm, plant_name: e.target.value })}

                        placeholder="e.g. Trichy Heavy Boiler Plant"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      />

                    </div>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Material Standard Name / Noun:

                      </label>

                      <input

                        type="text"

                        value={createForm.item_name}

                        onChange={(e) => setCreateForm({ ...createForm, item_name: e.target.value })}

                        placeholder="e.g. High Pressure Butterfly Valve 600#"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      />

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        CPSE Legacy Material Code:

                      </label>

                      <input

                        type="text"

                        value={createForm.legacy_code}

                        onChange={(e) => setCreateForm({ ...createForm, legacy_code: e.target.value.toUpperCase() })}

                        placeholder="e.g. BHEL-TR-VLV-4910"

                        required

                        style={{

                          width: '100%',

                          boxSizing: 'border-box',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px',

                          fontFamily: 'monospace'

                        }}

                      />

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Raw Engineering Description:

                    </label>

                    <textarea

                      rows={2}

                      value={createForm.raw_description}

                      onChange={(e) => setCreateForm({ ...createForm, raw_description: e.target.value })}

                      placeholder="e.g. Triple eccentric high pressure steam isolation butterfly valve with stellite hardfaced seat"

                      required

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px',

                        fontFamily: 'inherit'

                      }}

                    />

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>

                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Domain:

                      </label>

                      <select

                        value={createForm.domain_code}

                        onChange={(e) => setCreateForm({ ...createForm, domain_code: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="MECH">Mechanical (MECH)</option>

                        <option value="ELEC">Electrical (ELEC)</option>

                        <option value="INST">Instrumentation (INST)</option>

                        <option value="CHEM">Chemical / Fluid (CHEM)</option>

                        <option value="CIVL">Civil / Structural (CIVL)</option>

                      </select>

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Category:

                      </label>

                      <select

                        value={createForm.category_code}

                        onChange={(e) => setCreateForm({ ...createForm, category_code: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="VAL">Valves (VAL)</option>

                        <option value="BRG">Bearings (BRG)</option>

                        <option value="PMP">Pumps (PMP)</option>

                        <option value="MOT">Motors (MOT)</option>

                        <option value="CBL">Cables (CBL)</option>

                        <option value="FST">Fasteners (FST)</option>

                      </select>

                    </div>



                    <div>

                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                        Criticality / Priority:

                      </label>

                      <select

                        value={createForm.priority}

                        onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}

                        style={{

                          width: '100%',

                          padding: '8px 12px',

                          borderRadius: '6px',

                          border: '1px solid #cbd5e1',

                          fontSize: '13px'

                        }}

                      >

                        <option value="Category A">Category A - Critical</option>

                        <option value="Category B">Category B - Standard</option>

                        <option value="Category C">Category C - General</option>

                      </select>

                    </div>

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Physical Specifications / Variant (Optional):

                    </label>

                    <input

                      type="text"

                      value={createForm.specification}

                      onChange={(e) => setCreateForm({ ...createForm, specification: e.target.value })}

                      placeholder="e.g. DN 300, PN 100, WCB Body, RTJ Flanged"

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>



                  <div style={{ marginBottom: '14px' }}>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Initial New Material Induction Justification:

                    </label>

                    <textarea

                      rows={2}

                      value={createForm.initial_reason}

                      onChange={(e) => setCreateForm({ ...createForm, initial_reason: e.target.value })}

                      placeholder="e.g. Uncataloged new pump impeller required for plant overhaul; non-existent in current enterprise masters. Submitting for Unified Codification."

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px',

                        fontFamily: 'inherit'

                      }}

                    />

                  </div>



                  <div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>

                      Indenting Storekeeper / Officer Name:

                    </label>

                    <input

                      type="text"

                      value={createForm.created_by}

                      onChange={(e) => setCreateForm({ ...createForm, created_by: e.target.value })}

                      placeholder="e.g. R. Sundaram (Store Incharge)"

                      required

                      style={{

                        width: '100%',

                        boxSizing: 'border-box',

                        padding: '8px 12px',

                        borderRadius: '6px',

                        border: '1px solid #cbd5e1',

                        fontSize: '13px'

                      }}

                    />

                  </div>

                </div>



                {/* Modal Footer */}

                <div style={{

                  padding: '14px 24px',

                  backgroundColor: '#f8fafc',

                  borderTop: '1px solid #e2e8f0',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'flex-end',

                  gap: '12px'

                }}>

                  <button

                    type="button"

                    onClick={() => setShowCreateModal(false)}

                    disabled={isCreatingTicket}

                    style={{

                      padding: '8px 16px',

                      backgroundColor: '#ffffff',

                      color: '#475569',

                      border: '1px solid #cbd5e1',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: 'pointer'

                    }}

                  >

                    Cancel

                  </button>



                  <button

                    type="submit"

                    disabled={isCreatingTicket}

                    style={{

                      display: 'flex',

                      alignItems: 'center',

                      gap: '6px',

                      padding: '8px 20px',

                      backgroundColor: '#10b981',

                      color: '#ffffff',

                      border: 'none',

                      borderRadius: '6px',

                      fontSize: '13px',

                      fontWeight: 600,

                      cursor: isCreatingTicket ? 'not-allowed' : 'pointer',

                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'

                    }}

                  >

                    {isCreatingTicket && <RefreshCw size={14} className="spinning" />}

                    <span>Submit New Material Proposal</span>

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



      </div>

    </AppShell>

  );

};

2��������8��"i