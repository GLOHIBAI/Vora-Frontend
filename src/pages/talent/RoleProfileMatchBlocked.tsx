import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import { buildUserDisplayName } from '../../components/talent/profileMatch/RoleApplyAppShell';
import MatchBlockedEligibilityCard from '../../components/talent/profileMatchBlocked/MatchBlockedEligibilityCard';
import MatchBlockedAlternatives from '../../components/talent/profileMatchBlocked/MatchBlockedAlternatives';
import MatchBlockedGapAnalysisCard from '../../components/talent/profileMatchBlocked/MatchBlockedGapAnalysisCard';
import { MOCK_PROFILE_MATCH_SCAN_BLOCKED, MOCK_BLOCKED_REASONS, MOCK_PATHWAY_STEPS } from '../../constants/profileMatchBlocked';
import { MOCK_MATCHED_ROLES } from '../../constants/talentRolesFound';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { useTalentOnboardingStateQuery } from '../../services/queries/onboarding';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { loadRoleApplySlug } from '../../utils/roleSignup';
import { resolveProfileMatchScan, getPostMatchPath, withRoleApplyPath } from '../../utils/profileMatchResult';

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

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');
  const { data: onboardingResponse } = useTalentOnboardingStateQuery(true, false);

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const onboardingData = onboardingResponse?.data?.onboarding || onboardingResponse?.data?.fields || null;

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

  // Extract the alternative roles we want to display. WHA and HRF from mock data.
  const alternateRoles = MOCK_MATCHED_ROLES.filter(r => r.id === 'analyst' || r.id === 'associate');

  const blockedReasons = useMemo(() => {
    const failedGate = matchScan.explanation?.gates?.find((gate) => !gate.passed);
    if (failedGate && role) {
      return [
        { key: 'Role', value: `${role.roleTitle} · ${role.companyName}` },
        { key: 'Result', value: matchScan.explanation?.summary ?? failedGate.message },
        { key: 'Reason', value: failedGate.message },
      ];
    }

    if (!role) return MOCK_BLOCKED_REASONS;

    const defaultReasons = [...MOCK_BLOCKED_REASONS];
    if (role) {
      const roleIdx = defaultReasons.findIndex(r => r.key === 'Role');
      if (roleIdx !== -1) {
        defaultReasons[roleIdx] = { key: 'Role', value: `${role.roleTitle} · ${role.companyName}` };
      }
      
      const locIdx = defaultReasons.findIndex(r => r.key === 'Location');
      if (locIdx !== -1) {
        defaultReasons[locIdx] = { key: 'Location', value: role.formatLocationLabel };
      }
      
      const contractIdx = defaultReasons.findIndex(r => r.key === 'Contract type');
      if (contractIdx !== -1) {
        const contractType = role.overviewRows.find(r => r.label.toLowerCase().includes('contract'))?.value;
        if (contractType) {
            defaultReasons[contractIdx] = { key: 'Contract type', value: contractType };
        } else if (role.secondaryTags && role.secondaryTags.length > 0) {
            defaultReasons[contractIdx] = { key: 'Contract type', value: role.secondaryTags.join(', ') };
        }
      }

      const workRightsIdx = defaultReasons.findIndex(r => r.key === 'Work rights required');
      if (workRightsIdx !== -1) {
        const requiredRights = role.eligibilityRows.find(r => r.label.toLowerCase().includes('right') || r.label.toLowerCase().includes('visa') || r.label.toLowerCase().includes('permit'))?.value;
        if (requiredRights) {
            defaultReasons[workRightsIdx] = { key: 'Work rights required', value: requiredRights };
        } else {
            defaultReasons[workRightsIdx] = { key: 'Work rights required', value: `Valid work rights for ${role.companyLocation || 'this location'}` };
        }
      }

      const visaIdx = defaultReasons.findIndex(r => r.key === 'Visa sponsorship');
      if (visaIdx !== -1) {
          const sponsorship = role.eligibilityRows.find(r => r.label.toLowerCase().includes('sponsor'))?.value;
          if (sponsorship) {
              defaultReasons[visaIdx] = { key: 'Visa sponsorship', value: sponsorship };
          }
      }

      const declaredIdx = defaultReasons.findIndex(r => r.key === 'Your declared work rights');
      if (declaredIdx !== -1 && onboardingData?.countryOfResidence) {
          const countryMap: Record<string, string> = { NG: 'Nigeria', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom' };
          const countryName = countryMap[onboardingData.countryOfResidence] || onboardingData.countryOfResidence;
          defaultReasons[declaredIdx] = { key: 'Your declared work rights', value: `${countryName} only` };
      }
    }
    return defaultReasons;
  }, [role, onboardingData, matchScan.explanation]);

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
        <MatchBlockedEligibilityCard score={matchScan.originalRoleScore} reasons={blockedReasons} />
        <MatchBlockedAlternatives roles={alternateRoles} />
        <MatchBlockedGapAnalysisCard steps={MOCK_PATHWAY_STEPS} />
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchBlocked;
