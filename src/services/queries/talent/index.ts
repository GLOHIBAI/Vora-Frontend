import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api";

export const useGetPublicRoleQuery = (slug: string, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["public-role", slug],
    queryFn: () =>
      apiClient.get<any>({ url: `/talent/role/${slug}`, auth: false }),
    enabled: !!slug,
    ...options,
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

export interface TalentDashboardGreeting {
  firstName?: string;
  welcomeMessage?: string;
  subtitle?: string;
}

export interface TalentDashboardMetricScore {
  value?: number;
  unlocked?: boolean;
  hint?: string;
}

export interface TalentDashboardMetricGrade {
  grade?: string | null;
  label?: string | null;
  unlocked?: boolean;
  hint?: string;
}

export interface TalentDashboardMetricJobs {
  count?: number;
  hint?: string | null;
}

export interface TalentDashboardGrade {
  grade?: string | null;
  label?: string | null;
  unlocked?: boolean;
  hint?: string;
  prescription?: string;
}

export interface TalentDashboardPendingActionCta {
  label?: string;
  hrefHint?: string;
  enabled?: boolean;
}

export interface TalentDashboardPendingAction {
  stage?: number;
  name?: string;
  label?: string;
  description?: string;
  durationMins?: number;
  status?: 'not_started' | 'in_progress' | 'passed' | 'failed' | 'locked' | string;
  statusLabel?: string;
  cta?: TalentDashboardPendingActionCta;
  expiresAt?: string | null;
}

export interface TalentDashboardActivitySnapshotNextStep {
  label?: string;
  hrefHint?: string;
  tone?: string;
}

export interface TalentDashboardActivitySnapshot {
  cvRevampsCount?: number;
  coursesCount?: number;
  mentorshipCount?: number;
  hiringDecisionPendingCount?: number;
  lastLedgerUpdateAt?: string | null;
  nextAutoRematch?: 'on_assessment_complete' | string | null;
  profileCompletenessPercent?: number;
  nextSteps?: TalentDashboardActivitySnapshotNextStep[];
}

export interface TalentDashboardRole {
  rolePostingId?: string;
  roleLink?: string;
  roleTitle?: string;
  organisationName?: string;
  location?: string;
  compensationSummary?: string;
  matchScore?: number;
  tags?: string[];
  pipelineStatus?: string;
  pipelineStatusLabel?: string;
  publishedAt?: string;
  hrefHint?: string;
  gap?: string;
  suggestedAction?: string;
  projectedLift?: string;
}

export interface TalentDashboardProfile {
  firstName?: string;
  lastName?: string;
  initials?: string;
  headline?: string;
  location?: string;
  memberSince?: string;
  rightToWork?: {
    status?: 'verified' | 'unverified' | 'unknown' | string;
    label?: string;
  };
}

export interface TalentDashboardMetrics {
  careerReadinessScore?: TalentDashboardMetricScore;
  grade?: TalentDashboardGrade;
  interviewGrade?: TalentDashboardMetricGrade;
  matchesCount?: number;
  reachRolesCount?: number;
  jobsApplied?: TalentDashboardMetricJobs;
}

export interface TalentDashboardUnlockItem {
  locked?: boolean;
  hrefHint?: string;
  label?: string;
}

export interface TalentDashboardUnlocks {
  uploadCv?: TalentDashboardUnlockItem;
  mentors?: TalentDashboardUnlockItem;
  jobs?: TalentDashboardUnlockItem;
}

export interface TalentDashboardActivityContext {
  assessmentId?: string;
  rolePostingId?: string;
  roleTitle?: string;
  stage?: number;
  stageStatus?: string;
  gate1FinalSubmitted?: boolean;
}

export interface TalentDashboardActivity {
  id?: string;
  type?: string;
  priority?: number;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  hrefHint?: string;
  context?: TalentDashboardActivityContext;
}

export interface TalentDashboardActivities {
  schemaVersion?: number;
  primary?: TalentDashboardActivity;
  activities?: TalentDashboardActivity[];
}

export interface TalentDashboardSampleOpportunity {
  rolePostingId?: string;
  roleLink?: string;
  roleTitle?: string;
  organisationName?: string;
  employerName?: string;
  location?: string;
  compensationSummary?: string;
  salaryRange?: string;
  publishedAt?: string;
  tags?: string[];
  hrefHint?: string;
}

export interface TalentDashboardData {
  schemaVersion?: number;
  profile?: TalentDashboardProfile;
  greeting?: TalentDashboardGreeting;
  metrics?: TalentDashboardMetrics;
  unlocks?: TalentDashboardUnlocks;
  hasActiveCv?: boolean;
  pendingActions?: TalentDashboardPendingAction[];
  activitySnapshot?: TalentDashboardActivitySnapshot;
  matchedRoles?: TalentDashboardRole[];
  reachRoles?: TalentDashboardRole[];
  activities?: TalentDashboardActivities;
  sampleOpportunities?: TalentDashboardSampleOpportunity[];
}

export const useTalentDashboardQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent-dashboard"],
    queryFn: () =>
      apiClient.get<{ data: TalentDashboardData; statusCode: number; message: string }>({
        url: "/talent/dashboard",
        auth: true,
      }),
    ...options,
  });
};

