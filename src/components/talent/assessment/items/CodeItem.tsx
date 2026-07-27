import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

const CodeItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Review the code and identify potential improvements.';
  const language = String(content.language ?? 'java').toUpperCase();
  const starterCode = String(content.starterCode ?? '');
  const visibleTests = (content.visibleTests as Array<string | { name: string }>) ?? [];
  const minWords = getReasonMinWords(content as Record<string, unknown>, String(item.type || 'code'), {
    reasonShown: true,
  });

  const currentAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).code ?? (value as any).reasoning ?? (value as any).reason ?? '')
      : typeof value === 'string'
      ? value
      : '';

  const handleTextChange = (text: string) => {
    onChange({
      code: text,
      reason: text,
      reasoning: text,
      stdout: 'ok',
    });
  };

  const codeLines = starterCode.split('\n');

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {starterCode && (
        <div className="mb-5 rounded-[14px] overflow-hidden border border-[#E6E6E6] shadow-sm">
          <div className="bg-[#F8FAFC] px-4 py-2.5 flex items-center justify-between border-b border-[#E6E6E6]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] block" />
              <span className="ml-2 font-mono text-[11px] font-[700] text-[#0047CC] uppercase tracking-wider">
                {language}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#808080] uppercase tracking-wider font-semibold">
              Starter Code
            </span>
          </div>

          <div className="bg-white p-4 overflow-x-auto">
            <table className="w-full font-mono text-[13px] border-collapse">
              <tbody>
                {codeLines.map((line, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC]">
                    <td className="w-10 select-none text-right pr-4 text-[#94A3B8] text-[11px] align-top py-0.5 border-r border-[#F1F5F9] mr-3">
                      {i + 1}
                    </td>
                    <td className="text-[#1E293B] whitespace-pre font-mono pl-3 py-0.5 leading-relaxed">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visibleTests.length > 0 && (
        <div className="mb-5 bg-[#EBF6FF] border border-[#387DFF]/25 rounded-[14px] p-4 space-y-2">
          <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-[0.6px]">
            Visible Tests & Requirements
          </div>
          <div className="space-y-1.5">
            {visibleTests.map((t, idx) => {
              const testName = typeof t === 'string' ? t : t.name ?? '';
              return (
                <div key={idx} className="flex items-start gap-2 text-[13px] text-[#182348] font-semibold">
                  <svg className="w-4 h-4 text-[#0047CC] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{testName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ReasonTextarea
        label={String(content.reasonPrompt || content.reasoningPrompt || 'YOUR CODE REVIEW FINDINGS & SOLUTION')}
        value={currentAnswer}
        onChange={handleTextChange}
        disabled={disabled}
        placeholder="Explain your code analysis, identify issues, or write your code solution here..."
        minWords={minWords}
        minHeightClassName="min-h-[110px]"
        content={content as Record<string, unknown>}
        itemType={String(item.type || 'code')}
      />
    </AssessmentItemCard>
  );
};

export default CodeItem;
