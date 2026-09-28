import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import { useVoiceStore } from '../store/voiceStore';
import { CpseScheduleBadge } from '../components/cnmc/CpseScheduleBadge';
import { MaterialCategorization } from '../components/cnmc/MaterialCategorization';
import { api } from '../api/client';
import { 
  Building2, 
  Bot, 
  Layers, 
  UserPlus, 
  ShieldCheck, 
  MapPin, 
  FolderTree, 
  Check, 
  X, 
  Send 
} from 'lucide-react';

interface CpseAdminPageProps {
  onNavigate: (page: string) => void;
}

export const CpseAdminPage: React.FC<CpseAdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { openChat, setCurrentInput } = useVoiceStore();

  const cpseCode = user?.cpseCode || 'COALINDIA';
  const cpseName = user?.cpseName || 'Coal India Limited';

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'materials'>('hierarchy');
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Form State for Role Assignment
  const [assignForm, setAssignForm] = useState({
    userName: '',
    email: '',
    roleTitle: 'Area Material General Manager',
    hierarchyLevel: 'AREA',
    assignedNodeCode: '',
    assignedNodeName: '',
    permissions: ['CNMC Cat A Oversight', 'Material Sanction'],
  });

  const [assigning, setAssigning] = useState(false);

  // Load live hierarchy and roles from backend
  useEffect(() => {
    const loadBackendData = async () => {
      setLoadingRoles(true);
      try {
        const [hierRes, rolesRes] = await Promise.all([
          api.getHierarchy(cpseCode),
          api.getRoleAssignments(cpseCode),
        ]);
        setHierarchyData(hierRes);
        setRolesList(rolesRes);

        // Pre-select first area
        if (hierRes?.subsidiaries?.[0]?.areas?.[0]) {
          const firstArea = hierRes.subsidiaries[0].areas[0];
          setAssignForm(prev => ({
            ...prev,
            assignedNodeCode: firstArea.code,
            assignedNodeName: firstArea.name,
          }));
        }
      } catch (err) {
        console.warn('Backend load error in CpseAdminPage:', err);
      } finally {
        setLoadingRoles(false);
      }
    };
    loadBackendData();
  }, [cpseCode]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.userName || !assignForm.email || !assignForm.assignedNodeCode) {
      alert('Please complete all assignment fields.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.assignRole({
        cpse_code: cpseCode,
        user_name: assignForm.userName,
        email: assignForm.email,
        role_title: assignForm.roleTitle,
        hierarchy_level: assignForm.hierarchyLevel,
        assigned_node_code: assignForm.assignedNodeCode,
        assigned_node_name: assignForm.assignedNodeName,
        permissions: assignForm.permissions,
      });

      setRolesList(prev => [res, ...prev]);
      setShowAssignModal(false);
      setAssignForm(prev => ({
        ...prev,
        userName: '',
        email: '',
      }));
    } catch (err: any) {
      alert('Failed to assign role: ' + err?.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AppShell
      currentPage="admin"
      onNavigate={onNavigate}
      title={`${cpseCode} Enterprise Workspace`}
    >
      <div style={{ marginBottom: '8px' }}>
        <h1 className="greeting-text">{cpseName}</h1>
        <div className="greeting-sub">Nodal Administration & Area Hierarchy Management (Live DB Synced)</div>
      </div>

      {/* Scoped Identity Header */}
      <div className="panel-card" style={{ padding: '18px 22px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} color="var(--accent-dark)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{cpseName}</span>
              <CpseScheduleBadge schedule="Schedule A" category={cpseCode} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Administrator: <strong>{user?.fullName || 'Nodal Officer'}</strong> ({user?.email})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-primary"
            onClick={() => setShowAssignModal(true)}
            style={{ background: 'var(--accent-dark)' }}
          >
            <UserPlus size={15} color="var(--accent-gold)" />
            <span>Assign Role to Area</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setCurrentInput(`@${cpseCode} Area Hierarchy Status`);
              openChat();
            }}
          >
            <Bot size={15} color="var(--accent-gold)" />
            <span>Ask CNMC Voice</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Hierarchy & Roles vs CNMC Materials) */}
      <div className="panel-card" style={{ padding: '10px 18px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tab-row">
          <button
            className={`tab ${activeTab === 'hierarchy' ? 'active' : ''}`}
            onClick={() => setActiveTab('hierarchy')}
          >
            Area Hierarchy & Role Grants
          </button>
          <button
            className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            CNMC Strategic Materials (Cat A, B, C)
          </button>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="dot" style={{ background: 'var(--accent-green)' }} />
          <span>Hierarchy Scope: Enterprise Full</span>
        </div>
      </div>

      {activeTab === 'hierarchy' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Assigned Hierarchy Roles Table */}
          <div className="table-panel">
            <div className="table-panel-header">
              <div>
                <div className="table-panel-title">Operational Area Role Grants & Nodal Officers</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Users assigned to Areas, Operating Subsidiaries, and Mines in PostgreSQL DB
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => setShowAssignModal(true)}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                + Assign New Role
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Nodal Officer Name & Email</th>
                  <th>Assigned Role Title</th>
                  <th>Hierarchy Level</th>
                  <th>Assigned Area / Node</th>
                  <th>Sanction Permissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rolesList.map((roleItem) => (
                  <tr key={roleItem.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{roleItem.user_name}</div>
                      <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{roleItem.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{roleItem.role_title}</div>
                    </td>
                    <td>
                      <span className="badge badge-amber">{roleItem.hierarchy_level}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{roleItem.assigned_node_name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{roleItem.assigned_node_code}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {roleItem.permissions?.map((p: string, idx: number) => (
                          <span key={idx} className="badge badge-gray" style={{ fontSize: '9.5px' }}>{p}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={11} /> {roleItem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hierarchy Breakdown Tree Cards */}
          {hierarchyData?.subsidiaries && (
            <div className="table-panel">
              <div className="table-panel-header">
                <div>
                  <div className="table-panel-title">Organizational Hierarchy Tree: {hierarchyData.cpse_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Subsidiaries, Operational Areas, and Plant Depots
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {hierarchyData.subsidiaries.map((sub: any) => (
                  <div key={sub.code} style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderTree size={16} color="var(--accent-dark)" />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{sub.name}</span>
                        <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '10px' }}>{sub.code}</span>
                      </div>
                      <span className="badge badge-blue">SUBSIDIARY</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      {sub.areas?.map((area: any) => (
                        <div key={area.code} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{area.name}</span>
                            <span className="badge badge-amber" style={{ fontSize: '9px' }}>AREA</span>
                          </div>
                          <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: 'var(--accent-blue)', marginTop: '2px' }}>
                            {area.code}
                          </div>

                          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-light)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            <strong>Plants / Mines:</strong>
                            <ul style={{ paddingLeft: '14px', marginTop: '3px' }}>
                              {area.plants?.map((p: any) => (
                                <li key={p.code} style={{ color: 'var(--text-secondary)' }}>
                                  {p.name} ({p.store})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <MaterialCategorization />
      )}

      {/* Modal: Assign Role to Area & Hierarchy */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="var(--accent-gold)" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Assign Role to Area & Hierarchy
                </span>
              </div>
              <button className="icon-btn" onClick={() => setShowAssignModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Select Target Hierarchy Area / Node *</label>
                <select
                  className="form-select"
                  value={assignForm.assignedNodeCode}
                  onChange={(e) => {
                    const selCode = e.target.value;
                    let selName = selCode;
                    hierarchyData?.subsidiaries?.forEach((s: any) => {
                      s.areas?.forEach((a: any) => {
                        if (a.code === selCode) selName = a.name;
                      });
                    });
                    setAssignForm({
                      ...assignForm,
                      assignedNodeCode: selCode,
                      assignedNodeName: selName,
                    });
                  }}
                >
                  {hierarchyData?.subsidiaries?.flatMap((s: any) =>
                    s.areas?.map((a: any) => (
                      <option key={a.code} value={a.code}>
                        {s.code} → {a.name} ({a.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Officer Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={assignForm.userName}
                    onChange={(e) => setAssignForm({ ...assignForm, userName: e.target.value })}
                    placeholder="e.g. Er. Sunil Pandey"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={assignForm.email}
                    onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })}
                    placeholder="e.g. spandey@secl.gov.in"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Role Designation</label>
                  <select
                    className="form-select"
                    value={assignForm.roleTitle}
                    onChange={(e) => setAssignForm({ ...assignForm, roleTitle: e.target.value })}
                  >
                    <option value="Area Material General Manager">Area Material General Manager</option>
                    <option value="Area Nodal Materials Officer">Area Nodal Materials Officer</option>
                    <option value="Plant Store In-Charge">Plant Store In-Charge</option>
                    <option value="Quality & Standardization Inspector">Quality & Standardization Inspector</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hierarchy Level</label>
                  <select
                    className="form-select"
                    value={assignForm.hierarchyLevel}
                    onChange={(e) => setAssignForm({ ...assignForm, hierarchyLevel: e.target.value })}
                  >
                    <option value="AREA">AREA (Operational Coalfields / Stations)</option>
                    <option value="PLANT">PLANT / MINE (Production Site)</option>
                    <option value="STORE">STORE (Central Spares Depot)</option>
                    <option value="SUBSIDIARY">SUBSIDIARY (Operating Unit HQ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={assigning}
                >
                  <Send size={14} />
                  <span>{assigning ? 'Committing to DB...' : 'Commit Role Assignment to DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};
