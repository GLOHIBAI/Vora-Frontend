import React from 'react';

import type { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  pill = true,
  isLoading = false,
  loadingLabel = 'Processing...',
  className = '',
  disabled,
  size = 'lg',
  ...props 
}) => {
  const isLink = variant === 'link';
  
  const sizeStyles = {
    sm: 'min-h-[32px] sm:min-h-[36px] px-3 sm:px-3.5 py-1 sm:py-1.5 text-[12px]',
    md: 'min-h-[40px] sm:min-h-[48px] px-3.5 sm:px-5 py-2 sm:py-2.5 text-[14px]',
    lg: 'min-h-[44px] sm:min-h-[52px] px-4 sm:px-6 py-2.5 sm:py-3.5 text-[15px]'
  };

  const getOverrideStyles = (sizeClass: string, customClass: string) => {
    if (!customClass) return sizeClass;
    const tokens = sizeClass.split(' ');
    return tokens
      .filter((token) => {
        if (token.includes('min-h-') && (customClass.includes('min-h-') || customClass.includes('sm:min-h-') || customClass.includes('md:min-h-') || customClass.includes('lg:min-h-'))) return false;
        if (token.includes('px-') && (customClass.includes('px-') || customClass.includes('sm:px-') || customClass.includes('md:px-') || customClass.includes('lg:px-'))) return false;
        if (token.includes('py-') && (customClass.includes('py-') || customClass.includes('sm:py-') || customClass.includes('md:py-') || customClass.includes('lg:py-'))) return false;
        if (token.includes('text-') && (customClass.includes('text-') || customClass.includes('sm:text-') || customClass.includes('md:text-') || customClass.includes('lg:text-') || customClass.includes('text-['))) return false;
        return true;
      })
      .join(' ');
  };

  const resolvedSizeStyles = getOverrideStyles(sizeStyles[size], className);

  const baseStyles = `font-medium transition-all flex items-center justify-center gap-2 relative whitespace-nowrap ${
    isLink ? 'cursor-pointer' : `shadow-sm active:scale-[0.98] cursor-pointer ${resolvedSizeStyles}`
  }`;
  
  const variants = {
    primary: "bg-brand-blue text-white hover:bg-brand-blue-hover disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed disabled:shadow-none",
    secondary: "bg-[#767b91] text-white hover:bg-[#64697c] disabled:bg-[#E6E6E6] disabled:text-[#ADADAD] disabled:cursor-not-allowed",
    outline: "border border-border-default text-text-secondary hover:bg-gray-50 disabled:bg-[#F7F7F7] disabled:text-[#ADADAD] disabled:border-[#E6E6E6] disabled:cursor-not-allowed",
    'primary-outline': "border-[1.5px] border-brand-blue text-brand-blue hover:bg-[#EBF6FF] disabled:bg-[#F7F7F7] disabled:text-[#ADADAD] disabled:border-[#E6E6E6] disabled:cursor-not-allowed",
    social: "border border-border-default rounded-xl font-medium text-text-secondary hover:bg-gray-50 py-2.5 sm:py-3.5 px-3.5 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed",
    link: "bg-transparent p-0 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
  };

  const widthStyle = fullWidth && !isLink ? "w-full" : "";
  const shapeStyle = isLink ? "" : (pill ? "rounded-full" : "rounded-lg");

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${shapeStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>{loadingLabel}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
