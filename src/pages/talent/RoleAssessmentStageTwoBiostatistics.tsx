import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoBiostatistics: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={2}
      interviewTitle="Biostatistics"
      sectionTitle="Reading the numbers behind the work"
      sectionSub="Questions about the statistics you'll actually run into in public health data."
      whyMattersText="You'll sign off on internal reports and answer donor questions on coverage, prevalence, and impact. Misreading a confidence interval at this level has consequences downstream."
      nextPath="assessment/stage-2/part-1/interview-3"
      partNumber={1}
    />
  );
};

export default RoleAssessmentStageTwoBiostatistics;
