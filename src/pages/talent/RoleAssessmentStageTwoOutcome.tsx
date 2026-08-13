import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LayersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const AwardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const FileCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
);

const RoleAssessmentStageTwoOutcome: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  React.useEffect(() => {
    if (!assessmentId && roleSlug) {
      navigate(`/onboarding/talent/${roleSlug}`, { replace: true });
    }
  }, [assessmentId, roleSlug, navigate]);

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 2, { enabled: !!assessmentId });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const vData: any = (verdict as any)?.data || verdict || (verdictRaw as any)?.data || verdictRaw || {};

  const firstName = user?.firstName || vData?.talent?.firstName || 'Candidate';
  const roleTitle = vData?.role?.roleTitle || 'Role';
  const employerName = vData?.role?.employerName || 'Vora AI';
  const score = vData?.score ?? 0;
  const threshold = vData?.threshold ?? 80;

  const heroTag = vData?.heroTag || 'Stage 2 outcome · with your next path';
  const headline = vData?.headline || `Stage 2 assessment: ${firstName}, you did not pass.`;
  const summary = vData?.summary || `Your Stage 2 composite score of ${score}% did not clear the ${threshold}% threshold for ${roleTitle} at ${employerName}.`;
  
  const narrativeParagraphs: string[] =
    vData?.narrativeParagraphs ||
    vData?.data?.narrativeParagraphs ||
    (verdictRaw as any)?.data?.narrativeParagraphs ||
    (verdictRaw as any)?.narrativeParagraphs ||
    [];

  const rawGaps =
    vData?.gaps ||
    vData?.data?.gaps ||
    (verdict as any)?.gaps ||
    (verdict as any)?.data?.gaps ||
    (verdictRaw as any)?.gaps ||
    (verdictRaw as any)?.data?.gaps ||
    (verdictRaw as any)?.data?.data?.gaps ||
    vData?.skillGaps ||
    vData?.competencyGaps ||
    [];
  const gaps: any[] = Array.isArray(rawGaps) ? rawGaps : [];

  const diagnosis = vData?.diagnosis || vData?.data?.diagnosis || (verdictRaw as any)?.data?.diagnosis;
  const curator = vData?.curator || vData?.data?.curator || (verdictRaw as any)?.data?.curator;
  const mentor = vData?.mentor || vData?.data?.mentor || (verdictRaw as any)?.data?.mentor;
  const futureRoles: any[] =
    (Array.isArray(vData?.futureRoles) && vData.futureRoles) ||
    (Array.isArray(vData?.data?.futureRoles) && vData.data.futureRoles) ||
    (Array.isArray((verdictRaw as any)?.data?.futureRoles) && (verdictRaw as any).data.futureRoles) ||
    (Array.isArray((verdictRaw as any)?.futureRoles) && (verdictRaw as any).futureRoles) ||
    [];
  const parts: any[] =
    (Array.isArray(vData?.parts) && vData.parts) ||
    (Array.isArray(vData?.data?.parts) && vData.data.parts) ||
    (Array.isArray((verdictRaw as any)?.data?.parts) && (verdictRaw as any).data.parts) ||
    (Array.isArray((verdictRaw as any)?.parts) && (verdictRaw as any).parts) ||
    [];
  const ledgerNote = vData?.ledgerNote || vData?.data?.ledgerNote || (verdictRaw as any)?.data?.ledgerNote;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativePostedTime = (postedAt?: string) => {
    if (!postedAt) return 'Posted 2 days ago';
    const target = new Date(postedAt).getTime();
    if (isNaN(target)) return 'Posted 2 days ago';
    const now = new Date().getTime();
    const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  const getDaysRemaining = (closesAt?: string, postedAt?: string) => {
    if (!closesAt) return 33;
    const target = new Date(closesAt).getTime();
    if (isNaN(target)) return 33;
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return diffDays;
    if (postedAt) {
      const postTime = new Date(postedAt).getTime();
      if (!isNaN(postTime)) {
        const totalDays = Math.ceil((target - postTime) / (1000 * 60 * 60 * 24));
        if (totalDays > 0) return totalDays;
      }
    }
    return 33;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      {/* Topbar */}
      <header className="sticky top-0 bg-white/96 backdrop-blur-[10px] border-b border-[#E6E6E6] p-[12px_32px] flex items-center justify-between z-50">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600]">Stage 2 · Outcome and what to do next</div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <svg className="w-[13px] h-[13px] text-[#2CA62C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={2} greenDone={false} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A2138] via-[#2D3548] to-[#3B4361] text-white p-[48px_32px_60px] relative overflow-hidden">
        <div className="max-w-[880px] mx-auto relative z-[2]">
          <div className="inline-flex items-center gap-[7px] bg-white/10 border border-white/20 rounded-full p-[6px_14px] backdrop-blur-md mb-4">
            <AlertCircleIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase text-white/90">{heroTag}</span>
          </div>
          <h1 className="text-[30px] font-[900] tracking-[-0.4px] leading-[1.22] mb-3.5 max-w-[680px]">
            {headline}
          </h1>
          <p className="text-[15.5px] text-white/85 leading-[1.7] max-w-[560px]">
            {summary}
          </p>

          {/* Composite score & Part breakdown boxes */}
          <div className="mt-6 flex gap-3.5 flex-wrap items-stretch">
            {/* Composite score box */}
            <div className="bg-white/10 border border-white/20 rounded-[14px] p-[18px_20px] backdrop-blur-md min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/70 mb-1.5">Composite score</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-none tabular-nums">
                {score}<small className="text-[14px] font-[700] text-white/70 ml-1">/100</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-1.5 leading-snug">Threshold to pass: {threshold}</div>
            </div>

            {/* Part score boxes */}
            {parts.map((p, idx) => (
              <div key={p.key || p.part || idx} className="bg-white/10 border border-white/20 rounded-[14px] p-[18px_20px] backdrop-blur-md min-w-[140px] flex-1 max-w-[200px]">
                <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/70 mb-1.5">
                  {p.displayLabel || (p.partLabel ? `Part ${p.part || idx + 1} · ${p.partLabel}` : `Part ${p.part || idx + 1}`)}
                </div>
                <div className="text-[28px] font-[900] tracking-[-0.5px] leading-none tabular-nums">
                  {p.scorePercent}<small className="text-[14px] font-[700] text-white/70 ml-1">%</small>
                </div>
                {(p.shortDetail || p.description) && (
                  <div className="text-[11.5px] text-white/75 font-[600] mt-1.5 leading-snug line-clamp-2">
                    {p.shortDetail || p.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[880px] w-full mx-auto mt-[-32px] px-[20px] sm:px-[28px] pb-[90px] relative z-10 flex-1 space-y-5">
        {/* Narrative Section */}
        {narrativeParagraphs.length > 0 && (
          <div className="bg-white rounded-[18px] p-[28px_32px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6]">
            {narrativeParagraphs.map((para, idx) => (
              <p key={idx} className="text-[15px] text-[#4A4A4A] leading-[1.85] mb-3.5 last:mb-0">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Competency Gaps Section */}
        {gaps.length > 0 && (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_30px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-2">
              Where Stage 2 fell short
            </div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-1.5">
              {gaps.length} {gaps.length === 1 ? 'competency came' : 'competencies came'} in below the bar
            </h2>
            <p className="text-[13.5px] text-[#808080] leading-[1.6] mb-4">
              These areas specifically pulled your composite score ({score}%) below the required {threshold}% threshold.
            </p>

            <div className="space-y-3.5">
              {gaps.map((gap) => (
                <div key={gap.key} className="p-4 bg-gradient-to-b from-[#F0F4FF] to-[#F8FAFF] border border-[#D0E1FF] rounded-xl">
                  <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 text-[14px] font-[800] text-[#1A1A1A]">
                      <LayersIcon className="w-[16px] h-[16px] text-[#0047CC]" />
                      {gap.label}
                    </div>
                    <div className="text-[14px] font-[900] text-[#0047CC] tabular-nums">
                      {gap.scorePercent}<small className="text-[11px] font-[700] text-[#808080] ml-0.5">%</small>
                    </div>
                  </div>

                  <p className="text-[13px] text-[#334155] leading-[1.6] mb-2.5">
                    {gap.explanation}
                  </p>

                  <div className="relative h-1.5 bg-white/80 rounded-full overflow-hidden mb-1 border border-[#D0E1FF]/40">
                    <div
                      className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full"
                      style={{ width: `${Math.min(100, gap.scorePercent)}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#0047CC]"
                      style={{ left: `${gap.thresholdPercent || threshold}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10.5px] text-[#808080] font-[700]">
                    <span>Your score · {gap.scorePercent}%</span>
                    <strong className="text-[#0047CC]">Threshold · {gap.thresholdPercent || threshold}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis Feedback Section */}
        {diagnosis && diagnosis.rationale && (
          <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_30px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-2">
              Diagnosis & Feedback
            </div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-2">
              Assessment Rationale
            </h2>
            <p className="text-[14px] text-[#4A4A4A] leading-[1.7]">
              {diagnosis.rationale}
            </p>
          </div>
        )}

        {/* Curator Recommendation Section */}
        {curator && (
          <div className="bg-gradient-to-br from-[#182348] to-[#0047CC] text-white rounded-[18px] p-[32px_34px] relative overflow-hidden">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-white/75 mb-2 relative z-10">
              {curator.eyebrow || 'Curated recommendation'}
            </div>
            <h2 className="text-[22px] font-[900] text-white tracking-[-0.3px] leading-[1.25] mb-2.5 relative z-10">
              {curator.title}
            </h2>
            <p className="text-[14.5px] text-white/85 leading-[1.7] max-w-[580px] relative z-10">
              {curator.body}
            </p>
          </div>
        )}

        {/* Mentor / Course Card Section */}
        {mentor && (
          <div className="bg-gradient-to-b from-white to-[#FDFCF6] border-2 border-[#D4A017] rounded-[18px] overflow-hidden shadow-[0_16px_48px_rgba(212,160,23,0.18)]">
            <div className="bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-white px-7 py-2.5 text-[11px] font-[900] tracking-[1.5px] uppercase flex items-center justify-center gap-2">
              <AwardIcon className="w-[13px] h-[13px]" />
              Faculty pick · Tailored for your profile
            </div>

            <div className="p-[30px_34px]">
              <div className="flex gap-4 items-start mb-4 flex-wrap">
                <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-br from-[#182348] to-[#0047CC] text-white flex items-center justify-center font-[900] text-[22px] shrink-0 border-2 border-[#D4A017]/60 shadow-lg">
                  {getInitials(mentor.name || 'MO')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 bg-[#FEF9E7] text-[#92400E] text-[10.5px] font-[900] uppercase px-2.5 py-1 rounded-md mb-1.5">
                    The instructor
                  </div>
                  <div className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-tight mb-1">
                    {mentor.name}
                  </div>
                  <div className="text-[13px] text-[#4A4A4A] font-[600] leading-snug mb-2">
                    {mentor.professionalTitle}
                  </div>
                  {mentor.credentials && mentor.credentials.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {mentor.credentials.map((cred: string, i: number) => (
                        <span key={i} className={`text-[11px] px-2.5 py-0.5 rounded-md font-[700] ${i === 0 ? 'bg-[#FEF9E7] text-[#92400E] font-[800]' : 'bg-[#F7F7F7] text-[#4A4A4A]'}`}>
                          {cred}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {mentor.programmeTitle && (
                <h3 className="text-[21px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-snug mb-2">
                  {mentor.programmeTitle}
                </h3>
              )}

              {mentor.programmeDescription && (
                <p className="text-[14px] text-[#4A4A4A] leading-[1.7] mb-4">
                  {mentor.programmeDescription}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {mentor.durationWeeks && (
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-[800] uppercase text-[#808080] mb-0.5">Duration</div>
                    <div className="text-[14.5px] font-[900] text-[#1A1A1A]">{mentor.durationWeeks} weeks</div>
                  </div>
                )}
                {mentor.format && (
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-[800] uppercase text-[#808080] mb-0.5">Format</div>
                    <div className="text-[14.5px] font-[900] text-[#1A1A1A] capitalize">{mentor.format}</div>
                  </div>
                )}
                {mentor.sessionMinutes && (
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-[800] uppercase text-[#808080] mb-0.5">Session</div>
                    <div className="text-[14.5px] font-[900] text-[#1A1A1A]">{mentor.sessionMinutes} mins</div>
                  </div>
                )}
                {mentor.priceAmount && (
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-[800] uppercase text-[#808080] mb-0.5">Fee</div>
                    <div className="text-[14.5px] font-[900] text-[#1A1A1A]">{mentor.priceCurrency || 'NGN'} {mentor.priceAmount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {mentor.fixesSummary && mentor.fixesSummary.length > 0 && (
                <div className="bg-gradient-to-b from-[#EEFBEE] to-[#F8FFF8] border border-[#85E585] rounded-xl p-4 mb-4">
                  <div className="text-[10.5px] font-[800] uppercase text-[#1D871D] mb-2 flex items-center gap-1.5">
                    <FileCheckIcon className="w-[13px] h-[13px]" />
                    What this directly closes for you
                  </div>
                  <ul className="space-y-1.5">
                    {mentor.fixesSummary.map((fix: string, i: number) => (
                      <li key={i} className="text-[12.5px] text-[#1A1A1A] font-[600] pl-4 relative leading-relaxed before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#2CA62C]">
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Future / Alternative Matched Roles Section */}
        {futureRoles.length > 0 && (
          <div className="bg-white rounded-[18px] p-[28px_30px] border border-[#E6E6E6] shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-1.5">
              Roles waiting on the other side
            </div>
            <h2 className="text-[19px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-1">
              {futureRoles.length} open {futureRoles.length === 1 ? 'role' : 'roles'} matching your current & projected profile
            </h2>
            <p className="text-[13.5px] text-[#808080] leading-[1.65] mb-4 max-w-[600px]">
              These employers are actively seeking talent with your profile. Tap any role to view details and apply.
            </p>

            <div className="space-y-3">
              {futureRoles.map((role) => {
                const daysRemaining = getDaysRemaining(role.closesAt, role.postedAt);
                const relativePosted = getRelativePostedTime(role.postedAt);
                const matchPercent = role.projectedMatchPercent || role.currentMatchPercent || 90;

                return (
                  <div
                    key={role.rolePostingId}
                    onClick={() => navigate(`/onboarding/talent/${role.roleLink || roleSlug}`)}
                    className="p-5 bg-white border border-[#E6E6E6] hover:border-[#0047CC] rounded-[18px] flex gap-4 items-center hover:bg-[#FAFCFF] transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="w-[46px] h-[46px] rounded-2xl bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white flex items-center justify-center font-[900] text-[14px] shrink-0 shadow-sm">
                      {getInitials(role.employerName || 'VA')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-[900] text-[#1A1A1A] group-hover:text-[#0047CC] transition-colors truncate tracking-[-0.2px] mb-0.5">
                        {role.roleTitle}
                      </div>
                      <div className="text-[13px] text-[#808080] font-[600] mb-2">
                        {role.employerName} · {role.location}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap text-[11.5px] text-[#64748B] font-[600]">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-[12.5px] h-[12.5px] text-[#808080]" />
                          {relativePosted}
                        </span>

                        {role.salaryLabel && (
                          <span className="flex items-center gap-1 font-[700] text-[#475569]">
                            <span className="text-[12px] font-[800]">₦</span>
                            {role.salaryLabel} / year
                          </span>
                        )}

                        {daysRemaining != null && (
                          <span className="inline-flex items-center gap-1 bg-[#EBF5FF] text-[#0047CC] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-[10.5px] font-[800] tracking-wide uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0047CC] animate-pulse" />
                            CLOSES IN {daysRemaining} DAYS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[15px] font-[900] text-[#0047CC] tracking-[-0.2px]">
                        {matchPercent}% match
                      </div>
                      <div className="text-[11px] text-[#808080] font-[600] mb-1">
                        after course
                      </div>
                      <div className="w-[70px] h-1.5 bg-[#F0F4FF] rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full"
                          style={{ width: `${matchPercent}%` }}
                        />
                      </div>
                    </div>

                    <ArrowRightIcon className="w-[16px] h-[16px] text-[#ADADAD] group-hover:text-[#0047CC] transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ledger Reassurance Section */}
        {ledgerNote && (
          <div className="bg-gradient-to-b from-[#EBF6FF] to-[#F8FBFF] border border-[#EBF6FF] rounded-xl p-5 flex gap-3.5 items-start">
            <div className="w-[42px] h-[42px] rounded-xl bg-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] shrink-0">
              <FileCheckIcon className="w-[20px] h-[20px]" />
            </div>
            <div>
              <div className="text-[14px] font-[800] text-[#182348] mb-1">{ledgerNote.title}</div>
              <div className="text-[13px] text-[#182348] leading-[1.65]">{ledgerNote.body}</div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-xl px-6 py-3 text-[13.5px] font-[700] hover:bg-[#F7F7F7] transition-all cursor-pointer shadow-sm"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default RoleAssessmentStageTwoOutcome;
