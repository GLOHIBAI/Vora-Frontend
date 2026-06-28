import AssessmentItemCard from '../shared/AssessmentItemCard';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';

const AdaptiveMcqItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.stem ?? content.scenario ?? 'Question';
  const stepOptions = content.options ?? [];

  return (
    <AssessmentItemCard title={String(prompt)}>
      {typeof content.stepIndex === 'number' && typeof content.totalSteps === 'number' ? (
        <p className="text-xs text-[#808080] mb-4">
          Step {content.stepIndex + 1} of {content.totalSteps}
        </p>
      ) : null}
      <div className="space-y-2">
        {stepOptions.map((opt) => (
          <OptionButton
            key={opt.id}
            label={opt.label}
            selected={value === opt.id}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
          />
        ))}
      </div>
    </AssessmentItemCard>
  );
};

export default AdaptiveMcqItem;
