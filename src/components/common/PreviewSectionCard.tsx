import React from 'react';
import { CardTitle } from './Typography';

interface PreviewSectionCardProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  className?: string;
}

const PreviewSectionCard: React.FC<PreviewSectionCardProps> = ({
  title,
  onEdit,
  children,
  className = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl overflow-hidden mb-4 ${className}`}>
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E6E6E6]">
      <CardTitle>{title}</CardTitle>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E6E6] px-3 py-1.5 text-[12px] font-semibold text-[#4A4A4A] hover:border-[#ADADAD] transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

export default PreviewSectionCard;
