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
  const mid = salMin && salMax ? Math.round((salMin + salMax) / 2) : Math.round(salMin || salMax || 0);
  const newEscrow = Math.round(mid * positions * feeRate);
  const origMid = originalMidpoint !== undefined ? Math.round(originalMidpoint) : mid;
  const origPos = originalPositions !== undefined ? originalPositions : positions;

  return {
    originalMidpoint: origMid,
    newMidpoint: mid,
    positions,
    originalEscrow: Math.round(originalEscrow),
    newEscrow,
    adjustment: newEscrow - Math.round(originalEscrow),
  };
};
