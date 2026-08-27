import { useMemo } from 'react';
import { useGate3ResumeStateQuery } from '../services/queries/assessments';
import type { Gate3ResumeState } from '../services/queries/assessments/types';
import { resolveGate1AssessmentId } from '../config/gate1Api';
import { getActiveAssessmentId, unwrapAssessmentData } from '../utils/assessmentSession';

export interface Gate3ResumeViewModel {
  welcomeText: string;
  pausedTimeText: string;
  positionTitle: string;
  positionDesc: string;
  crumbs: string[];
  deadlineLabel: string;
  deadlineRemainingSeconds: number | null;
  deadlineTotalFormatted: string;
  deadlineHint?: string;
  interviewTimerLabel: string;
  interviewTimerValue: string;
  completedLabel: string;
  completedValue: string;
  completedSub: string;
  resumePath: string;
  showRegenerationNotice: boolean;
  ctaLabel: string;
}

export const buildGate3ResumeViewModel = (
  resumeState: Gate3ResumeState,
  roleSlug: string,
): Gate3ResumeViewModel => {
  const currentQ = resumeState.progress?.current || 1;
  const totalQ = resumeState.progress?.total || 6;
  const answeredQ =
    resumeState.progress?.answered ??
    resumeState.progress?.uploaded ??
    (resumeState.videoUploads ? Object.keys(resumeState.videoUploads).length : 0);

  const isCompleted = resumeState.gate3Complete || resumeState.nextStep === 'STAGE3_COMPLETE';
  const isCandidateQuestions = resumeState.nextStep === 'CANDIDATE_QUESTIONS';

  const base = `/onboarding/talent/${roleSlug}/interview/stage-3`;

  let resumePath: string;
  switch (resumeState.nextStep) {
    case 'STAGE3_COMPLETE':
    case 'GATE3_REVIEW':
      resumePath = `${base}/complete`;
      break;
    case 'CANDIDATE_VOICE':
    case 'CANDIDATE_QUESTIONS':
      resumePath = `${base}/candidate-questions`;
      break;
    case 'RESUME_ITEMS':
    case 'GATE3_ITEMS':
      resumePath = `${base}/video`;
      break;
    case 'START_GATE3':
    default:
      resumePath = `${base}/video`;
      break;
  }

  const remaining = Math.max(0, totalQ - answeredQ);

  return {
    welcomeText: isCompleted ? 'Stage 3 Complete' : `Welcome back — Question ${currentQ} of ${totalQ}`,
    pausedTimeText: isCompleted ? 'All responses recorded' : `Paused at Question ${currentQ}`,
    positionTitle: 'Stage 3 · How you show up',
    positionDesc: 'Short recorded video responses demonstrating how you communicate and reason.',
    crumbs: ['Stage 3', 'How you show up', `Question ${currentQ}`],
    deadlineLabel: 'Interview window',
    deadlineRemainingSeconds: resumeState.timers?.gateLimitSecs || null,
    deadlineTotalFormatted: '15 mins',
    deadlineHint: 'Recorded video questions with up to 1 retake each',
    interviewTimerLabel: 'Time per response',
    interviewTimerValue: '1:00 - 2:00 mins',
    completedLabel: 'Responses uploaded',
    completedValue: `${answeredQ} of ${totalQ}`,
    completedSub: remaining > 0 ? `${remaining} remaining` : 'All questions answered',
    resumePath,
    showRegenerationNotice: false,
    ctaLabel: isCompleted ? 'View results' : 'Resume video interview',
  };
};

export const useGate3ResumePresentation = (roleSlug: string, enabled = true) => {
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const {
    data: resumeRaw,
    isLoading: resumeLoading,
    isFetched: resumeFetched,
    isError,
    error,
  } = useGate3ResumeStateQuery(assessmentId, {
    enabled: enabled && !!assessmentId,
  });

  const resumeState = useMemo(() => {
    if (!resumeRaw) return null;
    const unwrapped = unwrapAssessmentData<Gate3ResumeState>(resumeRaw);
    return unwrapped ?? (resumeRaw as Gate3ResumeState);
  }, [resumeRaw]);

  const viewModel = useMemo((): Gate3ResumeViewModel | null => {
    if (!resumeState) return null;
    return buildGate3ResumeViewModel(resumeState, roleSlug);
  }, [resumeState, roleSlug]);

  const locked =
    isError &&
    ((error as { status?: number } | null)?.status === 400 ||
      String((error as { message?: string } | null)?.message || '')
        .toLowerCase()
        .includes('locked'));

  return {
    assessmentId,
    resumeState,
    viewModel,
    isLoading: enabled && !!assessmentId && (resumeLoading || !resumeFetched),
    isError,
    locked,
  };
};
