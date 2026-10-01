import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type {
  CourseApiEnvelope,
  RecommendedCoursesData,
  EnrollmentsData,
  CourseDetailData,
  EnrollCoursePayload,
  EnrollCourseResponseData,
  RecordProgressParams,
  RecordProgressResponseData,
} from '../../../types/courses';

/**
 * Hook to fetch recommended courses (paginated, with optional specialisation filter).
 * Endpoint: GET /courses?page=1&limit=10&specialisation=...
 * Envelope: { statusCode, message, data: { schemaVersion: 1, items: [...] } }
 */
export const useRecommendedCourses = (params: {
  page?: number;
  limit?: number;
  specialisation?: string;
} = {}) => {
  const { page = 1, limit = 10, specialisation } = params;

  return useQuery({
    queryKey: ['courses', 'recommended', { page, limit, specialisation }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', String(page));
      if (limit) searchParams.append('limit', String(limit));
      if (specialisation) searchParams.append('specialisation', specialisation);

      const queryStr = searchParams.toString();
      const url = `/courses${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiClient.get<CourseApiEnvelope<RecommendedCoursesData>>({
        url,
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useRecommendedCourses] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
  });
};

/**
 * Hook to fetch talent's ongoing and completed course enrollments.
 * Endpoint: GET /courses/enrollments
 * Envelope: { statusCode, message, data: { schemaVersion: 1, ongoing: [...], completed: [...] } }
 */
export const useEnrollments = () => {
  return useQuery({
    queryKey: ['courses', 'enrollments'],
    queryFn: async () => {
      const res = await apiClient.get<CourseApiEnvelope<EnrollmentsData>>({
        url: '/courses/enrollments',
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useEnrollments] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
  });
};

/**
 * Hook to fetch full course details and talent's enrollment status.
 * Endpoint: GET /courses/:id
 * Envelope: { statusCode, message, data: { schemaVersion: 1, course: {...}, myEnrollment: {...} | null } }
 */
export const useCourseDetail = (id?: string) => {
  return useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');

      const res = await apiClient.get<CourseApiEnvelope<CourseDetailData>>({
        url: `/courses/${id}`,
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useCourseDetail] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
    enabled: Boolean(id),
  });
};

/**
 * Mutation to enroll talent into a course.
 * Endpoint: POST /courses/:id/enroll
 * Body: { declaredCountry, ipCountry, paymentCountry, localeCountry }
 */
export const useEnrollMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      payload = {},
    }: {
      courseId: string;
      payload?: EnrollCoursePayload;
    }) => {
      const res = await apiClient.post<CourseApiEnvelope<EnrollCourseResponseData>>({
        url: `/courses/${courseId}/enroll`,
        body: {
          declaredCountry: payload.declaredCountry || 'US',
          ipCountry: payload.ipCountry || 'US',
          paymentCountry: payload.paymentCountry || 'US',
          localeCountry: payload.localeCountry || 'en-US',
        },
        auth: true,
      });

      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'recommended'] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['courses', 'detail', variables.courseId] });
      }
    },
  });
};

/**
 * Mutation to record lesson progress for an enrolled course.
 * Endpoint: POST /courses/:id/progress/:moduleId/:lessonId
 * Body: {}
 */
export const useProgressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, moduleId, lessonId }: RecordProgressParams) => {
      const res = await apiClient.post<CourseApiEnvelope<RecordProgressResponseData>>({
        url: `/courses/${courseId}/progress/${moduleId}/${lessonId}`,
        body: {},
        auth: true,
      });

      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', variables.courseId] });
    },
  });
};
