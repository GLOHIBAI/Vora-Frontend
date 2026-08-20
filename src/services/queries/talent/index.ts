import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";

export const useGetPublicRoleQuery = (slug: string) => {
  return useQuery({
    queryKey: ["public-role", slug],
    queryFn: () =>
      apiClient.get<any>({ url: `/talent/role/${slug}`, auth: false }),
    enabled: !!slug,
  });
};

export const useGetPreAssessmentReadinessQuery = (
  roleLink: string,
  rolePostingId?: string,
) => {
  return useQuery({
    queryKey: ["pre-assessment-readiness", roleLink, rolePostingId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleLink) params.append("roleLink", roleLink);
      if (rolePostingId) params.append("rolePostingId", rolePostingId);
      return apiClient.get<any>({
        url: `/pre-assessment/readiness?${params.toString()}`,
        auth: true,
      });
    },
    enabled: !!roleLink || !!rolePostingId,
  });
};

export const useUploadCvMutation = () => {
  return useMutation({
    mutationFn: (data: { file: File; roleLink?: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);

      const url = data.roleLink
        ? `/talent/cv?roleLink=${encodeURIComponent(data.roleLink)}`
        : "/talent/cv";

      // Assume apiClient supports FormData when body is FormData
      return apiClient.post<{
        data: { cvUploadId: string; parseStatus: string };
      }>({
        url,
        body: formData as any, // apiClient will likely need to omit Content-Type header so browser sets multipart/form-data
      });
    },
  });
};

/**
 * Job-link match poll (preferred when user applied via role link).
 * Backend: GET /talent/role/{roleLink}/match
 * Poll after GET /talent/role/{roleLink}/cv/status returns readyForMatching + cvLinkedToRole.
 * Returns { status: 'PENDING' | 'READY', overallScore, outcome, matchExplanation, rolePosting, ... }
 */
export const useGetRoleLinkMatchQuery = (
  roleLink: string,
  options?: {
    enabled?: boolean;
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: unknown } }) => number | false);
  },
) => {
  return useQuery({
    queryKey: ["talent", "role-link-match", roleLink],
    queryFn: async () => {
      try {
        return await apiClient.get<any>({
          url: `/talent/role/${encodeURIComponent(roleLink)}/match`,
          auth: true,
          suppressErrorToast: true,
        });
      } catch (error: any) {
        if (error?.status === 404) return { data: { status: "PENDING" } };
        throw error;
      }
    },
    enabled: (options?.enabled ?? true) && !!roleLink,
    refetchInterval: options?.refetchInterval ?? false,
  });
};

/**
 * Fetch the match result for a specific role (generic fallback).
 * Backend: GET /talent/matches/for-role?roleLink=... OR ?rolePostingId=...
 * Returns { status: 'PENDING' | 'READY', overallScore, outcome, geopoliticalEligible, dimensionScores, explanation, ... }
 * Returns 404 while matching is still running treated as PENDING and polled until READY.
 */
export const useGetMatchResultForRoleQuery = (
  params: { roleLink?: string; rolePostingId?: string },
  options?: {
    enabled?: boolean;
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: unknown } }) => number | false);
  },
) => {
  const { roleLink, rolePostingId } = params;
  return useQuery({
    queryKey: ["talent", "match-for-role", roleLink, rolePostingId],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (roleLink) qs.append("roleLink", roleLink);
      if (rolePostingId) qs.append("rolePostingId", rolePostingId);
      try {
        return await apiClient.get<any>({
          url: `/talent/matches/for-role?${qs.toString()}`,
          auth: true,
          suppressErrorToast: true,
        });
      } catch (error: any) {
        if (error?.status === 404) return { status: "PENDING" };
        throw error;
      }
    },
    enabled: options?.enabled ?? (!!roleLink || !!rolePostingId),
    refetchInterval: options?.refetchInterval ?? false,
  });
};

/**
 * Lightweight poll for CV parse status scoped to a specific role link.
 * Backend: GET /talent/role/{roleLink}/cv/status
 * Returns { cvUploadId, parseStatus, readyForMatching, cvLinkedToRole } cheaper than /talent/me.
 * parseStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
 */
