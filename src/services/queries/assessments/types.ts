// ---------------------------------------------------------------------------
// Assessment domain types mirrors the API contract exactly
// ---------------------------------------------------------------------------

// ── Item types ──────────────────────────────────────────────────────────────

/**
 * SINGLE answer items → the frontend saves a draft immediately on each
 * selection and submits the whole screen when the user clicks Continue.
 *
 * PARTIAL draft items → PATCH one sub-key at a time (likert rows, forced-choice
 * blocks, values pairs/tradeoffs). Submit still requires the full item.
 *
 * MULTIPLE answer items → all interactions are kept in local state; a single
 * save-draft + submit fires when the user clicks Continue.
 *
 * ADAPTIVE items → each step goes through the per-step adaptive endpoint.
 */
export type SingleAnswerItemType = "mcq" | "likert_scale" | "sjt_single_best";

export type MultipleAnswerItemType =
  | "rank"
  | "drag_rank"
  | "sjt_rank"
  | "sjt_rank_all"
  | "sjt_most_least"
  | "sjt_multi_select";

export type AdaptiveItemType = "adaptive_mcq";

/**
 * PATCH allows partial answers (one sub-key at a time).
 * Submit requires every item on the screen to be fully valid.
 */
export type PartialDraftItemType =
  | "likert_scale"
  | "forced_choice"
  | "values_ab_pairs"
  | "values_tradeoff"
  | "sjt_values_tradeoff";

/** Gate 2 / Stage 2 item families from the professional dimension API. */
export type Gate2ItemType =
  | "sb"
  | "jb"
  | "ms"
  | "ml"
  | "match"
  | "cloze"
  | "cat"
  | "compare"
  | "code"
  | "livecode"
  | "probe"
  | "hotspot"
  | "highlight"
  | "work_sample"
  | "numeric"
  | "scale"
  | "allocate"
  | "data"
  | "dashboard"
  | "chartread"
  | "abtest"
  | "diagnose"
  | "architect"
  | "metric"
  | "threshold"
  | "visual"
  | "visualrank"
  | "visualspot"
  | string;

export type AssessmentItemType =
  | SingleAnswerItemType
  | PartialDraftItemType
  | MultipleAnswerItemType
  | AdaptiveItemType
  | Gate2ItemType;

/** Runtime helper derive save strategy from item type. */
export function isSingleAnswerType(
  type: AssessmentItemType,
): type is SingleAnswerItemType {
  const singles: AssessmentItemType[] = [
    "mcq",
    "likert_scale",
    "sjt_single_best",
  ];
  return singles.includes(type);
}

export function isAdaptiveType(
  type: AssessmentItemType,
): type is AdaptiveItemType {
  return type === "adaptive_mcq";
}

export function isPartialDraftType(
  type: AssessmentItemType,
): type is PartialDraftItemType {
  const partial: AssessmentItemType[] = [
    "likert_scale",
    "forced_choice",
    "values_ab_pairs",
    "values_tradeoff",
    "sjt_values_tradeoff",
  ];
  return partial.includes(type);
}

