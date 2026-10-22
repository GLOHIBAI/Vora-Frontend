import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationHeader from '../../components/common/ConfirmationHeader';
import Button from '../../components/common/Button';
import { ClockIcon } from '../../components/common/Icons';
import VaultReviewPageLayout from '../../components/vault/VaultReviewPageLayout';
import VaultReviewCountdown from '../../components/vault/VaultReviewCountdown';
import ReviewChangesCard from '../../components/vault/ReviewChangesCard';
import VaultEscrowAdjustmentCard from '../../components/vault/VaultEscrowAdjustmentCard';
import BulletListCard from '../../components/common/BulletListCard';
import {
  getDefaultVaultEditReview,
  loadVaultEditReview,
} from '../../utils/vaultEditReview';

const DURING_REVIEW_ITEMS = [
  'Silent matching continues against the previous specification',
  'No further edits can be submitted until this review completes',
  'Your go-live date is unchanged',
  'You can still cancel the vault entirely for a full refund during this window',
  'After review confirms, silent matching recalibrates and pre-qualified candidates are re-scored',
  'The escrow top-up charges automatically, no action required from you',
];

const isValidUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

const VaultEditReview: React.FC = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const isUuid = isValidUuid(jobId);
  const vaultDashboardHref = isUuid ? `/jobs/${jobId}` : '/jobs';

  const data = useMemo(() => {
    const loaded = loadVaultEditReview();
    if (loaded?.changes?.length) return loaded;
    return getDefaultVaultEditReview();
  }, []);

  const showEscrow = data.escrow.adjustment !== 0;

  return (
    <VaultReviewPageLayout backTo={vaultDashboardHref}>
      <ConfirmationHeader
        icon={<ClockIcon size={28} className="text-[#0047CC]" strokeWidth={2.3} />}
        iconWrapperClassName="bg-[#F0F7FF] border-[#BDD9FF]"
        title="Edit in 48-hour review"
        subtitle={
          <div className="max-w-xl mx-auto text-left sm:text-center text-sm text-slate-600 leading-relaxed">
            Your specification update for{' '}
            <strong className="text-slate-900 font-semibold">{data.roleTitle}</strong> has been submitted.
            VORA is reviewing the changes. Once confirmed, the new spec takes effect and silent matching
            recalibrates against the updated criteria.
          </div>
        }
      />

      <VaultReviewCountdown submittedAt={data.submittedAt} reviewEndsAt={data.reviewEndsAt} />

      <ReviewChangesCard
        changes={data.changes}
        editsUsed={data.editsUsed}
        editsTotal={data.editsTotal}
      />

      {showEscrow && (
        <VaultEscrowAdjustmentCard
          recalc={data.escrow}
          originalPositions={data.originalPositions}
          originalMidpoint={data.originalMidpoint}
          feeRate={data.feeRate}
        />
      )}

      <BulletListCard title="During the review window" items={DURING_REVIEW_ITEMS} />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          className="h-11 sm:h-12 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 text-sm"
          onClick={() => navigate(vaultDashboardHref)}
        >
          Cancel vault (full refund)
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1 h-11 sm:h-12 bg-[#0047CC] hover:bg-[#003cb0] text-white font-medium rounded-xl border-0 transition-colors text-sm"
          onClick={() => navigate(vaultDashboardHref)}
        >
          Back to Vault dashboard
        </Button>
      </div>
    </VaultReviewPageLayout>
  );
};

export default VaultEditReview;
