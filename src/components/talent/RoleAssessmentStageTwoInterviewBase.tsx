import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';
import AssessmentItemsList from './assessment/AssessmentItemsList';
import FullPageSpinner from '../common/FullPageSpinner';
import { useLocalAssessmentScreen } from '../../hooks/useLocalAssessmentScreen';
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
import { normalizeAssessmentItems } from '../../utils/assessmentItems';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import { gate2PillarStartPath, gate2PillarIntroPath } from '../../utils/stage2Flow';
import type {
  AssessmentGateStartResponse,
  AssessmentItem,
  GateWindowInfo,
} from '../../services/queries/assessments/types';
import { formatGate2ResponsesPayload, validateMinWords } from '../../catalog/gate2-submit-shape.util';
import { getApiErrorMessage, apiClient } from '../../services/api';
import { StageTwoValidationProvider } from './assessment/shared/StageTwoValidationContext';

const applyGate2ScreenPayload = (raw: unknown) => {
  const data = unwrapAssessmentData<Record<string, any>>(raw) ?? (raw as Record<string, any>);
  if (!data || typeof data !== 'object') return null;
  const items = normalizeAssessmentItems(data.items);
  if (!items.length) return null;
  return {
    data: {
      ...data,
      items,
    } as AssessmentGateStartResponse,
    items,
    window: data.window as GateWindowInfo | undefined,
    progress: data.progress,
  };
};

const QUESTIONS_PER_SESSION = 4;
const FIXED_HEADER_OFFSET_PX = 196;
const FIXED_FOOTER_OFFSET_PX = 96;

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


const pollResumeStateUntilReady = async (
  assessmentId: string,
  pillar: string,
  maxAttempts = 15,
  intervalMs = 2500,
): Promise<any> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    try {
      const resumeRaw = await apiClient.get<Record<string, any>>({
        url: `/assessments/${assessmentId}/gates/2/resume-state`,
        auth: true,
        suppressErrorToast: true,
      });
      const data = unwrapAssessmentData<Record<string, any>>(resumeRaw) ?? (resumeRaw as Record<string, any>);
      if (data?.contentReady === true || (Array.isArray(data?.items) && data.items.length > 0)) {
        return await apiClient.post({
          url: `/assessments/${assessmentId}/gates/2/start`,
          body: { pillar },
          auth: true,
        });
      }
    } catch {
      // Continue polling
    }
  }
  return apiClient.post({
    url: `/assessments/${assessmentId}/gates/2/start`,
    body: { pillar },
    auth: true,
  });
};

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
  /** @deprecated Local mock questions are no longer used; Stage 2 loads from the start endpoint only. */
  questions?: Question[];
  nextPath: string;
  partNumber?: number;
  timeLimitSeconds?: number;
  topContent?: React.ReactNode;
}

