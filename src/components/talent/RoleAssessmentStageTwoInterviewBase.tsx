import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from './AssessmentHeader';
import StageRail from './StageRail';
import PartRail from './PartRail';
import AssessmentItemsList from './assessment/AssessmentItemsList';
import ProctoringCamera from './assessment/shared/ProctoringCamera';
import FullPageSpinner from '../common/FullPageSpinner';
import { useLocalAssessmentScreen } from '../../hooks/useLocalAssessmentScreen';
import {
  useStartAssessmentScreenMutation,
  useSaveAssessmentDraftMutation,
  useSubmitAssessmentScreenMutation,
  useAssessmentDraftQuery,
  fetchGate2PillarItems,
  markComponentSubmitted,
  unmarkComponentSubmitted,
  isComponentSubmitted,
} from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { isItemAnswerComplete } from '../../utils/assessmentValidation';
import { getReasonMinWords, extractReasonText, hasReasonField } from '../../utils/reasonMinWords';
import { isWrittenReasonType } from '../../utils/writtenReasonTypes';
import { normalizeAssessmentItems } from '../../utils/assessmentItems';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import { gate2PillarStartPath, gate2PillarIntroPath, navigateGate2Authoritative } from '../../utils/stage2Flow';
import type {
  AssessmentGateStartResponse,
  AssessmentItem,
  GateWindowInfo,
} from '../../services/queries/assessments/types';
import { formatGate2ResponsesPayload, validateMinWords } from '../../catalog/gate2-submit-shape.util';
import { getApiErrorMessage, apiClient } from '../../services/api';
import { StageTwoValidationProvider } from './assessment/shared/StageTwoValidationContext';

const applyGate2ScreenPayload = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') return null;
  const data = unwrapAssessmentData<Record<string, any>>(raw) ?? (raw as Record<string, any>);
  if (!data || typeof data !== 'object') return null;
  const rawItems = data.items || (data.data && typeof data.data === 'object' ? data.data.items : undefined);
  const items = normalizeAssessmentItems(rawItems);
  if (!items.length) return null;
  return {
    data: {
      ...data,
      items,
    } as AssessmentGateStartResponse,
    items,
    window: (data.window || (data.data && typeof data.data === 'object' ? data.data.window : undefined)) as GateWindowInfo | undefined,
    progress: data.progress || (data.data && typeof data.data === 'object' ? data.data.progress : undefined),
  };
};

const resolveNextPillarRoute = (
  roleSlug: string,
  resData: any,
  currentPart: number,
): string => {
  const payload = resData?.data || resData;
  const nextStep = payload?.nextStep;
  const nextPillar = payload?.nextPillar;
  const isGate2Complete =
    nextStep === 'GATE2_COMPLETE' ||
    payload?.gate2Complete === true ||
    payload?.pillarCompleted && currentPart >= 4;

  if (isGate2Complete || currentPart >= 4) {
    return `/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`;
  }

  if (nextPillar) {
    const introPath = gate2PillarIntroPath(roleSlug, nextPillar);
    if (introPath) return introPath;
    const startPath = gate2PillarStartPath(roleSlug, nextPillar);
    if (startPath) return startPath;
  }

  // Fallback sequential progression
  const nextPart = currentPart + 1;
  if (nextPart > 4) {
    return `/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`;
  }
  return `/onboarding/talent/${roleSlug}/interview/stage-2/part-${nextPart}/intro`;
};

const QUESTIONS_PER_SESSION = 4;
const DEFAULT_GATE2_PILLAR_TOTALS: Record<number, number> = {
  1: 20,
  2: 20,
  3: 12,
  4: 4,
};
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
  maxWaitMs = 60000,
  intervalMs = 2500,
): Promise<any> => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    try {
      // 1. Poll GET /assessments/:id/gates/2/pillars/:pillar/items?from=1&through=4
      const itemsRes = await fetchGate2PillarItems(assessmentId, pillar, { from: 1, through: 4 });
      const itemsData = unwrapAssessmentData<Record<string, any>>(itemsRes) ?? (itemsRes as Record<string, any>);
      const rawItems = itemsData?.items || itemsData?.data?.items;
      const normalizedItems = normalizeAssessmentItems(rawItems);
      const isReady =
        (itemsData?.contentReady === true || itemsData?.content_ready === true) &&
        normalizedItems.length > 0;

      if (isReady || normalizedItems.length > 0) {
        const startRes = await apiClient.post({
          url: `/assessments/${assessmentId}/gates/2/start`,
          body: { pillar },
          auth: true,
        });
        const payload = applyGate2ScreenPayload(startRes);
        if (payload) return startRes;
        if (normalizedItems.length > 0) return itemsRes;
      }

      // 2. Poll GET /assessments/:id/gates/2/resume-state
      const resumeRaw = await apiClient.get<Record<string, any>>({
        url: `/assessments/${assessmentId}/gates/2/resume-state`,
        auth: true,
        suppressErrorToast: true,
      });
      const resumeData = unwrapAssessmentData<Record<string, any>>(resumeRaw) ?? (resumeRaw as Record<string, any>);
      if (
        (resumeData?.contentReady === true || resumeData?.content_ready === true) &&
        Array.isArray(resumeData?.items) &&
        resumeData.items.length > 0
      ) {
        const startRes = await apiClient.post({
          url: `/assessments/${assessmentId}/gates/2/start`,
          body: { pillar },
          auth: true,
        });
        const payload = applyGate2ScreenPayload(startRes);
        if (payload) return startRes;
      }
    } catch {
      // Continue polling until timeout
    }
  }

  throw new Error(
    'Interview question generation is taking longer than expected. The queue worker may be stuck.'
  );
};

