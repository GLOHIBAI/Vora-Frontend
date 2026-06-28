import type { AssessmentItemRendererProps } from '../shared/types';
import type { RankAnswerValue } from '../../../../services/queries/assessments/types';
import { getRankOptionIds } from '../../../../utils/assessmentItems';

const RankItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const options = item.content.options ?? item.content.values ?? [];
  const defaultOrder = getRankOptionIds(item);
  const ranked = (Array.isArray(value) && value.length > 0 ? value : defaultOrder) as RankAnswerValue;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ranked.length) return;
    const next = [...ranked];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {ranked.map((optionId, idx) => {
        const opt = options.find((o) => o.id === optionId);
        return (
          <div
            key={optionId}
            className="flex items-center gap-3 bg-white border border-[#E6E6E6] rounded-lg px-4 py-3"
          >
            <span className="text-xs font-bold text-[#0047CC] w-6">{idx + 1}</span>
            <span className="flex-1 text-sm">{opt?.label ?? optionId}</span>
            <button
              type="button"
              disabled={disabled || idx === 0}
              onClick={() => move(idx, idx - 1)}
              className="text-xs px-2 py-1 border rounded disabled:opacity-40"
            >
              Up
            </button>
            <button
              type="button"
              disabled={disabled || idx === ranked.length - 1}
              onClick={() => move(idx, idx + 1)}
              className="text-xs px-2 py-1 border rounded disabled:opacity-40"
            >
              Down
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RankItem;
