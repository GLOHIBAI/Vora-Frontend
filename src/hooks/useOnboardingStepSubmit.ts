import { useCallback, useState } from 'react';

/** Keeps the step CTA in "Processing…" through the step API and a follow-up state refetch. */
export function useOnboardingStepSubmit() {
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);

  const runStepSubmit = useCallback(async (fn: () => Promise<void>) => {
    setIsSubmittingStep(true);
    try {
      await fn();
    } finally {
      setIsSubmittingStep(false);
    }
  }, []);

  return { isSubmittingStep, runStepSubmit };
}
