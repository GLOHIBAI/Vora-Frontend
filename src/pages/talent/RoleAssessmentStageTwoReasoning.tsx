import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoReasoning: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={1}
      interviewTitle="Clinical scenario reasoning"
      sectionTitle="Read the situation, choose the strongest path"
      sectionSub="Programme situations that read like a real Reach Africa week. Your judgement under realistic pressure is what we're reading here."
      whyMattersText="Most weeks at Reach Africa, the cleanest answer isn't the right one. Your judgement under realistic pressure is what we're reading here."
      nextPath="assessment/stage-2/part-3/interview-2"
      partNumber={3}
      timeLimitSeconds={12 * 60}
    />
  );
};

export default RoleAssessmentStageTwoReasoning;
