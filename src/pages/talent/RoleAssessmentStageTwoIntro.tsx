import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useStage2IntroQuery } from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';

const DEFAULT_ROLE_FAMILIES = [
  { id: 'clinical', label: 'Clinical and programme' },
  { id: 'design', label: 'Design and content' },
  { id: 'product', label: 'Product and technology' },
  { id: 'data', label: 'Data and analytics' },
  { id: 'commercial', label: 'Commercial and growth' },
  { id: 'operations', label: 'Operations and delivery' },
  { id: 'corporate', label: 'Corporate and enabling' },
  { id: 'specialist', label: 'Specialist health adjacent' },
];

const RoleAssessmentStageTwoIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const hasUnlockedPart4 = localStorage.getItem('vora_stage2_part4_unlocked') === 'true';
  const hasUnlockedPart3 = localStorage.getItem('vora_stage2_part3_unlocked') === 'true';
  const hasUnlockedPart2 = localStorage.getItem('vora_stage2_part2_unlocked') === 'true';

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const { data: introData, isLoading } = useStage2IntroQuery(activeAssessmentId || '');
  const intro = (introData as any)?.data || introData;

  useEffect(() => {
    localStorage.setItem('vora_stage2_unlocked', 'true');
    
    // Redirect if they have already unlocked subsequent parts
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

  if (activeAssessmentId && (isLoading || !introData)) {
    return <FullPageSpinner message="Preparing Stage 2 assessment..." />;
  }

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
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Progress saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={2} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0E1733] via-[#344DA1] to-[#0047CC] text-white p-[54px_26px_60px] relative overflow-hidden text-center">
        {/* Background decorative circles */}
        <div className="absolute top-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full bg-[#387DFF]/16 pointer-events-none" />
        <div className="absolute bottom-[-140px] left-[-90px] w-[360px] h-[360px] rounded-full bg-white/5 pointer-events-none" />
        
        <div className="relative z-10 max-w-[760px] mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-[8px] bg-white/13 border border-white/24 rounded-[100px] p-[6px_15px] mb-[20px] backdrop-blur-[6px]">
            <svg className="w-[13px] h-[13px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="text-[11.5px] font-[800] tracking-[0.8px] uppercase">
              {intro?.hero?.eyebrow || 'Stage 2 of 4 · The work itself'}
            </span>
          </div>
          
          <h1 className="text-[30px] sm:text-[38px] font-[900] tracking-[-0.7px] leading-[1.12] mb-[16px]">
            {intro?.hero?.title || 'This is where we look at the actual work'}
          </h1>
          <p className="text-[15px] sm:text-[16.5px] text-white/88 leading-[1.65] max-w-[600px] mx-auto mb-[28px]">
            {intro?.hero?.subtitle || 'Stage 1 showed us how you think and what you stand by. Stage 2 goes deeper. It is shaped around the real work of your specific role, and it is the same serious standard whether you are a clinician, a programme lead, a designer, an engineer or anything in between.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-[16px] w-full max-w-[760px] justify-center mt-[12px]">
            <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
              <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                {intro?.stats?.partsLabel || '4 parts'}
              </div>
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                {intro?.stats?.partsDetail || 'Knowledge · Expertise · Reasoning · Simulation'}
              </div>
            </div>
            <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
              <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                {intro?.stats?.durationMins ? `${intro.stats.durationMins} min` : '45 to 60 min'}
              </div>
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                {intro?.stats?.durationLabel || 'Across the whole stage'}
              </div>
            </div>
            <div className="bg-white/10 border border-white/18 rounded-[13px] p-[18px_20px] backdrop-blur-[6px] flex-1">
              <div className="text-[20px] sm:text-[22px] font-[900] leading-none">
                {intro?.stats?.windowHours ? `${intro.stats.windowHours} hours` : '72 hours'}
              </div>
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mt-[8px] leading-[1.4] whitespace-nowrap">
                {intro?.stats?.windowLabel || 'To finish, resumable'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[760px] w-full mx-auto padding-[44px_26px_60px] px-[26px] py-[44px]">
        <p className="text-[16px] sm:text-[18px] text-[#1A1A1A] leading-[1.7] font-[700] mb-[8px] text-center">
          Everything here is tied to what your role actually does.
        </p>
        <p className="text-[14.5px] sm:text-[15px] text-[#808080] leading-[1.7] text-center max-w-[600px] mx-auto mb-[40px]">
          There is no generic question bank. The interview you take is built around your background and the specific role you are applying for, then held to the same bar as the most demanding interviews anywhere in the world.
        </p>

        <div className="text-[12px] font-[800] tracking-[0.9px] uppercase text-[#0047CC] mb-[8px] text-center">
          What we look at
        </div>
        <h2 className="text-[21px] sm:text-[24px] font-[900] text-[#1A1A1A] tracking-[-0.4px] text-center mb-[8px] leading-[1.25]">
          {intro?.pillarsSection?.title || 'Four dimensions of the work'}
        </h2>
        <p className="text-[14px] sm:text-[14.5px] text-[#808080] leading-[1.65] text-center max-w-[560px] mx-auto mb-[28px]">
          {intro?.pillarsSection?.subtitle || 'Each is a short, separate interview. Each mixes several question formats, so it is impossible to pattern match your way through.'}
        </p>

        {/* Dynamic Pillars List */}
        <div className="flex flex-col gap-[14px] mb-[48px]">
          {(intro?.pillars && intro.pillars.length > 0 ? intro.pillars : [
            {
              part: 1,
              eyebrow: 'Part 1',
              title: 'The knowledge you carry',
              body: 'The foundations your role draws on, asked as real situations rather than trivia. You will meet single best answers, select all that apply, ranking, and questions in your own words.',
              tags: ['Applied, not recall', 'Mixed formats'],
            },
            {
              part: 2,
              eyebrow: 'Part 2',
              title: 'The expertise you bring',
              body: 'Deep, field-specific clinical and operational expertise your role rests on. The principles, terms, and protocols a professional practitioner knows cold.',
              tags: ['Field expertise', 'Domain specific'],
            },
            {
              part: 3,
              eyebrow: 'Part 3',
              title: 'How you reason through the work',
              body: 'Live feeling situations with no tidy answer, only a strongest one. On the judgement calls you will be asked to give your reason in a line, because anyone can guess an option but no one can fake the thinking behind it.',
              tags: ['Judgement under tension', 'Reasoning read alongside answers'],
            },
            {
              part: 4,
              eyebrow: 'Part 4',
              title: 'How you perform in practice',
              body: 'A real work sample. You will produce something the role actually produces, then a follow up will change a key constraint partway through, so a prepared answer will not survive contact with it.',
              tags: ['Real work sample', 'Live curveball'],
            },
          ]).map((pillarItem: any, idx: number) => (
            <div key={idx} className="bg-white border border-[#E6E6E6] rounded-[18px] p-[24px_26px] flex flex-col sm:flex-row gap-[18px] items-start">
              <div className="w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center shrink-0 text-[#0047CC]">
                {pillarItem.part === 1 && (
                  <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                )}
                {pillarItem.part === 2 && (
                  <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>
                  </svg>
                )}
                {pillarItem.part === 3 && (
                  <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V12M14.5 2A2.5 2.5 0 0 0 12 4.5"/>
                    <circle cx="6" cy="19" r="2"/>
                    <circle cx="18" cy="19" r="2"/>
                  </svg>
                )}
                {pillarItem.part === 4 && (
                  <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">
                  {pillarItem.eyebrow || `Part ${pillarItem.part}`}
                </div>
                <h3 className="text-[17px] font-[900] text-[#1A1A1A] mb-[6px] tracking-[-0.2px]">
                  {pillarItem.title}
                </h3>
                <p className="text-[13.5px] text-[#4A4A4A] leading-[1.6] mb-[10px]">
                  {pillarItem.body}
                </p>
                {pillarItem.tags && pillarItem.tags.length > 0 && (
                  <div className="flex gap-[7px] flex-wrap">
                    {pillarItem.tags.map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="text-[11px] font-[700] px-[10px] py-[4px] rounded-full border border-[#0047CC] bg-white text-[#0047CC]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Role Families Card */}
        <div className="bg-gradient-to-br from-[#182348] to-[#243156] rounded-[20px] p-[24px_20px] sm:p-[34px_32px] mb-[48px] text-white relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-50px] w-[200px] h-[200px] rounded-full bg-[#387DFF]/16 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[11.5px] font-[800] tracking-[0.8px] uppercase text-[#387DFF] mb-[10px]">
              {intro?.roleFamilies?.eyebrow || 'One standard, every role'}
            </div>
            <h3 className="text-[19px] sm:text-[22px] font-[900] tracking-[-0.3px] leading-[1.3] mb-[12px]">
              {intro?.roleFamilies?.title || 'From the clinic to the codebase, the bar does not move'}
            </h3>
            <p className="text-[14px] sm:text-[14.5px] text-white/85 leading-[1.7] mb-[18px]">
              {intro?.roleFamilies?.body || 'VORA runs specialised interviews across every kind of role a health organisation hires for. Clinical and programme work sit alongside design, product, engineering, data, communications, operations, finance, fundraising, policy and the many specialist roles in between. Whatever you do, your Stage 2 is built for that craft and held to the same standard.'}
            </p>
            <div className="flex gap-[8px] flex-wrap">
              {(intro?.roleFamilies?.tags && intro.roleFamilies.tags.length > 0
                ? intro.roleFamilies.tags
                : DEFAULT_ROLE_FAMILIES
              ).map((tagItem: any, idx: number) => {
                const isActive = tagItem.active === true || tagItem.id === intro?.roleFamilies?.activeFamilyId;
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
          </div>
        </div>

        {/* Dynamic Outcomes Section */}
        <div className="bg-gradient-to-b from-[#EBF6FF] to-[#FCFDFF] border border-[#E1EEFF] rounded-[20px] p-[24px_20px] sm:p-[32px_30px] mb-[40px]">
          <div className="text-[11.5px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[8px]">
            If you do not clear the bar
          </div>
          <h3 className="text-[19px] sm:text-[21px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.3] mb-[10px]">
            {intro?.outcomes?.title || 'A result here is the start of a path, not a closed door'}
          </h3>
          <p className="text-[14px] sm:text-[14.5px] text-[#4A4A4A] leading-[1.7] mb-[20px]">
            {intro?.outcomes?.body || 'Stage 2 needs a strong, genuine performance to pass, and not everyone will on the first attempt. If you fall short, nothing about it is wasted. Here is exactly what happens.'}
          </p>
          <div className="flex flex-col gap-[12px]">
            {(intro?.outcomes?.items && intro.outcomes.items.length > 0 ? intro.outcomes.items : [
              {
                title: 'A clear gap analysis',
                body: 'We show you precisely where your performance sat against the bar, in plain language, with the specific areas that held you back.',
              },
              {
                title: 'A targeted way forward',
                body: 'Depending on the gap, we match you to a focused course or to one to one mentorship with someone at the very top of that craft, aimed only at what you actually need.',
              },
              {
                title: 'Roles waiting on the other side',
                body: 'We line up real, currently open roles that fit where you will be once you have closed the gap, so the effort leads somewhere concrete.',
              },
            ]).map((item: any, idx: number) => (
              <div key={idx} className="flex gap-[13px] items-start bg-white border border-[#E1EEFF] rounded-[13px] p-[15px_17px]">
                <div className="w-[24px] h-[24px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[12px] font-[900] shrink-0 mt-[1px]">
                  {idx + 1}
                </div>
                <div className="flex-1 text-[13.5px] text-[#1A1A1A] leading-[1.6]">
                  <strong className="font-[800]">{item.title}.</strong> {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assure Banner */}
        <div className="flex gap-[11px] items-start bg-white border border-[#E6E6E6] rounded-[13px] p-[16px_18px] mb-[40px]">
          <svg className="w-[19px] h-[19px] text-[#0047CC] shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          <p className="text-[13.5px] text-[#808080] leading-[1.6]">
            {intro?.footer?.profileNote || 'Your work here stays with you. What you build in Stage 2 becomes part of your VORA profile. When a role opens that fits how you came through, we let you know, even if it is not this one.'}
          </p>
        </div>

        {/* Deadline Banner */}
        <div className="flex gap-[12px] items-center bg-white border border-[#E6E6E6] rounded-[13px] p-[16px_18px] mb-[36px]">
          <svg className="w-[22px] h-[22px] text-[#0047CC] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <p className="text-[13.5px] text-[#808080] leading-[1.6]">
            {intro?.footer?.windowNote || 'You have 72 hours once you begin. Each part has its own short timer, and you can spread the stage across several sittings. If you pause, your place is held, though the questions regenerate when you return.'}
          </p>
        </div>

        {/* CTA Area */}
        <div className="text-center flex flex-col items-center">
          <button
            onClick={handleBegin}
            className="bg-[#0047CC] text-white border-none rounded-[13px] p-[17px_40px] text-[16px] font-[800] cursor-pointer inline-flex items-center shadow-[0_8px_24px_rgba(0,71,204,0.32)] transition-all duration-200 hover:bg-[#344DA1] hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(0,71,204,0.4)] font-sans"
          >
            {intro?.footer?.ctaLabel || 'Begin Stage 2'}
          </button>
          <p className="text-[12.5px] text-[#808080] mt-[16px] leading-[1.6] max-w-[480px]">
            {intro?.footer?.prepNote || 'Before you start. Find a quiet hour, a steady connection and a single screen. There is nothing to revise. The interview is built to read how you actually work.'}
          </p>
          <div>
            <button 
              onClick={handleLater}
              className="bg-none border-none text-[#808080] text-[13px] font-[700] cursor-pointer font-sans p-[12px] mt-[6px] hover:text-[#1A1A1A]"
            >
              {intro?.footer?.secondaryLabel || 'I will come back to this later'}
            </button>
          </div>
        </div>

      </main>

    </div>
  );
};

export default RoleAssessmentStageTwoIntro;
