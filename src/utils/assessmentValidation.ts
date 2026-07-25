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
import { validateMinWords } from '../catalog/gate2-submit-shape.util';

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

  if (item.content.layout === 'multi_question') {
    return typeof value === 'string' && value.length > 0;
  }

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
  const typeStr = String(type).toLowerCase();
  const minWords = item.content.minWords;

  // 1. Cat (categorization): All tasks in content.items must have a non-empty bucket
  if (typeStr === 'cat') {
    if (!isRecord(value)) return false;
    const tasks = Array.isArray(item.content.items) ? item.content.items : [];
    if (tasks.length === 0) return Object.keys(value).length > 0;
    return tasks.every((t: any) => typeof (value as any)[t.id] === 'string' && (value as any)[t.id].trim().length > 0);
  }

  // 2. Cloze (fill in blanks): All blanks in content.blanks must have a non-empty choice
  if (typeStr === 'cloze') {
    if (!isRecord(value)) return false;
    const blanks = Array.isArray(item.content.blanks) ? item.content.blanks : [];
    if (blanks.length === 0) return Object.keys(value).length > 0;
    return blanks.every((b: any) => typeof (value as any)[b.id] === 'string' && (value as any)[b.id].trim().length > 0);
  }

  // 3. Match (pair matching): All left items in content.left must have a non-empty match
  if (typeStr === 'match') {
    if (!isRecord(value)) return false;
    const leftItems = Array.isArray(item.content.left) ? item.content.left : [];
    if (leftItems.length === 0) return Object.keys(value).length > 0;
    return leftItems.every((l: any) => typeof (value as any)[l.id] === 'string' && (value as any)[l.id].trim().length > 0);
  }

  // 4. SJT Most / Least
  if (typeStr === 'ml' || typeStr === 'sjt_most_least') {
    return isMostLeastPair(value);
  }

  // 5. Likert / Forced Choice / Values / Rank
  if (isLikertItem(type)) {
    if (!isRecord(value)) return false;
    const questions = getLikertQuestions(item);
    return (
      questions.length > 0 &&
      questions.every((q) => {
        const rating = (value as any)[q.id];
        return typeof rating === 'number' && rating >= 1 && rating <= 5;
      })
    );
  }

  if (type === 'forced_choice') {
    if (!isRecord(value)) return false;
    const blocks = getForcedChoiceBlocks(item);
    return blocks.every((block) => isMostLeastPair((value as any)[block.id]));
  }

  if (typeStr === 'rank' || typeStr === 'drag_rank' || typeStr === 'sjt_rank' || typeStr === 'sjt_rank_all') {
    return Array.isArray(value) && value.length > 0 && value.every((id) => typeof id === 'string' && id.trim().length > 0);
  }

  if (type === 'values_ab_pairs') {
    if (!isRecord(value)) return false;
    const pairs = getValuesAbPairs(item);
    return pairs.every((pair) => (value as any)[pair.id] === 'A' || (value as any)[pair.id] === 'B');
  }

  if (type === 'values_tradeoff' || type === 'sjt_values_tradeoff') {
    if (!isRecord(value)) return false;
    const tensions = getValuesTradeoffTensions(item);
    return tensions.every((tension) => {
      const v = (value as any)[tension.id];
      if (typeof v !== 'number') return false;
      const min = tension.scaleMin ?? -2;
      const max = tension.scaleMax ?? 2;
      return v >= min && v <= max;
    });
  }

  if (type === 'sjt_multi_select' || typeStr === 'ms' || typeStr === 'multi_select') {
    if (!Array.isArray(value) || value.length === 0) return false;
    const minSelect = Number(item.content.minSelect ?? 1);
    const maxSelect = Number(item.content.maxSelect ?? value.length);
    return value.length >= minSelect && value.length <= maxSelect;
  }

  // 6. Code / Livecode
  if (typeStr === 'code' || typeStr === 'livecode') {
    if (typeof value === 'string') return value.trim().length > 0;
    if (!isRecord(value)) return false;
    const codeVal = (value as any).code ?? (value as any).reasoning;
    return typeof codeVal === 'string' && codeVal.trim().length > 0;
  }

  // 7. Work Sample
  if (typeStr === 'work_sample') {
    if (typeof value === 'string') return value.trim().length > 0;
    if (!isRecord(value)) return false;
    const prose = (value as any).prose ?? (value as any).text;
    return typeof prose === 'string' && prose.trim().length > 0;
  }

  // 8. Single best / Choice + reason (jb, compare, highlight, allocate, etc.)
  const isChoiceReasonType = [
    'jb', 'compare', 'allocate', 'data', 'dashboard', 'hotspot', 'highlight',
    'nextq', 'diagnose', 'proofread', 'visual', 'liveui', 'specialist', 'abtest'
  ].includes(typeStr);

  if (typeStr === 'sb' || typeStr === 'sjt_single_best' || typeStr === 'mcq' || typeStr === 'adaptive_mcq' || isChoiceReasonType) {
    if (item.content.layout === 'multi_question' && Array.isArray(item.content.questions)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const ansObj = value as Record<string, unknown>;
      return item.content.questions.every((q) => {
        const val = ansObj[q.id];
        return typeof val === 'string' && val.trim().length > 0;
      });
    }

    let choiceVal = '';
    let reasonVal = '';

    if (typeof value === 'string') {
      choiceVal = value.trim();
    } else if (isRecord(value)) {
      choiceVal = String((value as any).choice ?? (value as any).optionId ?? (value as any).selected ?? '').trim();
      reasonVal = String((value as any).reason ?? (value as any).reasoning ?? '').trim();
    }

    if (!choiceVal) return false;

    // If reason is required by minWords or explicitly required by item type
    const requireReason =
      item.content.requireReasoning === true ||
      item.content.showReasoning === true ||
      !!item.content.reasonPrompt ||
      typeStr === 'jb' ||
      typeStr === 'compare';

    if (requireReason) {
      if (!reasonVal) return false;
      if (minWords && !validateMinWords(reasonVal, Number(minWords))) return false;
    }

    return true;
  }

  // General Fallbacks
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;

  if (isRecord(value)) {
    const recordObj = value as Record<string, unknown>;
    const keys = Object.keys(recordObj);
    if (keys.length === 0) return false;
    return keys.every((k) => {
      const v = recordObj[k];
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'number') return true;
      if (typeof v === 'boolean') return true;
      if (Array.isArray(v)) return v.length > 0;
      if (isRecord(v)) return Object.keys(v).length > 0;
      return true;
    });
  }

  return true;
};
