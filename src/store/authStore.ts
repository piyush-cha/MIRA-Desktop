import { create } from 'zustand';

export type UserRole = 'NATIONAL_GOVERNANCE' | 'CPSE_ADMIN' | 'AREA_ADMIN' | 'PLANT_USER' | 'DOMAIN_EXPERT' | 'PLATFORM_ADMIN' | 'GUEST';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleCode: UserRole;
  cpseId?: string | null;
  cpseName?: string | null;
  cpseCode?: string | null;
  scope?: string | null;
  designation?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,

  login: (token, user) => set({
    isAuthenticated: true,
    token,
    user,
  }),

  logout: () => set({
    isAuthenticated: false,
    token: null,
    user: null,
  }),
}));
