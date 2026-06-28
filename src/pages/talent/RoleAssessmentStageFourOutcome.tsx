import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RoleAssessmentStageFourOutcome: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  
  const firstName = user?.firstName || 'Adaeze';

  React.useEffect(() => {
    localStorage.setItem('vora_stage4_completed', 'true');
    localStorage.setItem('vora_hired', 'true');
    if (roleSlug) {
      localStorage.setItem('active_assessment_role_slug', roleSlug);
    }
  }, [roleSlug]);

  // Load public role data
  const { data: response } = useGetPublicRoleQuery(roleSlug || '');
  const appliedRole = useMemo(() => {
    if (!roleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(roleSlug);
    }
    return mapApiResponseToRoleData(roleSlug, apiData);
  }, [response, roleSlug]);

  const roleTitle = appliedRole?.roleTitle || 'Senior Health Programme Officer';
  const companyName = appliedRole?.companyName || 'Reach Africa';
  const location = appliedRole?.companyLocation || 'Lagos';
  const companyInitials = appliedRole?.companyInitials || 'RA';

  const handleBackToDashboard = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
  };

  const handleAcceptOffer = () => {
    toast.success('Congratulations! Proceeding to the formal offer letter.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none overflow-x-hidden">
      
      {/* Confetti Injection Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .confetti-host {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
          }
          .confetti {
            position: absolute;
            width: 10px;
            height: 14px;
            opacity: 0;
            animation: fall 4s linear infinite;
          }
          .confetti:nth-child(1) { left: 8%; background: #0047CC; animation-delay: 0s; transform: rotate(15deg); }
          .confetti:nth-child(2) { left: 18%; background: #0047CC; animation-delay: .5s; transform: rotate(-20deg); }
          .confetti:nth-child(3) { left: 28%; background: #0047CC; animation-delay: 1s; transform: rotate(45deg); }
          .confetti:nth-child(4) { left: 38%; background: #0047CC; animation-delay: .2s; transform: rotate(-10deg); }
          .confetti:nth-child(5) { left: 48%; background: #387DFF; animation-delay: 1.5s; transform: rotate(30deg); }
          .confetti:nth-child(6) { left: 58%; background: #0047CC; animation-delay: .8s; transform: rotate(-35deg); }
          .confetti:nth-child(7) { left: 68%; background: #0047CC; animation-delay: 1.3s; transform: rotate(20deg); }
          .confetti:nth-child(8) { left: 78%; background: #0047CC; animation-delay: .3s; transform: rotate(-15deg); }
          .confetti:nth-child(9) { left: 88%; background: #0047CC; animation-delay: 1.8s; transform: rotate(40deg); }
          .confetti:nth-child(10) { left: 14%; background: #387DFF; animation-delay: 2.2s; transform: rotate(-25deg); }
          .confetti:nth-child(11) { left: 62%; background: #0047CC; animation-delay: 2.5s; transform: rotate(15deg); }
          .confetti:nth-child(12) { left: 34%; background: #0047CC; animation-delay: 2.8s; transform: rotate(-40deg); }
          
          @keyframes fall {
            0% { opacity: 0; transform: translateY(-30vh) rotate(0deg); }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
          }

          @keyframes popIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }

          .animate-popIn {
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .hired-badge-spin::before {
            content: '';
            position: absolute;
            inset: -12px;
            border-radius: 50%;
            border: 1.5px dashed rgba(255, 255, 255, 0.3);
            animation: spin 14s linear infinite;
          }
        `
      }} />

      {/* Confetti Elements */}
      <div className="confetti-host">
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
        <div className="confetti" />
      </div>

      {/* Topbar Header */}
      <AssessmentHeader
        middleContent="Stage 4 · Outcome"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#0047CC] font-[700]">
            <CheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            Process complete
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={5} />

      {/* Hero section */}
      <section className="bg-gradient-to-br from-[#182348] via-[#344DA1] to-[#0047CC] text-white p-[60px_32px_70px] relative overflow-hidden text-center z-10">
        <div className="absolute top-[-120px] right-[-80px] w-[380px] h-[380px] rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-70px] w-[280px] h-[280px] rounded-full bg-white/[0.04] pointer-events-none" />
        
        <div className="max-w-[780px] mx-auto relative z-10">
          
          {/* Hired check badge */}
          <div className="w-[120px] h-[120px] rounded-full bg-white/[0.18] border-[2.5px] border-white/[0.32] mx-auto mb-[26px] flex items-center justify-center text-white backdrop-blur-[8px] relative animate-popIn hired-badge-spin">
            <CheckIcon className="w-[60px] h-[60px]" />
          </div>

          <div className="inline-flex items-center gap-[7px] bg-white/[0.16] border border-white/[0.26] rounded-full p-[6px_14px] backdrop-blur-[6px] mb-[14px]">
            <CheckIcon className="w-[13px] h-[13px]" />
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase">
              {companyName} has made their decision
            </span>
          </div>

          <h1 className="text-[38px] font-[900] tracking-[-0.6px] leading-[1.15] mb-[12px] max-w-[560px] mx-auto">
            Welcome to {companyName}, <span className="text-white/95">{firstName}</span>
          </h1>
          <p className="text-[16px] text-white/90 leading-[1.7] max-w-[520px] mx-auto mb-[22px]">
            You&apos;ve been offered the role. The hiring team was unanimous. Below is everything that happens next.
          </p>

          <div className="inline-flex items-center gap-[10px] bg-white/[0.14] border border-white/[0.24] rounded-[14px] p-[12px_20px] backdrop-blur-[8px] text-left">
            <div className="w-[32px] h-[32px] rounded-[8px] bg-white/[0.18] border border-white/[0.28] flex items-center justify-center font-[900] text-[11px] tracking-[0.5px] shrink-0">
              {companyInitials}
            </div>
            <div>
              <div className="text-[13.5px] font-[800] leading-tight">{roleTitle}</div>
              <div className="text-[11.5px] font-[600] text-white/[0.78] mt-[2px]">
                {location}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main container */}
      <main className="max-w-[780px] w-full mx-auto mt-[-30px] px-4 pb-[90px] relative z-10 flex-1">
        
        {/* Note letter from Country Director */}
        <div className="bg-white rounded-[18px] p-[34px_38px] mb-[22px] shadow-[0_16px_48px_rgba(10,17,114,0.1)] border border-[#E6E6E6] relative overflow-hidden">
          
          <div className="flex justify-between items-start gap-[16px] mb-[20px] padding-bottom-[20px] border-b border-[#F7F7F7] pb-[20px] flex-wrap">
            <div className="flex gap-[12px] items-center">
              <div className="w-[44px] h-[44px] rounded-[11px] bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white flex items-center justify-center font-[900] text-[14px] tracking-[0.5px] shrink-0">
                {companyInitials}
              </div>
              <div>
                <div className="text-[14.5px] font-[900] text-[#1A1A1A] leading-[1.2]">Dr Adesuwa Okolo</div>
                <div className="text-[11.5px] text-[#808080] font-[600] mt-[2px]">Country Director · {companyName}</div>
              </div>
            </div>
            <div className="text-[11.5px] text-[#ADADAD] font-[600] text-right leading-[1.4]">
              Today · 16:42<br />Personal message
            </div>
          </div>

          <h2 className="text-[20px] font-[900] text-[#1A1A1A] tracking-[-0.3px] mb-[16px] leading-[1.3]">
            A personal note from our Country Director
          </h2>

          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
            Dear {firstName},
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
            We&apos;ve come to a unanimous decision: <strong>we&apos;d like you to join {companyName} as our next {roleTitle} in {location}.</strong>
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
            Your Stage 2 reasoning work was the strongest we&apos;ve reviewed for this role this cycle. What stayed with the panel, though, was the way you spoke about the programme that didn&apos;t go to plan in Stage 3. The honesty, the structure of your reflection, and the fact that you walked through the community elders yourself rather than sending a junior. That&apos;s the kind of leadership we need on the ground.
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
            Practical next steps are below. Our HR team will be in touch within 24 hours with the formal offer letter. Take your time with it.
          </p>
          <p className="text-[14.5px] text-[#4A4A4A] leading-[1.85] mb-[14px]">
            I wanted to be the one to write this. I&apos;m genuinely looking forward to working with you.
          </p>

          <div className="letter-sign mt-[22px] pt-[18px]">
            <div className="sig-name text-[14.5px] font-[900] text-[#1A1A1A] mb-[2px]">Dr Adesuwa Okolo</div>
            <div className="sig-role text-[12px] text-[#808080] font-[600]">Country Director, {companyName} Nigeria</div>
          </div>
        </div>

        {/* Offer Summary terms */}
        <div className="p-[26px_30px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Headline offer terms</div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px] leading-[1.3]">What&apos;s on the table</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div className="bg-gradient-to-br from-[#EBF6FF] to-white border border-[#0047CC] rounded-[12px] p-4">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[5px]">Role</div>
              <div className="text-[15px] font-[900] text-[#1A1A1A] tracking-[-0.1px] leading-[1.35]">{roleTitle}</div>
              <div className="text-[11.5px] text-[#808080] font-[600] mt-[3px]">{location}</div>
            </div>

            <div className="bg-gradient-to-br from-[#EBF6FF] to-white border border-[#0047CC] rounded-[12px] p-4">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[5px]">Base compensation</div>
              <div className="text-[15px] font-[900] text-[#1A1A1A] tracking-[-0.1px] leading-[1.35]">₦18,500,000 / year</div>
              <div className="text-[11.5px] text-[#808080] font-[600] mt-[3px]">Reviewed annually, NGO market rate band B</div>
            </div>

            <div className="bg-gradient-to-br from-[#EBF6FF] to-white border border-[#0047CC] rounded-[12px] p-4">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[5px]">Start date</div>
              <div className="text-[15px] font-[900] text-[#1A1A1A] tracking-[-0.1px] leading-[1.35]">Negotiable</div>
              <div className="text-[11.5px] text-[#808080] font-[600] mt-[3px]">Most candidates start 4 to 6 weeks out</div>
            </div>

            <div className="bg-gradient-to-br from-[#EBF6FF] to-white border border-[#0047CC] rounded-[12px] p-4">
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[5px]">Reporting line</div>
              <div className="text-[15px] font-[900] text-[#1A1A1A] tracking-[-0.1px] leading-[1.35]">Mrs Chinwe Nwosu</div>
              <div className="text-[11.5px] text-[#808080] font-[600] mt-[3px]">Head of Maternal Programmes</div>
            </div>
          </div>
        </div>

        {/* Next Steps card */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[26px_30px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">What happens next</div>
          <h2 className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">From here, in plain steps</h2>
          
          <div className="flex flex-col gap-0">
            <div className="flex gap-[14px] items-start py-[14px] border-b border-[#F7F7F7] last:border-b-0 pt-0">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#EBF6FF] text-[#0047CC] font-[900] text-[13px] flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[3px]">Formal offer letter to your email</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Within 24 hours from Yemi Adeyemi, HR Director. Includes the full T&amp;C, benefits package, and signing details.</div>
              </div>
            </div>

            <div className="flex gap-[14px] items-start py-[14px] border-b border-[#F7F7F7] last:border-b-0">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#EBF6FF] text-[#0047CC] font-[900] text-[13px] flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[3px]">Reference checks with the two people you nominated</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">You&apos;ll be told before either is contacted. Standard window is 5 working days.</div>
              </div>
            </div>

            <div className="flex gap-[14px] items-start py-[14px] border-b border-[#F7F7F7] last:border-b-0">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#EBF6FF] text-[#0047CC] font-[900] text-[13px] flex items-center justify-center shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[3px]">Short conversation with your line manager</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">An informal 30-minute call with Mrs Nwosu, not part of the interview. About the work itself and what your first 90 days might look like.</div>
              </div>
            </div>

            <div className="flex gap-[14px] items-start py-[14px] border-b border-[#F7F7F7] last:border-b-0 pb-0">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#EBF6FF] text-[#0047CC] font-[900] text-[13px] flex items-center justify-center shrink-0">
                4
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-[800] text-[#1A1A1A] mb-[3px]">You sign or negotiate</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Once signed, you&apos;re officially on the team. We send a welcome pack, calendar invites, and your first-week schedule.</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-[10px] flex-wrap justify-center mt-[8px]">
          <button 
            onClick={handleBackToDashboard}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[13px_22px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7]"
          >
            Back to dashboard
          </button>
          
          <button 
            onClick={handleAcceptOffer}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[14px_28px] text-[14px] font-[800] cursor-pointer shadow-[0_6px_18px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] transition-all hover:translate-y-[-1px] hover:shadow-[0_8px_22px_rgba(0,71,204,0.36)]"
          >
            Accept and proceed to offer letter
          </button>
        </div>

      </main>

    </div>
  );
};

export default RoleAssessmentStageFourOutcome;
