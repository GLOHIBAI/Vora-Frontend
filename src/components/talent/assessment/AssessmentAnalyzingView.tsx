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
  eyebrow: string;
  title: string;
  subtitle: React.ReactNode;
  steps: string[];
  /** Starting active step index (0-based). */
  initialStepIndex?: number;
  /** Timed advances; last entry typically sets stepIndex to steps.length. */
  schedule: AssessmentAnalyzingStepSchedule[];
  /** Absolute ms from mount when navigation fires. */
  redirectAtMs: number;
  /** Path relative to /onboarding/talent/:roleSlug/ or absolute app path. */
  redirectPath: string;
  roleSlug: string;
  footerNote?: string;
  headerMeta?: string;
};

/**
 * Shared “working through your answers” screen used after stage review submit.
 */
const AssessmentAnalyzingView: React.FC<AssessmentAnalyzingViewProps> = ({
  eyebrow,
  title,
  subtitle,
  steps,
  initialStepIndex = 0,
  schedule,
  redirectAtMs,
  redirectPath,
  roleSlug,
  footerNote = 'This usually takes 30 to 60 seconds',
  headerMeta,
}) => {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(initialStepIndex);

  useEffect(() => {
    const timers = schedule.map(({ atMs, stepIndex }) =>
      window.setTimeout(() => setStepIdx(stepIndex), atMs),
    );

    const redirectTimer = window.setTimeout(() => {
      const path = redirectPath.startsWith('/')
        ? redirectPath
        : `/onboarding/talent/${roleSlug}/${redirectPath}`;
      navigate(path);
    }, redirectAtMs);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(redirectTimer);
    };
    // schedule is intentionally from memoized parent arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, redirectAtMs, redirectPath, roleSlug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1129] via-[#182348] to-[#0A1129] text-white font-sans overflow-x-hidden flex flex-col items-center justify-center p-[40px_24px] relative">
      <style>{`
        .pulse-ring-anim::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 125, 255, 0.2) 0%, transparent 70%);
          animation: pulseRing 3s ease-in-out infinite;
        }
        .pulse-ring-anim::after {
          content: '';
          position: absolute;
          inset: 30px;
          border-radius: 50%;
          border: 1.5px solid rgba(56, 125, 255, 0.3);
          animation: rotateRing 18s linear infinite;
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: .5; }
          50% { transform: scale(1.18); opacity: .85; }
        }
        @keyframes rotateRing {
          to { transform: rotate(360deg); }
        }
        .v-mark-path {
          stroke: #fff;
          stroke-width: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawV 2.5s ease forwards infinite;
        }
        @keyframes drawV {
          0% { stroke-dashoffset: 300; opacity: 0; }
          10% { opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: .6; }
        }
        .scan-sweep-anim {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, #85E585 50%, transparent 100%);
          top: 50%;
          animation: sweepDown 2.2s ease-in-out infinite;
          box-shadow: 0 0 24px rgba(133, 229, 133, .6);
          z-index: 3;
        }
        @keyframes sweepDown {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 90%; opacity: 1; }
          60% { opacity: 0; }
          100% { top: 10%; opacity: 0; }
        }
        .live-dot-anim {
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(133, 229, 133, .5); }
          50% { box-shadow: 0 0 0 5px rgba(133, 229, 133, 0); }
        }
        .step-pulse::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #85E585;
          animation: dotPulse 1s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .3; }
        }
      `}</style>

      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-[1]"
        style={{
          backgroundImage: 'radial-gradient(rgba(56,125,255,0.15) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_30%,rgba(56,125,255,0.18)_0%,transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(133,229,133,0.06)_0%,transparent_50%)]" />

      <div className="absolute top-6 left-8 right-8 z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-[1px] text-white">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        {headerMeta ? (
          <div className="text-[12.5px] text-white/60 font-[600] tracking-[0.3px]">{headerMeta}</div>
        ) : null}
      </div>

      <div className="inner relative z-[2] text-center max-w-[580px] w-full mt-10">
        <div className="heart-stage w-[220px] h-[220px] mx-auto mb-6 relative flex items-center justify-center pulse-ring-anim">
          <svg className="w-[130px] h-[130px] z-[2] relative filter drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]" viewBox="0 0 100 100">
            <path className="v-mark-path" d="M8 51 L27 51 L42 74 L58 29 L66 17 L72 41 L75 39 L78 41 L91 41" />
          </svg>
          <div className="scan-sweep-anim" />
        </div>

        <div className="eyebrow inline-flex items-center gap-[8px] bg-[#0047CC]/20 border border-[#38BDF8]/40 rounded-full px-4 py-1.5 backdrop-blur-md mb-4 shadow-[0_0_16px_rgba(0,71,204,0.3)]">
          <div className="w-[8px] h-[8px] rounded-full bg-[#34D399] live-dot-anim shadow-[0_0_8px_#34D399]" />
          <span className="text-[12px] font-[800] tracking-[0.8px] uppercase text-[#38BDF8]">{eyebrow}</span>
        </div>

        <h1 className="text-[32px] font-[900] tracking-[-0.5px] leading-[1.25] mb-3 bg-gradient-to-r from-white via-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent">{title}</h1>
        <div className="text-[14.5px] text-[#CBD5E1] leading-[1.65] mb-7 max-w-[500px] mx-auto font-medium">{subtitle}</div>

        {/* Progress Bar & Percentage */}
        <div className="max-w-[460px] mx-auto mb-6 px-1">
          <div className="flex justify-between items-center text-[12px] font-[800] tracking-wider text-[#94A3B8] uppercase mb-2">
            <span>Analyzing Progress</span>
            <span className="text-[#34D399]">
              {Math.min(100, Math.round((Math.min(stepIdx + 1, steps.length) / steps.length) * 100))}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#1E293B] rounded-full overflow-hidden p-0.5 border border-[#334155]">
            <div
              className="h-full bg-gradient-to-r from-[#0047CC] via-[#38BDF8] to-[#34D399] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{
                width: `${Math.min(100, Math.round((Math.min(stepIdx + 1, steps.length) / steps.length) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Colorful Steps Container */}
        <div className="steps flex flex-col gap-2.5 bg-[#0F172A]/90 border border-[#38BDF8]/25 rounded-[16px] p-5 backdrop-blur-xl max-w-[460px] mx-auto mb-7 text-left shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          {steps.map((text, idx) => {
            const isDone = idx < stepIdx;
            const isActive = idx === stepIdx;
            return (
              <div
                key={text}
                className={`step flex items-center gap-3 text-[13.5px] font-[600] py-2 px-3 rounded-xl transition-all duration-300 ${
                  isDone
                    ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 font-bold'
                    : isActive
                    ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)]'
                    : 'bg-white/[0.03] text-[#64748B] border border-white/[0.05]'
                }`}
              >
                <div
                  className={`step-icon w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? 'bg-[#10B981] text-[#0A1129] shadow-[0_0_10px_rgba(16,185,129,0.6)] font-extrabold'
                      : isActive
                      ? 'bg-[#38BDF8]/20 border-2 border-[#38BDF8] text-[#38BDF8] step-pulse'
                      : 'bg-white/[0.08] text-[#64748B]'
                  }`}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span className="leading-snug">{text}</span>
              </div>
            );
          })}
        </div>

        <div className="counter text-[11.5px] font-[800] text-[#94A3B8] tracking-[1.2px] uppercase">{footerNote}</div>
      </div>
    </div>
  );
};

export default AssessmentAnalyzingView;
