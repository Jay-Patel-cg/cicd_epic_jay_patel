import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { User, Knowledge } from '../types';

export function useAdmin() {
  const queryClient = useQueryClient();

  // Queries
  const useAdminUsersQuery = () => {
    return useQuery<User[], Error>({
      queryKey: ['adminUsers'],
      queryFn: adminService.getUsers,
    });
  };

  const useAdminBackupsQuery = () => {
    return useQuery<any[], Error>({
      queryKey: ['adminBackups'],
      queryFn: adminService.getBackups,
    });
  };

  const useAdminSecurityEventsQuery = () => {
    return useQuery<any[], Error>({
      queryKey: ['adminSecurityEvents'],
      queryFn: adminService.getSecurityEvents,
    });
  };

  // Mutations
  const useToggleRoleMutation = () => {
    return useMutation({
      mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
        adminService.updateUserRole(id, role),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      },
    });
  };

  const useBlockUserMutation = () => {
    return useMutation({
      mutationFn: adminService.blockUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      },
    });
  };

  const useUnblockUserMutation = () => {
    return useMutation({
      mutationFn: adminService.unblockUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      },
    });
  };

  const useCreateBackupMutation = () => {
    return useMutation({
      mutationFn: adminService.createBackup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      },
    });
  };

  const useDeleteBackupMutation = () => {
    return useMutation({
      mutationFn: adminService.deleteBackup,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      },
    });
  };

  const useBlockIpMutation = () => {
    return useMutation({
      mutationFn: adminService.blockIp,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminSecurityEvents'] });
      },
    });
  };

  const useCreateGuideMutation = () => {
    return useMutation({
      mutationFn: (data: Omit<Knowledge, '_id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>) =>
        adminService.createKnowledge(data),
    });
  };

  return {
    useAdminUsersQuery,
    useAdminBackupsQuery,
    useAdminSecurityEventsQuery,
    useToggleRoleMutation,
    useBlockUserMutation,
    useUnblockUserMutation,
    useCreateBackupMutation,
    useDeleteBackupMutation,
    useBlockIpMutation,
    useCreateGuideMutation,
  };
}
