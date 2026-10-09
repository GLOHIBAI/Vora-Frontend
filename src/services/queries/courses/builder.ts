import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type { CourseApiEnvelope } from '../../../types/courses';
import type {
  CourseBuilderData,
  PricingPreviewData,
  UploadMediaResponseData,
  CreateDraftCourseDto,
  PatchCourseDto,
  CreateModuleDto,
  PatchModuleDto,
  CreateLessonDto,
  PatchLessonDto,
  ReorderModulesDto,
  ReorderLessonsDto,
  BuilderModule,
  BuilderLesson,
} from '../../../types/courseBuilder';

// ============================================================================
// QUERY KEYS
// ============================================================================
export const courseBuilderKeys = {
  all: ['courses', 'builder'] as const,
  detail: (courseId: string) => ['courses', 'builder', courseId] as const,
  pricingPreview: (tier1Price: number) =>
    ['courses', 'pricing', 'preview', tier1Price] as const,
};

// ============================================================================
// 1. GET /courses/:id/builder
// ============================================================================
export const useCourseBuilder = (courseId: string | undefined) => {
  return useQuery({
    queryKey: courseId ? courseBuilderKeys.detail(courseId) : ['courses', 'builder', 'none'],
    queryFn: async (): Promise<CourseBuilderData> => {
      if (!courseId) throw new Error('Course ID is required');
      const res = await apiClient.get<CourseApiEnvelope<CourseBuilderData>>({
        url: `/courses/${courseId}/builder`,
        auth: true,
      });

      if (res.data?.schemaVersion !== 1) {
        console.warn(
          `[CourseBuilder] Expected schemaVersion=1, received ${res.data?.schemaVersion}. UI may degrade.`
        );
      }

      return res.data;
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 30, // 30s cache
    retry: 1,
  });
};

// ============================================================================
// 2. GET /courses/pricing/preview?tier1Price=...
// ============================================================================
export const usePricingPreview = (tier1Price: number) => {
  return useQuery({
    queryKey: courseBuilderKeys.pricingPreview(tier1Price),
    queryFn: async (): Promise<PricingPreviewData> => {
      const res = await apiClient.get<CourseApiEnvelope<PricingPreviewData>>({
        url: `/courses/pricing/preview?tier1Price=${encodeURIComponent(tier1Price)}`,
        auth: true,
      });

      if (res.data?.schemaVersion !== 1) {
        console.warn(
          `[PricingPreview] Expected schemaVersion=1, received ${res.data?.schemaVersion}.`
        );
      }

      return res.data;
    },
    enabled: tier1Price > 0,
    staleTime: 1000 * 60 * 5, // 5m cache
  });
};

// ============================================================================
// 3. POST /courses (Create DRAFT)
// ============================================================================
export const useCreateDraftCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDraftCourseDto): Promise<CourseBuilderData> => {
      const res = await apiClient.post<CourseApiEnvelope<CourseBuilderData>>({
        url: '/courses',
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      if (data?.id) {
        queryClient.setQueryData(courseBuilderKeys.detail(data.id), data);
      }
    },
  });
};

// ============================================================================
// 4. PATCH /courses/:id
// ============================================================================
export const usePatchCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: PatchCourseDto;
    }): Promise<CourseBuilderData> => {
      const res = await apiClient.patch<CourseApiEnvelope<CourseBuilderData>>({
        url: `/courses/${courseId}`,
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(courseBuilderKeys.detail(variables.courseId), data);
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
    },
  });
};

// ============================================================================
// 5. POST /uploads/course-media
// ============================================================================
export const useUploadCourseMedia = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadMediaResponseData> => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post<CourseApiEnvelope<UploadMediaResponseData>>({
        url: '/uploads/course-media',
        body: formData,
        auth: true,
      });
      return res.data;
    },
  });
};

// ============================================================================
// MODULE CRUD
// ============================================================================

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CreateModuleDto;
    }): Promise<BuilderModule> => {
      const res = await apiClient.post<CourseApiEnvelope<BuilderModule>>({
        url: `/courses/${courseId}/modules`,
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const usePatchModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: PatchModuleDto;
    }): Promise<BuilderModule> => {
      const res = await apiClient.patch<CourseApiEnvelope<BuilderModule>>({
        url: `/courses/${courseId}/modules/${moduleId}`,
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
    }: {
      courseId: string;
      moduleId: string;
    }): Promise<void> => {
      await apiClient.delete<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/modules/${moduleId}`,
        auth: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const useReorderModules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: ReorderModulesDto;
    }): Promise<void> => {
      await apiClient.put<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/modules/reorder`,
        body: payload,
        auth: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

// ============================================================================
// LESSON CRUD
// ============================================================================

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: CreateLessonDto;
    }): Promise<BuilderLesson> => {
      const res = await apiClient.post<CourseApiEnvelope<BuilderLesson>>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons`,
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const usePatchLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      lessonId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      lessonId: string;
      payload: PatchLessonDto;
    }): Promise<BuilderLesson> => {
      const res = await apiClient.patch<CourseApiEnvelope<BuilderLesson>>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        body: payload,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      lessonId,
    }: {
      courseId: string;
      moduleId: string;
      lessonId: string;
    }): Promise<void> => {
      await apiClient.delete<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        auth: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

export const useReorderLessons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: ReorderLessonsDto;
    }): Promise<void> => {
      await apiClient.put<CourseApiEnvelope<any>>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons/reorder`,
        body: payload,
        auth: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(variables.courseId) });
    },
  });
};

// ============================================================================
// PUBLISH / UNPUBLISH
// ============================================================================

export const usePublishCourseBuilder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string): Promise<CourseBuilderData> => {
      const res = await apiClient.put<CourseApiEnvelope<CourseBuilderData>>({
        url: `/courses/${courseId}/publish`,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
    },
  });
};

export const useUnpublishCourseBuilder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string): Promise<CourseBuilderData> => {
      const res = await apiClient.put<CourseApiEnvelope<CourseBuilderData>>({
        url: `/courses/${courseId}/unpublish`,
        auth: true,
      });
      return res.data;
    },
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseBuilderKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
    },
  });
};
