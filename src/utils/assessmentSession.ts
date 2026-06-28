import {
  GATE1_SESSION1_SCREENS,
  GATE1_SESSION2_SCREENS,
  type Gate1ScreenKey,
  type GateInProgressScreen,
  type GateProgressEntry,
  type GateResumeState,
  type ReviewSummaryEntry,
} from '../services/queries/assessments/types';

export const ACTIVE_ASSESSMENT_ID_KEY = 'active_assessment_id';

export const unwrapAssessmentData = <T>(response: unknown): T | null => {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  if ('data' in root && root.data !== undefined && root.data !== null) {
    return root.data as T;
  }
  return root as T;
};

/** Normalize GET .../gates/{gate}/resume-state — never derive screen order client-side. */
export const parseGateResumeState = (response: unknown): GateResumeState | null => {
  const unwrapped = unwrapAssessmentData<unknown>(response);
  if (!unwrapped || typeof unwrapped !== 'object') return null;

  const obj = unwrapped as Record<string, unknown>;
  const nextScreenKey = obj.nextScreenKey ?? obj.next_screen_key;
  if (typeof nextScreenKey !== 'string') return null;

  const session = obj.session === 2 || obj.currentSession === 2 ? 2 : 1;

  const inProgressRaw = obj.inProgress ?? obj.in_progress;
  let inProgress: GateInProgressScreen | null = null;
  if (inProgressRaw && typeof inProgressRaw === 'object') {
    const row = inProgressRaw as Record<string, unknown>;
    const screenKey = row.screenKey ?? row.screen_key;
    const componentId = row.componentId ?? row.component_id;
    if (typeof screenKey === 'string' && typeof componentId === 'string') {
      inProgress = {
        screenKey: screenKey as Gate1ScreenKey,
        componentId,
        session: row.session === 2 ? 2 : session,
      };
    }
  }

  const completedScreenKeys = (
    Array.isArray(obj.completedScreenKeys)
      ? obj.completedScreenKeys
      : Array.isArray(obj.completed_screen_keys)
        ? obj.completed_screen_keys
        : []
  ) as Gate1ScreenKey[];

  return {
    schemaVersion: typeof obj.schemaVersion === 'number' ? obj.schemaVersion : undefined,
    assessmentId: typeof obj.assessmentId === 'string' ? obj.assessmentId : undefined,
    session,
    sessionLabel: String(
      obj.sessionLabel ?? obj.session_label ?? (session === 1 ? 'How you think' : 'Your instincts'),
    ),
    nextScreenKey: nextScreenKey as Gate1ScreenKey,
    inProgress,
    completedScreenKeys,
    session1Screens: Array.isArray(obj.session1Screens)
      ? (obj.session1Screens as Gate1ScreenKey[])
      : [...GATE1_SESSION1_SCREENS],
    session2Screens: Array.isArray(obj.session2Screens)
      ? (obj.session2Screens as Gate1ScreenKey[])
      : [...GATE1_SESSION2_SCREENS],
    gate1Complete: obj.gate1Complete === true || obj.gate1_complete === true,
    pausedAt: typeof obj.pausedAt === 'string' ? obj.pausedAt : undefined,
    gateDeadlineRemainingSeconds:
      typeof obj.gateDeadlineRemainingSeconds === 'number'
        ? obj.gateDeadlineRemainingSeconds
        : undefined,
    gateDeadlineTotalSeconds:
      typeof obj.gateDeadlineTotalSeconds === 'number' ? obj.gateDeadlineTotalSeconds : undefined,
    screenTimerLimitSeconds:
      typeof obj.screenTimerLimitSeconds === 'number' ? obj.screenTimerLimitSeconds : undefined,
  };
};

/** Normalize gates/progress API payloads — array, `{ gates: [] }`, or single entry. */
export const parseGateProgressEntries = (response: unknown): GateProgressEntry[] => {
  const unwrapped = unwrapAssessmentData<unknown>(response);
  if (Array.isArray(unwrapped)) {
    return unwrapped as GateProgressEntry[];
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const obj = unwrapped as Record<string, unknown>;
    if (Array.isArray(obj.gates)) {
      return obj.gates as GateProgressEntry[];
    }
    if (typeof obj.gate === 'number') {
      return [obj as GateProgressEntry];
    }
  }
  return [];
};

export const findGate1ProgressEntry = (response: unknown): GateProgressEntry | null =>
  parseGateProgressEntries(response).find((entry) => entry.gate === 1) ?? null;

const isReviewSummaryEntry = (value: unknown): value is ReviewSummaryEntry => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.screenKey === 'string' && typeof entry.componentId === 'string';
};

/** Normalize review-summary API payloads — array or nested `{ entries | screens | items }`. */
export const parseReviewSummaryEntries = (response: unknown): ReviewSummaryEntry[] => {
  const unwrapped = unwrapAssessmentData<unknown>(response);
  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(isReviewSummaryEntry);
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const obj = unwrapped as Record<string, unknown>;
    for (const key of ['entries', 'screens', 'items', 'summaries'] as const) {
      if (Array.isArray(obj[key])) {
        return (obj[key] as unknown[]).filter(isReviewSummaryEntry);
      }
    }
    if (isReviewSummaryEntry(unwrapped)) {
      return [unwrapped];
    }
  }
  if (Array.isArray(response)) {
    return response.filter(isReviewSummaryEntry);
  }
  return [];
};