interface StageTwoInterviewBaseProps {
  interviewNumber: number; // e.g., 1 or 2
  interviewTitle: string; // e.g., "Pharmacology in the field"
  sectionTitle: string;
  sectionSub: string;
  whyMattersText: string;
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

  const activeComponentId = useMemo(() => {
    return (
      apiScreenData?.componentId ||
      (apiScreenData as any)?.component_id ||
      (apiScreenData as any)?.data?.componentId ||
      null
    );
  }, [apiScreenData]);

  useEffect(() => {
    if (!activeAssessmentId) {
      setApiLoading(false);
      setApiError('No active interview. Return to the journey and begin Stage 2.');
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
            msg.toLowerCase().includes('try again') ||
            msg.toLowerCase().includes('not ready')
          ) {
            res = await pollResumeStateUntilReady(activeAssessmentId, pillar);
          } else {
            throw startErr;
          }
        }

        if (cancelled) return;

        const rawData = unwrapAssessmentData<Record<string, any>>(res) ?? (res as Record<string, any>);
        const rawItems = rawData?.items || rawData?.data?.items;
        const normalizedItems = normalizeAssessmentItems(rawItems);

        // If contentReady === false or items are empty when pillar isn't complete yet, poll until ready
        const isPreparing =
          rawData?.contentReady === false ||
          rawData?.content_ready === false ||
          (!normalizedItems.length && !rawData?.pillarCompleted && !rawData?.gate2Complete);

        if (isPreparing) {
          res = await pollResumeStateUntilReady(activeAssessmentId, pillar);
          if (cancelled) return;
        }

        const resolvedData = unwrapAssessmentData<Record<string, any>>(res) ?? (res as Record<string, any>);

        if (resolvedData?.pillarCompleted) {
          const nextPill = resolvedData.nextPillar;
          if (nextPill) {
            const nextPath = gate2PillarIntroPath(roleSlug, nextPill) || gate2PillarStartPath(roleSlug, nextPill);
            if (nextPath) {
              navigate(nextPath, { replace: true });
              return;
            }
          } else if (resolvedData.nextStep === 'GATE2_COMPLETE') {
            // All pillars done — go to review so the user can do POST gates/2/submit.
            // /analyzing is only valid AFTER final submit; routing there directly
            // causes a 400 (ASSESSMENT_GATE2_FINAL_SUBMIT_REQUIRED) → loop.
            navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`, { replace: true });
            return;
          }
        }

        const payload = applyGate2ScreenPayload(res);
        if (payload) {
          const { data, items, window, progress } = payload;
          setApiScreenData(data);
          const rawStatus = String(data?.status || '').toUpperCase();
          const isSubmittedOrDone =
            data?.alreadySubmitted === true ||
            rawStatus === 'COMPLETED' ||
            rawStatus === 'SUBMITTED' ||
            rawStatus === 'CLOSED' ||
            Boolean(data?.submittedAt) ||
            Boolean(data?.completedAt) ||
            isComponentSubmitted(data?.componentId);

          if (data?.componentId && isSubmittedOrDone) {
            markComponentSubmitted(data.componentId);
            if (activeAssessmentId) {
              await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, data.componentId);
            }
            return;
          }
          if (data?.componentId && !isSubmittedOrDone) {
            unmarkComponentSubmitted(data.componentId);
          }
          setActiveItems(items);
          const defaultTotal = DEFAULT_GATE2_PILLAR_TOTALS[partNumber] || 20;
          const total = (progress?.total && progress.total > items.length)
            ? progress.total
            : defaultTotal;
          const current = progress?.current || 1;
          const answered = progress?.answered || 0;
          setPillarProgress({ total, current, answered });

          const initialThrough = window?.through ?? items.length;
          const initialFrom = window?.from ?? 1;
          const hasMoreCalculated = window?.hasMore !== undefined
            ? window.hasMore
            : initialThrough < total;

          setWindowInfo({
            from: initialFrom,
            through: initialThrough,
            hasMore: hasMoreCalculated,
          });

          const initialResponses = data.responses || (res as any)?.responses || (res as any)?.data?.responses;
          if (initialResponses && typeof initialResponses === 'object') {
            const unansweredSeq =
              (payload as any)?.routing?.unansweredSequence ||
              (res as any)?.data?.routing?.unansweredSequence ||
              (data as any)?.routing?.unansweredSequence;
            for (const [key, val] of Object.entries(initialResponses)) {
              if (val !== undefined && val !== null) {
                const item = items.find((i) => i.id === key);
                if (!unansweredSeq || (item as any)?.sequence !== unansweredSeq) {
                  lockedResponsesRef.current[key] = val;
                }
              }
            }

            // Auto-heal any code responses where findings or reason is missing
            const healedResponses = { ...initialResponses };
            for (const item of items) {
              const itemType = String(item.type ?? '').toLowerCase();
              if (itemType === 'code' || itemType === 'livecode') {
                const resp = healedResponses[item.id];
                if (resp && typeof resp === 'object' && !resp.findings) {
                  const text = resp.code || resp.reason || resp.solution || '';
                  healedResponses[item.id] = {
                    ...resp,
                    findings: text,
                    reason: text,
                    reasoning: text,
                    solution: text,
                  };
                }
              }
            }
            setAnswers((prev: any) => ({ ...healedResponses, ...prev }));
          }

          if (data?.questionsRegenerated) {
            toast('Fresh questions generated for remaining unanswered items.', { icon: '🔄' });
          }
          setApiLoading(false);
          return;
        }

        setApiError('Interview question generation is taking longer than expected. The queue worker may be stuck.');
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
  const inFlightDraftSaveRef = useRef<Promise<void> | null>(null);

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
          const ENABLE_TIMER_EXPIRY = import.meta.env.VITE_ENABLE_TIMER_EXPIRY === 'true';
          if (ENABLE_TIMER_EXPIRY) {
            handleSubmit('time-up');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [savedForLater, showCheatModal]);

  // Tab switch visibility listener: save current window draft answers on blur without resetting item window
  useEffect(() => {
    const ENABLE_ANTI_CHEAT_TAB_SWITCH = import.meta.env.VITE_ENABLE_ANTI_CHEAT_TAB_SWITCH === 'true';
    if (!ENABLE_ANTI_CHEAT_TAB_SWITCH) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !savedForLater) {
        blurTimerRef.current = setTimeout(async () => {
          try {
            // Flush draft answers for current window silently
            if (
              activeAssessmentId &&
              apiScreenData?.componentId &&
              !isComponentSubmitted(apiScreenData.componentId) &&
              Object.keys(answers).length > 0
            ) {
              const draftPayload = buildCurrentWindowDraftPayload();
              if (Object.keys(draftPayload).length > 0) {
                await safeSaveDraft(draftPayload).catch(() => { });
              }
            }
          } catch (err) {
            console.warn('Tab switch draft save notice:', err);
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
  }, [activeAssessmentId, apiScreenData, answers, savedForLater]);

  const handleAnswer = async (itemId: string, value: any, item: any, subKey?: string) => {
    if (lockedResponsesRef.current[itemId]) {
      return;
    }
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
      if (i && i.id) {
        allFetchedItemsRef.current.set(i.id, i);
      }
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
    for (let i = 0; i < targetItems.length; i++) {
      const item = targetItems[i];
      const qNum = windowInfo.from ? windowInfo.from + i : i + 1;
      const typeStr = String(item.type ?? '').toLowerCase().trim();
      const minWords = getReasonMinWords(item?.content as any, typeStr);
      const maxWords = Number(item?.content?.maxWords) > 0 ? Number(item.content.maxWords) : 300;

      const val = currentAnswers[item.id];
      const reason = extractReasonText(val);
      const wordCount = reason ? reason.trim().split(/\s+/).filter(Boolean).length : 0;

      const needsReason =
        isWrittenReasonType(typeStr) ||
        hasReasonField(item.content as any) ||
        minWords > 0 ||
        Boolean(item.content?.whyThisMatters);

      if (needsReason && (!reason || reason.trim().length === 0)) {
        toast.error(`Please write your explanation for Question ${qNum} before continuing.`);
        const el = document.getElementById(`assessment-item-${item.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = el?.querySelector('textarea:not([disabled]), input:not([disabled])') as HTMLElement | null;
        setTimeout(() => focusable?.focus(), 300);
        return false;
      }

      if (minWords > 0) {
        if (!validateMinWords(reason, minWords)) {
          toast.error(`Please provide at least ${minWords} words for your explanation in Question ${qNum}.`);
          const el = document.getElementById(`assessment-item-${item.id}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const focusable = el?.querySelector('textarea:not([disabled]), input:not([disabled])') as HTMLElement | null;
          setTimeout(() => focusable?.focus(), 300);
          return false;
        }
      }

      if (wordCount > maxWords) {
        toast.error(`Your response for Question ${qNum} is too long (${wordCount} words). Maximum allowed is ${maxWords} words.`);
        const el = document.getElementById(`assessment-item-${item.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = el?.querySelector('textarea:not([disabled]), input:not([disabled])') as HTMLElement | null;
        setTimeout(() => focusable?.focus(), 300);
        return false;
      }
    }
    return true;
  };

  const buildUnlockedDraftPayload = (rawAnswers: Record<string, any>, itemsForTypes?: AssessmentItem[]) => {
    const unlocked: Record<string, any> = {};
    const allItems = (itemsForTypes ?? []).concat(
      Array.from(allFetchedItemsRef.current.values()),
      apiScreenData?.items ?? [],
      activeDisplayedItems ?? [],
    );
    const itemMap = new Map<string, AssessmentItem>();
    allItems.forEach((i) => {
      if (i && i.id) itemMap.set(i.id, i);
    });

    for (const [itemId, val] of Object.entries(rawAnswers)) {
      if (!itemId || !itemId.trim()) continue;
      if (lockedResponsesRef.current[itemId]) continue;
      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
        const item = itemMap.get(itemId);
        // Only include in draft PATCH payload when complete (prevents partial then complete 400 locked errors)
        if (!item || isItemAnswerComplete(item, val)) {
          unlocked[itemId] = val;
        }
      }
    }
    return sanitizeAnswers(unlocked, itemsForTypes);
  };

  const safeSaveDraft = async (unlockedPayload: Record<string, any>): Promise<{ alreadySubmitted?: boolean } | void> => {
    const compId = activeComponentId;
    if (!compId || !activeAssessmentId) {
      return;
    }

    // Filter out items already locked on the server to avoid 400 errors
    const validPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(unlockedPayload)) {
      if (!key || !key.trim()) continue;
      if (!lockedResponsesRef.current[key] && val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
        validPayload[key] = val;
      }
    }

    if (Object.keys(validPayload).length === 0) return;

    let isAlreadySubmitted = false;

    const savePromise = (async () => {
      try {
        const saveRes = await saveDraftMutation.mutateAsync({
          assessmentId: activeAssessmentId,
          componentId: compId,
          responses: validPayload,
        });

        if (isComponentSubmitted(compId)) {
          isAlreadySubmitted = true;
          return;
        }

        // Mark all saved keys as locked locally so subsequent patches don't re-send them
        Object.keys(validPayload).forEach((k) => {
          lockedResponsesRef.current[k] = validPayload[k] ?? true;
        });

        const respObj = (saveRes as any)?.responses || (saveRes as any)?.data?.responses;
        if (respObj && typeof respObj === 'object') {
          Object.keys(respObj).forEach((k) => {
            lockedResponsesRef.current[k] = respObj[k] ?? true;
          });
          setAnswers((prev: any) => ({ ...prev, ...respObj }));
        }
      } catch (err: any) {
        const rawMsg =
          err?.response?.data?.message ||
          err?.data?.message ||
          getApiErrorMessage(err, '') ||
          err?.message ||
          '';
        const errMessage = String(rawMsg);
        const lowerMsg = errMessage.toLowerCase();
        if (
          lowerMsg.includes('already been submitted') ||
          lowerMsg.includes('already submitted') ||
          lowerMsg.includes('component is closed') ||
          lowerMsg.includes('component has ended')
        ) {
          markComponentSubmitted(compId);
          isAlreadySubmitted = true;
          return;
        }
        if (
          lowerMsg.includes('locked') ||
          lowerMsg.includes('cannot be changed') ||
          lowerMsg.includes('time limit') ||
          lowerMsg.includes('ended')
        ) {
          const match = errMessage.match(/item\s+([a-zA-Z0-9_-]+):/);
          if (match && match[1]) {
            lockedResponsesRef.current[match[1]] = true;
          }
          Object.keys(validPayload).forEach((k) => {
            lockedResponsesRef.current[k] = true;
          });
          return;
        }
        throw err;
      }
    })();

    inFlightDraftSaveRef.current = savePromise;
    try {
      await savePromise;
      if (isAlreadySubmitted || isComponentSubmitted(compId)) {
        return { alreadySubmitted: true };
      }
    } finally {
      if (inFlightDraftSaveRef.current === savePromise) {
        inFlightDraftSaveRef.current = null;
      }
    }
  };

  const buildCurrentWindowDraftPayload = () => {
    const windowAnswers: Record<string, any> = {};
    for (const item of activeDisplayedItems) {
      if (!item?.id || !item.id.trim()) continue;
      if (lockedResponsesRef.current[item.id]) continue;
      const val = answers[item.id];
      if (val !== undefined && val !== null && val !== '' && isItemAnswerComplete(item, val)) {
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
        windowAnswers[item.id] = val;
      }
    }
    return sanitizeAnswers(windowAnswers, activeDisplayedItems);
  };

  const buildAllResponsesPayload = () => {
    const merged: Record<string, any> = {};

    // 1. Locked / drafted responses from earlier windows
    for (const [id, val] of Object.entries(lockedResponsesRef.current)) {
      if (id && val !== undefined && val !== null && val !== '' && val !== true) {
        merged[id] = val;
      }
    }

    // 2. Answers recorded locally across windows
    for (const [id, val] of Object.entries(answers)) {
      if (id && val !== undefined && val !== null && val !== '') {
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) continue;
        merged[id] = val;
      }
    }

    // 3. Current active window answers guarantee
    for (const item of activeDisplayedItems) {
      if (item?.id && answers[item.id] !== undefined && answers[item.id] !== null && answers[item.id] !== '') {
        merged[item.id] = answers[item.id];
      }
    }

    const sanitized = sanitizeAnswers(merged);
    if (Object.keys(sanitized).length === 0) {
      return buildCurrentWindowDraftPayload();
    }
    return sanitized;
  };

  const handleSubmit = async (reason?: string) => {
    if (isSubmitting) return;

    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }

    // Hard guard 1: Never submit if there are remaining windows or through < total
    if (isHasMoreWindows || (pillarProgress.total > 0 && windowInfo.through < pillarProgress.total)) {
      return handleContinueNextWindow();
    }

    // Hard guard 2: Never submit until all questions are answered
    if (pillarProgress.total > 0 && pillarProgress.answered < pillarProgress.total) {
      toast.error(`Please answer all ${pillarProgress.total} questions before submitting.`);
      return;
    }

    setIsSubmitting(true);

    if (reason) {
      sessionStorage.setItem('submitReason', reason);
    }

    const compId = activeComponentId;
    if (!activeAssessmentId || !compId) {
      toast.error('Interview is not ready. Please reload and try again.');
      setIsSubmitting(false);
      return;
    }

    if (isComponentSubmitted(compId)) {
      await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, compId);
      setIsSubmitting(false);
      return;
    }

