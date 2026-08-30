import React from 'react';
import { VORA_LOGO_SRC } from '../../../constants/brand';

interface AssessmentScoringPulseIconProps {
  className?: string;
}

const AssessmentScoringPulseIcon: React.FC<AssessmentScoringPulseIconProps> = ({ className = '' }) => (
  <div className={`relative w-[88px] h-[88px] mx-auto mb-7 ${className}`}>
    {/* Concentric Pulsing Radar Rings */}
    <span
      className="absolute inset-0 rounded-full border-2 border-[#387DFF] animate-[profile-match-pulse_2s_ease-out_infinite]"
      aria-hidden
    />
    <span
      className="absolute inset-0 rounded-full border-2 border-[#387DFF] animate-[profile-match-pulse_2s_ease-out_infinite]"
      style={{ animationDelay: '0.75s' }}
      aria-hidden
    />

    {/* Central Icon Container with VORA Logo */}
    <div className="relative z-[2] w-[88px] h-[88px] rounded-full bg-white border-2 border-[#0047CC] flex items-center justify-center shadow-[0_8px_24px_rgba(0,71,204,0.15)]">
      <img
        src={VORA_LOGO_SRC}
        alt="VORA"
        className="w-12 h-12 object-contain animate-heartbeat relative z-10"
      />
    </div>
  </div>
);

export default AssessmentScoringPulseIcon;
