import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import {
  useAssessmentDecisionQuery,
  useConfirmAlignmentSlotMutation,
} from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId } from '../../utils/assessmentSession';
import type {
  Stage4DecisionData,
  Stage4AlignmentSlot,
} from '../../services/queries/assessments/types';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const RoleAssessmentStageFourDecision: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const { data: roleResponse } = useGetPublicRoleQuery(roleSlug || '');
  const roleData = roleResponse?.data || roleResponse;
  const roleTitle = roleData?.roleTitle || 'Selected Role';
  const defaultCompanyName = roleData?.companyName || 'The hiring team';

  // Poll decision status
  const { data: decisionRaw, isLoading } = useAssessmentDecisionQuery(assessmentId, {
    enabled: Boolean(assessmentId),
    refetchInterval: 4000,
  });

  const confirmSlotMutation = useConfirmAlignmentSlotMutation();

  const decisionData: Stage4DecisionData | null = useMemo(() => {
    if (!decisionRaw) return null;
    const raw = decisionRaw as any;
    return raw?.data?.screen ? raw.data : raw?.screen ? raw : raw?.data || null;
  }, [decisionRaw]);

  const screen = decisionData?.screen || 'awaiting_employer';
  const employerName = decisionData?.employerName || defaultCompanyName;
  const rawFirstName = decisionData?.talentFirstName || user?.firstName || '';
  const firstName = rawFirstName && !rawFirstName.includes('-') && !/\d/.test(rawFirstName)
    ? rawFirstName
    : '';

  // Alignment slot selection state
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  useEffect(() => {
    if (decisionData?.alignment?.selectedSlotId) {
      setSelectedSlotId(decisionData.alignment.selectedSlotId);
    }
  }, [decisionData?.alignment?.selectedSlotId]);

  // Sync stage 4 state to localStorage
  useEffect(() => {
    localStorage.setItem('vora_stage4_unlocked', 'true');
    if (screen === 'hired') {
      localStorage.setItem('vora_stage4_completed', 'true');
      localStorage.setItem('vora_hired', 'true');
    }
  }, [screen]);

  const handleConfirmSlot = async () => {
    if (!selectedSlotId || !assessmentId) {
      toast.error('Please select an alignment slot.');
      return;
    }
    try {
      await confirmSlotMutation.mutateAsync({ assessmentId, slotId: selectedSlotId });
      toast.success('Alignment slot successfully booked!');
    } catch (err: any) {
      console.error('Failed to book slot:', err);
      toast.error(err?.message || 'Failed to confirm alignment slot. Please retry.');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Render Loading
  if (isLoading && !decisionData) {
    return <FullPageSpinner message="Checking interview decision status..." />;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 1: HIRED
  // ───────────────────────────────────────────────────────────────────────────
  if (screen === 'hired') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none overflow-x-hidden">
        {/* Confetti Animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .confetti-host { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
            .confetti { position: absolute; width: 10px; height: 14px; opacity: 0; animation: fall 4s linear infinite; }
            .confetti:nth-child(1) { left: 8%; background: #0047CC; animation-delay: 0s; transform: rotate(15deg); }
            .confetti:nth-child(2) { left: 18%; background: #2CA62C; animation-delay: .5s; transform: rotate(-20deg); }
            .confetti:nth-child(3) { left: 28%; background: #387DFF; animation-delay: 1s; transform: rotate(45deg); }
            .confetti:nth-child(4) { left: 38%; background: #0047CC; animation-delay: .2s; transform: rotate(-10deg); }
            .confetti:nth-child(5) { left: 48%; background: #2CA62C; animation-delay: 1.5s; transform: rotate(30deg); }
            .confetti:nth-child(6) { left: 58%; background: #387DFF; animation-delay: .8s; transform: rotate(-35deg); }
            .confetti:nth-child(7) { left: 68%; background: #0047CC; animation-delay: 1.3s; transform: rotate(20deg); }
            .confetti:nth-child(8) { left: 78%; background: #2CA62C; animation-delay: .3s; transform: rotate(-15deg); }
            .confetti:nth-child(9) { left: 88%; background: #387DFF; animation-delay: 1.8s; transform: rotate(40deg); }
            @keyframes fall {
              0% { opacity: 0; transform: translateY(-30vh) rotate(0deg); }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
            }
          `
        }} />
        <div className="confetti-host">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="confetti" />
          ))}
        </div>

        <AssessmentHeader
          middleContent="Stage 4 · Final Decision · Offer Extended"
          rightContent={
            <div className="flex items-center gap-[6px] text-[12px] text-[#2CA62C] font-[700]">
              <CheckIcon className="w-[13px] h-[13px] text-[#2CA62C]" />
              Offer Received
            </div>
          }
        />

        <StageRail activeStage={4} greenDone={true} />

        <main className="max-w-[720px] w-full mx-auto p-[40px_24px_80px] flex-1 flex flex-col items-center justify-center text-center relative z-10">
          <div className="bg-white rounded-[24px] shadow-[0_16px_48px_rgba(10,17,114,0.08)] border border-[#E6E6E6] p-[44px_40px_36px] w-full">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#1D871D] to-[#2CA62C] mx-auto mb-[22px] flex items-center justify-center text-white shadow-[0_8px_28px_rgba(44,166,44,0.3)]">
              <CheckIcon className="w-[42px] h-[42px]" />
            </div>

            <div className="text-[11px] font-[800] text-[#1D871D] tracking-[1.4px] uppercase mb-[8px]">
              Decision: Hired
            </div>

            <h1 className="text-[30px] font-[900] text-[#1A1A1A] tracking-[-0.5px] leading-[1.2] mb-[12px]">
              Welcome to {employerName}{firstName ? `, ${firstName}` : ''}!
            </h1>

            <p className="text-[15px] text-[#4A4A4A] leading-[1.65] max-w-[560px] mx-auto mb-[28px]">
              The hiring panel has reviewed your complete assessment package and came to a unanimous decision: they would love to extend an offer for <strong>{roleTitle}</strong>.
            </p>

            {/* Offer details banner */}
            <div className="bg-[#FAFCFF] border border-[#387DFF]/25 rounded-[16px] p-[20px_24px] mb-[28px] text-left">
              <div className="text-[12px] font-[800] text-[#0047CC] uppercase tracking-[0.6px] mb-[10px]">
                Offer Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <div>
                  <div className="text-[11px] text-[#808080] font-[600]">Role</div>
                  <div className="text-[14px] font-[700] text-[#1A1A1A]">{roleTitle}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#808080] font-[600]">Employer</div>
                  <div className="text-[14px] font-[700] text-[#1A1A1A]">{employerName}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToDashboard}
              className="w-full bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[12px] py-[14px] px-[24px] text-[14.5px] font-[800] cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,71,204,0.25)]"
            >
              Go to Dashboard & View Next Steps
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 2: ALIGNMENT SESSION (30-min call slot selection)
  // ───────────────────────────────────────────────────────────────────────────
  if (screen === 'alignment') {
    const alignment = decisionData?.alignment;
    const duration = alignment?.durationMins || 30;
    const slots: Stage4AlignmentSlot[] = alignment?.slots || [];
    const isSlotConfirmed = Boolean(alignment?.selectedSlotId);

    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
        <AssessmentHeader
          middleContent="Stage 4 · Alignment Session"
          rightContent={
            <div className="flex items-center gap-[6px] text-[12px] text-[#0047CC] font-[700]">
              <CalendarIcon className="w-[13px] h-[13px] text-[#0047CC]" />
              Alignment Step
            </div>
          }
        />

        <StageRail activeStage={4} greenDone={false} />

        <main className="max-w-[740px] w-full mx-auto p-[36px_24px_80px] flex-1">
          <div className="bg-white rounded-[22px] shadow-[0_12px_40px_rgba(10,17,114,0.06)] border border-[#E6E6E6] p-[38px_36px_32px]">
            <div className="inline-flex items-center gap-[7px] bg-[#EBF6FF] text-[#0047CC] px-[12px] py-[5px] rounded-full text-[11px] font-[800] uppercase tracking-[0.5px] mb-[16px]">
              <CalendarIcon className="w-[13px] h-[13px]" />
              {duration}-minute alignment call
            </div>

            <h1 className="text-[26px] font-[900] text-[#1A1A1A] tracking-[-0.4px] leading-[1.25] mb-[10px]">
              Pick your alignment slot with {employerName}
            </h1>

            <p className="text-[14.5px] text-[#4A4A4A] leading-[1.65] mb-[26px]">
              {employerName} loved your profile and wants to hold a short {duration}-minute conversation to align on team scope, expectations, and next steps.
            </p>

            {/* Slots List */}
            <div className="mb-[28px]">
              <div className="text-[12px] font-[800] text-[#808080] uppercase tracking-[0.6px] mb-[12px]">
                Available Time Slots
              </div>

              {slots.length === 0 ? (
                <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-[14px] p-[20px] text-center text-[13.5px] text-[#808080]">
                  The hiring team is currently preparing time slots. Check back in a few minutes or keep an eye on your inbox.
                </div>
              ) : (
                <div className="space-y-[10px]">
                  {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const isTaken = slot.taken && !isSelected;

                    return (
                      <label
                        key={slot.id}
                        className={`flex items-center justify-between p-[16px_20px] rounded-[14px] border-[1.5px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0047CC] bg-[#EBF6FF] shadow-[0_0_0_2px_rgba(0,71,204,0.12)]'
                            : isTaken
                            ? 'border-[#E6E6E6] bg-[#F7F7F7] opacity-50 cursor-not-allowed'
                            : 'border-[#E6E6E6] bg-white hover:border-[#0047CC]/50'
                        }`}
                      >
                        <div className="flex items-center gap-[14px]">
                          <input
                            type="radio"
                            name="alignment_slot"
                            disabled={isTaken || isSlotConfirmed}
                            checked={isSelected}
                            onChange={() => setSelectedSlotId(slot.id)}
                            className="w-[18px] h-[18px] accent-[#0047CC] cursor-pointer"
                          />
                          <div>
                            <div className="text-[14px] font-[700] text-[#1A1A1A]">
                              {slot.label || slot.startsAt}
                            </div>
                            {slot.timezone && (
                              <div className="text-[12px] text-[#808080]">
                                Timezone: {slot.timezone}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && isSlotConfirmed && (
                          <div className="inline-flex items-center gap-[5px] text-[#1D871D] font-[800] text-[12px] bg-[#EBF8EB] px-[10px] py-[4px] rounded-full">
                            <CheckIcon className="w-[12px] h-[12px]" />
                            Confirmed
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-[10px]">
              {!isSlotConfirmed ? (
                <button
                  onClick={handleConfirmSlot}
                  disabled={!selectedSlotId || confirmSlotMutation.isPending}
                  className="w-full bg-[#0047CC] hover:bg-[#344DA1] disabled:opacity-50 text-white border-none rounded-[12px] py-[14px] px-[24px] text-[14.5px] font-[800] cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,71,204,0.25)]"
                >
                  {confirmSlotMutation.isPending ? 'Confirming...' : 'Confirm Alignment Slot'}
                </button>
              ) : (
                <div className="text-center bg-[#EBF8EB] border border-[#2CA62C]/30 text-[#1D871D] p-[14px] rounded-[12px] text-[13.5px] font-[700]">
                  Your alignment call is confirmed! A calendar invite has been sent to your email.
                </div>
              )}

              <button
                onClick={handleBackToDashboard}
                className="bg-transparent border-none text-[#808080] hover:text-[#1A1A1A] text-[13px] font-[600] py-[10px] cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 3: REJECTED (Respectful Outcome)
  // ───────────────────────────────────────────────────────────────────────────
  if (screen === 'rejected') {
    const reason = decisionData?.rejection?.reason || 'The role requirements have been matched with another candidate profile.';

    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
        <AssessmentHeader
          middleContent="Stage 4 · Final Decision"
          rightContent={
            <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
              Evaluation Complete
            </div>
          }
        />

        <StageRail activeStage={4} greenDone={false} />

        <main className="max-w-[620px] w-full mx-auto p-[44px_24px_80px] flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#E6E6E6] p-[40px_36px_34px] w-full">
            <div className="w-[72px] h-[72px] rounded-full bg-[#F3F4F6] text-[#6B7280] mx-auto mb-[20px] flex items-center justify-center">
              <InfoIcon className="w-[34px] h-[34px]" />
            </div>

            <div className="text-[11px] font-[800] text-[#6B7280] tracking-[1.2px] uppercase mb-[8px]">
              Stage 4 Outcome
            </div>

            <h1 className="text-[26px] font-[900] text-[#1A1A1A] tracking-[-0.3px] leading-[1.25] mb-[12px]">
              Thank you for your time with {employerName}
            </h1>

            <p className="text-[14.5px] text-[#4A4A4A] leading-[1.65] mb-[24px]">
              The hiring team reviewed your assessment and decided not to move forward for this specific role opening.
            </p>

            {reason && (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[14px] p-[16px_20px] text-left mb-[26px]">
                <div className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-[0.5px] mb-[6px]">
                  Feedback from the team
                </div>
                <div className="text-[13.5px] text-[#374151] leading-[1.6]">
                  {reason}
                </div>
              </div>
            )}

            <button
              onClick={handleBackToDashboard}
              className="w-full bg-[#0047CC] hover:bg-[#344DA1] text-white border-none rounded-[12px] py-[13px] px-[24px] text-[14px] font-[800] cursor-pointer transition-all"
            >
              Back to Dashboard & Explore Roles
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE 4: AWAITING EMPLOYER (Default 41 waiting screen)
  // ───────────────────────────────────────────────────────────────────────────
  const typicalWait = decisionData?.typicalWait || 'A couple of hours';
  const startedAgo = decisionData?.startedAgo || 'Just now';
  const steps = decisionData?.steps || [
    { label: 'Stage 3 video responses verified', status: 'done' as const },
    { label: 'Panel reviewing dossier and transcripts', status: 'active' as const },
    { label: 'Final decision formulation', status: 'pending' as const },
  ];
  const reviewers = decisionData?.reviewers || [];
  const note = decisionData?.note || "You don't need to wait on this screen. We'll email you the moment a decision is in.";

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative select-none">
      <AssessmentHeader
        middleContent={`Stage 4 · ${employerName} is reviewing`}
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            Package Submitted
          </div>
        }
      />

      <StageRail activeStage={4} greenDone={false} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#182348] via-[#344DA1] to-[#0047CC] text-white p-[46px_28px_54px] relative overflow-hidden text-center">
        <div className="absolute top-[-90px] right-[-70px] w-[300px] h-[300px] rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[220px] h-[220px] rounded-full bg-white/[0.03]" />

        <div className="max-w-[780px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-[8px] bg-white/[0.14] border border-white/[0.24] rounded-full p-[6px_15px] backdrop-blur-[6px] mb-[18px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#38D68A] animate-ping" />
            <span className="text-[11px] font-[800] tracking-[0.7px] uppercase">Hiring team is reviewing right now</span>
          </div>

          <div className="text-[11.5px] font-[800] tracking-[1.4px] uppercase text-white/72 mb-[8px]">
            Stage 4 of 4 · Final Decision
          </div>

          <h1 className="text-[30px] font-[900] tracking-[-0.5px] leading-[1.22] mb-[12px] max-w-[620px] mx-auto">
            {employerName} is reading your full file
          </h1>

          <p className="text-[15px] text-white/85 leading-[1.65] max-w-[520px] mx-auto mb-[26px]">
            Your assessment answers are in their hands. The hiring panel has opened your dossier and is going through your profile and video responses.
          </p>

          <div className="inline-flex items-center gap-[12px] bg-white/[0.16] border border-white/[0.28] rounded-[14px] p-[10px_20px] backdrop-blur-[8px]">
            <div className="text-left">
              <div className="text-[10px] font-[800] tracking-[0.7px] uppercase text-white/70">Typical wait</div>
              <div className="text-[18px] font-[900] text-white tracking-[-0.3px] leading-tight mt-0.5">{typicalWait}</div>
            </div>
            <div className="w-[1px] h-[28px] bg-white/20" />
            <div className="text-left">
              <div className="text-[10px] font-[800] tracking-[0.7px] uppercase text-white/70">Started</div>
              <div className="text-[18px] font-[900] text-white tracking-[-0.3px] leading-tight mt-0.5 tabular-nums">
                {startedAgo}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-[720px] w-full mx-auto mt-[-28px] px-4 pb-[90px] relative z-10 flex-1">
        {/* Live review progress track */}
        <div className="bg-white rounded-[18px] p-[24px_28px] mb-[16px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6]">
          <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[4px]">
            Live Review Progress
          </div>
          <h2 className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[16px]">
            What is happening right now
          </h2>

          <div className="space-y-[12px]">
            {steps.map((st, idx) => (
              <div key={idx} className="flex items-center gap-[12px]">
                {st.status === 'done' ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#0047CC] text-white flex items-center justify-center shrink-0">
                    <CheckIcon className="w-[12px] h-[12px]" />
                  </div>
                ) : st.status === 'active' ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#EBF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#0047CC] animate-ping" />
                  </div>
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full border border-[#E6E6E6] bg-white shrink-0" />
                )}
                <span className={`text-[13.5px] font-[600] ${st.status === 'active' ? 'text-[#1A1A1A] font-[800]' : st.status === 'done' ? 'text-[#4A4A4A]' : 'text-[#ADADAD]'}`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewers box if present */}
        {reviewers.length > 0 && (
          <div className="bg-white rounded-[18px] p-[20px_28px] mb-[16px] border border-[#E6E6E6] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <UsersIcon className="w-[20px] h-[20px] text-[#0047CC]" />
              <div>
                <div className="text-[11px] font-[800] uppercase text-[#808080]">Review Panel</div>
                <div className="text-[13.5px] font-[700] text-[#1A1A1A]">
                  {reviewers.map(r => r.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reassurance note */}
        <div className="bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[14px] p-[16px_20px] mb-[20px] flex items-start gap-[12px]">
          <InfoIcon className="w-[18px] h-[18px] text-[#0047CC] shrink-0 mt-0.5" />
          <div className="text-[13px] text-[#4A4A4A] leading-[1.6]">
            {note}
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={handleBackToDashboard}
          className="w-full bg-white hover:bg-[#F7F7F7] border border-[#E6E6E6] text-[#4A4A4A] rounded-[12px] py-[12px] px-[20px] text-[13.5px] font-[700] cursor-pointer transition-all shadow-sm"
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
};

export default RoleAssessmentStageFourDecision;
