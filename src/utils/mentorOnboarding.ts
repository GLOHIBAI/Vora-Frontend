/** User-like shape from auth login or onboarding state API. */
export type MentorOnboardingUserFields = {
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  isOnboardingComplete?: boolean;
};

/** Raw mentor onboarding state payload from GET /mentors/onboarding/state */
export type MentorOnboardingStatePayload = {
  step?: number;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  fields?: Record<string, unknown>;
  onboarding?: Record<string, unknown>;
};

export type NormalizedMentorOnboardingState = {
  step: number;
  onboardingCompleted: boolean;
  fields: Record<string, unknown>;
};

/** Backend may return `onboardingStep` + `onboarding`, or legacy `step` + `fields`. */
export function normalizeMentorOnboardingState(
  data?: MentorOnboardingStatePayload | null,
): NormalizedMentorOnboardingState | null {
  if (!data) return null;

  const step = data.onboardingStep ?? data.step ?? 0;
  const fields = (data.fields ?? data.onboarding ?? {}) as Record<string, unknown>;

  return {
    step,
    onboardingCompleted: data.onboardingCompleted === true,
    fields,
  };
}

/** True when mentor onboarding is finished (step 5 + completed flag from API). */
export function isMentorOnboardingComplete(user?: MentorOnboardingUserFields | null): boolean {
  if (!user) return false;

  return user.onboardingCompleted === true || user.isOnboardingComplete === true;
}

/** Maps backend onboarding step to mentor onboarding route, or dashboard if done. */
export function getMentorOnboardingRoute(
  onboardingStep = 0,
  user?: MentorOnboardingUserFields | null,
): string {
  if (isMentorOnboardingComplete(user ?? { onboardingStep })) {
    return '/dashboard';
  }

  if (onboardingStep < 1) {
    return '/onboarding/mentor-apply';
  }

  const profileStep = Math.min(Math.max(onboardingStep, 1), 5);
  return `/onboarding/mentor-apply/profile?step=${profileStep}`;
}

export function isMentorOnboardingPath(pathname: string): boolean {
  return pathname.startsWith('/onboarding/mentor-apply');
}

/** Route when user clicks Proceed on the mentor welcome screen. */
export function getMentorOnboardingProceedRoute(
  onboardingStep = 0,
  user?: MentorOnboardingUserFields | null,
): string {
  if (isMentorOnboardingComplete(user)) {
    return '/dashboard';
  }

  const profileStep =
    onboardingStep >= 1 ? Math.min(Math.max(onboardingStep, 1), 5) : 1;
  return `/onboarding/mentor-apply/profile?step=${profileStep}`;
}

/** Wizard step for routing when resuming from API state (handles completed-step offset). */
export function getMentorOnboardingProfileStep(
  state?: MentorOnboardingStatePayload | null,
  userStep?: number,
): number {
  const normalized = normalizeMentorOnboardingState(state);
  if (normalized) {
    return getMentorWizardUiStep(normalized.step, normalized.fields);
  }
  return userStep && userStep >= 1 ? Math.min(userStep, 5) : 1;
}

/** Normalize onboarding state API (`step` / `onboardingStep`) and auth user. */
export function resolveMentorOnboardingStep(
  state?: MentorOnboardingStatePayload | null,
  userStep?: number,
): number {
  const normalized = normalizeMentorOnboardingState(state);
  return normalized?.step ?? userStep ?? 0;
}

/** Whether saved onboarding fields indicate a wizard step is fully submitted. */
export function isMentorWizardStepComplete(
  wizardStep: number,
  fields?: Record<string, unknown>,
): boolean {
  const f = fields ?? {};
  switch (wizardStep) {
    case 1:
      return !!(f.title && f.firstName && f.lastName);
    case 2:
      return !!(
        Array.isArray(f.primaryExpertise) &&
        (f.primaryExpertise as unknown[]).length > 0
      );
    case 3:
      return !!(f.currentRole && f.organization && f.yearsOfExperienceBand);
    case 4:
      return !!(
        Array.isArray(f.mentorshipFormat) &&
        (f.mentorshipFormat as unknown[]).length > 0 &&
        f.sessionsPerMonth &&
        f.timezone
      );
    case 5:
      return !!f.courseIntent;
    default:
      return false;
  }
}

/**
 * Map API onboardingStep to the wizard step the user should see.
 * PUT responses often return the step just saved (e.g. 2 after step-2); resume on N+1 when that step's data exists.
 */
export function getMentorWizardUiStep(
  apiStep: number,
  fields?: Record<string, unknown>,
): number {
  const step = Math.min(Math.max(apiStep, 1), 5);
  if (step < 5 && isMentorWizardStepComplete(step, fields)) {
    return step + 1;
  }
  return step;
}

/**
 * After saving wizard step N, advance to the next UI step.
 * API may return onboardingStep N (step just saved) instead of N+1.
 */
export function getNextMentorOnboardingStepAfterSave(
  savedWizardStep: number,
  apiReturnedStep?: number,
): number {
  if (apiReturnedStep != null && apiReturnedStep > savedWizardStep) {
    return Math.min(apiReturnedStep, 5);
  }
  return Math.min(savedWizardStep + 1, 5);
}
