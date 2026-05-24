import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type { ApiResponse } from '../auth/types';

// ==========================================
// TALENT ONBOARDING TYPES & MUTATIONS
// ==========================================
export interface TalentOnboardingStep1Request {
  firstName: string;
  lastName: string;
}

export interface TalentOnboardingStep2Request {
  professionalTitle: string;
  areasOfInterest: string[];
  experienceLevel: string;
  country: string;
  region?: string;
  nationalities: string[];
  countryOfResidence: string;
  residenceCity: string;
  rightToWorkStatus: string;
  willingnessToRelocate: string;
  relocateCountryCodes: string[];
  preferredWorkArrangement: string;
  workAuthorisationConfirmed: boolean;

  studyPermitType?: string;
  studyCountry?: string;
  studyValidity?: string;
  studyHoursManual?: string;
  permitType?: string;
  permitCountry?: string;
  permitValidity?: string;
  prType?: string;
  prCountry?: string;
  prValidity?: string;
}

export interface TalentOnboardingStateResponse {
  step: number;
  fields: Partial<TalentOnboardingStep1Request & TalentOnboardingStep2Request>;
}

export const useTalentOnboardingStep1Mutation = () => {
  return useMutation({
    mutationKey: ['talent-onboarding', 'step-1'],
    mutationFn: (data: TalentOnboardingStep1Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/talent/onboarding/step-1',
        body: data,
        auth: true,
      }),
  });
};

export const useTalentOnboardingStep2Mutation = () => {
  return useMutation({
    mutationKey: ['talent-onboarding', 'step-2'],
    mutationFn: (data: TalentOnboardingStep2Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/talent/onboarding/step-2',
        body: data,
        auth: true,
      }),
  });
};

export const useTalentOnboardingStateQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['talent-onboarding', 'state'],
    queryFn: () =>
      apiClient.get<ApiResponse<TalentOnboardingStateResponse>>({
        url: '/talent/onboarding/state',
        auth: true,
      }),
    enabled,
  });
};

export interface TalentProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle?: string;
}

export const useGetTalentProfileQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['talent', 'profile-me'],
    queryFn: () =>
      apiClient.get<ApiResponse<TalentProfileResponse>>({
        url: '/talent/me',
        auth: true,
      }),
    enabled,
  });
};

export interface MentorProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  professionalTitle?: string;
}

export const useGetMentorProfileQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['mentor', 'profile-me'],
    queryFn: () =>
      apiClient.get<ApiResponse<MentorProfileResponse>>({
        url: '/mentors/me',
        auth: true,
      }),
    enabled,
  });
};

// ==========================================
// MENTOR ONBOARDING TYPES & MUTATIONS
// ==========================================
export interface MentorOnboardingStep1Request {
  title: string;
  professionalTitle?: string;
  firstName: string;
  lastName: string;
}

export interface MentorOnboardingStep2Request {
  primaryExpertise: string[];
  functionalStrength: string[];
  mentorshipFocus: string[];
}

export interface MentorOnboardingStep3Request {
  currentRole: string;
  organization: string;
  yearsOfExperienceBand: string;
  websiteOrPortfolioUrl?: string;
  certifications?: { title: string; docs: string }[];
}

export interface MentorOnboardingStep4Request {
  mentorshipFormat: string[];
  sessionsPerMonth: string;
  preferredSessionLength: string[];
  talentAccess: string[];
  timezone: string;
  preferredLanguage: string;
  regionalEquityPricingEnabled: boolean;
}

export interface MentorOnboardingStep5Request {
  courseIntent: 'explore_later' | 'interested';
  typeOfInterest?: string[];
  preferredFormat?: string;
}

export interface CompleteMentorOnboardingResponse {
  mentorId?: string;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  updatedOnboardingData?: Record<string, unknown>;
}

export interface MentorOnboardingStateResponse {
  step: number;
  onboardingCompleted?: boolean;
  fields: Partial<
    MentorOnboardingStep1Request &
    MentorOnboardingStep2Request &
    MentorOnboardingStep3Request &
    MentorOnboardingStep4Request &
    MentorOnboardingStep5Request
  >;
}

export const useMentorOnboardingStep1Mutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'step-1'],
    mutationFn: (data: MentorOnboardingStep1Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/mentors/onboarding/step-1',
        body: data,
        auth: true,
      }),
  });
};

export const useMentorOnboardingStep2Mutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'step-2'],
    mutationFn: (data: MentorOnboardingStep2Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/mentors/onboarding/step-2',
        body: data,
        auth: true,
      }),
  });
};

