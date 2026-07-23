import React from 'react';

interface PartRailProps {
  activePart: number; // 1, 2, 3, or 4
}

const PartRail: React.FC<PartRailProps> = ({ activePart }) => {
  const parts = [
    { num: 1, label: 'Part 1 · Knowledge' },
    { num: 2, label: 'Part 2 · Expertise' },
    { num: 3, label: 'Part 3 · Reasoning' },
    { num: 4, label: 'Part 4 · Simulation' },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-[#FBFCFF] px-[20px] sm:px-[32px] py-[11px] flex items-center justify-center gap-[10px]">
      {parts.map((p) => {
        const isActive = p.num === activePart;
        const isDone = p.num < activePart;

        return (
          <div
            key={p.num}
            className={`flex items-center gap-[7px] px-[12px] py-[5px] rounded-full transition-all border-[1.5px] text-[11.5px] font-[700] ${
              isActive
                ? 'bg-[#EBF6FF] border-[#0047CC] text-[#0047CC]'
                : isDone
                ? 'bg-[#EBF6FF] border-[#0047CC]/20 text-[#0047CC]'
                : 'bg-white border-[#E6E6E6] text-[#ADADAD]'
            }`}
          >
            <div
              className={`w-[8px] h-[8px] rounded-full ${
                isActive || isDone ? 'bg-[#0047CC]' : 'bg-[#E6E6E6]'
              }`}
            />
            {p.label}
            {isDone && ' ✓'}
          </div>
        );
      })}
    </div>
  );
};

export default PartRail;
