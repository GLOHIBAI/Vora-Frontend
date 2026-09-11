import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from './Icons';

import type { Option, SelectProps } from '../../types';

const Select: React.FC<SelectProps> = ({ 
  label = '',
  hideLabel = false,
  variant = 'default',
  menuClassName = '',
  name,
  options = [], 
  groups,
  value = '',
  placeholder = "Select an option", 
  error = false,
  helperText = '',
  hint = '',
  className = '',
  disabled = false,
  onChange,
  onBlur,
}) => {
  const isInline = variant === 'inline';
  const isCompact = variant === 'compact';
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

  // Smart matcher to handle case-insensitivity, hyphens, slashes, and underscores (e.g. government-agency -> Government Agency, ADMIN -> Admin)
  const normalizeKey = (v: any): string => {
    if (v === null || v === undefined) return '';
    return String(v).toLowerCase().replace(/[\s_/\\-]+/g, '');
  };

  const isOptionMatch = (option: Option, val: string | undefined): boolean => {
    if (!val) return false;
    if (option.value === val || option.label === val) return true;
    const normVal = normalizeKey(val);
    return normalizeKey(option.value) === normVal || normalizeKey(option.label) === normVal;
  };

  // Find selected option from flat options or groups
  const findSelectedOption = (): Option | undefined => {
    if (!value) return undefined;
    if (groups) {
      for (const group of groups) {
        const found = group.options.find((o) => isOptionMatch(o, value));
        if (found) return found;
      }
      return undefined;
    }
    return options.find((o) => isOptionMatch(o, value));
  };

  const selectedOption = findSelectedOption();
  const selectedLabel = selectedOption?.label || value || '';

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || '', value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen && onBlur) {
      onBlur();
    }
  };

  const renderOption = (option: Option) => {
    const isSelected = isOptionMatch(option, value);

    if (isInline) {
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={`w-full text-center px-2 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
            isSelected
              ? 'bg-white text-[#0047CC] font-bold'
              : 'text-[#4A4A4A] hover:bg-[#EBF6FF] hover:text-[#0047CC]'
          }`}
        >
          {option.label}
        </button>
      );
    }

    if (isCompact) {
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer mb-0.5 last:mb-0 whitespace-nowrap flex items-center justify-between gap-2 ${
            isSelected
              ? 'bg-[#0047CC] text-white font-medium'
              : 'text-[#374151] hover:bg-[#F7F7F7]'
          }`}
        >
          <span>{option.label}</span>
          {isSelected && <CheckIcon size={12} className="text-white shrink-0" />}
        </button>
      );
    }

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => handleSelect(option.value)}
        className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors cursor-pointer mb-0.5 last:mb-0 whitespace-normal break-words flex items-center justify-between gap-2 ${
          isSelected
            ? 'bg-[#0047CC] text-white font-medium'
            : option.italic
              ? 'text-[#808080] italic hover:bg-gray-50'
              : 'text-[#374151] hover:bg-gray-50'
        }`}
      >
        <span>{option.label}</span>
        {isSelected && <CheckIcon size={14} className="text-white shrink-0" />}
      </button>
    );
  };

  const menuClass = isInline
    ? `absolute left-1/2 -translate-x-1/2 top-full mt-1 z-20 w-[4.75rem] rounded-lg bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-1 max-h-44 overflow-y-auto custom-scrollbar border-0 ${menuClassName}`
    : isCompact
    ? `absolute z-50 mt-1 left-0 min-w-full w-max max-w-[220px] rounded-xl border border-[#E6E6E6] bg-white shadow-lg p-1.5 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`
    : `absolute z-20 mt-1.5 w-full min-w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-72 overflow-y-auto overflow-x-hidden custom-scrollbar ${menuClassName}`;

  const triggerClass = isInline
    ? `w-auto min-w-[3.25rem] px-1 py-0.5 rounded-md border-0 bg-transparent font-bold text-sm hover:bg-[#F7F7F7] focus:outline-none transition-all cursor-pointer flex items-center justify-center gap-0.5 ${isOpen || value ? 'text-[#0047CC]' : 'text-[#1A1A1A]'} ${className}`
    : isCompact
    ? `w-full min-w-[135px] sm:min-w-[150px] px-2.5 py-1.5 text-xs rounded-lg border ${error ? 'border-red-500 bg-white' : 'border-[#E6E6E6] bg-white'} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-[#ADADAD] focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] cursor-pointer'} text-[#1A1A1A] font-medium transition-all flex items-center justify-between gap-2 text-left ${className}`
    : `w-full px-4 py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-white' : 'border-border-default bg-white'} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'focus:outline-none focus:ring-2 ' + (error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue')} transition-all cursor-pointer flex items-center justify-between text-left ${className}`;

  return (
    <div
      className={isInline ? 'w-auto' : isCompact ? 'w-auto inline-block relative' : 'w-full'}
      ref={containerRef}
      onMouseDown={isInline ? (e) => e.stopPropagation() : undefined}
    >
      {!hideLabel && label !== '' && (
        <label className="block text-sm font-medium text-text-secondary mt-1 mb-3">
          {label}
        </label>
      )}
      <div className={`relative ${isOpen ? 'z-30' : ''}`}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={triggerClass}
        >
          <span className={value ? (isInline ? 'text-inherit' : 'text-[#1A1A1A]') : 'text-gray-400'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDownIcon
            size={isInline ? 12 : isCompact ? 14 : 16}
            className={`flex-shrink-0 transition-transform duration-200 ${
              isInline ? (isOpen ? 'text-[#0047CC] rotate-180' : 'text-[#808080]') : `text-gray-400 ${isOpen ? 'rotate-180' : ''}`
            }`}
          />
        </button>

        {isOpen && (
          <div className={menuClass}>
            {groups ? (
              groups.map((group, gIdx) => (
                <div key={group.label}>
                  {gIdx > 0 && (
                    <div className="h-px bg-[#E6E6E6] my-1" />
                  )}
                  <div className="px-4 py-2 text-[11px] font-medium text-[#ADADAD] uppercase tracking-wider">
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
