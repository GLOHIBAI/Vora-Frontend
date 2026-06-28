import type { ProfileMatchBreakdownItem } from '../constants/profileMatchResult';
import { DEFAULT_MATCH_SCORE_CONFIG } from '../constants/profileMatchResult';
import type { MatchedRoleListing } from '../types/talentRolesFound';
import { normalizeMatchScoreConfig } from './profileMatchResult';

const DIMENSION_LABELS: Record<string, string> = {
  responsibilities: 'Responsibilities',
  technicalSkills: 'Technical skills',
  experience: 'Experience',
  qualifications: 'Qualifications',
  sectorBackground: 'Sector background',
  cultureFit: 'Culture fit',
  workingStyle: 'Working style',
  contextualFit: 'Contextual fit',
  geopolitical: 'Work authorisation',
};

const unwrapApiList = (response: unknown): any[] => {
  if (!response) return [];
  const root = response as Record<string, unknown>;
  const data = root.data ?? response;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).items)) {
    return (data as { items: unknown[] }).items;
  }
  return [];
};

const resolveRowThreshold = (row: Record<string, unknown>, fallback: number): number => {
  const cfg = row?.scoreConfig;
  if (cfg && typeof cfg === 'object') {
    return normalizeMatchScoreConfig(cfg).matchThreshold;
  }
  return fallback;
};

export const countPassingAlternateMatches = (
  response: unknown,
  linkedRoleLink?: string,
  threshold = DEFAULT_MATCH_SCORE_CONFIG.matchThreshold,
): number =>
  unwrapApiList(response).filter((row) => {
    const roleLink = row?.roleLink ?? row?.linkedRoleContext?.roleLink ?? row?.role?.roleLink;
    if (linkedRoleLink && roleLink === linkedRoleLink) return false;
    const score: number = row?.overallScore ?? row?.score ?? 0;
    const eligible = row?.geopoliticalEligible ?? true;
    const outcome = row?.outcome;
    const rowThreshold = resolveRowThreshold(row, threshold);
    return eligible && outcome !== 'ELIGIBILITY_ISSUE' && score >= rowThreshold;
  }).length;

export const mapDimensionScoresToBreakdown = (
  dimensionScores?: Record<string, number> | null,
  matchThresholdPct = Math.round(DEFAULT_MATCH_SCORE_CONFIG.matchThreshold * 100),
  gapThresholdPct = Math.round(DEFAULT_MATCH_SCORE_CONFIG.dimensionGapThreshold * 100),
): ProfileMatchBreakdownItem[] => {
  if (!dimensionScores || Object.keys(dimensionScores).length === 0) return [];

  return Object.entries(dimensionScores).map(([key, value]) => {
    const pct = Math.round(value * 100);
    const barColor = pct >= matchThresholdPct ? 'success' : 'primary';
    void gapThresholdPct;
    return {
      label: DIMENSION_LABELS[key] ?? key,
      pct,
      barColor,
    };
  });
};

const initialsFromName = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'VR';

const formatSalaryFromRolePosting = (role: Record<string, unknown>): { amount: string; period: string } => {
  const min = role?.salaryMin;
  const max = role?.salaryMax;
  if (typeof min === 'number' && typeof max === 'number') {
    return { amount: `${min.toLocaleString()} – ${max.toLocaleString()}`, period: 'monthly' };
  }
  if (typeof min === 'number') {
    return { amount: min.toLocaleString(), period: 'monthly' };
  }
  return { amount: role?.salaryAmount as string ?? '—', period: (role?.salaryPeriod as string) ?? 'monthly' };
};

export const mapTalentMatchesToListings = (
  response: unknown,
  linkedRoleLink?: string,
  threshold = DEFAULT_MATCH_SCORE_CONFIG.matchThreshold,
): MatchedRoleListing[] =>
  unwrapApiList(response)
    .filter((row) => {
      const roleLink = row?.roleLink ?? row?.linkedRoleContext?.roleLink ?? row?.role?.roleLink;
      if (linkedRoleLink && roleLink === linkedRoleLink) return false;
      const score: number = row?.overallScore ?? row?.score ?? 0;
      const eligible = row?.geopoliticalEligible ?? true;
      const rowThreshold = resolveRowThreshold(row, threshold);
      return eligible && row?.outcome !== 'ELIGIBILITY_ISSUE' && score >= rowThreshold;
    })
    .map((row, index) => {
      const score: number = row?.overallScore ?? row?.score ?? 0;
      const matchPercent = Math.round(score * 100);
      const role = row?.role ?? row?.rolePosting ?? row?.linkedRoleContext ?? {};
      const employer = role?.employer as Record<string, unknown> | undefined;
      const companyName =
        role?.employerName ??
        role?.companyName ??
        employer?.organisationName ??
        'Employer';
      const roleTitle = role?.title ?? role?.roleTitle ?? 'Role';
      const city = role?.workLocationCity ?? role?.city;
      const country = role?.workLocationCountry ?? role?.country;
      const location =
        role?.location ??
        role?.locationLabel ??
        (city && country ? `${city}, ${country}` : city ?? country ?? 'Location TBD');
      const salary = formatSalaryFromRolePosting(role);
      const explanation = row?.matchExplanation ?? row?.explanation;
      const gateMessage = Array.isArray(explanation?.gates)
        ? explanation.gates.find((g: { passed?: boolean }) => g.passed)?.message
        : undefined;

      return {
        id: row?.rolePostingId ?? role?.id ?? row?.id ?? `match-${index}`,
        roleTitle,
        companyName: String(companyName),
        companyInitials: initialsFromName(String(companyName)),
        salaryAmount: salary.amount,
        salaryPeriod: salary.period,
        matchPercent,
        matchVariant: matchPercent >= 85 ? 'green' : 'blue',
        locationLine: String(location),
        formatPill: role?.workFormat ?? 'Format TBD',
        postedLine: role?.postedLine ?? 'Posted recently',
        contractPill: role?.contractType ?? role?.compensationType ?? 'Contract TBD',
        contractMeta: Array.isArray(role?.contractMeta) ? role.contractMeta : [],
        timezone: role?.timezone ?? '',
        eligibility: {
          title: 'Eligibility verified',
          body:
            explanation?.summary ??
            gateMessage ??
            'You meet the work-authorisation requirements for this role.',
        },
        tags: Array.isArray(role?.tags) ? role.tags : [],
        metaItems: Array.isArray(role?.metaItems) ? role.metaItems : [],
        aboutRole: role?.aboutRole ?? role?.description ?? '',
        responsibilities: Array.isArray(role?.responsibilities) ? role.responsibilities : [],
        requirements: Array.isArray(role?.requirements) ? role.requirements : [],
        eligibilityRows: Array.isArray(role?.eligibilityRows) ? role.eligibilityRows : [],
      };
    });
