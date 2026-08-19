import React from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoMalariaProtocol: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={2}
      interviewTitle="Malaria Diagnostic Protocol"
      sectionTitle="Guidelines for malaria testing and treatment"
      sectionSub="Diagnostic confirmation, severe malaria triage, and pregnancy precautions. Part 2 Interview 2."
      whyMattersText="Malaria remains a leading cause of clinic visits. Adhering to test-based prescribing prevents drug resistance and ensures severe cases receive lifesaving parenteral therapy without delay."
      nextPath="assessment/stage-2/part-2/interview-3"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoMalariaProtocol;
