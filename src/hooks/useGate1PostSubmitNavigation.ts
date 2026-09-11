import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { assessmentKeys } from '../services/queries/assessments';
import { parseGateResumeState } from '../utils/assessmentSession';
import { resolveGate1PostSubmitRoute, GATE1_SESSION1_FLOW, GATE1_FINAL_SCREEN } from '../utils/assessmentFlow';
import { GATE1_SESSION1_SCREENS, type AssessmentSubmitResponse, type Gate1ScreenKey } from '../services/queries/assessments/types';

interface UseGate1PostSubmitNavigationOptions {
  roleSlug: string;
  assessmentId: string | null;
  finishedScreenKey: Gate1ScreenKey;
  refetchResumeState: () => Promise<unknown>;
  reloadAfterSubmit: () => void;
  advanceToNextScreen?: (nextKey: Gate1ScreenKey) => Promise<void>;
}

/** After submit: resolve next route using submit result's nextScreenKey directly, or fallback to resume-state. */
export const useGate1PostSubmitNavigation = ({
  roleSlug,
  assessmentId,
  finishedScreenKey,
  refetchResumeState,
  reloadAfterSubmit,
  advanceToNextScreen,
}: UseGate1PostSubmitNavigationOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(async (submitResult?: AssessmentSubmitResponse) => {
    if (!roleSlug || !assessmentId) {
      reloadAfterSubmit();
      return;
    }

    const nextScreenInfo = submitResult?.nextScreen;
    const nextScreenKey = (nextScreenInfo?.nextScreenKey ?? submitResult?.nextScreenKey ?? null) as Gate1ScreenKey | null;
    const isGate1Complete =
      submitResult?.gate1Complete === true ||
      (nextScreenKey === null && finishedScreenKey === GATE1_FINAL_SCREEN);

    // 1. If Gate 1 is finished (11th screen / values_tradeoff, or gate1Complete flag)
    if (isGate1Complete || finishedScreenKey === GATE1_FINAL_SCREEN) {
      void queryClient.invalidateQueries({
        queryKey: assessmentKeys.resumeState(assessmentId, 1),
      });
      navigate(`/onboarding/talent/${roleSlug}/interview/gate-1/review`, { replace: true });
      return;
    }

    // 2. If Session 1 finished, navigate immediately to session-1/complete so Session 2 Screen 1 never flashes
    if (finishedScreenKey === GATE1_SESSION1_SCREENS[GATE1_SESSION1_SCREENS.length - 1]) {
      void queryClient.invalidateQueries({
        queryKey: assessmentKeys.resumeState(assessmentId, 1),
      });
      navigate(`/onboarding/talent/${roleSlug}/interview/session-1/complete`, { replace: true });
      return;
    }

    // 3. Direct advancement: use submit's nextScreenKey directly without refetching resume-state
    if (nextScreenKey && advanceToNextScreen) {
      await advanceToNextScreen(nextScreenKey);
      return;
    }

    // 4. Fallback only if submit did not supply nextScreenKey:
    await queryClient.invalidateQueries({
      queryKey: assessmentKeys.resumeState(assessmentId, 1),
    });
    const refetched = await refetchResumeState();
    const fresh = parseGateResumeState(
      (refetched as any)?.data ?? queryClient.getQueryData(assessmentKeys.resumeState(assessmentId, 1))
    );

    if (!fresh) {
      reloadAfterSubmit();
      return;
    }

    const route = resolveGate1PostSubmitRoute(finishedScreenKey, fresh);

    switch (route.type) {
      case 'review':
        navigate(`/onboarding/talent/${roleSlug}/interview/gate-1/review`, { replace: true });
        return;
      case 'session1_complete':
        navigate(`/onboarding/talent/${roleSlug}/interview/session-1/complete`, { replace: true });
        return;
      case 'reload':
      default:
        if (fresh.nextScreenKey && advanceToNextScreen) {
          await advanceToNextScreen(fresh.nextScreenKey);
        } else {
          reloadAfterSubmit();
        }
    }
  }, [
    roleSlug,
    assessmentId,
    finishedScreenKey,
    refetchResumeState,
    reloadAfterSubmit,
    advanceToNextScreen,
    navigate,
    queryClient,
  ]);
};
