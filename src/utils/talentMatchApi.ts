import type { ProfileMatchBreakdownItem } from '../constants/profileMatchResult';
import type { MatchedRoleListing } from '../types/talentRolesFound';
import { PROFILE_MATCH_THRESHOLD } from '../constants/profileMatchResult';

const DIMENSION_LABELS: Record<string, string> = {
  responsibilities: 'Responsibilities',
  technicalSkills: 'Technical skills',
  experience: 'Experience',
  qualifications: 'Qualifications',
  sectorBackground: 'Sector background',
  cultureFit: 'Culture fit',
  workingStyle: 'Working style',
  contextualFit: 'Contextual fit',
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

export const countPassingAlternateMatches = (
  response: unknown,
  linkedRoleLink?: string,
  threshold = PROFILE_MATCH_THRESHOLD / 100,
): number =>
  unwrapApiList(response).filter((row) => {
    const roleLink = row?.roleLink ?? row?.linkedRoleContext?.roleLink ?? row?.role?.roleLink;
    if (linkedRoleLink && roleLink === linkedRoleLink) return false;
    const score: number = row?.overallScore ?? row?.score ?? 0;
    const eligible = row?.geopoliticalEligible ?? true;
    const outcome = row?.outcome;
    return eligible && outcome !== 'ELIGIBILITY_ISSUE' && score >= threshold;
  }).length;

export const mapDimensionScoresToBreakdown = (
  dimensionScores?: Record<string, number> | null,
): ProfileMatchBreakdownItem[] => {
  if (!dimensionScores || Object.keys(dimensionScores).length === 0) return [];

  return Object.entries(dimensionScores).map(([key, value]) => {
    const pct = Math.round(value * 100);
    const barColor = pct >= 80 ? 'success' : 'primary';
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

export const mapTalentMatchesToListings = (
  response: unknown,
  linkedRoleLink?: string,
  threshold = PROFILE_MATCH_THRESHOLD / 100,
): MatchedRoleListing[] =>
  unwrapApiList(response)
    .filter((row) => {
      const roleLink = row?.roleLink ?? row?.linkedRoleContext?.roleLink ?? row?.role?.roleLink;
      if (linkedRoleLink && roleLink === linkedRoleLink) return false;
      const score: number = row?.overallScore ?? row?.score ?? 0;
      const eligible = row?.geopoliticalEligible ?? true;
      return eligible && row?.outcome !== 'ELIGIBILITY_ISSUE' && score >= threshold;
    })
    .map((row, index) => {
      const score: number = row?.overallScore ?? row?.score ?? 0;
      const matchPercent = Math.round(score * 100);
      const role = row?.role ?? row?.rolePosting ?? row?.linkedRoleContext ?? {};
      const companyName = role?.employerName ?? role?.companyName ?? 'Employer';
      const roleTitle = role?.title ?? role?.roleTitle ?? 'Role';
      const location = role?.location ?? role?.locationLabel ?? 'Location TBD';

      return {
        id: row?.rolePostingId ?? row?.id ?? `match-${index}`,
        roleTitle,
        companyName,
        companyInitials: initialsFromName(companyName),
        salaryAmount: role?.salaryAmount ?? '—',
        salaryPeriod: role?.salaryPeriod ?? 'monthly',
        matchPercent,
        matchVariant: matchPercent >= 85 ? 'green' : 'blue',
        locationLine: location,
        formatPill: role?.workFormat ?? 'Format TBD',
        postedLine: role?.postedLine ?? 'Posted recently',
        contractPill: role?.contractType ?? 'Contract TBD',
        contractMeta: Array.isArray(role?.contractMeta) ? role.contractMeta : [],
        timezone: role?.timezone ?? '',
        eligibility: {
          title: 'Eligibility verified',
          body: row?.explanation?.summary ?? 'You meet the work-authorisation requirements for this role.',
        },
        tags: Array.isArray(role?.tags) ? role.tags : [],
        metaItems: Array.isArray(role?.metaItems) ? role.metaItems : [],
        aboutRole: role?.aboutRole ?? role?.description ?? '',
        responsibilities: Array.isArray(role?.responsibilities) ? role.responsibilities : [],
        requirements: Array.isArray(role?.requirements) ? role.requirements : [],
        eligibilityRows: Array.isArray(role?.eligibilityRows) ? role.eligibilityRows : [],
      };
    });
