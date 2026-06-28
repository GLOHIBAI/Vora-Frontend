const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isRolePostingUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_RE.test(value);

/** Return the first valid role posting UUID from candidates. */
export const pickRolePostingId = (...candidates: unknown[]): string | undefined => {
  for (const candidate of candidates) {
    if (isRolePostingUuid(candidate)) return candidate;
  }
  return undefined;
};

export const rolePostingIdStorageKey = (roleSlug: string): string =>
  `vora_role_posting_id_${roleSlug}`;

export const persistRolePostingId = (roleSlug: string, rolePostingId: string): void => {
  if (!roleSlug || !isRolePostingUuid(rolePostingId)) return;
  localStorage.setItem(rolePostingIdStorageKey(roleSlug), rolePostingId);
};

export const readStoredRolePostingId = (roleSlug: string): string | undefined => {
  if (!roleSlug) return undefined;
  const stored = localStorage.getItem(rolePostingIdStorageKey(roleSlug));
  return isRolePostingUuid(stored) ? stored : undefined;
};

const unwrapEnvelope = (response: unknown): Record<string, unknown> | null => {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const data = root.data ?? response;
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
};

/** Extract UUID from GET /talent/role/{roleLink} or similar public role payloads. */
export const extractRolePostingIdFromPublicRole = (response: unknown): string | undefined => {
  const payload = unwrapEnvelope(response);
  if (!payload) return undefined;

  const rolePosting = payload.rolePosting as Record<string, unknown> | undefined;
  return pickRolePostingId(payload.rolePostingId, payload.id, rolePosting?.id);
};

/** Extract UUID from GET /talent/role/{roleLink}/match READY payload. */
export const extractRolePostingIdFromMatchPayload = (response: unknown): string | undefined => {
  const payload = unwrapEnvelope(response);
  if (!payload) return undefined;

  const rolePosting = payload.rolePosting as Record<string, unknown> | undefined;
  return pickRolePostingId(payload.rolePostingId, rolePosting?.id);
};
