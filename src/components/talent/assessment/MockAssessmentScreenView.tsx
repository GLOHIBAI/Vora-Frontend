import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../AssessmentHeader';
import Button from '../../common/Button';
import Tag from '../../common/Tag';
import AssessmentItemsList from './AssessmentItemsList';
import SessionChapterRail from './SessionChapterRail';
import SessionPebbleRail from './SessionPebbleRail';
import { useLocalAssessmentScreen } from '../../../hooks/useLocalAssessmentScreen';
import type { AssessmentItem } from '../../../services/queries/assessments/types';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </svg>
);

export interface MockAssessmentScreenIntro {
  tagLabel?: ReactNode;
  title: string;
  subtitle?: string;
  whyMatters?: string;
}

export interface MockAssessmentScreenChrome {
  headerTitle: string;
  activeSession: 1 | 2;
  sessionLabels?: [string, string];
  activePebble: number;
  totalPebbles?: number;
}

export interface MockAssessmentScreenViewProps {
  chrome: MockAssessmentScreenChrome;
  intro: MockAssessmentScreenIntro;
  items: AssessmentItem[];
  /** Path after /onboarding/talent/:roleSlug/assessment/ */
  nextPath: string;
  footerHint?: string;
  /** Optional reading passage or other content above items */
  passage?: string[];
  maxWidthClass?: string;
  continueLabel?: string;
  onContinue?: () => void;
  hideSaveButton?: boolean;
}

const MockAssessmentScreenView: React.FC<MockAssessmentScreenViewProps> = ({
  chrome,
  intro,
  items,
  nextPath,
  footerHint,
  passage,
  maxWidthClass = 'max-w-[780px]',
  continueLabel = 'Continue',
  onContinue,
  hideSaveButton = false,
}) => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const handleComplete = () => {
    if (onContinue) {
      onContinue();
      return;
    }
    navigate(`/onboarding/talent/${roleSlug}/assessment/${nextPath}`);
  };

  const {
    items: liveItems,
    answers,
    recordAnswer,
    confirmScreen,
    isLocked,
    isSubmitting,
    isScreenComplete,
  } = useLocalAssessmentScreen(items, handleComplete);

  const handleSave = () => {
    toast.success('Saved. You can return anytime within 48 hours.');
  };

  const answeredCount = liveItems.filter((item) => {
    const val = answers[item.id];
    return val !== undefined && val !== null && val !== '';
  }).length;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
      <AssessmentHeader
        middleContent={chrome.headerTitle}
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
              <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
            </div>
            Auto-saved
          </div>
        }
      />

      <SessionChapterRail
        activeSession={chrome.activeSession}
        labels={chrome.sessionLabels}
      />

      <SessionPebbleRail
        activeIndex={chrome.activePebble}
        total={chrome.totalPebbles ?? 6}
      />

      <main className={`${maxWidthClass} w-full mx-auto px-[20px] sm:px-[32px] pt-[36px] pb-[120px] flex-1`}>
        {intro.tagLabel ? (
          <div className="mb-[14px]">
            <Tag
              variant="blue-soft"
              className="uppercase font-[800] tracking-[0.7px] px-[12px] py-[5px]"
              label={intro.tagLabel}
            />
          </div>
        ) : null}

        <h1 className="text-[22px] font-[700] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
          {intro.title}
        </h1>
        {intro.subtitle ? (
          <p className="text-[14px] text-[#808080] leading-[1.6] mb-[24px]">{intro.subtitle}</p>
        ) : null}

        {intro.whyMatters ? (
          <div className="flex gap-[10px] items-start mb-[30px] text-[12.5px] text-[#182348] leading-[1.5]">
            <InfoCircleIcon className="w-[15px] h-[15px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div>
              <strong className="font-[800]">Why this matters:</strong> {intro.whyMatters}
            </div>
          </div>
        ) : null}

        {passage?.length ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[24px_28px] mb-[24px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[10px]">
              Passage
            </div>
            <div className="text-[15px] text-[#1A1A1A] leading-[1.75] space-y-[12px]">
              {passage.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        ) : null}

        <AssessmentItemsList
          items={liveItems}
          answers={answers}
          isLocked={isLocked}
          onAnswer={(itemId, val, item, subKey) => void recordAnswer(itemId, val, item, subKey)}
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex flex-wrap items-center justify-between gap-[12px] z-[50]">
        <div className="text-[13px] text-[#808080] font-[600]">
          {footerHint ??
            `${answeredCount} of ${liveItems.length} answered`}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[10px] w-full sm:w-auto justify-end">
          {!hideSaveButton ? (
            <Button
              variant="outline"
              onClick={handleSave}
              fullWidth={false}
              className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] px-[18px] py-[11px] text-[13.5px] font-[700] hover:border-[#ADADAD] hover:bg-white w-full sm:w-auto"
            >
              Save & finish later
            </Button>
          ) : null}
          <Button
            onClick={() => void confirmScreen()}
            disabled={!isScreenComplete || isSubmitting}
            isLoading={isSubmitting}
            fullWidth={false}
            className={`rounded-[10px] px-[24px] py-[12px] text-[14px] font-[700] w-full sm:w-auto ${
              isScreenComplete
                ? 'bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1]'
                : 'bg-[#E6E6E6] text-[#ADADAD] cursor-not-allowed'
            }`}
          >
            {continueLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default MockAssessmentScreenView;
