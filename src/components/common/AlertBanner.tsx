import React from 'react';
import { AlertTriangleIcon, InfoIcon, CloseIcon } from './Icons';

type AlertBannerVariant = 'amber' | 'green' | 'red' | 'blue' | 'info';

interface AlertBannerProps {
  children: React.ReactNode;
  variant?: AlertBannerVariant;
  className?: string;
  onDismiss?: () => void;
  /** When false, omits the leading icon (e.g. inline callouts inside cards). */
  showIcon?: boolean;
}

const variantStyles: Record<AlertBannerVariant, string> = {
  amber: 'bg-blue-50 border-blue-200 text-slate-700',
  green: 'bg-emerald-50 border-emerald-200 text-slate-700',
  red: 'bg-red-50 border-red-200 text-slate-700',
  blue: 'bg-blue-50 border-blue-200 text-slate-700',
  info: 'bg-blue-50 border-blue-200 text-slate-700',
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  children,
  variant = 'blue',
  className = '',
  onDismiss,
  showIcon = true,
}) => {
  const isInfoOrBlue = variant === 'blue' || variant === 'info' || variant === 'amber';

  return (
    <div
      className={`border rounded-xl px-4 py-3.5 flex gap-3 items-start text-sm ${variantStyles[variant]} ${className}`}
    >
      {showIcon && (
        isInfoOrBlue ? (
          <InfoIcon size={18} className="shrink-0 mt-0.5 text-[#0047CC]" strokeWidth={2} />
        ) : (
          <AlertTriangleIcon
            size={18}
            className={`shrink-0 mt-0.5 ${
              variant === 'green'
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
            strokeWidth={2}
          />
        )
      )}
      <div className="flex-1 text-sm leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900">
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 p-0.5 cursor-pointer shrink-0"
          aria-label="Dismiss"
        >
          <CloseIcon size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
