import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showPasswordToggle?: boolean;
  error?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  showPasswordToggle = false,
  error = false,
  helperText = '',
  className = '',
  autoComplete = 'off',
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
        <input 
          type={actualType}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 sm:py-3.5 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'} transition-all placeholder:text-gray-400 ${className}`}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.208-2.208l-3.84-3.84m0 0a4.488 4.488 0 01-6.364-6.364m6.364 6.364l-6.364-6.364" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
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
