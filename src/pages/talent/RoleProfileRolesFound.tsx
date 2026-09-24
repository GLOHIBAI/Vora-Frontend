import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import {
  buildUserDisplayName,
} from '../../components/talent/profileMatch/RoleApplyAppShell';
import RolesFoundResultBanner from '../../components/talent/rolesFound/RolesFoundResultBanner';
import RolesFoundStatsGrid from '../../components/talent/rolesFound/RolesFoundStatsGrid';
import MatchedRoleCard from '../../components/talent/rolesFound/MatchedRoleCard';
import MatchedRoleJdModal from '../../components/talent/rolesFound/MatchedRoleJdModal';
import {
  DEFAULT_ROLES_FOUND_SUMMARY,
} from '../../constants/talentRolesFound';
import { useAuth } from '../../context/AuthContext';
import { 
  useGetPublicRoleQuery,
  useTalentDashboardQuery,
  useTalentJobsQuery,
} from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import {
  resolveProfileMatchScan,
  getPostMatchPath,
  withRoleApplyPath,
  resolveMatchThresholdPercent,
  resolveMatchThresholdDecimal,
  resolveMatchSummary,
  resolveRoleTitleFromScan,
} from '../../utils/profileMatchResult';
import { mapTalentMatchesToListings } from '../../utils/talentMatchApi';

const RoleProfileRolesFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const params = useParams<{ roleSlug: string }>();
  const roleSlug = params.roleSlug || '';
  const firstName =
    (location.state as { firstName?: string } | null)?.firstName || user?.firstName || '';
  const lastName =
    (location.state as { lastName?: string } | null)?.lastName || user?.lastName || '';
  const matchScan = resolveProfileMatchScan(
    (location.state as { matchScan?: ReturnType<typeof resolveProfileMatchScan> } | null)?.matchScan,
  );

  const { data: response } = useGetPublicRoleQuery(roleSlug || '');
  const { data: dashboardResponse } = useTalentDashboardQuery();
  const dashboardData = dashboardResponse?.data || (dashboardResponse as any);

  const { data: jobsResponse } = useTalentJobsQuery();
  const jobsData = jobsResponse?.data;
  const availableJobs = jobsData?.availableJobs || [];

  const appliedRole: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const matchThreshold = resolveMatchThresholdPercent(matchScan);
  const matchThresholdDecimal = resolveMatchThresholdDecimal(matchScan);

  const matchedRoles = useMemo(() => {
    if (matchScan.alternateMatches && matchScan.alternateMatches.length > 0) {
      return mapTalentMatchesToListings(
        matchScan.alternateMatches,
        roleSlug,
        matchThresholdDecimal,
      );
    }
    if (availableJobs && availableJobs.length > 0) {
      return availableJobs.map((job, idx) => {
        const score = job.matchScore ?? 85;
        const org = job.organisationName || 'Employer';
        return {
          id: job.rolePostingId || `avail-${idx}`,
          roleTitle: job.roleTitle,
          companyName: org,
          companyInitials: org.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'VR',
          salaryAmount: job.compensationSummary || 'Competitive',
          salaryPeriod: 'monthly',
          matchPercent: score,
          matchVariant: (score >= 85 ? 'green' : 'blue') as 'green' | 'blue',
          locationLine: job.location || 'Remote',
          formatPill: 'Remote',
          postedLine: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : 'Posted recently',
          contractPill: 'Full-time',
          contractMeta: [],
          timezone: '',
          eligibility: {
            title: 'Eligibility verified',
            body: job.gradePrescription || 'Your profile matches this role.',
          },
          tags: job.tags || [],
          metaItems: ['Full-time', job.location || 'Remote'],
          aboutRole: '',
          responsibilities: [],
          requirements: [],
          eligibilityRows: [],
        };
      });
    }
    return [];
  }, [matchScan.alternateMatches, roleSlug, matchThresholdDecimal, availableJobs]);

  const summary = useMemo(
    () => ({
      ...DEFAULT_ROLES_FOUND_SUMMARY,
      originalRoleTitle:
        resolveRoleTitleFromScan(matchScan, appliedRole?.roleTitle ?? DEFAULT_ROLES_FOUND_SUMMARY.originalRoleTitle),
      originalScore: matchScan.originalRoleScore,
      matchThreshold,
      matchedRoleCount: matchedRoles.length || (jobsData?.metrics?.availableMatchedCount ?? availableJobs.length),
      careerReadinessScore: dashboardData?.metrics?.careerReadinessScore?.value ?? matchScan.careerReadinessScore ?? DEFAULT_ROLES_FOUND_SUMMARY.careerReadinessScore,
      assessmentGrade: dashboardData?.metrics?.interviewGrade?.grade || jobsData?.talentGrade?.grade || DEFAULT_ROLES_FOUND_SUMMARY.assessmentGrade,
      explanationSummary: resolveMatchSummary(matchScan),
    }),
    [
      appliedRole,
      matchScan,
      matchThreshold,
      matchedRoles.length,
      dashboardData,
      jobsData,
      availableJobs.length,
    ],
  );

  const selectedRole = useMemo(
    () => matchedRoles.find((role) => role.id === selectedRoleId) ?? null,
    [matchedRoles, selectedRoleId],
  );

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
      return;
    }

    const correctPath = withRoleApplyPath(getPostMatchPath(matchScan), roleSlug);
    if (correctPath !== `/onboarding/talent/${roleSlug}/match/roles`) {
      navigate(correctPath, {
        replace: true,
        state: { firstName, lastName, roleSlug, matchScan, matchScore: matchScan.originalRoleScore },
      });
    }
  }, [roleSlug, matchScan, navigate, firstName, lastName]);

  if (!roleSlug || !appliedRole) {
    return null;
  }

  const displayName = buildUserDisplayName(firstName, lastName);
  const welcomeName = firstName.trim() || displayName.split(' ')[0] || 'there';

  const handleGoToAssessment = (roleId: string) => {
    const matchingAvailable = availableJobs.find((j) => j.rolePostingId === roleId);
    if (matchingAvailable?.hrefHint) {
      navigate(matchingAvailable.hrefHint);
      return;
    }
    if (matchingAvailable?.roleLink) {
      navigate(`/onboarding/talent/${matchingAvailable.roleLink}/interview/journey`);
      return;
    }
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6">
        <header className="bg-transparent px-4 sm:px-8 pt-4 pb-2 sm:pt-6 sm:pb-3">
          <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0D1B36] tracking-tight">
            Welcome, {welcomeName}.
          </h1>
          <p className="text-[15px] text-[#4A5568] mt-1.5 font-medium">
            Your profile has been built and scanned. Here&apos;s where you stand.
          </p>
        </header>
      </div>

      <div className="w-full">
        <RolesFoundResultBanner summary={summary} />
        <RolesFoundStatsGrid summary={summary} />

        <h2 className="text-[20px] font-extrabold text-[#0D1B36] tracking-tight mb-1.5">
          Roles your profile matches right now
        </h2>
        <p className="text-[14px] font-medium text-[#4A5568] mb-6">
          Your profile matched these at {summary.matchThreshold}%+. View the JD, then go straight
          to interview.
        </p>

        {matchedRoles.length > 0 ? (
          matchedRoles.map((role) => (
            <MatchedRoleCard
              key={role.id}
              role={role}
              onViewJd={setSelectedRoleId}
              onGoToAssessment={handleGoToAssessment}
            />
          ))
        ) : (
          <p className="text-[14px] text-[#4A5568] font-medium">
            No alternate roles are available right now. Check back soon or explore upskilling
            options for your original application.
          </p>
        )}
      </div>

      <MatchedRoleJdModal
        role={selectedRole}
        open={Boolean(selectedRoleId)}
        onClose={() => setSelectedRoleId(null)}
        onGoToAssessment={(roleId) => {
          setSelectedRoleId(null);
          handleGoToAssessment(roleId);
        }}
      />
    </DashboardLayout>
  );
};

export default RoleProfileRolesFound;
