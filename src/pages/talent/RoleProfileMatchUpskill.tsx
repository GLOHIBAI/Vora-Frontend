import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import Button from '../../components/common/Button';
import { buildUserDisplayName } from '../../components/talent/profileMatch/RoleApplyAppShell';
import MatchDevelopmentPanel from '../../components/talent/profileMatchUpskill/MatchDevelopmentPanel';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import type { MatchDevelopment } from '../../types/profileMatchWaitlist';
import {
  resolveProfileMatchScan,
  getPostMatchPath,
  withRoleApplyPath,
  resolveMatchSummary,
  resolveMatchThresholdPercent,
  resolveRoleTitleFromScan,
  PROFILE_MATCH_UPSKILL_PATH,
} from '../../utils/profileMatchResult';

const buildFallbackDevelopment = (
  scan: ReturnType<typeof resolveProfileMatchScan>,
  roleTitle: string,
): MatchDevelopment => ({
  focusAreas: [],
  message:
    resolveMatchSummary(scan) ||
    `Your profile does not yet meet the bar for the ${roleTitle} role.`,
  hasResources: false,
  courses: [],
  mentors: [],
});

const RoleProfileMatchUpskill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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

  const appliedRole: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const roleTitle = resolveRoleTitleFromScan(matchScan, appliedRole?.roleTitle ?? 'this role');
  const matchThreshold = resolveMatchThresholdPercent(matchScan);
  const summary = resolveMatchSummary(matchScan);
  const development = matchScan.development ?? buildFallbackDevelopment(matchScan, roleTitle);

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
      return;
    }

    const correctPath = withRoleApplyPath(getPostMatchPath(matchScan), roleSlug);
    if (correctPath !== withRoleApplyPath(PROFILE_MATCH_UPSKILL_PATH, roleSlug)) {
      navigate(correctPath, {
        replace: true,
        state: { firstName, lastName, roleSlug, matchScan, matchScore: matchScan.originalRoleScore },
      });
    }
  }, [roleSlug, matchScan, navigate, firstName, lastName]);

  if (!roleSlug) {
    return null;
  }

  const displayName = buildUserDisplayName(firstName, lastName);
  const welcomeName = firstName.trim() || displayName.split(' ')[0] || 'there';

  const handleReuploadCv = () => {
    navigate(`/onboarding/talent/${roleSlug}/cv`, {
      state: { firstName },
    });
  };

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6">
        <header className="bg-white border-b border-[#E6E6E6] px-4 sm:px-8 py-4 sm:py-[18px]">
          <h1 className="text-xl sm:text-[22px] font-bold text-[#1A1A1A] tracking-tight">
            Welcome, {welcomeName}.
          </h1>
          <p className="text-sm text-[#808080] mt-1">
            Your profile has been scanned. Here is how you can strengthen your match.
          </p>
        </header>
      </div>

      <div className="w-full pb-10">
        <MatchDevelopmentPanel
          development={development}
          roleTitle={roleTitle}
          score={matchScan.originalRoleScore}
          matchThreshold={matchThreshold}
          summary={summary}
        />

        <div className="bg-white border border-[#E6E6E6] rounded-[10px] p-5 sm:px-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-sm font-medium text-[#1A1A1A] mb-1">Updated your CV or experience?</div>
            <div className="text-[13px] text-[#808080] leading-relaxed">
              Re-upload your CV and we&apos;ll re-run the match for {roleTitle}.
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="shrink-0 whitespace-nowrap"
            onClick={handleReuploadCv}
          >
            Re-upload CV
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchUpskill;
