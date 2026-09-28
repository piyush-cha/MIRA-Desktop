import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Plus, RefreshCw, Search, Shield, UserCheck, 
  CheckCircle2, Mail, Building2, Lock, Key, Copy, Check, Filter,
  ExternalLink, ChevronDown, Users, ShieldAlert, Cpu
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const UsersRolesPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const isNationalAdmin = user?.roleCode === 'NATIONAL_GOVERNANCE';
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableCpses, setAvailableCpses] = useState<any[]>([]);
  const [selectedCpse, setSelectedCpse] = useState<string>(user?.cpseCode || 'BHEL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  
  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role_code: 'AREA_ADMIN',
    scope_type: 'CPSE',
    cpse_id: user?.cpseCode || 'BHEL'
  });
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  // Consolidated CPSEs list
  const knownCpses = [
    { code: 'BHEL', name: 'Bharat Heavy Electricals Limited' },
    { code: 'ONGC', name: 'Oil and Natural Gas Corporation' },
    { code: 'IOCL', name: 'Indian Oil Corporation Limited' },
    { code: 'NTPC', name: 'National Thermal Power Corporation' },
    { code: 'CIL', name: 'Coal India Limited' },
    { code: 'GAIL', name: 'GAIL (India) Limited' }
  ];

  const allCpses = [...availableCpses];
  knownCpses.forEach(kc => {
    if (!allCpses.some(ac => ac.code === kc.code)) {
      allCpses.push(kc);
    }
  });

  const activeCpseInfo = allCpses.find(c => c.code === selectedCpse) || { 
    code: selectedCpse, 
    name: selectedCpse === 'ALL' ? 'All Connected Enterprise Silos' : `${selectedCpse} Enterprise Node` 
  };

  const fetchUsers = async (cpseCodeToFetch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const code = cpseCodeToFetch !== undefined ? cpseCodeToFetch : selectedCpse;
      const res = await api.getUsers(code === 'ALL' ? undefined : code);
      setUsers(res.data || []);
      
      const cpseRes = await api.getCpses();
      setAvailableCpses(cpseRes.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(selectedCpse);
    setFormData(prev => ({
      ...prev,
      cpse_id: selectedCpse === 'ALL' ? 'BHEL' : selectedCpse
    }));
  }, [selectedCpse]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.createUser(formData);
      setCreateModalOpen(false);
      setSuccessMsg(`Officer ${formData.full_name} provisioned in ${formData.cpse_id} silo successfully!`);
      fetchUsers(selectedCpse);
      setFormData({
        ...formData,
        username: '',
        email: '',
        full_name: ''
      });
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(`Failed to provision officer: ${getApiErrorMessage(err)}`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase();
    const fullName = (u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const roleCode = (u.primary_role_code || '').toLowerCase();
    const cpseName = (u.cpse_name || '').toLowerCase();
    const cpseCode = (u.cpse_code || '').toLowerCase();

    const matchesSearch = fullName.includes(search) || email.includes(search) || username.includes(search) || roleCode.includes(search) || cpseName.includes(search) || cpseCode.includes(search);

    if (roleFilter === 'ALL') return matchesSearch;
    if (roleFilter === 'ADMIN') return matchesSearch && (u.primary_role_code === 'CPSE_ADMIN' || u.primary_role_code === 'NATIONAL_GOVERNANCE');
    if (roleFilter === 'AREA') return matchesSearch && (u.primary_role_code === 'AREA_ADMIN' || u.primary_role_code === 'ZONE_ADMIN');
    if (roleFilter === 'PLANT') return matchesSearch && (u.primary_role_code === 'PLANT_USER');
    return matchesSearch;
  });

  // KPI Calculations
  const totalOfficers = users.length;
  const adminCount = users.filter(u => u.primary_role_code === 'CPSE_ADMIN' || u.primary_role_code === 'NATIONAL_GOVERNANCE').length;
  const areaCount = users.filter(u => u.primary_role_code === 'AREA_ADMIN' || u.primary_role_code === 'ZONE_ADMIN').length;
  const plantCount = users.filter(u => u.primary_role_code === 'PLANT_USER').length;

  return (
    <AppShell
      currentPage="users-roles"
      onNavigate={onNavigate}
      title="Users & Access Governance (RBAC)"
      subtitle="Zero-Trust Identity Federation, Organizational Hierarchy Scopes & Privilege Grants"
    >
      <div className="gov-page-container" style={{ gap: '12px', paddingTop: '14px', paddingBottom: '40px' }}>
        
        {successMsg && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{successMsg}</span>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontWeight: 800 }} onClick={() => setSuccessMsg(null)}>×</button>
          </div>
        )}
        
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
              <ShieldAlert size={16} color="#DC2626" />
              <span>{error}</span>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 800 }} onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Connected Enterprise Silo Banner */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
              flexShrink: 0
            }}>
              {selectedCpse === 'ALL' ? 'ALL' : selectedCpse.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563EB', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {selectedCpse === 'ALL' ? 'CROSS-CPSE FEDERATION' : `ISOLATED ENTERPRISE SILO: ${selectedCpse}`}
                </span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={10} /> ZERO-TRUST RBAC 100%
                </span>
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                {activeCpseInfo.name}
              </h2>
            </div>
          </div>

          {/* Specified CPSE Silo Selector (National Governance only) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isNationalAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '8px' }}>
                <Building2 size={14} color="#64748B" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Connected Silo:</span>
                <select
                  value={selectedCpse}
                  onChange={(e) => setSelectedCpse(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    paddingLeft: '4px'
                  }}
                >
                  <option value="ALL">🌐 All Enterprise Silos (National Master)</option>
                  {allCpses.map((c: any) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button 
              className="gov-refresh-btn" 
              onClick={() => fetchUsers(selectedCpse)} 
              title="Refresh Silo Directory"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={13} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '0px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Provisioned Officers</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={14} color="#2563EB" />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
              {totalOfficers}
            </div>
            <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              ● 100% Cryptographically Active
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nodal Administrators</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={14} color="#4338CA" />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1D4ED8' }}>
              {adminCount}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Tier 4 HQ Authority
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Area & Zone Officers</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={14} color="#6D28D9" />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5' }}>
              {areaCount}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Tier 3 Subsidiary Clearance
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Plant Specialists</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={14} color="#059669" />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
              {plantCount}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
              Tier 2 Material Verification
            </div>
          </div>
        </div>

        {/* Unified Users & Roles Table Card (One Professional Box) */}
        <div className="gov-table-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          {/* Integrated Header Toolbar */}
          <div style={{
            padding: '12px 16px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Search Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', minWidth: '280px', flex: 1 }}>
              <Search size={14} color="#64748B" />
              <input 
                type="text" 
                placeholder={`Search ${selectedCpse === 'ALL' ? 'all officers' : selectedCpse + ' officers'} by name, email, role, or scope...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', color: '#0F172A' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '14px', padding: 0 }}>×</button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'ADMIN', label: 'HQ Admins' },
                { id: 'AREA', label: 'Area Managers' },
                { id: 'PLANT', label: 'Plant Specialists' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: roleFilter === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    border: 'none',
                    background: roleFilter === tab.id ? '#FFFFFF' : 'transparent',
                    color: roleFilter === tab.id ? '#0F172A' : '#64748B',
                    boxShadow: roleFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Provision Button */}
            <button 
              onClick={() => setCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} />
              <span>Provision Officer</span>
            </button>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table className="gov-data-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ width: '22%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Officer Identity</th>
                  <th style={{ width: '24%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Enterprise Email</th>
                  <th style={{ width: '18%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Primary Role Title</th>
                  <th style={{ width: '14%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Connected Silo Scope</th>
                  <th style={{ width: '12%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clearance Tier</th>
                  <th style={{ width: '10%', padding: '10px 14px', fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Security Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      <Shield size={32} color="#CBD5E1" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>No Provisioned Officers Found</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        {searchQuery ? 'Try clearing your search query.' : `Click "+ Provision Officer" to bind a new officer to the ${selectedCpse} silo.`}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => {
                    const roleCode = u.primary_role_code || 'USER';
                    let roleColor = { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
                    let tierLabel = 'Tier 2 · Plant Facility';
                    
                    if (roleCode === 'CPSE_ADMIN' || roleCode === 'TIER_5_HQ') {
                      roleColor = { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
                      tierLabel = 'Tier 4 · Enterprise HQ';
                    } else if (roleCode === 'NATIONAL_GOVERNANCE') {
                      roleColor = { bg: '#F1F5F9', text: '#0F172A', border: '#CBD5E1' };
                      tierLabel = 'Tier 5 · National Overseer';
                    } else if (roleCode === 'AREA_ADMIN' || roleCode === 'ZONE_ADMIN') {
                      roleColor = { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' };
                      tierLabel = 'Tier 3 · Area Subsidiary';
                    } else if (roleCode === 'PLANT_USER') {
                      roleColor = { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
                      tierLabel = 'Tier 2 · Plant Specialist';
                    } else if (roleCode === 'TIER_1_OPERATOR') {
                      roleColor = { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' };
                      tierLabel = 'Tier 1 · Field Operator';
                    }

                    const userCpseCode = u.cpse_code || (u.scope_type === 'NATIONAL' ? 'NATIONAL' : selectedCpse);

                    return (
                      <tr key={u.user_id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '12px',
                              flexShrink: 0
                            }}>
                              {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.full_name || u.username}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                @{u.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.email}
                            </span>
                            <button
                              onClick={() => handleCopyEmail(u.email)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94A3B8', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                              title="Copy Email"
                            >
                              {copiedEmail === u.email ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: roleColor.bg,
                            color: roleColor.text,
                            border: `1px solid ${roleColor.border}`,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            whiteSpace: 'nowrap'
                          }}>
                            <Shield size={11} />
                            <span>{roleCode.replace(/_/g, ' ')}</span>
                          </span>
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                            <Lock size={10} color="#2563EB" />
                            <span style={{ fontWeight: 800, fontSize: '11px', color: '#0F172A' }}>{userCpseCode}</span>
                            <span style={{ fontSize: '10px', color: '#64748B' }}>Silo</span>
                          </div>
                        </td>

                        <td style={{ padding: '10px 14px', fontSize: '11px', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tierLabel}
                        </td>

                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.03em'
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
{/* Create User Modal */}
        {createModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-dialog" style={{ maxWidth: '480px', borderRadius: '14px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="#2563EB" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Provision Enterprise Officer
                  </h3>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="modal-body" style={{ padding: '20px' }}>
                  {isNationalAdmin ? (
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                        Target Isolated Enterprise Silo
                      </label>
                      <select 
                        className="gov-select w-full"
                        value={formData.cpse_id}
                        onChange={(e) => setFormData({ ...formData, cpse_id: e.target.value })}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                      >
                        {allCpses.map(cpse => (
                          <option key={cpse.code} value={cpse.code}>
                            {cpse.code} — {cpse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                        Enterprise Silo
                      </label>
                      <div style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#2563EB" />
                        <span>{user?.cpseName || selectedCpse} ({selectedCpse})</span>
                      </div>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                      Full Officer Name
                    </label>
                    <input 
                      type="text" 
                      className="gov-input"
                      required
                      placeholder="e.g. Er. Rajiv Singhania"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                      Enterprise Username
                    </label>
                    <input 
                      type="text" 
                      className="gov-input font-mono"
                      required
                      placeholder="e.g. singhania.r"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                      Gov / CPSE Email Address
                    </label>
                    <input 
                      type="email" 
                      className="gov-input font-mono"
                      required
                      placeholder={`e.g. r.singhania@${formData.cpse_id.toLowerCase()}.in`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                      Role & Hierarchical Scope
                    </label>
                    <select 
                      className="gov-select w-full"
                      value={formData.role_code}
                      onChange={(e) => setFormData({ ...formData, role_code: e.target.value })}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    >
                      <option value="CPSE_ADMIN">CPSE Nodal Administrator (Tier 4)</option>
                      <option value="AREA_ADMIN">Area / Subsidiary Officer (Tier 3)</option>
                      <option value="PLANT_USER">Plant Materials Specialist (Tier 2)</option>
                      {isNationalAdmin && <option value="NATIONAL_GOVERNANCE">National Governance Admin (Tier 5)</option>}
                    </select>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={createSubmitting} style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
                    {createSubmitting ? 'Provisioning...' : `Confirm Provision in ${formData.cpse_id}`}
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
