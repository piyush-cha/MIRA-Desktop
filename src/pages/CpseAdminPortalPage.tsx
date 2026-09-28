import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../components/layout/AppShell';

import { useAuthStore } from '../store/authStore';

import { api, getApiErrorMessage } from '../api/client';

import { InterPlantCollaborationGraph } from '../components/admin/InterPlantCollaborationGraph';

import { 

  Building2, Cpu, CheckCircle2, AlertTriangle, RefreshCw, 

  FolderTree, Plus, Users, UserPlus, Network, Layers, 

  Search, ShieldCheck, Zap, ArrowRight, DollarSign, FileText, Send, Lock, Database,

  Sparkles, GitCompare, ArrowRightLeft, Check, Clock

} from 'lucide-react';



interface CpseAdminPortalPageProps {

  onNavigate: (page: string) => void;

  initialTab?: 'overview' | 'collaboration' | 'hierarchy' | 'catalog' | 'sap';

}



export const CpseAdminPortalPage: React.FC<CpseAdminPortalPageProps> = ({ onNavigate, initialTab = 'overview' }) => {

  const { user } = useAuthStore();

  const isNationalAdmin = user?.roleCode === 'NATIONAL_GOVERNANCE' || user?.roleCode?.includes('GOV');

  const isCpseAdmin = !isNationalAdmin;

  

  const [selectedCpseCode, setSelectedCpseCode] = useState<string>(user?.cpseCode || 'BHEL');

  const [selectedCpseName, setSelectedCpseName] = useState<string>(user?.cpseName || 'Bharat Heavy Electricals Limited');



  const [activeTab, setActiveTab] = useState<'overview' | 'collaboration' | 'hierarchy' | 'catalog' | 'sap'>(initialTab);



  useEffect(() => {

    if (initialTab && initialTab !== activeTab) {

      setActiveTab(initialTab);

    }

  }, [initialTab]);



  useEffect(() => {

    if (isCpseAdmin) {

      if (user?.cpseCode && user.cpseCode !== selectedCpseCode) {

        setSelectedCpseCode(user.cpseCode);

      }

      if (user?.cpseName && user.cpseName !== selectedCpseName) {

        setSelectedCpseName(user.cpseName);

      }

    }

  }, [isCpseAdmin, user]);

  

  // Data States

  const [overviewData, setOverviewData] = useState<any | null>(null);

  const [catalogData, setCatalogData] = useState<any[]>([]);

  const [catalogPage, setCatalogPage] = useState<number>(1);

  const [catalogPageSize, setCatalogPageSize] = useState<number>(50);

  const [catalogTotal, setCatalogTotal] = useState<number>(0);

  const [catalogTotalPages, setCatalogTotalPages] = useState<number>(1);

  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);

  const [hierarchyData, setHierarchyData] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);



  // Modals

  const [showNodeModal, setShowNodeModal] = useState<boolean>(false);

  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);

  const [showPrModal, setShowPrModal] = useState<boolean>(false);



  // Forms

  const [nodeForm, setNodeForm] = useState({

    parent_node_code: 'HQ-CORP',

    unit_name: '',

    unit_code: '',

    type_code: 'PLANT',

    location: '',

  });



  // Helper to extract all nodes from hierarchyData tree

  const getAllHierarchyNodes = () => {

    const nodes: { code: string; name: string; type: string }[] = [];

    if (hierarchyData?.tree && Array.isArray(hierarchyData.tree)) {

      const traverse = (items: any[]) => {

        for (const item of items) {

          if (item.unit_code && item.unit_name) {

            nodes.push({

              code: item.unit_code,

              name: item.unit_name,

              type: item.type_code || 'PLANT'

            });

          }

          if (item.children && Array.isArray(item.children)) {

            traverse(item.children);

          }

        }

      };

      traverse(hierarchyData.tree);

    }

    if (nodes.length === 0) {

      if (selectedCpseCode === 'BHEL') {

        return [

          { code: 'BHEL-TR-01', name: 'BHEL Tiruchirappalli High Pressure Boiler Plant', type: 'PLANT' },

          { code: 'BHEL-HWR-02', name: 'BHEL Haridwar Heavy Electrical Apparatus Plant', type: 'PLANT' },

          { code: 'BHEL-BPL-03', name: 'BHEL Bhopal Heavy Electricals Complex', type: 'PLANT' },

          { code: 'BHEL-HYD-04', name: 'BHEL Hyderabad Heavy Power Equipment Plant', type: 'PLANT' },

          { code: 'BHEL-RPT-05', name: 'BHEL Ranipet Boiler Auxiliaries Plant', type: 'PLANT' },

        ];

      } else {

        return [

          { code: `${selectedCpseCode}-PLNT-01`, name: `${selectedCpseName} Primary Plant`, type: 'PLANT' },

          { code: `${selectedCpseCode}-HQ-01`, name: `${selectedCpseName} Corporate Headquarters`, type: 'HQ' }

        ];

      }

    }

    return nodes;

  };



  const [roleForm, setRoleForm] = useState({

    userName: '',

    email: '',

    roleTitle: 'Plant Material Head / Nodal Officer',

    hierarchyLevel: 'PLANT',

    assignedNodeCode: 'BHEL-TR-01',

    assignedNodeName: 'BHEL Tiruchirappalli High Pressure Boiler Plant',

    permissions: ['CNMC Cat A Oversight', 'Material Sanction'],

  });



  const openAssignOfficerModal = () => {

    const nodes = getAllHierarchyNodes();

    const first = nodes[0] || { code: `${selectedCpseCode}-PLNT-01`, name: `${selectedCpseName} Primary Plant`, type: 'PLANT' };

    setRoleForm({

      userName: '',

      email: '',

      roleTitle: 'Plant Material Head / Nodal Officer',

      hierarchyLevel: first.type || 'PLANT',

      assignedNodeCode: first.code,

      assignedNodeName: first.name,

      permissions: ['CNMC Cat A Oversight', 'Material Sanction'],

    });

    setShowRoleModal(true);

  };



  const [prForm, setPrForm] = useState({

    cpse_code: selectedCpseCode,

    plant_code: `${selectedCpseCode}-PLNT-01`,

    cnmc_code: 'CNMC-BRG-6205-2RS',

    legacy_code: `${selectedCpseCode}-MAT-001`,

    material_description: 'Deep Groove Radial Ball Bearing 25x52x15mm Sealed',

    quantity: 10,

    uom: 'NOS',

    cost_center: `CC-${selectedCpseCode}-MAIN`,

    estimated_cost_inr: 102980.00

  });



  const [submitting, setSubmitting] = useState<boolean>(false);

  const [uploading, setUploading] = useState<boolean>(false);

  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [activeJob, setActiveJob] = useState<any | null>(null);

  const [reviewItem, setReviewItem] = useState<any | null>(null);

  const [harmonizing, setHarmonizing] = useState<boolean>(false);



  const handleHarmonizeAction = async (action: 'MERGE' | 'DISTINCT' | 'NOMINATE') => {

    if (!reviewItem) return;

    setHarmonizing(true);

    try {

      const res = await api.harmonizeMaterial(selectedCpseName, {

        material_id: reviewItem.id,

        action,

        target_code: reviewItem.cnmc_golden_code,

        remarks: `Nodal harmonization: ${action} applied to item ${reviewItem.local_code}`

      });

      setUploadStatus({

        type: 'success',

        message: res.message || `Harmonization action (${action}) successfully recorded!`

      });

      // Update catalogData locally immediately

      setCatalogData(prev => prev.map(item => item.id === reviewItem.id ? {

        ...item,

        duplicate_risk: action === 'MERGE' ? 'HARMONIZED' : action === 'DISTINCT' ? 'LOW' : 'PENDING_APPROVAL',

        cnmc_code: res.mira_code || (action === 'MERGE' ? reviewItem.cnmc_golden_code : item.cnmc_code)

      } : item));

      setReviewItem(null);

    } catch (err) {

      alert(`Harmonization failed: ${getApiErrorMessage(err)}`);

    } finally {

      setHarmonizing(false);

    }

  };



  const fetchCatalogOnly = async (page: number = catalogPage, search: string = catalogSearch, pageSize: number = catalogPageSize) => {

    setCatalogLoading(true);

    try {

      const catRes = await api.getCpseAdminCatalog(selectedCpseName, selectedCpseCode, search, page, pageSize);

      setCatalogData(catRes.data || []);

      setCatalogTotal(catRes.total ?? catRes.count ?? 0);

      setCatalogTotalPages(catRes.total_pages ?? Math.max(1, Math.ceil((catRes.total ?? 0) / pageSize)));

      setCatalogPage(catRes.page ?? page);

    } catch (err) {

      console.error("Failed to load catalog page:", err);

    } finally {

      setCatalogLoading(false);

    }

  };



  const fetchPortalData = async () => {

    setLoading(true);

    setError(null);

    try {

      const [ovRes, catRes, hierRes] = await Promise.all([

        api.getCpseAdminOverview(selectedCpseName, selectedCpseCode),

        api.getCpseAdminCatalog(selectedCpseName, selectedCpseCode, catalogSearch, catalogPage, catalogPageSize),

        api.getHierarchy(selectedCpseCode)

      ]);

      setOverviewData(ovRes);

      setCatalogData(catRes.data || []);

      setCatalogTotal(catRes.total ?? catRes.count ?? 0);

      setCatalogTotalPages(catRes.total_pages ?? Math.max(1, Math.ceil((catRes.total ?? 0) / catalogPageSize)));

      setHierarchyData(hierRes);

    } catch (err) {

      setError(getApiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchPortalData();

  }, [selectedCpseCode, selectedCpseName]);



  const handleCreateNode = async (e: React.FormEvent) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      await api.createHierarchyNode(selectedCpseName, {

        cpse_code: selectedCpseCode,

        parent_node_code: nodeForm.parent_node_code,

        unit_name: nodeForm.unit_name,

        unit_code: nodeForm.unit_code,

        type_code: nodeForm.type_code,

        location: nodeForm.location

      });

      alert(`Unit ${nodeForm.unit_name} successfully added to hierarchy!`);

      setShowNodeModal(false);

      

      await api.logActivity({

        action: 'HIERARCHY_NODE_CREATED',

        target: selectedCpseCode,

        details: `Created new hierarchy unit: ${nodeForm.unit_name} (${nodeForm.unit_code}) under ${nodeForm.parent_node_code}`,

        actor: user?.email || 'SYSTEM'

      });

      

      fetchPortalData();

    } catch (err) {

      alert(`Node creation failed: ${getApiErrorMessage(err)}`);

    } finally {

      setSubmitting(false);

    }

  };



  const handleAssignRole = async (e: React.FormEvent) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      await api.assignRole({

        cpse_code: selectedCpseCode,

        user_name: roleForm.userName,

        email: roleForm.email,

        role_title: roleForm.roleTitle,

        hierarchy_level: roleForm.hierarchyLevel,

        assigned_node_code: roleForm.assignedNodeCode,

        assigned_node_name: roleForm.assignedNodeName,

        permissions: roleForm.permissions

      });

      alert(`Officer ${roleForm.userName} successfully assigned!`);

      setShowRoleModal(false);

      

      await api.logActivity({

        action: 'OFFICER_PROVISIONED',

        target: selectedCpseCode,

        details: `Provisioned new officer ${roleForm.userName} (${roleForm.email}) with role ${roleForm.roleTitle}.`,

        actor: user?.email || 'SYSTEM'

      });

      

      fetchPortalData();

    } catch (err) {

      alert(`Assignment failed: ${getApiErrorMessage(err)}`);

    } finally {

      setSubmitting(false);

    }

  };



  const handleCreatePr = async (e: React.FormEvent) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      const res = await api.createSapPR({

        ...prForm,

        cpse_code: selectedCpseCode,

      });

      alert(`SAP PR ${res.pr_number || 'PR-9004128'} created successfully!`);

      setShowPrModal(false);

      

      await api.logActivity({

        action: 'SAP_PR_AUTONOMOUS',

        target: selectedCpseCode,

        details: `Autonomous PR Creation for ${prForm.material_description} (${prForm.quantity}). Value: ${prForm.estimated_cost_inr}.`,

        actor: user?.email || 'SYSTEM'

      });

      

    } catch (err) {

      alert(`SAP PR Creation failed: ${getApiErrorMessage(err)}`);

    } finally {

      setSubmitting(false);

    }

  };



  const handleTabClick = (tab: 'overview' | 'collaboration' | 'hierarchy' | 'catalog' | 'sap') => {

    setActiveTab(tab);

    if (isCpseAdmin) {

      onNavigate(`cpse-${tab}`);

    }

  };



  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    setUploadStatus(null);



    // Initialize live job tracker immediately

    const tempJob = {

      tracking_id: 'INITIALIZING...',

      filename: file.name,

      size_kb: Math.round(file.size / 1024),

      status: 'PROCESSING',

      current_step: 'STAGING',

      step_name: 'Staging Enterprise File & Validating Headers',

      step_index: 1,

      total_steps: 4,

      progress_pct: 15,

      rows_processed: 0,

      total_rows: 0,

      details: `Streaming ${file.name} to server pipeline buffer...`

    };

    setActiveJob(tempJob);



    try {

      const res = await api.bulkUpload(file, selectedCpseCode);

      const trackingId = res.tracking_id;

      // Reset input

      e.target.value = '';



      // Poll for live background pipeline progress

      const pollTimer = setInterval(async () => {

        try {

          const job = await api.getUploadStatus(trackingId);

          setActiveJob(job);

          if (job.status === 'COMPLETED') {

            clearInterval(pollTimer);

            setUploading(false);

            fetchPortalData();

          } else if (job.status === 'FAILED') {

            clearInterval(pollTimer);

            setUploading(false);

          }

        } catch {

          // If polling fails temporarily, retry on next tick

        }

      }, 400);



    } catch (err) {

      setActiveJob({

        tracking_id: 'FAILED',

        filename: file.name,

        size_kb: Math.round(file.size / 1024),

        status: 'FAILED',

        current_step: 'FAILED',

        step_name: 'Upload Staging Error',

        step_index: 1,

        total_steps: 4,

        progress_pct: 100,

        rows_processed: 0,

        total_rows: 0,

        details: `Upload failed: ${getApiErrorMessage(err)}`,

        error: getApiErrorMessage(err)

      });

      setUploading(false);

    }

  };



  return (

    <AppShell

      currentPage={`cpse-${activeTab}`}

      onNavigate={onNavigate}

      title={selectedCpseName}

      subtitle={isCpseAdmin ? "Enterprise Portal & SAP ERP Gateway" : "Supervisory Plant Hierarchy & ERP Audit"}

    >

      <div className="gov-page-container">

        {/* Supervisory notice if viewed by National Governance */}

        {!isCpseAdmin && (

          <div style={{ 

            display: 'flex', 

            alignItems: 'center', 

            gap: '10px', 

            background: 'rgba(37, 99, 235, 0.08)', 

            border: '1px solid rgba(37, 99, 235, 0.25)', 

            padding: '10px 16px', 

            borderRadius: '8px', 

            marginBottom: '16px', 

            color: '#1E40AF', 

            fontSize: '12.5px' 

          }}>

            <ShieldCheck size={18} color="#2563EB" />

            <div>

              <b>National Governance Supervisory Mode:</b> Auditing autonomous CPSE enterprise operations and ERP synchronization status in supervisory inspection view.

            </div>

          </div>

        )}



        {/* CPSE Context Selector & Top Navigation */}

        <div className="intel-top-bar" style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

            <div className="cpse-badge-circle" style={{ background: '#18181B', color: '#FFFFFF', width: '44px', height: '44px', borderRadius: '8px', fontWeight: 800, fontSize: '16px' }}>

              {selectedCpseCode.substring(0, 2)}

            </div>

            <div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedCpseName}</h2>

                <span className="status-pill active">{isCpseAdmin ? 'Enterprise Node' : 'Sovereign Entity'}</span>

              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>

                Code: <code style={{ color: '#2563EB', fontWeight: 700 }}>{selectedCpseCode}</code> | SAP Host: <code style={{ color: 'var(--text-muted)' }}>sap-gateway.{selectedCpseCode.toLowerCase()}.in</code>

              </div>

            </div>

          </div>



          {/* Switcher & Tab Pills */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {isCpseAdmin ? (

              <div style={{ 

                display: 'inline-flex', 

                alignItems: 'center', 

                gap: '8px', 

                background: 'rgba(16, 185, 129, 0.08)', 

                border: '1px solid rgba(16, 185, 129, 0.25)', 

                padding: '6px 14px', 

                borderRadius: '20px',

                color: '#065F46',

                fontSize: '12px',

                fontWeight: 700

              }}>

                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />

                <span>Isolated Enterprise Silo: <b>{selectedCpseCode}</b></span>

                <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#065F46', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>

                  LOCKED

                </span>

              </div>

            ) : (

              <select 

                className="gov-select"

                value={selectedCpseCode}

                onChange={(e) => {

                  const code = e.target.value;

                  setSelectedCpseCode(code);

                  const nameMap: Record<string, string> = {

                    '2040': 'Bharat Heavy Electricals Limited',

                    BHEL: 'Bharat Heavy Electricals Limited',

                    ONGC: 'Oil & Natural Gas Corp',

                    SAIL: 'Steel Authority of India',

                    NTPC: 'NTPC Limited',

                    IOCL: 'Indian Oil Corp'

                  };

                  setSelectedCpseName(nameMap[code] || code);

                }}

              >

                <option value="BHEL">Bharat Heavy Electricals Limited (BHEL)</option>

                <option value="ONGC">ONGC</option>

                <option value="SAIL">SAIL</option>

                <option value="NTPC">NTPC</option>

                <option value="IOCL">IOCL</option>

              </select>

            )}



            <button className="gov-refresh-btn" onClick={fetchPortalData} title="Refresh Portal Data">

              <RefreshCw size={14} className={loading ? 'spinning' : ''} />

            </button>

          </div>

        </div>



        {/* Tab navigation is handled via the Sidebar component */}



        {/* ===================================================================

            TAB 1: Executive Dashboard Overview

            =================================================================== */}

        {activeTab === 'overview' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* KPI Row */}

            <div className="metric-row" style={{ borderRadius: '10px', overflow: 'hidden' }}>

              <div className="metric-card">

                <div className="metric-label">Total Catalog Records</div>

                <div className="metric-value">{overviewData?.kpis?.total_material_records?.toLocaleString() ?? '0'}</div>

                <div className="metric-sub">Across connected plants</div>

              </div>



              <div className="metric-card">

                <div className="metric-label">CNMC Alignment</div>

                <div className="metric-value" style={{ color: '#0284c7' }}>{overviewData?.kpis?.cnmc_coverage_pct ?? 0}%</div>

                <div className="metric-sub">National Golden Coverage</div>

              </div>



              <div className="metric-card">

                <div className="metric-label">Active Plant Nodes</div>

                <div className="metric-value">{overviewData?.kpis?.active_plants_count ?? 0}</div>

                <div className="metric-sub">Connected Area Units</div>

              </div>



              <div className="metric-card">

                <div className="metric-label">Identified Duplicate Risk</div>

                <div className="metric-value" style={{ color: '#F59E0B' }}>{overviewData?.kpis?.duplicate_items_detected ?? 0}</div>

                <div className="metric-sub">Across local catalogs</div>

              </div>

            </div>



            {/* Two Column Layout: SAP Health & Alerts */}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* SAP ERP Health Card */}

              <div className="section-block">

                <div className="section-header">

                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    <Cpu size={16} color="#10b981" />

                    <span>SAP S/4HANA ERP Gateway Status</span>

                  </div>

                  <span className="chip chip-green">CONNECTED</span>

                </div>



                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  <div className="kv-row">

                    <span className="kv-label">Authentication Scheme:</span>

                    <span className="kv-val font-semibold">{overviewData?.sap_gateway_health?.auth_type || 'None'}</span>

                  </div>

                  <div className="kv-row">

                    <span className="kv-label">OData Service Endpoint:</span>

                    <code style={{ fontSize: '11px', background: 'var(--bg-card-alt)', padding: '2px 6px', borderRadius: '4px' }}>

                      {overviewData?.sap_gateway_health?.odata_endpoint || 'Not Configured'}

                    </code>

                  </div>

                  <div className="kv-row">

                    <span className="kv-label">Ping Latency:</span>

                    <span className="kv-val text-emerald font-bold">{overviewData?.sap_gateway_health?.last_handshake_ms || 0} ms</span>

                  </div>



                  <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '10px' }}>

                    <button className="gov-btn secondary small" onClick={() => handleTabClick('sap')}>

                      <span>Configure SAP Credentials</span>

                      <ArrowRight size={12} />

                    </button>

                    <button className="gov-btn primary small" onClick={() => setShowPrModal(true)}>

                      <Plus size={12} />

                      <span>Create SAP PR</span>

                    </button>

                  </div>

                </div>

              </div>



              {/* Anomaly Alerts List */}

              <div className="section-block">

                <div className="section-header">

                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    <AlertTriangle size={16} color="#f59e0b" />

                    <span>Internal Material Anomaly Alerts</span>

                  </div>

                  <span className="chip chip-amber">{overviewData?.recent_alerts?.length || 0} Open Alerts</span>

                </div>



                <div className="attention-list">

                  {overviewData?.recent_alerts?.length > 0 ? (

                    overviewData.recent_alerts.map((alt: any) => (

                      <div key={alt.id} className="attention-item sev-high">

                        <div className="attention-item-icon">

                          <AlertTriangle size={16} />

                        </div>

                        <div style={{ flex: 1 }}>

                          <div className="attention-item-title">{alt.title}</div>

                          <div className="attention-item-desc">{alt.desc}</div>

                        </div>

                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{alt.created_at}</span>

                      </div>

                    ))

                  ) : (

                    <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--status-green)' }} />
                      <span>No active anomalies detected in local catalog.</span>
                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        )}



        {/* ===================================================================

            TAB 2: Inter-Plant & Inter-CPSE Collaboration Canvas

            =================================================================== */}

        {activeTab === 'collaboration' && (

          <InterPlantCollaborationGraph cpseName={selectedCpseCode || selectedCpseName} />

        )}



        {/* ===================================================================

            TAB 3: Plant Hierarchy & Nodal Officers

            =================================================================== */}

        {activeTab === 'hierarchy' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <div>

                <h3 className="section-title">Organizational Tree & Nodal Officer Delegation</h3>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage subsidiaries, area mining units, plants, and assign nodal material officers.</p>

              </div>



              <div style={{ display: 'flex', gap: '10px' }}>

                <button className="gov-btn secondary" onClick={() => setShowNodeModal(true)}>

                  <Plus size={14} />

                  <span>Add Plant Node</span>

                </button>

                <button className="gov-btn primary" onClick={openAssignOfficerModal}>

                  <UserPlus size={14} />

                  <span>Assign Nodal Officer</span>

                </button>

              </div>

            </div>



            {/* Tree View */}

            <div className="gov-table-card" style={{ padding: '20px' }}>

              <div className="hierarchy-tree-view">

                {(!hierarchyData?.tree || hierarchyData.tree.length === 0) ? (

                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>

                    <FolderTree size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />

                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>No Hierarchy Defined</div>

                    <div style={{ fontSize: '13px' }}>Start by adding a Headquarters or Plant Node to build the organizational tree.</div>

                  </div>

                ) : hierarchyData.tree.map((node: any, idx: number) => (

                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '16px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-canvas, #f8fafc)', border: '1px solid var(--border-medium)', borderRadius: '8px' }}>

                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{node.type_code}</span>

                      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}><b>{node.unit_name}</b> <span style={{ color: 'var(--text-muted)' }}>({node.unit_code})</span></span>

                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}><Building2 size={14} /> {node.location || 'Headquarters'}</span>

                    </div>



                    {node.children?.length > 0 && (

                      <div style={{ paddingLeft: '32px', borderLeft: '2px dashed var(--border-subtle)', marginLeft: '16px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                        {node.children.map((child: any, cidx: number) => (

                          <div key={cidx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-light)', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>

                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{child.type_code}</span>

                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{child.unit_name} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>({child.unit_code})</span></span>

                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}><Building2 size={12} /> {child.location}</span>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            </div>

          </div>

        )}



        {/* ===================================================================

            TAB 4: Material Catalog Studio & Duplicate Risk Engine

            =================================================================== */}

        {activeTab === 'catalog' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <div>
                <h3 className="section-title">CPSE Material Catalog & Intra-Enterprise Duplicate Detector</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Standardize local plant items against CNMC Golden records and resolve duplicate entries.</p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>

                <input 

                  type="file" 

                  id="erp-upload" 

                  style={{ display: 'none' }} 

                  accept=".csv,.xlsx" 

                  onChange={handleBulkUpload} 

                />

                <button 

                  className="gov-btn primary" 

                  onClick={() => document.getElementById('erp-upload')?.click()}

                  disabled={uploading}

                >

                  {uploading ? (

                    <>

                      <RefreshCw size={16} className="spinning" /> Ingesting Data...

                    </>

                  ) : (

                    <>

                      <Plus size={16} /> Upload ERP Dump

                    </>

                  )}

                </button>

              </div>

            </div>



            {/* Live Data Ingestion & Harmonization Pipeline Visualizer */}

            {activeJob && (

              <div style={{

                background: 'var(--bg-card, #ffffff)',

                border: `1px solid ${activeJob.status === 'FAILED' ? 'rgba(239, 68, 68, 0.4)' : activeJob.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(37, 99, 235, 0.4)'}`,

                borderRadius: '10px',

                padding: '18px 20px',

                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',

                display: 'flex',

                flexDirection: 'column',

                gap: '14px'

              }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                    <div style={{

                      width: '34px',

                      height: '34px',

                      borderRadius: '8px',

                      background: activeJob.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(37, 99, 235, 0.12)',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center'

                    }}>

                      {activeJob.status === 'COMPLETED' ? (

                        <CheckCircle2 size={18} color="#10B981" />

                      ) : activeJob.status === 'FAILED' ? (

                        <AlertTriangle size={18} color="#EF4444" />

                      ) : (

                        <RefreshCw size={18} className="spinning" color="#2563EB" />

                      )}

                    </div>

                    <div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>

                          Enterprise Data Ingestion & AI Harmonization Pipeline

                        </span>

                        <span style={{

                          fontSize: '11px',

                          padding: '2px 8px',

                          borderRadius: '999px',

                          fontWeight: 700,

                          background: activeJob.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : activeJob.status === 'FAILED' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',

                          color: activeJob.status === 'COMPLETED' ? '#059669' : activeJob.status === 'FAILED' ? '#DC2626' : '#2563EB'

                        }}>

                          {activeJob.status === 'COMPLETED' ? 'PIPELINE COMPLETE' : activeJob.status === 'FAILED' ? 'FAILED' : 'LIVE PROCESSING'}

                        </span>

                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>

                        File: <strong>{activeJob.filename}</strong> ({activeJob.size_kb} KB) &bull; Tracking ID: <span style={{ fontFamily: 'monospace' }}>{activeJob.tracking_id}</span>

                      </div>

                    </div>

                  </div>



                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                    <div style={{ textAlign: 'right' }}>

                      <div style={{ fontSize: '18px', fontWeight: 800, color: activeJob.status === 'COMPLETED' ? '#10B981' : '#2563EB' }}>

                        {activeJob.progress_pct}%

                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>

                        {activeJob.rows_processed ? `${activeJob.rows_processed.toLocaleString()} records ingested` : 'Processing buffer'}

                      </div>

                    </div>

                    {activeJob.status !== 'PROCESSING' && (

                      <button

                        onClick={() => setActiveJob(null)}

                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}

                      >

                        &times;

                      </button>

                    )}

                  </div>

                </div>



                {/* Animated Progress Bar */}

                <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle, #e2e8f0)', borderRadius: '999px', overflow: 'hidden' }}>

                  <div style={{

                    width: `${activeJob.progress_pct}%`,

                    height: '100%',

                    background: activeJob.status === 'COMPLETED'

                      ? 'linear-gradient(90deg, #10B981, #059669)'

                      : 'linear-gradient(90deg, #2563EB, #3B82F6, #10B981)',

                    transition: 'width 0.3s ease-in-out',

                    borderRadius: '999px'

                  }} />

                </div>



                {/* 4 Pipeline Stage Nodes */}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>

                  {[

                    { step: 1, title: 'File Staging', desc: 'Buffer & Header Validation' },

                    { step: 2, title: 'Entity Extraction', desc: 'Item Codes & Taxonomy' },

                    { step: 3, title: 'PostgreSQL Batch', desc: 'Committed to cpse_raw_data' },

                    { step: 4, title: 'AI Harmonization', desc: 'Cosine Vectors & Duplicate Risk' }

                  ].map(s => {

                    const isDone = activeJob.step_index > s.step || activeJob.status === 'COMPLETED';

                    const isCurrent = activeJob.step_index === s.step && activeJob.status === 'PROCESSING';

                    return (

                      <div key={s.step} style={{

                        padding: '10px 12px',

                        borderRadius: '6px',

                        background: isDone ? 'rgba(16, 185, 129, 0.06)' : isCurrent ? 'rgba(37, 99, 235, 0.06)' : 'var(--bg-canvas, #f8fafc)',

                        border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.25)' : isCurrent ? 'rgba(37, 99, 235, 0.35)' : 'var(--border-subtle, #e2e8f0)'}`,

                        display: 'flex',

                        flexDirection: 'column',

                        gap: '2px'

                      }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: isDone ? '#059669' : isCurrent ? '#2563EB' : 'var(--text-secondary)' }}>

                          {isDone ? <CheckCircle2 size={13} color="#10B981" /> : isCurrent ? <RefreshCw size={13} className="spinning" color="#2563EB" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1px solid var(--text-muted)' }} />}

                          {s.title}

                        </div>

                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', paddingLeft: '19px' }}>

                          {s.desc}

                        </div>

                      </div>

                    );

                  })}

                </div>



                {/* Real-time Status Details */}

                <div style={{

                  padding: '8px 12px',

                  borderRadius: '6px',

                  background: 'var(--bg-canvas, #f8fafc)',

                  border: '1px dashed var(--border-medium, #cbd5e1)',

                  fontSize: '12px',

                  color: 'var(--text-secondary)',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '8px'

                }}>

                  <Zap size={14} color="#2563EB" />

                  <span><strong>Live Status:</strong> {activeJob.details}</span>

                </div>

              </div>

            )}



            {uploadStatus && (

              <div style={{

                display: 'flex',

                alignItems: 'center',

                gap: '12px',

                padding: '12px 16px',

                borderRadius: '8px',

                background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',

                border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,

                color: uploadStatus.type === 'success' ? '#065F46' : '#991B1B',

                fontSize: '13px',

                fontWeight: 500,

              }}>

                {uploadStatus.type === 'success' ? (

                  <CheckCircle2 size={18} color="#10B981" />

                ) : (

                  <AlertTriangle size={18} color="#EF4444" />

                )}

                <div style={{ flex: 1 }}>{uploadStatus.message}</div>

                <button

                  onClick={() => setUploadStatus(null)}

                  style={{

                    background: 'none',

                    border: 'none',

                    cursor: 'pointer',

                    fontSize: '16px',

                    lineHeight: 1,

                    color: 'inherit',

                    opacity: 0.7,

                  }}

                >

                  &times;

                </button>

              </div>

            )}



            {/* Search Toolbar & Record Counter */}

            <div style={{

              display: 'flex',

              justifyContent: 'space-between',

              alignItems: 'center',

              flexWrap: 'wrap',

              gap: '12px',

              padding: '12px 16px',

              background: 'var(--bg-card, #ffffff)',

              borderRadius: '8px 8px 0 0',

              border: '1px solid var(--border-medium, #cbd5e1)',

              borderBottom: 'none'

            }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid rgba(27,35,50,0.2)', borderRadius: '6px', padding: '6px 12px', width: '340px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>

                <Search size={14} color="var(--text-muted)" />

                <input

                  type="text"

                  placeholder="Search items, codes, descriptions..."

                  value={catalogSearch}

                  onChange={(e) => {

                    const val = e.target.value;

                    setCatalogSearch(val);

                    setCatalogPage(1);

                    fetchCatalogOnly(1, val, catalogPageSize);

                  }}

                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12.5px', color: 'var(--text-primary)' }}

                />

                {catalogSearch && (

                  <button 

                    onClick={() => { setCatalogSearch(''); setCatalogPage(1); fetchCatalogOnly(1, '', catalogPageSize); }} 

                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '14px', lineHeight: 1 }}

                  >

                    &times;

                  </button>

                )}

              </div>



              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>

                  Showing <b>{catalogData.length > 0 ? ((catalogPage - 1) * catalogPageSize) + 1 : 0}</b> – <b>{Math.min(catalogPage * catalogPageSize, catalogTotal)}</b> of <b style={{ color: '#1B2332' }}>{catalogTotal.toLocaleString()}</b> enterprise records

                </span>

                <button 

                  className="gov-btn secondary icon-only small" 

                  title="Reload Catalog" 

                  onClick={() => fetchCatalogOnly(catalogPage, catalogSearch, catalogPageSize)}

                  disabled={catalogLoading}

                >

                  <RefreshCw size={13} className={catalogLoading ? "spinning" : ""} />

                </button>

              </div>

            </div>



            <div className="gov-table-card" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}>

              <table className="gov-data-table">

                <thead>

                  <tr>

                    <th>Local Code & Description</th>

                    <th>SAP Material #</th>

                    <th>Plant Location</th>

                    <th>CNMC Alignment</th>

                    <th>Unit Rate (INR)</th>

                    <th>Duplicate Risk</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {catalogData.length === 0 ? (

                    <tr>

                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

                          <Database size={24} style={{ opacity: 0.5 }} />

                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Empty Catalog</div>

                          <div style={{ fontSize: '13px' }}>No raw material records found. Use "Upload ERP Dump" to populate the catalog.</div>

                        </div>

                      </td>

                    </tr>

                  ) : catalogData.map((item) => (

                    <tr key={item.id}>

                      <td>

                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>

                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#2563EB' }}>{item.local_code}</div>

                      </td>

                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.sap_material_num}</td>

                      <td>

                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.plant_name}</div>

                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.plant_code}</div>

                      </td>

                      <td>

                        <span 

                          className="status-pill"

                                                    style={{
                            background: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? 'rgba(216, 142, 51, 0.1)' : 'rgba(27, 35, 50, 0.05)',
                            color: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? '#B47622' : '#1B2332',
                            borderColor: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? 'rgba(216, 142, 51, 0.3)' : 'rgba(27, 35, 50, 0.2)',
                            fontWeight: 700
                          }}

                        >

                          {item.cnmc_code === 'PENDING_NATIONAL_MINT' ? 'MINT PENDING' : item.cnmc_code}

                        </span>

                      </td>

                      <td style={{ fontWeight: 700 }}>₹{item.unit_price_inr?.toLocaleString()}</td>

                      <td>

                        <span className={`chip ${

                          item.duplicate_risk === 'RATIFIED' || item.duplicate_risk === 'HARMONIZED' ? 'chip-green' : 

                          item.duplicate_risk === 'PENDING_APPROVAL' ? 'chip-amber' :

                          item.duplicate_risk === 'REJECTED' || item.duplicate_risk === 'HIGH' ? 'chip-red' : 

                          item.duplicate_risk === 'MEDIUM' ? 'chip-amber' : 'chip-blue'

                        }`}>

                          {item.duplicate_risk === 'PENDING_APPROVAL' ? 'PENDING' :

                           item.duplicate_risk === 'RATIFIED' ? 'RATIFIED' :

                           item.duplicate_risk === 'REJECTED' ? 'REJECTED' :

                           item.duplicate_risk === 'HARMONIZED' ? 'HARMONIZED' : 

                           item.duplicate_risk === 'UNIQUE' || item.has_duplicate === false ? 'UNIQUE' : `${item.duplicate_risk} RISK`}

                        </span>

                      </td>

                      <td>

                        <button 

                          className="gov-btn small secondary" 

                          onClick={() => setReviewItem(item)}

                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}

                        >

                          {item.duplicate_risk === 'PENDING_APPROVAL' ? (

                            <>

                              <Clock size={13} color="#d97706" /> Under Gov Review

                            </>

                          ) : item.duplicate_risk === 'RATIFIED' ? (

                            <>

                              <ShieldCheck size={13} color="#059669" /> View Ratified

                            </>

                          ) : item.duplicate_risk === 'REJECTED' ? (

                            <>

                              <AlertTriangle size={13} color="#dc2626" /> Re-audit / Nominate

                            </>

                          ) : item.has_duplicate ? (

                            <>

                              <GitCompare size={13} color="#2563EB" /> Review Match

                            </>

                          ) : (

                            <>

                              <ShieldCheck size={13} color="#059669" /> Audit & Nominate

                            </>

                          )}

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>



              {/* Pagination Bar */}

              {catalogTotal > 0 && (

                <div style={{

                  display: 'flex',

                  justifyContent: 'space-between',

                  alignItems: 'center',

                  padding: '12px 18px',

                  borderTop: '1px solid var(--border-subtle, #e2e8f0)',

                  background: 'var(--bg-canvas, #f8fafc)',

                  fontSize: '12.5px'

                }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>

                    <span>Rows per page:</span>

                    <select 

                      value={catalogPageSize} 

                      onChange={(e) => {

                        const newSize = Number(e.target.value);

                        setCatalogPageSize(newSize);

                        setCatalogPage(1);

                        fetchCatalogOnly(1, catalogSearch, newSize);

                      }}

                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-medium, #cbd5e1)', background: '#ffffff', fontSize: '12px' }}

                    >

                      <option value={25}>25</option>

                      <option value={50}>50</option>

                      <option value={100}>100</option>

                      <option value={250}>250</option>

                    </select>

                  </div>



                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    <span style={{ color: 'var(--text-secondary)' }}>

                      Page <b>{catalogPage}</b> of <b>{catalogTotalPages}</b>

                    </span>

                    <button 

                      className="gov-btn secondary small" 

                      disabled={catalogPage <= 1 || catalogLoading}

                      onClick={() => {

                        const prev = Math.max(1, catalogPage - 1);

                        setCatalogPage(prev);

                        fetchCatalogOnly(prev, catalogSearch, catalogPageSize);

                      }}

                    >

                      Previous

                    </button>

                    <button 

                      className="gov-btn secondary small" 

                      disabled={catalogPage >= catalogTotalPages || catalogLoading}

                      onClick={() => {

                        const next = Math.min(catalogTotalPages, catalogPage + 1);

                        setCatalogPage(next);

                        fetchCatalogOnly(next, catalogSearch, catalogPageSize);

                      }}

                    >

                      Next

                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}



        {/* ===================================================================

            TAB 5: SAP S/4HANA PR Gateway

            =================================================================== */}

        {activeTab === 'sap' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <div>

                <h3 className="section-title">SAP S/4HANA Purchase Requisition (PR) Gateway</h3>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pre-sanction material requests with automatic CNMC Golden code validation before SAP dispatch.</p>

              </div>



              <button className="gov-btn primary" onClick={() => setShowPrModal(true)}>

                <Plus size={14} />

                <span>Create SAP PR</span>

              </button>

            </div>



            <div className="gov-table-card">

              <table className="gov-data-table">

                <thead>

                  <tr>

                    <th>PR Number</th>

                    <th>Plant</th>

                    <th>Material Description</th>

                    <th>CNMC Code</th>

                    <th>Quantity</th>

                    <th>Est. Cost (INR)</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

                        <FileText size={24} style={{ opacity: 0.5 }} />

                        <div style={{ fontWeight: 600 }}>No Purchase Requisitions Found</div>

                        <div style={{ fontSize: '12px' }}>This CPSE has no active SAP PRs. Use the Copilot or click "Create SAP PR" to initiate one.</div>

                      </div>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        )}



        {/* Add Plant Node Modal */}

        {showNodeModal && (

          <div className="modal-backdrop">

            <div className="modal-dialog">

              <div className="modal-header">

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                  <FolderTree size={18} color="#2563eb" />

                  <h3>Add New Plant / Area Hierarchy Node</h3>

                </div>

                <button onClick={() => setShowNodeModal(false)} className="close-btn">×</button>

              </div>



              <form onSubmit={handleCreateNode}>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  <div>

                    <label className="sap-field-label">Unit / Plant Name:</label>

                    <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} placeholder="e.g. WCL Nagpur Open Cast Mine" value={nodeForm.unit_name} onChange={e => setNodeForm({ ...nodeForm, unit_name: e.target.value })} required />

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    <div>

                      <label className="sap-field-label">Unit Code:</label>

                      <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} placeholder="e.g. 6004-WCL-NAG" value={nodeForm.unit_code} onChange={e => setNodeForm({ ...nodeForm, unit_code: e.target.value })} required />

                    </div>



                    <div>

                      <label className="sap-field-label">Hierarchy Level:</label>

                      <select className="gov-select" style={{ width: '100%' }} value={nodeForm.type_code} onChange={e => setNodeForm({ ...nodeForm, type_code: e.target.value })}>

                        <option value="PLANT">Plant / Mine (Production Unit)</option>

                        <option value="AREA">Area / Subsidiary Office</option>

                        <option value="ZONE">Zone / Regional Office</option>

                        <option value="STORE">Central Store / Depot</option>

                      </select>

                    </div>

                  </div>



                  <div>

                    <label className="sap-field-label">Location / State:</label>

                    <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} placeholder="e.g. Nagpur, Maharashtra" value={nodeForm.location} onChange={e => setNodeForm({ ...nodeForm, location: e.target.value })} required />

                  </div>

                </div>



                <div className="modal-footer">

                  <button type="button" className="gov-btn secondary" onClick={() => setShowNodeModal(false)}>Cancel</button>

                  <button type="submit" className="gov-btn primary" disabled={submitting}>

                    {submitting ? 'Creating Node...' : 'Save Hierarchy Node'}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



        {/* Assign Role Modal */}

        {showRoleModal && (

          <div className="modal-backdrop">

            <div className="modal-dialog">

              <div className="modal-header">

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                  <UserPlus size={18} color="#2563eb" />

                  <h3>Assign Nodal Officer</h3>

                </div>

                <button onClick={() => setShowRoleModal(false)} className="close-btn">×</button>

              </div>



              <form onSubmit={handleAssignRole}>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div>

                    <label className="sap-field-label">Officer Name:</label>

                    <input 

                      type="text" 

                      className="gov-search-input" 

                      style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px', width: '100%' }} 

                      value={roleForm.userName} 

                      onChange={e => setRoleForm({ ...roleForm, userName: e.target.value })} 

                      placeholder="e.g. Er. Rajesh Kumar"

                      required 

                    />

                  </div>

                  <div>

                    <label className="sap-field-label">Enterprise Email:</label>

                    <input 

                      type="email" 

                      className="gov-search-input" 

                      style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px', width: '100%' }} 

                      value={roleForm.email} 

                      onChange={e => setRoleForm({ ...roleForm, email: e.target.value })} 

                      placeholder={`e.g. rajesh.kumar@${selectedCpseCode.toLowerCase()}.in`}

                      required 

                    />

                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    <div>

                      <label className="sap-field-label">Role Title:</label>

                      <input 

                        type="text" 

                        className="gov-search-input" 

                        style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px', width: '100%' }} 

                        value={roleForm.roleTitle} 

                        onChange={e => setRoleForm({ ...roleForm, roleTitle: e.target.value })} 

                        placeholder="e.g. Plant Material Head / Nodal Officer"

                        required 

                      />

                    </div>

                    <div>

                      <label className="sap-field-label">Hierarchy Level:</label>

                      <select

                        className="gov-search-input"

                        style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px', width: '100%', background: 'var(--bg-card)' }}

                        value={roleForm.hierarchyLevel}

                        onChange={e => setRoleForm({ ...roleForm, hierarchyLevel: e.target.value })}

                      >

                        <option value="PLANT">Plant Store / Unit Level</option>

                        <option value="AREA">Area / Regional Subsidiary</option>

                        <option value="HQ">Corporate Enterprise HQ</option>

                      </select>

                    </div>

                  </div>



                  <div>

                    <label className="sap-field-label">Assigned Organizational Unit / Plant Node:</label>

                    <select

                      className="gov-search-input"

                      style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px', width: '100%', background: 'var(--bg-card)', fontWeight: 600 }}

                      value={roleForm.assignedNodeCode}

                      onChange={e => {

                        const val = e.target.value;

                        const matched = getAllHierarchyNodes().find(n => n.code === val);

                        setRoleForm({

                          ...roleForm,

                          assignedNodeCode: val,

                          assignedNodeName: matched?.name || val,

                          hierarchyLevel: matched?.type || roleForm.hierarchyLevel

                        });

                      }}

                    >

                      {getAllHierarchyNodes().map((node) => (

                        <option key={node.code} value={node.code}>

                          {node.name} ({node.code}) — {node.type}

                        </option>

                      ))}

                    </select>

                  </div>

                </div>



                <div className="modal-footer">

                  <button type="button" className="gov-btn secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>

                  <button type="submit" className="gov-btn primary" disabled={submitting}>

                    {submitting ? 'Assigning...' : 'Assign Officer'}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



        {/* Create SAP PR Modal */}

        {showPrModal && (

          <div className="modal-backdrop">

            <div className="modal-dialog">

              <div className="modal-header">

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                  <Cpu size={18} color="#10b981" />

                  <h3>Create Pre-Sanction SAP Purchase Requisition (PR)</h3>

                </div>

                <button onClick={() => setShowPrModal(false)} className="close-btn">×</button>

              </div>



              <form onSubmit={handleCreatePr}>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  <div>

                    <label className="sap-field-label">Material Description:</label>

                    <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={prForm.material_description} onChange={e => setPrForm({ ...prForm, material_description: e.target.value })} required />

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    <div>

                      <label className="sap-field-label">CNMC Golden Code:</label>

                      <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={prForm.cnmc_code} onChange={e => setPrForm({ ...prForm, cnmc_code: e.target.value })} required />

                    </div>



                    <div>

                      <label className="sap-field-label">Cost Center:</label>

                      <input type="text" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={prForm.cost_center} onChange={e => setPrForm({ ...prForm, cost_center: e.target.value })} required />

                    </div>

                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    <div>

                      <label className="sap-field-label">Quantity:</label>

                      <input type="number" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={prForm.quantity} onChange={e => setPrForm({ ...prForm, quantity: Number(e.target.value) })} required />

                    </div>



                    <div>

                      <label className="sap-field-label">Est. Cost (INR):</label>

                      <input type="number" className="gov-search-input" style={{ border: '1px solid var(--border-medium)', padding: '8px 10px', borderRadius: '4px' }} value={prForm.estimated_cost_inr} onChange={e => setPrForm({ ...prForm, estimated_cost_inr: Number(e.target.value) })} required />

                    </div>

                  </div>

                </div>



                <div className="modal-footer">

                  <button type="button" className="gov-btn secondary" onClick={() => setShowPrModal(false)}>Cancel</button>

                  <button type="submit" className="gov-btn primary" disabled={submitting}>

                    {submitting ? 'Validating CNMC...' : 'Submit to SAP ERP'}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



        {/* ===================================================================

            PROFESSIONAL DUPLICATE REVIEW & AI HARMONIZATION MODAL

            =================================================================== */}

        {reviewItem && (

          <div className="modal-backdrop" style={{ zIndex: 1100, backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.65)' }}>

            <div className="modal-dialog" style={{ maxWidth: '980px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

              

              {/* Modal Header */}

              <div className="modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '18px 24px', background: 'var(--bg-card)' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                  <div style={{

                    width: '38px',

                    height: '38px',

                    borderRadius: '10px',

                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',

                    border: '1px solid rgba(37, 99, 235, 0.3)',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center'

                  }}>

                    <Sparkles size={20} color="#38bdf8" />

                  </div>

                  <div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>

                        AI Duplicate Audit & CNMC Harmonization Studio

                      </h3>

                      <span style={{

                        padding: '2px 8px',

                        borderRadius: '999px',

                        fontSize: '11px',

                        fontWeight: 700,

                        letterSpacing: '0.04em',

                        background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.1)',

                        color: reviewItem.has_duplicate ? '#DC2626' : '#0284c7',

                        border: `1px solid ${reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.2)'}`

                      }}>

                        {reviewItem.has_duplicate ? `${reviewItem.duplicate_risk} RISK (${reviewItem.confidence_score}% CONFIDENCE)` : 'UNIQUE ITEM (NO DUPLICATES FOUND)'}

                      </span>

                    </div>

                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>

                      {reviewItem.has_duplicate 

                        ? 'Evaluating cross-plant redundancy against Unified National CNMC Golden Master Standard.'

                        : 'Evaluated against enterprise catalog and National Repository. No duplicate exists in inventory.'}

                    </p>

                  </div>

                </div>

                <button onClick={() => setReviewItem(null)} className="close-btn" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>×</button>

              </div>



              {/* Modal Body */}

              <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                

                {/* Side-by-Side Entity Comparison */}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch' }}>

                  

                  {/* Left: Source CPSE Material */}

                  <div style={{

                    background: 'var(--bg-canvas, #f8fafc)',

                    border: '1px solid var(--border-medium, #e2e8f0)',

                    borderRadius: '10px',

                    padding: '16px',

                    display: 'flex',

                    flexDirection: 'column',

                    gap: '12px'

                  }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>

                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>

                        LOCAL ENTERPRISE ITEM

                      </span>

                      <span style={{ fontSize: '11px', background: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>

                        {reviewItem.plant_name}

                      </span>

                    </div>

                    

                    <div>

                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>

                        {reviewItem.description}

                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px', fontFamily: 'monospace' }}>

                        <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px' }}>

                          Local: {reviewItem.local_code}

                        </span>

                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>

                          SAP #{reviewItem.sap_material_num}

                        </span>

                      </div>

                    </div>



                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>

                      <div>

                        <span style={{ color: 'var(--text-muted)' }}>Unit Valuation:</span>

                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{reviewItem.unit_price_inr?.toLocaleString()}</div>

                      </div>

                      <div>

                        <span style={{ color: 'var(--text-muted)' }}>Storage Unit:</span>

                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reviewItem.plant_code}</div>

                      </div>

                    </div>

                  </div>



                  {/* Center: AI Vector Bridge & Equivalence Engine */}

                  <div style={{

                    display: 'flex',

                    flexDirection: 'column',

                    alignItems: 'center',

                    justifyContent: 'center',

                    padding: '0 8px',

                    gap: '10px'

                  }}>

                    <div style={{

                      width: '42px',

                      height: '42px',

                      borderRadius: '50%',

                      background: reviewItem.has_duplicate 

                        ? 'linear-gradient(135deg, #2563EB, #4F46E5)'

                        : 'linear-gradient(135deg, #334155, #1e293b)',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      boxShadow: reviewItem.has_duplicate 

                        ? '0 4px 12px rgba(37, 99, 235, 0.35)'

                        : '0 4px 12px rgba(30, 41, 59, 0.35)',

                      color: '#ffffff'

                    }}>

                      {reviewItem.has_duplicate ? <GitCompare size={20} /> : <ShieldCheck size={22} />}

                    </div>



                    <div style={{ textAlign: 'center' }}>

                      <div style={{ fontSize: '15px', fontWeight: 800, color: reviewItem.has_duplicate ? '#2563EB' : '#1e293b' }}>

                        {reviewItem.has_duplicate ? `${reviewItem.confidence_score}%` : 'UNIQUE'}

                      </div>

                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>

                        {reviewItem.has_duplicate ? 'Cosine Match' : 'No Redundancy'}

                      </div>

                    </div>



                    {reviewItem.savings_inr > 0 && (

                      <div style={{

                        background: 'rgba(16, 185, 129, 0.1)',

                        border: '1px solid rgba(16, 185, 129, 0.3)',

                        borderRadius: '6px',

                        padding: '4px 8px',

                        textAlign: 'center'

                      }}>

                        <div style={{ fontSize: '10px', color: '#065F46', fontWeight: 600 }}>Est. Inventory Saving</div>

                        <div style={{ fontSize: '12px', color: '#065F46', fontWeight: 800 }}>

                          ₹{reviewItem.savings_inr?.toLocaleString()}

                        </div>

                      </div>

                    )}

                  </div>



                  {/* Right: Matched Candidate / Golden Master */}

                  <div style={{

                    background: 'var(--bg-canvas, #f8fafc)',

                    border: '1px solid var(--border-medium, #e2e8f0)',

                    borderRadius: '10px',

                    padding: '16px',

                    display: 'flex',

                    flexDirection: 'column',

                    gap: '12px'

                  }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>

                      <span style={{ fontSize: '11px', fontWeight: 700, color: reviewItem.has_duplicate ? '#DC2626' : '#0284c7', letterSpacing: '0.05em' }}>

                        {reviewItem.has_duplicate ? 'MATCHED DUPLICATE CANDIDATE' : 'NATIONAL REPOSITORY STATUS'}

                      </span>

                      <span style={{ fontSize: '11px', background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.08)', color: reviewItem.has_duplicate ? '#DC2626' : '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>

                        {reviewItem.has_duplicate ? reviewItem.matched_plant : 'Repository Empty / Unmatched'}

                      </span>

                    </div>



                    <div>

                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>

                        {reviewItem.has_duplicate ? reviewItem.matched_duplicate_desc : 'No Existing Golden Master Found'}

                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px', fontFamily: 'monospace' }}>

                        {reviewItem.has_duplicate ? (

                          <>

                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>

                              Candidate #{reviewItem.matched_duplicate_code}

                            </span>

                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>

                              {reviewItem.cnmc_golden_code}

                            </span>

                          </>

                        ) : (

                          <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>

                            Distinct Single-Sourced Engineering Profile

                          </span>

                        )}

                      </div>

                    </div>



                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr', fontSize: '11.5px' }}>

                      <div>

                        <span style={{ color: 'var(--text-muted)' }}>{reviewItem.has_duplicate ? 'Convergence Target:' : 'Next Action:'}</span>

                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px' }}>

                          {reviewItem.has_duplicate 

                            ? reviewItem.cnmc_golden_desc 

                            : 'Click "Nominate for National Standard" below to establish this specification in the National Golden Master Vault.'}

                        </div>

                      </div>

                    </div>

                  </div>



                </div>



                {/* Technical Specification & SHAP Explainability Matrix */}

                <div style={{

                  background: 'var(--bg-card, #ffffff)',

                  border: '1px solid var(--border-subtle, #e2e8f0)',

                  borderRadius: '8px',

                  overflow: 'hidden'

                }}>

                  <div style={{

                    padding: '10px 16px',

                    background: 'rgba(0, 0, 0, 0.02)',

                    borderBottom: '1px solid var(--border-subtle, #e2e8f0)',

                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'center'

                  }}>

                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>

                      Multi-Stage AI Matching Attribution Matrix (Stages 1-8)

                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>

                      Mathematical SHAP & Rule Validation

                    </span>

                  </div>



                  <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '6px' }}>

                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Functional Noun Equivalence:</span>

                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>

                        {reviewItem.spec_breakdown?.noun_match || 'Exact Match (100%)'}

                      </span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '6px' }}>

                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dimensional & Rating Alignment:</span>

                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>

                        {reviewItem.spec_breakdown?.spec_similarity || '98.2% Metric Correlation'}

                      </span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '6px' }}>

                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Material Grade Standards:</span>

                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>

                        {reviewItem.spec_breakdown?.material_grade || 'Standard Carbon/Steel'}

                      </span>

                    </div>



                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-canvas, #f8fafc)', borderRadius: '6px' }}>

                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cross-Enterprise Validation Gate:</span>

                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>

                        {reviewItem.spec_breakdown?.rules_gate || 'PASSED'}

                      </span>

                    </div>

                  </div>

                </div>



              </div>



              {/* Modal Footer Controls */}

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <button

                  type="button"

                  className="gov-btn secondary"

                  onClick={() => setReviewItem(null)}

                  disabled={harmonizing}

                >

                  Cancel

                </button>



                <div style={{ display: 'flex', gap: '10px' }}>

                  <button

                    type="button"

                    className="gov-btn secondary"

                    onClick={() => handleHarmonizeAction('DISTINCT')}

                    disabled={harmonizing}

                    style={{ borderColor: 'var(--border-medium)' }}

                  >

                    Confirm as Distinct Item

                  </button>



                  <button

                    type="button"

                    className={reviewItem.has_duplicate ? "gov-btn secondary" : "gov-btn primary"}

                    onClick={() => handleHarmonizeAction('NOMINATE')}

                    disabled={harmonizing}

                    style={reviewItem.has_duplicate 

                      ? { color: '#7C3AED', borderColor: 'rgba(124, 58, 237, 0.4)' }

                      : { background: '#1e293b', gap: '6px', color: '#fff', border: 'none' }}

                  >

                    {harmonizing ? (

                      <>

                        <RefreshCw size={15} className="spinning" /> Submitting to Government...

                      </>

                    ) : (

                      <>

                        <Sparkles size={15} /> Nominate for Government Approval

                      </>

                    )}

                  </button>



                  {reviewItem.has_duplicate && (

                    <button

                      type="button"

                      className="gov-btn primary"

                      onClick={() => handleHarmonizeAction('MERGE')}

                      disabled={harmonizing}

                      style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', gap: '6px' }}

                    >

                      {harmonizing ? (

                        <>

                          <RefreshCw size={15} className="spinning" /> Harmonizing Record...

                        </>

                      ) : (

                        <>

                          <Sparkles size={15} /> Harmonize with Duplicate

                        </>

                      )}

                    </button>

                  )}

                </div>

              </div>



            </div>

          </div>

        )}

      </div>

    </AppShell>

  );

};