import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Read from .env (VITE_API_BASE_URL) — never hardcode secrets or URLs in source
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
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
  login: async (username: string, password: string, cpseCode?: string) => {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
      auth_provider: 'MIRA_NATIVE',
      cpse_code: cpseCode || undefined,
    });
    return response.data;
  },

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



