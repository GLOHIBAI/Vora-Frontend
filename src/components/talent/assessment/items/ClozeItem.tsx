import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import { CustomSelect, type CustomSelectOption } from '../shared/CustomSelect';
import type { AssessmentItemRendererProps } from '../shared/types';

interface ClozeBlank {
  id: string;
  choices: string[];
}

const ClozeItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Complete the code by choosing the correct word for each blank.';
  const template = String(content.template ?? '');
  const blanks = (content.blanks as ClozeBlank[]) ?? [];

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const selectedAnswers =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};

  const handleSelectBlank = (blankId: string, choiceVal: string) => {
    onChange({
      ...selectedAnswers,
      [blankId]: choiceVal,
    });
  };

  // Render template with custom select dropdowns for blanks (matching ------ or ____)
  const templateParts = template.split(/(---+|___+)/g);
  let blankIndex = 0;

  const scenarioText = String(content.scenario ?? '').trim();
  const templateText = String(content.template ?? '').trim();
  const isDuplicateScenario =
    scenarioText && templateText && (templateText.includes(scenarioText) || scenarioText === templateText);

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && !isDuplicateScenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {/* Code Template Block with Custom Dropdown Blanks */}
      <div className="mb-5 bg-white border border-[#E6E6E6] rounded-[14px] p-5 shadow-sm font-sans text-[14px] leading-[2.4]">
        <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-wider mb-3">
          Fill in the Blank
        </div>
        <div className="whitespace-pre-wrap text-[#1E293B] font-sans">
          {templateParts.map((part, idx) => {
            if (/^(---+|___+)$/.test(part)) {
              const currentBlank = blanks[blankIndex];
              blankIndex++;

              if (!currentBlank) {
                return <span key={idx} className="text-[#0047CC] font-bold">------</span>;
              }

              const currentValue = selectedAnswers[currentBlank.id] || '';
              const selectOptions: CustomSelectOption[] = currentBlank.choices.map((c) => ({
                value: c,
                label: c,
              }));

              return (
                <span key={idx} className="inline-block mx-1.5 my-0.5 align-middle">
                  <CustomSelect
                    size="sm"
                    disabled={disabled}
                    value={currentValue}
                    onChange={(val) => handleSelectBlank(currentBlank.id, val)}
                    placeholder="Choose option"
                    options={selectOptions}
                  />
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </div>
      </div>

      {/* Reasoning optional prompt */}
      {(content.reasonPrompt || content.reasoningPrompt) && (
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            <span>{String(content.reasonPrompt || content.reasoningPrompt).toUpperCase()}</span>
          </div>

          <textarea
            disabled={disabled}
            value={selectedAnswers.reason || selectedAnswers.reasoning || ''}
            onChange={(e) => onChange({ ...selectedAnswers, reason: e.target.value, reasoning: e.target.value })}
            onPaste={(e) => {
              const ENABLE_PASTE_BLOCKING = false;
              if (!ENABLE_PASTE_BLOCKING) return;
              e.preventDefault();
              setShowPasteWarning(true);
              toast.error('Pasting is disabled for reasoning answers');
            }}
            placeholder="Explain your choices in a sentence..."
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

export default ClozeItem;
