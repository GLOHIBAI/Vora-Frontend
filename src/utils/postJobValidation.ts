import { validatePortfolioUrl } from './validation';
import { parseISODate, toISODate } from './date';
import { validateTimeCommitmentHours } from './numericInput';

export type FieldErrors = Record<string, string>;

const todayISO = () => toISODate(new Date());

export const validateRequired = (value: string, label: string): string => {
  if (!value?.trim()) return `${label} is required`;
  return '';
};

export const validatePositiveInt = (
  value: string,
  label: string,
  min = 1,
  max = 500
): string => {
  if (!value?.trim()) return `${label} is required`;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < min) return `${label} must be at least ${min}`;
  if (n > max) return `${label} must be ${max} or fewer`;
  return '';
};

export const validateMinLength = (value: string, label: string, min: number): string => {
  if (!value?.trim()) return `${label} is required`;
  if (value.trim().length < min) return `${label} must be at least ${min} characters`;
  return '';
};

export const validateFutureDate = (iso: string, label: string): string => {
  const required = validateRequired(iso, label);
  if (required) return required;
  const date = parseISODate(iso);
  if (!date) return `Enter a valid ${label.toLowerCase()}`;
  const today = parseISODate(todayISO());
  if (today && date < today) return `${label} must be today or in the future`;
  return '';
};

export const validateDateAfter = (
  iso: string,
  afterIso: string,
  label: string,
  afterLabel: string
): string => {
  if (!iso?.trim()) return '';
  const date = parseISODate(iso);
  const after = parseISODate(afterIso);
  if (!date || !after) return `Enter a valid ${label.toLowerCase()}`;
  if (date <= after) return `${label} must be after ${afterLabel.toLowerCase()}`;
  return '';
};

export type RangeFieldKeys = { min: string; max: string };

export const isValidAmountRange = (min: string, max: string): boolean => {
  const mn = parseFloat(min);
  const mx = parseFloat(max);
  return !Number.isNaN(mn) && !Number.isNaN(mx) && mn > 0 && mx > 0 && mx > mn;
};

export const validateSalaryRange = (
  min: string,
  max: string,
  keys: RangeFieldKeys = { min: 'salMin', max: 'salMax' },
): FieldErrors => {
  const errors: FieldErrors = {};
  const minErr = validateRequired(min, 'Minimum compensation');
  const maxErr = validateRequired(max, 'Maximum compensation');
  if (minErr) errors[keys.min] = minErr;
  if (maxErr) errors[keys.max] = maxErr;
  if (!minErr && !maxErr) {
    const mn = parseFloat(min);
    const mx = parseFloat(max);
    if (Number.isNaN(mn) || mn <= 0) errors[keys.min] = 'Enter a valid minimum amount';
    if (Number.isNaN(mx) || mx <= 0) errors[keys.max] = 'Enter a valid maximum amount';
    if (!errors[keys.min] && !errors[keys.max] && mx <= mn) {
      errors[keys.max] = 'Maximum must be greater than minimum';
    }
  }
  return errors;
};

export const validatePositiveAmount = (value: string, label: string): string => {
  const required = validateRequired(value, label);
  if (required) return required;
  const n = parseFloat(value);
  if (Number.isNaN(n) || n <= 0) return `Enter a valid ${label.toLowerCase()}`;
  return '';
};

const MAX_JD_BYTES = 10 * 1024 * 1024;
const ALLOWED_JD_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_JD_EXT = /\.(pdf|doc|docx)$/i;

export const validateJobDocumentFile = (file: File | null): string => {
  if (!file) return '';
  if (file.size > MAX_JD_BYTES) return 'File must be 10 MB or smaller';
  const typeOk =
    ALLOWED_JD_TYPES.includes(file.type) || ALLOWED_JD_EXT.test(file.name);
  if (!typeOk) return 'Only PDF, DOC, or DOCX files are allowed';
  return '';
};

export type UploadedJobDocument = File | { name: string; size: string } | null;

export interface PostJobModalValues {
  hireMode: 'live' | 'vault' | null;
  goLiveDate: string;
  fillMethod: 'upload' | 'manual' | null;
  uploadedFile: UploadedJobDocument;
  documentLink: string;
}

export function validatePostJobModal(values: PostJobModalValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.hireMode) {
    errors.hireMode = 'Choose when you want to hire';
    return errors;
  }

  if (values.hireMode === 'vault') {
    const goLiveErr = validateFutureDate(values.goLiveDate, 'Go-live date');
    if (goLiveErr) errors.goLiveDate = goLiveErr;
  }

  if (!values.fillMethod) {
    errors.fillMethod = 'Choose how to fill in the role details';
    return errors;
  }

  if (values.fillMethod === 'upload') {
    const hasFile = values.uploadedFile !== null;
    const link = values.documentLink.trim();
    if (!hasFile && !link) {
      errors.document = 'Upload a file or paste a document link';
    } else if (link) {
      const urlErr = validatePortfolioUrl(link);
      if (urlErr) errors.documentLink = urlErr;
    } else if (values.uploadedFile instanceof File) {
      const fileErr = validateJobDocumentFile(values.uploadedFile);
      if (fileErr) errors.document = fileErr;
    }
  }

  return errors;
}

