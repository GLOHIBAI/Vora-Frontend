import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';
import type { MostLeastAnswerValue } from '../../../../services/queries/assessments/types';
import ReasonTextarea from '../shared/ReasonTextarea';
import { getReasonMinWords } from '../shared/reasonMinWords';

const SjtMostLeastItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? '';
  const options = content.options ?? content.values ?? [];
  const current = (value as MostLeastAnswerValue | undefined) ?? { most: '', least: '' };

  const reasoningText =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? String((value as any).reason ?? (value as any).reasoning ?? '')
      : '';

  const minWords = getReasonMinWords(content as Record<string, unknown>, String(item.type || 'sjt_most_least'));

  const pickMost = (optionId: string) => {
    const next = { ...current, reason: reasoningText };
    if (next.most === optionId) {
      next.most = '';
    } else {
      next.most = optionId;
      if (next.least === optionId) next.least = '';
    }
    onChange(next);
  };

  const pickLeast = (optionId: string) => {
    const next = { ...current, reason: reasoningText };
    if (next.least === optionId) {
      next.least = '';
    } else {
      next.least = optionId;
      if (next.most === optionId) next.most = '';
    }
    onChange(next);
  };

  const handleReason = (newReason: string) => {
    onChange({
      ...current,
      reason: newReason,
    });
  };

  return (
    <AssessmentItemCard item={item} title={prompt ? String(prompt) : undefined}>
      <div className="space-y-3 mb-4">
        {options.map((opt, idx) => {
          const text = opt.label || opt.text || opt.description || (opt as any).statement || (opt as any).content || (opt as any).value || (opt as any).prompt || '';
          if (!text.trim()) return null;

          const optionId = String(
            opt.id ?? (opt as any).optionId ?? (opt as any).value ?? (opt as any).letter ?? `opt_${idx}`,
          );
          const isMost = current.most === optionId;
          const isLeast = current.least === optionId;
          return (
            <div
              key={optionId}
              className={`border-[1.5px] rounded-[14px] p-4 flex flex-col sm:flex-row gap-3 sm:items-center ${
                disabled ? 'opacity-60 pointer-events-none' : ''
              } ${
                isMost
                  ? 'border-[#387DFF]/60 bg-gradient-to-b from-[#EBF6FF] to-white'
                  : isLeast
                    ? 'border-[#F5B7BE] bg-gradient-to-b from-[#FEEBEE] to-white'
                    : 'border-[#E6E6E6] bg-white'
              }`}
            >
              <p className="flex-1 text-sm text-[#1A1A1A]">{text}</p>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pickMost(optionId)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isMost ? 'border-[#0047CC] bg-[#0047CC] text-white' : 'border-[#E6E6E6]'
                  }`}
                >
                  Most
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pickLeast(optionId)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isLeast ? 'border-[#DC3545] bg-[#DC3545] text-white' : 'border-[#E6E6E6]'
                  }`}
                >
                  Least
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(content.reasonPrompt || content.reasoningPrompt || content.justifyPrompt) && (
        <ReasonTextarea
          label={String(content.reasonPrompt || content.reasoningPrompt || content.justifyPrompt || 'Explain your reasoning')}
          itemType={String(item.type || 'sjt_most_least')}
          content={content}
          value={reasoningText}
          disabled={disabled}
          onChange={handleReason}
          minWords={minWords}
        />
      )}
    </AssessmentItemCard>
  );
};

export default SjtMostLeastItem;
