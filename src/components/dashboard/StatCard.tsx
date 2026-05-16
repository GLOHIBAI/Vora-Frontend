import React from 'react';
import { ChevronRightIcon } from '../common/Icons';

import type { StatCardProps } from '../../types';

const StatCard: React.FC<StatCardProps> = ({ title, value, linkText, onLinkClick }) => {
  return (
    <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 min-h-[180px] cursor-pointer hover:shadow-sm">
      <div>
        <p className="text-[13px] font-semibold text-[#0047CC] mb-6">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-[#0047CC] tracking-tight">{value}</h3>
        </div>
      </div>
      
      {linkText && (
        <button 
          onClick={onLinkClick}
          className="mt-6 flex items-center gap-1.5 text-[12px] font-bold text-[#0047CC] hover:text-[#003d99] transition-colors cursor-pointer w-fit group"
        >
          {linkText}
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      )}
    </div>
  );
};

export default StatCard;
