import type { QueryClient } from '@tanstack/react-query';

export const TALENT_ONBOARDING_STATE_KEY = ['talent-onboarding', 'state'] as const;
export const MENTOR_ONBOARDING_STATE_KEY = ['mentor-onboarding', 'state'] as const;
export const EMPLOYER_ONBOARDING_STATE_KEY = ['employer-onboarding', 'state'] as const;

export async function refetchOnboardingState(
  queryClient: QueryClient,
  queryKey: readonly string[],
) {
  await queryClient.refetchQueries({ queryKey: [...queryKey] });
}

export function getOnboardingFieldsFromState(
  stateData: unknown,
): Record<string, unknown> | null {
  if (!stateData || typeof stateData !== 'object') return null;
  const root = stateData as { data?: { fields?: Record<string, unknown> }; fields?: Record<string, unknown> };
  const fields = root.data?.fields ?? root.fields;
  if (!fields || typeof fields !== 'object') return null;
  return fields;
}
