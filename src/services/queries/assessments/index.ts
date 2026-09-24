import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import type { Gate1ScreenKey } from "./types";

import type {
  AssessmentGateStartResponse,
  AssessmentDraftResponse,
  AssessmentSubmitResponse,
  SaveDraftResponse,
  AdaptiveStepResponse,
  AssessmentScreenCatalog,
  AssessmentJourneyScreen,
  GateProgressEntry,
  GateVerdictResponse,
  GateResumeState,
  ReviewSummaryEntry,
  ResponsesMap,
  Gate2StageIntroResponse,
  Gate2PillarIntroResponse,
  Gate2PillarKey,
  Gate2PillarItemsResponse,
  GateWindowInfo,
} from "./types";
import { parseGateProgressEntries } from "../../../utils/assessmentSession";

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory keeps cache keys DRY and consistent
// ─────────────────────────────────────────────────────────────────────────────
export const assessmentKeys = {
  all: ["assessments"] as const,

  // Catalog / journey (static-ish, no assessmentId needed)
  screens: (gate: number) =>
    [...assessmentKeys.all, "gate", gate, "screens"] as const,
  journey: (gate: number) =>
    [...assessmentKeys.all, "gate", gate, "journey"] as const,

  // Per-session
  resumeState: (assessmentId: string, gate: number) =>
    [
      ...assessmentKeys.all,
      assessmentId,
      "gate",
      gate,
      "resume-state",
    ] as const,
  progress: (assessmentId: string) =>
    [...assessmentKeys.all, assessmentId, "progress"] as const,
  gate2Intro: (assessmentId: string) =>
    [...assessmentKeys.all, assessmentId, "gate", 2, "intro"] as const,
  gate2PillarIntro: (assessmentId: string, pillar: string) =>
    [
      ...assessmentKeys.all,
      assessmentId,
      "gate",
      2,
      "pillars",
      pillar,
      "intro",
    ] as const,
  gate2PillarItems: (
    assessmentId: string,
    pillar: string,
    from?: number,
    through?: number,
  ) =>
    [
      ...assessmentKeys.all,
      assessmentId,
      "gate",
      2,
      "pillars",
      pillar,
      "items",
      { from, through },
    ] as const,
  verdict: (assessmentId: string, gate: number) =>
    [...assessmentKeys.all, assessmentId, "gate", gate, "verdict"] as const,
  reviewSummary: (assessmentId: string, gate: number) =>
    [
      ...assessmentKeys.all,
      assessmentId,
      "gate",
      gate,
      "review-summary",
    ] as const,

  // Per-component (screen)
  draft: (assessmentId: string, componentId: string) =>
    [
      ...assessmentKeys.all,
      assessmentId,
      "components",
      componentId,
      "responses",
    ] as const,

  // Stage 4 Decision
  decision: (assessmentId: string) =>
    [...assessmentKeys.all, assessmentId, "decision"] as const,
  employerReviewQueue: (rolePostingId: string) =>
    [...assessmentKeys.all, "role", rolePostingId, "review-queue"] as const,
  employerReport: (assessmentId: string, rolePostingId?: string) =>
    [...assessmentKeys.all, assessmentId, "employer-report", { rolePostingId }] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Catalog & journey load once, cache aggressively
// ─────────────────────────────────────────────────────────────────────────────

/** GET /assessments/gates/{gate}/screens screen catalog with composite flags */
export const useAssessmentScreensQuery = (gate: 1 | 2 | 3 = 1) =>
  useQuery({
    queryKey: assessmentKeys.screens(gate),
    queryFn: () =>
      apiClient.get<{ data: AssessmentScreenCatalog[] }>({
        url: `/assessments/gates/${gate}/screens`,
        auth: true,
      }),
    staleTime: 10 * 60 * 1000, // catalog rarely changes mid-session
  });

/** GET /assessments/gates/{gate}/journey ordered screen list with session split */
export const useAssessmentJourneyQuery = (gate: 1 | 2 | 3 = 1) =>
  useQuery({
    queryKey: assessmentKeys.journey(gate),
    queryFn: () =>
      apiClient.get<{ data: AssessmentJourneyScreen[] }>({
        url: `/assessments/gates/${gate}/journey`,
        auth: true,
      }),
    staleTime: 5 * 60 * 1000,
  });

/**
 * GET /assessments/:assessmentId/gates/{gate}/resume-state
 *
 * The ONLY place the frontend should decide which session and screen to open.
 * Call this on every welcome-back / dashboard entry point.
 *
 * Decision logic (from the spec do NOT re-implement this client-side):
 *   inProgress != null  → POST start { screen: inProgress.screenKey }  (resume + regen)
 *   inProgress == null  → POST start { screen: nextScreenKey }          (fresh screen)
 *
 * Stale time is intentionally short this changes every time a screen is
 * submitted or a draft is saved.
 */
export const useGateResumeStateQuery = (
  assessmentId: string,
  gate: 1 | 2 | 3 = 1,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
  },
) =>
  useQuery({
    queryKey: assessmentKeys.resumeState(assessmentId, gate),
    queryFn: async (): Promise<unknown> =>
      apiClient.get<GateResumeState>({
        url: `/assessments/${assessmentId}/gates/${gate}/resume-state`,
        auth: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    staleTime: options?.staleTime ?? 30 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    refetchOnReconnect: options?.refetchOnReconnect,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Start a screen load (or regenerate) questions for a given screen key
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /assessments/:assessmentId/gates/{gate}/start
 *
 * Gate 1: body = { screen: "personality" | "values" | ... }
 * Gate 2: body = { pillar: "knowledge" | "expertise" | ... }
 * Gate 3: body = { screen?: string }
 *
 * NOTE: The backend currently returns existing questions when a screen is
 * IN_PROGRESS instead of regenerating them. Once the backend fixes that,
 * this mutation will automatically benefit no frontend change needed.
 */
export const useStartAssessmentScreenMutation = (gate: 1 | 2 | 3 = 1) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      body,
    }: {
      assessmentId: string;
      /** Gate 1 → { screen }; Gate 2 → { pillar }; Gate 3 → { screen? } */
      body: Record<string, string>;
    }) => {
      return apiClient.post<AssessmentGateStartResponse>({
        url: `/assessments/${assessmentId}/gates/${gate}/start`,
        body,
        auth: true,
      });
    },
    onSuccess: (data: any, { assessmentId }) => {
      const normalized = data?.data || data;
      const statusLower = String(normalized?.status || '').toLowerCase();
      const isActuallyClosed =
        normalized?.alreadySubmitted === true ||
        statusLower === 'completed' ||
        statusLower === 'submitted' ||
        statusLower === 'closed';

      if (normalized?.componentId && isActuallyClosed) {
        markComponentSubmitted(normalized.componentId);
      }
      // Invalidate progress so the journey bar reflects the new screen start
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.progress(assessmentId),
      });
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Component Lifecycle Tracking (guards against draft PATCH on submitted/closed components)
// ─────────────────────────────────────────────────────────────────────────────
const SUBMITTED_STORAGE_KEY = 'vora_submitted_components';

const getStoredSubmittedComponents = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(SUBMITTED_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const list = JSON.parse(raw);
    return new Set<string>(Array.isArray(list) ? list : []);
  } catch {
    return new Set<string>();
  }
};

