import type { AssessmentItem } from '../services/queries/assessments/types';
import type { MockAssessmentScreenViewProps } from '../components/talent/assessment/MockAssessmentScreenView';

type ScreenConfig = Omit<MockAssessmentScreenViewProps, 'onContinue'>;

const stage1Chrome = (
  activePebble: number,
  overrides?: Partial<MockAssessmentScreenViewProps['chrome']>,
): MockAssessmentScreenViewProps['chrome'] => ({
  headerTitle: 'Stage 1 · Getting to know you',
  activeSession: 1,
  activePebble,
  totalPebbles: 6,
  ...overrides,
});

const stage2Chrome = (
  activePebble: number,
  overrides?: Partial<MockAssessmentScreenViewProps['chrome']>,
): MockAssessmentScreenViewProps['chrome'] => ({
  headerTitle: 'Stage 1 · Your instincts',
  activeSession: 2,
  activePebble,
  totalPebbles: 5,
  ...overrides,
});

export const PSYCHOMETRIC_SCREEN: ScreenConfig = {
  chrome: stage1Chrome(0),
  intro: {
    tagLabel: 'Part 1 · How you work',
    title: 'A few statements about how you tend to operate at work.',
    subtitle:
      "Pick the answer that feels most true for you, not the one that sounds best. We're after the honest version.",
    whyMatters:
      "Senior programme officers at Reach Africa lead under uncertainty. The team uses this to understand the working style you'd bring not to score you against a profile.",
  },
  maxWidthClass: 'max-w-[1000px]',
  footerHint: 'Part 1 of 6 · Stage 1',
  nextPath: 'session-1/forced-choice',
  items: [
    {
      id: 'psychometric-likert',
      type: 'likert_scale',
      sequence: 1,
      total: 1,
      content: {
        questions: [
          {
            id: 's1',
            text: "When a project has competing demands and no clear right answer, I'm usually the one who maps the trade-offs out loud for the team.",
          },
          {
            id: 's2',
            text: 'I tend to start tasks well before deadlines, even when nobody is pressing me to.',
          },
          {
            id: 's3',
            text: "I take feedback from people more junior than me seriously, and act on it when it's right.",
          },
          {
            id: 's4',
            text: 'Disruptions to a plan, like sudden priority changes or system failures, throw me off for a while before I can recalibrate.',
          },
          {
            id: 's5',
            text: 'I find it easier to keep clarity in my decision-making when information is incomplete than most of my peers.',
          },
        ],
      },
    },
  ],
};

const FORCED_CHOICE_BLOCKS = [
  [
    { id: 'b0-s0', label: 'I like to finish what I start, even when it stops being interesting', tag: 'CO' },
    { id: 'b0-s1', label: 'I would rather lose credit than take it for work that was not mine', tag: 'HH' },
    { id: 'b0-s2', label: 'I notice quickly when someone in the room is struggling', tag: 'EM' },
    { id: 'b0-s3', label: 'I enjoy rethinking how something is done when there is a better way', tag: 'OP' },
  ],
  [
    { id: 'b1-s0', label: 'I stay steady when things around me get tense', tag: 'ES' },
    { id: 'b1-s1', label: 'I plan ahead so a deadline rarely surprises me', tag: 'CO' },
    { id: 'b1-s2', label: 'I own a mistake straight away rather than manage how it looks', tag: 'HH' },
    { id: 'b1-s3', label: 'I adjust how I explain things to whoever I am talking to', tag: 'EM' },
  ],
  [
    { id: 'b2-s0', label: 'I am curious about fields that are not my own', tag: 'OP' },
    { id: 'b2-s1', label: 'I can sit with not knowing the answer yet without getting rattled', tag: 'ES' },
    { id: 'b2-s2', label: 'I keep my commitments even when no one is checking', tag: 'CO' },
    { id: 'b2-s3', label: 'I am comfortable being the least experienced person in the room', tag: 'HH' },
  ],
  [
    { id: 'b3-s0', label: 'I check that a decision works for the people it affects, not just on paper', tag: 'EM' },
    { id: 'b3-s1', label: 'I look for the assumption everyone has stopped questioning', tag: 'OP' },
    { id: 'b3-s2', label: 'Criticism stings less than it used to, I take what is useful and move on', tag: 'ES' },
    { id: 'b3-s3', label: 'I would rather do a smaller thing properly than a bigger thing roughly', tag: 'CO' },
  ],
  [
    { id: 'b4-s0', label: 'I would flag my own error even if no one would have found it', tag: 'HH' },
    { id: 'b4-s1', label: 'I can tell when a quiet person disagrees and make room for them', tag: 'EM' },
    { id: 'b4-s2', label: 'I change my mind when the evidence changes, without it feeling like a loss', tag: 'OP' },
    { id: 'b4-s3', label: 'Under pressure I get calmer and more deliberate, not faster and looser', tag: 'ES' },
  ],
  [
    { id: 'b5-s0', label: 'I would rather under promise and over deliver than the reverse', tag: 'CO' },
    { id: 'b5-s1', label: 'I enjoy a problem more when I have never seen one like it', tag: 'OP' },
    { id: 'b5-s2', label: 'I do not need the room to know how much I contributed', tag: 'HH' },
    { id: 'b5-s3', label: 'I would rather be told a hard truth kindly than be spared it', tag: 'EM' },
  ],
  [
    { id: 'b6-s0', label: 'A setback is information to me, not a verdict on me', tag: 'ES' },
    { id: 'b6-s1', label: 'I read a room before I decide how to say something', tag: 'EM' },
    { id: 'b6-s2', label: "I tidy the loose ends others leave so they do not become someone's problem", tag: 'CO' },
    { id: 'b6-s3', label: 'I would rather be corrected and right than uncorrected and wrong', tag: 'HH' },
  ],
];

