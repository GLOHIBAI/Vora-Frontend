import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';
import AssessmentItemsList from './assessment/AssessmentItemsList';
import { useLocalAssessmentScreen } from '../../hooks/useLocalAssessmentScreen';
import { questionsToMcqItems } from '../../mocks/stage1AssessmentScreens';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export interface Option {
  letter: string;
  text: string;
}

export interface Question {
  id: string;
  numText: string;
  questionText: string;
  options: Option[];
  scenarioTag?: string;
  scenarioText?: string;
}

interface StageTwoInterviewBaseProps {
  interviewNumber: number; // e.g., 1 or 2
  interviewTitle: string; // e.g., "Pharmacology in the field"
  sectionTitle: string;
  sectionSub: string;
  whyMattersText: string;
  questions: Question[];
  nextPath: string;
  partNumber?: number;
  timeLimitSeconds?: number;
  topContent?: React.ReactNode;
}

const RoleAssessmentStageTwoInterviewBase: React.FC<StageTwoInterviewBaseProps> = ({
  interviewNumber,
  interviewTitle,
  sectionTitle,
  sectionSub,
  whyMattersText,
  questions,
  nextPath,
  partNumber = 1,
  timeLimitSeconds = 10 * 60,
  topContent,
}) => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState<number>(timeLimitSeconds);
  const [savedForLater, setSavedForLater] = useState<boolean>(false);

  // Selected answers via reusable assessment item renderer
  const mcqItems = useMemo(() => questionsToMcqItems(questions), [questions]);
  const { answers, recordAnswer, isLocked, isScreenComplete } =
    useLocalAssessmentScreen(mcqItems);

  // Modals state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [cheatCountdown, setCheatCountdown] = useState<number>(3);
  const [alreadyCheated, setAlreadyCheated] = useState<boolean>(false);

  // Refs for tracking timers
  const blurTimerRef = useRef<any | null>(null);
  const cheatCountdownRef = useRef<any | null>(null);

  // Timer effect
  useEffect(() => {
    if (savedForLater || showCheatModal) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit('time-up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [savedForLater, showCheatModal]);

  // Anti-cheat visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !savedForLater && !alreadyCheated) {
        blurTimerRef.current = setTimeout(() => {
          handleSubmit('tab-switch');
        }, 3000);
      } else if (!document.hidden) {
        if (blurTimerRef.current) {
          clearTimeout(blurTimerRef.current);
          blurTimerRef.current = null;
          if (!alreadyCheated) {
            setAlreadyCheated(true);
            triggerCheatWarning();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      if (cheatCountdownRef.current) clearInterval(cheatCountdownRef.current);
    };
  }, [alreadyCheated, savedForLater]);

  const triggerCheatWarning = () => {
    setShowCheatModal(true);
    let n = 3;
    setCheatCountdown(n);

    cheatCountdownRef.current = setInterval(() => {
      n--;
      setCheatCountdown(n);
      if (n <= 0) {
        if (cheatCountdownRef.current) clearInterval(cheatCountdownRef.current);
        handleSubmit('tab-switch');
      }
    }, 1000);
  };

  const handleSubmit = (reason?: string) => {
    if (reason) {
      sessionStorage.setItem('submitReason', reason);
    }
    toast.success('Interview submitted successfully!');
    navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
  };

  const confirmSaveAndExit = () => {
    setSavedForLater(true);
    toast.success('Progress saved successfully.');
    navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isAllAnswered = isScreenComplete;

  const timerChipClass = () => {
    if (secondsLeft <= 60) return 'timer-chip warn';
    if (secondsLeft <= 180) return 'timer-chip caution';
    return 'timer-chip';
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      <style>{`
        .timer-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #EBF6FF;
          border: 1.5px solid #387DFF;
          border-radius: 100px;
          padding: 6px 14px;
          color: #0047CC;
          font-weight: 800;
          font-size: 13.5px;
          font-variant-numeric: tabular-nums;
          transition: all 0.3s;
        }
        .timer-chip.caution {
          background: #FEF3C7;
          border-color: #FDE68A;
          color: #D97706;
        }
        .timer-chip.warn {
          background: #FEF2F2;
          border-color: #FCA5A5;
          color: #DC2626;
          animation: pulseWarn 1s ease-in-out infinite;
        }
        @keyframes pulseWarn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
        }
      `}</style>

      {/* Topbar */}
      <AssessmentHeader
        middleContent={
          <span className="hidden sm:inline">
            Stage 2 · Part {partNumber} · Interview {interviewNumber} of 3
          </span>
        }
        rightContent={
          <div className="flex items-center gap-[14px]">
            <div className={timerChipClass()}>
              <ClockIcon className="w-[14px] h-[14px] mr-[4px] inline-block align-middle" />
              <span className="font-[800] text-[13.5px] tabular-nums inline-block align-middle">
                {formatTime(secondsLeft)}
              </span>
            </div>
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              <DocumentCheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
              Auto-saved
            </div>
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={2} showBottomBorder={false} />

      {/* Part Rail */}
      <PartRail activePart={partNumber} />

      {/* Pebble Rail */}
      <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[6px]">
        <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber >= 2 ? 'bg-[#387DFF]' : 'bg-[#E6E6E6]'}`} />
        <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber >= 3 ? 'bg-[#387DFF]' : interviewNumber === 2 ? 'bg-[#0047CC] w-[48px]' : 'bg-[#E6E6E6]'}`} />
        <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber === 3 ? 'bg-[#0047CC] w-[48px]' : 'bg-[#E6E6E6]'}`} />
      </div>

      {/* Main Body */}
      <main className="max-w-[780px] w-full mx-auto px-[24px] py-[32px] pb-[90px] flex-1">
        <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[11px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
          Interview {interviewNumber} · {interviewTitle}
        </div>
        <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
          {sectionTitle}
        </h1>
        <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">
          {sectionSub}
        </p>

        {/* Why matters component (removed left border accent) */}
        <div className="bg-[#EBF6FF] rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
          <InfoIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1px]" />
          <p className="text-[12.5px] text-[#182348] leading-[1.5]">
            <strong className="font-[800]">Why this matters · </strong>{whyMattersText}
          </p>
        </div>

        {topContent && <div className="mb-[22px]">{topContent}</div>}

        {/* Questions reusable item components by type (mcq) */}
        <AssessmentItemsList
          items={mcqItems}
          answers={answers}
          isLocked={isLocked}
          onAnswer={(itemId, val, item, subKey) => void recordAnswer(itemId, val, item, subKey)}
        />
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[13px] text-[#808080] font-[600]">
          Interview {interviewNumber} of 3 · Part {partNumber}
        </div>
        <div className="flex gap-[10px] items-center">
          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans"
          >
            Save and finish later
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={!isAllAnswered}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:bg-[#E6E6E6] disabled:shadow-none disabled:cursor-not-allowed font-sans"
          >
            {interviewNumber === 3 ? `Complete Part ${partNumber}` : 'Submit interview'}
          </button>
        </div>
      </footer>

      {/* Save and Exit Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-[24px] z-[200]">
          <div className="bg-white rounded-[18px] max-w-[440px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center mx-auto mb-[16px]">
              <SaveIcon className="w-[30px] h-[30px]" />
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] mb-[8px] tracking-[-0.2px]">
              Pause this interview properly
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-[18px]">
              Your timer will be saved and Stage 2's 72-hour deadline still applies. When you return, a fresh set of questions will be generated to protect the integrity of your reading.
            </p>
            <p className="text-[12.5px] text-[#808080] leading-[1.4] mb-[20px]">
              You won't be able to use what you saw here as preparation. That's by design.
            </p>
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button
                onClick={() => setShowSaveModal(false)}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans"
              >
                Keep going
              </button>
              <button
                onClick={confirmSaveAndExit}
                className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] font-sans"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-cheat Alert Modal */}
      {showCheatModal && (
        <div className="fixed inset-0 bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-[24px] z-[200]">
          <div className="bg-white rounded-[18px] max-w-[440px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-[16px]">
              <AlertTriangleIcon className="w-[30px] h-[30px]" />
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] mb-[8px] tracking-[-0.2px]">
              You navigated away from this tab
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-[18px]">
              Leaving the interview tab is not allowed. Your interview will auto-submit in:
            </p>
            <div className="inline-block bg-[#FEF2F2] text-[#B91C1C] font-[900] text-[20px] p-[4px_14px] rounded-[8px] mb-[14px] tabular-nums">
              {cheatCountdown}
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.4]">
              To pause properly, use <strong>Save and finish later</strong> next time. When you return, fresh questions will be generated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssessmentStageTwoInterviewBase;
