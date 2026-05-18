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
  const isLink = variant === 'link';
  const baseStyles = `font-medium transition-all flex items-center justify-center gap-2 relative ${isLink ? 'cursor-pointer' : 'shadow-sm active:scale-[0.98] cursor-pointer min-h-[52px]'}`;
  
  const variants = {
    primary: "bg-brand-blue text-white hover:bg-brand-blue-hover disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed disabled:shadow-none",
    secondary: "bg-[#767b91] text-white hover:bg-[#64697c] disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed",
    outline: "border border-border-default text-text-secondary hover:bg-gray-50 disabled:bg-[#F7F7F7] disabled:text-[#ADADAD] disabled:border-[#E6E6E6] disabled:cursor-not-allowed",
    social: "border border-border-default rounded-xl font-medium text-text-secondary hover:bg-gray-50 py-3.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed",
    link: "bg-transparent p-0 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const widthStyle = fullWidth && !isLink ? "w-full" : "";
  const shapeStyle = isLink ? "" : (pill ? "rounded-full" : "rounded-lg");
  const paddingStyle = (variant === 'social' || isLink) ? "" : "py-4";

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
