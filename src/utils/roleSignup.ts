export const getRoleSignupPath = (slug: string): string =>
  `/role/${encodeURIComponent(slug)}/signup`;

export const ROLE_APPLY_SLUG_KEY = 'voraRoleApplySlug';

export const saveRoleApplySlug = (slug: string): void => {
  sessionStorage.setItem(ROLE_APPLY_SLUG_KEY, slug);
};

export const loadRoleApplySlug = (): string | null =>
  sessionStorage.getItem(ROLE_APPLY_SLUG_KEY);

export const clearRoleApplySlug = (): void => {
  sessionStorage.removeItem(ROLE_APPLY_SLUG_KEY);
};

export const extractSalaryShort = (compensationLine: string, overviewSalary?: string): string => {
  const texts = [compensationLine.split('·')[0].trim(), overviewSalary?.trim()].filter(Boolean) as string[];
  
  const formatAmount = (raw: string) => {
    const currencyMatch = raw.match(/^([A-Z]{2,4}|[$£€₦])/i) || raw.match(/([A-Z]{2,4}|[$£€₦])/i);
    const currencyPrefix = currencyMatch ? currencyMatch[1] : '$';
    const prefix = /[A-Z]{2,4}/i.test(currencyPrefix) ? `${currencyPrefix.toUpperCase()} ` : currencyPrefix;

    const nums = raw.match(/[\d,]+/g);
    if (!nums || nums.length === 0) return raw;
    const cleanedNums = nums.map(n => Number(n.replace(/,/g, '')));
    if (cleanedNums.length === 1) {
      return `${prefix}${cleanedNums[0].toLocaleString('en-US')}`;
    }
    return `${prefix}${cleanedNums[0].toLocaleString('en-US')} - ${prefix}${cleanedNums[1].toLocaleString('en-US')}`;
  };

  let bestMatch = '';
  // Match any 2-4 letter currency code (like NGN, USD) or standard symbols ($, £, €, ₦)
  const salaryRegex = /(?:[A-Z]{2,4}|[$£€₦])?\s*[\d,]+(?:\s*(?:[-–—]|to|and|up to)\s*(?:[A-Z]{2,4}|[$£€₦])?\s*[\d,]+)?/i;

  for (const text of texts) {
    const matchAmount = text.match(salaryRegex);
    if (matchAmount) {
      if (/(?:[-–—]|to|and)/i.test(matchAmount[0])) {
        return formatAmount(matchAmount[0]);
      }
      if (!bestMatch) bestMatch = matchAmount[0];
    }
  }
  
  if (bestMatch) return formatAmount(bestMatch);
  
  const fallback = texts[0] || '';
  return fallback
    .replace(/\s+annually/i, '')
    .replace(/\s+yearly/i, '')
    .replace(/\s+monthly/i, '')
    .replace(/\s+per month/i, '')
    .replace(/\s+per year/i, '')
    .replace(/\s+\/yr/i, '')
    .replace(/\s+\/year/i, '')
    .replace(/\s+\/mo/i, '')
    .replace(/\s+\/month/i, '')
    .trim();
};
