import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';
import AssessmentItemsList from './assessment/AssessmentItemsList';
import FullPageSpinner from '../common/FullPageSpinner';
import { useLocalAssessmentScreen } from '../../hooks/useLocalAssessmentScreen';
import { questionsToMcqItems } from '../../mocks/stage1AssessmentScreens';
import {
  useStartAssessmentScreenMutation,
  useSaveAssessmentDraftMutation,
  useSubmitAssessmentScreenMutation,
  useAssessmentDraftQuery,
  fetchGate2PillarItems,
} from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { isItemAnswerComplete } from '../../utils/assessmentValidation';
import type {
  AssessmentGateStartResponse,
  AssessmentItem,
  GateWindowInfo,
} from '../../services/queries/assessments/types';
import { formatGate2ResponsesPayload } from '../../catalog/gate2-submit-shape.util';

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

  // Dynamic windowed items and progress state
  const [activeItems, setActiveItems] = useState<AssessmentItem[]>([]);
  const [windowInfo, setWindowInfo] = useState<GateWindowInfo>({
    from: 1,
    through: 4,
    hasMore: false,
  });
  const [pillarProgress, setPillarProgress] = useState<{ total: number; current: number; answered: number }>({
    total: 0,
    current: 1,
    answered: 0,
  });
  const [isFetchingWindow, setIsFetchingWindow] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // API dynamic question flow integrations
  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const [apiScreenData, setApiScreenData] = useState<AssessmentGateStartResponse | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(!!activeAssessmentId);

  // Selected answers via reusable assessment item renderer
  const mcqItems = useMemo(() => questionsToMcqItems(questions), [questions]);
  const activeDisplayedItems = useMemo(() => {
    if (activeItems.length > 0) return activeItems;
    if (apiScreenData?.items && apiScreenData.items.length > 0) return apiScreenData.items;
    return mcqItems;
  }, [activeItems, apiScreenData, mcqItems]);

  const { answers, recordAnswer, setAnswers, isLocked } =
    useLocalAssessmentScreen(activeDisplayedItems);

  const startScreenMutation = useStartAssessmentScreenMutation(2);
  const saveDraftMutation = useSaveAssessmentDraftMutation();
  const submitScreenMutation = useSubmitAssessmentScreenMutation();

  const pillar = useMemo(() => {
    const pillarMap: Record<number, string> = {
      1: 'knowledge',
      2: 'expertise',
      3: 'reasoning',
      4: 'simulation',
    };
    return pillarMap[partNumber] || 'knowledge';
  }, [partNumber]);

  useEffect(() => {
    if (!activeAssessmentId) {
      setApiLoading(false);
      return;
    }

    startScreenMutation.mutate(
      {
        assessmentId: activeAssessmentId,
        body: { pillar },
      },
      {
        onSuccess: (res: any) => {
          const data = res?.data || res;
          if (data && data.items && data.items.length > 0) {
            setApiScreenData(data);
            setActiveItems(data.items);
            if (data.window) {
              setWindowInfo(data.window);
            } else {
              setWindowInfo({ from: 1, through: data.items.length, hasMore: false });
            }
            const total = data.progress?.total || data.items.length;
            const current = data.progress?.current || 1;
            const answered = data.progress?.answered || 0;
            setPillarProgress({ total, current, answered });

            if (data.questionsRegenerated) {
              toast('Fresh questions generated for remaining unanswered items.', { icon: '🔄' });
            }
          }
          setApiLoading(false);
        },
        onError: (err) => {
          console.error('Failed to start Stage 2 screen from API, falling back to local questions:', err);
          setApiLoading(false);
        },
      }
    );
  }, [activeAssessmentId, pillar]);

  // Load drafts if the user has a resumed session
  const { data: draftData } = useAssessmentDraftQuery(
    activeAssessmentId || '',
    apiScreenData?.componentId || '',
    { enabled: !!activeAssessmentId && apiScreenData?.sessionState === 'resumed' }
  );

  useEffect(() => {
    const responses = (draftData as any)?.data?.responses || draftData?.responses;
    if (responses) {
      setAnswers((prev: any) => ({ ...prev, ...responses }));
    }
  }, [draftData, setAnswers]);

  const fetchedRangesRef = useRef<Set<string>>(new Set());
  const prefetchedItemsMapRef = useRef<Map<string, { items: AssessmentItem[]; window?: GateWindowInfo; progress?: any }>>(new Map());

  // Prefetch next window of items near end of active window (e.g. Q3 of 4)
  const prefetchNextWindowIfNeeded = async (updatedAnsweredCount: number) => {
    if (!activeAssessmentId || !windowInfo.hasMore || isFetchingWindow) return;

    const nextFrom = windowInfo.through + 1;
    const nextThrough = windowInfo.through + 4;
    const rangeKey = `${nextFrom}-${nextThrough}`;

    if (fetchedRangesRef.current.has(rangeKey)) return;

    if (updatedAnsweredCount >= windowInfo.through - 1) {
      fetchedRangesRef.current.add(rangeKey);
      setIsFetchingWindow(true);
      try {
        const res = await fetchGate2PillarItems(activeAssessmentId, pillar, {
          from: nextFrom,
          through: nextThrough,
        });

        if (res.items && res.items.length > 0) {
          prefetchedItemsMapRef.current.set(rangeKey, {
            items: res.items,
            window: res.window,
            progress: res.progress,
          });
        }
      } catch (err) {
        console.error('Failed to prefetch next item window:', err);
        fetchedRangesRef.current.delete(rangeKey);
      } finally {
        setIsFetchingWindow(false);
      }
    }
  };

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

  // Tab switch visibility listener: enforce question regeneration on tab switch (> 3 seconds) silently without modal
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !savedForLater) {
        blurTimerRef.current = setTimeout(async () => {
          try {
            // 1. Flush draft answers for current window
            if (activeAssessmentId && apiScreenData?.componentId && Object.keys(answers).length > 0) {
              await saveDraftMutation.mutateAsync({
                assessmentId: activeAssessmentId,
                componentId: apiScreenData.componentId,
                responses: answers,
              }).catch(() => {});
            }

            // 2. Fetch start / items window to regenerate unanswered questions
            const res = await startScreenMutation.mutateAsync({
              assessmentId: activeAssessmentId || '',
              body: { pillar },
            }).catch(() => null);

            if ((res as any)?.data?.items || res?.items) {
              const data = (res as any)?.data || res;
              setApiScreenData(data);
              setActiveItems(data.items);
            }
          } catch (err) {
            console.warn('Tab switch question regeneration notice:', err);
          }
        }, 3000);
      } else if (!document.hidden) {
        if (blurTimerRef.current) {
          clearTimeout(blurTimerRef.current);
          blurTimerRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [activeAssessmentId, apiScreenData, answers, pillar, savedForLater]);

  const handleAnswer = async (itemId: string, value: any, item: any, subKey?: string) => {
    await recordAnswer(itemId, value, item, subKey);
    const newAnswers = { ...answers, [itemId]: value };
    const updatedCount = Object.keys(newAnswers).length;
    setPillarProgress((prev) => ({ ...prev, answered: updatedCount }));

    // Responses are stored in local state while interacting and sent when completing/submitting or saving for later
    void prefetchNextWindowIfNeeded(updatedCount);
  };

  const allFetchedItemsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    activeDisplayedItems.forEach((i) => {
      if (i && i.id) allFetchedItemsRef.current.set(i.id, i);
    });
  }, [activeDisplayedItems]);

  const sanitizeAnswers = (rawAnswers: Record<string, any>) => {
    const allItems = Array.from(allFetchedItemsRef.current.values()).concat(
      apiScreenData?.items ?? [],
      activeDisplayedItems ?? []
    );
    return formatGate2ResponsesPayload(rawAnswers, allItems);
  };

  const handleSubmit = async (reason?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (reason) {
      sessionStorage.setItem('submitReason', reason);
    }

    if (activeAssessmentId && apiScreenData) {
      try {
        const payloadResponses = sanitizeAnswers(answers);
        // Flush accumulated draft responses to API first
        if (Object.keys(payloadResponses).length > 0) {
          await saveDraftMutation.mutateAsync({
            assessmentId: activeAssessmentId,
            componentId: apiScreenData.componentId,
            responses: payloadResponses,
          }).catch((err) => console.warn('Draft save before submit warning:', err));
        }

        await submitScreenMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          componentId: apiScreenData.componentId,
          responses: payloadResponses,
        });
        toast.success('Interview submitted successfully!');
        navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
      } catch (err: any) {
        console.error('Failed to submit Stage 2 screen to API:', err);
        const serverMsg = err?.response?.data?.message || err?.message || 'Failed to submit. Please try again.';
        toast.error(serverMsg);
        setIsSubmitting(false);
      }
    } else {
      toast.success('Interview submitted successfully!');
      navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
    }
  };

  const confirmSaveAndExit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSavedForLater(true);

    if (activeAssessmentId && apiScreenData?.componentId && Object.keys(answers).length > 0) {
      try {
        const payloadResponses = sanitizeAnswers(answers);
        await saveDraftMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          componentId: apiScreenData.componentId,
          responses: payloadResponses,
        });
      } catch (err: any) {
        console.error('Failed to save draft on exit:', err);
        const serverMsg = err?.response?.data?.message || err?.message || 'Failed to save draft.';
        toast.error(serverMsg);
        setIsSubmitting(false);
        return;
      }
    }
    toast.success('Progress saved successfully.');
    navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isAllAnswered = useMemo(() => {
    if (activeDisplayedItems.length === 0) return false;
    return activeDisplayedItems.every((item) => isItemAnswerComplete(item, answers[item.id]));
  }, [activeDisplayedItems, answers]);

  const isHasMoreWindows = useMemo(() => {
    if (windowInfo.hasMore) return true;
    if (pillarProgress.total > 0 && windowInfo.through < pillarProgress.total) return true;
    return false;
  }, [windowInfo, pillarProgress]);

  const displayPillar = useMemo(() => {
    const p = (apiScreenData?.items?.[0] as any)?.pillar || pillar;
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Knowledge';
  }, [apiScreenData, pillar]);

  const displayLevel = useMemo(() => {
    const raw = (apiScreenData?.items?.[0] as any)?.level || (apiScreenData as any)?.level || 'Senior';
    const str = String(raw);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [apiScreenData]);

  const footerLabel = useMemo(() => {
    return `Part ${partNumber} · ${displayPillar} · ${displayLevel}`;
  }, [partNumber, displayPillar, displayLevel]);

  const handleContinueNextWindow = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payloadResponses = sanitizeAnswers(answers);
      if (activeAssessmentId && apiScreenData?.componentId && Object.keys(payloadResponses).length > 0) {
        await saveDraftMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          componentId: apiScreenData.componentId,
          responses: payloadResponses,
        }).catch((err) => console.warn('Draft save on continue warning:', err));
      }

      const nextFrom = windowInfo.through + 1;
      const nextThrough = windowInfo.through + 4;
      const rangeKey = `${nextFrom}-${nextThrough}`;

      let nextItems: AssessmentItem[] = [];
      let nextWindow: GateWindowInfo | undefined;
      let nextProgress: any;

      if (prefetchedItemsMapRef.current.has(rangeKey)) {
        const prefetched = prefetchedItemsMapRef.current.get(rangeKey)!;
        nextItems = prefetched.items;
        nextWindow = prefetched.window;
        nextProgress = prefetched.progress;
      } else {
        const res = await fetchGate2PillarItems(activeAssessmentId || '', pillar, {
          from: nextFrom,
          through: nextThrough,
        });
        nextItems = res.items || [];
        nextWindow = res.window;
        nextProgress = res.progress;
      }

      if (nextItems.length > 0) {
        setActiveItems(nextItems);
        setApiScreenData((prev) => (prev ? { ...prev, items: nextItems } : prev));
        setAnswers({});
      }

      if (nextWindow) {
        setWindowInfo(nextWindow);
      } else {
        const itemsLen = nextItems.length;
        setWindowInfo({
          from: nextFrom,
          through: windowInfo.through + itemsLen,
          hasMore: nextProgress?.total ? windowInfo.through + itemsLen < nextProgress.total : false,
        });
      }

      if (nextProgress) {
        setPillarProgress((prev) => ({
          total: nextProgress.total ?? prev.total,
          current: nextProgress.current ?? nextFrom,
          answered: nextProgress.answered ?? prev.answered,
        }));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to load next window:', err);
      toast.error('Failed to load next questions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const formattedGateName = useMemo(() => {
    const raw = apiScreenData?.gateName || 'Professional Dimension';
    return raw
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [apiScreenData]);

  const timerChipClass = () => {
    if (secondsLeft <= 60) return 'timer-chip warn';
    if (secondsLeft <= 180) return 'timer-chip caution';
    return 'timer-chip';
  };

  if (apiLoading) {
    return <FullPageSpinner message="Loading interview screen..." />;
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
      `}</style>

      {/* Topbar */}
      <AssessmentHeader
        middleContent={
          apiScreenData ? (
            <span className="hidden sm:inline">
              {formattedGateName} · {apiScreenData.items[0]?.sessionLabel || `Part ${partNumber}`}
            </span>
          ) : (
            <span className="hidden sm:inline">
              Stage 2 · Part {partNumber} · Interview {interviewNumber} of 3
            </span>
          )
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
      {apiScreenData ? (
        <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[12px] flex-wrap">
          {(() => {
            const totalQuestions = pillarProgress.total || apiScreenData.items.length;
            const answeredInCurrentWindow = activeDisplayedItems.filter((item) => answers[item.id] !== undefined && answers[item.id] !== null && answers[item.id] !== '').length;
            const totalCompletedBeforeWindow = Math.max(0, windowInfo.from - 1);
            const totalAnswered = totalCompletedBeforeWindow + answeredInCurrentWindow;
            const currentQNum = Math.min(Math.max(1, totalAnswered + 1), totalQuestions);

            return (
              <>
                <span className="text-[11.5px] font-[800] tracking-[0.4px] uppercase text-[#0047CC]">
                  Question {currentQNum} of {totalQuestions}
                </span>
                <div className="flex gap-[5px] flex-wrap">
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const isActive = idx === totalAnswered;
                    const isDone = idx < totalAnswered;
                    return (
                      <div
                        key={idx}
                        className={`h-[5px] rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-[#0047CC] w-[42px]'
                            : isDone
                            ? 'bg-[#387DFF] w-[26px]'
                            : 'bg-[#E6E6E6] w-[26px]'
                        }`}
                      />
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[6px]">
          <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber >= 2 ? 'bg-[#387DFF]' : 'bg-[#E6E6E6]'}`} />
          <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber >= 3 ? 'bg-[#387DFF]' : interviewNumber === 2 ? 'bg-[#0047CC] w-[48px]' : 'bg-[#E6E6E6]'}`} />
          <div className={`w-[32px] h-[5px] rounded-full ${interviewNumber === 3 ? 'bg-[#0047CC] w-[48px]' : 'bg-[#E6E6E6]'}`} />
        </div>
      )}

      {/* Main Body */}
      {(() => {
        const currentHeaderItem = activeDisplayedItems[0];
        return (
          <main className="max-w-[780px] w-full mx-auto px-[24px] py-[32px] pb-[90px] flex-1">
            <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[11px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
              {apiScreenData ? (currentHeaderItem?.eyebrow || `Part ${partNumber} · Knowledge`) : `Interview ${interviewNumber} · ${interviewTitle}`}
            </div>
            <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
              {apiScreenData ? (currentHeaderItem?.screenTitle || currentHeaderItem?.title || sectionTitle) : sectionTitle}
            </h1>
            <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">
              {apiScreenData ? (currentHeaderItem?.screenSubtitle || sectionSub) : sectionSub}
            </p>

            {/* Why matters component */}
            <div className="bg-[#EBF6FF] rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
              <InfoIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1px]" />
              <p className="text-[12.5px] text-[#182348] leading-[1.5]">
                <strong className="font-[800]">Why this matters · </strong>
                {apiScreenData ? (currentHeaderItem?.whyThisMatters || whyMattersText) : whyMattersText}
              </p>
            </div>

            {topContent && <div className="mb-[22px]">{topContent}</div>}

            {/* Questions reusable item components */}
            <AssessmentItemsList
              items={activeDisplayedItems}
              answers={answers}
              isLocked={(itemId, subKey) => isSubmitting || isLocked(itemId, subKey)}
              onAnswer={(itemId, val, item, subKey) => void handleAnswer(itemId, val, item, subKey)}
            />
          </main>
        );
      })()}

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-[40]">
        <div className="text-[13px] text-[#808080] font-[600]">
          {footerLabel}
        </div>
        <div className="flex gap-[10px] items-center">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={isSubmitting}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save and finish later
          </button>
          <button
            onClick={() => {
              if (isHasMoreWindows) {
                void handleContinueNextWindow();
              } else {
                void handleSubmit();
              }
            }}
            disabled={!isAllAnswered || isSubmitting}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:bg-[#E6E6E6] disabled:shadow-none disabled:cursor-not-allowed font-sans"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isHasMoreWindows ? 'Loading...' : 'Submitting...'}</span>
              </>
            ) : isHasMoreWindows ? (
              'Continue'
            ) : (
              apiScreenData ? `Complete Part ${partNumber}` : (interviewNumber === 3 ? `Complete Part ${partNumber}` : 'Submit interview')
            )}
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
                disabled={isSubmitting}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep going
              </button>
              <button
                onClick={() => void confirmSaveAndExit()}
                disabled={isSubmitting}
                className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {isSubmitting ? 'Saving...' : 'Save and exit'}
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
