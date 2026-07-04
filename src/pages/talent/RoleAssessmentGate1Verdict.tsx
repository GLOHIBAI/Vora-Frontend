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
    if (!verdict || verdict.verdict === 'pending' || !roleSlug) return;

    if (verdict.verdict === 'pass') {
      localStorage.setItem('vora_stage2_unlocked', 'true');
      navigate(`/onboarding/talent/${roleSlug}/assessment/session-2/results`, { replace: true });
      return;
    }

    navigate(`/onboarding/talent/${roleSlug}/assessment/session-2/outcome`, { replace: true });
  }, [verdict, roleSlug, navigate]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6">
      <VoraLogo size="sm" to="/dashboard" />
      <div className="mt-8 max-w-md text-center">
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Scoring Stage 1</h1>
        <p className="text-sm text-[#808080]">
          We&apos;re reviewing your full Stage 1 profile. This usually takes a moment.
        </p>
        {verdict?.score != null ? (
          <p className="text-sm text-[#0047CC] font-semibold mt-4">
            Score: {Math.round(verdict.score * (verdict.score <= 1 ? 100 : 1))}%
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default RoleAssessmentGate1Verdict;
