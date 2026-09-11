import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';
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
        <label className="block text-sm font-medium text-text-secondary mt-1 mb-3">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
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
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} ${isPassword && showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-white' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'} transition-all placeholder:text-gray-400 ${className}`}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer group"
          >
            {showPassword ? (
              <EyeOffIcon size={20} className="group-hover:scale-110 transition-transform" />
            ) : (
              <EyeIcon size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
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

export default Input;
