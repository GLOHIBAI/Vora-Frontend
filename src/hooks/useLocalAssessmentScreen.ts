import { useState, useCallback, useMemo } from 'react';
import type { AssessmentItem, AnswerValue, ResponsesMap } from '../services/queries/assessments/types';
import { isAdaptiveType } from '../services/queries/assessments/types';
import { isItemAnswerComplete } from '../utils/assessmentValidation';
import { getRankOptionIds, getValuesTradeoffTensions } from '../utils/assessmentItems';

const buildInitialAnswers = (items: AssessmentItem[]): ResponsesMap => {
  const answers: ResponsesMap = {};
  for (const item of items) {
    if (item.type === 'rank' || item.type === 'drag_rank' || item.type === 'sjt_rank_all') {
      answers[item.id] = getRankOptionIds(item);
    }
    if (item.type === 'values_tradeoff' || item.type === 'sjt_values_tradeoff') {
      const tensions = getValuesTradeoffTensions(item);
      answers[item.id] = Object.fromEntries(
        tensions.map((t) => [t.id, Math.round((t.scaleMin + t.scaleMax) / 2)]),
      );
    }
  }
  return answers;
};

interface AdaptiveStep {
  stem: string;
  options: Array<{ id: string; label: string }>;
}

export function useLocalAssessmentScreen(
  initialItems: AssessmentItem[],
  onComplete?: () => void,
) {
  const [items, setItems] = useState(initialItems);
  const [answers, setAnswers] = useState<ResponsesMap>(() => buildInitialAnswers(initialItems));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = useCallback(() => false, []);

  const isScreenComplete = useMemo(
    () =>
      items.every((item) => {
        if (isAdaptiveType(item.type)) {
          return item.content.complete === true;
        }
        return isItemAnswerComplete(item, answers[item.id]);
      }),
    [items, answers],
  );

  const recordAnswer = useCallback(
    async (itemId: string, value: AnswerValue, item: AssessmentItem, subKey?: string) => {
      setAnswers((prev) => {
        if (subKey !== undefined) {
          const existing =
            typeof prev[itemId] === 'object' && !Array.isArray(prev[itemId])
              ? (prev[itemId] as Record<string, unknown>)
              : {};
          return { ...prev, [itemId]: { ...existing, [subKey]: value } };
        }
        return { ...prev, [itemId]: value };
      });

      if (!isAdaptiveType(item.type)) return;

      const steps = item.content.steps as AdaptiveStep[] | undefined;
      if (!steps?.length) {
        setItems((prev) =>
          prev.map((row) =>
            row.id === itemId ? { ...row, content: { ...row.content, complete: true } } : row,
          ),
        );
        return;
      }

      const stepIndex = (item.content.stepIndex as number) ?? 0;
      const nextIndex = stepIndex + 1;

      if (nextIndex >= steps.length) {
        setItems((prev) =>
          prev.map((row) =>
            row.id === itemId
              ? {
                  ...row,
                  content: {
                    ...row.content,
                    complete: true,
                    stepIndex: nextIndex,
                    totalSteps: steps.length,
                  },
                }
              : row,
          ),
        );
        return;
      }

      const next = steps[nextIndex];
      setItems((prev) =>
        prev.map((row) =>
          row.id === itemId
            ? {
                ...row,
                content: {
                  ...row.content,
                  stem: next.stem,
                  options: next.options,
                  stepIndex: nextIndex,
                  totalSteps: steps.length,
                  complete: false,
                },
              }
            : row,
        ),
      );
    },
    [],
  );

  const confirmScreen = useCallback(async () => {
    if (!isScreenComplete) return;
    setIsSubmitting(true);
    try {
      onComplete?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [isScreenComplete, onComplete]);

  return {
    items,
    answers,
    recordAnswer,
    confirmScreen,
    isLocked,
    isSaving: false,
    isSubmitting,
    isScreenComplete,
  };
}
