import type { PublicRoleLandingData } from '../types/roleLanding';

export const ROLE_LANDING_STORAGE_PREFIX = 'voraRoleLanding:';

export const MATCH_CTA_STEPS = [
  'Sign up',
  'Complete onboarding',
  'Upload your CV',
  'See if you match',
] as const;

export const DEFAULT_PUBLIC_ROLE_LANDING: PublicRoleLandingData = {
  slug: 'junior-global-health-researcher',
  companyName: 'Tee-Company Limited',
  companyLocation: 'Manchester, United Kingdom',
  companyInitials: 'TCL',
  roleTitle: 'Junior Global Health Researcher',
  formatLocationLabel: 'Hybrid · Stockholm, Sweden',
  compensationLine: '$1,800 monthly · 2 positions available',
  metaItems: [
    'Full-time',
    'Hybrid · Stockholm, Sweden',
    'Associate level',
    'Posted 2 days ago · Expires in 28 days',
  ],
  primaryTags: ['Internship', 'Hybrid', 'Undergraduate', 'Paid'],
  secondaryTags: ['Health Research', 'Data Analysis'],
  aboutRole:
    'We are looking for a motivated Junior Global Health Researcher to join our growing team. You will support research initiatives across multiple health domains, analyse datasets, and contribute to publications that shape global health policy.',
  responsibilities: [
    'Conduct literature reviews and synthesise findings across global health topics',
    'Support data collection, cleaning, and analysis using health datasets',
    'Contribute to research reports, policy briefs, and academic publications',
    'Collaborate with cross-functional teams across different time zones',
    'Present findings to senior researchers and external stakeholders',
  ],
  requirements: [
    'Undergraduate or postgraduate degree in Public Health, Epidemiology, or related field',
    'Familiarity with research methodologies and statistical analysis',
    'Strong written and verbal communication skills in English',
    'Experience with tools like Excel, SPSS, R, or STATA is an advantage',
  ],
  overviewRows: [
    { label: 'Salary', value: '$1,800/month', valueClassName: 'text-[#0047CC]' },
    { label: 'Contract', value: 'Full-time (FTE)' },
    { label: 'Duration', value: 'Permanent' },
    { label: 'Level', value: 'Associate' },
    { label: 'Format', value: 'Hybrid · 3 days onsite' },
    { label: 'Location', value: 'Stockholm, Sweden' },
    { label: 'Positions', value: '2 available' },
  ],
  eligibilityRows: [
    { label: 'International applicants', value: 'Welcome to apply' },
    { label: 'Visa sponsorship', value: 'Not provided' },
    { label: 'Work rights required', value: 'EU/EEA or valid Swedish work permit' },
  ],
  eligibilityNote:
    'Candidates must hold the legal right to work in Sweden or an EU/EEA country. VORA will note this during your profile match, if you do not meet this criterion, you will still be matched to roles where your eligibility is confirmed.',
  assessmentItems: [
    'Profile match score (CV + onboarding info vs JD)',
    'Psychometric interview (30 questions)',
    'Situational Judgement Interview (SJI)',
    'Video interview',
  ],
};
