import React from 'react';
import { LockIcon, ChevronRightIcon } from '../common/Icons';

import type { QuickActionCardProps } from '../../types';

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  description, 
  buttonText, 
  isLocked = false, 
  variant = 'white',
  onClick 
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <div className={`
      relative rounded-2xl p-7 flex flex-col h-full transition-all duration-300 min-h-[190px] border border-gray-100
      ${isPrimary 
        ? 'bg-[#0047CC] text-white' 
        : 'bg-white text-gray-900'}
    `}>
      <div className="flex-1">
        <h3 className={`text-[17px] font-bold leading-tight mb-4 ${isPrimary ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
        <p className={`text-[13px] leading-relaxed mb-6 ${isPrimary ? 'text-blue-50' : 'text-gray-400 font-medium'}`}>
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <button 
          onClick={onClick}
          disabled={isLocked}
          className={`
            flex items-center gap-1.5 text-[13px] font-bold transition-all group cursor-pointer
            ${isPrimary ? 'text-white' : isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-[#0047CC]'}
          `}
        >
          <span>{buttonText}</span>
          {!isLocked && <span className="group-hover:translate-x-1 transition-transform">→</span>}
        </button>
        {isLocked && (
          <div className="text-blue-500">
            <LockIcon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionCard;
