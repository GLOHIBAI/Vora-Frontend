import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, BASE_URL } from '../../api';
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
    staleTime: 1000 * 60 * 3, // 3 min cache
    refetchOnWindowFocus: false,
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
      // Directly update React Query cache without triggering immediate background refetch
      queryClient.setQueryData(courseBuilderKeys.detail(variables.courseId), data);
    },
  });
};

// ============================================================================
// 5. POST /uploads/course-media
// ============================================================================
// Helper: Upload file with real upload progress tracking via XMLHttpRequest
// ============================================================================
function uploadFileWithProgress(
  endpointUrl: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fullUrl = endpointUrl.startsWith('http') ? endpointUrl : `${BASE_URL}${endpointUrl}`;
    xhr.open('POST', fullUrl, true);

    const token = localStorage.getItem('auth_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.min(Math.round((e.loaded / e.total) * 100), 99);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data: any = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve(data);
      } else {
        const errorMsg =
          data?.message ||
          data?.error ||
          `Upload failed with status ${xhr.status}`;
        const err = new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
        (err as any).status = xhr.status;
        (err as any).data = data;
        reject(err);
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.send(formData);
  });
}

export const useUploadCourseMedia = () => {
  return useMutation({
    mutationFn: async (
      args: File | { file: File; courseId?: string; onProgress?: (percent: number) => void }
    ): Promise<UploadMediaResponseData> => {
      const file = args instanceof File ? args : args.file;
      const courseId = args instanceof File ? undefined : args.courseId;
      const onProgress = args instanceof File ? undefined : args.onProgress;
      const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';

      // Determine candidate field names based on file type.
      // Multer's FileInterceptor expects exactly ONE file field matching its declared name.
      // Sending multiple files or unrecognized field names causes NestJS Multer to throw "Unexpected field".
      const candidateFieldNames = file.type.startsWith('video/')
        ? ['file', 'video', 'promoVideo', 'media']
        : ['file', 'image', 'thumbnail', 'coverImage', 'media'];

      let lastError: any = null;

      for (let i = 0; i < candidateFieldNames.length; i++) {
        const fieldName = candidateFieldNames[i];
        const isLastCandidate = i === candidateFieldNames.length - 1;

        const formData = new FormData();
        // courseId must be present in body for backend ValidationPipe
        if (courseId) {
          formData.append('courseId', courseId);
        }
        formData.append(fieldName, file);

        try {
          const res = await uploadFileWithProgress(
            `/uploads/course-media${query}`,
            formData,
            onProgress
          );

          // Normalize envelope from backend (could be res.data.data, res.data, or res)
          const payload = res?.data?.data ?? res?.data ?? res;

          const s3Key =
            payload?.s3Key ||
            payload?.key ||
            payload?.publicId ||
            payload?.public_id ||
            payload?.url ||
            payload?.secure_url ||
            payload?.location ||
            payload?.path ||
            '';

          const url =
            payload?.url ||
            payload?.secure_url ||
            payload?.thumbnailUrl ||
            payload?.videoUrl ||
            payload?.location ||
            (s3Key && typeof s3Key === 'string' && s3Key.startsWith('http') ? s3Key : undefined);

          return {
            s3Key,
            url,
            ...payload,
          };
        } catch (err: any) {
          lastError = err;
          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('unexpected field') && !isLastCandidate) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error('Upload failed');
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
      const res = await apiClient.post<any>({
        url: `/courses/${courseId}/modules`,
        body: payload,
        auth: true,
      });
      const data = res?.data?.data ?? res?.data ?? res;
      return data as BuilderModule;
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
      if (!moduleId || moduleId.startsWith('temp-')) {
        return {} as BuilderModule;
      }
      const res = await apiClient.patch<any>({
        url: `/courses/${courseId}/modules/${moduleId}`,
        body: payload,
        auth: true,
      });
      const data = res?.data?.data ?? res?.data ?? res;
      return data as BuilderModule;
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
      if (!moduleId || moduleId.startsWith('temp-')) return;
      await apiClient.delete<any>({
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
      await apiClient.put<any>({
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
      if (!moduleId || moduleId.startsWith('temp-')) {
        throw new Error('Module must be saved before adding lessons');
      }
      const res = await apiClient.post<any>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons`,
        body: payload,
        auth: true,
      });
      const data = res?.data?.data ?? res?.data ?? res;
      return data as BuilderLesson;
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
      if (!moduleId || moduleId.startsWith('temp-') || !lessonId || lessonId.startsWith('temp-')) {
        return {} as BuilderLesson;
      }
      const res = await apiClient.patch<any>({
        url: `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        body: payload,
        auth: true,
      });
      const data = res?.data?.data ?? res?.data ?? res;
      return data as BuilderLesson;
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
      if (!moduleId || moduleId.startsWith('temp-') || !lessonId || lessonId.startsWith('temp-')) {
        return;
      }
      await apiClient.delete<any>({
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
