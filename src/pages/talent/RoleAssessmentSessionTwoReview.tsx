import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';
import StageRail from '../../components/talent/StageRail';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RoleAssessmentSessionTwoReview: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const handleBack = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/session-2/tradeoff`);
  };

  const handleSubmit = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/session-2/analyzing`);
  };

  const handleSave = () => {
    toast.success('Saved. You can return anytime within 48 hours.');
  };

  const scenarios = [
    {
      num: 1,
      title: 'A judgement call',
      question: 'The maternal health outreach without a permit',
      answer: 'Staged response, started non-clinical activities while pursuing verbal clearance, with everything documented.',
      path: `/onboarding/talent/${roleSlug}/interview/session-2/situational`,
    },
    {
      num: 2,
      title: 'Ordering the options',
      question: 'The field nurse\'s social media post',
      answer: 'Call the nurse first, then the community elder, then formal documentation, then team refresher.',
      path: `/onboarding/talent/${roleSlug}/interview/session-2/ranking`,
    },
    {
      num: 3,
      title: 'Best and worst moves',
      question: 'The donor representative asking pointed questions',
      answer: 'Most appropriate: Acknowledge the gap directly. Least appropriate: Stay quiet during the meeting.',
      path: `/onboarding/talent/${roleSlug}/interview/session-2/best-worst`,
    },
    {
      num: 4,
      title: 'The moves you\'d combine',
      question: 'The team member who\'s quietly burning out',
      answer: 'Private check-in, redistribute deliverables, share wellbeing resources, pair her on the next field visit.',
      path: `/onboarding/talent/${roleSlug}/interview/session-2/combine`,
    },
    {
      num: 5,
      title: 'The trade-off',
      question: 'Three tensions you\'d lean through',
      answer: 'Leaning toward pausing before deciding, balanced on community vs design, leaning toward holding the deadline.',
      path: `/onboarding/talent/${roleSlug}/interview/session-2/tradeoff`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600] text-center hidden sm:block flex items-center gap-[8px]">
          Stage 1 of 4 <span className="text-[#ADADAD]">·</span> Getting to know you
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Auto-saved
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={1} />

      {/* Main Content */}
      <main className="max-w-[780px] w-full mx-auto px-[20px] sm:px-[28px] pt-[36px] pb-[100px] flex-1">
        <div className="mb-[14px]">
          <Tag
            variant="blue-soft"
            className="uppercase font-[800] tracking-[0.7px] px-[12px] py-[5px]"
            label="Last look before you submit"
          />
        </div>

        <h1 className="text-[24px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[8px]">
          Your responses, all in one place
        </h1>
        <p className="text-[14.5px] text-[#808080] leading-[1.6] mb-[26px] max-w-[600px]">
          Have a quick look through. You can tap any item to revisit it, or submit now if everything reads true to how you&apos;d actually behave.
        </p>

        {/* All five scenarios answered (Blue Themed complete-card) */}
        <div className="bg-[#EBF6FF] border-[1.5px] border-[#387DFF]/50 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
          <svg className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">All five scenarios answered</div>
            <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
              Once you submit, we&apos;ll review your full Stage 1 in the background. The next stage opens automatically once you&apos;ve cleared this one.
            </div>
          </div>
        </div>

        {/* Summary Card List */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] overflow-hidden mb-[18px]">
          {scenarios.map((sc, i) => (
            <div
              key={sc.num}
              onClick={() => navigate(sc.path)}
              className={`p-[18px_22px] flex items-start gap-[14px] cursor-pointer transition-all duration-150 hover:bg-[#F7F7F7] ${
                i !== scenarios.length - 1 ? 'border-b border-[#F7F7F7]' : ''
              }`}
            >
              {/* Scenario Circle Number */}
              <div className="shrink-0 w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] text-[#0047CC] text-[13px] font-[900] flex items-center justify-center">
                {sc.num}
              </div>

              {/* Scenario Details */}
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[3px]">
                  {sc.title}
                </div>
                <div className="text-[14.5px] font-[700] text-[#1A1A1A] mb-[6px] leading-[1.45] truncate">
                  {sc.question}
                </div>
                <div className="text-[13.5px] text-[#4A4A4A] leading-[1.55]">
                  <span className="font-[700] text-[#1A1A1A]">
                    {sc.num === 3 ? 'Most/Least appropriate: ' : sc.num === 4 ? 'Your combination: ' : sc.num === 5 ? 'Your leans: ' : 'Your move: '}
                  </span>
                  {sc.answer}
                </div>
              </div>

              {/* Revisit button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(sc.path);
                }}
                className="shrink-0 text-[12.5px] font-[700] text-[#0047CC] bg-transparent border-none cursor-pointer p-[6px_10px] rounded-[6px] align-self-center hover:bg-[#EBF6FF]"
              >
                Revisit
              </button>
            </div>
          ))}
        </div>

        {/* Note Card */}
        <div className="bg-[#EBF6FF] rounded-[8px] p-[13px_15px] mb-[22px] flex gap-[10px] items-start">
          <svg className="w-[16px] h-[16px] text-[#0047CC] shrink-0 mt-[1.5px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
          </svg>
          <p className="text-[13px] text-[#182348] leading-[1.5]">
            <strong className="font-[800]">What happens next. </strong> Once you submit, our system reviews how your responses across both sessions fit together. You&apos;ll see a detailed breakdown in a moment, and if everything lines up, Stage 2 unlocks straight away.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between gap-[12px] z-[50]">
        <div className="text-[13px] text-[#808080] font-[600] hidden sm:block">
          Final review · Stage 1 of 4
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto"
            pill={false}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto text-white bg-[#0047CC] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] font-[800]"
            pill={false}
          >
            Submit Stage 1
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default RoleAssessmentSessionTwoReview;
