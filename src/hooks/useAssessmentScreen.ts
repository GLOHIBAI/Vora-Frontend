import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  useSaveAssessmentDraftMutation,
  useSubmitAssessmentScreenMutation,
  useSubmitAdaptiveStepMutation,
} from "../services/queries/assessments";
import {
  isItemAnswerComplete,
  canPersistDraftDelta,
} from "../utils/assessmentValidation";
import {
  normalizeSaveDraftResponse,
  normalizeAdaptiveStepResponse,
  getRankOptionIds,
  getValuesTradeoffTensions,
} from "../utils/assessmentItems";
import { buildScreenSubmitResponses } from "../utils/assessmentFlow";
import {
  isSingleAnswerType,
  isAdaptiveType,
  isPartialDraftType,
  isMultipleAnswerType,
  isSubKeyLocked,
  isWholeItemLocked,
  isSubItemLockedType,
  type AssessmentGateStartResponse,
  type AssessmentItem,
  type ResponsesMap,
  type AnswerValue,
  type AdaptiveStepResponse,
  type SaveDraftResponse,
  type AdaptiveMcqPriorStep,
} from "../services/queries/assessments/types";

const mergeResponseMaps = (
  base: ResponsesMap,
  incoming: ResponsesMap,
): ResponsesMap => {
  const next: ResponsesMap = { ...base };
  for (const [itemId, val] of Object.entries(incoming)) {
    if (val === null || val === undefined) {
      continue;
    }
    if (
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof next[itemId] === "object" &&
      next[itemId] !== null &&
      !Array.isArray(next[itemId])
    ) {
      next[itemId] = {
        ...(next[itemId] as Record<string, unknown>),
        ...(val as Record<string, unknown>),
      } as AnswerValue;
    } else {
      next[itemId] = val;
    }
  }
  return next;
};

const normalizeSaveResponse = (raw: unknown): SaveDraftResponse =>
  normalizeSaveDraftResponse(raw);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseAssessmentScreenOptions {
  assessmentId: string;
  screenData: AssessmentGateStartResponse;
  onScreenComplete: () => void | Promise<void>;
  onAdaptiveStep?: (response: AdaptiveStepResponse) => void;
}

interface UseAssessmentScreenReturn {
  /** Current live items[] updates when server regenerates unseen questions */
  items: AssessmentItem[];

  /** Local answer state drives all UI rendering */
  answers: ResponsesMap;

  /**
   * Record an answer interaction.
   *
   * `subKey` is required for sub-item types (likert questionId, forced-choice
   * blockId, values pairId). For whole-item types leave it undefined.
   *
   * Save strategy:
   *   SINGLE / sub-item single → draft-save immediately (only the new delta)
   *   MULTIPLE                 → local state only; flushed on confirmScreen()
   *   ADAPTIVE                 → posts to the per-step adaptive endpoint
   */
  recordAnswer: (
    itemId: string,
    value: AnswerValue,
    item: AssessmentItem,
    subKey?: string,
  ) => Promise<void>;

  /** Submit the whole screen (flush unsaved state, then score). */
  confirmScreen: () => Promise<void>;

  /** Gathers all locally selected but unsaved answers and saves draft on the server. */
  saveCurrentDraft: () => Promise<void>;

  /** Check whether an answer (or a specific sub-key within an answer) is already locked. */
  isLocked: (itemId: string, subKey?: string) => boolean;

  isSaving: boolean;
  isSubmitting: boolean;
  isAdaptiveLoading: boolean;
  /** True when every non-adaptive item has a non-empty local answer */
  isScreenComplete: boolean;

