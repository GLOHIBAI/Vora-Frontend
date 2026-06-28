import { BriefcaseIcon } from '../../common/Icons';
import Tag from '../../common/Tag';
import type { PublicRoleLandingData } from '../../../types/roleLanding';
import { buildMatchConfirmedTitle, buildMatchConfirmedSubtitle } from '../../../utils/profileMatchResult';

interface MatchResultHeroProps {
  score: number;
  matchThreshold: number;
  headline: string;
  body?: string;
  role: PublicRoleLandingData;
}

const MatchResultHero: React.FC<MatchResultHeroProps> = ({
  score,
  matchThreshold,
  headline,
  body,
  role,
}) => {
  const matchConfirmedTitle = buildMatchConfirmedTitle(role);
  const matchConfirmedSubtitle = buildMatchConfirmedSubtitle(role);

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-xl px-5 sm:px-9 pt-9 pb-8 text-center mb-5">
      <h2 className="text-[22px] sm:text-[28px] font-extrabold text-[#1A1A1A] tracking-[-0.5px] mb-2.5 leading-[1.2]">
        {headline}
      </h2>
      {body ? (
        <p className="text-[14px] sm:text-[15px] text-[#808080] leading-[1.7] mb-7 max-w-[680px] mx-auto">
          {body}
        </p>
      ) : null}

      <div className="flex flex-col items-center justify-center mb-[18px]">
        <div className="relative w-[130px] h-[130px] sm:w-[152px] sm:h-[152px] shrink-0 mb-3">
          <svg width="100%" height="100%" viewBox="0 0 152 152" className="absolute inset-0">
            <circle cx="76" cy="76" r="64" fill="none" stroke="#E6E6E6" strokeWidth="12" />
            <circle
              cx="76"
              cy="76"
              r="64"
              fill="none"
              stroke="#0047CC"
              strokeWidth="12"
              strokeDasharray="402.1"
              strokeDashoffset={402.1 - (402.1 * score) / 100}
              strokeLinecap="round"
              transform="rotate(-90 76 76)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[34px] sm:text-[40px] font-extrabold text-[#0047CC] leading-none">
              {score}%
            </div>
          </div>
        </div>
      </div>

      <div className="text-[14px] text-[#808080] font-semibold mb-[18px]">
        Match threshold for this role: {matchThreshold}%
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-[7px] mb-5">
        <Tag
          label={
            <span className="flex items-center gap-1.5">
              <BriefcaseIcon size={11} strokeWidth={2.5} />
              {role.roleTitle}
            </span>
          }
          variant="outline"
          className="shrink-0"
        />
        {role.metaItems.slice(0, 3).map((meta, i) => (
          <Tag key={i} label={meta} variant="outline" className="shrink-0" />
        ))}
      </div>

      <div className="flex justify-center">
        <div className="bg-[#F9FAFB] border border-[#E6E6E6] rounded-xl px-5 py-4 text-center w-full max-w-[530px]">
          <div className="text-[15px] font-bold text-[#1A1A1A] mb-1">{matchConfirmedTitle}</div>
          <div className="text-[13px] text-[#808080] leading-relaxed">{matchConfirmedSubtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default MatchResultHero;
