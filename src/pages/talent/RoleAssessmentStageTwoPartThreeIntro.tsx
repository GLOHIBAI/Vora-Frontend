import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import PartRail from '../../components/talent/PartRail';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useStage2PillarIntroQuery } from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/** Part 4 · Simulation — content from GET .../gates/2/pillars/simulation/intro */
const RoleAssessmentStageTwoPartThreeIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const {
    data: pillarIntroData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStage2PillarIntroQuery(activeAssessmentId || '', 'simulation');
  const pillarIntro = (pillarIntroData as { data?: typeof pillarIntroData } | null)?.data ?? pillarIntroData;

  React.useEffect(() => {
    localStorage.setItem('vora_stage2_part4_unlocked', 'true');
  }, []);

  const handleBegin = () => {
    toast.success('Starting Stage 2 Part 4...');
    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-4/simulation-1`);
  };

  if (!activeAssessmentId) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center">
          <h2 className="text-[18px] font-[900] mb-2">Assessment not found</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            Start or resume Stage 2 from your journey so we can load this part intro.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/onboarding/talent/${roleSlug}/assessment/journey`)}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer font-sans"
          >
            Back to journey
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <FullPageSpinner message="Preparing pillar intro..." />;
  }

  if (isError || !pillarIntro) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center">
          <h2 className="text-[18px] font-[900] mb-2">Could not load Part 4 intro</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            {(error as { data?: { message?: string }; message?: string })?.data?.message ||
              (error as { message?: string })?.message ||
              'The Stage 2 pillar intro endpoint did not return content.'}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => void refetch()}
              className="bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer font-sans"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate(`/onboarding/talent/${roleSlug}/assessment/journey`)}
              className="bg-white text-[#4A4A4A] border border-[#E6E6E6] rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer font-sans"
            >
              Back to journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelLabel = pillarIntro.levelBand?.label || pillarIntro.fingerprint?.level || '';
  const yearsRaw = pillarIntro.levelBand?.years || '';
  const yearsDetail =
    yearsRaw &&
    !(yearsRaw.includes('years') || yearsRaw.includes('training'))
      ? `${yearsRaw} years`
      : yearsRaw;
  const eyebrow = pillarIntro.eyebrow || pillarIntro.partLabel || '';
  const titleText = pillarIntro.title;
  const subtitleText = pillarIntro.subtitle;
  const antiGameNotice = pillarIntro.antiGame;
  const questionCount = pillarIntro.questionCount;
  const summaryText = pillarIntro.summary;
  const stageOverviewLabel = pillarIntro.ctas?.stageOverviewLabel || 'Stage overview';
  const beginPartLabel = pillarIntro.ctas?.beginPartLabel || 'Begin Part 4';
  const headsUpText = pillarIntro.headsUp;
  const roleTitle = pillarIntro.fingerprint?.roleTitle || '';
  const partNumber = pillarIntro.part ?? 4;
  const headerMiddle =
    pillarIntro.breadcrumb ||
    [roleTitle, `Part ${partNumber}`, 'Simulation', levelLabel].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col animate-[fadeUp_0.5s_ease_both]">
      <AssessmentHeader
        middleContent={headerMiddle}
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Auto-saved
          </div>
        }
      />

      <StageRail activeStage={2} />
      <PartRail activePart={4} />

      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] border border-[#E6E6E6] max-w-[580px] w-full p-[44px_44px_36px] text-center relative overflow-hidden">
          {(levelLabel || yearsDetail) && (
            <div className="flex justify-center mb-[18px]">
              <div className="bg-[#EBF6FF] border border-[#387DFF]/30 text-[#0047CC] text-[11.5px] font-[800] tracking-[0.6px] uppercase px-[14px] py-[5px] rounded-full inline-flex items-center gap-[7px]">
                {levelLabel.toUpperCase()}
                {yearsDetail ? (
                  <span className="text-[#387DFF] font-[700] normal-case tracking-normal">
                    · {yearsDetail}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {eyebrow ? (
            <div className="flex justify-center items-center gap-[7px] text-[#0047CC] font-[800] text-[11px] tracking-[0.7px] uppercase mb-[10px]">
              <svg className="w-[11px] h-[11px]" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="6" r="5" />
              </svg>
              {eyebrow}
            </div>
          ) : null}

          <h1 className="text-[23px] font-[900] text-[#1A1A1A] tracking-[-0.4px] leading-[1.28] mb-[8px]">
            {titleText}
          </h1>
          {subtitleText ? (
            <p className="text-[14px] text-[#808080] leading-[1.6] mb-[18px]">
              {subtitleText}
            </p>
          ) : null}

          {antiGameNotice ? (
            <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-[10px] p-[10px_14px] mb-[22px] flex items-center gap-[9px] text-left">
              <LockIcon className="w-[16px] h-[16px] text-[#808080] shrink-0" />
              <p className="text-[11.5px] text-[#808080] leading-[1.5] font-[600]">
                {antiGameNotice}
              </p>
            </div>
          ) : null}

          {questionCount != null || summaryText ? (
            <div className="bg-[#EBF6FF] rounded-[14px] p-[18px_20px] mb-[24px] flex gap-[14px] items-center text-left">
              {questionCount != null ? (
                <div className="text-[30px] font-[900] text-[#0047CC]">{questionCount}</div>
              ) : null}
              {summaryText ? (
                <div className="text-[13.5px] text-[#182348] leading-[1.55] font-[600]">
                  {summaryText}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex gap-[9px] w-full">
            <button
              type="button"
              onClick={() => navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2`)}
              className="flex-1 bg-white text-[#4A4A4A] border border-[#E6E6E6] rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] transition-all font-sans"
            >
              {stageOverviewLabel}
            </button>
            <button
              type="button"
              onClick={handleBegin}
              className="flex-1 bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer inline-flex items-center justify-center gap-[7px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] transition-all font-sans"
            >
              {beginPartLabel}
            </button>
          </div>

          {headsUpText ? (
            <p className="text-[12px] text-[#808080] mt-[14px] leading-[1.5] text-center">
              <strong>Heads up:</strong> {headsUpText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageTwoPartThreeIntro;
