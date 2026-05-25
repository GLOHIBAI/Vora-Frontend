import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  searchCitiesInCountry,
  searchCountries,
  searchLocations,
} from '../../utils/locationSearch';
import type { LocationOption } from '../../utils/locationSearch.types';

export interface LocationAutocompleteProps {
  label: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  searchMode?: 'all' | 'country' | 'city';
  /** Required when searchMode is "city" — limits suggestions to this country. */
  countryName?: string;
  emptyMessage?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

const DEBOUNCE_MS = 350;

const inputClass = (error: boolean, focused: boolean) =>
  [
    'w-full px-3.5 py-[11px] rounded-lg border text-sm font-normal bg-white outline-none transition-[border-color] duration-150',
    'text-[#1A1A1A] placeholder:text-[#ADADAD] caret-[#1A1A1A]',
    error ? 'border-red-500 bg-red-50' : 'border-[#E6E6E6]',
    !error && focused ? 'border-[#0047CC]' : '',
  ]
    .filter(Boolean)
    .join(' ');

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = "e.g. Lagos, Nigeria — or 'Multiple locations'",
  error = false,
  helperText = '',
  className = '',
  labelClassName = 'block text-[13px] font-medium text-[#1A1A1A] mb-1.5',
  searchMode = 'all',
  countryName = '',
  emptyMessage,
  onBlur,
  onKeyDown,
}) => {
  const noResultsText =
    emptyMessage ??
    (searchMode === 'country'
      ? 'No countries found — try another spelling'
      : searchMode === 'city'
        ? 'No cities found in this country — try another spelling'
        : 'No locations found — try a city or state name');
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runSearch = useCallback(async (searchQuery: string) => {
    abortRef.current?.abort();
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      let results: LocationOption[];
      if (searchMode === 'country') {
        results = await searchCountries(trimmed);
      } else if (searchMode === 'city') {
        if (!countryName.trim()) {
          results = [];
        } else {
          results = await searchCitiesInCountry(
            trimmed,
            countryName,
            controller.signal
          );
        }
      } else {
        results = await searchLocations(trimmed, controller.signal);
      }
      if (!controller.signal.aborted) {
        setOptions(results);
      }
    } catch {
      if (!controller.signal.aborted) {
        setOptions([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [searchMode, countryName]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, isOpen, runSearch]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const handleSelect = (option: LocationOption) => {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (next: string) => {
    setQuery(next);
    onChange(next);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
    if (query.trim().length >= 2) {
      void runSearch(query);
    }
  };

  const showDropdown =
    isOpen && (isLoading || options.length > 0 || query.trim().length >= 2);

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label ? (
        <label className={labelClassName}>{label}</label>
      ) : null}
      <div className={`relative ${isOpen ? 'z-20' : ''}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={inputClass(error, isFocused)}
        />

        {showDropdown && (
          <div className="absolute z-20 mt-[3px] w-full rounded-lg border border-[#E6E6E6] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)] max-h-[268px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 gap-2 text-[#808080]">
                <div className="w-4 h-4 border-2 border-[#E6E6E6] border-t-[#0047CC] rounded-full animate-spin" />
                <span className="text-sm">
                  {searchMode === 'city' ? 'Searching cities…' : 'Searching locations…'}
                </span>
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm leading-snug transition-colors cursor-pointer ${
                    option.value === value
                      ? 'bg-[#EBF6FF] text-[#0047CC] font-bold'
                      : 'text-[#1A1A1A] hover:bg-[#F7F7F7]'
                  }`}
                >
                  <span className="block">{option.label}</span>
                  {option.type === 'state' ? (
                    <span
                      className={`block text-[11px] mt-0.5 font-normal ${
                        option.value === value ? 'text-[#0047CC]/80' : 'text-[#808080]'
                      }`}
                    >
                      State / region
                    </span>
                  ) : null}
                  {option.type === 'country' ? (
                    <span
                      className={`block text-[11px] mt-0.5 font-normal ${
                        option.value === value ? 'text-[#0047CC]/80' : 'text-[#808080]'
                      }`}
                    >
                      Country
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="py-3 px-3.5 text-sm text-[#808080] italic">
                {noResultsText}
              </div>
            )}
          </div>
        )}
      </div>
      {error && helperText ? (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default LocationAutocomplete;
