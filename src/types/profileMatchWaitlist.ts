export interface RoleAlertPreferences {
  roleType: string;
  experienceLevel: string;
  location: string;
  salaryExpectation: string;
  otherPreferences: string;
}

export interface ProfileWaitlistSummary {
  careerReadinessScore: number;
  assessmentGrade: string;
  profileStrengthLabel: string;
  strongProfileNote: string;
}

export type MatchOutcome =
  | 'MATCHED'
  | 'NO_MATCH_OTHER_ROLES_FOUND'
  | 'STRONG_PROFILE_NO_MATCH'
  | 'ELIGIBILITY_ISSUE';

export interface MatchGate {
  code: 'LOCATION' | 'RIGHT_TO_WORK' | 'FUNDING_RESTRICTION' | 'REQUIREMENTS' | 'SCORE';
  passed: boolean;
  message: string;
  alternativePathwayAvailable?: boolean;
}

export interface MatchExplanation {
  summary: string;
  primaryReasonCode: 'LOCATION' | 'SCORE' | 'REQUIREMENTS' | null;
  gates: MatchGate[];
}

export interface ProfileMatchScanResult {
  originalRoleScore: number;
  matchedRoleCount: number;
  careerReadinessScore: number;
  isEligible?: boolean;
  /** Raw backend outcome enum value */
  outcome?: MatchOutcome;
  /** Structured explanation from backend (Phase 1) */
  explanation?: MatchExplanation;
  /** Raw dimension scores (0–1) keyed by dimension name */
  dimensionScores?: Record<string, number>;
}

export type ProfileMatchScanOutcome = 'waitlist' | 'roles_found';
