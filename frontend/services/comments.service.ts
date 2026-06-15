import { api } from '../lib/api';
import { Comment } from '../types';

export const commentsService = {
  getComments: async (workflowId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments/${workflowId}`);
    return response.data.data.comments || [];
  },

  addComment: async (workflowId: string, comment: string): Promise<Comment> => {
    const response = await api.post(`/comments/${workflowId}`, { comment });
    return response.data.data;
  },

  updateComment: async (commentId: string, comment: string): Promise<Comment> => {
    const response = await api.patch(`/comments/${commentId}`, { comment });
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
