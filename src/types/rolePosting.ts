export type RolePostingHiringMode = 'LIVE_NOW' | 'VAULT';
export type RolePostingFillMethod = 'MANUAL' | 'JD_UPLOAD';
export type RolePostingStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'VAULT'
  | 'LIVE'
  | 'CLOSED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface CreateRolePostingIntakeRequest {
  hiringMode: RolePostingHiringMode;
  fillMethod: RolePostingFillMethod;
  vaultGoLiveDate?: string;
  jobDescriptionDocumentId?: string;
}

export type RoleDocumentParseStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RolePostingJobDescription {
  id: string;
  originalName: string;
  jdParseStatus: RoleDocumentParseStatus;
}

export interface RolePostingIntakeDocumentResponse {
  document: RolePostingJobDescription;
}

export interface RolePostingIntakeData {
  id: string;
  status: RolePostingStatus;
  /** API may return a number or progress string such as `"2/5"`. */
  currentStep: number | string;
  hiringMode: RolePostingHiringMode;
  fillMethod: RolePostingFillMethod;
  vaultMode: boolean;
  vaultGoLiveDate?: string | null;
  scheduledGoLiveDate?: string | null;
  vaultEditCount?: number;
  vaultEditsRemaining?: number;
  editsUsed?: number;
  editsRemaining?: number;
  jobDescription?: RolePostingJobDescription;
  createdAt: string;
  updatedAt: string;
}

export interface PostJobContinueConfig {
  isScheduled: boolean;
  goLiveDate: string;
  isPrefilled: boolean;
  rolePostingId: string;
  /** Wizard step; may be stored as a number or API progress string (e.g. `"2/5"`). */
  currentStep: number | string;
  hiringMode: RolePostingHiringMode;
  fillMethod: RolePostingFillMethod;
}

export interface RolePostingDraftSession {
  id: string;
  hiringMode: RolePostingHiringMode;
  fillMethod: RolePostingFillMethod;
  isScheduled: boolean;
  goLiveDate: string;
  isPrefilled: boolean;
  currentStep: number | string;
}

export type EmploymentLevel =
  | 'STUDENT_GRADUATE'
  | 'ENTRY'
  | 'MID'
  | 'SENIOR'
  | 'EXECUTIVE';

export type WorkFormat =
  | 'FULLY_ONSITE'
  | 'HYBRID'
  | 'REMOTE_TIMEZONE'
  | 'REMOTE_NO_TIMEZONE'
  | 'FLEXIBLE';

export interface UpdateRolePostingStepOneRequest {
  advanceStep: boolean;
  roleTitle: string;
  roleType: string;
  employmentLevel: EmploymentLevel;
  positionsAvailable: number;
  timeCommitment?: string;
  startDate: string;
  closingDate?: string;
  roleSummary: string;
  internationalTalentPolicy: string;
  workFormat: WorkFormat;
  workLocationPrimary: string;
  additionalHiringLocations?: string[];
  timezoneRegions?: string[];
  timezoneRequirements?: string[];
  securityClearanceRequirement?: string;
  workPermitTypesAccepted?: string[];
  scheduledHiringEnabled?: boolean;
  scheduledGoLiveDate?: string;
}

export interface PreAssessmentRequirement {
  documentType: string;
  description?: string;
  isRequired?: boolean;
}

export interface UpdateRolePostingStepTwoRequest {
  advanceStep: boolean;
  roleGoal: string;
  coreResponsibilities: string;
  technicalSkills?: string[];
  toolsRequired?: string[];
  languageRequirements?: string[];
  preAssessmentRequirements?: PreAssessmentRequirement[];
  preAssessmentDocumentTypes?: string[];
}

export interface RolePostingStepTwoData {
  id: string;
  status: RolePostingStatus;
  currentStep: number | string;
  roleGoal?: string;
  coreResponsibilities?: string;
  technicalSkills?: string[];
  toolsRequired?: string[];
  languageRequirements?: string[];
  preAssessmentDocumentTypes?: string[];
}

export interface UpdateRolePostingStepThreeRequest {
  advanceStep: boolean;
  yearsExperienceRequired: string;
  typeOfExperience: string[];
  minimumQualification: string;
  preferredQualifications?: string;
  sectorBackground: string[];
  geographicExperience?: string[];
  publicationsRequired?: string;
  budgetManagementRequired?: string;
  teamManagementRequired?: string;
  internationalTalentPolicy: string;
  securityClearanceRequirement?: string;
  preferredTalentProfile?: string;
}

