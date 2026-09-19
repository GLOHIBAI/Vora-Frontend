import React from 'react';

const SIZE_MAP: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
};

interface SpinnerProps {
  size?: number | string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 20, className = '' }) => {
  const resolvedSize = typeof size === 'number' 
    ? size 
    : (SIZE_MAP[size] ?? (Number.parseInt(size, 10) || 20));

  const hasTextColor = className.includes('text-');
  const colorClass = hasTextColor ? '' : 'text-[#0047CC]';

  return (
    <div
      className={`border-2 border-blue-100 border-t-current rounded-full animate-spin shrink-0 ${colorClass} ${className}`}
      style={{ width: resolvedSize, height: resolvedSize }}
      aria-hidden
    />
  );
};

export default Spinner;
