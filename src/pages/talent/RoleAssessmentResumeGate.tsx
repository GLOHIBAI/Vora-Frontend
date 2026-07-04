import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useAuth } from '../../context/AuthContext';
import { useGate1ResumePresentation } from '../../hooks/useGate1ResumePresentation';
import { formatSecondsAsHms } from '../../utils/assessmentSession';
import { isGate1ApiEnabled, resolveGate1AssessmentId } from '../../config/gate1Api';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M6 4l4 4-4 4"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 9h6v6H9z"/>
  </svg>
);

interface StageConfig {
  activeStepNum: number;
  welcomeText: string;
  pausedTimeText: string;
  positionTitle: string;
  positionDesc: string;
  crumbs: string[];
  deadlineLabel: string;
  deadlineRemainingSeconds: number | null;
  deadlineTotalFormatted: string;
  interviewTimerLabel: string;
  interviewTimerValue: string;
  completedLabel: string;
  completedValue: string;
  completedSub: string;
  resumePath: string;
  showRegenerationNotice: boolean;
  rulesList: { text: string; icon: React.FC<{ className?: string }> }[];
}

const STAGE1_RULES = [
  { text: 'Each section has its own timed window where applicable', icon: ClockIcon },
  { text: "Don't switch tabs. Doing so auto-submits in 3 seconds", icon: StopIcon },
  { text: 'Pause properly with Save and finish later if you need to', icon: CheckIcon },
];