const RoleAssessmentStageTwoInterviewBase: React.FC<StageTwoInterviewBaseProps> = ({
  sectionTitle,
  sectionSub,
  whyMattersText,
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // API dynamic question flow integrations
  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const [apiScreenData, setApiScreenData] = useState<AssessmentGateStartResponse | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [bootToken, setBootToken] = useState(0);

  const activeDisplayedItems = useMemo(() => {
    if (activeItems.length > 0) return activeItems;
    if (apiScreenData?.items && apiScreenData.items.length > 0) return apiScreenData.items;
    return [];
  }, [activeItems, apiScreenData]);

  const { answers, recordAnswer, setAnswers, isLocked } =
    useLocalAssessmentScreen(activeDisplayedItems);

  const startScreenMutation = useStartAssessmentScreenMutation(2);
  const saveDraftMutation = useSaveAssessmentDraftMutation();
  const submitScreenMutation = useSubmitAssessmentScreenMutation();
  const startedPillarRef = useRef<string | null>(null);

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
      setApiError('No active assessment. Return to the journey and begin Stage 2.');
      return;
    }

    const startKey = `${activeAssessmentId}:${pillar}:${bootToken}`;
    if (startedPillarRef.current === startKey) return;
    startedPillarRef.current = startKey;

    let cancelled = false;
    setApiLoading(true);
    setApiError(null);

    const loadPillarScreen = async () => {
      try {
        let res: any;
        try {
          res = await startScreenMutation.mutateAsync({
            assessmentId: activeAssessmentId,
            body: { pillar },
          });
        } catch (startErr: any) {
          const msg = getApiErrorMessage(startErr, '');
          if (
            msg.toLowerCase().includes('still being prepared') ||
            msg.toLowerCase().includes('preparing') ||
            msg.toLowerCase().includes('try again')
          ) {
            res = await pollResumeStateUntilReady(activeAssessmentId, pillar);
          } else {
            throw startErr;
          }
        }

        if (cancelled) return;

        const rawData = unwrapAssessmentData<Record<string, any>>(res) ?? (res as Record<string, any>);
        if (rawData?.pillarCompleted) {
          const nextPill = rawData.nextPillar;
          if (nextPill) {
            const nextPath = gate2PillarStartPath(roleSlug, nextPill) || gate2PillarIntroPath(roleSlug, nextPill);
            if (nextPath) {
              navigate(nextPath, { replace: true });
              return;
            }
          } else if (rawData.nextStep === 'GATE2_COMPLETE') {
            navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
            return;
          }
        }

        const payload = applyGate2ScreenPayload(res);
        if (payload) {
          const { data, items, window, progress } = payload;
          setApiScreenData(data);
          setActiveItems(items);
          if (window) {
            setWindowInfo(window);
          } else {
            setWindowInfo({ from: 1, through: items.length, hasMore: false });
          }
          const total = progress?.total || items.length;
          const current = progress?.current || 1;
          const answered = progress?.answered || 0;
          setPillarProgress({ total, current, answered });

          if (data?.questionsRegenerated) {
            toast('Fresh questions generated for remaining unanswered items.', { icon: '🔄' });
          }
          setApiLoading(false);
          return;
        }

        setApiError('No questions were returned for this part. Please try again.');
        setApiLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        startedPillarRef.current = null;
        console.error('Failed to load Stage 2 screen from API:', err);
        setApiError(getApiErrorMessage(err, 'Could not start this interview. Please try again.'));
        setApiLoading(false);
      }
    };

    loadPillarScreen();

    return () => {
      cancelled = true;
      if (startedPillarRef.current === startKey) {
        startedPillarRef.current = null;
      }
    };
  }, [activeAssessmentId, pillar, bootToken]);

  // Load drafts if the user has a resumed session
  const { data: draftData } = useAssessmentDraftQuery(
    activeAssessmentId || '',
    apiScreenData?.componentId || '',
    { enabled: !!activeAssessmentId && apiScreenData?.sessionState === 'resumed' }
  );

  const draftHydratedRef = useRef(false);
  const lockedResponsesRef = useRef<Record<string, any>>({});

  useEffect(() => {
    draftHydratedRef.current = false;
  }, [apiScreenData?.componentId]);

  useEffect(() => {
    if (draftHydratedRef.current) return;
    const responses = (draftData as any)?.data?.responses || draftData?.responses;
    if (!responses || typeof responses !== 'object') return;

    draftHydratedRef.current = true;
    for (const [key, val] of Object.entries(responses)) {
      lockedResponsesRef.current[key] = val ?? true;
    }

    setAnswers((prev: any) => {
      const merged = { ...responses };
      // Prefer in-progress local answers over empty/partial draft values
      for (const [itemId, localVal] of Object.entries(prev || {})) {
        if (localVal !== undefined && localVal !== null && localVal !== '') {
          merged[itemId] = localVal;
        }
      }
      return merged;
    });
  }, [draftData, setAnswers]);

  // Modals state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [cheatCountdown, setCheatCountdown] = useState<number>(3);
  const [alreadyCheated, setAlreadyCheated] = useState<boolean>(false);
  const [showContinueValidation, setShowContinueValidation] = useState(false);

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
              const draftPayload = buildUnlockedDraftPayload(answers);
              if (Object.keys(draftPayload).length > 0) {
                await safeSaveDraft(draftPayload).catch(() => {});
              }
            }

            // 2. Fetch start / items window to regenerate unanswered questions
            const res = await startScreenMutation.mutateAsync({
              assessmentId: activeAssessmentId || '',
              body: { pillar },
            }).catch(() => null);

            const payload = applyGate2ScreenPayload(res);
            if (payload) {
              setApiScreenData(payload.data);
              setActiveItems(payload.items);
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
  };

  useEffect(() => {
    if (!apiScreenData) return;
    const answeredInWindow = activeDisplayedItems.filter((item) =>
      isItemAnswerComplete(item, answers[item.id]),
    ).length;
    const totalAnswered = Math.max(0, windowInfo.from - 1) + answeredInWindow;
    setPillarProgress((prev) =>
      prev.answered === totalAnswered ? prev : { ...prev, answered: totalAnswered },
    );
  }, [answers, activeDisplayedItems, apiScreenData, windowInfo.from]);

  const allFetchedItemsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    activeDisplayedItems.forEach((i) => {
      if (i && i.id) allFetchedItemsRef.current.set(i.id, i);
    });
  }, [activeDisplayedItems]);

  const sanitizeAnswers = (rawAnswers: Record<string, any>, itemsForTypes?: AssessmentItem[]) => {
    const allItems = (itemsForTypes ?? []).concat(
      Array.from(allFetchedItemsRef.current.values()),
      apiScreenData?.items ?? [],
      activeDisplayedItems ?? [],
    );
    // Prefer the first occurrence (window items) for type resolution.
    return formatGate2ResponsesPayload(rawAnswers, allItems);
  };

  const validateWindowMinWords = (targetItems: AssessmentItem[], currentAnswers: Record<string, any>): boolean => {
    for (const item of targetItems) {
      const rawMinWords = (item?.content as any)?.minWords;
      const minWords = typeof rawMinWords === 'number' ? rawMinWords : Number(rawMinWords) || 0;
      if (minWords > 0) {
        const val = currentAnswers[item.id];
        const reason = typeof val === 'object' && val !== null ? (val.reason ?? val.prose ?? val.reasoning ?? '') : String(val ?? '');
        if (!validateMinWords(reason, minWords)) {
          toast.error(`Please provide at least ${minWords} words for your explanation.`);
          return false;
        }
      }
    }
    return true;
  };

  const buildUnlockedDraftPayload = (rawAnswers: Record<string, any>, itemsForTypes?: AssessmentItem[]) => {
    const unlocked: Record<string, any> = {};
    for (const [itemId, val] of Object.entries(rawAnswers)) {
      if (val !== undefined && val !== null && val !== '' && lockedResponsesRef.current[itemId] === undefined) {
        unlocked[itemId] = val;
      }
    }
    return sanitizeAnswers(unlocked, itemsForTypes);
  };

  const safeSaveDraft = async (unlockedPayload: Record<string, any>) => {
    if (!apiScreenData?.componentId || !activeAssessmentId) return;

    // Strictly filter out any items already marked as locked in lockedResponsesRef
    const strictlyUnlocked: Record<string, any> = {};
    for (const [key, val] of Object.entries(unlockedPayload)) {
      if (lockedResponsesRef.current[key] === undefined && val !== undefined && val !== null && val !== '') {
        strictlyUnlocked[key] = val;
      }
    }

    if (Object.keys(strictlyUnlocked).length === 0) return; // All answers on page already saved/locked on server

    try {
      await saveDraftMutation.mutateAsync({
        assessmentId: activeAssessmentId,
        componentId: apiScreenData.componentId,
        responses: strictlyUnlocked,
      });
      for (const [key, val] of Object.entries(strictlyUnlocked)) {
        lockedResponsesRef.current[key] = val;
      }
    } catch (err: any) {
      const errMessage = String(err?.message || err?.data?.message || err?.response?.data?.message || '');
      if (errMessage.toLowerCase().includes('locked') || errMessage.toLowerCase().includes('cannot be changed')) {
        const match = errMessage.match(/item\s+([a-zA-Z0-9_-]+):/);
        if (match && match[1]) {
          lockedResponsesRef.current[match[1]] = true;
        } else {
          Object.keys(unlockedPayload).forEach((k) => {
            lockedResponsesRef.current[k] = true;
          });
        }
        return;
      }
      throw err;
    }
  };

  const buildCurrentWindowDraftPayload = () => {
    const windowAnswers: Record<string, any> = {};
    for (const item of activeDisplayedItems) {
      const val = answers[item.id];
      if (val !== undefined && val !== null && val !== '') {
        windowAnswers[item.id] = val;
      }
    }
    return buildUnlockedDraftPayload(windowAnswers, activeDisplayedItems);
  };

  const handleSubmit = async (reason?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (reason) {
      sessionStorage.setItem('submitReason', reason);
    }

    if (!activeAssessmentId || !apiScreenData) {
      toast.error('Assessment is not ready. Please reload and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payloadResponses = sanitizeAnswers(answers);
      if (!apiScreenData.componentId || Object.keys(payloadResponses).length === 0) {
        toast.error('Please complete your answers before submitting.');
        setIsSubmitting(false);
        return;
      }

      // Hard gate: draft of unlocked answers must succeed before final submit.
      const unlockedDraft = buildUnlockedDraftPayload(answers);
      await safeSaveDraft(unlockedDraft);

      await submitScreenMutation.mutateAsync({
        assessmentId: activeAssessmentId,
        componentId: apiScreenData.componentId,
        responses: unlockedDraft,
      });
      toast.success('Interview submitted successfully!');
      navigate(`/onboarding/talent/${roleSlug}/${nextPath}`);
    } catch (err: any) {
      console.error('Failed to submit Stage 2 screen to API:', err);
      const serverMsg =
        getApiErrorMessage(err) ||
        err?.message ||
        'Failed to submit. Please try again.';
      toast.error(serverMsg);
      setIsSubmitting(false);
    }
  };

  const confirmSaveAndExit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSavedForLater(true);

    if (activeAssessmentId && apiScreenData?.componentId && Object.keys(answers).length > 0) {
      try {
        const unlockedDraft = buildUnlockedDraftPayload(answers);
        await safeSaveDraft(unlockedDraft);
      } catch (err: any) {
        console.error('Failed to save draft on exit:', err);
        const serverMsg = err?.response?.data?.message || err?.message || 'Failed to save draft.';
        toast.error(serverMsg);
        setIsSubmitting(false);
        return;
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

  const incompleteItems = useMemo(
    () => activeDisplayedItems.filter((item) => !isItemAnswerComplete(item, answers[item.id])),
    [activeDisplayedItems, answers],
  );

  const incompleteCount = incompleteItems.length;

  const isAllAnswered = activeDisplayedItems.length > 0 && incompleteCount === 0;

  useEffect(() => {
    if (isAllAnswered) setShowContinueValidation(false);
  }, [isAllAnswered]);

  const scrollToFirstIncomplete = () => {
    const first = incompleteItems[0];
    if (!first) return;
    const el = document.getElementById(`assessment-item-${first.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
      if (!activeAssessmentId || !apiScreenData?.componentId) {
        toast.error('Assessment is not ready. Please reload and try again.');
        return;
      }

      const hasAnsweredCurrentWindow = activeDisplayedItems.every((item) => {
        const val = answers[item.id];
        return val !== undefined && val !== null && val !== '';
      });

      if (!hasAnsweredCurrentWindow) {
        toast.error('Please answer the questions on this page before continuing.');
        return;
      }

      if (!validateWindowMinWords(activeDisplayedItems, answers)) {
        return;
      }

      const payloadResponses = buildCurrentWindowDraftPayload();

      // Hard gate: never show the next window unless draft save of unlocked answers succeeds.
      await safeSaveDraft(payloadResponses);

      const nextFrom = windowInfo.through + 1;
      const nextThrough = windowInfo.through + 4;

      setApiLoading(true);
      const res = await fetchGate2PillarItems(activeAssessmentId, pillar, {
        from: nextFrom,
        through: nextThrough,
      });
      const payload = applyGate2ScreenPayload(res);
      const nextItems = payload?.items || [];
      const nextWindow = payload?.window;
      const nextProgress = payload?.progress;

      if (nextItems.length > 0) {
        setShowContinueValidation(false);
        setActiveItems(nextItems);
        setApiScreenData((prev) => (prev ? { ...prev, items: nextItems } : prev));

        if (nextWindow) {
          setWindowInfo(nextWindow);
        } else {
          const itemsLen = nextItems.length;
          setWindowInfo({
            from: nextFrom,
            through: windowInfo.through + itemsLen,
            hasMore: nextProgress?.total
              ? windowInfo.through + itemsLen < nextProgress.total
              : false,
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
      } else {
        toast.error('No more questions were returned. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to save draft or load next window:', err);
      const serverMsg =
        getApiErrorMessage(err) ||
        err?.message ||
        'Could not save your answers. Please try again before continuing.';
      toast.error(serverMsg);
    } finally {
      setApiLoading(false);
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

  const progressMeta = useMemo(() => {
    const totalQuestions = pillarProgress.total || apiScreenData?.items.length || 0;
    const answeredInCurrentWindow = activeDisplayedItems.filter((item) =>
      isItemAnswerComplete(item, answers[item.id]),
    ).length;
    const totalCompletedBeforeWindow = Math.max(0, windowInfo.from - 1);
    const totalAnswered = totalCompletedBeforeWindow + answeredInCurrentWindow;
    const currentQNum = totalQuestions > 0
      ? Math.min(Math.max(1, totalAnswered + 1), totalQuestions)
      : 1;
    const totalSessions = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_SESSION));
    const currentSession = Math.min(
      Math.max(1, Math.ceil(currentQNum / QUESTIONS_PER_SESSION)),
      totalSessions,
    );
    const completedSessions = Math.max(0, currentSession - 1);

    return {
      totalQuestions,
      currentQNum,
      totalSessions,
      currentSession,
      completedSessions,
    };
  }, [
    pillarProgress.total,
    apiScreenData?.items.length,
    activeDisplayedItems,
    answers,
    windowInfo.from,
  ]);

  if (apiLoading) {
    return <FullPageSpinner message="Preparing your personalized questions..." />;
  }

  if (apiError || !apiScreenData) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <h2 className="text-[18px] font-[900] mb-2">Could not load this interview</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            {apiError || 'The Stage 2 start endpoint did not return questions.'}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
              className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] px-4 py-2.5 text-[13.5px] font-[700]"
            >
              Back to journey
            </button>
            <button
              type="button"
              onClick={() => {
                startedPillarRef.current = null;
                setApiScreenData(null);
                setActiveItems([]);
                setBootToken((n) => n + 1);
              }}
              className="bg-[#0047CC] text-white border-none rounded-[10px] px-4 py-2.5 text-[13.5px] font-[700]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StageTwoValidationProvider value={showContinueValidation}>
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

      {/* Fixed Header & Rails */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white flex flex-col">
        <AssessmentHeader
          middleContent={
            <span className="hidden sm:inline">
              {formattedGateName} · {apiScreenData.items[0]?.sessionLabel || `Part ${partNumber}`}
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

        <StageRail activeStage={2} showBottomBorder={false} />
        <PartRail activePart={partNumber} />

        <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[10px] flex items-center justify-center gap-[12px] flex-wrap">
          <span className="text-[11.5px] font-[800] tracking-[0.4px] uppercase text-[#0047CC]">
            Session {progressMeta.currentSession} of {progressMeta.totalSessions}
          </span>
          <div className="flex gap-[5px] flex-wrap">
            {Array.from({ length: progressMeta.totalSessions }).map((_, idx) => {
              const isActive = idx === progressMeta.completedSessions;
              const isDone = idx < progressMeta.completedSessions;
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
        </div>
      </div>

      {/* Main Body */}
      {(() => {
        const currentHeaderItem = activeDisplayedItems[0];
        return (
          <main
            className="max-w-[780px] w-full mx-auto px-[24px] py-[32px] flex-1"
            style={{
              paddingTop: FIXED_HEADER_OFFSET_PX,
              paddingBottom: FIXED_FOOTER_OFFSET_PX,
            }}
          >
            <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[11px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
              {currentHeaderItem?.eyebrow || `Part ${partNumber} · Knowledge`}
            </div>
            <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
              {currentHeaderItem?.screenTitle || currentHeaderItem?.title || sectionTitle}
            </h1>
            <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">
              {currentHeaderItem?.screenSubtitle || sectionSub}
            </p>

            {/* Why matters component */}
            <div className="bg-[#EBF6FF] rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
              <InfoIcon className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1px]" />
              <p className="text-[12.5px] text-[#182348] leading-[1.5]">
                <strong className="font-[800]">Why this matters · </strong>
                {currentHeaderItem?.whyThisMatters || whyMattersText}
              </p>
            </div>

            {topContent && <div className="mb-[22px]">{topContent}</div>}

            {/* Questions reusable item components */}
            <AssessmentItemsList
              items={activeDisplayedItems}
              answers={answers}
              isLocked={(itemId, subKey) => isSubmitting || isLocked(itemId, subKey)}
              onAnswer={(itemId, val, item, subKey) => void handleAnswer(itemId, val, item, subKey)}
              incompleteItemIds={incompleteItems.map((item) => item.id)}
              showIncompleteHighlight={showContinueValidation}
            />
          </main>
        );
      })()}

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[14px_32px] flex items-center justify-between gap-[12px] z-50">
        <div className="text-[13px] text-[#808080] font-[600]">
          {footerLabel}
          {showContinueValidation && incompleteCount > 0 ? (
            <span className="block sm:inline sm:ml-2 text-[12px] text-[#DC2626] font-[600]">
              {incompleteCount === 1
                ? '1 question still needs a complete answer'
                : `${incompleteCount} questions still need complete answers`}
            </span>
          ) : null}
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
            type="button"
            onClick={() => {
              if (isSubmitting) return;
              if (!isAllAnswered) {
                setShowContinueValidation(true);
                // Wait a tick so highlight classes paint, then scroll
                requestAnimationFrame(() => scrollToFirstIncomplete());
                return;
              }
              if (isHasMoreWindows) {
                void handleContinueNextWindow();
              } else {
                void handleSubmit();
              }
            }}
            disabled={isSubmitting}
            aria-disabled={!isAllAnswered || isSubmitting}
            className={`border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] inline-flex items-center gap-[8px] font-sans ${
              !isAllAnswered || isSubmitting
                ? 'bg-[#E6E6E6] text-white shadow-none cursor-pointer'
                : 'bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] cursor-pointer hover:bg-[#344DA1]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isHasMoreWindows ? 'Loading...' : 'Submitting...'}</span>
              </>
            ) : isHasMoreWindows ? (
              'Continue'
            ) : (
              `Complete Part ${partNumber}`
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
    </StageTwoValidationProvider>
  );
};

export default RoleAssessmentStageTwoInterviewBase;
