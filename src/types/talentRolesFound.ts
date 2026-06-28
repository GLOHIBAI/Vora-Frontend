import type { RoleOverviewRow } from './roleLanding';

export type MatchPercentVariant = 'green' | 'blue';

export interface MatchedRoleEligibility {
  title: string;
  body: string;
}

export interface MatchedRoleListing {
  id: string;
  roleTitle: string;
  companyName: string;
  companyInitials: string;
  salaryAmount: string;
  salaryPeriod: string;
  matchPercent: number;
  matchVariant: MatchPercentVariant;
  locationLine: string;
  formatPill: string;
  postedLine: string;
  contractPill: string;
  contractMeta: string[];
  timezone: string;
  eligibility: MatchedRoleEligibility;
  tags: string[];
  metaItems: string[];
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  eligibilityRows: RoleOverviewRow[];
}

export interface RolesFoundSummary {
  originalRoleTitle: string;
  originalScore: number;
  matchThreshold: number;
  matchedRoleCount: number;
  careerReadinessScore: number;
  assessmentGrade: string;
  /** Primary message from matchExplanation.summary */
  explanationSummary: string;
}
