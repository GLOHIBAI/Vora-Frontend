import Tag from '../../../common/Tag';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import { getForcedChoiceBlocks } from '../../../../utils/assessmentItems';
import type { ForcedChoiceBlockAnswer } from '../../../../services/queries/assessments/types';

const ForcedChoiceItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  isAnswerLocked,
  onChange,
}) => {
  const rowLocked = (subKey?: string) =>
    disabled || (isAnswerLocked ? isAnswerLocked(subKey) : false);
  const blocks = getForcedChoiceBlocks(item);
  const answerMap =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, ForcedChoiceBlockAnswer>)
      : {};

  const pick = (blockId: string, statementId: string, pole: 'most' | 'least') => {
    const current = answerMap[blockId] ?? { most: '', least: '' };
    const next = { ...current };

    if (pole === 'most') {
      next.most = current.most === statementId ? '' : statementId;
      if (next.least === statementId) next.least = '';
    } else {
      next.least = current.least === statementId ? '' : statementId;
      if (next.most === statementId) next.most = '';
    }

    onChange(next, blockId);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const blockAnswer = answerMap[block.id] ?? { most: '', least: '' };
        return (
          <AssessmentItemCard key={block.id} label={`Block ${idx + 1}`}>
            <p className="text-xs text-[#808080] mb-4">
              Select the statement that is most like you and least like you.
            </p>
            <div className="space-y-3">
              {block.statements.map((statement) => {
                const isMost = blockAnswer.most === statement.id;
                const isLeast = blockAnswer.least === statement.id;
                return (
                  <div
                    key={statement.id}
                    className="border border-[#E6E6E6] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      {statement.tag ? (
                        <Tag variant="blue-light" label={statement.tag} className="mb-2" />
                      ) : null}
                      <p className="text-sm text-[#1A1A1A]">{statement.label}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={rowLocked(block.id)}
                        onClick={() => pick(block.id, statement.id, 'most')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          isMost
                            ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]'
                            : 'border-[#E6E6E6]'
                        }`}
                      >
                        Most like me
                      </button>
                      <button
                        type="button"
                        disabled={rowLocked(block.id)}
                        onClick={() => pick(block.id, statement.id, 'least')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          isLeast
                            ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                            : 'border-[#E6E6E6]'
                        }`}
                      >
                        Least like me
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </AssessmentItemCard>
        );
      })}
    </div>
  );
};

export default ForcedChoiceItem;
