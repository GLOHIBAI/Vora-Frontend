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
  matchThreshold: number;
  /** Primary message from matchExplanation.summary */
  explanationSummary: string;
}

export type MatchOutcome =
  | 'MATCHED'
  | 'NO_MATCH_OTHER_ROLES_FOUND'
  | 'STRONG_PROFILE_NO_MATCH'
  | 'ELIGIBILITY_ISSUE';

export interface MatchGate {
  code: 'LOCATION' | 'RIGHT_TO_WORK' | 'FUNDING_RESTRICTION' | 'REQUIREMENTS' | 'SCORE' | 'POLICY';
  passed: boolean;
  message: string;
  alternativePathwayAvailable?: boolean;
}

export interface MatchDimensionGap {
  dimension: string;
  score: number;
  threshold: number;
  missing?: string[];
  gaps?: string[];
}

export interface MatchImprovementAction {
  type: string;
  label: string;
  dimension?: string;
}

export interface MatchScoreConfig {
  version?: number;
  matchThreshold: number;
  dimensionGapThreshold: number;
  dimensionWeights?: Record<string, number>;
}

export interface MatchExplanation {
  decision?: 'ELIGIBLE' | 'INELIGIBLE';
  summary: string;
  primaryReasonCode: 'LOCATION' | 'SCORE' | 'REQUIREMENTS' | 'CV_UNAVAILABLE' | null;
  gates: MatchGate[];
  dimensionGaps?: MatchDimensionGap[];
  improvementActions?: MatchImprovementAction[];
  scoredDimensionCount?: number;
  totalDimensionCount?: number;
}

export interface MatchDevelopmentCourse {
  id: string;
  title: string;
}

export interface MatchDevelopmentMentor {
  id: string;
  name: string;
}

export interface MatchDevelopment {
  focusAreas: string[];
  message: string;
  hasResources: boolean;
  courses: MatchDevelopmentCourse[];
  mentors: MatchDevelopmentMentor[];
}

export interface MatchRolePostingSnapshot {
  id: string;
  roleTitle: string;
  roleLink: string;
  companyName: string;
  workLocationCity?: string;
  workLocationCountry?: string;
  salaryMin?: number;
  salaryMax?: number;
  compensationType?: string;
}

export interface ProfileMatchScanResult {
  originalRoleScore: number;
  matchedRoleCount: number;
  careerReadinessScore: number;
  geopoliticalEligible?: boolean;
  isEligible?: boolean;
  /** Raw backend outcome enum value */
  outcome?: MatchOutcome;
  /** Structured explanation from backend (matchExplanation on job-link API) */
  explanation?: MatchExplanation;
  /** Raw dimension scores (0–1) keyed by dimension name */
  dimensionScores?: Record<string, number>;
  rolePostingId?: string;
  /** Alternate role matches from job-link match API (when outcome is NO_MATCH_OTHER_ROLES_FOUND). */
  alternateMatches?: unknown[];
  /** Scoring thresholds and weights from the match API. */
  scoreConfig?: MatchScoreConfig;
  /** Upskill guidance when score missed but geo eligible (NO_MATCH_OTHER_ROLES_FOUND). */
  development?: MatchDevelopment;
  /** Inline role context from match API (fallback when public role fetch unavailable). */
  rolePosting?: MatchRolePostingSnapshot;
}

export type ProfileMatchScanOutcome = 'waitlist' | 'roles_found';
