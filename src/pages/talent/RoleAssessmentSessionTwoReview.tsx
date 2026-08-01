import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentReviewShell, {
  type AssessmentReviewListItem,
} from '../../components/talent/assessment/AssessmentReviewShell';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RoleAssessmentSessionTwoReview: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const items: AssessmentReviewListItem[] = useMemo(
    () => [
      {
        id: '1',
        eyebrow: 'A judgement call',
        headline: 'The maternal health outreach without a permit',
        summaryPrefix: 'Your move: ',
        summary:
          'Staged response, started non-clinical activities while pursuing verbal clearance, with everything documented.',
        onRevisit: () => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/situational`),
      },
      {
        id: '2',
        eyebrow: 'Ordering the options',
        headline: "The field nurse's social media post",
        summaryPrefix: 'Your move: ',
        summary:
          'Call the nurse first, then the community elder, then formal documentation, then team refresher.',
        onRevisit: () => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/ranking`),
      },
      {
        id: '3',
        eyebrow: 'Best and worst moves',
        headline: 'The donor representative asking pointed questions',
        summaryPrefix: 'Most/Least appropriate: ',
        summary: 'Most appropriate: Acknowledge the gap directly. Least appropriate: Stay quiet during the meeting.',
        onRevisit: () => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/best-worst`),
      },
      {
        id: '4',
        eyebrow: "The moves you'd combine",
        headline: "The team member who's quietly burning out",
        summaryPrefix: 'Your combination: ',
        summary:
          'Private check-in, redistribute deliverables, share wellbeing resources, pair her on the next field visit.',
        onRevisit: () => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/combine`),
      },
      {
        id: '5',
        eyebrow: 'The trade-off',
        headline: "Three tensions you'd lean through",
        summaryPrefix: 'Your leans: ',
        summary:
          'Leaning toward pausing before deciding, balanced on community vs design, leaning toward holding the deadline.',
        onRevisit: () => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/tradeoff`),
      },
    ],
    [navigate, roleSlug],
  );

  return (
    <AssessmentReviewShell
      activeStage={1}
      headerLabel="Stage 1 of 4 · Getting to know you"
      footerLabel="Final review · Stage 1 of 4"
      items={items}
      submitLabel="Submit Stage 1"
      onSubmit={() => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/analyzing`)}
      showBack
      onBack={() => navigate(`/onboarding/talent/${roleSlug}/interview/session-2/tradeoff`)}
      nextNote={
        <>
          <strong className="font-[800]">What happens next. </strong>
          Once you submit, our system reviews how your responses across both sessions fit together. You&apos;ll see a
          detailed breakdown in a moment, and if everything lines up, Stage 2 unlocks straight away.
        </>
      }
      statusBanner={
        <div className="bg-white border-[1.5px] border-[#0047CC]/20 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
          <CheckIcon className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" />
          <div>
            <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">All five scenarios answered</div>
            <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
              Once you submit, we&apos;ll review your full Stage 1 in the background. The next stage opens automatically
              once you&apos;ve cleared this one.
            </div>
          </div>
        </div>
      }
    />
  );
};

export default RoleAssessmentSessionTwoReview;
