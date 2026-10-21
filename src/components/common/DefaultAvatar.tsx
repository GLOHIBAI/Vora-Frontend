import React, { useId } from 'react';

export interface DefaultAvatarProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  baseColor?: string;
  figureColor?: string;
  alt?: string;
}

/**
 * Default silhouette avatar matching the Vora platform aesthetic.
 * Renders a clean, neutral vector user silhouette for profiles without an uploaded photo.
 */
export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  className = 'w-10 h-10 rounded-full shrink-0',
  baseColor = '#CBD5E1', // slate-300 neutral base
  figureColor = '#F8FAFC', // slate-50 soft off-white silhouette
  alt = 'Default user avatar',
  ...rest
}) => {
  const rawId = useId();
  const clipId = `vora-avatar-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      className={className}
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      {/* Circular base background */}
      <circle cx="50" cy="50" r="50" fill={baseColor} />

      {/* Silhouette elements clipped to the circle boundary */}
      <g clipPath={`url(#${clipId})`}>
        {/* Head */}
        <circle cx="50" cy="38" r="16.5" fill={figureColor} />
        {/* Torso & Shoulders */}
        <path
          d="M14 100 C16 67 32 58.5 50 58.5 C68 58.5 84 67 86 100 Z"
          fill={figureColor}
        />
      </g>
    </svg>
  );
};

export default DefaultAvatar;
