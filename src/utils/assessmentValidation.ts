import type { AssessmentItem, AnswerValue } from '../services/queries/assessments/types';
import {
  getForcedChoiceBlocks,
  getLikertQuestions,
  getValuesAbPairs,
  getValuesTradeoffTensions,
  isLikertItem,
  normalizeAssessmentItemType,
} from './assessmentItems';
import { isPartialDraftType } from '../services/queries/assessments/types';
import { validateMinWords } from '../catalog/gate2-submit-shape.util';
import {
  extractReasonText,
  getReasonMinWords,
  hasReasonField,
  isReasonMinWordsMet,
} from './reasonMinWords';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMostLeastPair = (value: unknown): value is { most: string; least: string } =>
  isRecord(value) &&
  typeof value.most === 'string' &&
  value.most.length > 0 &&
  typeof value.least === 'string' &&
  value.least.length > 0 &&
  value.most !== value.least;

const reasonMeetsRequirement = (
  item: AssessmentItem,
  value: unknown,
  typeStr: string,
  reasonShown: boolean,
): boolean => {
  if (!reasonShown) return true;
  const minWords = getReasonMinWords(item.content as Record<string, unknown>, typeStr, {
    reasonShown: true,
  });
  const reasonVal = extractReasonText(value);
  if (!reasonVal.trim()) return false;
  return isReasonMinWordsMet(reasonVal, minWords);
};

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
  const content = item.content as Record<string, unknown>;

  // 1. Cat (categorization)
  if (typeStr === 'cat') {
    if (!isRecord(value)) return false;
    const tasks = Array.isArray(item.content.items)
      ? item.content.items
      : Array.isArray(item.content.tasks)
        ? item.content.tasks
        : [];
    const structureOk =
      tasks.length === 0
        ? Object.keys(value).filter((k) => k !== 'reason' && k !== 'reasoning').length > 0
        : tasks.every((t: any, idx: number) => {
            const id = String(t?.id ?? `task_${idx}`);
            return typeof (value as any)[id] === 'string' && (value as any)[id].trim().length > 0;
          });
    if (!structureOk) return false;
    return reasonMeetsRequirement(item, value, typeStr, hasReasonField(content));
  }

  // 2. Cloze
  if (typeStr === 'cloze') {
    if (!isRecord(value)) return false;
    const blanks = Array.isArray(item.content.blanks) ? item.content.blanks : [];
    const structureOk =
      blanks.length === 0
        ? Object.keys(value).filter((k) => k !== 'reason' && k !== 'reasoning').length > 0
        : blanks.every((b: any, idx: number) => {
            const id = String(b?.id ?? `blank${idx + 1}`);
            return typeof (value as any)[id] === 'string' && (value as any)[id].trim().length > 0;
          });
    if (!structureOk) return false;
    return reasonMeetsRequirement(item, value, typeStr, hasReasonField(content));
  }

  // 3. Match
  if (typeStr === 'match') {
    if (!isRecord(value)) return false;
    const leftItems = Array.isArray(item.content.left)
      ? item.content.left
      : Array.isArray(item.content.leftItems)
        ? item.content.leftItems
        : Array.isArray(item.content.terms)
          ? item.content.terms
          : [];
    const structureOk =
      leftItems.length === 0
        ? Object.keys(value).filter((k) => k !== 'reason' && k !== 'reasoning').length > 0
        : leftItems.every((l: any, idx: number) => {
            const id = String(l?.id ?? l?.key ?? `left_${idx}`);
            return typeof (value as any)[id] === 'string' && (value as any)[id].trim().length > 0;
          });
    if (!structureOk) return false;
    return reasonMeetsRequirement(item, value, typeStr, hasReasonField(content));
  }

  // 4. SJT Most / Least
  if (typeStr === 'ml' || typeStr === 'sjt_most_least') {
    if (isMostLeastPair(value)) return true;
    if (isRecord(value)) {
      return isMostLeastPair({
        most: String((value as any).most ?? (value as any).mostEffective ?? ''),
        least: String((value as any).least ?? (value as any).leastEffective ?? ''),
      });
    }
    return false;
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

  // 6. Code / Livecode — free-text analysis must meet min words
  if (typeStr === 'code' || typeStr === 'livecode') {
    const codeVal =
      typeof value === 'string'
        ? value
        : isRecord(value)
          ? String((value as any).code ?? (value as any).reasoning ?? (value as any).reason ?? '')
          : '';
    return reasonMeetsRequirement(item, codeVal, typeStr, true);
  }

  // 7. Probe — free-text response must meet min words
  if (typeStr === 'probe') {
    const text =
      typeof value === 'string'
        ? value
        : isRecord(value)
          ? String((value as any).prose ?? (value as any).reason ?? (value as any).reasoning ?? '')
          : '';
    return reasonMeetsRequirement(item, text, typeStr, true);
  }

  // 8. Work Sample — prose must meet min words
  if (typeStr === 'work_sample') {
    const prose =
      typeof value === 'string'
        ? value
        : isRecord(value)
          ? String((value as any).prose ?? (value as any).text ?? '')
          : '';
    return reasonMeetsRequirement(item, prose, typeStr, true);
  }

  // 9. Highlight — needs at least one selection + reason min words
  if (typeStr === 'highlight') {
    if (!isRecord(value)) return false;
    const selectedIds = Array.isArray((value as any).selectedIds) ? (value as any).selectedIds : [];
    if (selectedIds.length === 0) return false;
    return reasonMeetsRequirement(item, value, typeStr, true);
  }

  // 10. Single best / Choice + reason
  const isChoiceReasonType = [
    'jb', 'compare', 'allocate', 'data', 'dashboard', 'hotspot',
    'nextq', 'diagnose', 'proofread', 'visual', 'liveui', 'specialist', 'abtest',
    'chartread', 'architect', 'liveplan', 'liveadapt', 'risktriage', 'orchestrate',
    'factcheck', 'metric', 'threshold', 'querybuild', 'coverage', 'dataquality',
  ].includes(typeStr);

  const looksLikeChoiceAnswer =
    typeof value === 'string' ||
    (isRecord(value) &&
      ('choice' in value || 'optionId' in value || 'selected' in value));

  if (
    typeStr === 'sb' ||
    typeStr === 'sjt_single_best' ||
    typeStr === 'mcq' ||
    typeStr === 'adaptive_mcq' ||
    isChoiceReasonType ||
    looksLikeChoiceAnswer
  ) {
    if (item.content.layout === 'multi_question' && Array.isArray(item.content.questions)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const ansObj = value as Record<string, unknown>;
      return item.content.questions.every((q) => {
        const val = ansObj[q.id];
        return typeof val === 'string' && val.trim().length > 0;
      });
    }

    if (isRecord(value) && ('most' in value || 'least' in value) && !('choice' in value) && !('optionId' in value)) {
      return isMostLeastPair({
        most: String((value as any).most ?? (value as any).mostEffective ?? ''),
        least: String((value as any).least ?? (value as any).leastEffective ?? ''),
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

    const requireReason =
      typeStr === 'jb' ||
      typeStr === 'compare' ||
      typeStr === 'hotspot' ||
      item.content.requireReasoning === true ||
      item.content.showReasoning === true ||
      hasReasonField(content);

    if (requireReason) {
      return reasonMeetsRequirement(item, reasonVal, typeStr, true);
    }

    return true;
  }

  // General Fallbacks
  if (typeof value === 'string') {
    // Treat bare free-text as needing min words when content asks for a reason
    if (hasReasonField(content)) {
      return reasonMeetsRequirement(item, value, typeStr, true);
    }
    return (value as string).trim().length > 0;
  }
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;

  if (isRecord(value)) {
    if ('most' in value || 'least' in value) {
      return isMostLeastPair({
        most: String((value as any).most ?? (value as any).mostEffective ?? ''),
        least: String((value as any).least ?? (value as any).leastEffective ?? ''),
      });
    }

    const recordObj = value as Record<string, unknown>;
    const keys = Object.keys(recordObj).filter((k) => k !== 'reason' && k !== 'reasoning');
    if (keys.length === 0) {
      return reasonMeetsRequirement(item, value, typeStr, true);
    }
    const structureOk = keys.every((k) => {
      const v = recordObj[k];
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'number') return true;
      if (typeof v === 'boolean') return true;
      if (Array.isArray(v)) return v.length > 0;
      if (isRecord(v)) return Object.keys(v).length > 0;
      return true;
    });
    if (!structureOk) return false;
    if (hasReasonField(content)) {
      return reasonMeetsRequirement(item, value, typeStr, true);
    }
    return true;
  }

  return true;
};

// Re-export for callers that need the shared helpers without a deep import
export { getReasonMinWords, validateMinWords };
