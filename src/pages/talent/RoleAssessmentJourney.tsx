import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery, useGetPreAssessmentReadinessQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import type { ProfileMatchScanResult } from '../../types/profileMatchWaitlist';
import {
  extractRolePostingIdFromMatchPayload,
  extractRolePostingIdFromPublicRole,
  persistRolePostingId,
  pickRolePostingId,
  readStoredRolePostingId,
} from '../../utils/rolePostingId';
import { resolveGate1AssessmentId, isGate1ApiEnabled } from '../../config/gate1Api';
import { setActiveAssessmentId } from '../../utils/assessmentSession';
import FullPageSpinner from '../../components/common/FullPageSpinner';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LayerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4"/>
  </svg>
);

const ClockPlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>
);

const WindowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ThresholdIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const LockRectIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const CameraMicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);

const GroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const WifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const LaptopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const AlertTriangleCustomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const RoleAssessmentJourney: React.FC = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const locationState = location.state as {
    firstName?: string;
    matchScan?: ProfileMatchScanResult;
    rolePostingId?: string;
  } | null;
  
  useEffect(() => {
    if (roleSlug) {
      localStorage.setItem('active_assessment_role_slug', roleSlug);
    }
  }, [roleSlug]);

  const firstName =
    locationState?.firstName || user?.firstName || 'there';

  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');

  const rolePostingId = useMemo(() => {
    const fromMatchCache = extractRolePostingIdFromMatchPayload(
      queryClient.getQueryData(['talent', 'role-link-match', roleSlug]),
    );

    return pickRolePostingId(
      locationState?.matchScan?.rolePostingId,
      locationState?.rolePostingId,
      extractRolePostingIdFromPublicRole(response),
      fromMatchCache,
      readStoredRolePostingId(roleSlug || ''),
    );
  }, [locationState, response, queryClient, roleSlug]);

  useEffect(() => {
    if (roleSlug && rolePostingId) {
      persistRolePostingId(roleSlug, rolePostingId);
    }
  }, [roleSlug, rolePostingId]);

  useEffect(() => {
    if (isGate1ApiEnabled()) {
      const mockKeys = [
        'vora_stage1_started',
        'vora_stage2_unlocked',
        'vora_stage2_completed',
        'vora_stage3_unlocked',
        'vora_stage3_completed',
        'vora_stage4_unlocked',
        'vora_stage4_completed',
        'vora_stage2_part2_unlocked',
        'vora_stage2_part3_unlocked',
        'vora_hired',
      ];
      mockKeys.forEach(key => localStorage.removeItem(key));
    }
  }, []);

  const { data: readinessResponse, isLoading: isReadinessLoading, error } =
    useGetPreAssessmentReadinessQuery(roleSlug || '', rolePostingId);

  useEffect(() => {
    if (error) {
      const apiError = error as any;
      if (apiError.status === 403) {
        navigate(`/onboarding/talent/${roleSlug}/match`, { replace: true });
      }
    }
  }, [error, navigate, roleSlug]);

  useEffect(() => {
    if (!isRoleLoading && !isReadinessLoading && readinessResponse) {
      const readiness = readinessResponse?.data || readinessResponse;
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
  }, [isRoleLoading, isReadinessLoading, readinessResponse, navigate, roleSlug]);

  const appliedRole: PublicRoleLandingData | null = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const companyName = appliedRole?.companyName || 'the employer';
  const roleTitle = appliedRole?.roleTitle || 'the role';

  const readiness = readinessResponse?.data || readinessResponse;

  const hasStartedStage1 = useMemo(() => {
    if (!readiness) return false;
    return readiness.assessmentStatus === 'IN_PROGRESS' && readiness.stage === 1;
  }, [readiness]);

  const isLocked = useMemo(() => {
    return readiness?.assessmentStatus === 'LOCKED' || readiness?.isLocked === true;
  }, [readiness]);

  const gate1Tags = ['Personality', 'Values', 'Cognitive', 'Situational judgement'];
  const gate1EstimatedMinutes = '25 to 40 minutes';
  
  const gate1Completed = useMemo(() => {
    if (!readiness) return false;
    return readiness.stage > 1 || readiness.assessmentStatus === 'COMPLETED';
  }, [readiness]);

  const isStage2Unlocked = useMemo(() => {
    if (!readiness) return false;
    return readiness.stage >= 2 || readiness.assessmentStatus === 'COMPLETED';
  }, [readiness]);

  const isStage2Completed = useMemo(() => {
    if (!readiness) return false;
    return readiness.stage > 2 || readiness.assessmentStatus === 'COMPLETED';
  }, [readiness]);

  const isStage3Unlocked = useMemo(() => {
    if (!readiness) return false;
    return readiness.stage >= 3 || readiness.assessmentStatus === 'COMPLETED';
  }, [readiness]);

  const isStage3Completed = useMemo(() => {
    if (!readiness) return false;
    return readiness.stage > 3 || readiness.assessmentStatus === 'COMPLETED';
  }, [readiness]);

  const isStage4Unlocked = useMemo(() => {
    if (!readiness) return false;
    return readiness.assessmentStatus === 'COMPLETED' || readiness.nextStep === 'COMPLETED';
  }, [readiness]);

  const handleStart = () => {
    localStorage.setItem('vora_stage1_started', 'true');
    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-1`);
  };

  if (isRoleLoading || isReadinessLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      {/* Topbar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[32px] py-[12px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="flex items-center gap-[14px]">
          <div className="hidden sm:flex items-center gap-[7px] bg-white border border-[#0047CC] rounded-full px-[13px] py-[6px] text-[12px] font-[700] text-[#0047CC]">
            <LayerIcon className="w-[11px] h-[11px]" />
            {roleTitle} · {companyName}
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#0047CC] to-[#387DFF] flex items-center justify-center text-[11px] text-white font-[800]">
            AO
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#182348] via-[#344DA1] to-[#0047CC] pt-[54px] px-[32px] pb-[84px] relative overflow-hidden text-white sm:pt-[54px] sm:px-[32px] sm:pb-[84px] pt-[40px] px-[20px] pb-[70px]">
        <div className="absolute top-[-100px] right-[-80px] w-[380px] h-[380px] rounded-full bg-white/5"></div>
        <div className="absolute bottom-[-120px] left-[-60px] w-[280px] h-[280px] rounded-full bg-[#387DFF]/10"></div>
        
        <div className="relative z-[2] max-w-[1080px] mx-auto">
          <div className="mb-[12px]">
            <span className="text-[12px] font-[600] tracking-[1px] text-white/70 uppercase">Welcome back, {firstName}</span>
          </div>
          <h1 className="text-[clamp(28px,3.6vw,40px)] font-[500] tracking-[-0.6px] mb-[12px] leading-[1.18]">
            Your interview journey,<br/>built around <span className="text-white">your story</span>
          </h1>
          <p className="text-[15.5px] leading-[1.7] max-w-[620px] text-white/90 mb-[30px]">
            This isn't a generic test. Four stages, each one earning its place in the picture {companyName} builds of you. No rote questions. No filler. Pause and resume from any device, anytime your seat is held.
          </p>
          <div className="flex flex-wrap gap-[12px]">
            <div className="bg-white/10 border border-white/20 rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[140px] flex-none">
              <div className="text-[10.5px] font-[600] tracking-[0.7px] uppercase text-white/70 mb-[3px]">Total time</div>
              <div className="text-[14.5px] font-[600] text-white tabular-nums tracking-[-0.1px]">2 to 4 hours</div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[140px] flex-none">
              <div className="text-[10.5px] font-[600] tracking-[0.7px] uppercase text-white/70 mb-[3px]">Stages</div>
              <div className="text-[14.5px] font-[600] text-white tabular-nums tracking-[-0.1px]">4</div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[140px] flex-none">
              <div className="text-[10.5px] font-[600] tracking-[0.7px] uppercase text-white/70 mb-[3px]">Pass threshold</div>
              <div className="text-[14.5px] font-[600] text-white tabular-nums tracking-[-0.1px]">80% per stage</div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[140px] flex-none">
              <div className="text-[10.5px] font-[600] tracking-[0.7px] uppercase text-white/70 mb-[3px]">Format</div>
              <div className="text-[14.5px] font-[600] text-white tabular-nums tracking-[-0.1px]">Async · your time</div>
            </div>
          </div>
        </div>
      </section>

      <main className="px-[32px] pb-[80px] max-w-[1080px] mx-auto mt-[-44px] relative z-[3] w-full sm:px-[32px] sm:pb-[80px] px-[20px] pb-[50px]">
        {/* CTA Card */}
        <div className="bg-white rounded-[18px] shadow-[0_16px_40px_rgba(10,17,114,0.1)] p-[24px_28px] mb-[32px] flex items-center gap-[18px] flex-wrap border-[1.5px] border-[#E6E6E6] relative overflow-hidden">
          <div className="w-[54px] h-[54px] rounded-[14px] bg-gradient-to-br from-[#0047CC] to-[#387DFF] flex items-center justify-center text-white shrink-0 shadow-[0_4px_14px_rgba(0,71,204,0.28)]">
            <DocumentCheckIcon className="w-[24px] h-[24px]" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] text-[#0047CC] uppercase mb-[5px]">
              {isStage3Completed
                ? 'Stage 3 completed · Final decision pending'
                : isStage2Completed 
                  ? 'Stage 2 completed · Stage 3 unlocked' 
                  : isStage2Unlocked 
                    ? 'Stage 1 completed · Stage 2 unlocked' 
                    : 'Onboarding submitted · Stage 1 unlocked'}
            </div>
            <div className="text-[18px] font-[600] text-[#1A1A1A] mb-[5px] tracking-[-0.2px] leading-[1.3]">
              {isStage3Completed
                ? `You're all set, ${firstName}`
                : isStage2Completed 
                  ? `Stage 3 is unlocked, ${firstName}` 
                  : `Ready when you are, ${firstName}`}
            </div>
            <div className="text-[13.5px] text-[#808080] leading-[1.55]">
              {isLocked ? (
                <span className="text-[#DC2626] font-[600]">Your previous assessment is locked. Please submit a new CV on your profile to reset and retry.</span>
              ) : isStage3Completed ? (
                "You have completed all assessment stages! Reach Africa's hiring panel is currently reviewing your application file."
              ) : isStage2Completed ? (
                'Your Stage 2 professional dimension scored 87/100, clearing the threshold. Stage 3 is a short asynchronous video interview about how you show up.'
              ) : isStage2Unlocked ? (
                `${companyName}'s hiring panel has your full file. Stage 2 takes about 60 to 100 minutes, split across three parts. You can pause between them. Your progress saves automatically.`
              ) : (
                `${companyName}'s hiring panel has your full file. Stage 1 takes about 35 minutes and is a single sitting. Your progress saves automatically.`
              )}
            </div>
          </div>
          <div className="ml-auto flex items-end">
            {isLocked ? (
              <Button
                onClick={() => navigate(`/onboarding/talent/${roleSlug}/cv`)}
                fullWidth={false}
                className="bg-[#DC2626] text-white shadow-[0_4px_14px_rgba(220,38,38,0.28)] hover:bg-[#B91C1C] flex items-center justify-center gap-2"
                pill={false}
              >
                <LockClosedIcon className="w-4 h-4" />
                Upload new CV to reset
              </Button>
            ) : isStage3Completed ? (
              <div className="flex items-center gap-1.5 text-[12px] font-[800] text-[#0047CC] bg-[#FAFCFF] border border-[#0047CC]/20 rounded-full px-4 py-2 uppercase tracking-[0.4px]">
                <DocumentCheckIcon className="w-3.5 h-3.5" />
                All stages complete
              </div>
            ) : (
              <Button 
                onClick={() => {
                  if (isStage3Unlocked && !isStage3Completed) {
                    navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                  } else if (isStage2Completed) {
                    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-3`);
                  } else if (isStage2Unlocked && !isStage2Completed) {
                    navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                  } else {
                    if (hasStartedStage1) {
                      navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                    } else {
                      handleStart();
                    }
                  }
                }}
                fullWidth={false}
                className="bg-[#0047CC] text-white rounded-full p-[12px_24px] text-[14px] font-[800] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)] transition-all flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)]"
              >
                {isStage2Completed 
                  ? 'Begin Stage 3' 
                  : isStage2Unlocked 
                    ? 'Begin Stage 2' 
                    : hasStartedStage1 
                      ? 'Resume assessment' 
                      : 'Begin Stage 1'}
              </Button>
            )}
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-[18px] flex justify-between items-end gap-[14px] flex-wrap">
          <div>
            <h2 className="text-[21px] font-[600] text-[#1A1A1A] tracking-[-0.3px] mb-[4px]">Your four stages</h2>
            <p className="text-[13.5px] text-[#808080] leading-[1.55]">Each stage builds on the last. Pass one and the next unlocks automatically.</p>
          </div>
          <div className="text-[12px] text-[#808080] font-[700] flex items-center gap-[6px]">
            {isStage3Unlocked ? '3 of 4 unlocked' : isStage2Unlocked ? '2 of 4 unlocked' : '1 of 4 unlocked'}
          </div>
        </div>

        {/* Stages timeline */}
        <div className={`grid grid-cols-1 gap-[14px] mb-[36px] relative before:hidden sm:before:block before:absolute before:left-[28px] before:top-[54px] before:bottom-[54px] before:w-[2px] before:bg-gradient-to-b before:from-[#0047CC] before:via-[#0047CC] ${isStage3Unlocked ? 'before:to-[#E6E6E6] before:via-[75%] before:to-[75%]' : isStage2Unlocked ? 'before:to-[#E6E6E6] before:via-[50%] before:to-[50%]' : 'before:to-[#E6E6E6] before:via-[25%] before:to-[25%]'} before:z-0`}>
          
          {/* Pre stage (done) */}
          <div className="bg-white border-[1.5px] border-[#0047CC]/20 rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all z-[1]">
            <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)]">
              <DocumentCheckIcon className="w-[22px] h-[22px] stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0 pt-[2px]">
              <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#0047CC]">Pre stage · Required gate</div>
              <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Onboarding materials</div>
              <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">The five things Reach Africa asked you for, plus your CV and verified profile on file. Everything submitted today at 14:25.</div>
              <div className="flex flex-wrap gap-[6px] mb-[14px]">
                {['Programme report', 'Research output', 'Written prompt', 'References', 'Portfolio links'].map((item) => (
                  <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                ))}
              </div>
            </div>
            <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-white border border-[#0047CC] text-[#0047CC]">
              Complete
            </div>
          </div>

          {/* Stage 1 (active/complete) */}
          <div 
            onClick={() => {
              if (isLocked) {
                navigate(`/onboarding/talent/${roleSlug}/cv`);
                return;
              }
              if (!gate1Completed) {
                if (hasStartedStage1) {
                  navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                } else {
                  void handleStart();
                }
              }
            }}
            className={gate1Completed 
              ? "bg-white border-[1.5px] border-[#0047CC]/20 rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all z-[1]"
              : isLocked
                ? "bg-white border-[1.5px] border-[#DC2626]/30 rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all z-[1] cursor-pointer group hover:border-[#DC2626]"
                : "bg-gradient-to-b from-[#FAFCFF] to-white border-[1.5px] border-[#0047CC] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all shadow-[0_8px_24px_rgba(0,71,204,0.1)] z-[1] cursor-pointer group"
            }
          >
            <div className={`w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] ${gate1Completed ? 'bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)]' : isLocked ? 'bg-gradient-to-br from-[#DC2626] to-[#EF4444] text-white shadow-[0_4px_14px_rgba(220,38,38,0.28)]' : 'text-[17px] font-[900] bg-gradient-to-br from-[#0047CC] to-[#387DFF] border-[1.5px] border-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.3)]'}`}>
              {gate1Completed ? <DocumentCheckIcon className="w-[22px] h-[22px] stroke-[3]" /> : isLocked ? <LockClosedIcon className="w-5 h-5 text-white" /> : '01'}
            </div>
            <div className="flex-1 min-w-0 pt-[2px]">
              <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#0047CC]">
                {gate1Completed
                  ? 'Stage 1 · Complete'
                  : isLocked
                    ? 'Stage 1 · Locked'
                    : hasStartedStage1
                      ? 'Stage 1 · In progress'
                      : 'Starting here'}
              </div>
              <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Getting to know you</div>
              {isLocked ? (
                <div className="text-[13px] text-[#DC2626] font-[600] leading-[1.5] mb-[14px]">
                  Your assessment is locked. Please submit a new CV on your profile to request a reset.
                </div>
              ) : (
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">A relaxed first stage about how you think, what you value, and your instincts in real situations. No clinical recall required. Just be yourself.</div>
              )}
              <div className="flex flex-wrap gap-[6px] mb-[14px]">
                {gate1Tags.map((item) => (
                  <span key={item} className={`text-[11px] font-[700] px-[10px] py-[4px] rounded-full border bg-white ${isLocked ? 'border-[#DC2626]/40 text-[#DC2626]' : 'border-[#0047CC] text-[#0047CC]'}`}>{item}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-[14px]">
                <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                  <ClockPlayIcon className="w-[13px] h-[13px]" />
                  {gate1EstimatedMinutes}
                </div>
                <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                  <WindowIcon className="w-[13px] h-[13px]" />
                  48 hour window
                </div>
                <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                  <ThresholdIcon className="w-[13px] h-[13px] text-[#808080]" />
                  80% to advance
                </div>
              </div>
            </div>
            <div className={`absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] border transition-all duration-200 ${
              gate1Completed
                ? 'bg-white border-[#0047CC] text-[#0047CC]'
                : isLocked
                  ? 'bg-white border-[#DC2626] text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white group-hover:border-[#DC2626] cursor-pointer'
                  : 'bg-white border-[#0047CC] text-[#0047CC] group-hover:bg-[#0047CC] group-hover:text-white group-hover:border-[#0047CC] cursor-pointer'
            }`}>
              {gate1Completed ? 'Complete' : isLocked ? 'Locked' : hasStartedStage1 ? 'Resume' : 'Start here'}
            </div>
          </div>

          {/* Stage 2 (locked/active) */}
          {isStage2Unlocked ? (
            <div 
              onClick={() => {
                if (isStage2Completed) {
                  navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/results`);
                } else {
                  navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                }
              }}
              className={`bg-white border-[1.5px] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all z-[1] ${
                isStage2Completed 
                  ? 'border-[#0047CC]/20 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                  : 'border-[#0047CC] cursor-pointer hover:shadow-[0_12px_32px_rgba(0,71,204,0.15)] shadow-[0_8px_24px_rgba(0,71,204,0.1)]'
              }`}
            >
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] text-[17px] font-[900] bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_14px_rgba(0,71,204,0.3)]">
                {isStage2Completed ? <DocumentCheckIcon className="w-[22px] h-[22px] stroke-[3]" /> : '02'}
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#0047CC]">
                  {isStage2Completed ? 'Stage 2 · Complete' : 'Starting here'}
                </div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Your professional dimension</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">A focused look at the work itself, built around your CV, onboarding profile and this exact role. Three parts. Knowledge, then reasoning, then applied simulation.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['Part 1 · Knowledge', 'Part 2 · Reasoning', 'Part 3 · Simulation'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    60 to 100 minutes
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <WindowIcon className="w-[13px] h-[13px]" />
                    72 hour window
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ThresholdIcon className="w-[13px] h-[13px] text-[#808080]" />
                    80% to advance
                  </div>
                </div>
              </div>
              <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-white border border-[#0047CC] text-[#0047CC] transition-all duration-200 group-hover:bg-[#0047CC] group-hover:text-white group-hover:border-[#0047CC] hover:bg-[#0047CC] hover:text-white hover:border-[#0047CC] cursor-pointer">
                {isStage2Completed ? 'Complete' : 'Start here'}
              </div>
            </div>
          ) : (
            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all opacity-[0.62] z-[1]">
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] text-[17px] font-[900] text-[#ADADAD]">
                02
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#ADADAD]">Up next once Stage 1 passes</div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Your professional dimension</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">A focused look at the work itself, built around your CV, onboarding profile and this exact role. Three parts. Knowledge, then reasoning, then applied simulation.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['Part 1 · Knowledge', 'Part 2 · Reasoning', 'Part 3 · Simulation'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    60 to 100 minutes
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <WindowIcon className="w-[13px] h-[13px]" />
                    72 hour window
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ThresholdIcon className="w-[13px] h-[13px] text-[#808080]" />
                    80% to advance
                  </div>
                </div>
              </div>
              <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-[#F7F7F7] text-[#ADADAD]">
                <LockRectIcon className="w-[10px] h-[10px]" />
                Locked
              </div>
            </div>
          )}

          {/* Stage 3 (locked/active) */}
          {isStage3Unlocked ? (
            <div 
              onClick={() => {
                if (!isStage3Completed) {
                  navigate(`/onboarding/talent/${roleSlug}/assessment/resume`);
                }
              }}
              className={`bg-white border-[1.5px] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all z-[1] ${
                isStage3Completed 
                  ? 'border-[#0047CC]/20 cursor-default shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                  : 'border-[#0047CC] cursor-pointer hover:shadow-[0_12px_32px_rgba(0,71,204,0.15)] shadow-[0_8px_24px_rgba(0,71,204,0.1)]'
              }`}
            >
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] text-[17px] font-[900] bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_14px_rgba(0,71,204,0.3)]">
                {isStage3Completed ? <DocumentCheckIcon className="w-[22px] h-[22px] stroke-[3]" /> : '03'}
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#0047CC]">
                  {isStage3Completed ? 'Stage 3 · Complete' : 'Starting here'}
                </div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">How you show up</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">A short asynchronous video interview. Five questions. Record live in your browser or upload pre recorded video, per question. Your face, your voice, your time.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['5 questions', 'Record or upload', 'Per question submit'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    ~25 minutes
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <WindowIcon className="w-[13px] h-[13px]" />
                    48 hour window
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <CameraMicIcon className="w-[13px] h-[13px]" />
                    Camera and mic
                  </div>
                </div>
              </div>
              <div className={`absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] border transition-all duration-200 ${
                isStage3Completed
                  ? 'bg-white border-[#0047CC] text-[#0047CC]'
                  : 'bg-white border-[#0047CC] text-[#0047CC] group-hover:bg-[#0047CC] group-hover:text-white group-hover:border-[#0047CC] hover:bg-[#0047CC] hover:text-white hover:border-[#0047CC] cursor-pointer'
              }`}>
                {isStage3Completed ? 'Complete' : 'Start here'}
              </div>
            </div>
          ) : (
            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all opacity-[0.62] z-[1]">
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] text-[17px] font-[900] text-[#ADADAD]">
                03
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#ADADAD]">After Stage 2 passes</div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">How you show up</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">A short asynchronous video interview. Five questions. Record live in your browser or upload pre recorded video, per question. Your face, your voice, your time.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['5 questions', 'Record or upload', 'Per question submit'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    ~25 minutes
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <WindowIcon className="w-[13px] h-[13px]" />
                    48 hour window
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <CameraMicIcon className="w-[13px] h-[13px]" />
                    Camera and mic
                  </div>
                </div>
              </div>
              <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-[#F7F7F7] text-[#ADADAD]">
                <LockRectIcon className="w-[10px] h-[10px]" />
                Locked
              </div>
            </div>
          )}

          {/* Stage 4 (locked/active) */}
          {isStage4Unlocked ? (
            <div className="bg-gradient-to-b from-[#FAFCFF] to-white border-[1.5px] border-[#0047CC] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all shadow-[0_8px_24px_rgba(0,71,204,0.1)] z-[1]">
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] text-[17px] font-[900] bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white shadow-[0_4px_14px_rgba(0,71,204,0.3)]">
                04
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#0047CC]">Active evaluation</div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Final decision</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">Reach Africa's hiring panel reviews your complete file and makes one of three calls. Hired. Invited to a 30 minute alignment session. Or this role isn't moving forward, with a path to your next match.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['Hired', 'Alignment session', 'Onward path'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    Couple of hours typically
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <GroupIcon className="w-[13px] h-[13px]" />
                    Reach Africa panel
                  </div>
                </div>
              </div>
              <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-white border border-[#0047CC] text-[#0047CC]">
                Under review
              </div>
            </div>
          ) : (
            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[22px_24px] flex gap-[18px] items-start relative transition-all opacity-[0.62] z-[1]">
              <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0 relative z-[2] bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] text-[17px] font-[900] text-[#ADADAD]">
                04
              </div>
              <div className="flex-1 min-w-0 pt-[2px]">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase mb-[4px] text-[#ADADAD]">The employer's call</div>
                <div className="text-[17px] font-[600] text-[#1A1A1A] mb-[6px] tracking-[-0.2px] leading-[1.3]">Final decision</div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.65] mb-[14px]">Reach Africa's hiring panel reviews your complete file and makes one of three calls. Hired. Invited to a 30 minute alignment session. Or this role isn't moving forward, with a path to your next match.</div>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {['Hired', 'Alignment session', 'Onward path'].map((item) => (
                    <span key={item} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">{item}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[14px]">
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <ClockPlayIcon className="w-[13px] h-[13px]" />
                    Couple of hours typically
                  </div>
                  <div className="flex items-center gap-[6px] text-[11.5px] font-[700] text-[#808080]">
                    <GroupIcon className="w-[13px] h-[13px]" />
                    Reach Africa panel
                  </div>
                </div>
              </div>
              <div className="absolute top-[22px] right-[22px] hidden sm:flex items-center gap-[6px] text-[11px] font-[800] px-[11px] py-[5px] rounded-full tracking-[0.4px] bg-[#F7F7F7] text-[#ADADAD]">
                <LockRectIcon className="w-[10px] h-[10px]" />
                Locked
              </div>
            </div>
          )}

        </div>

        {/* Honest principles */}
        <div className="bg-white border border-[#0047CC]/30 rounded-[18px] p-[26px_30px] mb-[24px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">How VORA works, in plain English</div>
          <div className="text-[18px] font-[600] text-[#182348] tracking-[-0.2px] mb-[14px] leading-[1.3]">Six things to know before you start</div>
          <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">Every question is generated for you specifically.</strong> Based on your CV, your onboarding profile, what Reach Africa asked for, and this exact role. No off the shelf questions.</div>
            </div>
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">Every question is quality checked by a separate model.</strong> A strict examiner reads each question before you see it. If it's unfair, off topic, or wrong for your seniority, it gets rejected before reaching you.</div>
            </div>
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">Each stage has an 80% pass threshold.</strong> Below that, the next stage stays locked and we point you to a clear path forward with someone genuinely world class in your field.</div>
            </div>
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">Save and finish later is built in.</strong> Pause anytime properly. When you return, your interview regenerates fresh questions on the same competency. You can't use the break to look things up.</div>
            </div>
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">Switching tabs auto submits in 3 seconds.</strong> This is the only anti cheat rule. Use Save and finish later if you need to step away. Don't worry, you'll see clear warnings.</div>
            </div>
            <div className="flex gap-[11px] items-start text-[13.5px] text-[#182348] leading-[1.6]">
              <div className="w-[6px] h-[6px] rounded-full bg-[#0047CC] shrink-0 mt-[7px]" />
              <div><strong className="font-[800]">No right answers in Stage 1.</strong> We're reading you, not testing you. Honest answers give the strongest match. Stages 2 and 3 do have stronger and weaker answers, and we tell you clearly when that's the case.</div>
            </div>
          </div>
        </div>

        {/* Quick rules */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[24px_28px] mb-[32px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Before you begin</div>
          <div className="text-[18px] font-[600] text-[#1A1A1A] tracking-[-0.2px] mb-[18px] leading-[1.3]">A few practical things to set up</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div className="flex gap-[13px] items-start p-[14px_16px] bg-[#F7F7F7] rounded-[12px]">
              <div className="w-[32px] h-[32px] rounded-[9px] bg-white border border-[#E6E6E6] flex items-center justify-center text-[#0047CC] shrink-0">
                <WifiIcon className="w-[14px] h-[14px]" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">A stable internet connection</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Most interview screens auto save every few seconds. You're safe even on flaky wifi.</div>
              </div>
            </div>
            <div className="flex gap-[13px] items-start p-[14px_16px] bg-[#F7F7F7] rounded-[12px]">
              <div className="w-[32px] h-[32px] rounded-[9px] bg-white border border-[#E6E6E6] flex items-center justify-center text-[#0047CC] shrink-0">
                <LaptopIcon className="w-[14px] h-[14px]" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">A laptop or desktop preferred</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Stages 1 and 2 work fine on phone. Stage 3 video records best on a laptop with a real microphone.</div>
              </div>
            </div>
            <div className="flex gap-[13px] items-start p-[14px_16px] bg-[#F7F7F7] rounded-[12px]">
              <div className="w-[32px] h-[32px] rounded-[9px] bg-white border border-[#E6E6E6] flex items-center justify-center text-[#0047CC] shrink-0">
                <ClockPlayIcon className="w-[14px] h-[14px]" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">A clear half hour for Stage 1</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">You don't have to finish in one sitting, but most candidates do. Put your phone face down.</div>
              </div>
            </div>
            <div className="flex gap-[13px] items-start p-[14px_16px] bg-[#EBF6FF] rounded-[12px]">
              <div className="w-[32px] h-[32px] rounded-[9px] bg-white border border-[#0047CC]/20 flex items-center justify-center text-[#0047CC] shrink-0">
                <AlertTriangleCustomIcon className="w-[14px] h-[14px]" />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">Don't switch tabs mid interview</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">If you need a real break, tap Save and finish later. It's the only way to pause without losing the timer.</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default RoleAssessmentJourney;
