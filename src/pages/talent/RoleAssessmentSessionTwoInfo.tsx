import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import Button from '../../components/common/Button';
import { ArrowRightIcon } from '../../components/common/Icons';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import { isGate1ApiEnabled } from '../../config/gate1Api';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const QuestionCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke-linecap="round"/>
  </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const RoleAssessmentSessionTwoInfo: React.FC = () => {
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const sessionLabel = 'Your instincts';
  const screenCount = 5;
  const minuteRange = '12-18';

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug);
  const roleMeta = useMemo(() => {
    const apiData = roleResponse?.data || roleResponse;
    if (apiData && Object.keys(apiData).length > 0) {
      return mapApiResponseToRoleData(roleSlug, apiData);
    }
    return getRoleLandingForSlug(roleSlug);
  }, [roleResponse, roleSlug]);

  const companyName = roleMeta?.companyName ?? 'the employer';

  const handleStart = () => {
    if (isGate1ApiEnabled()) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`);
    } else {
      navigate(`/onboarding/talent/${roleSlug}/assessment/session-2/situational`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600] flex items-center gap-[8px] hidden sm:flex">
          Stage 1 · Getting to know you <span className="text-[#ADADAD]">·</span> Session 2 of 2
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Auto-saved
        </div>
      </header>

      {/* Chapter Rail */}
      <div className="bg-white border-b border-[#E6E6E6] px-[32px] py-[12px] flex items-center justify-center gap-[12px]">
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] flex items-center justify-center text-white">
            <DocumentCheckIcon className="w-[10px] h-[10px] stroke-[3.5]" />
          </div>
          <div className="text-[11.5px] font-[700] text-[#808080]">How you think</div>
        </div>
        <div className="w-[36px] h-[2px] bg-[#0047CC] rounded-[2px]"></div>
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)] flex items-center justify-center text-[9px] font-[800] text-white">2</div>
          <div className="text-[11.5px] font-[700] text-[#0047CC]">{sessionLabel}</div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex items-center justify-center p-[20px] sm:p-[40px_24px]">
        <div className="bg-white rounded-[24px] border-[1.5px] border-[#E6E6E6] shadow-sm max-w-[560px] w-full text-center animate-[fadeUp_0.5s_ease_both] relative overflow-hidden p-[32px_22px_28px] sm:p-[44px_44px_36px]">

          <div className="w-[84px] h-[84px] rounded-[24px] bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] mx-auto mb-[22px] flex items-center justify-center relative">
            <div className="absolute -inset-[4px] border-[1.5px] border-dashed border-[#387DFF] rounded-[28px] opacity-40 animate-[spin_18s_linear_infinite]"></div>
            <ShieldCheckIcon className="w-[38px] h-[38px] text-[#0047CC]" />
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            About this session
          </div>
          <h1 className="text-[24px] font-[900] tracking-[-0.4px] text-[#1A1A1A] mb-[12px] leading-[1.25]">
            Your instincts in real situations
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.65] mb-[24px]">
            Short workplace scenarios drawn from situations you might genuinely face. You&apos;ll tell us how you&apos;d approach each one. There are no trick questions and no single &quot;right&quot; answer we&apos;re looking for.
          </p>

          <div className="bg-[#EBF6FF] rounded-[12px] p-[14px_16px] text-left mb-[24px] flex gap-[11px]">
            <QuestionCircleIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-[1px]" />
            <div className="text-[13px] text-[#182348] leading-[1.55]">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[3px]">Why this matters</div>
              Real workplace scenarios for {companyName}. This session shows how you instinctively balance the things that often pull against each other on the job.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[10px] mb-[26px]">
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">{minuteRange}</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">minutes</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">{screenCount}</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">scenarios</div>
            </div>
            <div className="border border-[#E6E6E6] rounded-[10px] p-[11px_10px] text-center">
              <div className="text-[14px] font-[900] text-[#1A1A1A] leading-[1.2]">No prep</div>
              <div className="text-[10.5px] text-[#808080] font-[600] mt-[3px] leading-[1.3]">trust your read</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-[12px] justify-center items-stretch sm:items-center mt-[10px]">
            <Button 
              onClick={handleStart}
              pill={false}
              className="rounded-[10px] p-[14px_28px] transition-all bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)] w-full flex justify-center items-center"
            >
              <span className="text-[14px] font-[700]">
                Begin session
              </span>
            </Button>
          </div>

          <p className="text-[12px] text-[#808080] mt-[14px] leading-[1.5]">
            <strong className="text-[#1A1A1A] font-[700]">Tip:</strong> go with the answer that feels true to how you&apos;d actually behave, not the one that sounds most polished.
          </p>

        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RoleAssessmentSessionTwoInfo;