const persistSubmittedComponents = (set: Set<string>) => {
  try {
    sessionStorage.setItem(SUBMITTED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota or security errors
  }
};

const submittedComponentIds = getStoredSubmittedComponents();

export const markComponentSubmitted = (componentId?: string | null) => {
  if (componentId) {
    submittedComponentIds.add(componentId);
    persistSubmittedComponents(submittedComponentIds);
  }
};

export const unmarkComponentSubmitted = (componentId?: string | null) => {
  if (componentId) {
    submittedComponentIds.delete(componentId);
    persistSubmittedComponents(submittedComponentIds);
  }
};

export const isComponentSubmitted = (componentId?: string | null): boolean => {
  if (!componentId) return false;
  if (submittedComponentIds.has(componentId)) return true;
  const stored = getStoredSubmittedComponents();
  if (stored.has(componentId)) {
    submittedComponentIds.add(componentId);
    return true;
  }
  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// Draft save & load partial answers (no scoring)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /assessments/:assessmentId/components/:componentId/responses
 *
 * Save strategy (enforced by useAssessmentScreen, not here):
 *   • Single-answer items  → called on every selection (lightweight, fast)
 *   • Multiple-answer items → called once on Continue after all parts are set
 *
 * IMPORTANT only send NEW (unlocked) keys in `responses`.
 * The server rejects any key that already exists in stored responses with a
 * 400 ASSESSMENT_RESPONSE_INVALID error. The useAssessmentScreen hook is
 * responsible for stripping locked keys before calling this mutation.
 *
 * Response now includes refreshed items[] + questionsRegenerated flag.
 * The caller must replace its local items[] when questionsRegenerated is true.
 */
export const useSaveAssessmentDraftMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assessmentId,
      componentId,
      responses,
    }: {
      assessmentId: string;
      componentId: string;
      /** Only NEW (unlocked) keys never re-send already-saved answers */
      responses: ResponsesMap;
    }) => {
      // Rule 2 & 3: Never PATCH draft if the component ID is missing
      if (!componentId) {
        return { responses: {} } as SaveDraftResponse;
      }

      // Filter out empty keys, empty values, or empty objects to avoid backend 400: "Draft patch must include at least one item response."
      const cleanResponses: ResponsesMap = {};
      if (responses && typeof responses === 'object') {
        for (const [key, val] of Object.entries(responses)) {
          if (!key || !key.trim()) continue;
          if (val === undefined || val === null || val === '') continue;
          if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
          cleanResponses[key] = val;
        }
      }

      if (Object.keys(cleanResponses).length === 0) {
        return { responses: {} } as SaveDraftResponse;
      }

      try {
        return await apiClient.patch<SaveDraftResponse>({
          url: `/assessments/${assessmentId}/components/${componentId}/responses`,
          body: { responses: cleanResponses },
          auth: true,
          suppressErrorToast: true,
        });
      } catch (err: any) {
        const msg = String(
          err?.message ||
          err?.data?.message ||
          err?.response?.data?.message ||
          ''
        ).toLowerCase();
        if (
          msg.includes('already been submitted') ||
          msg.includes('already submitted') ||
          msg.includes('closed') ||
          msg.includes('ended')
        ) {
          markComponentSubmitted(componentId);
          return { responses: {} } as SaveDraftResponse;
        }
        if (msg.includes('cannot be changed') || msg.includes('locked')) {
          // Individual answer locked, not entire component
          return { responses: {} } as SaveDraftResponse;
        }
        throw err;
      }
    },
  });
};

