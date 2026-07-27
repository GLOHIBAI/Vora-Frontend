import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import { CustomSelect, type CustomSelectOption } from '../shared/CustomSelect';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

interface MatchSideItem {
  id: string;
  text: string;
}

const MatchItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Match each concept to its corresponding description.';
  const left: MatchSideItem[] = Array.isArray(content.left)
    ? (content.left as MatchSideItem[])
    : Array.isArray(content.leftItems)
      ? (content.leftItems as MatchSideItem[])
      : Array.isArray(content.terms)
        ? (content.terms as MatchSideItem[])
        : [];
  const rightChoices: Array<MatchSideItem | string> = Array.isArray(content.rightChoices)
    ? (content.rightChoices as Array<MatchSideItem | string>)
    : Array.isArray(content.right)
      ? (content.right as Array<MatchSideItem | string>)
      : Array.isArray(content.choices)
        ? (content.choices as Array<MatchSideItem | string>)
        : [];
  const showReason = Boolean(
    content.reasonPrompt ||
      content.reasoningPrompt ||
      content.requireReasoning === true ||
      content.showReasoning === true,
  );
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'match', {
    reasonShown: showReason,
  });

  const selectedMatches =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};

  const handleMatch = (leftId: string, rightId: string) => {
    onChange({
      ...selectedMatches,
      [leftId]: rightId,
    });
  };

  const formattedOptions: CustomSelectOption[] = rightChoices.map((r) =>
    typeof r === 'string'
      ? { value: r, label: r }
      : { value: r.id ?? r.text, label: r.text ?? r.id },
  );

  const reasonText = String(selectedMatches.reason ?? selectedMatches.reasoning ?? '');

  return (
    <AssessmentItemCard title={String(prompt)}>
      {Boolean(content.scenario) && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      <div className="space-y-4 mb-5">
        {left.map((lItem, idx) => {
          const leftId = String(lItem.id || `left_${idx}`);
          const currentChoice = selectedMatches[leftId] || '';

          return (
            <div
              key={leftId}
              className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 shadow-sm space-y-2.5"
            >
              <div className="text-[13.5px] font-bold text-[#0047CC]">
                {String(lItem.text || (lItem as any).label || '')}
              </div>

              <CustomSelect
                disabled={disabled}
                value={currentChoice}
                onChange={(val) => handleMatch(leftId, val)}
                placeholder="Choose option"
                options={formattedOptions}
              />
            </div>
          );
        })}
      </div>

      {showReason && (
        <ReasonTextarea
          label={String(content.reasonPrompt || content.reasoningPrompt || 'YOUR REASONING')}
          value={reasonText}
          onChange={(text) =>
            onChange({ ...selectedMatches, reason: text, reasoning: text })
          }
          disabled={disabled}
          placeholder="Explain your matching logic..."
          minWords={minWords}
          content={content as Record<string, unknown>}
          itemType="match"
        />
      )}
    </AssessmentItemCard>
  );
};

export default MatchItem;