    try {
      if (inFlightDraftSaveRef.current) {
        await inFlightDraftSaveRef.current.catch(() => { });
      }

      // Step 1: Ensure any newly answered unlocked items are drafted first via PATCH (if not submitted)
      if (!isComponentSubmitted(compId)) {
        const unlockedDraft = buildUnlockedDraftPayload(answers);
        if (Object.keys(unlockedDraft).length > 0) {
          await safeSaveDraft(unlockedDraft);
        }
      }

      // Step 2: Final submit.
      // Backend validates incoming responses in submit body: must include all answered items, never {}
      const submitPayload = buildAllResponsesPayload();
      const submitRes = await submitScreenMutation.mutateAsync({
        assessmentId: activeAssessmentId,
        componentId: compId,
        responses: submitPayload,
      });

      markComponentSubmitted(compId);
      toast.success('All answers locked, saved and submitted.');
      const resData = (submitRes as any)?.data || submitRes;
      const targetPath = resolveNextPillarRoute(roleSlug, resData, partNumber);
      navigate(targetPath);
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        getApiErrorMessage(err) ||
        err?.message ||
        '';

      const lower = serverMsg.toLowerCase();
      if (lower.includes('locked') || lower.includes('cannot be changed')) {
        try {
          // Recovery: Re-attempt submit with sanitized window payload (never empty {})
          const windowPayload = buildCurrentWindowDraftPayload();
          const retryPayload = Object.keys(windowPayload).length > 0 ? windowPayload : buildAllResponsesPayload();
          const retryRes = await submitScreenMutation.mutateAsync({
            assessmentId: activeAssessmentId,
            componentId: compId,
            responses: retryPayload,
          });
          markComponentSubmitted(compId);
          toast.success('All answers locked, saved and submitted.');
          const resData = (retryRes as any)?.data || retryRes;
          const targetPath = resolveNextPillarRoute(roleSlug, resData, partNumber);
          navigate(targetPath);
          return;
        } catch (retryErr: any) {
          console.warn('Retry submit failed:', retryErr);
        }
      }

      if (
        lower.includes('already submitted') ||
        lower.includes('already been submitted') ||
        lower.includes('component is closed') ||
        lower.includes('component has ended') ||
        lower.includes('time limit has expired')
      ) {
        markComponentSubmitted(compId);
        await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, compId);
        return;
      }

