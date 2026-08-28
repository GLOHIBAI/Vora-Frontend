import React, { useMemo } from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';
import FormattedPromptText from '../shared/FormattedPromptText';

interface HighlightOption {
  id: string;
  text: string;
}

const isCodeLikeText = (text: string): boolean => {
  if (text.includes('"""') || text.includes('```')) return true;
  let codeSignals = 0;
  if (text.includes('@RestController') || text.includes('@Service') || text.includes('@Autowired')) codeSignals += 2;
  if (text.includes('public class ') || text.includes('public static ') || text.includes('public double ') || text.includes('public void ') || text.includes('public Fund ')) codeSignals += 2;
  if (text.includes('useState') || text.includes('useEffect') || text.includes('useMemo') || text.includes('useCallback')) codeSignals += 2;
  if (/\bconst\s+\w+\s*=/.test(text) || /\blet\s+\w+\s*=/.test(text) || /\bvar\s+\w+\s*=/.test(text)) codeSignals += 2;
  if (/\bfunction\s*\(/.test(text) || /=>\s*[{(]/.test(text)) codeSignals += 2;
  if (/\bimport\s+.*\bfrom\b/.test(text) || /\breturn\s+[<({\w]/.test(text)) codeSignals += 2;
  if (text.includes('axios.') || text.includes('fetch(') || text.includes('console.log')) codeSignals += 2;
  if (text.includes(';') && (text.includes('{') || text.includes('('))) codeSignals += 2;
  if (text.includes('<table>') || text.includes('<tr>') || text.includes('<td>') || text.includes('<div>') || text.includes('className=')) codeSignals += 2;
  return codeSignals >= 2;
};

const formatCodeSnippet = (rawCode: string): string => {
  let text = String(rawCode || '').trim();
  if (text.startsWith('"""') && text.endsWith('"""') && text.length > 6) {
    text = text.slice(3, -3).trim();
  } else if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }

  text = text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '  ')
    .replace(/->/g, ' -> ')
    .replace(/=>/g, ' => ');

  // If code is a single line with semicolons, JSX tags, or braces, format onto multiple indented lines
  if (!text.includes('\n') && (text.includes(';') || text.includes('{') || text.includes('=>') || text.includes('<table') || text.includes('<tr'))) {
    text = text
      .replace(/;\s*/g, ';\n')
      .replace(/\{\s*/g, ' {\n')
      .replace(/\}\s*/g, '\n}\n')
      .replace(/(<\/?(table|thead|tbody|tr|th|td|div|span|button|p)[^>]*>)/gi, '\n$1\n');
  }

  const lines = text.split('\n');
  let indent = 0;
  const formatted = lines
    .map((line) => {
      let trimmed = line.trim();
      if (!trimmed) return '';
      if (/^[\}\)\],]/.test(trimmed) || /^<\/(table|thead|tbody|tr|th|td|div)>/.test(trimmed)) {
        indent = Math.max(0, indent - 1);
      }
      const indentedLine = '  '.repeat(indent) + trimmed;
      if (/[\{\[\(]\s*$/.test(trimmed) || /=>\s*$/.test(trimmed) || /^<(table|thead|tbody|tr|th|td|div)[^>]*>$/.test(trimmed)) {
        indent++;
      }
      return indentedLine;
    })
    .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
    .join('\n');

  return formatted || text;
};

const HighlightItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Tap the line containing the issue';
  const options = (content.options as HighlightOption[]) ?? [];
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'highlight', {
    reasonShown: true,
  });

  const selectedAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as { optionId?: string; choice?: string; reasoning?: string; reason?: string })
      : { optionId: typeof value === 'string' ? value : '' };

  const selectedOptionId = String(selectedAnswer.optionId ?? selectedAnswer.choice ?? '');
  const reasoningText = String(selectedAnswer.reasoning ?? selectedAnswer.reason ?? '');

  const isCode = useMemo(() => {
    return options.some((opt) => isCodeLikeText(opt.text) || opt.text.length > 40);
  }, [options]);

  const handleSelectOption = (optionId: string) => {
    if (reasoningText) {
      onChange({ choice: optionId, reason: reasoningText });
    } else {
      onChange({ choice: optionId });
    }
  };

  const handleReasoning = (reasoning: string) => {
    if (selectedOptionId) {
      onChange({ choice: selectedOptionId, reason: reasoning });
    } else {
      onChange({ choice: '', reason: reasoning });
    }
  };

  return (
    <AssessmentItemCard item={item} title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          <FormattedPromptText text={String(content.scenario)} />
        </div>
      )}

      <div className="mb-5 bg-white border border-[#E6E6E6] rounded-[14px] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-wider">
            Tap the line containing the issue
          </div>
          {isCode && (
            <span className="text-[11px] font-mono text-[#808080] uppercase tracking-wider font-semibold">
              Select Code Block
            </span>
          )}
        </div>

        {isCode ? (
          <div className="flex flex-col gap-2.5 w-full">
            {options.map((opt) => {
              const isHighlighted = selectedOptionId === opt.id;
              const formatted = formatCodeSnippet(opt.text);

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-3.5 px-4 rounded-xl border text-[13px] font-mono leading-relaxed transition-all cursor-pointer overflow-x-auto custom-scrollbar ${
                    isHighlighted
                      ? 'bg-[#EFF6FF] border-2 border-[#0047CC] text-[#0047CC] ring-2 ring-[#0047CC]/20 shadow-sm font-semibold'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] hover:border-[#0047CC]/50 hover:bg-[#FAFBFD]'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-mono text-[12.5px] sm:text-[13px] leading-relaxed m-0 p-0 select-text">
                    <code>{formatted}</code>
                  </pre>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 leading-relaxed">
            {options.map((opt) => {
              const isHighlighted = selectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-2 px-3 rounded-xl text-[13.5px] font-medium text-left transition-all cursor-pointer ${
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
        )}
      </div>

      <ReasonTextarea
        label={String(content.reasonPrompt || content.reasoningPrompt || 'HOW CAN THIS BE IMPROVED?')}
        value={reasoningText}
        onChange={handleReasoning}
        disabled={disabled}
        placeholder="Explain how this error message or text can be improved..."
        minWords={minWords}
        content={content as Record<string, unknown>}
        itemType="highlight"
      />
    </AssessmentItemCard>
  );
};

export default HighlightItem;

