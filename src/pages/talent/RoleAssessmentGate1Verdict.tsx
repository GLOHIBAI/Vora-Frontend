import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const VERDICT_POLL_MS = 3000;

const SCORING_STEPS = [
  { label: 'Analyzing work style and personality dimensions' },
  { label: 'Mapping core professional values & motivators' },
  { label: 'Evaluating numerical data interpretation' },
  { label: 'Reviewing fluid logic & pattern recognition' },
  { label: 'Grading situational decision frameworks' },
  { label: 'Performing response consistency & integrity checks' },
];

const RoleAssessmentGate1Verdict: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 1, {
    enabled: !!assessmentId,
    refetchInterval: VERDICT_POLL_MS,
  });

  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const [activeStep, setActiveStep] = useState(0);

  // Sequential progression of UI loading check items
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < SCORING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!verdict || !roleSlug) return;

    const isGenerating = verdict.status === 'generating';
    const isPending = verdict.verdict === 'pending';
    if (isGenerating || isPending) return;

    const isPassed =
      verdict.passed === true ||
      verdict.outcome === 'passed' ||
      verdict.verdict === 'pass' ||
      verdict.verdict === 'qualified';

    if (isPassed) {
      localStorage.setItem('vora_stage2_unlocked', 'true');
      navigate(`/onboarding/talent/${roleSlug}/assessment/session-2/results`, { replace: true });
      return;
    }

    navigate(`/onboarding/talent/${roleSlug}/assessment/session-2/outcome`, { replace: true });
  }, [verdict, roleSlug, navigate]);

  const currentPercent = Math.round(((activeStep + 1) / SCORING_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6">
      <VoraLogo size="md" to="/dashboard" />
      
      <div className="mt-8 max-w-[460px] w-full bg-white border border-[#E6E6E6] rounded-[18px] p-8 shadow-[0_8px_30px_rgba(10,17,114,0.04)] flex flex-col">
        {/* Loading Spinner Header */}
        <div className="flex items-center gap-3 mb-6">
          <svg className="animate-spin h-6 w-6 text-[#0047CC] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <h1 className="text-[17px] font-[900] text-[#1A1A1A] leading-none mb-1">Scoring Stage 1</h1>
            <p className="text-[12.5px] text-[#808080] leading-none">
              We&apos;re reviewing your full Stage 1 profile.
            </p>
          </div>
        </div>

        {/* Steps Checklist */}
        <div className="space-y-4 mb-6">
          {SCORING_STEPS.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            
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
                  {step.label}
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
            <span>Reviewing profile</span>
            <span className="tabular-nums text-[#0047CC]">{currentPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssessmentGate1Verdict;
