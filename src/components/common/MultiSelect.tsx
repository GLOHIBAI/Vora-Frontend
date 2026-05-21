import React, { useState, useRef, useEffect } from 'react';

import type { MultiSelectProps, Option, OptionGroup } from '../../types';
import Tag from './Tag';
import { ChevronDownIcon, CheckIcon } from './Icons';

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options = [],
  groups = [],
  selected,
  onChange,
  placeholder = 'Select options',
  error = false,
  helperText = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
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

  const handleAddOther = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otherValue.trim()) {
      if (!selected.includes(otherValue.trim())) {
        onChange([...selected, otherValue.trim()]);
      }
      setOtherValue('');
      setShowOtherInput(false);
    }
  };

  const toggleOption = (value: string) => {
    if (value === 'other') {
      setShowOtherInput(!showOtherInput);
      return;
    }
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeTag = (value: string) => {
    onChange(selected.filter(v => v !== value));
  };

  const getLabel = (value: string) => {
    let found = options.find(o => o.value === value);
    if (!found) {
      for (const group of groups as OptionGroup[]) {
        const foundInGroup = group.options.find((o: Option) => o.value === value);
        if (foundInGroup) {
          found = foundInGroup;
          break;
        }
      }
    }
    return found?.label || value;
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-[#374151] mb-2.5">
        {label}
      </label>
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={`w-full min-h-[48px] px-4 py-2.5 sm:py-3 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} text-left focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-blue-500/20 focus:border-blue-500'} transition-all cursor-pointer flex items-center justify-between gap-2`}
        >
          <div className="flex-1 flex flex-col gap-1.5">
            {selected.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map(value => (
                    <Tag
                      key={value}
                      label={getLabel(value)}
                      onRemove={() => removeTag(value)}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{selected.length} option{selected.length !== 1 ? 's' : ''} selected</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group mb-0.5 last:mb-0"
                onClick={() => toggleOption(option.value)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option.value) || (option.value === 'other' && showOtherInput) ? 'bg-[#0047CC] border-[#0047CC]' : 'border-gray-300 bg-white group-hover:border-[#0047CC]'}`}>
                  {(selected.includes(option.value) || (option.value === 'other' && showOtherInput)) && (
                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-[#374151]">{option.label}</span>
              </div>
            ))}
            
            {(groups as OptionGroup[]).map((group: OptionGroup, groupIdx: number) => (
              <div key={groupIdx}>
                <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-default sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  {group.label}
                </div>
                {group.options.map((option: Option) => (
                  <div
                    key={option.value}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group mb-0.5 last:mb-0"
                    onClick={() => toggleOption(option.value)}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(option.value) ? 'bg-[#0047CC] border-[#0047CC]' : 'border-gray-300 bg-white group-hover:border-[#0047CC]'}`}>
                      {selected.includes(option.value) && (
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-[#374151]">{option.label}</span>
                  </div>
                ))}
              </div>
            ))}

            {showOtherInput && (
              <div 
                className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOther();
                      }
                    }}
                    placeholder="Type and press Enter..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] transition-all placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddOther()}
                    disabled={!otherValue.trim()}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      otherValue.trim() 
                        ? 'bg-[#0047CC] text-white hover:bg-[#003d99]' 
                        : 'bg-[#E5E7EB] text-[#374151] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
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