export const useMentorOnboardingStep3Mutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'step-3'],
    mutationFn: (data: MentorOnboardingStep3Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/mentors/onboarding/step-3',
        body: data,
        auth: true,
      }),
  });
};

export const useUploadMentorCertificationMutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'upload-certification'],
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<ApiResponse<{ docs: string; originalName: string; mimeType: string; sizeBytes: number; signedUrl: string }>>({
        url: '/documents/mentor-onboarding/certifications',
        body: formData,
        auth: true,
      });
    },
  });
};

export const useMentorOnboardingStep4Mutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'step-4'],
    mutationFn: (data: MentorOnboardingStep4Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/mentors/onboarding/step-4',
        body: data,
        auth: true,
      }),
  });
};

export const useMentorOnboardingStep5Mutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'step-5'],
    mutationFn: (data: MentorOnboardingStep5Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/mentors/onboarding/step-5',
        body: data,
        auth: true,
      }),
  });
};

export const useMentorOnboardingStateQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['mentor-onboarding', 'state'],
    queryFn: () =>
      apiClient.get<ApiResponse<MentorOnboardingStateResponse>>({
        url: '/mentors/onboarding/state',
        auth: true,
        suppressErrorToast: true,
      }),
    enabled: enabled && !!localStorage.getItem('auth_token'),
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 1;
    },
  });
};

export interface CompleteMentorOnboardingRequest {
  bio: string;
  primaryOperatingMarket: string;
  timezone: string;
  weeklyAvailabilityHours?: number;
  maxActiveMentees?: number;
}

export const useCompleteMentorOnboardingMutation = () => {
  return useMutation({
    mutationKey: ['mentor-onboarding', 'complete'],
    mutationFn: (data: CompleteMentorOnboardingRequest) =>
      apiClient.put<ApiResponse<CompleteMentorOnboardingResponse>>({
        url: '/mentors/onboarding',
        body: data,
        auth: true,
      }),
  });
};

// ==========================================
// EMPLOYER ONBOARDING TYPES & MUTATIONS
// ==========================================
export interface EmployerOnboardingStep1Request {
  organisationName: string;
  country: string;
  organisationType: string;
  institutionalMandates: string[];
  fundingModel: string;
  linkedinCompanyUrl?: string;
  websiteUrl?: string;
  isLmic?: boolean;
}

export interface EmployerOnboardingStep2Request {
  primaryWorkTypes: string[];
  workforceModels: string[];
}

export interface EmployerOnboardingStep3Request {
  localProfessionalLicensing: string;
  internationallyLicensedProfessionals: string;
  remoteInternationalEligibleRoles: string;
  relocationWorkPermitsSponsorship: string;
}

export interface EmployerOnboardingStep4Request {
  hiringPriorityRanking: string[];
  experienceDocumentationTypes: string[];
  postPlacementFeedback: string;
}

export interface EmployerOnboardingStateResponse {
  onboardingStep: number;
  onboardingCompleted: boolean;
  fields: Partial<
    EmployerOnboardingStep1Request &
    EmployerOnboardingStep2Request &
    EmployerOnboardingStep3Request &
    EmployerOnboardingStep4Request
  >;
}

export const useEmployerOnboardingStep1Mutation = () => {
  return useMutation({
    mutationKey: ['employer-onboarding', 'step-1'],
    mutationFn: (data: EmployerOnboardingStep1Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/employers/onboarding/step-1',
        body: data,
        auth: true,
      }),
  });
};

export const useEmployerOnboardingStep2Mutation = () => {
  return useMutation({
    mutationKey: ['employer-onboarding', 'step-2'],
    mutationFn: (data: EmployerOnboardingStep2Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/employers/onboarding/step-2',
        body: data,
        auth: true,
      }),
  });
};

export const useEmployerOnboardingStep3Mutation = () => {
  return useMutation({
    mutationKey: ['employer-onboarding', 'step-3'],
    mutationFn: (data: EmployerOnboardingStep3Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/employers/onboarding/step-3',
        body: data,
        auth: true,
      }),
  });
};

export const useEmployerOnboardingStep4Mutation = () => {
  return useMutation({
    mutationKey: ['employer-onboarding', 'step-4'],
    mutationFn: (data: EmployerOnboardingStep4Request) =>
      apiClient.put<ApiResponse<any>>({
        url: '/employers/onboarding/step-4',
        body: data,
        auth: true,
      }),
  });
};

export const useEmployerOnboardingStateQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['employer-onboarding', 'state'],
    queryFn: () =>
      apiClient.get<ApiResponse<EmployerOnboardingStateResponse>>({
        url: '/employers/onboarding/state',
        auth: true,
      }),
    enabled,
  });
};


