import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { ArrowRightIcon } from '../../components/common/Icons';
import { useGetPublicRoleQuery, useBeginAssessmentMutation, useGetPreAssessmentReadinessQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import { useMemo, useEffect } from 'react';
import { isGate1ApiEnabled } from '../../config/gate1Api';
import { getActiveAssessmentId, setActiveAssessmentId } from '../../utils/assessmentSession';
import { readStoredRolePostingId, extractRolePostingIdFromPublicRole } from '../../utils/rolePostingId';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import toast from 'react-hot-toast';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const QuestionCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round"/>
  </svg>
);

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 0-4 4c0 1 .3 1.8.8 2.5C7.2 9.4 6 11.1 6 13a6 6 0 0 0 6 6"/>
    <path d="M12 2a4 4 0 0 1 4 4c0 1-.3 1.8-.8 2.5C16.8 9.4 18 11.1 18 13a6 6 0 0 1-6 6"/>
    <path d="M12 19v3"/>
  </svg>
);

const RoleAssessmentSessionInfo: React.FC = () => {
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const sessionLabel = 'How you think';
  const screenCount = 6;
  const minuteRange = '15-25';

  const { data: roleResponse, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug);
  const roleMeta = useMemo(() => {
    const apiData = roleResponse?.data || roleResponse;
    if (apiData && Object.keys(apiData).length > 0) {
      return mapApiResponseToRoleData(roleSlug, apiData);
    }
    return getRoleLandingForSlug(roleSlug);
  }, [roleResponse, roleSlug]);

  const roleTitle = roleMeta?.roleTitle ?? 'this role';
  const companyName = roleMeta?.companyName ?? 'the employer';

  const rolePostingId = useMemo(() => {
    return readStoredRolePostingId(roleSlug) ||
      extractRolePostingIdFromPublicRole(roleResponse) ||
      '';
  }, [roleSlug, roleResponse]);

  const { data: readinessResponse, isLoading: isReadinessLoading, error } = useGetPreAssessmentReadinessQuery(roleSlug, rolePostingId);
  const readiness = readinessResponse?.data || readinessResponse;

  const isLocked = useMemo(() => {
    return readiness?.assessmentStatus === 'LOCKED' || readiness?.isLocked === true;
  }, [readiness]);

  // Redirect guard if not matched (403 error from readiness API)
  useEffect(() => {
    if (error) {
      const apiError = error as any;
      if (apiError.status === 403) {
        navigate(`/onboarding/talent/${roleSlug}/match`, { replace: true });
      }
    }
  }, [error, navigate, roleSlug]);

  // Route guard: Redirect back to pre-assessment asks page if pre-assessment is required but not completed
  useEffect(() => {
    if (!isRoleLoading && !isReadinessLoading && readinessResponse) {
      if (readiness?.assessmentId) {
        setActiveAssessmentId(readiness.assessmentId);
      }
      const isPreAssessmentRequired = readiness?.preAssessmentRequired === true;
      const isPreAssessmentComplete = 
        readiness?.checks?.preAssessmentComplete === true || 
        readiness?.preAssessmentComplete === true;

      if (isPreAssessmentRequired && !isPreAssessmentComplete) {
        navigate(`/onboarding/talent/${roleSlug}/assessment/asks`, { replace: true });
      }
    }
  }, [isRoleLoading, isReadinessLoading, readinessResponse, navigate, roleSlug, readiness]);

  const beginAssessment = useBeginAssessmentMutation();

  const handleStart = async () => {
    try {
      const storedId = getActiveAssessmentId() || readiness?.assessmentId;
      const status = readiness?.assessmentStatus;

      if (status === 'IN_PROGRESS') {
        if (storedId) {
          setActiveAssessmentId(storedId);
        }
        if (isGate1ApiEnabled()) {
          navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`);
        } else {
          navigate(`/onboarding/talent/${roleSlug}/assessment/session-1/psychometric`);
        }
        return;
      }

      const res = await beginAssessment.mutateAsync({ rolePostingId });
      const unwrapped = (res?.data || res) as any;
      const assessmentId = unwrapped?.assessmentId || unwrapped?.id;
      if (assessmentId) {
        setActiveAssessmentId(assessmentId);
      }

      if (isGate1ApiEnabled()) {
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`, { state: { startFresh: true } });
      } else {
        navigate(`/onboarding/talent/${roleSlug}/assessment/session-1/psychometric`);
      }
    } catch (err: any) {
      console.error('Failed to begin assessment:', err);
      const errMsg = err?.message || '';
      if (errMsg.toLowerCase().includes('already in progress') || errMsg.toLowerCase().includes('in_progress')) {
        const assessmentId = readiness?.assessmentId;
        if (assessmentId) {
          setActiveAssessmentId(assessmentId);
        }
        if (isGate1ApiEnabled()) {
          navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`);
        } else {
          navigate(`/onboarding/talent/${roleSlug}/assessment/session-1/psychometric`);
        }
      } else {
        toast.error(errMsg || 'Failed to start assessment. Please try again.');
      }
    }
  };

  if (isRoleLoading || isReadinessLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600] flex items-center gap-[8px] hidden sm:flex">
          Stage 1 · Getting to know you <span className="text-[#ADADAD]">·</span> Session 1 of 2
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Auto-saved
        </div>
      </header>

      {/* Chapter Rail */}
      <div className="bg-white border-b border-[#E6E6E6] px-[32px] py-[12px] flex items-center justify-center gap-[12px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)] flex items-center justify-center text-[9px] font-[800] text-white">1</div>
          <div className="text-[11.5px] font-[700] text-[#0047CC]">{sessionLabel}</div>
        </div>
        <div className="w-[36px] h-[2px] bg-[#E6E6E6] rounded-[2px]"></div>
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[9px] font-[800] text-white">2</div>
          <div className="text-[11.5px] font-[700] text-[#ADADAD]">Your instincts</div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex items-center justify-center p-[20px] sm:p-[40px_24px]">
        <div className="bg-white rounded-[24px] border-[1.5px] border-[#E6E6E6] shadow-sm max-w-[720px] w-full text-center animate-[fadeUp_0.5s_ease_both] relative overflow-hidden p-[32px_22px_28px] sm:p-[44px_44px_36px]">

          {isLocked && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded-xl p-4 text-left text-[13px] leading-[1.6] mb-5 flex gap-3 items-start animate-[fadeUp_0.4s_ease]">
              <LockClosedIcon className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <strong className="font-[800]">Assessment Locked:</strong> Your previous assessment is locked. Please submit a new CV on your profile to request a reset.
              </div>
            </div>
          )}

          <div className="w-[84px] h-[84px] rounded-[24px] bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] mx-auto mb-[22px] flex items-center justify-center relative">
            <div className="absolute -inset-[4px] border-[1.5px] border-dashed border-[#387DFF] rounded-[28px] opacity-40 animate-[spin_18s_linear_infinite]"></div>
            <BrainIcon className="w-[38px] h-[38px] text-[#0047CC]" />
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            About this session
          </div>
          <h1 className="text-[24px] font-[600] tracking-[-0.4px] text-[#1A1A1A] mb-[12px] leading-[1.25]">
            How you think & what you value
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[24px]">
            A short series of reflective questions about your working style, problem-solving approach, and the things that matter to you in a workplace.
          </p>

          <div className="bg-white border border-[#0047CC]/30 rounded-[12px] p-[14px_16px] text-left mb-[24px] flex gap-[11px]">
            <QuestionCircleIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div className="text-[13px] text-[#182348] leading-[1.55]">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#1A1A1A] mb-[3px]">Why this matters</div>
              As a {roleTitle} at {companyName}, this session helps the hiring team understand how you naturally show up so they can shape the role around your strengths.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[10px] mb-[26px]">
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">{minuteRange}</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">minutes</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">{screenCount}</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">short parts</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">No prep</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">just be honest</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-[12px] justify-center items-stretch sm:items-center mt-[10px]">
            {isLocked ? (
              <Button 
                onClick={() => navigate(`/onboarding/talent/${roleSlug}/cv`)}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_4px_14px_rgba(220,38,38,0.28)] min-w-[220px] flex items-center justify-center gap-2 font-[800]"
                pill={false}
              >
                <LockClosedIcon className="w-4 h-4" />
                Upload new CV to reset
              </Button>
            ) : (
              <Button 
                onClick={handleStart}
                isLoading={beginAssessment.isPending}
                className="px-[48px] min-w-[200px] py-[12px] bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] w-full sm:w-auto flex justify-center items-center font-[700]"
                pill={false}
              >
                Start session
              </Button>
            )}
          </div>

          <p className="text-[12px] text-[#808080] mt-[14px] leading-[1.5]">
            <strong className="text-[#1A1A1A] font-[700]">One last thing:</strong> there are no right answers here. Honesty gives you the strongest match.
          </p>

        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RoleAssessmentSessionInfo;
