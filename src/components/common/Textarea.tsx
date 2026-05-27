import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string | React.ReactNode;
  error?: boolean;
  helperText?: string;
}

const splitTextareaClasses = (className: string) => {
  const size: string[] = [];
  const field: string[] = [];

  className
    .split(/\s+/)
    .filter(Boolean)
    .forEach((token) => {
      if (/^(h-|max-h-|min-h-|resize-)/.test(token)) {
        size.push(token);
      } else {
        field.push(token);
      }
    });

  return {
    sizeClass: size.join(' '),
    fieldClass: field.join(' '),
  };
};

const Textarea: React.FC<TextareaProps> = ({
  label,
  error = false,
  helperText = '',
  className = '',
  rows = 4,
  style,
  autoComplete = 'off',
  ...props
}) => {
  const { sizeClass, fieldClass } = splitTextareaClasses(className);
  const hasFixedHeight = /\b(h-|max-h-)/.test(sizeClass);
  const rowCount = typeof rows === 'number' ? rows : parseInt(String(rows), 10) || 4;

  const borderClass = error
    ? 'border-red-500 bg-red-50'
    : 'border-border-default bg-white';
  const focusRingClass = error
    ? 'focus-within:ring-red-500/20 focus-within:border-red-500'
    : 'focus-within:ring-brand-blue/20 focus-within:border-brand-blue';

  const fieldClasses = [
    'block w-full px-4 py-3 border-0 bg-transparent resize-none focus:outline-none',
    'placeholder:text-gray-400 text-[14px] font-medium text-gray-800 leading-relaxed',
    'custom-scrollbar',
    hasFixedHeight
      ? `${sizeClass} overflow-y-auto`
      : `min-h-[calc(1.5rem*${rowCount}+1.5rem)] overflow-y-auto max-h-[calc(1.5rem*${rowCount}+2rem)]`,
    fieldClass,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>
      <div
        className={`rounded-lg border overflow-hidden transition-all focus-within:outline-none focus-within:ring-2 ${borderClass} ${focusRingClass}`}
      >
        <textarea
          rows={rows}
          style={style}
          autoComplete={autoComplete}
          className={fieldClasses}
          {...props}
        />
      </div>
      {error && helperText && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
