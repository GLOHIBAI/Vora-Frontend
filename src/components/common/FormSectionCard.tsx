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
  changedLabel = 'Edited',
  children,
  className = '',
}) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl px-7 py-6 mb-4 ${className}`}>
    <div className="flex items-center gap-2.5 mb-4">
      <CardTitle as="h2" className="text-base text-slate-900 font-semibold">{title}</CardTitle>
      {changed && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FF] text-[#0047CC] border border-[#BDD9FF]">
          {changedLabel}
        </span>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default FormSectionCard;
