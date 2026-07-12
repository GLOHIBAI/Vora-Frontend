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

  const prompt = item.content.prompt as string | undefined;

  return (
    <div className="space-y-6">
      {pairs.map((pair, idx) => {
        const pairPrompt =
          idx === 0
            ? prompt
            : 'And which of these feels closer to you?';

        return (
          <div
            key={pair.id}
            className="bg-white border-[1.5px] border-[#E6E6E6] rounded-[18px] p-[24px_26px]"
          >
            {pairPrompt && (
              <p className="text-[15.5px] font-bold text-[#1A1A1A] leading-[1.5] mb-[18px]">
                {pairPrompt}
              </p>
            )}
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
                    className={`text-left border-[1.5px] rounded-[14px] p-[18px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ${
                      selected
                        ? 'border-[#0047CC] bg-[#EBF6FF] shadow-[0_0_0_3px_rgba(0,71,204,0.1)]'
                        : 'border-[#E6E6E6] bg-white hover:border-[#387DFF] hover:bg-[#EBF6FF]'
                    }`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black mb-2.5 ${
                        selected
                          ? 'bg-[#0047CC] text-white'
                          : 'bg-[#F7F7F7] text-[#808080]'
                      }`}
                    >
                      {side}
                    </div>
                    <div className="text-[14px] font-semibold text-[#1A1A1A] leading-[1.5]">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ValuesAbPairsItem;
