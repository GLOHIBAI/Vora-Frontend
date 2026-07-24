import React from 'react';
import AssessmentItemCard from '../shared/AssessmentItemCard';
import type { AssessmentItemRendererProps } from '../shared/types';

const NumericScaleItem: React.FC<AssessmentItemRendererProps> = ({
  item,
  value,
  disabled = false,
  onChange,
}) => {
  const { content } = item;
  const prompt = content.prompt ?? content.scenario ?? 'Enter your numeric answer.';
  const isScale = item.type === 'scale';
  const unit = String(content.unit || '');
  const scaleLabels = (content.scaleLabels as string[]) || (content.options as any[])?.map((o) => typeof o === 'string' ? o : o.text) || ['1', '2', '3', '4', '5'];

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value ?? '')) || 0;

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      )}

      {isScale ? (
        <div className="my-5 space-y-4">
          <div className="flex items-center justify-between text-[12px] font-bold text-[#0047CC] px-1">
            <span>{scaleLabels[0]}</span>
            <span className="text-[16px] font-extrabold text-[#0047CC] bg-[#EBF6FF] px-4 py-1 rounded-full border border-[#0047CC]/20">
              {numericValue || scaleLabels[0]}
            </span>
            <span>{scaleLabels[scaleLabels.length - 1]}</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {scaleLabels.map((lbl, idx) => {
              const num = idx + 1;
              const isSelected = numericValue === num;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(num)}
                  className={`p-3 rounded-xl text-[14px] font-extrabold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0047CC] border-[#0047CC] text-white shadow-md ring-2 ring-[#0047CC]/20'
                      : 'bg-white border-[#E6E6E6] text-[#1E293B] hover:border-[#0047CC]/40 hover:bg-[#F8FAFC]'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="my-4 max-w-[260px]">
          <label className="block text-[11px] font-[800] text-[#0047CC] tracking-[0.6px] uppercase mb-2">
            Numeric Value {unit ? `(${unit})` : ''}
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              disabled={disabled}
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0"
              className="w-full p-3.5 bg-white border border-[#CBD5E1] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-[14px] text-[16px] font-bold text-[#1E293B] outline-none transition-all shadow-sm"
            />
            {unit && (
              <span className="absolute right-4 text-[13px] font-semibold text-[#64748B]">
                {unit}
              </span>
            )}
          </div>
        </div>
      )}
    </AssessmentItemCard>
  );
};

export default NumericScaleItem;
