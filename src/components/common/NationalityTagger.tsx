import React, { useState, useRef, useEffect } from 'react';

import { NationalityTaggerProps } from '../../types';

const NationalityTagger: React.FC<NationalityTaggerProps> = ({
  label,
  hint,
  selected,
  onChange,
  options,
  popularOptions = [],
  placeholder = 'Search and add nationality...',
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
        <strong className="text-[#0052cc] font-bold">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
        {label}
      </label>
      {hint && (
        <p className="text-xs text-[#808080] mb-2.5 leading-relaxed">{hint}</p>
      )}

      {/* Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((nat, idx) => (
            <span
              key={nat}
              className="inline-flex items-center gap-1.5 bg-white text-[#0052cc] border border-[#0052cc] text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                {nat}
              </span>
              {idx === 0 && (
                <span className="text-[10px] opacity-60 font-semibold">(primary)</span>
              )}
              <button
                type="button"
                onClick={() => removeNationality(nat)}
                className="text-[#0052cc] cursor-pointer text-sm font-bold leading-none"
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
          className="w-full px-4 py-3 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all placeholder:text-gray-400 text-sm"
          autoComplete="off"
        />

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
    </div>
  );
};

export default NationalityTagger;
