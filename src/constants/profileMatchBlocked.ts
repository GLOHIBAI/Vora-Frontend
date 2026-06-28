import type { ProfileMatchScanResult } from '../types/profileMatchWaitlist';
import { DEFAULT_MATCH_SCORE_CONFIG } from './profileMatchResult';

export const MOCK_PROFILE_MATCH_SCAN_BLOCKED: ProfileMatchScanResult = {
  originalRoleScore: 87,
  matchedRoleCount: 2,
  careerReadinessScore: 80,
  isEligible: false,
  outcome: 'ELIGIBILITY_ISSUE',
  scoreConfig: DEFAULT_MATCH_SCORE_CONFIG,
  explanation: {
    summary: 'You do not meet the work-authorisation requirements for this role.',
    decision: 'INELIGIBLE',
    primaryReasonCode: 'LOCATION',
    gates: [
      {
        code: 'LOCATION',
        passed: false,
        message: 'Location or work-authorisation requirements not met.',
        alternativePathwayAvailable: false,
      },
    ],
  },
};

export const MOCK_BLOCKED_REASONS = [
  { key: 'Role', value: 'Junior Global Health Researcher · Tee-Company Limited' },
  { key: 'Location', value: 'Stockholm, Sweden (Hybrid, onsite required)' },
  { key: 'Contract type', value: 'Full-time employment (FTE)' },
  { key: 'Work rights required', value: 'EU/EEA nationality or valid Swedish work permit' },
  { key: 'Visa sponsorship', value: 'Not provided by this employer' },
  { key: 'Your declared work rights', value: 'Nigeria only' },
];

export const MOCK_PATHWAY_STEPS = [
  {
    number: 1,
    title: 'Build your track record on remote & consultancy roles',
    description: 'Remote global health roles and STTA consultancy contracts require no country-specific work permit. VORA has already matched you to two right now. Every remote contract strengthens your international profile and opens more doors.',
    tags: [
      { text: 'Start immediately', color: 'blue', iconName: 'clock' },
      { text: '2 matching roles ready now', color: 'blue' }
    ]
  },
  {
    number: 2,
    title: 'Explore EU postgraduate programmes (opens EU/EEA movement)',
    description: 'A postgraduate degree at an EU institution, particularly in Germany, Netherlands, or Sweden, typically comes with a student visa that converts to a job-seeker visa, then a work permit. Many programmes are English-language and affordable or free.',
    tags: [
      { text: '6-18 months to enroll', color: 'blue', iconName: 'clock' },
      { text: 'Germany, NL, Sweden, Denmark', color: 'gray' }
    ]
  },
  {
    number: 3,
    title: 'Seek STTA contracts with INGO sponsors (builds sponsored history)',
    description: 'Short-Term Technical Assistance (STTA) contracts from INGOs like WHO, MSF, USAID implementing partners, and similar organisations sometimes come with short-stay visa sponsorship. A pattern of STTA work is strong evidence of international employability for future FTE visa applications.',
    tags: [
      { text: 'Rolling opportunities', color: 'blue', iconName: 'clock' },
      { text: 'WHO, MSF, IRC, USAID IPs', color: 'gray' }
    ]
  }
];