/**
 * GET /assessments/:assessmentId/components/:componentId/responses
 *
 * Load a saved draft to restore partial answers on resume.
 * Only called when sessionState === 'resumed' from the start response,
 * or when the user explicitly returns to an in-progress screen.
 */
export const useAssessmentDraftQuery = (
  assessmentId: string,
  componentId: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.draft(assessmentId, componentId),
    queryFn: () =>
      apiClient.get<AssessmentDraftResponse>({
        url: `/assessments/${assessmentId}/components/${componentId}/responses`,
        auth: true,
        suppressErrorToast: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId && !!componentId,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Submit score the screen and mark it complete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /assessments/:assessmentId/components/:componentId/submit
 *
 * Include ALL itemIds for the screen in responses including both parts of a
 * composite screen (e.g. values_rank + values_pairs).
 */
export const useSubmitAssessmentScreenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      componentId,
      responses,
    }: {
      assessmentId: string;
      componentId: string;
      responses: ResponsesMap;
    }) => {
      return apiClient.post<AssessmentSubmitResponse>({
        url: `/assessments/${assessmentId}/components/${componentId}/submit`,
        body: { responses },
        auth: true,
      });
    },
    onSuccess: (data: any, { assessmentId, componentId }) => {
      if (componentId) {
        markComponentSubmitted(componentId);
      }
      const normalized = data?.data || data;
      if (normalized) {
        queryClient.setQueryData<GateResumeState>(
          assessmentKeys.resumeState(assessmentId, 1),
          (old) => {
            if (!old) return old;
            
            const isEnveloped = typeof old === 'object' && old !== null && 'data' in old;
            const target: any = isEnveloped ? (old as any).data : old;
            if (!target) return old;
            
            const finishedScreenKey = target.nextScreenKey;
            const updatedCompleteKeys = target.completedScreenKeys.includes(finishedScreenKey)
              ? target.completedScreenKeys
              : [...target.completedScreenKeys, finishedScreenKey];
              
            const nextScreenInfo = normalized.nextScreen || {};
            const nextScreenKey = nextScreenInfo.nextScreenKey ?? normalized.nextScreenKey ?? target.nextScreenKey;
            const session = nextScreenInfo.session ?? normalized.gateRollup?.session ?? target.session;
            const sessionLabel = nextScreenInfo.sessionLabel ?? normalized.gateRollup?.sessionLabel ?? target.sessionLabel;
            
            const gate1Complete =
              nextScreenInfo.gate1Complete === true ||
              normalized.gateRollup?.gateStatus === "completed" ||
              normalized.gateRollup?.gate1Complete === true ||
              (normalized.status === "completed" && 
               normalized.nextScreenKey === undefined && 
               normalized.nextScreen === undefined);

            const updatedTarget = {
              ...target,
              session,
              sessionLabel,
              nextScreenKey: nextScreenKey as any,
              completedScreenKeys: updatedCompleteKeys,
              gate1Complete,
              inProgress: null,
            };

            if (isEnveloped) {
              return {
                ...old,
                data: updatedTarget,
              } as any;
            }
            return updatedTarget as any;
          }
        );

        // 2. Update progress cache manually
        queryClient.setQueryData<any>(
          assessmentKeys.progress(assessmentId),
          (old: any) => {
            if (!old) return old;
            
            const isEnveloped = typeof old === 'object' && old !== null && 'data' in old;
            const target = isEnveloped ? old.data : old;
            if (!target) return old;

            const entries = parseGateProgressEntries(old);
            if (!entries.length) return old;

            const rollup = normalized.gateRollup || {};
            const updatedEntries = entries.map((entry: GateProgressEntry) => {
              if (entry.gate === 1) {
                const completed = rollup.partsCompleted ?? entry.completedScreens;
                const total = rollup.partsTotal ?? entry.totalScreens;
                return {
                  ...entry,
                  completedScreens: completed,
                  totalScreens: total,
                  percent: total > 0 ? Math.round((completed / total) * 100) : entry.percent,
                };
              }
              return entry;
            });

            let updatedTarget = target;
            if (Array.isArray(target)) {
              updatedTarget = updatedEntries;
            } else if (typeof target === 'object' && Array.isArray((target as any).gates)) {
              updatedTarget = {
                ...target,
                gates: updatedEntries,
              };
            } else if (typeof target === 'object' && (target as any).gate === 1) {
              updatedTarget = updatedEntries[0] || target;
            }

            if (isEnveloped) {
              return {
                ...old,
                data: updatedTarget,
              };
            }
            return updatedTarget;
          }
        );
      }
    },
  });
};

