import React, { useState, useEffect } from 'react';
import { displayMentorPhoto } from '../../utils/media';
import DefaultAvatar from '../common/DefaultAvatar';

interface MentorAvatarProps {
  photoUrl?: string | null;
  photoS3Key?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
  preferSilhouette?: boolean;
}

export const getMentorInitials = (name?: string): string => {
  if (!name) return 'VM';
  // Strip honorifics like "Mrs.", "Mr.", "Dr." if desired or keep initials
  const clean = name.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, '').trim();
  const target = clean || name;
  const parts = target.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  photoUrl,
  photoS3Key,
  name = '',
  className = 'w-12 h-12 rounded-2xl object-cover shrink-0 bg-gray-100 border border-gray-100 shadow-2xs',
  fallbackClassName = 'bg-blue-50 text-[#0047CC] border border-blue-100 font-bold',
  preferSilhouette = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const src = displayMentorPhoto(photoUrl, photoS3Key);

  // Reset imgError state if photoUrl or photoS3Key changes
  useEffect(() => {
    setImgError(false);
  }, [photoUrl, photoS3Key]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={className}
      />
    );
  }

  // Silhouette avatar matching platform design guidelines
  if (preferSilhouette) {
    return (
      <DefaultAvatar
        className={className}
        alt={name || 'Mentor avatar'}
      />
    );
  }

  // Fallback to stylized initials badge if explicitly requested
  const initials = getMentorInitials(name);

  return (
    <div
      aria-label={name}
      className={`${className} ${fallbackClassName} flex items-center justify-center select-none text-xs sm:text-sm tracking-wider`}
    >
      {initials}
    </div>
  );
};

export default MentorAvatar;
