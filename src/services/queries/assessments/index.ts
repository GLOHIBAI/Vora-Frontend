import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";
import { isGate1MockSession, shouldMockGate1 } from "../../../config/gate1Api";
import {
  mockGate1AdaptiveStep,
  mockGate1Draft,
  mockGate1Progress,
  mockGate1ResumeState,
  mockGate1ReviewSummary,
  mockGate1SaveDraft,
  mockGate1ScreensCatalog,
  mockGate1StartScreen,
  mockGate1SubmitScreen,
  mockGate1Verdict,
} from "../../../mocks/gate1MockSession";
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
};

// ─────────────────────────────────────────────────────────────────────────────
// Catalog & journey load once, cache aggressively
// ─────────────────────────────────────────────────────────────────────────────

/** GET /assessments/gates/{gate}/screens screen catalog with composite flags */
export const useAssessmentScreensQuery = (gate: 1 | 2 | 3 = 1) =>
  useQuery({
    queryKey: assessmentKeys.screens(gate),
    queryFn: () =>
      shouldMockGate1(gate)
        ? mockGate1ScreensCatalog()
        : apiClient.get<{ data: AssessmentScreenCatalog[] }>({
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
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: assessmentKeys.resumeState(assessmentId, gate),
    queryFn: async (): Promise<unknown> =>
      shouldMockGate1(gate)
        ? mockGate1ResumeState()
        : apiClient.get<GateResumeState>({
            url: `/assessments/${assessmentId}/gates/${gate}/resume-state`,
            auth: true,
          }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    staleTime: 30 * 1000, // 30s re-fetch after each screen submit
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
      if (shouldMockGate1(gate)) {
        const screenKey = (body.screen ?? "personality") as Gate1ScreenKey;
        return mockGate1StartScreen(screenKey);
      }
      return apiClient.post<AssessmentGateStartResponse>({
        url: `/assessments/${assessmentId}/gates/${gate}/start`,
        body,
        auth: true,
      });
    },
    onSuccess: (data, { assessmentId }) => {
      // Invalidate progress so the journey bar reflects the new screen start
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.progress(assessmentId),
      });
    },
  });
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
    mutationFn: ({
      assessmentId,
      componentId,
      responses,
    }: {
      assessmentId: string;
      componentId: string;
      /** Only NEW (unlocked) keys never re-send already-saved answers */
      responses: ResponsesMap;
    }) => {
      if (isGate1MockSession(assessmentId)) {
        return mockGate1SaveDraft(componentId, responses);
      }
      return apiClient.patch<SaveDraftResponse>({
        url: `/assessments/${assessmentId}/components/${componentId}/responses`,
        body: { responses },
        auth: true,
        suppressErrorToast: true,
      });
    },
    onSuccess: (_data, { assessmentId }) => {
      // Invalidate progress so the answered/total counts update in the UI
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.progress(assessmentId),
      });
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
      isGate1MockSession(assessmentId)
        ? mockGate1Draft(componentId)
        : apiClient.get<AssessmentDraftResponse>({
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
      if (isGate1MockSession(assessmentId)) {
        return mockGate1SubmitScreen(componentId, responses);
      }
      return apiClient.post<AssessmentSubmitResponse>({
        url: `/assessments/${assessmentId}/components/${componentId}/submit`,
        body: { responses },
        auth: true,
      });
    },
    onSuccess: (data: any, { assessmentId }) => {
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
    }: {
      assessmentId: string;
      gate?: number;
    }) => {
      if (isGate1MockSession(assessmentId)) {
        return Promise.resolve({
          statusCode: 200,
          message: "Stage 1 submitted for scoring.",
          data: {
            schemaVersion: 1,
            assessmentId,
            gate1Complete: true,
            finalSubmittedAt: new Date().toISOString(),
            status: "passed",
            verdict: {
              passed: true,
              score: 81,
              verdict: "qualified",
              gate: 1,
              integrityGate: "pass",
              coreBandScore: 0.78,
              unlocksNextGate: true
            }
          }
        });
      }
      return apiClient.post<any>({
        url: `/assessments/${assessmentId}/gates/${gate}/submit`,
        auth: true,
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

  const request = (
    isGate1MockSession(assessmentId)
      ? mockGate1AdaptiveStep(componentId, itemId)
      : apiClient.post<AdaptiveStepResponse>({
          url: `/assessments/${assessmentId}/components/${componentId}/items/${itemId}/adaptive`,
          body: { optionId },
          auth: true,
        })
  ).finally(() => {
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
      isGate1MockSession(assessmentId)
        ? mockGate1Progress()
        : apiClient.get<{ data: GateProgressEntry[] }>({
            url: `/assessments/${assessmentId}/gates/progress`,
            auth: true,
          }),
    enabled: (options?.enabled ?? true) && !!assessmentId,
    refetchInterval: options?.refetchInterval ?? false,
  });

/**
 * GET /assessments/:assessmentId/gates/{gate}/verdict
 *
 * Poll until verdict !== 'pending'. Backend scores asynchronously after all
 * gate-1 screens are submitted same pattern as CV parse status polling.
 */
export const useGateVerdictQuery = (
  assessmentId: string,
  gate: 1 | 2 | 3,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) =>
  useQuery({
    queryKey: assessmentKeys.verdict(assessmentId, gate),
    queryFn: () =>
      shouldMockGate1(gate)
        ? mockGate1Verdict()
        : apiClient.get<GateVerdictResponse>({
            url: `/assessments/${assessmentId}/gates/${gate}/verdict`,
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
      shouldMockGate1(gate)
        ? mockGate1ReviewSummary()
        : apiClient.get<{ data: ReviewSummaryEntry[] }>({
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


