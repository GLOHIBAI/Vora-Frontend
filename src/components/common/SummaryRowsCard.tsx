import React from 'react';
import { CardTitle } from './Typography';
import type { SummaryRow } from '../../types/vault';

interface SummaryRowsCardProps {
  title: string;
  rows: SummaryRow[];
  className?: string;
}

const SummaryRowsCard: React.FC<SummaryRowsCardProps> = ({ title, rows, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 mb-5 ${className}`}>
    <CardTitle as="h2" className="text-base font-semibold text-slate-900 mb-3">{title}</CardTitle>
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 text-sm py-2.5"
        >
          <span className="text-slate-600 font-medium shrink-0">{row.label}</span>
          <span
            className={`text-right font-medium tabular-nums ${
              row.value === 'Not scheduled' || row.value === '--'
                ? 'text-slate-400 font-normal'
                : 'text-slate-900'
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
