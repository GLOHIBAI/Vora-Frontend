import React, { useEffect } from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Question 1 of 6',
    questionText: 'What is the standard recommended storage temperature range for most childhood vaccines (e.g., BCG, Pentavalent, Measles) at the facility level?',
    options: [
      { letter: 'A', text: '+2°C to +8°C' },
      { letter: 'B', text: '-15°C to -25°C' },
      { letter: 'C', text: '0°C to +4°C' },
      { letter: 'D', text: '+10°C to +15°C' }
    ]
  },
  {
    id: 'q2',
    numText: 'Question 2 of 6',
    questionText: 'The refrigerator temperature log shows a reading of +14°C at the morning check. What is your immediate response?',
    options: [
      { letter: 'A', text: 'Move vaccines to a pre-cooled cold box, investigate the refrigerator power/seal, label stock as quarantined, and report the excursion.' },
      { letter: 'B', text: 'Discard all vaccines in the refrigerator immediately.' },
      { letter: 'C', text: 'Reset the thermometer and check the temperature again at the end of the day.' },
      { letter: 'D', text: 'Close the door tightly and wait 12 hours for the temperature to stabilize.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Question 3 of 6',
    questionText: 'A Vaccine Vial Monitor (VVM) on a polio vial shows the inner square has turned the same color as the outer circle. What does this signal?',
    options: [
      { letter: 'A', text: 'The vaccine has reached its heat limits and must be discarded.' },
      { letter: 'B', text: 'The vaccine is at peak potency and must be used immediately.' },
      { letter: 'C', text: 'The vaccine has frozen and needs to be thawed.' },
      { letter: 'D', text: 'The vaccine batch is contaminated.' }
    ]
  },
  {
    id: 'q4',
    numText: 'Question 4 of 6',
    questionText: 'Which of the following common childhood vaccines is highly freeze-sensitive and damaged by sub-zero temperatures?',
    options: [
      { letter: 'A', text: 'Tetanus Toxoid / Pentavalent (DTP-HepB-Hib) vaccine.' },
      { letter: 'B', text: 'Oral Polio Vaccine (OPV).' },
      { letter: 'C', text: 'Measles-Rubella vaccine.' },
      { letter: 'D', text: 'BCG vaccine.' }
    ]
  },
  {
    id: 'q5',
    numText: 'Question 5 of 6',
    questionText: 'What is the primary clinical purpose of performing a "shake test" in a vaccination campaign clinic?',
    options: [
      { letter: 'A', text: 'To determine if a freeze-sensitive vaccine has been damaged by accidental sub-zero exposure.' },
      { letter: 'B', text: 'To ensure a reconstituted vaccine is thoroughly mixed before dose withdrawal.' },
      { letter: 'C', text: 'To check if the vaccine solution contains any expired particulate matter.' },
      { letter: 'D', text: 'To verify if the glass vial has any structural fractures.' }
    ]
  },
  {
    id: 'q6',
    numText: 'Question 6 of 6',
    questionText: 'When preparing a vaccine carrier for outreach, how should frozen ice packs be managed to protect freeze-sensitive vaccines?',
    options: [
      { letter: 'A', text: 'Condition them at room temperature until water droplets form and ice sloshes inside.' },
      { letter: 'B', text: 'Place them directly from the freezer into contact with the vaccine vials.' },
      { letter: 'C', text: 'Submerge them in hot water for 5 minutes before packing.' },
      { letter: 'D', text: 'Use dry ice instead of standard water ice packs.' }
    ]
  }
];

const RoleAssessmentStageTwoColdChain: React.FC = () => {
  useEffect(() => {
    localStorage.setItem('vora_stage2_part3_unlocked', 'true');
  }, []);

  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={3}
      interviewTitle="Cold-chain Compliance"
      sectionTitle="Logistics and temperature control rules"
      sectionSub="Six questions on cold-chain excursions, freeze protection, and vial validation. Last interview in Part 2."
      whyMattersText="Reach Africa operates outreaches in remote rural clusters under high ambient temperatures. Poor cold-chain compliance renders vaccines ineffective, leaving communities unprotected."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-2/complete"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoColdChain;
