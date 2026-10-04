import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type {
  MentorsApiEnvelope,
  DiscoverMentorsData,
  DiscoverMentorsParams,
  BookingPanelData,
  BookMentorPayload,
  BookMentorResponseData,
  MySessionsData,
} from '../../../types/mentors';

/**
 * Hook to fetch discoverable verified mentors.
 * Endpoint: GET /mentors/discover?page=&limit=&q=&focus=
 * Envelope: { statusCode, message, data: { schemaVersion: 1, items: [...], focusFilters: [...] } }
 */
export const useDiscoverMentors = (params: DiscoverMentorsParams = {}) => {
  const { page = 1, limit = 12, q, focus } = params;

  return useQuery({
    queryKey: ['mentors', 'discover', { page, limit, q, focus }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', String(page));
      if (limit) searchParams.append('limit', String(limit));
      if (q && q.trim()) searchParams.append('q', q.trim());
      if (focus && focus.trim() && focus.toUpperCase() !== 'ALL') {
        searchParams.append('focus', focus.trim());
      }

      const queryStr = searchParams.toString();
      const url = `/mentors/discover${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiClient.get<MentorsApiEnvelope<DiscoverMentorsData>>({
        url,
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useDiscoverMentors] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
  });
};

/**
 * Hook to fetch talent's booked mentorship sessions.
 * Endpoint: GET /mentors/my-sessions
 * Envelope: { statusCode, message, data: { schemaVersion: 1, total, upcoming, past, items } }
 */
export const useMySessions = () => {
  return useQuery({
    queryKey: ['mentors', 'my-sessions'],
    queryFn: async () => {
      const res = await apiClient.get<MentorsApiEnvelope<MySessionsData>>({
        url: '/mentors/my-sessions',
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useMySessions] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
  });
};

/**
 * Hook to fetch booking panel availability and session types for a specific mentor.
 * Endpoint: GET /mentors/:mentorId/booking-panel
 * Envelope: { statusCode, message, data: { schemaVersion: 1, mentor, acceptingBookings, sessionTypes, slotDays } }
 */
export const useBookingPanel = (mentorId: string | null | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['mentors', mentorId, 'booking-panel'],
    queryFn: async () => {
      if (!mentorId) return null;

      const res = await apiClient.get<MentorsApiEnvelope<BookingPanelData>>({
        url: `/mentors/${mentorId}/booking-panel`,
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useBookingPanel] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
    enabled: Boolean(mentorId) && enabled,
  });
};

/**
 * Hook to book a 1:1 mentorship session.
 * Endpoint: POST /mentors/:mentorId/book
 * Body: { sessionTypeId, scheduledAt, sessionFocus, menteeCountry, ipCountry, paymentCountry, localeCountry }
 */
export const useBookMentorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mentorId,
      payload,
    }: {
      mentorId: string;
      payload: BookMentorPayload;
    }) => {
      const localeCountry =
        payload.localeCountry ||
        (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

      const res = await apiClient.post<MentorsApiEnvelope<BookMentorResponseData>>({
        url: `/mentors/${mentorId}/book`,
        body: {
          sessionTypeId: payload.sessionTypeId,
          scheduledAt: payload.scheduledAt,
          ...(payload.sessionFocus ? { sessionFocus: payload.sessionFocus.trim() } : {}),
          menteeCountry: payload.menteeCountry || 'US',
          ipCountry: payload.ipCountry || 'US',
          paymentCountry: payload.paymentCountry || 'US',
          localeCountry,
        },
        auth: true,
      });

      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mentors', 'my-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentors', 'discover'] });
      if (variables.mentorId) {
        queryClient.invalidateQueries({
          queryKey: ['mentors', variables.mentorId, 'booking-panel'],
        });
      }
    },
  });
};
