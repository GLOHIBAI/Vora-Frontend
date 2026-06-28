import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke-linecap="round"/>
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

interface StageTwoSimulationBaseProps {
  simulationNumber: number; // 1, 2, 3, or 4
  simulationTitle: string; // e.g., "Safeguarding referral write-up"
  sectionTitle: string;
  sectionSub: string;
  whyMattersText: string;
  scenarioTag: string;
  scenarioTitle: string;
  scenarioBody: React.ReactNode;
  briefTitle: string;
  briefItems: string[];
  editorPlaceholder: string;
  editorLabel: string;
  editorSubtext: string;
  wordCountMin: number;
  wordCountMax: number;
  nextPath: string;
  timeLimitSeconds?: number;
}

const RoleAssessmentStageTwoSimulationBase: React.FC<StageTwoSimulationBaseProps> = ({
  simulationNumber,
  simulationTitle,
  sectionTitle,
  sectionSub,
  whyMattersText,
  scenarioTag,
  scenarioTitle,
  scenarioBody,
  briefTitle,
  briefItems,
  editorPlaceholder,
  editorLabel,
  editorSubtext,
  wordCountMin,
  wordCountMax,
  nextPath,
  timeLimitSeconds = 10 * 60,
}) => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  // Editor and Word count states
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [isBoldActive, setIsBoldActive] = useState<boolean>(false);
  const [isItalicActive, setIsItalicActive] = useState<boolean>(false);

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState<number>(timeLimitSeconds);
  const [savedForLater, setSavedForLater] = useState<boolean>(false);

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

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
  };

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    // Update active states
    setIsBoldActive(document.queryCommandState('bold'));
    setIsItalicActive(document.queryCommandState('italic'));
  };

  const handleSubmit = (reason?: string) => {
    if (reason) {
      sessionStorage.setItem('submitReason', reason);
    }
    if (simulationNumber === 4) {
      toast.success('Stage 2 completed successfully!');
    } else {
      toast.success(`Simulation ${simulationNumber} submitted successfully!`);
    }
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

  const canSubmit = wordCount >= 80;

  const timerChipClass = () => {
    if (secondsLeft <= 60) return 'timer-chip warn';
    if (secondsLeft <= 180) return 'timer-chip caution';
    return 'timer-chip';
  };

  const getCounterClass = () => {
    if (wordCount >= wordCountMin && wordCount <= wordCountMax) return 'text-[#1D871D] font-bold';
    if (wordCount > wordCountMax) return 'text-[#D97706] font-bold';
    return 'text-[#808080]';
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
        .editor:empty::before {
          content: "${editorPlaceholder}";
          color: #ADADAD;
          font-style: italic;
          pointer-events: none;
        }
      `}</style>

      {/* Topbar */}
      <AssessmentHeader
        middleContent={
          <span className="hidden sm:inline">
            Stage 2 · Part 3 · Simulation {simulationNumber} of 4
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
      <PartRail activePart={3} />

      {/* Pebble Rail */}
      <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[6px]">
        <div className={`w-[32px] h-[5px] rounded-full ${simulationNumber >= 2 ? 'bg-[#387DFF]' : 'bg-[#E6E6E6]'}`} />
        <div className={`w-[32px] h-[5px] rounded-full ${simulationNumber >= 3 ? 'bg-[#387DFF]' : 'bg-[#E6E6E6]'}`} />
        <div className={`w-[32px] h-[5px] rounded-full ${simulationNumber >= 4 ? 'bg-[#387DFF]' : 'bg-[#E6E6E6]'}`} />
        <div className={`w-[32px] h-[5px] rounded-full ${simulationNumber === 4 ? 'bg-[#0047CC] w-[48px]' : 'bg-[#E6E6E6]'}`} />
      </div>

      {/* Main Body */}
      <main className="max-w-[920px] w-full mx-auto px-[28px] py-[32px] pb-[90px] flex-1">
        <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[11.5px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
          <svg className="w-[10px] h-[10px] fill-current" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/></svg>
          Simulation {simulationNumber} · {simulationTitle}
        </div>
        <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
          {sectionTitle}
        </h1>
        <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">
          {sectionSub}
        </p>

        {/* Why mini block */}
        <div className="bg-[#EBF6FF] border-l-[3px] border-[#0047CC] rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
          <InfoIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1px]" />
          <p className="text-[12.5px] text-[#182348] leading-[1.5]">
            <strong className="font-[800]">Why this matters · </strong>{whyMattersText}
          </p>
        </div>

        {/* Scenario Pack */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[24px_26px] mb-[18px]">
          <span className="inline-block text-[10.5px] font-[800] bg-[#EBF6FF] text-[#0047CC] px-[9px] py-[3px] rounded-[6px] tracking-[0.5px] uppercase mb-[12px]">
            {scenarioTag}
          </span>
          <div className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[12px] leading-[1.35]">
            {scenarioTitle}
          </div>
          <div className="text-[13.5px] text-[#1A1A1A] leading-[1.7] mb-[14px]">
            {scenarioBody}
          </div>

          <div className="bg-[#EBF6FF] border-l-[3px] border-[#0047CC] rounded-[8px] p-[14px_16px] mt-[14px]">
            <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[8px]">
              {briefTitle}
            </div>
            <ul className="list-none flex flex-col gap-[6px]">
              {briefItems.map((item, idx) => (
                <li key={idx} className="text-[12.5px] text-[#182348] font-[600] pl-[14px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#0047CC]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Writing Block */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] overflow-hidden mb-[18px]">
          <div className="px-[18px] py-[14px] border-b border-[#E6E6E6] flex items-center justify-between bg-[#FBFCFF]">
            <div className="text-[12px] font-[800] text-[#1A1A1A] flex items-center gap-[8px]">
              <svg className="w-[14px] h-[14px] text-[#0047CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {editorLabel}
            </div>
            <div className="flex items-center gap-[4px]">
              <button
                onClick={() => executeCommand('bold')}
                className={`bg-none border-none text-[#808080] p-[6px] rounded-[6px] cursor-pointer font-bold text-[12px] hover:bg-[#F7F7F7] hover:text-[#1A1A1A] ${isBoldActive ? 'bg-[#EBF6FF] text-[#0047CC]' : ''}`}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => executeCommand('italic')}
                className={`bg-none border-none text-[#808080] p-[6px] rounded-[6px] cursor-pointer font-bold text-[12px] hover:bg-[#F7F7F7] hover:text-[#1A1A1A] ${isItalicActive ? 'bg-[#EBF6FF] text-[#0047CC]' : ''}`}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => executeCommand('insertUnorderedList')}
                className="bg-none border-none text-[#808080] p-[6px] rounded-[6px] cursor-pointer font-bold text-[12px] hover:bg-[#F7F7F7] hover:text-[#1A1A1A]"
                title="Bulleted list"
              >
                •
              </button>
            </div>
          </div>
          <div
            ref={editorRef}
            id="editor"
            className="editor p-[18px_20px] min-h-[280px] outline-none text-[14px] text-[#1A1A1A] leading-[1.75]"
            contentEditable="true"
            onInput={handleEditorInput}
          />
          <div className="px-[18px] py-[10px] border-t border-[#E6E6E6] flex items-center justify-between bg-[#FBFCFF] text-[11.5px] text-[#808080] font-[600]">
            <div className={`count-pill ${getCounterClass()}`}>
              {wordCount} words · aim for {wordCountMin} to {wordCountMax}
            </div>
            <span className="text-[#ADADAD]">{editorSubtext}</span>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[13px] text-[#808080] font-[600]">
          Simulation {simulationNumber} of 4 · Part 3 · {simulationNumber === 4 ? 'Final simulation' : 'Simulation'}
        </div>
        <div className="flex gap-[10px]">
          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans"
          >
            Save and finish later
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={!canSubmit}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:bg-[#E6E6E6] disabled:shadow-none disabled:cursor-not-allowed font-sans"
          >
            {simulationNumber === 4 ? 'Complete Stage 2' : 'Next simulation'}
            <ArrowRightIcon className="w-[14px] h-[14px]" />
          </button>
        </div>
      </footer>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-[24px] z-[200]">
          <div className="bg-white rounded-[18px] max-w-[440px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center mx-auto mb-[16px]">
              <SaveIcon className="w-[30px] h-[30px]" />
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] mb-[8px] tracking-[-0.2px]">
              Pause this simulation
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-[18px]">
              Your timer will be saved and Stage 2's 72-hour deadline still applies. When you return, a <strong>fresh scenario</strong> on the same competency will be generated.
            </p>
            <p className="text-[12.5px] text-[#808080] leading-[1.4] mb-[20px]">
              Your draft will not be carried over. The new scenario will be a different patient.
            </p>
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button
                onClick={() => setShowSaveModal(false)}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans"
              >
                Keep writing
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
              Leaving the simulation is not allowed. Your draft will auto-submit in:
            </p>
            <div className="inline-block bg-[#FEF2F2] text-[#B91C1C] font-[900] text-[20px] p-[4px_14px] rounded-[8px] mb-[14px] tabular-nums">
              {cheatCountdown}
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.4]">
              To pause properly, use <strong>Save and finish later</strong> next time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAssessmentStageTwoSimulationBase;
