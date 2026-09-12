export const MAX_CREDENTIAL_CHANGES = 3;

/**
 * Retrieves the number of password changes for the current user.
 */
export const getPasswordChangeCount = (
  userIdentifier?: string | null,
  serverCount?: number | null
): number => {
  let localCount = 0;
  if (userIdentifier) {
    try {
      const val = localStorage.getItem(`vora_pw_changes_${userIdentifier.toLowerCase()}`);
      if (val) localCount = parseInt(val, 10) || 0;
    } catch {}
  }
  return Math.max(localCount, typeof serverCount === 'number' ? serverCount : 0);
};

/**
 * Increments the password change count for the given user.
 */
export const incrementPasswordChangeCount = (userIdentifier?: string | null): number => {
  if (!userIdentifier) return 1;
  const current = getPasswordChangeCount(userIdentifier);
  const next = current + 1;
  try {
    localStorage.setItem(`vora_pw_changes_${userIdentifier.toLowerCase()}`, String(next));
  } catch {}
  return next;
};

/**
 * Checks if the user is allowed to change their password.
 */
export const canUserChangePassword = (
  userIdentifier?: string | null,
  serverCount?: number | null
): boolean => {
  return getPasswordChangeCount(userIdentifier, serverCount) < MAX_CREDENTIAL_CHANGES;
};

/**
 * Returns the number of password changes remaining for the user.
 */
export const getPasswordChangesRemaining = (
  userIdentifier?: string | null,
  serverCount?: number | null
): number => {
  return Math.max(0, MAX_CREDENTIAL_CHANGES - getPasswordChangeCount(userIdentifier, serverCount));
};

/**
 * Retrieves the number of email changes for the current user.
 */
export const getEmailChangeCount = (
  userIdentifier?: string | null,
  serverCount?: number | null
): number => {
  let localCount = 0;
  if (userIdentifier) {
    try {
      const val = localStorage.getItem(`vora_email_changes_${userIdentifier.toLowerCase()}`);
      if (val) localCount = parseInt(val, 10) || 0;
    } catch {}
  }
  return Math.max(localCount, typeof serverCount === 'number' ? serverCount : 0);
};

/**
 * Increments the email change count for the given user.
 */
export const incrementEmailChangeCount = (userIdentifier?: string | null): number => {
  if (!userIdentifier) return 1;
  const current = getEmailChangeCount(userIdentifier);
  const next = current + 1;
  try {
    localStorage.setItem(`vora_email_changes_${userIdentifier.toLowerCase()}`, String(next));
  } catch {}
  return next;
};

/**
 * Checks if the user is allowed to change their email.
 */
export const canUserChangeEmail = (
  userIdentifier?: string | null,
  serverCount?: number | null
): boolean => {
  return getEmailChangeCount(userIdentifier, serverCount) < MAX_CREDENTIAL_CHANGES;
};

/**
 * Returns the number of email changes remaining for the user.
 */
export const getEmailChangesRemaining = (
  userIdentifier?: string | null,
  serverCount?: number | null
): number => {
  return Math.max(0, MAX_CREDENTIAL_CHANGES - getEmailChangeCount(userIdentifier, serverCount));
};
