import React from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Question 1 of 6',
    questionText: 'A patient presents at your clinic with fever in a malaria-endemic zone. According to international standards, what is the prerequisite before prescribing Artemisinin-based Combination Therapy (ACT)?',
    options: [
      { letter: 'A', text: 'Parasitological confirmation with a Rapid Diagnostic Test (RDT) or microscopy.' },
      { letter: 'B', text: 'Clinical assessment of fever severity alone.' },
      { letter: 'C', text: 'Administration of paracetamol to see if the fever subsides.' },
      { letter: 'D', text: 'Presence of a rash or joint pain.' }
    ]
  },
  {
    id: 'q2',
    numText: 'Question 2 of 6',
    questionText: 'Under what circumstance is presumptive treatment for malaria (treating without a diagnostic test) clinically acceptable?',
    options: [
      { letter: 'A', text: 'Only when diagnostic testing tools (RDTs/microscopy) are completely unavailable.' },
      { letter: 'B', text: 'If the patient is a pregnant woman showing mild symptoms.' },
      { letter: 'C', text: 'If the patient traveled from a high-transmission ward.' },
      { letter: 'D', text: 'If the caregiver insists on receiving ACT.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Question 3 of 6',
    questionText: 'Standard malaria RDTs detect Histidine-Rich Protein 2 (HRP2). Which malaria parasite species is this specific antigen associated with?',
    options: [
      { letter: 'A', text: 'Plasmodium falciparum' },
      { letter: 'B', text: 'Plasmodium vivax' },
      { letter: 'C', text: 'Plasmodium malariae' },
      { letter: 'D', text: 'Plasmodium ovale' }
    ]
  },
  {
    id: 'q4',
    numText: 'Question 4 of 6',
    questionText: 'A patient with a positive malaria RDT displays signs of severe disease, including severe lethargy and persistent vomiting. What is the correct initial intervention?',
    options: [
      { letter: 'A', text: 'Administer the first dose of intramuscular artesunate (or artemether) and arrange urgent referral.' },
      { letter: 'B', text: 'Give a double dose of oral ACT tablets and monitor for 2 hours.' },
      { letter: 'C', text: 'Perform a secondary RDT from a different batch to confirm.' },
      { letter: 'D', text: 'Prescribe oral paracetamol and advise home rest.' }
    ]
  },
  {
    id: 'q5',
    numText: 'Question 5 of 6',
    questionText: 'Why is screening for pregnancy status essential before prescribing Artemisinin-based Combination Therapy (ACT)?',
    options: [
      { letter: 'A', text: 'Certain ACTs are contraindicated or require caution, particularly in the first trimester.' },
      { letter: 'B', text: 'Pregnant women are completely immune to malaria infection.' },
      { letter: 'C', text: 'Malaria parasites cannot cross the placental barrier.' },
      { letter: 'D', text: 'All antimalarial drugs are safe in identical doses throughout pregnancy.' }
    ]
  },
  {
    id: 'q6',
    numText: 'Question 6 of 6',
    questionText: 'A patient diagnosed with uncomplicated P. falciparum malaria is prescribed standard Artemether-Lumefantrine. What is the duration of a standard course?',
    options: [
      { letter: 'A', text: 'A 3-day course (total of 6 doses).' },
      { letter: 'B', text: 'A single high-dose administration.' },
      { letter: 'C', text: 'A 7-day daily course.' },
      { letter: 'D', text: 'A 10-day course with weekly follow-up.' }
    ]
  }
];

const RoleAssessmentStageTwoMalariaProtocol: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={2}
      interviewTitle="Malaria Diagnostic Protocol"
      sectionTitle="Guidelines for malaria testing and treatment"
      sectionSub="Six questions on diagnostic confirmation, severe malaria triage, and pregnancy precautions. Part 2 Interview 2."
      whyMattersText="Malaria remains a leading cause of clinic visits. Adhering to test-based prescribing prevents drug resistance and ensures severe cases receive lifesaving parenteral therapy without delay."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-2/interview-3"
      partNumber={2}
    />
  );
};

export default RoleAssessmentStageTwoMalariaProtocol;
