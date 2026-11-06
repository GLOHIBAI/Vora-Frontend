/**
 * Utilities for sharing course links and managing external learner enrollment context.
 */

export interface CourseEnrollContext {
  slug?: string;
  courseId: string;
  title?: string;
  instructorName?: string;
  thumbnailUrl?: string;
}

export const COURSE_ENROLL_CONTEXT_KEY = 'voraCourseEnrollContext';

export const saveCourseEnrollContext = (context: CourseEnrollContext): void => {
  try {
    const json = JSON.stringify(context);
    sessionStorage.setItem(COURSE_ENROLL_CONTEXT_KEY, json);
    localStorage.setItem(COURSE_ENROLL_CONTEXT_KEY, json);
  } catch (e) {
    console.warn('[courseSignup] Failed to save course context to storage', e);
  }
};

export const loadCourseEnrollContext = (): CourseEnrollContext | null => {
  try {
    const raw =
      sessionStorage.getItem(COURSE_ENROLL_CONTEXT_KEY) ||
      localStorage.getItem(COURSE_ENROLL_CONTEXT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CourseEnrollContext;
  } catch (e) {
    console.warn('[courseSignup] Failed to load course context from storage', e);
    return null;
  }
};

export const clearCourseEnrollContext = (): void => {
  try {
    sessionStorage.removeItem(COURSE_ENROLL_CONTEXT_KEY);
    localStorage.removeItem(COURSE_ENROLL_CONTEXT_KEY);
  } catch (e) {
    console.warn('[courseSignup] Failed to clear course context from storage', e);
  }
};

export const getCourseShareUrl = (courseIdOrSlug: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vora.ai';
  return `${origin}/courses/${encodeURIComponent(courseIdOrSlug)}`;
};

