export type TalentJobStage = 'GATE_1' | 'GATE_2' | 'GATE_3' | 'HIRED' | 'REJECTED';

export interface TalentAppliedJobStage {
  current: number;
  total: number;
  name: string;
  label: string;
  completed: boolean;
}

export interface TalentAppliedJob {
  assessmentId: string;
  rolePostingId: string;
  roleTitle: string;
  roleLink: string;
  organisationName: string;
  location: string;
  compensationSummary: string;
  tags: string[];
  status: string;
  overallPassed: boolean | null;
  stage: TalentAppliedJobStage;
  overallScore: number | null;
  applicantCode: string | null;
  decisionStatus: string | null;
  appliedAt: string;
  lastActivityAt: string;
  hrefHint: string;

  // Compatibility aliases
  id?: string;
  companyName?: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  currentStage?: TalentJobStage | string | null;
  stageProgress?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  department?: string | null;
  employmentType?: string | null;
  createdAt?: string;
  matchScore?: number | null;
}

export type TalentGradeCode = 'B1' | 'B2' | 'C1' | 'C2' | 'D' | 'E' | 'F';

export interface TalentAvailableJob {
  rolePostingId: string;
  roleLink: string;
  roleTitle: string;
  organisationName: string;
  location: string;
  compensationSummary: string;
  tags: string[];
  publishedAt: string;
  isApplied: boolean;
  matchScore: number | null;
  matchOutcome: string | null;
  eligibilityStatus: string | null;
  grade: TalentGradeCode | null;
  gradePrescription: string | null;
  hrefHint: string;

  // Compatibility aliases
  id?: string;
  companyName?: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  currentStage?: TalentJobStage | string | null;
  stageProgress?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  department?: string | null;
  employmentType?: string | null;
  createdAt?: string;
  assessmentId?: string | null;
  appliedAt?: string | null;
  status?: string;
}

export interface TalentJobsMetrics {
  totalApplied: number;
  inProgressCount: number;
  completedCount: number;
  availableMatchedCount?: number;
}

export interface TalentGrade {
  grade: TalentGradeCode | null;
  gradePrescription: string | null;
}

export interface TalentJobsMatching {
  queued: boolean;
  hint?: string | null;
}

export type TalentJobListItem = TalentAppliedJob | TalentAvailableJob;

export interface TalentJobsResponse {
  appliedJobs: TalentAppliedJob[];
  availableJobs: TalentAvailableJob[];
  metrics?: TalentJobsMetrics;
  talentGrade?: TalentGrade;
  matching?: TalentJobsMatching;
}

export interface TalentJobCompany {
  id?: string;
  companyName: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  industry?: string | null;
  website?: string | null;
}

export interface TalentJobApplication {
  id: string;
  assessmentId?: string | null;
  currentStage?: TalentJobStage | string | null;
  stageProgress?: number | null;
  appliedAt?: string | null;
  status?: string | null;
}

export interface TalentJobDetail {
  id?: string;
  rolePostingId?: string;
  roleLink?: string;
  roleTitle: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  compensationSummary?: string | null;
  tags?: string[];
  description?: string | null;
  requirements?: string[] | string | null;
  responsibilities?: string[] | string | null;
  skills?: string[] | null;
  experienceLevel?: string | null;
  status: string;
  createdAt?: string;
  publishedAt?: string;
  company?: TalentJobCompany;
  organisationName?: string;
  hasApplied?: boolean;
  isApplied?: boolean;
  application?: TalentJobApplication | null;
  matchScore?: number | null;
  stage?: TalentAppliedJobStage;
  overallScore?: number | null;
  applicantCode?: string | null;
  hrefHint?: string;
}

export interface GateVerdictPart {
  partIndex: number;
  partName: string;
  score: number;
  maxScore: number;
  feedback?: string | null;
  strengths?: string[];
  improvements?: string[];
}

export interface GateVerdictData {
  gate: number;
  overallScore: number;
  passed: boolean;
  isComplete: boolean;
  verdict?: {
    headline?: string;
    summary?: string;
    details?: string;
    actionItems?: string[];
    [key: string]: any;
  } | string | null;
  headline?: string;
  heroTag?: string;
  parts?: GateVerdictPart[];
  nextSteps?: string[];
  unlockedGates?: number[];
  completedAt?: string;
}
