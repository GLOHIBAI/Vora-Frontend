import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { employerKeys } from './keys';
import type {
  EmployerDashboardData,
  EmployerProfileSettings,
  UpdateEmployerProfileDto,
  EmployerOrganisationSettings,
  UpdateEmployerOrganisationDto,
  EmployerTeamResponse,
  InviteTeamMemberDto,
  UpdateTeamMemberDto,
  EmployerRolePermissionsMatrix,
  UpdateRolePermissionsDto,
  EmployerBillingSettings,
  EmployerNotificationsSettings,
  UpdateEmployerNotificationsDto,
  EmployerSecuritySettings,
  AuditTrailResponse,
  OfferTemplateItem,
  CreateOfferTemplateDto,
  UpdateOfferTemplateDto,
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
  EmployerTalentsResponse,
  EmployerTalentsQueryParams,
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
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor'] });
      queryClient.invalidateQueries({ queryKey: ['employer'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to upload profile photo');
    },
  });
};

// -------------------------------------------------------------
// Settings - Organisation Profile (Boot D)
// -------------------------------------------------------------

export const useEmployerOrganisationQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsOrganisation(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/organisation',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerOrganisationSettings;
    },
    ...options,
  });
};

export const useUpdateEmployerOrganisationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmployerOrganisationDto) => {
      const response = await apiClient.patch<any>({
        url: '/employers/settings/organisation',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Organisation profile saved successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsOrganisation() });
      queryClient.invalidateQueries({ queryKey: employerKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update organisation profile');
    },
  });
};

// -------------------------------------------------------------
// Settings - Team & Seats (Boot D)
// -------------------------------------------------------------

export const useEmployerTeamQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsTeam(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/team',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerTeamResponse;
    },
    ...options,
  });
};

export const useInviteTeamMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteTeamMemberDto) => {
      const response = await apiClient.post<any>({
        url: '/employers/settings/team/invites',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: (_, variables) => {
      toast.success(`Invitation sent to ${variables.email}`);
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsTeam() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to send team invitation');
    },
  });
};

export const useUpdateTeamMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      ...payload
    }: UpdateTeamMemberDto & { memberId: string }) => {
      const response = await apiClient.patch<any>({
        url: `/employers/settings/team/members/${memberId}`,
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Team member updated');
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsTeam() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update team member');
    },
  });
};

// -------------------------------------------------------------
// Settings - Roles & Permissions (Boot D)
// -------------------------------------------------------------

export const useEmployerRolesMatrixQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsRoles(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/roles',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerRolePermissionsMatrix;
    },
    ...options,
  });
};

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateRolePermissionsDto) => {
      const response = await apiClient.patch<any>({
        url: `/employers/settings/roles/${payload.role}`,
        body: { permissions: payload.permissions },
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: (_, variables) => {
      toast.success(`Updated permissions for ${variables.role}`);
      queryClient.invalidateQueries({ queryKey: employerKeys.settingsRoles() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update role permissions');
    },
  });
};

// -------------------------------------------------------------
// Settings - Billing & Payments (Boot D)
// -------------------------------------------------------------

export const useEmployerBillingSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsBilling(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/billing',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerBillingSettings;
    },
    ...options,
  });
};

// -------------------------------------------------------------
// Settings - Security (Boot D)
// -------------------------------------------------------------

export const useEmployerSecuritySettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsSecurity(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/security',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as EmployerSecuritySettings;
    },
    ...options,
  });
};

// -------------------------------------------------------------
// Settings - Data & Privacy (Boot D)
// -------------------------------------------------------------

export const useDataPrivacyExportMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<any>({
        url: '/employers/settings/data-privacy/export-request',
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Data export request received. A download link will be emailed once ready.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to request data export');
    },
  });
};

export const useDataPrivacyDeletionMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<any>({
        url: '/employers/settings/data-privacy/deletion-request',
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Account deletion request queued for compliance review.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit deletion request');
    },
  });
};

export const useDataPrivacyAuditTrailQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: employerKeys.settingsDataPrivacyAudit(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/employers/settings/data-privacy/audit-trail',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as AuditTrailResponse;
    },
    ...options,
  });
};

// -------------------------------------------------------------
// Settings - Offer Templates (Boot D)
// -------------------------------------------------------------

