import AuthCenterLogoNav from './AuthCenterLogoNav';
import RoleApplyContextBanner from './RoleApplyContextBanner';
import type { PublicRoleLandingData } from '../../types/roleLanding';
import { DEFAULT_PUBLIC_ROLE_LANDING } from '../../constants/roleLanding';

interface RoleOnboardingShellProps {
  role?: Pick<PublicRoleLandingData, 'roleTitle' | 'companyName' | 'formatLocationLabel' | 'compensationLine' | 'overviewRows'> | null;
  children: React.ReactNode;
}

/** Centered logo + role apply banner for onboarding steps. Always renders both. */
const RoleOnboardingShell: React.FC<RoleOnboardingShellProps> = ({ role, children }) => {
  const displayRole = role || DEFAULT_PUBLIC_ROLE_LANDING;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthCenterLogoNav />
      <RoleApplyContextBanner role={displayRole} />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default RoleOnboardingShell;