export const FORCED_CHOICE_SCREEN: ScreenConfig = {
  chrome: stage1Chrome(1),
  intro: {
    tagLabel: 'Part 2 · Forced choice',
    title: 'Pick what is most and least like you',
    subtitle:
      'Every option is something people are happy to say about themselves. Choose the one most like you and the one least like you in each set.',
    whyMatters:
      'This format resists flattering answers because lifting one quality means easing off another.',
  },
  footerHint: 'Part 2 of 6 · Stage 1',
  nextPath: 'session-1/psychometric-values',
  items: [
    {
      id: 'forced-choice-blocks',
      type: 'forced_choice',
      sequence: 1,
      total: 1,
      content: {
        blocks: FORCED_CHOICE_BLOCKS.map((statements, index) => ({
          id: `block-${index}`,
          statements,
        })),
      },
    },
  ],
};

export const PSYCHOMETRIC_VALUES_SCREEN: ScreenConfig = {
  chrome: stage1Chrome(2),
  intro: {
    tagLabel: 'Part 3 · What matters to you',
    title: 'Different things motivate different people. Tell us what matters to you.',
    subtitle:
      'Drag to put these in the order that reflects what you genuinely value at work not what sounds most professional.',
    whyMatters:
      'Teams perform better when individual values align with the work. This is for finding fit, not filtering people out.',
  },
  maxWidthClass: 'max-w-[1000px]',
  footerHint: 'Part 3 of 6 · Stage 1',
  nextPath: 'session-1/situational',
  items: [
    {
      id: 'values-rank',
      type: 'rank',
      sequence: 1,
      total: 2,
      title: 'Rank these in order of what matters most to you in a job.',
      content: {
        options: [
          { id: '1', label: "Doing work that has a tangible impact on people's lives" },
          { id: '2', label: 'Autonomy to design how I approach my own work' },
          { id: '3', label: 'A team where I learn from people more experienced than me' },
          { id: '4', label: 'Recognition and clear paths to senior responsibility' },
          { id: '5', label: 'Stability a predictable workload and reliable income' },
          { id: '6', label: 'Work that lets me grow into a recognised expert in my field' },
        ],
      },
    },
    {
      id: 'values-pairs',
      type: 'values_ab_pairs',
      sequence: 2,
      total: 2,
      title: 'When two things pull in different directions, which would you lean toward?',
      content: {
        pairs: [
          {
            a: { id: 'a', label: 'Having a clear plan and sticking to it' },
            b: { id: 'b', label: 'Staying flexible and adapting as things change' },
          },
          {
            a: { id: 'a', label: 'Being direct even when it might create tension' },
            b: { id: 'b', label: 'Keeping harmony even when it slows a decision' },
          },
        ],
      },
    },
  ],
};

