import React from 'react';
import { CloseIcon } from './Icons';

interface TagProps {
  label: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  variant?: 'blue' | 'solid-blue' | 'solid-dark' | 'green' | 'red' | 'gray' | 'yellow' | 'blue-light' | 'green-light' | 'outline' | 'purple' | 'blue-soft' | 'orange';
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '', variant = 'blue' }) => {
  const styles: Record<string, string> = {
    blue: 'bg-[#F0F5FF] text-[#0047CC] border-transparent',
    'solid-blue': 'bg-[#0047CC] text-white border-[#0047CC]',
    'solid-dark': 'bg-[#182348] text-white border-[#182348]',
    green: 'bg-[#F0FDF4] text-[#15803D] border-transparent',
    red: 'bg-[#FEF2F2] text-[#B91C1C] border-transparent',
    yellow: 'bg-[#FFFBEB] text-[#92400E] border-transparent',
    gray: 'bg-[#F5F5F5] text-[#6B7280] border-transparent',
    'blue-light': 'bg-[#F0F5FF] text-[#0047CC] border-transparent',
    'green-light': 'bg-[#F0FDF4] text-[#15803D] border-transparent',
    outline: 'bg-white border border-gray-200 text-gray-600',
    purple: 'bg-[#F5F3FF] text-[#6D28D9] border-transparent',
    orange: 'bg-[#FFF7ED] text-[#C2410C] border-transparent',
    'blue-soft': 'bg-[#F0F5FF] text-[#0047CC] border-transparent',
  };

  const baseStyle = styles[variant] || styles.blue;
  const resolvedStyle = className.includes('bg-')
    ? baseStyle.replace(/\bbg-\S+/g, '').trim()
    : baseStyle;

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full animate-in fade-in zoom-in-95 duration-200 border max-w-full break-words whitespace-normal text-left ${resolvedStyle} ${className}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer transition-colors focus:outline-none opacity-60 hover:opacity-100 ml-0.5 sm:ml-1"
        >
          <CloseIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}
    </span>
  );
};

export default Tag;
