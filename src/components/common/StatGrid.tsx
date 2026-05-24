import React from 'react';
import type { StatItem } from '../../types/vault';

interface StatGridProps {
  items: StatItem[];
  columns?: 2 | 3;
  className?: string;
}

const StatGrid: React.FC<StatGridProps> = ({ items, columns = 3, className = '' }) => (
  <div
    className={`grid gap-3 mb-4 ${
      columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
    } ${className}`}
  >
    {items.map((item) => (
      <div key={item.label} className="bg-[#F7F7F7] rounded-lg p-3.5 text-center">
        <div className={`text-[22px] font-semibold leading-none ${item.valueClassName ?? 'text-[#0047CC]'}`}>
          {item.value}
        </div>
        <p className="text-[11px] text-[#808080] mt-1 leading-snug">{item.label}</p>
      </div>
    ))}
  </div>
);

export default StatGrid;
