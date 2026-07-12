import type { AssessmentItemRendererProps } from '../shared/types';
import { getValuesTradeoffTensions } from '../../../../utils/assessmentItems';

const ValuesTradeoffItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  isAnswerLocked,
  onChange,
}) => {
  const rowLocked = (subKey?: string) =>
    disabled || (isAnswerLocked ? isAnswerLocked(subKey) : false);
  const tensions = getValuesTradeoffTensions(item);
  const answerMap =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, number>)
      : {};

  const scaleLabels = (item.content.scaleLabels as string[] | undefined) ?? [
    'Strongly A',
    'Leaning A',
    'Balanced',
    'Leaning B',
    'Strongly B',
  ];

  const getSliderBackground = (val: number, min: number, max: number, isLocked: boolean) => {
    if (isLocked) return '#F0F0F0';
    const range = max - min;
    if (range <= 0) return '#E6F0FF';
    const valPct = ((val - min) / range) * 100;
    const centerPct = ((0 - min) / range) * 100;

    const fillCol = '#0047CC'; // Blue fill color
    const bgCol = '#E6F0FF';   // Light blue track background

    if (valPct < centerPct) {
      return `linear-gradient(to right, ${bgCol} 0%, ${bgCol} ${valPct}%, ${fillCol} ${valPct}%, ${fillCol} ${centerPct}%, ${bgCol} ${centerPct}%, ${bgCol} 100%)`;
    } else if (valPct > centerPct) {
      return `linear-gradient(to right, ${bgCol} 0%, ${bgCol} ${centerPct}%, ${fillCol} ${centerPct}%, ${fillCol} ${valPct}%, ${bgCol} ${valPct}%, ${bgCol} 100%)`;
    }
    return bgCol;
  };

  return (
    <div className="space-y-6">
      <style>{`
        .tradeoff-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          outline: none;
          margin: 18px 0 10px;
          transition: background 0.15s ease;
        }
        .tradeoff-slider:disabled {
          background: #F0F0F0 !important;
          cursor: not-allowed;
        }
        .tradeoff-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #0047CC;
          cursor: pointer;
          transition: transform 0.1s ease, border-color 0.15s ease;
          box-shadow: 0 2px 5px rgba(0,71,204,0.15);
        }
        .tradeoff-slider:disabled::-webkit-slider-thumb {
          border-color: #A0A0A0;
          cursor: not-allowed;
        }
        .tradeoff-slider::-webkit-slider-thumb:hover:not(:disabled) {
          transform: scale(1.1);
        }
        .tradeoff-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #0047CC;
          cursor: pointer;
          transition: transform 0.1s ease, border-color 0.15s ease;
          box-shadow: 0 2px 5px rgba(0,71,204,0.15);
        }
        .tradeoff-slider:disabled::-moz-range-thumb {
          border-color: #A0A0A0;
          cursor: not-allowed;
        }
        .tradeoff-slider::-moz-range-thumb:hover:not(:disabled) {
          transform: scale(1.1);
        }
      `}</style>

      {tensions.map((tension) => {
        const current = answerMap[tension.id] ?? 0;
        const index = current - tension.scaleMin;
        const currentLabel = scaleLabels[index] ?? 'Balanced';
        const isLocked = rowLocked(tension.id);

        return (
          <div
            key={tension.id}
            className="bg-white border border-[#E6E6E6] rounded-2xl p-6 shadow-sm flex flex-col"
          >
            {/* Headlines Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Lean A */}
              <div className="flex flex-col items-start text-left">
                <span className="text-[10.5px] font-black text-[#0047CC] uppercase tracking-[0.8px] mb-1.5">
                  LEAN A
                </span>
                <h4 className="text-[14.5px] font-bold text-[#1A1A1A] leading-snug mb-1">
                  {tension.leftLabel}
                </h4>
                {tension.leftSub && (
                  <p className="text-[12px] text-[#808080] leading-normal font-medium">
                    {tension.leftSub}
                  </p>
                )}
              </div>

              {/* Lean B */}
              <div className="flex flex-col items-end text-right sm:pl-4">
                <span className="text-[10.5px] font-black text-[#0047CC] uppercase tracking-[0.8px] mb-1.5">
                  LEAN B
                </span>
                <h4 className="text-[14.5px] font-bold text-[#1A1A1A] leading-snug mb-1 text-right">
                  {tension.rightLabel}
                </h4>
                {tension.rightSub && (
                  <p className="text-[12px] text-[#808080] leading-normal font-medium text-right">
                    {tension.rightSub}
                  </p>
                )}
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={tension.scaleMin}
              max={tension.scaleMax}
              step={1}
              disabled={isLocked}
              value={current}
              onChange={(e) => onChange(Number(e.target.value), tension.id)}
              className="tradeoff-slider relative z-10 cursor-pointer"
              style={{ background: getSliderBackground(current, tension.scaleMin, tension.scaleMax, isLocked) }}
            />

            {/* Slider Labels */}
            <div className="flex justify-between w-full text-[11px] text-[#808080] font-semibold px-0.5">
              <span>{scaleLabels[0] ?? 'Strongly A'}</span>
              <span>{scaleLabels[Math.floor(scaleLabels.length / 2)] ?? 'Balanced'}</span>
              <span>{scaleLabels[scaleLabels.length - 1] ?? 'Strongly B'}</span>
            </div>

            {/* Selection Pill Badge */}
            <div className="flex justify-center mt-5">
              <span className="bg-[#EBF6FF] text-[#0047CC] text-[12px] font-extrabold px-[18px] py-1.5 rounded-full shadow-sm border border-[#D0E7FF]/50 transition-all select-none">
                {currentLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ValuesTradeoffItem;
