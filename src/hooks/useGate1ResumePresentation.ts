import { useMemo } from 'react';
import {
  useAssessmentDraftQuery,
  useAssessmentGatesProgressQuery,
  useAssessmentScreensQuery,
  useGateResumeStateQuery,
} from '../services/queries/assessments';
import type {
  AssessmentDraftResponse,
  AssessmentScreenCatalog,
  Gate1ScreenKey,
  GateProgressEntry,
  GateResumeState,
} from '../services/queries/assessments/types';
import {
  buildGate1ResumeCrumbs,
  describeGate1ScreenProgress,
  formatRelativePausedTime,
  formatSecondsAsHms,
  findGate1ProgressEntry,
  getGate1ScreenLabel,
  getGate1TotalScreens,
  isGate1TimedScreen,
  parseGateResumeState,
  resolveGate1ActiveScreenKey,
  unwrapAssessmentData,
} from '../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../config/gate1Api';

export interface Gate1ResumeViewModel {
  welcomeText: string;
  pausedTimeText: string;
  positionTitle: string;
  positionDesc: string;
  crumbs: string[];
  deadlineLabel: string;
  deadlineRemainingSeconds: number | null;
  deadlineTotalSeconds: number | null;
  deadlineTotalFormatted: string;
  screenTimerLabel: string;
  screenTimerValue: string;
  completedValue: string;
  completedSub: string;
  showRegenerationNotice: boolean;
  resumePath: string;
}

const DEFAULT_GATE1_WINDOW_SECONDS = 48 * 3600;

const resolveScreenTimerLabel = (screenKey: Gate1ScreenKey): string => {
  if (screenKey.startsWith('sjt_') || screenKey === 'values_tradeoff') {
    return 'Section timer';
  }
  if (isGate1TimedScreen(screenKey)) {
    return 'Section timer';
  }
  return 'Estimated time';
};

const resolveScreenTimerValue = (
  screenKey: Gate1ScreenKey,
  limitSeconds: number | undefined,
  catalog: AssessmentScreenCatalog[],
): string => {
  if (limitSeconds != null && limitSeconds > 0) {
    return formatSecondsAsHms(limitSeconds);
  }
  const entry = catalog.find((c) => c.screenKey === screenKey);
  if (entry?.estimatedMinutes) {
    return `${entry.estimatedMinutes} min`;
  }
  if (isGate1TimedScreen(screenKey)) {
    return '15:00';
  }
  return '—';
};

const resolvePausedTime = (
  resume: GateResumeState,
  draft: AssessmentDraftResponse | null,
): string => {
  const iso =
    resume.pausedAt ??
    draft?.lastSavedAt ??
    draft?.updatedAt ??
    null;
  return iso ? formatRelativePausedTime(iso) : 'Paused recently';
};

const buildViewModel = (
  resume: GateResumeState,
  gateProgress: GateProgressEntry | null,
  draft: AssessmentDraftResponse | null,
  catalog: AssessmentScreenCatalog[],
  roleSlug: string,
): Gate1ResumeViewModel => {
  const screenKey = resolveGate1ActiveScreenKey(resume);
  const hasInProgress = resume.inProgress != null;
  const totalScreens = gateProgress?.totalScreens ?? getGate1TotalScreens(resume);
  const completedScreens =
    gateProgress?.completedScreens ?? resume.completedScreenKeys.length;

  const deadlineRemainingSeconds =
    gateProgress?.deadlineRemainingSeconds ??
    resume.gateDeadlineRemainingSeconds ??
    null;

  const deadlineTotalSeconds =
    gateProgress?.deadlineTotalSeconds ??
    resume.gateDeadlineTotalSeconds ??
    DEFAULT_GATE1_WINDOW_SECONDS;

  const answered = draft?.progress?.answered;
  const total = draft?.progress?.total;

  return {
    welcomeText: hasInProgress
      ? 'You paused mid-way through Stage 1. Your timer kept running, but everything else is exactly where you left it.'
      : 'Welcome back to Stage 1. Pick up on your next screen whenever you are ready.',
    pausedTimeText: resolvePausedTime(resume, draft),
    positionTitle: getGate1ScreenLabel(screenKey),
    positionDesc: describeGate1ScreenProgress(answered, total, hasInProgress),
    crumbs: buildGate1ResumeCrumbs(resume, screenKey),
    deadlineLabel: 'Stage 1 deadline',
    deadlineRemainingSeconds,
    deadlineTotalSeconds: deadlineRemainingSeconds != null ? deadlineTotalSeconds : null,
    deadlineTotalFormatted: formatSecondsAsHms(deadlineTotalSeconds),
    screenTimerLabel: resolveScreenTimerLabel(screenKey),
    screenTimerValue: resolveScreenTimerValue(
      screenKey,
      resume.screenTimerLimitSeconds,
      catalog,
    ),
    completedValue: `${completedScreens} / ${totalScreens}`,
    completedSub: 'screens in Stage 1',
    showRegenerationNotice: hasInProgress,
    resumePath: `/onboarding/talent/${roleSlug}/assessment/session-1/situational`,
  };
};

export const useGate1ResumePresentation = (roleSlug: string) => {
  const assessmentId = resolveGate1AssessmentId();

  const {
    data: resumeRaw,
    isLoading: resumeLoading,
    isFetched: resumeFetched,
  } = useGateResumeStateQuery(assessmentId ?? '', 1, { enabled: !!assessmentId });

  const { data: progressRaw, isLoading: progressLoading } = useAssessmentGatesProgressQuery(
    assessmentId ?? '',
    { enabled: !!assessmentId },
  );

  const { data: screensRaw, isLoading: screensLoading } = useAssessmentScreensQuery(1);

  const resumeState = useMemo(
    () => parseGateResumeState(resumeRaw),
    [resumeRaw],
  );

  const gateProgress = useMemo(
    () => findGate1ProgressEntry(progressRaw),
    [progressRaw],
  );

  const catalog = useMemo(() => {
    const data = unwrapAssessmentData<AssessmentScreenCatalog[]>(screensRaw);
    return Array.isArray(data) ? data : [];
  }, [screensRaw]);

  const inProgressComponentId = resumeState?.inProgress?.componentId ?? '';

  const { data: draftRaw, isLoading: draftLoading } = useAssessmentDraftQuery(
    assessmentId ?? '',
    inProgressComponentId,
    { enabled: !!assessmentId && !!inProgressComponentId },
  );

  const draft = useMemo(
    () => unwrapAssessmentData<AssessmentDraftResponse>(draftRaw),
    [draftRaw],
  );

  const viewModel = useMemo(() => {
    if (!resumeState) return null;
    return buildViewModel(resumeState, gateProgress, draft, catalog, roleSlug);
  }, [resumeState, gateProgress, draft, catalog, roleSlug]);

  const isLoading =
    !!assessmentId &&
    (resumeLoading || progressLoading || screensLoading || (!!inProgressComponentId && draftLoading));

  const hasStarted =
    !!resumeState &&
    (resumeState.completedScreenKeys.length > 0 ||
      resumeState.inProgress != null ||
      resumeState.nextScreenKey !== resumeState.session1Screens[0]);

  return {
    assessmentId,
    resumeState,
    gateProgress,
    viewModel,
    catalog,
    isLoading: isLoading || (!!assessmentId && !resumeFetched),
    hasStarted,
  };
};
