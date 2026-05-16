import React, { useState, useRef, useEffect } from 'react';

import type { NationalityTaggerProps } from '../../types';
import { ChevronDownIcon } from './Icons';

const NationalityTagger: React.FC<NationalityTaggerProps> = ({
  label,
  hint,
  selected,
  onChange,
  options,
  popularOptions = [],
  placeholder = 'Search and add nationality...',
  error = false,
  helperText = '',
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

  const available = (query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o))
    : popularOptions.filter(o => !selected.includes(o))
  ).slice(0, 8);

  const addNationality = (val: string) => {
    if (!selected.includes(val)) {
      onChange([...selected, val]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const removeNationality = (val: string) => {
    onChange(selected.filter(n => n !== val));
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong className="text-[#0047CC] font-medium">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>
      {hint && (
        <p className="text-xs text-[#808080] mb-2.5 ml-0.5 leading-relaxed">{hint}</p>
      )}

      {/* Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((nat, idx) => (
            <span
              key={nat}
              className="inline-flex items-center gap-1.5 bg-white text-[#0047CC] border border-[#0047CC] text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                {nat}
              </span>
              {idx === 0 && (
                <span className="text-[10px] opacity-60 font-medium">(primary)</span>
              )}
              <button
                type="button"
                onClick={() => removeNationality(nat)}
                className="text-[#0047CC] cursor-pointer text-sm font-medium leading-none"
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 pr-10 py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-[#0047CC]/20 focus:border-[#0047CC]'} transition-all placeholder:text-gray-400 text-sm`}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none z-10">
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && available.length > 0 && (
          <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border-default bg-white shadow-lg p-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {available.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => addNationality(option)}
                className="w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors cursor-pointer mb-0.5 last:mb-0 text-[#374151] hover:bg-gray-100"
              >
                {highlightMatch(option, query)}
              </button>
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

export default NationalityTagger;
