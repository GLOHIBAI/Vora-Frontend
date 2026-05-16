import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

import type { SearchableSelectProps } from '../../types';

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Type to search...',
  error = false,
  helperText = '',
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
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

  // Sync display text with selected value
  useEffect(() => {
    if (value) {
      const selected = options.find(o => o.value === value);
      if (selected) setQuery(selected.label);
    }
  }, [value, options]);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (optionValue: string, optionLabel: string) => {
    onChange(optionValue);
    setQuery(optionLabel);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-semibold text-[#374151] mb-2.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 pr-10 py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-blue-500/20 focus:border-blue-500'} transition-all placeholder:text-gray-400`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0047CC] rounded-full animate-spin"></div>
                <span className="text-sm">Searching...</span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value, option.label)}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors cursor-pointer mb-0.5 last:mb-0 ${option.value === value ? 'bg-[#0047CC] text-white font-semibold' : 'text-[#374151] hover:bg-gray-100'}`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="py-3 px-4 text-sm text-gray-500 italic">
                No results found
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

export default SearchableSelect;
