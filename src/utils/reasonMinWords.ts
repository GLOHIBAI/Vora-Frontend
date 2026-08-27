import { validateMinWords } from '../catalog/gate2-submit-shape.util';
import { WRITTEN_REASON_TYPES } from './writtenReasonTypes';

/** Types that always collect a written reason or long-form response. */
const REASON_DEFAULT_MIN_WORD_TYPES = new Set([
  ...WRITTEN_REASON_TYPES,
  'probe',
  'code',
  'livecode',
  'work_sample',
]);

const NO_REASON_TYPES = new Set([
  'scale',
  'numeric',
  'numeric_scale',
  'likert',
  'likert_scale',
  'values_tradeoff',
  'sjt_values_tradeoff',
  'values_ab_pairs',
  'mcq',
  'single_choice',
  'sb',
  'sjt_single_best',
  'ms',
  'sjt_multi_select',
  'multi_select',
  'rank',
  'drag_rank',
  'sjt_rank',
  'sjt_rank_all',
  'ml',
  'most_least',
  'sjt_most_least',
  'match',
  'cloze',
  'cat',
  'forced_choice',
]);

/**
 * Resolve min-words for a reason field.
 * - When a reason is shown/required: use content.minWords, else default 15.
 * - When reason is optional/absent: 0 (no min-words gate).
 */
export const getReasonMinWords = (
  content: Record<string, unknown> | undefined | null,
  type?: string,
  options?: { reasonShown?: boolean },
): number => {
  const typeStr = String(type ?? '').toLowerCase().trim();

  if (NO_REASON_TYPES.has(typeStr) && content?.requireReasoning !== true && content?.showReasoning !== true) {
    return 0;
  }

  const inferredShown =
    content?.requireReasoning === true ||
    content?.showReasoning === true ||
    REASON_DEFAULT_MIN_WORD_TYPES.has(typeStr);

  const reasonShown = options?.reasonShown ?? inferredShown;
  if (!reasonShown) return 0;

  const raw = content?.minWords;
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      // Long-form items (work sample / code / probe) can require hundreds of words.
      // Short reason lines must not inherit arbitrary high floors.
      const isLongForm = ['work_sample', 'probe', 'code', 'livecode'].includes(typeStr);
      if (!isLongForm && n > 100) return 15;
      return n;
    }
    return 15;
  }

  return 15;
};

export const isReasonMinWordsMet = (
  reason: string | undefined | null,
  minWords: number,
): boolean => {
  if (!minWords || minWords <= 0) {
    return typeof reason === 'string' ? reason.trim().length > 0 : false;
  }
  return validateMinWords(reason ?? '', minWords);
};

export const hasReasonField = (content: Record<string, unknown> | undefined | null): boolean =>
  !!(
    content?.requireReasoning === true ||
    content?.showReasoning === true ||
    content?.reasonPrompt ||
    content?.reasoningPrompt ||
    content?.justifyPrompt
  );

export const extractReasonText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const record = value as Record<string, unknown>;
  return String(
    record.reason ??
      record.reasoning ??
      record.prose ??
      record.code ??
      record.text ??
      '',
  );
};
