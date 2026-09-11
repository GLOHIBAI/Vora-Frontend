import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { mentorKeys } from './keys';
import type {
  MentorProfileSettings,
  UpdateMentorProfileDto,
  MentorAvailabilitySettings,
  UpdateMentorAvailabilityDto,
  MentorCoursesSettings,
  UpdateMentorCoursesDto,
  MentorMentorshipSettings,
  UpdateMentorMentorshipDto,
  MentorNotificationsSettings,
  UpdateMentorNotificationsDto,
  MentorAccountSettings,
  UpdateMentorAccountDto,
  EmailChangeRequestDto,
} from './types';
import { toast } from 'react-hot-toast';

// -------------------------------------------------------------
// Settings - Profile
// -------------------------------------------------------------

export const useMentorProfileSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsProfile(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/profile',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorProfileSettings;
    },
    ...options,
  });
};

export const useUpdateMentorProfileSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorProfileDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/profile',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Profile settings saved successfully');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsProfile() });
      queryClient.invalidateQueries({ queryKey: ['mentor'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update profile settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Availability & Pricing
// -------------------------------------------------------------

export const useMentorAvailabilitySettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsAvailability(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/availability',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorAvailabilitySettings;
    },
    ...options,
  });
};

export const useUpdateMentorAvailabilitySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorAvailabilityDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/availability',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Availability settings saved successfully');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsAvailability() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update availability settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Courses
// -------------------------------------------------------------

export const useMentorCoursesSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsCourses(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/courses',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorCoursesSettings;
    },
    ...options,
  });
};

export const useUpdateMentorCoursesSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorCoursesDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/courses',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Course settings updated');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsCourses() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update course settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Mentorship
// -------------------------------------------------------------

export const useMentorMentorshipSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsMentorship(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/mentorship',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorMentorshipSettings;
    },
    ...options,
  });
};

export const useUpdateMentorMentorshipSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorMentorshipDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/mentorship',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Mentorship preferences saved');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsMentorship() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update mentorship settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Notifications
// -------------------------------------------------------------

export const useMentorNotificationsSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsNotifications(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/notifications',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorNotificationsSettings;
    },
    ...options,
  });
};

export const useUpdateMentorNotificationsSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorNotificationsDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/notifications',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Notification settings saved successfully');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsNotifications() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update notification settings');
    },
  });
};

// -------------------------------------------------------------
// Settings - Account
// -------------------------------------------------------------

export const useMentorAccountSettingsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.settingsAccount(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/settings/account',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorAccountSettings;
    },
    ...options,
  });
};

export const useUpdateMentorAccountSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMentorAccountDto) => {
      const response = await apiClient.patch<any>({
        url: '/mentors/settings/account',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Account privacy updated');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsAccount() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update account settings');
    },
  });
};

export const useMentorRequestEmailChangeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmailChangeRequestDto) => {
      const response = await apiClient.post<any>({
        url: '/mentors/settings/account/email-change-request',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Email change request sent to administrator.');
      queryClient.invalidateQueries({ queryKey: mentorKeys.settingsAccount() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit email change request');
    },
  });
};

export * from './types';
export * from './keys';
