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

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke-linecap="round"/>
  </svg>
);

const RoleAssessmentStageTwoPartThreeIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const activeAssessmentId = resolveGate1AssessmentId() || getActiveAssessmentId();
  const { data: pillarIntroData, isLoading } = useStage2PillarIntroQuery(activeAssessmentId || '', 'reasoning');
  const _pillarIntro = (pillarIntroData as any)?.data || pillarIntroData;

  const handleStartSimulation = () => {
    toast.success('Simulation part starting...');
    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-2/part-4/simulation-1`);
  };

  if (activeAssessmentId && (isLoading || !pillarIntroData)) {
    return <FullPageSpinner message="Preparing pillar intro..." />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
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
        middleContent="Stage 2 · Professional dimension"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <DocumentCheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            Auto-saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={2} />

      {/* Part Rail */}
      <PartRail activePart={4} />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] border border-[#E6E6E6] max-w-[580px] w-full p-[44px_44px_36px] text-center animate-[fadeUp_0.5s_ease_both] relative overflow-hidden">
          
          <div className="illo">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            About Part 4 of 4
          </div>
          <h1 className="text-[24px] font-[900] tracking-[-0.4px] text-[#1A1A1A] mb-[12px] leading-[1.25]">
            How you perform in practice
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[24px]">
            The last and most applied part of Stage 2. You\'ll write the things a senior officer actually writes during a normal week: a clinical handover, a community message, a remote consultation reply and a safeguarding referral.
          </p>

          {/* Why different card (No left border) */}
          <div className="bg-[#EBF6FF] rounded-[12px] p-[14px_16px] text-left mb-[22px] flex gap-[11px]">
            <InfoIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div className="text-[13px] text-[#182348] leading-[1.55]">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[3px]">
                What makes this different
              </div>
              These aren\'t multiple choice. You\'ll write in your own words. The aim is to see how you actually communicate when there\'s a real person on the other side.
            </div>
          </div>

          {/* Interviews list */}
          <div className="text-left bg-[#F7F7F7] border border-[#E6E6E6] rounded-[12px] p-[16px_18px] mb-[22px]">
            <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#808080] mb-[10px]">
              What\'s inside Part 4
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-[10px] py-[7px] border-b border-[#E6E6E6] text-[13.5px] text-[#1A1A1A] font-[600]">
                <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">1</div>
                <div className="flex-1">Clinical handover documentation</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
              </div>
              <div className="flex items-center gap-[10px] py-[7px] border-b border-[#E6E6E6] text-[13.5px] text-[#1A1A1A] font-[600]">
                <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">2</div>
                <div className="flex-1">Community health message drafting</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">8 min</div>
              </div>
              <div className="flex items-center gap-[10px] py-[7px] border-b border-[#E6E6E6] text-[13.5px] text-[#1A1A1A] font-[600]">
                <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">3</div>
                <div className="flex-1">Telehealth consultation response</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
              </div>
              <div className="flex items-center gap-[10px] py-[7px] text-[13.5px] text-[#1A1A1A] font-[600]">
                <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[9px] font-[900] shrink-0">4</div>
                <div className="flex-1">Safeguarding referral write-up</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">10 min</div>
              </div>
            </div>
          </div>

          {/* Facts grid */}
          <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">~38</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">minutes</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">4</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">written simulations</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center bg-white">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">Free</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">prose responses</div>
            </div>
          </div>

          <button
            onClick={handleStartSimulation}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[14px_28px] text-[14px] font-[700] cursor-pointer w-full flex items-center justify-center gap-[8px] transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)] font-sans"
          >
            Begin Simulation 1 of 4
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
          
          <p className="text-[12px] text-[#808080] mt-[14px] leading-[1.5]">
            <strong>Heads up:</strong> each simulation is timed. Switching tabs without saving will auto-submit.
          </p>

        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageTwoPartThreeIntro;
