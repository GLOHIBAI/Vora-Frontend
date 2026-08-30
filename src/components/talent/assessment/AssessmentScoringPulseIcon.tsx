import React from 'react';

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

    {/* Central Icon Container */}
    <div className="relative z-[2] w-[88px] h-[88px] rounded-full bg-white border-2 border-[#0047CC] flex items-center justify-center shadow-[0_8px_24px_rgba(0,71,204,0.15)]">
      <svg
        width="38"
        height="38"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="scoringSparkleGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EBF6FF" />
            <stop offset="1" stopColor="#D9ECFF" />
          </linearGradient>
          <linearGradient id="scoringStrokeGrad" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0047CC" />
            <stop offset="1" stopColor="#387DFF" />
          </linearGradient>
        </defs>

        {/* Primary Evaluation AI Scoring Spark */}
        <path
          d="M12 2.5L14.3 8.7C14.6 9.4 15.1 9.9 15.8 10.2L22 12.5L15.8 14.8C15.1 15.1 14.6 15.6 14.3 16.3L12 22.5L9.7 16.3C9.4 15.6 8.9 15.1 8.2 14.8L2 12.5L8.2 10.2C8.9 9.9 9.4 9.4 9.7 8.7L12 2.5Z"
          fill="url(#scoringSparkleGrad)"
          stroke="url(#scoringStrokeGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mini Accent Star for dynamic intelligence scoring */}
        <path
          d="M18.5 2.5L19.3 4.7C19.4 5 19.6 5.2 19.9 5.3L22.1 6.1L19.9 6.9C19.6 7 19.4 7.2 19.3 7.5L18.5 9.7L17.7 7.5C17.6 7.2 17.4 7 17.1 6.9L14.9 6.1L17.1 5.3C17.4 5.2 17.6 5 17.7 4.7L18.5 2.5Z"
          fill="#387DFF"
        />

        {/* Central Core Evaluation Node */}
        <circle cx="12" cy="12.5" r="1.5" fill="#0047CC" />
      </svg>
    </div>
  </div>
);

export default AssessmentScoringPulseIcon;
