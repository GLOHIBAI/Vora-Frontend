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
  InstructorHubData,
  CreateCourseDto,
} from '../../../types/courses';

/**
 * Hook to fetch talent recommended courses (curated from DevelopmentPrescription & GapSignals).
 * Endpoint: GET /courses/recommended?page=1&limit=20
 * Envelope: { statusCode, message, data: { schemaVersion: 1, items: [...], source, focusAreas, message, gaps, emptyState } }
 */
export const useRecommendedCourses = (params: {
  page?: number;
  limit?: number;
} = {}) => {
  const { page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ['courses', 'recommended', { page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', String(page));
      if (limit) searchParams.append('limit', String(limit));

      const queryStr = searchParams.toString();
      const url = `/courses/recommended${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiClient.get<CourseApiEnvelope<RecommendedCoursesData>>({
        url,
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useRecommendedCourses] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
    staleTime: 1000 * 60 * 3, // 3 min cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to browse general catalog courses (paginated, with optional specialisation filter).
 * Endpoint: GET /courses?page=1&limit=20&specialisation=...
 * Envelope: { statusCode, message, data: { schemaVersion: 1, items: [...] } }
 */
export const useBrowseCourses = (params: {
  page?: number;
  limit?: number;
  specialisation?: string;
} = {}) => {
  const { page = 1, limit = 20, specialisation } = params;

  return useQuery({
    queryKey: ['courses', 'browse', { page, limit, specialisation }],
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
        console.warn(`[useBrowseCourses] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
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
    staleTime: 1000 * 60 * 2, // 2 min cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch full course details and talent's enrollment status.
 * Endpoint: GET /courses/:id
 * Envelope: { statusCode, message, data: { schemaVersion: 1, course: {...}, myEnrollment: {...} | null } }
 */
export const useCourseDetail = (
  id?: string | null,
  options?: { enabled?: boolean; staleTime?: number }
) => {
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

      const payload = res?.data as any;
      if (payload) {
        const course = payload.course || payload;
        const myEnrollment = payload.myEnrollment || payload.course?.myEnrollment || null;
        return {
          ...payload,
          course,
          myEnrollment,
        } as CourseDetailData;
      }

      return res?.data;
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 1000 * 60 * 2, // 2 min cache
    refetchOnWindowFocus: false,
  });
};

export const useCourseDetails = useCourseDetail;

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

// ============================================================================
// INSTRUCTOR PORTAL (MENTOR HUB) HOOKS
// ============================================================================

/**
 * Hook to fetch the full Instructor Hub for a mentor.
 * Endpoint: GET /courses/instructor/hub
 * Envelope: { statusCode, message, data: { schemaVersion: 1, metrics, myCourses, roster, mentorship, ... } }
 */
export const useInstructorHub = () => {
  return useQuery({
    queryKey: ['courses', 'instructor', 'hub'],
    queryFn: async () => {
      const res = await apiClient.get<CourseApiEnvelope<InstructorHubData>>({
        url: '/courses/instructor/hub',
        auth: true,
      });

      if (res?.data && res.data.schemaVersion !== 1) {
        console.warn(`[useInstructorHub] Unexpected schemaVersion: ${res.data.schemaVersion}`);
      }

      return res?.data;
    },
    select: (data) => {
      if (!data) return data;
      try {
        const stored = localStorage.getItem('vora_deleted_course_ids');
        const deletedIds = stored ? new Set(JSON.parse(stored)) : new Set();
        if (deletedIds.size > 0 && Array.isArray(data.myCourses)) {
          return {
            ...data,
            myCourses: data.myCourses.filter((c) => !deletedIds.has(c.id)),
          };
        }
      } catch {}
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 min cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Mutation to create a new draft course.
 * Endpoint: POST /courses
 */
export const useCreateCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCourseDto) => {
      const res = await apiClient.post<CourseApiEnvelope<any>>({
        url: '/courses',
        body: payload,
        auth: true,
      });

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'recommended'] });
    },
  });
};

/**
 * Mutation to publish a course.
 * Endpoint: PUT /courses/:id/publish
 */
export const usePublishCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiClient.put<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/publish`,
        body: {},
        auth: true,
      });

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'recommended'] });
    },
  });
};

/**
 * Mutation to unpublish a course.
 * Endpoint: PUT /courses/:id/unpublish
 */
export const useUnpublishCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await apiClient.put<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/unpublish`,
        body: {},
        auth: true,
      });

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'recommended'] });
    },
  });
};

/**
 * Mutation to delete (archive) a course.
 * Endpoint: DELETE /courses/:id
 */
export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      try {
        const res = await apiClient.delete<CourseApiEnvelope<any>>({
          url: `/courses/${courseId}`,
          auth: true,
          suppressErrorToast: true,
        });

        return res?.data;
      } catch (err) {
        console.warn(`[useDeleteCourseMutation] API delete error for ${courseId}:`, err);
        return null;
      }
    },
    onSuccess: (_data, courseId) => {
      if (courseId) {
        try {
          const stored = localStorage.getItem('vora_deleted_course_ids');
          const set = stored ? new Set(JSON.parse(stored)) : new Set();
          set.add(courseId);
          localStorage.setItem('vora_deleted_course_ids', JSON.stringify([...set]));
        } catch {}
      }

      queryClient.setQueryData(['courses', 'instructor', 'hub'], (old: any) => {
        if (!old || !Array.isArray(old.myCourses)) return old;
        return {
          ...old,
          myCourses: old.myCourses.filter((c: any) => c.id !== courseId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ['courses', 'recommended'] });
    },
  });
};
