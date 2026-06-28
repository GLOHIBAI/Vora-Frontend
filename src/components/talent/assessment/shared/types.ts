import type { AssessmentItem, AnswerValue } from '../../../../services/queries/assessments/types';

/** Props shared by every question-format component (Stages 1–3). */
export interface AssessmentItemRendererProps {
  item: AssessmentItem;
  value: AnswerValue | undefined;
  /** Whole item locked (whole-item types). */
  disabled?: boolean;
  /** Per sub-key lock (likert questionId, forced-choice blockId, values pairId). */
  isAnswerLocked?: (subKey?: string) => boolean;
  onChange: (value: AnswerValue, subKey?: string) => void;
}

export type ItemComponent = React.FC<AssessmentItemRendererProps>;