export const SITUATIONAL_SCREEN: ScreenConfig = {
  chrome: stage1Chrome(3),
  intro: {
    tagLabel: 'Part 3 · Working through problems',
    title: 'A few short scenarios to see how you reason things through.',
    subtitle:
      "Take your time. Pick the response that closest matches what you'd genuinely do there's no penalty for thinking carefully.",
    whyMatters:
      'Programme work involves constant judgement calls under imperfect information. This helps surface how you naturally structure decisions.',
  },
  footerHint: 'Part 3 of 6 · Stage 1',
  nextPath: 'session-1/cognitive',
  items: [
    {
      id: 'situational-q1',
      type: 'sjt_single_best',
      sequence: 1,
      total: 2,
      content: {
        scenario:
          "You're three months into running a community health outreach across four LGAs. Two of the four are hitting their indicators on time and budget. The other two are 40% behind because of unexpected fuel shortages affecting cold chain logistics. Your donor wants a single decision in 48 hours.",
        prompt: "What's the first thing you do?",
        subPrompt: "One choice the one you'd actually act on first.",
        options: [
          { id: 'A', label: "Get on a call with the two lagging LGA coordinators today to understand what's recoverable versus structurally blocked, before recommending anything to the donor." },
          { id: 'B', label: 'Send a written status update to the donor outlining the situation honestly, then ask for an extra 72 hours before recommending a path.' },
          { id: 'C', label: 'Pull the data from all four LGAs and build a comparative dashboard so the recommendation is grounded in numbers, not impressions.' },
          { id: 'D', label: "Recommend reallocating remaining budget from the lagging LGAs to the two that are performing, to protect the donor's headline outcomes." },
        ],
      },
    },
    {
      id: 'situational-q2',
      type: 'sjt_single_best',
      sequence: 2,
      total: 2,
      content: {
        scenario:
          'It turns out one of the lagging LGAs is recoverable if you redirect logistics, but the other has a structural problem that will take months to fix. The donor has explicitly said they value equity across all four LGAs in this programme.',
        prompt: 'How do you frame your recommendation?',
        options: [
          { id: 'A', label: 'Present a single recommendation that fixes the recoverable LGA, with a separate longer-term plan for the structural one and be upfront that equity will be temporarily uneven.' },
          { id: 'B', label: 'Offer two options equity-preserving (slower across all four) and pragmatic (focus on the three that can move) and let the donor decide.' },
          { id: 'C', label: 'Stay with the original plan to honour the equity commitment, even if results slip, and rebuild logistics from the ground up.' },
          { id: 'D', label: 'Propose pausing the structurally blocked LGA and explicitly redirecting resources to the other three, framing it as protecting the wider mission.' },
        ],
      },
    },
  ],
};

export const READING_SCREEN: ScreenConfig = {
  chrome: stage1Chrome(5),
  intro: {
    tagLabel: 'Part 6 · Reading carefully',
    title: 'Read the passage, then answer based only on what it actually says.',
    subtitle:
      "If the passage doesn't say it, don't assume it even if you think you already know the topic. This is the last part of stage 1.",
  },
  footerHint: 'Part 6 of 6 · Stage 1',
  nextPath: 'session-1/complete',
  passage: [
    'A 2023 review of community-based maternal health programmes across four sub-Saharan countries reported that outreach models combining mobile clinics with community health volunteer (CHV) follow-up achieved antenatal attendance rates more than twice as high as static clinic models alone. However, the same review noted that the gains were strongest in semi-urban settings and weakest in remote rural communities, where transport infrastructure remained the binding constraint.',
    'The authors emphasised that the success of mobile-plus-CHV models depended less on technology investment and more on the recruitment, training, and ongoing supervision of CHVs themselves. Programmes that under-invested in CHV supervision saw attendance gains plateau within 18 months. Programmes that maintained quarterly CHV refresher training sustained gains beyond three years.',
  ],
  items: [
    {
      id: 'reading-q1',
      type: 'mcq',
      sequence: 1,
      total: 3,
      title: 'Question 1',
      content: {
        prompt: 'Based only on the passage, which of the following can be confidently inferred?',
        options: [
          { id: 'A', label: 'Mobile clinics are universally more effective than static clinics in sub-Saharan Africa.' },
          { id: 'B', label: 'The model worked best where CHV supervision was sustained over time.' },
          { id: 'C', label: 'Technology investment was the main driver of programme success.' },
          { id: 'D', label: "Remote rural communities don't benefit from outreach programmes." },
        ],
      },
    },
    {
      id: 'reading-q2',
      type: 'mcq',
      sequence: 2,
      total: 3,
      title: 'Question 2',
      content: {
        prompt:
          'If a new programme replicates the model but plans to fund CHV training only once at launch, what does the passage suggest is most likely?',
        options: [
          { id: 'A', label: 'Sustained gains beyond three years.' },
          { id: 'B', label: 'Faster attendance growth than peer programmes.' },
          { id: 'C', label: 'Attendance gains plateauing within roughly 18 months.' },
          { id: 'D', label: "The passage doesn't give enough information to say." },
        ],
      },
    },
    {
      id: 'reading-q3',
      type: 'mcq',
      sequence: 3,
      total: 3,
      title: 'Question 3',
      content: {
        prompt: 'According to the passage, what was the main constraint in remote rural communities?',
        options: [
          { id: 'A', label: 'Insufficient government funding.' },
          { id: 'B', label: 'Transport infrastructure.' },
          { id: 'C', label: 'Lack of CHV training programmes.' },
          { id: 'D', label: 'Resistance from local communities.' },
        ],
      },
    },
  ],
};

