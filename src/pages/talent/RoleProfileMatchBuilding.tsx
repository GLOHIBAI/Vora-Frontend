import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../layout/DashboardLayout';
import RoleApplyContextBanner from '../../components/auth/RoleApplyContextBanner';
import ProfileMatchPulseIcon from '../../components/talent/profileMatch/ProfileMatchPulseIcon';
import ProfileMatchStepRow from '../../components/talent/profileMatch/ProfileMatchStepRow';
import ProfileMatchProgressBar from '../../components/talent/profileMatch/ProfileMatchProgressBar';

import { PROFILE_MATCH_STEPS } from '../../constants/profileMatchBuilding';
import { useProfileMatchProgress } from '../../hooks/useProfileMatchProgress';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { useGetPublicRoleQuery, useGetMatchResultForRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH } from '../../constants/profileMatchWaitlist';
import {
  getPostMatchPath,
  resolveProfileMatchScan,
  mapApiMatchResultToScan,
  isMatchResultPending,
  withRoleApplyPath,
} from '../../utils/profileMatchResult';
import { countPassingAlternateMatches } from '../../utils/talentMatchApi';

/** Poll every 3 s while scan is running. Stop once READY. */
const POLL_INTERVAL_MS = 3000;

const RoleProfileMatchBuilding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const params = useParams<{ roleSlug: string }>();
  const roleSlug = params.roleSlug || '';
  const firstName =
    (location.state as { firstName?: string } | null)?.firstName || user?.firstName || '';
  const lastName =
    (location.state as { lastName?: string } | null)?.lastName || user?.lastName || '';

  const { data: response } = useGetPublicRoleQuery(roleSlug || '');

  const role: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  // Determine if user is authed — if not (local dev), skip API polling
  const hasAuthToken = !!localStorage.getItem('auth_token');

  // Poll GET /talent/matches/for-role?roleLink=<roleSlug> every 3 s
  const {
    data: matchResultResponse,
    isSuccess: isMatchSuccess,
    isError: isMatchError,
  } = useGetMatchResultForRoleQuery(
    { roleLink: roleSlug },
    {
      enabled: hasAuthToken && !!roleSlug,
      refetchInterval: (query) => {
        const raw = query.state.data;
        return isMatchResultPending(raw) ? POLL_INTERVAL_MS : false;
      },
    },
  );

  const buildScanFromApi = useCallback(
    async (raw: unknown) => {
      const alternateCount = hasAuthToken
        ? countPassingAlternateMatches(
            await queryClient.fetchQuery({
              queryKey: ['talent', 'matches'],
              queryFn: () => apiClient.get({ url: '/talent/matches', auth: true, suppressErrorToast: true }),
            }),
            roleSlug,
          )
        : 0;

      return resolveProfileMatchScan(mapApiMatchResultToScan(raw, alternateCount));
    },
    [hasAuthToken, queryClient, roleSlug],
  );

  // Track whether we've already navigated to avoid double-fire
  const hasNavigatedRef = useRef(false);

  const doNavigate = useCallback(
    (matchScan: ReturnType<typeof resolveProfileMatchScan>) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      navigate(withRoleApplyPath(getPostMatchPath(matchScan), roleSlug), {
        state: {
          firstName,
          lastName,
          roleSlug,
          matchScan,
          matchScore: matchScan.originalRoleScore,
        },
      });
    },
    [navigate, firstName, lastName, roleSlug],
  );

  // When the API returns a READY result, map and navigate
  useEffect(() => {
    if (!isMatchSuccess || hasNavigatedRef.current) return;
    const raw = (matchResultResponse as { data?: unknown } | null)?.data ?? matchResultResponse;
    if (isMatchResultPending(raw)) return;

    void buildScanFromApi(raw).then(doNavigate);
  }, [isMatchSuccess, matchResultResponse, buildScanFromApi, doNavigate]);

  const handleComplete = useCallback(() => {
    if (hasNavigatedRef.current) return;

    if (isMatchSuccess) {
      const raw = (matchResultResponse as { data?: unknown } | null)?.data ?? matchResultResponse;
      if (!isMatchResultPending(raw)) {
        void buildScanFromApi(raw).then(doNavigate);
        return;
      }
    }

    if (!hasAuthToken || isMatchError) {
      const scan = resolveProfileMatchScan(MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH);
      window.setTimeout(() => doNavigate(scan), 1200);
    }
  }, [isMatchSuccess, isMatchError, matchResultResponse, hasAuthToken, buildScanFromApi, doNavigate]);

  const { statuses, progress, headline, isComplete } = useProfileMatchProgress({
    onComplete: handleComplete,
  });

  if (!role) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="-mx-4 lg:-mx-8 -mt-6">
        <RoleApplyContextBanner role={role} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-12 mt-6">
        <div className="w-full max-w-[500px] text-center">
          <ProfileMatchPulseIcon />

          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-2">{headline}</h1>
          <p className="text-sm text-[#808080] leading-relaxed mb-7 max-w-[380px] mx-auto">
            Hang tight, we&apos;re combining your CV and onboarding details into a full profile
            and checking your match for{' '}
            <strong className="text-[#0047CC] font-semibold">{role.roleTitle}</strong> and 200+
            other live roles simultaneously.
          </p>

          <div className="text-left mb-7">
            {PROFILE_MATCH_STEPS.map((step, index) => (
              <ProfileMatchStepRow
                key={step.id}
                title={step.title}
                subtitle={step.subtitle}
                status={progress === 100 || isComplete ? 'done' : statuses[index]}
                isLast={index === PROFILE_MATCH_STEPS.length - 1}
              />
            ))}
          </div>

          <ProfileMatchProgressBar progress={progress} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleProfileMatchBuilding;

