import type { ShareChannel } from '../types/jobs';

export const JOB_POSTED_CONFIRMATION_STORAGE_KEY = 'voraJobPostedConfirmation';

export const JOB_POSTED_HOW_IT_WORKS =
  'Applicants sign up, complete onboarding, and take VORA\'s three-stage interview (psychometric, situational judgement, video interview). Candidates scoring 80% or above are matched to your role automatically. You review full scores before any alignment session. Share the link above to reach candidates outside the VORA pool, they still go through the same interview gate.';

export const SHARE_CHANNELS: ShareChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
];
