import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AssessmentReviewShell, {
  type AssessmentReviewListItem,
} from '../../components/talent/assessment/AssessmentReviewShell';
import { useReviewSummaryQuery, useSubmitGateMutation, useStartAssessmentScreenMutation } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { parseReviewSummaryEntries, unwrapAssessmentData } from '../../utils/assessmentSession';

const GATE1_SUBMIT_MAX_ATTEMPTS = 20;
const GATE1_SUBMIT_RETRY_MS = 2500;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const isScoringInProgressError = (err: unknown): boolean => {
  const e = err as { status?: number; message?: string } | null;
  if (e?.status === 409) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('still being scored');
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RoleAssessmentGate1Review: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: reviewRaw, isLoading } = useReviewSummaryQuery(assessmentId, 1, {
    enabled: !!assessmentId,
  });
  const reviewData = unwrapAssessmentData<Record<string, unknown>>(reviewRaw) ?? {};
  const entries = parseReviewSummaryEntries(reviewRaw);
  const startGateSession = useStartAssessmentScreenMutation(1);
  const [revisitLoading, setRevisitLoading] = useState<string | null>(null);

  const sjtEntries = entries.filter(
    (e) => e.screenKey.startsWith('sjt_') || e.screenKey === 'values_tradeoff',
  );

  const handleRevisit = async (screenKey: string) => {
    setRevisitLoading(screenKey);
    try {
      await startGateSession.mutateAsync({
        assessmentId,
        body: { screen: screenKey },
      });
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`);
    } catch (err) {
      console.error(err);
    } finally {
      setRevisitLoading(null);
    }
  };

  const submitGate = useSubmitGateMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForScore, setIsWaitingForScore] = useState(false);

  const getHeadline = (entry: (typeof sjtEntries)[number]) => {
    const withTitle = entry as { scenarioTitle?: string; screenTitle?: string };
    if (withTitle.scenarioTitle) return withTitle.scenarioTitle;
    const HEADLINES: Record<string, string> = {
      sjt_single_best: 'The maternal health outreach without a permit',
      sjt_rank: "The field nurse's social media post",
      sjt_most_least: 'The donor representative asking pointed questions',
      sjt_multi_select: "The team member who's quietly burning out",
      values_tradeoff: "Three tensions you'd lean through",
    };
    return HEADLINES[entry.screenKey] ?? withTitle.screenTitle ?? entry.title;
  };

  const getSplitSummary = (summary: string) => {
    if (!summary) return { prefix: '', rest: '' };
    const colonIdx = summary.indexOf(':');
    if (colonIdx !== -1) {
      return {
        prefix: summary.substring(0, colonIdx + 1),
        rest: summary.substring(colonIdx + 1),
      };
    }
    return { prefix: '', rest: summary };
  };

  const items: AssessmentReviewListItem[] = useMemo(
    () =>
      sjtEntries.map((entry) => {
        const { prefix, rest } = getSplitSummary(entry.summary ?? '');
        return {
          id: entry.componentId ?? entry.screenKey,
          eyebrow: entry.title,
          headline: getHeadline(entry),
          summaryPrefix: prefix,
          summary: rest,
          onRevisit: () => void handleRevisit(entry.screenKey),
          revisitLoading: revisitLoading === entry.screenKey,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revisit uses stable navigate/assessmentId
    [sjtEntries, revisitLoading],
  );

  const handleSubmit = async () => {
    if (isSubmitting || !assessmentId) return;
    setIsSubmitting(true);

    try {
      try {
        await submitGate.mutateAsync({
          assessmentId,
          gate: 1,
          suppressErrorToast: true,
        });
      } catch (err) {
        if (!isScoringInProgressError(err)) throw err;
      }
      navigate(`/onboarding/talent/${roleSlug}/interview/gate-1/verdict`);
    } catch (err) {
      console.error(err);
      const message =
        (err as { message?: string } | null)?.message || 'Failed to submit Stage 1. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = reviewData.canSubmit === true;
  const submitLabel = isSubmitting ? 'Submitting…' : 'Submit Stage 1';

  return (
    <AssessmentReviewShell
      activeStage={1}
      headerLabel="Stage 1 of 4 · Getting to know you"
      footerLabel="Final review · Stage 1 of 4"
      isLoading={isLoading}
      items={items}
      emptyMessage="No situational response summary found."
      submitLabel={submitLabel}
      submitDisabled={isSubmitting || !canSubmit}
      onSubmit={() => void handleSubmit()}
      nextNote={
        <>
          <strong>What happens next. </strong>
          Once you submit, our system reviews how your responses across both sessions fit together. You&apos;ll see a
          detailed breakdown in a moment, and if everything lines up, Stage 2 unlocks straight away.
        </>
      }
      statusBanner={
        canSubmit ? (
          <div className="bg-white border-[1.5px] border-[#0047CC]/20 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
            <CheckIcon className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div>
              <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">All five scenarios answered</div>
              <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
                Once you submit, we&apos;ll review your full Stage 1 in the background. The next stage opens
                automatically once you&apos;ve cleared this one.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-[1.5px] border-amber-300 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
            <div className="w-[22px] h-[22px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              !
            </div>
            <div>
              <div className="text-[14px] font-[800] text-amber-800 mb-[3px]">Stage 1 is incomplete</div>
              <div className="text-[13px] text-amber-950 opacity-85 leading-[1.5]">
                Please finish all Stage 1 parts before submitting. Missing sections:{' '}
                <span className="font-semibold">
                  {Array.isArray(reviewData.missingScreenKeys)
                    ? (reviewData.missingScreenKeys as string[]).join(', ')
                    : 'n/a'}
                </span>
                .
              </div>
            </div>
          </div>
        )
      }
    />
  );
};

export default RoleAssessmentGate1Review;
