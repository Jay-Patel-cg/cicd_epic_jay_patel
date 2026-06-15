import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';

export function useNotifications() {
  const queryClient = useQueryClient();

  // Query: retrieve notifications inbox list
  const useNotificationsQuery = () => {
    return useQuery({
      queryKey: ['notificationsList'],
      queryFn: notificationsService.getNotifications,
      staleTime: 30 * 1000, // half-minute cache
    });
  };

  // Mutation: mark notification as read
  const useMarkReadMutation = () => {
    return useMutation({
      mutationFn: notificationsService.markAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      },
    });
  };

  // Mutation: delete notification
  const useDeleteNotificationMutation = () => {
    return useMutation({
      mutationFn: notificationsService.deleteNotification,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      },
    });
  };

  return {
    useNotificationsQuery,
    useMarkReadMutation,
    useDeleteNotificationMutation,
  };
}
