import React from 'react';

import type { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  pill = true,
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-blue text-white hover:bg-brand-blue-hover",
    secondary: "bg-[#767b91] text-white hover:bg-[#64697c]",
    outline: "border border-border-default text-text-secondary hover:bg-gray-50",
    social: "border border-border-default rounded-xl font-semibold text-text-secondary hover:bg-gray-50 py-3.5 px-4"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const shapeStyle = pill ? "rounded-full" : "rounded-lg";
  const paddingStyle = variant === 'social' ? "" : "py-4";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${shapeStyle} ${paddingStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
