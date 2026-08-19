import React, { useEffect } from 'react';
import RoleAssessmentStageTwoInterviewBase from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const RoleAssessmentStageTwoColdChain: React.FC = () => {
  useEffect(() => {
    localStorage.setItem('vora_stage2_part3_unlocked', 'true');
  }, []);

  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={3}
      interviewTitle="Cold-chain Compliance"
      sectionTitle="Logistics and temperature control rules"
      sectionSub="Cold-chain excursions, freeze protection, and vial validation. Last interview in Part 2."
      whyMattersText="Reach Africa operates outreaches in remote rural clusters under high ambient temperatures. Poor cold-chain compliance renders vaccines ineffective, leaving communities unprotected."
      nextPath="assessment/stage-2/part-2/complete"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoColdChain;
