import { DEFAULT_PUBLIC_ROLE_LANDING, ROLE_LANDING_STORAGE_PREFIX } from '../constants/roleLanding';
import type { PublicRoleLandingData } from '../types/roleLanding';

export interface RoleLandingBuildInput {
  slug: string;
  roleTitle?: string;
  workFormat?: string;
  location?: string;
  positions?: string | number;
  summary?: string;
  roleGoal?: string;
  coreResponsibilities?: string;
  companyName?: string;
}

export const slugifyRoleTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'role';

export const buildRoleSlug = (roleTitle: string): string => {
  const suffix = `${new Date().getFullYear()}${String(Math.floor(Math.random() * 900) + 100)}`;
  return `${slugifyRoleTitle(roleTitle)}-${suffix}`;
};

export const buildRoleShareUrl = (slug: string): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/role/${slug}`;
  }
  return `/role/${slug}`;
};

const formatWorkFormatLabel = (workFormat: string, location: string): string => {
  const loc = location.trim() || 'Location TBC';
  if (workFormat === 'Hybrid') return `Hybrid · ${loc}`;
  if (workFormat === 'Fully onsite') return `On-site · ${loc}`;
  if (workFormat.startsWith('Remote')) return `Remote · ${loc}`;
  if (workFormat === 'Flexible / candidate preference') return `Flexible · ${loc}`;
  return `${workFormat} · ${loc}`;
};

const splitLines = (text: string): string[] =>
  text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

export const buildRoleLandingData = (input: RoleLandingBuildInput): PublicRoleLandingData => {
  const roleTitle = input.roleTitle?.trim() || DEFAULT_PUBLIC_ROLE_LANDING.roleTitle;
  const location = input.location?.trim() || '';
  const positions = parseInt(String(input.positions ?? '1'), 10) || 1;
  const formatLocationLabel = formatWorkFormatLabel(
    input.workFormat || 'Hybrid',
    location,
  );

  const responsibilities = input.coreResponsibilities
    ? splitLines(input.coreResponsibilities)
    : DEFAULT_PUBLIC_ROLE_LANDING.responsibilities;

  const aboutRole =
    input.summary?.trim() ||
    input.roleGoal?.trim() ||
    DEFAULT_PUBLIC_ROLE_LANDING.aboutRole;

  const overviewRows = DEFAULT_PUBLIC_ROLE_LANDING.overviewRows.map((row) => {
    if (row.label === 'Location' && location) return { ...row, value: location };
    if (row.label === 'Format') return { ...row, value: formatLocationLabel };
    if (row.label === 'Positions') {
      return {
        ...row,
        value: `${positions} available`,
      };
    }
    return row;
  });

  return {
    ...DEFAULT_PUBLIC_ROLE_LANDING,
    slug: input.slug,
    roleTitle,
    formatLocationLabel,
    companyName: input.companyName?.trim() || DEFAULT_PUBLIC_ROLE_LANDING.companyName,
    companyLocation: location || DEFAULT_PUBLIC_ROLE_LANDING.companyLocation,
    compensationLine: `Compensation TBC · ${positions} position${positions === 1 ? '' : 's'} available`,
    metaItems: [
      input.workFormat || 'Full-time',
      formatLocationLabel,
      'Posted today',
    ],
    aboutRole,
    responsibilities: responsibilities.length > 0 ? responsibilities : DEFAULT_PUBLIC_ROLE_LANDING.responsibilities,
    overviewRows,
  };
};

export const saveRoleLanding = (data: PublicRoleLandingData): void => {
  sessionStorage.setItem(`${ROLE_LANDING_STORAGE_PREFIX}${data.slug}`, JSON.stringify(data));
};

export const loadRoleLanding = (slug: string): PublicRoleLandingData | null => {
  try {
    const raw = sessionStorage.getItem(`${ROLE_LANDING_STORAGE_PREFIX}${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as PublicRoleLandingData;
  } catch {
    return null;
  }
};

const humanizeSlug = (slug: string): string =>
  slug
    .replace(/-\d{7}$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getRoleLandingForSlug = (slug: string): PublicRoleLandingData => {
  const saved = loadRoleLanding(slug);
  if (saved) return saved;
  return {
    ...DEFAULT_PUBLIC_ROLE_LANDING,
    slug,
    roleTitle: humanizeSlug(slug),
  };
};

const COUNTRY_MAP: Record<string, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  GB: 'United Kingdom',
  NG: 'Nigeria',
  ZA: 'South Africa',
  KE: 'Kenya',
  GH: 'Ghana',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
};

