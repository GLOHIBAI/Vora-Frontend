import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

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

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const selectedAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as { optionId?: string; reasoning?: string })
      : { optionId: typeof value === 'string' ? value : '' };

  const handleSelectLine = (optionId: string) => {
    onChange({
      ...selectedAnswer,
      optionId,
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

      {/* Code Hotspot Selectable Lines */}
      <div className="mb-5 rounded-[14px] overflow-hidden border border-[#E6E6E6] bg-white shadow-sm font-mono text-[13px]">
        <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[#E6E6E6] text-[11px] font-mono text-[#0047CC] font-bold uppercase tracking-wider">
          Tap the line containing the issue
        </div>
        <div className="p-2 space-y-1">
          {options.map((opt, idx) => {
            const isSelected = selectedAnswer.optionId === opt.id;

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

      {/* Reasoning text prompt */}
      <div className="mt-5 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>{String(content.reasonPrompt || content.reasoningPrompt || 'WHY IS THIS LINE CAUSING THE ISSUE?').toUpperCase()}</span>
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
          placeholder="Explain why this line is causing the problem..."
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

export default HotspotItem;
