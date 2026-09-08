import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { assessmentKeys } from '../services/queries/assessments';
import { parseGateResumeState } from '../utils/assessmentSession';
import { resolveGate1PostSubmitRoute, GATE1_SESSION1_FLOW, GATE1_FINAL_SCREEN } from '../utils/assessmentFlow';
import { GATE1_SESSION1_SCREENS } from '../services/queries/assessments/types';
import type { Gate1ScreenKey } from '../services/queries/assessments/types';

interface UseGate1PostSubmitNavigationOptions {
  roleSlug: string;
  assessmentId: string | null;
  finishedScreenKey: Gate1ScreenKey;
  refetchResumeState: () => Promise<unknown>;
  reloadAfterSubmit: () => void;
}

/** After submit: resolve next route by refetching authoritative resume-state from server. */
export const useGate1PostSubmitNavigation = ({
  roleSlug,
  assessmentId,
  finishedScreenKey,
  refetchResumeState,
  reloadAfterSubmit,
}: UseGate1PostSubmitNavigationOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    if (!roleSlug || !assessmentId) {
      reloadAfterSubmit();
      return;
    }

    // If Session 1 finished, navigate immediately to session-1/complete so Session 2 Screen 1 never flashes
    if (finishedScreenKey === GATE1_SESSION1_SCREENS[GATE1_SESSION1_SCREENS.length - 1]) {
      void queryClient.invalidateQueries({
        queryKey: assessmentKeys.resumeState(assessmentId, 1),
      });
      navigate(`/onboarding/talent/${roleSlug}/interview/session-1/complete`, { replace: true });
      return;
    }

    // If Gate 1 finished, navigate immediately to gate-1/review
    if (finishedScreenKey === GATE1_FINAL_SCREEN) {
      void queryClient.invalidateQueries({
        queryKey: assessmentKeys.resumeState(assessmentId, 1),
      });
      navigate(`/onboarding/talent/${roleSlug}/interview/gate-1/review`, { replace: true });
      return;
    }
    
    // Invalidate and refetch fresh resume-state from the backend first to prevent screen race/rewind
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
        // Only force reload if the screen key hasn't advanced yet.
        // If it did advance, the updated query cache will naturally transition the screen once without flicker.
        if (fresh.nextScreenKey === finishedScreenKey) {
          reloadAfterSubmit();
        }
    }
  }, [
    roleSlug,
    assessmentId,
    finishedScreenKey,
    refetchResumeState,
    reloadAfterSubmit,
    navigate,
    queryClient,
  ]);
};
