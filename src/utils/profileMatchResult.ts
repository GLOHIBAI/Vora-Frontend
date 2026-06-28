import type { PublicRoleLandingData } from '../types/roleLanding';
import type {
  ProfileMatchScanResult,
  MatchOutcome,
  MatchExplanation,
  MatchScoreConfig,
  MatchDevelopment,
  MatchRolePostingSnapshot,
} from '../types/profileMatchWaitlist';
import {
  MOCK_PROFILE_MATCH_SCAN,
  PROFILE_MATCH_WAITLIST_PATH,
} from '../constants/profileMatchWaitlist';
import {
  DEFAULT_MATCH_SCORE_CONFIG,
  PROFILE_MATCH_THRESHOLD,
  PROFILE_MATCH_DIMENSION_GAP_THRESHOLD,
  PROFILE_MATCH_RESULT_PATH,
  PROFILE_MATCH_UPSKILL_PATH,
  PROFILE_MATCH_CV_UNAVAILABLE_PATH,
  ROLES_FOUND_PATH,
} from '../constants/profileMatchResult';

export const PROFILE_MATCH_BLOCKED_PATH = '/onboarding/talent/match/blocked';
export { PROFILE_MATCH_WAITLIST_PATH, PROFILE_MATCH_UPSKILL_PATH, PROFILE_MATCH_CV_UNAVAILABLE_PATH };
export { DEFAULT_MATCH_SCORE_CONFIG, ROLES_FOUND_PATH };

export const withRoleApplyPath = (path: string, roleSlug: string): string =>
  path.replace('/onboarding/talent/', `/onboarding/talent/${roleSlug}/`);

export const normalizeMatchScoreConfig = (raw: unknown): MatchScoreConfig => {
  if (!raw || typeof raw !== 'object') return DEFAULT_MATCH_SCORE_CONFIG;
  const cfg = raw as Record<string, unknown>;
  return {
    version: typeof cfg.version === 'number' ? cfg.version : DEFAULT_MATCH_SCORE_CONFIG.version,
    matchThreshold:
      typeof cfg.matchThreshold === 'number'
        ? cfg.matchThreshold
        : DEFAULT_MATCH_SCORE_CONFIG.matchThreshold,
    dimensionGapThreshold:
      typeof cfg.dimensionGapThreshold === 'number'
        ? cfg.dimensionGapThreshold
        : DEFAULT_MATCH_SCORE_CONFIG.dimensionGapThreshold,
    dimensionWeights:
      cfg.dimensionWeights && typeof cfg.dimensionWeights === 'object'
        ? (cfg.dimensionWeights as Record<string, number>)
        : undefined,
  };
};

export const resolveMatchThresholdPercent = (
  scan?: Partial<ProfileMatchScanResult> | null,
): number => {
  const threshold = scan?.scoreConfig?.matchThreshold ?? DEFAULT_MATCH_SCORE_CONFIG.matchThreshold;
  return Math.round(threshold * 100);
};

export const resolveDimensionGapThresholdPercent = (
  scan?: Partial<ProfileMatchScanResult> | null,
): number => {
  const threshold =
    scan?.scoreConfig?.dimensionGapThreshold ?? DEFAULT_MATCH_SCORE_CONFIG.dimensionGapThreshold;
  return Math.round(threshold * 100);
};

export const resolveMatchThresholdDecimal = (
  scan?: Partial<ProfileMatchScanResult> | null,
): number =>
  scan?.scoreConfig?.matchThreshold ?? DEFAULT_MATCH_SCORE_CONFIG.matchThreshold;

export const isProfileMatchPassing = (
  score: number,
  threshold = PROFILE_MATCH_THRESHOLD,
): boolean => score >= threshold;

export const isScanPassing = (scan: ProfileMatchScanResult): boolean =>
  scan.originalRoleScore >= resolveMatchThresholdPercent(scan);

export const resolveProfileMatchScan = (
  scan?: Partial<ProfileMatchScanResult> | null,
): ProfileMatchScanResult => ({
  ...MOCK_PROFILE_MATCH_SCAN,
  ...scan,
  scoreConfig: normalizeMatchScoreConfig(scan?.scoreConfig ?? MOCK_PROFILE_MATCH_SCAN.scoreConfig),
});

/** Primary user-facing message — matchExplanation.summary from API. */
export const resolveMatchSummary = (
  scan: ProfileMatchScanResult,
  fallback = '',
): string => scan.explanation?.summary?.trim() || fallback;

