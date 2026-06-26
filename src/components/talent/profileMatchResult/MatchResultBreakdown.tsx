import { useEffect, useState } from 'react';
import { PROFILE_MATCH_BREAKDOWN } from '../../../constants/profileMatchResult';
import type { ProfileMatchBreakdownItem } from '../../../constants/profileMatchResult';

interface MatchResultBreakdownProps {
  items?: ProfileMatchBreakdownItem[];
}

const MatchResultBreakdown: React.FC<MatchResultBreakdownProps> = ({ items = PROFILE_MATCH_BREAKDOWN }) => {
  const [animatedPct, setAnimatedPct] = useState<number[]>(items.map(() => 0));

  useEffect(() => {
    setAnimatedPct(items.map(() => 0));
    const timeouts = items.map((item, i) => {
      return setTimeout(() => {
        setAnimatedPct((prev) => {
          const next = [...prev];
          next[i] = item.pct;
          return next;
        });
      }, 400 + i * 120);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [items]);

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-xl px-6 py-[22px] mb-5">
      <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-4">How your profile matched</h3>
      
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const colorClass = 'bg-[#0047CC]';
          const textColorClass = 'text-[#0047CC]';
          const pct = animatedPct[i];

          return (
            <div key={item.label} className="flex items-center gap-3.5">
              <span className="text-[14px] sm:text-[13px] font-semibold text-[#4A4A4A] w-[110px] sm:w-[150px] shrink-0 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[13px] font-bold w-[38px] text-right shrink-0 ${textColorClass}`}>
                {pct > 0 ? `${item.pct}%` : '0%'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchResultBreakdown;
