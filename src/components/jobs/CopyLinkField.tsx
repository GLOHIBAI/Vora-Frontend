import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckIcon } from '../common/Icons';

interface CopyLinkFieldProps {
  url: string;
  className?: string;
  inputAriaLabel?: string;
}

export const CopyLinkField: React.FC<CopyLinkFieldProps> = ({
  url,
  className = '',
  inputAriaLabel = 'Course public link',
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'manual'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCopyState('idle');
  }, [url]);

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(url);
      setCopyState('success');
      toast.success('Link copied to clipboard!');
      window.setTimeout(() => setCopyState('idle'), 2200);
    } catch {
      // Clipboard blocked or unsupported
      setCopyState('manual');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      toast('Press Ctrl+C to copy', { icon: '📋' });
      window.setTimeout(() => setCopyState('idle'), 4000);
    }
  }, [url]);

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2.5 ${className}`}>
      {/* Screen-reader live region for copy announcements */}
      <div className="sr-only" aria-live="polite">
        {copyState === 'success' ? 'Link copied to clipboard.' : ''}
      </div>

      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          readOnly
          value={url}
          onClick={handleSelectAll}
          onFocus={handleSelectAll}
          title={url}
          className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50/80 hover:bg-slate-50 focus:bg-white focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 outline-hidden font-mono truncate transition-all cursor-pointer select-all"
          aria-label={inputAriaLabel}
        />
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`h-11 shrink-0 px-5 rounded-xl text-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${
          copyState === 'success'
            ? 'bg-[#0039A6] hover:bg-[#0039A6] text-white focus:ring-[#0047CC]'
            : copyState === 'manual'
            ? 'bg-slate-700 text-white focus:ring-slate-500'
            : 'bg-[#0047CC] hover:bg-[#0039A6] text-white focus:ring-[#0047CC]'
        }`}
      >
        {copyState === 'success' ? (
          <>
            <CheckIcon size={15} strokeWidth={2.5} />
            <span>Copied</span>
          </>
        ) : copyState === 'manual' ? (
          <span>Press Ctrl+C</span>
        ) : (
          <span>Copy link</span>
        )}
      </button>
    </div>
  );
};

export default CopyLinkField;
