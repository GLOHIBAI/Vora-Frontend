import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  placeholder = 'Select an option',
  error = false,
  helperText = '',
  hint = '',
  className = '',
  containerClassName = '',
  disabled = false,
  align = 'left',
  onChange,
  onBlur,
}) => {
  const isInline = variant === 'inline';
  const isCompact = variant === 'compact';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smart matcher to handle case-insensitivity, hyphens, slashes, and underscores
  const normalizeKey = (v: any): string => {
    if (v === null || v === undefined) return '';
    return String(v).toLowerCase().replace(/[\s_/\\-]+/g, '');
  };

  const LANG_CODE_MAP: Record<string, string> = {
    en: 'english',
    fr: 'french',
    es: 'spanish',
    pt: 'portuguese',
    ar: 'arabic',
    sw: 'swahili',
  };

  const isOptionMatch = (option: Option, val: string | undefined): boolean => {
    if (!val) return false;
    if (option.value === val || option.label === val) return true;
    const normVal = normalizeKey(val);
    const normOptVal = normalizeKey(option.value);
    const normOptLabel = normalizeKey(option.label);
    if (normOptVal === normVal || normOptLabel === normVal) return true;
    if (
      LANG_CODE_MAP[normVal] &&
      (normOptVal === LANG_CODE_MAP[normVal] || normOptLabel === LANG_CODE_MAP[normVal])
    ) {
      return true;
    }
    return false;
  };

  // Flat list of enabled options for keyboard navigation
  const flatOptions = useMemo(() => {
    if (groups) {
      return groups.flatMap((g) => g.options);
    }
    return options;
  }, [groups, options]);

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!value) return undefined;
    return flatOptions.find((o) => isOptionMatch(o, value));
  }, [flatOptions, value]);

  const selectedLabel = selectedOption?.label || value || '';

  // Keyboard navigation focus index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen) {
      const selectedIdx = flatOptions.findIndex((o) => isOptionMatch(o, value));
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, flatOptions, value]);

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

  // Keyboard controls: ArrowUp, ArrowDown, Enter, Space, Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let next = prev + 1;
        while (next < flatOptions.length && flatOptions[next]?.disabled) {
          next++;
        }
        return next < flatOptions.length ? next : prev;
      });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let prevIdx = prev - 1;
        while (prevIdx >= 0 && flatOptions[prevIdx]?.disabled) {
          prevIdx--;
        }
        return prevIdx >= 0 ? prevIdx : prev;
      });
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatOptions.length) {
        const opt = flatOptions[focusedIndex];
        if (!opt.disabled) {
          handleSelect(opt.value);
        }
      }
      return;
    }
  };

  const renderOption = (option: Option, globalIdx: number) => {
    const isSelected = isOptionMatch(option, value);
    const isFocused = focusedIndex === globalIdx;

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={option.disabled}
        onClick={() => handleSelect(option.value)}
        onMouseEnter={() => !option.disabled && setFocusedIndex(globalIdx)}
        className={`w-full min-h-[40px] px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between gap-3 text-left cursor-pointer ${
          option.disabled
            ? 'opacity-50 cursor-not-allowed text-slate-400'
            : isSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : isFocused
            ? 'bg-slate-50 text-slate-900'
            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
        } ${option.italic ? 'italic text-slate-500' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {option.icon && (
            <span
              className={`shrink-0 flex items-center justify-center transition-colors ${
                isSelected ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              {option.icon}
            </span>
          )}
          <span className="truncate">{option.label}</span>
        </div>

        {isSelected && (
          <CheckIcon size={16} className="text-blue-700 shrink-0 ml-auto stroke-[2.5]" />
        )}
      </button>
    );
  };

  const alignClass = align === 'right' ? 'right-0 left-auto' : 'left-0';

  const menuClass = isInline
    ? `absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 min-w-full w-max rounded-lg bg-white border border-slate-200 shadow-lg p-2 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`
    : isCompact
    ? `absolute z-50 top-full mt-1 ${alignClass} min-w-full w-max max-w-xs rounded-lg border border-slate-200 bg-white shadow-lg p-1.5 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`
    : `absolute z-50 top-full mt-1 ${alignClass} min-w-full w-max max-w-sm rounded-lg border border-slate-200 bg-white shadow-lg p-2 max-h-60 overflow-y-auto custom-scrollbar ${menuClassName}`;

  const triggerClass = isInline
    ? `w-auto min-w-[3.25rem] px-2 py-1.5 rounded-lg border border-transparent font-medium text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
        isOpen || value ? 'text-[#0047CC]' : 'text-slate-800'
      } ${className}`
    : isCompact
    ? `w-full sm:w-auto min-w-[130px] sm:min-w-[140px] px-3.5 py-2 text-xs rounded-lg border ${
        error ? 'border-red-500 bg-white' : 'border-slate-200 bg-white'
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400'
          : 'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] cursor-pointer text-slate-800'
      } font-semibold transition-all flex items-center justify-between gap-2.5 text-left ${className}`
    : `w-full h-10 min-h-[40px] px-3.5 py-2 text-sm rounded-lg border ${
        error ? 'border-red-500 bg-white' : 'border-slate-200 bg-white'
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400'
          : 'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] cursor-pointer text-slate-800'
      } font-medium transition-all flex items-center justify-between gap-2.5 text-left ${className}`;

  let runningOptionIndex = 0;

  return (
    <div
      className={
        isInline
          ? `w-auto ${containerClassName} ${isOpen ? 'relative z-50' : ''}`
          : isCompact
          ? `w-auto inline-block relative ${containerClassName} ${isOpen ? 'z-50' : ''}`
          : `w-full ${containerClassName} ${isOpen ? 'relative z-50' : ''}`
      }
      ref={containerRef}
      onMouseDown={isInline ? (e) => e.stopPropagation() : undefined}
    >
      {!hideLabel && label !== '' && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className={`relative ${isOpen ? 'z-50' : ''}`}>
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={triggerClass}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
            {selectedOption?.icon && (
              <span className="shrink-0 text-slate-500 flex items-center justify-center">
                {selectedOption.icon}
              </span>
            )}
            <span
              className={`truncate text-sm ${
                value ? 'text-slate-900 font-medium' : 'text-slate-400 font-normal'
              }`}
            >
              {selectedLabel || placeholder}
            </span>
          </div>

          <ChevronDownIcon
            size={isInline ? 12 : isCompact ? 14 : 16}
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div role="listbox" className={menuClass}>
            {groups
              ? groups.map((group, gIdx) => (
                  <div key={group.label}>
                    {gIdx > 0 && <div className="h-px bg-slate-100 my-1.5" />}
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {group.label}
                    </div>
                    {group.options.map((opt) => {
                      const idx = runningOptionIndex++;
                      return renderOption(opt, idx);
                    })}
                  </div>
                ))
              : options.map((opt, idx) => renderOption(opt, idx))}
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500 ml-0.5 leading-relaxed">{hint}</p>
      )}
      {error && helperText && (
        <p className="mt-1 text-xs text-red-500 font-medium ml-0.5">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
