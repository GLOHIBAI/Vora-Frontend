import { GATE1_JOURNEY_SCREENS } from '../utils/assessmentFlow';
import {
  GATE1_SESSION1_SCREENS,
  GATE1_SESSION2_SCREENS,
  type AdaptiveStepResponse,
  type AssessmentDraftResponse,
  type AssessmentGateStartResponse,
  type AssessmentItem,
  type AssessmentScreenCatalog,
  type AssessmentSubmitResponse,
  type Gate1ScreenKey,
  type GateProgressEntry,
  type GateResumeState,
  type GateVerdictResponse,
  type ResponsesMap,
  type ReviewSummaryEntry,
  type SaveDraftResponse,
} from '../services/queries/assessments/types';
export const MOCK_GATE1_ASSESSMENT_ID = 'mock-gate1-assessment';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const componentIdFor = (screenKey: Gate1ScreenKey) => `mock-component-${screenKey}`;

const buildLikertItem = (screenKey: Gate1ScreenKey): AssessmentItem => ({
  id: `item-${screenKey}-likert`,
  type: 'likert_scale',
  sequence: 1,
  total: 1,
  title: 'Stage 1 (mock)',
  content: {
    questions: [
      { id: `${screenKey}-q1`, stem: `Sample statement for ${screenKey} (mock mode).` },
      { id: `${screenKey}-q2`, stem: `Another statement for ${screenKey} (mock mode).` },
    ],
  },
  saveResume: true,
});

const buildScreenItems = (screenKey: Gate1ScreenKey): AssessmentItem[] => {
  if (screenKey === 'cognitive_fixed') {
    return [
      {
        id: `item-${screenKey}-adaptive`,
        type: 'adaptive_mcq',
        sequence: 1,
        total: 1,
        content: {
          stem: 'Adaptive reasoning sample (mock). Which approach is most systematic?',
          stepIndex: 0,
          totalSteps: 1,
          complete: false,
          options: [
            { id: 'opt-a', label: 'Break the problem into smaller parts' },
            { id: 'opt-b', label: 'Guess and adjust later' },
          ],
        },
      },
    ];
  }
  return [buildLikertItem(screenKey)];
};

const sessionForScreen = (screenKey: Gate1ScreenKey): 1 | 2 =>
  (GATE1_SESSION1_SCREENS as readonly string[]).includes(screenKey) ? 1 : 2;

interface MockComponentState {
  screenKey: Gate1ScreenKey;
  items: AssessmentItem[];
  responses: ResponsesMap;
  adaptiveSteps: Record<string, number>;
}

const state = {
  completedScreenKeys: [] as Gate1ScreenKey[],
  inProgressScreenKey: null as Gate1ScreenKey | null,
  gate1Complete: false,
  components: new Map<string, MockComponentState>(),
};

const resetIfNeeded = () => {
  if (state.components.size === 0 && state.completedScreenKeys.length === 0) {
    state.inProgressScreenKey = 'personality';
  }
};

export const resetGate1MockSession = (): void => {
  state.completedScreenKeys = [];
  state.inProgressScreenKey = 'personality';
  state.gate1Complete = false;
  state.components.clear();
};

export const mockBeginAssessment = async (): Promise<{ data: { assessmentId: string } }> => {
  resetGate1MockSession();
  await delay();
  return { data: { assessmentId: MOCK_GATE1_ASSESSMENT_ID } };
};

export const mockGate1ResumeState = async (): Promise<{ data: GateResumeState }> => {
  resetIfNeeded();
  await delay();
  const nextScreenKey =
    state.gate1Complete
      ? GATE1_JOURNEY_SCREENS[GATE1_JOURNEY_SCREENS.length - 1]
      : state.inProgressScreenKey ??
        (GATE1_JOURNEY_SCREENS.find((key) => !state.completedScreenKeys.includes(key)) ??
          'personality');

  const session = sessionForScreen(nextScreenKey);
  const inProgress =
    state.inProgressScreenKey && !state.gate1Complete
      ? {
          screenKey: state.inProgressScreenKey,
          componentId: componentIdFor(state.inProgressScreenKey),
          session,
        }
      : null;

  return {
    data: {
      session,
      sessionLabel: session === 1 ? 'How you think' : 'Your instincts',
      nextScreenKey,
      inProgress,
      completedScreenKeys: [...state.completedScreenKeys],
      session1Screens: [...GATE1_SESSION1_SCREENS],
      session2Screens: [...GATE1_SESSION2_SCREENS],
      gate1Complete: state.gate1Complete,
      pausedAt: inProgress ? new Date().toISOString() : undefined,
    },
  };
};

export const mockGate1StartScreen = async (
  screenKey: Gate1ScreenKey,
): Promise<AssessmentGateStartResponse> => {
  await delay();
  const items = buildScreenItems(screenKey);
  const componentId = componentIdFor(screenKey);
  state.inProgressScreenKey = screenKey;
  state.components.set(componentId, {
    screenKey,
    items,
    responses: state.components.get(componentId)?.responses ?? {},
    adaptiveSteps: state.components.get(componentId)?.adaptiveSteps ?? {},
  });

  return {
    componentId,
    screenKey,
    items,
    saveResume: true,
    progress: {
      percent: Math.round((state.completedScreenKeys.length / GATE1_JOURNEY_SCREENS.length) * 100),
      completedScreens: state.completedScreenKeys.length,
      totalScreens: GATE1_JOURNEY_SCREENS.length,
      answered: 0,
      total: items.length,
    },
    sessionState: 'new',
  };
};

