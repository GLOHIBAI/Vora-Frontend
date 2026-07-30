/**
 * Gate 2 (Stage 2) — Canonical Submit Shapes & Utilities
 * Source of truth: catalog/gate2-submit-shape.util.ts
 */

export type Gate2SubmitAnswer =
  | string
  | number
  | string[]
  | Record<string, string>
  | { choice: string | string[]; reason?: string }
  | { most: string; least: string }
  | { code: string; stdout?: string }
  | { prose: string; followUp?: string };

export interface Gate2ResponsesPayload {
  responses: Record<string, Gate2SubmitAnswer>;
}

export interface Gate2ItemMeta {
  id: string;
  type?: string;
  content?: {
    type?: string;
    minWords?: number;
    options?: Array<{ id: string; [key: string]: any }>;
    [key: string]: any;
  };
}

/**
 * Counts the number of words in a string.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Validates if a reason string satisfies minWords requirement.
 * Matches backend: space-separated word count only.
 */
export function validateMinWords(reason?: string, minWords?: number): boolean {
  if (!minWords || minWords <= 0) return true;
  return countWords(reason ?? '') >= minWords;
}

/**
 * Formats a single raw answer into its canonical Gate 2 submit shape.
 */
export function formatGate2Answer(
  type: string,
  rawAnswer: any,
  options?: { minWords?: number }
): Gate2SubmitAnswer {
  const normalizedType = String(type || '').toLowerCase().trim();

  if (rawAnswer === null || rawAnswer === undefined) {
    if (normalizedType === 'ms' || normalizedType === 'rank') return [];
    if (['match', 'cloze', 'cat'].includes(normalizedType)) return {};
    if (normalizedType === 'ml') return { most: '', least: '' };
    if (['code', 'livecode'].includes(normalizedType)) return { code: '' };
    if (normalizedType === 'work_sample') return { prose: '' };
    if (['scale', 'numeric'].includes(normalizedType)) return 0;
    return '';
  }

  switch (normalizedType) {
    // Single best: bare string optionId
    case 'sb':
    case 'sjt_single_best': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        return String(rawAnswer.choice ?? rawAnswer.optionId ?? rawAnswer.selectedOption ?? rawAnswer.selected ?? '');
      }
      return String(rawAnswer);
    }

    // Single best + reason
    case 'jb': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const choice = String(rawAnswer.choice ?? rawAnswer.optionId ?? rawAnswer.selectedOption ?? '');
        const reason = String(rawAnswer.reason ?? rawAnswer.reasoning ?? '');
        return { choice, reason };
      }
      return { choice: String(rawAnswer), reason: '' };
    }

    // Choice (+ optional reason)
    case 'allocate':
    case 'data':
    case 'dashboard':
    case 'chartread':
    case 'hotspot':
    case 'nextq':
    case 'diagnose':
    case 'visualspot':
    case 'abtest':
    case 'liveadapt':
    case 'risktriage':
    case 'orchestrate':
    case 'liveplan':
    case 'architect':
    case 'factcheck':
    case 'metric':
    case 'threshold': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const choice = String(rawAnswer.choice ?? rawAnswer.optionId ?? rawAnswer.selectedOption ?? '');
        const reason = String(rawAnswer.reason ?? rawAnswer.reasoning ?? '').trim();
        if (reason.length > 0) {
          return { choice, reason };
        }
        return choice;
      }
      return String(rawAnswer);
    }

    // highlight: option id string OR { choice: "<options[].id>", reason?: "..." }
    case 'highlight': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const fromSelected = Array.isArray(rawAnswer.selectedIds)
          ? rawAnswer.selectedIds.map((id: unknown) => String(id)).filter(Boolean)
          : [];
        const fromChoiceArr = Array.isArray(rawAnswer.choice)
          ? rawAnswer.choice.map((id: unknown) => String(id)).filter(Boolean)
          : [];
        const choice = String(
          (typeof rawAnswer.choice === 'string' && rawAnswer.choice) ||
            rawAnswer.optionId ||
            fromSelected[fromSelected.length - 1] ||
            fromChoiceArr[fromChoiceArr.length - 1] ||
            '',
        ).trim();
        const reason = String(rawAnswer.reason ?? rawAnswer.reasoning ?? '').trim();
        if (!choice) {
          return reason ? { choice: '', reason } : '';
        }
        return reason.length > 0 ? { choice, reason } : choice;
      }
      if (Array.isArray(rawAnswer)) {
        const choice = String(rawAnswer[rawAnswer.length - 1] ?? '').trim();
        return choice || '';
      }
      return String(rawAnswer || '').trim();
    }

    // A/B cards: { choice: "A"|"B", reason: "..." }
    case 'compare': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const choice = String(rawAnswer.choice ?? rawAnswer.optionId ?? 'A');
        const reason = String(rawAnswer.reason ?? rawAnswer.reasoning ?? '');
        return { choice, reason };
      }
      return { choice: String(rawAnswer || 'A'), reason: '' };
    }

    // Most & least effective: { most: "a", least: "c" } (Product override)
    case 'ml':
    case 'sjt_most_least': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const most = String(rawAnswer.most ?? rawAnswer.mostEffective ?? '');
        const least = String(rawAnswer.least ?? rawAnswer.leastEffective ?? '');
        return { most, least };
      }
      return { most: String(rawAnswer), least: '' };
    }

    // Select all that apply: ["a", "c"]
    case 'ms':
    case 'multi_select': {
      if (Array.isArray(rawAnswer)) {
        return rawAnswer.map((item) =>
          typeof item === 'object' && item !== null ? String(item.id ?? item.optionId ?? '') : String(item)
        );
      }
      if (typeof rawAnswer === 'string' && rawAnswer) return [rawAnswer];
      return [];
    }

    // Rank best -> worst: ["c", "a", "b", "d"]
    case 'rank': {
      if (Array.isArray(rawAnswer)) {
        return rawAnswer.map((item) =>
          typeof item === 'object' && item !== null ? String(item.id ?? item.optionId ?? '') : String(item)
        );
      }
      if (typeof rawAnswer === 'string' && rawAnswer) return [rawAnswer];
      return [];
    }

    // Match pairs: { "<leftId>": "<rightValue>" }
    case 'match': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(rawAnswer)) {
          result[k] = String(v ?? '');
        }
        return result;
      }
      return {};
    }

    // Fill blanks: { "<blankId>": "<value>" }
    case 'cloze': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(rawAnswer)) {
          result[k] = String(v ?? '');
        }
        return result;
      }
      return {};
    }

    // Sort into groups: { "<itemId>": "<bucketLabel>" }
    case 'cat': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const result: Record<string, string> = {};
        for (const [k, v] of Object.entries(rawAnswer)) {
          result[k] = String(v ?? '');
        }
        return result;
      }
      return {};
    }

    // Code exercise: { code: "...", stdout: "..." } (Product override: bare string normalized to { code })
    case 'code':
    case 'livecode': {
      if (typeof rawAnswer === 'string') {
        return { code: rawAnswer };
      }
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const code = String(rawAnswer.code ?? rawAnswer.solution ?? rawAnswer.text ?? '');
        const stdout = rawAnswer.stdout !== undefined ? String(rawAnswer.stdout) : undefined;
        return stdout !== undefined ? { code, stdout } : { code };
      }
      return { code: String(rawAnswer) };
    }

    // Short prose
    case 'probe': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        return String(rawAnswer.prose ?? rawAnswer.text ?? rawAnswer.value ?? '');
      }
      return String(rawAnswer);
    }

    // Simulation brief: { prose: "...", followUp: "..." }
    case 'work_sample': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const prose = String(rawAnswer.prose ?? rawAnswer.text ?? rawAnswer.value ?? '');
        const followUp = rawAnswer.followUp !== undefined ? String(rawAnswer.followUp) : undefined;
        return followUp !== undefined ? { prose, followUp } : { prose };
      }
      return { prose: String(rawAnswer) };
    }

    // Number: 3
    case 'scale':
    case 'numeric':
    case 'numeric_scale':
    case 'likert': {
      const num = Number(rawAnswer);
      return isNaN(num) ? 0 : num;
    }

    // Specialists (proofread, visual, liveui, ...): { choice: "a", reason: "..." }
    case 'proofread':
    case 'visual':
    case 'liveui':
    case 'specialist': {
      if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
        const choice = String(rawAnswer.choice ?? rawAnswer.optionId ?? rawAnswer.selectedOption ?? '');
        const reason = String(rawAnswer.reason ?? rawAnswer.reasoning ?? '');
        return { choice, reason };
      }
      return { choice: String(rawAnswer), reason: '' };
    }

    // Fallback default
    default: {
      if (typeof rawAnswer === 'object' && rawAnswer !== null && !Array.isArray(rawAnswer)) {
        if ('most' in rawAnswer && 'least' in rawAnswer) {
          return { most: String(rawAnswer.most), least: String(rawAnswer.least) };
        }
        if ('code' in rawAnswer) {
          return { code: String(rawAnswer.code), ...(rawAnswer.stdout !== undefined ? { stdout: String(rawAnswer.stdout) } : {}) };
        }
        if ('prose' in rawAnswer) {
          return { prose: String(rawAnswer.prose), ...(rawAnswer.followUp !== undefined ? { followUp: String(rawAnswer.followUp) } : {}) };
        }
        if ('choice' in rawAnswer) {
          const choice = String(rawAnswer.choice);
          const reason = String(rawAnswer.reason ?? '').trim();
          return reason.length > 0 ? { choice, reason } : choice;
        }
      }
      return rawAnswer;
    }
  }
}

/**
 * Transforms a key-value object of raw user answers into canonical Gate 2 submit shapes.
 * Accepts optional items list for type resolution.
 */
export function formatGate2ResponsesPayload(
  rawResponses: Record<string, any>,
  items?: Gate2ItemMeta[]
): Record<string, Gate2SubmitAnswer> {
  const itemsMap = new Map<string, Gate2ItemMeta>();
  if (items) {
    for (const item of items) {
      if (item && item.id) {
        itemsMap.set(item.id, item);
      }
    }
  }

  const formatted: Record<string, Gate2SubmitAnswer> = {};

  for (const [itemId, rawVal] of Object.entries(rawResponses)) {
    const item = itemsMap.get(itemId);
    const itemType = item?.type ?? item?.content?.type ?? '';
    const minWords = item?.content?.minWords;

    formatted[itemId] = formatGate2Answer(itemType, rawVal, { minWords });
  }

  return formatted;
}
