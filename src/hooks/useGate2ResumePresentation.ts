import { useMemo } from 'react';
import { useGateResumeStateQuery } from '../services/queries/assessments';
import type { Gate2ResumeState } from '../services/queries/assessments/types';
import { resolveGate1AssessmentId } from '../config/gate1Api';
import {
  buildGate2ResumeViewModel,
  parseGate2ResumeState,
  type Gate2ResumeViewModel,
} from '../utils/stage2Flow';

export type { Gate2ResumeViewModel };

/**
 * Loads GET .../gates/2/resume-state and maps leave-off UI + Resume navigation.
 * Do not use Gate 1 resume-state for Stage 2.
 */
export const useGate2ResumePresentation = (roleSlug: string, enabled = true) => {
  const assessmentId = resolveGate1AssessmentId();

  const {
    data: resumeRaw,
    isLoading: resumeLoading,
    isFetched: resumeFetched,
    isError,
    error,
  } = useGateResumeStateQuery(assessmentId ?? '', 2, {
    enabled: enabled && !!assessmentId,
  });

  const resumeState = useMemo(
    () => parseGate2ResumeState(resumeRaw),
    [resumeRaw],
  );

  const viewModel = useMemo((): Gate2ResumeViewModel | null => {
    if (!resumeState) return null;
    return buildGate2ResumeViewModel(resumeState, roleSlug);
  }, [resumeState, roleSlug]);

  const locked =
    isError &&
    ((error as { status?: number } | null)?.status === 400 ||
      String((error as { message?: string } | null)?.message || '')
        .toLowerCase()
        .includes('locked'));

  return {
    assessmentId,
    resumeState: resumeState as Gate2ResumeState | null,
    viewModel,
    isLoading: enabled && !!assessmentId && (resumeLoading || !resumeFetched),
    isError,
    locked,
  };
};