export interface PostJobStep1Values {
  roleType: string;
  roleTitle: string;
  level: string;
  positions: string;
  timeCommitment: string;
  workFormat: string;
  location: string;
  selectedTimezoneRegions: string[];
  selectedTimezones: string[];
  startDate: string;
  endDate: string;
  summary: string;
  internationalPolicy: string;
  isScheduled: boolean;
  goLiveDate: string;
}

export function validatePostJobStep1(v: PostJobStep1Values): FieldErrors {
  const errors: FieldErrors = {};

  const checks: [string, string, string][] = [
    ['roleType', v.roleType, 'Role type'],
    ['roleTitle', v.roleTitle, 'Role title'],
    ['level', v.level, 'Employment level'],
    ['workFormat', v.workFormat, 'Work format'],
    ['startDate', v.startDate, 'Start date'],
    ['summary', v.summary, 'Role summary'],
    ['internationalPolicy', v.internationalPolicy, 'International candidate policy'],
  ];

  for (const [key, val, label] of checks) {
    const err =
      key === 'roleTitle'
        ? validateMinLength(val, label, 3)
        : key === 'summary'
          ? validateMinLength(val, label, 20)
          : key === 'roleType' && val === 'other'
            ? 'Specify custom role type'
            : validateRequired(val, label);
    if (err) errors[key] = err;
  }

  const timeErr = validateTimeCommitmentHours(v.timeCommitment);
  if (timeErr) errors.timeCommitment = timeErr;

  const posErr = validatePositiveInt(v.positions, 'Available positions', 1, 999);
  if (posErr) errors.positions = posErr;

  const needsLocation =
    v.workFormat === 'Fully onsite' || v.workFormat === 'Hybrid';
  if (needsLocation) {
    const locErr = validateRequired(v.location, 'Work location');
    if (locErr) errors.location = locErr;
  }

  const needsTimezone =
    v.workFormat === 'Remote - specific timezone(s) required' ||
    v.workFormat === 'Hybrid' ||
    v.workFormat === 'Flexible / candidate preference';

  if (
    needsTimezone &&
    v.selectedTimezones.length === 0 &&
    v.selectedTimezoneRegions.length === 0
  ) {
    errors.selectedTimezones =
      'Select at least one timezone or use a region shortcut';
  }

  if (v.endDate?.trim()) {
    const endErr = validateDateAfter(v.endDate, v.startDate, 'End date', 'start date');
    if (endErr) errors.endDate = endErr;
  }

  if (v.isScheduled) {
    const goLiveErr = validateFutureDate(v.goLiveDate, 'Go-live date');
    if (goLiveErr) errors.goLiveDate = goLiveErr;
  }

  return errors;
}

export interface PostJobStep2Values {
  roleGoal: string;
  coreResponsibilities: string;
  technicalSkills: string[];
  tools: string[];
  languages: string[];
}

export function validatePostJobStep2(v: PostJobStep2Values): FieldErrors {
  const errors: FieldErrors = {};

  const goalErr = validateMinLength(v.roleGoal, 'Role goal / problem to solve', 20);
  if (goalErr) errors.roleGoal = goalErr;

  const respErr = validateMinLength(v.coreResponsibilities, 'Core responsibilities', 20);
  if (respErr) errors.coreResponsibilities = respErr;

  if (v.technicalSkills.length === 0) {
    errors.technicalSkills = 'Select at least one technical skill';
  }
  if (v.tools.length === 0) errors.tools = 'Select at least one tool or software';
  if (v.languages.length === 0) errors.languages = 'Select at least one language';

  return errors;
}

export interface PostJobStep3Values {
  experienceYears: string;
  experienceTypes: string[];
  minQualification: string;
  sectorBackground: string[];
  eligibilityIntPolicy: string;
}

export function validatePostJobStep3(v: PostJobStep3Values): FieldErrors {
  const errors: FieldErrors = {};

  const yearsErr = validateRequired(v.experienceYears, 'Years of experience');
  if (yearsErr) errors.experienceYears = yearsErr;

  if (v.experienceTypes.length === 0) {
    errors.experienceTypes = 'Select at least one type of experience';
  }

  if (v.sectorBackground.length === 0) {
    errors.sectorBackground = 'Select at least one sector background';
  }

  const qualErr = validateRequired(v.minQualification, 'Minimum qualification');
  if (qualErr) errors.minQualification = qualErr;

  const policyErr = validateRequired(
    v.eligibilityIntPolicy,
    'International candidate policy'
  );
  if (policyErr) errors.eligibilityIntPolicy = policyErr;

  return errors;
}

