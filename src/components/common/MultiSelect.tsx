import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  error = false,
  helperText = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeTag = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(v => v !== value));
  };

  const getLabel = (value: string) => options.find(o => o.value === value)?.label || value;

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-semibold text-[#374151] mb-2.5">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[48px] px-4 py-2.5 sm:py-3 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} text-left focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-blue-500/20 focus:border-blue-500'} transition-all cursor-pointer flex items-center justify-between gap-2`}
        >
          <div className="flex-1 flex flex-col gap-1.5">
            {selected.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map(value => (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#0052cc] text-[#0052cc] text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {getLabel(value)}
                      <button
                        type="button"
                        onClick={(e) => removeTag(value, e)}
                        className="text-[#0052cc] cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">{selected.length} option{selected.length !== 1 ? 's' : ''} selected</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group mb-0.5 last:mb-0"
                onClick={() => toggleOption(option.value)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option.value) ? 'bg-[#0052cc] border-[#0052cc]' : 'border-gray-300 bg-white group-hover:border-[#0052cc]'}`}>
                  {selected.includes(option.value) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[#374151]">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
