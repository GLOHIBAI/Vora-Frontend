import React from 'react';
import AssessmentItemRenderer from './AssessmentItemRenderer';
import type { AssessmentItem, AnswerValue } from '../../../services/queries/assessments/types';

interface AssessmentItemsListProps {
  items: AssessmentItem[];
  answers: Record<string, AnswerValue | undefined>;
  isLocked: (itemId: string, subKey?: string) => boolean;
  onAnswer: (itemId: string, value: AnswerValue, item: AssessmentItem, subKey?: string) => void;
  isAdaptiveLoading?: boolean;
  incompleteItemIds?: string[];
  showIncompleteHighlight?: boolean;
}

/** Renders a list of API items reusable in any gate/stage screen. */
const AssessmentItemsList: React.FC<AssessmentItemsListProps> = ({
  items,
  answers,
  isLocked,
  onAnswer,
  isAdaptiveLoading = false,
}) => {
  return (
    <div className="space-y-[32px]">
      {items.map((item) => {
        const itemLocked = isLocked(item.id);
        return (
          <div
            key={item.id}
            id={`assessment-item-${item.id}`}
            className={`scroll-mt-[220px] transition-opacity duration-200 relative ${
              itemLocked ? 'cursor-not-allowed opacity-85 select-none [&_*]:cursor-not-allowed' : ''
            }`}
          >
            {itemLocked && (
              <div
                className="absolute inset-0 z-30 cursor-not-allowed bg-transparent"
                title="This question has been saved and is locked."
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
            <AssessmentItemRenderer
              item={item}
              value={answers[item.id]}
              disabled={itemLocked}
              isAnswerLocked={(subKey) => isLocked(item.id, subKey)}
              onChange={(val, subKey) => {
                if (itemLocked) return;
                onAnswer(item.id, val, item, subKey);
              }}
              isAdaptiveLoading={isAdaptiveLoading}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentItemsList;
