import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import { buildUserDisplayName } from '../../components/talent/profileMatch/RoleApplyAppShell';
import MatchResultHero from '../../components/talent/profileMatchResult/MatchResultHero';
import MatchResultEligibility from '../../components/talent/profileMatchResult/MatchResultEligibility';
import MatchResultBreakdown from '../../components/talent/profileMatchResult/MatchResultBreakdown';
import MatchResultAssessmentCTA from '../../components/talent/profileMatchResult/MatchResultAssessmentCTA';
import { PROFILE_MATCH_BREAKDOWN } from '../../constants/profileMatchResult';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { resolveProfileMatchScan, getPostMatchPath, withRoleApplyPath } from '../../utils/profileMatchResult';
import { mapDimensionScoresToBreakdown } from '../../utils/talentMatchApi';
import { MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH } from '../../constants/profileMatchWaitlist';

const RoleProfileMatchResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const params = useParams<{ roleSlug: string }>();
  const roleSlug = params.roleSlug || '';
  const firstName =
    (location.state as { firstName?: string } | null)?.firstName || user?.firstName || '';
  const lastName =
    (location.state as { lastName?: string } | null)?.lastName || user?.lastName || '';
  
  // Use strong match mock by default for demonstration purposes
  const matchScan = resolveProfileMatchScan(
    (location.state as { matchScan?: ReturnType<typeof resolveProfileMatchScan> } | null)?.matchScan
    ?? MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH,
  );

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');

  const appliedRole: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const breakdownItems = useMemo(() => {
    const fromApi = mapDimensionScoresToBreakdown(matchScan.dimensionScores);
    return fromApi.length > 0 ? fromApi : PROFILE_MATCH_BREAKDOWN;
  }, [matchScan.dimensionScores]);

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
      return;
    }

    const correctPath = withRoleApplyPath(getPostMatchPath(matchScan), roleSlug);
    if (correctPath !== `/onboarding/talent/${roleSlug}/match/result`) {
      navigate(correctPath, {
        replace: true,
        state: { firstName, lastName, roleSlug, matchScan, matchScore: matchScan.originalRoleScore },
      });
    }
  }, [roleSlug, matchScan, navigate, firstName, lastName]);

  if (!appliedRole) {
    return null;
  }

  const displayName = buildUserDisplayName(firstName, lastName);
  const welcomeName = firstName.trim() || displayName.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6">
        <header className="bg-white border-b border-[#E6E6E6] px-4 sm:px-8 py-4 sm:py-[18px]">
          <h1 className="text-xl sm:text-[22px] font-bold text-[#1A1A1A] tracking-tight">
            Welcome, {welcomeName}.
          </h1>
          <p className="text-sm text-[#808080] mt-1">
            Your profile has been built, scanned and eligibility verified. Here is your result.
          </p>
        </header>
      </div>

      <div className="w-full pb-10">
        <MatchResultHero score={matchScan.originalRoleScore} role={appliedRole} />
        <MatchResultEligibility />
        <MatchResultBreakdown items={breakdownItems} />
        <MatchResultAssessmentCTA />
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchResult;
