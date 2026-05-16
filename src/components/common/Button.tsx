import React from 'react';

import type { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  pill = true,
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 relative min-h-[52px]";
  
  const variants = {
    primary: "bg-brand-blue text-white hover:bg-brand-blue-hover disabled:bg-brand-blue/70",
    secondary: "bg-[#767b91] text-white hover:bg-[#64697c] disabled:bg-[#767b91]/70",
    outline: "border border-border-default text-text-secondary hover:bg-gray-50 disabled:bg-gray-50",
    social: "border border-border-default rounded-xl font-semibold text-text-secondary hover:bg-gray-50 py-3.5 px-4 disabled:opacity-70"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const shapeStyle = pill ? "rounded-full" : "rounded-lg";
  const paddingStyle = variant === 'social' ? "" : "py-4";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${shapeStyle} ${paddingStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
