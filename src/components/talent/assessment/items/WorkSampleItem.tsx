import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

const WorkSampleItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const title = String(content.briefTitle || content.prompt || content.title || 'Work Sample Brief');
  const briefBody = String(content.briefBody || content.scenario || '');
  const requirements = (content.requirements as string[]) || [];
  const responseLabel = String(content.responseLabel || 'YOUR WORK SAMPLE RESPONSE');
  const hasFollowUp = !!content.followUp;
  const followUpLabel = String(content.followUp || 'Follow-up / Justification');
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'work_sample', {
    reasonShown: true,
  });

  const currentProse =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).prose ?? '')
      : typeof value === 'string'
        ? value
        : '';

  const currentFollowUp =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).followUp ?? '')
      : '';

  const handleProseChange = (prose: string) => {
    onChange({ prose, followUp: currentFollowUp });
  };

  const handleFollowUpChange = (followUp: string) => {
    onChange({ prose: currentProse, followUp });
  };

  return (
    <AssessmentItemCard title={title}>
      {briefBody && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {briefBody}
        </div>
      )}

      {requirements.length > 0 && (
        <div className="mb-5 bg-[#EBF6FF] border border-[#387DFF]/25 rounded-[14px] p-4 space-y-2">
          <div className="text-[11px] font-[800] text-[#0047CC] uppercase tracking-[0.6px]">
            Requirements
          </div>
          <div className="space-y-1.5">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[13px] text-[#182348] font-semibold">
                <svg className="w-4 h-4 text-[#0047CC] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ReasonTextarea
        label={responseLabel}
        value={currentProse}
        onChange={handleProseChange}
        disabled={disabled}
        placeholder="Write your work sample response..."
        minWords={minWords}
        minHeightClassName="min-h-[140px]"
        content={content as Record<string, unknown>}
        itemType="work_sample"
        className="mt-4 pt-0"
      />

      {hasFollowUp && (
        <ReasonTextarea
          label={followUpLabel}
          value={currentFollowUp}
          onChange={handleFollowUpChange}
          disabled={disabled}
          placeholder="Provide any additional follow-up notes..."
          minWords={0}
          required={false}
          minHeightClassName="min-h-[80px]"
        />
      )}
    </AssessmentItemCard>
  );
};

export default WorkSampleItem;
