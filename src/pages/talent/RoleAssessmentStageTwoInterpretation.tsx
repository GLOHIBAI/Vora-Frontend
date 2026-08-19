import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoInterpretation: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={3}
      interviewTitle="Health data interpretation"
      sectionTitle="Make sense of the numbers in front of you"
      sectionSub="Grounded questions about health programme datasets and performance indicators. Last interview in Part 3."
      whyMattersText="Programme dashboards arrive in your inbox every Monday at Reach Africa. Reading them well is the difference between catching a problem early and finding out from a donor in week ten."
      nextPath="assessment/stage-2/part-3/complete"
      partNumber={3}
      timeLimitSeconds={12 * 60}
    />
  );
};

export default RoleAssessmentStageTwoInterpretation;
