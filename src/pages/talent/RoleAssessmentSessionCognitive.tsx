import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';
import { ArrowRightIcon } from '../../components/common/Icons';
import VoraLogo from '../../components/common/VoraLogo';
import AssessmentItemRenderer from '../../components/talent/assessment/AssessmentItemRenderer';
import type { AssessmentItem } from '../../services/queries/assessments/types';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2a4 4 0 0 0-4 4c0 1 .3 1.8.8 2.5C7.2 9.4 6 11.1 6 13a6 6 0 0 0 12 0c0-1.9-1.2-3.6-2.8-4.5.5-.7.8-1.5.8-2.5a4 4 0 0 0-4-4z"/>
  </svg>
);

interface BankItem {
  b: number;
  q: string;
  o: string[];
  a: number;
}

const BANK: BankItem[] = [
  { b: -2.0, q: "What comes next: 2, 4, 6, 8, ?", o: ["9", "10", "12", "16"], a: 1 },
  { b: -1.5, q: "What comes next: 3, 6, 9, 12, ?", o: ["13", "15", "18", "21"], a: 1 },
  { b: -1.2, q: "If all Blims are Glons, and this is a Blim, then it is a ?", o: ["Glon", "Not a Glon", "Cannot tell", "Neither"], a: 0 },
  { b: -0.8, q: "What comes next: 1, 2, 4, 8, ?", o: ["10", "12", "16", "32"], a: 2 },
  { b: -0.5, q: "Odd one out: 2, 3, 5, 9, 11", o: ["2", "3", "9", "11"], a: 2 },
  { b: -0.2, q: "What comes next: 1, 1, 2, 3, 5, ?", o: ["6", "7", "8", "10"], a: 2 },
  { b: 0.0, q: "What comes next: 2, 6, 12, 20, ?", o: ["28", "30", "32", "36"], a: 1 },
  { b: 0.3, q: "If A is twice B, and B is three more than C, and C is 4, what is A?", o: ["7", "11", "14", "22"], a: 2 },
  { b: 0.6, q: "What comes next: 1, 4, 9, 16, ?", o: ["20", "24", "25", "36"], a: 2 },
  { b: 1.0, q: "What comes next: 2, 3, 5, 7, 11, ?", o: ["12", "13", "14", "15"], a: 1 },
  { b: 1.3, q: "A sequence triples then subtracts one: 2, 5, 14, 41, ?", o: ["108", "118", "122", "123"], a: 2 },
  { b: 1.6, q: "What comes next: 1, 2, 6, 24, 120, ?", o: ["240", "600", "720", "840"], a: 2 },
  { b: 2.0, q: "What comes next: 1, 11, 21, 1211, 111221, ?", o: ["112211", "312211", "13112221", "1231221"], a: 2 },
  { b: 0.1, q: "Which number is to 9 as 4 is to 2?", o: ["3", "4.5", "18", "81"], a: 1 },
  { b: -0.9, q: "Half of a third of 90 is ?", o: ["10", "15", "30", "45"], a: 1 },
];

const MAX_ITEMS = 9;

