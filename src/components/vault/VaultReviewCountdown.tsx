import React from 'react';
import ContentCard from '../common/ContentCard';
import { formatCountdownParts, useCountdown } from '../../hooks/useCountdown';
import { formatDateTime } from '../../utils/vaultEditReview';

interface VaultReviewCountdownProps {
  submittedAt: string;
  reviewEndsAt: string;
  label?: string;
}

const VaultReviewCountdown: React.FC<VaultReviewCountdownProps> = ({
  submittedAt,
  reviewEndsAt,
  label = 'Review window closes in',
}) => {
  const endAt = new Date(reviewEndsAt);
  const startAt = new Date(submittedAt);
  const parts = useCountdown(endAt, startAt);
  const digits = formatCountdownParts(parts);

  return (
    <ContentCard className="!border-[#FDE68A] border-[1.5px] text-center" bodyClassName="px-5 py-5">
      <p className="text-xs font-bold text-[#808080] uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
        <CountdownBlock value={digits.hours} unit="Hours" />
        <span className="text-[28px] font-black text-[#FDE68A] leading-none">:</span>
        <CountdownBlock value={digits.minutes} unit="Mins" />
        <span className="text-[28px] font-black text-[#FDE68A] leading-none">:</span>
        <CountdownBlock value={digits.seconds} unit="Secs" />
      </div>
      <div className="bg-[#E6E6E6] rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FDE68A] to-[#D97706] transition-[width] duration-1000 ease-linear"
          style={{ width: `${parts.progressPercent}%` }}
        />
      </div>
      <p className="text-[11px] text-[#808080] mt-1.5">
        Submitted {formatDateTime(submittedAt)}. Review completes {formatDateTime(reviewEndsAt)}.
      </p>
    </ContentCard>
  );
};

const CountdownBlock: React.FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="bg-[#FFFBEB] border-[1.5px] border-[#FDE68A] rounded-lg px-4 py-3 min-w-[56px]">
    <div className="text-[28px] font-black text-[#92400E] leading-none">{value}</div>
    <div className="text-[10px] font-bold text-[#D97706] uppercase mt-0.5">{unit}</div>
  </div>
);

export default VaultReviewCountdown;
