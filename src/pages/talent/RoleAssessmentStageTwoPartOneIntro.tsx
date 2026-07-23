import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import PartRail from '../../components/talent/PartRail';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { useStage2PillarIntroQuery } from '../../services/queries/assessments';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import { resolveGate1AssessmentId } from '../../config/gate1Api';

const HelpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const RoleAssessmentStageTwoPartOneIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const hasUnlockedPart4 = localStorage.getItem('vora_stage2_part4_unlocked') === 'true';
  const hasUnlockedPart3 = localStorage.getItem('vora_stage2_part3_unlocked') === 'true';
  const hasUnlockedPart2 = localStorage.getItem('vora_stage2_part2_unlocked') === 'true';

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const { data: pillarIntroData } = useStage2PillarIntroQuery(activeAssessmentId || '', 'knowledge');
  const pillarIntro = (pillarIntroData as any)?.data || pillarIntroData;

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const roleTitle = pillarIntro?.fingerprint?.roleTitle || roleData?.roleTitle || 'Senior Health Programme Officer';
  const companyName = roleData?.companyName || 'Reach Africa';
  const rawLevel = pillarIntro?.fingerprint?.level || roleData?.employmentLevel || 'Senior';

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
    toast.success('Starting Stage 2 Part 1...');
    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-1/interview-1`);
  };

  const isClinical = 
    roleTitle.toLowerCase().includes('health') ||
    roleTitle.toLowerCase().includes('programme officer') ||
    roleTitle.toLowerCase().includes('clinical') ||
    roleTitle.toLowerCase().includes('malaria') ||
    roleTitle.toLowerCase().includes('nutrition') ||
    roleTitle.toLowerCase().includes('medical') ||
    roleTitle.toLowerCase().includes('doctor') ||
    roleTitle.toLowerCase().includes('nurse');

  const levelLower = rawLevel.toLowerCase();
  const seniorityLabel = 
    levelLower.includes('intern') ? 'Intern' :
    levelLower.includes('entry') ? 'Entry level' :
    levelLower.includes('mid') ? 'Mid level' :
    levelLower.includes('senior') ? 'Senior' :
    levelLower.includes('principal') || levelLower.includes('staff') ? 'Principal/Staff' : 'Senior';

  const yearsSuffix = 
    levelLower.includes('intern') ? '· in training' :
    levelLower.includes('entry') ? '· 0 to 3 years' :
    levelLower.includes('mid') ? '· 3 to 6 years' :
    levelLower.includes('senior') ? '· 6 to 10 years' :
    levelLower.includes('principal') || levelLower.includes('staff') ? '· 10+ years' : '· 6 to 10 years';

  const questionCount = 
    levelLower.includes('intern') ? 19 :
    levelLower.includes('entry') ? 13 :
    levelLower.includes('mid') ? 13 :
    levelLower.includes('senior') ? 15 :
    levelLower.includes('principal') || levelLower.includes('staff') ? 15 : 15;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col animate-[fadeUp_0.5s_ease_both]">
      <style>{`
        .illo {
          width: 84px;
          height: 84px;
          border-radius: 24px;
          background: linear-gradient(135deg, #EBF6FF, #fff);
          border: 1.5px solid #EBF6FF;
          margin: 0 auto 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .illo::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 1.5px dashed #387DFF;
          border-radius: 28px;
          opacity: 0.4;
          animation: spin 18s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top Bar */}
      <AssessmentHeader
        middleContent={
          isClinical ? (
            <>
              Stage 2 <span className="text-[#ADADAD]">·</span> Professional dimension
            </>
          ) : (
            <>
              {roleTitle} <span className="text-[#ADADAD]">·</span> Part 1 <span className="text-[#ADADAD]">·</span> Knowledge <span className="text-[#ADADAD]">·</span> {seniorityLabel}
            </>
          )
        }
        rightContent={
          isClinical ? (
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Auto-saved
            </div>
          ) : (
            <div className="inline-flex items-center gap-[6px] bg-[#F7F7F7] border border-[#E6E6E6] rounded-[100px] p-[6px_12px] font-[800] text-[13px] text-[#4A4A4A]">
              <svg className="w-[13px] h-[13px] text-[#808080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 7 12 12 16 14"/>
              </svg>
              <span>12:00</span>
            </div>
          )
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={2} />

      {/* Part Rail */}
      {isClinical && <PartRail activePart={1} />}

      {/* Wrapping Content */}
      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] border border-[#E6E6E6] max-w-[580px] w-full p-[44px_44px_36px] text-center relative overflow-hidden">
          
          {isClinical ? (
            <>
              <div className="illo">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>

              <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
                About Part 1 of 4
              </div>
              <h1 className="text-[24px] font-[900] tracking-[-0.4px] text-[#1A1A1A] mb-[12px] leading-[1.25]">
                The knowledge you carry
              </h1>
              <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[24px]">
                Three short interviews on the foundational knowledge a {roleTitle} at {companyName} draws on every day. Each interview is timed individually and is shaped by your background.
              </p>

              {/* Why Section */}
              <div className="bg-[#EBF6FF] rounded-[12px] p-[14px_16px] text-left mb-[22px] flex gap-[11px]">
                <HelpIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" />
                <div className="text-[13px] text-[#182348] leading-[1.55]">
                  <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[3px]">
                    Why these three
                  </div>
                  These three knowledge bases are what {companyName} team leads need to draw on without hesitation: medication safety on outreach, reading public health figures correctly, and understanding the ethical guardrails programmes operate within.
                </div>
              </div>

              {/* What's Inside Section */}
              <div className="text-left bg-[#F7F7F7] border border-[#E6E6E6] rounded-[12px] p-[16px_18px] mb-[22px]">
                <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-[10px]">
                  What's inside Part 1
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-[10px] py-[7px] border-b border-[#E6E6E6] text-[13.5px] text-[#1A1A1A] font-[600]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">1</div>
                    <div className="flex-1">Pharmacology in the field</div>
                    <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
                  </div>
                  <div className="flex items-center gap-[10px] py-[7px] border-b border-[#E6E6E6] text-[13.5px] text-[#1A1A1A] font-[600]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">2</div>
                    <div className="flex-1">Biostatistics for programme decisions</div>
                    <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
                  </div>
                  <div className="flex items-center gap-[10px] py-[7px] text-[13.5px] text-[#1A1A1A] font-[600]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">3</div>
                    <div className="flex-1">Compliance and ethics in health programmes</div>
                    <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
                  </div>
                </div>
              </div>

              {/* Facts Grid */}
              <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
                <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
                  <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">~30</div>
                  <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">minutes</div>
                </div>
                <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
                  <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">3</div>
                  <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">timed interviews</div>
                </div>
                <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
                  <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">Pause</div>
                  <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">between any two</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBegin}
                className="bg-[#0047CC] text-white border-none rounded-[10px] p-[14px_28px] text-[14px] font-[700] cursor-pointer w-full flex items-center justify-center transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)] font-sans"
              >
                Begin Interview 1 of 3
              </button>
            </>
          ) : (
            <>
              {/* Dynamic Non-Clinical Reference HTML Layout */}
              <div className="flex justify-center mb-[18px]">
                <div className="bg-[#182348] text-white text-[11px] font-[800] tracking-[0.5px] uppercase p-[5px_12px] rounded-full inline-flex items-center gap-[7px]">
                  {seniorityLabel} <span className="text-[#387DFF] font-[700] normal-case tracking-normal">{yearsSuffix}</span>
                </div>
              </div>

              <div className="flex justify-center items-center gap-[7px] text-[#0047CC] font-[800] text-[11px] tracking-[0.7px] uppercase mb-[10px]">
                <svg className="w-[11px] h-[11px]" viewBox="0 0 12 12" fill="currentColor">
                  <circle cx="6" cy="6" r="5"/>
                </svg>
                Part 1 · Knowledge
              </div>

              <h1 className="text-[23px] font-[900] text-[#1A1A1A] tracking-[-0.4px] leading-[1.28] mb-[8px]">
                The knowledge you carry
              </h1>
              <p className="text-[14px] text-[#808080] leading-[1.6] mb-[18px]">
                The foundations your role draws on, asked as real situations. Mixed formats, one question per screen.
              </p>

              {/* Lock notice card (.antigame style) */}
              <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-[10px] p-[10px_14px] mb-[22px] flex items-center gap-[9px] text-left">
                <LockIcon className="w-[16px] h-[16px] text-[#808080] shrink-0" />
                <p className="text-[11.5px] text-[#808080] leading-[1.5] font-[600]">
                  This part has its own 12 minute timer that starts when you begin and keeps running across the questions. Leaving the tab will submit it. If you pause, the questions regenerate on return.
                </p>
              </div>

              {/* Count box */}
              <div className="bg-[#EBF6FF] rounded-[14px] p-[18px_20px] mb-[24px] flex gap-[14px] items-center text-left">
                <div className="text-[30px] font-[900] text-[#0047CC]">{questionCount}</div>
                <div className="text-[13.5px] text-[#182348] leading-[1.55] font-[600]">
                  questions, each on its own screen, mixed formats · about 12 minutes
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex gap-[9px] w-full">
                <button
                  onClick={() => navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2`)}
                  className="flex-1 bg-white text-[#4A4A4A] border border-[#E6E6E6] rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] transition-all font-sans"
                >
                  Stage overview
                </button>
                <button
                  onClick={handleBegin}
                  className="flex-1 bg-[#0047CC] text-white border-none rounded-[10px] p-[12px_20px] text-[13.5px] font-[700] cursor-pointer inline-flex items-center justify-center gap-[7px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] transition-all font-sans"
                >
                  Begin Part 1
                </button>
              </div>
            </>
          )}
          
          <p className="text-[12px] text-[#808080] mt-[14px] leading-[1.5] text-center">
            <strong>Heads up:</strong> the timer starts when you tap continue. Switching tabs without saving will auto-submit.
          </p>

        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageTwoPartOneIntro;