const RoleAssessmentSessionCognitive: React.FC = () => {
  const navigate = useNavigate();
  const { roleSlug } = useParams<{ roleSlug: string }>();

  // CAT scoring engine states
  const [theta, setTheta] = useState<number>(0.0);
  const [used, setUsed] = useState<number[]>([]);
  const [asked, setAsked] = useState<number>(0);
  const [resp, setResp] = useState<{ b: number; correct: boolean }[]>([]);
  const [curPick, setCurPick] = useState<number | null>(null);
  
  // Choose the initial item (closest difficulty to starting theta 0.0)
  const [curItemIdx, setCurItemIdx] = useState<number>(() => {
    let best = 0;
    let bestD = 1e9;
    for (let i = 0; i < BANK.length; i++) {
      const d = Math.abs(BANK[i].b - 0.0);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  });

  const [finished, setFinished] = useState<boolean>(false);

  const diffLabel = (b: number) => {
    if (b < -1) return "Foundational";
    if (b < -0.2) return "Straightforward";
    if (b < 0.6) return "Moderate";
    if (b < 1.4) return "Hard";
    return "Very hard";
  };

  const handleOptionSelect = (idx: number) => {
    setCurPick(idx);
  };

  const handleSubmitAnswer = () => {
    if (curPick === null) return;
    const it = BANK[curItemIdx];
    const correct = curPick === it.a;

    // 1PL probability of a correct answer
    const p = 1 / (1 + Math.exp(-(theta - it.b)));
    
    // Stochastic ability update (K step shrinks as asked count increases)
    const K = 1.4 / Math.sqrt(asked + 2);
    const newTheta = theta + (correct ? K * (1 - p) : -K * p);

    const updatedResp = [...resp, { b: it.b, correct }];
    const updatedUsed = [...used, curItemIdx];
    const nextAsked = asked + 1;

    setTheta(newTheta);
    setResp(updatedResp);
    setUsed(updatedUsed);
    setAsked(nextAsked);
    setCurPick(null);

    if (nextAsked >= MAX_ITEMS) {
      setFinished(true);
      window.scrollTo(0, 0);
    } else {
      // Pick next best matching item from BANK
      let best = null;
      let bestD = 1e9;
      for (let i = 0; i < BANK.length; i++) {
        if (updatedUsed.indexOf(i) >= 0) continue;
        const d = Math.abs(BANK[i].b - newTheta);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      
      if (best !== null) {
        setCurItemIdx(best);
        window.scrollTo(0, 0);
      } else {
        setFinished(true);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleContinueNextPart = () => {
    navigate(`/onboarding/talent/${roleSlug}/assessment/session-1/reading`);
  };

  const handleSave = () => {
    toast.success('Saved. You can return anytime within 48 hours.');
  };

  const adaptiveItem: AssessmentItem = useMemo(() => {
    const bankItem = BANK[curItemIdx];
    return {
      id: 'cognitive-adaptive',
      type: 'adaptive_mcq',
      sequence: 1,
      total: 1,
      content: {
        stem: bankItem.q,
        stepIndex: asked,
        totalSteps: MAX_ITEMS,
        complete: false,
        difficultyLabel: diffLabel(bankItem.b),
        options: bankItem.o.map((label, i) => ({ id: String(i), label })),
      },
    };
  }, [curItemIdx, asked]);

  // Rendering finished results screen
  if (finished) {
    const se = 1.2 / Math.sqrt(asked); 
    const lo = theta - se;
    const hi = theta + se;
    const pos = (t: number) => Math.max(0, Math.min(100, (t + 2.5) / 5 * 100));
    const corr = resp.filter(r => r.correct).length;

    return (
      <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
        {/* Top Bar */}
        <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
          <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
            <VoraLogo size="sm" to="/dashboard" />
          </span>
          <div className="text-[12.5px] text-[#808080] font-[600] text-center hidden sm:block">
            Stage 1 · Getting to know you · Adaptive reasoning
          </div>
          <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
            <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
              <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
            </div>
            Auto-saved
          </div>
        </header>

        {/* Chapter Rail */}
        <div className="bg-white px-[20px] sm:px-[32px] py-[12px] flex items-center justify-center gap-[12px] flex-wrap">
          <div className="flex items-center gap-[7px]">
            <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)] flex items-center justify-center text-[9px] font-[800] text-white">1</div>
            <div className="text-[11.5px] font-[700] text-[#0047CC]">How you think</div>
          </div>
          <div className="w-[36px] h-[2px] bg-[#E6E6E6] rounded-[2px] hidden sm:block"></div>
          <div className="flex items-center gap-[7px]">
            <div className="w-[18px] h-[18px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[9px] font-[800] text-white">2</div>
            <div className="text-[11.5px] font-[700] text-[#ADADAD]">Your instincts</div>
          </div>
        </div>

        {/* Section Rail Pebbles */}
        <div className="bg-gradient-to-b from-white to-[#FBFCFF] border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-center gap-[6px] flex-wrap">
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#0047CC] w-[64px]"></div>
          <div className="h-[5px] rounded-full transition-all duration-300 bg-[#E6E6E6] w-[38px]"></div>
        </div>

        {/* Main Content */}
        <main className="max-w-[680px] w-full mx-auto px-[20px] sm:px-[22px] pt-[30px] pb-[100px] flex-1">
          <div className="bg-white border border-[#E6E6E6] rounded-[16px] p-[24px] shadow-[0_10px_30px_-22px_rgba(24,35,72,0.5)]">
            <div className="font-[800] text-[12px] tracking-[0.4px] text-[#0047CC] uppercase mb-[10px]">
              Your adaptive reasoning estimate
            </div>
            <h1 className="text-[23px] font-[800] text-[#182348] tracking-[-0.4px] leading-[1.25] mb-[10px]">
              Settled in {asked} items, not a fixed sheet
            </h1>
            
            {/* Gauge */}
            <div className="h-[12px] bg-[#E6E6E6] rounded-full relative my-[20px] mb-[12px]">
              <div 
                className="absolute top-0 h-full bg-[#EBF6FF] rounded-full" 
                style={{ left: `${pos(lo)}%`, width: `${pos(hi) - pos(lo)}%` }}
              ></div>
              <i 
                className="absolute top-[-3px] w-[4px] h-[18px] rounded-[2px] bg-[#182348] transition-all duration-500" 
                style={{ left: `${pos(theta)}%` }}
              ></i>
            </div>
            
            <div className="flex justify-between text-[12px] color-[#808080] font-[700] mb-[20px]">
              <span>Foundational</span>
              <span>Moderate</span>
              <span>Very high</span>
            </div>

            <p className="text-[12.5px] text-[#808080] leading-[1.55] mt-[14px]">
              Estimate <strong>{theta.toFixed(2)}</strong> on a logit scale, with a confidence band that narrowed as the engine homed in. You answered {corr} of {asked} correctly, but the score is the estimated level, not the raw tally, because a hard item passed counts for more than an easy one and a hard item missed costs less than an easy one missed.
            </p>
            <p className="text-[12.5px] text-[#808080] leading-[1.55] mt-[14px]">
              This is the mechanism, working. In a live sitting the engine draws from a calibrated bank far larger than this, stops when the confidence band is tight enough rather than at a fixed count, and exposes no two candidates to the same sequence, which is how it stays both precise and hard to leak.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between gap-[12px] z-[50]">
          <div className="text-[13px] text-[#808080] font-[600]">
            Assessment profile generated: <strong className="text-[#1A1A1A] font-[800]">{theta.toFixed(2)}</strong>
          </div>
          <Button 
            onClick={handleContinueNextPart}
            fullWidth={false}
            className="rounded-[10px] px-[24px] py-[12px] bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] transition-all font-sans inline-flex items-center justify-center gap-[8px] text-[14px] font-[700] border-none w-full sm:w-auto"
          >
            Continue to next part
            <ArrowRightIcon className="w-[14px] h-[14px]" />
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#1A1A1A] font-sans flex flex-col relative pb-[80px]">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-[10px] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between sticky top-0 z-[50]">
        <span className="inline-flex items-center gap-[1px] text-[#0047CC]">
          <VoraLogo size="sm" to="/dashboard" />
        </span>
        <div className="text-[12.5px] text-[#808080] font-[600] text-center hidden sm:block">
          Stage 1 · Getting to know you · Adaptive reasoning
        </div>
        <div className="flex items-center gap-[6px] text-[12px] text-[#808080] font-[600]">
          <div className="w-[16px] h-[16px] rounded-full border border-[#0047CC] bg-white flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-[9px] h-[9px] text-[#0047CC]" />
          </div>
          Auto-saved
        </div>
      </header>

      {/* Chapter Rail */}
      <div className="bg-white px-[20px] sm:px-[32px] py-[12px] flex items-center justify-center gap-[12px] flex-wrap">
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)] flex items-center justify-center text-[9px] font-[800] text-white">1</div>
          <div className="text-[11.5px] font-[700] text-[#0047CC]">How you think</div>
        </div>
        <div className="w-[36px] h-[2px] bg-[#E6E6E6] rounded-[2px] hidden sm:block"></div>
        <div className="flex items-center gap-[7px]">
          <div className="w-[18px] h-[18px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[9px] font-[800] text-white">2</div>
          <div className="text-[11.5px] font-[700] text-[#ADADAD]">Your instincts</div>
        </div>
      </div>

      {/* Section Rail Pebbles */}
      <div className="bg-gradient-to-b from-white to-[#FBFCFF] border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-center gap-[6px] flex-wrap">
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#387DFF] w-[38px]"></div>
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#0047CC] w-[64px]"></div>
        <div className="h-[5px] rounded-full transition-all duration-300 bg-[#E6E6E6] w-[38px]"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-[680px] w-full mx-auto px-[20px] sm:px-[22px] pt-[30px] pb-[100px] flex-1">
        <div className="mb-[14px]">
          <Tag 
            variant="blue-soft"
            className="uppercase font-[800] tracking-[0.7px] px-[12px] py-[5px]"
            label={
              <span className="flex items-center gap-[7px]">
                <BrainIcon className="w-[12px] h-[12px]" />
                Adaptive, not a fixed form
              </span>
            }
          />
        </div>

        <h1 className="text-[23px] font-[900] text-[#182348] tracking-[-0.4px] leading-[1.25] mb-[6px]">
          Reasoning, tuned to you as you go
        </h1>
        <p className="text-[14.5px] text-[#4A4A4A] leading-[1.6] mb-[18px]">
          Every answer moves an estimate of your reasoning level, and the next item is chosen to sit right at that estimate, where it tells us the most. You get a precise read in fewer items, no two people walk an identical fixed sheet that could leak, and the same engine fits a first jobber and a principal without being too easy or too hard for either.
        </p>

        <div className="flex gap-[18px] text-[12.5px] text-[#808080] font-[700] mb-[14px]">
          <span>Item <b className="text-[#182348] font-[800]">{asked + 1}</b> of up to <b className="text-[#182348] font-[800]">{MAX_ITEMS}</b></span>
          <span>Current estimate <b className="text-[#182348] font-[800]">{asked === 0 ? 'forming' : theta.toFixed(2)}</b></span>
        </div>

        {/* Path Bar Visualization */}
        <div className="flex gap-[5px] items-end h-[44px] my-[6px] mb-[2px]">
          {resp.map((r, i) => {
            const h = Math.max(8, Math.round((r.b + 2.2) / 4.4 * 44));
            return (
              <div 
                key={i} 
                className="flex-1 rounded-t-[3px] opacity-85 transition-all duration-300"
                style={{ 
                  height: `${h}px`, 
                  backgroundColor: r.correct ? '#2CA62C' : '#DC2626' 
                }}
              />
            );
          })}
        </div>

        {/* Question — reusable adaptive item component */}
        <div className="relative">
          {adaptiveItem.content.difficultyLabel ? (
            <span className="inline-block text-[11px] font-[800] tracking-[0.3px] uppercase px-[9px] py-[3px] rounded-full bg-[#EBF6FF] text-[#0047CC] mb-[12px]">
              {String(adaptiveItem.content.difficultyLabel)}
            </span>
          ) : null}
          <AssessmentItemRenderer
            item={adaptiveItem}
            value={curPick !== null ? String(curPick) : undefined}
            onChange={(val) => handleOptionSelect(Number(val))}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-[10px] border-t border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-between gap-[12px] z-[50]">
        <div className="text-[13px] text-[#808080] font-[600]">
          {curPick === null ? 'Choose an answer' : 'Ready to submit'}
        </div>
        <div className="flex items-center gap-[10px]">
          <Button
            variant="outline"
            fullWidth={false}
            onClick={handleSave}
            className="bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-[10px] px-[18px] py-[11px] text-[13.5px] font-[700] hover:border-[#ADADAD] hover:bg-white whitespace-nowrap !min-h-0"
          >
            Save & finish later
          </Button>
          <Button
            onClick={handleSubmitAnswer}
            disabled={curPick === null}
            fullWidth={false}
            className={`rounded-[10px] px-[24px] py-[12px] text-[14px] font-[700] flex items-center justify-center transition-all whitespace-nowrap !min-h-0
              ${curPick !== null
                ? 'bg-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)] hover:bg-[#344DA1] hover:-translate-y-[1px]'
                : 'bg-[#E6E6E6] text-[#ADADAD] cursor-not-allowed shadow-none'
              }`}
          >
            {asked >= MAX_ITEMS - 1 ? 'Finish' : 'Submit answer'}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default RoleAssessmentSessionCognitive;
