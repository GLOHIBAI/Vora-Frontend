import type { MatchedRoleListing, RolesFoundSummary } from '../types/talentRolesFound';
import { DEFAULT_MATCH_SCORE_CONFIG, ROLES_FOUND_PATH } from './profileMatchResult';

export { ROLES_FOUND_PATH };

export const DEFAULT_ROLES_FOUND_SUMMARY: RolesFoundSummary = {
  originalRoleTitle: 'Junior Global Health Researcher',
  originalScore: 61,
  matchThreshold: Math.round(DEFAULT_MATCH_SCORE_CONFIG.matchThreshold * 100),
  matchedRoleCount: 3,
  careerReadinessScore: 71,
  assessmentGrade: 'B1',
  explanationSummary: '',
};

export const MOCK_MATCHED_ROLES: MatchedRoleListing[] = [
  {
    id: 'intern',
    roleTitle: 'Global Health Research Intern',
    companyName: 'Tee-Company Limited',
    companyInitials: 'TCL',
    salaryAmount: '$200',
    salaryPeriod: 'monthly',
    matchPercent: 91,
    matchVariant: 'green',
    locationLine: 'Manchester, United Kingdom',
    formatPill: 'Onsite (5 days)',
    postedLine: 'Posted 2 days ago · 3 positions',
    contractPill: 'Internship (Fixed-term)',
    contractMeta: ['6 months', 'Full-time during placement'],
    timezone: 'GMT / UK',
    eligibility: {
      title: 'Eligibility verified, you qualify to work in this role',
      body: 'Your right to work in the UK was confirmed from your onboarding profile. This role does not offer visa sponsorship, your existing work authorisation covers it.',
    },
    tags: ['Internship', 'Onsite', 'Fixed-term', 'Paid', 'UK-eligible'],
    metaItems: [
      'Full-time',
      'Onsite · Manchester, UK',
      'Internship level',
      'Expires in 28 days',
    ],
    aboutRole:
      'We are looking for a motivated Global Health Research Intern to support our growing research team. You will assist on live research projects, contribute to data collection, and gain hands-on experience in global health practice.',
    responsibilities: [
      'Assist with literature reviews and synthesis of research findings',
      'Support data collection and entry across multiple health programmes',
      'Contribute to research reports and briefing documents',
      'Attend and minute team meetings and stakeholder calls',
      'Help organise and manage research databases',
    ],
    requirements: [
      'Undergraduate degree in Public Health, Biology, Social Sciences or related field',
      'Strong written communication skills in English',
      'Familiarity with Microsoft Office suite, especially Excel',
      'Eagerness to learn in a fast-paced research environment',
      'Ability to work independently and manage deadlines',
    ],
    eligibilityRows: [
      { label: 'Work format', value: 'Onsite (5 days)' },
      { label: 'Location', value: 'Manchester, United Kingdom' },
      { label: 'Timezone', value: 'GMT ± 0' },
      {
        label: 'International applicants',
        value:
          'Your right to work in the UK was confirmed from your onboarding profile. VORA verified this before showing you this role.',
      },
      { label: 'Visa sponsorship', value: 'Not sponsored, candidates must hold or obtain UK work authorisation' },
      { label: 'Right to work', value: 'Right to work in the UK is required before start date' },
      { label: 'Nationality', value: 'No nationality restrictions' },
    ],
  },
  {
    id: 'analyst',
    roleTitle: 'Public Health Data Analyst',
    companyName: 'World Health Analytics',
    companyInitials: 'WHA',
    salaryAmount: '$1,400',
    salaryPeriod: 'monthly',
    matchPercent: 85,
    matchVariant: 'green',
    locationLine: 'Remote (Global)',
    formatPill: 'Fully remote, distributed',
    postedLine: 'Posted 5 days ago · 2 positions',
    contractPill: 'Consultancy (Short-term)',
    contractMeta: ['12 months, renewable', '40 hrs/wk equivalent'],
    timezone: 'Async-first · GMT±3',
    eligibility: {
      title: 'Eligibility verified, you qualify to work in this role',
      body: 'This is a consultancy contract with no country-specific work permit requirement. Open to candidates worldwide, your location does not restrict eligibility.',
    },
    tags: ['Remote', 'Consultancy', 'Global', 'Paid', 'No location restriction'],
    metaItems: ['Full-time', 'Remote (Global)', 'Graduate level', 'Expires in 21 days'],
    aboutRole:
      'World Health Analytics is seeking a Public Health Data Analyst to join our distributed team. You will work with large health datasets, translate data into actionable insights, and support publication of findings across global health journals.',
    responsibilities: [
      'Clean, analyse and visualise health datasets from multiple sources',
      'Prepare technical reports and policy briefs for senior leadership',
      'Collaborate with research leads across different time zones',
      'Support grant applications with data evidence',
      'Present findings in team reviews',
    ],
    requirements: [
      'Graduate degree in Epidemiology, Public Health, Statistics or related field',
      'Proficiency in at least one tool: R, SPSS, STATA or Python',
      'Strong data visualisation skills',
      'Experience with literature review methodologies',
      'Excellent remote communication skills',
    ],
    eligibilityRows: [
      { label: 'Work format', value: 'Fully remote, work from anywhere' },
      { label: 'Location', value: 'Remote (Global)' },
      { label: 'Timezone', value: 'Flexible, async-first team' },
      {
        label: 'International applicants',
        value:
          'Consultancy contract, no country-specific work permit needed. Open to candidates worldwide. Your location does not restrict access.',
      },
      { label: 'Visa sponsorship', value: 'Not applicable, no physical presence required' },
      { label: 'Right to work', value: 'No work permit required for remote engagement' },
      { label: 'Nationality', value: 'No restrictions, all nationalities welcome' },
    ],
  },
  {
    id: 'associate',
    roleTitle: 'Health Research Associate',
    companyName: 'Health Reach Foundation',
    companyInitials: 'HRF',
    salaryAmount: '$900',
    salaryPeriod: 'monthly',
    matchPercent: 80,
    matchVariant: 'blue',
    locationLine: 'Lagos, Nigeria',
    formatPill: 'Hybrid · 3 days onsite',
    postedLine: 'Posted today · 1 position',
    contractPill: 'Full-time (FTE)',
    contractMeta: ['1-year renewable', '40 hrs / week'],
    timezone: 'WAT (GMT+1)',
    eligibility: {
      title: 'Eligibility verified, you qualify to work in this role',
      body: 'Your eligibility for this Nigeria-based role was confirmed. Health Reach Foundation actively welcomes international candidates and provides visa sponsorship and relocation support for shortlisted hires.',
    },
    tags: ['Hybrid', 'Full-time', 'Associate', 'Paid', 'Visa sponsorship avail.'],
    metaItems: ['Full-time', 'Hybrid · Lagos, Nigeria', 'Associate level', '1 position remaining'],
    aboutRole:
      'Health Reach Foundation is recruiting a Health Research Associate to support our Nigeria operations. You will be embedded within active field research programmes, contributing to data collection, community engagement, and impact reporting.',
    responsibilities: [
      'Manage field data collection for ongoing programmes',
      'Coordinate with community health workers',
      'Contribute to quarterly programme impact reports',
      'Support ethics submissions',
      'Assist with training of junior data collectors',
    ],
    requirements: [
      'Undergraduate or postgraduate degree in Public Health or related field',
      'Prior field research experience is an advantage',
      'Fluent in English; knowledge of Yoruba or Hausa is a plus',
      'Strong organisational skills',
      'Willingness to travel within Lagos',
    ],
    eligibilityRows: [
      { label: 'Work format', value: 'Hybrid, 3 days onsite, 2 days remote' },
      { label: 'Location', value: 'Lagos, Nigeria' },
      { label: 'Timezone', value: 'WAT (GMT+1)' },
      {
        label: 'International applicants',
        value:
          'Health Reach Foundation provides visa sponsorship for international candidates. Your eligibility for this role has been confirmed.',
      },
      { label: 'Visa sponsorship', value: 'Not sponsored, candidates must hold Nigerian work authorisation' },
      {
        label: 'Right to work',
        value: 'Right to work in Nigeria required. Non-Nigerian nationals must hold a valid work permit.',
      },
      { label: 'Nationality', value: 'No nationality restrictions, but West Africa-based strongly preferred' },
    ],
  },
];
