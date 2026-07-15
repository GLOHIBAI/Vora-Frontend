import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Tag from '../../components/common/Tag';
import StageRail from '../../components/talent/StageRail';
import { useReviewSummaryQuery, useSubmitGateMutation, useStartAssessmentScreenMutation } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { parseReviewSummaryEntries, unwrapAssessmentData } from '../../utils/assessmentSession';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const RoleAssessmentGate1Review: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: reviewRaw, isLoading } = useReviewSummaryQuery(assessmentId, 1, {
    enabled: !!assessmentId,
  });
  const reviewData = unwrapAssessmentData<any>(reviewRaw) ?? {};
  const entries = parseReviewSummaryEntries(reviewRaw);
  const startGateSession = useStartAssessmentScreenMutation(1);
  const [revisitLoading, setRevisitLoading] = useState<string | null>(null);

  // Filter for Session 2 SJT rows (contains sjt_ prefix or is values_tradeoff)
  const sjtEntries = entries.filter(
    (e) => e.screenKey.startsWith('sjt_') || e.screenKey === 'values_tradeoff'
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitGate.mutateAsync({ assessmentId, gate: 1 });
      navigate(`/onboarding/talent/${roleSlug}/assessment/gate-1/verdict`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeadline = (entry: any) => {
    if (entry.scenarioTitle) return entry.scenarioTitle;
    const HEADLINES: Record<string, string> = {
      sjt_single_best: "The maternal health outreach without a permit",
      sjt_rank: "The field nurse's social media post",
      sjt_most_least: "The donor representative asking pointed questions",
      sjt_multi_select: "The team member who's quietly burning out",
      values_tradeoff: "Three tensions you'd lean through",
    };
    return HEADLINES[entry.screenKey] ?? entry.screenTitle ?? entry.title;
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

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      {/* Sticky Header & Rails Wrapper */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white flex flex-col border-b border-[#E6E6E6]">
        {/* Topbar */}
        <header className="bg-white/96 backdrop-blur-[10px] p-[14px_32px] flex items-center justify-between">
          <VoraLogo size="sm" to="/dashboard" />
          <div className="text-[12.5px] text-[#808080] font-[600] text-center">
            Stage 1 of 4 · Getting to know you
          </div>
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
              <CheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
            </div>
            Auto-saved
          </div>
        </header>

        {/* Stage Stepper */}
        <StageRail activeStage={1} />
      </div>

      {/* Main Content */}
      <main className="max-w-[780px] w-full mx-auto px-[20px] sm:px-[28px] pt-[156px] pb-[120px] flex-1">
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin h-8 w-8 text-[#0047CC]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-[#808080] font-medium">Loading review…</p>
          </div>
        ) : (
          <>
            {/* Completion Banner */}
            {reviewData.canSubmit ? (
              <div className="bg-[#EBF6FF] border-[1.5px] border-[#387DFF]/50 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
                <CheckIcon className="w-[22px] h-[22px] text-[#0047CC] shrink-0 mt-[1px]" />
                <div>
                  <div className="text-[14px] font-[800] text-[#0047CC] mb-[3px]">All five scenarios answered</div>
                  <div className="text-[13px] text-[#182348] opacity-85 leading-[1.5]">
                    Once you submit, we&apos;ll review your full Stage 1 in the background. The next stage opens automatically once you&apos;ve cleared this one.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-[1.5px] border-amber-300 rounded-[14px] p-[16px_18px] flex gap-[12px] items-start mb-[22px]">
                <div className="w-[22px] h-[22px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">!</div>
                <div>
                  <div className="text-[14px] font-[800] text-amber-800 mb-[3px]">Stage 1 is incomplete</div>
                  <div className="text-[13px] text-amber-950 opacity-85 leading-[1.5]">
                    Please finish all Stage 1 parts before submitting. Missing sections:{' '}
                    <span className="font-semibold">{reviewData.missingScreenKeys?.join(', ') || 'n/a'}</span>.
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card List */}
            <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] overflow-hidden mb-[18px]">
              {sjtEntries.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#808080]">No situational response summary found.</div>
              ) : (
                sjtEntries.map((entry, i) => {
                  const { prefix, rest } = getSplitSummary(entry.summary);
                  return (
                    <div
                      key={entry.componentId ?? entry.screenKey}
                      className={`p-[18px_22px] flex items-start gap-[14px] ${
                        i !== sjtEntries.length - 1 ? 'border-b border-[#F7F7F7]' : ''
                      }`}
                    >
                      {/* Scenario Circle Number */}
                      <div className="shrink-0 w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] text-[#0047CC] text-[13px] font-[900] flex items-center justify-center">
                        {i + 1}
                      </div>

                      {/* Scenario Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[3px]">
                          {entry.title}
                        </div>
                        <div className="text-[14.5px] font-[700] text-[#1A1A1A] mb-[6px] leading-[1.45]">
                          {getHeadline(entry)}
                        </div>
                        <div className="text-[13.5px] text-[#4A4A4A] leading-[1.55]">
                          <span className="font-[700] text-[#1A1A1A]">
                            {prefix}
                          </span>
                          {rest}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* What happens next mini block */}
            <div className="bg-[#EBF6FF] rounded-[10px] p-[11px_14px] flex gap-2.5 items-start mb-8 text-[12.5px] text-[#182348] leading-[1.5]">
              <InfoIcon className="w-[15px] h-[15px] text-[#0047CC] shrink-0 mt-0.5" />
              <div>
                <strong>What happens next.</strong> Once you submit, our system reviews how your responses across both sessions fit together. You&apos;ll see a detailed breakdown in a moment, and if everything lines up, Stage 2 unlocks straight away.
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] p-[16px_24px] sm:p-[14px_32px] flex flex-col sm:flex-row items-center justify-between gap-[12px] z-50">
        <div className="text-[13px] text-[#808080] font-[600] w-full sm:w-auto text-left">
          Final review · Stage 1 of 4
        </div>
        <div className="flex w-full sm:w-auto">
          <button
            type="button"
            disabled={isLoading || isSubmitting || !reviewData.canSubmit}
            onClick={handleSubmit}
            className="bg-[#0047CC] text-white border-none rounded-xl p-[12px_24px] text-[14px] font-[700] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] disabled:bg-[#E6E6E6] disabled:text-white disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Stage 1'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RoleAssessmentGate1Review;
