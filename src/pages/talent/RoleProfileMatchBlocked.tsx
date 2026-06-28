import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import { buildUserDisplayName } from '../../components/talent/profileMatch/RoleApplyAppShell';
import MatchBlockedEligibilityCard from '../../components/talent/profileMatchBlocked/MatchBlockedEligibilityCard';
import MatchBlockedAlternatives from '../../components/talent/profileMatchBlocked/MatchBlockedAlternatives';
import MatchBlockedGapAnalysisCard from '../../components/talent/profileMatchBlocked/MatchBlockedGapAnalysisCard';
import { MOCK_PROFILE_MATCH_SCAN_BLOCKED, MOCK_BLOCKED_REASONS, MOCK_PATHWAY_STEPS } from '../../constants/profileMatchBlocked';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import {
  resolveProfileMatchScan,
  getPostMatchPath,
  withRoleApplyPath,
  resolveMatchDisplayCopy,
  resolveGateMessages,
  resolveMatchThresholdDecimal,
  resolveMatchThresholdPercent,
} from '../../utils/profileMatchResult';
import { mapTalentMatchesToListings } from '../../utils/talentMatchApi';

const RoleProfileMatchBlocked: React.FC = () => {
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
    (location.state as { matchScan?: ReturnType<typeof resolveProfileMatchScan> } | null)?.matchScan || MOCK_PROFILE_MATCH_SCAN_BLOCKED,
  );

  const { data: response } = useGetPublicRoleQuery(roleSlug || '');

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
      return;
    }

    const correctPath = withRoleApplyPath(getPostMatchPath(matchScan), roleSlug);
    if (correctPath !== `/onboarding/talent/${roleSlug}/match/blocked`) {
      navigate(correctPath, {
        replace: true,
        state: { firstName, lastName, roleSlug, matchScan, matchScore: matchScan.originalRoleScore },
      });
    }
  }, [roleSlug, matchScan, navigate, firstName, lastName]);

  if (!roleSlug || !role) {
    return null;
  }

  const displayName = buildUserDisplayName(firstName, lastName);
  const welcomeName = firstName.trim() || displayName.split(' ')[0] || 'there';

  const displayCopy = useMemo(() => resolveMatchDisplayCopy(matchScan), [matchScan]);

  const alternateRoles = useMemo(() => {
    return mapTalentMatchesToListings(
      matchScan.alternateMatches,
      roleSlug,
      resolveMatchThresholdDecimal(matchScan),
    );
  }, [matchScan.alternateMatches, matchScan.scoreConfig, roleSlug]);

  const blockedReasons = useMemo(() => {
    const failedGates = matchScan.explanation?.gates?.filter((gate) => !gate.passed) ?? [];
    const reasons: { key: string; value: string }[] = [];

    if (role) {
      reasons.push({ key: 'Role', value: `${role.roleTitle} · ${role.companyName}` });
    }

    if (matchScan.explanation?.summary) {
      reasons.push({ key: 'Result', value: matchScan.explanation.summary });
    }

    failedGates.forEach((gate) => {
      reasons.push({ key: gate.code.replace(/_/g, ' '), value: gate.message });
    });

    matchScan.explanation?.dimensionGaps?.forEach((gap) => {
      reasons.push({
        key: gap.dimension,
        value: `${Math.round(gap.score * 100)}% (required ${Math.round(gap.threshold * 100)}%)`,
      });
    });

    if (reasons.length > 0) return reasons;

    return MOCK_BLOCKED_REASONS.map((row) =>
      row.key === 'Role' && role
        ? { key: 'Role', value: `${role.roleTitle} · ${role.companyName}` }
        : row,
    );
  }, [role, matchScan.explanation]);

  const pathwaySteps = useMemo(() => {
    const actions = matchScan.explanation?.improvementActions;
    if (actions && actions.length > 0) {
      return actions.map((action, index) => ({
        number: index + 1,
        title: action.label,
        description: action.dimension ? `Focus area: ${action.dimension}` : action.type,
        tags: [{ text: action.type, color: 'blue' }],
      }));
    }
    return MOCK_PATHWAY_STEPS;
  }, [matchScan.explanation?.improvementActions]);

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6">
        <header className="bg-white border-b border-[#E6E6E6] px-4 sm:px-8 py-4 sm:py-[18px]">
          <h1 className="text-xl sm:text-[22px] font-bold text-[#1A1A1A] tracking-tight">
            Welcome, {welcomeName}.
          </h1>
          <p className="text-sm text-[#808080] mt-1">
            Your profile has been scanned. Here is what we found.
          </p>
        </header>
      </div>

      <div className="w-full pb-10">
        <MatchBlockedEligibilityCard
          score={matchScan.originalRoleScore}
          headline={displayCopy.headline}
          body={resolveGateMessages(matchScan, false).join(' ') || displayCopy.body}
          reasons={blockedReasons}
        />
        <MatchBlockedAlternatives
          roles={alternateRoles}
          matchThreshold={resolveMatchThresholdPercent(matchScan)}
        />
        <MatchBlockedGapAnalysisCard steps={pathwaySteps} />
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchBlocked;
