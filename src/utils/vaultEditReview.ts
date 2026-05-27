import {
  DEFAULT_VAULT_EDIT_ORIGINAL,
  VAULT_EDIT_ALLOWANCE,
  VAULT_FEE_RATE,
  VAULT_ORIGINAL_ESCROW,
} from '../constants/vaultEdit';
import type { EscrowRecalcResult, VaultEditChange, VaultEditOriginal, VaultEditReviewData } from '../types/vaultEdit';
import { calcEscrowRecalc } from './vaultEscrow';

export const VAULT_EDIT_REVIEW_STORAGE_KEY = 'vora_vault_edit_review';

const RECALIBRATE_FIELDS = new Set([
  'Core responsibilities',
  'Years of experience',
  'Skills required',
  'Minimum qualification',
]);

const formatSalaryRange = (min: string, max: string) => {
  const lo = Number(min);
  const hi = Number(max);
  const mid = lo && hi ? (lo + hi) / 2 : lo || hi;
  return {
    range: `USD ${lo.toLocaleString('en-US')} to ${hi.toLocaleString('en-US')}`,
    midpoint: mid,
  };
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const buildChangesFromEdit = (
  original: VaultEditOriginal,
  form: VaultEditOriginal
): VaultEditChange[] => {
  const list: VaultEditChange[] = [];
  const changed = (key: keyof VaultEditOriginal) => form[key] !== original[key];

  const push = (field: string, oldValue: string, newValue: string) => {
    list.push({
      field,
      oldValue,
      newValue,
      recalibrate: RECALIBRATE_FIELDS.has(field),
    });
  };

  if (changed('roleTitle')) {
    push('Role title', original.roleTitle, form.roleTitle);
  }
  if (changed('location') || changed('workFormat')) {
    const oldLoc = original.location;
    const newLoc =
      changed('workFormat') && form.workFormat.toLowerCase().includes('remote')
        ? `${form.location} (remote days permitted)`
        : form.location;
    push('Work location', oldLoc, newLoc);
  }
  if (changed('goLiveDate')) {
    push('Go-live date', formatDate(original.goLiveDate), formatDate(form.goLiveDate));
  }
  if (changed('positions')) {
    push(
      'Available positions',
      `${original.positions} position${original.positions === '1' ? '' : 's'}`,
      `${form.positions} position${form.positions === '1' ? '' : 's'}`
    );
  }
  if (changed('salMin') || changed('salMax')) {
    const oldSal = formatSalaryRange(original.salMin, original.salMax);
    const newSal = formatSalaryRange(form.salMin, form.salMax);
    push(
      'Salary range',
      oldSal.range,
      `${newSal.range} (midpoint USD ${newSal.midpoint.toLocaleString('en-US')})`
    );
  }
  if (changed('responsibilities')) {
    const truncate = (s: string) => (s.length > 48 ? `${s.slice(0, 48)}…` : s);
    push('Core responsibilities', truncate(original.responsibilities), form.responsibilities);
  }
  if (changed('minQualification')) {
    push('Min. qualification', original.minQualification, form.minQualification);
  }
  if (changed('experienceYears')) {
    push('Years of experience', original.experienceYears, form.experienceYears);
  }
  if (changed('skills')) {
    push('Skills required', original.skills, form.skills);
  }

  return list;
};

export const buildVaultEditReviewData = (
  form: VaultEditOriginal,
  original: VaultEditOriginal = DEFAULT_VAULT_EDIT_ORIGINAL,
  escrow?: EscrowRecalcResult
): VaultEditReviewData => {
  const submittedAt = new Date().toISOString();
  const reviewEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const positions = parseInt(form.positions, 10) || 1;
  const salMin = parseFloat(form.salMin) || 0;
  const salMax = parseFloat(form.salMax) || 0;
  const recalc =
    escrow ??
    calcEscrowRecalc(salMin, salMax, positions, VAULT_ORIGINAL_ESCROW, VAULT_FEE_RATE);

  const origPositions = parseInt(original.positions, 10) || 1;
  const origMid = (parseFloat(original.salMin) + parseFloat(original.salMax)) / 2;

  return {
    roleTitle: form.roleTitle,
    changes: buildChangesFromEdit(original, form),
    submittedAt,
    reviewEndsAt,
    editsUsed: VAULT_EDIT_ALLOWANCE.used + 1,
    editsTotal: VAULT_EDIT_ALLOWANCE.total,
    escrow: recalc,
    originalPositions: origPositions,
    originalMidpoint: origMid,
    feeRate: VAULT_FEE_RATE,
  };
};

export const saveVaultEditReview = (data: VaultEditReviewData): void => {
  try {
    sessionStorage.setItem(VAULT_EDIT_REVIEW_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
};

export const loadVaultEditReview = (): VaultEditReviewData | null => {
  try {
    const raw = sessionStorage.getItem(VAULT_EDIT_REVIEW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultEditReviewData;
  } catch {
    return null;
  }
};

export const getDefaultVaultEditReview = (): VaultEditReviewData => {
  const original = DEFAULT_VAULT_EDIT_ORIGINAL;
  const form: VaultEditOriginal = {
    ...original,
    roleTitle: 'Senior Health Systems Researcher',
    location: 'London, United Kingdom',
    workFormat: 'Hybrid (remote days permitted)',
    positions: '4',
    goLiveDate: '2025-10-01',
    responsibilities:
      'Updated responsibilities — now includes sub-national health financing analysis and budget tracking',
    minQualification: 'Doctoral degree (PhD or equivalent)',
    experienceYears: '8 to 12 years',
    salMin: '75000',
    salMax: '95000',
  };

  const remainingSecs = 41 * 3600 + 23 * 60 + 7;
  const reviewEndsAt = new Date(Date.now() + remainingSecs * 1000).toISOString();
  const submittedAt = new Date(Date.now() - (48 * 3600 - remainingSecs) * 1000).toISOString();

  const data = buildVaultEditReviewData(form, original);
  return {
    ...data,
    submittedAt,
    reviewEndsAt,
    editsUsed: 2,
    changes: buildChangesFromEdit(original, form),
  };
};

export { formatDateTime };
