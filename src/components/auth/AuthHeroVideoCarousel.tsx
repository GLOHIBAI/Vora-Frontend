import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CarouselSlide {
  id: 'talent' | 'employer' | 'mentor';
  roleBadge: string;
  title: string;
  description: string;
  videoSrc: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: 'talent',
    roleBadge: 'For Global Health Talent',
    title: 'Advance your career in global health.',
    description:
      'Prove your competencies through objective, job-simulation interviews and match with premier global health organisations.',
    videoSrc: '/videos/signup_as_talent_hero_silent.mp4',
  },
  {
    id: 'employer',
    roleBadge: 'For Hiring Organisations',
    title: 'Build high-impact health teams faster.',
    description:
      'Streamline discovery with AI-assisted competency benchmarks, verified candidate portfolios, and bias-free evaluation.',
    videoSrc: '/videos/employer_signup_hero.mp4',
  },
  {
    id: 'mentor',
    roleBadge: 'For Expert Mentors',
    title: 'Guide the next generation of leaders.',
    description:
      'Share your frontline public health expertise, provide actionable feedback on candidate interviews, and shape global health initiatives.',
    videoSrc: '/videos/mentor.mp4',
  },
];

interface AuthHeroVideoCarouselProps {
  className?: string;
}

export const AuthHeroVideoCarousel: React.FC<AuthHeroVideoCarouselProps> = ({
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((activeIndex + 1) % SLIDES.length);
  }, [activeIndex, goToSlide]);

  // Handle active video playback and synchronizing the progress bar
  useEffect(() => {
    const currentVideo = videoRefs.current[activeIndex];

    // Pause non-active videos and reset their playback
    videoRefs.current.forEach((v, idx) => {
      if (v && idx !== activeIndex) {
        try {
          v.pause();
          v.currentTime = 0;
        } catch {
          // ignore
        }
      }
    });

    if (currentVideo) {
      currentVideo.currentTime = 0;
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented; video will wait for user interaction or mute
        });
      }
    }
  }, [activeIndex]);

  // Monitor playback progress on active video
  const handleTimeUpdate = (index: number) => {
    if (index !== activeIndex) return;
    const video = videoRefs.current[index];
    if (video && video.duration && !isNaN(video.duration)) {
      const pct = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100));
      setProgress(pct);
    }
  };

  const handleVideoEnded = (index: number) => {
    if (index !== activeIndex) return;
    nextSlide();
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#0A0F1D] select-none ${className}`}
      aria-label="VORA Global Health Overview Carousel"
    >
      {/* Background Videos with Smooth Crossfade */}
      <div className="absolute inset-0 w-full h-full">
        {SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <video
              key={slide.id}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={slide.videoSrc}
              muted
              playsInline
              preload={index === 0 ? 'auto' : 'metadata'}
              onTimeUpdate={() => handleTimeUpdate(index)}
              onEnded={() => handleVideoEnded(index)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            />
          );
        })}
      </div>

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-black/40 via-transparent to-black/20" />

      {/* Top Header inside Hero */}
      <div className="absolute top-8 left-8 right-8 z-30 flex items-center justify-between pointer-events-auto">
        <span className="text-[12px] font-semibold text-white/90 tracking-wider uppercase drop-shadow-sm">
          VORA · Global Health Ecosystem
        </span>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-end">
        {/* Category Pill */}
        <div className="mb-3.5">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white shadow-sm">
            {currentSlide.roleBadge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-2.5 drop-shadow-sm max-w-xl transition-all duration-300">
          {currentSlide.title}
        </h2>

        {/* Description */}
        <p className="text-[13.5px] sm:text-[14px] text-white/80 leading-relaxed max-w-lg mb-6 drop-shadow-sm">
          {currentSlide.description}
        </p>

        {/* 3 Progress Lines (Indicators) without labels */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
          {SLIDES.map((slide, index) => {
            const isPast = index < activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <div
                key={slide.id}
                className="flex flex-col py-1.5 pointer-events-none"
                aria-label={`Slide ${index + 1}`}
              >
                {/* Clean Line Track */}
                <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden backdrop-blur-sm transition-all">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    style={{
                      width: isPast ? '100%' : isCurrent ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuthHeroVideoCarousel;
