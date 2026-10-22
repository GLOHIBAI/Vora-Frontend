import React from 'react';

interface TrackedFieldProps {
  changed?: boolean;
  changeMessage?: string;
  children: React.ReactNode;
}

/** Wraps a form control and shows a clean blue indicator when edited. */
const TrackedField: React.FC<TrackedFieldProps> = ({ changed, children }) => (
  <div className="relative">
    {children}
  </div>
);

export const changedInputClass = (changed?: boolean) =>
  changed ? 'border-[#0047CC]! bg-[#F0F7FF]/40! focus:border-[#0047CC]! focus:ring-1 focus:ring-[#0047CC]!' : '';

export default TrackedField;