export const resolveGateMessages = (
  scan: ProfileMatchScanResult,
  passed?: boolean,
): string[] =>
  (scan.explanation?.gates ?? [])
    .filter((gate) => (passed === undefined ? true : gate.passed === passed))
    .map((gate) => gate.message)
    .filter(Boolean);

/** Headline + optional supporting copy for match result screens. */
export const resolveMatchDisplayCopy = (
  scan: ProfileMatchScanResult,
): { headline: string; body: string } => {
  const summary = resolveMatchSummary(scan);
  const threshold = resolveMatchThresholdPercent(scan);
  const gateDetail = resolveGateMessages(scan, true).join(' ');

  if (summary) {
    return {
      headline: summary,
      body: gateDetail,
    };
  }

  switch (scan.outcome) {
    case 'MATCHED':
      return {
        headline: `Your profile cleared the ${threshold}% match threshold for this role.`,
        body: gateDetail,
      };
    case 'NO_MATCH_OTHER_ROLES_FOUND':
      return {
        headline: `Your profile scored ${scan.originalRoleScore}% against this role (threshold: ${threshold}%).`,
        body: '',
      };
    case 'STRONG_PROFILE_NO_MATCH':
      return {
        headline: `No live roles matched your profile at ${threshold}% or above right now.`,
        body: '',
      };
    case 'ELIGIBILITY_ISSUE':
      return {
        headline: resolveGateMessages(scan, false)[0] ?? 'You do not meet the eligibility requirements for this role.',
        body: '',
      };
    default:
      return {
        headline: `Your profile scored ${scan.originalRoleScore}% against this role.`,
        body: gateDetail,
      };
  }
};

export const isEligibilityBlocked = (scan: ProfileMatchScanResult): boolean => {
  if (scan.outcome === 'ELIGIBILITY_ISSUE') return true;
  if (scan.geopoliticalEligible === false) return true;
  if (scan.isEligible === false && scan.outcome !== 'NO_MATCH_OTHER_ROLES_FOUND') return true;
  return scan.explanation?.gates?.some((gate) => !gate.passed) ?? false;
};

export const isCvUnavailableMatch = (scan: ProfileMatchScanResult): boolean =>
  scan.outcome === 'NO_MATCH_OTHER_ROLES_FOUND' &&
  scan.explanation?.primaryReasonCode === 'CV_UNAVAILABLE' &&
  !scan.development;

export const hasAlternateRoleMatches = (scan: ProfileMatchScanResult): boolean =>
  (scan.alternateMatches?.length ?? 0) > 0;

export const hasDevelopmentGuidance = (scan: ProfileMatchScanResult): boolean =>
  Boolean(scan.development?.message?.trim());

/** Route to the correct post-scan screen using backend outcome when available. */
export const getPostMatchPath = (scan: ProfileMatchScanResult): string => {
  if (isEligibilityBlocked(scan)) {
    return PROFILE_MATCH_BLOCKED_PATH;
  }
  if (scan.outcome === 'MATCHED') {
    return PROFILE_MATCH_RESULT_PATH;
  }
  if (scan.outcome === 'STRONG_PROFILE_NO_MATCH') {
    return PROFILE_MATCH_WAITLIST_PATH;
  }
  if (scan.outcome === 'NO_MATCH_OTHER_ROLES_FOUND') {
    if (isCvUnavailableMatch(scan)) {
      return PROFILE_MATCH_CV_UNAVAILABLE_PATH;
    }
    if (hasAlternateRoleMatches(scan)) {
      return ROLES_FOUND_PATH;
    }
    if (scan.geopoliticalEligible !== false) {
      return PROFILE_MATCH_UPSKILL_PATH;
    }
    return PROFILE_MATCH_WAITLIST_PATH;
  }

  const threshold = resolveMatchThresholdPercent(scan);
  if (scan.originalRoleScore >= threshold) {
    return PROFILE_MATCH_RESULT_PATH;
  }
  if (scan.matchedRoleCount > 0) {
    return ROLES_FOUND_PATH;
  }
  return PROFILE_MATCH_WAITLIST_PATH;
};

export const resolveOriginalRoleMatchScore = (
  score?: number | null,
  scan?: Partial<ProfileMatchScanResult> | null,
): number => score ?? resolveProfileMatchScan(scan).originalRoleScore;

