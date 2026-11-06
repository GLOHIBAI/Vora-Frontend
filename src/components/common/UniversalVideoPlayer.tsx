import React, { useRef, useEffect, useState } from 'react';
import {
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  isVimeoUrl,
  getVimeoEmbedUrl,
  isGoogleDriveUrl,
  getGoogleDriveEmbedUrl,
  isLoomUrl,
  getLoomEmbedUrl,
  displayMedia,
  mediaSrc,
} from '../../utils/media';

export interface UniversalVideoPlayerProps {
  src?: string | null;
  poster?: string | null;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  playsInline?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  poster,
  title = 'Course video preview',
  autoPlay = true,
  controls = true,
  className = 'w-full h-full',
  playsInline = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadError, setLoadError] = useState(false);

  // Normalize source link
  const rawUrl = (src && typeof src === 'string' ? src.trim() : '') || '';
  const resolvedUrl = displayMedia(rawUrl) || mediaSrc(rawUrl) || rawUrl;

  const isYt = isYouTubeUrl(resolvedUrl);
  const isVimeo = isVimeoUrl(resolvedUrl);
  const isGdrive = isGoogleDriveUrl(resolvedUrl);
  const isLoom = isLoomUrl(resolvedUrl);
  const isGenericIframe =
    Boolean(resolvedUrl) &&
    (resolvedUrl.includes('/embed/') ||
      resolvedUrl.includes('player.') ||
      resolvedUrl.includes('fast.wistia.net'));

  // Attempt autoplay for direct HTML5 video element without throwing uncaught rejection
  useEffect(() => {
    if (autoPlay && videoRef.current && !isYt && !isVimeo && !isGdrive && !isLoom && !isGenericIframe) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Unmuted autoplay was prevented by the browser; user can tap play on the controls
        });
      }
    }
  }, [autoPlay, resolvedUrl, isYt, isVimeo, isGdrive, isLoom, isGenericIframe]);

  if (!resolvedUrl && !poster) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 text-slate-400 text-xs ${className}`}>
        <span>No video stream available</span>
      </div>
    );
  }

  // 1. YouTube streaming
  if (isYt) {
    const embedUrl = getYouTubeEmbedUrl(resolvedUrl, autoPlay, controls);
    return (
      <iframe
        src={embedUrl || ''}
        title={title}
        className={`${className} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  // 2. Vimeo streaming
  if (isVimeo) {
    const embedUrl = getVimeoEmbedUrl(resolvedUrl, autoPlay);
    return (
      <iframe
        src={embedUrl || ''}
        title={title}
        className={`${className} border-0`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // 3. Google Drive streaming
  if (isGdrive) {
    const embedUrl = getGoogleDriveEmbedUrl(resolvedUrl);
    return (
      <iframe
        src={embedUrl || ''}
        title={title}
        className={`${className} border-0`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }

  // 4. Loom streaming
  if (isLoom) {
    const embedUrl = getLoomEmbedUrl(resolvedUrl, autoPlay);
    return (
      <iframe
        src={embedUrl || ''}
        title={title}
        className={`${className} border-0`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // 5. Generic embed / web player iframe
  if (isGenericIframe) {
    return (
      <iframe
        src={resolvedUrl}
        title={title}
        className={`${className} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
      />
    );
  }

  // 6. Direct MP4, WebM, HLS, S3, Cloudinary, or uploaded video
  const videoSrc = loadError
    ? 'https://assets.mixkit.co/videos/preview/mixkit-medical-laboratory-research-analysis-41270-large.mp4'
    : (resolvedUrl || 'https://assets.mixkit.co/videos/preview/mixkit-medical-laboratory-research-analysis-41270-large.mp4');

  return (
    <video
      ref={videoRef}
      controls={controls}
      playsInline={playsInline}
      poster={poster || undefined}
      className={`${className} object-contain`}
      preload="metadata"
      onError={() => setLoadError(true)}
      src={videoSrc}
    >
      <source src={videoSrc} type="video/mp4" />
      <source src={videoSrc} type="video/webm" />
      Your browser does not support HTML5 video streaming.
    </video>
  );
};

export default UniversalVideoPlayer;

