import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import { useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const VERDICT_POLL_MS = 3000;

const SCORING_STEPS = [
  'Analyzing work style and personality dimensions',
  'Mapping core professional values & motivators',
  'Evaluating numerical data interpretation',
  'Reviewing fluid logic & pattern recognition',
  'Grading situational decision frameworks',
  'Performing response consistency & integrity checks',
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
      navigate(`/onboarding/talent/${roleSlug}/interview/session-2/results`, { replace: true });
      return;
    }

    navigate(`/onboarding/talent/${roleSlug}/interview/session-2/outcome`, { replace: true });
  }, [verdict, roleSlug, navigate]);

  const isGeneratingOrPending = !verdict || verdict.status === 'generating' || verdict.verdict === 'pending';
  let currentPercent = Math.round(((activeStep + 1) / SCORING_STEPS.length) * 100);
  if (isGeneratingOrPending && currentPercent >= 100) {
    currentPercent = 95;
  }

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      title="Scoring Stage 1"
      subtitle="Hang tight we're reviewing your full Stage 1 profile."
      steps={SCORING_STEPS}
      activeStepIndex={activeStep}
      progress={currentPercent}
    />
  );
};

export default RoleAssessmentGate1Verdict;

