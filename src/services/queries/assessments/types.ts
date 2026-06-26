// ---------------------------------------------------------------------------
// Assessment domain types — mirrors the API contract exactly
// ---------------------------------------------------------------------------

// ── Item types ──────────────────────────────────────────────────────────────

/**
 * SINGLE answer items → the frontend saves a draft immediately on each
 * selection and submits the whole screen when the user clicks Continue.
 *
 * MULTIPLE answer items → all interactions are kept in local state; a single
 * save-draft + submit fires when the user clicks Continue.
 *
 * ADAPTIVE items → each step goes through the per-step adaptive endpoint.
 */
export type SingleAnswerItemType =
  | 'mcq'
  | 'likert_scale'
  | 'forced_choice'
  | 'sjt_single_best'
  | 'sjt_values_tradeoff';

export type MultipleAnswerItemType =
  | 'rank'
  | 'drag_rank'
  | 'values_ab_pairs'
  | 'sjt_rank_all'
  | 'sjt_most_least'
  | 'sjt_multi_select';

export type AdaptiveItemType = 'adaptive_mcq';

export type AssessmentItemType =
  | SingleAnswerItemType
  | MultipleAnswerItemType
  | AdaptiveItemType;

/** Runtime helper — derive save strategy from item type. */
export function isSingleAnswerType(type: AssessmentItemType): type is SingleAnswerItemType {
  const singles: AssessmentItemType[] = [
    'mcq',
    'likert_scale',
    'forced_choice',
    'sjt_single_best',
    'sjt_values_tradeoff',
  ];
  return singles.includes(type);
}

export function isAdaptiveType(type: AssessmentItemType): type is AdaptiveItemType {
  return type === 'adaptive_mcq';
}

// ── Answer shapes (what goes into responses[itemId]) ────────────────────────

/** Single-answer item → string optionId or Likert numeric rating. */
export type SingleAnswerValue = string | number;

/** Rank-all → ordered array of optionIds (index 0 = rank 1). */
export type RankAnswerValue = string[];

/** Most/Least → pick one from each pole. */
export type MostLeastAnswerValue = { most: string; least: string };

/** Multi-select → array of selected optionIds. */
export type MultiSelectAnswerValue = string[];

/** Values AB pairs → array of chosen optionIds (one per pair). */
export type ValuesAbPairsAnswerValue = string[];

export type AnswerValue =
  | SingleAnswerValue
  | RankAnswerValue
  | MostLeastAnswerValue
  | MultiSelectAnswerValue
  | ValuesAbPairsAnswerValue;

/** responses map: { [itemId]: AnswerValue } */
export type ResponsesMap = Record<string, AnswerValue>;

// ── Item / screen data ───────────────────────────────────────────────────────

export interface AssessmentOption {
  id: string;
  label: string;
  tag?: string;
  description?: string;
}

export interface AssessmentItemContent {
  scenario?: string;
  prompt?: string;
  subPrompt?: string;
  options?: AssessmentOption[];
  values?: AssessmentOption[];
  pairs?: Array<{ a: AssessmentOption; b: AssessmentOption }>;
  /** Adaptive: total steps, current step index, whether complete. */
  stepIndex?: number;
  totalSteps?: number;
  complete?: boolean;
  nextItem?: AssessmentItemContent;
  [key: string]: unknown;
}

export interface AssessmentItem {
  id: string;
  type: AssessmentItemType;
  /** For composite screens (e.g. values): 1-based position within the screen. */
  sequence: number;
  /** Total items in this screen (1 for non-composite). */
  total: number;
  /** Composite key e.g. "values_rank" | "values_pairs" */
  partKey?: string;
  content: AssessmentItemContent;
  /** Whether this item type supports a saved-draft resume. */
  saveResume?: boolean;
}

// ── Gate start response ──────────────────────────────────────────────────────

export interface AssessmentTimer {
  limitSeconds?: number;
  warnAtSeconds?: number;
  /** ISO timestamp when the timer started for this screen. */
  startedAt?: string;
}

