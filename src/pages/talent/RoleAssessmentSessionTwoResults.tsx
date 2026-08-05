import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { useGetPreAssessmentReadinessQuery } from '../../services/queries/talent';
import { readStoredRolePostingId } from '../../utils/rolePostingId';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';
import FullPageSpinner from '../../components/common/FullPageSpinner';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
);

const AwardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const MessageSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const RoleAssessmentSessionTwoResults: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  const rolePostingId = useMemo(() => {
    return readStoredRolePostingId(roleSlug || '');
  }, [roleSlug]);

  const { data: readinessResponse } = useGetPreAssessmentReadinessQuery(roleSlug || '', rolePostingId);
  const readiness = readinessResponse?.data?.data || readinessResponse?.data || readinessResponse;

  const isLocked = useMemo(() => {
    if (!readiness) return false;

    const isExplicitlyLocked =
      readiness.assessmentStatus === 'LOCKED' ||
      readiness.assessmentStatus === 'FAILED' ||
      readiness.nextStep === 'FAILED' ||
      readiness.flowPhase === 'FAILED' ||
      readiness.checks?.flowPhase === 'FAILED' ||
      readiness.isLocked === true ||
      readiness.checks?.assessmentLocked === true;

    if (isExplicitlyLocked) return true;

    const isExplicitlyUnlocked =
      readiness.assessmentStatus === 'IN_PROGRESS' ||
      readiness.nextStep === 'STAGE_2_ASSESSMENT' ||
      readiness.flowPhase === 'ASSESSMENT' ||
      (typeof readiness.stage === 'number' && readiness.stage >= 2);

    if (isExplicitlyUnlocked) return false;

    return readiness.checks?.canBeginAssessment === false;
  }, [readiness]);

  const assessmentId = resolveGate1AssessmentId() ?? '';
  const { data: verdictRaw, isLoading: isVerdictLoading } = useGateVerdictQuery(assessmentId, 1, {
    enabled: !!assessmentId,
  });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  if (isVerdictLoading || !verdict) {
    return <FullPageSpinner message="Retrieving your interview results..." />;
  }

  const handleNextStage = () => {
    if (isLocked) return;
    localStorage.setItem('vora_stage2_unlocked', 'true');
    navigate(`/onboarding/talent/${roleSlug}/interview/stage-2`);
  };

  const handleLater = () => {
    navigate('/dashboard');
  };

  const strengths = [
    {
      label: 'Strength 1',
      title: 'Staged decision-making under pressure',
      desc: 'You separate what must happen now from what can be properly regularised after. This is rarer than it sounds.',
      icon: <ClockIcon className="w-[20px] h-[20px]" />,
    },
    {
      label: 'Strength 2',
      title: 'Consistency between values and action',
      desc: 'What you said you\'d do and how you\'d actually behave in the scenarios mapped onto each other. That\'s a strong honesty signal.',
      icon: <AwardIcon className="w-[20px] h-[20px]" />,
    },
    {
      label: 'Strength 3',
      title: 'Protecting the people closest to the work',
      desc: 'When team welfare and delivery targets pulled apart, you found the move that addressed both. Field leadership lives or dies on this.',
      icon: <UsersIcon className="w-[20px] h-[20px]" />,
    },
    {
      label: 'Strength 4',
      title: 'Holds difficult conversations directly',
      desc: 'On the donor scenario you took the honest route rather than the diplomatic one. Senior roles increasingly need this.',
      icon: <MessageSquareIcon className="w-[20px] h-[20px]" />,
    },
  ];

  const traits = [
    { name: 'Conscientiousness', desc: 'Following through, organisation, dependability', val: 91 },
    { name: 'Ethical reasoning', desc: 'Calling out the harder call when it\'s the right one', val: 88 },
    { name: 'Composure under pressure', desc: 'Steady thinking when the situation is moving fast', val: 82 },
    { name: 'People sensitivity', desc: 'Reading what a person actually needs versus what they\'re saying', val: 86 },
    { name: 'Openness to evidence', desc: 'Willingness to change a view when new data lands', val: 79 },
    { name: 'Decisiveness', desc: 'Moving when more deliberation would cost more than it gains', val: 74 },
  ];

  const getIconForStrength = (index: number) => {
    switch (index) {
      case 0: return <ClockIcon className="w-[20px] h-[20px]" />;
      case 1: return <AwardIcon className="w-[20px] h-[20px]" />;
      case 2: return <UsersIcon className="w-[20px] h-[20px]" />;
      default: return <MessageSquareIcon className="w-[20px] h-[20px]" />;
    }
  };

  const strengthsList = verdict?.strengths?.map((st, i) => ({
    label: `Strength ${i + 1}`,
    title: st.title,
    desc: st.description,
    icon: getIconForStrength(i),
  })) || strengths;

  const traitsList = verdict?.traits?.map(tr => ({
    name: tr.label,
    desc: tr.description,
    val: tr.scorePercent,
  })) || traits;

  const displayScore = verdict?.score ?? 84;

  const renderTextWithBoldScore = (text: string, score: number) => {
    if (!score) return text;
    const scoreStr = String(score);
    const scorePercentStr = `${scoreStr}%`;

    if (text.includes(scorePercentStr)) {
      const parts = text.split(scorePercentStr);
      return (
        <>
          {parts.reduce((acc, part, i) => {
            if (i === 0) return [part];
            return [...acc, <strong key={i} className="font-extrabold text-[#1A1A1A]">{scorePercentStr}</strong>, part];
          }, [] as React.ReactNode[])}
        </>
      );
    }

    if (text.includes(scoreStr)) {
      const parts = text.split(scoreStr);
      return (
        <>
          {parts.reduce((acc, part, i) => {
            if (i === 0) return [part];
            return [...acc, <strong key={i} className="font-extrabold text-[#1A1A1A]">{scoreStr}</strong>, part];
          }, [] as React.ReactNode[])}
        </>
      );
    }

    return text;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
      <style>{`
        @keyframes bobIn {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fillRing {
          from { stroke-dashoffset: 377; }
          to { stroke-dashoffset: 60; }
        }

        .check-ring-pulse { animation: bobIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .dashed-spin { animation: spin 18s linear infinite; }
        .fill-ring-anim { stroke-dashoffset: 377; animation: fillRing 1.6s ease-out 0.3s both; }
      `}</style>

      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">
          Stage 1 of 4 results
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Saved to your file
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={2} />

      {/* Hero (Deep Blue theme instead of green) */}
      <section className="bg-gradient-to-br from-[#0A1029] via-[#182348] to-[#0047CC] color-white text-white p-[46px_32px_38px] text-center relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[280px] h-[280px] rounded-full bg-[#387DFF]/10" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-white/5" />
        
        <div className="relative z-10 max-w-[780px] mx-auto text-center">
          {/* Check Ring */}
          <div className="w-[92px] h-[92px] rounded-full mx-auto mb-[22px] flex items-center justify-center bg-white/10 border-2 border-white/30 backdrop-blur-[8px] relative check-ring-pulse">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div className="absolute -inset-[6px] border-[1.5px] border-dashed border-white/30 rounded-full dashed-spin" />
          </div>

          <div className="inline-flex items-center gap-[7px] bg-white/15 border border-white/25 rounded-[100px] p-[5px_13px] mb-[14px]">
            <span className="text-[11px] font-[800] tracking-[0.7px] color-white uppercase">Stage 1 cleared</span>
          </div>

          {/* Score ring section */}
          <div className="flex justify-center mb-6">
            <div className="relative w-[140px] h-[140px]">
              <svg className="w-[140px] h-[140px] transform rotate-[-90deg]">
                <circle 
                  cx="70" 
                  cy="70" 
                  r="60"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="10"
                />
                <circle 
                  cx="70" 
                  cy="70" 
                  r="60"
                  fill="none"
                  stroke="#387DFF"
                  strokeWidth="10"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: '377',
                    strokeDashoffset: `${377 - (377 * displayScore) / 100}`,
                    transition: 'stroke-dashoffset 1.5s ease-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[34px] font-[900] leading-none">{displayScore}%</span>
                <span className="text-[10px] font-[700] tracking-[1px] uppercase text-white/70 mt-[2px]">Stage 1 fit</span>
              </div>
            </div>
          </div>

          <h1 className="text-[30px] font-[900] tracking-[-0.5px] leading-[1.2] mb-[10px]">
            {verdict?.headline || `You came through clearly, ${firstName}`}
          </h1>
          <p className="text-[15px] text-white/85 leading-[1.6] max-w-[580px] mx-auto mb-[28px]">
            {verdict?.summary || `Your responses across both sessions painted a coherent and credible picture of how you think and what you stand by. Here's exactly what we saw, and what happens next. You cleared the eighty per cent wall, so Stage 2 is now unlocked. The stages run in order, Stage 2 stays locked until Stage 1 is passed and Stage 3 until Stage 2 is passed, so reaching the next one means you genuinely met this one.`}
          </p>

          {/* What this score means section (Centered) */}
          <div className="max-w-[480px] mx-auto bg-white/10 border border-white/15 rounded-[16px] p-6 text-center backdrop-blur-[6px]">
            <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase text-white/65 mb-[6px]">
              What this score means
            </div>
            <div className="text-[18px] font-[800] tracking-[-0.2px] leading-[1.3] mb-[5px]">
              Above the threshold required for this role
            </div>
            <div className="text-[13.5px] text-white/80 leading-[1.55]">
              A Stage 1 fit of {verdict?.threshold ?? 80}% or higher is the minimum for progressing to the professional dimension. Yours is comfortably above.
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative */}
      <main className="max-w-[780px] w-full mx-auto px-[20px] sm:px-[28px] pt-[38px] pb-[100px] flex-1">
        <h2 className="text-[20px] font-[900] text-[#1A1A1A] tracking-[-0.3px] mb-[6px]">
          What we saw, in plain words
        </h2>
        <p className="text-[13.5px] text-[#808080] leading-[1.55] mb-[18px]">
          A short narrative summary of the picture your responses built. Written for you, not in jargon.
        </p>

        {/* Narrative Card (Blue bordered instead of green) */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[24px_26px] mb-[26px]">
          <h3 className="text-[16px] font-[800] text-[#1A1A1A] mb-[10px] tracking-[-0.2px]">
            Your Stage 1 picture
          </h3>
          {verdict?.narrativeParagraphs && verdict.narrativeParagraphs.length > 0 ? (
            verdict.narrativeParagraphs.map((para, idx) => (
              <p key={idx} className="text-[14.5px] text-[#4A4A4A] leading-[1.7] mb-[10px] last:mb-0">
                {renderTextWithBoldScore(para, displayScore)}
              </p>
            ))
          ) : (
            <>
              <p className="text-[14.5px] text-[#4A4A4A] leading-[1.7] mb-[10px]">
                <span className="font-[900] text-[#1A1A1A]">{firstName}, </span>
                across both sessions you read as someone who weighs decisions before moving, but doesn&apos;t get stuck in deliberation. When the maternal health outreach scenario hit you with a regulatory gap, you went staged and documented rather than either freezing or barreling ahead. That instinct repeated through the rest of the scenarios. It says you can hold the tension between doing the right thing and doing the thing that&apos;s needed right now.
              </p>
              <p className="text-[14.5px] text-[#4A4A4A] leading-[1.7] mb-[10px]">
                Your values lean strongly toward consultative leadership, integrity over expedience, and protecting the people closest to the work. Your psychometric profile (high conscientiousness, high openness, moderate-high agreeableness, low neuroticism) lines up neatly with what your scenario answers showed. That alignment matters more than any single score, because it suggests how you say you are, and how you actually behave under pressure, are the same person.
              </p>
              <p className="text-[14.5px] text-[#4A4A4A] leading-[1.7]">
                One nuance worth naming: you lean slightly toward caution over speed, which serves you well in ethical calls but may need balancing in fast-moving operational decisions. The hiring team at Reach Africa will see this in context, not as a flag.
              </p>
            </>
          )}
        </div>

        <h2 className="text-[20px] font-[900] text-[#1A1A1A] tracking-[-0.3px] mb-[6px]">
          Four strengths that stood out
        </h2>
        <p className="text-[13.5px] text-[#808080] leading-[1.55] mb-[18px]">
          These came through repeatedly across your responses.
        </p>

        {/* Strengths Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[30px]">
          {strengthsList.map((str) => (
            <div key={str.label} className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] p-[20px_22px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-[14px]">
                <span className="text-[10px] font-[800] tracking-[1px] uppercase text-[#808080]">{str.label}</span>
                <span className="text-[#0047CC]">{str.icon}</span>
              </div>
              <h3 className="text-[15.5px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[4px] leading-snug">
                {str.title}
              </h3>
              <div className="text-[13px] text-[#808080] leading-[1.55]">
                {str.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Trait breakdown (Blue-themed) */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[16px] overflow-hidden mb-[28px]">
          <div className="p-[18px_22px] border-b border-[#F7F7F7] flex items-center justify-between">
            <h3 className="text-[16px] font-[800] text-[#1A1A1A] tracking-[-0.2px]">
              Trait-by-trait breakdown
            </h3>
            <div className="text-[12px] font-[700] text-[#808080] bg-[#F7F7F7] px-[10px] py-[4px] rounded-[100px]">
              Overall: {displayScore}%
            </div>
          </div>

          <div className="flex flex-col">
            {traitsList.map((tr) => (
              <div key={tr.name} className="p-[16px_22px] border-b border-[#F7F7F7] last:border-none flex flex-col sm:flex-row sm:items-center gap-[18px]">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-[700] text-[#1A1A1A] mb-[4px]">{tr.name}</div>
                  <div className="text-[12.5px] text-[#808080] leading-[1.45]">{tr.desc}</div>
                </div>
                <div className="w-full sm:w-[200px] sm:shrink-0 flex items-center gap-[12px]">
                  <div className="flex-1 h-[8px] bg-[#F7F7F7] rounded-[100px] overflow-hidden">
                    <div 
                      className="height-[100%] h-full rounded-[100px] bg-gradient-to-r from-[#387DFF] to-[#0047CC]" 
                      style={{ width: `${tr.val}%` }}
                    />
                  </div>
                  <div className="text-[13px] font-[800] text-[#0047CC] min-w-[36px] text-right">
                    {tr.val}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Card (Stage 2 Unlock/Locked) */}
        <div className="bg-gradient-to-br from-[#EBF6FF] to-[#F8FBFF] border-[1.5px] border-[#EBF6FF] rounded-[18px] p-[26px_28px] text-center mb-[18px] relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] rounded-full bg-[#0047CC]/5" />
          <div className={`text-[11px] font-[800] tracking-[1px] uppercase mb-[8px] relative z-10 ${isLocked ? 'text-[#DC2626]' : 'text-[#0047CC]'}`}>
            {isLocked ? `Stage ${verdict?.nextStage?.gate ?? 2} is Locked` : `Stage ${verdict?.nextStage?.gate ?? 2} is now open`}
          </div>
          <h3 className="text-[20px] font-[900] text-[#182348] tracking-[-0.3px] mb-[8px] leading-[1.3] relative z-10">
            {isLocked ? "Assessment locked or failed" : `Ready to show us your ${verdict?.nextStage?.label?.toLowerCase() || 'professional'} side?`}
          </h3>
          <p className="text-[14px] text-[#4A4A4A] leading-[1.6] mb-[20px] max-w-[520px] mx-auto relative z-10">
            {isLocked ? (
              <span className="text-[#DC2626] font-[600]">
                Your assessment status for this role is closed or failed. Progression to Stage 2 is disabled.
              </span>
            ) : (
              `The next stage goes into the specific work itself. It's longer and the questions are tied directly to what a ${verdict?.role?.roleTitle || readiness?.roleTitle || 'team member'} at ${verdict?.role?.employerName || readiness?.employerName || 'this company'} actually does day to day. You have ${verdict?.nextStage?.windowHours ?? 72} hours from now to complete it.`
            )}
          </p>

          {!isLocked && (
            <div className="flex justify-center gap-[18px] flex-wrap font-[600] text-[12px] text-[#808080] mb-[20px] relative z-10">
              <div className="flex items-center gap-[6px]">
                <ClockIcon className="w-[14px] h-[14px] text-[#0047CC]" />
                Estimated {verdict?.nextStage?.estimatedMinutesMin ?? 75} to {verdict?.nextStage?.estimatedMinutesMax ?? 110} minutes
              </div>
              <div className="flex items-center gap-[6px]">
                <MenuIcon className="w-[14px] h-[14px] text-[#0047CC]" />
                Broken into {verdict?.nextStage?.partsCount ?? 3} parts
              </div>
              <div className="flex items-center gap-[6px]">
                <DocumentCheckIcon className="w-[14px] h-[14px] text-[#0047CC]" />
                Resumable any time
              </div>
            </div>
          )}

          <div className="flex justify-center relative z-10">
            <Button
              onClick={handleNextStage}
              disabled={isLocked}
              className={
                isLocked
                  ? "text-[#ADADAD] bg-[#E6E6E6] cursor-not-allowed w-full sm:w-auto font-[800] border-none"
                  : "text-white bg-[#0047CC] shadow-[0_4px_14px_rgba(0,71,204,0.32)] hover:bg-[#344DA1] w-full sm:w-auto font-[800]"
              }
              pill={false}
            >
              {isLocked ? `Stage ${verdict?.nextStage?.gate ?? 2} Locked` : `Continue to Stage ${verdict?.nextStage?.gate ?? 2}`}
            </Button>
          </div>

          <div className="relative z-10">
            <button 
              onClick={handleLater}
              className="bg-transparent border-none text-[#808080] text-[13px] font-[600] cursor-pointer p-[10px] mt-[10px] hover:text-[#1A1A1A] transition-colors"
            >
              {isLocked ? "Return to dashboard" : "I'll come back later"}
            </button>
          </div>
        </div>

        {/* Confidential footer */}
        <div className="text-center text-[12px] text-[#ADADAD] mt-[18px] flex items-center justify-center gap-[6px]">
          <LockIcon className="w-[12px] h-[12px]" />
          This detailed breakdown is only visible to you. The hiring team sees a structured summary, not the underlying responses.
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentSessionTwoResults;
