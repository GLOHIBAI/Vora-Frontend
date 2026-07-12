import Button from '../../common/Button';
import Tag from '../../common/Tag';
import { ChevronRightIcon, FileIcon, LocationIcon } from '../../common/Icons';
import MatchPercentBadge from './MatchPercentBadge';
import MatchedRoleEligibilityNote from './MatchedRoleEligibilityNote';
import type { MatchedRoleListing } from '../../../types/talentRolesFound';

interface MatchedRoleCardProps {
  role: MatchedRoleListing;
  onViewJd: (roleId: string) => void;
  onGoToAssessment?: (roleId: string) => void;
}



const MatchedRoleCard: React.FC<MatchedRoleCardProps> = ({ role, onViewJd, onGoToAssessment }) => (
  <article className="bg-white border border-[#E6E6E6] rounded-2xl p-6 mb-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:border-[#387DFF] hover:shadow-[0_4px_16px_-4px_rgba(56,125,255,0.12)] transition-all duration-300 group">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
      <div className="flex gap-3 items-start flex-1 min-w-0">
        <div className="w-[42px] h-[42px] rounded-lg bg-[#EBF6FF] border border-[#E6E6E6] flex items-center justify-center text-[9px] font-extrabold text-[#0047CC] shrink-0">
          {role.companyInitials}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#1A1A1A] mb-0.5">{role.roleTitle}</h3>
          <p className="text-[13px] text-[#808080] font-semibold">{role.companyName}</p>
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0 flex items-baseline gap-0.5">
        <p className="whitespace-nowrap">
          <span className="text-[22px] font-bold text-[#0047CC] tracking-tight">{role.salaryAmount}/</span>
          <span className="text-[15px] font-medium text-[#808080]">{role.salaryPeriod?.replace('ly', '') || ''}</span>
        </p>
      </div>
    </div>

    <div className="flex flex-nowrap items-center gap-1.5 mb-2 text-[11px] sm:text-xs text-[#718096] overflow-hidden whitespace-nowrap">
      <span className="inline-flex items-center gap-1 shrink-0">
        <LocationIcon size={11} className="text-[#A0AEC0]" />
        <span className="font-medium">{role.locationLine}</span>
      </span>
      <span className="text-[#CBD5E0] shrink-0">·</span>
      <div className="shrink-0">
        <Tag
          variant="gray"
          label={role.formatPill}
        />
      </div>
      <span className="text-[#CBD5E0] shrink-0">·</span>
      <span className="text-[#718096] font-normal truncate">{role.postedLine}</span>
    </div>

    <div className="flex flex-nowrap items-center gap-1.5 mb-4 text-[11px] sm:text-xs text-[#718096] overflow-hidden whitespace-nowrap">
      <div className="shrink-0">
        <MatchPercentBadge percent={role.matchPercent} variant={role.matchVariant} />
      </div>
      <span className="text-[#CBD5E0] shrink-0 pl-1 pr-1">|</span>
      <div className="shrink-0">
        <Tag
          variant="gray"
          label={role.contractPill}
        />
      </div>
      {role.contractMeta.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-1.5 shrink-0">
          {index === 0 ? null : <span className="text-[#CBD5E0]">·</span>}
          <span className="truncate">{item}</span>
        </span>
      ))}
      <span className="text-[#CBD5E0] shrink-0">·</span>
      <span className="inline-flex items-center gap-1 shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="truncate">{role.timezone}</span>
      </span>
    </div>

    <MatchedRoleEligibilityNote eligibility={role.eligibility} />

    <div className="flex flex-wrap items-center gap-2 mb-3.5">
      {role.tags.map((tag, index) => {
        const isSkill = index >= 4;
        return (
          <Tag
            key={tag}
            label={tag}
            variant={isSkill ? 'gray' : 'outline'}
            className={isSkill ? '!bg-[#E2E8F0] !border-transparent !text-[#4A5568]' : ''}
          />
        );
      })}
    </div>

    <div className="flex flex-col sm:flex-row gap-2.5 sm:justify-end items-stretch sm:items-center pt-3 border-t border-[#F7F7F7]">
      <button
        type="button"
        onClick={() => onViewJd(role.id)}
        className="inline-flex items-center justify-center gap-1.5 px-[18px] py-2.5 bg-white text-[#0047CC] border-[1.5px] border-[#0047CC] rounded-full text-[13px] font-bold cursor-pointer hover:bg-[#F0F7FF] hover:shadow-sm transition-all"
      >
        <FileIcon size={14} strokeWidth={2.5} />
        View full JD
      </button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        pill
        fullWidth={false}
        onClick={() => onGoToAssessment?.(role.id)}
        className="sm:!w-auto !font-bold !min-h-0 !py-2.5 !px-5"
      >
        Start interview
      </Button>
    </div>
  </article>
);

export default MatchedRoleCard;
