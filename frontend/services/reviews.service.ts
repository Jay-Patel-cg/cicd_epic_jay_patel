import { api } from '../lib/api';
import { Review } from '../types';

export const reviewsService = {
  getReviews: async (workflowId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/${workflowId}`);
    return response.data.data.reviews || [];
  },

  addReview: async (workflowId: string, rating: number, review: string): Promise<Review> => {
    const response = await api.post(`/reviews/${workflowId}`, { rating, review });
    return response.data.data;
  },
};