export const getActiveAssessmentId = (): string | null =>
  localStorage.getItem(ACTIVE_ASSESSMENT_ID_KEY);

export const setActiveAssessmentId = (assessmentId: string): void => {
  localStorage.setItem(ACTIVE_ASSESSMENT_ID_KEY, assessmentId);
};

/** Which screen key to pass to POST .../gates/1/start — always from resume-state, never client-derived. */
export const resolveGate1StartScreenKey = (resume: GateResumeState): Gate1ScreenKey =>
  resume.inProgress?.screenKey ?? resume.nextScreenKey;

export const isGate1Session1Screen = (screenKey: string): boolean =>
  (GATE1_SESSION1_SCREENS as readonly string[]).includes(screenKey);

export const isGate1Session2Screen = (screenKey: string): boolean =>
  (GATE1_SESSION2_SCREENS as readonly string[]).includes(screenKey);

export const isLastSession1Screen = (screenKey: Gate1ScreenKey): boolean =>
  screenKey === GATE1_SESSION1_SCREENS[GATE1_SESSION1_SCREENS.length - 1];

export const isFirstSession2Screen = (screenKey: Gate1ScreenKey): boolean =>
  screenKey === GATE1_SESSION2_SCREENS[0];

export const GATE1_SCREEN_LABELS: Record<Gate1ScreenKey, string> = {
  personality: 'Personality',
  values: 'Values',
  cognitive_fixed: 'Adaptive reasoning',
  numerical: 'Numerical reasoning',
  pattern: 'Pattern recognition',
  verbal: 'Verbal reasoning',
  sjt_single_best: 'Situational judgement',
  sjt_rank: 'Ranking scenarios',
  sjt_most_least: 'Most and least likely',
  sjt_multi_select: 'Multi-select scenarios',
  values_tradeoff: 'Values trade-off',
};

const GATE1_COGNITIVE_KEYS = new Set<Gate1ScreenKey>([
  'cognitive_fixed',
  'numerical',
  'pattern',
  'verbal',
]);

export const getGate1ScreenLabel = (screenKey: string): string =>
  GATE1_SCREEN_LABELS[screenKey as Gate1ScreenKey] ?? screenKey;

export const getGate1TotalScreens = (resume: GateResumeState): number =>
  resume.session1Screens.length + resume.session2Screens.length;

export const getGate1HighLevelTags = (resume: GateResumeState): string[] => {
  const tags: string[] = [];
  if (resume.session1Screens.includes('personality')) tags.push(GATE1_SCREEN_LABELS.personality);
  if (resume.session1Screens.includes('values')) tags.push(GATE1_SCREEN_LABELS.values);
  if (resume.session1Screens.some((k) => GATE1_COGNITIVE_KEYS.has(k))) tags.push('Cognitive');
  if (resume.session2Screens.length > 0) tags.push('Situational judgement');
  return tags;
};

export const isGate1TimedScreen = (screenKey: string): boolean =>
  GATE1_COGNITIVE_KEYS.has(screenKey as Gate1ScreenKey) ||
  screenKey.startsWith('sjt_');

export const buildGate1ResumeCrumbs = (
  resume: GateResumeState,
  screenKey: Gate1ScreenKey,
): string[] => [
  'Stage 1',
  `Session ${resume.session} · ${resume.sessionLabel}`,
  getGate1ScreenLabel(screenKey),
];

export const formatSecondsAsHms = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const formatRelativePausedTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Paused recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'Paused just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `Paused ${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins > 0
      ? `Paused ${hours} hour${hours === 1 ? '' : 's'}, ${remMins} minute${remMins === 1 ? '' : 's'} ago`
      : `Paused ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(hours / 24);
  return `Paused ${days} day${days === 1 ? '' : 's'} ago`;
};

export const resolveGate1ActiveScreenKey = (resume: GateResumeState): Gate1ScreenKey =>
  resume.inProgress?.screenKey ?? resume.nextScreenKey;

export const describeGate1ScreenProgress = (
  answered: number | undefined,
  total: number | undefined,
  hasInProgress: boolean,
): string => {
  if (hasInProgress && answered != null && total != null && total > 0) {
    const pct = Math.round((answered / total) * 100);
    if (pct >= 50) {
      return `You'd worked through about half of the questions when you tapped Save and finish later.`;
    }
    if (answered === 0) {
      return `You paused before answering any questions on this screen. Pick up where you left off.`;
    }
    return `You'd answered ${answered} of ${total} questions when you tapped Save and finish later.`;
  }
  if (hasInProgress) {
    return `You paused mid-way through this screen. Your progress is saved — pick up where you left off.`;
  }
  return `Your next screen is ready when you are.`;
};
