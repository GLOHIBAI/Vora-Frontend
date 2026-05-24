import React from 'react';
import { AlertTriangleIcon } from '../common/Icons';
import type { EscrowRecalcResult } from '../../types/vaultEdit';
import { formatUsd } from '../../utils/vaultEscrow';

interface EscrowRecalcCardProps {
  recalc: EscrowRecalcResult;
  originalMidpoint?: number;
}

const EscrowRecalcCard: React.FC<EscrowRecalcCardProps> = ({
  recalc,
  originalMidpoint = 70000,
}) => {
  const adj = recalc.adjustment;
  let adjLabel = 'No adjustment';
  let adjClass = 'text-[#1A1A1A]';
  if (adj > 0) {
    adjLabel = `+${formatUsd(adj)} top-up required`;
    adjClass = 'text-[#1D871D]';
  } else if (adj < 0) {
    adjLabel = `${formatUsd(adj)} refund to wallet`;
    adjClass = 'text-[#DC2626]';
  }

  const rows = [
    { label: 'Original midpoint', value: formatUsd(originalMidpoint) },
    { label: 'New midpoint', value: formatUsd(recalc.newMidpoint) },
    { label: 'Positions', value: `${recalc.positions} position${recalc.positions > 1 ? 's' : ''}` },
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
    <div className="bg-white border-[1.5px] border-[#FDE68A] rounded-[10px] p-4 mt-2">
      <div className="text-[13px] font-semibold text-[#92400E] mb-2.5 flex items-center gap-1.5">
        <AlertTriangleIcon size={13} strokeWidth={2} />
        Escrow recalculation triggered
      </div>
      <div>
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-1.5 text-[13px] ${
              index < rows.length - 1 ? 'border-b border-[#E6E6E6]' : 'pt-2.5 font-semibold text-sm'
            }`}
          >
            <span className="text-[#808080] font-medium">{row.label}</span>
            <span className={`font-medium ${row.valueClass ?? 'text-[#1A1A1A]'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EscrowRecalcCard;
