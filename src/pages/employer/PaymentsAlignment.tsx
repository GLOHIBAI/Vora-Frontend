import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AlertBanner from '../../components/common/AlertBanner';
import { PageTitle, SectionDescription } from '../../components/common/Typography';
import PaymentsBreadcrumb from '../../components/payments/PaymentsBreadcrumb';
import AlignmentCandidateCard from '../../components/payments/alignment/AlignmentCandidateCard';
import AlignmentReviewSidebar from '../../components/payments/alignment/AlignmentReviewSidebar';
import HistoricalAlignmentSection from '../../components/payments/alignment/HistoricalAlignmentSection';
import HireAlignmentModal from '../../components/payments/alignment/HireAlignmentModal';
import RejectAlignmentModal from '../../components/payments/alignment/RejectAlignmentModal';
import AlignmentVideoModal from '../../components/payments/alignment/AlignmentVideoModal';
import {
  ALIGNMENT_FEE_AMOUNT,
  PENDING_ALIGNMENT_CANDIDATES,
} from '../../constants/alignmentReview';
import type { AlignmentCandidateData } from '../../types/alignmentReview';
import type { DecisionStatus } from '../../types/employer';

type CandidateId = 'amara' | 'priya';

const PaymentsAlignment: React.FC = () => {
  const [decisions, setDecisions] = useState<
    Record<CandidateId, { status: DecisionStatus; declaredSalary: string }>
  >({
    amara: { status: 'pending', declaredSalary: '' },
    priya: { status: 'pending', declaredSalary: '' },
  });

  const [hireModal, setHireModal] = useState<{
    open: boolean;
    candidate: AlignmentCandidateData | null;
    tempSalary: string;
  }>({ open: false, candidate: null, tempSalary: '' });

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    candidate: AlignmentCandidateData | null;
    reason: string;
    notes: string;
  }>({ open: false, candidate: null, reason: '', notes: '' });

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    candidate: AlignmentCandidateData | null;
  }>({ open: false, candidate: null });

  const totalHeld = useMemo(
    () =>
      PENDING_ALIGNMENT_CANDIDATES.reduce((sum, candidate) => {
        const status = decisions[candidate.id as CandidateId]?.status;
        return sum + (status === 'pending' ? candidate.alignmentFee : 0);
      }, 0),
    [decisions],
  );

  const feeLines = useMemo(
    () =>
      PENDING_ALIGNMENT_CANDIDATES.map((candidate) => ({
        name: candidate.name,
        amount:
          decisions[candidate.id as CandidateId]?.status === 'pending'
            ? candidate.alignmentFee
            : 0,
      })),
    [decisions],
  );

  const openHireModal = useCallback((candidate: AlignmentCandidateData) => {
    const id = candidate.id as CandidateId;
    setHireModal({
      open: true,
      candidate,
      tempSalary: decisions[id]?.declaredSalary ?? '',
    });
  }, [decisions]);

  const confirmHire = useCallback(() => {
    if (!hireModal.candidate) return;
    if (!hireModal.tempSalary.trim()) {
      toast.error('Please declare the final accepted salary to calculate any true-up.');
      return;
    }
    const id = hireModal.candidate.id as CandidateId;
    setDecisions((prev) => ({
      ...prev,
      [id]: { status: 'hired', declaredSalary: hireModal.tempSalary },
    }));
    toast.success(
      `${hireModal.candidate.name} hired successfully! $${ALIGNMENT_FEE_AMOUNT} alignment fee refunded to wallet.`,
    );
    setHireModal({ open: false, candidate: null, tempSalary: '' });
  }, [hireModal]);

  const openRejectModal = useCallback((candidate: AlignmentCandidateData) => {
    setRejectModal({ open: true, candidate, reason: '', notes: '' });
  }, []);

  const confirmReject = useCallback(() => {
    if (!rejectModal.candidate) return;
    if (!rejectModal.reason) {
      toast.error('Please select a rejection reason.');
      return;
    }
    const id = rejectModal.candidate.id as CandidateId;
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'rejected' },
    }));
    toast.success(
      `Rejection submitted for ${rejectModal.candidate.name}. VORA will review your reason within 2 business days.`,
    );
    setRejectModal({ open: false, candidate: null, reason: '', notes: '' });
  }, [rejectModal]);

  const openVideoModal = useCallback((candidate: AlignmentCandidateData) => {
    setVideoModal({ open: true, candidate });
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto py-6 px-4 md:px-0 space-y-8 animate-fadeIn duration-500">
      <PaymentsBreadcrumb current="Alignment Session Review" />

      <div className="flex flex-col gap-1">
        <PageTitle className="text-3xl">Alignment Session Review</PageTitle>
        <SectionDescription className="text-sm text-[#808080] max-w-3xl">
          Review candidates from additional alignment sessions. Full interview scores below. Hire
          for full refund · Reject with valid documented reason for refund · Invalid rejection
          forfeits fee.
        </SectionDescription>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6">
          <AlertBanner variant="blue" className="!text-xs">
            <strong>Alignment fee policy:</strong> $150 per additional session (beyond standard
            interview). <strong>Hire</strong> → full auto-refund.{' '}
            <strong>Reject with valid documented reason</strong> → VORA reviews within 2 days →
            refund if valid. <strong>Reject without valid reason</strong> → fee forfeited + account
            warning issued.
          </AlertBanner>

          {PENDING_ALIGNMENT_CANDIDATES.map((candidate) => {
            const id = candidate.id as CandidateId;
            return (
              <AlignmentCandidateCard
                key={candidate.id}
                candidate={candidate}
                status={decisions[id].status}
                onReject={() => openRejectModal(candidate)}
                onHire={() => openHireModal(candidate)}
                onPlayVideo={() => openVideoModal(candidate)}
              />
            );
          })}

          <HistoricalAlignmentSection />
        </div>

        <AlignmentReviewSidebar feeLines={feeLines} totalHeld={totalHeld} />
      </div>

      <HireAlignmentModal
        open={hireModal.open}
        candidateName={hireModal.candidate?.name ?? ''}
        reference={hireModal.candidate?.reference ?? ''}
        alignmentFee={hireModal.candidate?.alignmentFee ?? ALIGNMENT_FEE_AMOUNT}
        salary={hireModal.tempSalary}
        onSalaryChange={(value) => setHireModal((prev) => ({ ...prev, tempSalary: value }))}
        onClose={() => setHireModal({ open: false, candidate: null, tempSalary: '' })}
        onConfirm={confirmHire}
      />

      <RejectAlignmentModal
        open={rejectModal.open}
        candidateName={rejectModal.candidate?.name ?? ''}
        alignmentFee={rejectModal.candidate?.alignmentFee ?? ALIGNMENT_FEE_AMOUNT}
        reason={rejectModal.reason}
        notes={rejectModal.notes}
        onReasonChange={(value) => setRejectModal((prev) => ({ ...prev, reason: value }))}
        onNotesChange={(value) => setRejectModal((prev) => ({ ...prev, notes: value }))}
        onClose={() => setRejectModal({ open: false, candidate: null, reason: '', notes: '' })}
        onConfirm={confirmReject}
      />

      <AlignmentVideoModal
        open={videoModal.open}
        title={`${videoModal.candidate?.name ?? ''}, Video Interview`}
        sessionLabel={videoModal.candidate?.video.videoCaption ?? ''}
        onClose={() => setVideoModal({ open: false, candidate: null })}
      />
    </div>
  );
};

export default PaymentsAlignment;
