import { useParams } from 'react-router-dom';
import PublicRoleNav from '../../components/roleLanding/PublicRoleNav';
import RoleHeroCard from '../../components/roleLanding/RoleHeroCard';
import RoleMatchCtaBanner from '../../components/roleLanding/RoleMatchCtaBanner';
import RoleDetailCard from '../../components/roleLanding/RoleDetailCard';
import RoleBulletList from '../../components/roleLanding/RoleBulletList';
import RoleOverviewList from '../../components/roleLanding/RoleOverviewList';
import AlertBanner from '../../components/common/AlertBanner';
import { SubsectionTitle } from '../../components/common/Typography';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import type { PublicRoleLandingData, PublicRoleResponse } from '../../types/roleLanding';
import { mapApiResponseToRoleData } from '../../utils/roleLanding';
import FullPageSpinner from '../../components/common/FullPageSpinner';

const RoleLanding: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: response, isLoading } = useGetPublicRoleQuery(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <PublicRoleNav roleSlug={slug} />
        <div className="flex items-center justify-center pt-32">
          <FullPageSpinner isFullPage={false} />
        </div>
      </div>
    );
  }

  const apiData = response?.data || response;

  if (!apiData || Object.keys(apiData).length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <PublicRoleNav roleSlug={slug} />
        <div className="flex items-center justify-center pt-32 px-4">
          <AlertBanner variant="red" className="max-w-md">Role not found.</AlertBanner>
        </div>
      </div>
    );
  }

  if (apiData.active === false) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <PublicRoleNav roleSlug={slug} />
        <div className="flex items-center justify-center pt-32 px-4">
          <AlertBanner variant="blue" className="max-w-md">
            {apiData.message || 'This role is currently under review or not live yet.'}
          </AlertBanner>
        </div>
      </div>
    );
  }

  const role = mapApiResponseToRoleData(slug, apiData);

  return (
    <div className="min-h-screen">
      <PublicRoleNav roleSlug={slug} />

      <div className="bg-white max-w-[1000px] mx-auto px-4 sm:px-5 py-8 pb-14">
        <RoleHeroCard role={role} />
        <RoleMatchCtaBanner roleSlug={slug} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-5 min-w-0">
            <RoleDetailCard title="About this role">
              <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap break-all min-w-0">{role.aboutRole}</p>
              <div className="h-px bg-[#E6E6E6] my-4" />
              <SubsectionTitle as="h3" className="mb-3">
                What you&apos;ll be doing
              </SubsectionTitle>
              <RoleBulletList items={role.responsibilities} />
              <div className="h-px bg-[#E6E6E6] my-4" />
              <SubsectionTitle as="h3" className="mb-3">
                What you&apos;ll need
              </SubsectionTitle>
              <RoleBulletList items={role.requirements} />
            </RoleDetailCard>
          </div>

          <div className="space-y-4 min-w-0">
            <RoleDetailCard title="Role overview">
              <RoleOverviewList rows={role.overviewRows} />
            </RoleDetailCard>

            <RoleDetailCard title="Eligibility & work rights">
              <RoleOverviewList rows={role.eligibilityRows} />
              {role.eligibilityNote && (
                <AlertBanner variant="blue" className="mt-3 !text-xs" showIcon={false}>
                  <strong>Important:</strong> {role.eligibilityNote}
                </AlertBanner>
              )}
            </RoleDetailCard>

            {role.assessmentItems && role.assessmentItems.length > 0 && (
              <RoleDetailCard title="How VORA interviews you">
                <RoleBulletList items={role.assessmentItems} />
                <AlertBanner variant="blue" className="mt-3 !text-xs !rounded-lg" showIcon={false}>
                  <p className="font-semibold mb-1">Free to apply</p>
                  <p className="text-xs leading-relaxed font-normal">
                    Signing up and checking your profile match costs nothing. The whole process takes
                    under 15 minutes.
                  </p>
                </AlertBanner>
              </RoleDetailCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleLanding;