const RoleAssessmentResumeGate: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  const {
    viewModel: gate1View,
    gateProgress,
    isLoading: gate1Loading,
  } = useGate1ResumePresentation(roleSlug);

  const assessmentId = resolveGate1AssessmentId();

  const avatarText = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }
    return 'AO';
  }, [user]);

  const isStage2Unlocked = localStorage.getItem('vora_stage2_unlocked') === 'true';
  const isStage2Completed = localStorage.getItem('vora_stage2_completed') === 'true';
  const isStage3Unlocked = localStorage.getItem('vora_stage3_unlocked') === 'true';
  const isStage3Completed = localStorage.getItem('vora_stage3_completed') === 'true';

  const gate1InProgress =
    gateProgress?.status === 'in_progress' ||
    (gateProgress != null &&
      gateProgress.status !== 'passed' &&
      gateProgress.status !== 'failed' &&
      gateProgress.completedScreens > 0);

  const currentStage = useMemo(() => {
    if (isStage3Unlocked && !isStage3Completed) return 3;
    if (isStage2Unlocked && !isStage2Completed) return 2;
    if (gate1InProgress || gate1View) return 1;
    return 1;
  }, [isStage2Unlocked, isStage2Completed, isStage3Unlocked, isStage3Completed, gate1InProgress, gate1View]);

  useEffect(() => {
    if (currentStage === 1 && !assessmentId && isGate1ApiEnabled() && !gate1Loading) {
      navigate(`/onboarding/talent/${roleSlug}/assessment/stage-1`, { replace: true });
    }
  }, [currentStage, assessmentId, roleSlug, navigate, gate1Loading]);

  const staticConfigs: Record<number, StageConfig> = useMemo(() => ({
    2: {
      activeStepNum: 2,
      welcomeText: 'You paused mid-way through Stage 2. Your timer kept running, but everything else is exactly where you left it.',
      pausedTimeText: 'Paused recently',
      positionTitle: 'Professional dimension',
      positionDesc: "You'd worked through about half of the questions when you tapped Save and finish later.",
      crumbs: ['Stage 2', 'Part 1 · Knowledge', 'Interview 1 of 3'],
      deadlineLabel: 'Stage 2 deadline',
      deadlineRemainingSeconds: null,
      deadlineTotalFormatted: '72:00:00',
      interviewTimerLabel: 'Interview timer',
      interviewTimerValue: '10:00',
      completedLabel: 'Completed so far',
      completedValue: '0 / 3',
      completedSub: 'interviews in Part 1',
      resumePath: `/onboarding/talent/${roleSlug}/assessment/stage-2/part-1/interview-1`,
      showRegenerationNotice: true,
      rulesList: [
        { text: 'Each interview has its own 10 to 12 minute timer', icon: ClockIcon },
        { text: "Don't switch tabs. Doing so auto-submits in 3 seconds", icon: StopIcon },
        { text: 'Pause properly with Save and finish later if you need to', icon: CheckIcon },
      ],
    },
    3: {
      activeStepNum: 3,
      welcomeText: 'You paused mid-way through Stage 3. Your timer kept running, but everything else is exactly where you left it.',
      pausedTimeText: 'Paused recently',
      positionTitle: 'Video Interview responses',
      positionDesc: "You'd submitted some video answers when you tapped Save and finish later.",
      crumbs: ['Stage 3', 'How you show up', 'Video responses'],
      deadlineLabel: 'Stage 3 deadline',
      deadlineRemainingSeconds: null,
      deadlineTotalFormatted: '48:00:00',
      interviewTimerLabel: 'Response timer',
      interviewTimerValue: '3:00',
      completedLabel: 'Completed so far',
      completedValue: '0 / 5',
      completedSub: 'questions recorded',
      resumePath: `/onboarding/talent/${roleSlug}/assessment/stage-3/video`,
      showRegenerationNotice: true,
      rulesList: [
        { text: 'Each response has a 30s think time and 3m record limit', icon: ClockIcon },
        { text: "Don't switch tabs. Doing so auto-submits in 3 seconds", icon: StopIcon },
        { text: 'Pause properly with Save and finish later if you need to', icon: CheckIcon },
      ],
    },
  }), [roleSlug]);

  const config: StageConfig = useMemo(() => {
    if (currentStage === 1 && gate1View) {
      return {
        activeStepNum: 1,
        welcomeText: gate1View.welcomeText,
        pausedTimeText: gate1View.pausedTimeText,
        positionTitle: gate1View.positionTitle,
        positionDesc: gate1View.positionDesc,
        crumbs: gate1View.crumbs,
        deadlineLabel: gate1View.deadlineLabel,
        deadlineRemainingSeconds: gate1View.deadlineRemainingSeconds,
        deadlineTotalFormatted: gate1View.deadlineTotalFormatted,
        interviewTimerLabel: gate1View.screenTimerLabel,
        interviewTimerValue: gate1View.screenTimerValue,
        completedLabel: 'Completed so far',
        completedValue: gate1View.completedValue,
        completedSub: gate1View.completedSub,
        resumePath: gate1View.resumePath,
        showRegenerationNotice: gate1View.showRegenerationNotice,
        rulesList: STAGE1_RULES,
      };
    }

    if (currentStage === 1) {
      return {
        activeStepNum: 1,
        welcomeText: 'You paused mid-way through Stage 1. Your timer kept running, but everything else is exactly where you left it.',
        pausedTimeText: 'Paused recently',
        positionTitle: 'Getting to know you',
        positionDesc: 'Your progress is saved. Resume to continue Stage 1.',
        crumbs: ['Stage 1', 'Getting to know you'],
        deadlineLabel: 'Stage 1 deadline',
        deadlineRemainingSeconds: null,
        deadlineTotalFormatted: '48:00:00',
        interviewTimerLabel: 'Section timer',
        interviewTimerValue: '—',
        completedLabel: 'Completed so far',
        completedValue: '—',
        completedSub: 'screens in Stage 1',
        resumePath: isGate1ApiEnabled()
          ? `/onboarding/talent/${roleSlug}/assessment/gate-1/active`
          : `/onboarding/talent/${roleSlug}/assessment/session-1/situational`,
        showRegenerationNotice: false,
        rulesList: STAGE1_RULES,
      };
    }

    return staticConfigs[currentStage] ?? staticConfigs[2];
  }, [currentStage, gate1View, roleSlug, staticConfigs]);

  const [timeLeft, setTimeLeft] = useState<number | null>(config.deadlineRemainingSeconds);

  useEffect(() => {
    setTimeLeft(config.deadlineRemainingSeconds);
  }, [config.deadlineRemainingSeconds]);

  useEffect(() => {
    if (timeLeft == null) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev != null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft != null]);

  const handleNotNow = () => {
    navigate('/dashboard');
  };

  const handleResume = () => {
    navigate(config.resumePath);
  };

  const isPageLoading = currentStage === 1 && gate1Loading && !gate1View;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <FullPageSpinner isFullPage={false} message="Loading your saved progress…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
      }} />

      <AssessmentHeader
        middleContent="Resume your interviews"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="w-[13px] h-[13px] text-[#2CA62C]" />
            Progress saved
          </div>
        }
      />

      <StageRail activeStage={config.activeStepNum} greenDone={false} />

      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] shadow-[0_12px_48px_rgba(10,17,114,0.1)] max-w-[600px] w-full overflow-hidden animate-[fadeUp_0.55s_ease_both] relative border border-[#E6E6E6]">
          <div className="bg-gradient-to-br from-[#182348] to-[#0047CC] text-white p-[30px_36px_26px] relative overflow-hidden">
            <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/[0.05]" />

            <div className="relative z-10 flex gap-[18px] items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-white/[0.16] border-2 border-white/[0.3] flex items-center justify-center text-white font-[900] text-[18px] shrink-0 backdrop-blur-[8px]">
                {avatarText}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[22px] font-[900] tracking-[-0.3px] leading-[1.25] mb-[4px]">
                  Welcome back, {firstName}
                </h1>
                <p className="text-[13.5px] text-white/84 leading-[1.55]">
                  {config.welcomeText}
                </p>
              </div>
            </div>
          </div>

          <div className="p-[28px_36px_32px] sm:px-[36px] px-6">
            <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[8px]">
              Where you left off
            </div>

            <div className="bg-gradient-to-b from-[#EBF6FF] to-[#F8FBFF] border border-[#EBF6FF] rounded-[14px] p-[18px_20px] mb-[18px]">
              <div className="text-[11.5px] font-[700] text-[#808080] mb-[6px] flex items-center gap-[6px]">
                <ClockIcon className="w-[13px] h-[13px] text-[#0047CC]" />
                {config.pausedTimeText}
              </div>
              <div className="text-[17px] font-[900] text-[#182348] tracking-[-0.2px] mb-[3px]">
                {config.positionTitle}
              </div>
              <div className="text-[13px] text-[#4A4A4A] leading-[1.55] mb-[12px]">
                {config.positionDesc}
              </div>

              <div className="flex items-center gap-[6px] flex-wrap font-[700] text-[12px] text-[#808080]">
                {config.crumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ArrowRightIcon className="w-[10px] h-[10px] text-[#ADADAD]" />}
                    <span className={`px-2 py-1 border rounded-[6px] ${
                      idx === config.crumbs.length - 1
                        ? 'bg-[#0047CC] text-white border-[#0047CC]'
                        : 'bg-white border-[#E6E6E6] text-[#4A4A4A]'
                    }`}>
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex gap-[10px] mb-[22px] items-stretch flex-wrap">
              <div className="flex-1 min-w-[140px] bg-gradient-to-b from-[#F0F4FF] to-white border border-[#387DFF]/30 rounded-[12px] p-[12px_14px]">
                <div className="text-[10px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[4px]">
                  {config.deadlineLabel}
                </div>
                <div className="text-[18px] font-[900] text-[#0047CC] tabular-nums tracking-[-0.2px]">
                  {timeLeft != null ? formatSecondsAsHms(timeLeft) : config.deadlineTotalFormatted}
                </div>
                <div className="text-[11px] text-[#4A4A4A] font-[600] mt-[2px]">
                  {timeLeft != null
                    ? `remaining out of ${config.deadlineTotalFormatted}`
                    : '48-hour assessment window'}
                </div>
              </div>

              <div className="flex-1 min-w-[140px] bg-white border border-[#E6E6E6] rounded-[12px] p-[12px_14px]">
                <div className="text-[10px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-[4px]">
                  {config.interviewTimerLabel}
                </div>
                <div className="text-[18px] font-[900] text-[#1A1A1A] tabular-nums tracking-[-0.2px]">
                  {config.interviewTimerValue}
                </div>
                <div className="text-[11px] text-[#808080] font-[600] mt-[2px]">
                  {config.showRegenerationNotice
                    ? 'resets on the new question set'
                    : 'for this section'}
                </div>
              </div>

              <div className="flex-1 min-w-[140px] bg-white border border-[#E6E6E6] rounded-[12px] p-[12px_14px]">
                <div className="text-[10px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-[4px]">
                  {config.completedLabel}
                </div>
                <div className="text-[18px] font-[900] text-[#1A1A1A] tabular-nums tracking-[-0.2px]">
                  {config.completedValue}
                </div>
                <div className="text-[11px] text-[#808080] font-[600] mt-[2px]">
                  {config.completedSub}
                </div>
              </div>
            </div>

            {config.showRegenerationNotice ? (
              <div className="bg-gradient-to-b from-[#F0F4FF] to-white border border-[#387DFF]/30 rounded-[12px] p-[16px_18px] mb-[24px] flex gap-[12px] items-start animate-pulse">
                <InfoIcon className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" />
                <div>
                  <div className="text-[14px] font-[800] text-[#0047CC] mb-[5px]">
                    Your questions have been regenerated
                  </div>
                  <div className="text-[13px] text-[#182348] leading-[1.6]">
                    Each time you pause and resume, the system generates a <strong>fresh set of questions</strong> on the same competency. This means you can&apos;t use the break to look things up. Same difficulty, same depth, different questions. <strong>It&apos;s by design.</strong>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-[#F7F7F7] rounded-[10px] p-[14px_16px] mb-[22px]">
              <div className="text-[11px] font-[800] tracking-[0.5px] uppercase text-[#808080] mb-[8px]">
                Quick reminders before you continue
              </div>
              <div className="flex flex-col gap-[6px]">
                {config.rulesList.map((rule, idx) => {
                  const RuleIcon = rule.icon;
                  return (
                    <div key={idx} className="flex gap-[9px] items-center font-[600] text-[12.5px] text-[#1A1A1A]">
                      <RuleIcon className="w-[14px] h-[14px] text-[#0047CC] shrink-0" />
                      {rule.text}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-[10px] flex-wrap">
              <button
                onClick={handleNotNow}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[14px_22px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7]"
              >
                Not now
              </button>

              <button
                onClick={handleResume}
                className="flex-1 min-w-[200px] bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[10px] p-[14px_24px] text-[14px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:translate-y-[-1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)]"
              >
                Resume interview
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentResumeGate;
