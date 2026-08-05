import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import OptionButton from '../shared/OptionButton';
import type { AssessmentItemRendererProps } from '../shared/types';
import { DataDisplayBlock } from '../shared/DataDisplayBlock';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

import FormattedPromptText from '../shared/FormattedPromptText';

const SingleSelectItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? content.stem ?? 'Question';
  const options = content.options ?? content.values ?? [];

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

  // Only show a reason box when the API/content explicitly asks for one,
  // or for known reason-required families (jb / compare / hotspot).
  const showReasoning =
    normalizedType === 'jb' ||
    normalizedType === 'compare' ||
    normalizedType === 'hotspot' ||
    content.requireReasoning === true ||
    content.showReasoning === true ||
    !!content.reasonPrompt ||
    !!content.reasoningPrompt ||
    !!content.justifyPrompt;

  const reasoningPrompt =
    String(
      content.reasonPrompt ||
      content.reasoningPrompt ||
      content.justifyPrompt ||
      'IN ONE LINE, WHY IS THIS THE STRONGEST CHOICE'
    );

  const reasoningPlaceholder =
    String(content.reasoningPlaceholder || 'Your reasoning in a sentence. Read alongside your answer.');

  const minWords = getReasonMinWords(content as Record<string, unknown>, normalizedType, {
    reasonShown: showReasoning,
  });

  const handleOptionSelect = (optId: string) => {
    if (showReasoning) {
      onChange({ choice: optId, reason: reasoningText });
    } else {
      onChange(optId);
    }
  };

  const handleReasoningChange = (newReasoning: string) => {
    const currentChoice = selectedOptionId || '';
    onChange({ choice: currentChoice, reason: newReasoning });
  };

  return (
    <AssessmentItemCard item={item} title={String(prompt)}>
      {content.scenario ? (
        <div className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 mb-4 text-sm text-[#1A1A1A] leading-relaxed">
          <FormattedPromptText text={String(content.scenario)} />
        </div>
      ) : null}
      {content.subPrompt ? (
        <p className="text-sm text-[#808080] mb-4">{String(content.subPrompt)}</p>
      ) : null}

      <DataDisplayBlock table={content.table as any} chart={content.chart as any} dataset={content.dataset as any} />

      <div className="space-y-2">
        {options.map((opt, idx) => {
          const optionId = String(
            opt.id ?? (opt as any).optionId ?? (opt as any).value ?? (opt as any).letter ?? `opt_${idx}`,
          );
          return (
            <OptionButton
              key={optionId}
              index={idx}
              label={opt.label ?? opt.text ?? ''}
              selected={selectedOptionId === optionId}
              disabled={disabled}
              onClick={() => handleOptionSelect(optionId)}
            />
          );
        })}
      </div>

      {showReasoning && (
        <ReasonTextarea
          label={reasoningPrompt}
          value={reasoningText}
          onChange={handleReasoningChange}
          disabled={disabled}
          placeholder={reasoningPlaceholder}
          minWords={minWords}
          content={content as Record<string, unknown>}
          itemType={normalizedType}
        />
      )}
    </AssessmentItemCard>
  );
};

export default SingleSelectItem;