export interface AssessmentProgress {
  /** 0–100 */
  percent: number;
  completedScreens: number;
  totalScreens: number;
  /** Items answered within the current screen (returned by PATCH & start) */
  answered?: number;
  /** Total items in the current screen */
  total?: number;
}

export interface AssessmentGateStartResponse {
  componentId: string;
  screenKey: string;
  items: AssessmentItem[];
  saveResume: boolean;
  progress: AssessmentProgress;
  timers?: AssessmentTimer;
  /** 'new' | 'resumed' — tells UI whether to restore draft answers. */
  sessionState?: 'new' | 'resumed';
}

// ── Draft / response load ────────────────────────────────────────────────────

export interface AssessmentDraftResponse {
  items: AssessmentItem[];
  responses: ResponsesMap;
  progress: AssessmentProgress;
  screenKey: string;
}

// ── Save-draft response (PATCH) ───────────────────────────────────────────────

/**
 * The PATCH .../responses endpoint now returns refreshed items[] after merging
 * answers and regenerating unanswered content. The frontend must replace its
 * local items[] with this when questionsRegenerated is true.
 */
export interface SaveDraftResponse {
  items: AssessmentItem[];
  questionsRegenerated: boolean;
  responses: ResponsesMap;
  progress: AssessmentProgress;
}

// ── Answer-lock helpers ───────────────────────────────────────────────────────

/**
 * Sub-item types lock at a granular level (per questionId / blockId / pairId)
 * rather than locking the whole item at once. This union names the types that
 * carry a partial-lock response structure.
 */
export type SubItemLockedType =
  | 'likert_scale'      // locked per questionId
  | 'forced_choice'     // locked per blockId
  | 'values_ab_pairs'   // locked per pairId
  | 'values_tradeoff';  // locked per pairId

export function isSubItemLockedType(type: AssessmentItemType): type is SubItemLockedType {
  return (
    type === 'likert_scale' ||
    type === 'forced_choice' ||
    type === 'values_ab_pairs' ||
    type === 'values_tradeoff'
  );
}

/**
 * For sub-item types the server response map looks like:
 *   { "<itemId>": { "<subKey>": <value>, ... } }
 * A sub-key is locked if it is present and non-null in that inner object.
 */
export function isSubKeyLocked(
  responses: ResponsesMap,
  itemId: string,
  subKey: string,
): boolean {
  const itemResp = responses[itemId];
  if (itemResp === undefined || itemResp === null) return false;
  if (typeof itemResp !== 'object' || Array.isArray(itemResp)) return false;
  const sub = (itemResp as Record<string, unknown>)[subKey];
  return sub !== undefined && sub !== null;
}

/**
 * For whole-item types (SJT, rank, drag-rank, mcq, etc.) the item is locked
 * once ANY value is present for that itemId in responses.
 */
