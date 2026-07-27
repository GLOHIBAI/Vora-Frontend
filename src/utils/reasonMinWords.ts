import { validateMinWords } from '../catalog/gate2-submit-shape.util';

/** Types that always collect a written reason and default to the API's 5-word floor. */
const REASON_DEFAULT_MIN_WORD_TYPES = new Set([
  'jb',
  'compare',
  'hotspot',
  'highlight',
  'probe',
  'code',
  'livecode',
  'work_sample',
]);

/**
 * Resolve min-words for a reason field.
 * - When a reason is shown/required: use content.minWords, else default 5.
 * - When reason is optional/absent: 0 (no min-words gate).
 */
export const getReasonMinWords = (
  content: Record<string, unknown> | undefined | null,
  type?: string,
  options?: { reasonShown?: boolean },
): number => {
  const typeStr = String(type ?? '').toLowerCase().trim();
  const inferredShown =
    content?.requireReasoning === true ||
    content?.showReasoning === true ||
    !!content?.reasonPrompt ||
    !!content?.reasoningPrompt ||
    !!content?.justifyPrompt ||
    REASON_DEFAULT_MIN_WORD_TYPES.has(typeStr);

  const reasonShown = options?.reasonShown ?? inferredShown;
  if (!reasonShown) return 0;

  const raw = content?.minWords;
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      // Long-form items (work sample / code / probe) can require hundreds of words.
      // Short reason lines must not inherit those floors or Continue stays stuck.
      const isLongForm = ['work_sample', 'probe', 'code', 'livecode'].includes(typeStr);
      if (!isLongForm && n > 30) return 5;
      return n;
    }
    return 5;
  }

  return 5;
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
