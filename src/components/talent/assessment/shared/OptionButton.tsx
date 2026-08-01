import React, { useMemo } from 'react';

interface OptionButtonProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  index?: number;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  index,
}) => {
  const cleanLabel = useMemo(() => {
    let text = String(label || '').trim();
    if (text.startsWith('"""') && text.endsWith('"""') && text.length > 6) {
      text = text.slice(3, -3).trim();
    } else if (text.startsWith('```')) {
      if (text.endsWith('```') && text.length >= 6) {
        text = text.slice(3, -3).trim();
      } else {
        text = text.replace(/^```[a-zA-Z]*/, '').trim();
      }
    }
    // Remove leading language tag line if present (e.g., "java\n", "ts\n")
    text = text.replace(/^(java|js|ts|javascript|typescript|python|sql|json|cpp|html|css|bash|shell|csharp|go|rust)\s*\n/i, '').trim();
    return text;
  }, [label]);

  const isCode = useMemo(() => {
    const raw = String(label || '');
    const clean = cleanLabel;
    return (
      raw.includes('"""') ||
      raw.includes('```') ||
      clean.includes('@RestController') ||
      clean.includes('public class ') ||
      clean.includes('function(') ||
      clean.includes('import ') ||
      clean.includes('const ') ||
      clean.includes('java\n') ||
      clean.startsWith('java ') ||
      clean.includes('System.out') ||
      (clean.includes('\n') && (clean.includes('{') || clean.includes(';')))
    );
  }, [label, cleanLabel]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border text-[14px] transition-all flex items-start gap-4 ${
        selected
          ? 'border-[#0047CC] bg-[#FBFCFF] text-[#0047CC] font-semibold ring-[0.5px] ring-[#0047CC]'
          : 'border-[#E6E6E6] bg-white text-[#4A4A4A] hover:border-[#ADADAD] hover:bg-[#FAFBFD] disabled:hover:border-[#E6E6E6] disabled:hover:bg-white'
      } ${disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'} ${className}`}
    >
      {index !== undefined && (
        <span className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center text-[11px] font-[800] shrink-0 transition-colors mt-0.5 ${
          selected
            ? 'border-[#0047CC] bg-[#0047CC] text-white'
            : 'border-[#E6E6E6] bg-[#FAFBFD] text-[#808080]'
        }`}>
          {String.fromCharCode(65 + index)}
        </span>
      )}

      <div className="flex-1 min-w-0">
        {isCode ? (
          <pre className={`p-3.5 rounded-lg font-mono text-[12.5px] leading-relaxed overflow-x-auto custom-scrollbar whitespace-pre-wrap text-left border ${
            selected
              ? 'bg-white text-[#1A1A1A] border-[#0047CC]/40 font-medium'
              : 'bg-[#F8FAFC] text-[#1A1A1A] border-[#E2E8F0]'
          }`}>
            <code>{cleanLabel}</code>
          </pre>
        ) : (
          <span className="leading-[1.5] pt-[1.5px] block text-[#1A1A1A]">{label}</span>
        )}
      </div>
    </button>
  );
};

export default OptionButton;