export function isMultipleAnswerType(type: AssessmentItemType): boolean {
  const multiples: AssessmentItemType[] = [
    "rank",
    "drag_rank",
    "sjt_rank_all",
    "sjt_most_least",
    "sjt_multi_select",
  ];
  return multiples.includes(type);
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

/** Forced-choice block → { most: statementId, least: statementId }. */
export type ForcedChoiceBlockAnswer = { most: string; least: string };

/** Values AB pairs → "A" | "B" per pairId. */
export type ValuesAbPairAnswer = Record<string, "A" | "B">;

/** Values trade-off slider → number per tensionId (-2..2 default). */
export type ValuesTradeoffAnswer = Record<string, number>;

export interface NestedAnswerValue {
  [key: string]: AnswerValue | number | string;
}

export type AnswerValue =
  | SingleAnswerValue
  | RankAnswerValue
  | MostLeastAnswerValue
  | MultiSelectAnswerValue
  | ValuesAbPairsAnswerValue
  | ForcedChoiceBlockAnswer
  | ValuesAbPairAnswer
  | ValuesTradeoffAnswer
  | NestedAnswerValue;

/** responses map: { [itemId]: AnswerValue } */
export type ResponsesMap = Record<string, AnswerValue>;

// ── Item / screen data ───────────────────────────────────────────────────────

export interface AssessmentOption {
  id: string;
  label: string;
  text?: string;
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
  /** Human-readable section title from the API (e.g. "How you think"). */
  title?: string;
  subtitle?: string;
  /** Dynamic eyebrow text from the API (e.g. "Part 2 · What matters to you"). */
  eyebrow?: string;
  /** Dynamic screen title from the API. */
  screenTitle?: string;
  /** Dynamic screen subtitle from the API. */
  screenSubtitle?: string;
  /** Dynamic "Why this matters" text from the API. */
  whyThisMatters?: string;
  /** Session index (0-based) from the API. */
  sessionIndex?: number;
  /** Session label from the API (e.g. "How you think"). */
  sessionLabel?: string;
  /** Per-item timer from Gate 2 payloads. */
  timerSecs?: number;
  /** Role niche / specialty key from Gate 2 payloads. */
  niche?: string;
  level?: string;
  pillar?: string;
}

// ── Gate start response ──────────────────────────────────────────────────────

export interface AssessmentTimer {
  limitSeconds?: number;
  warnAtSeconds?: number;
  /** ISO timestamp when the timer started for this screen. */
  startedAt?: string;
}

export interface GateWindowInfo {
  from: number;
  through: number;
  hasMore: boolean;
}

export interface AssessmentProgress {
  /** 0–100 */
  percent?: number;
  completedScreens?: number;
  totalScreens?: number;
  /** Items answered within the current screen (returned by PATCH & start) */
  answered?: number;
  /** Total items in the current screen / pillar */
  total?: number;
  /** Index / position of the next unanswered question */
  current?: number;
}

export interface AdaptiveMcqPriorStep {
  step: number;
  optionId: string;
  content: AssessmentItemContent;
}

export interface AdaptiveMcqState {
  itemId: string;
  totalSteps: number;
  currentStep: number;
  complete: boolean;
  priorSteps: AdaptiveMcqPriorStep[];
}

export interface AssessmentGateStartResponse {
  componentId: string;
  screenKey: string;
  items: AssessmentItem[];
  saveResume: boolean;
  progress: AssessmentProgress;
  window?: GateWindowInfo;
  timers?: AssessmentTimer;
  sessionState?: "new" | "resumed";
  questionsRegenerated?: boolean;
  adaptiveMcq?: AdaptiveMcqState;
  gate?: number;
  gateName?: string;
  table?: any;
  chart?: any;
}

export interface Gate2PillarItemsResponse {
  items: AssessmentItem[];
  progress: AssessmentProgress;
  window: GateWindowInfo;
  componentId?: string;
}

/** Stage-agnostic alias same shape for Gates 1, 2, and 3. */
export type AssessmentScreenStartResponse = AssessmentGateStartResponse;

// ── Draft / response load ────────────────────────────────────────────────────

export interface AssessmentDraftResponse {
  items: AssessmentItem[];
  responses: ResponsesMap;
  progress: AssessmentProgress;
  screenKey: string;
  /** ISO timestamp of the last draft save (when provided by server). */
  lastSavedAt?: string;
  updatedAt?: string;
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
  | "likert_scale"
  | "forced_choice"
  | "values_ab_pairs"
  | "values_tradeoff"
  | "sjt_values_tradeoff";

export function isSubItemLockedType(
  type: AssessmentItemType,
): type is SubItemLockedType {
  return (
    type === "likert_scale" ||
    type === "forced_choice" ||
    type === "values_ab_pairs" ||
    type === "values_tradeoff" ||
    type === "sjt_values_tradeoff"
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
  if (typeof itemResp !== "object" || Array.isArray(itemResp)) return false;
  const sub = (itemResp as Record<string, unknown>)[subKey];
  return sub !== undefined && sub !== null;
}

/**
 * For whole-item types (SJT, rank, drag-rank, mcq, etc.) the item is locked
 * once ANY value is present for that itemId in responses.
 */
export function isWholeItemLocked(
  responses: ResponsesMap,
  itemId: string,
): boolean {
  const v = responses[itemId];
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

// ── Lock-related API error ────────────────────────────────────────────────────

export interface AssessmentLockError {
  code: "ASSESSMENT_RESPONSE_INVALID";
  messages: string[]; // e.g. ["Answer \"q1\" is locked and cannot be changed."]
}

// ── Submit response ──────────────────────────────────────────────────────────

export interface GateRollup {
  partsCompleted?: number;
  partsTotal?: number;
  gateStatus?: string;
  [key: string]: unknown;
}

export interface AssessmentSubmitResponse {
  componentId: string;
  screenKey?: string;
  status: "completed" | "partial";
  /** Deprecated submit does not return next screen; refetch resume-state instead. */
  nextScreenKey?: string;
  gateRollup?: GateRollup;
}

// ── Adaptive step response ───────────────────────────────────────────────────

export interface AdaptiveStepResponse {
  complete: boolean;
  stepIndex: number;
  totalSteps: number;
  nextItem?: AssessmentItemContent;
  /** Present when complete = true */
  componentStatus?: "completed";
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
  status: "not_started" | "in_progress" | "completed" | "passed" | "failed";
  completedScreens: number;
  totalScreens: number;
  percent: number;
  /** Seconds remaining on the gate deadline window (if server tracks it). */
  deadlineRemainingSeconds?: number;
  /** Total gate window in seconds (e.g. 172800 for 48h). */
  deadlineTotalSeconds?: number;
  /** ISO timestamp when the gate deadline expires. */
  deadlineEndsAt?: string;
}

export interface GateVerdictResponse {
  // Status check during polling
  status?: "generating" | "ready";

  gate: number;
  verdict: "pass" | "fail" | "pending" | "qualified" | "not_yet";
  passed?: boolean;
  score?: number;
  threshold?: number;
  outcome?: "passed" | "failed";
  roleLocked?: boolean;

  talent?: { firstName: string };
  role?: {
    rolePostingId: string;
    roleTitle: string;
    employerName: string;
  };

  headline?: string;
  summary?: string;
  narrativeParagraphs?: string[];

  // Pass fields
  strengths?: Array<{
    title: string;
    description: string;
  }>;
  traits?: Array<{
    key: string;
    label: string;
    description: string;
    scorePercent: number;
  }>;
  nextStage?: {
    gate: number;
    label: string;
    windowHours: number;
    estimatedMinutesMin: number;
    estimatedMinutesMax: number;
    partsCount: number;
    deadlineAt: string;
  };

  // Fail fields
  gaps?: Array<{
    key: string;
    label: string;
    scorePercent: number;
    thresholdPercent: number;
    explanation: string;
  }>;
  diagnosis?: {
    recommendationType: "mentorship" | "course" | "self_directed";
    rationale: string;
  };
  mentor?: {
    id: string;
    name: string;
    professionalTitle: string;
    bio: string;
    credentials: string[];
    programmeTitle: string;
    programmeDescription: string;
    durationWeeks: number;
    format: string;
    sessionMinutes: number;
    priceAmount: number;
    priceCurrency: string;
    fixesSummary: string[];
  } | null;
  futureRoles?: Array<{
    rolePostingId: string;
    roleLink: string;
    roleTitle: string;
    employerName: string;
    location: string;
    salaryLabel: string;
    currentMatchPercent: number;
    projectedMatchPercent: number;
    closesAt: string;
    postedAt: string;
  }>;
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
 * Ordered screen keys for Gate 1 must match backend gate-1-journey.json.
 * Registry-only keys (e.g. forced_choice as a screen) are not valid here.
 */
export const GATE1_SESSION1_SCREENS = [
  "personality",
  "values",
  "cognitive_fixed",
  "numerical",
  "pattern",
  "verbal",
] as const;

export type Gate1Session1ScreenKey = (typeof GATE1_SESSION1_SCREENS)[number];

/**
 * Ordered screen keys for Gate 1, Session 2 ("Your instincts" / SJT).
 */
export const GATE1_SESSION2_SCREENS = [
  "sjt_single_best",
  "sjt_rank",
  "sjt_most_least",
  "sjt_multi_select",
  "values_tradeoff",
] as const;

export type Gate1Session2ScreenKey = (typeof GATE1_SESSION2_SCREENS)[number];

export type Gate1ScreenKey = Gate1Session1ScreenKey | Gate1Session2ScreenKey;

/**
 * Gate 2 pillar keys POST .../gates/2/start { pillar: ... }
 */
export const GATE2_PILLARS = [
  "knowledge",
  "expertise",
  "reasoning",
  "simulation",
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
  schemaVersion?: number;
  assessmentId?: string;
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
  /** ISO timestamp when the candidate last paused (if server tracks it). */
  pausedAt?: string;
  /** Seconds remaining on the Stage 1 gate deadline. */
  gateDeadlineRemainingSeconds?: number;
  /** Total Stage 1 gate window in seconds. */
  gateDeadlineTotalSeconds?: number;
  /** Per-screen timer limit in seconds for the current/next screen. */
  screenTimerLimitSeconds?: number;
}

// ── Stage 2 (Gate 2) Intros ──────────────────────────────────────────────────

export interface Gate2StageIntroResponse {
  schemaVersion?: number;
  assessmentId: string;
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
  };
  pillarsSection?: {
    title?: string;
    subtitle?: string;
  };
  pillars?: Array<{
    pillar?: Gate2PillarKey | string;
    part: number;
    eyebrow?: string;
    title?: string;
    body?: string;
    tags?: string[];
  }>;
  roleFamilies?: {
    eyebrow?: string;
    title?: string;
    body?: string;
    tags?: Array<{
      id: string;
      label: string;
      active?: boolean;
    }>;
    activeFamilyId?: string;
    activeFamilyLabel?: string;
  };
  outcomes?: {
    title?: string;
    body?: string;
    items?: Array<{ title?: string; body?: string }>;
  };
  footer?: {
    ctaLabel?: string;
    secondaryLabel?: string;
    prepNote?: string;
    profileNote?: string;
    windowNote?: string;
  };
  fingerprint?: {
    nicheSlug?: string;
    nicheDisplayName?: string;
    level?: string;
    roleTitle?: string;
  };
  stats?: {
    partsLabel?: string;
    partsDetail?: string;
    durationMins?: string | number;
    durationLabel?: string;
    windowHours?: number;
    windowLabel?: string;
  };
  nextPillar?: Gate2PillarKey;
}

export interface Gate2PillarIntroResponse {
  schemaVersion?: number;
  assessmentId: string;
  pillar: Gate2PillarKey;
  part: number;
  title: string;
  subtitle: string;
  partLabel?: string;
  eyebrow?: string;
  headsUp?: string;
  ctas?: {
    stageOverviewLabel?: string;
    beginPartLabel?: string;
  };
  levelBand?: {
    label: string;
    years?: string;
  };
  questionCount?: number;
  pillarLimitSecs?: number;
  antiGame?: string;
  summary?: string;
  breadcrumb?: string;
  fingerprint?: {
    nicheSlug?: string;
    nicheDisplayName?: string;
    level?: string;
    roleTitle?: string;
  };
}

/** Gate 2 resume-state nextStep — source of truth for leave-off / resume routing. */
export type Gate2ResumeNextStep =
  | "PILLAR_INTRO"
  | "START_PILLAR"
  | "RESUME_PILLAR"
  | "GATE2_COMPLETE";

export interface Gate2ResumeNextCall {
  method: string;
  path: string;
  body?: Record<string, unknown>;
}

export interface Gate2ResumeNextCalls {
  pillarIntro?: Gate2ResumeNextCall;
  start?: Gate2ResumeNextCall;
  items?: Gate2ResumeNextCall;
  draft?: Gate2ResumeNextCall;
}

/**
 * Response from GET /assessments/:assessmentId/gates/2/resume-state.
 * Branch UI and Resume CTA on `nextStep` only — do not invent pillar order client-side.
 */
export interface Gate2ResumeState {
  schemaVersion?: number;
  assessmentId?: string;
  gate?: 2 | number;
  gateName?: string;
  nextPillar: Gate2PillarKey | string | null;
  pillarLabel?: string | null;
  part?: number | null;
  partLabel?: string | null;
  pillarIntroTitle?: string | null;
  screenTitle?: string | null;
  completedPillars: Array<Gate2PillarKey | string>;
  pillars: Array<Gate2PillarKey | string>;
  gate2Complete: boolean;
  nextStep: Gate2ResumeNextStep;
  componentId: string | null;
  pillar: Gate2PillarKey | string | null;
  items: AssessmentItem[];
  responses: ResponsesMap;
  progress?: {
    current?: number;
    total?: number;
    answered?: number;
  } | null;
  window?: GateWindowInfo | null;
  interview?: {
    index?: number;
    total?: number;
  } | null;
  timers?: {
    gateLimitSecs?: number;
    interviewLimitSecs?: number;
  } | null;
  inProgress?: {
    pillar?: Gate2PillarKey | string;
    componentId?: string;
    part?: number;
  } | null;
  nextCalls: Gate2ResumeNextCalls | null;
  pausedAt?: string;
}

