export type ProfileMatchStepStatus = 'done' | 'running' | 'queued';

export interface ProfileMatchStepDefinition {
  id: string;
  title: string;
  subtitle: string;
}

export const PROFILE_MATCH_STEPS: ProfileMatchStepDefinition[] = [
  {
    id: 'cv',
    title: 'Reading your CV',
    subtitle: 'Extracted skills, experience and qualifications',
  },
  {
    id: 'onboarding',
    title: 'Reading your onboarding profile',
    subtitle: 'Combined with CV to form your complete profile',
  },
  {
    id: 'scanning',
    title: 'Scanning all live roles for additional matches',
    subtitle: '200+ roles checked, eligibility-filtered first',
  },
  {
    id: 'score',
    title: 'Calculating Career Readiness Score',
    subtitle: 'Your personal benchmark across eligible roles',
  },
  {
    id: 'eligibility',
    title: 'Checking work eligibility against each role',
    subtitle: 'Filtering out roles you cannot legally access',
  },
  {
    id: 'matching',
    title: 'Matching your profile against eligible roles',
    subtitle: 'Profile scored only against roles you can actually access',
  },
];

/** Progress percentages when each running step completes. */
export const PROFILE_MATCH_PROGRESS_BY_STEP = [40, 50, 70, 88, 100] as const;

export const ROLE_PROFILE_MATCH_PATH = '/onboarding/talent/match';

export const buildInitialProfileMatchStatuses = (): ProfileMatchStepStatus[] => [
  'done',
  'done',
  'running',
  'queued',
  'queued',
  'queued',
];

export const getProfileMatchProgressPercent = (statuses: ProfileMatchStepStatus[]): number => {
  const doneCount = statuses.filter((status) => status === 'done').length;
  if (statuses.every((status) => status === 'done')) return 100;
  if (doneCount <= 2) return 40;
  if (doneCount === 3) return 50;
  if (doneCount === 4) return 70;
  if (doneCount === 5) return 88;
  return 100;
};
