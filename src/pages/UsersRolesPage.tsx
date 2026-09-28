Wimport React, { useState, useEffect } from 'react';

import { 

  UserCircle, Plus, RefreshCw, Search, Shield, UserCheck, 

  CheckCircle2, Mail, Building2, Lock, Key

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

  

  // Create User Modal

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({

    username: '',

    email: '',

    full_name: '',

    role_code: 'AREA_ADMIN',

    scope_type: 'CPSE',

    cpse_id: isNationalAdmin ? 'NATIONAL' : (user?.cpseId || 'NATIONAL')

  });

  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);



  const fetchUsers = async () => {

    setLoading(true);

    setError(null);

    try {

      const res = await api.getUsers();

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

    fetchUsers();

  }, []);



  const handleCreateUser = async (e: React.FormEvent) => {

    e.preventDefault();

    setCreateSubmitting(true);

    setError(null);

    setSuccessMsg(null);

    try {

      await api.createUser(formData);

      setCreateModalOpen(false);

      setSuccessMsg(`Officer ${formData.full_name} provisioned successfully!`);

      fetchUsers();

      // Clear form data for next time

      setFormData({

        ...formData,

        username: '',

        email: '',

        full_name: ''

      });

      // Auto-hide success message after 5 seconds

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

    return fullName.includes(search) || email.includes(search) || username.includes(search) || roleCode.includes(search);

  });



  return (

    <AppShell

      currentPage="users-roles"

      onNavigate={onNavigate}

      title="Users & Access Governance (RBAC)"

      subtitle="Zero-Trust Identity Federation, Organizational Hierarchy Scopes & Privilege Grants"

    >

      <div className="gov-page-container">

        

        {successMsg && (

          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">

            <CheckCircle2 size={16} />

            <span className="block sm:inline">{successMsg}</span>

            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMsg(null)}>×</button>

          </div>

        )}

        

        {error && (

          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">

            <strong className="font-bold">Error: </strong>

            <span className="block sm:inline">{error}</span>

            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>×</button>

          </div>

        )}



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

                        {user.full_name ? user.full_name[0].toUpperCase() : '?'}

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

                      {isNationalAdmin && <option value="NATIONAL_GOVERNANCE">National Governance Admin</option>}

                      {isNationalAdmin && <option value="CPSE_ADMIN">CPSE Nodal Administrator</option>}

                      <option value="AREA_ADMIN">Area / Subsidiary Officer</option>

                      <option value="PLANT_USER">Plant Materials Specialist</option>

                    </select>

                  </div>

                  

                  {isNationalAdmin && (

                    <div className="form-group">

                      <label>Target CPSE Silo</label>

                      <select 

                        className="gov-select w-full"

                        value={formData.cpse_id}

                        onChange={(e) => setFormData({ ...formData, cpse_id: e.target.value })}

                      >

                        <option value="NATIONAL">National Governance (Cross-CPSE)</option>

                        {availableCpses.map(cpse => (

                          <option key={cpse.code} value={cpse.code}>

                            {cpse.name}

                          </option>

                        ))}

                      </select>

                    </div>

                  )}

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

��import React, { useState, useEffect } from 'react';

import { 

  UserCircle, Plus, RefreshCw, Search, Shield, UserCheck, 

  CheckCircle2, Mail, Building2, Lock, Key, Trash2, Edit

} from 'lucide-react';

import { AppShell } from '../components/layout/AppShell';

import { api, getApiErrorMessage } from '../api/client';

import { useAuthStore } from '../store/authStore';

import { getRoleTier } from '../utils/userUtils';