export interface PostJobStep4Values {
  preferredWorkingStyle: string[];
  communicationRhythm: string[];
  primaryLanguage: string;
  personalityTraits: string[];
  workEnvironment: string[];
}

export function validatePostJobStep4(v: PostJobStep4Values): FieldErrors {
  const errors: FieldErrors = {};

  if (v.preferredWorkingStyle.length === 0) {
    errors.preferredWorkingStyle = 'Select at least one working style';
  }

  if (v.communicationRhythm.length === 0) {
    errors.communicationRhythm = 'Select at least one communication rhythm';
  }

  const langErr = validateRequired(v.primaryLanguage, 'Primary working language');
  if (langErr) errors.primaryLanguage = langErr;

  if (v.personalityTraits.length === 0) {
    errors.personalityTraits = 'Select at least one personality trait';
  }
  if (v.workEnvironment.length === 0) {
    errors.workEnvironment = 'Select at least one work environment descriptor';
  }

  return errors;
}

export type CompType = 'sal' | 'con' | 'sti' | 'unp' | 'phd' | 'uni';

export interface PostJobStep5Values {
  compType: CompType;
  salCur: string;
  conCur: string;
  stiCur: string;
  phdCur: string;
  uniCur: string;
  salMin: string;
  salMax: string;
  conMin: string;
  conMax: string;
  stiVal: string;
  phdVal: string;
  uniTuition: string;
  uniProg: string;
  positions: string;
  uniStudentCount: string;
  conDuration: number;
  stiDuration: number;
  durationPreset: string;
  expenses: string;
  internalNotes: string;
  jdFile: File | null;
}

export function validatePostJobStep5(v: PostJobStep5Values): FieldErrors {
  const errors: FieldErrors = {};

  switch (v.compType) {
    case 'sal':
      Object.assign(errors, validateSalaryRange(v.salMin, v.salMax));
      break;
    case 'con':
      Object.assign(errors, validateSalaryRange(v.conMin, v.conMax, { min: 'conMin', max: 'conMax' }));
      if (!errors.conMin && !errors.conMax && v.conDuration < 1) {
        errors.conDuration = 'Enter a valid contract duration';
      }
      break;
    case 'sti': {
      const stiErr = validatePositiveAmount(v.stiVal, 'Stipend amount');
      if (stiErr) errors.stiVal = stiErr;
      break;
    }
    case 'phd': {
      const phdErr = validatePositiveAmount(v.phdVal, 'Annual stipend');
      if (phdErr) errors.phdVal = phdErr;
      break;
    }
    case 'uni': {
      const progErr = validateRequired(v.uniProg, 'Programme');
      if (progErr) errors.uniProg = progErr;
      const tuitionErr = validatePositiveAmount(v.uniTuition, 'Annual tuition');
      if (tuitionErr) errors.uniTuition = tuitionErr;
      const placesErr = validatePositiveInt(v.uniStudentCount, 'Student places', 1, 500);
      if (placesErr) errors.uniStudentCount = placesErr;
      break;
    }
    case 'unp':
      break;
    default:
      break;
  }

  if (['sal', 'con', 'sti'].includes(v.compType)) {
    const posErr = validatePositiveInt(v.positions, 'Number of positions', 1, 50);
    if (posErr) errors.positions = posErr;
  }

  if (v.jdFile) {
    const fileErr = validateJobDocumentFile(v.jdFile);
    if (fileErr) errors.jdFile = fileErr;
  }

  return errors;
}

export function validatePostJobStep(
  step: number,
  values: {
    step1: PostJobStep1Values;
    step2: PostJobStep2Values;
    step3: PostJobStep3Values;
    step4: PostJobStep4Values;
    step5: PostJobStep5Values;
  }
): FieldErrors {
  switch (step) {
    case 1:
      return validatePostJobStep1(values.step1);
    case 2:
      return validatePostJobStep2(values.step2);
    case 3:
      return validatePostJobStep3(values.step3);
    case 4:
      return validatePostJobStep4(values.step4);
    case 5:
      return validatePostJobStep5(values.step5);
    case 6:
      return {
        ...validatePostJobStep1(values.step1),
        ...validatePostJobStep2(values.step2),
        ...validatePostJobStep3(values.step3),
        ...validatePostJobStep4(values.step4),
        ...validatePostJobStep5(values.step5),
      };
    default:
      return {};
  }
}

export const firstValidationMessage = (errors: FieldErrors): string | null => {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : null;
};
