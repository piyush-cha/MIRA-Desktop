`import axios from 'axios';

import { useAuthStore } from '../store/authStore';



// Read from .env (VITE_API_BASE_URL) — never hardcode secrets or URLs in source

export const API_BASE_URL =

  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';



export const apiClient = axios.create({

  baseURL: API_BASE_URL,

  headers: { 'Content-Type': 'application/json' },

  timeout: 60000,

});



// Attach JWT from auth store on every request

apiClient.interceptors.request.use((config) => {

  const token = useAuthStore.getState().token;

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});



// ===========================================================================

// Authentication

// ===========================================================================



export const api = {



  // ===========================================================================

  // National Governance Endpoints

  // All calls throw on error — the UI is responsible for empty/error states

  // ===========================================================================



  /** Section 1 — Items requiring national attention */

  getAttention: async () => {

    const response = await apiClient.get('/governance/attention');

    return response.data;

  },



  /** Section 2 — National snapshot metrics */

  getOverview: async () => {

    const response = await apiClient.get('/governance/overview');

    return response.data;

  },



  /** Section 3 — CPSE comparison table */

  getCpses: async () => {

    const response = await apiClient.get('/governance/cpses');

    return response.data;

  },





  getCnmcMaterials: async () => {

    const response = await apiClient.get('/governance/cnmc-materials');

    return response.data;

  },



  /** Section 4 — Harmonization trend */

  getHarmonizationTrend: async () => {

    const response = await apiClient.get('/governance/harmonization');

    return response.data;

  },



  /** Section 5 — CNMC mapping status breakdown */

  getCnmcStatus: async () => {

    const response = await apiClient.get('/governance/cnmc');

    return response.data;

  },



  /** Section 6 — Expert review queue */

  getExpertReviews: async () => {

    const response = await apiClient.get('/governance/expert-reviews');

    return response.data;

  },



  /** Section 7 — Data quality issues */

  getDataQuality: async () => {

    const response = await apiClient.get('/governance/data-quality');

    return response.data;

  },



  /** Section 8 — Cross-CPSE intelligence opportunities */

  getOpportunities: async () => {

    const response = await apiClient.get('/governance/opportunities');

    return response.data;

  },



  /** Section 9 — National activity timeline */

  getActivity: async () => {

    const response = await apiClient.get('/governance/activity');

    return response.data;

  },



  /** Global search */

  searchMaster: async (query: string) => {

    const response = await apiClient.get(`/governance/search?q=${encodeURIComponent(query)}`);

    return response.data;

  },



  /** Get Notifications / Attention items */

  getNotifications: async () => {

    const response = await apiClient.get('/governance/attention');

    return response.data;

  },



  /** Onboard a new CPSE — POST to backend only */

  onboardCpse: async (payload: {

    cpse_name: string;

    cpse_code: string;

    ministry: string;

    schedule: string;

    admin_name: string;

    admin_email: string;

    license_tier: string;

  }) => {

    const response = await apiClient.post('/governance/cpses', payload);

    return response.data;

  },



  /** CPSE organizational hierarchy */

  getHierarchy: async (cpseCode: string) => {

    const response = await apiClient.get(`/governance/hierarchy/${cpseCode}`);

    return response.data;

  },



  /** Role assignments for a CPSE */

  getRoleAssignments: async (cpseCode: string) => {

    const response = await apiClient.get(`/governance/roles/${cpseCode}`);

    return response.data;

  },



  /** Assign a role within a CPSE hierarchy */

  assignRole: async (payload: {

    cpse_code: string;

    user_name: string;

    email: string;

    role_title: string;

    hierarchy_level: string;

    assigned_node_code: string;

    assigned_node_name: string;

    permissions: string[];

  }) => {

    const response = await apiClient.post('/governance/roles/assign', payload);

    return response.data;

  },



  /** Action on Expert Review item */

  expertReviewAction: async (reviewId: string, payload: {

    action: 'APPROVE' | 'REJECT' | 'REASSIGN';

    expert_name?: string;

    assigned_expert?: string;

    notes?: string;

  }) => {

    const response = await apiClient.post(`/governance/expert-reviews/${reviewId}/action`, payload);

    return response.data;

  },



  /** Resolve Data Quality Issue */

  resolveDataQuality: async (issueId: string, payload: {

    action: 'RESOLVE' | 'DISMISS';

    resolution_notes?: string;

    resolved_by?: string;

  }) => {

    const response = await apiClient.post(`/governance/data-quality/${issueId}/resolve`, payload);

    return response.data;

  },



  /** Users & Roles */

  getUsers: async () => {

    const response = await apiClient.get('/governance/users');

    return response.data;

  },



  createUser: async (payload: {

    username: string;

    email: string;

    full_name: string;

    role_code: string;

    scope_type: string;

    cpse_id?: string;

  }) => {

    const response = await apiClient.post('/governance/users', payload);

    return response.data;

  },



  /** Profile */

  getProfile: async (username?: string) => {

    const response = await apiClient.get('/governance/profile', { params: { username } });

    return response.data;

  },



  sendSecureEmail: async (payload: { recipient_email: string; recipient_name: string; email_subject: string; email_body: string; pdf_content: string }) => {

    const response = await apiClient.post('/governance/secure-email', payload);

    return response.data;

  },



  // ===========================================================================

  // Cross-CPSE Intelligence & Node Graph Visualizer

  // ===========================================================================

  getCrossCpseGraph: async (categoryFilter?: string, cpseFilter?: string) => {

    const response = await apiClient.get('/intelligence/graph', {

      params: { category_filter: categoryFilter, cpse_filter: cpseFilter }

    });

    return response.data;

  },



  getLegacyCodes: async (query?: string, cpseCode?: string, status?: string) => {

    const response = await apiClient.get('/intelligence/legacy-codes', {

      params: { query, cpse_code: cpseCode, status }

    });

    return response.data;

  },



  remapNode: async (payload: {

    material_id: string;

    target_cnmc_code: string;

    expert_comment?: string;

    expert_name?: string;

  }) => {

    const response = await apiClient.post('/intelligence/remap', payload);

    return response.data;

  },



  getPriceParity: async (cnmcCode?: string) => {

    const response = await apiClient.get('/intelligence/price-parity', {

      params: { cnmc_code: cnmcCode }

    });

    return response.data;

  },



  // ===========================================================================

  // System Policies & Sovereign Compliance

  // ===========================================================================

  getPolicies: async (category?: string) => {

    const response = await apiClient.get('/policies', { params: { category } });

    return response.data;

  },



  updatePolicy: async (policyKey: string, payload: { policy_value: string; updated_by?: string }) => {

    const response = await apiClient.put(`/policies/${policyKey}`, payload);

    return response.data;

  },



  getComplianceScorecard: async () => {

    const response = await apiClient.get('/policies/compliance');

    return response.data;

  },



  // ===========================================================================

  // SAP Material Management Gateway & MIRA Copilot (MCP)

  // ===========================================================================

  getSapConfigs: async () => {

    const response = await apiClient.get('/sap/configs');

    return response.data;

  },



  testSapConnection: async (cpseCode: string) => {

    const response = await apiClient.post(`/sap/test-connection/${cpseCode}`);

    return response.data;

  },



  getSapPRs: async (cpseCode?: string, statusFilter?: string) => {

    const response = await apiClient.get('/sap/pr', {

      params: { cpse_code: cpseCode, status_filter: statusFilter }

    });

    return response.data;

  },



  createSapPR: async (payload: {

    cpse_code: string;

    plant_code: string;

    cnmc_code?: string;

    legacy_code?: string;

    material_description: string;

    quantity: number;

    uom: string;

    cost_center: string;

    estimated_cost_inr?: number;

    requested_by?: string;

  }) => {

    const response = await apiClient.post('/sap/pr/create', payload);

    return response.data;

  },



  getSapPOs: async (cpseCode?: string) => {

    const response = await apiClient.get('/sap/po', { params: { cpse_code: cpseCode } });

    return response.data;

  },



  getSapInventory: async (cpseCode?: string, queryText?: string) => {

    const response = await apiClient.get('/sap/inventory', {

      params: { cpse_code: cpseCode, query_text: queryText }

    });

    return response.data;

  },



  miraCopilotChat: async (payload: {

    message: string;

    language?: string;

    conversation_history?: any[];

    active_cpse?: string;

    file_attachment?: any;

  }) => {

    const response = await apiClient.post('/sap/mcp/chat', payload);

    return response.data;

  },



  // ===========================================================================

  // CPSE Enterprise Admin & Inter-Plant Collaboration

  // ===========================================================================

  getCpseAdminOverview: async (cpseName: string, cpseCode: string) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/overview/${cpseCode}`);

    return response.data;

  },



  getInterPlantCollaborationGraph: async (cpseName: string) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/collaboration/graph`);

    return response.data;

  },



  triggerInterPlantTransfer: async (cpseName: string, payload: {

    source_plant: string;

    target_plant: string;

    material_code: string;

    quantity: number;

    uom: string;

    urgency: string;

  }) => {

    const response = await apiClient.post(`/${cpseName.toLowerCase()}/collaboration/transfer`, payload);

    return response.data;

  },



  getCpseAdminCatalog: async (cpseName: string, cpseCode: string, search?: string) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/catalog/${cpseCode}`, { params: { search } });

    return response.data;

  },



  createHierarchyNode: async (cpseName: string, payload: {

    cpse_code: string;

    parent_node_code: string;

    unit_name: string;

    unit_code: string;

    type_code: string;

    location: string;

  }) => {

    const response = await apiClient.post(`/${cpseName.toLowerCase()}/nodes/create`, payload);

    return response.data;

  },

};



