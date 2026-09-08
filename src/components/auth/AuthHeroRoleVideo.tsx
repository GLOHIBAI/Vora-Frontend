import React, { useMemo } from 'react';

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
        videoSrc: '/videos/employer_signup_hero.mp4',
        roleBadge: 'For Hiring Organisations',
        title: 'Build high-impact health teams faster.',
        description:
          'Access pre-vetted specialists, evaluate clinical and epidemiological competencies, and eliminate guesswork with objective talent dossiers.',
      };
    }

    if (normalizedRole.includes('mentor')) {
      return {
        videoSrc: '/videos/mentor.mp4',
        roleBadge: 'For Expert Mentors',
        title: 'Guide the next generation of global health leaders.',
        description:
          'Share your frontline field experience, review simulated candidate assignments, and shape the future of international health programmes.',
      };
    }

    // Default to Talent
    return {
      videoSrc: '/videos/signup_as_talent_hero_silent.mp4',
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
      className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#0A0F1D] select-none ${className}`}
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
            {config.roleBadge}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-2.5 drop-shadow-sm max-w-xl transition-all duration-300">
          {config.title}
        </h2>

        {/* Description */}
        <p className="text-[13.5px] sm:text-[14px] text-white/80 leading-relaxed max-w-lg drop-shadow-sm">
          {config.description}
        </p>

        {/* Value Highlights */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-[12px] text-white/70">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#387DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Standardized benchmarks</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#387DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified capability dossier</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroRoleVideo;
