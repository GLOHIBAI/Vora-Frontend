import type { User } from '../services/queries/auth/types';
import {
  getMentorOnboardingRoute,
  isMentorOnboardingComplete,
} from './mentorOnboarding';
import { loadCourseEnrollContext } from './courseSignup';

export function routeAfterAuth(user: User, nextStep?: string, courseId?: string): string {
  const isEmailVerified = user.isEmailVerified ?? true;
  if (!isEmailVerified) return '/verify-email';

  const courseContext = loadCourseEnrollContext();
  const targetCourseId = courseId || courseContext?.courseId;

  // Direct backend nextStep routing contract
  if (nextStep === 'COURSE_PLAYER') {
    return targetCourseId ? `/courses/${targetCourseId}` : '/courses';
  }
  if (nextStep === 'LEARNER_ONBOARDING') {
    return '/onboarding/learner';
  }
  if (nextStep === 'ONBOARDING') {
    return '/onboarding/talent';
  }

  const role = user.role?.toUpperCase();
  const onboardingStep = user.onboardingStep ?? 0;

  if (role === 'MENTOR') {
    if (isMentorOnboardingComplete(user)) {
      return '/dashboard';
    }
    return getMentorOnboardingRoute(onboardingStep, user);
  }

  // 1. External course enrollment onboarding check:
  // If user signed up via course link or has course context, and has not yet completed the learner onboarding setup,
  // ALWAYS route them to /onboarding/learner (do not jump directly to the player!)
  const isLearnerOnboardingDone =
    (user as any)?.isLearnerOnboardingComplete === true ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('vora_learner_onboarding_completed') === 'true');

  if ((courseContext || targetCourseId) && !isLearnerOnboardingDone) {
    return '/onboarding/learner';
  }

  const isOnboardingComplete =
    user.isOnboardingComplete === true || user.onboardingCompleted === true;

  if (!isOnboardingComplete) {
    if (role === 'EMPLOYER') {
      return `/onboarding/employer?step=${onboardingStep + 1}`;
    }
    if (
      courseContext ||
      targetCourseId ||
      (user as any)?.isLearner ||
      (typeof window !== 'undefined' && localStorage.getItem('vora_user_track') === 'learner')
    ) {
      return '/onboarding/learner';
    }
    if (role === 'TALENT') {
      return '/onboarding/talent';
    }

    return '/onboarding';
  }

  // If already onboarding complete and arrived via course link, take straight to course player!
  if (targetCourseId) {
    return `/courses/${targetCourseId}`;
  }

  // For course-first learners, land on Courses rather than the generic employer/job dashboard
  const isLearnerTrack = Boolean(
    (user as any)?.isLearner ||
    (typeof window !== 'undefined' && localStorage.getItem('vora_user_track') === 'learner') ||
    Boolean(courseContext)
  );
  if (isLearnerTrack) {
    return '/courses';
  }

  return '/dashboard';
}
