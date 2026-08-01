import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AssessmentReviewShell, {
  type AssessmentReviewListItem,
} from '../../components/talent/assessment/AssessmentReviewShell';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { useReviewSummaryQuery, useSubmitGateMutation } from '../../services/queries/assessments';
import { parseReviewSummaryEntries, unwrapAssessmentData } from '../../utils/assessmentSession';

const GATE2_SUBMIT_MAX_ATTEMPTS = 20;
const GATE2_SUBMIT_RETRY_MS = 2500;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const isScoringInProgressError = (err: unknown): boolean => {
  const e = err as { status?: number; message?: string } | null;
  if (e?.status === 409) return true;
  const msg = (e?.message || '').toLowerCase();
  return msg.includes('still being scored');
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

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RoleAssessmentStageTwoReview: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: reviewRaw, isLoading } = useReviewSummaryQuery(assessmentId, 2, {
    enabled: !!assessmentId,
  });
  const reviewData = unwrapAssessmentData<Record<string, unknown>>(reviewRaw) ?? {};
  const entries = parseReviewSummaryEntries(reviewRaw);
  const canSubmit = reviewData.canSubmit !== false;

  const submitGate = useSubmitGateMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForScore, setIsWaitingForScore] = useState(false);

  const items: AssessmentReviewListItem[] = useMemo(
    () =>
      entries.map((entry) => {
        const { prefix, rest } = getSplitSummary(entry.summary ?? '');
        return {
          id: entry.componentId ?? entry.screenKey,
          eyebrow: entry.title || entry.screenKey,
          headline: (entry as { scenarioTitle?: string }).scenarioTitle || entry.title || entry.screenKey,
          summaryPrefix: prefix,
          summary: rest,
        };
      }),
    [entries],
  );

  const handleSubmit = async () => {
    if (isSubmitting || !assessmentId) return;
    setIsSubmitting(true);
    setIsWaitingForScore(false);

    try {
      for (let attempt = 1; attempt <= GATE2_SUBMIT_MAX_ATTEMPTS; attempt++) {
        try {
          await submitGate.mutateAsync({
            assessmentId,
            gate: 2,
            suppressErrorToast: true,
          });
          navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`);
          return;
        } catch (err) {
          const canRetry = isScoringInProgressError(err) && attempt < GATE2_SUBMIT_MAX_ATTEMPTS;
          if (!canRetry) throw err;
          setIsWaitingForScore(true);
          await sleep(GATE2_SUBMIT_RETRY_MS);
        }
      }
    } catch (err) {
      console.error(err);
      const message =
        (err as { message?: string } | null)?.message || 'Failed to submit Stage 2. Please try again.';
      toast.error(
        isScoringInProgressError(err)
          ? 'Still scoring your answers. Please try again in a moment.'
          : message,
      );
    } finally {
      setIsSubmitting(false);
      setIsWaitingForScore(false);
    }
  };

  const submitLabel = isWaitingForScore
    ? 'Scoring your answers…'
    : isSubmitting
      ? 'Submitting…'
      : 'Submit Stage 2';

  const answeredLabel =
    typeof reviewData.completedCount === 'number'
      ? `All ${reviewData.completedCount} sections answered`
      : entries.length > 0
        ? `All ${entries.length} sections answered`
        : 'Stage 2 responses ready';

  return (
    <AssessmentReviewShell
      activeStage={2}
      headerLabel="Stage 2 of 4 · Role interview"
      footerLabel="Final review · Stage 2 of 4"
      isLoading={isLoading}
      items={items}
      emptyMessage="No Stage 2 response summary found."
      submitLabel={submitLabel}
      submitDisabled={isSubmitting || !canSubmit}
      onSubmit={() => void handleSubmit()}
      showBack
      onBack={() => navigate(-1)}
      nextNote={
        <>
          <strong>What happens next. </strong>
          Once you submit, we review your Stage 2 parts together — knowledge, expertise, reasoning, and simulation — then take you to your results.
        </>
      }
      statusBanner={
        canSubmit ? (
          <div className="bg-[#EBF6FF] border-[1.5px] border-[#387DFF]/50 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
            <CheckIcon className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div>
              <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">{answeredLabel}</div>
              <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
                Once you submit, we&apos;ll score your full Stage 2 in the background. Stage 3 opens once you&apos;ve cleared this one.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-[1.5px] border-amber-300 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
            <div className="w-[22px] h-[22px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              !
            </div>
            <div>
              <div className="text-[14px] font-[800] text-amber-800 mb-[3px]">Stage 2 is incomplete</div>
              <div className="text-[13px] text-amber-950 opacity-85 leading-[1.5]">
                Please finish all Stage 2 parts before submitting.
                {Array.isArray(reviewData.missingScreenKeys) && reviewData.missingScreenKeys.length > 0 ? (
                  <>
                    {' '}
                    Missing sections:{' '}
                    <span className="font-semibold">{(reviewData.missingScreenKeys as string[]).join(', ')}</span>.
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )
      }
      waitingBanner={
        isWaitingForScore ? (
          <div className="bg-[#EBF6FF] border-[1.5px] border-[#387DFF]/50 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
            <svg
              className="animate-spin h-[22px] w-[22px] text-[#0047CC] shrink-0 mt-[1px]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div>
              <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">Scoring in progress</div>
              <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
                One or more Stage 2 screens are still being scored. We&apos;ll submit automatically as soon as they&apos;re ready.
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
};

export default RoleAssessmentStageTwoReview;
