import React from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Question 1 of 6',
    questionText: 'When using a MUAC (Mid-Upper Arm Circumference) tape on a child aged 6 to 59 months, what is the threshold indicating Severe Acute Malnutrition (SAM)?',
    options: [
      { letter: 'A', text: 'Less than 115 mm (Red zone)' },
      { letter: 'B', text: 'Between 115 mm and 125 mm (Yellow zone)' },
      { letter: 'C', text: 'Between 125 mm and 135 mm (Green zone)' },
      { letter: 'D', text: 'Greater than 135 mm' }
    ]
  },
  {
    id: 'q2',
    numText: 'Question 2 of 6',
    questionText: 'You detect bilateral pitting oedema (fluid retention) in a 2-year-old child during screening. The MUAC reading is in the green zone (130 mm). What is the correct classification?',
    options: [
      { letter: 'A', text: 'Severe Acute Malnutrition (SAM) based on bilateral oedema, regardless of MUAC.' },
      { letter: 'B', text: 'Moderate Acute Malnutrition (MAM) because MUAC is normal.' },
      { letter: 'C', text: 'Normal nutritional status with localized swelling.' },
      { letter: 'D', text: 'Chronic malnutrition only.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Question 3 of 6',
    questionText: 'A child is identified with uncomplicated Severe Acute Malnutrition (SAM) and passes the RUTF appetite test. What is the standard treatment protocol?',
    options: [
      { letter: 'A', text: 'Outpatient management with Ready-to-Use Therapeutic Food (RUTF) and routine systemic antibiotics.' },
      { letter: 'B', text: 'Immediate transfer to a stabilization center for inpatient care.' },
      { letter: 'C', text: 'Referral to local community supplementary feeding programmes.' },
      { letter: 'D', text: 'Iron supplementation and multivitamin syrup at home.' }
    ]
  },
  {
    id: 'q4',
    numText: 'Question 4 of 6',
    questionText: 'Which clinical sign in a child with Severe Acute Malnutrition (SAM) is a complication requiring immediate inpatient stabilization?',
    options: [
      { letter: 'A', text: 'Intractable vomiting, severe dehydration, or failing the appetite test.' },
      { letter: 'B', text: 'Mild cough without respiratory distress.' },
      { letter: 'C', text: 'A MUAC measurement of 112 mm.' },
      { letter: 'D', text: 'Caregiver report of reduced playfulness.' }
    ]
  },
  {
    id: 'q5',
    numText: 'Question 5 of 6',
    questionText: 'What is the minimum follow-up frequency required for a child undergoing Outpatient Therapeutic Programme (OTP) care for malnutrition?',
    options: [
      { letter: 'A', text: 'Weekly visits for clinical review and RUTF ration replenishment.' },
      { letter: 'B', text: 'Bi-weekly checkups.' },
      { letter: 'C', text: 'Monthly monitoring.' },
      { letter: 'D', text: 'One follow-up visit after 6 weeks.' }
    ]
  },
  {
    id: 'q6',
    numText: 'Question 6 of 6',
    questionText: 'Why is the "appetite test" using RUTF considered a vital step in malnutrition screening?',
    options: [
      { letter: 'A', text: 'It assesses the child\'s physiological capacity to eat and tolerate food, determining if inpatient care is needed.' },
      { letter: 'B', text: 'It confirms if the child prefers the flavor profile of the RUTF brand.' },
      { letter: 'C', text: 'It measures the exact volume of calories the child can consume in one hour.' },
      { letter: 'D', text: 'It verifies if the child has any severe allergic reactions to peanuts.' }
    ]
  }
];

const RoleAssessmentStageTwoChildMalnutrition: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={1}
      interviewTitle="Child Malnutrition Screening"
      sectionTitle="Identifying and classifying child wasting"
      sectionSub="Six questions covering MUAC measurement, oedema checks, and outpatient therapeutic protocols. Part 2 Interview 1."
      whyMattersText="Reach Africa outreaches screen hundreds of children weekly. Accurate diagnosis ensures therapeutic foods reach children in critical need without overloading stabilization wards."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-2/interview-2"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoChildMalnutrition;
