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
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3 -mt-1">
        <div className="divide-y divide-slate-200/60">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-[13px] py-1.5">
              <span className="text-slate-600">{row.label}</span>
              <span
                className={`tabular-nums shrink-0 text-right ${
                  row.value === 'None'
                    ? 'text-slate-400 font-normal'
                    : row.charge
                    ? 'font-semibold text-[#0047CC]'
                    : 'font-medium text-slate-800'
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm pt-2.5 mt-2 border-t border-slate-200">
          <span className="font-semibold text-slate-900">New total escrow after top-up</span>
          <span className="font-semibold tabular-nums text-slate-900 text-right">
            {formatUsd(recalc.newEscrow)}
          </span>
        </div>
      </div>
    </ContentCard>
  );
};

export default VaultEscrowAdjustmentCard;
