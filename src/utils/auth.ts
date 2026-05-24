import type { User } from '../services/queries/auth/types';
import {
  getMentorOnboardingRoute,
  isMentorOnboardingComplete,
} from './mentorOnboarding';

export function routeAfterAuth(user: User): string {
  const isEmailVerified = user.isEmailVerified ?? true;
  if (!isEmailVerified) return '/verify-email';

  const role = user.role?.toUpperCase();
  const onboardingStep = user.onboardingStep ?? 0;

  if (role === 'MENTOR') {
    if (isMentorOnboardingComplete(user)) {
      return '/dashboard';
    }
    return getMentorOnboardingRoute(onboardingStep, user);
  }

  const isOnboardingComplete =
    user.isOnboardingComplete ??
    user.onboardingCompleted ??
    (role !== 'MENTOR' && !!user.firstName);

  if (!isOnboardingComplete) {
    if (role === 'EMPLOYER') {
      return `/onboarding/employer?step=${onboardingStep + 1}`;
    }
    if (role === 'TALENT') {
      return `/onboarding/talent?step=${onboardingStep + 1}`;
    }

    return `/onboarding?step=${onboardingStep + 1}`;
  }

  return '/dashboard';
}
