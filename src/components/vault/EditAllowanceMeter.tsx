import React from 'react';

interface EditAllowanceMeterProps {
  used: number;
  total: number;
}

const EditAllowanceMeter: React.FC<EditAllowanceMeterProps> = ({ used, total }) => {
  const remaining = Math.max(0, total - used);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-[13px] font-semibold text-slate-700">Edit allowance:</span>
      <div className="flex items-center gap-1.5" role="meter" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total}>
        {Array.from({ length: total }, (_, i) => {
          const isFilled = i < used;
          return (
            <div
              key={i}
              title={isFilled ? `Edit ${i + 1} used` : `Edit ${i + 1} available`}
              className={`w-6 h-2 rounded-full transition-colors ${
                isFilled
                  ? 'bg-[#0047CC]' // filled = used
                  : 'bg-white border-[1.5px] border-slate-300' // outlined = remaining
              }`}
            />
          );
        })}
      </div>
      <span className="text-[13px] text-slate-600 font-medium">
        {used} of {total} used ({remaining} remaining)
      </span>
    </div>
  );
};

export default EditAllowanceMeter;
