import { create } from 'zustand';
import { User, Business } from '../types';
import { api } from '../utils/api';

interface AuthState {
  user: User | null;
  businesses: Business[];
  currentBusiness: Business | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User, businesses: Business[]) => void;
  logout: () => void;
  setCurrentBusiness: (business: Business) => void;
  updateBusinessState: (updated: Partial<Business>) => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  businesses: [],
  currentBusiness: null,
  token: localStorage.getItem('bwqr_auth_token'),
  isLoading: true,
  isAuthenticated: false,

  login: (token, user, businesses) => {
    localStorage.setItem('bwqr_auth_token', token);
    const active = businesses.length > 0 ? businesses[0] : null;
    set({
      token,
      user,
      businesses,
      currentBusiness: active,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('bwqr_auth_token');
    set({
      token: null,
      user: null,
      businesses: [],
      currentBusiness: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setCurrentBusiness: (business) => {
    set({ currentBusiness: business });
  },

  updateBusinessState: (updated) => {
    const current = get().currentBusiness;
    if (!current) return;
    const nextBusiness = { ...current, ...updated };
    set({
      currentBusiness: nextBusiness,
      businesses: get().businesses.map((b) => (b.id === current.id ? nextBusiness : b)),
    });
  },

  init: async () => {
    const token = localStorage.getItem('bwqr_auth_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const data = await api.get<{ user: User; businesses: Business[] }>('/auth/me');
      const active = data.businesses.length > 0 ? data.businesses[0] : null;
      set({
        user: data.user,
        businesses: data.businesses,
        currentBusiness: active,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      localStorage.removeItem('bwqr_auth_token');
      set({
        token: null,
        user: null,
        businesses: [],
        currentBusiness: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
