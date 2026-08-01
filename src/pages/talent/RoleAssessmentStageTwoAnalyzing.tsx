import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';

const RoleAssessmentStageTwoAnalyzing: React.FC = () => {
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();

  const schedule = useMemo(
    () => [
      { atMs: 2500, stepIndex: 3 },
      { atMs: 5000, stepIndex: 4 },
    ],
    [],
  );

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
      redirectAtMs={6500}
      redirectPath="interview/stage-2/results"
      footerNote="This usually takes 30 to 60 seconds"
      headerMeta="Stage 2 review in progress"
    />
  );
};

export default RoleAssessmentStageTwoAnalyzing;
