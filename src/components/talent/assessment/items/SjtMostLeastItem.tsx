import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import type { MostLeastAnswerValue } from '../../../../services/queries/assessments/types';

const SjtMostLeastItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? '';
  const options = content.options ?? content.values ?? [];
  const current = (value as MostLeastAnswerValue | undefined) ?? { most: '', least: '' };

  const pickMost = (optionId: string) => {
    const next = { ...current };
    if (next.most === optionId) {
      next.most = '';
    } else {
      next.most = optionId;
      if (next.least === optionId) next.least = '';
    }
    onChange(next);
  };

  const pickLeast = (optionId: string) => {
    const next = { ...current };
    if (next.least === optionId) {
      next.least = '';
    } else {
      next.least = optionId;
      if (next.most === optionId) next.most = '';
    }
    onChange(next);
  };

  return (
    <AssessmentItemCard title={prompt ? String(prompt) : undefined}>
      <div className="space-y-3">
        {options.map((opt) => {
          const isMost = current.most === opt.id;
          const isLeast = current.least === opt.id;
          return (
            <div
              key={opt.id}
              className={`border-[1.5px] rounded-[14px] p-4 flex flex-col sm:flex-row gap-3 sm:items-center ${
                isMost
                  ? 'border-[#387DFF]/60 bg-gradient-to-b from-[#EBF6FF] to-white'
                  : isLeast
                    ? 'border-[#F5B7BE] bg-gradient-to-b from-[#FEEBEE] to-white'
                    : 'border-[#E6E6E6] bg-white'
              }`}
            >
              <p className="flex-1 text-sm text-[#1A1A1A]">{opt.label ?? opt.text}</p>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pickMost(opt.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isMost ? 'border-[#0047CC] bg-[#0047CC] text-white' : 'border-[#E6E6E6]'
                  }`}
                >
                  Most
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pickLeast(opt.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isLeast ? 'border-[#DC3545] bg-[#DC3545] text-white' : 'border-[#E6E6E6]'
                  }`}
                >
                  Least
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AssessmentItemCard>
  );
};

export default SjtMostLeastItem;
