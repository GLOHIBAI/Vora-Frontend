export type RejectionKind = 'LEGITIMATE' | 'FRAUD';

export type RejectionPrimaryReason =
  | 'ROLE_CANCELLED_OR_ON_HOLD'
  | 'CANDIDATE_WITHDREW'
  | 'COMPENSATION_NOT_AGREED'
  | 'UNAVAILABLE_FOR_START_DATE'
  | 'LEGAL_OR_COMPLIANCE_BARRIER'
  | 'STRONGER_OPERATIONAL_FIT'
  | 'OTHER';

export const REJECTION_REASONS: { id: RejectionPrimaryReason; label: string }[] = [
  { id: 'ROLE_CANCELLED_OR_ON_HOLD', label: 'Role was cancelled or put on hold' },
  { id: 'CANDIDATE_WITHDREW', label: 'Candidate withdrew from the process' },
  { id: 'COMPENSATION_NOT_AGREED', label: 'Compensation could not be agreed' },
  { id: 'UNAVAILABLE_FOR_START_DATE', label: 'Candidate unavailable for required start date' },
  { id: 'LEGAL_OR_COMPLIANCE_BARRIER', label: 'Legal or compliance barrier identified' },
  { id: 'STRONGER_OPERATIONAL_FIT', label: 'Another candidate was a stronger operational fit' },
  { id: 'OTHER', label: 'Other (specify below)' },
];

export const REJECTION_DETAILS_MIN_LENGTH = 10;

export const FLAGGED_WORDS = [
  'performance', 
  'communication', 
  'presentation', 
  'personality', 
  'appearance'
];
