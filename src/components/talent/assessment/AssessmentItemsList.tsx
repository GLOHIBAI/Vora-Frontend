import AssessmentItemRenderer from './AssessmentItemRenderer';
import type { AssessmentItem, AnswerValue } from '../../../services/queries/assessments/types';

interface AssessmentItemsListProps {
  items: AssessmentItem[];
  answers: Record<string, AnswerValue | undefined>;
  isLocked: (itemId: string, subKey?: string) => boolean;
  onAnswer: (itemId: string, value: AnswerValue, item: AssessmentItem, subKey?: string) => void;
  isAdaptiveLoading?: boolean;
  /** Item ids that are incomplete after a Continue attempt. */
  incompleteItemIds?: string[];
  showIncompleteHighlight?: boolean;
}

/** Renders a list of API items reusable in any gate/stage screen. */
const AssessmentItemsList: React.FC<AssessmentItemsListProps> = ({
  items,
  answers,
  isLocked,
  onAnswer,
  isAdaptiveLoading,
  incompleteItemIds = [],
  showIncompleteHighlight = false,
}) => {
  const incompleteSet = new Set(incompleteItemIds);

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isIncomplete = showIncompleteHighlight && incompleteSet.has(item.id);
        return (
          <div
            key={item.id}
            id={`assessment-item-${item.id}`}
            data-incomplete={isIncomplete ? 'true' : undefined}
            className={
              isIncomplete
                ? 'rounded-[18px] ring-2 ring-[#DC2626]/35 ring-offset-2 scroll-mt-[220px]'
                : 'scroll-mt-[220px]'
            }
          >
            <AssessmentItemRenderer
              item={item}
              value={answers[item.id]}
              disabled={isLocked(item.id)}
              isAnswerLocked={(subKey) => isLocked(item.id, subKey)}
              onChange={(val, subKey) => onAnswer(item.id, val, item, subKey)}
              isAdaptiveLoading={isAdaptiveLoading}
            />
            {isIncomplete ? (
              <p className="mt-2 px-1 text-[12px] font-[600] text-[#DC2626]">
                This question still needs a complete answer
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentItemsList;
