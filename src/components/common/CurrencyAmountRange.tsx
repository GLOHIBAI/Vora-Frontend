import React from 'react';
import CurrencySelect from './CurrencySelect';
import { blockNegativeNumberKeys } from '../../utils/numericInput';
import type { Option, OptionGroup } from '../../types';

const fieldClass =
  'w-full px-3.5 py-3 border focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]';

interface CurrencyAmountRangeProps {
  label: string;
  hint?: string;
  currency: string;
  onCurrencyChange: (value: string) => void;
  currencyGroups?: OptionGroup[];
  currencyOptions?: Option[];
  mode?: 'range' | 'single';
  minValue?: string;
  maxValue?: string;
  singleValue?: string;
  onMinChange?: (value: string) => void;
  onMaxChange?: (value: string) => void;
  onSingleChange?: (value: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  singlePlaceholder?: string;
  minError?: string;
  maxError?: string;
  singleError?: string;
}

const CurrencyAmountRange: React.FC<CurrencyAmountRangeProps> = ({
  label,
  hint,
  currency,
  onCurrencyChange,
  currencyGroups,
  currencyOptions,
  mode = 'range',
  minValue = '',
  maxValue = '',
  singleValue = '',
  onMinChange,
  onMaxChange,
  onSingleChange,
  minPlaceholder = 'Minimum',
  maxPlaceholder = 'Maximum',
  singlePlaceholder = 'Amount',
  minError,
  maxError,
  singleError,
}) => {
  const error = minError || maxError || singleError;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#1A1A1A]">{label}</label>
      {hint ? (
        <p className="text-xs text-[#808080] leading-relaxed">{hint}</p>
      ) : null}

      {mode === 'range' ? (
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(125px,140px)_1fr_auto_1fr] gap-2.5 items-center mt-2.5">
          <CurrencySelect
            value={currency}
            onChange={onCurrencyChange}
            groups={currencyGroups}
            options={currencyOptions}
          />
          <input autoComplete="off"
            type="text"
            inputMode="decimal"
            placeholder={minPlaceholder}
            value={minValue}
            onKeyDown={blockNegativeNumberKeys}
            onChange={(e) => onMinChange?.(e.target.value)}
            className={`${fieldClass} ${minError ? 'border-red-500' : 'border-[#E6E6E6]'}`}
          />
          <div className="text-xs font-medium text-[#808080] text-center px-1 hidden sm:block">
            to
          </div>
          <input autoComplete="off"
            type="text"
            inputMode="decimal"
            placeholder={maxPlaceholder}
            value={maxValue}
            onKeyDown={blockNegativeNumberKeys}
            onChange={(e) => onMaxChange?.(e.target.value)}
            className={`${fieldClass} ${maxError ? 'border-red-500' : 'border-[#E6E6E6]'}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(125px,140px)_1fr] gap-2.5 items-center mt-2.5">
          <CurrencySelect
            value={currency}
            onChange={onCurrencyChange}
            groups={currencyGroups}
            options={currencyOptions}
          />
          <input autoComplete="off"
            type="text"
            inputMode="decimal"
            placeholder={singlePlaceholder}
            value={singleValue}
            onKeyDown={blockNegativeNumberKeys}
            onChange={(e) => onSingleChange?.(e.target.value)}
            className={`${fieldClass} ${singleError ? 'border-red-500' : 'border-[#E6E6E6]'}`}
          />
        </div>
      )}

      {error ? (
        <p className="text-xs text-red-600 font-medium mt-1">{error}</p>
      ) : null}
    </div>
  );
};

export default CurrencyAmountRange;