export interface OfferTemplatesQueryParams {
  category?: string;
  q?: string;
  enabled?: boolean;
}

export const useEmployerOfferTemplatesQuery = (
  params: OfferTemplatesQueryParams = {},
  options: Record<string, any> = {}
) => {
  const { category = '', q = '', enabled = true } = params;
  return useQuery({
    queryKey: employerKeys.settingsOfferTemplates(category, q),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (category && category !== 'All') qs.set('category', category);
      if (q) qs.set('q', q);
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await apiClient.get<any>({
        url: `/employers/settings/offer-templates${queryString}`,
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return (Array.isArray(data) ? data : data?.templates ?? data?.items ?? []) as OfferTemplateItem[];
    },
    enabled,
    ...options,
  });
};

export const useCreateOfferTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOfferTemplateDto) => {
      const response = await apiClient.post<any>({
        url: '/employers/settings/offer-templates',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Custom offer template uploaded successfully');
      queryClient.invalidateQueries({ queryKey: [...employerKeys.settings(), 'offer-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to upload offer template');
    },
  });
};

export const useUpdateOfferTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateOfferTemplateDto & { id: string }) => {
      const response = await apiClient.patch<any>({
        url: `/employers/settings/offer-templates/${id}`,
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Offer template updated');
      queryClient.invalidateQueries({ queryKey: [...employerKeys.settings(), 'offer-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update offer template');
    },
  });
};

export const useDeleteOfferTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<any>({
        url: `/employers/settings/offer-templates/${id}`,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Offer template removed');
      queryClient.invalidateQueries({ queryKey: [...employerKeys.settings(), 'offer-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete offer template');
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
      const rawSessions = (Array.isArray(data) ? data : data?.sessions ?? []) as AuthSession[];

      if (rawSessions.length > 0 && !rawSessions.some(s => s.isCurrent)) {
        toast.error('Your session was signed out from another device.');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      return [...rawSessions].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime();
      });
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
      const currentPassword = payload.currentPassword || payload.current;
      const newPassword = payload.newPassword || payload.new;
      const confirmNewPassword =
        payload.confirmNewPassword || payload.confirmPassword || payload.confirm || newPassword;

      const response = await apiClient.post<any>({
        url: '/auth/change-password',
        body: {
          currentPassword,
          newPassword,
          confirmNewPassword,
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
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useEmployerJobsQuery = (params: EmployerJobsQueryParams = {}) => {
  const { filter = 'all', status, search = '', page = 1, limit = 20, enabled = true } = params;
  return useQuery({
    queryKey: employerKeys.jobs(filter, status, search, page, limit),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (filter) qs.set('filter', filter);
      if (status && status !== 'ALL') {
        const normStatus =
          status.toUpperCase() === 'VAULT'
            ? 'SCHEDULED'
            : status.toUpperCase() === 'ACTIVE'
              ? 'LIVE'
              : status.toUpperCase();
        qs.set('status', normStatus);
      }
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

export const useCloseEmployerJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<any>({
        url: `/employers/jobs/${id}/close`,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Role closed successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to close role');
    },
  });
};

export const useDeleteEmployerJobDraftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<any>({
        url: `/employers/jobs/${id}`,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Draft deleted successfully');
      queryClient.invalidateQueries({ queryKey: employerKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete draft');
    },
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

// -------------------------------------------------------------
// Talents (/api/v1/employers/talents)
// -------------------------------------------------------------

export const useEmployerTalentsQuery = (params: EmployerTalentsQueryParams = {}) => {
  const { search = '', status, page = 1, limit = 20, enabled = true } = params;
  return useQuery({
    queryKey: employerKeys.talents(search, status, page, limit),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      if (status && status !== 'ALL' && status !== 'All talents') {
        qs.set('status', status);
      }
      qs.set('page', String(page));
      qs.set('limit', String(limit));
      const response = await apiClient.get<any>({
        url: `/employers/talents?${qs.toString()}`,
        auth: true,
      });
      return (response?.data?.data ?? response?.data ?? response) as EmployerTalentsResponse;
    },
    enabled,
    refetchOnWindowFocus: true,
  });
};

export * from './types';
export * from './keys';
