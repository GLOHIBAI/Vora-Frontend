import React from 'react';
import { CloseIcon } from './Icons';

interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-white border border-[#0052cc] text-[#0052cc] text-xs font-semibold px-3 py-1.5 rounded-full animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-[#0052cc] cursor-pointer hover:text-[#003d99] transition-colors focus:outline-none"
        >
          <CloseIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Tag;
