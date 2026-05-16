import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

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
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-text-secondary mb-2.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
            <Icon size={18} />
          </div>
        )}
        <input 
          type={actualType}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-12 pr-4' : 'px-4'} py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'} transition-all placeholder:text-gray-400 ${className}`}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer group"
          >
            {showPassword ? (
              <EyeOffIcon size={22} className="group-hover:scale-110 transition-transform" />
            ) : (
              <EyeIcon size={22} className="group-hover:scale-110 transition-transform" />
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
