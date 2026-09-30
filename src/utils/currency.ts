/**
 * Currency utility helpers for formatting currency symbols and amounts consistently across Vora.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  CHF: 'CHF',
  AED: 'AED',
  SAR: 'SAR',
  QAR: 'QAR',
  SGD: 'S$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  BRL: 'R$',
  // Common symbols mapped to themselves
  '₦': '₦',
  '$': '$',
  '€': '€',
  '£': '£',
  '¥': '¥',
};

/**
 * Returns the standard display symbol for a given currency code.
 * Defaults to '₦' if the currency is NGN, '$' for USD, etc.
 */
export const getCurrencySymbol = (currency?: string | null): string => {
  if (!currency) return '₦';
  const clean = currency.trim();
  const upper = clean.toUpperCase();
  return CURRENCY_SYMBOLS[upper] || CURRENCY_SYMBOLS[clean] || clean;
};

/**
 * Regex matching common period strings like:
 * "annually", "yearly", "monthly", "weekly", "hourly", "daily",
 * "per year", "per month", "per week", "per hour", "per day",
 * "/yr", "/year", "/mo", "/month", "/wk", "/week", "/hr", "/hour"
 */
const PERIOD_REGEX = /\b(?:annually|yearly|monthly|weekly|hourly|daily)\b|\b(?:per\s+(?:year|annum|month|week|hour|day))\b|\/(?:yr|yr\.|year|mo|mo\.|month|wk|wk\.|week|hr|hr\.|hour|day)\b/i;

const normalizePeriod = (match: string): string => {
  const m = match.toLowerCase().trim();
  if (/year|yr|annu/i.test(m)) return 'annually';
  if (/month|mo/i.test(m)) return 'monthly';
  if (/week|wk/i.test(m)) return 'weekly';
  if (/hour|hr/i.test(m)) return 'hourly';
  if (/day/i.test(m)) return 'daily';
  return m;
};

/**
 * Replaces known 3-letter currency codes (e.g. NGN, USD, GBP, EUR) with their standard symbol.
 */
export const formatCurrencyString = (text?: string | null): string => {
  if (!text) return '';

  let formatted = text;

  // Replace currency codes at word boundaries (e.g. NGN 600,000 -> ₦600,000)
  Object.entries(CURRENCY_SYMBOLS).forEach(([code, symbol]) => {
    if (code.length >= 3 && code === code.toUpperCase()) {
      // Handle "NGN 600,000" or "NGN600,000"
      const codeRegex = new RegExp(`\\b${code}\\b\\s*`, 'g');
      formatted = formatted.replace(codeRegex, symbol);
    }
  });

  // Ensure clean spacing around hyphens/dashes for ranges (e.g., 600,000–900,000 -> 600,000 – 900,000)
  formatted = formatted.replace(/(\d[\d,]*)\s*[-–—]\s*(\d[\d,]*)/g, '$1 – $2');

  return formatted.trim();
};

export interface ParsedCompensation {
  amount: string;
  period?: string;
}

/**
 * Parses a compensation string (e.g. "NGN 600,000–900,000 annually" or "$200/mo")
 * into a separated clean currency amount (e.g. "₦600,000 – ₦900,000") and a period (e.g. "annually").
 */
export const parseCompensation = (raw?: string | null): ParsedCompensation => {
  if (!raw || !raw.trim()) {
    return { amount: 'Competitive' };
  }

  const str = raw.trim();

  // Extract period if present
  let period: string | undefined = undefined;
  const periodMatch = str.match(PERIOD_REGEX);
  if (periodMatch) {
    period = normalizePeriod(periodMatch[0]);
  }

  // Strip period from the amount string
  let amountStr = str.replace(PERIOD_REGEX, '').trim();

  // Strip trailing slashes or hyphens left by removing period
  amountStr = amountStr.replace(/[\/\-\s]+$/, '').trim();

  if (!amountStr) {
    return { amount: 'Competitive', period };
  }

  // Format currency codes to symbols
  amountStr = formatCurrencyString(amountStr);

  // If amount is a range like "₦600,000 – 900,000", distribute currency symbol to both sides: "₦600,000 – ₦900,000"
  const rangeWithSymbolMatch = amountStr.match(/^([₦$€£¥₹]|CA\$|A\$|GH₵|KSh\s*|R\s*)([\d,]+(?:\.\d+)?(?:k|m)?)\s*[–—\-]\s*(?:([₦$€£¥₹]|CA\$|A\$|GH₵|KSh\s*|R\s*))?([\d,]+(?:\.\d+)?(?:k|m)?)$/i);
  if (rangeWithSymbolMatch) {
    const symbol = rangeWithSymbolMatch[1];
    const minVal = rangeWithSymbolMatch[2];
    const secondSymbol = rangeWithSymbolMatch[3] || symbol;
    const maxVal = rangeWithSymbolMatch[4];
    amountStr = `${symbol}${minVal} – ${secondSymbol}${maxVal}`;
  }

  return {
    amount: amountStr,
    period,
  };
};

/**
 * Formats a numeric min/max salary with currency and optional period.
 */
export const formatJobSalary = (
  min?: number | null,
  max?: number | null,
  currency?: string | null,
  period?: string | null
): { amount: string; period?: string } => {
  if (!min && !max) {
    return { amount: 'Competitive', period: period || undefined };
  }

  const sym = getCurrencySymbol(currency || 'NGN');

  if (min && max) {
    return {
      amount: `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`,
      period: period || undefined,
    };
  }

  if (min) {
    return {
      amount: `From ${sym}${min.toLocaleString()}`,
      period: period || undefined,
    };
  }

  return {
    amount: `Up to ${sym}${max!.toLocaleString()}`,
    period: period || undefined,
  };
};
