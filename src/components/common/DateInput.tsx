import React, { useEffect, useId, useRef, useState } from 'react';
import DatePicker from './DatePicker';
import { CalendarIcon } from './Icons';
import { formatDateDisplay } from '../../utils/date';

export interface DateInputProps {
  label?: string | React.ReactNode;
  labelClassName?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  className?: string;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  labelClassName = '',
  value = '',
  onChange,
  error = false,
  helperText = '',
  className = '',
  icon: Icon = CalendarIcon,
  iconPosition = 'left',
  min,
  max,
  placeholder = 'dd/mm/yyyy',
  disabled = false,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const emitChange = (next: string) => {
    onChange?.({
      target: { value: next },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const showLabel = label !== '' && label !== undefined && label !== null;

  return (
    <div className="w-full" ref={containerRef}>
      {showLabel && (
        <label className={labelClassName || "block text-sm font-medium text-text-secondary mb-2.5"}>{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? listboxId : undefined}
          className={`w-full flex items-center justify-between ${
            iconPosition === 'right' ? 'pl-4 pr-11' : 'pl-12 pr-4'
          } py-3 sm:py-3.5 rounded-lg border text-left transition-all cursor-pointer ${
            error
              ? 'border-red-500 bg-white'
              : 'border-border-default bg-white hover:border-[#0047CC]'
          } focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        >
          <span className={(value && formatDateDisplay(value)) ? 'text-[#1A1A1A] font-medium' : 'text-gray-400'}>
            {(value && formatDateDisplay(value)) || placeholder}
          </span>
        </button>

        <div className={`absolute inset-y-0 ${iconPosition === 'right' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-gray-400`}>
          <Icon size={18} />
        </div>

        {open && !disabled && (
          <div id={listboxId} className="absolute left-0 top-full mt-1.5 z-[950] w-auto">
            <DatePicker
              value={value}
              onChange={(next) => {
                emitChange(next);
                if (next) setOpen(false);
              }}
              min={min}
              max={max}
            />
          </div>
        )}
      </div>

      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{helperText}</p>
      )}
      {required && !value && !error && (
        <span className="sr-only">Required</span>
      )}
    </div>
  );
};

export default DateInput;
