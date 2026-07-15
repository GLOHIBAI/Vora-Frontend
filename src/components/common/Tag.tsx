import React from 'react';
import { CloseIcon } from './Icons';

interface TagProps {
  label: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  variant?: 'blue' | 'solid-blue' | 'solid-dark' | 'green' | 'red' | 'gray' | 'yellow' | 'blue-light' | 'green-light' | 'outline' | 'purple' | 'blue-soft';
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '', variant = 'blue' }) => {
  const styles: Record<string, string> = {
    blue: 'bg-white text-[#0047CC] border-[#0047CC]',
    'solid-blue': 'bg-[#0047CC] text-white border-[#0047CC]',
    'solid-dark': 'bg-[#182348] text-white border-[#182348]',
    green: 'bg-white text-[#2CA62C] border-[#2CA62C]',
    red: 'bg-white text-[#DC2626] border-[#DC2626]',
    yellow: 'bg-white text-[#D97706] border-[#D97706]',
    gray: 'bg-white text-gray-600 border-gray-200',
    'blue-light': 'bg-white text-[#0047CC] border-[#0047CC]',
    'green-light': 'bg-white text-[#38A169] border-[#38A169]',
    outline: 'bg-white border border-[#0047CC] text-[#0047CC]',
    purple: 'bg-white text-purple-700 border-purple-700',
    'blue-soft': 'bg-[#EBF6FF] text-[#0047CC] border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full animate-in fade-in zoom-in-95 duration-200 border max-w-full break-words whitespace-normal text-left ${styles[variant] || styles.blue} ${className}`}
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