export const SESSION_TWO_SITUATIONAL_SCREEN: ScreenConfig = {
  chrome: stage2Chrome(0),
  intro: {
    tagLabel: 'A judgement call',
    title: 'When the right thing and the urgent thing pull apart',
    subtitle:
      "Read the situation, then pick the response closest to how you'd actually move in the next 15 minutes.",
    whyMatters:
      "Frontline coordination for Reach Africa often means making ethical calls before all the right people are reachable. There's no single perfect answer here we're interested in what you'd weigh.",
  },
  footerHint: 'Scenario 1 of 5 · Stage 1',
  nextPath: 'session-2/ranking',
  items: [
    {
      id: 'session2-situational',
      type: 'sjt_single_best',
      sequence: 1,
      total: 1,
      content: {
        scenario:
          'You are a Senior Health Programme Officer running a free maternal health outreach in a peri-urban community. On the morning of the event, the local government liaison tells you the state health authority never issued the required permit an oversight your team missed. The venue is already set up. Over 200 pregnant women have gathered. Your country director is unreachable. Your contracted clinical lead says she can begin if you give the sign-off.',
        prompt: "What's the single best move in the next 15 minutes?",
        subPrompt: "Pick the option closest to what you'd actually do.",
        options: [
          { id: 'A', label: 'Proceed with the outreach under clinical supervision, document the permit gap, and notify authorities immediately after the first session.' },
          { id: 'B', label: 'Pause the outreach, explain the situation to the gathered community, and work with the liaison to secure emergency written approval before starting.' },
          { id: 'C', label: 'Begin triage only (no treatment) while your team works the phones to reach the country director and health authority.' },
          { id: 'D', label: 'Cancel the event, reschedule, and issue a public apology citing the permit oversight.' },
        ],
      },
    },
  ],
};

export const SESSION_TWO_RANKING_SCREEN: ScreenConfig = {
  chrome: stage2Chrome(1),
  intro: {
    tagLabel: 'Ranking your response',
    title: 'Put these actions in the order you would actually take them.',
    subtitle: 'Most urgent and important at the top. Drag using the arrows to reorder.',
  },
  footerHint: 'Part 2 of 5 · Session 2',
  nextPath: 'session-2/best-worst',
  items: [
    {
      id: 'session2-rank',
      type: 'rank',
      sequence: 1,
      total: 1,
      content: {
        options: [
          { id: 'a', label: "Call the nurse privately, explain what's at stake, and ask her to take the post down immediately." },
          { id: 'b', label: "Phone the community elder back, apologise on behalf of the team, and explain the steps being taken to make it right." },
          { id: 'c', label: "Document the incident formally and notify the safeguarding lead so it's logged in line with policy." },
          { id: 'd', label: 'Run a brief refresher for the whole field team on consent, dignity, and social-media boundaries.' },
        ],
      },
    },
  ],
};

