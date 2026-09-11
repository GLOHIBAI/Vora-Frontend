import React from 'react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  variant?: 'plain' | 'dashed';
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'primary-outline' | 'link' | 'social';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  variant = 'plain',
  action,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  const isDashed = variant === 'dashed';

  const containerClasses = isDashed
    ? `flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[#E6E6E6] bg-[#F7F7F7]/60 ${
        compact ? 'py-8 px-4' : 'py-12 px-6 sm:py-16 sm:px-8'
      }`
    : `flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 sm:py-20 px-6'
      }`;

  const iconClasses = isDashed
    ? `flex items-center justify-center rounded-2xl bg-white border border-[#E6E6E6] text-[#0047CC] shadow-xs ${
        compact ? 'w-10 h-10 mb-3' : 'w-14 h-14 mb-4'
      }`
    : `flex items-center justify-center rounded-full bg-blue-50 text-[#0047CC] ${
        compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'
      }`;

  return (
    <div className={`${containerClasses} ${className}`}>
      {Icon && (
        <div className={iconClasses}>
          <Icon size={compact ? 20 : 24} />
        </div>
      )}

      <p className={`${compact ? 'text-sm' : 'text-[15px]'} font-medium text-gray-900 tracking-tight`}>
        {title}
      </p>

      {description && (
        <p className={`${compact ? 'text-xs' : 'text-[13px]'} font-medium text-gray-400 mt-1 max-w-sm leading-relaxed`}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              {action.icon && <action.icon size={14} />}
              {action.loading ? 'Loading…' : action.label}
            </Button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="text-xs font-semibold text-[#808080] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
