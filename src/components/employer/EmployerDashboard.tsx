import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  BellIcon,
  PlusIcon,
  BriefcaseIcon,
  UsersIcon,
  CreditCardIcon,
  AlertTriangleIcon,
  CheckIcon,
  TrendingUpIcon,
  ClockIcon,
  ChevronRightIcon,
  WalletIcon,
  CalendarIcon,
  InfoIcon,
  VideoIcon,
} from '../common/Icons';
import PostJobWizard from './PostJobWizard';
import PostJobModal from './PostJobModal';
import Tag from '../common/Tag';
import Button from '../common/Button';
import FullPageSpinner from '../common/FullPageSpinner';
import { useAuth } from '../../context/AuthContext';
import { useEmployerDashboardQuery } from '../../services/queries/employer';
import type {
  ActivityIconType,
  BannerAlertActionType,
  JobDisplayStatus,
  AlignmentSessionStatus,
} from '../../services/queries/employer/types';
import type { PostJobContinueConfig } from '../../types/rolePosting';

// --- Sub-components for Redesigned Employer Dashboard ---

const SectionHeader: React.FC<{ title: string; linkText?: string; onLinkClick?: () => void; badge?: React.ReactNode }> = ({
  title,
  linkText,
  onLinkClick,
  badge,
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">{title}</h3>
      {badge}
    </div>
    {linkText && (
      <button
        onClick={onLinkClick}
        className="text-[12px] font-medium text-[#0047CC] hover:text-[#0037a8] hover:underline flex items-center gap-1 group cursor-pointer bg-transparent border-none transition-colors"
      >
        {linkText}
        <ChevronRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

const mapActivityIcon = (iconType?: ActivityIconType | string) => {
  switch (iconType) {
    case 'warning':
      return { icon: AlertTriangleIcon, bg: 'bg-rose-50 border-rose-100', color: 'text-rose-600' };
    case 'success':
      return { icon: CheckIcon, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-600' };
    case 'calendar':
      return { icon: CalendarIcon, bg: 'bg-purple-50 border-purple-100', color: 'text-purple-600' };
    case 'wallet':
      return { icon: WalletIcon, bg: 'bg-blue-50 border-blue-100', color: 'text-[#0047CC]' };
    case 'info':
      return { icon: InfoIcon, bg: 'bg-slate-50 border-slate-100', color: 'text-slate-600' };
    case 'briefcase':
    default:
      return { icon: BriefcaseIcon, bg: 'bg-blue-50 border-blue-100', color: 'text-[#0047CC]' };
  }
};

const mapJobBadgeVariant = (displayStatus?: JobDisplayStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
  switch (displayStatus) {
    case 'Live':
      return 'green';
    case 'Alignment':
      return 'blue';
    case 'Vault':
      return 'blue';
    case 'Draft':
      return 'yellow';
    case 'Closed':
      return 'gray';
    case 'Under Review':
      return 'yellow';
    default:
      return 'gray';
  }
};

const mapAlignmentBadgeVariant = (status?: AlignmentSessionStatus): 'blue' | 'gray' | 'green' => {
  switch (status) {
    case 'SCHEDULED':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'AWAITING_CONFIRMATION':
    default:
      return 'gray';
  }
};

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [isPostWizardOpen, setIsPostWizardOpen] = React.useState(false);
  const [wizardConfig, setWizardConfig] = React.useState<PostJobContinueConfig | undefined>(undefined);

  const { data: dashboard, isLoading } = useEmployerDashboardQuery();

  // Computed Greeting Data
  const greeting = useMemo(() => {
    const defaultDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return {
      date: dashboard?.greeting?.date || defaultDate,
      welcomeMessage:
        dashboard?.greeting?.welcomeMessage ||
        `Welcome back, ${user?.firstName || 'Employer'}`,
      unreadAlertsCount: dashboard?.greeting?.unreadAlertsCount ?? 0,
    };
  }, [dashboard, user]);

  // Urgent Alert Banner Routing
  const handleBannerAction = (actionType?: BannerAlertActionType, hireId?: string, checkInId?: string) => {
    switch (actionType) {
      case 'COMPLETE_CHECK_IN':
        if (hireId && checkInId) {
          navigate(`/employer/check-in/${hireId}/${checkInId}`);
        } else if (hireId) {
          navigate(`/employer/check-in/${hireId}`);
        } else {
          navigate('/jobs');
        }
        break;
      case 'SET_BENCHMARKS':
        if (hireId) {
          navigate(`/employer/benchmarks/${hireId}`);
        } else {
          navigate('/jobs');
        }
        break;
      case 'VIEW_PIPELINE':
        navigate('/jobs');
        break;
      case 'VIEW_TRUE_UP':
        navigate('/payments');
        break;
      default:
        navigate('/jobs');
        break;
    }
  };

  // Helper to format currency values dynamically
  const formatMoney = (amount?: number | string, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '$0.00';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    if (isNaN(num)) return String(amount);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: num % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const rawMetrics = dashboard?.metrics;
    const rawWallet = dashboard?.walletEscrow;

    // Active Jobs (LIVE only)
    const activeJobsCount =
      rawMetrics?.activeJobs?.count ??
      (typeof rawMetrics?.activeJobs?.value === 'number' ? rawMetrics.activeJobs.value : undefined) ??
      dashboard?.activeJobs?.totalCount ??
      dashboard?.activeJobs?.items?.filter((j) => {
        const s = (j.status || '').toUpperCase();
        const d = (j.displayStatus || '').toUpperCase();
        return (s === 'LIVE' || s === 'ACTIVE' || d === 'LIVE' || d === 'ACTIVE') && s !== 'DRAFT' && s !== 'SCHEDULED' && s !== 'VAULT' && s !== 'CLOSED' && s !== 'UNDER_REVIEW';
      }).length ??
      0;

    // Total Applicants
    const applicantsCount =
      rawMetrics?.totalApplicants?.count ??
      (typeof rawMetrics?.totalApplicants?.value === 'number' ? rawMetrics.totalApplicants.value : undefined) ??
      0;

    // Alignment Sessions
    const alignmentCount =
      rawMetrics?.alignmentSessions?.count ??
      (typeof rawMetrics?.alignmentSessions?.value === 'number' ? rawMetrics.alignmentSessions.value : undefined) ??
      dashboard?.alignmentSessions?.totalCount ??
      dashboard?.alignmentSessions?.items?.length ??
      0;

    // Wallet Balance
    const walletBalanceAmount =
      rawMetrics?.walletBalance?.amount ??
      rawWallet?.availableBalance ??
      (typeof rawMetrics?.walletBalance?.value === 'number' ? rawMetrics.walletBalance.value : undefined) ??
      0;
    const walletCurrency =
      rawMetrics?.walletBalance?.currency ??
      rawWallet?.currency ??
      'USD';
    const walletBalanceDisplay =
      rawMetrics?.walletBalance?.formatted ||
      rawWallet?.availableBalanceFormatted ||
      (typeof rawMetrics?.walletBalance?.value === 'string' && rawMetrics.walletBalance.value.startsWith('$')
        ? rawMetrics.walletBalance.value
        : formatMoney(walletBalanceAmount, walletCurrency));

    return {
      activeJobs: {
        value: activeJobsCount,
        label: 'Active Listings',
      },
      totalApplicants: {
        value: applicantsCount,
        label: 'Total Candidates in Pipeline',
      },
      alignmentSessions: {
        value: alignmentCount,
        label: 'Alignment Sessions',
      },
      walletBalance: {
        value: walletBalanceDisplay,
        rawAmount: walletBalanceAmount,
        label: 'Available Wallet',
      },
    };
  }, [dashboard]);

  // Post-Hire Check-Ins
  const checkIns = useMemo(() => {
    return dashboard?.checkIns?.items ?? [];
  }, [dashboard]);

  // Active Jobs (LIVE only - drafts, scheduled/vault, under review, and closed are excluded)
  const activeJobs = useMemo(() => {
    const rawItems = dashboard?.activeJobs?.items ?? [];
    return rawItems
      .filter((job) => {
        const s = (job.status || '').toUpperCase();
        const d = (job.displayStatus || '').toUpperCase();
        if (
          s === 'DRAFT' ||
          s === 'SCHEDULED' ||
          s === 'VAULT' ||
          s === 'CLOSED' ||
          s === 'UNDER_REVIEW' ||
          s === 'EXPIRED' ||
          s === 'CANCELLED' ||
          d === 'DRAFT' ||
          d === 'SCHEDULED' ||
          d === 'VAULT' ||
          d === 'CLOSED' ||
          d === 'UNDER REVIEW'
        ) {
          return false;
        }
        return s === 'LIVE' || s === 'ACTIVE' || d === 'LIVE' || d === 'ACTIVE' || (!s && !d);
      })
      .map((job) => ({
        ...job,
        status: 'LIVE',
        displayStatus: 'Live' as JobDisplayStatus,
      }));
  }, [dashboard]);

  // Alignment Sessions
  const alignmentSessions = useMemo(() => {
    return dashboard?.alignmentSessions?.items ?? [];
  }, [dashboard]);

  // Recent Activity (Job events only for LIVE roles with non-empty title; formatted with em dash)
  const recentActivity = useMemo(() => {
    const rawItems = dashboard?.recentActivity?.items ?? [];
    return rawItems
      .filter((act) => {
        if (act.type === 'JOB_POSTED') {
          const rawTitle = act.title || '';
          const cleanedTitle = rawTitle.replace(/^New job posted\s*[—–-]\s*/i, '').trim();
          if (!cleanedTitle || cleanedTitle.toLowerCase() === 'untitled role' || cleanedTitle.toLowerCase() === 'untitled draft') {
            return false;
          }
          const status = ((act as any).status || '').toUpperCase();
          if (status && status !== 'LIVE' && status !== 'ACTIVE') {
            return false;
          }
        }
        return true;
      })
      .map((act) => {
        if (act.type === 'JOB_POSTED') {
          const rawTitle = act.title || '';
          const roleTitle = rawTitle.replace(/^New job posted\s*[—–-]\s*/i, '').trim();
          return {
            ...act,
            title: `New job posted — ${roleTitle}`,
          };
        }
        return act;
      });
  }, [dashboard]);

  // Wallet / Escrow Breakdown
  const walletEscrow = useMemo(() => {
    const w = dashboard?.walletEscrow;
    const currency = w?.currency || dashboard?.metrics?.walletBalance?.currency || 'USD';
    const breakdown = w?.escrowBreakdown;

    const inEscrowVal = breakdown?.inEscrowLocked ?? w?.inEscrow ?? 0;
    const feesVal = breakdown?.alignmentFeesPending ?? w?.alignmentFeesPending ?? 0;
    const trueUpVal = breakdown?.trueUpOwed ?? w?.trueUpOwed ?? 0;
    const committedVal = breakdown?.totalCommitted ?? w?.totalCommitted ?? 0;
    const availableVal = w?.availableBalance ?? dashboard?.metrics?.walletBalance?.amount ?? 0;

    const holder =
      w?.walletHolderName ||
      (user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Employer');
    const label = w?.walletLabel || `VORA Employer Wallet · ${holder}`;

    return {
      availableBalance: w?.availableBalanceFormatted || formatMoney(availableVal, currency),
      walletLabel: label,
      walletHolderName: holder,
      inEscrow: w?.inEscrowFormatted || formatMoney(inEscrowVal, currency),
      alignmentFeesPending: w?.alignmentFeesPendingFormatted || formatMoney(feesVal, currency),
      trueUpOwed: w?.trueUpOwedFormatted || formatMoney(trueUpVal, currency),
      totalCommitted: w?.totalCommittedFormatted || formatMoney(committedVal, currency),
    };
  }, [dashboard, user]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  const bannerAlert = dashboard?.bannerAlert;
  const hasUrgentAlert = bannerAlert?.hasUrgentAlert && bannerAlert?.alert;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Consolidated Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 font-normal mt-0.5">
            {greeting.date} · <span className="text-slate-700 font-medium">{greeting.welcomeMessage}</span>
          </p>
        </div>

        {/* Consolidated Action Cluster: Bell & Single Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            title="Notifications & Alerts"
            className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
          >
            <BellIcon size={16} />
            {greeting.unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {greeting.unreadAlertsCount}
              </span>
            )}
          </button>

          <Button
            onClick={() => setIsPostModalOpen(true)}
            fullWidth={false}
            className="px-4 py-2.5 min-h-[40px] text-[13px] font-semibold bg-[#0047CC] hover:bg-[#0037a8] text-white rounded-xl shadow-sm transition-all"
          >
            <PlusIcon size={15} strokeWidth={2.5} />
            <span>Post a Job</span>
          </Button>
        </div>
      </div>

      {/* Red Urgent Alert Banner (if any) */}
      {hasUrgentAlert && bannerAlert.alert && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-xs">
          <div className="p-2 bg-white rounded-xl shrink-0 shadow-xs border border-rose-100">
            <AlertTriangleIcon size={18} className="text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-rose-900 leading-snug">
              {bannerAlert.alert.title || 'Action Required'}
            </p>
            <p className="text-[12px] text-rose-700 mt-0.5 leading-relaxed">
              {bannerAlert.alert.message}
            </p>
          </div>
          <button
            onClick={() =>
              handleBannerAction(
                bannerAlert.alert?.actionType,
                bannerAlert.alert?.hireId,
                bannerAlert.alert?.checkInId
              )
            }
            className="px-4 py-1.5 bg-rose-600 text-white text-[12px] font-medium rounded-lg hover:bg-rose-700 transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-xs"
          >
            {bannerAlert.alert.actionLabel || 'Take Action'}
          </button>
        </div>
      )}

      {/* 4 Balanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Active Jobs */}
        <div
          onClick={() => navigate('/jobs?status=LIVE')}
          className="bg-white border border-slate-200/80 hover:border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-slate-600">Active Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#0047CC] group-hover:scale-105 transition-transform">
              <BriefcaseIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-[28px] lg:text-[32px] font-semibold text-slate-900 tracking-tight leading-none tabular-nums mb-1">
              {metrics.activeJobs.value}
            </p>
            <p className="text-[12px] text-slate-400 font-medium">
              Live published roles
            </p>
          </div>
        </div>

        {/* Total Applicants */}
        <div
          onClick={() => navigate('/jobs')}
          className="bg-white border border-blue-100/90 hover:border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-slate-600">Total Applicants</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#0047CC] group-hover:scale-105 transition-transform">
              <UsersIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-[28px] lg:text-[32px] font-semibold text-slate-900 tracking-tight leading-none tabular-nums mb-1">
              {metrics.totalApplicants.value}
            </p>
            <p className="text-[12px] text-slate-400 font-medium">
              Across active listings
            </p>
          </div>
        </div>

        {/* Alignment Sessions */}
        <div
          onClick={() => navigate('/jobs')}
          className="bg-white border border-slate-200/80 hover:border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-slate-600">Alignment Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-105 transition-transform">
              <VideoIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-[28px] lg:text-[32px] font-semibold text-slate-900 tracking-tight leading-none tabular-nums mb-1">
              {metrics.alignmentSessions.value}
            </p>
            <p className="text-[12px] text-slate-400 font-medium">
              Sessions scheduled
            </p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div
          onClick={() => navigate('/payments')}
          className="bg-white border border-slate-200/80 hover:border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-slate-600">Wallet Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <WalletIcon size={16} />
            </div>
          </div>
          <div>
            <p className="text-[28px] lg:text-[32px] font-semibold text-slate-900 tracking-tight leading-none tabular-nums mb-1">
              {metrics.walletBalance.value}
            </p>
            <p className="text-[12px] text-slate-400 font-medium">
              Available to deploy
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 8 cols Primary Feeds, 4 cols Treasury & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Active Jobs, Alignment, Recent Activity */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Active Jobs Card with Visual Anchors */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">Active Jobs</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {activeJobs.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/jobs?status=LIVE')}
                className="text-[12px] font-medium text-[#0047CC] hover:text-[#0037a8] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                View all listings <ChevronRightIcon size={12} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeJobs.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                    <BriefcaseIcon size={18} />
                  </div>
                  <p className="text-[13px] font-medium text-slate-700">No active job listings</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                    Click "Post a Job" in the header to create your first listing.
                  </p>
                </div>
              ) : (
                activeJobs.map((job, i) => {
                  const roleTitle = job.roleTitle || job.title || 'Untitled Role';
                  const appCount = Number(job.applicantCount ?? job.applicantsCount ?? job.applicants ?? 0);
                  
                  // Extract monogram (e.g. "BE" for Backend Engineer)
                  const initials = roleTitle
                    .split(' ')
                    .filter(Boolean)
                    .map(w => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={job.id || i}
                      onClick={() => navigate(job.id ? `/jobs/${job.id}` : '/jobs')}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-all cursor-pointer group"
                    >
                      {/* Role Monogram Badge */}
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#0047CC] font-bold text-[12px] flex items-center justify-center shrink-0">
                        {initials}
                      </div>

                      {/* Job Title & Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-[#0047CC] transition-colors">
                          {roleTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {[job.departmentOrUnit, job.location || 'Remote', `Posted ${job.postedDate || 'Recent'}`].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      {/* Applicant Count & Static Live Tag */}
                      <div className="text-right shrink-0 flex items-center gap-3">
                        <p className="text-[12px] font-medium text-slate-700 tabular-nums">
                          {appCount} <span className="text-[11px] text-slate-400 font-normal">applicants</span>
                        </p>

                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Live
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clean Drafts Link */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Looking for unpublished drafts?</span>
              <button
                onClick={() => navigate('/jobs?status=DRAFT')}
                className="font-semibold text-[#0047CC] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                View drafts <ChevronRightIcon size={11} />
              </button>
            </div>
          </div>

          {/* Alignment Sessions (Compact) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">Alignment Sessions</h3>
                {alignmentSessions.length > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {alignmentSessions.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="text-[12px] font-medium text-[#0047CC] hover:text-[#0037a8] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                Full view <ChevronRightIcon size={12} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {alignmentSessions.length === 0 ? (
                <div className="p-6 flex items-center gap-4 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <VideoIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-800">No alignment sessions scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sessions will appear here once candidates complete dimensional screenings and schedule alignment.
                    </p>
                  </div>
                </div>
              ) : (
                alignmentSessions.map((session, i) => {
                  const candidateName = session.candidateName || session.name || 'Candidate';
                  const initials =
                    session.initial ||
                    candidateName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                  return (
                    <div key={session.id || i} className="flex items-center gap-3.5 p-4 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div
                        className={`w-9 h-9 rounded-xl ${
                          session.initialBg || 'bg-blue-600'
                        } text-white flex items-center justify-center font-bold text-[11px] shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-[#0047CC] transition-colors">
                          {candidateName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {session.roleTitle || session.role || 'Candidate'}
                        </p>
                      </div>
                      <Tag
                        label={session.statusLabel || session.status || 'Scheduled'}
                        variant={mapAlignmentBadgeVariant(session.status)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">Recent Activity</h3>
              <button
                onClick={() => navigate('/jobs')}
                className="text-[12px] font-medium text-[#0047CC] hover:text-[#0037a8] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                View all <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-slate-400">
                  No recent activity recorded yet
                </div>
              ) : (
                recentActivity.map((act, i) => {
                  const iconConfig = mapActivityIcon(act.iconType);
                  const IconComp = iconConfig.icon;
                  return (
                    <div key={act.id || i} className="flex items-center gap-3.5 p-4 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div
                        className={`w-8 h-8 rounded-lg ${iconConfig.bg} border flex items-center justify-center shrink-0`}
                      >
                        <IconComp size={14} className={act.iconColor || iconConfig.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-900 truncate">{act.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {act.subtitle || act.sub || ''}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0 tabular-nums">
                        {act.relativeTime || act.timestamp || act.time || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Unified Treasury & Escrow Card, Post-Hire, Account */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* UNIFIED TREASURY & ESCROW CARD (Fixing the Data Trust Issue) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Header with Security Badge */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Treasury & Escrow</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{walletEscrow.walletLabel}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100">
                Secured Vault
              </span>
            </div>

            {/* Contextual Data-Trust Explainer */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">How funds work:</span> Available wallet balance is allocated into escrow upon hire confirmation to guarantee talent milestone payouts.
            </div>

            {/* Mini Flow: Wallet -> Escrow Commitment */}
            <div className="space-y-4">
              {/* Available Balance Subsection with Direct Top-Up Action */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium tracking-wider uppercase text-slate-500">
                    Available Wallet
                  </p>
                  <p className="text-[24px] font-bold tracking-tight text-slate-900 tabular-nums mt-0.5">
                    {walletEscrow.availableBalance}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 bg-[#0047CC] hover:bg-[#0037a8] text-white text-[12px] font-medium rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Top Up
                </button>
              </div>

              {/* Escrow Commitment Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500 font-medium">In Escrow (Locked)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{walletEscrow.inEscrow}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500 font-medium">Alignment Fees Pending</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{walletEscrow.alignmentFeesPending}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-500 font-medium">True-Up Owed</span>
                  <span className="font-semibold text-slate-500 tabular-nums">{walletEscrow.trueUpOwed}</span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[13px]">
                  <span className="font-semibold text-slate-900">Total Committed</span>
                  <span className="font-bold text-[#0047CC] tabular-nums text-[15px]">
                    {walletEscrow.totalCommitted}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Ledger Navigation Link */}
            <button
              onClick={() => navigate('/payments')}
              className="w-full py-2.5 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[12px] font-semibold rounded-xl transition-all cursor-pointer"
            >
              View Full Payment Overview
            </button>
          </div>

          {/* Post-Hire Tracking Widget (Compact) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <SectionHeader
              title="Post-Hire Check-ins"
              linkText="View all"
              onLinkClick={() => navigate('/jobs')}
              badge={
                (dashboard?.checkIns?.overdueCount ?? checkIns.filter((c) => c.status === 'OVERDUE').length) > 0 ? (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {dashboard?.checkIns?.overdueCount ?? checkIns.filter((c) => c.status === 'OVERDUE').length} overdue
                  </span>
                ) : null
              }
            />

            <div className="space-y-3">
              {checkIns.length === 0 ? (
                <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ClockIcon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-slate-800">All check-ins up to date</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Milestone checks appear here upon hire start dates.
                    </p>
                  </div>
                </div>
              ) : (
                checkIns.map((item, idx) => {
                  const initials =
                    item.candidateInitials ||
                    item.candidateName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                  const isOverdue = item.status === 'OVERDUE';
                  const isPending = item.status === 'BENCHMARKS_PENDING' || item.status === 'DUE_SOON';

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-3.5 rounded-xl border ${
                        isOverdue
                          ? 'bg-rose-50/60 border-rose-200'
                          : isPending
                          ? 'bg-blue-50/50 border-blue-100'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg ${
                            isOverdue
                              ? 'bg-rose-600'
                              : isPending
                              ? 'bg-[#0047CC]'
                              : 'bg-emerald-600'
                          } text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-900 truncate">{item.candidateName}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {item.dueText || (isOverdue ? 'Check-in overdue' : 'Scheduled')}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-semibold uppercase ${
                            isOverdue ? 'text-rose-600' : isPending ? 'text-[#0047CC]' : 'text-emerald-700'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {item.action === 'COMPLETE_CHECK_IN' && (
                        <button
                          onClick={() => handleBannerAction('COMPLETE_CHECK_IN', item.hireId, item.checkInId)}
                          className="w-full py-1.5 bg-rose-600 text-white text-[11px] font-semibold rounded-lg hover:bg-rose-700 transition-all cursor-pointer"
                        >
                          {item.actionLabel || 'Complete Check-in'}
                        </button>
                      )}

                      {item.action === 'SET_BENCHMARKS' && (
                        <button
                          onClick={() => handleBannerAction('SET_BENCHMARKS', item.hireId)}
                          className="w-full py-1.5 bg-[#0047CC] text-white text-[11px] font-semibold rounded-lg hover:bg-[#0037a8] transition-all cursor-pointer"
                        >
                          {item.actionLabel || 'Set Benchmarks'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Account & Settings Shortcuts (Clean 2x2 Grid) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <SectionHeader title="Account & Settings" linkText="Manage" onLinkClick={() => navigate('/settings')} />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  label: 'Profile',
                  sub: dashboard?.account?.profile?.organisationName || user?.firstName || 'Organization',
                  icon: UserIcon,
                  path: '/settings',
                },
                {
                  label: 'Billing Tier',
                  sub: dashboard?.account?.billing?.tier
                    ? dashboard.account.billing.tier.replace(/_/g, ' ')
                    : 'Enterprise',
                  icon: TrendingUpIcon,
                  path: '/payments',
                },
                {
                  label: 'Payments & Escrow',
                  sub: 'Ledger & receipts',
                  icon: CreditCardIcon,
                  path: '/payments',
                },
                {
                  label: 'Team Access',
                  sub: dashboard?.account?.team?.memberCount
                    ? `${dashboard.account.team.memberCount} members`
                    : 'Manage seats',
                  icon: UsersIcon,
                  path: '/settings',
                },
              ].map((tile, i) => (
                <div
                  key={i}
                  onClick={() => navigate(tile.path)}
                  className="p-3 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all cursor-pointer group"
                >
                  <tile.icon size={15} className="text-[#0047CC] mb-2" />
                  <p className="text-[12px] font-semibold text-slate-900 leading-tight group-hover:text-[#0047CC] transition-colors">{tile.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{tile.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PostJobModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onContinue={(config) => {
          setIsPostModalOpen(false);
          setWizardConfig(config);
          setIsPostWizardOpen(true);
        }}
      />

      <PostJobWizard
        isOpen={isPostWizardOpen}
        onClose={() => setIsPostWizardOpen(false)}
        initialConfig={wizardConfig}
      />
    </div>
  );
};

export default EmployerDashboard;
