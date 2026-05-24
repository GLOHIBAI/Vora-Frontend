import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationHeader from '../../components/common/ConfirmationHeader';
import { CardTitle } from '../../components/common/Typography';
import KeyValueBanner from '../../components/common/KeyValueBanner';
import Timeline from '../../components/common/Timeline';
import SummaryRowsCard from '../../components/common/SummaryRowsCard';
import StatGrid from '../../components/common/StatGrid';
import Button from '../../components/common/Button';
import { LockIcon } from '../../components/common/Icons';
import { DEFAULT_VAULT_TIMELINE } from '../../constants/vaultConfirmation';
import { buildVaultConfirmationData, loadVaultConfirmation } from '../../utils/vaultConfirmation';

const VaultRoleConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const data = useMemo(() => loadVaultConfirmation() ?? buildVaultConfirmationData(), []);

  const timelineSteps = useMemo(
    () =>
      DEFAULT_VAULT_TIMELINE(
        data.vaultReference,
        data.submittedDateFormatted,
        data.vaultPeriodEndFormatted,
        data.reminderDateFormatted,
        data.goLiveDateFormatted
      ),
    [data]
  );

  return (
    <div className="max-w-[680px] mx-auto pb-16 animate-in fade-in duration-500">
      <ConfirmationHeader
        icon={<LockIcon size={34} className="text-[#1D871D]" strokeWidth={2.5} />}
        title="Your role is in the Vault"
        subtitle="Submission confirmed. Your platform fee is locked in escrow at today's rate. The role is completely invisible — no candidate knows it exists. During the vault period, VORA silently matches every new candidate who joins against your specification. Pre-qualified candidates are ready the moment your role goes live."
      />

      <KeyValueBanner
        items={[
          {
            label: 'Vault reference',
            value: data.vaultReference,
            valueClassName: 'text-[18px] font-semibold text-[#0047CC] tracking-wide',
          },
          {
            label: 'Role',
            value: data.roleTitle,
          },
          {
            label: 'Go-live date',
            value: data.goLiveDateFormatted,
            valueClassName: 'text-[#0047CC]',
          },
        ]}
      />

      <Timeline title="What happens next" steps={timelineSteps} />

      <SummaryRowsCard title="Escrow summary" rows={data.escrowRows} />

      <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 mb-5">
        <CardTitle as="h2" className="text-base mb-1">What you can do during the vault period</CardTitle>
        <p className="text-[13px] text-[#808080] mb-4 leading-relaxed">The role is locked, but you are not locked out.</p>

        <StatGrid
          items={[
            {
              value: String(data.preQualifiedCount),
              label: 'Candidates currently pre-qualified in VORA pool',
            },
            {
              value: String(data.daysUntilGoLive),
              label: 'Days until go-live — time for the pool to grow',
              valueClassName: 'text-[#2CA62C]',
            },
            {
              value: '80%',
              label: 'Minimum match score to enter the pre-qualified list',
              valueClassName: 'text-[#D97706]',
            },
          ]}
        />

        <div className="bg-[#EBF6FF] rounded-lg px-3.5 py-3">
          <p className="text-xs text-[#182348] leading-relaxed">
            The counter above shows the real number — right now it may be zero, and that is honest. Every day, new
            candidates join VORA and complete their onboarding. Each one is silently matched against your specification.
            Those who score 80% or above join your pre-qualified list. They are not told. They are not contacted. On
            your go-live date, they are notified instantly — because matching already ran.{' '}
            <strong className="text-[#0047CC] font-bold">
              The value of scheduling further out is that it gives the pool more time to work in your favour.
            </strong>{' '}
            Check your Vault dashboard any time to see the live count.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          fullWidth
          size="md"
          className="border-[#E6E6E6] text-[#4A4A4A] font-bold"
          onClick={() => navigate('/jobs/vault/edit/scheduled-1')}
        >
          View Vault dashboard
        </Button>
        <Button variant="primary" fullWidth size="md" className="font-bold" onClick={() => navigate('/jobs')}>
          Back to all jobs
        </Button>
      </div>
    </div>
  );
};

export default VaultRoleConfirmation;
