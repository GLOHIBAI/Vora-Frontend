import type {
  ProfileMatchScanResult,
  ProfileWaitlistSummary,
  RoleAlertPreferences,
} from '../types/profileMatchWaitlist';
import { DEFAULT_MATCH_SCORE_CONFIG } from './profileMatchResult';

export const PROFILE_MATCH_WAITLIST_PATH = '/onboarding/talent/match/waitlist';

export const DEFAULT_ROLE_ALERT_PREFERENCES: RoleAlertPreferences = {
  roleType: 'Research & Analysis',
  experienceLevel: 'Student / Graduate',
  location: 'Open to remote, any region',
  salaryExpectation: '$1,000, $3,000 / month',
  otherPreferences: 'No additional requirements',
};

export const DEFAULT_PROFILE_WAITLIST_SUMMARY: ProfileWaitlistSummary = {
  careerReadinessScore: 80,
  assessmentGrade: 'B1',
  profileStrengthLabel: 'Top 15%',
  strongProfileNote: 'Your profile ranked in the top 15% of all profiles scanned this month',
  matchThreshold: Math.round(DEFAULT_MATCH_SCORE_CONFIG.matchThreshold * 100),
  explanationSummary: '',
};

export const PROFILE_WAITLIST_NEXT_STEPS = [
  {
    title: 'Your profile stays live.',
    body: 'VORA holds your complete profile on file, CV, onboarding details, readiness score, ready to match the moment the right role appears.',
  },
  {
    title: 'Instant alert, instant access.',
    body: 'When an employer posts a role that matches your profile at 80%+, you are notified before most people find the listing and can go straight into assessment.',
  },
  {
    title: 'Your score is valid for 90 days.',
    body: 'No need to redo anything. Come back when you get the alert, click start, and VORA picks up exactly where you left off.',
  },
] as const;

/** Mock scan payload until match API is wired. */
export const MOCK_PROFILE_MATCH_SCAN: ProfileMatchScanResult = {
  originalRoleScore: 61,
  matchedRoleCount: 3,
  careerReadinessScore: 71,
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
};

export const MOCK_PROFILE_MATCH_SCAN_STRONG_NO_ROLES: ProfileMatchScanResult = {
  originalRoleScore: 72,
  matchedRoleCount: 0,
  careerReadinessScore: 80,
  outcome: 'STRONG_PROFILE_NO_MATCH',
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    summary: 'Your profile is strong, but no live roles matched it at the current threshold.',
    primaryReasonCode: 'SCORE',
    gates: [],
  },
};

export const MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH: ProfileMatchScanResult = {
  originalRoleScore: 87,
  matchedRoleCount: 1,
  careerReadinessScore: 80,
  outcome: 'MATCHED',
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    summary: 'Your profile meets the requirements for this role (87% match).',
    decision: 'ELIGIBLE',
    primaryReasonCode: null,
    gates: [
      {
        code: 'POLICY',
        passed: true,
        message: 'You meet this role\'s work authorisation requirements.',
      },
    ],
  },
};

export const MOCK_PROFILE_MATCH_SCAN_NO_MATCH_UPSKILL: ProfileMatchScanResult = {
  originalRoleScore: 62,
  matchedRoleCount: 0,
  careerReadinessScore: 62,
  outcome: 'NO_MATCH_OTHER_ROLES_FOUND',
  geopoliticalEligible: true,
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    decision: 'INELIGIBLE',
    summary:
      'Your profile does not yet meet the bar for this role — strongest gap: Technical skills and tools.',
    primaryReasonCode: 'SCORE',
    gates: [
      {
        code: 'POLICY',
        passed: true,
        message: 'You meet this role\'s work authorisation requirements.',
      },
    ],
  },
  rolePosting: {
    id: 'b77dac84-44aa-4764-8316-863d4d73a907',
    roleTitle: 'Backend Engineer',
    roleLink: 'backend-engineer-b77dac',
    companyName: 'Vora AI',
    workLocationCity: 'Lagos',
    workLocationCountry: 'Nigeria',
  },
  development: {
    focusAreas: ['technical skills and tools', 'role responsibilities'],
    message:
      "You're not quite there for the Backend Engineer role yet. To strengthen technical skills and tools, we recommend courses like Production-Grade Backend Engineering and mentors such as Dr Ada Obi.",
    hasResources: true,
    courses: [{ id: 'c1f2', title: 'Production-Grade Backend Engineering' }],
    mentors: [{ id: 'm9a8', name: 'Dr Ada Obi' }],
  },
};

export const MOCK_PROFILE_MATCH_SCAN_NO_MATCH_SELF_STUDY: ProfileMatchScanResult = {
  ...MOCK_PROFILE_MATCH_SCAN_NO_MATCH_UPSKILL,
  development: {
    focusAreas: ['technical skills and tools', 'role responsibilities'],
    message:
      "You're not quite there for the Backend Engineer role yet. There aren't any mentors or courses for backend engineering on the platform yet — we recommend upskilling in technical skills and tools through self-directed study, then reapplying once you've built it.",
    hasResources: false,
    courses: [],
    mentors: [],
  },
};

export const MOCK_PROFILE_MATCH_SCAN_ELIGIBILITY_ISSUE: ProfileMatchScanResult = {
  originalRoleScore: 91,
  matchedRoleCount: 0,
  careerReadinessScore: 91,
  outcome: 'ELIGIBILITY_ISSUE',
  geopoliticalEligible: false,
  isEligible: false,
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    decision: 'INELIGIBLE',
    summary: 'This role is open to candidates with existing right to work in the United Kingdom.',
    primaryReasonCode: 'LOCATION',
    gates: [
      {
        code: 'RIGHT_TO_WORK',
        passed: false,
        message: 'This role is open to candidates with existing right to work in the United Kingdom.',
        alternativePathwayAvailable: false,
      },
    ],
  },
  rolePosting: {
    id: 'b77dac84-44aa-4764-8316-863d4d73a907',
    roleTitle: 'Backend Engineer',
    roleLink: 'backend-engineer-b77dac',
    companyName: 'Vora AI',
    workLocationCity: 'London',
    workLocationCountry: 'United Kingdom',
  },
};

export const MOCK_PROFILE_MATCH_SCAN_CV_UNAVAILABLE: ProfileMatchScanResult = {
  originalRoleScore: 0,
  matchedRoleCount: 0,
  careerReadinessScore: 0,
  outcome: 'NO_MATCH_OTHER_ROLES_FOUND',
  geopoliticalEligible: true,
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    decision: 'INELIGIBLE',
    summary: "We couldn't score your profile against this role yet — your CV or profile isn't ready for matching.",
    primaryReasonCode: 'CV_UNAVAILABLE',
    gates: [],
  },
  rolePosting: {
    id: 'b77dac84-44aa-4764-8316-863d4d73a907',
    roleTitle: 'Backend Engineer',
    roleLink: 'backend-engineer-b77dac',
    companyName: 'Vora AI',
  },
};

export type ProfileMatchScanOutcome = 'waitlist' | 'roles_found';

export const isCareerReadinessPassing = (
  scan: ProfileMatchScanResult,
  threshold?: number,
): boolean =>
  scan.careerReadinessScore >=
  (threshold ??
    Math.round(
      (scan.scoreConfig?.matchThreshold ?? DEFAULT_MATCH_SCORE_CONFIG.matchThreshold) * 100,
    ));

export const resolveProfileMatchScanOutcome = (
  scan: ProfileMatchScanResult,
  threshold?: number,
): ProfileMatchScanOutcome =>
  isCareerReadinessPassing(scan, threshold) ? 'waitlist' : 'roles_found';