export function isWholeItemLocked(responses: ResponsesMap, itemId: string): boolean {
  const v = responses[itemId];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

// ── Lock-related API error ────────────────────────────────────────────────────

export interface AssessmentLockError {
  code: 'ASSESSMENT_RESPONSE_INVALID';
  messages: string[]; // e.g. ["Answer \"q1\" is locked and cannot be changed."]
}

// ── Submit response ──────────────────────────────────────────────────────────

export interface AssessmentSubmitResponse {
  componentId: string;
  screenKey: string;
  status: 'completed' | 'partial';
  nextScreenKey?: string;
}

// ── Adaptive step response ───────────────────────────────────────────────────

export interface AdaptiveStepResponse {
  complete: boolean;
  stepIndex: number;
  totalSteps: number;
  nextItem?: AssessmentItemContent;
  /** Present when complete = true */
  componentStatus?: 'completed';
}

// ── Journey / catalog ────────────────────────────────────────────────────────

export interface AssessmentScreenCatalog {
  screenKey: string;
  label: string;
  composite: boolean;
  parts?: string[];
  hasSaveResume: boolean;
  gate: 1 | 2 | 3;
  estimatedMinutes?: number;
}

export interface AssessmentJourneyScreen {
  screenKey: string;
  session: 1 | 2;
  order: number;
  label: string;
  completed: boolean;
  locked: boolean;
}

// ── Progress & verdict ───────────────────────────────────────────────────────

export interface GateProgressEntry {
  gate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';
  completedScreens: number;
  totalScreens: number;
  percent: number;
}

export interface GateVerdictResponse {
  gate: number;
  verdict: 'pass' | 'fail' | 'pending';
  score?: number;
  cutScore?: number;
  breakdown?: Record<string, number>;
}

// ── Review summary ───────────────────────────────────────────────────────────

export interface ReviewSummaryEntry {
  screenKey: string;
  title: string;
  summary: string;
  componentId: string;
}

// ── Gate 1 session screen-key constants ──────────────────────────────────────

/**
 * Ordered screen keys for Gate 1, Session 1 ("How you think" / psychometric).
 * These map directly to the `screen` body param for POST .../gates/1/start.
 */
export const GATE1_SESSION1_SCREENS = [
  'personality',
  'values',
  'cognitive_fixed',
  'numerical',
  'pattern',
  'verbal',
] as const;

export type Gate1Session1ScreenKey = (typeof GATE1_SESSION1_SCREENS)[number];

/**
 * Ordered screen keys for Gate 1, Session 2 ("Your instincts" / SJT).
 */
export const GATE1_SESSION2_SCREENS = [
  'sjt_single_best',
  'sjt_rank',
  'sjt_most_least',
  'sjt_multi_select',
  'values_tradeoff',
] as const;

export type Gate1Session2ScreenKey = (typeof GATE1_SESSION2_SCREENS)[number];

export type Gate1ScreenKey = Gate1Session1ScreenKey | Gate1Session2ScreenKey;

/**
 * Gate 2 pillar keys — POST .../gates/2/start { pillar: ... }
 */
export const GATE2_PILLARS = [
  'knowledge',
  'expertise',
  'reasoning',
  'simulation',
] as const;

export type Gate2PillarKey = (typeof GATE2_PILLARS)[number];

// ── Resume-state ─────────────────────────────────────────────────────────────

/**
 * Describes a screen that is currently IN_PROGRESS for the candidate.
 * Use screenKey + componentId to resume: POST .../gates/1/start { screen: screenKey }
 * then load the draft via GET .../components/:componentId/responses.
 */
export interface GateInProgressScreen {
  screenKey: Gate1ScreenKey;
  componentId: string;
  session: 1 | 2;
}

/**
 * Response from GET /assessments/:assessmentId/gates/1/resume-state.
 *
 * Decision tree on welcome-back:
 *   1. If inProgress is set → POST start with { screen: inProgress.screenKey }
 *      (backend regenerates unseen questions on that screen before returning items[])
 *   2. Else → POST start with { screen: nextScreenKey }
 *      (fresh screen, no resume)
 *
 * Never derive which screen to start from client-side logic alone —
 * always let this endpoint be the source of truth.
 */
export interface GateResumeState {
  /** Which session the candidate is currently in (1 or 2). */
  session: 1 | 2;
  /** Human-readable label, e.g. "How you think" | "Your instincts" */
  sessionLabel: string;
  /** The screen key the candidate should open next (could be in-progress or brand new). */
  nextScreenKey: Gate1ScreenKey;
  /** Non-null when there is an in-progress screen that needs resuming. */
  inProgress: GateInProgressScreen | null;
  /** Screen keys the candidate has already submitted (completed). */
  completedScreenKeys: Gate1ScreenKey[];
  /** Ordered session-1 screen keys for progress-rail rendering. */
  session1Screens: Gate1Session1ScreenKey[];
  /** Ordered session-2 screen keys for progress-rail rendering. */
  session2Screens: Gate1Session2ScreenKey[];
  /** True once every screen in both sessions has been submitted. */
  gate1Complete: boolean;
}