/**
 * POST /assessments/:assessmentId/gates/{gate}/submit
 * Final submit of the gate for scoring.
 */
export const useSubmitGateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      gate = 1,
      suppressErrorToast = false,
    }: {
      assessmentId: string;
      gate?: number;
      /** When true, caller handles toasts (e.g. 409 scoring retry). */
      suppressErrorToast?: boolean;
    }) => {
      return apiClient.post<any>({
        url: `/assessments/${assessmentId}/gates/${gate}/submit`,
        auth: true,
        suppressErrorToast,
      });
    },
    onSuccess: (_data, { assessmentId, gate = 1 }) => {
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.progress(assessmentId),
      });
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.verdict(assessmentId, gate),
      });
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive per-step endpoint for adaptive_mcq items
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /assessments/:assessmentId/components/:componentId/items/:itemId/adaptive
 *
 * Called once per step. Response tells the UI whether the adaptive sequence is
 * complete and what the next step looks like.
 *
 * Module-level single-flight per item: duplicate callers (double-click, remount)
 * share one in-flight promise so the network tab never shows two POSTs.
 */
const adaptiveStepInflight = new Map<string, Promise<AdaptiveStepResponse>>();

const submitAdaptiveStepOnce = (args: {
  assessmentId: string;
  componentId: string;
  itemId: string;
  optionId: string;
}): Promise<AdaptiveStepResponse> => {
  const { assessmentId, componentId, itemId, optionId } = args;
  const flightKey = `${assessmentId}:${componentId}:${itemId}`;
  const existing = adaptiveStepInflight.get(flightKey);
  if (existing) return existing;

  const request = apiClient
    .post<AdaptiveStepResponse>({
      url: `/assessments/${assessmentId}/components/${componentId}/items/${itemId}/adaptive`,
      body: { optionId },
      auth: true,
    })
    .finally(() => {
      adaptiveStepInflight.delete(flightKey);
    }) as Promise<AdaptiveStepResponse>;

  adaptiveStepInflight.set(flightKey, request);
  return request;
};