// ===========================================================================

// API error helper — extracts a readable message from AxiosError

// ===========================================================================

export function getApiErrorMessage(err: any): string {

  if (err && typeof err === 'object') {

    if (err.response) {

      const detail = err.response.data?.detail;

      if (typeof detail === 'string') return detail;

      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join('; ');

      if (err.response.status) return `Server error: ${err.response.status}`;

    }

    if (typeof err.message === 'string' && err.message) return err.message;

  }

  return 'An unexpected error occurred.';

}







ۙimport axios from 'axios';

import { useAuthStore } from '../store/authStore';



// Read from .env (VITE_API_BASE_URL) — never hardcode secrets or URLs in source

export const API_BASE_URL =

  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';



export const apiClient = axios.create({

  baseURL: API_BASE_URL,

  headers: { 'Content-Type': 'application/json' },

  timeout: 60000,

});



// Attach JWT from auth store on every request

apiClient.interceptors.request.use((config) => {

  const token = useAuthStore.getState().token;

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

  }

  return config;

});



// ===========================================================================

// Authentication

// ===========================================================================



export const api = {



  // ===========================================================================

  // National Governance Endpoints

  // All calls throw on error — the UI is responsible for empty/error states

  // ===========================================================================



  /** Section 1 — Items requiring national attention */

  getAttention: async () => {

    const response = await apiClient.get('/governance/attention');

    return response.data;

  },



  /** Section 2 — National snapshot metrics */

  getOverview: async () => {

    const response = await apiClient.get('/governance/overview');

    return response.data;

  },



  /** Section 3 — CPSE comparison table */

  getCpses: async () => {

    const response = await apiClient.get('/governance/cpses');

    return response.data;

  },





  getCnmcMaterials: async () => {

    const response = await apiClient.get('/governance/cnmc-materials');

    return response.data;

  },



  /** MIRA Sovereign National Unified Material Master Catalog */

  getUnifiedCatalog: async (params?: {

    search?: string;

    category?: string;

    criticality?: string;

    status?: string;

  }) => {

    const query = new URLSearchParams();

    if (params?.search) query.append('search', params.search);

    if (params?.category) query.append('category', params.category);

    if (params?.criticality) query.append('criticality', params.criticality);

    if (params?.status) query.append('status', params.status);

    const qs = query.toString();

    const response = await apiClient.get(`/governance/unified-catalog${qs ? `?${qs}` : ''}`);

    return response.data;

  },



  /** Create/Mint a new MIRA Unified National Standard Code */

  createUnifiedCode: async (payload: {

    extracted_noun: string;

    core_physics: string;

    variant?: string;

    raw_material_composition?: string;

    domain_code: string;

    category_code: string;

    criticality: string;

    technical_attributes?: Record<string, any>;

    human_code?: string;

    approval_reason?: string;

    created_by?: string;

  }) => {

    const response = await apiClient.post('/governance/unified-catalog', payload);

    return response.data;

  },



  /** Suggest authoritative 7-digit MIRA Standard Code (sequential or random) */

  suggestUnifiedCode: async (params?: { mode?: 'sequential' | 'random'; category?: string }) => {

    const query = new URLSearchParams();

    if (params?.mode) query.append('mode', params.mode);

    if (params?.category) query.append('category', params.category);

    const qs = query.toString();

    const response = await apiClient.get(`/governance/suggest-code${qs ? `?${qs}` : ''}`);

    return response.data;

  },



  /** 7-Tier Material Governance Request Tickets (Tier 1 to Tier 7) */

  getTierTickets: async (params?: {

    tier?: number;

    status?: string;

    cpse?: string;

    search?: string;

  }) => {

    const query = new URLSearchParams();

    if (params?.tier !== undefined) query.append('tier', params.tier.toString());

    if (params?.status) query.append('status', params.status);

    if (params?.cpse) query.append('cpse', params.cpse);

    if (params?.search) query.append('search', params.search);

    const qs = query.toString();

    const response = await apiClient.get(`/governance/tier-tickets${qs ? `?${qs}` : ''}`);

    return response.data;

  },



  /** Tier 1: Submit new requisition request ticket */

  createTierTicket: async (payload: {

    cpse_name: string;

    plant_name: string;

    item_name: string;

    legacy_code: string;

    raw_description: string;

    specification?: string;

    priority?: string;

    domain_code?: string;

    category_code?: string;

    initial_reason?: string;

    created_by: string;

  }) => {

    const response = await apiClient.post('/governance/tier-tickets/create', payload);

    return response.data;

  },



  /** Confirm & escalate ticket across Tiers 1-7, reject, or send back with reason */

  confirmTierTicket: async (

    ticketId: string,

    payload: {

      officer_name: string;

      officer_role: string;

      action: 'APPROVE' | 'REJECT' | 'SEND_BACK';

      confirmation_reason: string;

    }

  ) => {

    const response = await apiClient.post(`/governance/tier-tickets/${ticketId}/confirm`, payload);

    return response.data;

  },



  /** Tier 1: Update material details if returned / sent back */

  updateTierTicket: async (

    ticketId: string,

    payload: {

      item_name?: string;

      legacy_code?: string;

      raw_description?: string;

      specification?: string;

      priority?: string;

      domain_code?: string;

      category_code?: string;

    }

  ) => {

    const response = await apiClient.post(`/governance/tier-tickets/${ticketId}/update`, payload);

    return response.data;

  },



  /** Section 4 — Harmonization trend */

  getHarmonizationTrend: async () => {

    const response = await apiClient.get('/governance/harmonization');

    return response.data;

  },



  /** Section 5 — CNMC mapping status breakdown */

  getCnmcStatus: async () => {

    const response = await apiClient.get('/governance/cnmc');

    return response.data;

  },



  /** Section 6 — Expert review queue (isolated per CPSE) */

  getExpertReviews: async (cpseCode?: string) => {

    const url = cpseCode ? `/governance/expert-reviews?cpse_code=${encodeURIComponent(cpseCode)}` : '/governance/expert-reviews';

    const response = await apiClient.get(url);

    return response.data;

  },



  /** Section 7 — Data quality issues */

  getDataQuality: async () => {

    const response = await apiClient.get('/governance/data-quality');

    return response.data;

  },



  /** Section 8 — Cross-CPSE intelligence opportunities */

  getOpportunities: async () => {

    const response = await apiClient.get('/governance/opportunities');

    return response.data;

  },



  /** Section 9 — National activity timeline */

  getActivity: async (cpseCode?: string) => {

    const url = cpseCode ? `/governance/activity?cpse_code=${cpseCode}` : '/governance/activity';

    const response = await apiClient.get(url);

    return response.data;

  },



  logActivity: async (payload: { action: string; target: string; details: string; actor?: string }) => {

    const response = await apiClient.post('/governance/activity/log', payload);

    return response.data;

  },



  /** Global search across MIRA National Master with CPSE local code enrichment */

  searchMaster: async (query: string, cpseCode?: string) => {

    const qs = new URLSearchParams();

    qs.append('q', query);

    if (cpseCode) qs.append('cpse', cpseCode);

    const response = await apiClient.get(`/governance/search-master?${qs.toString()}`);

    return response.data;

  },



  /** Get Notifications / Attention items */

  getNotifications: async () => {

    const response = await apiClient.get('/governance/notifications');

    return response.data;

  },



  /** Onboard a new CPSE — POST to backend only */

  onboardCpse: async (payload: {

    cpse_name: string;

    cpse_code: string;

    ministry: string;

    schedule: string;

    admin_name: string;

    admin_email: string;

    license_tier: string;

  }) => {

    const response = await apiClient.post('/governance/cpses', payload);

    return response.data;

  },



  /** CPSE organizational hierarchy */

  getHierarchy: async (cpseCode: string) => {

    const response = await apiClient.get(`/governance/hierarchy/${cpseCode}`);

    return response.data;

  },



  /** Role assignments for a CPSE */

  getRoleAssignments: async (cpseCode: string) => {

    const response = await apiClient.get(`/governance/roles/${cpseCode}`);

    return response.data;

  },







  /** Assign a role within a CPSE hierarchy */

  assignRole: async (payload: {

    cpse_code: string;

    user_name: string;

    email: string;

    role_title: string;

    hierarchy_level: string;

    assigned_node_code: string;

    assigned_node_name: string;

    permissions: string[];

  }) => {

    const response = await apiClient.post('/governance/roles/assign', payload);

    return response.data;

  },



  /** Action on Expert Review item */

  expertReviewAction: async (reviewId: string, payload: {

    action: 'APPROVE' | 'REJECT' | 'REASSIGN';

    expert_name?: string;

    assigned_expert?: string;

    notes?: string;

  }) => {

    const response = await apiClient.post(`/governance/expert-reviews/${reviewId}/action`, payload);

    return response.data;

  },



  /** Resolve Data Quality Issue */

  resolveDataQuality: async (issueId: string, payload: {

    action: 'RESOLVE' | 'DISMISS';

    resolution_notes?: string;

    resolved_by?: string;

  }) => {

    const response = await apiClient.post(`/governance/data-quality/${issueId}/resolve`, payload);

    return response.data;

  },





  /** Users & Roles */

  getUsers: async (cpseCode?: string) => {

    const url = cpseCode ? `/governance/users?cpse_code=${cpseCode}` : '/governance/users';

    const response = await apiClient.get(url);

    return response.data;

  },



  createUser: async (payload: {

    username: string;

    email: string;

    full_name: string;

    role_code: string;

    scope_type: string;

    cpse_id?: string;

  }) => {

    const response = await apiClient.post('/governance/users', payload);

    return response.data;

  },



  updateUser: async (userId: string, payload: { full_name?: string; role_code?: string; email?: string }) => {

    const response = await apiClient.put(`/governance/users/${userId}`, payload);

    return response.data;

  },



  deleteUser: async (userId: string) => {

    const response = await apiClient.delete(`/governance/users/${userId}`);

    return response.data;

  },



  /** Profile */

  getProfile: async (username?: string) => {

    const response = await apiClient.get('/governance/profile', { params: { username } });

    return response.data;

  },



  sendSecureEmail: async (payload: { recipient_email: string; recipient_name: string; email_subject: string; email_body: string; pdf_content: string; pdf_password?: string; }) => {

    const response = await apiClient.post('/governance/secure-email', payload);

    return response.data;

  },



  // ===========================================================================

  // Cross-CPSE Intelligence & Node Graph Visualizer

  // ===========================================================================

  getCrossCpseGraph: async (categoryFilter?: string, cpseFilter?: string) => {

    const response = await apiClient.get('/intelligence/graph', {

      params: { category_filter: categoryFilter, cpse_filter: cpseFilter }

    });

    return response.data;

  },



  getLegacyCodes: async (query?: string, cpseCode?: string, status?: string) => {

    const response = await apiClient.get('/intelligence/legacy-codes', {

      params: { query, cpse_code: cpseCode, status }

    });

    return response.data;

  },



  remapNode: async (payload: {

    material_id: string;

    target_cnmc_code: string;

    expert_comment?: string;

    expert_name?: string;

  }) => {

    const response = await apiClient.post('/intelligence/remap', payload);

    return response.data;

  },



  getPriceParity: async (cnmcCode?: string) => {

    const response = await apiClient.get('/intelligence/price-parity', {

      params: { cnmc_code: cnmcCode }

    });

    return response.data;

  },



  getDemandPooling: async () => {

    const response = await apiClient.get('/intelligence/demand-pooling');

    return response.data;

  },







  // ===========================================================================

  // System Policies & Sovereign Compliance

  // ===========================================================================

  getPolicies: async (category?: string) => {

    const response = await apiClient.get('/policies', { params: { category } });

    return response.data;

  },



  updatePolicy: async (policyKey: string, payload: { policy_value: string; updated_by?: string }) => {

    const response = await apiClient.put(`/policies/${policyKey}`, payload);

    return response.data;

  },



  getComplianceScorecard: async (cpseCode?: string) => {

    const response = await apiClient.get('/policies/compliance', { params: { cpse_code: cpseCode } });

    return response.data;

  },



  // ===========================================================================

  // SAP Material Management Gateway & MIRA Copilot (MCP)

  // ===========================================================================

  getSapConfigs: async () => {

    const response = await apiClient.get('/sap/configs');

    return response.data;

  },



  testSapConnection: async (cpseCode: string) => {

    const response = await apiClient.post(`/sap/test-connection/${cpseCode}`);

    return response.data;

  },



  getSapPRs: async (cpseCode?: string, statusFilter?: string) => {

    const response = await apiClient.get('/sap/pr', {

      params: { cpse_code: cpseCode, status_filter: statusFilter }

    });

    return response.data;

  },



  createSapPR: async (payload: {

    cpse_code: string;

    plant_code: string;

    cnmc_code?: string;

    legacy_code?: string;

    material_description: string;

    quantity: number;

    uom: string;

    cost_center: string;

    estimated_cost_inr?: number;

    requested_by?: string;

  }) => {

    const response = await apiClient.post('/sap/pr/create', payload);

    return response.data;

  },



  getSapPOs: async (cpseCode?: string) => {

    const response = await apiClient.get('/sap/po', { params: { cpse_code: cpseCode } });

    return response.data;

  },



  getSapInventory: async (cpseCode?: string, queryText?: string) => {

    const response = await apiClient.get('/sap/inventory', {

      params: { cpse_code: cpseCode, query_text: queryText }

    });

    return response.data;

  },



  miraCopilotChat: async (payload: {

    message: string;

    language?: string;

    conversation_history?: any[];

    active_cpse?: string;

    file_attachment?: any;

  }) => {

    const response = await apiClient.post('/sap/mcp/chat', payload);

    return response.data;

  },



  // ===========================================================================

  // CPSE Enterprise Admin & Inter-Plant Collaboration

  // ===========================================================================

  getCpseAdminOverview: async (cpseName: string, cpseCode: string) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/overview/${cpseCode}`);

    return response.data;

  },



  getInterPlantCollaborationGraph: async (cpseName: string) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/collaboration/graph`);

    return response.data;

  },



  triggerInterPlantTransfer: async (cpseName: string, payload: {

    source_plant: string;

    target_plant: string;

    material_code: string;

    material_description?: string;

    quantity: number;

    uom: string;

    urgency: string;

  }) => {

    const response = await apiClient.post(`/${cpseName.toLowerCase()}/collaboration/transfer`, payload);

    return response.data;

  },



  getCpseAdminCatalog: async (cpseName: string, cpseCode: string, search?: string, page: number = 1, pageSize: number = 50) => {

    const response = await apiClient.get(`/${cpseName.toLowerCase()}/catalog/${cpseCode}`, { 

      params: { search, page, page_size: pageSize } 

    });

    return response.data;

  },



  createHierarchyNode: async (cpseName: string, payload: {

    cpse_code: string;

    parent_node_code: string;

    unit_name: string;

    unit_code: string;

    type_code: string;

    location: string;

  }) => {

    const response = await apiClient.post(`/${cpseName.toLowerCase()}/nodes/create`, payload);

    return response.data;

  },

  harmonizeMaterial: async (cpseName: string, payload: {

    material_id: string;

    action: 'MERGE' | 'DISTINCT' | 'NOMINATE';

    target_code?: string;

    remarks?: string;

  }) => {

    const response = await apiClient.post(`/${cpseName.toLowerCase()}/catalog/harmonize`, payload);

    return response.data;

  },



  /** Testing Laya AI pipeline */

  bulkUpload: async (file: File, cpseId: string) => {

    const formData = new FormData();

    formData.append('file', file);

    const response = await apiClient.post('/materials/bulk-upload', formData, {

      params: { cpse_id: cpseId },

      headers: { 'Content-Type': undefined },

      timeout: 180000, // 3 minutes timeout for bulk uploads

    });

    return response.data;

  },



  getUploadStatus: async (trackingId: string) => {

    const response = await apiClient.get(`/materials/upload-status/${trackingId}`);

    return response.data;

  },



  getMasterNominations: async (status: string = 'PENDING_APPROVAL', search?: string) => {

    const params: any = { status_filter: status };

    if (search) params.search = search;

    const response = await apiClient.get('/governance/master-nominations', { params });

    return response.data;

  },



  getMasterNominationsCount: async () => {

    const response = await apiClient.get('/governance/master-nominations/count');

    return response.data;

  },



  approveMasterNomination: async (nominationId: string, payload?: { officer_name?: string; remarks?: string }) => {

    const response = await apiClient.post(`/governance/master-nominations/${nominationId}/approve`, payload || {});

    return response.data;

  },



  rejectMasterNomination: async (nominationId: string, payload?: { officer_name?: string; rejection_reason?: string }) => {

    const response = await apiClient.post(`/governance/master-nominations/${nominationId}/reject`, payload || {});

    return response.data;

  },

};



// ===========================================================================

// API error helper — extracts a readable message from AxiosError

// ===========================================================================

export function getApiErrorMessage(err: any): string {

  if (err && typeof err === 'object') {

    if (err.response) {

      const detail = err.response.data?.detail;

      if (typeof detail === 'string') return detail;

      if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join('; ');

      if (err.response.status) return `Server error: ${err.response.status}`;

    }

    if (typeof err.message === 'string' && err.message) return err.message;

  }

  return 'An unexpected error occurred.';

}







2�������8��"=