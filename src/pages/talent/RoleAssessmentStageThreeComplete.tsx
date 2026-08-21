import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import { useAuth } from '../../context/AuthContext';

import { useGetPublicRoleQuery } from '../../services/queries/talent';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RoleAssessmentStageThreeComplete: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const companyName = roleData?.companyName || 'the hiring team';

  const rawFirstName = user?.firstName?.trim() || '';
  const firstName = rawFirstName && !rawFirstName.includes('-') && !/\d/.test(rawFirstName)
    ? rawFirstName
    : '';

  const handleSeeProgress = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/stage-4/decision`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-[#EBF6FF] text-[#1A1A1A] font-sans flex flex-col">
      {/* Topbar Header */}
      <AssessmentHeader
        middleContent="Stage 3 · Complete"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            All answers saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={4} greenDone={false} />

      {/* Wrapping Container */}
      <div className="flex-1 flex items-center justify-center p-[40px_24px]">
        <div className="bg-white rounded-[24px] shadow-[0_12px_48px_rgba(10,17,114,0.1)] max-w-[580px] w-full p-[48px_44px_36px] text-center relative overflow-hidden animate-[fadeUp_0.55s_ease_both]">
          
          {/* Animated checkmark circle */}
          <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#0047CC] to-[#387DFF] mx-auto mb-[24px] flex items-center justify-center text-white relative shadow-[0_12px_32px_rgba(0,71,204,0.32)]">
            {/* Pulsing glow ring in blue */}
            <div className="absolute inset-[-10px] rounded-full bg-[radial-gradient(circle,rgba(0,71,204,0.16)_0%,transparent_70%)] animate-pulse" />
            <CheckIcon className="w-[46px] h-[46px] relative z-10" />
          </div>

          <div className="text-[11px] font-[800] text-[#0047CC] tracking-[1.4px] uppercase mb-[10px]">
            Stage 3 complete
          </div>
          <h1 className="text-[28px] font-[900] text-[#1A1A1A] tracking-[-0.4px] leading-[1.22] mb-[14px]">
            {firstName ? `Beautifully done, ${firstName}` : 'Beautifully done'}
          </h1>
          <p className="text-[15px] text-[#4A4A4A] leading-[1.7] mb-[26px]">
            All video answers are in. The handoff to {companyName} is happening now. From here it&apos;s their decision and their timeline.
          </p>

          {/* Submitted Summary box */}
          <div className="bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[14px] p-[18px_20px] mb-[22px] text-left">
            <div className="text-[13px] font-[800] text-[#0047CC] mb-[10px] flex items-center gap-[8px]">
              <CheckIcon className="w-[16px] h-[16px] text-[#0047CC]" />
              What we just submitted to {companyName}
            </div>
            <ul className="list-none flex flex-col gap-[6px] pl-[24px]">
              {[
                'Your video answers, in the order recorded',
                'Your Stage 1 profile and Stage 2 composite',
                'Your candidate profile, written prompts and references',
                'A short trait summary the hiring team will read alongside'
              ].map((item, idx) => (
                <li key={idx} className="text-[13px] text-[#1A1A1A] font-[600] relative leading-[1.55] before:content-[''] before:absolute before:left-[-14px] before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#0047CC]">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Next steps box */}
          <div className="bg-[#FAFCFF] border border-[#EBF6FF] rounded-[14px] p-[18px_20px] mb-[24px] text-left">
            <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[5px]">
              What happens next
            </div>
            <div className="text-[15px] font-[800] text-[#182348] mb-[5px] tracking-[-0.1px]">
              Stage 4 · Final decision
            </div>
            <div className="text-[13px] text-[#4A4A4A] leading-[1.55]">
              {companyName}&apos;s hiring team typically responds within <strong>a couple of hours</strong>. You&apos;ll see the outcome here, and you&apos;ll get an email the moment it&apos;s in. You don&apos;t need to wait on this screen.
            </div>
          </div>

          {/* Footer buttons */}
          <button
            onClick={handleSeeProgress}
            className="w-full bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[10px] py-[14px] px-[28px] text-[14px] font-bold cursor-pointer inline-flex items-center justify-center gap-[8px] transition-all shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:translate-y-[-1px] hover:shadow-[0_6px_18px_rgba(0,71,204,0.36)]"
          >
            See where things stand
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
          
          <div>
            <button
              onClick={handleBackToDashboard}
              className="bg-none border-none text-[#808080] hover:text-[#1A1A1A] text-[13px] font-[600] cursor-pointer py-[12px] mt-[6px]"
            >
              Back to dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageThreeComplete;
