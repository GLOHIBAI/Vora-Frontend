import type { AssessmentItem, AnswerValue } from '../services/queries/assessments/types';
import {
  getForcedChoiceBlocks,
  getLikertQuestions,
  getRankOptionIds,
  getValuesAbPairs,
  getValuesTradeoffTensions,
  isLikertItem,
  normalizeAssessmentItemType,
} from './assessmentItems';
import { isPartialDraftType } from '../services/queries/assessments/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMostLeastPair = (value: unknown): value is { most: string; least: string } =>
  isRecord(value) &&
  typeof value.most === 'string' &&
  value.most.length > 0 &&
  typeof value.least === 'string' &&
  value.least.length > 0 &&
  value.most !== value.least;

/**
 * Whether a PATCH delta is allowed for this item (draft validation).
 * Partial-draft types may send one sub-key; others must be fully valid if sent.
 */
export const canPersistDraftDelta = (
  item: AssessmentItem,
  value: AnswerValue,
  subKey?: string,
): boolean => {
  const type = normalizeAssessmentItemType(item.type);

  if (type === 'likert_scale') {
    return typeof value === 'number' && value >= 1 && value <= 5;
  }

  if (type === 'forced_choice') {
    return isMostLeastPair(value);
  }

  if (type === 'values_ab_pairs') {
    return value === 'A' || value === 'B';
  }

  if (type === 'values_tradeoff' || type === 'sjt_values_tradeoff') {
    return typeof value === 'number';
  }

  if (isPartialDraftType(type)) {
    return true;
  }

  return isItemAnswerComplete(item, value);
};

/** Returns true when the local answer satisfies the spec for this item type. */
export const isItemAnswerComplete = (item: AssessmentItem, value: AnswerValue | undefined): boolean => {
  if (value === undefined || value === null || value === '') return false;

  const type = normalizeAssessmentItemType(item.type);

  if (isLikertItem(type)) {
    if (!isRecord(value)) return false;
    const questions = getLikertQuestions(item);
    return (
      questions.length > 0 &&
      questions.every((q) => {
        const rating = value[q.id];
        return typeof rating === 'number' && rating >= 1 && rating <= 5;
      })
    );
  }

  if (type === 'forced_choice') {
    if (!isRecord(value)) return false;
    const blocks = getForcedChoiceBlocks(item);
    return blocks.every((block) => isMostLeastPair(value[block.id]));
  }

  if (type === 'rank' || type === 'drag_rank' || type === 'sjt_rank' || type === 'sjt_rank_all') {
    return Array.isArray(value) && value.length > 0 && value.every((id) => typeof id === 'string');
  }

  if (type === 'values_ab_pairs') {
    if (!isRecord(value)) return false;
    const pairs = getValuesAbPairs(item);
    return pairs.every((pair) => value[pair.id] === 'A' || value[pair.id] === 'B');
  }

  if (type === 'values_tradeoff' || type === 'sjt_values_tradeoff') {
    if (!isRecord(value)) return false;
    const tensions = getValuesTradeoffTensions(item);
    return tensions.every((tension) => {
      const v = value[tension.id];
      if (typeof v !== 'number') return false;
      const min = tension.scaleMin ?? -2;
      const max = tension.scaleMax ?? 2;
      return v >= min && v <= max;
    });
  }

  if (type === 'sjt_most_least') {
    return isMostLeastPair(value);
  }

  if (type === 'sjt_multi_select') {
    if (!Array.isArray(value) || value.length === 0) return false;
    const minSelect = Number(item.content.minSelect ?? 1);
    const maxSelect = Number(item.content.maxSelect ?? value.length);
    return value.length >= minSelect && value.length <= maxSelect;
  }

  if (type === 'adaptive_mcq' || type === 'mcq' || type === 'sjt_single_best') {
    return typeof value === 'string' && value.length > 0;
  }

  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.values(value).every((v) => v !== null && v !== undefined);
  return true;
};
