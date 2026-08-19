import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoAppraisal: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={2}
      interviewTitle="Research and evidence appraisal"
      sectionTitle="Read this study, then appraise it"
      sectionSub="Appraise research findings and critically evaluate evidence for public health programming."
      whyMattersText="Senior officers at Reach Africa frequently get sent 'evidence' by donors and partners. Reading it well, especially what it doesn't say, is a daily defence against bad decisions."
      nextPath="assessment/stage-2/part-3/interview-3"
      partNumber={3}
      timeLimitSeconds={12 * 60}
    />
  );
};

export default RoleAssessmentStageTwoAppraisal;
