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
  MentorDashboardHomeResponse,
  MentorMenteesResponse,
  SendSessionInviteDto,
  SendSessionInviteResponse,
  MentorSessionsResponse,
  MentorCalendarResponse,
  ScheduleSessionDto,
  RescheduleSessionDto,
} from './types';
import { toast } from 'react-hot-toast';

// -------------------------------------------------------------
// Mentor Sessions Hub (schemaVersion = 1)
// -------------------------------------------------------------

export interface MentorSessionsQueryParams {
  tab?: 'upcoming' | 'requests' | 'past' | 'availability';
  q?: string;
  format?: string;
  region?: string;
}

export const useMentorSessionsQuery = (params: MentorSessionsQueryParams = {}, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.sessions(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.tab) queryParams.set('tab', params.tab);
      if (params.q) queryParams.set('q', params.q);
      if (params.format && params.format !== 'ALL') queryParams.set('format', params.format);
      if (params.region && params.region !== 'ALL') queryParams.set('region', params.region);

      const qs = queryParams.toString();
      const url = `/mentors/sessions${qs ? `?${qs}` : ''}`;

      const response = await apiClient.get<any>({
        url,
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorSessionsResponse;
    },
    ...options,
  });
};

export const useMentorCalendarQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.sessionsCalendar(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/sessions/calendar',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorCalendarResponse;
    },
    ...options,
  });
};

export const useConfirmSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post<any>({
        url: `/mentors/sessions/${bookingId}/confirm`,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Session confirmed');
      queryClient.invalidateQueries({ queryKey: ['mentor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: mentorKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm session');
    },
  });
};

export const useDeclineSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.post<any>({
        url: `/mentors/sessions/${bookingId}/decline`,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Session declined');
      queryClient.invalidateQueries({ queryKey: ['mentor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: mentorKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to decline session');
    },
  });
};

export const useRescheduleSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, payload }: { bookingId: string; payload: RescheduleSessionDto }) => {
      const response = await apiClient.patch<any>({
        url: `/mentors/sessions/${bookingId}/reschedule`,
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Session rescheduled');
      queryClient.invalidateQueries({ queryKey: ['mentor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: mentorKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to reschedule session');
    },
  });
};

export const useScheduleSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ScheduleSessionDto) => {
      const response = await apiClient.post<any>({
        url: '/mentors/sessions/schedule',
        body: payload,
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Session scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['mentor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: mentorKeys.dashboard() });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to schedule session');
    },
  });
};

export const useAddBookingNotesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      text,
      notes,
      actionItems,
    }: {
      bookingId: string;
      text?: string;
      notes?: string;
      actionItems?: string[];
    }) => {
      const notesContent = notes !== undefined ? notes : (text ?? '');
      const response = await apiClient.post<any>({
        url: `/mentors/bookings/${bookingId}/notes`,
        body: {
          notes: notesContent,
          text: notesContent,
          ...(actionItems ? { actionItems } : {}),
        },
        auth: true,
      });
      return response?.data?.data ?? response?.data ?? response;
    },
    onSuccess: () => {
      toast.success('Notes saved');
      queryClient.invalidateQueries({ queryKey: ['mentor', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentor', 'mentees'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save notes');
    },
  });
};

// -------------------------------------------------------------
// Mentor Mentees (schemaVersion = 1)
// -------------------------------------------------------------

export interface MentorMenteesQueryParams {
  tab?: 'active' | 'past' | 'interview_referred';
  q?: string;
  tier?: string;
  pathway?: string;
  sort?: string;
}

export const useMentorMenteesQuery = (params: MentorMenteesQueryParams = {}, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.mentees(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.tab) queryParams.set('tab', params.tab);
      if (params.q) queryParams.set('q', params.q);
      if (params.tier && params.tier !== 'All') queryParams.set('tier', params.tier);
      if (params.pathway && params.pathway !== 'All') queryParams.set('pathway', params.pathway);
      if (params.sort) queryParams.set('sort', params.sort);

      const qs = queryParams.toString();
      const url = `/mentors/mentees${qs ? `?${qs}` : ''}`;

      const response = await apiClient.get<any>({
        url,
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorMenteesResponse;
    },
    ...options,
  });
};

export const useSendSessionInviteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ talentId, payload }: { talentId: string; payload: SendSessionInviteDto }) => {
      const response = await apiClient.post<any>({
        url: `/mentors/mentees/${talentId}/session-invite`,
        body: payload,
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as SendSessionInviteResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor', 'mentees'] });
    },
  });
};

export const useMentorSessionTypesQuery = () => {
  return useQuery({
    queryKey: ['mentor', 'session-types'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>({
          url: '/mentors/me',
          auth: true,
          suppressErrorToast: true,
        });
        const data = response?.data?.data ?? response?.data ?? response;
        if (data?.sessionTypes && Array.isArray(data.sessionTypes) && data.sessionTypes.length > 0) {
          return data.sessionTypes as Array<{
            id: string;
            type?: string;
            customName?: string | null;
            durationMinutes?: number;
            durationOptionLabel?: string;
          }>;
        }
      } catch (err) {
        // fallback
      }

      try {
        const availRes = await apiClient.get<any>({
          url: '/mentors/settings/availability',
          auth: true,
          suppressErrorToast: true,
        });
        const availData = availRes?.data?.data ?? availRes?.data ?? availRes;
        if (availData?.sessionTypes && Array.isArray(availData.sessionTypes)) {
          return availData.sessionTypes;
        }
      } catch (err) {
        // fallback
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// -------------------------------------------------------------
// Mentor Home Dashboard (schemaVersion = 1)
// -------------------------------------------------------------

export const useMentorDashboardQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: mentorKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<any>({
        url: '/mentors/dashboard',
        auth: true,
      });
      const data = response?.data?.data ?? response?.data ?? response;
      return data as MentorDashboardHomeResponse;
    },
    ...options,
  });
};

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