      toast.error(serverMsg || 'Failed to submit. Please try again.');
    } finally {
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

  // Keep pillarProgress.answered in sync with actual local + locked answered counts
  useEffect(() => {
    const lockedCount = Object.keys(lockedResponsesRef.current).length;
    const localAnsweredCount = activeDisplayedItems.filter((item) => {
      const val = answers[item.id];
      return val !== undefined && val !== null && val !== '';
    }).length;
    // Only count local answers that aren't already locked
    const localOnlyCount = activeDisplayedItems.filter((item) => {
      const val = answers[item.id];
      return val !== undefined && val !== null && val !== '' && !lockedResponsesRef.current[item.id];
    }).length;
    const totalAnswered = lockedCount + localOnlyCount;
    if (totalAnswered > pillarProgress.answered) {
      setPillarProgress((prev) => ({ ...prev, answered: totalAnswered }));
    }
  }, [answers, activeDisplayedItems, pillarProgress.answered]);

  useEffect(() => {
    if (isAllAnswered) setShowContinueValidation(false);
  }, [isAllAnswered]);

  const scrollToFirstIncomplete = () => {
    const first = incompleteItems[0];
    if (!first) return;
    const el = document.getElementById(`assessment-item-${first.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = el.querySelector('textarea:not([disabled]), input:not([disabled])') as HTMLElement | null;
      setTimeout(() => focusable?.focus(), 300);
    }
  };

  const isHasMoreWindows = useMemo(() => {
    if (pillarProgress.total > 0 && windowInfo.through < pillarProgress.total) return true;
    if (windowInfo.hasMore === true) return true;
    if (pillarProgress.total > 0 && pillarProgress.answered >= pillarProgress.total && windowInfo.through >= pillarProgress.total) return false;
    if (windowInfo.hasMore === false && (!pillarProgress.total || windowInfo.through >= pillarProgress.total)) return false;
    if (pillarProgress.total > 0) return windowInfo.through < pillarProgress.total;
    return Boolean(windowInfo.hasMore);
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

    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }

    const compId = activeComponentId;
    setIsSubmitting(true);
    setApiLoading(true);
    try {
      if (!activeAssessmentId || !compId) {
        toast.error('Interview is not ready. Please reload and try again.');
        setApiLoading(false);
        setIsSubmitting(false);
        return;
      }

      // Rule 5: Ensure window 1-4 is 100% complete before requesting window 5-8
      const incompleteInWindow = activeDisplayedItems.filter(
        (item) => !isItemAnswerComplete(item, answers[item.id]),
      );

      if (incompleteInWindow.length > 0) {
        toast.error('Please answer all questions on this page before continuing.');
        scrollToFirstIncomplete();
        setApiLoading(false);
        setIsSubmitting(false);
        return;
      }

      if (!validateWindowMinWords(activeDisplayedItems, answers)) {
        setApiLoading(false);
        setIsSubmitting(false);
        return;
      }

      const payloadResponses = buildCurrentWindowDraftPayload();

      // Hard gate: never show the next window unless draft save of unlocked answers succeeds.
      const draftResult = await safeSaveDraft(payloadResponses);
      if (draftResult?.alreadySubmitted) {
        await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, compId);
        return;
      }

      const nextFrom = windowInfo.through + 1;
      const nextThrough = windowInfo.through + 4;

      let res: any;
      try {
        res = await fetchGate2PillarItems(activeAssessmentId, pillar, {
          from: nextFrom,
          through: nextThrough,
        });

        // Graceful handling of contentReady === false: poll every 2.5s until generated
        const initialUnwrapped = unwrapAssessmentData<Record<string, any>>(res) ?? (res as Record<string, any>);

        // Honor pillarCompleted immediately if backend reported it
        if (initialUnwrapped?.pillarCompleted || (res as any)?.pillarCompleted) {
          const targetPath = resolveNextPillarRoute(roleSlug, res?.data || res, partNumber);
          toast.success('Pillar completed! Moving to the next section.');
          navigate(targetPath, { replace: true });
          return;
        }

        const initialItems = normalizeAssessmentItems(initialUnwrapped?.items || initialUnwrapped?.data?.items);
        const isContentWarming =
          initialUnwrapped?.contentReady === false ||
          initialUnwrapped?.content_ready === false ||
          (!initialItems.length && !initialUnwrapped?.pillarCompleted && (pillarProgress.total === 0 || windowInfo.through < pillarProgress.total));

        if (isContentWarming) {
          toast('Preparing next questions with AI...', { icon: '⏳', id: 'items-warming' });
          const pollStartTime = Date.now();
          while (Date.now() - pollStartTime < 60000) {
            await new Promise((r) => setTimeout(r, 2500));
            const pollRes = await fetchGate2PillarItems(activeAssessmentId, pillar, {
              from: nextFrom,
              through: nextThrough,
            });
            const pollUnwrapped = unwrapAssessmentData<Record<string, any>>(pollRes) ?? (pollRes as Record<string, any>);

            if (pollUnwrapped?.pillarCompleted) {
              toast.dismiss('items-warming');
              const targetPath = resolveNextPillarRoute(roleSlug, (pollRes as any)?.data || pollRes, partNumber);
              toast.success('Pillar completed! Moving to the next section.');
              navigate(targetPath, { replace: true });
              return;
            }

            const pollItems = normalizeAssessmentItems(pollUnwrapped?.items || pollUnwrapped?.data?.items);
            if (
              (pollUnwrapped?.contentReady === true || pollUnwrapped?.content_ready === true || pollItems.length > 0) &&
              pollItems.length > 0
            ) {
              res = pollRes;
              toast.dismiss('items-warming');
              break;
            }
          }
          toast.dismiss('items-warming');
        }
      } catch (fetchErr: any) {
        const rawMsg =
          fetchErr?.response?.data?.message ||
          fetchErr?.data?.message ||
          getApiErrorMessage(fetchErr, '') ||
          fetchErr?.message ||
          '';
        const lowerMsg = String(rawMsg).toLowerCase();
        if (
          lowerMsg.includes('already submitted') ||
          lowerMsg.includes('already been submitted') ||
          lowerMsg.includes('component is closed') ||
          lowerMsg.includes('component has ended')
        ) {
          markComponentSubmitted(compId);
          await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, compId);
          return;
        }
        throw fetchErr;
      }

      let payload = applyGate2ScreenPayload(res);
      let nextItems = payload?.items || [];
      let nextWindow = payload?.window;
      let nextProgress = payload?.progress;

      const routingInfo = (payload as any)?.routing || (res as any)?.data?.routing || (res as any)?.routing;
      const unansweredSeq = routingInfo?.unansweredSequence;

      const fetchedResponses = (res as any)?.responses || (res as any)?.data?.responses || payload?.data?.responses;
      if (fetchedResponses && typeof fetchedResponses === 'object') {
        for (const [key, val] of Object.entries(fetchedResponses)) {
          if (val !== undefined && val !== null) {
            const item = activeDisplayedItems.find((i) => i.id === key);
            if (!unansweredSeq || (item as any)?.sequence !== unansweredSeq) {
              lockedResponsesRef.current[key] = val;
            }
          }
        }
      }

      if (nextItems.length > 0) {
        // If the backend clamped and returned the same window items:
        const isSameWindowReturned =
          (nextWindow && nextWindow.from <= windowInfo.from) ||
          nextItems.every((ni) => activeDisplayedItems.some((ai) => ai.id === ni.id));

        if (isSameWindowReturned) {
          // If backend indicates it is already completed, auto-advance to next section
          if (
            (payload as any)?.data?.alreadySubmitted ||
            (res as any)?.data?.alreadySubmitted ||
            (payload as any)?.data?.status === 'completed'
          ) {
            const targetPath = resolveNextPillarRoute(roleSlug, res?.data || res, partNumber);
            toast.success('Pillar completed! Moving to the next section.');
            navigate(targetPath, { replace: true });
            return;
          }

          // If the backend says all items are answered, this pillar is actually complete —
          // the clamp happened because there are no NEW items to advance to.
          const answeredAll =
            (nextProgress && nextProgress.answered >= nextProgress.total) ||
            (pillarProgress.total > 0 && pillarProgress.answered >= pillarProgress.total);

          if (answeredAll) {
            const targetPath = resolveNextPillarRoute(roleSlug, res?.data || res, partNumber);
            toast.success('All questions answered! Moving to the next section.');
            navigate(targetPath, { replace: true });
            return;
          }

          // Backend handoff: Trust progress.current, not "re-answer the last question".
          // If routing.reason === "PREVIOUS_SCREEN_INCOMPLETE" and that sequence is already in responses,
          // treat as stale/misleading: poll for next window rather than unlocking for a re-click.
          const routingReason = String(routingInfo?.reason || '').toUpperCase();
          const unansweredItem = unansweredSeq
            ? activeDisplayedItems.find((item: any) => item.sequence === unansweredSeq)
            : null;
          const isUnansweredSeqAlreadySaved = Boolean(
            unansweredItem &&
            fetchedResponses &&
            fetchedResponses[unansweredItem.id] !== undefined &&
            fetchedResponses[unansweredItem.id] !== null &&
            fetchedResponses[unansweredItem.id] !== '',
          );

          if (
            routingReason === 'PREVIOUS_SCREEN_INCOMPLETE' &&
            isUnansweredSeqAlreadySaved
          ) {
            const pollStartTime = Date.now();
            let pollAdvanced = false;
            while (Date.now() - pollStartTime < 30000) {
              await new Promise((r) => setTimeout(r, 2500));
              const retryRes = await fetchGate2PillarItems(activeAssessmentId, pillar, {
                from: nextFrom,
                through: nextThrough,
              });
              const retryPayload = applyGate2ScreenPayload(retryRes);
              if (
                retryPayload &&
                retryPayload.items.length > 0 &&
                !retryPayload.items.every((ni) => activeDisplayedItems.some((ai) => ai.id === ni.id))
              ) {
                payload = retryPayload;
                nextItems = retryPayload.items;
                nextWindow = retryPayload.window;
                nextProgress = retryPayload.progress;
                pollAdvanced = true;
                break;
              }
            }

            if (!pollAdvanced) {
              setApiLoading(false);
              setIsSubmitting(false);
              toast('Next questions are warming. Please tap Continue again in a few seconds.', { icon: '⏳' });
              return;
            }
          } else {
            setShowContinueValidation(true);
            const guidanceMsg =
              routingInfo?.guidance ||
              'Complete all questions in window 1–4 before advancing.';
            toast.error(guidanceMsg);
            if (unansweredItem) {
              const el = document.getElementById(`assessment-item-${unansweredItem.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setApiLoading(false);
            setIsSubmitting(false);
            return;
          }
        }

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
        // Empty items returned:
        // If total is known and through < total, AI questions are still preparing — DO NOT navigate away!
        if (pillarProgress.total > 0 && windowInfo.through < pillarProgress.total) {
          toast('The next questions are still preparing. Please tap Continue again in a moment.', { icon: '⏳' });
          setApiLoading(false);
          setIsSubmitting(false);
          return;
        }

        const nextPartMap: Record<number, string> = {
          1: `/onboarding/talent/${roleSlug}/interview/stage-2/part-2/intro`,
          2: `/onboarding/talent/${roleSlug}/interview/stage-2/part-3/intro`,
          3: `/onboarding/talent/${roleSlug}/interview/stage-2/part-4/intro`,
          4: `/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`,
        };
        const targetPath = nextPartMap[partNumber] || `/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`;
        navigate(targetPath, { replace: true });
        return;
      }
    } catch (err: any) {
      console.error('Failed to save draft or load next window:', err);
      const serverMsg =
        getApiErrorMessage(err) ||
        err?.message ||
        '';

      const lower = serverMsg.toLowerCase();
      if (
        lower.includes('already submitted') ||
        lower.includes('already been submitted') ||
        lower.includes('component is closed') ||
        lower.includes('component has ended') ||
        lower.includes('time limit has expired')
      ) {
        if (compId) markComponentSubmitted(compId);
        if (activeAssessmentId) {
          await navigateGate2Authoritative(activeAssessmentId, roleSlug, navigate, undefined, compId || undefined);
        }
        return;
      }

      toast.error(serverMsg || 'Could not save your answers. Please try again before continuing.');
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
    const ENABLE_TIMER_EXPIRY = import.meta.env.VITE_ENABLE_TIMER_EXPIRY === 'true';
    if (!ENABLE_TIMER_EXPIRY) return 'timer-chip';
    if (secondsLeft <= 60) return 'timer-chip warn';
    if (secondsLeft <= 180) return 'timer-chip caution';
    return 'timer-chip';
  };

  const progressMeta = useMemo(() => {
    const totalQuestions = pillarProgress.total || apiScreenData?.items.length || 0;
    const fromQ = Math.max(1, windowInfo.from || 1);
    const totalSessions = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_SESSION));
    const currentSession = Math.min(
      Math.max(1, Math.ceil(fromQ / QUESTIONS_PER_SESSION)),
      totalSessions,
    );
    const completedSessions = Math.max(0, currentSession - 1);

    return {
      totalQuestions,
      currentQNum: fromQ,
      totalSessions,
      currentSession,
      completedSessions,
    };
  }, [
    pillarProgress.total,
    apiScreenData?.items.length,
    windowInfo.from,
  ]);

  if (apiLoading) {
    return <FullPageSpinner message="Loading your Interview Screen" />;
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
          <div className="fixed left-[16px] sm:left-[32px] top-[44px] sm:top-[48px] z-[100] hidden sm:block">
            <ProctoringCamera />
          </div>
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
                    className={`h-[5px] rounded-full transition-all duration-200 ${isActive
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
              <div className="inline-flex items-center gap-[7px] bg-transparent border border-[#387DFF] text-[#0047CC] text-[11px] font-[800] tracking-[0.7px] uppercase px-[12px] py-[5px] rounded-full mb-[14px]">
                {currentHeaderItem?.eyebrow || `Part ${partNumber} · Knowledge`}
              </div>
              <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
                {currentHeaderItem?.screenTitle || currentHeaderItem?.title || sectionTitle}
              </h1>
              <p className="text-[14px] text-[#808080] leading-[1.6] mb-[20px]">
                {currentHeaderItem?.screenSubtitle || sectionSub}
              </p>

              {/* Why matters component */}
              <div className="bg-transparent border border-blue-200 rounded-[8px] p-[12px_14px] flex gap-[10px] mb-[22px]">
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
                isLocked={(itemId, subKey) =>
                  isSubmitting || isLocked(itemId, subKey) || lockedResponsesRef.current[itemId] !== undefined
                }
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
          </div>
          <div className="flex gap-[10px] items-center">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={isSubmitting}
              className={`bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] font-sans transition-all ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#F7F7F7]'
                }`}
            >
              Save and finish later
            </button>
            <button
              type="button"
              onClick={() => {
                if (isSubmitting) return;
                if (!isAllAnswered) {
                  const firstIncompleteIdx = activeDisplayedItems.findIndex(
                    (item) => !isItemAnswerComplete(item, answers[item.id])
                  );
                  const firstIncomplete = firstIncompleteIdx >= 0 ? activeDisplayedItems[firstIncompleteIdx] : null;
                  const qNum = firstIncompleteIdx >= 0 ? (windowInfo.from ? windowInfo.from + firstIncompleteIdx : firstIncompleteIdx + 1) : 1;

                  if (firstIncomplete) {
                    const val = answers[firstIncomplete.id];
                    const typeStr = String(firstIncomplete.type ?? '').toLowerCase().trim();
                    const reason = extractReasonText(val);
                    const minWords = getReasonMinWords(firstIncomplete.content as any, typeStr);

                    // Check if choice exists
                    const hasChoice =
                      typeof val === 'string'
                        ? val.trim().length > 0
                        : typeof val === 'object' && val !== null && !Array.isArray(val)
                          ? Boolean((val as any).choice || (val as any).optionId || (val as any).selected || (val as any).selectedOption)
                          : false;

                    const needsReason =
                      isWrittenReasonType(typeStr) ||
                      hasReasonField(firstIncomplete.content as any) ||
                      minWords > 0 ||
                      Boolean(firstIncomplete.content?.whyThisMatters);

                    if (hasChoice && needsReason && (!reason || reason.trim().length === 0)) {
                      toast.error(`Please write your explanation for Question ${qNum} before continuing.`);
                    } else if (hasChoice && minWords > 0 && !validateMinWords(reason, minWords)) {
                      toast.error(`Please provide at least ${minWords} words for your explanation in Question ${qNum}.`);
                    } else if (!hasChoice) {
                      toast.error(`Please select your answer for Question ${qNum} before continuing.`);
                    } else {
                      toast.error(`Please make sure Question ${qNum} is fully answered before continuing.`);
                    }

                    const el = document.getElementById(`assessment-item-${firstIncomplete.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const focusable = el.querySelector('textarea:not([disabled]), input:not([disabled])') as HTMLElement | null;
                      setTimeout(() => focusable?.focus(), 300);
                    }
                  } else {
                    toast.error('Please make sure all questions on this page are fully answered before continuing.');
                    requestAnimationFrame(() => scrollToFirstIncomplete());
                  }

                  setShowContinueValidation(true);
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
              className={`border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] inline-flex items-center gap-[8px] font-sans transition-all ${isSubmitting
                  ? 'bg-[#E6E6E6] text-white shadow-none cursor-not-allowed'
                  : !isAllAnswered
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
                  className={`bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[11px_18px] text-[13.5px] font-[700] font-sans transition-all ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#F7F7F7]'
                    }`}
                >
                  Keep going
                </button>
                <button
                  onClick={() => void confirmSaveAndExit()}
                  disabled={isSubmitting}
                  className={`text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] inline-flex items-center gap-[8px] font-sans transition-all ${isSubmitting
                      ? 'bg-[#0047CC]/70 cursor-not-allowed'
                      : 'bg-[#0047CC] cursor-pointer shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1]'
                    }`}
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
