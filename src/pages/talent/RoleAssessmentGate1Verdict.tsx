import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VoraLogo from '../../components/common/VoraLogo';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const VERDICT_POLL_MS = 3000;

const RoleAssessmentGate1Verdict: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() ?? '';

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 1, {
    enabled: !!assessmentId,
    refetchInterval: VERDICT_POLL_MS,
  });

  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

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

  const currentScore = verdict?.score ?? (verdict as any)?.rollup?.score;

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6">
      <VoraLogo size="sm" to="/dashboard" />
      <div className="mt-8 max-w-md text-center flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-[#0047CC] mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Scoring Stage 1</h1>
        <p className="text-sm text-[#808080]">
          We&apos;re reviewing your full Stage 1 profile. This usually takes a moment.
        </p>
        {currentScore != null ? (
          <p className="text-sm text-[#0047CC] font-semibold mt-4">
            Score: {Math.round(currentScore * (currentScore <= 1 ? 100 : 1))}%
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default RoleAssessmentGate1Verdict;
