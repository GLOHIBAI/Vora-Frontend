import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

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
  const tasks: CatTask[] = Array.isArray(content.items) ? (content.items as CatTask[]) : [];
  const buckets: CatBucket[] = Array.isArray(content.buckets) ? (content.buckets as CatBucket[]) : [];

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

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

  return (
    <AssessmentItemCard title={String(prompt)}>
      {Boolean(content.scenario) && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {/* Task Bucket Categorization List */}
      <div className="space-y-4 mb-5">
        {(tasks.map((task, idx) => {
          const currentBucket = selectedAssignments[task.id];

          return (
            <div
              key={task.id}
              className="bg-white border border-[#E6E6E6] rounded-[14px] p-4 transition-all hover:border-[#0047CC]/40 shadow-sm"
            >
              <div className="text-[13.5px] font-semibold text-[#1A1A1A] mb-3 leading-relaxed">
                <span className="inline-block w-6 text-[#0047CC] font-bold">{idx + 1}.</span>
                {String(task.text || (task as any).label || '')}
              </div>

              {/* Bucket Selection Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {buckets.map((b) => {
                  const isSelected = currentBucket === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectBucket(task.id, b.id)}
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

      {/* Optional Reasoning prompt */}
      {Boolean(content.reasonPrompt || content.reasoningPrompt) && (
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            <span>{String(content.reasonPrompt || content.reasoningPrompt).toUpperCase()}</span>
          </div>

          <textarea
            disabled={disabled}
            value={selectedAssignments.reasoning || ''}
            onChange={(e) => onChange({ ...selectedAssignments, reasoning: e.target.value })}
            onPaste={(e) => {
              const ENABLE_PASTE_BLOCKING = false;
              if (!ENABLE_PASTE_BLOCKING) return;
              e.preventDefault();
              setShowPasteWarning(true);
              toast.error('Pasting is disabled for reasoning answers');
            }}
            placeholder="Explain your prioritization reasoning..."
            className="w-full min-h-[76px] p-3.5 sm:p-4 bg-white border border-[#0047CC] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {showPasteWarning && (
            <div className="bg-[#FFF4EC] border border-[#FFD6B3] rounded-[10px] p-[10px_14px] mt-2.5 text-[12px] font-[600] text-[#C2410C] flex items-center justify-between animate-[fadeUp_0.2s_ease_both]">
              <span>Please answer in your own words. Pasting is turned off here.</span>
            </div>
          )}
        </div>
      )}
    </AssessmentItemCard>
  );
};

export default CatItem;
