/**
 * Media utility to resolve S3 keys to public / CDN URLs.
 * Handles full URLs, relative paths, and S3 object keys.
 */

const MEDIA_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_S3_BASE_URL) ||
  ''
).replace(/\/+$/, '');

export const DEFAULT_COURSE_BANNER = '';

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

  // Cloudinary relative key or version detection
  if (cleanKey.startsWith('image/upload/') || cleanKey.startsWith('video/upload/')) {
    return `https://res.cloudinary.com/mllr6ffc/${cleanKey}`;
  }
  if (/^v\d{6,}\//.test(cleanKey)) {
    return `https://res.cloudinary.com/mllr6ffc/upload/${cleanKey}`;
  }

  // Local backend uploads folder path
  if (cleanKey.startsWith('uploads/')) {
    return `/${cleanKey}`;
  }

  // Fallback to S3 bucket pattern
  return `https://vora-media.s3.amazonaws.com/${cleanKey}`;
}
