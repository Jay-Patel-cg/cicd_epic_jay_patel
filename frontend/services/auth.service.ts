import { api } from '../lib/api';
import { Session } from '../types';

export const authService = {
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get('/auth/sessions');
    return response.data.data.sessions || [];
  },

  removeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data.data.resetToken;
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },
};
