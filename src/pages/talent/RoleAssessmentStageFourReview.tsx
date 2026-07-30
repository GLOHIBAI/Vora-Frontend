import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const RoleAssessmentStageFourReview: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  // State: timer started mins ago
  const [startedMins, setStartedMins] = useState<number>(38);
  const [showDemoOutcomeModal, setShowDemoOutcomeModal] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartedMins(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBackToDashboard = () => {
    navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
      
      {/* Topbar Header */}
      <AssessmentHeader
        middleContent="Stage 4 · Reach Africa is reviewing"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            All saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={4} greenDone={false} />

      {/* Hero section */}
      <section className="bg-gradient-to-br from-[#182348] via-[#344DA1] to-[#0047CC] text-white p-[50px_32px_58px] relative overflow-hidden text-center">
        <div className="absolute top-[-100px] right-[-80px] w-[340px] h-[340px] rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-[-90px] left-[-70px] w-[240px] h-[240px] rounded-full bg-white/[0.03]" />
        
        <div className="max-w-[820px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-[8px] bg-white/[0.14] border border-white/[0.24] rounded-full p-[7px_16px] backdrop-blur-[6px] mb-[20px]">
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase">Hiring team is reviewing right now</span>
          </div>
          
          <div className="text-[12px] font-[800] tracking-[1.4px] uppercase text-white/72 mb-[8px]">
            Stage 4 of 4 · Final decision
          </div>
          <h1 className="text-[32px] font-[900] tracking-[-0.5px] leading-[1.2] mb-[14px] max-w-[640px] mx-auto">
            Reach Africa is reading your full file
          </h1>
          <p className="text-[15.5px] text-white/85 leading-[1.7] max-w-[540px] mx-auto mb-[28px]">
            Your work is in their hands now. They&apos;ve been notified, they&apos;ve opened your dossier, and the hiring lead is going through your video answers.
          </p>

          <div className="inline-flex items-center gap-[10px] bg-white/[0.16] border border-white/[0.28] rounded-[14px] p-[12px_22px] backdrop-blur-[8px]">
            <div className="text-left">
              <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-white/70">Typical wait</div>
              <div className="text-[22px] font-[900] text-white tracking-[-0.3px] leading-none mt-1">A couple of hours</div>
            </div>
            <div className="w-[1px] h-[30px] bg-white/20" />
            <div className="text-left">
              <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-white/70">Started</div>
              <div className="text-[22px] font-[900] text-white tracking-[-0.3px] leading-none mt-1 tabular-nums">
                {startedMins} min ago
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <main className="max-w-[760px] w-full mx-auto mt-[-32px] px-4 pb-[90px] relative z-10 flex-1">
        
        {/* Live review progress track */}
        <div className="bg-white rounded-[18px] p-[26px_30px] mb-[18px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6]">
          <div className="mb-[18px]">
            <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC]">Live review progress</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] leading-[1.3] mt-1">
              What&apos;s happening on Reach Africa&apos;s side
            </h2>
          </div>

          <div className="flex flex-col relative">
            {/* Progress connectors line */}
            <div className="absolute left-[22px] top-[24px] bottom-[24px] w-[2px] bg-[#E6E6E6] z-0" />
            <div className="absolute left-[22px] top-[24px] h-[50%] w-[2px] bg-gradient-to-b from-[#0047CC] to-[#387DFF] z-10" />
            
            {/* Step 1 */}
            <div className="flex gap-[14px] items-start py-[14px] relative z-20">
              <div className="w-[46px] h-[46px] rounded-full bg-[#0047CC] text-white flex items-center justify-center shrink-0 border-2 border-[#0047CC]">
                <CheckIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1 pt-[4px] min-w-0">
                <div className="text-[14.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">Dossier delivered to Reach Africa</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Your complete file (Stages 1, 2 and 3) was packaged and sent to the hiring channel.</div>
                <span className="text-[11px] font-[700] text-[#0047CC] bg-[#EBF6FF] px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 mt-[5px] uppercase tracking-[0.3px]">
                  <CheckIcon className="w-[9px] h-[9px]" />
                  {startedMins} min ago
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-[14px] items-start py-[14px] relative z-20">
              <div className="w-[46px] h-[46px] rounded-full bg-[#0047CC] text-white flex items-center justify-center shrink-0 border-2 border-[#0047CC]">
                <CheckIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1 pt-[4px] min-w-0">
                <div className="text-[14.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">Hiring lead opened your dossier</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">Dr Adesuwa Okolo, Reach Africa&apos;s Country Director, accessed your file and started reading.</div>
                <span className="text-[11px] font-[700] text-[#0047CC] bg-[#EBF6FF] px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 mt-[5px] uppercase tracking-[0.3px]">
                  <CheckIcon className="w-[9px] h-[9px]" />
                  {Math.max(1, startedMins - 16)} min ago
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-[14px] items-start py-[14px] relative z-20">
              <div className="w-[46px] h-[46px] rounded-full bg-white border-2 border-[#0047CC] text-[#0047CC] flex items-center justify-center shrink-0 relative">
                <div className="absolute inset-[-6px] rounded-full bg-[radial-gradient(circle,rgba(0,71,204,0.16)_0%,transparent_70%)] animate-pulse z-[-1]" />
                <VideoIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1 pt-[4px] min-w-0">
                <div className="text-[14.5px] font-[800] text-[#1A1A1A] mb-[3px] tracking-[-0.1px]">Video answers under review</div>
                <div className="text-[12.5px] text-[#4A4A4A] leading-[1.55]">The hiring team is currently watching your Stage 3 responses. They typically watch them in order with the rest of the panel.</div>
                <span className="text-[11px] font-[700] text-[#0047CC] bg-[#EBF6FF] px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 mt-[5px] uppercase tracking-[0.3px]">
                  In progress now
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-[14px] items-start py-[14px] relative z-20">
              <div className="w-[46px] h-[46px] rounded-full bg-white border-2 border-[#E6E6E6] text-[#ADADAD] flex items-center justify-center shrink-0">
                <UsersIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1 pt-[4px] min-w-0">
                <div className="text-[14.5px] font-[800] text-[#808080] mb-[3px] tracking-[-0.1px]">Hiring panel discussion</div>
                <div className="text-[12.5px] text-[#ADADAD] leading-[1.55]">A short alignment call between the hiring lead, HR and the role&apos;s line manager.</div>
                <span className="text-[11px] font-[700] text-[#808080] bg-[#F7F7F7] px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 mt-[5px] uppercase tracking-[0.3px]">
                  Pending
                </span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-[14px] items-start py-[14px] relative z-20">
              <div className="w-[46px] h-[46px] rounded-full bg-white border-2 border-[#E6E6E6] text-[#ADADAD] flex items-center justify-center shrink-0">
                <CheckIcon className="w-[20px] h-[20px]" />
              </div>
              <div className="flex-1 pt-[4px] min-w-0">
                <div className="text-[14.5px] font-[800] text-[#808080] mb-[3px] tracking-[-0.1px]">Final decision</div>
                <div className="text-[12.5px] text-[#ADADAD] leading-[1.55]">You&apos;ll see the outcome here and receive an email at the same moment.</div>
                <span className="text-[11px] font-[700] text-[#808080] bg-[#F7F7F7] px-2.5 py-1 rounded-[6px] inline-flex items-center gap-1 mt-[5px] uppercase tracking-[0.3px]">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewers List Panel */}
        <div className="bg-white border border-[#E6E6E6] rounded-[18px] p-[24px_28px] mb-[18px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[8px]">Who&apos;s reading right now</div>
          <h3 className="text-[16px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[14px]">
            Reach Africa&apos;s hiring panel for this role
          </h3>
          
          <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[12px] items-center p-[11px_14px] bg-[#F7F7F7] rounded-[10px]">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#0047CC] to-[#387DFF] text-white flex items-center justify-center font-[900] text-[12px] shrink-0">
                AO
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[1px]">Dr Adesuwa Okolo</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">Country Director · Hiring lead</div>
              </div>
              <span className="text-[10.5px] font-[800] p-[3px_9px] rounded-[6px] uppercase tracking-[0.4px] bg-[#EBF6FF] text-[#0047CC] flex items-center gap-1.5">
                Reading now
              </span>
            </div>

            <div className="flex gap-[12px] items-center p-[11px_14px] bg-[#F7F7F7] rounded-[10px]">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#5B21B6] to-[#7C3AED] text-white flex items-center justify-center font-[900] text-[12px] shrink-0">
                YA
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[1px]">Yemi Adeyemi</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">Director of HR · Final sign-off</div>
              </div>
              <span className="text-[10.5px] font-[800] p-[3px_9px] rounded-[6px] uppercase tracking-[0.4px] bg-[#E6E6E6] text-[#4A4A4A]">
                Queued
              </span>
            </div>

            <div className="flex gap-[12px] items-center p-[11px_14px] bg-[#F7F7F7] rounded-[10px]">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center font-[900] text-[12px] shrink-0">
                CN
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-[800] text-[#1A1A1A] mb-[1px]">Mrs Chinwe Nwosu</div>
                <div className="text-[11.5px] text-[#808080] font-[600]">Head of Maternal Programmes · Line manager</div>
              </div>
              <span className="text-[10.5px] font-[800] p-[3px_9px] rounded-[6px] uppercase tracking-[0.4px] bg-[#E6E6E6] text-[#4A4A4A]">
                Queued
              </span>
            </div>
          </div>
        </div>

        {/* Note info */}
        <div className="bg-gradient-to-b from-[#EBF6FF] to-[#F8FBFF] border border-[#EBF6FF] rounded-[14px] p-[18px_22px] mb-[22px] flex gap-[14px] items-start">
          <InfoIcon className="w-[20px] h-[20px] text-[#0047CC] shrink-0 mt-[1px]" />
          <div className="note-body flex-1">
            <div className="n-t text-[13.5px] font-[800] text-[#182348] mb-[5px]">You don&apos;t have to wait on this page</div>
            <div className="n-d text-[13px] text-[#182348] leading-[1.65]">
              We&apos;ll email you the moment the decision is in. Most candidates close this tab and check back in an hour or two. You&apos;ll lose nothing by stepping away.
            </div>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex gap-[10px] justify-center flex-wrap mt-[8px]">
          <button 
            onClick={handleBackToDashboard}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] p-[13px_22px] text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7]"
          >
            Back to dashboard
          </button>
          
          <button 
            onClick={() => navigate(`/onboarding/talent/${roleSlug}/interview/stage-4/outcome`)}
            className="bg-[#0047CC] text-white border-none rounded-[10px] p-[13px_26px] text-[14px] font-[700] cursor-pointer inline-flex items-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] transition-all"
          >
            Preview outcome (demo)
          </button>
        </div>
      </main>

      {/* DEMO HIRING OFFER LETTER MODAL OUTCOME */}
      {showDemoOutcomeModal && (
        <div className="fixed inset-0 z-[200] bg-[#0A1129]/80 backdrop-blur-[6px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E6E6] rounded-[24px] max-w-[560px] w-full p-[40px_36px_32px] text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-[fadeUp_0.4s_ease_both] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#0047CC] to-[#387DFF]" />
            
            <div className="w-[60px] h-[60px] bg-[#EBF6FF] text-[#0047CC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EBF6FF]">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </div>
            
            <h2 className="text-[22px] font-[900] text-[#1a1a1a] tracking-[-0.3px] mb-2">
              Congratulations, {firstName}!
            </h2>
            <p className="text-[14.5px] text-[#4A4A4A] leading-[1.6] mb-5">
              Dr Adesuwa Okolo has completed the assessment review and signed off on your offer as the new **Programme Manager** at Reach Africa!
            </p>
            
            {/* Offer brief card */}
            <div className="bg-[#FAFCFF] border border-[#387DFF]/20 rounded-xl p-4 text-left mb-6">
              <div className="text-[11px] font-[800] uppercase text-[#0047CC] tracking-[0.5px] mb-2">Employment Offer Details</div>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-[#808080]">Base Salary</span>
                  <div className="font-bold text-[#1a1a1a] mt-0.5">$68,500 / year</div>
                </div>
                <div>
                  <span className="text-[#808080]">Start Date</span>
                  <div className="font-bold text-[#1a1a1a] mt-0.5">September 1st, 2026</div>
                </div>
                <div>
                  <span className="text-[#808080]">Location</span>
                  <div className="font-bold text-[#1a1a1a] mt-0.5">Abuja, Nigeria</div>
                </div>
                <div>
                  <span className="text-[#808080]">Benefits</span>
                  <div className="font-bold text-[#1a1a1a] mt-0.5">Full health & insurance</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button 
                onClick={() => setShowDemoOutcomeModal(false)}
                className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] py-[11px] px-6 text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7]"
              >
                Close preview
              </button>
              
              <button 
                onClick={() => {
                  setShowDemoOutcomeModal(false);
                  toast.success('Hiring offer accepted! Proceeding to outcome page.');
                  navigate(`/onboarding/talent/${roleSlug}/interview/stage-4/outcome`);
                }}
                className="bg-[#0047CC] text-white border-none rounded-[10px] py-[11px] px-6 text-[13.5px] font-[700] cursor-pointer hover:bg-[#344DA1] shadow-[0_4px_14px_rgba(0,71,204,0.2)]"
              >
                Accept offer & complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoleAssessmentStageFourReview;
