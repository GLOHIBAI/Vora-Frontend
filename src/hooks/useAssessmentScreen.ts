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
    if (
      val !== null &&
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

  /** Submit the whole screen (flush unsaved multi-answer state, then score). */
  confirmScreen: () => Promise<void>;

  /**
   * Check whether an answer (or a specific sub-key within an answer) is
   * already locked on the server and must be shown as read-only.
   *
   *   isLocked('item-1')        → true if the whole item is locked
   *   isLocked('item-1', 'q3') → true if that specific sub-key is locked
   */
  isLocked: (itemId: string, subKey?: string) => boolean;

  isSaving: boolean;
  isSubmitting: boolean;
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
  const [answers, setAnswers] = useState<ResponsesMap>({});

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

  const buildDelta = useCallback(
    (
      itemId: string,
      value: AnswerValue,
      subKey?: string,
    ): ResponsesMap | null => {
      if (subKey !== undefined) {
        if (isSubKeyLocked(lockedResponses.current, itemId, subKey))
          return null;
        return { [itemId]: { [subKey]: value } };
      }
      if (isWholeItemLocked(lockedResponses.current, itemId)) return null;
      return { [itemId]: value };
    },
    [],
  );

  const persistDraftDelta = useCallback(
    async (
      itemId: string,
      value: AnswerValue,
      item: AssessmentItem,
      subKey?: string,
    ) => {
      if (!canPersistDraftDelta(item, value, subKey)) return;

      const delta = buildDelta(itemId, value, subKey);
      if (!delta) return;

      try {
        const resp = await saveDraft.mutateAsync({
          assessmentId,
          componentId,
          responses: delta,
        });
        applyServerResponse(normalizeSaveResponse(resp));
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 400) {
          lockedResponses.current = {
            ...lockedResponses.current,
            [itemId]:
              subKey !== undefined
                ? ({
                    ...(typeof lockedResponses.current[itemId] === "object"
                      ? (lockedResponses.current[itemId] as Record<
                          string,
                          unknown
                        >)
                      : {}),
                    [subKey]: value,
                  } as any)
                : value,
          };
        }
      }
    },
    [assessmentId, componentId, saveDraft, buildDelta, applyServerResponse],
  );

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
      setAnswers(savedResponses);
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
      // ── 1. Update local state immediately (zero latency for the UI) ─────────
      setAnswers((prev) => {
        if (subKey !== undefined) {
          // Merge sub-key into the item's existing object answer
          const existing =
            typeof prev[itemId] === "object" && !Array.isArray(prev[itemId])
              ? (prev[itemId] as Record<string, unknown>)
              : {};
          return { ...prev, [itemId]: { ...existing, [subKey]: value } as any };
        }
        return { ...prev, [itemId]: value };
      });

      // ── 2. Adaptive → per-step endpoint, no draft write ────────────────────
      if (
        isAdaptiveType(item.type) &&
        item.content.layout !== "multi_question"
      ) {
        try {
          const optionId = value as string;
          const raw = await submitAdaptive.mutateAsync({
            assessmentId,
            componentId,
            itemId,
            optionId,
          });
          const result = normalizeAdaptiveStepResponse(raw);
          if (result.nextItem) {
            setPriorSteps((prev) => [
              ...prev,
              {
                step: prev.length,
                optionId,
                content: { ...item.content },
              },
            ]);

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
            setPriorSteps((prev) => [
              ...prev,
              {
                step: prev.length,
                optionId,
                content: { ...item.content },
              },
            ]);

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
          setAnswers((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
          onAdaptiveStep?.(result);
        } catch {
          /* error toast shown by API client */
        }
        return;
      }

      // ── 3. Immediate draft PATCH (single-select + partial-draft sub-keys) ──
      if (
        isSingleAnswerType(item.type) ||
        (isPartialDraftType(item.type) && subKey !== undefined) ||
        (item.type === "adaptive_mcq" &&
          item.content.layout === "multi_question" &&
          subKey !== undefined)
      ) {
        await persistDraftDelta(itemId, value, item, subKey);
        return;
      }

      // ── 4. Batch types (rank, SJT whole-item) → local until Continue ─────
    },
    [
      assessmentId,
      componentId,
      submitAdaptive,
      onAdaptiveStep,
      persistDraftDelta,
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
      const unsavedBatch: ResponsesMap = {};
      items.forEach((item) => {
        if (!isMultipleAnswerType(item.type)) return;
        if (isWholeItemLocked(lockedResponses.current, item.id)) return;
        const v = answers[item.id];
        if (v !== undefined && isItemAnswerComplete(item, v)) {
          unsavedBatch[item.id] = v;
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
    saveDraft,
    submitScreen,
    onScreenComplete,
    applyServerResponse,
  ]);

  // ── Reset on screen change ─────────────────────────────────────────────────

  useEffect(() => {
    setItems(getInitialItems());
    setAnswers({});
    lockedResponses.current = {};
    setPriorSteps(screenData.adaptiveMcq?.priorSteps ?? []);
    setIsSubmitProcessActive(false);
  }, [componentId, screenData.adaptiveMcq?.priorSteps, getInitialItems]);

  return {
    items: itemsWithPriorSteps,
    answers,
    recordAnswer,
    confirmScreen,
    isLocked,
    isSaving,
    isSubmitting,
    isScreenComplete,
    hydrateDraft,
  };
}
