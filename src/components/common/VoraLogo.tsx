import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VORA_LOGO_SRC, VORA_WORDMARK_ORA_COLOR } from '../../constants/brand';

export type VoraLogoSize = 'sm' | 'md' | 'lg';

const ICON_HEIGHT: Record<VoraLogoSize, string> = {
  sm: 'h-[17px]',
  md: 'h-[22px]',
  lg: 'h-[28px]',
};

const TEXT_SIZE: Record<VoraLogoSize, string> = {
  sm: 'text-[15px]',
  md: 'text-[19px]',
  lg: 'text-[24px]',
};

export interface VoraLogoProps {
  size?: VoraLogoSize;
  className?: string;
  to?: string;
  /** When true, show only the ORA wordmark text (no heartbeat image). */
  textOnly?: boolean;
  /** Extra classes for the ORA text (e.g. font-medium on mobile header) */
  textClassName?: string;
}

/**
 * Brand wordmark: GLOHIB heartbeat logo + "ORA" (logo replaces the letter V).
 * Includes automatic text fallback to "V" if image fails to ensure "VORA" is always readable.
 */
const VoraLogo: React.FC<VoraLogoProps> = ({
  size = 'md',
  className = '',
  to,
  textOnly = false,
  textClassName = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const mark = (
    <span
      className={`inline-flex items-center gap-[1px] select-none ${className}`}
      aria-label="VORA"
    >
      {!textOnly && !imageError ? (
        <img
          src={VORA_LOGO_SRC}
          alt="V"
          onError={() => setImageError(true)}
          className={`${ICON_HEIGHT[size]} w-auto object-contain shrink-0`}
          aria-hidden
        />
      ) : !textOnly && imageError ? (
        <span
          className={`font-black tracking-tight leading-none text-[#0047CC] ${TEXT_SIZE[size]}`}
          aria-hidden
        >
          V
        </span>
      ) : null}
      <span
        className={`font-extrabold tracking-[-0.03em] leading-none ${TEXT_SIZE[size]} ${textClassName}`}
        style={{ color: VORA_WORDMARK_ORA_COLOR }}
      >
        ORA
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center no-underline cursor-pointer">
        {mark}
      </Link>
    );
  }

  return mark;
};

export default VoraLogo;
