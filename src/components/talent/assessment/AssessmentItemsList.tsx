import AssessmentItemRenderer from './AssessmentItemRenderer';
import type { AssessmentItem, AnswerValue } from '../../../services/queries/assessments/types';

interface AssessmentItemsListProps {
  items: AssessmentItem[];
  answers: Record<string, AnswerValue | undefined>;
  isLocked: (itemId: string, subKey?: string) => boolean;
  onAnswer: (itemId: string, value: AnswerValue, item: AssessmentItem, subKey?: string) => void;
  isAdaptiveLoading?: boolean;
}

/** Renders a list of API items reusable in any gate/stage screen. */
const AssessmentItemsList: React.FC<AssessmentItemsListProps> = ({
  items,
  answers,
  isLocked,
  onAnswer,
  isAdaptiveLoading,
}) => (
  <div className="space-y-6">
    {items.map((item) => (
      <div key={item.id}>
        <AssessmentItemRenderer
          item={item}
          value={answers[item.id]}
          disabled={isLocked(item.id)}
          isAnswerLocked={(subKey) => isLocked(item.id, subKey)}
          onChange={(val, subKey) => onAnswer(item.id, val, item, subKey)}
          isAdaptiveLoading={isAdaptiveLoading}
        />
      </div>
    ))}
  </div>
);

export default AssessmentItemsList;
