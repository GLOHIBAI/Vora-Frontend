/**
 * Media utility for Vora Courses.
 * Active driver: Cloudinary (NOT AWS S3).
 * Logical keys (thumbnailS3Key, promoVideoS3Key, contentS3Key, photoS3Key)
 * can be demo absolute URLs (e.g. YouTube watch URLs, YouTube thumbnails)
 * or Cloudinary logical storage keys.
 */

const API_BASE = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  '/api/v1'
).replace(/\/+$/, '');

const MEDIA_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEDIA_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_S3_BASE_URL) ||
  ''
).replace(/\/+$/, '');

export const DEFAULT_COURSE_BANNER = '';

export const DEFAULT_MENTOR_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

/**
 * Resolves logical keys for owned storage assets.
 */
export function resolveOwnedStorageUrl(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(data:|blob:)/i.test(trimmed)) return trimmed;

  if (MEDIA_BASE_URL) {
    const cleanKey = trimmed.replace(/^\/+/, '');
    return `${MEDIA_BASE_URL}/${cleanKey}`;
  }

  // Cloudinary direct paths if applicable
  const cleanKey = trimmed.replace(/^\/+/, '');
  if (cleanKey.startsWith('image/upload/') || cleanKey.startsWith('video/upload/')) {
    return `https://res.cloudinary.com/mllr6ffc/${cleanKey}`;
  }
  if (/^v\d{6,}\//.test(cleanKey)) {
    return `https://res.cloudinary.com/mllr6ffc/upload/${cleanKey}`;
  }

  // Backend endpoint for file resolution
  return `${API_BASE}/uploads/file?key=${encodeURIComponent(cleanKey)}`;
}

/**
 * Preferred media display helper (per handoff contract):
 * Backend returns browser-safe CDN URLs — use these in <img> / player (no Bearer needed):
 *   thumbnailUrl, promoVideoUrl, mentor.photoUrl, lesson.contentUrl
 * Keys (thumbnailS3Key etc.) remain for upload/PATCH; do NOT put keys into <img src>
 * and do NOT use /uploads/file?key= for course cards (img tags cannot send JWT → 401).
 */
export function displayMedia(url: string | null | undefined, key?: string | null): string | null {
  if (url && typeof url === 'string' && url.trim()) return url.trim();
  if (key && typeof key === 'string' && /^https?:\/\//i.test(key.trim())) return key.trim();
  return null; // placeholder
}

/**
 * Universal media source resolver for backward compatibility.
 * Required helper per handoff contract:
 *  - Handles null / undefined / empty string -> returns null (never bind into <img src>)
 *  - Handles absolute URLs (https://...) -> returns as is (demo YouTube, images, etc.)
 *  - Handles Cloudinary logical keys -> resolves url
 */
export function mediaSrc(key: string | null | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(data:|blob:)/i.test(trimmed)) return trimmed;
  return resolveOwnedStorageUrl(trimmed);
}

/**
 * Converts a YouTube watch URL or short URL into an embeddable URL.
 * e.g. https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeEmbedUrl(
  url: string | null | undefined,
  autoPlay: boolean = false,
  controls: boolean = true
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) {
    const baseEmbed = `https://www.youtube.com/embed/${match[1]}`;
    const params = new URLSearchParams();
    if (autoPlay) params.set('autoplay', '1');
    if (!controls) params.set('controls', '0');
    params.set('rel', '0');
    return `${baseEmbed}?${params.toString()}`;
  }
  return null;
}

/**
 * Checks if a URL or key is a YouTube link.
 */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:watch\?|embed\/|v\/|shorts\/))/i.test(url);
}

/**
 * Backward compatibility wrapper for getMediaUrl.
 */
export function getMediaUrl(s3Key?: string | null, fallback?: string): string {
  const resolved = mediaSrc(s3Key);
  if (resolved) return resolved;
  return fallback || '';
}

