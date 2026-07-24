import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

const CompareItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Compare Option A and Option B and choose the best approach.';
  const optionA = content.optionA ? String(content.optionA) : 'Option A';
  const optionB = content.optionB ? String(content.optionB) : 'Option B';
  const justifyPrompt = String(content.justifyPrompt || content.reasonPrompt || 'Explain your reasoning for this choice.');

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const selectedChoice =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).choice ?? '')
      : typeof value === 'string'
      ? value
      : '';

  const reasoningText =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).reason ?? (value as any).reasoning ?? '')
      : '';

  const handleSelect = (choice: 'A' | 'B') => {
    onChange({
      choice,
      reason: reasoningText,
    });
  };

  const handleReason = (reason: string) => {
    onChange({
      choice: selectedChoice || 'A',
      reason,
    });
  };

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {/* Side-by-side A/B Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Option A */}
        <div
          onClick={() => !disabled && handleSelect('A')}
          className={`p-5 rounded-[16px] border-2 cursor-pointer transition-all ${
            selectedChoice === 'A'
              ? 'border-[#0047CC] bg-[#EBF6FF] shadow-md ring-2 ring-[#0047CC]/15'
              : 'border-[#E6E6E6] bg-white hover:border-[#0047CC]/40 hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-[#0047CC] tracking-wider uppercase bg-white px-2.5 py-1 rounded-full border border-[#0047CC]/30">
              Option A
            </span>
            {selectedChoice === 'A' && (
              <svg className="w-5 h-5 text-[#0047CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p className="text-[13.5px] text-[#1E293B] font-medium leading-relaxed">
            {optionA}
          </p>
        </div>

        {/* Option B */}
        <div
          onClick={() => !disabled && handleSelect('B')}
          className={`p-5 rounded-[16px] border-2 cursor-pointer transition-all ${
            selectedChoice === 'B'
              ? 'border-[#0047CC] bg-[#EBF6FF] shadow-md ring-2 ring-[#0047CC]/15'
              : 'border-[#E6E6E6] bg-white hover:border-[#0047CC]/40 hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-[#0047CC] tracking-wider uppercase bg-white px-2.5 py-1 rounded-full border border-[#0047CC]/30">
              Option B
            </span>
            {selectedChoice === 'B' && (
              <svg className="w-5 h-5 text-[#0047CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p className="text-[13.5px] text-[#1E293B] font-medium leading-relaxed">
            {optionB}
          </p>
        </div>
      </div>

      {/* Justification Textarea */}
      <div className="mt-5 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>{justifyPrompt.toUpperCase()}</span>
        </div>

        <textarea
          disabled={disabled}
          value={reasoningText}
          onChange={(e) => handleReason(e.target.value)}
          onPaste={(e) => {
            const ENABLE_PASTE_BLOCKING = false;
            if (!ENABLE_PASTE_BLOCKING) return;
            e.preventDefault();
            setShowPasteWarning(true);
            toast.error('Pasting is disabled for reasoning answers');
          }}
          placeholder="Explain your choice in a sentence..."
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

export default CompareItem;
