import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import { CustomSelect, type CustomSelectOption } from '../shared/CustomSelect';
import type { AssessmentItemRendererProps } from '../shared/types';

interface MatchSideItem {
  id: string;
  text: string;
}

const MatchItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Match each concept to its corresponding description.';
  const left = (content.left as MatchSideItem[]) ?? [];
  const rightChoices = (content.rightChoices as Array<MatchSideItem | string>) ?? [];

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const selectedMatches =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};

  const handleMatch = (leftId: string, rightId: string) => {
    onChange({
      ...selectedMatches,
      [leftId]: rightId,
    });
  };

  const formattedOptions: CustomSelectOption[] = rightChoices.map((r) =>
    typeof r === 'string'
      ? { value: r, label: r }
      : { value: r.id ?? r.text, label: r.text ?? r.id }
  );

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {/* Match concept rows using CustomSelect */}
      <div className="space-y-4 mb-5">
        {left.map((lItem) => {
          const currentChoice = selectedMatches[lItem.id] || '';

          return (
            <div
              key={lItem.id}
              className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 shadow-sm space-y-2.5"
            >
              <div className="text-[13.5px] font-bold text-[#0047CC]">
                {lItem.text}
              </div>

              <CustomSelect
                disabled={disabled}
                value={currentChoice}
                onChange={(val) => handleMatch(lItem.id, val)}
                placeholder="Choose option"
                options={formattedOptions}
              />
            </div>
          );
        })}
      </div>

      {/* Optional Reasoning Prompt */}
      {(content.reasonPrompt || content.reasoningPrompt) && (
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            <span>{String(content.reasonPrompt || content.reasoningPrompt).toUpperCase()}</span>
          </div>

          <textarea
            disabled={disabled}
            value={selectedMatches.reasoning || selectedMatches.reason || ''}
            onChange={(e) => onChange({ ...selectedMatches, reason: e.target.value, reasoning: e.target.value })}
            onPaste={(e) => {
              const ENABLE_PASTE_BLOCKING = false;
              if (!ENABLE_PASTE_BLOCKING) return;
              e.preventDefault();
              setShowPasteWarning(true);
              toast.error('Pasting is disabled for reasoning answers');
            }}
            placeholder="Explain your matching logic..."
            className="w-full min-h-[76px] p-3.5 sm:p-4 bg-white border border-[#0047CC] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {showPasteWarning && (
            <div className="bg-[#FFF4EC] border border-[#FFD6B3] rounded-[10px] p-[10px_14px] mt-2.5 text-[12px] font-[600] text-[#C2410C] flex items-center justify-between animate-[fadeUp_0.2s_ease_both]">
              <span>Please answer in your own words. Pasting is turned off here.</span>
            </div>
          )}
        </div>
      )}
    </AssessmentItemCard>
  );
};

export default MatchItem;
