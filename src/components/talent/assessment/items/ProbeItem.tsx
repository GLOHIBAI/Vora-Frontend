import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

const ProbeItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Provide your answer.';
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'probe', {
    reasonShown: true,
  });

  const textValue =
    typeof value === 'string'
      ? value
      : String((value as any)?.prose ?? (value as any)?.reason ?? (value as any)?.reasoning ?? '');

  return (
    <AssessmentItemCard item={item} title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      <ReasonTextarea
        label="YOUR RESPONSE"
        value={textValue}
        onChange={(text) => onChange(text)}
        disabled={disabled}
        placeholder="Write your response here..."
        minWords={minWords}
        minHeightClassName="min-h-[110px]"
        content={content as Record<string, unknown>}
        itemType="probe"
        className="mt-2 pt-0"
      />
    </AssessmentItemCard>
  );
};

export default ProbeItem;
