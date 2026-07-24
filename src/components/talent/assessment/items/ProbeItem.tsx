import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

const ProbeItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Provide your answer.';

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const textValue = typeof value === 'string' ? value : String((value as any)?.prose ?? (value as any)?.reason ?? '');

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      <div className="mt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>YOUR RESPONSE</span>
        </div>

        <textarea
          disabled={disabled}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const ENABLE_PASTE_BLOCKING = false;
            if (!ENABLE_PASTE_BLOCKING) return;
            e.preventDefault();
            setShowPasteWarning(true);
            toast.error('Pasting is disabled for reasoning answers');
          }}
          placeholder="Write your response here..."
          className="w-full min-h-[110px] p-3.5 sm:p-4 bg-white border border-[#0047CC] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed"
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

export default ProbeItem;
