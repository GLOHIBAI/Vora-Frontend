import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoChildMalnutrition: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={1}
      interviewTitle="Child Malnutrition Screening"
      sectionTitle="Identifying and classifying child wasting"
      sectionSub="MUAC measurement, oedema checks, and outpatient therapeutic protocols. Part 2 Interview 1."
      whyMattersText="Reach Africa outreaches screen hundreds of children weekly. Accurate diagnosis ensures therapeutic foods reach children in critical need without overloading stabilization wards."
      nextPath="assessment/stage-2/part-2/interview-2"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoChildMalnutrition;
