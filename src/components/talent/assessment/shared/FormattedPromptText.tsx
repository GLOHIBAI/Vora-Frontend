import React from 'react';

interface FormattedPromptTextProps {
  text?: string;
  className?: string;
}

/** Prettify squished single-line JS/JSX/JSON/Java code */
function formatCodeSnippet(codeStr: string, lang: string): string {
  const code = codeStr.trim();
  if (!code) return '';

  const cleanLang = lang.toLowerCase().trim();

  // Handle JSON
  if (cleanLang === 'json' || (code.startsWith('{') && code.endsWith('}')) || (code.startsWith('[') && code.endsWith(']'))) {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Fallback
    }
  }

  // If already properly multi-line, preserve as-is
  if (code.split('\n').length > 3) {
    return code;
  }

  // Prettify single-line code blocks sent by API
  let formatted = code;

  // Insert breaks after semicolons and braces
  formatted = formatted.replace(/;\s*/g, ';\n');
  formatted = formatted.replace(/\{\s*/g, ' {\n');
  formatted = formatted.replace(/\s*\}\s*/g, '\n}\n');
  formatted = formatted.replace(/return \(/g, 'return (\n');
  formatted = formatted.replace(/\s*=>\s*/g, ' => ');
  formatted = formatted.replace(/\b(const|let|var|function|class|return|useEffect|useState|import|export)\b/g, '\n$1');

  const lines = formatted
    .split('\n')
    .map((l) => l.trim())
    .filter((line, idx, arr) => line !== '' || (arr[idx - 1] !== '' && arr[idx - 1] !== undefined));

  let indent = 0;
  const indentedLines = lines.map((line) => {
    if (line.startsWith('}') || line.startsWith(')') || line.startsWith('];')) {
      indent = Math.max(0, indent - 1);
    }
    const result = '  '.repeat(indent) + line;
    if ((line.endsWith('{') || line.endsWith('(') || line.endsWith('[')) && !line.startsWith('}') && !line.startsWith(')')) {
      indent++;
    }
    return result;
  });

  return indentedLines.join('\n');
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#0F172A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] font-mono text-[12.5px] border border-[#CBD5E1]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderTextSegment(textSegment: string, keyPrefix: string): React.ReactNode {
  let content = textSegment.trim();
  if (!content) return null;

  // Ensure bold headers like **Asset Types:** start on their own block
  content = content.replace(/([^\n])(\*\*[^*]+:\*\*)/g, '$1\n\n$2');

  // Ensure bullet list items like "- Equity - Fixed Income" start on newlines
  content = content.replace(/([^\n])\s+-\s+/g, '$1\n- ');

  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div key={keyPrefix} className="space-y-3 my-2 leading-relaxed text-[#334155]">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);

        const isList = lines.length > 0 && lines.every((line) => line.startsWith('- ') || line.startsWith('* '));

        if (isList) {
          return (
            <ul key={pIdx} className="list-disc list-inside space-y-1.5 ml-2 text-[14px]">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="text-[#334155]">
                  {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="text-[14px]">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineMarkdown(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export const FormattedPromptText: React.FC<FormattedPromptTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  const raw = String(text);

  // Match 3 or more backticks (```, ````, etc.) or triple quotes (""")
  const codeBlockRegex = /(?:```+|""")\s*([a-zA-Z0-9_-]*)\s*([\s\S]*?)(?:```+|""")(?:\s*|$)/g;

  if (!codeBlockRegex.test(raw)) {
    return <div className={className}>{renderTextSegment(raw, 'main-text')}</div>;
  }

  codeBlockRegex.lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const textBefore = raw.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push(renderTextSegment(textBefore, `text-${keyIdx++}`));
    }

    const rawLang = match[1]?.trim() || '';
    let rawCode = match[2] || '';

    let lang = rawLang;
    if (!lang) {
      const firstWordMatch = rawCode.match(/^([a-zA-Z0-9_-]+)\s+/);
      if (
        firstWordMatch &&
        ['java', 'python', 'javascript', 'typescript', 'js', 'jsx', 'ts', 'tsx', 'csharp', 'cpp', 'sql', 'go', 'json', 'html', 'css'].includes(
          firstWordMatch[1].toLowerCase()
        )
      ) {
        lang = firstWordMatch[1];
        rawCode = rawCode.slice(firstWordMatch[0].length);
      }
    }

    const formattedCode = formatCodeSnippet(rawCode, lang);
    const codeLines = formattedCode.split('\n');

    parts.push(
      <div key={`code-${keyIdx++}`} className="my-4 rounded-[14px] border border-[#E6E6E6] bg-white overflow-hidden shadow-sm">
        <div className="bg-[#F8FAFC] px-4 py-2.5 flex items-center justify-between border-b border-[#E6E6E6]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] block" />
            <span className="ml-2 font-mono text-[11px] font-[700] uppercase tracking-wider text-[#0047CC]">
              {lang || 'Code Snippet'}
            </span>
          </div>
          <span className="text-[10px] text-[#808080] font-mono uppercase tracking-wider font-semibold">
            {lang ? lang.toUpperCase() : 'CODE'}
          </span>
        </div>
        <div className="p-4 overflow-x-auto bg-white">
          <table className="w-full font-mono text-[13px] border-collapse">
            <tbody>
              {codeLines.map((line, i) => (
                <tr key={i} className="hover:bg-[#F8FAFC]">
                  <td className="w-8 select-none text-right pr-3 text-[#94A3B8] text-[11px] align-top py-0.5 border-r border-[#F1F5F9] mr-3">
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
    );

    lastIndex = match.index + match[0].length;
  }

  const textAfter = raw.slice(lastIndex);
  if (textAfter.trim()) {
    parts.push(renderTextSegment(textAfter, `text-${keyIdx++}`));
  }

  return <div className={className}>{parts}</div>;
};

export default FormattedPromptText;
