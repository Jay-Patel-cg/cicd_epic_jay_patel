import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '../services/knowledge.service';
import { Knowledge } from '../types';

export function useKnowledge() {
  const queryClient = useQueryClient();

  // Query: get all workflows paginated
  const useWorkflowsQuery = (page = 1, limit = 20) => {
    return useQuery({
      queryKey: ['workflows', page, limit],
      queryFn: () => knowledgeService.getAllWorkflows(page, limit),
      staleTime: 2 * 60 * 1000,
    });
  };

  // Query: get single workflow details
  const useWorkflowDetailsQuery = (id: string) => {
    return useQuery({
      queryKey: ['workflow', id],
      queryFn: () => knowledgeService.getWorkflowById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get latest workflows
  const useLatestWorkflowsQuery = () => {
    return useQuery({
      queryKey: ['latestWorkflows'],
      queryFn: knowledgeService.getLatestWorkflows,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get trending workflows
  const useTrendingWorkflowsQuery = () => {
    return useQuery({
      queryKey: ['trendingWorkflows'],
      queryFn: knowledgeService.getTrendingWorkflows,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get random workflow
  const useRandomWorkflowQuery = () => {
    return useQuery({
      queryKey: ['randomWorkflow'],
      queryFn: knowledgeService.getRandomWorkflow,
      staleTime: 1 * 60 * 1000,
    });
  };

  // Query: get recommended workflows
  const useRecommendedWorkflowsQuery = () => {
    return useQuery({
      queryKey: ['recommendedWorkflows'],
      queryFn: knowledgeService.getRecommendedWorkflows,
      staleTime: 10 * 60 * 1000,
    });
  };

  // Query: get popular workflows
  const usePopularWorkflowsQuery = () => {
    return useQuery({
      queryKey: ['popularWorkflows'],
      queryFn: knowledgeService.getPopularWorkflows,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get infra catalog for topic
  const useInfraCatalogQuery = (topic: string, page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['infraCatalog', topic, page, limit],
      queryFn: () => knowledgeService.getInfraCatalog(topic, page, limit),
      enabled: !!topic,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get workflow versions
  const useWorkflowVersionsQuery = (id: string) => {
    return useQuery({
      queryKey: ['workflowVersions', id],
      queryFn: () => knowledgeService.getWorkflowVersions(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: get workflow logs
  const useWorkflowLogsQuery = (id: string) => {
    return useQuery({
      queryKey: ['workflowLogs', id],
      queryFn: () => knowledgeService.getWorkflowLogs(id),
      enabled: !!id,
      staleTime: 10 * 1000, // short cache for logs
    });
  };

  // Query: get workflow metrics
  const useWorkflowMetricsQuery = (id: string) => {
    return useQuery({
      queryKey: ['workflowMetrics', id],
      queryFn: () => knowledgeService.getWorkflowMetrics(id),
      enabled: !!id,
      staleTime: 10 * 1000, // short cache for metrics
    });
  };

  // Mutation: toggle bookmark
  const useToggleBookmarkMutation = (id?: string) => {
    return useMutation({
      mutationFn: (targetId?: string) => knowledgeService.toggleBookmark(targetId || id || ''),
      onSuccess: (data, variables) => {
        const activeId = variables || id;
        if (activeId) {
          queryClient.invalidateQueries({ queryKey: ['workflow', activeId] });
        }
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userProfileWithBookmarks'] });
      },
    });
  };

  // Mutation: trigger workflow run
  const useTriggerRunMutation = (id: string) => {
    return useMutation({
      mutationFn: () => knowledgeService.triggerWorkflowRun(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflowLogs', id] });
        queryClient.invalidateQueries({ queryKey: ['workflowMetrics', id] });
      },
    });
  };

  // Mutation: cancel workflow run
  const useCancelRunMutation = (id: string) => {
    return useMutation({
      mutationFn: () => knowledgeService.cancelWorkflowRun(id),
    });
  };

  return {
    useWorkflowsQuery,
    useWorkflowDetailsQuery,
    useLatestWorkflowsQuery,
    useTrendingWorkflowsQuery,
    useRandomWorkflowQuery,
    useRecommendedWorkflowsQuery,
    usePopularWorkflowsQuery,
    useInfraCatalogQuery,
    useWorkflowVersionsQuery,
    useWorkflowLogsQuery,
    useWorkflowMetricsQuery,
    useToggleBookmarkMutation,
    useTriggerRunMutation,
    useCancelRunMutation,
  };
}
