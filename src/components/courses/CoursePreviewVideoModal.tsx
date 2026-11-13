import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, ClockIcon } from '../common/Icons';
import Button from '../common/Button';
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

export interface CoursePreviewVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  lessonTitle?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  totalDurationLabel?: string;
  isEnrolled?: boolean;
  onEnroll: () => void;
}

export const CoursePreviewVideoModal: React.FC<CoursePreviewVideoModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  lessonTitle,
  videoUrl,
  posterUrl,
  totalDurationLabel = '22 minutes',
  isEnrolled = false,
  onEnroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // Reset loading state on modal open or video URL change
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIsBuffering(false);
      setHasError(false);
      setHasEnded(false);
      setIsPlaying(false);
    }
  }, [isOpen, videoUrl]);

  // Normalize source URL
  const rawUrl = (videoUrl && typeof videoUrl === 'string' ? videoUrl.trim() : '') || '';
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

  const isEmbed = isYt || isVimeo || isGdrive || isLoom || isGenericIframe;

  // Fallback demo video if no source is provided
  const directVideoSrc = hasError
    ? 'https://assets.mixkit.co/videos/preview/mixkit-medical-laboratory-research-analysis-41270-large.mp4'
    : (resolvedUrl || 'https://assets.mixkit.co/videos/preview/mixkit-medical-laboratory-research-analysis-41270-large.mp4');

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls auto-hide timer
  const triggerUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !hasEnded) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  }, [isPlaying, hasEnded]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      triggerUserActivity();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, triggerUserActivity]);

  // Player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (hasEnded) {
      setHasEnded(false);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = Number(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    if (hasEnded) setHasEnded(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVol = Number(e.target.value);
    videoRef.current.volume = newVol;
    setVolume(newVol);
    const shouldMute = newVol === 0;
    videoRef.current.muted = shouldMute;
    setIsMuted(shouldMute);
  };

  const cyclePlaybackRate = () => {
    if (!videoRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen policy errors
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  // Time format helper
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  const displayTitle = lessonTitle
    ? `Free preview · ${lessonTitle}`
    : `Free preview · ${courseTitle}`;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[960px] max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={triggerUserActivity}
      >
        {/* Header */}
        <div className="px-5 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 text-white bg-slate-900/95 shrink-0">
          <div className="min-w-0 pr-4">
            <h3
              className="text-sm sm:text-base font-semibold truncate tracking-tight text-slate-100"
              title={displayTitle}
            >
              {displayTitle}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close video preview"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Video Player Area (16:9, neutral near-black #0B0F17) */}
        <div className="relative aspect-video w-full bg-[#0B0F17] overflow-hidden flex items-center justify-center select-none group">
          {/* Subtle poster backdrop while loading */}
          {posterUrl && (isLoading || isBuffering) && !hasError && (
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25 blur-xs pointer-events-none"
            />
          )}

          {/* Loading / Buffering Spinner Overlay (covers both embeds & direct video) */}
          {(isLoading || isBuffering) && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs z-20 pointer-events-none transition-opacity duration-300">
              <div className="w-11 h-11 rounded-full border-3 border-white/20 border-t-[#0052CC] animate-spin mb-3 shadow-lg" />
              <span className="text-xs text-slate-200 font-semibold tracking-wide drop-shadow-sm">
                Loading video...
              </span>
            </div>
          )}

          {isEmbed ? (
            // Third-party embed (YouTube, Vimeo, Loom, Drive)
            <div className="w-full h-full">
              {isYt && (
                <iframe
                  src={getYouTubeEmbedUrl(resolvedUrl, true) || ''}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              )}
              {isVimeo && (
                <iframe
                  src={getVimeoEmbedUrl(resolvedUrl, true) || ''}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              )}
              {isGdrive && (
                <iframe
                  src={getGoogleDriveEmbedUrl(resolvedUrl) || ''}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              )}
              {isLoom && (
                <iframe
                  src={getLoomEmbedUrl(resolvedUrl, true) || ''}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              )}
              {isGenericIframe && (
                <iframe
                  src={resolvedUrl}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              )}
            </div>
          ) : (
            // Direct HTML5 Video Stream
            <>
              <video
                ref={videoRef}
                src={directVideoSrc}
                poster={posterUrl || undefined}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    setIsLoading(false);
                  }
                }}
                onProgress={() => {
                  if (videoRef.current && videoRef.current.buffered.length > 0) {
                    setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
                  }
                }}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                  setIsBuffering(false);
                  setIsLoading(false);
                  setHasEnded(false);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setHasEnded(true);
                  setShowControls(true);
                }}
                onError={() => {
                  setHasError(true);
                  setIsLoading(false);
                  setIsBuffering(false);
                }}
              />

              {/* Centered Large 64px Play Button over Poster (before start or paused) */}
              {!isPlaying && !hasEnded && !hasError && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent cursor-pointer pointer-events-auto"
                  onClick={togglePlay}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/50 cursor-pointer"
                    aria-label="Play preview video"
                  >
                    <svg className="w-7 h-7 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Error State */}
              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-center p-6 z-20">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium text-base mb-1">This video couldn't be loaded</h4>
                  <p className="text-slate-400 text-xs max-w-sm mb-4">
                    The video preview stream is temporarily unavailable or unsupported by your connection.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    onClick={handleRetry}
                    className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-lg text-xs"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* End Screen Overlay */}
              {hasEnded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm text-center p-6 z-20 animate-in fade-in duration-300">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Preview Completed
                  </span>
                  <h4 className="text-white font-semibold text-lg sm:text-xl mb-1">
                    Enjoyed the preview? Enroll to continue
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
                    Gain full access to all syllabus modules, interactive assignments, verified credentialing, and fast-track employer matching.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEnroll();
                      }}
                      className="h-11 px-6 rounded-xl bg-[#0047CC] hover:bg-[#0039A6] active:bg-[#002F8C] text-white text-sm font-semibold shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {isEnrolled ? 'Continue as Talent' : 'Enroll to access all lessons'}
                    </button>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                      </svg>
                      Watch again
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Control Bar (auto-hides on inactivity while playing) */}
              <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-2 px-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress Bar (Brand Blue #0047CC) */}
                <div className="relative group/progress mb-2 flex items-center h-4 cursor-pointer">
                  {/* Track background */}
                  <div className="w-full h-1 group-hover/progress:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all relative">
                    {/* Buffered bar */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full"
                      style={{ width: `${bufferedPercent}%` }}
                    />
                    {/* Played bar */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#0047CC] rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {/* Native range input for accessible scrubbing */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Seek video position"
                  />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white">
                  {/* Left: Play/Pause, Volume, Time */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Play/Pause (40px hit area) */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:text-blue-400 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shrink-0"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Volume Mute/Toggle & Slider (40px hit area) */}
                    <div className="flex items-center group/vol">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:text-blue-400 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shrink-0"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 sm:w-16 h-1 accent-[#0047CC] opacity-0 group-hover/vol:opacity-100 group-hover/vol:w-16 transition-all cursor-pointer"
                        aria-label="Volume level"
                      />
                    </div>

                    {/* Time (current / total) */}
                    <div className="text-xs font-mono text-slate-300 ml-1 select-none">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span>{duration > 0 ? formatTime(duration) : (totalDurationLabel || '0:00')}</span>
                    </div>
                  </div>

                  {/* Right: Captions, Speed, Fullscreen */}
                  <div className="flex items-center gap-1">
                    {/* Captions toggle */}
                    <button
                      type="button"
                      onClick={() => setCaptionsEnabled(!captionsEnabled)}
                      className={`h-8 px-2 rounded text-xs font-semibold flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
                        captionsEnabled
                          ? 'bg-[#0047CC] text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      aria-label="Toggle closed captions"
                    >
                      CC
                    </button>

                    {/* Speed button (40px hit area) */}
                    <button
                      type="button"
                      onClick={cyclePlaybackRate}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shrink-0"
                      aria-label="Playback speed"
                    >
                      {playbackRate}x
                    </button>

                    {/* Fullscreen (40px hit area) */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:text-blue-400 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shrink-0"
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                      {isFullscreen ? (
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Light Footer (White background, Slate-600 text, High-Contrast Brand Blue Button) */}
        <div className="bg-white border-t border-slate-200 px-5 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
            <ClockIcon size={16} className="text-slate-400 shrink-0" />
            <span className="truncate font-medium">
              {totalDurationLabel} total course duration
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEnroll();
            }}
            className="h-11 px-6 rounded-xl bg-[#0047CC] hover:bg-[#0039A6] active:bg-[#002F8C] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0047CC] focus:ring-offset-2 flex items-center justify-center shrink-0"
          >
            {isEnrolled ? 'Continue as Talent' : 'Enroll to access all lessons'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CoursePreviewVideoModal;

