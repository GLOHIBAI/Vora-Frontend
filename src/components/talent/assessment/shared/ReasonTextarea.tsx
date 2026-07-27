import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getReasonMinWords, isReasonMinWordsMet } from '../../../../utils/reasonMinWords';
import { useShowStageTwoValidation } from './StageTwoValidationContext';

export interface ReasonTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Explicit min words; defaults via getReasonMinWords when omitted with content/type. */
  minWords?: number;
  content?: Record<string, unknown> | null;
  itemType?: string;
  /** When false, only validate if minWords > 0 and user typed something. Default true. */
  required?: boolean;
  minHeightClassName?: string;
  className?: string;
}

/**
 * Shared Stage 2 reason / free-text field.
 * Validation ("Please enter more words") only appears after Continue is attempted.
 */
const ReasonTextarea: React.FC<ReasonTextareaProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Explain your reasoning in a sentence...',
  minWords: minWordsProp,
  content,
  itemType,
  required = true,
  minHeightClassName = 'min-h-[76px]',
  className = '',
}) => {
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const showValidation = useShowStageTwoValidation();

  const minWords =
    minWordsProp !== undefined
      ? minWordsProp
      : getReasonMinWords(content ?? undefined, itemType, { reasonShown: true });

  const trimmed = (value ?? '').trim();
  const hasText = trimmed.length > 0;
  const meetsMin = minWords > 0 ? isReasonMinWordsMet(value, minWords) : hasText || !required;
  const isInvalid = required
    ? !meetsMin
    : hasText && minWords > 0 && !isReasonMinWordsMet(value, minWords);

  const showError = showValidation && isInvalid;

  return (
    <div className={`mt-5 pt-2 ${className}`.trim()}>
      <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
        <span>{label.toUpperCase()}</span>
      </div>

      <textarea
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          const ENABLE_PASTE_BLOCKING = false;
          if (!ENABLE_PASTE_BLOCKING) return;
          e.preventDefault();
          setShowPasteWarning(true);
          toast.error('Pasting is disabled for reasoning answers');
        }}
        placeholder={placeholder}
        className={`w-full ${minHeightClassName} p-3.5 sm:p-4 bg-white border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed`}
      />

      {showError && (
        <div className="mt-2 text-[11.5px] font-[600] text-[#DC2626]">
          Please enter more words
        </div>
      )}

      {showPasteWarning && (
        <div className="bg-[#FFF4EC] border border-[#FFD6B3] rounded-[10px] p-[10px_14px] mt-2.5 text-[12px] font-[600] text-[#C2410C] flex items-center justify-between animate-[fadeUp_0.2s_ease_both]">
          <span>Please answer in your own words. Pasting is turned off here.</span>
        </div>
      )}
    </div>
  );
};

export default ReasonTextarea;
