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
  ModuleAssessmentData,
  ModuleAssessmentSubmitAnswer,
  ModuleAssessmentSubmitResponse,
  ModuleAssessmentHistoryItem,
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
 * Hook to fetch course details for public landing (works unauthenticated or authenticated).
 * Endpoint: GET /courses/:slugOrId/public (falls back to GET /courses/:slugOrId)
 */
export const usePublicCourseQuery = (
  slugOrId?: string | null,
  options?: { enabled?: boolean; staleTime?: number }
) => {
  return useQuery({
    queryKey: ['courses', 'public', slugOrId],
    queryFn: async () => {
      if (!slugOrId) throw new Error('Course identifier is required');

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      let res: any;
      try {
        res = await apiClient.get<CourseApiEnvelope<CourseDetailData>>({
          url: `/courses/${slugOrId}/public`,
          auth: Boolean(token),
          suppressErrorToast: true,
        });
      } catch {
        res = await apiClient.get<CourseApiEnvelope<CourseDetailData>>({
          url: `/courses/${slugOrId}`,
          auth: Boolean(token),
          suppressErrorToast: true,
        });
      }

      const payload = res?.data as any;
      if (payload) {
        const course = payload.course || payload;
        const myEnrollment = payload.myEnrollment || payload.course?.myEnrollment || null;
        const qualifyingJobs =
          payload.qualifyingJobs ||
          payload.course?.qualifyingJobs ||
          [];
        return {
          ...payload,
          course,
          myEnrollment,
          qualifyingJobs,
        } as CourseDetailData;
      }

      return res?.data;
    },
    enabled: Boolean(slugOrId) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 min cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Dedicated hook to fetch qualifying live employer jobs matching a course.
 * Endpoint: GET /courses/:id/qualifying-jobs?limit=3
 */
export const useQualifyingJobsQuery = (
  courseId?: string | null,
  limit: number = 3
) => {
  return useQuery({
    queryKey: ['courses', 'qualifying-jobs', courseId, limit],
    queryFn: async () => {
      if (!courseId) return [];
      try {
        const res = await apiClient.get<{ statusCode: number; message: string; data: any[] }>({
          url: `/courses/${courseId}/qualifying-jobs?limit=${limit}`,
          auth: false,
          suppressErrorToast: true,
        });
        return res?.data || [];
      } catch (err) {
        console.warn(`[useQualifyingJobsQuery] Failed to fetch qualifying jobs for ${courseId}:`, err);
        return [];
      }
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
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
        suppressErrorToast: true,
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


/**
 * Hook to open/resume a module practical assessment attempt.
 * Endpoint: GET /courses/:id/modules/:moduleId/assessment
 */
export const useModuleAssessmentQuery = (
  courseId?: string,
  moduleId?: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['courses', 'module-assessment', courseId, moduleId],
    queryFn: async () => {
      if (!courseId || !moduleId) return null;
      const res = await apiClient.get<CourseApiEnvelope<ModuleAssessmentData>>({
        url: `/courses/${courseId}/modules/${moduleId}/assessment`,
        auth: true,
      });
      return res?.data;
    },
    enabled: Boolean(courseId && moduleId && enabled),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Mutation to submit answers for a module practical assessment.
 * Endpoint: POST /courses/:id/modules/:moduleId/assessment/submit
 */
export const useSubmitModuleAssessmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      answers,
    }: {
      courseId: string;
      moduleId: string;
      answers: ModuleAssessmentSubmitAnswer[];
    }) => {
      const res = await apiClient.post<CourseApiEnvelope<ModuleAssessmentSubmitResponse>>({
        url: `/courses/${courseId}/modules/${moduleId}/assessment/submit`,
        body: { answers },
        auth: true,
      });
      return res?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'module-assessment', variables.courseId, variables.moduleId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['talent', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['talent', 'dashboard'] });
    },
  });
};

/**
 * Hook to view assessment history for a module.
 * Endpoint: GET /courses/:id/modules/:moduleId/assessment/history
 */
export const useModuleAssessmentHistoryQuery = (
  courseId?: string,
  moduleId?: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['courses', 'module-assessment-history', courseId, moduleId],
    queryFn: async () => {
      if (!courseId || !moduleId) return [];
      try {
        const res = await apiClient.get<CourseApiEnvelope<ModuleAssessmentHistoryItem[]>>({
          url: `/courses/${courseId}/modules/${moduleId}/assessment/history`,
          auth: true,
          suppressErrorToast: true,
        });
        return res?.data || [];
      } catch (err) {
        console.warn(`[useModuleAssessmentHistoryQuery] error:`, err);
        return [];
      }
    },
    enabled: Boolean(courseId && moduleId && enabled),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
};
