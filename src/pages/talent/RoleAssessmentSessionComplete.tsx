import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { ArrowRightIcon } from '../../components/common/Icons';
// ... (rest of helper icons are untouched)
const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const BranchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const RoleAssessmentSessionComplete: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const handleContinue = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/session-2`);
  };

  const handleLater = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bobIn {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600] text-center hidden sm:block">
          Stage 1 · Getting to know you
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Auto-saved
        </div>
      </header>

      {/* Chapter Rail */}
      <div className="bg-white border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[12px] flex items-center justify-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] flex items-center justify-center">
            <DocumentCheckIcon className="w-[10px] h-[10px] text-white" />
          </div>
          <div className="text-[11.5px] font-[700] text-[#808080]">How you think</div>
        </div>
        <div className="w-[36px] h-[2px] bg-[#0047CC] rounded-[2px] hidden sm:block"></div>
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)] flex items-center justify-center text-[9px] font-[800] text-white">2</div>
          <div className="text-[11.5px] font-[700] text-[#0047CC]">Your instincts</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div 
          className="bg-white rounded-[24px] shadow-[0_12px_48px_rgba(10,17,114,0.1)] max-w-[580px] w-full p-[34px_22px_28px] sm:p-[48px_44px_36px] text-center relative overflow-hidden"
          style={{ animation: 'fadeUp 0.6s ease both' }}
        >

          <div 
            className="w-[96px] h-[96px] rounded-full mx-auto mb-[24px] flex items-center justify-center bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#387DFF] relative"
            style={{ animation: 'bobIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
          >
            <div className="absolute -inset-[6px] border-[2px] border-dashed border-[#387DFF] rounded-full opacity-45" style={{ animation: 'spin 22s linear infinite' }}></div>
            <DocumentCheckIcon className="w-[44px] h-[44px] text-[#0047CC] relative z-10" />
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            Session one complete
          </div>
          <h1 className="text-[24px] font-[900] tracking-[-0.4px] text-[#1A1A1A] mb-[12px] leading-[1.25]">
            That's the first half done
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[26px] max-w-[460px] mx-auto">
            Thanks for taking your time with that. Your responses are saved. Whenever you're ready, the second session is short scenarios where you tell us how you'd approach real situations.
          </p>

          <div className="bg-gradient-to-br from-[#EBF6FF] to-[#F8FBFF] border-[1.5px] border-[#EBF6FF] rounded-[14px] p-[20px_22px] mb-[24px] text-left relative overflow-hidden">
            <div className="absolute -top-[30px] -right-[30px] w-[110px] h-[110px] rounded-full bg-[#0047CC]/5"></div>
            <div className="flex items-center gap-[14px] relative z-10">
              <div className="w-[46px] h-[46px] rounded-[12px] bg-gradient-to-br from-[#0047CC] to-[#387DFF] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,71,204,0.2)]">
                <BranchIcon className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[3px]">
                  Up next · Session 2 of 2
                </div>
                <div className="text-[16px] font-[800] text-[#1A1A1A] mb-[4px] tracking-[-0.2px]">
                  Your instincts in real situations
                </div>
                <div className="text-[13px] text-[#808080] leading-[1.5]">
                  Five workplace scenarios. We're interested in how you'd handle them not whether you'd "pick the right answer".
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-[18px] flex-wrap justify-center p-[14px_0_22px] text-[12px] text-[#808080]">
            <div className="flex items-center gap-[6px]">
              <ClockIcon className="w-[14px] h-[14px] text-[#ADADAD]" />
              About 12-18 minutes
            </div>
            <div className="flex items-center gap-[6px]">
              <PauseIcon className="w-[14px] h-[14px] text-[#ADADAD]" />
              You can pause anytime
            </div>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full bg-[#0047CC] text-white border-none rounded-[10px] p-[14px_28px] text-[14px] font-[700] inline-flex items-center justify-center gap-[8px] transition-all duration-200 shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)]"
          >
            Session Two
          </Button>
          
          <button 
            onClick={handleLater}
            className="w-full mt-[6px] bg-transparent border-none text-[#808080] text-[13px] font-[600] cursor-pointer p-[12px_16px] rounded-[8px] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] transition-colors"
          >
            I'll come back later
          </button>

        </div>
      </main>

    </div>
  );
};

export default RoleAssessmentSessionComplete;
