import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useStartAssessmentScreenMutation, useGateVerdictQuery, useAssessmentGatesProgressQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';
import FullPageSpinner from '../../components/common/FullPageSpinner';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const renderFormattedText = (text: string, isHero = false) => {
  if (!text) return null;
  const parts = text.split(/(\d+(?:\.\d+)?%)/g);
  return parts.map((part, index) => {
    if (/^\d+(?:\.\d+)?%$/.test(part)) {
      return (
        <strong key={index} className={`font-[800] ${isHero ? 'text-white' : 'text-[#1A1A1A]'}`}>
          {part}
        </strong>
      );
    }
    return part;
  });
};

const RoleAssessmentStageTwoResults: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';
  
  const { data: verdictRaw, isLoading: isVerdictLoading, isFetching: isVerdictFetching } = useGateVerdictQuery(assessmentId, 2, { enabled: !!assessmentId });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const { data: progressRaw } = useAssessmentGatesProgressQuery(assessmentId, { enabled: !!assessmentId });
  const progressEntries = unwrapAssessmentData<any[]>(progressRaw) || [];
  const gate2Progress = Array.isArray(progressEntries) ? progressEntries.find((e) => String(e.gate) === '2') : null;

  React.useEffect(() => {
    if (!assessmentId && roleSlug) {
      navigate(`/onboarding/talent/${roleSlug}`, { replace: true });
      return;
    }
    // If scoring is still generating, send back to analyzing screen to show loader & poll
    if (verdict && String(verdict.status || '').toLowerCase() === 'generating') {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/analyzing`, { replace: true });
    }
  }, [assessmentId, verdict, roleSlug, navigate]);

  if (isVerdictLoading || isVerdictFetching || !verdict) {
    return <FullPageSpinner message="Retrieving your interview results..." />;
  }

  const firstName = user?.firstName || verdict?.talent?.firstName || 'Candidate';
  const rollupScore = (verdict as any)?.rollup?.score;
  const compositeScore = verdict?.score ?? rollupScore ?? gate2Progress?.score ?? 0;
  const passThreshold = verdict?.threshold ?? 80;
  const heroTag = verdict?.heroTag || (compositeScore >= passThreshold ? 'You passed Stage 2' : 'Stage 2 Outcome');
  const headline = verdict?.headline || `${firstName}, you're through to Stage 3`;
  const summary = verdict?.summary || 'Your professional dimension reads strong. The detail below is for you, so you can see what stood out and where there\'s room.';
  const narrativeParagraphs = verdict?.narrativeParagraphs || [];
  const parts = verdict?.parts || [];
  const traits = verdict?.traits || [];
  const strengths = verdict?.strengths || [];
  const nextStage = verdict?.nextStage;

  const startGate3 = useStartAssessmentScreenMutation(3);
  const [isStartingGate3, setIsStartingGate3] = useState(false);

  const handleOpenStageThree = async () => {
    setIsStartingGate3(true);
    try {
      if (assessmentId) {
        await startGate3.mutateAsync({
          assessmentId,
          body: {},
        });
      }
    } catch (err) {
      console.error('Failed to start Gate 3 session:', err);
    } finally {
      localStorage.setItem('vora_stage2_completed', 'true');
      localStorage.setItem('vora_stage3_unlocked', 'true');
      setIsStartingGate3(false);
      navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      {/* Topbar */}
      <header className="sticky top-0 bg-white/96 backdrop-blur-[10px] p-[12px_32px] flex items-center justify-between z-50">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">Stage 2 · Result</div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <svg className="w-[13px] h-[13px] text-[#0047CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={3} greenDone={false} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1029] via-[#182348] to-[#0047CC] text-white p-[48px_32px_60px] relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[#387DFF]/10" />
        <div className="absolute bottom-[-90px] left-[-70px] w-[240px] h-[240px] rounded-full bg-white/[0.04]" />
        <div className="max-w-[880px] mx-auto relative z-[2]">
          <div className="inline-flex items-center gap-[7px] bg-white/[0.16] border border-white/[0.24] rounded-full p-[6px_14px] backdrop-blur-[6px] mb-[16px]">
            <DocumentCheckIcon className="w-[13px] h-[13px]" />
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase">{heroTag}</span>
          </div>
          <h1 className="text-[34px] font-[900] tracking-[-0.5px] leading-[1.18] mb-[10px] max-w-[680px]">
            {headline}
          </h1>
          <p className="text-[15.5px] text-white/86 leading-[1.65] max-w-[560px] mb-[26px]">
            {summary}
          </p>

          <div className="flex gap-[14px] flex-wrap items-stretch">
            <div className="bg-white/[0.18] border border-white/[0.3] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Composite score</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                {compositeScore}<small className="text-[14px] font-[700] text-white/70 ml-[3px]">/100</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Threshold to pass: {passThreshold}</div>
            </div>

            {parts.length > 0 ? (
              parts.map((p) => (
                <div key={p.key || p.part} className="bg-white/[0.1] border border-white/[0.18] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
                  <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">
                    {p.displayLabel || `Part ${p.part} · ${p.partLabel}`}
                  </div>
                  <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                    {p.scorePercent}<small className="text-[14px] font-[700] text-white/70 ml-[3px]">%</small>
                  </div>
                  <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">
                    {p.shortDetail || p.description}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-[880px] w-full mx-auto mt-[-32px] px-[20px] sm:px-[28px] pb-[90px] relative z-10 flex-1">
        {/* Narrative Card */}
        {narrativeParagraphs.length > 0 ? (
          <div className="bg-white rounded-[18px] p-[28px_32px] mb-[22px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6] relative before:content-[''] before:absolute before:top-0 before:left-[24px] before:right-[24px] before:height-[3px] before:h-[3px] before:bg-gradient-to-r before:from-[#0047CC] before:to-[#387DFF] before:rounded-[0_0_4px_4px]">
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[14px] flex items-center gap-[10px]">
              <FolderIcon className="w-[20px] h-[20px] text-[#0047CC]" />
              What this stage showed us
            </h2>
            {narrativeParagraphs.map((para, idx) => (
              <p key={idx} className="text-[14.5px] text-[#4A4A4A] leading-[1.75] mb-[12px] last:mb-0">
                {renderFormattedText(para)}
              </p>
            ))}
          </div>
        ) : null}

        {/* Part breakdown */}
        {parts.length > 0 ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Per-part breakdown</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">Where each part landed</h2>

            {parts.map((p, idx) => (
              <div key={p.key || p.part} className="part-row py-[14px] border-b border-[#F7F7F7] last:border-b-0">
                <div className="flex items-center justify-between gap-[10px] mb-[8px]">
                  <div className="flex items-center gap-[10px] font-[800] text-[14px] text-[#1A1A1A]">
                    <div className="w-[24px] h-[24px] rounded-[7px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center text-[11px] font-[900]">{p.part || idx + 1}</div>
                    {p.displayLabel || `Part ${p.part} · ${p.partLabel}`}
                  </div>
                  <div className="text-[18px] font-[900] text-[#0047CC] tracking-[-0.3px] tabular-nums">
                    {p.scorePercent}<small className="text-[11.5px] font-[700] text-[#808080] ml-[2px]">%</small>
                  </div>
                </div>
                <div className="h-[8px] bg-[#F7F7F7] rounded-full overflow-hidden mb-[8px]">
                  <div className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, p.scorePercent)}%` }} />
                </div>
                <p className="text-[12.5px] text-[#808080] leading-[1.55]">
                  {p.shortDetail || p.description}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Traits breakdown */}
        {traits.length > 0 ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Traits this stage measured</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">How each professional trait scored</h2>
            <div className="flex flex-col gap-[16px]">
              {traits.map((t) => (
                <div key={t.key || t.label} className="flex flex-col gap-[6px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[13.5px] font-[800] text-[#1A1A1A]">{t.label}</span>
                    <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">{t.scorePercent}%</span>
                  </div>
                  <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, t.scorePercent)}%` }} />
                  </div>
                  {t.description && (
                    <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">{t.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Strengths */}
        {strengths.length > 0 ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Key Strengths</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">What stood out in your responses</h2>
            <div className="space-y-3">
              {strengths.map((s, idx) => (
                <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <div className="font-[800] text-[14px] text-[#1E293B] mb-1">{s.title}</div>
                  <div className="text-[13px] text-[#64748B] leading-relaxed">{s.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Next Card */}
        <div className="bg-gradient-to-br from-[#182348] to-[#0047CC] text-white rounded-[18px] p-[30px_32px] relative overflow-hidden shadow-[0_12px_36px_rgba(0,71,204,0.18)]">
          <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/[0.05]" />
          <div className="relative z-10">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-white/72 mb-[6px]">What happens next</div>
            <h2 className="text-[20px] font-[900] tracking-[-0.3px] mb-[8px] leading-[1.25]">Stage 3 · How you show up</h2>
            <p className="text-[14px] text-white/86 leading-[1.65] mb-[20px]">
              A short video interview, asynchronous and on your time. Five questions. You&apos;ll see your face and hear your voice, and so will Reach Africa.
            </p>
            <div className="flex gap-[10px] flex-wrap mb-[22px]">
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[9px_14px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Questions</div>
                <div className="text-[14px] font-[900] text-white">5</div>
              </div>
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[9px_14px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Total time</div>
                <div className="text-[14px] font-[900] text-white">~25 min</div>
              </div>
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[9px_14px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Window to complete</div>
                <div className="text-[14px] font-[900] text-white">48 hours</div>
              </div>
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[9px_14px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Either</div>
                <div className="text-[14px] font-[900] text-white">Record · Upload</div>
              </div>
            </div>
            <button 
              onClick={handleOpenStageThree}
              className="bg-white text-[#0047CC] border-none rounded-[10px] p-[14px_28px] text-[14px] font-[800] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:-translate-y-[2px] hover:shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-all"
            >
              Open Stage 3
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentStageTwoResults;
