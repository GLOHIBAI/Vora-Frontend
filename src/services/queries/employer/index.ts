import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { employerKeys } from './keys';
import type {
  EmployerDashboardData,
  EmployerProfileSettings,
  UpdateEmployerProfileDto,
  EmployerNotificationsSettings,
  UpdateEmployerNotificationsDto,
  EmployerAccountSettings,
  UpdateEmployerAccountDto,
  EmailChangeRequestDto,
  AuthSession,
  ChangePasswordDto,
  UploadAvatarResponse,
  EmployerJobsListResponse,
  EmployerJobDetailsResponse,
  EmployerApplicantsResponse,
  EmployerHiresResponse,
} from './types';
import { toast } from 'react-hot-toast';

// -------------------------------------------------------------
// Employer Dashboard
// -------------------------------------------------------------

export const useEmployerDashboardQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/dashboard',
        auth: true,
      });
      // Response envelope can be res.data.data or res.data
      const unwrapped = response?.data?.data ?? response?.data ?? response;
      return unwrapped as EmployerDashboardData;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
};

// -------------------------------------------------------------
// Settings - Profile Tab
// -------------------------------------------------------------

export const useEmployerProfileSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsProfile(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/profile',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerProfileSettings;
    },
    ...options,
  });
};

export const useUpdateEmployerProfileSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmployerProfileDto) => {
      const response = await apiClient.patch<any>({
        url: '/employers/settings/profile',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Profile settings saved successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsProfile() });
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update profile settings');
    },
  });
};

export const useUploadAvatarMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('avatar', file);

      const res = await apiClient.post<any>({
        url: '/uploads/avatar',
        body: formData,
        auth: true,
      });

      return (res?.data?.data ?? res?.data ?? res) as UploadAvatarResponse;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to upload profile photo');
    },
  });
};

// -------------------------------------------------------------
// Settings - Notifications Tab
// -------------------------------------------------------------

export const useEmployerNotificationsSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsNotifications(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/notifications',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerNotificationsSettings;
    },
    ...options,
  });
};

export const useUpdateEmployerNotificationsSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmployerNotificationsDto) => {
      const response = await apiClient.patch<any>({
        url: '/employers/settings/notifications',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Notification settings saved successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsNotifications() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update notification settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Account Tab
// -------------------------------------------------------------

export const useEmployerAccountSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsAccount(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/account',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerAccountSettings;
    },
    ...options,
  });
};

export const useUpdateEmployerAccountSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmployerAccountDto) => {
      const response = await apiClient.patch<any>({
        url: '/employers/settings/account',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Account privacy updated');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsAccount() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update account settings');
    },
  });
};

export const useRequestEmailChangeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmailChangeRequestDto) => {
      const response = await apiClient.post<any>({
        url: '/employers/settings/account/email-change-request',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Email change request sent to administrator.');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsAccount() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit email change request');
    },
  });
};

// -------------------------------------------------------------
// Auth Endpoints (Sessions, Change Password)
// -------------------------------------------------------------

export const useAuthSessionsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.authSessions(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/auth/sessions',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return (Array.isArray(data) ? data : data?.sessions ?? []) as AuthSession[];
    },
    ...options,
  });
};

export const useRevokeOtherSessionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<any>({
        url: '/auth/sessions/revoke-others',
        auth: true,
        credentials: 'include',
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('All other sessions signed out successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.authSessions() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to sign out other sessions');
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordDto) => {
      const response = await apiClient.post<any>({
        url: '/auth/change-password',
        body: {
          currentPassword: payload.currentPassword || payload.current,
          newPassword: payload.newPassword || payload.new,
        },
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to change password');
    },
  });
};

// -------------------------------------------------------------
// Employer Jobs
// -------------------------------------------------------------

export interface EmployerJobsQueryParams {
  filter?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useEmployerJobsQuery = (params: EmployerJobsQueryParams = {}) => {
  const { filter = 'all', search = '', page = 1, limit = 20, enabled = true } = params;
  return useQuery({
    queryKey: employerKeys.jobs(filter, search, page, limit),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (filter) qs.set('filter', filter);
      if (search) qs.set('search', search);
      qs.set('page', String(page));
      qs.set('limit', String(limit));
      const response = await apiClient.get<any>({
        url: `/employers/jobs?${qs.toString()}`,
        auth: true,
      });
      return (response?.data?.data ?? response?.data ?? response) as EmployerJobsListResponse;
    },
    enabled,
    refetchOnWindowFocus: true,
  });
};

export const useEmployerJobDetailQuery = (id: string, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.jobDetail(id),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: `/employers/jobs/${id}`,
        auth: true,
      });
      return (response?.data?.data ?? response?.data ?? response) as EmployerJobDetailsResponse;
    },
    enabled: !!id,
    ...options,
  });
};

export const useEmployerJobApplicantsQuery = (id: string, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.jobApplicants(id),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: `/employers/jobs/${id}/applicants`,
        auth: true,
      });
      return (response?.data?.data ?? response?.data ?? response) as EmployerApplicantsResponse;
    },
    enabled: !!id,
    ...options,
  });
};

export const useEmployerJobHiresQuery = (id: string, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.jobHires(id),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: `/employers/jobs/${id}/hires`,
        auth: true,
      });
      return (response?.data?.data ?? response?.data ?? response) as EmployerHiresResponse;
    },
    enabled: !!id,
    ...options,
  });
};

export * from './types';
export * from './keys';
