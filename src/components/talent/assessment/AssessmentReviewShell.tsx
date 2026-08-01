import React from 'react';
import VoraLogo from '../../common/VoraLogo';
import Tag from '../../common/Tag';
import Button from '../../common/Button';
import StageRail from '../StageRail';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export type AssessmentReviewListItem = {
  id: string;
  eyebrow: string;
  headline: string;
  summaryPrefix?: string;
  summary: string;
  onRevisit?: () => void;
  revisitLoading?: boolean;
};

export type AssessmentReviewShellProps = {
  activeStage: 1 | 2 | 3 | 4;
  headerLabel: string;
  footerLabel: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
  statusBanner?: React.ReactNode;
  waitingBanner?: React.ReactNode;
  items: AssessmentReviewListItem[];
  emptyMessage?: string;
  nextNote: React.ReactNode;
  submitLabel: string;
  submitDisabled?: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

/**
 * Shared “last look before you submit” layout for Gate / Stage review pages.
 */
const AssessmentReviewShell: React.FC<AssessmentReviewShellProps> = ({
  activeStage,
  headerLabel,
  footerLabel,
  title = 'Your responses, all in one place',
  description = "Have a quick look through. You can tap any item to revisit it, or submit now if everything reads true to how you'd actually behave.",
  isLoading = false,
  statusBanner,
  waitingBanner,
  items,
  emptyMessage = 'No response summary found.',
  nextNote,
  submitLabel,
  submitDisabled = false,
  onSubmit,
  onBack,
  showBack = false,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white flex flex-col border-b border-[#E6E6E6]">
        <header className="bg-white/96 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-between">
          <VoraLogo size="sm" to="/dashboard" />
          <div className="text-[12.5px] text-[#808080] font-[600] text-center hidden sm:block">{headerLabel}</div>
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
              <CheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
            </div>
            Auto-saved
          </div>
        </header>
        <StageRail activeStage={activeStage} />
      </div>

      <main className="max-w-[780px] w-full mx-auto px-[20px] sm:px-[28px] pt-[156px] pb-[100px] flex-1">
        <div className="mb-[14px]">
          <Tag
            variant="blue"
            className="uppercase font-[800] tracking-[0.7px] px-[12px] py-[5px]"
            label="Last look before you submit"
          />
        </div>

        <h1 className="text-[24px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">{title}</h1>
        <p className="text-[14.5px] text-[#808080] leading-[1.6] mb-[26px] max-w-[600px]">{description}</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin h-8 w-8 text-[#0047CC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-[#808080] font-medium">Loading review…</p>
          </div>
        ) : (
          <>
            {statusBanner}
            {waitingBanner}

            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] overflow-hidden mb-[18px]">
              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#808080]">{emptyMessage}</div>
              ) : (
                items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`p-[18px_22px] flex items-start gap-[14px] ${
                      i !== items.length - 1 ? 'border-b border-[#F7F7F7]' : ''
                    }`}
                  >
                    <div className="shrink-0 w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] text-[#0047CC] text-[13px] font-[900] flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[3px]">
                        {item.eyebrow}
                      </div>
                      <div className="text-[14.5px] font-[700] text-[#1A1A1A] mb-[6px] leading-[1.45]">{item.headline}</div>
                      <div className="text-[13.5px] text-[#4A4A4A] leading-[1.55]">
                        {item.summaryPrefix ? (
                          <span className="font-[700] text-[#1A1A1A]">{item.summaryPrefix}</span>
                        ) : null}
                        {item.summary}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#EBF6FF] rounded-[10px] p-[11px_14px] flex gap-2.5 items-start mb-8 text-[12.5px] text-[#182348] leading-[1.5]">
              <InfoIcon className="w-[15px] h-[15px] text-[#0047CC] shrink-0 mt-0.5" />
              <div>{nextNote}</div>
            </div>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between gap-[12px] z-[50]">
        <div className="text-[13px] text-[#808080] font-[600] hidden sm:block">{footerLabel}</div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-end">
          {showBack && onBack ? (
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto" pill={false}>
              Back
            </Button>
          ) : null}
          <button
            type="button"
            disabled={isLoading || submitDisabled}
            onClick={onSubmit}
            className="bg-[#0047CC] text-white border-none rounded-xl p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:bg-[#E6E6E6] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none w-full sm:w-auto"
          >
            {submitLabel}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AssessmentReviewShell;
