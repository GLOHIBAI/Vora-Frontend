import React from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const AbstractBlock: React.FC = () => (
  <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[24px_26px] mb-[18px]">
    <div className="flex gap-[8px] flex-wrap mb-[12px]">
      <span className="text-[10.5px] font-[800] tracking-[0.4px] uppercase px-[9px] py-[3px] rounded-[6px] bg-[#EBF6FF] text-[#0047CC]">
        Cluster-randomised trial
      </span>
      <span className="text-[10.5px] font-[800] tracking-[0.4px] uppercase px-[9px] py-[3px] rounded-[6px] bg-[#F7F7F7] text-[#4A4A4A] border border-[#E6E6E6]">
        BMC Public Health, 2024
      </span>
      <span className="text-[10.5px] font-[800] tracking-[0.4px] uppercase px-[9px] py-[3px] rounded-[6px] bg-[#F7F7F7] text-[#4A4A4A] border border-[#E6E6E6]">
        Open access
      </span>
    </div>
    <div className="text-[17px] font-[900] text-[#1A1A1A] tracking-[-0.2px] leading-[1.35] mb-[8px]">
      Effect of a community-based health education intervention on ANC attendance in peri-urban Lagos: a cluster-randomised trial
    </div>
    <div className="text-[12.5px] text-[#808080] mb-[14px] italic">
      Adeyemi et al. (2024)
    </div>

    <div className="mb-[11px]">
      <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">Background</div>
      <div className="text-[13.5px] text-[#1A1A1A] leading-[1.65]">
        Antenatal care (ANC) coverage in peri-urban communities of Lagos remains below national targets. This study evaluated the effect of a six-week community-based health education programme on ANC attendance rates among pregnant women.
      </div>
    </div>
    <div className="mb-[11px]">
      <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">Methods</div>
      <div className="text-[13.5px] text-[#1A1A1A] leading-[1.65]">
        A cluster-randomised trial was conducted across 14 wards (7 intervention, 7 control) between May 2023 and February 2024. The intervention consisted of weekly group sessions facilitated by community health workers. The primary outcome was self-reported attendance of four or more ANC visits. Analyses used an intention-to-treat approach with mixed-effects logistic regression.
      </div>
    </div>
    <div className="mb-[11px]">
      <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">Results</div>
      <div className="text-[13.5px] text-[#1A1A1A] leading-[1.65]">
        A total of 612 women were enrolled (intervention n=304, control n=308). At 9 months, 71% in the intervention arm reported four or more ANC visits compared with 58% in the control arm (adjusted OR 1.78, 95% CI 1.21 to 2.62, p=0.003). Attrition was 14% overall; 11% in the intervention arm versus 17% in the control arm.
      </div>
    </div>
    <div>
      <div className="text-[10.5px] font-[800] tracking-[0.6px] uppercase text-[#0047CC] mb-[4px]">Conclusion</div>
      <div className="text-[13.5px] text-[#1A1A1A] leading-[1.65]">
        Community-based health education significantly increased ANC attendance. Findings support wider implementation in similar peri-urban settings across Nigeria.
      </div>
    </div>
  </div>
);

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Question 1 of 5',
    questionText: 'The authors describe the primary outcome as self-reported attendance of four or more ANC visits. What\'s your strongest critique of this outcome measure?',
    options: [
      { letter: 'A', text: 'Self-report introduces social desirability bias; ideally verified against ANC clinic records.' },
      { letter: 'B', text: 'Four visits is too low a threshold for meaningful ANC coverage.' },
      { letter: 'C', text: 'The outcome should have been maternal mortality.' },
      { letter: 'D', text: 'The outcome was fine as designed and needs no critique.' }
    ]
  },
  {
    id: 'q2',
    numText: 'Question 2 of 5',
    questionText: 'Attrition was 11% in the intervention arm and 17% in the control arm. What does this differential attrition imply?',
    options: [
      { letter: 'A', text: 'It\'s not an issue since both arms had under 20% attrition.' },
      { letter: 'B', text: 'Differential attrition risks biasing the effect estimate, particularly if those lost in the control arm differ systematically from completers. Sensitivity analyses should be reviewed.' },
      { letter: 'C', text: 'Higher control attrition proves the intervention engaged women more.' },
      { letter: 'D', text: 'It means the trial should be discarded.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Question 3 of 5',
    questionText: 'The conclusion claims findings "support wider implementation in similar peri-urban settings across Nigeria". Your honest read of that claim?',
    options: [
      { letter: 'A', text: 'Reasonable, since the effect size is large.' },
      { letter: 'B', text: 'Overreach. A single trial in Lagos wards does not generalise across Nigerian peri-urban settings without context-specific evidence. The conclusion should be more measured.' },
      { letter: 'C', text: 'Justified because the trial was randomised.' },
      { letter: 'D', text: 'Too cautious; the authors should have called for national rollout.' }
    ]
  },
  {
    id: 'q4',
    numText: 'Question 4 of 5',
    questionText: 'The trial reports an adjusted OR of 1.78 (95% CI: 1.21 to 2.62). What does this tell you about effect uncertainty?',
    options: [
      { letter: 'A', text: 'The interval is precise and the effect is exactly 1.78.' },
      { letter: 'B', text: 'The interval does not cross 1, suggesting a real effect, but the upper bound is more than double the lower bound. The true effect could plausibly be modest to large.' },
      { letter: 'C', text: 'The wide interval invalidates the result.' },
      { letter: 'D', text: 'The interval is irrelevant since p was less than 0.05.' }
    ]
  },
  {
    id: 'q5',
    numText: 'Question 5 of 5',
    questionText: 'A donor reads this abstract and wants Reach Africa to "do the same thing" in your three rural sites in the north. What\'s your professional response?',
    options: [
      { letter: 'A', text: 'Replicate the intervention identically across the rural sites.' },
      { letter: 'B', text: 'Acknowledge the encouraging evidence, surface the contextual differences (rural vs peri-urban, different CHW capacity, different cultural and linguistic context), and propose a piloted adaptation with built-in evaluation.' },
      { letter: 'C', text: 'Reject the donor\'s request outright.' },
      { letter: 'D', text: 'Implement everywhere immediately and gather data after.' }
    ]
  }
];

const RoleAssessmentStageTwoAppraisal: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={2}
      interviewTitle="Research and evidence appraisal"
      sectionTitle="Read this study, then appraise it"
      sectionSub="Read the abstract below, then answer five appraisal questions about it. Don't worry about getting every methodological term word-perfect. We care about the shape of your critical reading."
      whyMattersText="Senior officers at Reach Africa frequently get sent 'evidence' by donors and partners. Reading it well, especially what it doesn't say, is a daily defence against bad decisions."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-3/interview-3"
      partNumber={3}
      timeLimitSeconds={12 * 60}
      topContent={<AbstractBlock />}
    />
  );
};

export default RoleAssessmentStageTwoAppraisal;