export const buildMatchConfirmedTitle = (
  role: Pick<PublicRoleLandingData, 'companyName' | 'overviewRows'>,
): string => {
  const location =
    role.overviewRows.find((row) => row.label === 'Location')?.value ?? role.companyName;
  return `${role.companyName} · ${location}`;
};

export const buildMatchConfirmedSubtitle = (
  role: Pick<PublicRoleLandingData, 'compensationLine' | 'metaItems' | 'overviewRows'>,
): string => {
  const positionsRow = role.overviewRows.find((row) => row.label === 'Positions')?.value;
  const positions = positionsRow
    ? positionsRow.includes('position')
      ? positionsRow
      : positionsRow.replace(/^(\d+)/, '$1 positions')
    : '2 positions available';
  const salary =
    role.overviewRows.find((row) => row.label === 'Salary')?.value ??
    role.compensationLine.split('·')[0]?.trim() ??
    '$1,800/month';
  const expiry =
    role.metaItems.find((item) => item.includes('Expires')) ?? 'Expires in 28 days';

  return `${positions} · ${salary} · ${expiry}`;
};

/** Unwrap `{ statusCode, message, data }` service envelope. */
export const unwrapApiEnvelope = (response: unknown): Record<string, unknown> | null => {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const data = root.data ?? response;
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
};

const normalizeMatchExplanation = (raw: Record<string, unknown>): MatchExplanation => {
  const dimensionGaps = Array.isArray(raw.dimensionGaps)
    ? raw.dimensionGaps.map((gap: Record<string, unknown>) => ({
        dimension: String(gap.dimension ?? ''),
        score: Number(gap.score ?? 0),
        threshold: Number(gap.threshold ?? 0),
        missing: (gap.missing ?? gap.gaps) as string[] | undefined,
      }))
    : undefined;

  return {
    decision: raw.decision as MatchExplanation['decision'],
    summary: String(raw.summary ?? ''),
    primaryReasonCode: (raw.primaryReasonCode as MatchExplanation['primaryReasonCode']) ?? null,
    gates: Array.isArray(raw.gates) ? (raw.gates as MatchExplanation['gates']) : [],
    dimensionGaps,
    improvementActions: Array.isArray(raw.improvementActions)
      ? (raw.improvementActions as MatchExplanation['improvementActions'])
      : undefined,
    scoredDimensionCount:
      typeof raw.scoredDimensionCount === 'number' ? raw.scoredDimensionCount : undefined,
    totalDimensionCount:
      typeof raw.totalDimensionCount === 'number' ? raw.totalDimensionCount : undefined,
  };
};

const normalizeMatchDevelopment = (raw: unknown): MatchDevelopment | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const dev = raw as Record<string, unknown>;
  const message = typeof dev.message === 'string' ? dev.message.trim() : '';
  if (!message) return undefined;

  const courses = Array.isArray(dev.courses)
    ? dev.courses
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as Record<string, unknown>;
          const id = typeof row.id === 'string' ? row.id : '';
          const title = typeof row.title === 'string' ? row.title : '';
          return id && title ? { id, title } : null;
        })
        .filter(Boolean)
    : [];

  const mentors = Array.isArray(dev.mentors)
    ? dev.mentors
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as Record<string, unknown>;
          const id = typeof row.id === 'string' ? row.id : '';
          const name = typeof row.name === 'string' ? row.name : '';
          return id && name ? { id, name } : null;
        })
        .filter(Boolean)
    : [];

  return {
    focusAreas: Array.isArray(dev.focusAreas)
      ? dev.focusAreas.filter((area): area is string => typeof area === 'string')
      : [],
    message,
    hasResources: dev.hasResources === true,
    courses: courses as MatchDevelopment['courses'],
    mentors: mentors as MatchDevelopment['mentors'],
  };
};

export const mapRolePostingSnapshot = (raw: unknown): MatchRolePostingSnapshot | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const rp = raw as Record<string, unknown>;
  const employer = rp.employer as Record<string, unknown> | undefined;
  const roleTitle = typeof rp.roleTitle === 'string' ? rp.roleTitle : '';
  const id = typeof rp.id === 'string' ? rp.id : '';
  if (!roleTitle && !id) return undefined;

  return {
    id,
    roleTitle,
    roleLink: typeof rp.roleLink === 'string' ? rp.roleLink : '',
    companyName:
      typeof employer?.organisationName === 'string'
        ? employer.organisationName
        : typeof rp.companyName === 'string'
          ? rp.companyName
          : '',
    workLocationCity: typeof rp.workLocationCity === 'string' ? rp.workLocationCity : undefined,
    workLocationCountry:
      typeof rp.workLocationCountry === 'string' ? rp.workLocationCountry : undefined,
    salaryMin: typeof rp.salaryMin === 'number' ? rp.salaryMin : undefined,
    salaryMax: typeof rp.salaryMax === 'number' ? rp.salaryMax : undefined,
    compensationType:
      typeof rp.compensationType === 'string' ? rp.compensationType : undefined,
  };
};

