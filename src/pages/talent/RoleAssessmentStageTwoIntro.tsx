import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useStage2IntroQuery } from '../../services/queries/assessments';
import type { Gate2StageIntroResponse } from '../../services/queries/assessments/types';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';

const RoleAssessmentStageTwoIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const hasUnlockedPart4 = localStorage.getItem('vora_stage2_part4_unlocked') === 'true';
  const hasUnlockedPart3 = localStorage.getItem('vora_stage2_part3_unlocked') === 'true';
  const hasUnlockedPart2 = localStorage.getItem('vora_stage2_part2_unlocked') === 'true';

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const {
    data: introData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStage2IntroQuery(activeAssessmentId || '');
  const intro = ((introData as { data?: Gate2StageIntroResponse } | null)?.data ??
    introData) as Gate2StageIntroResponse | undefined;

  useEffect(() => {
    localStorage.setItem('vora_stage2_unlocked', 'true');

    if (hasUnlockedPart4) {
      navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-4/intro`, { replace: true });
    } else if (hasUnlockedPart3) {
      navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-3/intro`, { replace: true });
    } else if (hasUnlockedPart2) {
      navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-2/intro`, { replace: true });
    }
  }, [hasUnlockedPart2, hasUnlockedPart3, hasUnlockedPart4, navigate, roleSlug]);

  const handleBegin = () => {
    const nextPillar = intro?.nextPillar;
    let targetSubpath = 'part-1/intro';
    if (nextPillar === 'expertise') targetSubpath = 'part-2/intro';
    else if (nextPillar === 'reasoning') targetSubpath = 'part-3/intro';
    else if (nextPillar === 'simulation') targetSubpath = 'part-4/intro';

    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/${targetSubpath}`);
  };

  const handleLater = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
  };

  if (!activeAssessmentId) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center">
          <h2 className="text-[18px] font-[900] mb-2">Assessment not found</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            Start or resume Stage 2 from your journey so we can load this intro.
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
    return <FullPageSpinner message="Preparing Stage 2 interview..." />;
  }

  if (isError || !intro) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] max-w-[440px] w-full p-[30px] text-center">
          <h2 className="text-[18px] font-[900] mb-2">Could not load Stage 2 intro</h2>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-5">
            {(error as { data?: { message?: string }; message?: string })?.data?.message ||
              (error as { message?: string })?.message ||
              'The Stage 2 intro endpoint did not return content.'}
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

  const pillars = intro.pillars ?? [];
  const roleFamilyTags = intro.roleFamilies?.tags ?? [];
  const outcomeItems = intro.outcomes?.items ?? [];

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col pb-[80px]">
      <AssessmentHeader
        middleContent={
          <>
            Stage 2 <span className="text-[#ADADAD]">·</span> Professional dimension
          </>
        }
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Progress saved
          </div>
        }
      />

      <StageRail activeStage={2} />

      <section className="bg-gradient-to-br from-[#0E1733] via-[#344DA1] to-[#0047CC] text-white p-[54px_26px_60px] relative overflow-hidden text-center">
        <div className="absolute top-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full bg-[#387DFF]/16 pointer-events-none" />
        <div className="absolute bottom-[-140px] left-[-90px] w-[360px] h-[360px] rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 max-w-[760px] mx-auto text-center flex flex-col items-center">
          {intro.hero?.eyebrow ? (
            <div className="inline-flex items-center gap-[8px] bg-white/13 border border-white/24 rounded-[100px] p-[6px_15px] mb-[20px] backdrop-blur-[6px]">
              <svg className="w-[13px] h-[13px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-[11.5px] font-[800] tracking-[0.8px] uppercase">
                {intro.hero.eyebrow}
              </span>
            </div>
          ) : null}

          {intro.hero?.title ? (
            <h1 className="text-[30px] sm:text-[38px] font-[900] tracking-[-0.7px] leading-[1.12] mb-[16px]">
              {intro.hero.title}
            </h1>
          ) : null}
          {intro.hero?.subtitle ? (
            <p className="text-[15px] sm:text-[16.5px] text-white/88 leading-[1.65] max-w-[600px] mx-auto mb-[28px]">
              {intro.hero.subtitle}
            </p>
          ) : null}

          {(intro.stats?.partsLabel ||
            intro.stats?.durationMins ||
            intro.stats?.windowHours) && (
            <div className="flex flex-col sm:flex-row gap-[16px] w-full max-w-[760px] justify-center mt-[12px]">
              {intro.stats?.partsLabel ? (
                <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
                  <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                    {intro.stats.partsLabel}
                  </div>
                  {intro.stats.partsDetail ? (
                    <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                      {intro.stats.partsDetail}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {intro.stats?.durationMins ? (
                <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
                  <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                    {`${intro.stats.durationMins}`.includes('min')
                      ? intro.stats.durationMins
                      : `${intro.stats.durationMins} min`}
                  </div>
                  {intro.stats.durationLabel ? (
                    <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                      {intro.stats.durationLabel}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {intro.stats?.windowHours != null ? (
                <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
                  <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                    {intro.stats.windowHours} hours
                  </div>
                  {intro.stats.windowLabel ? (
                    <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                      {intro.stats.windowLabel}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-[760px] w-full mx-auto px-[26px] py-[44px]">
        {(intro.pillarsSection?.title || intro.pillarsSection?.subtitle || pillars.length > 0) && (
          <>
            {intro.pillarsSection?.title ? (
              <>
                <div className="text-[12px] font-[800] tracking-[0.9px] uppercase text-[#0047CC] mb-[8px] text-center">
                  What we look at
                </div>
                <h2 className="text-[21px] sm:text-[24px] font-[900] text-[#1A1A1A] tracking-[-0.4px] text-center mb-[8px] leading-[1.25]">
                  {intro.pillarsSection.title}
                </h2>
              </>
            ) : null}
            {intro.pillarsSection?.subtitle ? (
              <p className="text-[14px] sm:text-[14.5px] text-[#808080] leading-[1.65] text-center max-w-[560px] mx-auto mb-[28px]">
                {intro.pillarsSection.subtitle}
              </p>
            ) : null}

            {pillars.length > 0 ? (
              <div className="flex flex-col gap-[14px] mb-[48px]">
                {pillars.map((pillarItem: any, idx: number) => (
                  <div
                    key={pillarItem.pillar || pillarItem.part || idx}
                    className="bg-white border border-[#E6E6E6] rounded-[18px] p-[24px_26px] flex flex-col sm:flex-row gap-[18px] items-start"
                  >
                    <div className="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center shrink-0 text-[#0047CC]">
                      <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">
                        {pillarItem.eyebrow || `Part ${pillarItem.part}`}
                      </div>
                      {pillarItem.title ? (
                        <h3 className="text-[17px] font-[900] text-[#1A1A1A] mb-[6px] tracking-[-0.2px]">
                          {pillarItem.title}
                        </h3>
                      ) : null}
                      {pillarItem.body ? (
                        <p className="text-[13.5px] text-[#4A4A4A] leading-[1.6] mb-[10px]">
                          {pillarItem.body}
                        </p>
                      ) : null}
                      {pillarItem.tags && pillarItem.tags.length > 0 ? (
                        <div className="flex gap-[7px] flex-wrap">
                          {pillarItem.tags.map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        {(intro.roleFamilies?.title || intro.roleFamilies?.body || roleFamilyTags.length > 0) && (
          <div className="bg-gradient-to-br from-[#182348] to-[#243156] rounded-[20px] p-[24px_20px] sm:p-[34px_32px] mb-[48px] text-white relative overflow-hidden">
            <div className="absolute top-[-60px] right-[-50px] w-[200px] h-[200px] rounded-full bg-[#387DFF]/16 pointer-events-none" />
            <div className="relative z-10">
              {intro.roleFamilies?.eyebrow ? (
                <div className="text-[11.5px] font-[800] tracking-[0.8px] uppercase text-[#387DFF] mb-[10px]">
                  {intro.roleFamilies.eyebrow}
                </div>
              ) : null}
              {intro.roleFamilies?.title ? (
                <h3 className="text-[19px] sm:text-[22px] font-[900] tracking-[-0.3px] leading-[1.3] mb-[12px]">
                  {intro.roleFamilies.title}
                </h3>
              ) : null}
              {intro.roleFamilies?.body ? (
                <p className="text-[14px] sm:text-[14.5px] text-white/85 leading-[1.7] mb-[18px]">
                  {intro.roleFamilies.body}
                </p>
              ) : null}
              {roleFamilyTags.length > 0 ? (
                <div className="flex gap-[8px] flex-wrap">
                  {roleFamilyTags.map((tagItem: any, idx: number) => {
                    const isActive =
                      tagItem.active === true || tagItem.id === intro?.roleFamilies?.activeFamilyId;
                    return (
                      <span
                        key={tagItem.id || idx}
                        className={`text-[11.5px] p-[6px_13px] rounded-[100px] transition-all ${
                          isActive
                            ? 'font-[800] bg-white text-[#0047CC] shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
                            : 'font-[700] text-white bg-white/12 border border-white/20'
                        }`}
                      >
                        {tagItem.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {(intro.outcomes?.title || intro.outcomes?.body || outcomeItems.length > 0) && (
          <div className="bg-gradient-to-b from-[#EBF6FF] to-[#FCFDFF] border border-[#E1EEFF] rounded-[20px] p-[24px_20px] sm:p-[32px_30px] mb-[40px]">
            <div className="text-[11.5px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[8px]">
              If you do not clear the bar
            </div>
            {intro.outcomes?.title ? (
              <h3 className="text-[19px] sm:text-[21px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[10px]">
                {intro.outcomes.title}
              </h3>
            ) : null}
            {intro.outcomes?.body ? (
              <p className="text-[14px] sm:text-[14.5px] text-[#4A4A4A] leading-[1.7] mb-[20px]">
                {intro.outcomes.body}
              </p>
            ) : null}
            {outcomeItems.length > 0 ? (
              <div className="flex flex-col gap-[12px]">
                {outcomeItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-[13px] items-start bg-white border border-[#E1EEFF] rounded-[13px] p-[15px_17px]"
                  >
                    <div className="w-[24px] h-[24px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[12px] font-[900] shrink-0 mt-[1px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-[13.5px] text-[#1A1A1A] leading-[1.6]">
                      {item.title ? <strong className="font-[800]">{item.title}.</strong> : null}{' '}
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {intro.footer?.profileNote ? (
          <div className="flex gap-[11px] items-start bg-white border border-[#E6E6E6] rounded-[13px] p-[16px_18px] mb-[40px]">
            <svg className="w-[19px] h-[19px] text-[#0047CC] shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <p className="text-[13.5px] text-[#808080] leading-[1.6]">{intro.footer.profileNote}</p>
          </div>
        ) : null}

        {intro.footer?.windowNote ? (
          <div className="flex gap-[12px] items-center bg-white border border-[#E6E6E6] rounded-[13px] p-[16px_18px] mb-[36px]">
            <svg className="w-[22px] h-[22px] text-[#0047CC] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className="text-[13.5px] text-[#808080] leading-[1.6]">{intro.footer.windowNote}</p>
          </div>
        ) : null}

        <div className="text-center flex flex-col items-center">
          <button
            type="button"
            onClick={handleBegin}
            className="bg-[#0047CC] text-white border-none rounded-[13px] p-[17px_40px] text-[16px] font-[800] cursor-pointer inline-flex items-center shadow-[0_8px_24px_rgba(0,71,204,0.32)] transition-all duration-200 hover:bg-[#344DA1] hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(0,71,204,0.4)] font-sans"
          >
            {intro.footer?.ctaLabel || 'Begin Stage 2'}
          </button>
          {intro.footer?.prepNote ? (
            <p className="text-[12.5px] text-[#808080] mt-[16px] leading-[1.6] max-w-[480px]">
              {intro.footer.prepNote}
            </p>
          ) : null}
          {intro.footer?.secondaryLabel ? (
            <div>
              <button
                type="button"
                onClick={handleLater}
                className="bg-none border-none text-[#808080] text-[13px] font-[700] cursor-pointer font-sans p-[12px] mt-[6px] hover:text-[#1A1A1A]"
              >
                {intro.footer.secondaryLabel}
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentStageTwoIntro;