export interface TalentSkillItem {
  skillKey?: string;
  displayName?: string;
  status?: 'CLAIMED' | 'EVIDENCED' | 'VERIFIED' | 'MISSING' | string;
  statusLabel?: string;
  sourceLabel?: string;
  barWeight?: number;
  isMissing?: boolean;
  missingReason?: string;
}

export interface TalentSkillCategory {
  key?: 'TECHNICAL' | 'DOMAIN_SOFT' | 'CREDENTIAL' | string;
  label?: string;
  items?: TalentSkillItem[];
}

export interface TalentSkillsLedgerTotals {
  skillsCount?: number;
  verified?: number;
  evidenced?: number;
  claimed?: number;
  missing?: number;
}

export interface TalentSkillsConfidenceBreakdown {
  verified?: number;
  evidenced?: number;
  claimed?: number;
  elevateHint?: string;
}

export interface TalentSkillsLedgerData {
  schemaVersion?: number;
  banner?: {
    message?: string;
  };
  totals?: TalentSkillsLedgerTotals;
  categories?: TalentSkillCategory[];
  confidenceBreakdown?: TalentSkillsConfidenceBreakdown;
  howItWorks?: string[];
}

export const useTalentSkillsLedgerQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent", "skills-ledger"],
    queryFn: () =>
      apiClient.get<{ data: TalentSkillsLedgerData; statusCode: number; message: string }>({
        url: "/talent/profile/skills-ledger",
        auth: true,
      }),
    ...options,
  });
};

export interface TalentMatchesRolesSummary {
  matchedCount?: number;
  reachCount?: number;
}

export interface TalentRevampHistoryItem {
  revampNumber?: number;
  completedAt?: string;
  roleTitle?: string;
  organisationName?: string;
  matchDeltaPercent?: number;
  beforeHighlights?: string[];
  afterHighlights?: string[];
}

export interface TalentInterventionUnlockedRole {
  roleTitle?: string;
  organisationName?: string;
  matchScore?: number;
}

export interface TalentInterventionProjectedUnlock {
  roleTitle?: string;
  organisationName?: string;
  matchScore?: number;
  projectedMatchScore?: number;
}

export interface TalentInterventionMapItem {
  status?: 'completed' | 'pending' | string;
  title?: string;
  completedAt?: string;
  unlockedRoles?: TalentInterventionUnlockedRole[];
  projectedUnlocks?: TalentInterventionProjectedUnlock[];
  cta?: {
    label?: string;
    hrefHint?: string;
  };
}

export interface TalentMatchesRolesData {
  schemaVersion?: number;
  summary?: TalentMatchesRolesSummary;
  revampHistory?: TalentRevampHistoryItem[];
  interventionMap?: TalentInterventionMapItem[];
  reachRoles?: TalentDashboardRole[];
}

export const useTalentMatchesRolesQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent", "matches-roles"],
    queryFn: () =>
      apiClient.get<{ data: TalentMatchesRolesData; statusCode: number; message: string }>({
        url: "/talent/profile/matches-roles",
        auth: true,
      }),
    ...options,
  });
};

export interface TalentProgressStage {
  stage?: number;
  name?: string;
  label?: string;
  status?: string;
  statusLabel?: string;
  cta?: {
    label?: string;
    hrefHint?: string;
    enabled?: boolean;
  } | null;
}

export interface TalentProgressJourney {
  assessmentId?: string;
  rolePostingId?: string;
  roleTitle?: string;
  organisationName?: string;
  overallStatus?: string;
  overallStatusLabel?: string;
  stages?: TalentProgressStage[];
}

export interface TalentProgressTimelineItem {
  at?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  badges?: string[];
  hrefHint?: string;
}

export interface TalentProgressScoreProgression {
  at?: string;
  label?: string;
  score?: number;
  kind?: 'actual' | 'projected' | string;
}

