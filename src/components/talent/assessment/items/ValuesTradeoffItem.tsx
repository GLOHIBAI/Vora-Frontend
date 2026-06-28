import AssessmentItemCard from '../shared/AssessmentItemCard';
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

  return (
    <div className="space-y-4">
      {tensions.map((tension, idx) => {
        const current = answerMap[tension.id] ?? 0;
        const steps = tension.scaleMax - tension.scaleMin;
        return (
          <AssessmentItemCard key={tension.id} label={`Trade-off ${idx + 1}`}>
            <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
              <p className="text-[#1A1A1A]">{tension.leftLabel}</p>
              <p className="text-[#1A1A1A] sm:text-right">{tension.rightLabel}</p>
            </div>
            <input
              type="range"
              min={tension.scaleMin}
              max={tension.scaleMax}
              step={1}
              disabled={rowLocked(tension.id)}
              value={current}
              onChange={(e) => onChange(Number(e.target.value), tension.id)}
              className="w-full accent-[#0047CC]"
            />
            <div className="flex justify-between text-xs text-[#808080] mt-2">
              <span>{tension.leftLabel}</span>
              <span className="font-semibold text-[#0047CC]">{current}</span>
              <span>{tension.rightLabel}</span>
            </div>
            {steps > 0 ? (
              <div className="flex justify-between text-[10px] text-[#ADADAD] mt-1 px-1">
                {Array.from({ length: steps + 1 }, (_, i) => tension.scaleMin + i).map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            ) : null}
          </AssessmentItemCard>
        );
      })}
    </div>
  );
};

export default ValuesTradeoffItem;
