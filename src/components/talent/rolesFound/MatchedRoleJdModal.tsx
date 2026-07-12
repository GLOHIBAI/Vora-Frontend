import Button from '../../common/Button';
import Tag from '../../common/Tag';
import { CheckIcon, ChevronRightIcon, CloseIcon, ShieldIcon } from '../../common/Icons';
import RoleBulletList from '../../roleLanding/RoleBulletList';
import RoleOverviewList from '../../roleLanding/RoleOverviewList';
import MatchAlignmentNote from '../profileMatch/MatchAlignmentNote';
import type { MatchedRoleListing } from '../../../types/talentRolesFound';

interface MatchedRoleJdModalProps {
  role: MatchedRoleListing | null;
  open: boolean;
  onClose: () => void;
  onGoToAssessment?: (roleId: string) => void;
}

const matchBoxStyles = {
  green: {
    box: 'bg-white border-[#E6E6E6]',
    title: 'text-[#1A1A1A]',
    sub: 'text-gray-600',
    icon: 'text-[#0047CC]',
  },
  blue: {
    box: 'bg-white border-[#E6E6E6]',
    title: 'text-[#1A1A1A]',
    sub: 'text-gray-600',
    icon: 'text-[#0047CC]',
  },
} as const;

const MatchedRoleJdModal: React.FC<MatchedRoleJdModalProps> = ({
  role,
  open,
  onClose,
  onGoToAssessment,
}) => {
  if (!open || !role) return null;

  const matchStyle = matchBoxStyles[role.matchVariant];
  const salaryLabel =
    role.salaryPeriod === 'monthly' ? `${role.salaryAmount}/month` : `${role.salaryAmount}/${role.salaryPeriod}`;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-5 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-[10px] w-full max-w-[640px] max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-[22px] pb-[18px] border-b border-[#E6E6E6]">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{role.roleTitle}</h2>
            <p className="text-[13px] text-[#808080] font-semibold mt-0.5">{role.companyName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-[#0047CC]">{salaryLabel}</p>
            <p className="text-xs font-bold mt-1 text-gray-600">
              {role.matchPercent}% profile match
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#808080] text-[22px] leading-none p-0 cursor-pointer shrink-0"
            aria-label="Close"
          >
            <CloseIcon size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-7 py-[22px]">
          <div className="flex flex-wrap gap-2.5 mb-1.5">
            {role.metaItems.map((item) => (
              <span key={item} className="text-[13px] text-[#4A4A4A] font-semibold">
                · {item}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-[18px]">
            {role.tags.map((tag) => (
              <Tag key={tag} label={tag} variant="gray" />
            ))}
          </div>

          <div
            className={`border-[1.5px] rounded-lg px-4 py-3 mb-[18px] flex items-center ${matchStyle.box}`}
          >
            <div>
              <p className={`text-[13px] font-bold ${matchStyle.title}`}>
                {role.matchPercent}% profile match, your profile qualifies. Your next step is
                assessment.
              </p>
              <p className={`text-xs mt-0.5 ${matchStyle.sub}`}>
                CV and onboarding profile matched against this JD
              </p>
            </div>
          </div>

          <div className="mb-[18px]">
            <div className="flex justify-between items-center gap-3 mb-2.5">
              <h3 className="text-[15px] font-bold text-[#1A1A1A]">
                Location, eligibility &amp; right to work
              </h3>
              <Tag label="Eligibility verified" variant="blue" />
            </div>
            <div className="bg-[#F7F7F7] rounded-lg overflow-hidden px-4 py-1">
              <RoleOverviewList rows={role.eligibilityRows} />
            </div>
          </div>

          <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">About this role</h3>
          <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">{role.aboutRole}</p>

          <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">What you&apos;ll be doing</h3>
          <div className="mb-4">
            <RoleBulletList items={role.responsibilities} />
          </div>

          <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">What you&apos;ll need</h3>
          <div className="mb-4">
            <RoleBulletList items={role.requirements} />
          </div>

          <MatchAlignmentNote />
        </div>

        <div className="px-7 py-4 border-t border-[#E6E6E6] flex flex-col sm:flex-row gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-[22px] py-2.5 bg-white text-[#4A4A4A] border-[1.5px] border-[#E6E6E6] rounded-full text-[13px] font-bold cursor-pointer hover:bg-[#F7F7F7]"
          >
            Back to results
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
      </div>
    </div>
  );
};

export default MatchedRoleJdModal;