export const mockGate1Draft = async (componentId: string): Promise<AssessmentDraftResponse> => {
  await delay();
  const row = state.components.get(componentId);
  return {
    items: row?.items ?? [],
    responses: row?.responses ?? {},
    progress: {
      percent: 0,
      completedScreens: state.completedScreenKeys.length,
      totalScreens: GATE1_JOURNEY_SCREENS.length,
    },
    screenKey: row?.screenKey ?? 'personality',
    lastSavedAt: new Date().toISOString(),
  };
};

export const mockGate1SaveDraft = async (
  componentId: string,
  responses: ResponsesMap,
): Promise<SaveDraftResponse> => {
  await delay();
  const row = state.components.get(componentId);
  if (row) {
    row.responses = { ...row.responses, ...responses };
  }
  return {
    items: row?.items ?? [],
    questionsRegenerated: false,
    responses: row?.responses ?? responses,
    progress: {
      percent: Math.round((state.completedScreenKeys.length / GATE1_JOURNEY_SCREENS.length) * 100),
      completedScreens: state.completedScreenKeys.length,
      totalScreens: GATE1_JOURNEY_SCREENS.length,
    },
  };
};

export const mockGate1SubmitScreen = async (
  componentId: string,
  responses: ResponsesMap,
): Promise<AssessmentSubmitResponse> => {
  await delay();
  const row = state.components.get(componentId);
  const screenKey = row?.screenKey ?? state.inProgressScreenKey ?? 'personality';
  if (row) {
    row.responses = { ...row.responses, ...responses };
  }
  if (!state.completedScreenKeys.includes(screenKey)) {
    state.completedScreenKeys.push(screenKey);
  }
  state.inProgressScreenKey = null;

  const idx = GATE1_JOURNEY_SCREENS.indexOf(screenKey);
  if (idx >= GATE1_JOURNEY_SCREENS.length - 1) {
    state.gate1Complete = true;
  }

  return {
    componentId,
    screenKey,
    status: 'completed',
    gateRollup: {
      partsCompleted: state.completedScreenKeys.length,
      partsTotal: GATE1_JOURNEY_SCREENS.length,
    },
  };
};

export const mockGate1AdaptiveStep = async (
  componentId: string,
  itemId: string,
): Promise<AdaptiveStepResponse> => {
  await delay();
  const row = state.components.get(componentId);
  const steps = (row?.adaptiveSteps[itemId] ?? 0) + 1;
  if (row) row.adaptiveSteps[itemId] = steps;

  if (steps >= 1) {
    return { complete: true, stepIndex: 0, totalSteps: 1, componentStatus: 'completed' };
  }

  return {
    complete: false,
    stepIndex: steps,
    totalSteps: 1,
    nextItem: {
      stem: 'Second adaptive step (mock). Which is the better validation approach?',
      options: [
        { id: 'opt-c', label: 'Test edge cases first' },
        { id: 'opt-d', label: 'Ship without tests' },
      ],
    },
  };
};

export const mockGate1Progress = async (): Promise<{ data: GateProgressEntry[] }> => {
  await delay();
  return {
    data: [
      {
        gate: 1,
        status: state.gate1Complete ? 'passed' : state.completedScreenKeys.length > 0 ? 'in_progress' : 'not_started',
        completedScreens: state.completedScreenKeys.length,
        totalScreens: GATE1_JOURNEY_SCREENS.length,
        percent: Math.round((state.completedScreenKeys.length / GATE1_JOURNEY_SCREENS.length) * 100),
        deadlineRemainingSeconds: 48 * 3600,
        deadlineTotalSeconds: 48 * 3600,
      },
    ],
  };
};

export const mockGate1ScreensCatalog = async (): Promise<{ data: AssessmentScreenCatalog[] }> => {
  await delay();
  return {
    data: GATE1_JOURNEY_SCREENS.map((screenKey) => ({
      screenKey,
      label: screenKey.replace(/_/g, ' '),
      composite: false,
      hasSaveResume: true,
      gate: 1 as const,
      estimatedMinutes: 5,
    })),
  };
};

export const mockGate1ReviewSummary = async (): Promise<{ data: { entries: ReviewSummaryEntry[] } }> => {
  await delay();
  const entries = GATE1_SESSION2_SCREENS.map((screenKey: Gate1ScreenKey) => ({
    screenKey,
    title: screenKey.replace(/_/g, ' '),
    summary: `Mock review summary for ${screenKey}.`,
    componentId: componentIdFor(screenKey),
  }));
  return { data: { entries } };
};

export const mockGate1Verdict = async (): Promise<GateVerdictResponse> => {
  await delay();
  return {
    gate: 1,
    verdict: 'pass',
    score: 0.82,
    threshold: 0.7,
  };
};
