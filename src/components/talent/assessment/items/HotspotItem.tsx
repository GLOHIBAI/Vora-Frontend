import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

interface HotspotOption {
  id: string;
  text: string;
}

const HotspotItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Tap the line of code causing the performance issue.';
  const options = (content.options as HotspotOption[]) ?? [];
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'hotspot', {
    reasonShown: true,
  });

  const selectedAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as { optionId?: string; choice?: string; reasoning?: string; reason?: string })
      : { optionId: typeof value === 'string' ? value : '' };

  const selectedOptionId = String(selectedAnswer.optionId ?? selectedAnswer.choice ?? '');
  const reasoningText = String(selectedAnswer.reasoning ?? selectedAnswer.reason ?? '');

  const handleSelectLine = (optionId: string) => {
    onChange({
      choice: optionId,
      optionId,
      reason: reasoningText,
      reasoning: reasoningText,
    });
  };

  const handleReasoning = (reasoning: string) => {
    onChange({
      choice: selectedOptionId,
      optionId: selectedOptionId,
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

      <div className="mb-5 rounded-[14px] overflow-hidden border border-[#E6E6E6] bg-white shadow-sm font-mono text-[13px]">
        <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[#E6E6E6] text-[11px] font-mono text-[#0047CC] font-bold uppercase tracking-wider">
          Tap the line containing the issue
        </div>
        <div className="p-2 space-y-1">
          {options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => !disabled && handleSelectLine(opt.id)}
                className={`p-2 px-3 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#EBF6FF] border border-[#0047CC] text-[#0047CC] font-bold shadow-sm'
                    : 'hover:bg-[#F8FAFC] border border-transparent text-[#1E293B]'
                }`}
              >
                <span className="select-none text-[#94A3B8] text-[11px] w-6 text-right shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-mono whitespace-pre-wrap leading-relaxed">{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ReasonTextarea
        label={String(content.reasonPrompt || content.reasoningPrompt || 'WHY IS THIS LINE CAUSING THE ISSUE?')}
        value={reasoningText}
        onChange={handleReasoning}
        disabled={disabled}
        placeholder="Explain why this line is causing the problem..."
        minWords={minWords}
        content={content as Record<string, unknown>}
        itemType="hotspot"
      />
    </AssessmentItemCard>
  );
};

export default HotspotItem;
