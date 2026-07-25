import React, { useState } from 'react';
import toast from 'react-hot-toast';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

const EditPencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

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

  const [showPasteWarning, setShowPasteWarning] = useState<boolean>(false);

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
      {/* Brief Body */}
      {briefBody && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {briefBody}
        </div>
      )}

      {/* Requirements List */}
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

      {/* Main Prose Textarea */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
          <span>{responseLabel.toUpperCase()}</span>
        </div>

        <textarea
          disabled={disabled}
          value={currentProse}
          onChange={(e) => handleProseChange(e.target.value)}
          onPaste={(e) => {
            const ENABLE_PASTE_BLOCKING = false;
            if (!ENABLE_PASTE_BLOCKING) return;
            e.preventDefault();
            setShowPasteWarning(true);
            toast.error('Pasting is disabled for reasoning answers');
          }}
          placeholder="Write your work sample response..."
          className="w-full min-h-[140px] p-3.5 sm:p-4 bg-white border border-[#0047CC] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-[0_2px_8px_rgba(0,71,204,0.06)] disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {showPasteWarning && (
          <div className="bg-[#FFF4EC] border border-[#FFD6B3] rounded-[10px] p-[10px_14px] mt-2.5 text-[12px] font-[600] text-[#C2410C] flex items-center justify-between animate-[fadeUp_0.2s_ease_both]">
            <span>Please answer in your own words. Pasting is turned off here.</span>
          </div>
        )}
      </div>

      {/* Optional Follow-up Textarea */}
      {hasFollowUp && (
        <div className="mt-5 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            <EditPencilIcon className="w-3.5 h-3.5 text-[#0047CC]" />
            <span>{followUpLabel.toUpperCase()}</span>
          </div>

          <textarea
            disabled={disabled}
            value={currentFollowUp}
            onChange={(e) => handleFollowUpChange(e.target.value)}
            placeholder="Provide any additional follow-up notes..."
            className="w-full min-h-[80px] p-3.5 sm:p-4 bg-white border border-[#CBD5E1] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[13.5px] text-[#1A1A1A] placeholder:text-[#94A3B8] outline-none transition-all resize-y font-sans leading-relaxed shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      )}
    </AssessmentItemCard>
  );
};

export default WorkSampleItem;
