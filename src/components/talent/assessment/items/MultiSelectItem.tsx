import AssessmentItemCard from '../shared/AssessmentItemCard';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';

const MultiSelectItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? '';
  const options = content.options ?? content.values ?? [];
  const selected = Array.isArray(value) ? value : [];
  const maxSelect = Number(content.maxSelect ?? options.length);
  const minSelect = Number(content.minSelect ?? 1);

  const toggle = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId));
      return;
    }
    if (selected.length >= maxSelect) return;
    onChange([...selected, optionId]);
  };

  return (
    <AssessmentItemCard title={prompt ? String(prompt) : undefined}>
      <p className="text-xs text-[#808080] mb-3">
        Select {minSelect === maxSelect ? minSelect : `${minSelect}–${maxSelect}`} option
        {maxSelect === 1 ? '' : 's'}.
      </p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const atMax = !isSelected && selected.length >= maxSelect;
          return (
            <OptionButton
              key={opt.id}
              label={opt.label}
              selected={isSelected}
              disabled={disabled || atMax}
              onClick={() => toggle(opt.id)}
            />
          );
        })}
      </div>
    </AssessmentItemCard>
  );
};

export default MultiSelectItem;
