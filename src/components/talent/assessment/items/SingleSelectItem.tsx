import React from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';
import { DataDisplayBlock } from '../shared/DataDisplayBlock';

const SingleSelectItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? content.stem ?? 'Question';
  const options = content.options ?? content.values ?? [];

  // Extract selected optionId and reasoning text if value is an object vs string
  const selectedOptionId =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).choice ?? (value as any).optionId ?? (value as any).selected ?? '')
      : typeof value === 'string'
      ? value
      : undefined;

  const reasoningText =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).reason ?? (value as any).reasoning ?? '')
      : '';

  const normalizedType = String(item.type ?? item.content?.type ?? '').toLowerCase();

  // Choice + Reason types according to Stage 2 spec
  const isChoiceReasonType = [
    'allocate', 'jb', 'data', 'dashboard', 'hotspot', 'highlight', 'ml',
    'nextq', 'diagnose', 'proofread', 'abtest', 'compare'
  ].includes(normalizedType);

  // Single option string types (sb) MUST send plain string unless explicitly configured with reasonPrompt
  const isSingleOptionType = normalizedType === 'sb' || normalizedType === 'sjt_single_best';

  const showReasoning =
    isChoiceReasonType ||
    (!isSingleOptionType && (content.showReasoning === true || !!content.reasonPrompt || !!content.reasoningPrompt || !!content.requireReasoning));

  const reasoningPrompt =
    String(
      content.reasonPrompt ||
      content.reasoningPrompt ||
      'IN ONE LINE, WHY IS THIS THE STRONGEST CHOICE'
    ).toUpperCase();

  const reasoningPlaceholder =
    String(content.reasoningPlaceholder || 'Your reasoning in a sentence. Read alongside your answer.');

  const handleOptionSelect = (optId: string) => {
    if (showReasoning) {
      onChange({ choice: optId, reason: reasoningText });
    } else {
      onChange(optId);
    }
  };

  const handleReasoningChange = (newReasoning: string) => {
    const currentChoice = selectedOptionId || '';
    if (showReasoning) {
      onChange({ choice: currentChoice, reason: newReasoning });
    } else {
      onChange(currentChoice);
    }
  };

  const [showPasteWarning, setShowPasteWarning] = React.useState<boolean>(false);

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
      
      <DataDisplayBlock table={content.table as any} chart={content.chart as any} dataset={content.dataset as any} />

      <div className="space-y-2">
        {options.map((opt, idx) => (
          <OptionButton
            key={opt.id}
            index={idx}
            label={opt.label ?? opt.text ?? ''}
            selected={selectedOptionId === opt.id}
            disabled={disabled}
            onClick={() => handleOptionSelect(opt.id)}
          />
        ))}
      </div>

      {showReasoning && (
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            <span>{reasoningPrompt}</span>
          </div>

          <textarea
            disabled={disabled}
            value={reasoningText}
            onChange={(e) => handleReasoningChange(e.target.value)}
            onPaste={(e) => {
              const ENABLE_PASTE_BLOCKING = false;
              if (!ENABLE_PASTE_BLOCKING) return;
              e.preventDefault();
              setShowPasteWarning(true);
              toast.error('Pasting is disabled for reasoning answers');
            }}
            placeholder={reasoningPlaceholder}
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

export default SingleSelectItem;
