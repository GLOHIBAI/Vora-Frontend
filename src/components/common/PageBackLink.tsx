import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from './Icons';

interface PageBackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const PageBackLink: React.FC<PageBackLinkProps> = ({ to, children, className = '' }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-1.5 text-sm font-bold text-[#4A4A4A] hover:text-[#0047CC] transition-colors mb-6 ${className}`}
  >
    <ChevronLeftIcon size={16} strokeWidth={2.5} />
    {children}
  </Link>
);

export default PageBackLink;
