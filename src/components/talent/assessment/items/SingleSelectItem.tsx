import AssessmentItemCard from '../shared/AssessmentItemCard';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';

const SingleSelectItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? content.stem ?? 'Question';
  const options = content.options ?? content.values ?? [];

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario ? (
        <div className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 mb-4 text-sm text-[#1A1A1A] leading-relaxed">
          {String(content.scenario)}
        </div>
      ) : null}
      {content.subPrompt ? (
        <p className="text-sm text-[#808080] mb-4">{String(content.subPrompt)}</p>
      ) : null}
      <div className="space-y-2">
        {options.map((opt) => (
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

export default SingleSelectItem;