export const resolveRoleTitleFromScan = (
  scan: ProfileMatchScanResult,
  fallback = 'this role',
): string => scan.rolePosting?.roleTitle?.trim() || fallback;

export const resolveRoleLocationFromScan = (scan: ProfileMatchScanResult): string => {
  const city = scan.rolePosting?.workLocationCity?.trim();
  const country = scan.rolePosting?.workLocationCountry?.trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
};

/**
 * Maps job-link match poll or GET /talent/matches/for-role into ProfileMatchScanResult.
 */
export const mapApiMatchResultToScan = (apiData: any): ProfileMatchScanResult => {
  const payload = (apiData?.data ?? apiData) as Record<string, unknown>;
  const rawScore: number = Number(payload?.overallScore ?? payload?.score ?? 0);
  const originalRoleScore = Math.round(rawScore * 100);
  const qualificationsScore: number = Number(
    (payload?.dimensionScores as Record<string, number> | undefined)?.qualifications ?? rawScore,
  );
  const careerReadinessScore = Math.round(qualificationsScore * 100);
  const geopoliticalEligible: boolean = payload?.geopoliticalEligible !== false;
  const outcome = payload?.outcome as MatchOutcome | undefined;
  const scoreConfig = normalizeMatchScoreConfig(payload?.scoreConfig);
  const alternateMatches = Array.isArray(payload?.alternateMatches)
    ? payload.alternateMatches
    : undefined;
  const alternateCount = alternateMatches?.length ?? 0;
  const development = normalizeMatchDevelopment(payload?.development);
  const rolePosting = mapRolePostingSnapshot(payload?.rolePosting);

  const explanationRaw = payload?.matchExplanation ?? payload?.explanation;
  let explanation: MatchExplanation | undefined =
    explanationRaw && typeof explanationRaw === 'object'
      ? normalizeMatchExplanation(explanationRaw as Record<string, unknown>)
      : undefined;

  if (!explanation && outcome === 'ELIGIBILITY_ISSUE') {
    explanation = {
      decision: 'INELIGIBLE',
      summary:
        String(payload?.geopoliticalNotes ?? '') ||
        'You do not meet the location or work-authorisation requirements for this role.',
      primaryReasonCode: 'LOCATION',
      gates: [
        {
          code: 'LOCATION',
          passed: false,
          message:
            String(payload?.geopoliticalNotes ?? '') ||
            'Location or work-authorisation requirements not met.',
          alternativePathwayAvailable: false,
        },
      ],
    };
  }

  const failedGeoGate = explanation?.gates?.some((gate) => !gate.passed) ?? false;
  const isEligible =
    outcome !== 'ELIGIBILITY_ISSUE' && geopoliticalEligible && !failedGeoGate;

  return {
    originalRoleScore,
    careerReadinessScore,
    matchedRoleCount: alternateCount,
    geopoliticalEligible,
    isEligible,
    outcome,
    explanation,
    scoreConfig,
    development,
    rolePosting,
    dimensionScores: payload?.dimensionScores as Record<string, number> | undefined,
    rolePostingId:
      typeof payload?.rolePostingId === 'string'
        ? payload.rolePostingId
        : typeof (payload?.rolePosting as Record<string, unknown> | undefined)?.id === 'string'
          ? ((payload.rolePosting as Record<string, unknown>).id as string)
          : undefined,
    alternateMatches,
  };
};

/**
 * Returns true while the backend scan is still running and the frontend should keep polling.
 */
export const isMatchResultPending = (apiResponse: unknown): boolean => {
  if (!apiResponse) return true;
  const data = unwrapApiEnvelope(apiResponse) ?? (apiResponse as Record<string, unknown>);
  if (data?.status === 'PENDING') return true;
  if (data?.status === 'READY') return false;
  if (data?.overallScore != null || data?.outcome) return false;
  return Object.keys(data ?? {}).length === 0;
};
