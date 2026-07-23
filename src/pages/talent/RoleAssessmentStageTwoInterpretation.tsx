import React from 'react';
import RoleAssessmentStageTwoInterviewBase, { type Question } from '../../components/talent/RoleAssessmentStageTwoInterviewBase';

const DatasetBlock: React.FC = () => (
  <div className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[14px] p-[22px_24px] mb-[18px]">
    <div className="text-[10.5px] font-[800] tracking-[0.7px] uppercase text-[#0047CC] mb-[6px]">
      Dataset · Q3 2025
    </div>
    <div className="text-[16px] font-[800] text-[#1A1A1A] tracking-[-0.2px] mb-[6px]">
      ANC4 attendance by ward, intervention vs control wards
    </div>
    <div className="text-[13px] text-[#808080] leading-[1.55] mb-[16px]">
      Reach Africa peri-urban maternal health programme. Attendance percentages reflect women completing four or more antenatal visits.
    </div>

    {/* Chart Wrap */}
    <div className="bg-gradient-to-b from-[#FAFCFF] to-white border border-[#E6E6E6] rounded-[10px] p-[16px] mb-[16px]">
      <svg className="w-full h-[200px]" viewBox="0 0 600 200" preserveAspectRatio="none">
        {/* gridlines */}
        <g stroke="#E6E6E6" strokeWidth="1">
          <line x1="40" y1="20" x2="580" y2="20" />
          <line x1="40" y1="65" x2="580" y2="65" />
          <line x1="40" y1="110" x2="580" y2="110" />
          <line x1="40" y1="155" x2="580" y2="155" />
          <line x1="40" y1="180" x2="580" y2="180" />
        </g>
        {/* y labels */}
        <g fontFamily="Nunito Sans" fontSize="9" fill="#808080" textAnchor="end" fontWeight="600">
          <text x="35" y="23">100%</text>
          <text x="35" y="68">75%</text>
          <text x="35" y="113">50%</text>
          <text x="35" y="158">25%</text>
          <text x="35" y="183">0%</text>
        </g>
        {/* intervention line */}
        <polyline
          points="60,90 130,80 200,72 270,65 340,55 410,48 480,42 550,38"
          fill="none"
          stroke="#0047CC"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g fill="#0047CC">
          <circle cx="60" cy="90" r="4" />
          <circle cx="130" cy="80" r="4" />
          <circle cx="200" cy="72" r="4" />
          <circle cx="270" cy="65" r="4" />
          <circle cx="340" cy="55" r="4" />
          <circle cx="410" cy="48" r="4" />
          <circle cx="480" cy="42" r="4" />
          <circle cx="550" cy="38" r="4" />
        </g>
        {/* control line */}
        <polyline
          points="60,105 130,108 200,100 270,105 340,98 410,103 480,100 550,95"
          fill="none"
          stroke="#ADADAD"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <g fill="#ADADAD">
          <circle cx="60" cy="105" r="4" />
          <circle cx="130" cy="108" r="4" />
          <circle cx="200" cy="100" r="4" />
          <circle cx="270" cy="105" r="4" />
          <circle cx="340" cy="98" r="4" />
          <circle cx="410" cy="103" r="4" />
          <circle cx="480" cy="100" r="4" />
          <circle cx="550" cy="95" r="4" />
        </g>
        {/* x labels */}
        <g fontFamily="Nunito Sans" fontSize="9" fill="#808080" textAnchor="middle" fontWeight="600">
          <text x="60" y="197">Wk 1</text>
          <text x="130" y="197">Wk 2</text>
          <text x="200" y="197">Wk 3</text>
          <text x="270" y="197">Wk 4</text>
          <text x="340" y="197">Wk 5</text>
          <text x="410" y="197">Wk 6</text>
          <text x="480" y="197">Wk 7</text>
          <text x="550" y="197">Wk 8</text>
        </g>
      </svg>
      <div className="flex gap-[14px] justify-center mt-[10px] flex-wrap">
        <div className="flex items-center gap-[6px] text-[12px] text-[#4A4A4A] font-[600]">
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: '#0047CC' }} />
          Intervention wards (n=7)
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#4A4A4A] font-[600]">
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: '#ADADAD' }} />
          Control wards (n=7)
        </div>
      </div>
    </div>

    {/* Data Table */}
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr>
          <th className="text-left p-[9px_10px] bg-[#F7F7F7] font-[800] text-[#4A4A4A] text-[11px] tracking-[0.4px] uppercase border-b border-[#E6E6E6]">
            Ward
          </th>
          <th className="text-left p-[9px_10px] bg-[#F7F7F7] font-[800] text-[#4A4A4A] text-[11px] tracking-[0.4px] uppercase border-b border-[#E6E6E6]">
            ANC4 % wk 1
          </th>
          <th className="text-left p-[9px_10px] bg-[#F7F7F7] font-[800] text-[#4A4A4A] text-[11px] tracking-[0.4px] uppercase border-b border-[#E6E6E6]">
            ANC4 % wk 8
          </th>
          <th className="text-left p-[9px_10px] bg-[#F7F7F7] font-[800] text-[#4A4A4A] text-[11px] tracking-[0.4px] uppercase border-b border-[#E6E6E6]">
            Stockouts
          </th>
          <th className="text-left p-[9px_10px] bg-[#F7F7F7] font-[800] text-[#4A4A4A] text-[11px] tracking-[0.4px] uppercase border-b border-[#E6E6E6]">
            CHW turnover
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-[#F7F7F7]">
          <td className="p-[9px_10px] text-[#1A1A1A] font-[700]">Ifako</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">58</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">83</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">0</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] bg-[#2CA62C] align-middle" />
            0
          </td>
        </tr>
        <tr className="border-b border-[#F7F7F7]">
          <td className="p-[9px_10px] text-[#1A1A1A] font-[700]">Mile 12</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">54</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">79</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">1</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] bg-[#2CA62C] align-middle" />
            1
          </td>
        </tr>
        <tr className="border-b border-[#F7F7F7]">
          <td className="p-[9px_10px] text-[#1A1A1A] font-[700]">Agege North</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">61</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">74</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">3</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] bg-[#D97706] align-middle" />
            2
          </td>
        </tr>
        <tr className="border-b border-[#F7F7F7]">
          <td className="p-[9px_10px] text-[#1A1A1A] font-[700]">Bariga</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">52</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">62</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">4</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] bg-[#DC2626] align-middle" />
            4
          </td>
        </tr>
        <tr className="border-b-0">
          <td className="p-[9px_10px] text-[#1A1A1A] font-[700]">Surulere</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">56</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">80</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">0</td>
          <td className="p-[9px_10px] text-[#1A1A1A] tabular-nums">
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] bg-[#2CA62C] align-middle" />
            0
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    numText: 'Question 1 of 4',
    questionText: 'Looking at the dataset, what\'s the most defensible single headline?',
    options: [
      { letter: 'A', text: 'The intervention has caused a clear improvement in ANC4 attendance.' },
      { letter: 'B', text: 'Intervention wards trended up while control wards stayed broadly flat, but ward-level variation (notably Bariga and Agege North) needs explanation before claiming overall effect.' },
      { letter: 'C', text: 'The intervention failed in Bariga, so the programme isn\'t working.' },
      { letter: 'D', text: 'The data is too messy to draw any conclusion.' }
    ]
  },
  {
    id: 'q2',
    numText: 'Question 2 of 4',
    questionText: 'Bariga shows weaker improvement than other intervention wards. What does the dataset suggest is the most likely contributor?',
    options: [
      { letter: 'A', text: 'The intervention is fundamentally wrong for Bariga.' },
      { letter: 'B', text: 'High CHW turnover (4) combined with significant stockouts (4) likely degraded delivery quality, undermining the intervention\'s effect in that ward specifically.' },
      { letter: 'C', text: 'Bariga has fewer pregnant women.' },
      { letter: 'D', text: 'The chart is incorrect.' }
    ]
  },
  {
    id: 'q3',
    numText: 'Question 3 of 4',
    questionText: 'A donor asks for a single chart for their quarterly newsletter. What\'s the most honest visual to send?',
    options: [
      { letter: 'A', text: 'Just the intervention line, no control comparator.' },
      { letter: 'B', text: 'Both lines together with a clear note on ward-level variation and what operational issues drove it. Honesty travels further than headlines.' },
      { letter: 'C', text: 'Only Ifako and Mile 12 data since those wards performed best.' },
      { letter: 'D', text: 'A bar chart showing total numbers attended without comparator.' }
    ]
  },
  {
    id: 'q4',
    numText: 'Question 4 of 4',
    questionText: 'What\'s the most important question this dataset does not answer?',
    options: [
      { letter: 'A', text: 'How many CHWs were in each ward.' },
      { letter: 'B', text: 'Whether the increased ANC4 attendance translated into meaningful clinical or maternal health outcomes, which is what the programme ultimately exists for.' },
      { letter: 'C', text: 'The exact age of each pregnant woman.' },
      { letter: 'D', text: 'The political views of the women.' }
    ]
  }
];

const RoleAssessmentStageTwoInterpretation: React.FC = () => {
  return (
    <RoleAssessmentStageTwoInterviewBase
      interviewNumber={3}
      interviewTitle="Health data interpretation"
      sectionTitle="Make sense of the numbers in front of you"
      sectionSub="Below is a real-shaped dataset from a quarterly programme review. Four questions about what it actually tells you, and what it doesn't."
      whyMattersText="Programme dashboards arrive in your inbox every Monday at Reach Africa. Reading them well is the difference between catching a problem early and finding out from a donor in week ten."
      questions={QUESTIONS}
      nextPath="assessment/stage-2/part-3/complete"
      partNumber={3}
      timeLimitSeconds={12 * 60}
      topContent={<DatasetBlock />}
    />
  );
};

export default RoleAssessmentStageTwoInterpretation;
