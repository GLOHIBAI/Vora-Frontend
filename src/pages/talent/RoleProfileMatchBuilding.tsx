import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout';
import RoleApplyContextBanner from '../../components/auth/RoleApplyContextBanner';
import ProfileMatchPulseIcon from '../../components/talent/profileMatch/ProfileMatchPulseIcon';
import ProfileMatchStepRow from '../../components/talent/profileMatch/ProfileMatchStepRow';
import ProfileMatchProgressBar from '../../components/talent/profileMatch/ProfileMatchProgressBar';
import Button from '../../components/common/Button';

import { PROFILE_MATCH_STEPS } from '../../constants/profileMatchBuilding';
import { useProfileMatchProgress } from '../../hooks/useProfileMatchProgress';
import { useAuth } from '../../context/AuthContext';
import {
  useGetPublicRoleQuery,
  useGetRoleLinkMatchQuery,
  useGetRoleCvStatusQuery,
} from '../../services/queries/talent';
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
import { parseRoleCvStatusPayload } from '../../utils/roleCvStatus';
import { persistRolePostingId } from '../../utils/rolePostingId';

const CV_STATUS_POLL_MS = 2000;
const MATCH_POLL_MS = 3000;

const RoleProfileMatchBuilding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const hasAuthToken = !!localStorage.getItem('auth_token');
  const [devCvReady, setDevCvReady] = useState(false);
  const [devMatchReady, setDevMatchReady] = useState(false);

  useEffect(() => {
    if (hasAuthToken) return;
    const timer = window.setTimeout(() => setDevCvReady(true), 7000);
    return () => window.clearTimeout(timer);
  }, [hasAuthToken]);

  useEffect(() => {
    if (hasAuthToken || !devCvReady) return;
    const timer = window.setTimeout(() => setDevMatchReady(true), 5000);
    return () => window.clearTimeout(timer);
  }, [hasAuthToken, devCvReady]);

  // Phase 1: poll CV parse until COMPLETED + readyForMatching (loader caps at 80%).
  const { data: cvStatusResponse } = useGetRoleCvStatusQuery(roleSlug, {
    enabled: hasAuthToken && !!roleSlug,
    refetchInterval: (query) => {
      const cv = parseRoleCvStatusPayload(query.state.data);
      if (cv.cvParseFailed || cv.cvReadyForMatch) return false;
      return CV_STATUS_POLL_MS;
    },
  });

  const cvStatus = useMemo(
    () => parseRoleCvStatusPayload(cvStatusResponse),
    [cvStatusResponse],
  );

  const cvReadyForMatch = hasAuthToken ? cvStatus.cvReadyForMatch : devCvReady;
  const cvParseFailed = hasAuthToken ? cvStatus.cvParseFailed : false;

  // Phase 2: poll match only after CV is ready (loader 80% → 100%).
  const {
    data: matchResultResponse,
    isSuccess: isMatchSuccess,
    isError: isMatchError,
  } = useGetRoleLinkMatchQuery(roleSlug, {
    enabled: hasAuthToken && !!roleSlug && cvReadyForMatch,
    refetchInterval: (query) => {
      const raw = query.state.data;
      return isMatchResultPending(raw) ? MATCH_POLL_MS : false;
    },
  });

  const matchPayload =
    (matchResultResponse as { data?: unknown } | null)?.data ?? matchResultResponse;
  const matchReadyFromApi = isMatchSuccess && !isMatchResultPending(matchPayload);
  const matchReady = hasAuthToken ? matchReadyFromApi : devMatchReady;

  const { statuses, progress, headline, isComplete } = useProfileMatchProgress({
    cvReadyForMatch,
    cvParseFailed,
    matchReady,
  });

  const buildScanFromApi = useCallback(
    (raw: unknown) => resolveProfileMatchScan(mapApiMatchResultToScan(raw)),
    [],
  );

  const hasNavigatedRef = useRef(false);

  const doNavigate = useCallback(
    (matchScan: ReturnType<typeof resolveProfileMatchScan>) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      if (matchScan.rolePostingId) {
        persistRolePostingId(roleSlug, matchScan.rolePostingId);
      }

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

  // Route to result page once match API is READY and loader hit 100%.
  useEffect(() => {
    if (!matchReady || !isComplete || hasNavigatedRef.current) return;
    doNavigate(buildScanFromApi(matchPayload));
  }, [matchReady, isComplete, matchPayload, buildScanFromApi, doNavigate]);

  // Dev fallback when not authed or match API errors after CV ready.
  useEffect(() => {
    if (hasNavigatedRef.current || hasAuthToken) return;
    if (!isComplete) return;
    const scan = resolveProfileMatchScan(MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH);
    window.setTimeout(() => doNavigate(scan), 800);
  }, [hasAuthToken, isComplete, doNavigate]);

  useEffect(() => {
    if (hasNavigatedRef.current || !hasAuthToken || !cvReadyForMatch) return;
    if (!isMatchError || !isComplete) return;
    const scan = resolveProfileMatchScan(MOCK_PROFILE_MATCH_SCAN_STRONG_MATCH);
    window.setTimeout(() => doNavigate(scan), 800);
  }, [hasAuthToken, cvReadyForMatch, isMatchError, isComplete, doNavigate]);

  const handleReuploadCv = () => {
    navigate(`/onboarding/talent/${roleSlug}/cv`, {
      state: { firstName },
    });
  };

  if (!role) {
    return null;
  }

  if (cvParseFailed) {
    return (
      <DashboardLayout>
        <div className="-mx-4 lg:-mx-8 -mt-6">
          <RoleApplyContextBanner role={role} />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-16 mt-6">
          <div className="w-full max-w-[440px] text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-[#991B1B] mb-2">CV parsing failed</h2>
              <p className="text-sm text-[#7F1D1D] leading-relaxed">
                We couldn&apos;t read your CV. Please upload a valid text-based PDF or DOCX file
                and try again.
              </p>
            </div>
            <Button type="button" variant="primary" onClick={handleReuploadCv} className="w-full">
              Re-upload CV
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
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
            {cvReadyForMatch ? (
              <>
                Your CV is ready. We&apos;re scoring your match for{' '}
                <strong className="text-[#0047CC] font-semibold">{role.roleTitle}</strong>.
              </>
            ) : (
              <>
                Hang tight we&apos;re reading your CV and building your profile for{' '}
                <strong className="text-[#0047CC] font-semibold">{role.roleTitle}</strong>.
              </>
            )}
          </p>

          <div className="text-left mb-7">
            {PROFILE_MATCH_STEPS.map((step, index) => (
              <ProfileMatchStepRow
                key={step.id}
                title={step.title}
                subtitle={step.subtitle}
                status={isComplete ? 'done' : statuses[index]}
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
