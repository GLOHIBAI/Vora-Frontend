import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string | React.ReactNode;
  error?: boolean;
  helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error = false, 
  helperText = '', 
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>
      <textarea 
        className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 bg-red-50' : 'border-border-default bg-white'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-brand-blue/20 focus:border-brand-blue'} transition-all placeholder:text-gray-400 resize-y text-[14px] font-medium text-gray-800 ${className}`}
        {...props}
      />
      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
