import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

interface HighlightOption {
  id: string;
  text: string;
}

const HighlightItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Tap the parts of the message that could be improved.';
  const options = (content.options as HighlightOption[]) ?? [];
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'highlight', {
    reasonShown: true,
  });

  const selectedAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as { selectedIds?: string[]; reasoning?: string; reason?: string })
      : { selectedIds: [] };

  const selectedIds = selectedAnswer.selectedIds || [];
  const reasoningText = String(selectedAnswer.reasoning ?? selectedAnswer.reason ?? '');

  const toggleHighlight = (optionId: string) => {
    const nextSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    onChange({
      selectedIds: nextSelected,
      reason: reasoningText,
      reasoning: reasoningText,
    });
  };

  const handleReasoning = (reasoning: string) => {
    onChange({
      selectedIds,
      reason: reasoning,
      reasoning,
    });
  };

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      <div className="mb-5 bg-white border border-[#E6E6E6] rounded-[14px] p-5 shadow-sm space-y-2">
        <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-wider mb-2">
          Tap parts to highlight/select
        </div>
        <div className="flex flex-wrap gap-2 leading-relaxed">
          {options.map((opt) => {
            const isHighlighted = selectedIds.includes(opt.id);

            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleHighlight(opt.id)}
                className={`p-2 px-3 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer ${
                  isHighlighted
                    ? 'bg-[#EBF6FF] border-2 border-[#0047CC] text-[#0047CC] font-bold shadow-sm'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:border-[#0047CC]/40'
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      <ReasonTextarea
        label={String(content.reasonPrompt || content.reasoningPrompt || 'HOW CAN THIS BE IMPROVED?')}
        value={reasoningText}
        onChange={handleReasoning}
        disabled={disabled}
        placeholder="Explain how this error message or text can be improved..."
        minWords={minWords}
        content={content as Record<string, unknown>}
        itemType="highlight"
      />
    </AssessmentItemCard>
  );
};

export default HighlightItem;
