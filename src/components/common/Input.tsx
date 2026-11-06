import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, AlertTriangleIcon } from './Icons';
import DateInput from './DateInput';

import type { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  showPasswordToggle = false,
  error = false,
  helperText = '',
  className = '',
  autoComplete = 'off',
  icon: Icon,
  value,
  onChange,
  min,
  max,
  placeholder,
  disabled,
  required,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (type === 'date') {
    return (
      <DateInput
        label={label}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        error={error}
        helperText={helperText}
        className={className}
        icon={Icon}
        min={min != null ? String(min) : undefined}
        max={max != null ? String(max) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    );
  }

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  const showLabel = Boolean(label);

  return (
    <div className="w-full">
      {showLabel && (
        <label className="block text-sm font-medium text-slate-800 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input 
          type={actualType}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full ${Icon ? 'pl-11' : 'pl-3.5'} ${isPassword && showPasswordToggle ? 'pr-11' : 'pr-3.5'} h-11 sm:h-12 rounded-xl border ${error ? 'border-red-500 bg-white text-slate-900' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-900'} focus:outline-hidden focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-[#0047CC]/20 focus:border-[#0047CC]'} transition-all placeholder:text-slate-400 text-sm sm:text-base disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
          >
            {showPassword ? (
              <EyeOffIcon size={18} className="group-hover:scale-110 transition-transform" />
            ) : (
              <EyeIcon size={18} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
        )}
      </div>
      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-600 font-medium ml-0.5 flex items-center gap-1.5">
          <AlertTriangleIcon size={13} className="shrink-0 text-red-500" />
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
