import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useAuth } from '../../context/AuthContext';
import StageRail from '../../components/talent/StageRail';
import { useStartAssessmentScreenMutation } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId } from '../../utils/assessmentSession';

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

const RoleAssessmentStageTwoResults: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'Adaeze';
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';
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
          <svg className="w-[13px] h-[13px] text-[#2CA62C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved
        </div>
      </header>

      {/* Stage Rail */}
      <StageRail activeStage={3} greenDone={true} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F3D0F] via-[#1D871D] to-[#2CA62C] text-white p-[48px_32px_60px] relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[340px] h-[340px] rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-[-90px] left-[-70px] w-[240px] h-[240px] rounded-full bg-white/[0.03]" />
        <div className="max-w-[880px] mx-auto relative z-[2]">
          <div className="inline-flex items-center gap-[7px] bg-white/[0.16] border border-white/[0.24] rounded-full p-[6px_14px] backdrop-blur-[6px] mb-[16px]">
            <DocumentCheckIcon className="w-[13px] h-[13px]" />
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase">You passed Stage 2</span>
          </div>
          <h1 className="text-[34px] font-[900] tracking-[-0.5px] leading-[1.18] mb-[10px] max-w-[680px]">
            {firstName}, you&apos;re through to Stage 3
          </h1>
          <p className="text-[15.5px] text-white/86 leading-[1.65] max-w-[560px] mb-[26px]">
            Your professional dimension reads strong. The detail below is for you, so you can see what stood out and where there&apos;s room.
          </p>

          <div className="flex gap-[14px] flex-wrap items-stretch">
            <div className="bg-white/[0.18] border border-white/[0.3] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Composite score</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                87<small className="text-[14px] font-[700] text-white/70 ml-[3px]">/100</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Threshold to pass: 80</div>
            </div>

            <div className="bg-white/[0.1] border border-white/[0.18] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Part 1 · Knowledge</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                82<small className="text-[14px] font-[700] text-white/70 ml-[3px]">%</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Pharmacology · Biostats · Compliance</div>
            </div>

            <div className="bg-white/[0.1] border border-white/[0.18] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Part 2 · Reasoning</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                91<small className="text-[14px] font-[700] text-white/70 ml-[3px]">%</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Strongest of the three</div>
            </div>

            <div className="bg-white/[0.1] border border-white/[0.18] rounded-[14px] p-[18px_22px] backdrop-blur-[8px] min-w-[140px] flex-1 max-w-[180px]">
              <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-white/72 mb-[6px]">Part 3 · Simulation</div>
              <div className="text-[28px] font-[900] tracking-[-0.5px] leading-[1] tabular-nums">
                88<small className="text-[14px] font-[700] text-white/70 ml-[3px]">%</small>
              </div>
              <div className="text-[11.5px] text-white/75 font-[600] mt-[6px] leading-[1.4]">Written work scored well</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-[880px] w-full mx-auto mt-[-32px] px-[20px] sm:px-[28px] pb-[90px] relative z-10 flex-1">
        {/* Narrative Card */}
        <div className="bg-white rounded-[18px] p-[28px_32px] mb-[22px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6] relative before:content-[''] before:absolute before:top-0 before:left-[24px] before:right-[24px] before:height-[3px] before:h-[3px] before:bg-gradient-to-r before:from-[#2CA62C] before:to-[#85E585] before:rounded-[0_0_4px_4px]">
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[14px] flex items-center gap-[10px]">
            <FolderIcon className="w-[20px] h-[20px] text-[#2CA62C]" />
            What this stage showed us
          </h2>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.75] mb-[12px]">
            Your strongest reading came in Part 2, where you consistently picked the more reasoned option over the surface-level &quot;correct&quot; one. On the biostatistics and research appraisal interviews especially, you didn&apos;t fall for confident wrong answers, which is the trap most candidates miss at this seniority.
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.75] mb-[12px]">
            Part 1&apos;s knowledge interviews were solid. Pharmacology and compliance came back strong. Biostatistics had one or two reads we&apos;d push you on in conversation, but nothing that breaks the pattern.
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.75]">
            Part 3&apos;s written simulations showed something specific: <strong className="font-[800] text-[#1A1A1A]">your tone shifts appropriately between audiences.</strong> The community message read differently from the safeguarding referral, which read differently from the SBAR handover. That register flexibility is what Reach Africa told us they value.
          </p>
        </div>

        {/* Part breakdown */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Per-part breakdown</div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">Where each part landed</h2>

          <div className="part-row py-[14px] border-b border-[#F7F7F7] last:border-b-0">
            <div className="flex items-center justify-between gap-[10px] mb-[8px]">
              <div className="flex items-center gap-[10px] font-[800] text-[14px] text-[#1A1A1A]">
                <div className="w-[24px] h-[24px] rounded-[7px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center text-[11px] font-[900]">1</div>
                Part 1 · Knowledge
              </div>
              <div className="text-[18px] font-[900] text-[#1D871D] tracking-[-0.3px] tabular-nums">
                82<small className="text-[11.5px] font-[700] text-[#808080] ml-[2px]">%</small>
              </div>
            </div>
            <div className="h-[8px] bg-[#F7F7F7] rounded-full overflow-hidden mb-[8px]">
              <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '82%' }} />
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.55]">
              Pharmacology in the field, biostatistics for programme decisions, compliance and ethics. Three interviews, eighteen questions total.
            </p>
          </div>

          <div className="part-row py-[14px] border-b border-[#F7F7F7] last:border-b-0">
            <div className="flex items-center justify-between gap-[10px] mb-[8px]">
              <div className="flex items-center gap-[10px] font-[800] text-[14px] text-[#1A1A1A]">
                <div className="w-[24px] h-[24px] rounded-[7px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center text-[11px] font-[900]">2</div>
                Part 2 · Reasoning
              </div>
              <div className="text-[18px] font-[900] text-[#1D871D] tracking-[-0.3px] tabular-nums">
                91<small className="text-[11.5px] font-[700] text-[#808080] ml-[2px]">%</small>
              </div>
            </div>
            <div className="h-[8px] bg-[#F7F7F7] rounded-full overflow-hidden mb-[8px]">
              <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '91%' }} />
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.55]">
              Clinical scenarios, research appraisal, health data interpretation. Your strongest part of Stage 2.
            </p>
          </div>

          <div className="part-row py-[14px] last:pb-0">
            <div className="flex items-center justify-between gap-[10px] mb-[8px]">
              <div className="flex items-center gap-[10px] font-[800] text-[14px] text-[#1A1A1A]">
                <div className="w-[24px] h-[24px] rounded-[7px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center text-[11px] font-[900]">3</div>
                Part 3 · Simulation
              </div>
              <div className="text-[18px] font-[900] text-[#1D871D] tracking-[-0.3px] tabular-nums">
                88<small className="text-[11.5px] font-[700] text-[#808080] ml-[2px]">%</small>
              </div>
            </div>
            <div className="h-[8px] bg-[#F7F7F7] rounded-full overflow-hidden mb-[8px]">
              <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '88%' }} />
            </div>
            <p className="text-[12.5px] text-[#808080] leading-[1.55]">
              Four written simulations: handover, community message, telehealth reply, safeguarding referral.
            </p>
          </div>
        </div>

        {/* Traits breakdown */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_28px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Traits this stage measured</div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">How each professional trait scored</h2>
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Clinical judgement under pressure</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">93%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '93%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Top decile against senior officer benchmarks for this role.</div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Evidence appraisal</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">90%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '90%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Caught uncertainty in confidence intervals consistently.</div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Written clinical communication</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">88%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '88%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Tone matched audience across all four simulations.</div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Ethics and safeguarding instinct</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">86%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2CA62C] to-[#85E585] rounded-full transition-all duration-1000" style={{ width: '86%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Strong protective framing, clean separation of fact from interpretation.</div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Technical knowledge depth</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">82%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0047CC] to-[#387DFF] rounded-full transition-all duration-1000" style={{ width: '82%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Solid clinical knowledge with one or two gaps we&apos;d explore in conversation.</div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="flex justify-between items-center">
                <span className="text-[13.5px] font-[800] text-[#1A1A1A]">Quantitative reasoning</span>
                <span className="text-[13.5px] font-[900] text-[#1A1A1A] tabular-nums">78%</span>
              </div>
              <div className="h-[7px] bg-[#F7F7F7] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#D97706] to-[#FBBF24] rounded-full transition-all duration-1000" style={{ width: '78%' }} />
              </div>
              <div className="text-[11.5px] text-[#808080] font-[600] italic mt-[2px]">Holds up well. Slightly below the strongest area, but comfortably above pass.</div>
            </div>
          </div>
        </div>

        {/* Strengths card */}
        <div className="bg-gradient-to-b from-[#EEFBEE] to-[#F8FFF8] border-[1.5px] border-[#85E585] rounded-[18px] p-[26px_28px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#1D871D] mb-[8px]">Four things that came through clearly</div>
          <h2 className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px] leading-[1.3]">What stood out in your work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div className="bg-white border border-[#85E585] rounded-[12px] p-[14px_16px] flex gap-[11px] items-start">
              <svg className="w-[18px] h-[18px] text-[#2CA62C] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[3px]">You don&apos;t reach for the confident wrong answer</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">In appraisal and reasoning, you consistently chose nuance over neatness.</div>
              </div>
            </div>

            <div className="bg-white border border-[#85E585] rounded-[12px] p-[14px_16px] flex gap-[11px] items-start">
              <svg className="w-[18px] h-[18px] text-[#2CA62C] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[3px]">Your protective instinct on safeguarding is clean</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Facts first, interpretation second, escalation pathway clear.</div>
              </div>
            </div>

            <div className="bg-white border border-[#85E585] rounded-[12px] p-[14px_16px] flex gap-[11px] items-start">
              <svg className="w-[18px] h-[18px] text-[#2CA62C] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[3px]">You write differently for different audiences</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">The community message wasn&apos;t a translation of the SBAR. That&apos;s rare at this level.</div>
              </div>
            </div>

            <div className="bg-white border border-[#85E585] rounded-[12px] p-[14px_16px] flex gap-[11px] items-start">
              <svg className="w-[18px] h-[18px] text-[#2CA62C] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[3px]">You&apos;re honest about uncertainty</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Multiple times you favoured the option that admitted we don&apos;t yet know.</div>
              </div>
            </div>
          </div>
        </div>

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
