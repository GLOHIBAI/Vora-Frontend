import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AuthTopNav from '../../components/auth/AuthTopNav';
import RoleApplyContextBanner from '../../components/auth/RoleApplyContextBanner';
import SignupForm from '../../components/auth/SignupForm';
import {
  AuthPageShell,
  AuthPageHeader,
  AuthFormCard,
} from '../../components/auth/AuthPageLayout';
import { useAuth } from '../../context/AuthContext';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';
import type { PublicRoleLandingData } from '../../types/roleLanding';

const RoleSignup: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { isLoading: isAuthLoading } = useAuth();
  const { data: response, isLoading: isRoleLoading } = useGetPublicRoleQuery(slug);

  const role: PublicRoleLandingData = useMemo(() => {
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(slug); // fallback
    }
    return mapApiResponseToRoleData(slug, apiData);
  }, [response, slug]);

  const showFullPage = useFullPageLoading(isAuthLoading || isRoleLoading, false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthTopNav logoTo={slug ? `/role/${slug}` : '/signup'} loginTo={slug ? `/role/${slug}/login` : '/login'} />
      <RoleApplyContextBanner role={role} />

      <AuthPageShell loading={showFullPage} centered={false} className="flex-1 !min-h-0">
        <AuthPageHeader
          title="Start your journey in global health"
          subtitle="Create your free account. VORA builds your profile from your CV and onboarding details, then instantly checks if you match this role, and hundreds of others."
          className="!mb-7"
          showLogo={false}
        />

        <AuthFormCard className="max-w-[460px]">
          <SignupForm roleSlug={slug} showFooterLogin loginTo={`/role/${slug}/login`} />
        </AuthFormCard>
      </AuthPageShell>
    </div>
  );
};

export default RoleSignup;
