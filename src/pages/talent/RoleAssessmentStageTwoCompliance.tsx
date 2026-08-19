import React, { useEffect } from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoCompliance: React.FC = () => {
  useEffect(() => {
    localStorage.setItem('vora_stage2_part2_unlocked', 'true');
  }, []);

  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={3}
      interviewTitle="Compliance and ethics"
      sectionTitle="The guardrails health programmes live inside"
      sectionSub="Grounded questions on consent, confidentiality, conflicts of interest and regulatory accountability. Last interview in Part 1."
      whyMattersText="Reach Africa works across NGO, donor and government structures. Misjudging where the lines sit creates organisational risk and damages community trust."
      nextPath="assessment/stage-2/part-1/complete"
      partNumber={1}
    />
  );
};

export default RoleAssessmentStageTwoCompliance;
