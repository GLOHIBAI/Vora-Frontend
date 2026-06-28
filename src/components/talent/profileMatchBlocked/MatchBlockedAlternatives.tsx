import MatchedRoleCard from '../rolesFound/MatchedRoleCard';
import type { MatchedRoleListing } from '../../../types/talentRolesFound';

interface MatchBlockedAlternativesProps {
  roles: MatchedRoleListing[];
  matchThreshold?: number;
}

const MatchBlockedAlternatives: React.FC<MatchBlockedAlternativesProps> = ({
  roles,
  matchThreshold = 80,
}) => {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="bg-white border border-[#E6E6E6] rounded-[10px] p-[22px] sm:px-[26px] mb-[18px]">
      <h2 className="text-[17px] font-semibold text-[#1A1A1A] tracking-tight mb-1.5">
        Roles your profile matches, and you can legally access
      </h2>
      <p className="text-sm text-[#808080] leading-relaxed mb-[18px]">
        VORA found these roles in the same scan. Your profile scored {matchThreshold}%+ on each, and
        your work rights cover them. You can go straight to assessment on any of these.
      </p>

      <div className="flex flex-col gap-3">
        {roles.map((role) => (
          <MatchedRoleCard key={role.id} role={role} onGoToAssessment={() => {}} onViewJd={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default MatchBlockedAlternatives;