export const useSubmitAdaptiveStepMutation = () =>
  useMutation({
    mutationFn: submitAdaptiveStepOnce,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Progress & verdict
// ─────────────────────────────────────────────────────────────────────────────

/** GET /assessments/:assessmentId/gates/progress gate-level rollup */
export const useAssessmentGatesProgressQuery = (
  assessmentId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) =>
  useQuery({
    queryKey: assessmentKeys.progress(assessmentId),
    queryFn: () =>
      apiClient.get<{ data: GateProgressEntry[] }>({
        url: `/assessments/${assessmentId}/gates/progress`,
        auth: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    refetchInterval: options?.refetchInterval ?? false,
  });

/**
 * GET /assessments/:assessmentId/gates/{gate}
 *
 * Verdict & scoring details for Gate 1, 2, or 3.
 * Poll until status !== 'generating' or verdict is ready.
 */
export const useGateVerdictQuery = (
  assessmentId: string,
  gate: 1 | 2 | 3,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) =>
  useQuery({
    queryKey: assessmentKeys.verdict(assessmentId, gate),
    queryFn: () =>
      apiClient.get<GateVerdictResponse>({
        url: `/assessments/${assessmentId}/gates/${gate}`,
        auth: true,
        suppressErrorToast: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    refetchInterval: options?.refetchInterval ?? false,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Review summary (Gate 1 screen 17 read-only, no submit)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /assessments/:assessmentId/gates/{gate}/review-summary */
export const useReviewSummaryQuery = (
  assessmentId: string,
  gate: 1 | 2 | 3 = 1,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.reviewSummary(assessmentId, gate),
    queryFn: async (): Promise<unknown> =>
      apiClient.get<{ data: ReviewSummaryEntry[] }>({
        url: `/assessments/${assessmentId}/gates/${gate}/review-summary`,
        auth: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 (Gate 2) Intro & Pillar Intro Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/assessments/:assessmentId/gates/2/intro
 *
 * General Stage 2 intro landing page data (hero, pillars, roleFamilies, stats, nextPillar).
 * Side effect on server: enqueues background prefetch for nextPillar.
 */
export const useStage2IntroQuery = (
  assessmentId: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.gate2Intro(assessmentId),
    queryFn: () =>
      apiClient.get<Gate2StageIntroResponse>({
        url: `/assessments/${assessmentId}/gates/2/intro`,
        auth: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    staleTime: 2 * 60 * 1000,
  });

/**
 * GET /api/v1/assessments/:assessmentId/gates/2/pillars/:pillar/intro
 *
 * Per-role pillar intro before starting questions (counts, timer, level band, etc).
 * Side effect on server: re-ensures prefetch for that pillar.
 */
export const useStage2PillarIntroQuery = (
  assessmentId: string,
  pillar: Gate2PillarKey,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.gate2PillarIntro(assessmentId, pillar),
    queryFn: () =>
      apiClient.get<Gate2PillarIntroResponse>({
        url: `/assessments/${assessmentId}/gates/2/pillars/${pillar}/intro`,
        auth: true,
      }),
    enabled: (options?.enabled ?? true) && !!assessmentId && !!pillar,
    staleTime: 2 * 60 * 1000,
  });

/**
 * GET /assessments/:assessmentId/gates/2/pillars/:pillar/items?from=...&through=...
 * Fetch next window of items for Gate 2 pillar questions.
 */
export const fetchGate2PillarItems = async (
  assessmentId: string,
  pillar: Gate2PillarKey | string,
  params?: { from?: number; through?: number },
): Promise<Gate2PillarItemsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.from !== undefined) queryParams.set('from', String(params.from));
  if (params?.through !== undefined) queryParams.set('through', String(params.through));
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return apiClient.get<Gate2PillarItemsResponse>({
    url: `/assessments/${assessmentId}/gates/2/pillars/${pillar}/items${queryString}`,
    auth: true,
  });
};

export const useGate2PillarItemsQuery = (
  assessmentId: string,
  pillar: Gate2PillarKey | string,
  params?: { from?: number; through?: number },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.gate2PillarItems(
      assessmentId,
      pillar,
      params?.from,
      params?.through,
    ),
    queryFn: () => fetchGate2PillarItems(assessmentId, pillar, params),
    enabled: (options?.enabled ?? true) && !!assessmentId && !!pillar,
  });

// ── Gate 3 API Endpoints ──────────────────────────────────────────────────────

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/start
 * No body. Initialises Stage 3 session.
 */
export const startGate3Session = async (
  assessmentId: string,
): Promise<import('./types').Gate3StartResponse> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/start`,
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3StartResponse;
};

/**
 * GET /api/v1/assessments/:assessmentId/gates/3/resume-state
 * Welcome-back routing for Stage 3 — nextStep / nextCalls, and current prompt window.
 */
export const fetchGate3ResumeState = async (
  assessmentId: string,
): Promise<import('./types').Gate3ResumeState> => {
  const res = await apiClient.get<any>({
    url: `/assessments/${assessmentId}/gates/3/resume-state`,
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3ResumeState;
};

/**
 * React Query hook for Gate 3 resume-state.
 */
export const useGate3ResumeStateQuery = (
  assessmentId: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.resumeState(assessmentId, 3),
    queryFn: async (): Promise<import('./types').Gate3ResumeState> =>
      fetchGate3ResumeState(assessmentId),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    staleTime: 15 * 1000,
  });

/**
 * GET /api/v1/assessments/:assessmentId/gates/3/items
 * Retrieves current Gate 3 item prompt / polling status.
 * Optionally pass from/through to request a specific window (from upload response hints).
 */
export const fetchGate3Items = async (
  assessmentId: string,
  params?: { from?: number; through?: number },
): Promise<import('./types').Gate3StartResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.from !== undefined) queryParams.set('from', String(params.from));
  if (params?.through !== undefined) queryParams.set('through', String(params.through));
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const res = await apiClient.get<any>({
    url: `/assessments/${assessmentId}/gates/3/items${queryString}`,
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3StartResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/items/:itemId/video
 * Multipart form upload for video prompt response.
 */
export const uploadGate3Video = async (
  assessmentId: string,
  itemId: string,
  file: Blob | File,
  transcript?: string,
): Promise<import('./types').Gate3UploadResponse> => {
  const formData = new FormData();
  
  // Extract clean MIME type without parameters (e.g. "video/webm;codecs=vp9,opus" -> "video/webm")
  const rawType = file.type || '';
  let cleanType = rawType.split(';')[0].trim().toLowerCase();
  if (!cleanType || !cleanType.startsWith('video/')) {
    cleanType = 'video/webm';
  }

  const ext = cleanType.includes('mp4') ? 'mp4' : cleanType.includes('quicktime') || cleanType.includes('mov') ? 'mov' : 'webm';
  const fileName = (file instanceof File && file.name) ? file.name : `video-response.${ext}`;

  const uploadFile = file instanceof File && file.type === cleanType
    ? file
    : new File([file], fileName, { type: cleanType });

  formData.append('file', uploadFile, fileName);

  if (transcript && transcript.trim()) {
    formData.append('transcript', transcript.trim());
  }

  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/items/${itemId}/video`,
    body: formData,
    auth: true,
    suppressErrorToast: true,
  });
  return (res?.data || res) as import('./types').Gate3UploadResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/components/:componentId/submit
 * Final component submit for Gate 3 when scoringReady === true.
 */
export const submitComponentResponses = async (
  assessmentId: string,
  componentId: string,
  responses: Record<string, any> = {},
): Promise<any> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/components/${componentId}/submit`,
    body: { responses },
    auth: true,
  });
  return res?.data || res;
};

// ── Gate 3 Direct Upload (3-step Cloudinary flow) ──────────────────────────

/**
 * Helper to upload directly to Cloudinary using signed fields & FormData.
 * Falls back to PUT pre-signed URL if no fields provided.
 */
export const uploadDirectToCloudinary = async (
  uploadUrl: string,
  file: Blob | File,
  fileName = 'recording.webm',
  fields?: Record<string, any>,
): Promise<any> => {
  if (fields && Object.keys(fields).length > 0) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('file', file, fileName);

    const cloudRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    if (!cloudRes.ok) {
      throw new Error(`Direct Cloudinary upload failed with HTTP status ${cloudRes.status}`);
    }
    return await cloudRes.json().catch(() => ({}));
  } else {
    // S3 / GCS pre-signed URL PUT fallback
    const rawType = file.type || 'video/webm';
    const contentType = rawType.split(';')[0].trim().toLowerCase() || 'video/webm';
    const cloudRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });
    if (!cloudRes.ok) {
      throw new Error(`Direct storage upload failed with HTTP status ${cloudRes.status}`);
    }
    return {};
  }
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/items/:itemId/video/upload-url
 * Step 1: Request a pre-signed Cloudinary upload URL & signature for direct upload.
 */
export const requestGate3UploadUrl = async (
  assessmentId: string,
  itemId: string,
  opts: { contentType: string; fileName?: string },
): Promise<import('./types').Gate3DirectUploadUrlResponse> => {
  let res: any;
  try {
    res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/gates/3/items/${itemId}/video/upload-url`,
      body: { contentType: opts.contentType, fileName: opts.fileName || 'response.webm' },
      auth: true,
    });
  } catch {
    // Fallback to non-/video path if backend route is mounted at root item level
    res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/gates/3/items/${itemId}/upload-url`,
      body: { contentType: opts.contentType, fileName: opts.fileName || 'response.webm' },
      auth: true,
    });
  }
  const data = res?.data || res;
  return data as import('./types').Gate3DirectUploadUrlResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/items/:itemId/video/complete
 * Step 3: Confirm the direct upload and attach raw WebSpeech transcript.
 */
export const completeGate3DirectUpload = async (
  assessmentId: string,
  itemId: string,
  opts: { uploadId: string; transcript?: string },
): Promise<import('./types').Gate3UploadResponse> => {
  const body: Record<string, any> = { uploadId: opts.uploadId };
  if (opts.transcript?.trim()) body.transcript = opts.transcript.trim();

  let res: any;
  try {
    res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/gates/3/items/${itemId}/video/complete`,
      body,
      auth: true,
    });
  } catch {
    // Fallback to root complete route
    res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/gates/3/items/${itemId}/complete`,
      body,
      auth: true,
    });
  }
  return (res?.data || res) as import('./types').Gate3UploadResponse;
};

// ── Gate 3 Candidate Voice ──────────────────────────────────────────────────

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/candidate-voice/questions/upload-url
 * Step 1: Request signed upload URL for candidate inquiry video.
 */
export const requestCandidateVoiceUploadUrl = async (
  assessmentId: string,
  opts: { contentType: string; fileName?: string },
): Promise<import('./types').Gate3DirectUploadUrlResponse> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice/questions/upload-url`,
    body: { contentType: opts.contentType, fileName: opts.fileName || 'question.webm' },
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3DirectUploadUrlResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/candidate-voice/questions/complete
 * Step 3: Confirm candidate inquiry video upload with topic.
 */
export const completeCandidateVoiceDirectUpload = async (
  assessmentId: string,
  opts: { uploadId: string; topic?: string },
): Promise<import('./types').Gate3CandidateVoiceQuestion> => {
  const body: Record<string, any> = { uploadId: opts.uploadId };
  if (opts.topic?.trim()) body.topic = opts.topic.trim();

  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice/questions/complete`,
    body,
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3CandidateVoiceQuestion;
};

/**
 * GET /api/v1/assessments/:assessmentId/gates/3/candidate-voice
 * Compulsory step — fetch current candidate-voice state.
 */
export const fetchGate3CandidateVoice = async (
  assessmentId: string,
): Promise<import('./types').Gate3CandidateVoiceResponse> => {
  const res = await apiClient.get<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice`,
    auth: true,
    suppressErrorToast: true,
  });
  return (res?.data || res) as import('./types').Gate3CandidateVoiceResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/candidate-voice/choice
 * Submit "yes" (will record questions) or "no" (skip).
 */
export const submitGate3CandidateVoiceChoice = async (
  assessmentId: string,
  choice: 'yes' | 'no',
): Promise<import('./types').Gate3CandidateVoiceResponse> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice/choice`,
    body: { choice },
    auth: true,
    suppressErrorToast: true,
  });
  return (res?.data || res) as import('./types').Gate3CandidateVoiceResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/gates/3/candidate-voice/questions
 * Multipart upload of a candidate question video.
 */
export const uploadCandidateVoiceQuestion = async (
  assessmentId: string,
  file: Blob | File,
  topic?: string,
): Promise<import('./types').Gate3CandidateVoiceQuestion> => {
  const formData = new FormData();

  const rawType = file.type || '';
  let cleanType = rawType.split(';')[0].trim().toLowerCase();
  if (!cleanType || !cleanType.startsWith('video/')) cleanType = 'video/webm';

  const ext = cleanType.includes('mp4') ? 'mp4' : cleanType.includes('mov') ? 'mov' : 'webm';
  const fileName = (file instanceof File && file.name) ? file.name : `question.${ext}`;
  const uploadFile = file instanceof File && file.type === cleanType
    ? file
    : new File([file], fileName, { type: cleanType });

  formData.append('file', uploadFile, fileName);
  if (topic?.trim()) formData.append('topic', topic.trim());

  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice/questions`,
    body: formData,
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3CandidateVoiceQuestion;
};

