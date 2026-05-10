import React from 'react';

// =============================================
// COMMON COMPONENT TYPES
// =============================================

export interface Option {
  label: string;
  value: string;
  italic?: boolean;
}

export interface OptionGroup {
  label: string;
  options: Option[];
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'social';
  fullWidth?: boolean;
  pill?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showPasswordToggle?: boolean;
  error?: boolean;
  helperText?: string;
}

export interface SelectProps {
  label: string;
  name?: string;
  options?: Option[];
  groups?: OptionGroup[];
  value?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  hint?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
}

export interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  className?: string;
}

export interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export interface NationalityTaggerProps {
  label: string;
  hint?: string;
  selected: string[];
  onChange: (nationalities: string[]) => void;
  options: string[];
  popularOptions?: string[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

// =============================================
// ONBOARDING DATA TYPES
// =============================================

export interface StudyHoursInfo {
  term: string;
  holidays: string;
}

export type StudyHoursMap = Record<string, StudyHoursInfo>;

// =============================================
// MENTOR TYPES
// =============================================

export interface MentorPersonalInfo {
  title: string;
  lastName: string;
  firstName: string;
  email: string;
  professionalTitle: string;
  password?: string;
  confirmPassword?: string;
}

export interface MentorExpertiseInfo {
  primaryExpertise: string[];
  functionalStrength: string[];
  mentorshipFocus: string[];
}

export interface MentorCertificate {
  id: string;
  type: string;
  displayLabel: string;
  files: File[];
}

export interface MentorExperienceInfo {
  currentRole: string;
  organization: string;
  yearsOfExperience: string;
  websitePortfolio: string;
}

export interface MentorAvailabilityInfo {
  mentorshipFormat: string[];
  sessionsPerMonth: string;
  sessionLength: string[];
  candidateAccess: string[];
  timezone: string;
  preferredLanguage: string;
  regionalEquityPricing: boolean;
}

export interface MentorCourseDetails {
  courseType: string[];
  preferredFormat: string;
}

// =============================================
// TALENT TYPES
// =============================================

export interface TalentPersonalInfo {
  firstName: string;
  lastName: string;
}

export interface TalentProfileInfo {
  professionalTitle: string;
  areasOfInterest: string[];
  experienceLevel: string;
  country: string;
}

export interface TalentWorkAuthInfo {
  nationalities: string[];
  residence: string;
  city: string;
  rightToWork: string;
  relocation: string;
  relocationDestinations: string;
  workArrangement: string;
  integrityChecked: boolean;
}

export interface TalentStudyPermitInfo {
  type: string;
  country: string;
  validity: string;
  hoursManual: string;
}

export interface TalentWorkPermitInfo {
  type: string;
  country: string;
  validity: string;
}

export interface TalentPRInfo {
  type: string;
  country: string;
  validity: string;
}

// =============================================
// AUTH TYPES
// =============================================

export interface AuthData {
  email: string;
  password?: string;
  accountType?: string;
}

// =============================================
// EMPLOYER TYPES
// =============================================

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
