import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
};

// ===========================================================================
// API error helper — extracts a readable message from AxiosError
// ===========================================================================
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response) return 'Cannot connect to the MIRA backend. Ensure the server is running.';
    const detail = err.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join('; ');
    return `Server error: ${err.response.status}`;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
