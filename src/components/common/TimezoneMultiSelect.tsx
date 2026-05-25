import React, { useState, useRef, useEffect } from 'react';
import type { OptionGroup } from '../../types';
import Tag from './Tag';

const REGION_LABELS: Record<string, string> = {
  EMEA: 'EMEA',
  AMER: 'Americas',
  APAC: 'Asia-Pacific',
  AFRICA: 'Sub-Saharan Africa',
  MENA: 'Middle East & N. Africa',
};

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg width='12' height='7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23808080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

interface TimezoneMultiSelectProps {
  selected: string[];
  selectedRegions?: string[];
  groups: OptionGroup[];
  onAdd: (tz: string) => void;
  onRemove: (tz: string) => void;
  onRemoveRegion?: (region: string) => void;
  onClear: () => void;
  onAddRegion: (region: string) => void;
  error?: boolean;
  errorMessage?: string;
}

const TimezoneMultiSelect: React.FC<TimezoneMultiSelectProps> = ({
  selected,
  selectedRegions = [],
  groups,
  onAdd,
  onRemove,
  onRemoveRegion,
  onClear,
  onAddRegion,
  error = false,
  errorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((grp) => ({
        ...grp,
        options: grp.options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            opt.value.toLowerCase().includes(q)
        ),
      }))
      .filter((grp) => grp.options.length > 0);
  })();

  const buttonLabel =
    selected.length === 0
      ? 'Add specific timezone(s)...'
      : `${selected.length} timezone${selected.length > 1 ? 's' : ''} selected`;

  const hasSelection = selected.length > 0;
  const ddBtnBorder =
    error || isOpen || hasSelection ? 'border-[#0047CC]' : 'border-[#E6E6E6]';

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-[13px] font-medium text-[#1A1A1A] flex items-center gap-1.5">
        Timezone requirement(s)
        <span className="text-[11px] text-[#808080] font-normal">
          select all that apply
        </span>
      </label>

      {error && errorMessage ? (
        <p className="text-xs text-red-600 font-medium -mt-0.5">{errorMessage}</p>
      ) : null}

      <p className="text-[12px] text-[#808080] leading-relaxed mb-1">
        VORA matches candidates who can sustainably overlap with <em>any</em>{' '}
        timezone you select. Select multiple for regional or global roles. Use
        the region shortcuts to quickly select an entire zone.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {(['EMEA', 'AMER', 'APAC', 'AFRICA', 'MENA'] as const).map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => onAddRegion(reg)}
            className="px-3 py-[5px] rounded-full border-[1.5px] border-[#E6E6E6] bg-white text-[11px] font-medium text-[#4A4A4A] cursor-pointer transition-all duration-150 hover:border-[#0047CC] hover:text-[#0047CC] hover:bg-[#EBF6FF]"
          >
            {REGION_LABELS[reg]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onAddRegion('ALL')}
          className="px-3 py-[5px] rounded-full border-[1.5px] border-[#0047CC] bg-white text-[11px] font-medium text-[#0047CC] cursor-pointer transition-all duration-150 hover:bg-[#EBF6FF]"
        >
          All regions
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-[5px] rounded-full border-[1.5px] border-[#FECACA] bg-white text-[11px] font-medium text-[#DC2626] cursor-pointer transition-all duration-150 hover:bg-red-50"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-0 mb-1.5">
        {selectedRegions.map((region) => (
          <Tag
            key={`region-${region}`}
            label={region}
            variant="blue"
            onRemove={onRemoveRegion ? () => onRemoveRegion(region) : undefined}
            className="text-xs border border-[#BDD9FF]"
          />
        ))}
        {selected.map((tz) => (
          <Tag
            key={tz}
            label={tz}
            variant="blue"
            onRemove={() => onRemove(tz)}
            className="text-xs border border-[#BDD9FF]"
          />
        ))}
      </div>

      <div className={`relative ${isOpen ? 'z-20' : ''}`}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full text-left py-[11px] pl-3.5 pr-9 rounded-lg border-[1.5px] text-sm font-normal bg-white cursor-pointer transition-[border-color] duration-150 truncate outline-none ${ddBtnBorder} ${
            hasSelection ? 'text-[#1A1A1A]' : 'text-[#ADADAD]'
          }`}
          style={{
            backgroundImage: CHEVRON_SVG,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {buttonLabel}
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-[3px] left-0 right-0 rounded-lg border-[1.5px] border-[#E6E6E6] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)] max-h-[340px] overflow-hidden flex flex-col">
            <input
              type="text"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search timezones..."
              className="w-full px-3.5 py-2.5 border-0 border-b border-[#E6E6E6] text-[13px] text-[#1A1A1A] bg-[#F7F7F7] outline-none placeholder:text-[#ADADAD]"
            />
            <div className="overflow-y-auto custom-scrollbar max-h-[300px]">
              {filteredGroups.map((grp, idx) => (
                <div key={grp.label}>
                  {idx > 0 ? (
                    <div className="h-px bg-[#E6E6E6] my-1" />
                  ) : null}
                  <div className="px-3.5 pt-2 pb-0.5 text-[11px] font-medium text-[#ADADAD] uppercase tracking-[0.6px]">
                    {grp.label}
                  </div>
                  {grp.options.map((opt) => {
                    const isSel = selected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (!isSel) onAdd(opt.value);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm leading-snug transition-colors duration-100 ${
                          isSel
                            ? 'bg-[#EBF6FF] text-[#0047CC] font-medium cursor-default'
                            : 'text-[#1A1A1A] hover:bg-[#F7F7F7] cursor-pointer'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <p className="py-4 px-3.5 text-sm text-[#808080] italic text-center">
                  No matching timezones found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimezoneMultiSelect;
