import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

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

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const selectedAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as { selectedIds?: string[]; reasoning?: string })
      : { selectedIds: [] };

  const selectedIds = selectedAnswer.selectedIds || [];

  const toggleHighlight = (optionId: string) => {
    const nextSelected = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    onChange({
      ...selectedAnswer,
      selectedIds: nextSelected,
    });
  };

  const handleReasoning = (reasoning: string) => {
    onChange({
      ...selectedAnswer,
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

      {/* Interactive Highlightable Text Blocks */}
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

      {/* Reasoning text prompt */}
      <div className="mt-5 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>{String(content.reasonPrompt || content.reasoningPrompt || 'HOW CAN THIS BE IMPROVED?').toUpperCase()}</span>
        </div>

        <textarea
          disabled={disabled}
          value={selectedAnswer.reasoning || ''}
          onChange={(e) => handleReasoning(e.target.value)}
          onPaste={(e) => {
            const ENABLE_PASTE_BLOCKING = false;
            if (!ENABLE_PASTE_BLOCKING) return;
            e.preventDefault();
            setShowPasteWarning(true);
            toast.error('Pasting is disabled for reasoning answers');
          }}
          placeholder="Explain how this error message or text can be improved..."
          className="w-full min-h-[76px] p-3.5 sm:p-4 bg-white border border-[#0047CC] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {showPasteWarning && (
          <div className="bg-[#FFF4EC] border border-[#FFD6B3] rounded-[10px] p-[10px_14px] mt-2.5 text-[12px] font-[600] text-[#C2410C] flex items-center justify-between animate-[fadeUp_0.2s_ease_both]">
            <span>Please answer in your own words. Pasting is turned off here.</span>
          </div>
        )}
      </div>
    </AssessmentItemCard>
  );
};

export default HighlightItem;
