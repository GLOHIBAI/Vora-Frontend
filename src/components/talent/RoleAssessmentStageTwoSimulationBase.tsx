import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';
import FullPageSpinner from '../common/FullPageSpinner';
import {
  useStartAssessmentScreenMutation,
  useSaveAssessmentDraftMutation,
  useSubmitAssessmentScreenMutation,
  useAssessmentDraftQuery,
  fetchGate2PillarItems,
} from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getApiErrorMessage } from '../../services/api';
import { getReasonMinWords } from '../../utils/reasonMinWords';
import { gate2PillarStartPath, gate2PillarIntroPath } from '../../utils/stage2Flow';
import type {
  AssessmentGateStartResponse,
  AssessmentItem,
} from '../../services/queries/assessments/types';

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

interface StageTwoSimulationBaseProps {
  simulationNumber: number;
  nextPath: string;
  totalSimulations?: number;
}

const unwrapScreen = (raw: unknown): AssessmentGateStartResponse | null => {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const data = (root.data && typeof root.data === 'object' ? root.data : root) as AssessmentGateStartResponse;
  return data?.items ? data : null;
};

const RoleAssessmentStageTwoSimulationBase: React.FC<StageTwoSimulationBaseProps> = ({
  simulationNumber,
  nextPath,
  totalSimulations = 4,
}) => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const editorRef = useRef<HTMLDivElement>(null);
  const bootInFlightRef = useRef(false);
  const [wordCount, setWordCount] = useState(0);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [savedForLater, setSavedForLater] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [cheatCountdown, setCheatCountdown] = useState(3);
  const [alreadyCheated, setAlreadyCheated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showContinueValidation, setShowContinueValidation] = useState(false);

  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cheatCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const [apiScreenData, setApiScreenData] = useState<AssessmentGateStartResponse | null>(null);
  const [activeItem, setActiveItem] = useState<AssessmentItem | null>(null);
  const [apiLoading, setApiLoading] = useState(!!activeAssessmentId);

  const startScreenMutation = useStartAssessmentScreenMutation(2);
  const saveDraftMutation = useSaveAssessmentDraftMutation();
  const submitScreenMutation = useSubmitAssessmentScreenMutation();

  useEffect(() => {
    if (!activeAssessmentId) {
      setApiLoading(false);
      setLoadError('Assessment not found. Resume Stage 2 from your journey.');
      return;
    }
    if (bootInFlightRef.current) return;
    bootInFlightRef.current = true;

    const load = async () => {
      setApiLoading(true);
      setLoadError(null);
      try {
        let rawRes: any = await startScreenMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          body: { pillar: 'simulation' },
        });

        const rawData = (rawRes?.data && typeof rawRes.data === 'object' ? rawRes.data : rawRes) as Record<string, any>;
        const isPreparing =
          rawData?.contentReady === false ||
          rawData?.content_ready === false ||
          (!rawData?.items?.length && !(rawData as any)?.pillarCompleted);

        if (isPreparing) {
          const startTime = Date.now();
          const maxWaitMs = 60000;
          const intervalMs = 2500;
          let ready = false;

          while (Date.now() - startTime < maxWaitMs) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            try {
              const pollRes = await fetchGate2PillarItems(activeAssessmentId, 'simulation', {
                from: simulationNumber,
                through: simulationNumber,
              });
              const pollData = ((pollRes as any)?.data && typeof (pollRes as any).data === 'object' ? (pollRes as any).data : pollRes) as Record<string, any>;
              if (
                pollData?.contentReady === true ||
                pollData?.content_ready === true ||
                (Array.isArray(pollData?.items) && pollData.items.length > 0)
              ) {
                rawRes = pollRes;
                ready = true;
                break;
              }
            } catch {
              // Continue polling
            }
          }

          if (!ready) {
            setLoadError('Assessment question generation is taking longer than expected. The queue worker may be stuck.');
            setApiScreenData(null);
            setActiveItem(null);
            return;
          }
        }

        let screen = unwrapScreen(rawRes);

        if ((screen as any)?.pillarCompleted) {
          const nextPill = (screen as any).nextPillar;
          if (nextPill) {
            const nextPath = gate2PillarStartPath(roleSlug, nextPill) || gate2PillarIntroPath(roleSlug, nextPill);
            if (nextPath) {
              navigate(nextPath, { replace: true });
              return;
            }
          } else if ((screen as any).nextStep === 'GATE2_COMPLETE') {
            navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`, { replace: true });
            return;
          }
        }

        // If this simulation isn't in the start window, fetch by sequence index.
        let item = screen?.items?.[simulationNumber - 1] ?? null;
        if (!item) {
          const itemsRes = await fetchGate2PillarItems(activeAssessmentId, 'simulation', {
            from: simulationNumber,
            through: simulationNumber,
          });
          const payload = unwrapScreen(itemsRes);
          item = payload?.items?.[0] ?? null;
          if (payload) {
            screen = screen
              ? { ...screen, ...payload, items: payload.items, componentId: payload.componentId || screen.componentId }
              : payload;
          }
        }

        if (!screen || !item) {
          setLoadError('Assessment question generation is taking longer than expected. The queue worker may be stuck.');
          setApiScreenData(null);
          setActiveItem(null);
          return;
        }

        setApiScreenData(screen);
        setActiveItem(item);
        const timerSecs =
          Number(item.timerSecs) ||
          Number((item.content as Record<string, unknown>)?.timerSecs) ||
          10 * 60;
        setSecondsLeft(timerSecs);
      } catch (err) {
        setLoadError(getApiErrorMessage(err, 'Could not load this simulation.'));
        setApiScreenData(null);
        setActiveItem(null);
      } finally {
        setApiLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once per simulation page
  }, [activeAssessmentId, simulationNumber]);

  const { data: draftData } = useAssessmentDraftQuery(
    activeAssessmentId || '',
    apiScreenData?.componentId || '',
    { enabled: !!activeAssessmentId && !!apiScreenData?.componentId },
  );

  useEffect(() => {
    const responses = (draftData as { data?: { responses?: Record<string, string> }; responses?: Record<string, string> })
      ?.data?.responses || (draftData as { responses?: Record<string, string> })?.responses;
    const itemKey = activeItem?.id;
    if (!itemKey || !responses?.[itemKey] || !editorRef.current) return;

    const draftVal = responses[itemKey];
    const html =
      typeof draftVal === 'string'
        ? draftVal
        : typeof draftVal === 'object' && draftVal
          ? String((draftVal as { prose?: string }).prose || '')
          : '';
    if (!html) return;
    editorRef.current.innerHTML = html;
    const text = editorRef.current.innerText.trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  }, [draftData, activeItem?.id]);

  useEffect(() => {
    if (savedForLater || showCheatModal || secondsLeft === null) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmit('time-up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedForLater, showCheatModal, secondsLeft === null]);

  useEffect(() => {
    const ENABLE_ANTI_CHEAT_TAB_SWITCH = false;
    if (!ENABLE_ANTI_CHEAT_TAB_SWITCH) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !savedForLater && !alreadyCheated) {
        blurTimerRef.current = setTimeout(() => {
          void handleSubmit('tab-switch');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyCheated, savedForLater]);

  const triggerCheatWarning = () => {
    setShowCheatModal(true);
    let n = 3;
    setCheatCountdown(n);
    cheatCountdownRef.current = setInterval(() => {
      n -= 1;
      setCheatCountdown(n);
      if (n <= 0) {
        if (cheatCountdownRef.current) clearInterval(cheatCountdownRef.current);
        void handleSubmit('tab-switch');
      }
    }, 1000);
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  const executeCommand = (command: string, value = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setIsBoldActive(document.queryCommandState('bold'));
    setIsItalicActive(document.queryCommandState('italic'));
  };

  const handleSubmit = async (reason?: string) => {
    if (isSubmitting) return;
    if (reason) sessionStorage.setItem('submitReason', reason);

    const htmlContent = editorRef.current?.innerHTML || '';
    const prose = editorRef.current?.innerText?.trim() || '';
    const itemKey = activeItem?.id;
    if (!activeAssessmentId || !apiScreenData?.componentId || !itemKey) {
      toast.error('Cannot submit — simulation data is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitRes = await submitScreenMutation.mutateAsync({
        assessmentId: activeAssessmentId,
        componentId: apiScreenData.componentId,
        responses: { [itemKey]: { prose } },
      });

      const resData = (submitRes as any)?.data || submitRes;
      if (resData?.nextStep === 'GATE2_COMPLETE' || resData?.pillarCompleted) {
        toast.success('Simulation complete. Analyzing your Stage 2 responses...');
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`);
        return;
      }

      toast.success(
        simulationNumber >= totalSimulations
          ? 'Saved. Analyzing your Stage 2 responses...'
          : 'Simulation submitted successfully!',
      );
      navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
    } catch (err) {
      const serverMsg = getApiErrorMessage(err, 'Failed to submit. Please try again.');
      const lower = serverMsg.toLowerCase();
      if (
        lower.includes('already submitted') ||
        lower.includes('already been submitted') ||
        lower.includes('completed') ||
        lower.includes('time limit')
      ) {
        toast.success('Simulation complete.');
        navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
        return;
      }
      toast.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSaveAndExit = async () => {
    setSavedForLater(true);
    const prose = editorRef.current?.innerText?.trim() || '';
    const itemKey = activeItem?.id;

    if (activeAssessmentId && apiScreenData?.componentId && itemKey && prose) {
      try {
        await saveDraftMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          componentId: apiScreenData.componentId,
          responses: { [itemKey]: { prose } },
        });
      } catch (err) {
        console.error('Failed to save simulation draft on exit:', err);
      }
    }
    toast.success('Progress saved successfully.');
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const content = (activeItem?.content || {}) as Record<string, unknown>;
  const simulationTitle = String(
    content.nicheDisplayName ||
      content.niche ||
      activeItem?.niche ||
      `Simulation ${simulationNumber}`,
  );
  const sectionTitle = String(
    activeItem?.screenTitle || content.briefTitle || content.title || activeItem?.title || '',
  );
  const sectionSub = String(
    activeItem?.screenSubtitle || content.prompt || activeItem?.subtitle || '',
  );
  const whyMattersText = String(activeItem?.whyThisMatters || content.whyThisMatters || '');
  const briefBody = String(content.briefBody || content.scenario || '');
  const scenarioTag = String(
    content.scenarioTag || content.tag || content.contextLabel || simulationTitle,
  );
  const scenarioTitle = String(content.briefTitle || content.title || sectionTitle);
  const requirements = Array.isArray(content.requirements)
    ? (content.requirements as string[]).map(String)
    : [];
  const requirementsTitle = String(content.requirementsTitle || 'What to cover');
  const editorLabel = String(content.responseLabel || 'Your work sample response');
  const editorSubtext = String(content.responseHint || content.editorSubtext || '');
  const editorPlaceholder = String(
    content.placeholder || 'Start writing your response here...',
  );
  const wordCountMin =
    Number(content.minWords) > 0
      ? Number(content.minWords)
      : getReasonMinWords(content, 'work_sample', { reasonShown: true });
  const wordCountMax = Number(content.maxWords) > 0 ? Number(content.maxWords) : Math.max(wordCountMin * 3, 250);
  const meetsMinWords = wordCount >= wordCountMin;

  useEffect(() => {
    if (meetsMinWords) setShowContinueValidation(false);
  }, [meetsMinWords]);

  const timerChipClass = () => {
    if (secondsLeft === null) return 'timer-chip';
    if (secondsLeft <= 60) return 'timer-chip warn';
    if (secondsLeft <= 180) return 'timer-chip caution';
    return 'timer-chip';
  };

  const getCounterClass = () => {
    if (wordCount >= wordCountMin && wordCount <= wordCountMax) return 'text-[#1D871D] font-bold';
    if (wordCount > wordCountMax) return 'text-[#D97706] font-bold';
    return 'text-[#808080]';
  };

  if (apiLoading) {
    return <FullPageSpinner message="Loading simulation screen..." />;
  }

  if (loadError || !activeItem || !apiScreenData) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <h2 className="text-[18px] font-[900] mb-2">Could not load this simulation</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            {loadError || 'The Stage 2 simulation endpoint did not return a work sample.'}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => {
                bootInFlightRef.current = false;
                setApiLoading(true);
                setLoadError(null);
                // re-trigger effect
                setActiveItem(null);
                setApiScreenData(null);
                void (async () => {
                  bootInFlightRef.current = false;
                  window.location.reload();
                })();
              }}
              className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer font-sans"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
              className="bg-white text-[#4A4A4A] border border-[#E6E6E6] rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer font-sans"
            >
              Back to journey
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          content: ${JSON.stringify(editorPlaceholder)};
          color: #ADADAD;
          font-style: italic;
          pointer-events: none;
        }
      `}</style>

      <AssessmentHeader
        middleContent={
          <span className="hidden sm:inline">
            Stage 2 · Part 4 · Simulation {simulationNumber} of {totalSimulations}
          </span>
        }
        rightContent={
          <div className="flex items-center gap-[14px]">
            {secondsLeft !== null && (
              <div className={timerChipClass()}>
                <ClockIcon className="w-[14px] h-[14px] mr-[4px] inline-block align-middle" />
                <span className="font-[800] text-[13.5px] tabular-nums inline-block align-middle">
                  {formatTime(secondsLeft)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              <DocumentCheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
              Auto-saved
            </div>
          </div>
        }
      />

      <StageRail activeStage={2} showBottomBorder={false} />
      <PartRail activePart={4} />

      <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[6px]">
        {Array.from({ length: totalSimulations }, (_, i) => {
          const n = i + 1;
          const filled = simulationNumber >= n;
          const active = simulationNumber === n;
          return (
            <div
              key={n}
              className={`h-[5px] rounded-full ${
                active ? 'bg-[#0047CC] w-[48px]' : filled ? 'bg-[#387DFF] w-[32px]' : 'bg-[#E6E6E6] w-[32px]'
              }`}
            />
          );
        })}
      </div>

      <main className="max-w-[920px] w-full mx-auto px-[28px] py-[32px] pb-[90px] flex-1">
        <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[11.5px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
          <svg className="w-[10px] h-[10px] fill-current" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" />
          </svg>
          Simulation {simulationNumber} · {simulationTitle}
        </div>
        <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
          {sectionTitle}
        </h1>
        {sectionSub ? (
          <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">{sectionSub}</p>
        ) : null}

        {whyMattersText ? (
          <div className="bg-[#EBF6FF] rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
            <InfoIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1px]" />
            <p className="text-[12.5px] text-[#182348] leading-[1.5]">
              <strong className="font-[800]">Why this matters · </strong>
              {whyMattersText}
            </p>
          </div>
        ) : null}

        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[24px_26px] mb-[18px]">
          {scenarioTag ? (
            <span className="inline-block text-[10.5px] font-[800] bg-[#EBF6FF] text-[#0047CC] px-[9px] py-[3px] rounded-[6px] tracking-[0.5px] uppercase mb-[12px]">
              {scenarioTag}
            </span>
          ) : null}
          {scenarioTitle ? (
            <div className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[12px] leading-[1.35]">
              {scenarioTitle}
            </div>
          ) : null}
          {briefBody ? (
            <div className="text-[13.5px] text-[#1A1A1A] leading-[1.7] mb-[14px] whitespace-pre-wrap">
              {briefBody}
            </div>
          ) : null}

          {requirements.length > 0 ? (
            <div className="bg-[#EBF6FF] rounded-[8px] p-[14px_16px] mt-[14px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[8px]">
                {requirementsTitle}
              </div>
              <ul className="list-none flex flex-col gap-[6px]">
                {requirements.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-[12.5px] text-[#182348] font-[600] pl-[14px] relative leading-[1.5] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#0047CC]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] overflow-hidden mb-[18px]">
          <div className="px-[18px] py-[14px] border-b border-[#E6E6E6] flex items-center justify-between bg-[#FBFCFF]">
            <div className="text-[12px] font-[800] text-[#1A1A1A] flex items-center gap-[8px]">
              <svg className="w-[14px] h-[14px] text-[#0047CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {editorLabel}
            </div>
            <div className="flex items-center gap-[4px]">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className={`bg-none border-none text-[#808080] p-[6px] rounded-[6px] cursor-pointer font-bold text-[12px] hover:bg-[#F7F7F7] hover:text-[#1A1A1A] ${
                  isBoldActive ? 'bg-[#EBF6FF] text-[#0047CC]' : ''
                }`}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className={`bg-none border-none text-[#808080] p-[6px] rounded-[6px] cursor-pointer font-bold text-[12px] hover:bg-[#F7F7F7] hover:text-[#1A1A1A] ${
                  isItalicActive ? 'bg-[#EBF6FF] text-[#0047CC]' : ''
                }`}
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
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
            className={`editor p-[18px_20px] min-h-[280px] outline-none text-[14px] text-[#1A1A1A] leading-[1.75] ${
              showContinueValidation && !meetsMinWords ? 'bg-[#FEF2F2]/40' : ''
            }`}
            contentEditable="true"
            onInput={handleEditorInput}
          />
          <div className="px-[18px] py-[10px] border-t border-[#E6E6E6] flex flex-col gap-1.5 bg-[#FBFCFF] text-[11.5px] font-[600]">
            <div className="flex items-center justify-between text-[#808080]">
              <div className={`count-pill text-[#0047CC] ${getCounterClass()}`}>
                {wordCount} words · aim for {wordCountMin}
                {wordCountMax ? ` to ${wordCountMax}` : '+'}
              </div>
              {editorSubtext ? <span className="text-[#ADADAD]">{editorSubtext}</span> : null}
            </div>
            {showContinueValidation && !meetsMinWords ? (
              <div className="text-[12px] font-[600] text-[#DC2626]">
                Please enter more words ({wordCount} of {wordCountMin} minimum)
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[13px] text-[#808080] font-[600]">
          Simulation {simulationNumber} of {totalSimulations} · Part 4
        </div>
        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            disabled={isSubmitting}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans disabled:opacity-50"
          >
            Save and finish later
          </button>
          <button
            type="button"
            onClick={() => {
              if (isSubmitting) return;
              if (!meetsMinWords) {
                setShowContinueValidation(true);
                editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
              }
              void handleSubmit();
            }}
            disabled={isSubmitting}
            aria-disabled={!meetsMinWords || isSubmitting}
            className={`border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] inline-flex items-center justify-center font-sans ${
              !meetsMinWords || isSubmitting
                ? 'bg-[#E6E6E6] text-white shadow-none cursor-pointer'
                : 'bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] cursor-pointer hover:bg-[#344DA1]'
            }`}
          >
            {isSubmitting
              ? 'Submitting...'
              : simulationNumber >= totalSimulations
                ? 'Complete Stage 2'
                : 'Next simulation'}
          </button>
        </div>
      </footer>

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
              Your progress will be saved. Stage 2&apos;s overall deadline still applies.
            </p>
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans"
              >
                Keep writing
              </button>
              <button
                type="button"
                onClick={() => void confirmSaveAndExit()}
                className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] font-sans"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>
      )}

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
