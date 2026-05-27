import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from './Icons';

interface PageTopBackBarProps {
  label: string;
  to?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

const backControlClass =
  'flex items-center gap-1.5 text-sm font-bold text-[#4A4A4A] hover:text-[#0047CC] transition-colors cursor-pointer py-4';

/** Full-width white header bar with chevron back — matches Post Job wizard. */
const PageTopBackBar: React.FC<PageTopBackBarProps> = ({
  label,
  to,
  onClick,
  trailing,
  className = '',
}) => {
  const backControl =
    to != null ? (
      <Link to={to} className={backControlClass}>
        <ChevronLeftIcon size={16} strokeWidth={2.5} />
        {label}
      </Link>
    ) : (
      <button type="button" onClick={onClick} className={backControlClass}>
        <ChevronLeftIcon size={16} strokeWidth={2.5} />
        {label}
      </button>
    );

  return (
    <div
      className={`mt-0 lg:mt-4 bg-white border-b border-[#E6E6E6] px-6 md:px-8 flex items-center justify-between gap-3 shrink-0 ${className}`}
    >
      {backControl}
      {trailing}
    </div>
  );
};

export default PageTopBackBar;
