import React from 'react';
import { CardTitle } from './Typography';

interface FormSectionCardProps {
  title: string;
  changed?: boolean;
  changedLabel?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSectionCard: React.FC<FormSectionCardProps> = ({
  title,
  changed = false,
  changedLabel = 'Changed',
  children,
  className = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl px-7 py-6 mb-4 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <CardTitle as="h2" className="text-base">{title}</CardTitle>
      {changed && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
          {changedLabel}
        </span>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default FormSectionCard;
