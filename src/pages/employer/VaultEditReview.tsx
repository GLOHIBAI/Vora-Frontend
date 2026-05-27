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
  'The escrow top-up charges automatically — no action required from you',
];

const VaultEditReview: React.FC = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const vaultDashboardHref = jobId ? `/jobs/${jobId}` : '/jobs?tab=Scheduled';

  const data = useMemo(() => {
    const loaded = loadVaultEditReview();
    if (loaded?.changes?.length) return loaded;
    return getDefaultVaultEditReview();
  }, []);

  const showEscrow = data.escrow.adjustment !== 0;

  return (
    <VaultReviewPageLayout backTo={vaultDashboardHref}>
      <ConfirmationHeader
        icon={<ClockIcon size={28} className="text-[#D97706]" strokeWidth={2.3} />}
        iconWrapperClassName="bg-[#FFFBEB] border-[#FDE68A]"
        title="Edit in 48-hour review"
        subtitle={
          <>
            Your specification update for{' '}
            <strong className="text-[#1A1A1A] font-bold">{data.roleTitle}</strong> has been submitted.
            VORA is reviewing the changes. Once confirmed, the new spec takes effect and silent matching
            recalibrates against the updated criteria. Previously pre-qualified candidates are re-scored.
          </>
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

      <Button
        variant="primary"
        fullWidth
        size="md"
        className="bg-[#0047CC] hover:bg-[#003d99] text-white font-bold rounded-full border-0 transition-colors"
        onClick={() => navigate(vaultDashboardHref)}
      >
        Back to Vault dashboard
      </Button>
    </VaultReviewPageLayout>
  );
};

export default VaultEditReview;
