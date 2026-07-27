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
  const isScale = (item.type as string) === 'scale';
  const unit = String(content.unit || '');
  const scaleLabels =
    (content.scaleLabels as string[]) ||
    (content.options as any[])?.map((o) => (typeof o === 'string' ? o : o.text)) ||
    ['1', '2', '3', '4', '5'];

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value ?? '')) || 0;
  const selectedLabel =
    numericValue > 0 && numericValue <= scaleLabels.length
      ? scaleLabels[numericValue - 1]
      : null;

  const optionCount = scaleLabels.length;
  const useCompactNumbers = optionCount > 5;

  return (
    <AssessmentItemCard title={String(prompt)}>
      {content.scenario && String(content.scenario) !== String(prompt) ? (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 mb-4 text-[14px] text-[#334155] leading-relaxed font-medium">
          {String(content.scenario)}
        </div>
      ) : null}

      {isScale ? (
        <div className="my-2 space-y-4">
          <div className="flex items-center justify-between gap-3 text-[11px] font-[700] text-[#64748B] tracking-[0.02em]">
            <span className="min-w-0 truncate">{scaleLabels[0]}</span>
            <span className="text-[#CBD5E1] shrink-0" aria-hidden>
              →
            </span>
            <span className="min-w-0 truncate text-right">
              {scaleLabels[scaleLabels.length - 1]}
            </span>
          </div>

          {useCompactNumbers ? (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(optionCount, 10)}, minmax(0, 1fr))`,
              }}
            >
              {scaleLabels.map((lbl, idx) => {
                const num = idx + 1;
                const isSelected = numericValue === num;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    title={lbl}
                    aria-pressed={isSelected}
                    onClick={() => onChange(num)}
                    className={`aspect-square min-h-[44px] rounded-[12px] text-[15px] font-[800] transition-all border outline-none ${
                      isSelected
                        ? 'bg-[#0047CC] border-[#0047CC] text-white shadow-[0_4px_14px_rgba(0,71,204,0.28)]'
                        : 'bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#0047CC]/45 hover:bg-[#F8FAFC]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: `repeat(${optionCount}, minmax(0, 1fr))` }}
            >
              {scaleLabels.map((lbl, idx) => {
                const num = idx + 1;
                const isSelected = numericValue === num;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => onChange(num)}
                    className={`group flex flex-col items-center justify-center gap-2 min-h-[92px] px-3 py-4 rounded-[16px] border-2 text-center transition-all outline-none ${
                      isSelected
                        ? 'border-[#0047CC] bg-[#EBF6FF] shadow-[0_4px_16px_rgba(0,71,204,0.16)]'
                        : 'border-[#E6E6E6] bg-white hover:border-[#0047CC]/40 hover:bg-[#F8FAFC]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[900] transition-colors ${
                        isSelected
                          ? 'bg-[#0047CC] text-white'
                          : 'bg-[#F1F5F9] text-[#0047CC] group-hover:bg-[#EBF6FF]'
                      }`}
                    >
                      {num}
                    </span>
                    <span
                      className={`text-[12.5px] font-[700] leading-[1.35] ${
                        isSelected ? 'text-[#0047CC]' : 'text-[#334155]'
                      }`}
                    >
                      {lbl}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-center pt-1 min-h-[28px]">
            {selectedLabel ? (
              <span className="inline-flex items-center gap-2 text-[12px] font-[700] text-[#0047CC] bg-[#EBF6FF] border border-[#0047CC]/20 rounded-full px-3.5 py-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0047CC] text-white text-[11px] font-[900] flex items-center justify-center">
                  {numericValue}
                </span>
                {selectedLabel}
              </span>
            ) : (
              <span className="text-[12px] font-[600] text-[#94A3B8]">Select a rating</span>
            )}
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
