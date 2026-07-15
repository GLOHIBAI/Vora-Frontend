import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import VoraLogo from '../../common/VoraLogo';
import Button from '../../common/Button';
import AssessmentItemsList from './AssessmentItemsList';
import SessionChapterRail from './SessionChapterRail';
import SessionPebbleRail from './SessionPebbleRail';
import { useAssessmentScreen } from '../../../hooks/useAssessmentScreen';
import { normalizeAssessmentItems } from '../../../utils/assessmentItems';
import { getLikertQuestions } from '../../../utils/assessmentItems';
import type {
  AssessmentDraftResponse,
  AssessmentScreenStartResponse,
} from '../../../services/queries/assessments/types';

export interface AssessmentScreenProgress {
  label: string;
  percent: number;
}

export interface AssessmentScreenViewProps {
  assessmentId: string;
  screenData: AssessmentScreenStartResponse;
  draft?: AssessmentDraftResponse | null;
  /** e.g. "Stage 1 · How you think · Personality" */
  headerSubtitle: string;
  progress?: AssessmentScreenProgress;
  session?: number;
  sessionScreens?: readonly string[];
  screenIndex?: number;
  screenLabel?: string;
  companyName?: string;
  roleTitle?: string;
  onSaveExit: () => void;
  onScreenComplete: () => void;
}

interface ScreenMeta {
  title: string;
  subtitle: string;
  whyMatters: string;
}

