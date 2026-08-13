import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoraLogo from '../../common/VoraLogo';

export type AssessmentAnalyzingStepSchedule = {
  /** Absolute ms from mount when this step index becomes active (or done if past last). */
  atMs: number;
  /** Active step index after this tick (use steps.length to mark all done). */
  stepIndex: number;
};

export type AssessmentAnalyzingViewProps = {
  eyebrow?: string;
  title: string;
  subtitle: React.ReactNode;
  steps: string[];
  /** Starting active step index (0-based). */
  initialStepIndex?: number;
  /** Timed advances; last entry typically sets stepIndex to steps.length. */
  schedule: AssessmentAnalyzingStepSchedule[];
  /** Optional absolute ms from mount when navigation fires. */
  redirectAtMs?: number;
  /** Path relative to /onboarding/talent/:roleSlug/ or absolute app path. */
  redirectPath?: string;
  roleSlug: string;
  footerNote?: string;
  headerMeta?: string;
};

/**
 * Shared “working through your answers” screen styled after Stage 1 scoring view.
 */
const AssessmentAnalyzingView: React.FC<AssessmentAnalyzingViewProps> = ({
  title,
  subtitle,
  steps,
  initialStepIndex = 0,
  schedule,
  redirectAtMs,
  redirectPath,
  roleSlug,
}) => {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(initialStepIndex);

  useEffect(() => {
    const timers = schedule.map(({ atMs, stepIndex }) =>
      window.setTimeout(() => setStepIdx(stepIndex), atMs),
    );

    let redirectTimer: number | null = null;
    if (redirectAtMs && redirectAtMs > 0 && redirectPath) {
      redirectTimer = window.setTimeout(() => {
        const path = redirectPath.startsWith('/')
          ? redirectPath
          : `/onboarding/talent/${roleSlug}/${redirectPath}`;
        navigate(path, { replace: true });
      }, redirectAtMs);
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [navigate, redirectAtMs, redirectPath, roleSlug, schedule]);

  let currentPercent = Math.min(100, Math.round(((stepIdx + 1) / steps.length) * 100));
  if (currentPercent >= 100 && stepIdx < steps.length) {
    currentPercent = 95;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 font-sans">
      <VoraLogo size="md" to="/dashboard" />

      <div className="mt-8 max-w-[460px] w-full bg-white border border-[#E6E6E6] rounded-[18px] p-8 shadow-[0_8px_30px_rgba(10,17,114,0.04)] flex flex-col">
        {/* Loading Spinner Header */}
        <div className="flex items-center gap-3 mb-6">
          <svg className="animate-spin h-6 w-6 text-[#0047CC] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <h1 className="text-[17px] font-[900] text-[#1A1A1A] leading-none mb-1">{title}</h1>
            <div className="text-[12.5px] text-[#808080] leading-tight">
              {subtitle}
            </div>
          </div>
        </div>

        {/* Steps Checklist */}
        <div className="space-y-4 mb-6">
          {steps.map((text, idx) => {
            const isCompleted = idx < stepIdx;
            const isActive = idx === stepIdx;

            return (
              <div key={idx} className="flex gap-3 items-center">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#0047CC] border border-[#0047CC] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-[#EBF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#387DFF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0047CC]"></span>
                    </span>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white border border-[#E6E6E6] shrink-0" />
                )}
                <span className={`text-[13px] font-[600] leading-tight ${isActive ? 'text-[#1A1A1A] font-[700]' : isCompleted ? 'text-[#4A4A4A]' : 'text-[#ADADAD]'}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Scoring progress bar */}
        <div className="mt-2 pt-4 border-t border-[#F1F5F9]">
          <div className="w-full bg-[#E2E8F0] h-[6px] rounded-full overflow-hidden mb-2.5">
            <div className="bg-[#0047CC] h-full transition-all duration-500" style={{ width: `${currentPercent}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-[#808080] font-[700] uppercase tracking-[0.5px]">
            <span>REVIEWING PROFILE</span>
            <span className="tabular-nums text-[#0047CC]">{currentPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentAnalyzingView;

