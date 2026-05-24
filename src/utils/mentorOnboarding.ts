/** Maps backend `onboardingStep` (0–4) to the correct mentor onboarding route. */
export function getMentorOnboardingRoute(onboardingStep = 0): string {
  if (onboardingStep < 1) {
    return '/onboarding/mentor-apply';
  }
  const profileStep = Math.min(onboardingStep + 1, 5);
  return `/onboarding/mentor-apply/profile?step=${profileStep}`;
}

export function isMentorOnboardingPath(pathname: string): boolean {
  return pathname.startsWith('/onboarding/mentor-apply');
}