  /**
   * Populate initial answers from a persisted draft.
   * Call once after useAssessmentDraftQuery resolves when sessionState === 'resumed'.
   * Pass draft items when the server refreshed unanswered content on load.
   */
  hydrateDraft: (
    savedResponses: ResponsesMap,
    draftItems?: AssessmentItem[],
  ) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAssessmentScreen({
  assessmentId,
  screenData,
  onScreenComplete,
  onAdaptiveStep,
}: UseAssessmentScreenOptions): UseAssessmentScreenReturn {
  const { componentId, items: initialItems } = screenData;

  const getInitialItems = useCallback(() => {
    return initialItems.map((item) => {
      if (isAdaptiveType(item.type) && screenData.adaptiveMcq) {
        return {
          ...item,
          content: {
            ...item.content,
            complete: screenData.adaptiveMcq.complete,
            stepIndex: screenData.adaptiveMcq.currentStep,
            totalSteps: screenData.adaptiveMcq.totalSteps,
          },
        };
      }
      return item;
    });
  }, [initialItems, screenData.adaptiveMcq]);

  // ── State ──────────────────────────────────────────────────────────────────

  /**
   * items[] may be refreshed by the server when it regenerates unseen content.
   * We start with what came in the start response and replace on regeneration.
   */
  const [items, setItems] = useState<AssessmentItem[]>(getInitialItems);

  const [priorSteps, setPriorSteps] = useState<AdaptiveMcqPriorStep[]>(
    screenData.adaptiveMcq?.priorSteps ?? [],
  );

  const itemsWithPriorSteps = useMemo(() => {
    return items.map((row) => {
      if (isAdaptiveType(row.type)) {
        return {
          ...row,
          content: {
            ...row.content,
            priorSteps,
          },
        };
      }
      return row;
    });
  }, [items, priorSteps]);

  /** Local answer accumulator source of truth for UI rendering */
  const [answers, setAnswers] = useState<ResponsesMap>(() => {
    const initialAnswers: ResponsesMap = {};
    initialItems.forEach((item) => {
      const typeStr = item.type as string;
      if (
        typeStr === "rank" ||
        typeStr === "drag_rank" ||
        typeStr === "sjt_rank" ||
        typeStr === "sjt_rank_all"
      ) {
        initialAnswers[item.id] = getRankOptionIds(item);
      } else if (
        typeStr === "values_tradeoff" ||
        typeStr === "sjt_values_tradeoff"
      ) {
        const tensions = getValuesTradeoffTensions(item);
        const record: Record<string, number> = {};
        tensions.forEach((t) => {
          record[t.id] = 0; // Default to 'Balanced'
        });
        initialAnswers[item.id] = record;
      }
    });
    return initialAnswers;
  });

  /** Tracks whether the final submit request is currently in-progress (including post-submit navigation) */
  const [isSubmitProcessActive, setIsSubmitProcessActive] = useState(false);

  /**
   * Tracks what the server has actually persisted.
   * Keys present here are LOCKED we must never re-send them in a PATCH.
   *
   * Structure mirrors ResponsesMap:
   *   - Whole-item: lockedResponses[itemId] = the saved value
   *   - Sub-item:   lockedResponses[itemId] = { subKey: value, ... }
   */
  const lockedResponses = useRef<ResponsesMap>({});
  const isAdaptiveSubmittingRef = useRef(false);
  /** Steps already POSTed for this component — never clear mid-screen. */
  const submittedAdaptiveStepsRef = useRef<Set<string>>(new Set());
  const priorStepsRef = useRef(priorSteps);
  priorStepsRef.current = priorSteps;
  /** Sync loading flag so option buttons disable before React Query isPending flips. */
  const [isAdaptiveLoading, setIsAdaptiveLoading] = useState(false);
  const resetForComponentIdRef = useRef<string | null>(null);

  // Reset only when the assessment component/screen id changes — not when
  // initialItems / adaptiveMcq get a new object identity from a duplicate /start.
  useEffect(() => {
    if (resetForComponentIdRef.current === componentId) return;
    resetForComponentIdRef.current = componentId;

    setItems(getInitialItems());

    const initialAnswers: ResponsesMap = {};
    initialItems.forEach((item) => {
      const typeStr = item.type as string;
      if (
        typeStr === "rank" ||
        typeStr === "drag_rank" ||
        typeStr === "sjt_rank" ||
        typeStr === "sjt_rank_all"
      ) {
        initialAnswers[item.id] = getRankOptionIds(item);
      } else if (
        typeStr === "values_tradeoff" ||
        typeStr === "sjt_values_tradeoff"
      ) {
        const tensions = getValuesTradeoffTensions(item);
        const record: Record<string, number> = {};
        tensions.forEach((t) => {
          record[t.id] = 0; // Default to 'Balanced'
        });
        initialAnswers[item.id] = record;
      }
    });
    setAnswers(initialAnswers);
    lockedResponses.current = {};
    isAdaptiveSubmittingRef.current = false;
    submittedAdaptiveStepsRef.current = new Set();
    setIsAdaptiveLoading(false);
    setPriorSteps(screenData.adaptiveMcq?.priorSteps ?? []);
    setIsSubmitProcessActive(false);
    // Intentionally only componentId: identity churn on items/adaptiveMcq must not
    // clear the in-flight adaptive step lock (that caused double shimmer).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [componentId]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveDraft = useSaveAssessmentDraftMutation();
  const submitScreen = useSubmitAssessmentScreenMutation();
  const submitAdaptive = useSubmitAdaptiveStepMutation();

  const isLocked = useCallback(
    (itemId: string, subKey?: string): boolean => {
      const item = items.find((it) => it.id === itemId);
      if (!item) return false;
      if (isAdaptiveType(item.type)) {
        return item.content.complete === true;
      }
      if (isSubItemLockedType(item.type)) {
        if (subKey !== undefined) {
          return isSubKeyLocked(lockedResponses.current, itemId, subKey);
        }
        return false;
      }
      return isWholeItemLocked(lockedResponses.current, itemId);
    },
    [items],
  );

  /**
   * After a successful PATCH the server returns the full responses map.
   * We use it to update lockedResponses so subsequent calls know what's locked.
   * We also replace items[] if the server regenerated unseen questions.
   */
  const applyServerResponse = useCallback((resp: SaveDraftResponse) => {
    lockedResponses.current = mergeResponseMaps(
      lockedResponses.current,
      resp.responses,
    );
    setAnswers((prev) => mergeResponseMaps(prev, resp.responses));
    if (resp.questionsRegenerated && resp.items?.length) {
      setItems(resp.items);
    }
  }, []);

  const saveCurrentDraft = useCallback(async () => {
    const unsavedBatch: ResponsesMap = {};
    items.forEach((item) => {
      if (isAdaptiveType(item.type) && item.content.layout !== "multi_question") return;

      const val = answers[item.id];
      if (val === undefined || val === null) return;

      if (isSubItemLockedType(item.type)) {
        if (typeof val === "object" && !Array.isArray(val)) {
          const delta: Record<string, unknown> = {};
          Object.entries(val).forEach(([subKey, subVal]) => {
            if (!isSubKeyLocked(lockedResponses.current, item.id, subKey)) {
              delta[subKey] = subVal;
            }
          });
          if (Object.keys(delta).length > 0) {
            unsavedBatch[item.id] = delta as AnswerValue;
          }
        }
      } else {
        if (!isWholeItemLocked(lockedResponses.current, item.id)) {
          unsavedBatch[item.id] = val;
        }
      }
    });

    if (Object.keys(unsavedBatch).length > 0) {
      const resp = await saveDraft.mutateAsync({
        assessmentId,
        componentId,
        responses: unsavedBatch,
      });
      applyServerResponse(normalizeSaveResponse(resp));
    }
  }, [assessmentId, componentId, items, answers, saveDraft, applyServerResponse]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  // ── Computed state ─────────────────────────────────────────────────────────

  const isScreenComplete = items.every((item) => {
    if (isAdaptiveType(item.type) && item.content.layout !== "multi_question") {
      return item.content.complete === true;
    }
    return isItemAnswerComplete(item, answers[item.id]);
  });

  const isSaving = saveDraft.isPending;
  const isSubmitting = submitScreen.isPending || isSubmitProcessActive;

  // ── Public API ─────────────────────────────────────────────────────────────

  const hydrateDraft = useCallback(
    (savedResponses: ResponsesMap, draftItems?: AssessmentItem[]) => {
      setAnswers((prev) => mergeResponseMaps(prev, savedResponses));
      lockedResponses.current = mergeResponseMaps({}, savedResponses);
      if (draftItems?.length) {
        const merged = draftItems.map((item) => {
          if (isAdaptiveType(item.type) && screenData.adaptiveMcq) {
            return {
              ...item,
              content: {
                ...item.content,
                complete: screenData.adaptiveMcq.complete,
                stepIndex: screenData.adaptiveMcq.currentStep,
                totalSteps: screenData.adaptiveMcq.totalSteps,
              },
            };
          }
          return item;
        });
        setItems(merged);
      }
    },
    [screenData.adaptiveMcq],
  );

  const recordAnswer = useCallback(
    async (
      itemId: string,
      value: AnswerValue,
      item: AssessmentItem,
      subKey?: string,
    ) => {
      // ── Adaptive → per-step endpoint (guard BEFORE local state / network) ──
      if (
        isAdaptiveType(item.type) &&
        item.content.layout !== "multi_question"
      ) {
        const stepIndex = Number(
          item.content.stepIndex ?? priorStepsRef.current.length ?? 0,
        );
        const stepKey = `${itemId}:${stepIndex}`;

        if (
          isAdaptiveSubmittingRef.current ||
          submittedAdaptiveStepsRef.current.has(stepKey) ||
          isAdaptiveLoading
        ) {
          return;
        }

        // Lock this step permanently for this screen before any await.
        isAdaptiveSubmittingRef.current = true;
        submittedAdaptiveStepsRef.current.add(stepKey);
        setIsAdaptiveLoading(true);

        const optionId = value as string;
        const answeredPrior = {
          step: priorStepsRef.current.length,
          optionId,
          content: { ...item.content },
        };

        // Optimistically pin answered scenario above shimmer (never disappears).
        priorStepsRef.current = [...priorStepsRef.current, answeredPrior];
        setPriorSteps(priorStepsRef.current);
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        // Clear active step until nextItem arrives (prior + shimmer only).
        setItems((prev) =>
          prev.map((row) =>
            row.id === itemId
              ? {
                  ...row,
                  content: {
                    ...row.content,
                    scenario: undefined,
                    stem: undefined,
                    prompt: undefined,
                    instruction: undefined,
                    options: [],
                    table: undefined,
                    chart: undefined,
                    complete: false,
                  },
                }
              : row,
          ),
        );

        try {
          const raw = await submitAdaptive.mutateAsync({
            assessmentId,
            componentId,
            itemId,
            optionId,
          });
          const result = normalizeAdaptiveStepResponse(raw);
          if (result.nextItem) {
            setItems((prev) =>
              prev.map((row) =>
                row.id === itemId
                  ? {
                      ...row,
                      content: {
                        ...row.content,
                        ...result.nextItem,
                        stepIndex: result.stepIndex,
                        totalSteps: result.totalSteps,
                        complete: result.complete,
                      },
                    }
                  : row,
              ),
            );
          } else if (result.complete) {
            setItems((prev) =>
              prev.map((row) =>
                row.id === itemId
                  ? {
                      ...row,
                      content: { ...row.content, complete: true },
                    }
                  : row,
              ),
            );
          }
          onAdaptiveStep?.(result);
        } catch (err) {
          // Roll back optimistic prior step and allow retry.
          submittedAdaptiveStepsRef.current.delete(stepKey);
          priorStepsRef.current = priorStepsRef.current.slice(0, -1);
          setPriorSteps(priorStepsRef.current);
          setItems((prev) =>
            prev.map((row) =>
              row.id === itemId
                ? {
                    ...row,
                    content: { ...item.content },
                  }
                : row,
            ),
          );
          setAnswers((prev) => ({ ...prev, [itemId]: value }));
          throw err;
        } finally {
          isAdaptiveSubmittingRef.current = false;
          setIsAdaptiveLoading(false);
        }
        return;
      }

      // ── Non-adaptive: update local state immediately ───────────────────────
      setAnswers((prev) => {
        if (subKey !== undefined) {
          const existing =
            typeof prev[itemId] === "object" && !Array.isArray(prev[itemId])
              ? (prev[itemId] as Record<string, unknown>)
              : {};
          return { ...prev, [itemId]: { ...existing, [subKey]: value } as any };
        }
        return { ...prev, [itemId]: value };
      });

      // Immediate draft PATCH skipped (handled in batch on continue/save)
    },
    [
      assessmentId,
      componentId,
      submitAdaptive,
      onAdaptiveStep,
      isAdaptiveLoading,
    ],
  );

  const confirmScreen = useCallback(async () => {
    if (
      !items.every((item) => {
        if (
          isAdaptiveType(item.type) &&
          item.content.layout !== "multi_question"
        ) {
          return item.content.complete === true;
        }
        return isItemAnswerComplete(item, answers[item.id]);
      })
    ) {
      return;
    }

    setIsSubmitProcessActive(true);
    try {
      const submitPayload = buildScreenSubmitResponses(items, answers);

      await submitScreen.mutateAsync({
        assessmentId,
        componentId,
        responses: submitPayload,
      });

      await onScreenComplete();
    } catch (err) {
      setIsSubmitProcessActive(false);
      throw err;
    }
  }, [
    assessmentId,
    componentId,
    items,
    answers,
    submitScreen,
    onScreenComplete,
  ]);



  return {
    items: itemsWithPriorSteps,
    answers,
    recordAnswer,
    confirmScreen,
    saveCurrentDraft,
    isLocked,
    isSaving,
    isSubmitting,
    isAdaptiveLoading: isAdaptiveLoading || submitAdaptive.isPending,
    isScreenComplete,
    hydrateDraft,
  };
}
