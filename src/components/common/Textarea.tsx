import React from 'react';
import ScrollArea from './ScrollArea';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string | React.ReactNode;
  error?: boolean;
  helperText?: string;
}

const splitTextareaClasses = (className: string) => {
  const scroll: string[] = [];
  const field: string[] = [];

  className
    .split(/\s+/)
    .filter(Boolean)
    .forEach((token) => {
      if (/^(h-|max-h-|min-h-|resize-)/.test(token)) {
        scroll.push(token);
      } else {
        field.push(token);
      }
    });

  return {
    scrollClass: scroll.join(' ').replace(/\bresize-\S+/g, '').trim(),
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
  const { scrollClass, fieldClass } = splitTextareaClasses(className);
  const hasExplicitHeight = /\b(h-|max-h-)/.test(scrollClass);
  const rowCount = typeof rows === 'number' ? rows : parseInt(String(rows), 10) || 4;

  const scrollStyle: React.CSSProperties | undefined = hasExplicitHeight
    ? undefined
    : { maxHeight: `calc(1.5rem * ${rowCount} + 2rem)` };

  const fieldStyle: React.CSSProperties = {
    minHeight: `calc(1.5rem * ${rowCount} + 1.5rem)`,
    ...style,
  };

  const borderClass = error
    ? 'border-red-500 bg-red-50'
    : 'border-border-default bg-white';
  const focusRingClass = error
    ? 'focus-within:ring-red-500/20 focus-within:border-red-500'
    : 'focus-within:ring-brand-blue/20 focus-within:border-brand-blue';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-secondary mb-2.5">
        {label}
      </label>
      <div
        className={`rounded-lg border overflow-hidden transition-all focus-within:outline-none focus-within:ring-2 ${borderClass} ${focusRingClass}`}
      >
        <ScrollArea
          className={scrollClass}
          style={scrollStyle}
        >
          <textarea
            rows={rows}
            style={fieldStyle}
            autoComplete={autoComplete}
            className={`block w-full px-4 py-3 border-0 bg-transparent resize-none overflow-hidden focus:outline-none placeholder:text-gray-400 text-[14px] font-medium text-gray-800 leading-relaxed ${fieldClass}`}
            {...props}
          />
        </ScrollArea>
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