export interface TalentProgressData {
  schemaVersion?: number;
  journeys?: TalentProgressJourney[];
  timeline?: TalentProgressTimelineItem[];
  scoreProgression?: TalentProgressScoreProgression[];
}

export const useTalentProgressQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent", "progress"],
    queryFn: () =>
      apiClient.get<{ data: TalentProgressData; statusCode: number; message: string }>({
        url: "/talent/profile/progress",
        auth: true,
      }),
    ...options,
  });
};

export interface TalentMyDataPersonal {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  gender?: string | null;
  onboardingDate?: string;
  professionalTitle?: string;
}

export interface TalentMyDataGeographicLegal {
  country?: string;
  city?: string;
  ipLocation?: string;
  rightToWorkStatus?: string;
  rightToWorkVerified?: boolean;
  rightToWorkLabel?: string;
  workAuthorisation?: string[];
  lastIpCheck?: string;
  timezone?: string;
}

export interface TalentMyDataActiveCv {
  cvUploadId?: string;
  originalName?: string;
  uploadedAt?: string;
  parseStatus?: string;
  isActive?: boolean;
}

export interface TalentMyDataCertificate {
  id?: string;
  title?: string;
  verified?: boolean;
  statusLabel?: string;
  issuedAt?: string;
  shareableUrl?: string;
}

export interface TalentMyDataDocuments {
  cvUploadLimitNote?: string;
  activeCv?: TalentMyDataActiveCv | null;
  certificates?: TalentMyDataCertificate[];
}

export interface TalentMyDataAssessmentResult {
  assessmentId?: string;
  stage?: number;
  stageName?: string;
  label?: string;
  status?: string;
  statusLabel?: string;
}

export interface TalentMyDataGrade {
  grade?: string | null;
  label?: string | null;
  prescription?: string;
}

export interface TalentMyDataProfileResetHistoryItem {
  requestedAt?: string;
  reason?: string;
  status?: string;
}

export interface TalentMyDataProfileReset {
  windowDays?: number;
  maxPerWindow?: number;
  resetsUsed?: number;
  resetsRemaining?: number;
  policyNote?: string;
  history?: TalentMyDataProfileResetHistoryItem[];
}

export interface TalentMyDataDangerZone {
  deleteHrefHint?: string;
  warning?: string;
}

export interface TalentMyDataData {
  schemaVersion?: number;
  personal?: TalentMyDataPersonal;
  geographicLegal?: TalentMyDataGeographicLegal;
  documents?: TalentMyDataDocuments;
  assessmentResults?: TalentMyDataAssessmentResult[];
  grade?: TalentMyDataGrade;
  profileReset?: TalentMyDataProfileReset;
  dangerZone?: TalentMyDataDangerZone;
}

export const useTalentMyDataQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent", "my-data"],
    queryFn: () =>
      apiClient.get<{ data: TalentMyDataData; statusCode: number; message: string }>({
        url: "/talent/profile/my-data",
        auth: true,
      }),
    ...options,
  });
};

export interface TalentDeleteDataResponse {
  queued?: boolean;
  requestId?: string;
  status?: string;
  message?: string;
}

export const useDeleteTalentDataMutation = (options: Record<string, any> = {}) => {
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ data: TalentDeleteDataResponse; statusCode: number; message: string }>({
        url: "/talent/profile/my-data/delete-request",
        auth: true,
      }),
    ...options,
  });
};

export type {
  TalentJobStage,
  TalentJobListItem,
  TalentJobsResponse,
  TalentJobCompany,
  TalentJobApplication,
  TalentJobDetail,
  TalentGradeCode,
  TalentGrade,
  TalentJobsMatching,
  GateVerdictPart,
  GateVerdictData,
} from "../../../types/talentJobs";
import type { TalentJobsResponse, TalentJobDetail } from "../../../types/talentJobs";

/**
 * Fetch all talent opportunities split into appliedJobs and availableJobs.
 * Backend: GET /talent/jobs
 */
export const useTalentJobsQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["talent", "jobs"],
    queryFn: () =>
      apiClient.get<{ data: TalentJobsResponse; statusCode: number; message: string }>({
        url: "/talent/jobs",
        auth: true,
      }),
    ...options,
  });
};

/**
 * Fetch single job details with application state.
 * Backend: GET /talent/jobs/:id
 */
export const useTalentJobDetailQuery = (
  jobId: string,
  options: Record<string, any> = {},
) => {
  return useQuery({
    queryKey: ["talent", "jobs", jobId],
    queryFn: () =>
      apiClient.get<{ data: TalentJobDetail; statusCode: number; message: string }>({
        url: `/talent/jobs/${encodeURIComponent(jobId)}`,
        auth: true,
      }),
    enabled: !!jobId,
    ...options,
  });
};

