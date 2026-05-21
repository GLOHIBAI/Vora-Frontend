export interface EmployerPersonalInfo {
  firstName: string;
  lastName: string;
  workEmail: string;
  professionalTitle: string;
}

export interface EmployerOrgInfo {
  organizationName: string;
  organizationType: string;
  headquarters: string;
  institutionalMandate: string[];
  website: string;
}

export interface EmployerHiringNeeds {
  hiringRoles: string[];
  engagementFormat: string[];
  urgency: string;
}

// Payments page types
export type PaymentsTabType = 'session' | 'psychometric' | 'sjt' | 'video' | 'overall';
export type DecisionStatus = 'pending' | 'hired' | 'rejected';

// Final Alignment Session types
export type AlignmentStep = 'choose' | 'video-setup' | 'inperson-setup' | 'confirm';
export type AlignmentSessionType = 'video' | 'inperson';
