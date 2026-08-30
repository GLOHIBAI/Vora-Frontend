/**
 * Utility to reliably resolve the candidate's real First Name and Initials.
 * Prioritizes actual candidate names from localStorage, profile, and auth context
 * over raw email prefixes (e.g. 'keunnapiddoho-6332').
 */

const isEmailLike = (val: unknown): boolean => {
  if (!val || typeof val !== 'string') return false;
  const str = val.trim();
  if (str.includes('@')) return true;
  // Patterns like 'name-1234' generated from temporary emails
  if (/^[a-z0-9._%+-]+-[0-9]{3,}$/i.test(str)) return true;
  return false;
};

const cleanName = (val: unknown): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed || isEmailLike(trimmed)) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const getCandidateFirstName = (
  preferredUser?: { firstName?: string; name?: string; fullName?: string; email?: string } | null,
  fallback = 'there',
): string => {
  // 1. Check direct firstName if not an email string
  if (preferredUser?.firstName && !isEmailLike(preferredUser.firstName)) {
    return cleanName(preferredUser.firstName);
  }

  // 2. Check fullName / name property
  const fullName = preferredUser?.fullName || preferredUser?.name;
  if (fullName && !isEmailLike(fullName)) {
    const first = fullName.trim().split(/\s+/)[0];
    if (first && !isEmailLike(first)) return cleanName(first);
  }

  // 3. Deep check in localStorage
  try {
    // a. vora_user
    const voraUserRaw = localStorage.getItem('vora_user');
    if (voraUserRaw) {
      const voraUser = JSON.parse(voraUserRaw);
      if (voraUser?.firstName && !isEmailLike(voraUser.firstName)) {
        return cleanName(voraUser.firstName);
      }
      if (voraUser?.fullName && !isEmailLike(voraUser.fullName)) {
        const first = voraUser.fullName.trim().split(/\s+/)[0];
        if (first && !isEmailLike(first)) return cleanName(first);
      }
    }

    // b. talent_profile or user_profile or vora_talent_profile
    const profileKeys = ['talent_profile', 'user_profile', 'vora_talent_profile', 'talent_onboarding_fields'];
    for (const key of profileKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const fn = parsed?.firstName || parsed?.fields?.firstName || parsed?.profile?.firstName;
          if (fn && !isEmailLike(fn)) return cleanName(fn);
        } catch {
          // ignore parsing error
        }
      }
    }

    // c. direct string keys
    const directKeys = ['user_first_name', 'talent_first_name', 'firstName', 'candidate_first_name'];
    for (const key of directKeys) {
      const raw = localStorage.getItem(key);
      if (raw && !isEmailLike(raw)) return cleanName(raw);
    }
  } catch (err) {
    console.warn('Error accessing localStorage for candidate name:', err);
  }

  // 4. Fallback to preferredUser.firstName or email prefix if no real name exists anywhere
  if (preferredUser?.firstName && preferredUser.firstName.trim().length > 0) {
    return cleanName(preferredUser.firstName) || preferredUser.firstName;
  }

  if (preferredUser?.email) {
    const emailPrefix = preferredUser.email.split('@')[0];
    if (emailPrefix) return emailPrefix;
  }

  return fallback;
};

export const getCandidateInitials = (
  preferredUser?: { firstName?: string; lastName?: string; email?: string } | null,
  fallback = 'AO',
): string => {
  const firstName = getCandidateFirstName(preferredUser, '');
  const lastName = preferredUser?.lastName || '';

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName && firstName.length >= 2) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (preferredUser?.email) {
    const prefix = preferredUser.email.split('@')[0];
    return prefix.substring(0, 2).toUpperCase();
  }
  return fallback;
};
