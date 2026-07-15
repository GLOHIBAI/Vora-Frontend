import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssessmentHeader from '../../components/talent/AssessmentHeader';
import StageRail from '../../components/talent/StageRail';
import Button from '../../components/common/Button';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RoleAssessmentStageThreeIntro: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const handleBegin = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/stage-3/video`);
  };

  const handleNotNow = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/journey`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative">
      {/* Header */}
      <AssessmentHeader
        middleContent="Stage 3 · Before you begin"
        rightContent={
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <CheckIcon className="w-[13px] h-[13px] text-[#0047CC]" />
            Stage 2 saved
          </div>
        }
      />

      {/* Stage Rail */}
      <StageRail activeStage={3} greenDone={false} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#182348] via-[#0047CC] to-[#387DFF] text-white p-[48px_32px_56px] relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[340px] h-[340px] rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-[-90px] left-[-70px] w-[240px] h-[240px] rounded-full bg-white/[0.03]" />
        <div className="max-w-[820px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-[7px] bg-white/[0.14] border border-white/[0.22] rounded-full p-[6px_14px] backdrop-blur-[6px] mb-[18px]">
            <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase">You passed Stages 1 and 2</span>
          </div>
          <div className="text-[12px] font-[800] tracking-[1.4px] uppercase text-white/70 mb-[8px]">Stage 3 of 4 · The video interview</div>
          <h1 className="text-[32px] font-[900] tracking-[-0.5px] leading-[1.2] mb-[14px] max-w-[680px]">
            Now we&apos;d like to see and hear you
          </h1>
          <p className="text-[15.5px] text-white/86 leading-[1.65] max-w-[600px] mb-[24px]">
            You&apos;ve shown us what you know and how you reason. Stage 3 is the human part: how you actually come across in a conversation. Five questions, your face on camera, and your time.
          </p>
          <div className="flex gap-[14px] flex-wrap">
            <div className="bg-white/[0.08] border border-white/[0.16] rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[130px]">
              <div className="text-[18px] font-[900] tracking-[-0.2px] tabular-nums">5</div>
              <div className="text-[11px] font-[700] text-white/70 mt-[2px] tracking-[0.3px]">questions</div>
            </div>
            <div className="bg-white/[0.08] border border-white/[0.16] rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[130px]">
              <div className="text-[18px] font-[900] tracking-[-0.2px] tabular-nums">~25 min</div>
              <div className="text-[11px] font-[700] text-white/70 mt-[2px] tracking-[0.3px]">total budget</div>
            </div>
            <div className="bg-white/[0.08] border border-white/[0.16] rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[130px]">
              <div className="text-[18px] font-[900] tracking-[-0.2px] tabular-nums">48 hrs</div>
              <div className="text-[11px] font-[700] text-white/70 mt-[2px] tracking-[0.3px]">async window</div>
            </div>
            <div className="bg-white/[0.08] border border-white/[0.16] rounded-[12px] p-[11px_16px] backdrop-blur-[6px] min-w-[130px]">
              <div className="text-[18px] font-[900] tracking-[-0.2px]">Record · Upload</div>
              <div className="text-[11px] font-[700] text-white/70 mt-[2px] tracking-[0.3px]">your choice</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-[820px] w-full mx-auto mt-[-30px] px-[20px] sm:px-[28px] pb-[90px] relative z-10 flex-1">
        {/* Dimensions Card */}
        <div className="bg-white rounded-[16px] p-[28px_30px] mb-[22px] shadow-[0_12px_36px_rgba(10,17,114,0.08)] border border-[#E6E6E6]">
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[6px]">What this stage is reading you for</h2>
          <p className="text-[13.5px] text-[#808080] leading-[1.6] mb-[18px]">
            Stage 3 isn&apos;t a memory check. It looks at four things at once that the written stages can&apos;t surface.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div className="bg-gradient-to-b from-[#F7F7F7] to-white border border-[#E6E6E6] rounded-[12px] p-[16px]">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] mb-[10px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[4px] tracking-[-0.1px]">Communication clarity</div>
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55]">Can you take a complicated situation and explain it cleanly without losing the thread?</div>
            </div>

            <div className="bg-gradient-to-b from-[#F7F7F7] to-white border border-[#E6E6E6] rounded-[12px] p-[16px]">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] mb-[10px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[4px] tracking-[-0.1px]">Professional presence</div>
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55]">The composure, warmth, and tone that translate to how communities, donors, and staff respond to you.</div>
            </div>

            <div className="bg-gradient-to-b from-[#F7F7F7] to-white border border-[#E6E6E6] rounded-[12px] p-[16px]">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] mb-[10px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[4px] tracking-[-0.1px]">Thinking on your feet</div>
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55]">When you don&apos;t have a perfect answer pre-drafted, do you still reason out loud honestly?</div>
            </div>

            <div className="bg-gradient-to-b from-[#F7F7F7] to-white border border-[#E6E6E6] rounded-[12px] p-[16px]">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#EBF6FF] to-white border border-[#EBF6FF] flex items-center justify-center text-[#0047CC] mb-[10px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[4px] tracking-[-0.1px]">Storytelling depth</div>
              <div className="text-[12px] text-[#4A4A4A] leading-[1.55]">Can you walk us through real moments from your work, with specifics, including the messy parts?</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-[16px] p-[28px_30px] mb-[22px] border border-[#E6E6E6] shadow-[0_6px_22px_rgba(10,17,114,0.06)]">
          <div className="text-[11px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[10px]">How the video interview works</div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">One question at a time. Your answer, your way.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Question reveals', desc: 'Each question opens on its own. You can&apos;t see what comes next.' },
              { num: 2, title: '30s think time', desc: 'Read, breathe, gather your thoughts. Timer doesn&apos;t start yet.' },
              { num: 3, title: 'Record or upload', desc: 'Use the in-browser recorder, or upload a video you recorded elsewhere.' },
              { num: 4, title: 'Submit and unlock the next', desc: 'Submitting locks your answer and reveals the next question.' }
            ].map((st) => (
              <div key={st.num} className="relative p-[14px_12px] bg-[#F7F7F7] rounded-[10px] border border-[#E6E6E6]">
                <div className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#0047CC] text-white font-[900] text-[11px] mb-[8px]">
                  {st.num}
                </div>
                <div className="text-[12.5px] font-[800] text-[#1A1A1A] mb-[3px] leading-[1.3]">{st.title}</div>
                <div className="text-[11.5px] text-[#808080] leading-[1.5]" dangerouslySetInnerHTML={{ __html: st.desc }} />
              </div>
            ))}
          </div>
        </div>

        {/* Two Paths */}
        <div className="bg-white rounded-[16px] p-[28px_30px] mb-[22px] border border-[#E6E6E6]">
          <div className="text-[11px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[10px]">Your two ways to answer</div>
          <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[6px]">Record live or upload pre-recorded · per question</h2>
          <p className="text-[13.5px] text-[#808080] leading-[1.6] mb-[20px]">
            For each question, you choose. Some people are sharper recording in the moment. Others want to record on their phone, watch it back, then upload. Both are completely fine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            <div className="p-[22px_20px] rounded-[14px] border-[1.5px] border-[#E6E6E6] relative bg-gradient-to-b from-[#FAFCFF] to-white">
              <div className="w-[50px] h-[50px] rounded-[12px] bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] display flex items-center justify-center text-[#0047CC] mb-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[6px]">Path 1</div>
              <div className="text-[16px] font-[900] text-[#1A1A1A] mb-[6px] tracking-[-0.2px]">Record live in your browser</div>
              <div className="text-[13px] text-[#4A4A4A] leading-[1.6] mb-[12px]">Use your laptop or phone&apos;s camera and microphone. Record, watch back, retake if there&apos;s time, then submit.</div>
              <ul className="list-none flex flex-col gap-[7px]">
                {[
                  'One in-browser take per question',
                  'You can re-record while your question timer is running',
                  'Audio levels meter shown live',
                  'Nothing leaves your device until you tap Submit'
                ].map((li, i) => (
                  <li key={i} className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative line-height-[1.5] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                    {li}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-[22px_20px] rounded-[14px] border-[1.5px] border-[#E6E6E6] relative bg-gradient-to-b from-[#FAFCFF] to-white">
              <div className="w-[50px] h-[50px] rounded-[12px] bg-gradient-to-br from-[#EBF6FF] to-white border-[1.5px] border-[#EBF6FF] display flex items-center justify-center text-[#0047CC] mb-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-[10.5px] font-[800] tracking-[0.5px] uppercase text-[#0047CC] mb-[6px]">Path 2</div>
              <div className="text-[16px] font-[900] text-[#1A1A1A] mb-[6px] tracking-[-0.2px]">Upload a pre-recorded video</div>
              <div className="text-[13px] text-[#4A4A4A] leading-[1.6] mb-[12px]">Recorded on your phone or device beforehand? Drag and drop the file. Preview, replace if needed, then submit.</div>
              <ul className="list-none flex flex-col gap-[7px]">
                {[
                  'Per-question file upload, MP4, MOV or WebM',
                  'Max 200MB per question, max 3 minutes long',
                  'Watch preview before submitting',
                  'Replace freely while the question timer is running'
                ].map((li, i) => (
                  <li key={i} className="text-[12px] text-[#4A4A4A] font-[600] pl-[18px] relative line-height-[1.5] before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#0047CC]">
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-[18px] padding py-3 px-[14px] border border-[#0047CC] rounded-[10px] text-[12.5px] text-[#0047CC] leading-[1.55] display flex gap-[9px] items-start">
            <svg className="w-[15px] h-[15px] text-[#0047CC] shrink-0 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div><strong>Mix and match freely.</strong> You can record one question live, upload the next, then record the third. The method doesn&apos;t affect how you&apos;re assessed, only the content does.</div>
          </div>
        </div>

        {/* Equipment Check */}
        <div className="bg-gradient-to-b from-white to-[#FAFCFF] border-[1.5px] border-[#EBF6FF] rounded-[16px] p-[28px_30px] mb-[22px] relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] rounded-full bg-gradient-to-br from-[#EBF6FF] to-white/5 opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[11px] font-[800] tracking-[0.8px] uppercase text-[#0047CC] mb-[10px]">Equipment check</div>
            <h2 className="text-[18px] font-[900] text-[#1A1A1A] tracking-[-0.2px] mb-[18px]">We&apos;ve run a quick check. You&apos;re set up.</h2>

            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[14px] p-[12px_14px] bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[10px]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[2px]">Camera</div>
                  <div className="text-[11.5px] text-[#0047CC] font-[600]">FaceTime HD Camera, 1280×720 detected</div>
                </div>
                <span className="text-[11px] font-[800] tracking-[0.4px] bg-[#EBF6FF] text-[#0047CC] py-1 px-[10px] rounded-[6px] uppercase flex items-center gap-1">
                  <CheckIcon className="w-[11px] h-[11px]" />
                  Ready
                </span>
              </div>

              <div className="flex items-center gap-[14px] p-[12px_14px] bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[10px]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[2px]">Microphone</div>
                  <div className="text-[11.5px] text-[#0047CC] font-[600]">Default input · audio levels healthy</div>
                </div>
                <span className="text-[11px] font-[800] tracking-[0.4px] bg-[#EBF6FF] text-[#0047CC] py-1 px-[10px] rounded-[6px] uppercase flex items-center gap-1">
                  <CheckIcon className="w-[11px] h-[11px]" />
                  Ready
                </span>
              </div>

              <div className="flex items-center gap-[14px] p-[12px_14px] bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[10px]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[2px]">Connection</div>
                  <div className="text-[11.5px] text-[#0047CC] font-[600]">Stable · 18 Mbps up · suitable for upload</div>
                </div>
                <span className="text-[11px] font-[800] tracking-[0.4px] bg-[#EBF6FF] text-[#0047CC] py-1 px-[10px] rounded-[6px] uppercase flex items-center gap-1">
                  <CheckIcon className="w-[11px] h-[11px]" />
                  Ready
                </span>
              </div>

              <div className="flex items-center gap-[14px] p-[12px_14px] bg-[#FAFCFF] border border-[#387DFF]/20 rounded-[10px]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EBF6FF] text-[#0047CC] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-[800] text-[#1A1A1A] mb-[2px]">Lighting</div>
                  <div className="text-[11.5px] text-[#0047CC] font-[600]">Good. Try to have the light source in front of you, not behind</div>
                </div>
                <span className="text-[11px] font-[800] tracking-[0.4px] bg-[#EBF6FF] text-[#0047CC] py-1 px-[10px] rounded-[6px] uppercase flex items-center gap-1">
                  <CheckIcon className="w-[11px] h-[11px]" />
                  Good
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[20px_22px] mb-[22px]">
          <div className="text-[11px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[12px]">Quick rules before you begin</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>
              </svg>
              Each question is timed. Most have a 3-minute answer cap.
            </div>
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
              </svg>
              You can pause between questions, not during one.
            </div>
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>
              </svg>
              Don&apos;t switch tabs during recording. Auto-submits in 3 seconds.
            </div>
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Use &quot;Save and continue later&quot; if you need a real break.
            </div>
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              Speak naturally. No need to sound rehearsed.
            </div>
            <div className="flex gap-[9px] items-start font-[600] text-[12.5px] text-[#1A1A1A] leading-[1.5]">
              <svg className="w-[14px] h-[14px] text-[#0047CC] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 16V8" stroke-linecap="round"/>
              </svg>
              If something breaks, your progress saves automatically.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white/96 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[16px] sm:px-[32px] py-[12px] sm:py-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-[12px] z-[40]">
        <div className="text-[12.5px] sm:text-[13px] text-[#808080] font-[600] text-center sm:text-left">
          When you tap Begin, the first question unfurls and the clock starts.
        </div>
        <div className="flex items-center gap-[8px] sm:gap-[10px] w-full sm:w-auto">
          <button
            onClick={handleNotNow}
            className="flex-1 sm:flex-initial bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-xl py-2.5 sm:py-[11px] px-3 sm:px-[18px] text-[12.5px] sm:text-[13.5px] font-[700] cursor-pointer hover:bg-[#F7F7F7] whitespace-nowrap text-center justify-center flex items-center"
          >
            Not now
          </button>
          <Button
            onClick={handleBegin}
            className="flex-1 sm:flex-initial bg-[#0047CC] text-white border-none rounded-xl py-2.5 sm:py-[12px] px-4 sm:px-[24px] text-[12.5px] sm:text-[14px] font-[700] cursor-pointer inline-flex items-center justify-center gap-[8px] shadow-[0_4px_14px_rgba(0,71,204,0.28)] whitespace-nowrap hover:bg-[#344DA1]"
            fullWidth={false}
            pill={false}
          >
            Begin video interview
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" className="shrink-0">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default RoleAssessmentStageThreeIntro;
