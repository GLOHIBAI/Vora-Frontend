import React from 'react';
import { CardTitle } from './Typography';
import type { SummaryRow } from '../../types/vault';

interface SummaryRowsCardProps {
  title: string;
  rows: SummaryRow[];
  className?: string;
}

const SummaryRowsCard: React.FC<SummaryRowsCardProps> = ({ title, rows, className = '' }) => (
  <div className={`bg-white border border-[#E6E6E6] rounded-xl p-5 mb-5 ${className}`}>
    <CardTitle as="h2" className="mb-3">{title}</CardTitle>
    <div>
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex justify-between gap-4 text-[13px] py-1.5 ${
            index < rows.length - 1 ? 'border-b border-[#E6E6E6]' : 'pt-2.5 font-semibold text-[15px]'
          }`}
        >
          <span className="text-[#808080] font-medium shrink-0">{row.label}</span>
          <span
            className={`text-right font-bold ${
              row.highlight || index === rows.length - 1 ? 'text-[#0047CC]' : 'text-[#1A1A1A]'
            }`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default SummaryRowsCard;
