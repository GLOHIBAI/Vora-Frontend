import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import PartRail from '../../components/talent/PartRail';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RoleAssessmentStageTwoPartOneComplete: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const firstName =
    (location.state as { firstName?: string } | null)?.firstName || user?.firstName || 'there';

  const handleBeginPart2 = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/part-2/intro`);
  };

  const handleContinueLater = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-[#EBF6FF] text-[#1A1A1A] font-sans flex flex-col">
      <style>{`
        .breath-anim {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, #EBF6FF 0%, rgba(56, 125, 255, 0.06) 60%, transparent 100%);
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .breath-anim::before {
          content: '';
          position: absolute;
          inset: 18px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 125, 255, 0.18) 0%, transparent 70%);
          animation: breathe 4s ease-in-out infinite reverse;
        }
        .heartbeat-icon {
          animation: heartbeat 1.6s infinite ease-in-out;
          transform-origin: center;
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.15); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Topbar */}
      <AssessmentHeader
        middleContent="Between Part 1 and Part 2"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <DocumentCheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            Saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={2} />

      {/* Part Rail */}
      <PartRail activePart={2} />

      {/* Content wrapper */}
      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] shadow-[0_12px_48px_rgba(10,17,114,0.1)] max-w-[560px] w-full p-[48px_44px_36px] text-center relative animate-[fadeUp_0.55s_ease_both]">
          
          <div className="breath-anim">
            <svg className="w-[54px] h-[54px] text-[#0047CC] relative z-[2] heartbeat-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 51 L27 51 L42 74 L58 29 L66 17 L72 41 L75 39 L78 41 L91 41" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            Part 1 of 4 complete
          </div>
          <h1 className="text-[26px] font-[900] text-[#1A1A1A] tracking-[-0.4px] leading-[1.25] mb-[14px]">
            Take a breath, {firstName}
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[26px]">
            You've just moved through the knowledge interviews. Stretch your shoulders. Get water. Whenever you're ready, Part 2 is here for you.
          </p>

          {/* Completion Details Card (Themed Blue, No Left Accent) */}
          <div className="bg-gradient-to-b from-[#EBF6FF] to-[#F8FBFF] border-[1.5px] border-[#387DFF]/20 rounded-[14px] p-[18px_20px] mb-[22px] text-left">
            <div className="flex items-center gap-[10px] mb-[10px]">
              <DocumentCheckIcon className="w-[20px] h-[20px] text-[#0047CC] shrink-0" />
              <div className="text-[14px] font-[800] text-[#0047CC]">
                What you just completed in Part 1
              </div>
            </div>
            <ul className="flex flex-col gap-[6px] pl-[30px] list-none">
              <li className="text-[13.5px] text-[#1A1A1A] font-[600] relative before:content-[''] before:absolute before:left-[-16px] before:top-[8px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                Pharmacology in the field
              </li>
              <li className="text-[13.5px] text-[#1A1A1A] font-[600] relative before:content-[''] before:absolute before:left-[-16px] before:top-[8px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                Biostatistics for programme decisions
              </li>
              <li className="text-[13.5px] text-[#1A1A1A] font-[600] relative before:content-[''] before:absolute before:left-[-16px] before:top-[8px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                Compliance and ethics in health programmes
              </li>
            </ul>
          </div>

          {/* Next Up Card */}
          <div className="bg-gradient-to-br from-[#EBF6FF] to-[#F8FBFF] border-[1.5px] border-[#EBF6FF] rounded-[14px] p-[18px_20px] mb-[24px] text-left">
            <div className="text-[10.5px] font-[800] letter-spacing-[0.7px] uppercase text-[#0047CC] mb-[5px]">
              Coming up · Part 2 of 4
            </div>
            <div className="text-[16px] font-[800] text-[#182348] mb-[4px] tracking-[-0.2px]">
              The expertise you bring
            </div>
            <div className="text-[13px] text-[#4A4A4A] leading-[1.55]">
              Domain expertise interviews. You'll be tested on your field-specific clinical knowledge, protocols, and programme operations. Around 20 to 30 minutes.
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleBeginPart2}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[14px_28px] text-[14px] font-[700] cursor-pointer w-full flex items-center justify-center gap-[8px] transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)] font-sans"
          >
            I'm ready, begin Part 2
          </button>

          {/* Secondary Exit Button */}
          <div>
            <button
              onClick={handleContinueLater}
              className="bg-transparent border-none color-[#808080] text-[#808080] text-[13px] font-[600] cursor-pointer p-[12px] mt-[6px] hover:text-[#1A1A1A] font-sans"
            >
              I'll continue later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageTwoPartOneComplete;
