import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AssessmentAnalyzingView from '../../components/talent/assessment/AssessmentAnalyzingView';

const RoleAssessmentSessionTwoAnalyzing: React.FC = () => {
  const { roleSlug = '' } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  const schedule = useMemo(
    () => [
      { atMs: 4000, stepIndex: 3 },
      { atMs: 8500, stepIndex: 4 },
      { atMs: 12500, stepIndex: 5 },
    ],
    [],
  );

  return (
    <AssessmentAnalyzingView
      roleSlug={roleSlug}
      eyebrow="Reading how you think and what you value"
      title="Reading how you think and what you value"
      subtitle={
        <>
          {firstName}, give us a moment. We&apos;re cross-checking your responses across both sessions to make sure the
          picture we&apos;re building of you is genuinely fair before we share anything with the hiring team.
        </>
      }
      steps={[
        'Cleaning up your responses',
        'Mapping working style and values',
        'Comparing your psychometric and scenario instincts',
        'Building your honest profile snapshot',
        'Preparing your detailed breakdown',
      ]}
      initialStepIndex={2}
      schedule={schedule}
      redirectAtMs={16000}
      redirectPath="interview/session-2/results"
      footerNote="This usually takes 20 to 40 seconds. Please don't close this tab."
      headerMeta="Stage 1 review in progress"
    />
  );
};

export default RoleAssessmentSessionTwoAnalyzing;
