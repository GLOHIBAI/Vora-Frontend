/**
 * Media utility to resolve S3 keys to public / CDN URLs.
 * Handles full URLs, relative paths, and S3 object keys.
 */

const MEDIA_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_S3_BASE_URL) ||
  ''
).replace(/\/+$/, '');

export const DEFAULT_COURSE_BANNER =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop';

export const DEFAULT_MENTOR_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

/**
 * Converts an S3 key or existing URL into an accessible media URL.
 * If s3Key is empty/null, returns fallback or empty string.
 */
export function getMediaUrl(s3Key?: string | null, fallback?: string): string {
  if (!s3Key || s3Key.trim() === '') {
    return fallback || '';
  }

  const trimmed = s3Key.trim();

  // Already a full URL, relative path, or blob/data URI
  if (/^(https?:|\/\/|data:|blob:|\/)/i.test(trimmed)) {
    return trimmed;
  }

  const cleanKey = trimmed.replace(/^\/+/, '');
  if (MEDIA_BASE_URL) {
    return `${MEDIA_BASE_URL}/${cleanKey}`;
  }

  // Fallback to S3 bucket pattern
  return `https://vora-media.s3.amazonaws.com/${cleanKey}`;
}
