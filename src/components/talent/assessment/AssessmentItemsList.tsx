import AssessmentItemRenderer from './AssessmentItemRenderer';
import type { AssessmentItem, AnswerValue } from '../../../services/queries/assessments/types';

interface AssessmentItemsListProps {
  items: AssessmentItem[];
  answers: Record<string, AnswerValue | undefined>;
  isLocked: (itemId: string, subKey?: string) => boolean;
  onAnswer: (itemId: string, value: AnswerValue, item: AssessmentItem, subKey?: string) => void;
}

/** Renders a list of API items — reusable in any gate/stage screen. */
const AssessmentItemsList: React.FC<AssessmentItemsListProps> = ({
  items,
  answers,
  isLocked,
  onAnswer,
}) => (
  <div className="space-y-6">
    {items.map((item) => (
      <div key={item.id}>
        {item.title ? (
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">{item.title}</h2>
        ) : null}
        {item.total > 1 ? (
          <p className="text-xs font-bold text-[#0047CC] uppercase mb-2">
            Part {item.sequence} of {item.total}
          </p>
        ) : null}
        <AssessmentItemRenderer
          item={item}
          value={answers[item.id]}
          disabled={isLocked(item.id)}
          isAnswerLocked={(subKey) => isLocked(item.id, subKey)}
          onChange={(val, subKey) => onAnswer(item.id, val, item, subKey)}
        />
      </div>
    ))}
  </div>
);

export default AssessmentItemsList;
