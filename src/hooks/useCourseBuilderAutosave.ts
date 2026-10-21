import { useState, useEffect, useRef, useCallback } from 'react';
import { usePatchCourse } from '../services/queries/courses/builder';
import type { PatchCourseDto } from '../types/courseBuilder';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';

interface UseCourseBuilderAutosaveProps {
  courseId: string | null | undefined;
  payload: PatchCourseDto;
  enabled?: boolean;
  debounceMs?: number;
}

export function useCourseBuilderAutosave({
  courseId,
  payload,
  enabled = true,
  debounceMs = 1500,
}: UseCourseBuilderAutosaveProps) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const patchCourseMutation = usePatchCourse();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedJsonRef = useRef<string>('');
  const latestPayloadRef = useRef<PatchCourseDto>(payload);
  const isFirstMountRef = useRef<boolean>(true);
  const prevCourseIdRef = useRef<string | null | undefined>(courseId);

  latestPayloadRef.current = payload;

  const saveImmediate = useCallback(
    async (overridePayload?: PatchCourseDto) => {
      if (!courseId) return;
      const dataToSave = overridePayload || latestPayloadRef.current;
      const serialized = JSON.stringify(dataToSave);
      if (serialized === lastSavedJsonRef.current) {
        return;
      }

      setAutosaveStatus('saving');
      try {
        await patchCourseMutation.mutateAsync({
          courseId,
          payload: dataToSave,
        });
        lastSavedJsonRef.current = serialized;
        setAutosaveStatus('saved');
      } catch (err) {
        console.error('[Autosave] Failed to autosave course:', err);
        // Prevent infinite loops on validation/server errors for this exact payload
        lastSavedJsonRef.current = serialized;
        setAutosaveStatus('error');
      }
    },
    [courseId, patchCourseMutation]
  );

  // Debounced autosave effect
  useEffect(() => {
    if (!enabled || !courseId) return;

    // Track courseId transitions: when a new courseId is assigned, sync baseline payload to prevent duplicate immediate PATCH
    if (prevCourseIdRef.current !== courseId) {
      prevCourseIdRef.current = courseId;
      lastSavedJsonRef.current = JSON.stringify(payload);
      return;
    }

    // Skip initial mount so we don't trigger PATCH immediately upon loading
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastSavedJsonRef.current = JSON.stringify(payload);
      return;
    }

    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedJsonRef.current) return;

    setAutosaveStatus('unsaved');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveImmediate(payload);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [courseId, payload, enabled, debounceMs, saveImmediate]);

  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await saveImmediate();
  }, [saveImmediate]);

  const resetSavedBaseline = useCallback((newBaseline: PatchCourseDto) => {
    lastSavedJsonRef.current = JSON.stringify(newBaseline);
    setAutosaveStatus('saved');
  }, []);

  return {
    autosaveStatus,
    flushSave,
    resetSavedBaseline,
    isSaving: autosaveStatus === 'saving',
  };
}
