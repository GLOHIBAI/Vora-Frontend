/**
 * Canonical list of assessment question types that require a written reason box.
 * Choice/radios + textarea payload: { "choice": "...", "reason": "..." }
 * Source of truth: FRONTEND — HOW TO ANSWER EACH QUESTION spec.
 */

// Strict list: always require a reason box
export const STRICT_WRITTEN_REASON_TYPES = [
  'jb',
  'sjt_tradeoff',
  'compare',
  'liveui',
  'livemedia',
  'proofread',
  'querybuild',
  'audiomix',
  'coverage',
  'dataquality',
  'editbay',
  'errorbudget',
  'grade',
  'leveledit',
  'livecrisis',
  'liveedit',
  'livepost',
  'palette',
  'position',
  'shotlist',
  'systemcheck',
  'visual',
  'visualrank',
] as const;

// Also list: same payload { choice, reason }
export const ALSO_WRITTEN_REASON_TYPES = [
  'allocate',
  'nextq',
  'data',
  'dashboard',
  'chartread',
  'abtest',
  'diagnose',
  'visualspot',
  'hotspot',
  'highlight',
  'liveadapt',
  'risktriage',
  'orchestrate',
  'liveplan',
  'architect',
  'factcheck',
  'metric',
  'threshold',
] as const;

export const ALL_WRITTEN_REASON_TYPES = [
  ...STRICT_WRITTEN_REASON_TYPES,
  ...ALSO_WRITTEN_REASON_TYPES,
] as const;

export const WRITTEN_REASON_TYPES = new Set<string>(ALL_WRITTEN_REASON_TYPES);

export const isWrittenReasonType = (type: string | undefined | null): boolean => {
  if (!type) return false;
  return WRITTEN_REASON_TYPES.has(String(type).toLowerCase().trim());
};