export const mapApiResponseToRoleData = (slug: string, apiData: any): PublicRoleLandingData => {
  const companyName = typeof apiData.employer === 'string' 
    ? apiData.employer 
    : apiData.employer?.organisationName || apiData.employer?.companyName || 'Unknown Employer';
    
  const companyInitials = companyName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  let companyCountry = typeof apiData.employer !== 'string' ? apiData.employer?.country : null;
  if (companyCountry) {
    const trimmed = companyCountry.trim().toUpperCase();
    companyCountry = COUNTRY_MAP[trimmed] || companyCountry.trim();
  }

  const metaItems = [];
  
  if (apiData.publishedAt) {
    const published = new Date(apiData.publishedAt);
    const today = new Date();
    published.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - published.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    let postedStr = 'Posted today';
    if (diffDays === 1) {
      postedStr = 'Posted 1 day ago';
    } else if (diffDays > 1) {
      postedStr = `Posted ${diffDays} days ago`;
    }
    
    if (apiData.closingDate) {
      const closing = new Date(apiData.closingDate);
      closing.setHours(0, 0, 0, 0);
      const diffClosing = closing.getTime() - today.getTime();
      const diffClosingDays = Math.round(diffClosing / (1000 * 60 * 60 * 24));
      if (diffClosingDays > 0) {
        postedStr += ` · Expires in ${diffClosingDays} days`;
      }
    }
    
    metaItems.push(postedStr);
  }
  if (apiData.roleType) metaItems.push(apiData.roleType);
  if (apiData.locationBadge) metaItems.push(apiData.locationBadge);
  if (apiData.employmentLevel) {
    let level = apiData.employmentLevel as string;
    if (!level.toLowerCase().includes('level')) {
      level = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() + ' level';
    }
    metaItems.push(level);
  }

  const formatCamelCase = (str: string) => {
    const spaced = str.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const overviewRows = Object.entries(apiData.overview || {})
    .filter(([_, val]) => val !== null && val !== undefined && val !== '')
    .map(([key, val]) => ({
      label: formatCamelCase(key),
      value: String(val),
    }));

  const eligibilityRows = Object.entries(apiData.eligibility || {})
    .filter(([_, val]) => {
      if (val === null || val === undefined || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    })
    .map(([key, val]) => {
      const valueStr = Array.isArray(val) ? val.join(', ') : String(val);
      return { label: formatCamelCase(key), value: valueStr };
    });

  const parseRequirements = (reqs: any): string[] => {
    if (!reqs) return [];
    if (Array.isArray(reqs)) return reqs;
    if (typeof reqs === 'string') return reqs.split('\n').map(s => s.trim()).filter(Boolean);
    
    const result: string[] = [];
    Object.entries(reqs).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') return;
      if (Array.isArray(val) && val.length === 0) return;
      
      const label = formatCamelCase(key);
      const valueStr = Array.isArray(val) ? val.join(', ') : String(val);
      result.push(`${label}: ${valueStr}`);
    });
    return result;
  };

  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const formatRoleTitle = (title: string) => {
    return title.replace(/-/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

    // Helper to build range string from numeric min/max
    const buildRangeFromNumbers = (min: number | undefined, max: number | undefined, currency: string): string => {
      if (!min && !max) return '';
      const currencyPrefix = currency === 'USD' ? '$' : (currency === 'GBP' ? '£' : (currency === 'EUR' ? '€' : (currency === 'NGN' ? '₦' : currency)));
      const prefix = /^[A-Z]{2,4}$/i.test(currencyPrefix) ? `${currencyPrefix} ` : currencyPrefix;
      if (min && max && min !== max) {
        return `${prefix}${min.toLocaleString()} - ${prefix}${max.toLocaleString()}`;
      }
      return `${prefix}${(min || max)!.toLocaleString()}`;
    };

    // Check all possible locations where the backend might send salary data
    const currency = apiData.compensationCurrency || apiData.currency || apiData.posting?.compensationCurrency || 'USD';
    const minFromRoot = apiData.salaryMin ?? apiData.posting?.salaryMin;
    const maxFromRoot = apiData.salaryMax ?? apiData.posting?.salaryMax;

    let compLine = '';
    if (minFromRoot || maxFromRoot) {
      // Explicit numeric min/max: always build the range display
      compLine = buildRangeFromNumbers(minFromRoot, maxFromRoot, currency);
    } else {
      // Fall back to the pre-formatted string(s) from the API
      // Prefer overview.salary (may already contain a range like "₦600,000 - ₦800,000")
      // over compensationSummary (which sometimes only contains the max)
      compLine = apiData.overview?.salary || apiData.compensationSummary || '';
    }
    
    return {
      slug,
      companyName: companyName || '',
      companyLocation: companyCountry || '',
      companyInitials: companyInitials || '',
      roleTitle: formatRoleTitle(apiData.roleTitle || ''),
      formatLocationLabel: apiData.locationBadge || '',
      compensationLine: compLine + (apiData.positionsAvailable ? ` · ${apiData.positionsAvailable} position${apiData.positionsAvailable === 1 ? '' : 's'} available` : ''),
    metaItems,
    primaryTags: ensureArray(apiData.tags),
    secondaryTags: [],
    aboutRole: apiData.about || '',
    responsibilities: ensureArray(apiData.responsibilities),
    requirements: parseRequirements(apiData.requirements),
    overviewRows,
    eligibilityRows,
    assessmentItems: ensureArray(apiData.assessmentItems),
  };
};