export const UsersRolesPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {

  const { user } = useAuthStore();

  const isNationalAdmin = user?.roleCode === 'NATIONAL_GOVERNANCE' || user?.roleCode?.includes('GOV');

  const myTier = getRoleTier(user?.roleCode || '');

  

  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [availableCpses, setAvailableCpses] = useState<any[]>([]);

  

  // Credentials Modal

  const [credentialsModalOpen, setCredentialsModalOpen] = useState<boolean>(false);

  const [credentialsData, setCredentialsData] = useState<{pin: string, email_template: string, pdf_content?: string, officer_name: string} | null>(null);



  // Edit User Modal

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  const [editFormData, setEditFormData] = useState({

    user_id: '',

    full_name: '',

    email: '',

    role_code: ''

  });

  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);



  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({

    username: '',

    email: '',

    full_name: '',

    role_code: myTier > 3 ? 'AREA_ADMIN' : (myTier > 2 ? 'PLANT_USER' : 'DAILY_OPERATOR'),

    scope_type: 'CPSE',

    cpse_id: isNationalAdmin ? 'NATIONAL' : (user?.cpseId || 'NATIONAL')

  });

  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);



  const fetchUsers = async () => {

    setLoading(true);

    setError(null);

    try {

      const targetCpseCode = isNationalAdmin ? undefined : user?.cpseCode || undefined;

      const res = await api.getUsers(targetCpseCode);

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

    fetchUsers();

  }, []);



  const handleCreateUser = async (e: React.FormEvent) => {

    e.preventDefault();

    setCreateSubmitting(true);

    setError(null);

    setSuccessMsg(null);

    try {

      const payload = {

        ...formData,

        cpse_id: isNationalAdmin ? formData.cpse_id : (user?.cpseCode || 'NATIONAL')

      };

      const res = await api.createUser(payload);

      setCreateModalOpen(false);

      setSuccessMsg(`Officer ${formData.full_name} provisioned successfully!`);

      

      if (res && res.pin && res.email_template) {

        setCredentialsData({

          pin: res.pin,

          email_template: res.email_template,

          pdf_content: res.pdf_content,

          officer_name: formData.full_name

        });

        setCredentialsModalOpen(true);

      }



      await api.logActivity({

        action: 'OFFICER_PROVISIONED',

        target: payload.cpse_id,

        details: `Provisioned new officer ${formData.full_name} (${formData.email}) with role ${formData.role_code}.`,

        actor: user?.email || 'SYSTEM'

      });



      fetchUsers();

      // Clear form data for next time

      setFormData({

        ...formData,

        username: '',

        email: '',

        full_name: ''

      });

      // Auto-hide success message after 5 seconds

      setTimeout(() => setSuccessMsg(null), 5000);

    } catch (err) {

      setError(`Failed to provision officer: ${getApiErrorMessage(err)}`);

    } finally {

      setCreateSubmitting(false);

    }

  };



  const handleEditUser = async (e: React.FormEvent) => {

    e.preventDefault();

    setEditSubmitting(true);

    setError(null);

    try {

      await api.updateUser(editFormData.user_id, {

        full_name: editFormData.full_name,

        email: editFormData.email,

        role_code: editFormData.role_code

      });

      setEditModalOpen(false);

      setSuccessMsg(`Officer updated successfully!`);

      

      await api.logActivity({

        action: 'OFFICER_UPDATED',

        target: user?.cpseCode || 'NATIONAL',

        details: `Updated officer ${editFormData.full_name}. New role: ${editFormData.role_code}.`,

        actor: user?.email || 'SYSTEM'

      });

      

      fetchUsers();

    } catch (err) {

      setError(`Failed to update officer: ${getApiErrorMessage(err)}`);

    } finally {

      setEditSubmitting(false);

    }

  };



  const handleDeleteUser = async (userId: string, userName: string) => {

    if (!window.confirm(`Are you sure you want to revoke access for ${userName}? This action is irreversible.`)) {

      return;

    }

    try {

      await api.deleteUser(userId);

      setSuccessMsg(`Access revoked for ${userName}.`);

      

      await api.logActivity({

        action: 'OFFICER_REVOKED',

        target: user?.cpseCode || 'NATIONAL',

        details: `Revoked enterprise access for officer ${userName} (${userId}).`,

        actor: user?.email || 'SYSTEM'

      });

      

      fetchUsers();

    } catch (err) {

      setError(`Failed to revoke access: ${getApiErrorMessage(err)}`);

    }

  };



  const filteredUsers = users.filter((u) => {

    const search = searchQuery.toLowerCase();

    const fullName = (u.full_name || '').toLowerCase();

    const email = (u.email || '').toLowerCase();

    const username = (u.username || '').toLowerCase();

    const roleCode = (u.primary_role_code || '').toLowerCase();

    const matchesSearch = fullName.includes(search) || email.includes(search) || username.includes(search) || roleCode.includes(search);

    

    const targetTier = getRoleTier(u.primary_role_code);

    const isSelf = u.user_id === user?.id || u.username === user?.username;

    const canSee = isNationalAdmin || isSelf || (targetTier < myTier);

    

    return matchesSearch && canSee;

  });



  return (

    <AppShell

      currentPage="users-roles"

      onNavigate={onNavigate}

      title="Users & Access Governance (RBAC)"

      subtitle="Zero-Trust Identity Federation, Organizational Hierarchy Scopes & Privilege Grants"

    >

      <div className="gov-page-container">

        

        {successMsg && (

          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">

            <CheckCircle2 size={16} />

            <span className="block sm:inline">{successMsg}</span>

            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMsg(null)}>×</button>

          </div>

        )}

        

        {error && (

          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">

            <strong className="font-bold">Error: </strong>

            <span className="block sm:inline">{error}</span>

            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>×</button>

          </div>

        )}



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

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.map((user) => (

                <tr key={user.user_id}>

                  <td>

                    <div className="flex items-center gap-3">

                      <div className="profile-avatar-small">

                        {user.full_name ? user.full_name[0].toUpperCase() : '?'}

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

                      <span>{

                        user.primary_role_code === 'PLANT_USER' ? 'PLANT HEAD' :

                        user.primary_role_code === 'AREA_ADMIN' ? 'AREA OFFICER' :

                        user.primary_role_code === 'ZONE_ADMIN' ? 'ZONE OFFICER' :

                        user.primary_role_code === 'CPSE_ADMIN' ? 'CPSE ADMIN' :

                        user.primary_role_code === 'DAILY_OPERATOR' ? 'DAILY OPERATOR' :

                        user.primary_role_code.replace(/_/g, ' ')

                      }</span>

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

                  <td>

                    { (isNationalAdmin || getRoleTier(user.primary_role_code) < myTier) && (

                      <div className="flex gap-2">

                        <button 

                          className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"

                          title="Edit Officer"

                          onClick={() => {

                            setEditFormData({

                              user_id: user.user_id,

                              full_name: user.full_name,

                              email: user.email || '',

                              role_code: user.primary_role_code

                            });

                            setEditModalOpen(true);

                          }}

                        >

                          <Edit size={16} />

                        </button>

                        <button 

                          className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"

                          title="Revoke Access"

                          onClick={() => handleDeleteUser(user.user_id, user.full_name)}

                        >

                          <Trash2 size={16} />

                        </button>

                      </div>

                    )}

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

                      {isNationalAdmin && <option value="NATIONAL_GOVERNANCE">National Governance Admin</option>}

                      {myTier > 4 && <option value="ZONE_ADMIN">Zone Officer</option>}

                      {myTier > 3 && <option value="AREA_ADMIN">Area / Subsidiary Officer</option>}

                      {myTier > 2 && <option value="PLANT_USER">Plant Head</option>}

                      <option value="DAILY_OPERATOR">Daily Operator</option>

                    </select>

                  </div>

                  

                  {isNationalAdmin && (

                    <div className="form-group">

                      <label>Target CPSE Silo</label>

                      <select 

                        className="gov-select w-full"

                        value={formData.cpse_id}

                        onChange={(e) => setFormData({ ...formData, cpse_id: e.target.value })}

                      >

                        <option value="NATIONAL">National Governance (Cross-CPSE)</option>

                        {availableCpses.map(cpse => (

                          <option key={cpse.code} value={cpse.code}>

                            {cpse.name}

                          </option>

                        ))}

                      </select>

                    </div>

                  )}

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

        {/* Edit User Modal */}

        {editModalOpen && (

          <div className="modal-backdrop">

            <div className="modal-dialog">

              <div className="modal-header">

                <h3>Edit Officer Profile</h3>

                <button onClick={() => setEditModalOpen(false)} className="close-btn">×</button>

              </div>

              <form onSubmit={handleEditUser}>

                <div className="modal-body">

                  <div className="form-group">

                    <label>Full Officer Name</label>

                    <input 

                      type="text" 

                      className="gov-input"

                      required

                      value={editFormData.full_name}

                      onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}

                    />

                  </div>

                  {isNationalAdmin && (

                    <div className="form-group">

                      <label>Enterprise Email (Gov Dashboard Override)</label>

                      <input 

                        type="email" 

                        className="gov-input"

                        value={editFormData.email}

                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}

                      />

                    </div>

                  )}

                  <div className="form-group">

                    <label>Role Assignment</label>

                    <select 

                      className="gov-select w-full"

                      value={editFormData.role_code}

                      onChange={(e) => setEditFormData({ ...editFormData, role_code: e.target.value })}

                    >

                      {isNationalAdmin && <option value="NATIONAL_GOVERNANCE">National Governance Admin</option>}

                      {myTier > 4 && <option value="ZONE_ADMIN">Zone Officer</option>}

                      {myTier > 3 && <option value="AREA_ADMIN">Area / Subsidiary Officer</option>}

                      {myTier > 2 && <option value="PLANT_USER">Plant Head</option>}

                      <option value="DAILY_OPERATOR">Daily Operator</option>

                    </select>

                  </div>

                </div>

                <div className="modal-footer">

                  <button type="button" className="gov-btn secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>

                  <button type="submit" className="gov-btn primary" disabled={editSubmitting}>

                    {editSubmitting ? 'Updating...' : 'Save Changes'}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}



      </div>



      {/* Credentials Modal */}

      {credentialsModalOpen && credentialsData && (

        <div className="modal-overlay" onClick={() => setCredentialsModalOpen(false)}>

          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>

            <div className="modal-header">

              <h2>Account Credentials Generated</h2>

              <button className="btn-ghost icon-only" onClick={() => setCredentialsModalOpen(false)}>

                ✕

              </button>

            </div>

            <div className="modal-body">

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-blue-800 text-sm">

                <strong>Attention:</strong> These credentials will only be shown once. Please copy the email template below or download the credentials document to securely provide access to the new officer.

              </div>



              <label>Email Template</label>

              <pre className="bg-gray-50 border border-gray-200 p-4 rounded text-sm mb-4" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>

                {credentialsData.email_template}

              </pre>

            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>

              <button type="button" className="gov-btn secondary" onClick={() => {

                if (!credentialsData.pdf_content) return;

                const printWindow = window.open('', '_blank');

                if (printWindow) {

                  printWindow.document.write(`

                    <html>

                      <head><title>MIRA System Credentials</title></head>

                      <body style="font-family: monospace; padding: 40px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">

                        <h2 style="font-family: sans-serif; border-bottom: 2px solid #000; padding-bottom: 10px;">MIRA SYSTEM - SECURE CREDENTIALS</h2>

                        ${credentialsData.pdf_content}

                      </body>

                    </html>

                  `);

                  printWindow.document.close();

                  printWindow.focus();

                  setTimeout(() => {

                    printWindow.print();

                    printWindow.close();

                  }, 500);

                }

              }}>

                Download Secure PDF

              </button>

              <button type="button" className="gov-btn primary" onClick={() => setCredentialsModalOpen(false)}>

                Done

              </button>

            </div>

          </div>

        </div>

      )}

    </AppShell>

  );

};

2����襼�8��"H