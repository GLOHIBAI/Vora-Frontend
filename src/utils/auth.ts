import type { User } from '../services/queries/auth/types';
import { getMentorOnboardingRoute } from './mentorOnboarding';

export function routeAfterAuth(user: User): string {
  const isEmailVerified = user.isEmailVerified ?? true;
  if (!isEmailVerified) return '/verify-email';

  const isOnboardingComplete = user.isOnboardingComplete ?? (!!user.firstName);
  if (!isOnboardingComplete) {
    const onboardingStep = user.onboardingStep ?? 0;
    const role = user.role?.toUpperCase();

    if (role === 'MENTOR') {
      return getMentorOnboardingRoute(onboardingStep);
    }
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
