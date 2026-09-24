import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { api, getApiErrorMessage } from '../api/client';
import { InterPlantCollaborationGraph } from '../components/admin/InterPlantCollaborationGraph';
import { 
  Building2, Cpu, CheckCircle2, AlertTriangle, RefreshCw, 
  FolderTree, Plus, Users, UserPlus, Network, Layers, 
  Search, ShieldCheck, Zap, ArrowRight, DollarSign, FileText, Send, Lock
} from 'lucide-react';

interface CpseAdminPortalPageProps {
  onNavigate: (page: string) => void;
  initialTab?: 'overview' | 'collaboration' | 'hierarchy' | 'catalog' | 'sap';
}

export const CpseAdminPortalPage: React.FC<CpseAdminPortalPageProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { user } = useAuthStore();
  const isCpseAdmin = user?.roleCode === 'CPSE_ADMIN';
  
  const [selectedCpseCode, setSelectedCpseCode] = useState<string>(user?.cpseCode || 'COALINDIA');
  const [selectedCpseName, setSelectedCpseName] = useState<string>(user?.cpseName || 'Coal India Limited');

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

  const [roleForm, setRoleForm] = useState({
    userName: '',
    email: '',
    roleTitle: 'Area Material General Manager',
    hierarchyLevel: 'AREA',
    assignedNodeCode: '6001-SECL-GEV',
    assignedNodeName: 'SECL Gevra Open Cast',
    permissions: ['CNMC Cat A Oversight', 'Material Sanction'],
  });

  const [prForm, setPrForm] = useState({
    cpse_code: selectedCpseCode,
    plant_code: '6001-SECL-GEV',
    cnmc_code: 'CNMC-MEC-VLV-002150',
    legacy_code: 'SECL-MAT-VLV-501',
    material_description: '50MM BALL VALVE FLANGED ASME B16.5 CLASS 150',
    quantity: 10,
    uom: 'NOS',
    cost_center: 'CC-6001-MINING',
    estimated_cost_inr: 102980.00
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPortalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, catRes, hierRes] = await Promise.all([
        api.getCpseAdminOverview(selectedCpseName, selectedCpseCode),
        api.getCpseAdminCatalog(selectedCpseName, selectedCpseCode),
        api.getHierarchy(selectedCpseCode)
      ]);
      setOverviewData(ovRes);
      setCatalogData(catRes.data || []);
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
      fetchPortalData();
    } catch (err) {
      alert(`Node creation failed: ${getApiErrorMessage(err)}`);
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

  return (
    <AppShell
      currentPage={isCpseAdmin ? `cpse-${activeTab}` : 'admin'}
      onNavigate={onNavigate}
      title={isCpseAdmin ? `${selectedCpseName} — Enterprise Portal` : `${selectedCpseName} — Enterprise Sovereign Inspection`}
      subtitle={isCpseAdmin ? "Plant Hierarchy Management, SAP ERP Synchronizers & Inter-Plant Collaboration Hub" : "Supervisory Plant Hierarchy Management, ERP Synchronizers & Inter-Plant Audit"}
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
                <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#047857', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
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
                    COALINDIA: 'Coal India Limited',
                    BHEL: 'Bharat Heavy Electricals Limited',
                    ONGC: 'Oil & Natural Gas Corp',
                    SAIL: 'Steel Authority of India',
                    NTPC: 'NTPC Limited',
                    IOCL: 'Indian Oil Corp'
                  };
                  setSelectedCpseName(nameMap[code] || code);
                }}
              >
                <option value="COALINDIA">Coal India (CIL)</option>
                <option value="BHEL">BHEL</option>
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

        {/* Tab Pills */}
        <div className="tab-pill-group">
          <button className={`tab-pill ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabClick('overview')}>
            <Building2 size={14} />
            <span>Executive Dashboard</span>
          </button>

          <button className={`tab-pill ${activeTab === 'collaboration' ? 'active' : ''}`} onClick={() => handleTabClick('collaboration')}>
            <Network size={14} color="#2563eb" />
            <span>Inter-Plant Collaboration</span>
          </button>

          <button className={`tab-pill ${activeTab === 'hierarchy' ? 'active' : ''}`} onClick={() => handleTabClick('hierarchy')}>
            <FolderTree size={14} />
            <span>Plant Hierarchy & Roles</span>
          </button>

          <button className={`tab-pill ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => handleTabClick('catalog')}>
            <Layers size={14} />
            <span>Material Catalog Studio</span>
          </button>

          <button className={`tab-pill ${activeTab === 'sap' ? 'active' : ''}`} onClick={() => handleTabClick('sap')}>
            <Cpu size={14} />
            <span>SAP PR & Inventory Gateway</span>
          </button>
        </div>

        {/* ===================================================================
            TAB 1: Executive Dashboard Overview
            =================================================================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Row */}
            <div className="metric-row" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <div className="metric-card">
                <div className="metric-label">Total Catalog Records</div>
                <div className="metric-value">{overviewData?.kpis?.total_material_records?.toLocaleString() || '18,450'}</div>
                <div className="metric-sub">Across connected plants</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">CNMC Alignment</div>
                <div className="metric-value" style={{ color: '#10B981' }}>{overviewData?.kpis?.cnmc_coverage_pct || 98.4}%</div>
                <div className="metric-sub">National Golden Coverage</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Active Plant Nodes</div>
                <div className="metric-value">{overviewData?.kpis?.active_plants_count || 3}</div>
                <div className="metric-sub">Connected Area Units</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Identified Duplicate Risk</div>
                <div className="metric-value" style={{ color: '#F59E0B' }}>{overviewData?.kpis?.duplicate_items_detected || 6}</div>
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
                    <span className="kv-val font-semibold">{overviewData?.sap_gateway_health?.auth_type || 'OAuth2_SAML_Bearer'}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-label">OData Service Endpoint:</span>
                    <code style={{ fontSize: '11px', background: 'var(--bg-card-alt)', padding: '2px 6px', borderRadius: '4px' }}>
                      {overviewData?.sap_gateway_health?.odata_endpoint || 'https://sap-gateway.coalindia.in'}
                    </code>
                  </div>
                  <div className="kv-row">
                    <span className="kv-label">Ping Latency:</span>
                    <span className="kv-val text-emerald font-bold">{overviewData?.sap_gateway_health?.last_handshake_ms || 38.5} ms</span>
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
                  <span className="chip chip-amber">{overviewData?.recent_alerts?.length || 2} Open Alerts</span>
                </div>

                <div className="attention-list">
                  {overviewData?.recent_alerts?.map((alt: any) => (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: Inter-Plant & Inter-CPSE Collaboration Canvas
            =================================================================== */}
        {activeTab === 'collaboration' && (
          <InterPlantCollaborationGraph cpseName={selectedCpseName} />
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
                <button className="gov-btn primary" onClick={() => setShowRoleModal(true)}>
                  <UserPlus size={14} />
                  <span>Assign Nodal Officer</span>
                </button>
              </div>
            </div>

            {/* Tree View */}
            <div className="gov-table-card" style={{ padding: '20px' }}>
              <div className="hierarchy-tree-view">
                {hierarchyData?.tree?.map((node: any, idx: number) => (
                  <div key={idx} className="tree-node-item">
                    <div className="tree-node-row">
                      <span className="node-type-badge holding">{node.type_code}</span>
                      <span className="node-name-text"><b>{node.unit_name}</b> ({node.unit_code})</span>
                      <span className="node-location"><Building2 size={12} /> {node.location || 'Headquarters'}</span>
                    </div>

                    {node.children?.length > 0 && (
                      <div className="tree-children-container">
                        {node.children.map((child: any, cidx: number) => (
                          <div key={cidx} className="tree-node-child">
                            <span className="node-type-badge area">{child.type_code}</span>
                            <span>{child.unit_name} (<code>{child.unit_code}</code>)</span>
                            <span className="node-location"><Building2 size={11} /> {child.location}</span>
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
            </div>

            <div className="gov-table-card">
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
                  {catalogData.map((item) => (
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
                        <span className="status-pill approved">{item.cnmc_code}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{item.unit_price_inr?.toLocaleString()}</td>
                      <td>
                        <span className={`chip ${item.duplicate_risk === 'HIGH' ? 'chip-red' : item.duplicate_risk === 'MEDIUM' ? 'chip-amber' : 'chip-green'}`}>
                          {item.duplicate_risk} RISK
                        </span>
                      </td>
                      <td>
                        <button className="gov-btn small secondary" onClick={() => alert(`Reviewing duplicate pair: ${item.matched_duplicate_code || 'None'}`)}>
                          Review Match
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>PR-9004812</td>
                    <td>6001-SECL-GEV</td>
                    <td>50MM BALL VALVE FLANGED ASME B16.5 CLASS 150</td>
                    <td><span className="status-pill approved">CNMC-MEC-VLV-002150</span></td>
                    <td>10 NOS</td>
                    <td style={{ fontWeight: 700 }}>₹1,02,989.80</td>
                    <td><span className="chip chip-green">DISPATCHED TO SAP</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>PR-9004813</td>
                    <td>6002-BCCL-JHA</td>
                    <td>SPHERICAL ROLLER BEARING 22220-E1-K-C3 WITH SLEEVE</td>
                    <td><span className="status-pill approved">CNMC-MEC-BRG-620577</span></td>
                    <td>5 NOS</td>
                    <td style={{ fontWeight: 700 }}>₹62,250.00</td>
                    <td><span className="chip chip-blue">PRE-SANCTION VALIDATED</span></td>
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
                        <option value="PLANT">PLANT / MINE</option>
                        <option value="AREA">AREA GENERAL MANAGER</option>
                        <option value="WASHERY">WASHERY / STORE</option>
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
      </div>
    </AppShell>
  );
};
