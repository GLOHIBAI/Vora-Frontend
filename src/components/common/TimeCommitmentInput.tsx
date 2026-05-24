import React from 'react';
import {
  MAX_HOURS_PER_WEEK,
  TIME_COMMITMENT_PLACEHOLDER,
  TIME_COMMITMENT_SUFFIX,
  blockNegativeNumberKeys,
  parseTimeCommitmentDigits,
} from '../../utils/numericInput';

interface TimeCommitmentInputProps {
  label: string | React.ReactNode;
  value: string;
  onChange: (digits: string) => void;
  error?: boolean;
  helperText?: string;
  className?: string;
}

const inputBaseClass =
  'border-0 outline-none bg-transparent p-0 text-[14px] font-medium text-[#1A1A1A] placeholder:text-gray-400 transition-colors duration-200';

const TimeCommitmentInput: React.FC<TimeCommitmentInputProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText = '',
  className = '',
}) => {
  const hasValue = Boolean(value);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>
      <div
        className={`group flex items-center w-full px-4 py-3 sm:py-3.5 rounded-lg border ${
          error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'
        } focus-within:outline-none focus-within:ring-2 ${
          error
            ? 'focus-within:ring-red-500/20 focus-within:border-red-500'
            : 'focus-within:ring-brand-blue/20 focus-within:border-brand-blue'
        } transition-all ${hasValue ? 'justify-between' : ''} ${className}`}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={hasValue ? undefined : TIME_COMMITMENT_PLACEHOLDER}
          value={value}
          onChange={(e) => onChange(parseTimeCommitmentDigits(e.target.value))}
          onKeyDown={blockNegativeNumberKeys}
          className={`${inputBaseClass} ${
            hasValue
              ? 'w-[4ch] min-w-[2ch] max-w-[4ch] shrink-0 text-left'
              : 'flex-1 min-w-0 w-full'
          }`}
          aria-describedby="time-commitment-hint"
        />
        {hasValue ? (
          <span
            id="time-commitment-suffix"
            className="text-[14px] font-medium text-[#1A1A1A] pointer-events-none select-none whitespace-nowrap shrink-0 text-right"
            aria-hidden
          >
            {TIME_COMMITMENT_SUFFIX}
          </span>
        ) : null}
      </div>
      {error && helperText ? (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{helperText}</p>
      ) : (
        <p id="time-commitment-hint" className="mt-1.5 text-xs text-[#808080] ml-1">
          Maximum {MAX_HOURS_PER_WEEK} hours per week
        </p>
      )}
    </div>
  );
};

export default TimeCommitmentInput;
