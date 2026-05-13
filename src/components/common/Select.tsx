import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

import type { Option, SelectProps } from '../../types';

const Select: React.FC<SelectProps> = ({ 
  label, 
  name,
  options = [], 
  groups,
  value = '',
  placeholder = "Select an option", 
  error = false,
  helperText = '',
  hint = '',
  className = '',
  onChange,
  onBlur,
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

  // Find selected label from flat options or groups
  const findSelectedLabel = (): string => {
    if (groups) {
      for (const group of groups) {
        const found = group.options.find(o => o.value === value);
        if (found) return found.label;
      }
      return '';
    }
    return options.find(o => o.value === value)?.label || '';
  };

  const selectedLabel = findSelectedLabel();

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || '', value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen && onBlur) {
      onBlur();
    }
  };

  const renderOption = (option: Option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => handleSelect(option.value)}
      className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors cursor-pointer mb-0.5 last:mb-0 ${
        option.value === value
          ? 'bg-[#0052cc] text-white font-semibold'
          : option.italic
            ? 'text-[#808080] italic hover:bg-gray-50'
            : 'text-[#374151] hover:bg-gray-50'
      }`}
    >
      {option.label}
    </button>
  );

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-semibold text-text-secondary mb-2.5">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full px-4 py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'} transition-all cursor-pointer flex items-center justify-between text-left ${className}`}
        >
          <span className={value ? 'text-text-secondary' : 'text-gray-400'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-72 overflow-y-auto custom-scrollbar">
            {groups ? (
              groups.map((group, gIdx) => (
                <div key={group.label}>
                  {gIdx > 0 && (
                    <div className="h-px bg-[#E6E6E6] my-1" />
                  )}
                  <div className="px-4 py-2 text-[11px] font-extrabold text-[#ADADAD] uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.options.map(renderOption)}
                </div>
              ))
            ) : (
              options.map(renderOption)
            )}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[#808080] ml-0.5 leading-relaxed">{hint}</p>
      )}
      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