export const useGetRoleCvStatusQuery = (
  roleLink: string,
  options?: {
    enabled?: boolean;
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: unknown } }) => number | false);
  },
) => {
  return useQuery({
    queryKey: ["talent", "role-cv-status", roleLink],
    queryFn: () =>
      apiClient.get<any>({
        url: `/talent/role/${encodeURIComponent(roleLink)}/cv/status`,
        auth: true,
        suppressErrorToast: true,
      }),
    enabled: (options?.enabled ?? true) && !!roleLink,
    refetchInterval: options?.refetchInterval ?? false,
  });
};

export const useSubmitPreAssessmentSubmissionMutation = () => {
  return useMutation({
    mutationFn: (data: {
      file: File;
      documentType: string;
      roleLink?: string;
      rolePostingId?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("documentType", data.documentType);

      const params = new URLSearchParams();
      if (data.roleLink) params.append("roleLink", data.roleLink);
      if (data.rolePostingId)
        params.append("rolePostingId", data.rolePostingId);

      return apiClient.post<any>({
        url: `/pre-assessment/submissions?${params.toString()}`,
        body: formData as any,
        auth: true,
      });
    },
  });
};

export const useUpdatePreAssessmentTextResponseMutation = () => {
  return useMutation({
    mutationFn: (data: {
      text: string;
      roleLink?: string;
      rolePostingId?: string;
    }) => {
      return apiClient.put<any>({
        url: "/pre-assessment/text-response",
        body: data,
        auth: true,
      });
    },
  });
};

export const useUpdatePreAssessmentReferencesMutation = () => {
  return useMutation({
    mutationFn: (data: {
      references: Array<{
        fullName: string;
        roleAndOrganisation: string;
        email: string;
        phone?: string;
        relationship: string;
      }>;
      roleLink?: string;
      rolePostingId?: string;
    }) => {
      const mappedReferences = data.references.map((ref) => ({
        fullName: ref.fullName,
        roleOrganisation: ref.roleAndOrganisation,
        email: ref.email,
        phone: ref.phone || undefined,
        type:
          ref.relationship === "manager" ? "line_manager" : "peer_or_community",
      }));

      return apiClient.put<any>({
        url: "/pre-assessment/references",
        body: {
          ...data,
          references: mappedReferences,
        },
        auth: true,
      });
    },
  });
};

export const useUpdatePreAssessmentLinksMutation = () => {
  return useMutation({
    mutationFn: (data: {
      urls: string[];
      roleLink?: string;
      rolePostingId?: string;
    }) => {
      return apiClient.put<any>({
        url: "/pre-assessment/links",
        body: data,
        auth: true,
      });
    },
  });
};export const useUpdatePreAssessmentConsentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      roleLink?: string;
      rolePostingId?: string;
      truthfulWork: boolean;
      dataUseConsent: boolean;
      referencesStage4: boolean;
    }) => {
      return apiClient.put<any>({
        url: "/pre-assessment/consents",
        body: data,
        auth: true,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pre-assessment-readiness", variables.roleLink, variables.rolePostingId],
      });
    },
  });
};


export const useCompletePreAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      roleLink?: string;
      rolePostingId?: string;
      consents: {
        truthfulWork: boolean;
        dataUseConsent: boolean;
        referencesStage4: boolean;
      };
    }) => {
      const params = new URLSearchParams();
      if (data.roleLink) params.append("roleLink", data.roleLink);
      if (data.rolePostingId)
        params.append("rolePostingId", data.rolePostingId);

      return apiClient.post<any>({
        url: `/pre-assessment/complete?${params.toString()}`,
        body: data.consents,
        auth: true,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pre-assessment-readiness", variables.roleLink, variables.rolePostingId],
      });
    },
  });
};


export const useBeginAssessmentMutation = () => {
  return useMutation({
    mutationFn: async (data: { rolePostingId: string }) => {
      return apiClient.post<{
        data?: { assessmentId?: string; id?: string };
        assessmentId?: string;
        id?: string;
      }>({
        url: "/assessments/begin",
        body: { rolePostingId: data.rolePostingId },
        auth: true,
      });
    },
  });
};

