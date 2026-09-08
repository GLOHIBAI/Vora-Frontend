/**
 * Utility to reliably resolve the candidate's real First Name and Initials.
 * Prioritizes actual candidate names from localStorage, profile, and auth context
 * over raw email prefixes (e.g. 'keunnapiddoho-6332').
 */

export const isEmailLike = (val: unknown): boolean => {
  if (!val || typeof val !== 'string') return false;
  const str = val.trim();
  if (str.includes('@')) return true;
  // Patterns like 'name-1234' generated from temporary emails
  if (/^[a-z0-9._%+-]+-[0-9]{3,}$/i.test(str)) return true;
  return false;
};

export const cleanName = (val: unknown): string => {
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
    const cleaned = cleanName(preferredUser.firstName);
    if (cleaned) {
      try {
        localStorage.setItem('candidate_first_name', cleaned);
      } catch {}
      return cleaned;
    }
  }

  // 2. Check fullName / name property
  const fullName = preferredUser?.fullName || preferredUser?.name;
  if (fullName && !isEmailLike(fullName)) {
    const first = fullName.trim().split(/\s+/)[0];
    if (first && !isEmailLike(first)) {
      const cleaned = cleanName(first);
      if (cleaned) {
        try {
          localStorage.setItem('candidate_first_name', cleaned);
        } catch {}
        return cleaned;
      }
    }
  }

  // 3. Deep check in localStorage
  try {
    // a. direct candidate_first_name or user_first_name keys
    const directKeys = ['candidate_first_name', 'user_first_name', 'talent_first_name', 'firstName'];
    for (const key of directKeys) {
      const raw = localStorage.getItem(key);
      if (raw && !isEmailLike(raw)) {
        const cleaned = cleanName(raw);
        if (cleaned) return cleaned;
      }
    }

    // b. vora_user
    const voraUserRaw = localStorage.getItem('vora_user');
    if (voraUserRaw) {
      const voraUser = JSON.parse(voraUserRaw);
      if (voraUser?.firstName && !isEmailLike(voraUser.firstName)) {
        const cleaned = cleanName(voraUser.firstName);
        if (cleaned) return cleaned;
      }
      if (voraUser?.fullName && !isEmailLike(voraUser.fullName)) {
        const first = voraUser.fullName.trim().split(/\s+/)[0];
        if (first && !isEmailLike(first)) {
          const cleaned = cleanName(first);
          if (cleaned) return cleaned;
        }
      }
    }

    // c. talent_profile or user_profile or vora_talent_profile
    const profileKeys = ['talent_profile', 'user_profile', 'vora_talent_profile', 'talent_onboarding_fields'];
    for (const key of profileKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const fn = parsed?.firstName || parsed?.fields?.firstName || parsed?.profile?.firstName;
          if (fn && !isEmailLike(fn)) {
            const cleaned = cleanName(fn);
            if (cleaned) return cleaned;
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  } catch (err) {
    console.warn('Error accessing localStorage for candidate name:', err);
  }

  // 4. Fallback: only use preferredUser.firstName if it is NOT email-like
  if (preferredUser?.firstName && !isEmailLike(preferredUser.firstName)) {
    const cleaned = cleanName(preferredUser.firstName);
    if (cleaned) return cleaned;
  }

  return fallback;
};

export const getCandidateInitials = (
  preferredUser?: { firstName?: string; lastName?: string; email?: string } | null,
  fallback = 'AO',
): string => {
  const firstName = getCandidateFirstName(preferredUser, '');
  const rawLastName = preferredUser?.lastName || '';
  const lastName = !isEmailLike(rawLastName) ? rawLastName : '';

  if (firstName && !isEmailLike(firstName) && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName && !isEmailLike(firstName) && firstName.length >= 2) {
    return firstName.substring(0, 2).toUpperCase();
  }
  if (firstName && !isEmailLike(firstName)) {
    return firstName[0].toUpperCase();
  }
  if (preferredUser?.email) {
    const prefix = preferredUser.email.split('@')[0];
    if (prefix && prefix.length >= 2) {
      return prefix.substring(0, 2).toUpperCase();
    }
  }
  return fallback;
};
