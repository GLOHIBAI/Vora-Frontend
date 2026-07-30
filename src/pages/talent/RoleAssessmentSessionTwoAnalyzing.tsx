import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VoraLogo from '../../components/common/VoraLogo';

const RoleAssessmentSessionTwoAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  const [activeIdx, setActiveIdx] = useState<number>(2); // 0-indexed, meaning step 3 (index 2) is active first

  useEffect(() => {
    // Step 3 (active) -> Step 4 (active) at 4s
    const t1 = setTimeout(() => {
      setActiveIdx(3);
    }, 4000);

    // Step 4 -> Step 5 (active) at 8.5s
    const t2 = setTimeout(() => {
      setActiveIdx(4);
    }, 8500);

    // Step 5 -> All done at 12.5s
    const t3 = setTimeout(() => {
      setActiveIdx(5);
    }, 12500);

    // Redirect to results at 16s
    const t4 = setTimeout(() => {
      navigate(`/onboarding/talent/${roleSlug}/interview/session-2/results`);
    }, 16000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [navigate, roleSlug]);

  const steps = [
    { text: 'Cleaning up your responses' },
    { text: 'Mapping working style and values' },
    { text: 'Comparing your psychometric and scenario instincts' },
    { text: 'Building your honest profile snapshot' },
    { text: 'Preparing your detailed breakdown' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1029] via-[#182348] to-[#0A1029] text-white font-sans flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.04); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes scanMove {
          0% { top: 14%; }
          50% { top: 86%; }
          100% { top: 14%; }
        }
        @keyframes floaty {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.6); opacity: 0.6; }
        }

        .ring-pulse-r1 { animation: ringPulse 3s ease-in-out infinite; }
        .ring-pulse-r2 { animation: ringPulse 3s ease-in-out infinite 0.4s; }
        .ring-pulse-r3 { animation: ringPulse 3s ease-in-out infinite 0.8s; }
        .ring-spin-dashed { animation: spin 22s linear infinite; }
        .ring-spin-dashed-rev { animation: spin 14s linear infinite reverse; }
        .logo-pulse-anim { animation: logoPulse 2.2s ease-in-out infinite; }
        .scan-line-anim { animation: scanMove 3.4s ease-in-out infinite; }
        .particle-float { animation: floaty 4s ease-in-out infinite; }
        .dot-pulse-anim { animation: dotPulse 1s ease-in-out infinite; }
      `}</style>

      {/* Grid background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60 z-[1]" 
        style={{
          backgroundImage: 'radial-gradient(rgba(56,125,255,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
        }}
      />

      {/* Top Bar */}
      <header className="relative z-10 px-[32px] py-[18px] flex items-center justify-between">
        <span className="inline-flex items-center gap-[1px] text-white">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-white/60 font-[600] tracking-[0.3px]">
          Stage 1 review in progress
        </div>
      </header>

      {/* Main Scene */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-[24px] py-[40px] text-center">
        
        {/* Scanner Frame */}
        <div className="relative w-[260px] h-[260px] mb-[38px] flex items-center justify-center">
          <div className="absolute inset-0 border-full rounded-full border-[1.5px] border-[#387DFF]/20 ring-pulse-r1" />
          <div className="absolute inset-[18px] border-full rounded-full border-[1.5px] border-[#387DFF]/30 ring-pulse-r2" />
          <div className="absolute inset-[36px] border-full rounded-full border-[1.5px] border-[#387DFF]/40 ring-pulse-r3" />
          <div className="absolute inset-0 border-full rounded-full border-[1.5px] border-dashed border-white/10 ring-spin-dashed" />
          <div className="absolute inset-[36px] border-full rounded-full border-[1px] border-dashed border-[#387DFF]/30 ring-spin-dashed-rev" />
          
          {/* Scan Line */}
          <div className="absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#387DFF] to-transparent shadow-[0_0_14px_#387DFF,0_0_28px_#387DFF] scan-line-anim opacity-85" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[4px] h-[4px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float top-[18%] left-[22%]" style={{ animationDelay: '0s' }} />
            <div className="absolute w-[4px] h-[4px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float top-[32%] right-[18%]" style={{ animationDelay: '0.6s' }} />
            <div className="absolute w-[4px] h-[4px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float bottom-[24%] left-[14%]" style={{ animationDelay: '1.2s' }} />
            <div className="absolute w-[4px] h-[4px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float bottom-[18%] right-[24%]" style={{ animationDelay: '1.8s' }} />
            <div className="absolute w-[3px] h-[3px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float top-[50%] left-[6%]" style={{ animationDelay: '2.4s' }} />
            <div className="absolute w-[3px] h-[3px] rounded-full bg-[#387DFF] shadow-[0_0_8px_#387DFF] particle-float top-[50%] right-[6%]" style={{ animationDelay: '3s' }} />
          </div>

          {/* Central core */}
          <div className="w-[128px] h-[128px] rounded-full bg-gradient-to-br from-[#0047CC]/50 to-[#182348]/20 flex items-center justify-center backdrop-blur-[6px] border border-[#387DFF]/35 shadow-[0_0_60px_rgba(0,71,204,0.3),inset_0_0_30px_rgba(56,125,255,0.15)]">
            <svg className="w-[64px] h-[64px] text-[#387DFF] logo-pulse-anim" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 51 L27 51 L42 74 L58 29 L66 17 L72 41 L75 39 L78 41 L91 41" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-[30px] font-[900] tracking-[-0.6px] leading-[1.2] text-white mb-[12px] max-w-[580px]">
          Reading how you think and what you value
        </h1>
        <p className="text-[15px] text-white/65 leading-[1.6] mb-[32px] max-w-[540px]">
          {firstName}, give us a moment. We&apos;re cross-checking your responses across both sessions to make sure the picture we&apos;re building of you is genuinely fair before we share anything with the hiring team.
        </p>

        {/* Steps Card */}
        <div className="flex flex-col gap-[10px] max-w-[420px] w-full text-left bg-white/[0.04] border border-white/[0.08] rounded-[16px] p-[18px_20px] backdrop-blur-[8px]">
          {steps.map((st, idx) => {
            const isDone = idx < activeIdx;
            const isActive = idx === activeIdx;
            const isPending = idx > activeIdx;

            return (
              <div 
                key={idx} 
                className={`flex items-center gap-[14px] py-[7px] transition-all duration-350 ${
                  isPending ? 'opacity-55' : ''
                }`}
              >
                {/* Step Circle Status Indicator */}
                <div 
                  className={`w-[22px] h-[22px] rounded-full flex-shrink-0 flex items-center justify-center border-[1.5px] transition-colors duration-200 ${
                    isDone 
                      ? 'bg-[#0047CC] border-[#0047CC]' 
                      : isActive 
                        ? 'bg-[#387DFF] border-[#387DFF] shadow-[0_0_0_4px_rgba(56,125,255,0.18)]' 
                        : 'bg-white/5 border-white/15'
                  }`}
                >
                  {isDone && (
                    <svg className="w-[11px] h-[11px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {isActive && (
                    <div className="w-[8px] h-[8px] rounded-full bg-white dot-pulse-anim" />
                  )}
                </div>

                {/* Step Text */}
                <div className={`text-[13.5px] flex-1 ${
                  isDone 
                    ? 'text-white/70' 
                    : isActive 
                      ? 'text-white font-[600]' 
                      : 'text-white/40 font-[500]'
                }`}>
                  {st.text}
                </div>

                {/* Meta */}
                <div className="text-[11px] text-white/45 font-[600] tracking-[0.4px] uppercase">
                  {isDone ? 'DONE' : isActive ? 'NOW' : 'SOON'}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-[30px] text-[12px] text-white/40 leading-[1.5] max-w-[480px]">
          <strong className="text-white/65 font-[700]">This usually takes 20 to 40 seconds.</strong> Please don&apos;t close this tab. You&apos;ll be moved to your results automatically.
        </p>
      </div>
    </div>
  );
};

export default RoleAssessmentSessionTwoAnalyzing;