export interface RolePostingStepThreeData {
  id: string;
  status: RolePostingStatus;
  currentStep: number | string;
  yearsExperienceRequired?: string;
  typeOfExperience?: string[];
  minimumQualification?: string;
  preferredQualifications?: string;
  sectorBackground?: string[];
  geographicExperience?: string[];
  publicationsRequired?: string;
  budgetManagementRequired?: string;
  teamManagementRequired?: string;
  internationalTalentPolicy?: string;
  securityClearanceRequirement?: string;
  preferredTalentProfile?: string;
}

export interface UpdateRolePostingStepFourRequest {
  advanceStep: boolean;
  preferredWorkingStyle: string[];
  communicationRhythm: string[];
  primaryWorkingLanguage: string;
  personalityTraits: string[];
  workEnvironmentDescriptors: string[];
  teamCultureFreeText: string;
}

export interface RolePostingStepFourData {
  id: string;
  status: RolePostingStatus;
  currentStep: number | string;
  preferredWorkingStyle?: string[];
  communicationRhythm?: string[];
  primaryWorkingLanguage?: string;
  personalityTraits?: string[];
  workEnvironmentDescriptors?: string[];
  teamCultureFreeText?: string;
}

export type CompensationType =
  | 'SALARIED'
  | 'CONTRACT_DAILY_RATE'
  | 'GIG_PROJECT'
  | 'STIPEND_FELLOWSHIP'
  | 'UNPAID_FLAT_FEE'
  | 'FUNDED_PHD'
  | 'UNIVERSITY_ADMISSIONS';

export type CompensationProgrammeType =
  | 'MSC'
  | 'MPH'
  | 'UNDERGRADUATE'
  | 'SHORT_COURSE'
  | 'PHD'
  | 'OTHER';

export interface UpdateRolePostingStepFiveRequest {
  advanceStep: boolean;
  compensationType: CompensationType;
  compensationCurrency: string;
  positionsAvailable?: number;
  salaryMin?: number;
  salaryMax?: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  dailyRate?: number;
  contractDurationMonths?: number;
  totalContractValue?: number;
  stipendValue?: string;
  yearOneStipend?: number;
  programmeType?: CompensationProgrammeType;
  annualTuitionValue?: number;
  expensesAllowancesBenefits?: string;
  isOpenEnded?: boolean;
  internalNotes?: string;
  jobDescriptionDocumentId?: string;
}

export interface RolePostingStepFiveData {
  id: string;
  status: RolePostingStatus;
  currentStep: number | string;
  compensationType?: CompensationType;
  compensationCurrency?: string;
  positionsAvailable?: number;
  salaryMin?: number;
  salaryMax?: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  dailyRate?: number;
  contractDurationMonths?: number;
  totalContractValue?: number;
  stipendValue?: string;
  yearOneStipend?: number;
  programmeType?: CompensationProgrammeType;
  annualTuitionValue?: number;
  expensesAllowancesBenefits?: string;
  isOpenEnded?: boolean;
  internalNotes?: string;
  jobDescriptionDocumentId?: string;
}

export interface RolePostingStepOneData extends RolePostingIntakeData {
  roleTitle?: string | null;
  roleType?: string | null;
  employmentLevel?: EmploymentLevel | null;
  positionsAvailable?: number | null;
  timeCommitment?: string | null;
  workFormat?: WorkFormat | null;
  workLocationPrimary?: string | null;
  workLocationCity?: string | null;
  workLocationCountry?: string | null;
  additionalHiringLocations?: string[];
  timezoneRegions?: string[];
  timezoneRequirements?: string[];
  startDate?: string | null;
  closingDate?: string | null;
  roleSummary?: string | null;
  internationalTalentPolicy?: string | null;
  securityClearanceRequirement?: string | null;
  workPermitTypesAccepted?: string[];
  scheduledHiringEnabled: boolean;
  scheduledGoLiveDate?: string | null;
}

export interface RolePostingPrefillData
  extends Omit<Partial<RolePostingStepOneData>, 'positionsAvailable' | 'internationalTalentPolicy' | 'securityClearanceRequirement'>,
    Partial<RolePostingStepTwoData>,
    Partial<RolePostingStepThreeData>,
    Partial<RolePostingStepFourData>,
    Partial<RolePostingStepFiveData> {}
