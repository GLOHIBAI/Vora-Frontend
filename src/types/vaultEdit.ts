export interface VaultEditOriginal {
  roleType: string;
  roleTitle: string;
  location: string;
  workFormat: string;
  positions: string;
  goLiveDate: string;
  startDate: string;
  roleGoal: string;
  responsibilities: string;
  skills: string;
  tools: string;
  languages: string;
  preAssessment: string;
  experienceYears: string;
  minQualification: string;
  intPolicy: string;
  preferredProfile: string;
  workingStyle: string;
  workCulture: string;
  personalityTraits: string;
  teamNotes: string;
  compType: string;
  salMin: string;
  salMax: string;
  benefits: string;
}

export interface VaultEditChange {
  field: string;
  oldValue: string;
  newValue: string;
  /** Shown on review page when matching will recalibrate after confirmation */
  recalibrate?: boolean;
}

export interface VaultEditReviewData {
  roleTitle: string;
  changes: VaultEditChange[];
  submittedAt: string;
  reviewEndsAt: string;
  editsUsed: number;
  editsTotal: number;
  escrow: EscrowRecalcResult;
  originalPositions: number;
  originalMidpoint: number;
  feeRate: number;
}

export interface EscrowRecalcResult {
  originalMidpoint: number;
  newMidpoint: number;
  positions: number;
  originalEscrow: number;
  newEscrow: number;
  adjustment: number;
}
