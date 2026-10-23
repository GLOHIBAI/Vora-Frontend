import type { EscrowRecalcResult } from '../types/vaultEdit';

export const formatUsd = (amount: number): string =>
  `USD ${Math.round(Math.abs(amount)).toLocaleString('en-US')}`;

export const calcEscrowRecalc = (
  salMin: number,
  salMax: number,
  positions: number,
  originalEscrow: number,
  feeRate = 0.15,
  originalMidpoint?: number,
  originalPositions?: number
): EscrowRecalcResult => {
  // Defensive guard: if feeRate > 1 (e.g. a salary midpoint like 1950 passed in 5th position),
  // the caller inverted feeRate with originalMidpoint!
  let resolvedFeeRate = feeRate;
  let resolvedOrigMid = originalMidpoint;
  let resolvedOrigPos = originalPositions;

  if (feeRate > 1) {
    resolvedOrigMid = feeRate;
    resolvedOrigPos = typeof originalMidpoint === 'number' ? originalMidpoint : positions;
    resolvedFeeRate = 0.15;
  }

  const mid = salMin && salMax ? Math.round((salMin + salMax) / 2) : Math.round(salMin || salMax || 0);
  const newEscrow = Math.round(mid * positions * resolvedFeeRate);
  const origMid = resolvedOrigMid !== undefined ? Math.round(resolvedOrigMid) : mid;
  const origPos = resolvedOrigPos !== undefined ? resolvedOrigPos : positions;

  return {
    originalMidpoint: origMid,
    newMidpoint: mid,
    positions,
    originalEscrow: Math.round(originalEscrow),
    newEscrow,
    adjustment: newEscrow - Math.round(originalEscrow),
  };
};
