import React from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Scenario 1 of 4',
    scenarioTag: 'Field operations',
    scenarioText: 'A peri-urban outreach is in its third hour. A community elder arrives at the screening tent and asks your team to <strong>also see his pregnant daughter-in-law</strong>, who isn\'t on the day\'s list. The day\'s MOU only covers maternal screening for women already registered in the cluster, and your kit is running low. A junior field officer asks you what to do.',
    questionText: 'What\'s the strongest move?',
    options: [
      { letter: 'A', text: 'Decline politely on the basis that she\'s not registered, citing the MOU.' },
      { letter: 'B', text: 'Conduct a brief clinical check, document the off-list assessment, refer her to the nearest health facility, and escalate registration through the cluster lead the same day.' },
      { letter: 'C', text: 'Provide a full antenatal screening regardless of registration.' },
      { letter: 'D', text: 'Ask the field officer to handle it without your involvement so it can\'t be traced to you.' }
    ]
  },
  {
    id: 'q2',
    numText: 'Scenario 2 of 4',
    scenarioTag: 'Programme delivery',
    scenarioText: 'Three of your six community health workers report unusually low immunisation turnout in their wards this month. <strong>One reports a 60% drop, two report around 30%.</strong> The cluster supervisor suggests it\'s a "seasonal dip". Your monthly report is due in 48 hours.',
    questionText: 'Your first move is to:',
    options: [
      { letter: 'A', text: 'Accept the seasonal explanation and submit the report on time.' },
      { letter: 'B', text: 'Triangulate: pull cold-chain logs, ward-level rumours and event calendars, then interview the three CHWs separately before settling on a cause.' },
      { letter: 'C', text: 'Issue a warning to the three CHWs for underperformance.' },
      { letter: 'D', text: 'Delay the report indefinitely until the figures recover.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Scenario 3 of 4',
    scenarioTag: 'Stakeholder management',
    scenarioText: 'A funder representative visits your site mid-outreach. She asks you to walk her through "the impact stories". Your team has strong programme data but the qualitative case studies <strong>haven\'t yet been validated</strong> by the community engagement officer. The funder is on a tight schedule and only has 20 minutes.',
    questionText: 'What do you do?',
    options: [
      { letter: 'A', text: 'Share the unvalidated stories anyway, since you have a good general sense of them.' },
      { letter: 'B', text: 'Walk her through the validated programme data, name the qualitative work as in progress, and offer a follow-up call within the week once the case studies are signed off.' },
      { letter: 'C', text: 'Apologise for not having anything ready and end the visit early.' },
      { letter: 'D', text: 'Show only the strongest unverified story since it makes the funder happy.' }
    ]
  },
  {
    id: 'q4',
    numText: 'Scenario 4 of 4',
    scenarioTag: 'Team leadership',
    scenarioText: 'Your most experienced field nurse has started arriving at outreaches visibly exhausted. Her clinical work is still high standard but you notice she snapped at a junior CHW today over a minor logistical issue. <strong>Two team members have privately raised concern with you.</strong> She is one of the few staff with deep community trust.',
    questionText: 'Your most appropriate next step:',
    options: [
      { letter: 'A', text: 'Ignore it. Her clinical work hasn\'t dropped.' },
      { letter: 'B', text: 'Hold a private, non-disciplinary check-in: name what you\'ve observed without speculating on cause, ask how she\'s doing, and surface wellbeing resources or workload options.' },
      { letter: 'C', text: 'Issue a verbal warning in front of the team to set an example on professionalism.' },
      { letter: 'D', text: 'Remove her from the next outreach to "give her a break", without speaking to her about it.' }
    ]
  }
];

const RoleAssessmentStageTwoReasoning: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={1}
      interviewTitle="Clinical scenario reasoning"
      sectionTitle="Read the situation, choose the strongest path"
      sectionSub="Four programme situations that read like a real Reach Africa week. There's almost always a defensible 'good' answer and a more reasoned 'best' one. We're looking for the best."
      whyMattersText="Most weeks at Reach Africa, the cleanest answer isn't the right one. Your judgement under realistic pressure is what we're reading here."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-3/interview-2"
      partNumber={3}
      timeLimitSeconds={12 * 60}
    />
  );
};

export default RoleAssessmentStageTwoReasoning;