/**
 * DELETE /api/v1/assessments/:assessmentId/gates/3/candidate-voice/questions/:questionId
 * Remove a previously-uploaded candidate question.
 */
export const deleteCandidateVoiceQuestion = async (
  assessmentId: string,
  questionId: string,
): Promise<void> => {
  await apiClient.delete<any>({
    url: `/assessments/${assessmentId}/gates/3/candidate-voice/questions/${questionId}`,
    auth: true,
  });
};

// ── Employer Candidate-Voice Replies ────────────────────────────────────────

/**
 * POST /api/v1/assessments/:assessmentId/decision/candidate-voice/:questionId/reply
 * Employer text reply to a candidate question (max 5000 chars).
 */
export const postEmployerCandidateVoiceReplyText = async (
  assessmentId: string,
  questionId: string,
  text: string,
): Promise<any> => {
  try {
    const res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/decision/candidate-voice/${questionId}/reply`,
      body: { text },
      auth: true,
    });
    return res?.data || res;
  } catch {
    // Fallback to legacy path if backend mounted at root
    const res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/candidate-voice/questions/${questionId}/reply-text`,
      body: { text },
      auth: true,
    });
    return res?.data || res;
  }
};

/**
 * POST /api/v1/assessments/:assessmentId/decision/candidate-voice/:questionId/reply/upload-url
 * Direct upload URL for employer video reply.
 */
