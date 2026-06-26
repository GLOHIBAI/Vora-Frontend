import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useSaveAssessmentDraftMutation,
  useSubmitAssessmentScreenMutation,
  useSubmitAdaptiveStepMutation,
} from '../services/queries/assessments';
import {
  isSingleAnswerType,
  isAdaptiveType,
  isSubItemLockedType,
  isSubKeyLocked,
  isWholeItemLocked,
  type AssessmentGateStartResponse,
  type AssessmentItem,
  type ResponsesMap,
  type AnswerValue,
  type AdaptiveStepResponse,
  type SaveDraftResponse,
} from '../services/queries/assessments/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseAssessmentScreenOptions {
  assessmentId: string;
  screenData: AssessmentGateStartResponse;
  onScreenComplete: (response: { nextScreenKey?: string }) => void;
  onAdaptiveStep?: (response: AdaptiveStepResponse) => void;
}

interface UseAssessmentScreenReturn {
  /** Current live items[] — updates when server regenerates unseen questions */
  items: AssessmentItem[];

  /** Local answer state — drives all UI rendering */
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
   * Call this once after useAssessmentDraftQuery resolves, only when
   * the start response sessionState === 'resumed'.
   */
  hydrateDraft: (savedResponses: ResponsesMap) => void;
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

  // ── State ──────────────────────────────────────────────────────────────────

  /**
   * items[] may be refreshed by the server when it regenerates unseen content.
   * We start with what came in the start response and replace on regeneration.
   */
  const [items, setItems] = useState<AssessmentItem[]>(initialItems);

  /** Local answer accumulator — source of truth for UI rendering */
  const [answers, setAnswers] = useState<ResponsesMap>({});

  /**
   * Tracks what the server has actually persisted.
   * Keys present here are LOCKED — we must never re-send them in a PATCH.
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

  // ── Lock helpers ───────────────────────────────────────────────────────────

  const isLocked = useCallback(
    (itemId: string, subKey?: string): boolean => {
      if (subKey !== undefined) {
        return isSubKeyLocked(lockedResponses.current, itemId, subKey);
      }
      return isWholeItemLocked(lockedResponses.current, itemId);
    },
    [],
  );

  /**
   * After a successful PATCH the server returns the full responses map.
   * We use it to update lockedResponses so subsequent calls know what's locked.
   * We also replace items[] if the server regenerated unseen questions.
   */
  const applyServerResponse = useCallback((resp: SaveDraftResponse) => {
    // Merge server-confirmed responses into the locked set
    lockedResponses.current = {
      ...lockedResponses.current,
      ...resp.responses,
    };
    // Replace items if the server produced fresh question copy
    if (resp.questionsRegenerated) {
      setItems(resp.items);
    }
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Build the delta — only keys that aren't already locked on the server.
   * Handles both whole-item and sub-item answer shapes.
   */
  const buildDelta = useCallback(
    (itemId: string, value: AnswerValue, subKey?: string): ResponsesMap | null => {
      if (subKey !== undefined) {
        // Sub-item: check this specific sub-key
        if (isSubKeyLocked(lockedResponses.current, itemId, subKey)) return null;
        return { [itemId]: { [subKey]: value } };
      }
      // Whole-item: check the whole item
      if (isWholeItemLocked(lockedResponses.current, itemId)) return null;
      return { [itemId]: value };
    },
    [],
  );

  // ── Computed state ─────────────────────────────────────────────────────────

  const isScreenComplete = items
    .filter((item) => !isAdaptiveType(item.type))
    .every((item) => {
      const v = answers[item.id];
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object' && v !== null) {
        const obj = v as Record<string, unknown>;
        // For sub-item types, every sub-key present in the item content must be answered
        return Object.values(obj).every((s) => s !== null && s !== undefined);
      }
      return true;
    });

  const isSaving = saveDraft.isPending;
  const isSubmitting = submitScreen.isPending;

  // ── Public API ─────────────────────────────────────────────────────────────

  const hydrateDraft = useCallback((savedResponses: ResponsesMap) => {
    setAnswers(savedResponses);
    // Everything from the draft is already persisted → treat as locked
    lockedResponses.current = { ...savedResponses };
  }, []);

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
            typeof prev[itemId] === 'object' && !Array.isArray(prev[itemId])
              ? (prev[itemId] as Record<string, unknown>)
              : {};
          return { ...prev, [itemId]: { ...existing, [subKey]: value } };
        }
        return { ...prev, [itemId]: value };
      });

      // ── 2. Adaptive → per-step endpoint, no draft write ────────────────────
      if (isAdaptiveType(item.type)) {
        try {
          const result = await submitAdaptive.mutateAsync({
            assessmentId,
            componentId,
            itemId,
            optionId: value as string,
          });
          onAdaptiveStep?.(result);
        } catch {
          /* error toast shown by API client */
        }
        return;
      }

      // ── 3. Single-answer items → immediate draft save (delta only) ─────────
      if (isSingleAnswerType(item.type)) {
        const delta = buildDelta(itemId, value, subKey);
        if (!delta) return; // already locked — nothing to send

        try {
          const resp = await saveDraft.mutateAsync({
            assessmentId,
            componentId,
            responses: delta,
          });
          applyServerResponse(resp);
        } catch (err: any) {
          // Lock error (400 ASSESSMENT_RESPONSE_INVALID): the sub-key was
          // already saved in a previous session. Mark it locked locally so
          // subsequent interactions don't try again.
          if (err?.status === 400) {
            lockedResponses.current = {
              ...lockedResponses.current,
              [itemId]:
                subKey !== undefined
                  ? {
                      ...(typeof lockedResponses.current[itemId] === 'object'
                        ? (lockedResponses.current[itemId] as Record<string, unknown>)
                        : {}),
                      [subKey]: value,
                    }
                  : value,
            };
          }
        }
        return;
      }

      // ── 4. Multiple-answer items → local state only ────────────────────────
      // Nothing to do here. confirmScreen() will flush everything.
    },
    [
      assessmentId,
      componentId,
      saveDraft,
      submitAdaptive,
      onAdaptiveStep,
      buildDelta,
      applyServerResponse,
    ],
  );

  const confirmScreen = useCallback(async () => {
    // Collect multiple-answer items not yet saved (whole items only)
    const unsavedMultiple: ResponsesMap = {};
    items.forEach((item) => {
      if (
        !isAdaptiveType(item.type) &&
        !isSingleAnswerType(item.type) &&
        !isWholeItemLocked(lockedResponses.current, item.id)
      ) {
        const v = answers[item.id];
        if (v !== undefined) unsavedMultiple[item.id] = v;
      }
    });

    // Flush unsaved multiple-answer items as one batch PATCH
    if (Object.keys(unsavedMultiple).length > 0) {
      const resp = await saveDraft.mutateAsync({
        assessmentId,
        componentId,
        responses: unsavedMultiple,
      });
      applyServerResponse(resp);
    }

    // Submit everything for scoring
    const result = await submitScreen.mutateAsync({
      assessmentId,
      componentId,
      responses: answers,
    });

    onScreenComplete({ nextScreenKey: result.nextScreenKey });
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
    setItems(initialItems);
    setAnswers({});
    lockedResponses.current = {};
  }, [componentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
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
