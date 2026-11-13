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
  onEnded?: () => void;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  poster,
  title = 'Course video preview',
  autoPlay = true,
  controls = true,
  className = 'w-full h-full',
  playsInline = true,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);

  // YouTube / Vimeo / iframe postMessage listener for onEnded
  useEffect(() => {
    if (!onEnded) return;

    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (_) {
            return;
          }
        }

        // 1. YouTube Player API events
        // - onStateChange with info === 0 (YT.PlayerState.ENDED)
        // - infoDelivery with info.playerState === 0
        const isYtEnded =
          (data?.event === 'onStateChange' && (data?.info === 0 || data?.info?.playerState === 0)) ||
          (data?.event === 'infoDelivery' && (data?.info?.playerState === 0 || data?.info === 0)) ||
          data?.info === 0 ||
          data?.info?.playerState === 0;

        // Check if YouTube reached end of duration (within 1.5s)
        const isYtTimeEnded =
          typeof data?.info?.currentTime === 'number' &&
          typeof data?.info?.duration === 'number' &&
          data.info.duration > 0 &&
          data.info.currentTime >= data.info.duration - 1.5;

        if (isYtEnded || isYtTimeEnded) {
          onEnded();
          return;
        }

        // 2. Vimeo message
        if (data?.event === 'finish' || data?.method === 'finish') {
          onEnded();
          return;
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onEnded]);

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

  // Active YouTube state polling to ensure video finish is detected
  useEffect(() => {
    if (!onEnded || !isYt) return;
    const interval = setInterval(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'getPlayerState' }),
          '*'
        );
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'getCurrentTime' }),
          '*'
        );
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'getDuration' }),
          '*'
        );
      } catch (_) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [onEnded, isYt]);

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
        ref={iframeRef}
        src={embedUrl || ''}
        title={title}
        className={`${className} border-0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => {
          try {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'listening', id: 1 }),
              '*'
            );
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
              '*'
            );
          } catch (_) {}
        }}
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
      onEnded={onEnded}
      onTimeUpdate={() => {
        if (
          onEnded &&
          videoRef.current &&
          videoRef.current.duration > 0 &&
          videoRef.current.currentTime >= videoRef.current.duration - 0.5
        ) {
          onEnded();
        }
      }}
      src={videoSrc}
    >
      <source src={videoSrc} type="video/mp4" />
      <source src={videoSrc} type="video/webm" />
      Your browser does not support HTML5 video streaming.
    </video>
  );
};

export default UniversalVideoPlayer;

