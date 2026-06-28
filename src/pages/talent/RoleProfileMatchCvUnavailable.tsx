import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import Button from '../../components/common/Button';
import { buildUserDisplayName } from '../../components/talent/profileMatch/RoleApplyAppShell';
import { AlertTriangleIcon } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import {
  resolveProfileMatchScan,
  getPostMatchPath,
  withRoleApplyPath,
  resolveMatchSummary,
  resolveRoleTitleFromScan,
  PROFILE_MATCH_CV_UNAVAILABLE_PATH,
} from '../../utils/profileMatchResult';

const RoleProfileMatchCvUnavailable: React.FC = () => {
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
  const summary =
    resolveMatchSummary(matchScan) ||
    "We couldn't score your profile against this role yet — your CV or profile isn't ready for matching.";

  useEffect(() => {
    if (!roleSlug) {
      navigate('/onboarding/talent?step=1', { replace: true });
      return;
    }

    const correctPath = withRoleApplyPath(getPostMatchPath(matchScan), roleSlug);
    if (correctPath !== withRoleApplyPath(PROFILE_MATCH_CV_UNAVAILABLE_PATH, roleSlug)) {
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
            Your profile has been scanned, but we couldn&apos;t complete the match yet.
          </p>
        </header>
      </div>

      <div className="w-full pb-10">
        <div className="bg-white border border-[#E6E6E6] rounded-[10px] overflow-hidden mb-[18px]">
          <div className="bg-[#FFFBEB] border-b border-[#FDE68A] p-6 flex gap-4 items-start">
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-[#FDE68A] flex items-center justify-center shrink-0">
              <AlertTriangleIcon size={24} strokeWidth={2.5} className="text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight mb-1.5">
                Couldn&apos;t score — CV or profile not ready
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">{summary}</p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-[13px] text-[#4A5568] leading-relaxed mb-5">
              Upload a complete, text-based CV for {roleTitle} so we can extract your experience
              and run a full match score.
            </p>
            <Button type="button" variant="primary" onClick={handleReuploadCv} className="w-full sm:w-auto">
              Re-upload CV
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchCvUnavailable;
