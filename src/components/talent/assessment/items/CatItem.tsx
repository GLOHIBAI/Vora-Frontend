import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

interface CatTask {
  id: string;
  text: string;
}

interface CatBucket {
  id: string;
  text: string;
}

const CatItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Sort each task by its urgency.';
  const tasks: CatTask[] = Array.isArray(content.items)
    ? (content.items as CatTask[])
    : Array.isArray(content.tasks)
      ? (content.tasks as CatTask[])
      : [];
  const buckets: CatBucket[] = Array.isArray(content.buckets) ? (content.buckets as CatBucket[]) : [];
  const showReason = Boolean(
    content.reasonPrompt ||
      content.reasoningPrompt ||
      content.requireReasoning === true ||
      content.showReasoning === true,
  );
  const minWords = getReasonMinWords(content as Record<string, unknown>, 'cat', {
    reasonShown: showReason,
  });

  const selectedAssignments =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};

  const handleSelectBucket = (taskId: string, bucketId: string) => {
    onChange({
      ...selectedAssignments,
      [taskId]: bucketId,
    });
  };

  const reasonText = String(selectedAssignments.reason ?? selectedAssignments.reasoning ?? '');

  return (
    <AssessmentItemCard item={item} title={String(prompt)}>
      {Boolean(content.scenario) && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      <div className="space-y-4 mb-5">
        {(tasks.map((task, idx) => {
          const taskId = String(task.id || `task_${idx}`);
          const currentBucket = selectedAssignments[taskId];

          return (
            <div
              key={taskId}
              className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 transition-all hover:border-[#0047CC]/40 shadow-sm"
            >
              <div className="text-[13.5px] font-semibold text-[#1A1A1A] mb-3 leading-relaxed">
                <span className="inline-block w-6 text-[#0047CC] font-bold">{idx + 1}.</span>
                {String(task.text || (task as any).label || '')}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {buckets.map((b, bIdx) => {
                  const bucketId = String(b.id || b.text || `bucket_${bIdx}`);
                  const isSelected = currentBucket === bucketId;
                  return (
                    <button
                      key={bucketId}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectBucket(taskId, bucketId)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0047CC] text-white shadow-sm ring-2 ring-[#0047CC]/20'
                          : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {String(b.text || (b as any).label || '')}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }) as any)}
      </div>

      {showReason && (
        <ReasonTextarea
          label={String(content.reasonPrompt || content.reasoningPrompt || 'YOUR REASONING')}
          value={reasonText}
          onChange={(text) =>
            onChange({ ...selectedAssignments, reason: text, reasoning: text })
          }
          disabled={disabled}
          placeholder="Explain your prioritization reasoning..."
          minWords={minWords}
          content={content as Record<string, unknown>}
          itemType="cat"
        />
      )}
    </AssessmentItemCard>
  );
};

export default CatItem;
