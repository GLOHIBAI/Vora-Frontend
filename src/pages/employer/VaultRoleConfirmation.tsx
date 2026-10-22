import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import VaultReviewPageLayout from '../../components/vault/VaultReviewPageLayout';
import ConfirmationHeader from '../../components/common/ConfirmationHeader';
import { CardTitle } from '../../components/common/Typography';
import KeyValueBanner from '../../components/common/KeyValueBanner';
import Timeline from '../../components/common/Timeline';
import SummaryRowsCard from '../../components/common/SummaryRowsCard';
import StatGrid from '../../components/common/StatGrid';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { LockIcon } from '../../components/common/Icons';
import { DEFAULT_VAULT_TIMELINE } from '../../constants/vaultConfirmation';
import {
  useGetRolePostingQuery,
  useVaultPreQualifiedCountQuery,
} from '../../services/queries/rolePostings';

const isValidUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

const truncateUuid = (id: string): string => {
  if (!id || id.length < 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
};

const formatDisplayDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Not scheduled';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Not scheduled';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatToday = (): string => formatDisplayDate(new Date().toISOString().slice(0, 10));

const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (from: string, to: string): number => {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const VaultRoleConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramRoleId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const roleId = paramRoleId || searchParams.get('roleId') || (location.state as any)?.roleId || '';
  const isUuid = isValidUuid(roleId);

  const { data: roleResponse, isLoading: isRoleLoading } = useGetRolePostingQuery(roleId, {
    enabled: isUuid,
  });

  const { data: preQualifiedData } = useVaultPreQualifiedCountQuery(roleId, {
    enabled: isUuid,
  });

  const roleData: any = roleResponse?.data || {};

  const today = new Date().toISOString().slice(0, 10);
  const rawGoLive = roleData.scheduledGoLiveDate;
  const hasGoLive = Boolean(rawGoLive && !Number.isNaN(new Date(rawGoLive).getTime()));
  const isPastGoLive = hasGoLive && new Date(rawGoLive) < new Date(today);

  const goLiveFormatted = hasGoLive && !isPastGoLive ? formatDisplayDate(rawGoLive) : 'Not scheduled';
  const submittedDateFormatted = formatToday();
  const reminderDate = hasGoLive && !isPastGoLive ? formatDisplayDate(addDays(rawGoLive, -3)) : '3 days prior to go-live';
  const vaultPeriodEnd = hasGoLive && !isPastGoLive ? formatDisplayDate(addDays(rawGoLive, -3)) : 'Go-live window';

  const roleTitle = roleData.roleTitle || 'Vault Role';
  const vaultReference = roleData.roleLink || (isUuid ? roleId : 'Locked in Vault');

  const preQualifiedCount =
    (preQualifiedData as any)?.data?.count ?? (preQualifiedData as any)?.count ?? 0;
  const daysUntilGoLive = hasGoLive && !isPastGoLive ? daysBetween(today, rawGoLive) : 0;

  const positions = roleData.positionsAvailable || 1;
  const currency = roleData.currency || 'USD';
  const salMin = Number(roleData.salaryMin) || 0;
  const salMax = Number(roleData.salaryMax) || 0;
  const midpoint = salMin && salMax ? Math.round((salMin + salMax) / 2) : (salMax || salMin || 0);

  const escrowRows = useMemo(() => [
    { label: 'Salary midpoint', value: `${currency} ${midpoint.toLocaleString('en-US')}` },
    { label: 'Positions', value: `${positions} ${positions === 1 ? 'position' : 'positions'}` },
    { label: 'Role status', value: 'Vault (Invisible to candidates)' },
    {
      label: 'Scheduled go-live',
      value: goLiveFormatted,
    },
  ], [currency, midpoint, positions, goLiveFormatted]);

  const timelineSteps = useMemo(
    () =>
      DEFAULT_VAULT_TIMELINE(
        vaultReference,
        submittedDateFormatted,
        vaultPeriodEnd,
        reminderDate,
        goLiveFormatted
      ),
    [vaultReference, submittedDateFormatted, vaultPeriodEnd, reminderDate, goLiveFormatted]
  );

  if (isRoleLoading) {
    return (
      <VaultReviewPageLayout backTo="/jobs" backLabel="Jobs">
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size={32} className="text-[#0047CC]" />
          <p className="text-[13px] font-medium text-gray-500">Loading role details…</p>
        </div>
      </VaultReviewPageLayout>
    );
  }

  const backToHref = isUuid ? `/jobs/${roleId}` : '/jobs';

  return (
    <VaultReviewPageLayout backTo={backToHref} backLabel="Vault dashboard">
      <ConfirmationHeader
        icon={<LockIcon size={28} className="text-emerald-700" strokeWidth={2.3} />}
        iconWrapperClassName="bg-emerald-50 border-emerald-200"
        title="Your role is in the Vault"
        subtitle="Submission confirmed. Your platform fee is locked in escrow at today's rate. The role is completely invisible to candidates. Silent matching runs against every new profile, building pre-qualified candidates ready the moment your role goes live."
      />

      <KeyValueBanner
        items={[
          {
            label: 'Role reference',
            value: (
              <span className="text-sm font-medium text-slate-800" title={vaultReference}>
                {truncateUuid(vaultReference)}
              </span>
            ),
          },
          {
            label: 'Role',
            value: <span className="text-slate-900 font-semibold">{roleTitle}</span>,
          },
          {
            label: 'Go-live date',
            value: (
              <span className={goLiveFormatted === 'Not scheduled' ? 'text-slate-400 font-normal' : 'text-slate-900 font-semibold'}>
                {goLiveFormatted}
              </span>
            ),
          },
        ]}
      />

      <Timeline title="What happens next" steps={timelineSteps} />

      <SummaryRowsCard title="Role summary" rows={escrowRows} />

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
        <CardTitle as="h2" className="text-base font-semibold text-slate-900 mb-1">
          What you can do during the vault period
        </CardTitle>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">The role is locked, but you are not locked out.</p>

        <StatGrid
          items={[
            {
              value: String(preQualifiedCount),
              label: 'Candidates currently pre-qualified in VORA pool',
              valueClassName: 'text-slate-900',
            },
            {
              value: String(daysUntilGoLive),
              label: 'Days until go-live, time for the pool to grow',
              valueClassName: 'text-slate-900',
            },
            {
              value: '80%',
              label: 'Minimum match score to enter the pre-qualified list',
              valueClassName: 'text-slate-900',
            },
          ]}
        />

        <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 mt-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            The counter above shows the real number of pre-qualified candidates in real time. As new talent joins VORA and completes onboarding, candidates scoring 80% or higher automatically join your pre-qualified list.{' '}
            <strong className="text-slate-900 font-semibold">
              The value of scheduling further out is that it gives the pool more time to work in your favour.
            </strong>{' '}
            Check your Vault dashboard any time to monitor your live count.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Button
          variant="outline"
          fullWidth
          size="md"
          className="h-11 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 text-sm"
          onClick={() => {
            if (isUuid) {
              navigate(`/jobs/vault/edit/${roleId}`);
            } else {
              navigate('/jobs');
            }
          }}
        >
          Edit role specification
        </Button>
        <Button
          variant="primary"
          fullWidth
          size="md"
          className="h-11 bg-[#0047CC] hover:bg-[#003cb0] text-white font-medium rounded-xl text-sm"
          onClick={() => navigate(backToHref)}
        >
          View in Vault dashboard
        </Button>
      </div>
    </VaultReviewPageLayout>
  );
};

export default VaultRoleConfirmation;
