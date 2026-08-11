import React, { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Choose an option',
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative inline-block ${isSmall ? 'min-w-[160px]' : 'w-full'} ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between transition-all cursor-pointer outline-none shadow-sm ${
          isSmall
            ? 'px-3 py-2 text-[13px] font-semibold rounded-lg gap-2 min-h-[36px]'
            : 'px-4 py-3 text-[13.5px] font-medium rounded-[14px] gap-3'
        } ${
          isOpen
            ? 'border-[#0047CC] ring-2 ring-[#0047CC]/15 shadow-[0_2px_12px_rgba(0,71,204,0.12)] border bg-white text-[#0047CC]'
            : selectedOption
            ? 'border-[#0047CC]/60 bg-[#EBF6FF] text-[#0047CC] font-bold border'
            : 'border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#0047CC]/50 hover:bg-[#F8FAFC] border'
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className="truncate text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0047CC]' : 'text-[#94A3B8]'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] min-w-full w-max max-w-[min(92vw,480px)] z-[100] max-h-[280px] overflow-y-auto custom-scrollbar bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1.5 animate-[fadeUp_0.15s_ease_both]">
          {/* Placeholder clear item */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors ${
              !value ? 'bg-[#EBF6FF] text-[#0047CC] font-bold' : 'text-[#94A3B8] hover:bg-[#F8FAFC]'
            }`}
          >
            {placeholder}
          </div>

          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                title={opt.label}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#EBF6FF] text-[#0047CC] font-bold'
                    : 'text-[#1E293B] font-medium hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="whitespace-normal break-words leading-relaxed text-left font-mono text-[12.5px]">
                  {opt.label}
                </span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#0047CC] shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
