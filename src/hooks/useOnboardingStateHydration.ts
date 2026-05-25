import { useEffect, useRef } from 'react';

type UseOnboardingStateHydrationOptions = {
  step: number;
  isStateFetching: boolean;
  /** Raw onboarding state query `data` (or nested `.data`). */
  stateData: unknown;
  isComplete?: boolean;
  getSavedFields: (stateData: unknown) => Record<string, unknown> | null;
  /** Apply API fields for a single wizard step (1-based). */
  hydrateStep: (targetStep: number, savedFields: Record<string, unknown>) => void;
};

/**
 * Hydrates onboarding forms from GET …/onboarding/state without overwriting
 * the step the user is currently editing when state refetches in the background.
 */
export function useOnboardingStateHydration({
  step,
  isStateFetching,
  stateData,
  isComplete = false,
  getSavedFields,
  hydrateStep,
}: UseOnboardingStateHydrationOptions) {
  const prevStepRef = useRef(step);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (isStateFetching || isComplete) return;

    const savedFields = getSavedFields(stateData);
    if (!savedFields || Object.keys(savedFields).length === 0) return;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      for (let k = 1; k <= step; k += 1) {
        hydrateStep(k, savedFields);
      }
      prevStepRef.current = step;
      return;
    }

    const stepChanged = prevStepRef.current !== step;
    prevStepRef.current = step;

    if (stepChanged) {
      hydrateStep(step, savedFields);
      return;
    }

    for (let completedStep = 1; completedStep < step; completedStep += 1) {
      hydrateStep(completedStep, savedFields);
    }
  }, [stateData, isStateFetching, step, isComplete, getSavedFields, hydrateStep]);
}