const formatGateName = (name?: string): string => {
  if (!name) return 'Getting to know you';
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SCREEN_METADATA_MAP: Record<string, ScreenMeta> = {
  personality: {
    title: 'A few statements about how you tend to operate at work.',
    subtitle: "Pick the answer that feels most true for you, not the one that sounds best. We're after the honest version.",
    whyMatters: "Senior officers lead under uncertainty. The team uses this to understand the working style you'd bring, not to score you against a profile.",
  },
  forced_choice: {
    title: 'Pick what is most and least like you',
    subtitle: 'Every option is something people are happy to say about themselves. Choose the one most like you and the one least like you in each set.',
    whyMatters: 'This format resists flattering answers because lifting one quality means easing off another.',
  },
  values: {
    title: 'Different things motivate different people. Tell us what matters to you.',
    subtitle: 'Put these in the order that reflects what you genuinely value at work, not what sounds most professional.',
    whyMatters: 'Teams perform better when individual values align with the work. This is for finding fit, not filtering people out.',
  },
  values_tradeoff: {
    title: 'When two values compete, which way do you lean?',
    subtitle: 'Drag the slider to indicate which value is more important to you in real-world trade-offs.',
    whyMatters: 'This helps us understand how you make hard calls when there is no simple right answer.',
  },
  cognitive_fixed: {
    title: 'Working through problems',
    subtitle: 'These puzzles measure adaptive reasoning. Work quickly but carefully; you can pause and resume at any point.',
    whyMatters: 'Handling complex, unstructured information is a core part of the role. This predicts how you pick up new patterns.',
  },
  numerical: {
    title: 'Working with data and numbers',
    subtitle: 'Analyze the charts and data tables to answer the questions. You can use a calculator and scratch paper.',
    whyMatters: 'You will sign off on coverage, prevalence, and budget metrics. Comfort with data tables is key.',
  },
  verbal: {
    title: 'Reading and verbal reasoning',
    subtitle: 'Read the short passages and evaluate the statements as True, False, or Cannot Say based on the text.',
    whyMatters: 'Sifting evidence, parsing policy papers, and checking donor conditions are daily tasks for the team.',
  },
  pattern: {
    title: 'Identify the next shape in the pattern',
    subtitle: 'Select the option that logically completes the sequence of shapes.',
    whyMatters: 'Solving unfamiliar visual problems tests fluid logic and abstract thinking under cognitive load.',
  },
  sjt_single_best: {
    title: 'How you handle realistic scenarios',
    subtitle: 'Read the scenario and select the single best course of action from the choices provided.',
    whyMatters: 'Judgement under realistic pressure is what we are reading. There is rarely a single textbook solution.',
  },
  sjt_rank: {
    title: 'Rank the options from best to worst',
    subtitle: 'Read the scenario and rank the responses in order from most effective to least effective.',
    whyMatters: 'Prioritizing competing needs under pressure is a daily reality. Your ranking shows your decision-making framework.',
  },
  sjt_most_least: {
    title: 'Most and least likely actions',
    subtitle: 'Select the response you would be most likely to take, and the one you would be least likely to take.',
    whyMatters: 'Understanding boundaries and knowing what not to do is as important as knowing what to do.',
  },
  sjt_multi_select: {
    title: 'Select all actions that apply',
    subtitle: 'Identify all of the effective actions you would take to resolve the scenario.',
    whyMatters: 'Complex team dynamics demand multiple concurrent steps to manage risk and keep stakeholders aligned.',
  }
};

/**
 * Stage-agnostic assessment screen shell.
 * Consumes API items[] and delegates rendering to reusable item components.
 */
const AssessmentScreenView: React.FC<AssessmentScreenViewProps> = ({
  assessmentId,
  screenData,
  draft,
  headerSubtitle,
  progress,
  session = 1,
  sessionScreens,
  screenIndex = 0,
  screenLabel = 'How you think',
  companyName = 'Reach Africa',
  roleTitle = 'Senior Programme Officer',
  onSaveExit,
  onScreenComplete,
}) => {
  const {
    items,
    answers,
    recordAnswer,
    confirmScreen,
    saveCurrentDraft,
    isLocked,
    isSaving,
    isSubmitting,
    isAdaptiveLoading,
    isScreenComplete,
    hydrateDraft,
  } = useAssessmentScreen({
    assessmentId,
    screenData,
    onScreenComplete,
  });

  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [cheatType, setCheatType] = useState<'tab-switch' | 'paste' | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Tab change & paste warning listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatType('tab-switch');
        setShowCheatModal(true);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setCheatType('paste');
      setShowCheatModal(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Proctoring camera emulator
  useEffect(() => {
    const startRecordingEmulation = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true,
        });
        streamRef.current = stream;
        setHasCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Proctoring camera access denied or unavailable', err);
        setHasCamera(false);
      }
    };

    startRecordingEmulation();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (draft?.responses) {
      hydrateDraft(
        draft.responses,
        draft.items?.length ? normalizeAssessmentItems(draft.items) : undefined,
      );
    }
  }, [draft, hydrateDraft]);

  const totalQuestions = useMemo(() => {
    let count = 0;
    items.forEach((item) => {
      if (item.type === 'likert_scale') {
        const questions = getLikertQuestions(item);
        count += questions.length;
      } else {
        count += 1;
      }
    });
    return count;
  }, [items]);

  const answeredQuestions = useMemo(() => {
    let count = 0;
    items.forEach((item) => {
      const val = answers[item.id];
      if (item.type === 'likert_scale') {
        const answerMap =
          typeof val === 'object' && val !== null ? (val as Record<string, number>) : {};
        count += Object.keys(answerMap).filter(
          (k) => answerMap[k] !== undefined && answerMap[k] !== null,
        ).length;
      } else {
        if (val !== undefined && val !== null) {
          count += 1;
        }
      }
    });
    return count;
  }, [items, answers]);

  const interpolate = useCallback(
    (text: string): string => {
      if (!text) return '';
      return text
        .replace(/Senior programme officers/gi, `${roleTitle}s`)
        .replace(/Senior programme officer/gi, roleTitle)
        .replace(/Senior officers/gi, `${roleTitle}s`)
        .replace(/Senior officer/gi, roleTitle)
        .replace(/Reach Africa/g, companyName);
    },
    [roleTitle, companyName],
  );

  const meta = useMemo(() => {
    const hardcoded = SCREEN_METADATA_MAP[screenData.screenKey];
    const firstItem = items[0];
    return {
      title: firstItem?.screenTitle || firstItem?.title || hardcoded?.title || screenLabel || 'Assessment',
      subtitle: firstItem?.screenSubtitle || (firstItem?.content as any)?.instruction || hardcoded?.subtitle || 'Answer the questions to the best of your ability. Pause and resume anytime.',
      whyMatters: firstItem?.whyThisMatters || hardcoded?.whyMatters || 'Senior officers lead under uncertainty. The team uses this to understand the working style you would bring to the role.'
    };
  }, [screenData.screenKey, items, screenLabel]);

  const resolvedTitle = useMemo(() => interpolate(meta.title), [meta.title, interpolate]);
  const resolvedSubtitle = useMemo(() => interpolate(meta.subtitle), [meta.subtitle, interpolate]);
  const resolvedWhyMatters = useMemo(() => interpolate(meta.whyMatters), [meta.whyMatters, interpolate]);

  const resolvedEyebrow = useMemo(() => {
    const rawEyebrow = items[0]?.eyebrow;
    let label = '';
    if (rawEyebrow) {
      label = interpolate(rawEyebrow);
    } else {
      label = `Part ${screenIndex + 1} · ${screenLabel}`;
    }
    return label.replace(/·/g, '-').toUpperCase();
  }, [items, screenIndex, screenLabel, interpolate]);

  console.log("DEBUG AssessmentScreenView rendering:", {
    answers,
    isScreenComplete
  });

  return (

    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      {/* Fixed Header & Rails Wrapper */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white flex flex-col">
        {/* Topbar */}
        <header className="bg-white/96 backdrop-blur-[10px] border-b border-[#E6E6E6] p-[14px_32px] flex items-center justify-between">
          <VoraLogo size="sm" to="/dashboard" />
          <div className="text-[12.5px] text-[#808080] font-[600] text-center">
            Stage {screenData.gate ?? 1} · {screenData.gateName ? formatGateName(screenData.gateName) : 'Getting to know you'}
          </div>
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <svg className="w-[13px] h-[13px] text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {isSaving ? 'Saving…' : 'Auto-saved'}
          </div>
        </header>

        {/* Chapter Rail */}
        <SessionChapterRail
          activeSession={session as 1 | 2}
          leftContent={
            <div className="w-[130px] h-[74px] rounded-none border-[1.5px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] overflow-hidden bg-slate-900 flex items-center justify-center relative">
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-white/50 bg-[#0B0F14]">
                  <span className="text-[6px] font-extrabold tracking-wider leading-none">PROCTOR</span>
                </div>
              )}
              {/* REC Indicator */}
              <div className="absolute top-1 right-1 flex items-center justify-center bg-black/40 p-0.5 rounded-full select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                </span>
              </div>
            </div>
          }
        />

        {/* Pebble Rail */}
        <SessionPebbleRail activeIndex={screenIndex} total={sessionScreens?.length ?? 6} />
      </div>

      {/* Main Content */}
      <main className="max-w-[780px] mx-auto p-[156px_28px_110px] w-full flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] text-[10.5px] font-[800] tracking-[0.7px] uppercase p-[5px_12px] rounded-full mb-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[12.5px] h-[12.5px] shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {resolvedEyebrow}
          </div>
          <h1 className="text-[22px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-2">{resolvedTitle}</h1>
          <p className="text-[14px] text-[#808080] leading-[1.6]">{resolvedSubtitle}</p>
        </div>

        {/* Why Mini block */}
        <div className="bg-[#EBF6FF] rounded-[10px] p-[11px_14px] flex gap-2.5 items-start mb-8 text-[12.5px] text-[#182348] leading-[1.5]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] text-[#0047CC] shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
          </svg>
          <div>
            <strong>Why this matters:</strong> {resolvedWhyMatters}
          </div>
        </div>

        <AssessmentItemsList
          items={items}
          answers={answers}
          isLocked={(itemId, subKey) => isLocked(itemId, subKey) || isSubmitting || isAdaptiveLoading}
          onAnswer={(itemId, val, item, subKey) => {
            if (isSubmitting || isAdaptiveLoading) return;
            void recordAnswer(itemId, val, item, subKey);
          }}
          isAdaptiveLoading={isAdaptiveLoading}
        />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[16px] sm:px-[32px] py-[12px] sm:py-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-[12px] z-50">
        <div className="text-[12.5px] sm:text-[13px] text-[#808080] font-[600] text-center sm:text-left">
          Part {screenIndex + 1} of {sessionScreens?.length ?? 6} · Stage {screenData.gate ?? 1}
        </div>
        <div className="flex items-center gap-[8px] sm:gap-[10px] w-full sm:w-auto">
          <button 
            type="button"
            disabled={isSaving || isSubmitting || isAdaptiveLoading}
            className="flex-1 sm:flex-initial bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-xl py-2.5 sm:py-[11px] px-3 sm:px-[18px] text-[12px] sm:text-[13.5px] font-[700] cursor-pointer transition-all hover:border-[#ADADAD] whitespace-nowrap text-center justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={async () => {
              try {
                await saveCurrentDraft();
              } catch {
                // ignore
              }
              onSaveExit();
            }}
          >
            {isSaving ? 'Saving...' : 'Save & finish later'}
          </button>
          <button 
            type="button" 
            disabled={!isScreenComplete || isSubmitting || isAdaptiveLoading || isSaving}
            className="flex-1 sm:flex-initial bg-[#0047CC] text-white border-none rounded-xl py-2.5 sm:py-[12px] px-4 sm:px-[24px] text-[12.5px] sm:text-[14px] font-[700] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] whitespace-nowrap hover:bg-[#344DA1] hover:-translate-y-[1px] disabled:bg-[#E6E6E6] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none" 
            onClick={() => void confirmScreen()}
          >
            {isSubmitting
              ? 'Submitting...'
              : screenIndex === (sessionScreens?.length ?? 6) - 1
                ? 'Finish session'
                : 'Continue'}
          </button>
        </div>
      </footer>



      {/* Anti-cheat Alert Modal */}
      {showCheatModal && (
        <div className="fixed inset-0 bg-[#0A1129]/65 backdrop-blur-[6px] flex items-center justify-center p-[24px] z-[200]">
          <div className="bg-white rounded-[18px] max-w-[440px] w-full p-[30px_30px_26px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-[16px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[30px] h-[30px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-[900] text-[#1A1A1A] mb-[8px] tracking-[-0.2px] font-sans">
              {cheatType === 'tab-switch' ? 'You navigated away from this tab' : 'Pasting is prohibited'}
            </h3>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-[20px] font-sans">
              {cheatType === 'tab-switch' 
                ? 'Leaving or changing tabs is strictly prohibited during this assessment. This event has been flagged for review.'
                : 'Pasting content is not permitted. Please type your responses directly. This action has been flagged.'}
            </p>
            <button
              onClick={() => setShowCheatModal(false)}
              className="bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[10px] p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] w-full justify-center font-sans transition-all"
            >
              I understand and acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentScreenView;
