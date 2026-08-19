import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoPharmacology: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={1}
      interviewTitle="Pharmacology in the field"
      sectionTitle="Medications at the edge of the system"
      sectionSub="Clinically grounded questions, paced for your seniority. The timer covers all items in this section."
      whyMattersText="Reach Africa programmes carry medication kits into peri-urban communities. Your team will look to you for the safety calls when something doesn't go to plan."
      nextPath="assessment/stage-2/part-1/interview-2"
      partNumber={1}
    />
  );
};

export default RoleAssessmentStageTwoPharmacology;
