import React, { useMemo } from 'react';

import { AUTH_HERO_VIDEOS } from '../../constants/authVideos';

export interface AuthHeroRoleVideoProps {
  roleType?: 'Talent' | 'Employer' | 'Mentor' | string;
  roleTitle?: string;
  companyName?: string;
  className?: string;
}

interface RoleConfig {
  videoSrc: string;
  roleBadge: string;
  title: string;
  description: string;
}

export const AuthHeroRoleVideo: React.FC<AuthHeroRoleVideoProps> = ({
  roleType = 'Talent',
  roleTitle,
  companyName,
  className = '',
}) => {
  const normalizedRole = (roleType || 'Talent').toLowerCase();

  const config: RoleConfig = useMemo(() => {
    if (normalizedRole.includes('employer')) {
      return {
        videoSrc: AUTH_HERO_VIDEOS.employer,
        roleBadge: 'For Hiring Organisations',
        title: 'Build high-impact health teams faster.',
        description:
          'Access pre-vetted specialists, evaluate clinical and epidemiological competencies, and eliminate guesswork with objective talent dossiers.',
      };
    }

    if (normalizedRole.includes('mentor')) {
      return {
        videoSrc: AUTH_HERO_VIDEOS.mentor,
        roleBadge: 'For Expert Mentors',
        title: 'Guide the next generation of global health leaders.',
        description:
          'Share your frontline field experience, review simulated candidate assignments, and shape the future of international health programmes.',
      };
    }

    // Default to Talent
    return {
      videoSrc: AUTH_HERO_VIDEOS.talent,
      roleBadge: roleTitle ? `Role Application · ${roleTitle}` : 'For Global Health Talent',
      title: roleTitle
        ? `Launch your application for ${roleTitle}`
        : 'Your gateway to premier global health careers.',
      description: roleTitle
        ? `${companyName ? `${companyName} uses` : 'Leading organisations use'} VORA to evaluate practical skills through realistic work simulations. One profile unlocks matching opportunities worldwide.`
        : 'Demonstrate your capabilities through objective, job-simulation interviews and match with premier global health organisations.',
    };
  }, [normalizedRole, roleTitle, companyName]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#0A0F1D] select-none ${className}`}
      aria-label="VORA Global Health Sign-up Hero"
    >
      {/* Background Video */}
      <video
        key={config.videoSrc}
        src={config.videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-black/40 via-transparent to-black/20" />

      {/* Hero Flex Container: Perfectly adapts to any aspect ratio and height */}
      <div className="relative z-30 h-full w-full flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-8 [@media(max-height:760px)]:p-4 [@media(max-height:640px)]:p-3 pointer-events-none">
        {/* Top Header */}
        <div className="flex items-center justify-between pointer-events-auto">
          <span className="text-[10px] sm:text-[11px] [@media(max-height:640px)]:text-[9px] font-semibold text-white/90 tracking-wider uppercase drop-shadow-sm">
            VORA · Global Health Ecosystem
          </span>
        </div>

        {/* Bottom Content Area */}
        <div className="text-white flex flex-col justify-end pointer-events-auto max-w-2xl w-full">
          {/* Category Pill */}
          <div className="mb-3 sm:mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white shadow-sm">
              {config.roleBadge}
            </span>
          </div>

          {/* Title with Balanced Text Wrapping */}
          <h2 className="text-[clamp(1.15rem,2.2vh+0.35rem,1.75rem)] font-bold tracking-tight text-white leading-[1.25] sm:leading-[1.2] mb-3 sm:mb-3.5 drop-shadow-sm transition-all duration-300 [text-wrap:balance]">
            {config.title}
          </h2>

          {/* Description */}
          <p className="text-[clamp(0.8rem,1.1vh+0.25rem,0.925rem)] text-white/85 leading-relaxed max-w-xl mb-4 sm:mb-5 drop-shadow-sm [text-wrap:pretty]">
            {config.description}
          </p>

          {/* Value Highlights */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/70">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#387DFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Standardized benchmarks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#387DFF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Verified capability dossier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroRoleVideo;
