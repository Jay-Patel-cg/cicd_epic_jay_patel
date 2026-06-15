import { api } from '../lib/api';
import { Knowledge } from '../types';

export interface WorkflowRunResult {
  runId: string;
  workflowId: string;
  status: string;
  message: string;
  startedAt: string;
}

export interface WorkflowLogs {
  workflowId: string;
  logs: string[];
}

export interface WorkflowMetrics {
  workflowId: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    networkTraffic: number;
  };
}

export interface WorkflowVersion {
  version: string;
  author: string;
  createdAt: string;
}

export const knowledgeService = {
  getAllWorkflows: async (page = 1, limit = 20): Promise<{ records: Knowledge[]; pages: number }> => {
    const response = await api.get('/workflows', { params: { page, limit } });
    return {
      records: response.data.data.records,
      pages: response.data.data.pagination.pages,
    };
  },

  getWorkflowById: async (id: string): Promise<Knowledge> => {
    const response = await api.get(`/workflows/${id}`);
    return response.data.data;
  },

  getRandomWorkflow: async (): Promise<Knowledge | null> => {
    const response = await api.get('/workflows/random');
    return response.data.data;
  },

  getLatestWorkflows: async (): Promise<Knowledge[]> => {
    const response = await api.get('/workflows/latest');
    return response.data.data.records || [];
  },

  getTrendingWorkflows: async (): Promise<Knowledge[]> => {
    const response = await api.get('/workflows/trending');
    return response.data.data.records || [];
  },

  getRecommendedWorkflows: async (): Promise<Knowledge[]> => {
    const response = await api.get('/workflows/recommended');
    return response.data.data.records || [];
  },

  getPopularWorkflows: async (): Promise<Knowledge[]> => {
    const response = await api.get('/workflows/popular');
    return response.data.data.records || [];
  },

  getWorkflowHistory: async (id: string): Promise<any> => {
    const response = await api.get(`/workflows/history/${id}`);
    return response.data.data;
  },

  getWorkflowVersions: async (id: string): Promise<WorkflowVersion[]> => {
    const response = await api.get(`/workflows/${id}/versions`);
    return response.data.data.versions || [];
  },

  getWorkflowLogs: async (id: string): Promise<WorkflowLogs> => {
    const response = await api.get(`/workflows/${id}/logs`);
    return response.data.data;
  },

  getWorkflowMetrics: async (id: string): Promise<WorkflowMetrics> => {
    const response = await api.get(`/workflows/${id}/metrics`);
    return response.data.data;
  },

  triggerWorkflowRun: async (id: string): Promise<WorkflowRunResult> => {
    const response = await api.post(`/workflows/${id}/run`);
    return response.data.data;
  },

  cancelWorkflowRun: async (id: string): Promise<any> => {
    const response = await api.post(`/workflows/${id}/cancel`);
    return response.data.data;
  },

  toggleBookmark: async (id: string): Promise<{ isBookmarked: boolean }> => {
    const response = await api.post(`/workflows/${id}/bookmark`);
    return response.data.data;
  },

  getInfraCatalog: async (topic: string, page = 1, limit = 10): Promise<{ records: Knowledge[]; pages: number }> => {
    const response = await api.get(`/infra/${topic}`, { params: { page, limit } });
    return {
      records: response.data.data.records || [],
      pages: response.data.data.pagination?.pages || 1,
    };
  },
};
