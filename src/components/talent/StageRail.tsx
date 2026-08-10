import React from 'react';

const DocumentCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

interface StageRailProps {
  activeStage: number; // 1, 2, 3, 4
  greenDone?: boolean;
  /** When false, omit bottom border (use if another chrome row follows). */
  showBottomBorder?: boolean;
}

const StageRail: React.FC<StageRailProps> = ({
  activeStage,
  greenDone = false,
  showBottomBorder = true,
}) => {
  const steps = [
    { num: 1, label: 'Getting to know you' },
    { num: 2, label: 'Professional dimension' },
    { num: 3, label: 'How you show up' },
    { num: 4, label: 'Final decision' },
  ];

  return (
    <div
      className={`bg-white px-4 sm:px-[32px] py-[10px] flex items-center justify-start sm:justify-center gap-[10px] overflow-x-auto custom-scrollbar scrollbar-none${
        showBottomBorder ? ' border-b border-[#E6E6E6]' : ''
      }`}
    >
      {steps.map((step, idx) => {
        const isDone = step.num < activeStage;
        const isActive = step.num === activeStage;

        return (
          <React.Fragment key={step.num}>
            {idx > 0 && (
              <div
                className={`w-[24px] h-[2px] rounded-[2px] shrink-0 ${
                  steps[idx - 1].num < activeStage 
                    ? 'bg-[#0047CC]' 
                    : 'bg-[#E6E6E6]'
                }`}
              />
            )}
            
            <div className="flex items-center gap-[6px] shrink-0">
              {isDone ? (
                <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white shrink-0 bg-[#0047CC]">
                  <DocumentCheckIcon className="w-[10px] h-[10px]" />
                </div>
              ) : isActive ? (
                <div className="w-[20px] h-[20px] rounded-full bg-[#0047CC] flex items-center justify-center text-[10px] font-[800] text-white shrink-0">
                  {step.num}
                </div>
              ) : (
                <div className="w-[20px] h-[20px] rounded-full bg-[#E6E6E6] flex items-center justify-center text-[10px] font-[800] text-white shrink-0">
                  {step.num}
                </div>
              )}
              
              <div
                className={`text-[11px] font-[700] ${
                  isActive
                    ? 'text-[#0047CC]'
                    : isDone
                    ? 'text-[#808080]'
                    : 'text-[#ADADAD]'
                }`}
              >
                {step.label}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StageRail;
