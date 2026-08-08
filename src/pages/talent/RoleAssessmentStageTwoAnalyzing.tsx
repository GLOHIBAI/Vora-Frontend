import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';
import { useAssessmentGatesProgressQuery } from '../../services/queries/assessments';
import { resolveGate1AssessmentId } from '../../config/gate1Api';
import { getActiveAssessmentId, parseGateProgressEntries } from '../../utils/assessmentSession';

const RoleAssessmentStageTwoAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const assessmentId = resolveGate1AssessmentId() || getActiveAssessmentId() || '';

  const { data: progressRaw } = useAssessmentGatesProgressQuery(assessmentId, {
    enabled: !!assessmentId,
    refetchInterval: 2000,
  });

  const schedule = useMemo(
    () => [
      { atMs: 2500, stepIndex: 3 },
      { atMs: 5000, stepIndex: 4 },
    ],
    [],
  );

  useEffect(() => {
    if (!progressRaw) return;
    const entries = parseGateProgressEntries(progressRaw);
    const gate2 = entries.find((e) => String(e.gate) === '2');

    if (gate2?.status === 'passed' || gate2?.status === 'completed') {
      localStorage.setItem('vora_stage2_completed', 'true');
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/results`, { replace: true });
    } else if (gate2?.status === 'failed') {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2/outcome`, { replace: true });
    }
  }, [progressRaw, roleSlug, navigate]);

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      eyebrow="Reading your Stage 2 in detail"
      title="Working through everything you submitted"
      subtitle="Part 1, Part 2, Part 3 and Part 4 together took you through knowledge, expertise, reasoning and written simulations. We're matching the patterns now."
      steps={[
        'Knowledge interviews (Part 1) cross-checked',
        'Expertise interviews (Part 2) reviewed',
        'Reasoning patterns (Part 3) read against role demands',
        'Written simulations (Part 4) scored for clarity and tone',
      ]}
      initialStepIndex={2}
      schedule={schedule}
      redirectAtMs={10000}
      redirectPath="interview/stage-2/results"
      footerNote="This usually takes 30 to 60 seconds"
      headerMeta="Stage 2 review in progress"
    />
  );
};

export default RoleAssessmentStageTwoAnalyzing;
