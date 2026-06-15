import { create } from 'zustand';
import { User, Session } from '../types';
import { api } from '../lib/api';

interface AuthState {
  token: string | null;
  userId: string | null;
  sessionId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enable2FA: () => Promise<{ secret: string; qrCodeMock: string }>;
  disable2FA: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  sessionId: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const sessionId = localStorage.getItem('sessionId');
      const userStr = localStorage.getItem('user');
      
      if (token && userId) {
        set({
          token,
          userId,
          sessionId,
          user: userStr ? JSON.parse(userStr) : null,
          isAuthenticated: true,
        });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, _id: userId, sessionId, name, role } = response.data.data;
      
      const userObj: User = {
        _id: userId,
        name,
        email,
        role,
        emailVerified: true, // Defaulting or fetching later
        twoFactorEnabled: false,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        if (sessionId) localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        // Write cookies for middleware checks
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Strict`;
      }

      set({
        token,
        userId,
        sessionId,
        user: userObj,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, _id: userId, role } = response.data.data;

      const userObj: User = {
        _id: userId,
        name,
        email,
        role,
        emailVerified: false,
        twoFactorEnabled: false,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('user', JSON.stringify(userObj));
        
        // Write cookies for middleware checks
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Strict`;
      }

      set({
        token,
        userId,
        user: userObj,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    const { sessionId } = get();
    try {
      // Backend requires sessionId in req.body
      if (sessionId) {
        await api.post('/auth/logout', { sessionId });
      }
    } catch (err) {
      console.error('API logout error', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        
        // Clear cookies
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      set({
        token: null,
        userId: null,
        sessionId: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/profile');
      const profile = response.data.data;
      
      set({
        user: profile,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(profile));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch profile';
      set({ error: errMsg, isLoading: false });
    }
  },

  updateProfile: async (name, email) => {
    set({ isLoading: true });
    try {
      const response = await api.patch('/auth/profile', { name, email });
      const updated = response.data.data;
      set((state) => ({
        user: state.user ? { ...state.user, ...updated } : null,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Failed to update profile');
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/auth/profile');
      get().logout();
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Failed to delete account');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      throw new Error(err.response?.data?.message || 'Failed to change password');
    }
  },

  enable2FA: async () => {
    try {
      const response = await api.post('/auth/2fa/enable');
      set((state) => ({
        user: state.user ? { ...state.user, twoFactorEnabled: true } : null,
      }));
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to enable 2FA');
    }
  },

  disable2FA: async () => {
    try {
      await api.post('/auth/2fa/disable');
      set((state) => ({
        user: state.user ? { ...state.user, twoFactorEnabled: false } : null,
      }));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to disable 2FA');
    }
  },
}));
