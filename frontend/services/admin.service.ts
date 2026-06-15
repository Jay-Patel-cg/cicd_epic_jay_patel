import { api } from '../lib/api';
import { User, Knowledge } from '../types';

export const adminService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data.data.users || [];
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  blockUser: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/block`);
    return response.data.data;
  },

  unblockUser: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/unblock`);
    return response.data.data;
  },

  getReports: async (): Promise<any> => {
    const response = await api.get('/admin/reports');
    return response.data.data;
  },

  getLogs: async (): Promise<any[]> => {
    const response = await api.get('/admin/logs');
    return response.data.data.logs || [];
  },

  getSystemHealth: async (): Promise<any> => {
    const response = await api.get('/admin/system/health');
    return response.data.data;
  },

  restartSystem: async (): Promise<any> => {
    const response = await api.post('/admin/system/restart');
    return response.data.data;
  },

  clearCache: async (): Promise<any> => {
    const response = await api.delete('/admin/cache/clear');
    return response.data.data;
  },

  getSecurityEvents: async (): Promise<any[]> => {
    const response = await api.get('/admin/security/events');
    return response.data.data.events || [];
  },

  blockIp: async (ip: string): Promise<any> => {
    const response = await api.post('/admin/security/block-ip', { ip });
    return response.data.data;
  },

  getBackups: async (): Promise<any[]> => {
    const response = await api.get('/admin/backups');
    return response.data.data.backups || [];
  },

  createBackup: async (): Promise<any> => {
    const response = await api.post('/admin/backups/create');
    return response.data.data;
  },

  deleteBackup: async (id: string): Promise<void> => {
    await api.delete(`/admin/backups/${id}`);
  },

  // Admin Knowledge CRUD Operations
  createKnowledge: async (data: Omit<Knowledge, '_id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<Knowledge> => {
    const response = await api.post('/workflows', data);
    return response.data.data;
  },

  updateKnowledge: async (id: string, data: Partial<Knowledge>): Promise<Knowledge> => {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data.data;
  },

  patchKnowledgeContent: async (id: string, output: string): Promise<Knowledge> => {
    const response = await api.patch(`/workflows/${id}/content`, { output });
    return response.data.data;
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },

  archiveKnowledge: async (id: string): Promise<any> => {
    const response = await api.patch(`/workflows/${id}/archive`);
    return response.data.data;
  },

  restoreKnowledge: async (id: string): Promise<any> => {
    const response = await api.patch(`/workflows/${id}/restore`);
    return response.data.data;
  },

  cloneKnowledge: async (id: string): Promise<Knowledge> => {
    const response = await api.post(`/workflows/${id}/clone`);
    return response.data.data;
  },
};
