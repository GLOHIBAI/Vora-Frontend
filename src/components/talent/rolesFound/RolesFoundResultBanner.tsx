import { InfoIcon, TrendingUpIcon } from '../../common/Icons';
import type { RolesFoundSummary } from '../../../types/talentRolesFound';

interface RolesFoundResultBannerProps {
  summary: RolesFoundSummary;
}

const RolesFoundResultBanner: React.FC<RolesFoundResultBannerProps> = ({ summary }) => (
  <div className="bg-white border border-[#E6E6E6] rounded-2xl px-6 py-5 flex gap-4 items-start mb-6">
    <div className="w-[42px] h-[42px] rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E6E6]">
      <InfoIcon size={20} strokeWidth={2.5} className="text-[#DC2626]" />
    </div>
    <div>
      {summary.explanationSummary ? (
        <p className="text-[15px] font-bold text-[#1A1A1A] mb-1.5 tracking-tight leading-relaxed">
          {summary.explanationSummary}
        </p>
      ) : null}
      <p className="text-[13px] text-[#4A5568] leading-relaxed mb-3 [&_strong]:font-bold [&_strong]:text-[#1A1A1A]">
        Your profile scored {summary.originalScore}% against{' '}
        <strong>{summary.originalRoleTitle}</strong> (threshold: {summary.matchThreshold}%).
        {summary.matchedRoleCount > 0 ? (
          <>
            {' '}
            VORA found <strong>{summary.matchedRoleCount} other role{summary.matchedRoleCount === 1 ? '' : 's'}</strong>{' '}
            you qualify for at {summary.matchThreshold}%+ — you can go straight to assessment on any of them.
          </>
        ) : null}
      </p>
      <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#4A4A4A] bg-[#F7F7F7] border border-[#E6E6E6] rounded-full px-3 py-1.5">
        <TrendingUpIcon size={12} strokeWidth={2.5} className="text-[#808080]" />
        <span>
          Profile score on original role:{' '}
          <span className="font-bold text-[#1A1A1A]">{summary.originalScore}%</span> · Threshold:{' '}
          {summary.matchThreshold}%
        </span>
      </div>
    </div>
  </div>
);

export default RolesFoundResultBanner;
