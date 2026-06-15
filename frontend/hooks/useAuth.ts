import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useToastStore } from '../store/toastStore';
import { User, Session } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const authStore = useAuthStore();

  // Query: User profile (cached)
  const useUserProfileQuery = (enabled = authStore.isAuthenticated) => {
    return useQuery<User | null, Error>({
      queryKey: ['userProfile'],
      queryFn: async () => {
        await authStore.fetchProfile();
        return authStore.user;
      },
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: Active user sessions
  const useSessionsQuery = (enabled = authStore.isAuthenticated) => {
    return useQuery<Session[], Error>({
      queryKey: ['userSessions'],
      queryFn: authService.getSessions,
      enabled,
    });
  };

  // Mutation: Login
  const useLoginMutation = () => {
    return useMutation({
      mutationFn: ({ email, password }: any) => authStore.login(email, password),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userSessions'] });
      },
    });
  };

  // Mutation: Register
  const useRegisterMutation = () => {
    return useMutation({
      mutationFn: ({ name, email, password }: any) => authStore.register(name, email, password),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      },
    });
  };

  // Mutation: Logout
  const useLogoutMutation = () => {
    return useMutation({
      mutationFn: () => authStore.logout(),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  };

  // Mutation: Revoke session
  const useRevokeSessionMutation = () => {
    return useMutation({
      mutationFn: authService.removeSession,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userSessions'] });
      },
    });
  };

  // Mutation: Update profile
  const useUpdateProfileMutation = () => {
    return useMutation({
      mutationFn: ({ name, email }: any) => authStore.updateProfile(name, email),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      },
    });
  };

  // Mutation: Change password
  const useChangePasswordMutation = () => {
    return useMutation({
      mutationFn: ({ currentPassword, newPassword }: any) => authStore.changePassword(currentPassword, newPassword),
    });
  };

  // Mutation: Toggle 2FA
  const useToggle2FAMutation = () => {
    return useMutation({
      mutationFn: async (enable: boolean) => {
        if (enable) {
          return await authStore.enable2FA();
        } else {
          await authStore.disable2FA();
          return null;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      },
    });
  };

  // Mutation: Delete account
  const useDeleteAccountMutation = () => {
    return useMutation({
      mutationFn: () => authStore.deleteAccount(),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  };

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    initialize: authStore.initialize,
    useUserProfileQuery,
    useSessionsQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRevokeSessionMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useToggle2FAMutation,
    useDeleteAccountMutation,
  };
}
