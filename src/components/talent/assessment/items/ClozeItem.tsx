import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import { CustomSelect, type CustomSelectOption } from '../shared/CustomSelect';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

interface ClozeBlank {
  id: string;
  choices: string[];
}

/** Prefer clean template; fall back to scenario with underscore prefixes stripped. */
const resolveClozeSource = (content: Record<string, unknown>): string => {
  const template = String(content.template ?? '').trim();
  if (template) return template;
  const scenario = String(content.scenario ?? '').trim();
  return scenario.replace(/_{3,}\s*(?=\[)/g, '');
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Some Gate 2 cloze items ship templates with comments like:
 *   // Gap 1: Send unauthorized response
 *   httpResponse.sendError(...);   // pre-filled answer, not [gap1]
 * Convert those into [gap1] tokens so dropdowns can mount.
 */
const injectGapTokensFromComments = (
  template: string,
  blanks: ClozeBlank[],
): { text: string; unresolvedIds: string[] } => {
  let text = template;
  const resolved = new Set<string>();

  for (const blank of blanks) {
    if (text.includes(`[${blank.id}]`)) {
      resolved.add(blank.id);
    }
  }

  for (const blank of blanks) {
    if (resolved.has(blank.id)) continue;

    const num = blank.id.match(/(\d+)$/)?.[1];
    if (!num) continue;

    // Keep the comment, replace the following code line with [gapId]
    const gapLineRe = new RegExp(
      `([ \\t]*\\/\\/\\s*Gap\\s*${num}\\b[^\\n]*\\n)([ \\t]*)([^\\n]+)`,
      'i',
    );

    if (gapLineRe.test(text)) {
      text = text.replace(gapLineRe, `$1$2[${blank.id}]`);
      resolved.add(blank.id);
    }
  }

  // Last resort: replace first exact choice line still present in the template
  for (const blank of blanks) {
    if (resolved.has(blank.id) || text.includes(`[${blank.id}]`)) {
      resolved.add(blank.id);
      continue;
    }

    for (const choice of blank.choices) {
      const choiceRe = new RegExp(`^([ \\t]*)${escapeRegExp(choice)}\\s*$`, 'm');
      if (choiceRe.test(text)) {
        text = text.replace(choiceRe, `$1[${blank.id}]`);
        resolved.add(blank.id);
        break;
      }
    }
  }

  const unresolvedIds = blanks.map((b) => b.id).filter((id) => !text.includes(`[${id}]`));

  return { text, unresolvedIds };
};

const ClozeItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = String(
    content.prompt ?? content.title ?? 'Complete the statement by choosing the most appropriate word for each gap.',
  );
  const blanks: ClozeBlank[] = Array.isArray(content.blanks)
    ? (content.blanks as ClozeBlank[]).map((b, idx) => ({
        id: String(b.id || `gap${idx + 1}`),
        choices: Array.isArray(b.choices) ? b.choices.map(String) : [],
      }))
    : [];

  const rawSource = resolveClozeSource(content as Record<string, unknown>);
  const { text: sourceText, unresolvedIds } = injectGapTokensFromComments(rawSource, blanks);

  const looksLikeCode =
    /\{[\s\S]*\}/.test(sourceText) ||
    /\b(class|function|public|private|const|let|var)\b/.test(sourceText);

  const showReason = Boolean(
    content.reasonPrompt ||
      content.reasoningPrompt ||
      content.requireReasoning === true ||
      content.showReasoning === true,
  );
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'cloze', {
    reasonShown: showReason,
  });

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

  const reasonText = String(selectedAnswers.reason ?? selectedAnswers.reasoning ?? '');

  const templateParts = sourceText.split(/(\[[\w-]+\]|---+|_{3,})/g);
  let sequentialBlankIndex = 0;

  const renderBlankSelect = (blank: ClozeBlank, key: string) => {
    const currentValue = selectedAnswers[blank.id] || '';
    const selectOptions: CustomSelectOption[] = blank.choices.map((c) => ({
      value: c,
      label: c,
    }));

    return (
      <span
        key={key}
        className={`inline-block my-1 align-middle ${looksLikeCode ? 'w-full max-w-full' : 'mx-1.5'}`}
      >
        <CustomSelect
          size="sm"
          disabled={disabled}
          value={currentValue}
          onChange={(val) => handleSelectBlank(blank.id, val)}
          placeholder={`Choose gap…`}
          options={selectOptions}
          className={looksLikeCode ? 'w-full min-w-[220px] max-w-full' : undefined}
        />
      </span>
    );
  };

  const renderPart = (part: string, idx: number) => {
    const bracketMatch = part.match(/^\[([\w-]+)\]$/);
    const isLegacyGap = /^(---+|_{3,})$/.test(part);

    if (!bracketMatch && !isLegacyGap) {
      return (
        <span key={idx} className={looksLikeCode ? 'font-mono text-[12.5px] leading-[1.7]' : undefined}>
          {part}
        </span>
      );
    }

    const blankId = bracketMatch?.[1];
    const currentBlank =
      (blankId ? blanks.find((b) => b.id === blankId) : undefined) ??
      blanks[sequentialBlankIndex++];

    if (!currentBlank) {
      return (
        <span key={idx} className="inline-block mx-1 px-2 text-[#0047CC] font-bold">
          ______
        </span>
      );
    }

    return renderBlankSelect(currentBlank, `${currentBlank.id}-${idx}`);
  };

  const unresolvedBlanks = blanks.filter((b) => unresolvedIds.includes(b.id));

  return (
    <AssessmentItemCard title={prompt}>
      {Boolean(content.scenario) && String(content.scenario) !== prompt ? (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      ) : null}

      <div className="mb-5 bg-white border border-[#E6E6E6] rounded-[14px] p-5 shadow-sm font-sans text-[14px] leading-[2.4]">
        <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-wider mb-3">
          Fill in the blank
        </div>
        <div className={`whitespace-pre-wrap text-[#1E293B] ${looksLikeCode ? 'font-mono' : 'font-sans'}`}>
          {templateParts.map((part, idx) => renderPart(part, idx))}
        </div>

        {unresolvedBlanks.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-[#E6E6E6] space-y-3">
            <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-wider">
              Complete each gap
            </div>
            {unresolvedBlanks.map((blank, idx) => (
              <div key={blank.id} className="space-y-1.5">
                <div className="text-[12px] font-[700] text-[#64748B]">
                  Gap {blank.id.replace(/\D/g, '') || idx + 1}
                </div>
                {renderBlankSelect(blank, `fallback-${blank.id}`)}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showReason && (
        <ReasonTextarea
          label={String(content.reasonPrompt || content.reasoningPrompt || 'YOUR REASONING')}
          value={reasonText}
          onChange={(text) =>
            onChange({ ...selectedAnswers, reason: text, reasoning: text })
          }
          disabled={disabled}
          placeholder="Explain your choices in a sentence..."
          minWords={minWords}
          content={content as Record<string, unknown>}
          itemType="cloze"
        />
      )}
    </AssessmentItemCard>
  );
};

export default ClozeItem;
