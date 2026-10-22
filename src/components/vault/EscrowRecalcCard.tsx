import React from 'react';
import { InfoIcon } from '../common/Icons';
import type { EscrowRecalcResult } from '../../types/vaultEdit';
import { formatUsd } from '../../utils/vaultEscrow';

interface EscrowRecalcCardProps {
  recalc: EscrowRecalcResult;
  originalMidpoint?: number;
}

const EscrowRecalcCard: React.FC<EscrowRecalcCardProps> = ({
  recalc,
  originalMidpoint = 0,
}) => {
  const adj = recalc.adjustment;
  let adjLabel = 'No adjustment';
  let adjClass = 'text-slate-800';
  if (adj > 0) {
    adjLabel = `+${formatUsd(adj)} top-up required`;
    adjClass = 'text-[#0047CC] font-semibold';
  } else if (adj < 0) {
    adjLabel = `${formatUsd(adj)} refund to wallet`;
    adjClass = 'text-emerald-700 font-semibold';
  }

  const rows = [
    { label: 'Original midpoint', value: formatUsd(originalMidpoint || recalc.originalEscrow / (recalc.positions * 0.15) || 0) },
    { label: 'New midpoint', value: formatUsd(recalc.newMidpoint) },
    { label: 'Positions', value: `${recalc.positions} ${recalc.positions === 1 ? 'position' : 'positions'}` },
    { label: 'Fee rate (locked at submission)', value: '15% / 10% LMIC' },
    { label: 'Original escrow', value: formatUsd(recalc.originalEscrow) },
    { label: 'New escrow required', value: formatUsd(recalc.newEscrow) },
    {
      label: 'Adjustment (fires within 24hr of edit confirmed)',
      value: adjLabel,
      valueClass: adjClass,
      bold: true,
    },
  ];

  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 mt-3">
      <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
        <InfoIcon size={16} className="text-[#0047CC] shrink-0" strokeWidth={2} />
        Escrow recalculation triggered
      </div>
      <div className="divide-y divide-blue-200/50">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-1.5 text-[13px] ${
              index === rows.length - 1 ? 'pt-2 font-semibold text-sm' : ''
            }`}
          >
            <span className="text-slate-600 font-medium">{row.label}</span>
            <span className={`tabular-nums ${row.valueClass ?? 'text-slate-800 font-medium'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EscrowRecalcCard;
