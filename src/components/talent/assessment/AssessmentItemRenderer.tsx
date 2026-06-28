import type { AssessmentItem, AnswerValue } from '../../../services/queries/assessments/types';
import { resolveAssessmentItemComponent } from './items/registry';
import SingleSelectItem from './items/SingleSelectItem';
import type { AssessmentItemRendererProps } from './shared/types';

export type { AssessmentItemRendererProps } from './shared/types';

const AssessmentItemRenderer: React.FC<AssessmentItemRendererProps> = (props) => {
  const Component = resolveAssessmentItemComponent(props.item.type) ?? SingleSelectItem;
  return <Component {...props} />;
};

export default AssessmentItemRenderer;
