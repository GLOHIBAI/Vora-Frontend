import React from 'react';
import ContentCard from '../common/ContentCard';
import type { EscrowRecalcResult } from '../../types/vaultEdit';
import { formatUsd } from '../../utils/vaultEscrow';

interface VaultEscrowAdjustmentCardProps {
  title?: string;
  recalc: EscrowRecalcResult;
  originalPositions: number;
  originalMidpoint: number;
  feeRate?: number;
}

const VaultEscrowAdjustmentCard: React.FC<VaultEscrowAdjustmentCardProps> = ({
  title = 'Escrow adjustment (fires within 24hr of review confirmation)',
  recalc,
  originalPositions,
  originalMidpoint,
  feeRate = 0.15,
}) => {
  const ratePct = `${Math.round(feeRate * 100)}%`;
  const topUp = recalc.adjustment > 0 ? recalc.adjustment : 0;

  const rows = [
    {
      label: `Original escrow (${originalPositions} positions × ${formatUsd(originalMidpoint)} midpoint × ${ratePct})`,
      value: formatUsd(recalc.originalEscrow),
    },
    { label: 'New midpoint', value: formatUsd(recalc.newMidpoint) },
    { label: 'New positions count', value: String(recalc.positions) },
    {
      label: `New escrow required (${recalc.positions} × ${formatUsd(recalc.newMidpoint)} × ${ratePct})`,
      value: formatUsd(recalc.newEscrow),
    },
    {
      label: 'Top-up charge (to payment method on file)',
      value: topUp > 0 ? formatUsd(topUp) : 'None',
      charge: topUp > 0,
    },
  ];

  return (
    <ContentCard title={title}>
      <div className="bg-[#EEFBEE] border-[1.5px] border-[#85E585] rounded-lg px-3.5 py-3 -mt-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-[13px] py-1">
            <span className="text-[#808080]">{row.label}</span>
            <span
              className={`font-bold shrink-0 ${
                row.charge ? 'text-[#D97706]' : 'text-[#1A1A1A]'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-3 text-[13px] pt-2 mt-1 border-t border-[#85E585]">
          <span className="font-bold text-[#135813]">New total escrow after top-up</span>
          <span className="font-bold text-[#135813]">{formatUsd(recalc.newEscrow)}</span>
        </div>
      </div>
    </ContentCard>
  );
};

export default VaultEscrowAdjustmentCard;
