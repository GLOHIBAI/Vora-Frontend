import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseGateResumeState } from '../utils/assessmentSession';
import { resolveGate1PostSubmitRoute } from '../utils/assessmentFlow';
import type { Gate1ScreenKey, GateResumeState } from '../services/queries/assessments/types';

interface UseGate1PostSubmitNavigationOptions {
  roleSlug: string;
  assessmentId: string | null;
  finishedScreenKey: Gate1ScreenKey;
  refetchResumeState: () => Promise<unknown>;
  reloadAfterSubmit: () => void;
}

/** After submit: refetch resume-state (submit has no nextScreenKey) and route. */
export const useGate1PostSubmitNavigation = ({
  roleSlug,
  assessmentId,
  finishedScreenKey,
  refetchResumeState,
  reloadAfterSubmit,
}: UseGate1PostSubmitNavigationOptions) => {
  const navigate = useNavigate();

  return useCallback(async () => {
    if (!roleSlug || !assessmentId) {
      reloadAfterSubmit();
      return;
    }

    const result = await refetchResumeState();
    const fresh = parseGateResumeState(result.data);

    if (!fresh) {
      reloadAfterSubmit();
      return;
    }

    const route = resolveGate1PostSubmitRoute(finishedScreenKey, fresh);

    switch (route.type) {
      case 'review':
        navigate(`/onboarding/talent/${roleSlug}/assessment/gate-1/review`, { replace: true });
        return;
      case 'session1_complete':
        navigate(`/onboarding/talent/${roleSlug}/assessment/session-1/complete`, { replace: true });
        return;
      case 'reload':
      default:
        reloadAfterSubmit();
    }
  }, [
    roleSlug,
    assessmentId,
    finishedScreenKey,
    refetchResumeState,
    reloadAfterSubmit,
    navigate,
  ]);
};
