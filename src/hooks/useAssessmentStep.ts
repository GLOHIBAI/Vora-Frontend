import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiClient, getApiErrorMessage } from '../services/api';
import type { AnswerValue, ResponsesMap } from '../services/queries/assessments/types';

export interface AssessmentAnswerPayload {
  isValid?: boolean;
  responses?: ResponsesMap;
  value?: AnswerValue;
  [key: string]: any;
}

export interface UseAssessmentStepOptions {
  assessmentId: string;
  pillarId: string;
  componentId?: string;
  currentItem?: { id: string; title?: string; [key: string]: any };
  initialLockedItemIds?: string[];
}

/**
 * useAssessmentStep
 * Synchronous assessment step/screen save hook ensuring answer persistence
 * before route transitions and permanent locking of completed questions.
 */
export function useAssessmentStep({
  assessmentId,
  pillarId,
  componentId,
  currentItem,
  initialLockedItemIds = [],
}: UseAssessmentStepOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lockedItemIds, setLockedItemIds] = useState<Set<string>>(
    () => new Set(initialLockedItemIds),
  );

  const isCurrentItemLocked = currentItem?.id ? lockedItemIds.has(currentItem.id) : false;

  const isItemLocked = useCallback(
    (itemId: string) => lockedItemIds.has(itemId),
    [lockedItemIds],
  );

  const handleSaveAndAdvance = useCallback(
    async (
      answerPayload: AssessmentAnswerPayload,
      onNext: () => void,
    ) => {
      // 1. Validation check
      if (!answerPayload || answerPayload.isValid === false) {
        toast.error('Please answer all required parts of this question before continuing.');
        return;
      }

      if (!assessmentId) {
        toast.error('Interview session not found. Please refresh and try again.');
        return;
      }

      const itemId = currentItem?.id;
      if (!itemId) {
        onNext();
        return;
      }

      // If already locked (read-only), advance directly
      if (lockedItemIds.has(itemId)) {
        onNext();
        return;
      }

      // 2. Save synchronously before route/step transition
      setIsSaving(true);
      try {
        const compId = componentId || `g2-${pillarId}`;
        const responsesToSend = answerPayload.responses || {
          [itemId]: answerPayload.value !== undefined ? answerPayload.value : answerPayload,
        };

        await apiClient.patch({
          url: `/assessments/${assessmentId}/components/${compId}/responses`,
          body: { responses: responsesToSend },
          auth: true,
          suppressErrorToast: true,
        });

        // 3. Mark this item as permanently locked (read-only)
        setLockedItemIds((prev) => new Set([...prev, itemId]));

        // 4. Advance to the next question
        onNext();
      } catch (err: any) {
        const msg = getApiErrorMessage(
          err,
          'Failed to save your answer. Please check your network and click Continue again.',
        );
        const lower = msg.toLowerCase();
        if (
          lower.includes('locked') ||
          lower.includes('cannot be changed') ||
          lower.includes('already been submitted') ||
          lower.includes('already submitted')
        ) {
          // If server already marked it locked, mark locally and advance safely
          setLockedItemIds((prev) => new Set([...prev, itemId]));
          onNext();
          return;
        }

        // Stay on current question so candidate doesn't get skipped/unsaved
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    },
    [assessmentId, pillarId, componentId, currentItem?.id, lockedItemIds],
  );

  return {
    isSaving,
    isCurrentItemLocked,
    isItemLocked,
    lockedItemIds,
    setLockedItemIds,
    handleSaveAndAdvance,
  };
}
