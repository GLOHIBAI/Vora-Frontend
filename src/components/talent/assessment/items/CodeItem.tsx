import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

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

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

  const currentAnswer =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).code ?? (value as any).reasoning ?? '')
      : typeof value === 'string'
      ? value
      : '';

  const handleTextChange = (text: string) => {
    onChange({
      code: text,
      stdout: 'ok',
    });
  };

  const codeLines = starterCode.split('\n');

  return (
    <AssessmentItemCard title={String(prompt)}>
      {/* Scenario text */}
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {/* Code Viewer Container */}
      {starterCode && (
        <div className="mb-5 rounded-[14px] overflow-hidden border border-[#E6E6E6] shadow-sm">
          {/* Header Bar */}
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

          {/* Monospace Code Display (Clean White) */}
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

      {/* Visible Tests List (Blue Theme) */}
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

      {/* Answer / Review Input Area */}
      <div className="mt-5 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>{String(content.reasonPrompt || content.reasoningPrompt || 'YOUR CODE REVIEW FINDINGS & SOLUTION')}</span>
        </div>

        <textarea
          disabled={disabled}
          value={currentAnswer}
          onChange={(e) => handleTextChange(e.target.value)}
          onPaste={(e) => {
            const ENABLE_PASTE_BLOCKING = false;
            if (!ENABLE_PASTE_BLOCKING) return;
            e.preventDefault();
            setShowPasteWarning(true);
            toast.error('Pasting is disabled for reasoning answers');
          }}
          placeholder="Explain your code analysis, identify issues, or write your code solution here..."
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

export default CodeItem;
