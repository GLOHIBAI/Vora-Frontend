import React from 'react';

interface FormattedPromptTextProps {
  text?: string;
  className?: string;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#1A1A1A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const FormattedPromptText: React.FC<FormattedPromptTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  const raw = String(text);

  // Match ```lang ... ``` or """lang ... """ code blocks
  const codeBlockRegex = /(```|""")([a-zA-Z]*)\n?([\s\S]*?)\1/g;

  if (!codeBlockRegex.test(raw)) {
    return (
      <div className={`space-y-2 leading-relaxed ${className}`}>
        {raw.split('\n\n').map((para, idx) => (
          <p key={idx}>{renderInlineMarkdown(para)}</p>
        ))}
      </div>
    );
  }

  codeBlockRegex.lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push(
        <div key={`text-${keyIdx++}`} className="space-y-2 leading-relaxed my-2">
          {textBefore.split('\n\n').map((p, i) => (
            <p key={i}>{renderInlineMarkdown(p)}</p>
          ))}
        </div>
      );
    }

    const lang = match[2]?.trim() || '';
    let codeContent = match[3] || '';
    if (codeContent.startsWith('\n')) codeContent = codeContent.slice(1);
    if (codeContent.endsWith('\n')) codeContent = codeContent.slice(0, -1);

    parts.push(
      <div key={`code-${keyIdx++}`} className="my-4 rounded-xl border border-[#334155] bg-[#1E293B] overflow-hidden shadow-sm">
        <div className="bg-[#0F172A] px-4 py-2 flex items-center justify-between border-b border-[#334155]">
          <span className="text-[11px] font-[800] uppercase tracking-wider text-[#94A3B8]">
            {lang || 'Code Snippet'}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono">UTF-8</span>
        </div>
        <pre className="p-4 font-mono text-[13px] leading-relaxed text-[#F8FAFC] overflow-x-auto custom-scrollbar whitespace-pre">
          <code>{codeContent}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const textAfter = raw.slice(lastIndex);
  if (textAfter.trim()) {
    parts.push(
      <div key={`text-${keyIdx++}`} className="space-y-2 leading-relaxed my-2">
        {textAfter.split('\n\n').map((p, i) => (
          <p key={i}>{renderInlineMarkdown(p)}</p>
        ))}
      </div>
    );
  }

  return <div className={className}>{parts}</div>;
};

export default FormattedPromptText;
