import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { assessmentKeys } from '../services/queries/assessments';
import { parseGateResumeState } from '../utils/assessmentSession';
import { resolveGate1PostSubmitRoute } from '../utils/assessmentFlow';
import type { Gate1ScreenKey } from '../services/queries/assessments/types';

interface UseGate1PostSubmitNavigationOptions {
  roleSlug: string;
  assessmentId: string | null;
  finishedScreenKey: Gate1ScreenKey;
  refetchResumeState: () => Promise<unknown>;
  reloadAfterSubmit: () => void;
}

/** After submit: resolve next route directly from query cache state. */
export const useGate1PostSubmitNavigation = ({
  roleSlug,
  assessmentId,
  finishedScreenKey,
  reloadAfterSubmit,
}: UseGate1PostSubmitNavigationOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!roleSlug || !assessmentId) {
      reloadAfterSubmit();
      return;
    }
    
    // Read the fresh state directly from the query client cache (which was just updated in onSuccess)
    const cachedData = queryClient.getQueryData<unknown>(
      assessmentKeys.resumeState(assessmentId, 1)
    );
    const fresh = parseGateResumeState(cachedData);

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
        reloadAfterSubmit();
    }
  }, [
    roleSlug,
    assessmentId,
    finishedScreenKey,
    reloadAfterSubmit,
    navigate,
    queryClient,
  ]);
};
