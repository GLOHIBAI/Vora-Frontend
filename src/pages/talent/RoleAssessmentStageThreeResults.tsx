import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, unwrapAssessmentData } from '../../utils/assessmentSession';
import { getCandidateFirstName } from '../../utils/userName';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import EvidenceMap from '../../components/talent/assessment/shared/EvidenceMap';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const LayersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
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

const RoleAssessmentStageThreeResults: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const {
    data: verdictRaw,
    isLoading: isVerdictLoading,
    isFetching: isVerdictFetching,
    isError,
    error,
    refetch,
  } = useGateVerdictQuery(assessmentId, 3, { enabled: !!assessmentId });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  React.useEffect(() => {
    if (!assessmentId && roleSlug) {
      navigate(`/onboarding/talent/${roleSlug}`, { replace: true });
      return;
    }
    // If scoring is still generating, send back to analyzing screen to show loader & poll
    if (verdict && String(verdict.status || '').toLowerCase() === 'generating') {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/analyzing`, { replace: true });
      return;
    }
    // If candidate failed (< 80%), redirect to outcome page (locked, no recruiter)
    const isFailed =
      verdict?.outcome === 'failed' ||
      verdict?.passed === false ||
      verdict?.verdict === 'fail' ||
      verdict?.verdict === 'not_yet' ||
      verdict?.roleLocked === true ||
      ((verdict as any)?.rollup && (verdict as any).rollup.passed === false);
    if (isFailed) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3/outcome`, { replace: true });
      return;
    }
  }, [assessmentId, verdict, roleSlug, navigate]);

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-lg space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Interview Results</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {(error as any)?.message || 'We encountered an issue retrieving your Stage 3 interview results. Please check your connection and try again.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => refetch()}
              className="w-full py-3 px-5 bg-[#0047CC] hover:bg-[#003bb0] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
              className="w-full py-3 px-5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-gray-200"
            >
              Return to Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isVerdictLoading || isVerdictFetching || !verdict || (typeof (verdict as any)?.score !== 'number' && typeof (verdictRaw as any)?.data?.score !== 'number')) {
    return <FullPageSpinner message="Retrieving your interview results..." />;
  }

  const vData: any = (verdict as any)?.data || verdict || (verdictRaw as any)?.data || verdictRaw || {};

  const firstName = getCandidateFirstName(user, vData?.talent?.firstName || 'Candidate');
  const stageScore = vData?.score ?? 0;
  const overallScore = vData?.overallScore ?? stageScore;
  const passThreshold = vData?.threshold ?? 80;
  const heroTag = vData?.heroTag || (stageScore >= passThreshold ? 'You passed Stage 3' : 'Stage 3 Outcome');
  const headline = vData?.headline || `${firstName}, you're through to the final decision`;
  const summary = vData?.summary || '';
  const narrativeParagraphs: string[] = vData?.narrativeParagraphs || [];
  const stages: Array<{ gate: number; label: string; score: number; status: string }> = vData?.stages || [];
  const traits = vData?.traits || [];
  const strengths = vData?.strengths || [];
  const nextDecision = vData?.nextDecision || {
    title: 'Final Decision · Reach Africa',
    description:
      'Reach Africa reviews the full portfolio — your three gate scores, evidence map, video responses, and simulation ledger. A final offer or close-out decision is issued.',
    ctaLabel: 'View your final decision',
    typicalWait: 'Within 2 business days',
  };

  const handleProceedToDecision = () => {
    localStorage.setItem('vora_stage3_completed', 'true');
    localStorage.setItem('vora_stage4_unlocked', 'true');
    navigate(`/onboarding/talent/${roleSlug}/interview/stage-4/decision`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      {/* Topbar */}
      <header className="sticky top-0 bg-white/96 backdrop-blur-[10px] p-[12px_32px] flex items-center justify-between z-50 border-b border-[#E6E6E6]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">Stage 3 · Result</div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <svg className="w-[13px] h-[13px] text-[#0047CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved
        </div>
      </header>

      {/* Stage Rail - All 3 stages complete, pointing to final decision (Stage 4) */}
      <StageRail activeStage={4} greenDone={true} />

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
            {/* Stage 3 score */}
            <div className="bg-white/[0.18] border border-white/[0.3] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[200px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Stage 3 score</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                {stageScore}<small className="text-[14px] font-[700] text-white/70 ml-[3px]">/100</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Threshold to pass: {passThreshold}</div>
            </div>

            {/* Overall portfolio score */}
            <div className="bg-white/[0.12] border border-white/[0.22] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[200px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Overall profile score</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                {overallScore}<small className="text-[14px] font-[700] text-white/70 ml-[3px]">/100</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Across all 3 stages</div>
            </div>

            {/* Gates passed indicator */}
            <div className="bg-white/[0.1] border border-white/[0.18] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[200px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Gates completed</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums text-white flex items-center gap-[6px]">
                3 of 3
                <CheckCircleIcon className="w-[20px] h-[20px] text-[#2CA62C]" />
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Qualified for employer review</div>
            </div>
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

        {/* 3-Stage Progress Rail Summary */}
        {stages.length > 0 ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">All-stage interview trail</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">Your journey through the three gates</h2>

            <div className="flex flex-col divide-y divide-[#F0F0F0]">
              {stages.map((st) => (
                <div key={st.gate} className="py-[14px] first:pt-0 last:pb-0 flex flex-col gap-[8px]">
                  <div className="flex items-center justify-between gap-[10px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[26px] h-[26px] rounded-[8px] bg-[#EEFBEE] text-[#1D871D] flex items-center justify-center text-[12px] font-[900]">
                        ✓
                      </div>
                      <div>
                        <div className="font-[800] text-[14px] text-[#1A1A1A]">{st.label}</div>
                        <div className="text-[11.5px] text-[#808080] font-[600]">
                          Status: <span className="capitalize text-[#1D871D] font-[700]">{st.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[18px] font-[900] text-[#0047CC] tracking-[-0.3px] tabular-nums">
                      {st.score}<small className="text-[11.5px] font-[700] text-[#808080] ml-[2px]">%</small>
                    </div>
                  </div>
                  <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, st.score)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Traits breakdown */}
        {traits.length > 0 ? (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Measured competencies</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">Executive presence & communication traits</h2>
            <div className="flex flex-col gap-[16px]">
              {traits.map((t: any) => (
                <div key={t.key || t.label} className="flex flex-col gap-[6px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[13.5px] font-[800] text-[#1A1A1A]">{t.label}</span>
                    <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">{t.scorePercent}%</span>
                  </div>
                  <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, t.scorePercent)}%` }}
                    />
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
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">What stood out in your video presentation</h2>
            <div className="space-y-3">
              {strengths.map((s: any, idx: number) => (
                <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <div className="font-[800] text-[14px] text-[#1E293B] mb-1">{s.title}</div>
                  <div className="text-[13px] text-[#64748B] leading-relaxed">{s.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Evidence Map */}
        <EvidenceMap evidenceMap={vData?.evidenceMap} className="mb-[22px]" />

        {/* Next Decision Card */}
        <div className="bg-gradient-to-br from-[#182348] via-[#101935] to-[#0047CC] text-white rounded-[18px] p-[30px_32px] relative overflow-hidden shadow-[0_12px_36px_rgba(0,71,204,0.18)]">
          <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/[0.05]" />
          <div className="relative z-10">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-white/72 mb-[6px]">
              What happens next
            </div>
            <h2 className="text-[22px] font-[900] tracking-[-0.3px] mb-[10px] leading-[1.25]">
              {nextDecision.title}
            </h2>
            <p className="text-[14px] text-white/86 leading-[1.65] mb-[22px] max-w-[620px]">
              {nextDecision.description}
            </p>

            <div className="flex gap-[10px] flex-wrap mb-[24px]">
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[10px_16px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Status</div>
                <div className="text-[14px] font-[900] text-white flex items-center gap-[6px]">
                  <span className="w-[8px] h-[8px] rounded-full bg-[#2CA62C] animate-pulse" />
                  Handoff in review
                </div>
              </div>
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[10px_16px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Typical wait</div>
                <div className="text-[14px] font-[900] text-white">{nextDecision.typicalWait || 'Within 2 business days'}</div>
              </div>
              <div className="bg-white/10 border border-white/18 rounded-[10px] p-[10px_16px] backdrop-blur-[6px]">
                <div className="text-[10px] font-[800] tracking-[0.5px] uppercase text-white/70 mb-[2px]">Dossier submitted</div>
                <div className="text-[14px] font-[900] text-white">Full portfolio</div>
              </div>
            </div>

            <div className="flex items-center gap-[12px] flex-wrap">
              <button
                type="button"
                onClick={handleProceedToDecision}
                className="bg-white text-[#0047CC] border-none rounded-[10px] p-[14px_28px] text-[14px] font-[800] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:-translate-y-[2px] hover:shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-all"
              >
                {nextDecision.ctaLabel || 'View your final decision'}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/journey`)}
                className="bg-white/12 text-white border border-white/24 hover:bg-white/20 rounded-[10px] p-[14px_24px] text-[14px] font-[700] cursor-pointer transition-all backdrop-blur-[6px]"
              >
                Return to journey
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentStageThreeResults;