export const requestEmployerCandidateVoiceReplyUploadUrl = async (
  assessmentId: string,
  questionId: string,
  opts: { contentType: string; fileName?: string },
): Promise<import('./types').Gate3DirectUploadUrlResponse> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/decision/candidate-voice/${questionId}/reply/upload-url`,
    body: { contentType: opts.contentType, fileName: opts.fileName || 'reply.webm' },
    auth: true,
  });
  return (res?.data || res) as import('./types').Gate3DirectUploadUrlResponse;
};

/**
 * POST /api/v1/assessments/:assessmentId/decision/candidate-voice/:questionId/reply/complete
 * Complete direct upload for employer video reply.
 */
export const completeEmployerCandidateVoiceReplyUpload = async (
  assessmentId: string,
  questionId: string,
  opts: { uploadId: string },
): Promise<any> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/decision/candidate-voice/${questionId}/reply/complete`,
    body: { uploadId: opts.uploadId },
    auth: true,
  });
  return res?.data || res;
};

/**
 * POST /api/v1/assessments/:assessmentId/decision/candidate-voice/:questionId/reply/video
 * Employer video reply to a candidate question (multipart).
 */
export const postEmployerCandidateVoiceReplyVideo = async (
  assessmentId: string,
  questionId: string,
  file: Blob | File,
): Promise<any> => {
  const formData = new FormData();
  const rawType = file.type || '';
  let cleanType = rawType.split(';')[0].trim().toLowerCase();
  if (!cleanType || !cleanType.startsWith('video/')) cleanType = 'video/webm';

  const ext = cleanType.includes('mp4') ? 'mp4' : cleanType.includes('mov') ? 'mov' : 'webm';
  const fileName = (file instanceof File && file.name) ? file.name : `reply.${ext}`;
  const uploadFile = file instanceof File && file.type === cleanType
    ? file
    : new File([file], fileName, { type: cleanType });

  formData.append('file', uploadFile, fileName);

  try {
    const res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/decision/candidate-voice/${questionId}/reply/video`,
      body: formData,
      auth: true,
    });
    return res?.data || res;
  } catch {
    const res = await apiClient.post<any>({
      url: `/assessments/${assessmentId}/candidate-voice/questions/${questionId}/reply-video`,
      body: formData,
      auth: true,
    });
    return res?.data || res;
  }
};

// Aliases for backwards compatibility
export const postCandidateVoiceReplyText = postEmployerCandidateVoiceReplyText;
export const postCandidateVoiceReplyVideo = postEmployerCandidateVoiceReplyVideo;

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 4: Final Decision & Employer Review Queries / Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /assessments/:assessmentId/decision
 * Fetch candidate Stage 4 decision status & screen data (awaiting_employer, hired, alignment, rejected).
 */
export const fetchAssessmentDecision = async (
  assessmentId: string,
): Promise<import('./types').Stage4DecisionResponse> => {
  try {
    const res = await apiClient.get<any>({
      url: `/assessments/${assessmentId}/decision`,
      auth: true,
      suppressErrorToast: true,
    });
    return (res?.data || res) as import('./types').Stage4DecisionResponse;
  } catch (err: any) {
    // If the interview has not reached employer decision formulation yet or is in review,
    // safely fallback to the awaiting_employer screen state without raising global error toasts.
    return {
      statusCode: 200,
      message: 'Awaiting employer decision formulation',
      data: {
        screen: 'awaiting_employer',
        status: 'in_review',
      },
    } as any;
  }
};

export const useAssessmentDecisionQuery = (
  assessmentId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((query: any) => number | false);
  },
) =>
  useQuery({
    queryKey: assessmentKeys.decision(assessmentId),
    queryFn: () => fetchAssessmentDecision(assessmentId),
    enabled: Boolean(assessmentId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? 20000,
    staleTime: 5000,
  });

/**
 * POST /assessments/:assessmentId/decision/slot
 * Confirm selected alignment slot for candidate.
 */
export const confirmAlignmentSlot = async (
  assessmentId: string,
  slotId: string,
): Promise<any> => {
  const res = await apiClient.post<any>({
    url: `/assessments/${assessmentId}/decision/slot`,
    body: { slotId },
    auth: true,
  });
  return res?.data || res;
};

export const useConfirmAlignmentSlotMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, slotId }: { assessmentId: string; slotId: string }) =>
      confirmAlignmentSlot(assessmentId, slotId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.decision(variables.assessmentId) });
    },
  });
};

/**
 * GET /assessments/role/:rolePostingId/review-queue
 * Employer review queue for a role.
 */
export const fetchEmployerReviewQueue = async (
  rolePostingId: string,
): Promise<import('./types').EmployerReviewQueueItem[]> => {
  const res = await apiClient.get<any>({
    url: `/assessments/role/${rolePostingId}/review-queue`,
    auth: true,
  });
  return (res?.data?.items || res?.data || res) as import('./types').EmployerReviewQueueItem[];
};

export const useEmployerReviewQueueQuery = (rolePostingId: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: assessmentKeys.employerReviewQueue(rolePostingId),
    queryFn: () => fetchEmployerReviewQueue(rolePostingId),
    enabled: Boolean(rolePostingId) && (options?.enabled ?? true),
    refetchInterval: 5000,
  });

/**
 * GET /assessments/:assessmentId/employer-report?rolePostingId=
 * Full dossier / report for employer decision.
 */
export const fetchEmployerReport = async (
  assessmentId: string,
  rolePostingId?: string,
): Promise<import('./types').EmployerReportData> => {
  const qs = rolePostingId ? `?rolePostingId=${encodeURIComponent(rolePostingId)}` : '';
  const res = await apiClient.get<any>({
    url: `/assessments/${assessmentId}/employer-report${qs}`,
    auth: true,
    suppressErrorToast: true,
  });
  return (res?.data || res) as import('./types').EmployerReportData;
};

export const useEmployerReportQuery = (
  assessmentId: string,
  rolePostingId?: string,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.employerReport(assessmentId, rolePostingId),
    queryFn: () => fetchEmployerReport(assessmentId, rolePostingId),
    enabled: Boolean(assessmentId) && (options?.enabled ?? true),
  });

/**
 * POST /assessments/:assessmentId/decision/hire
 */
export const useEmployerDecideHireMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, offer }: { assessmentId: string; offer?: Record<string, any> }) =>
      apiClient.post<any>({
        url: `/assessments/${assessmentId}/decision/hire`,
        body: offer || {},
        auth: true,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
};

/**
 * POST /assessments/:assessmentId/decision/align
 */
export const useEmployerDecideAlignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      slots,
    }: {
      assessmentId: string;
      slots: Array<{ label: string; startsAt: string; timezone?: string }>;
    }) =>
      apiClient.post<any>({
        url: `/assessments/${assessmentId}/decision/align`,
        body: { slots },
        auth: true,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
};

/**
 * POST /assessments/:assessmentId/decision/reject
 *
 * Only after Stage 3 pass (COMPLETED + overall passed).
 * kind = 'LEGITIMATE' for form reasons; 'FRAUD' forfeits deposit.
 */
export const useEmployerDecideRejectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      kind = 'LEGITIMATE',
      primaryReason,
      details,
      reason,
    }: {
      assessmentId: string;
      kind?: 'LEGITIMATE' | 'FRAUD';
      primaryReason?: string;
      details?: string;
      reason?: string;
    }) =>
      apiClient.post<any>({
        url: `/assessments/${assessmentId}/decision/reject`,
        body: {
          kind,
          primaryReason: primaryReason || 'OTHER',
          details: details || reason || 'No additional details provided.',
        },
        auth: true,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
    },
  });
};



