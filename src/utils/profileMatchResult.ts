import type { PublicRoleLandingData } from '../types/roleLanding';
import type { ProfileMatchScanResult, MatchOutcome, MatchExplanation } from '../types/profileMatchWaitlist';
import {
  MOCK_PROFILE_MATCH_SCAN,
  PROFILE_MATCH_WAITLIST_PATH,
} from '../constants/profileMatchWaitlist';
import { PROFILE_MATCH_THRESHOLD, PROFILE_MATCH_RESULT_PATH } from '../constants/profileMatchResult';
import { ROLES_FOUND_PATH } from '../constants/talentRolesFound';

export const PROFILE_MATCH_BLOCKED_PATH = '/onboarding/talent/match/blocked';
export { PROFILE_MATCH_WAITLIST_PATH };

export const withRoleApplyPath = (path: string, roleSlug: string): string =>
  path.replace('/onboarding/talent/', `/onboarding/talent/${roleSlug}/`);

export const isProfileMatchPassing = (score: number, threshold = PROFILE_MATCH_THRESHOLD): boolean =>
  score >= threshold;

export const resolveProfileMatchScan = (
  scan?: Partial<ProfileMatchScanResult> | null,
): ProfileMatchScanResult => ({
  ...MOCK_PROFILE_MATCH_SCAN,
  ...scan,
});

/** Route to the correct post-scan screen using backend outcome when available. */
export const getPostMatchPath = (scan: ProfileMatchScanResult): string => {
  if (scan.outcome === 'ELIGIBILITY_ISSUE' || scan.isEligible === false) {
    return PROFILE_MATCH_BLOCKED_PATH;
  }
  if (scan.outcome === 'MATCHED') {
    return PROFILE_MATCH_RESULT_PATH;
  }
  if (scan.outcome === 'NO_MATCH_OTHER_ROLES_FOUND') {
    return ROLES_FOUND_PATH;
  }
  if (scan.outcome === 'STRONG_PROFILE_NO_MATCH') {
    return PROFILE_MATCH_WAITLIST_PATH;
  }

  // Fallback for pre-Phase-1 payloads without outcome
  if (scan.originalRoleScore >= PROFILE_MATCH_THRESHOLD) {
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

/**
 * Maps the raw backend response from GET /talent/matches/for-role into the
 * frontend ProfileMatchScanResult shape used across all result pages.
 */
export const mapApiMatchResultToScan = (
  apiData: any,
  otherStrongMatchCount = 0,
): ProfileMatchScanResult => {
  const rawScore: number = apiData?.overallScore ?? apiData?.score ?? 0;
  const originalRoleScore = Math.round(rawScore * 100);
  const qualificationsScore: number = apiData?.dimensionScores?.qualifications ?? rawScore;
  const careerReadinessScore = Math.round(qualificationsScore * 100);
  const geopoliticalEligible: boolean = apiData?.geopoliticalEligible ?? true;
  const outcome: MatchOutcome | undefined = apiData?.outcome;
  const alternateCount =
    apiData?.alternateMatches?.length ??
    apiData?.matchedRoleCount ??
    (outcome === 'NO_MATCH_OTHER_ROLES_FOUND' ? Math.max(otherStrongMatchCount, 1) : otherStrongMatchCount);

  // isEligible = passed the geo gate
  const isEligible = geopoliticalEligible && outcome !== 'ELIGIBILITY_ISSUE';

  // Build a minimal explanation if backend hasn't sent one yet
  const explanation: MatchExplanation | undefined = apiData?.explanation ?? (
    outcome === 'ELIGIBILITY_ISSUE'
      ? {
          summary: apiData?.geopoliticalNotes ?? 'You do not meet the location or work-authorisation requirements for this role.',
          primaryReasonCode: 'LOCATION' as const,
          gates: [
            {
              code: 'LOCATION' as const,
              passed: false,
              message: apiData?.geopoliticalNotes ?? 'Location or work-authorisation requirements not met.',
              alternativePathwayAvailable: false,
            },
          ],
        }
      : undefined
  );

  return {
    originalRoleScore,
    careerReadinessScore,
    matchedRoleCount: alternateCount,
    isEligible,
    outcome,
    explanation,
    dimensionScores: apiData?.dimensionScores,
  };
};

/**
 * Returns true while the backend scan is still running and the frontend should keep polling.
 */
export const isMatchResultPending = (apiResponse: any): boolean => {
  if (!apiResponse) return true;
  const data = apiResponse?.data ?? apiResponse;
  if (data?.status === 'PENDING') return true;
  if (data?.status === 'READY') return false;
  if (data?.overallScore != null || data?.outcome) return false;
  return Object.keys(data ?? {}).length === 0;
};
