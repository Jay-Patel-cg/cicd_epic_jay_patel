import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../services/comments.service';

export function useComments() {
  const queryClient = useQueryClient();

  // Query: retrieve comments list for a workflow
  const useCommentsQuery = (workflowId: string) => {
    return useQuery({
      queryKey: ['comments', workflowId],
      queryFn: () => commentsService.getComments(workflowId),
      enabled: !!workflowId,
      staleTime: 1 * 60 * 1000,
    });
  };

  // Mutation: create comment
  const useCreateCommentMutation = (workflowId: string) => {
    return useMutation({
      mutationFn: (comment: string) => commentsService.addComment(workflowId, comment),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      },
    });
  };

  // Mutation: update comment
  const useUpdateCommentMutation = (workflowId: string) => {
    return useMutation({
      mutationFn: ({ commentId, comment }: { commentId: string; comment: string }) =>
        commentsService.updateComment(commentId, comment),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      },
    });
  };

  // Mutation: delete comment
  const useDeleteCommentMutation = (workflowId: string) => {
    return useMutation({
      mutationFn: (commentId: string) => commentsService.deleteComment(commentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments', workflowId] });
      },
    });
  };

  return {
    useCommentsQuery,
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
  };
}
