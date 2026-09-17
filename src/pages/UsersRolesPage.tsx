import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Plus, RefreshCw, Search, Shield, UserCheck, 
  CheckCircle2, Mail, Building2, Lock, Key
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { api, getApiErrorMessage } from '../api/client';

export const UsersRolesPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role_code: 'AREA_ADMIN',
    scope_type: 'CPSE',
    cpse_id: 'cpse-ongc'
  });
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.createUser(formData);
      alert(`User ${formData.full_name} created successfully!`);
      setCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(`Failed to create user: ${getApiErrorMessage(err)}`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.primary_role_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      currentPage="users-roles"
      onNavigate={onNavigate}
      title="Users & Access Governance (RBAC)"
      subtitle="Zero-Trust Identity Federation, Organizational Hierarchy Scopes & Privilege Grants"
    >
      <div className="gov-page-container">
        {/* Top Control Bar */}
        <div className="intel-top-bar">
          <div className="search-box-wrapper">
            <Search size={15} />
            <input 
              type="text" 
              className="gov-search-input"
              placeholder="Search user by name, email, role, or scope..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="intel-filters">
            <button className="gov-btn primary" onClick={() => setCreateModalOpen(true)}>
              <Plus size={15} />
              <span>Provision Officer</span>
            </button>
            <button className="gov-refresh-btn" onClick={fetchUsers} title="Refresh Users">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="gov-table-card">
          <table className="gov-data-table">
            <thead>
              <tr>
                <th>Officer Identity</th>
                <th>Enterprise Email</th>
                <th>Primary Role Title</th>
                <th>Hierarchical Scope</th>
                <th>Associated CPSE</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="profile-avatar-small">
                        {user.full_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">{user.full_name}</div>
                        <div className="text-xs text-muted">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm font-mono">{user.email}</td>
                  <td>
                    <span className="role-badge">
                      <Shield size={12} />
                      <span>{user.primary_role_code.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td>
                    <span className="scope-tag">{user.scope_type || 'CPSE'}</span>
                  </td>
                  <td className="font-semibold text-sm">
                    {user.cpse_name || <span className="text-muted italic">National Sovereign Scope</span>}
                  </td>
                  <td>
                    <span className="status-pill active">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {createModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Provision New Enterprise Officer</h3>
                <button onClick={() => setCreateModalOpen(false)} className="close-btn">×</button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Officer Name</label>
                    <input 
                      type="text" 
                      className="gov-input"
                      required
                      placeholder="e.g. Er. Rajiv Singhania"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Enterprise Username</label>
                    <input 
                      type="text" 
                      className="gov-input font-mono"
                      required
                      placeholder="e.g. singhania.r"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gov/CPSE Email Address</label>
                    <input 
                      type="email" 
                      className="gov-input"
                      required
                      placeholder="e.g. r.singhania@ongc.co.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role Assignment</label>
                    <select 
                      className="gov-select w-full"
                      value={formData.role_code}
                      onChange={(e) => setFormData({ ...formData, role_code: e.target.value })}
                    >
                      <option value="NATIONAL_GOVERNANCE">National Governance Admin</option>
                      <option value="CPSE_ADMIN">CPSE Nodal Administrator</option>
                      <option value="AREA_ADMIN">Area / Subsidiary Officer</option>
                      <option value="PLANT_USER">Plant Materials Specialist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target CPSE Silo</label>
                    <select 
                      className="gov-select w-full"
                      value={formData.cpse_id}
                      onChange={(e) => setFormData({ ...formData, cpse_id: e.target.value })}
                    >
                      <option value="cpse-ongc">ONGC (Oil & Natural Gas Corp)</option>
                      <option value="cpse-iocl">IOCL (Indian Oil Corp)</option>
                      <option value="cpse-sail">SAIL (Steel Authority of India)</option>
                      <option value="cpse-ntpc">NTPC Limited</option>
                      <option value="cpse-bhel">BHEL</option>
                      <option value="cpse-cil">Coal India Limited</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? 'Provisioning...' : 'Confirm Provisioning'}
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
