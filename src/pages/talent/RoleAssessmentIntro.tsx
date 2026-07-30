import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import VoraLogo from '../../components/common/VoraLogo';
import { useGetPublicRoleQuery, useGetPreAssessmentReadinessQuery } from '../../services/queries/talent';
import { readStoredRolePostingId, extractRolePostingIdFromPublicRole } from '../../utils/rolePostingId';
import FullPageSpinner from '../../components/common/FullPageSpinner';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M13 8H3M7 4L3 8l4 4"/>
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

const InfoCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const DevicesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const RoleAssessmentIntro: React.FC = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();

  const { data: roleResponse, isLoading: isRoleLoading } = useGetPublicRoleQuery(roleSlug || '');
  
  const rolePostingId = useMemo(() => {
    return readStoredRolePostingId(roleSlug || '') ||
      extractRolePostingIdFromPublicRole(roleResponse) ||
      '';
  }, [roleSlug, roleResponse]);

  const { data: readinessResponse, isLoading: isReadinessLoading } = useGetPreAssessmentReadinessQuery(roleSlug || '', rolePostingId);
  const readiness = readinessResponse?.data || readinessResponse;

  useEffect(() => {
    if (!isRoleLoading && !isReadinessLoading && readinessResponse) {
      const isPreAssessmentRequired = readiness?.preAssessmentRequired === true;
      const isPreAssessmentComplete = 
        readiness?.checks?.preAssessmentComplete === true || 
        readiness?.preAssessmentComplete === true;

      if (isPreAssessmentRequired && !isPreAssessmentComplete) {
        navigate(`/onboarding/talent/${roleSlug}/interview/asks`, { replace: true });
      }
    }
  }, [isRoleLoading, isReadinessLoading, readinessResponse, navigate, roleSlug, readiness]);

  const handleBack = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  const handleStart = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/session-1`);
  };

  if (isRoleLoading || isReadinessLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <button 
          onClick={handleBack}
          className="hidden sm:flex items-center gap-[6px] text-[#808080] bg-transparent border-none cursor-pointer font-sans text-[13px] font-[600] p-[6px_10px] rounded-[8px] transition-all hover:bg-[#F7F7F7] hover:text-[#1A1A1A]"
        >
          <ArrowLeftIcon className="w-[14px] h-[14px]" />
          <span>Journey overview</span>
        </button>

        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          <span className="hidden sm:inline">Progress auto-saved</span>
          <span className="sm:hidden">Saved</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-[20px] sm:p-[40px_24px]">
        <div className="max-w-[680px] w-full mb-[16px] sm:hidden">
          <button 
            onClick={handleBack}
            className="flex items-center gap-[6px] text-[#808080] bg-transparent border-none cursor-pointer font-sans text-[13px] font-[600] p-0 transition-all hover:text-[#1A1A1A]"
          >
            <ArrowLeftIcon className="w-[14px] h-[14px]" />
            <span>Journey overview</span>
          </button>
        </div>
        <div className="bg-white rounded-[24px] shadow-[0_12px_48px_rgba(10,17,114,0.1),0_2px_8px_rgba(0,0,0,0.04)] max-w-[680px] w-full overflow-hidden animate-[fadeUp_0.6s_ease_both]">
          <div className="bg-gradient-to-br from-[#182348] to-[#0047CC] p-[40px_44px] text-white relative overflow-hidden sm:px-[44px] px-[24px]">
            <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full bg-white/5" />
            <div className="absolute bottom-[-80px] right-[80px] w-[160px] h-[160px] rounded-full bg-[#387DFF]/20" />
            
            <div className="relative z-[2]">
              <div className="inline-flex items-center gap-[7px] bg-white/10 border border-white/20 rounded-full px-[12px] py-[5px] mb-[18px] backdrop-blur-[6px]">
                <span className="text-[11px] font-[600] tracking-[0.6px] text-white uppercase">STAGE 1 OF 2</span>
              </div>
              <div className="text-[12px] font-[500] text-white/70 tracking-[1px] uppercase mb-[8px]">
                Starting here
              </div>
              <div className="text-[24px] sm:text-[28px] font-[500] tracking-[-0.4px] leading-[1.2] mb-[12px]">
                Getting to know you
              </div>
              <div className="text-[14.5px] leading-[1.65] text-white/90 max-w-[480px]">
                Before we get into the work itself, we'd like to understand how you think and what drives you. Two relaxed sessions, no preparation needed.
              </div>
            </div>
          </div>

          <div className="p-[32px_44px_36px] sm:px-[44px] px-[24px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mb-[28px]">
              <div className="border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[18px] bg-[#F7F7F7]">
                <div className="flex items-center gap-[8px] mb-[10px]">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[11px] font-[800]">1</div>
                  <div className="text-[11px] font-[800] text-[#1A1A1A] tracking-[0.5px] uppercase">First session</div>
                </div>
                <div className="text-[15px] font-[600] text-[#1A1A1A] mb-[4px]">
                  How you think & what you value
                </div>
                <div className="text-[12.5px] text-[#808080] leading-[1.55]">
                  A short series exploring your working style, values, and reasoning approach. Most people finish in 15-25 minutes.
                </div>
              </div>

              <div className="border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[18px] bg-[#F7F7F7]">
                <div className="flex items-center gap-[8px] mb-[10px]">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[11px] font-[800]">2</div>
                  <div className="text-[11px] font-[800] text-[#1A1A1A] tracking-[0.5px] uppercase">Second session</div>
                </div>
                <div className="text-[15px] font-[600] text-[#1A1A1A] mb-[4px]">
                  Your instincts in real situations
                </div>
                <div className="text-[12.5px] text-[#808080] leading-[1.55]">
                  Workplace scenarios where you tell us how you'd approach things. There are no trick questions.
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#0047CC]/30 rounded-[8px] p-[14px_16px] mb-[28px] flex gap-[11px] items-start">
              <InfoCircleIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" />
              <p className="text-[13px] text-[#182348] leading-[1.55]">
                <strong className="font-[800] text-[#1A1A1A]">One quiet sitting works best for this stage.</strong> If you need to pause, your progress saves automatically and your seat is held for 48 hours.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-[12px] justify-center items-stretch sm:items-center">
              <button 
                onClick={handleBack}
                className="bg-transparent border-[1.5px] border-[#E6E6E6] text-[#808080] text-[13px] font-[600] cursor-pointer font-sans p-[14px_20px] rounded-xl transition-all hover:bg-[#F7F7F7] hover:text-[#1A1A1A] w-full sm:w-auto text-center"
              >
                Not now
              </button>
              <button 
                onClick={handleStart}
                className="bg-[#0047CC] text-white border-none rounded-xl p-[14px_28px] text-[14px] font-[700] cursor-pointer font-sans flex items-center justify-center gap-[8px] transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] flex-grow sm:flex-initial w-full sm:w-auto hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)]"
              >
                I'm ready, let's begin
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[18px] pt-[18px] border-t border-[#F7F7F7] mt-[22px] text-[12px] text-[#808080]">
              <div className="flex items-center gap-[6px]">
                <ClockIcon className="w-[14px] h-[14px] text-[#ADADAD] shrink-0" />
                Estimated 25-40 minutes
              </div>
              <div className="flex items-center gap-[6px]">
                <LockIcon className="w-[14px] h-[14px] text-[#ADADAD] shrink-0" />
                Private and confidential
              </div>
              <div className="flex items-center gap-[6px]">
                <DevicesIcon className="w-[14px] h-[14px] text-[#ADADAD] shrink-0" />
                Resume from any device
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RoleAssessmentIntro;
