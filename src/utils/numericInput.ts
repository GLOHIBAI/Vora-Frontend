import type { KeyboardEvent } from 'react';

export const TIME_COMMITMENT_PLACEHOLDER = 'e.g. 20hrs per week / Full-time';
export const TIME_COMMITMENT_SUFFIX = 'hrs per week/full time';

/** Strip to digits only (no negatives, decimals, or letters). */
export function digitsOnly(value: string, maxLength = 8): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/** Positive integers for counts (positions, places, etc.). */
export function sanitizePositiveIntInput(value: string, max = 999): string {
  const digits = digitsOnly(value);
  if (!digits) return '';
  const n = parseInt(digits, 10);
  if (Number.isNaN(n) || n < 1) return '';
  return String(Math.min(n, max));
}

/** Positive decimals for amounts (salary, rates). */
export function sanitizePositiveDecimalInput(value: string): string {
  let cleaned = value.replace(/[^0-9.]/g, '');
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    cleaned =
      cleaned.slice(0, dotIndex + 1) +
      cleaned.slice(dotIndex + 1).replace(/\./g, '');
  }
  if (cleaned.startsWith('.')) cleaned = `0${cleaned}`;
  return cleaned;
}

export function formatTimeCommitmentDisplay(digits: string): string {
  if (!digits) return '';
  return `${digits} ${TIME_COMMITMENT_SUFFIX}`;
}

/** Max hours in a calendar week — used to cap time-commitment input. */
export const MAX_HOURS_PER_WEEK = 168;

export function parseTimeCommitmentDigits(value: string): string {
  const digits = digitsOnly(value, 3);
  if (!digits) return '';
  const n = parseInt(digits, 10);
  if (Number.isNaN(n)) return '';
  if (n > MAX_HOURS_PER_WEEK) return String(MAX_HOURS_PER_WEEK);
  return digits;
}

export function formatTimeCommitmentForApi(digits: string): string {
  if (!digits) return '';
  return formatTimeCommitmentDisplay(digits);
}

export function validateTimeCommitmentHours(digits: string): string {
  if (!digits?.trim()) return 'Time commitment is required';
  const n = parseInt(digits, 10);
  if (Number.isNaN(n) || n < 1) return 'Enter at least 1 hour';
  if (n > MAX_HOURS_PER_WEEK) return `Enter ${MAX_HOURS_PER_WEEK} hours or fewer per week`;
  return '';
}

export function blockNegativeNumberKeys(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}
