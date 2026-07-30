import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RoleAssessmentStageTwoAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  // 0-indexed: step 2 (index 2) is active initially
  const [stepIdx, setStepIdx] = useState<number>(2);

  useEffect(() => {
    // Transition to step 3 (active) at 2.5s
    const t1 = setTimeout(() => {
      setStepIdx(3);
    }, 2500);

    // Make step 3 done at 5.0s (setting index beyond the last step)
    const t2 = setTimeout(() => {
      setStepIdx(4);
    }, 5000);

    // Redirect to results at 6.5s
    const t3 = setTimeout(() => {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`);
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigate, roleSlug]);

  const steps = [
    { text: 'Knowledge interviews (Part 1) cross-checked' },
    { text: 'Reasoning patterns (Part 2) read against role demands' },
    { text: 'Written simulations (Part 3) scored for clinical clarity and tone' },
    { text: 'Composite stage score being assembled' },
  ];

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

      {/* Grid pattern overlay (subtle addition for premium aesthetic) */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-[1]" 
        style={{
          backgroundImage: 'radial-gradient(rgba(56,125,255,0.15) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
        }}
      />

      {/* Backdrop glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_30%,rgba(56,125,255,0.18)_0%,transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(133,229,133,0.06)_0%,transparent_50%)]" />

      {/* Brand Top */}
      <div className="brand-top absolute top-6 left-8 display inline-flex items-center gap-[1px] color-[#fff] z-10">
        <svg className="w-[28px] h-[28px]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 51 L27 51 L42 74 L58 29 L66 17 L72 41 L75 39 L78 41 L91 41" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-[900] text-[21px] tracking-[-0.5px] ml-[-2px]">ORA</span>
      </div>

      <div className="inner relative z-[2] text-center max-w-[580px] w-full mt-10">
        {/* Heartbeat V stage */}
        <div className="heart-stage w-[240px] h-[240px] mx-auto mb-8 relative flex items-center justify-center pulse-ring-anim">
          <svg className="w-[140px] h-[140px] z-[2] relative" viewBox="0 0 100 100">
            <path className="v-mark-path" d="M8 51 L27 51 L42 74 L58 29 L66 17 L72 41 L75 39 L78 41 L91 41"/>
          </svg>
          <div className="scan-sweep-anim"></div>
        </div>

        {/* Eyebrow */}
        <div className="eyebrow inline-flex items-center gap-[8px] bg-white/[0.08] border border-white/[0.16] rounded-full p-[6px_14px] backdrop-blur-[6px] mb-[14px]">
          <div className="w-[7px] h-[7px] rounded-full bg-[#85E585] live-dot-anim"></div>
          <span className="text-[11.5px] font-[800] tracking-[0.7px] uppercase text-white/90">Reading your Stage 2 in detail</span>
        </div>

        <h1 className="text-[32px] font-[900] tracking-[-0.5px] leading-[1.2] mb-3 text-white">
          Working through everything you submitted
        </h1>
        <p className="text-[15px] text-white/78 leading-[1.65] mb-9 max-w-[480px] mx-auto">
          Part 1, Part 2 and Part 3 together took you through twelve interviews and four written simulations. We're matching the patterns now.
        </p>

        {/* Steps */}
        <div className="steps flex flex-col gap-2 bg-white/[0.06] border border-white/[0.1] rounded-[14px] p-4 sm:p-[16px_18px] backdrop-blur-[10px] max-w-[440px] mx-auto mb-7 text-left">
          {steps.map((st, idx) => {
            const isDone = idx < stepIdx;
            const isActive = idx === stepIdx;

            return (
              <div 
                key={idx} 
                className={`step flex items-center gap-[12px] text-[13.5px] font-[600] py-[6px] transition-colors duration-300 ${
                  isDone ? 'text-white/95' : isActive ? 'text-[#85E585]' : 'text-white/50'
                }`}
              >
                <div 
                  className={`step-icon w-[20px] h-[20px] rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    isDone 
                      ? 'bg-[#85E585] text-[#0A1129]' 
                      : isActive 
                        ? 'bg-[#85E585]/20 border-[1.5px] border-[#85E585] step-pulse' 
                        : 'bg-white/[0.08]'
                  }`}
                >
                  {isDone && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span>{st.text}</span>
              </div>
            );
          })}
        </div>

        <div className="counter text-[11px] font-[700] text-white/50 tracking-[1px] uppercase">
          This usually takes 30 to 60 seconds
        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentStageTwoAnalyzing;
