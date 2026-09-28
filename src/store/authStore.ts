import { create } from 'zustand';



export type UserRole = 'NATIONAL_GOVERNANCE' | 'CPSE_ADMIN' | 'AREA_ADMIN' | 'PLANT_USER' | 'DOMAIN_EXPERT' | 'PLATFORM_ADMIN' | 'GUEST' | 'TIER_4_CPSE_HQ' | 'TIER_3_AREA_MANAGER' | 'GOV_OVERSEER';



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

  avatarUrl?: string | null;

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

�import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'NATIONAL_GOVERNANCE' | 'CPSE_ADMIN' | 'AREA_ADMIN' | 'PLANT_USER' | 'DOMAIN_EXPERT' | 'PLATFORM_ADMIN' | 'GUEST' | 'TIER_4_CPSE_HQ' | 'TIER_3_AREA_MANAGER' | 'GOV_OVERSEER';

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
  avatarUrl?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true,
      token: 'demo-sovereign-token',
      user: {
        id: 'sovereign-user-bhel',
        username: 'admin.bhel@cpse.gov.in',
        fullName: 'BHEL Store Indenting Officer',
        email: 'admin.bhel@cpse.gov.in',
        roleCode: 'CPSE_ADMIN',
        cpseId: '2040',
        cpseName: 'Bharat Heavy Electricals Limited',
        cpseCode: 'BHEL',
        scope: 'Enterprise HQ',
        designation: 'Executive Director (Procurement)',
        avatarUrl: null,
      },

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
    }),
    {
      name: 'mira-auth-storage',
    }
  )
);

2�����ڢ�8�"B