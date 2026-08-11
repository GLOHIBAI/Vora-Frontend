import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import { useAssessmentGatesProgressQuery, useGateVerdictQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, parseGateProgressEntries, unwrapAssessmentData } from '../../utils/assessmentSession';
import type { GateVerdictResponse } from '../../services/queries/assessments/types';

const RoleAssessmentStageTwoAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const { data: verdictRaw } = useGateVerdictQuery(assessmentId, 2, {
    enabled: !!assessmentId,
    refetchInterval: 2500,
  });
  const verdict = unwrapAssessmentData<GateVerdictResponse>(verdictRaw);

  const { data: progressRaw } = useAssessmentGatesProgressQuery(assessmentId, {
    enabled: !!assessmentId,
    refetchInterval: 2500,
  });

  const schedule = useMemo(
    () => [
      { atMs: 1200, stepIndex: 1 },
      { atMs: 2400, stepIndex: 2 },
      { atMs: 3600, stepIndex: 3 },
      { atMs: 4800, stepIndex: 4 },
    ],
    [],
  );

  useEffect(() => {
    // 1. Primary check: check dynamic gate 2 verdict status from server
    if (verdict) {
      if (verdict.status === 'generating') {
        return; // Keep showing analyzing/generating screen
      }
      const isPassed = verdict.passed === true || verdict.verdict === 'pass' || verdict.verdict === 'qualified' || verdict.outcome === 'passed';
      const isFailed = verdict.passed === false || verdict.verdict === 'fail' || verdict.verdict === 'not_yet' || verdict.outcome === 'failed' || verdict.roleLocked === true;

      if (isPassed) {
        localStorage.setItem('vora_stage2_completed', 'true');
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
        return;
      }
      if (isFailed) {
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/outcome`, { replace: true });
        return;
      }
    }

    // 2. Fallback check: check gate progress rollup entries
    if (!progressRaw) return;
    const entries = parseGateProgressEntries(progressRaw);
    const gate2 = entries.find((e) => String(e.gate) === '2');

    if (gate2?.status === 'passed' || gate2?.status === 'completed') {
      localStorage.setItem('vora_stage2_completed', 'true');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
    } else if (gate2?.status === 'failed') {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/outcome`, { replace: true });
    }
  }, [verdict, progressRaw, roleSlug, navigate]);

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      title="Scoring Stage 2"
      subtitle="We're reviewing your full Stage 2 profile."
      steps={[
        'Knowledge interviews (Part 1) cross-checked',
        'Expertise interviews (Part 2) reviewed',
        'Reasoning patterns (Part 3) read against role demands',
        'Written simulations (Part 4) scored for clarity and tone',
        'Performing response consistency & integrity checks',
      ]}
      initialStepIndex={0}
      schedule={schedule}
      redirectAtMs={8000}
      redirectPath="interview/stage-2/results"
    />
  );
};

export default RoleAssessmentStageTwoAnalyzing;
