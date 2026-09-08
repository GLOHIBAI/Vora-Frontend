import type { TimelineStep } from '../types/vault';

export const VAULT_CONFIRMATION_STORAGE_KEY = 'voraVaultConfirmation';

export const DEFAULT_VAULT_TIMELINE = (
  vaultReference: string,
  submittedDate: string,
  vaultPeriodEnd: string,
  reminderDate: string,
  goLiveFormatted: string
): TimelineStep[] => [
  {
    status: 'done',
    title: 'Done, role vaulted & fee locked',
    description: `Your role specification is saved and sealed. Your escrow is locked at today's rate: 15% for most regions, 10% for LMIC employers (capped at USD 3,000 per position). You have been emailed a confirmation with your vault reference ${vaultReference}.`,
    dateLabel: `Today, ${submittedDate}`,
  },
  {
    status: 'pending',
    title: 'Vault period, silent matching',
    description:
      'Your role is completely invisible. No candidate knows it exists, no candidate is contacted about it. In the background, every new candidate who joins VORA and completes their onboarding profile is silently matched against your specification. Those who score 80% or above are pre-qualified internally, flagged as likely matches. They are not told. They are not contacted. They simply exist in a pre-qualified list that activates the moment your role goes live. Your Vault dashboard shows a live count of how many VORA candidates currently pre-qualify. That number updates in real time as new talent joins. If the number is zero today, it is honest. The value of scheduling further out is that it gives the pool more time to grow.',
    dateLabel: `Now until ${vaultPeriodEnd}`,
  },
  {
    status: 'future',
    stepNumber: 3,
    title: '72-hour reminder from VORA',
    description:
      'VORA emails you a reminder that go-live is 72 hours away. You can review your role specification one final time, make your last spec edit if needed, or cancel with a full refund if your plans have changed.',
    dateLabel: reminderDate,
  },
  {
    status: 'future',
    stepNumber: 4,
    title: 'Go-live, matching fires for the first time',
    description:
      'On your go-live date, your role publishes publicly. VORA\'s matching engine runs for the first time against this role. Every qualified candidate in the VORA pool is notified simultaneously that a new matching role is available. This is the first moment any candidate ever sees or hears about this role.',
    dateLabel: goLiveFormatted,
  },
  {
    status: 'future',
    stepNumber: 5,
    title: 'Interview and hire',
    description:
      'Matched candidates proceed through VORA\'s interview. You receive scored profiles and can hire or request an Alignment session. On confirmed hire, the true-up fires, if the final salary differs from the midpoint, VORA charges or refunds the difference within 24 hours.',
    dateLabel: `${goLiveFormatted.split(' ').slice(-1)[0]} onwards`,
  },
];
