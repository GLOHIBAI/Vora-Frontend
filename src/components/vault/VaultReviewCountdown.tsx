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

  // Compute real progress percentage
  const totalMs = endAt.getTime() - startAt.getTime();
  const elapsedMs = Date.now() - startAt.getTime();
  const rawPercent = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(2, Math.round(rawPercent)));

  return (
    <ContentCard className="border border-slate-200 text-center" bodyClassName="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0047CC] animate-pulse" />
          In review
        </span>
      </div>

      <div className="flex items-center justify-center gap-2.5 flex-wrap my-2">
        <CountdownBlock value={digits.hours} unit="Hours" />
        <span className="text-2xl font-bold text-slate-300 leading-none select-none">:</span>
        <CountdownBlock value={digits.minutes} unit="Mins" />
        <span className="text-2xl font-bold text-slate-300 leading-none select-none">:</span>
        <CountdownBlock value={digits.seconds} unit="Secs" />
      </div>

      <div className="bg-slate-100 rounded-full h-2 mt-4 overflow-hidden w-full">
        <div
          className="h-full rounded-full bg-[#0047CC] transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-[12px] text-slate-500 mt-2.5">
        Submitted {formatDateTime(submittedAt)} • Review completes {formatDateTime(reviewEndsAt)}
      </p>
    </ContentCard>
  );
};

const CountdownBlock: React.FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 min-w-[70px] shadow-xs text-center">
    <div className="text-[26px] sm:text-[30px] font-bold text-slate-900 tabular-nums tracking-tight leading-none">
      {value}
    </div>
    <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1 tracking-wider">{unit}</div>
  </div>
);

export default VaultReviewCountdown;
