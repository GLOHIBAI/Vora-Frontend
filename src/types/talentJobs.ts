export type TalentJobStage = 'GATE_1' | 'GATE_2' | 'GATE_3' | 'HIRED' | 'REJECTED';

export interface TalentJobListItem {
  id: string;
  roleTitle: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  status: string;
  createdAt: string;
  companyName: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  matchScore?: number | null;
  currentStage?: TalentJobStage | string | null;
  stageProgress?: number | null;
  assessmentId?: string | null;
  appliedAt?: string | null;
}

export interface TalentJobsResponse {
  appliedJobs: TalentJobListItem[];
  availableJobs: TalentJobListItem[];
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
  id: string;
  roleTitle: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  description?: string | null;
  requirements?: string[] | string | null;
  responsibilities?: string[] | string | null;
  skills?: string[] | null;
  experienceLevel?: string | null;
  status: string;
  createdAt: string;
  company: TalentJobCompany;
  hasApplied: boolean;
  application: TalentJobApplication | null;
  matchScore?: number | null;
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
