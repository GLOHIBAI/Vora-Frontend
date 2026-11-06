import React from 'react';
import { AUTH_HERO_VIDEOS } from '../../constants/authVideos';

export interface AuthHeroCourseProps {
  className?: string;
  category?: string;
}

export const AuthHeroCourse: React.FC<AuthHeroCourseProps> = ({
  className = '',
  category,
}) => {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#0A0F1D] select-none ${className}`}
      aria-label="VORA Talent &amp; Career Pathways"
    >
      {/* Background Video (Original natural colors) */}
      <video
        key={AUTH_HERO_VIDEOS.talent}
        src={AUTH_HERO_VIDEOS.talent}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
      />

      {/* Subtle Neutral Gradient Overlays for text legibility (no colored pigment) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/35 via-transparent to-black/10" />

      {/* Hero Flex Container */}
      <div className="relative z-20 h-full w-full flex flex-col justify-between p-6 sm:p-8 lg:p-9 pointer-events-none">
        {/* Top Brand Tag */}
        <div className="flex items-center justify-between pointer-events-auto">
          <span className="text-[10px] font-medium text-white/80 tracking-wider uppercase drop-shadow-xs">
            VORA · Academy &amp; Career Pathways
          </span>
        </div>

        {/* Bottom Content Area */}
        <div className="text-white flex flex-col justify-end pointer-events-auto max-w-lg w-full pb-3">
          {/* Subtle Category Pill */}
          <div className="mb-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[11px] font-normal text-white">
              {category ? `${category} · Practice-Grounded` : 'Practice-Grounded Curriculum'}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold tracking-normal text-white leading-snug mb-2 drop-shadow-xs">
            Master practical skills with real-world impact.
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed mb-4 max-w-md drop-shadow-xs">
            Learn directly from frontline field leaders. Complete hands-on assignments, earn a verified capability credential, and connect with hiring employers.
          </p>

          {/* Checkmark Highlights */}
          <div className="pt-3 border-t border-white/20 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Verified completion credential</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Direct career pathways to hiring employers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroCourse;