export const SESSION_TWO_BEST_WORST_SCREEN: ScreenConfig = {
  chrome: stage2Chrome(2),
  intro: {
    tagLabel: 'Best and worst',
    title: 'Which response is most effective and which is least?',
    subtitle: 'Pick one most likely and one least likely from the options below.',
  },
  footerHint: 'Part 3 of 5 · Session 2',
  nextPath: 'session-2/combine',
  items: [
    {
      id: 'session2-most-least',
      type: 'sjt_most_least',
      sequence: 1,
      total: 1,
      content: {
        prompt: 'A team member has been visibly struggling for two weeks missed deadlines, short in meetings, uncharacteristically sharp with colleagues.',
        options: [
          { id: 'a', label: "Schedule a private check-in that isn't framed as a performance review just a conversation about how she's doing." },
          { id: 'b', label: 'Quietly redistribute her two most demanding deliverables to other team members for the next two weeks.' },
          { id: 'c', label: 'Remind her, gently but clearly, that the team is depending on her and that the recent slip in standards has been noticed.' },
          { id: 'd', label: 'Share the staff wellbeing resources available through the organisation and offer to help her access them.' },
          { id: 'e', label: 'Raise it with your line manager so they can decide whether a formal performance conversation is needed.' },
        ],
      },
    },
  ],
};

export const SESSION_TWO_COMBINE_SCREEN: ScreenConfig = {
  chrome: stage2Chrome(3),
  intro: {
    tagLabel: 'Combining actions',
    title: 'Which actions would you take together in the first 48 hours?',
    subtitle: 'Select between 2 and 5 options that you would genuinely combine.',
  },
  footerHint: 'Part 4 of 5 · Session 2',
  nextPath: 'session-2/tradeoff',
  items: [
    {
      id: 'session2-multi',
      type: 'sjt_multi_select',
      sequence: 1,
      total: 1,
      content: {
        prompt: 'A team member has been visibly struggling. Which actions would you take in the first 48 hours?',
        minSelect: 2,
        maxSelect: 5,
        options: [
          { id: 'a', label: "Schedule a private check-in that isn't framed as a performance review just a conversation about how she's doing." },
          { id: 'b', label: 'Quietly redistribute her two most demanding deliverables to other team members for the next two weeks.' },
          { id: 'c', label: 'Remind her, gently but clearly, that the team is depending on her and that the recent slip in standards has been noticed.' },
          { id: 'd', label: 'Share the staff wellbeing resources available through the organisation and offer to help her access them.' },
          { id: 'e', label: 'Raise it with your line manager so they can decide whether a formal performance conversation is needed.' },
          { id: 'f', label: 'Ask a trusted colleague to check in informally and report back if the situation seems to be worsening.' },
        ],
      },
    },
  ],
};

export const SESSION_TWO_TRADEOFF_SCREEN: ScreenConfig = {
  chrome: stage2Chrome(4),
  intro: {
    tagLabel: 'Value trade-offs',
    title: 'When two good things pull in opposite directions, where do you lean?',
    subtitle: 'Move each slider to show which side you would lean toward in practice.',
  },
  footerHint: 'Part 5 of 5 · Session 2',
  nextPath: 'session-2/review',
  continueLabel: 'Finish session',
  items: [
    {
      id: 'session2-tradeoff',
      type: 'values_tradeoff',
      sequence: 1,
      total: 1,
      content: {
        tensions: [
          {
            id: 't1',
            left: { title: "Move fast on a decision so the team isn't paralysed" },
            right: { title: 'Pause for one more conversation before deciding' },
            scaleMin: 0,
            scaleMax: 100,
          },
          {
            id: 't2',
            left: { title: 'Honour what the community is asking for' },
            right: { title: 'Hold the funded design tightly' },
            scaleMin: 0,
            scaleMax: 100,
          },
          {
            id: 't3',
            left: { title: 'Give a struggling team member space and time' },
            right: { title: 'Hold the deadline and the standard' },
            scaleMin: 0,
            scaleMax: 100,
          },
        ],
      },
    },
  ],
};

/** Convert Stage 2 interview questions into reusable assessment items. */
export const questionsToMcqItems = (
  questions: Array<{
    id: string;
    numText: string;
    questionText: string;
    scenarioTag?: string;
    scenarioText?: string;
    options: Array<{ letter: string; text: string }>;
  }>,
): AssessmentItem[] =>
  questions.map((q, index) => ({
    id: q.id,
    type: 'mcq' as const,
    sequence: index + 1,
    total: questions.length,
    title: q.numText,
    content: {
      scenario: q.scenarioText
        ? q.scenarioTag
          ? `[${q.scenarioTag}] ${q.scenarioText.replace(/<[^>]+>/g, '')}`
          : q.scenarioText.replace(/<[^>]+>/g, '')
        : undefined,
      prompt: q.questionText,
      options: q.options.map((opt) => ({
        id: opt.letter,
        label: opt.text,
      })),
    },
  }));
