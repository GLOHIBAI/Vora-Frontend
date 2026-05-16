import React from 'react';
import { CloseIcon } from './Icons';

interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
  variant?: 'blue' | 'green' | 'red' | 'gray' | 'yellow' | 'blue-light' | 'green-light' | 'outline';
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '', variant = 'blue' }) => {
  const styles: Record<string, string> = {
    blue: 'bg-[#EBF6FF] text-[#0047CC] border-transparent',
    green: 'bg-[#EEFBEE] text-[#2CA62C] border-transparent',
    red: 'bg-[#FEF2F2] text-[#DC2626] border-transparent',
    yellow: 'bg-[#FFFBEB] text-[#D97706] border-transparent',
    gray: 'bg-[#F9FAFB] text-gray-600 border-gray-100',
    'blue-light': 'bg-[#F0F7FF] text-[#0047CC] border-transparent',
    'green-light': 'bg-[#F0FFF4] text-[#38A169] border-[#C6F6D5]',
    outline: 'bg-white border border-[#0047CC] text-[#0047CC]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full animate-in fade-in zoom-in-95 duration-200 border ${styles[variant] || styles.blue} ${className}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer transition-colors focus:outline-none opacity-60 hover:opacity-100 ml-1"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
};

export default Tag;
