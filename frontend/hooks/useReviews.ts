import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';

export function useReviews() {
  const queryClient = useQueryClient();

  // Query: retrieve reviews list for a workflow
  const useReviewsQuery = (workflowId: string) => {
    return useQuery({
      queryKey: ['reviews', workflowId],
      queryFn: () => reviewsService.getReviews(workflowId),
      enabled: !!workflowId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Mutation: create rating/review
  const useCreateReviewMutation = (workflowId: string) => {
    return useMutation({
      mutationFn: ({ rating, review }: { rating: number; review: string }) =>
        reviewsService.addReview(workflowId, rating, review),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', workflowId] });
      },
    });
  };

  return {
    useReviewsQuery,
    useCreateReviewMutation,
  };
}
