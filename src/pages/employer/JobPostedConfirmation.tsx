import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VaultReviewPageLayout from '../../components/vault/VaultReviewPageLayout';
import ConfirmationHeader from '../../components/common/ConfirmationHeader';
import AlertBanner from '../../components/common/AlertBanner';
import Button from '../../components/common/Button';
import JobsBreadcrumb from '../../components/jobs/JobsBreadcrumb';
import RoleSummaryPill from '../../components/jobs/RoleSummaryPill';
import JobPostedStatsBar from '../../components/jobs/JobPostedStatsBar';
import RoleShareSection from '../../components/jobs/RoleShareSection';
import { CheckIcon } from '../../components/common/Icons';
import {
  JOB_POSTED_HOW_IT_WORKS,
  SHARE_CHANNELS,
} from '../../constants/jobPostedConfirmation';
import {
  buildJobPostedConfirmationData,
  loadJobPostedConfirmation,
} from '../../utils/jobPostedConfirmation';

const JobPostedConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const data = useMemo(() => loadJobPostedConfirmation() ?? buildJobPostedConfirmationData(), []);

  const applicationsPath = data.jobId ? `/jobs/${data.jobId}` : '/jobs';

  return (
    <VaultReviewPageLayout showBackBar={false} maxWidthClass="w-full">
      <JobsBreadcrumb
        className="mb-6"
        separator="/"
        segments={[
          { label: 'Jobs', to: '/jobs' },
          { label: 'Post a Job', to: '/jobs' },
          { label: 'Job Posted' },
        ]}
      />

      <ConfirmationHeader
        iconWrapperClassName="bg-[#EBF6FF] border-[#BDD9FF]"
        icon={<CheckIcon size={34} className="text-[#0047CC]" strokeWidth={3} />}
        title="Your role is live. VORA is on it."
        subtitle={
          <>
            VORA&apos;s AI matching engine is already running against your specification. Share the
            link below to reach candidates outside the pool, they still go through the same
            three-stage interview gate before you see them.
          </>
        }
      />

      <RoleSummaryPill
        roleTitle={data.roleTitle}
        formatLocationLabel={data.formatLocationLabel}
      />

      <JobPostedStatsBar
        candidatesMatched={data.candidatesMatched}
        positionsOpen={data.positions}
      />

      <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 mb-5">
        <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-1">
          Share this role, get matches faster
        </h2>
        <p className="text-[13px] text-[#808080] leading-relaxed mb-4">
          Anyone with this link can view the role and apply through VORA. They complete onboarding
          and interview before appearing in your applicant list, same gate as pool candidates.
        </p>

        <RoleShareSection
          channels={SHARE_CHANNELS}
          shareUrl={data.shareUrl}
          shareTitle={data.roleTitle}
        />
      </div>

      <AlertBanner variant="blue" className="mb-8 !text-[13px]" showIcon={false}>
        <strong>How it works:</strong> {JOB_POSTED_HOW_IT_WORKS}
      </AlertBanner>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          fullWidth={false}
          size="md"
          className="border-[#E6E6E6] text-[#4A4A4A] font-bold"
          onClick={() => navigate('/jobs')}
        >
          Back to Jobs
        </Button>
        <Button
          variant="primary"
          fullWidth={false}
          size="md"
          className="font-bold px-8"
          onClick={() => navigate(applicationsPath)}
        >
          View Applications
        </Button>
      </div>
    </VaultReviewPageLayout>
  );
};

export default JobPostedConfirmation;
