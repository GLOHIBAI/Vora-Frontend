import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import { getValuesAbPairs } from '../../../../utils/assessmentItems';

const ValuesAbPairsItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  isAnswerLocked,
  onChange,
}) => {
  const rowLocked = (subKey?: string) =>
    disabled || (isAnswerLocked ? isAnswerLocked(subKey) : false);
  const pairs = getValuesAbPairs(item);
  const answerMap =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, 'A' | 'B'>)
      : {};

  return (
    <div className="space-y-4">
      {pairs.map((pair, idx) => (
        <AssessmentItemCard key={pair.id} label={`Pair ${idx + 1}`}>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['A', 'B'] as const).map((side) => {
              const selected = answerMap[pair.id] === side;
              const label = side === 'A' ? pair.labelA : pair.labelB;
              return (
                <button
                  key={side}
                  type="button"
                  disabled={rowLocked(pair.id)}
                  onClick={() => onChange(side, pair.id)}
                  className={`px-4 py-3 rounded-lg border text-sm text-left ${
                    selected
                      ? 'border-[#0047CC] bg-[#EBF6FF]'
                      : 'border-[#E6E6E6] bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-[#0047CC] mr-2">{side}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </AssessmentItemCard>
      ))}
    </div>
  );
};

export default ValuesAbPairsItem;
