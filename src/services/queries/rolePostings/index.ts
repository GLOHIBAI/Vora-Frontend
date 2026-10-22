import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api';
import type { ApiResponse } from '../auth/types';
import type {
  CreateRolePostingIntakeRequest,
  RolePostingIntakeData,
  RolePostingStepFiveData,
  RolePostingStepFourData,
  RolePostingStepOneData,
  RolePostingStepThreeData,
  RolePostingStepTwoData,
  UpdateRolePostingStepFiveRequest,
  UpdateRolePostingStepFourRequest,
  UpdateRolePostingStepOneRequest,
  UpdateRolePostingStepThreeRequest,
  UpdateRolePostingStepTwoRequest,
  RolePostingPrefillData,
  RolePostingIntakeDocumentResponse,
} from '../../../types/rolePosting';

export const rolePostingKeys = {
  all: ['role-postings'] as const,
  intake: () => [...rolePostingKeys.all, 'intake'] as const,
  stepOne: (id: string) => [...rolePostingKeys.all, id, 'step-1'] as const,
  stepTwo: (id: string) => [...rolePostingKeys.all, id, 'step-2'] as const,
  stepThree: (id: string) => [...rolePostingKeys.all, id, 'step-3'] as const,
  stepFour: (id: string) => [...rolePostingKeys.all, id, 'step-4'] as const,
  stepFive: (id: string) => [...rolePostingKeys.all, id, 'step-5'] as const,
  detail: (id: string) => [...rolePostingKeys.all, id, 'detail'] as const,
  prefill: (id: string) => [...rolePostingKeys.all, id, 'jd-prefill'] as const,
};

export const useGetRolePostingQuery = (
  id: string,
  options?: { refetchInterval?: number | false | ((data: any) => number | false); enabled?: boolean }
) => {
  return useQuery({
    queryKey: rolePostingKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiResponse<RolePostingIntakeData>>({
        url: `/role-postings/${id}`,
        auth: true,
      }),
    ...options,
  });
};

export const useGetRolePostingPrefillQuery = (id: string, options?: { refetchInterval?: number | false | ((data: any) => number | false); enabled?: boolean }) => {
  return useQuery({
    queryKey: rolePostingKeys.prefill(id),
    queryFn: () =>
      apiClient.get<ApiResponse<RolePostingPrefillData>>({
        url: `/role-postings/${id}/jd-prefill`,
        auth: true,
      }),
    ...options,
  });
};

export const useUploadRolePostingIntakeDocumentMutation = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<ApiResponse<RolePostingIntakeDocumentResponse>>({
        url: '/role-postings/intake/job-description',
        body: formData,
        auth: true,
      });
    },
  });
};

export const useCreateRolePostingIntakeMutation = () => {
  return useMutation({
    mutationKey: rolePostingKeys.intake(),
    mutationFn: (body: CreateRolePostingIntakeRequest) =>
      apiClient.post<ApiResponse<RolePostingIntakeData>>({
        url: '/role-postings',
        body,
        auth: true,
      }),
  });
};

export const useUpdateRolePostingStepOneMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateRolePostingStepOneRequest;
    }) =>
      apiClient.put<ApiResponse<RolePostingStepOneData>>({
        url: `/role-postings/${id}/step-1`,
        body,
        auth: true,
      }),
  });
};

export const useUpdateRolePostingStepTwoMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateRolePostingStepTwoRequest;
    }) =>
      apiClient.put<ApiResponse<RolePostingStepTwoData>>({
        url: `/role-postings/${id}/step-2`,
        body,
        auth: true,
      }),
  });
};

export const useUpdateRolePostingStepThreeMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateRolePostingStepThreeRequest;
    }) =>
      apiClient.put<ApiResponse<RolePostingStepThreeData>>({
        url: `/role-postings/${id}/step-3`,
        body,
        auth: true,
      }),
  });
};

export const useUpdateRolePostingStepFourMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateRolePostingStepFourRequest;
    }) =>
      apiClient.put<ApiResponse<RolePostingStepFourData>>({
        url: `/role-postings/${id}/step-4`,
        body,
        auth: true,
      }),
  });
};

export const useUpdateRolePostingStepFiveMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      body,
      jobDescriptionFile,
    }: {
      id: string;
      body: UpdateRolePostingStepFiveRequest;
      jobDescriptionFile?: File | null;
    }) => {
      if (jobDescriptionFile) {
        const formData = new FormData();
        formData.append('payload', JSON.stringify(body));
        formData.append('jobDescriptionFile', jobDescriptionFile);
        return apiClient.put<ApiResponse<RolePostingStepFiveData>>({
          url: `/role-postings/${id}/step-5`,
          body: formData,
          auth: true,
        });
      }

      return apiClient.put<ApiResponse<RolePostingStepFiveData>>({
        url: `/role-postings/${id}/step-5`,
        body,
        auth: true,
      });
    },
  });
};

export const useVaultPreQualifiedCountQuery = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['role-postings', id, 'vault', 'pre-qualified-count'],
    queryFn: () =>
      apiClient.get<ApiResponse<{ count: number }>>({
        url: `/role-postings/${id}/vault/pre-qualified-count`,
        auth: true,
      }),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
};

export const useEditVaultRoleMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string;
      changes: Record<string, any>;
    }) =>
      apiClient.patch<ApiResponse<any>>({
        url: `/role-postings/${id}/vault/edit`,
        body: { changes },
        auth: true,
      }),
  });
};

export const useCancelVaultRoleMutation = () => {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiResponse<any>>({
        url: `/role-postings/${id}/vault`,
        auth: true,
      }),
  });
};

export const useUpdateVaultCompetenciesMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      competencies,
      minReadinessThreshold,
    }: {
      id: string;
      competencies: Array<{ name: string; weight: number; level?: string; isRequired?: boolean }>;
      minReadinessThreshold?: number;
    }) =>
      apiClient.put<ApiResponse<any>>({
        url: `/role-postings/${id}/vault/competencies`,
        body: { competencies, minReadinessThreshold },
        auth: true,
      }),
  });
};