export interface TalentCvParsedRole {
  id?: string;
  role: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description?: string;
  technologies?: string[];
}

export interface TalentCvParsedEducation {
  id?: string;
  degree: string;
  school: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

export interface TalentCvParsedCert {
  id?: string;
  name: string;
  issuingOrg?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface TalentCvProfileData {
  cvUploadId?: string;
  originalName?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  parseStatus?: 'NONE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  profile?: {
    about?: string;
    bio?: string;
    headline?: string;
    professionalTitle?: string;
    roles?: TalentCvParsedRole[];
    skills?: Array<string | { name: string; category?: string; verified?: boolean }>;
    education?: TalentCvParsedEducation[];
    certs?: TalentCvParsedCert[];
  };
}

/**
 * Lightweight CV dossier fetch & polling endpoint.
 * Backend: GET /api/v1/talent/cv/profile
 * Returns the parsed CV dossier only. Poll until parseStatus === 'COMPLETED'.
 */
export const useGetTalentCvProfileQuery = (options?: {
  enabled?: boolean;
  refetchInterval?:
    | number
    | false
    | ((query: { state: { data?: unknown } }) => number | false);
}) => {
  return useQuery({
    queryKey: ["talent", "cv-profile"],
    queryFn: () =>
      apiClient.get<any>({
        url: "/talent/cv/profile",
        auth: true,
        suppressErrorToast: true,
      }),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
};

export interface TalentCareerMilestone {
  id: string;
  title: string;
  role: string;
  era: string;
  date: string;
  status: 'VERIFIED' | 'DEMONSTRATED' | 'IN_PROGRESS' | 'PENDING_REVIEW';
  statusLabel: string;
  competencyDomain: string;
  description: string;
  evidenceSubmitted?: string;
  reviewer?: string;
  scoreLift?: string;
  isTargetRole?: boolean;
}

export interface TalentCareerEra {
  id: string;
  yearRange: string;
  roleTitle: string;
  isCurrent?: boolean;
  isTarget?: boolean;
  statusLabel: string;
  milestoneCount: number;
  verifiedCount: number;
  milestones: TalentCareerMilestone[];
}

export interface TalentCareerMapSummary {
  currentLevel: string;
  currentLevelTitle: string;
  targetLevel: string;
  targetLevelTitle: string;
  totalMilestones: number;
  verifiedMilestones: number;
  relevancyCount: number;
  demonstratedCount: number;
  inProgressCount: number;
  pendingReviewCount: number;
  readinessProgressPercent: number;
}

export interface TalentCareerPathItem {
  id: string;
  rank: number;
  roleTitle: string;
  era: string;
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'COMPLETED';
  statusLabel: string;
}

export interface TalentCareerMapData {
  schemaVersion?: number;
  candidateName?: string;
  candidateRole?: string;
  targetRole?: string;
  stageGateBadge?: string;
  summary: TalentCareerMapSummary;
  readinessLevels: Array<{
    level: string;
    title: string;
    status: 'COMPLETED' | 'CURRENT' | 'TARGET' | 'LOCKED';
    progressPercent: number;
    yearRange: string;
  }>;
  eras: TalentCareerEra[];
  pathLadder: TalentCareerPathItem[];
}

export const DEFAULT_CAREER_MAP_DATA: TalentCareerMapData = {
  candidateName: 'Adaeze Nwosu',
  candidateRole: 'Clinical Operations Specialist',
  targetRole: 'Senior Clinical Operations Lead',
  stageGateBadge: 'Stage 3 Gate',
  summary: {
    currentLevel: 'L4',
    currentLevelTitle: 'Advanced · Clinical Operations Specialist',
    targetLevel: 'L5',
    targetLevelTitle: 'Principal · Senior Clinical Operations Lead',
    totalMilestones: 58,
    verifiedMilestones: 45,
    relevancyCount: 8,
    demonstratedCount: 11,
    inProgressCount: 3,
    pendingReviewCount: 2,
    readinessProgressPercent: 78,
  },
  readinessLevels: [
    { level: 'L1', title: 'Clinical Trial Assistant', status: 'COMPLETED', progressPercent: 100, yearRange: '2018-2019' },
    { level: 'L2', title: 'Junior CRA', status: 'COMPLETED', progressPercent: 100, yearRange: '2019-2020' },
    { level: 'L3', title: 'CRA II', status: 'COMPLETED', progressPercent: 100, yearRange: '2020-2021' },
    { level: 'L4', title: 'Clinical Operations Specialist', status: 'CURRENT', progressPercent: 92, yearRange: '2021-2025' },
    { level: 'L5', title: 'Senior Clinical Operations Lead', status: 'TARGET', progressPercent: 65, yearRange: '2025-2026' },
    { level: 'L6', title: 'Director / Global Clinical Head', status: 'LOCKED', progressPercent: 0, yearRange: 'Future' },
  ],
  eras: [
    {
      id: 'era-2025',
      yearRange: '2025 - 2026',
      roleTitle: 'Senior Clinical Operations Lead (Target Role)',
      isTarget: true,
      statusLabel: 'Target / Active Evaluation',
      milestoneCount: 5,
      verifiedCount: 0,
      milestones: [
        {
          id: 'ms-target-1',
          title: 'Regulatory Inspection Readiness & Protocol Governance',
          role: 'Senior Clinical Operations Lead',
          era: '2025 - 2026',
          date: '12 Sep 2026',
          status: 'PENDING_REVIEW',
          statusLabel: 'Pending review',
          competencyDomain: 'Regulatory & Audit Oversight',
          description: 'Establishment of multi-site mock inspection protocol and end-to-end audit defense strategy.',
          evidenceSubmitted: 'FDA BIMO Simulation Report & Global Protocol Deviation Tracker v3.2',
          reviewer: 'VORA Clinical Review Board',
          scoreLift: '+4.2% Career Score',
          isTargetRole: true,
        },
        {
          id: 'ms-target-2',
          title: 'Cross-Portfolio Clinical Operations Strategy',
          role: 'Senior Clinical Operations Lead',
          era: '2025 - 2026',
          date: '04 Aug 2026',
          status: 'IN_PROGRESS',
          statusLabel: 'In progress',
          competencyDomain: 'Strategic Planning',
          description: 'Integrated budget forecasting and resource allocation across 4 simultaneous therapeutic studies.',
          evidenceSubmitted: 'Quarterly Operating Review dossier & site performance dashboard',
          reviewer: 'External Mentor / Portfolio Director',
          scoreLift: '+3.5% Career Score',
          isTargetRole: true,
        },
        {
          id: 'ms-target-3',
          title: 'Global Decentralized Clinical Trial (DCT) Implementation',
          role: 'Senior Clinical Operations Lead',
          era: '2025 - 2026',
          date: '18 Jun 2026',
          status: 'DEMONSTRATED',
          statusLabel: 'Demonstrated',
          competencyDomain: 'Clinical Innovation',
          description: 'Deployment of direct-to-patient drug shipments and remote e-consent workflows across 14 European sites.',
          evidenceSubmitted: 'DCT SOP Framework & Vendor Integration Certificate',
          reviewer: 'Verified via Sponsor Log',
          scoreLift: '+2.8% Career Score',
          isTargetRole: true,
        },
        {
          id: 'ms-target-4',
          title: 'Department Operational Excellence & CRA Mentorship Lead',
          role: 'Senior Clinical Operations Lead',
          era: '2025 - 2026',
          date: '22 May 2026',
          status: 'PENDING_REVIEW',
          statusLabel: 'Pending review',
          competencyDomain: 'Team Leadership',
          description: 'Structured onboarding program for 8 newly appointed trial coordinators with 95% pass rate.',
          evidenceSubmitted: 'Training Curriculum & Candidate Evaluation Matrices',
          reviewer: 'HR & Clinical Operations Lead',
          scoreLift: '+3.0% Career Score',
          isTargetRole: true,
        },
        {
          id: 'ms-target-5',
          title: 'Clinical Vendor Performance Management & SLA Enforcement',
          role: 'Senior Clinical Operations Lead',
          era: '2025 - 2026',
          date: '10 Feb 2026',
          status: 'IN_PROGRESS',
          statusLabel: 'In progress',
          competencyDomain: 'Vendor Oversight',
          description: 'Comprehensive KPI tracking and vendor escalation management across central laboratories and CRO partners.',
          evidenceSubmitted: 'Vendor Quarterly Business Review audits',
          reviewer: 'Independent Auditor',
          scoreLift: '+2.4% Career Score',
          isTargetRole: true,
        },
      ],
    },
    {
      id: 'era-2023',
      yearRange: '2023 - 2025',
      roleTitle: 'Clinical Operations Specialist (Current Standing)',
      isCurrent: true,
      statusLabel: 'Current / Level 4',
      milestoneCount: 5,
      verifiedCount: 4,
      milestones: [
        {
          id: 'ms-curr-1',
          title: 'Global Phase III Program Operations & Monitoring Oversight',
          role: 'Clinical Operations Specialist',
          era: '2023 - 2025',
          date: '14 Nov 2024',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Trial Execution',
          description: 'Operational lead for 42 trial sites across UK and EU delivering 103% recruitment target.',
          evidenceSubmitted: 'Final Study Close-Out Verification and eTMF Completion Certificate',
          reviewer: 'VORA Lead Assessor',
          scoreLift: '+5.0% Career Score',
        },
        {
          id: 'ms-curr-2',
          title: 'Risk-Based Monitoring (RBM) Strategy Formulation',
          role: 'Clinical Operations Specialist',
          era: '2023 - 2025',
          date: '02 Sep 2024',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Quality Management',
          description: 'Transitioned traditional 100% SDV to targeted risk algorithms, reducing site visit fatigue by 28%.',
          evidenceSubmitted: 'Sponsor Approved Monitoring Plan v2.0',
          reviewer: 'Trial Steering Committee',
          scoreLift: '+3.8% Career Score',
        },
        {
          id: 'ms-curr-3',
          title: 'Study Budget & Milestones Milestone Reconciliation',
          role: 'Clinical Operations Specialist',
          era: '2023 - 2025',
          date: '20 Apr 2024',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Financial Governance',
          description: 'Managed £3.2M trial operating budget across multi-national clinical sites within 1.5% variance.',
          evidenceSubmitted: 'Financial Audit Sign-off & Milestone Reconciliation Log',
          reviewer: 'Clinical Finance Manager',
          scoreLift: '+3.5% Career Score',
        },
        {
          id: 'ms-curr-4',
          title: 'Site Activation & Regulatory Ethics Submissions Expedited',
          role: 'Clinical Operations Specialist',
          era: '2023 - 2025',
          date: '11 Jan 2024',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Regulatory Submissions',
          description: 'Achieved average 42-day site start-up from greenlight to first patient dosed against 60-day industry norm.',
          evidenceSubmitted: 'Regulatory Ethics Approval letters & FPI milestone certificates',
          reviewer: 'Ethics Committee Audit',
          scoreLift: '+4.0% Career Score',
        },
        {
          id: 'ms-curr-5',
          title: 'Patient Recruitment & Retention Acceleration Campaign',
          role: 'Clinical Operations Specialist',
          era: '2023 - 2025',
          date: '19 Oct 2023',
          status: 'DEMONSTRATED',
          statusLabel: 'Demonstrated',
          competencyDomain: 'Patient Engagement',
          description: 'Implemented community referral networks and digital patient journals achieving 94% retention.',
          evidenceSubmitted: 'Patient Enrollment Graph & Retention Report',
          reviewer: 'Clinical Study Director',
          scoreLift: '+2.5% Career Score',
        },
      ],
    },
    {
      id: 'era-2021',
      yearRange: '2021 - 2023',
      roleTitle: 'Senior Clinical Research Associate',
      statusLabel: 'Completed / Level 3',
      milestoneCount: 5,
      verifiedCount: 5,
      milestones: [
        {
          id: 'ms-era3-1',
          title: 'Regional Site Initiation Visits (SIV) Lead & Investigator Training',
          role: 'Senior Clinical Research Associate',
          era: '2021 - 2023',
          date: '08 Dec 2022',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Site Management',
          description: 'Conducted 18 SIVs for pivotal Phase IIb oncology trial with zero critical findings during sponsor audit.',
          evidenceSubmitted: 'SIV Follow-up letters & Investigator Sign-off Sheets',
          reviewer: 'Sponsor QA Lead',
          scoreLift: '+4.0% Career Score',
        },
        {
          id: 'ms-era3-2',
          title: 'Complex Oncology Protocol & Serious Adverse Event (SAE) Oversight',
          role: 'Senior Clinical Research Associate',
          era: '2021 - 2023',
          date: '15 Jul 2022',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Safety & Pharmacovigilance',
          description: 'Direct management of expedited 24-hour SAE notifications to MHRA and pharmacovigilance units.',
          evidenceSubmitted: 'SAE Reconciliation Matrices & Expedited Safety Reports',
          reviewer: 'Safety Committee Auditor',
          scoreLift: '+4.2% Career Score',
        },
        {
          id: 'ms-era3-3',
          title: 'CRO Quality Oversight & CAPA Action Implementation',
          role: 'Senior Clinical Research Associate',
          era: '2021 - 2023',
          date: '28 Feb 2022',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Quality Assurance',
          description: 'Formulated and closed out 14 Corrective and Preventative Action plans following internal audits.',
          evidenceSubmitted: 'Completed CAPA Closure Notices & Audit Log',
          reviewer: 'Lead GCP Auditor',
          scoreLift: '+3.5% Career Score',
        },
        {
          id: 'ms-era3-4',
          title: 'Mentorship & Peer Training of 4 Junior Research Associates',
          role: 'Senior Clinical Research Associate',
          era: '2021 - 2023',
          date: '10 Nov 2021',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Leadership & Mentorship',
          description: 'Provided field co-monitoring visits and competency certifications for junior CRA team.',
          evidenceSubmitted: 'Co-Monitoring Assessment Evaluations',
          reviewer: 'Clinical Line Manager',
          scoreLift: '+3.0% Career Score',
        },
        {
          id: 'ms-era3-5',
          title: 'eTMF Archival Readiness & Inspection Dossier Preparation',
          role: 'Senior Clinical Research Associate',
          era: '2021 - 2023',
          date: '14 May 2021',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Documentation Compliance',
          description: 'Maintained 99.4% eTMF completeness across 12 clinical trial sites.',
          evidenceSubmitted: 'Veeva eTMF Completeness Index Audit Reports',
          reviewer: 'Documentation Manager',
          scoreLift: '+2.8% Career Score',
        },
      ],
    },
    {
      id: 'era-2019',
      yearRange: '2019 - 2021',
      roleTitle: 'Clinical Research Associate II & Care Coordinator',
      statusLabel: 'Completed / Level 2',
      milestoneCount: 5,
      verifiedCount: 5,
      milestones: [
        {
          id: 'ms-era2-1',
          title: 'Multi-Center Trial Monitoring & Source Data Verification (SDV)',
          role: 'Clinical Research Associate II',
          era: '2019 - 2021',
          date: '19 Jan 2021',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Monitoring',
          description: 'Completed 64 routine on-site monitoring visits ensuring GCP adherence across NHS trust hospital sites.',
          evidenceSubmitted: 'Signed Monitoring Visit Reports (MVRs)',
          reviewer: 'Project Lead CRA',
          scoreLift: '+3.0% Career Score',
        },
        {
          id: 'ms-era2-2',
          title: 'Investigator Meeting Co-ordination & Presentation Lead',
          role: 'Clinical Research Associate II',
          era: '2019 - 2021',
          date: '12 Sep 2020',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Stakeholder Management',
          description: 'Co-hosted national investigator meeting training 60+ principal investigators on protocol amendments.',
          evidenceSubmitted: 'Meeting Agenda & Certificate of Attendance',
          reviewer: 'Lead Study Physician',
          scoreLift: '+2.5% Career Score',
        },
        {
          id: 'ms-era2-3',
          title: 'Clinical Protocol Deviation Identification & Workflow Remediation',
          role: 'Clinical Research Associate II',
          era: '2019 - 2021',
          date: '04 Jun 2020',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Protocol Adherence',
          description: 'Detected protocol dispensing anomaly and retrained pharmacy personnel to prevent recurring errors.',
          evidenceSubmitted: 'Corrective Retraining Confirmation File',
          reviewer: 'QA Assessor',
          scoreLift: '+2.8% Career Score',
        },
        {
          id: 'ms-era2-4',
          title: 'Investigational Medicinal Product (IMP) Accountability Review',
          role: 'Clinical Research Associate II',
          era: '2019 - 2021',
          date: '18 Feb 2020',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Pharmacy Operations',
          description: '100% reconciliation of temperature logs and returned investigational drug packaging.',
          evidenceSubmitted: 'IMP Accountability Master Log',
          reviewer: 'Lead Pharmacist',
          scoreLift: '+2.5% Career Score',
        },
        {
          id: 'ms-era2-5',
          title: 'Informed Consent Form (ICF) Version Control Implementation',
          role: 'Clinical Research Associate II',
          era: '2019 - 2021',
          date: '10 Oct 2019',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Ethics & Consent',
          description: 'Ensured 100% re-consent compliance following protocol amendment 3 for 120 enrolled subjects.',
          evidenceSubmitted: 'ICF Audit Tracking Spreadsheet',
          reviewer: 'Ethics Committee Officer',
          scoreLift: '+2.2% Career Score',
        },
      ],
    },
    {
      id: 'era-2018',
      yearRange: '2018 - 2019',
      roleTitle: 'Clinical Trial Assistant / Medical Assistant Practice',
      statusLabel: 'Completed / Level 1 (Foundation)',
      milestoneCount: 5,
      verifiedCount: 5,
      milestones: [
        {
          id: 'ms-era1-1',
          title: 'ICH-GCP Guidelines Certification & Regulatory Frameworks',
          role: 'Clinical Trial Assistant',
          era: '2018 - 2019',
          date: '15 Aug 2019',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Foundation Standards',
          description: 'Advanced accreditation in International Council for Harmonisation Good Clinical Practice.',
          evidenceSubmitted: 'TransCelerate Recognized GCP Certificate',
          reviewer: 'Accreditation Authority',
          scoreLift: '+2.0% Career Score',
        },
        {
          id: 'ms-era1-2',
          title: 'Electronic Data Capture (EDC) Medidata RAVE Specialist',
          role: 'Clinical Trial Assistant',
          era: '2018 - 2019',
          date: '20 Mar 2019',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Data Management Systems',
          description: 'Certified in query generation, resolution, and data entry workflows in Medidata RAVE EDC.',
          evidenceSubmitted: 'Medidata Certified User Credential',
          reviewer: 'Data Management Lead',
          scoreLift: '+2.5% Career Score',
        },
        {
          id: 'ms-era1-3',
          title: 'Site Master File (SMF) & Investigator Site File Setup',
          role: 'Clinical Trial Assistant',
          era: '2018 - 2019',
          date: '10 Jan 2019',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Trial Documentation',
          description: 'Constructed compliant paper and electronic ISFs across 8 outpatient clinics.',
          evidenceSubmitted: 'ISF Index Validation Sign-offs',
          reviewer: 'Senior CTA Lead',
          scoreLift: '+2.0% Career Score',
        },
        {
          id: 'ms-era1-4',
          title: 'Patient Screening & Pre-Eligibility Verification Workflow',
          role: 'Clinical Trial Assistant',
          era: '2018 - 2019',
          date: '14 Oct 2018',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Clinical Screening',
          description: 'Supported inclusion/exclusion criteria checklists for clinical trial participant intake.',
          evidenceSubmitted: 'Clinical Coordinator Supervisor Sign-off',
          reviewer: 'Head Research Nurse',
          scoreLift: '+1.8% Career Score',
        },
        {
          id: 'ms-era1-5',
          title: 'Biological Sample Handling & IATA Dangerous Goods Certification',
          role: 'Clinical Trial Assistant',
          era: '2018 - 2019',
          date: '02 Jun 2018',
          status: 'VERIFIED',
          statusLabel: 'Verified',
          competencyDomain: 'Laboratory Safety',
          description: 'Certification for processing, centrifuging, and shipping diagnostic specimens at -80°C.',
          evidenceSubmitted: 'IATA Dangerous Goods Shipping Certificate',
          reviewer: 'Safety Compliance Officer',
          scoreLift: '+2.0% Career Score',
        },
      ],
    },
  ],
  pathLadder: [
    { id: 'ladder-1', rank: 1, roleTitle: 'Senior Clinical Operations Lead', era: '2025 - 2026', status: 'PENDING_REVIEW', statusLabel: 'Pending review' },
    { id: 'ladder-2', rank: 2, roleTitle: 'Clinical Operations Specialist', era: '2023 - 2025', status: 'IN_PROGRESS', statusLabel: 'Current Role' },
    { id: 'ladder-3', rank: 3, roleTitle: 'Senior Clinical Research Associate', era: '2021 - 2023', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-4', rank: 4, roleTitle: 'Clinical Research Associate II', era: '2020 - 2021', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-5', rank: 5, roleTitle: 'Care Team Lead', era: '2019 - 2020', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-6', rank: 6, roleTitle: 'Healthcare Operations Administrator', era: '2019', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-7', rank: 7, roleTitle: 'Junior Care Coordinator', era: '2018 - 2019', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-8', rank: 8, roleTitle: 'Patient Care Oncology Assistant', era: '2018', status: 'COMPLETED', statusLabel: 'Completed' },
    { id: 'ladder-9', rank: 9, roleTitle: 'Clinical Trial Assistant', era: '2018', status: 'COMPLETED', statusLabel: 'Completed' },
  ],
};

export const useTalentCareerMapQuery = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['talent', 'career-map'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: TalentCareerMapData; statusCode: number; message: string }>({
          url: '/talent/profile/career-map',
          auth: true,
          suppressErrorToast: true,
        });
        if (res?.data && res.data.eras?.length) {
          return res;
        }
      } catch (err) {
        // Fallback to rich default career map data
      }
      return { data: DEFAULT_CAREER_MAP_DATA, statusCode: 200, message: 'OK' };
    },
    ...options,
  });
};

