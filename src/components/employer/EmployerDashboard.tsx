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
import EmptyState from '../common/EmptyState';
import FullPageSpinner from '../common/FullPageSpinner';
import { useAuth } from '../../context/AuthContext';
import { useEmployerDashboardQuery } from '../../services/queries/employer';
import type {
  ActivityIconType,
  BannerAlertActionType,
  CheckInStatus,
  JobDisplayStatus,
  AlignmentSessionStatus,
} from '../../services/queries/employer/types';
import type { PostJobContinueConfig } from '../../types/rolePosting';

// --- Sub-components for Employer Dashboard ---

const KPICard: React.FC<{
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'up' | 'warn';
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
}> = ({ label, value, delta, deltaType, icon: Icon, bgColor, iconColor, onClick }) => (
  <div
    className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group"
    onClick={onClick}
  >
    <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={18} className={iconColor} />
    </div>
    <p className="text-[24px] lg:text-[30px] font-medium text-gray-900 leading-none mb-1">{value}</p>
    <p className="text-[13px] font-medium text-gray-500">{label}</p>
    {delta && (
      <p className={`text-[11px] font-medium mt-2 ${deltaType === 'up' ? 'text-green-600' : 'text-gray-400'}`}>
        {deltaType === 'up' ? '↑' : '↓'} {delta}
      </p>
    )}
  </div>
);

const QuickActionBtn: React.FC<{
  label: string;
  sub: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
}> = ({ label, sub, icon: Icon, bgColor, iconColor, onClick }) => (
  <button
    className="bg-white border border-gray-100 rounded-[14px] p-4 flex items-center gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all group text-left cursor-pointer"
    onClick={onClick}
  >
    <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-medium text-gray-900 truncate">{label}</p>
      <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">{sub}</p>
    </div>
  </button>
);

const SectionHeader: React.FC<{ title: string; linkText?: string; onLinkClick?: () => void }> = ({
  title,
  linkText,
  onLinkClick,
}) => (
  <div className="flex items-center justify-between mb-5 px-1">
    <h3 className="text-[16px] font-medium text-gray-900 tracking-tight">{title}</h3>
    {linkText && (
      <button
        onClick={onLinkClick}
        className="text-[13px] font-medium text-[#0047CC] hover:underline flex items-center gap-1 group cursor-pointer bg-transparent border-none"
      >
        {linkText}
        <ChevronRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

const mapActivityIcon = (iconType?: ActivityIconType) => {
  switch (iconType) {
    case 'warning':
      return { icon: AlertTriangleIcon, bg: 'bg-red-50', color: 'text-[#DC2626]' };
    case 'success':
      return { icon: CheckIcon, bg: 'bg-green-50', color: 'text-green-600' };
    case 'calendar':
      return { icon: CalendarIcon, bg: 'bg-purple-50', color: 'text-purple-600' };
    case 'wallet':
      return { icon: WalletIcon, bg: 'bg-blue-50', color: 'text-[#0047CC]' };
    case 'info':
      return { icon: InfoIcon, bg: 'bg-blue-50', color: 'text-[#0047CC]' };
    case 'briefcase':
    default:
      return { icon: BriefcaseIcon, bg: 'bg-blue-50', color: 'text-[#0047CC]' };
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

  const { data: dashboard, isLoading, error } = useEmployerDashboardQuery();

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
          navigate('/employer/jobs');
        }
        break;
      case 'SET_BENCHMARKS':
        if (hireId) {
          navigate(`/employer/benchmarks/${hireId}`);
        } else {
          navigate('/employer/jobs');
        }
        break;
      case 'VIEW_PIPELINE':
        navigate('/employer/jobs');
        break;
      case 'VIEW_TRUE_UP':
        navigate('/employer/payments');
        break;
      default:
        navigate('/employer/jobs');
        break;
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    return {
      activeJobs: {
        value: dashboard?.metrics?.activeJobs?.value ?? 0,
        delta: dashboard?.metrics?.activeJobs?.delta ?? 'Active listings',
        deltaType: dashboard?.metrics?.activeJobs?.deltaType ?? 'up',
      },
      totalApplicants: {
        value: dashboard?.metrics?.totalApplicants?.value ?? 0,
        delta: dashboard?.metrics?.totalApplicants?.delta ?? 'Total candidates',
        deltaType: dashboard?.metrics?.totalApplicants?.deltaType ?? 'up',
      },
      alignmentSessions: {
        value: dashboard?.metrics?.alignmentSessions?.value ?? 0,
        delta: dashboard?.metrics?.alignmentSessions?.delta ?? 'Scheduled / Pending',
        deltaType: dashboard?.metrics?.alignmentSessions?.deltaType ?? 'warn',
      },
      walletBalance: {
        value:
          dashboard?.metrics?.walletBalance?.formatted ||
          (typeof dashboard?.metrics?.walletBalance?.value === 'number'
            ? `$${dashboard.metrics.walletBalance.value.toLocaleString()}`
            : dashboard?.metrics?.walletBalance?.value ?? '$0.00'),
        delta: dashboard?.metrics?.walletBalance?.delta ?? 'Available funds',
        deltaType: dashboard?.metrics?.walletBalance?.deltaType ?? 'up',
      },
    };
  }, [dashboard]);

  // Post-Hire Check-Ins
  const checkIns = useMemo(() => {
    return dashboard?.checkIns?.items ?? [];
  }, [dashboard]);

  // Active Jobs
  const activeJobs = useMemo(() => {
    return dashboard?.activeJobs?.items ?? [];
  }, [dashboard]);

  // Alignment Sessions
  const alignmentSessions = useMemo(() => {
    return dashboard?.alignmentSessions?.items ?? [];
  }, [dashboard]);

  // Recent Activity
  const recentActivity = useMemo(() => {
    return dashboard?.recentActivity?.items ?? [];
  }, [dashboard]);

  // Wallet / Escrow Breakdown
  const walletEscrow = useMemo(() => {
    const w = dashboard?.walletEscrow;
    const format = (v?: number | string) => {
      if (v === undefined || v === null) return '$0.00';
      if (typeof v === 'number') return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return String(v).startsWith('$') ? String(v) : `$${v}`;
    };

    return {
      availableBalance: w?.availableBalanceFormatted || format(w?.availableBalance ?? 0),
      walletHolderName: w?.walletHolderName || (user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Employer'),
      inEscrow: w?.inEscrowFormatted || format(w?.inEscrow ?? 0),
      alignmentFeesPending: w?.alignmentFeesPendingFormatted || format(w?.alignmentFeesPending ?? 0),
      trueUpOwed: w?.trueUpOwedFormatted || format(w?.trueUpOwed ?? 0),
      totalCommitted: w?.totalCommittedFormatted || format(w?.totalCommitted ?? 0),
    };
  }, [dashboard, user]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  const bannerAlert = dashboard?.bannerAlert;
  const hasUrgentAlert = bannerAlert?.hasUrgentAlert && bannerAlert?.alert;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[20px] lg:text-[26px] font-medium text-[#0047CC] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[12px] lg:text-[14px] font-medium text-gray-400">
            {greeting.date} · {greeting.welcomeMessage}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-white border border-gray-100 rounded-full text-[11px] lg:text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
          >
            <BellIcon size={14} /> Alerts{' '}
            {greeting.unreadAlertsCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full ml-1">
                {greeting.unreadAlertsCount}
              </span>
            )}
          </button>
          <Button
            onClick={() => setIsPostModalOpen(true)}
            fullWidth={false}
            className="px-4 lg:px-5 min-h-[40px] text-[11px] lg:text-[13px] font-bold shadow-lg shadow-blue-500/20"
          >
            <PlusIcon size={14} strokeWidth={3} /> Post a Job
          </Button>
        </div>
      </div>

      {/* Red Urgent Alert Banner */}
      {hasUrgentAlert && bannerAlert.alert && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="p-2 bg-white rounded-full shrink-0 shadow-xs">
            <AlertTriangleIcon size={18} className="text-[#DC2626]" />
          </div>
          <p className="text-[13px] font-medium text-[#991B1B] flex-1 leading-relaxed">
            {bannerAlert.alert.title && <strong className="mr-1">{bannerAlert.alert.title}:</strong>}
            {bannerAlert.alert.message}
          </p>
          <button
            onClick={() =>
              handleBannerAction(
                bannerAlert.alert?.actionType,
                bannerAlert.alert?.hireId,
                bannerAlert.alert?.checkInId
              )
            }
            className="px-5 py-2 bg-[#DC2626] text-white text-[12px] font-medium rounded-full hover:bg-[#b91c1c] transition-all whitespace-nowrap cursor-pointer shadow-xs"
          >
            {bannerAlert.alert.actionLabel || 'Take Action'}
          </button>
        </div>
      )}

      {/* Main Masonry Grid */}
      <div className="columns-1 lg:columns-2 xl:columns-2 gap-6 space-y-6">
        {/* Column 1 */}
        <div className="break-inside-avoid space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KPICard
              label="Active Jobs"
              value={metrics.activeJobs.value}
              delta={metrics.activeJobs.delta}
              deltaType={metrics.activeJobs.deltaType}
              icon={BriefcaseIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/jobs')}
            />
            <KPICard
              label="Total Applicants"
              value={metrics.totalApplicants.value}
              delta={metrics.totalApplicants.delta}
              deltaType={metrics.totalApplicants.deltaType}
              icon={UsersIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/jobs')}
            />
            <KPICard
              label="Alignment Sessions"
              value={metrics.alignmentSessions.value}
              delta={metrics.alignmentSessions.delta}
              deltaType={metrics.alignmentSessions.deltaType}
              icon={ClockIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
            />
            <KPICard
              label="Wallet Balance"
              value={metrics.walletBalance.value}
              delta={metrics.walletBalance.delta}
              deltaType={metrics.walletBalance.deltaType}
              icon={WalletIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/payments')}
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickActionBtn
              label="Post a Job"
              sub="Create a new listing"
              icon={PlusIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => setIsPostModalOpen(true)}
            />
            <QuickActionBtn
              label="Confirm Hire"
              sub="Send offer & lock escrow"
              icon={CheckIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/payments')}
            />
            <QuickActionBtn
              label="Bulk Hire"
              sub="Confirm multiple hires"
              icon={UsersIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/payments')}
            />
            <QuickActionBtn
              label="Top Up Wallet"
              sub="Add funds for escrow"
              icon={TrendingUpIcon}
              bgColor="bg-white"
              iconColor="text-[#0047CC]"
              onClick={() => navigate('/employer/payments')}
            />
          </div>

          {/* Active Jobs Card */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-gray-900">Active Jobs</h3>
              <button
                onClick={() => navigate('/employer/jobs')}
                className="text-[13px] font-medium text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                View all <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {activeJobs.length === 0 ? (
                <EmptyState
                  icon={BriefcaseIcon}
                  title="No active jobs found"
                  description='Click "Post a Job" to create your first listing.'
                  compact
                  className="py-8"
                />
              ) : (
                activeJobs.map((job, i) => (
                  <div
                    key={job.id || i}
                    onClick={() => navigate(job.id ? `/employer/jobs/${job.id}` : '/employer/jobs')}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate group-hover:text-[#0047CC] transition-colors">
                        {job.title}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                        {job.id} · {job.location || 'Remote'} · Posted {job.postedDate || 'Recent'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-medium text-gray-700">
                        {job.applicantsCount ?? job.applicants ?? 0} applicants
                      </p>
                      <Tag
                        label={job.displayStatus || job.status || 'Live'}
                        variant={mapJobBadgeVariant(job.displayStatus)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alignment Sessions */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-gray-900">Alignment Sessions</h3>
              <button
                onClick={() => navigate('/employer/jobs')}
                className="text-[13px] font-medium text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                Full View <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {alignmentSessions.length === 0 ? (
                <EmptyState
                  icon={VideoIcon}
                  title="No alignment sessions scheduled"
                  description="Sessions will appear here once requested or scheduled."
                  compact
                  className="py-8"
                />
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
                    <div key={session.id || i} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          session.initialBg || 'bg-blue-500'
                        } text-white flex items-center justify-center font-medium text-[12px] shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-gray-900 truncate group-hover:text-[#0047CC] transition-colors">
                          {candidateName}
                        </p>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {session.roleTitle || session.role || 'Specialist'} · {session.id}
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
        </div>

        {/* Column 2 */}
        <div className="break-inside-avoid space-y-6">
          {/* Post-Hire Tracking Widget */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-medium text-gray-900">Post-Hire Check-ins</h3>
                {checkIns.filter((c) => c.status === 'OVERDUE').length > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                    {checkIns.filter((c) => c.status === 'OVERDUE').length} overdue
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/employer/jobs')}
                className="text-[12px] font-medium text-[#0047CC] hover:underline bg-transparent border-none cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {checkIns.length === 0 ? (
                <EmptyState
                  icon={ClockIcon}
                  title="No post-hire check-ins pending"
                  description="Completed hires and upcoming milestones will appear here."
                  compact
                  className="py-6"
                />
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
                      className={`p-4 rounded-[14px] ${
                        isOverdue
                          ? 'bg-[#FEF2F2] border border-[#FECACA]'
                          : isPending
                          ? 'bg-white border border-blue-100'
                          : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            isOverdue
                              ? 'bg-red-600'
                              : isPending
                              ? 'bg-[#0047CC]'
                              : 'bg-green-500'
                          } text-white flex items-center justify-center text-[11px] font-medium shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-gray-900 truncate">{item.candidateName}</p>
                          <p className="text-[10px] font-medium text-gray-500 truncate">
                            {item.dueText || (isOverdue ? 'Check-in overdue' : 'Scheduled on track')}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-medium uppercase ${
                            isOverdue ? 'text-red-600' : isPending ? 'text-[#0047CC]' : 'text-green-700'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      {item.action === 'COMPLETE_CHECK_IN' && (
                        <button
                          onClick={() => handleBannerAction('COMPLETE_CHECK_IN', item.hireId, item.checkInId)}
                          className="w-full py-2 bg-red-600 text-white text-[12px] font-medium rounded-lg hover:bg-red-700 transition-all cursor-pointer"
                        >
                          {item.actionLabel || 'Complete Check-in'}
                        </button>
                      )}

                      {item.action === 'SET_BENCHMARKS' && (
                        <button
                          onClick={() => handleBannerAction('SET_BENCHMARKS', item.hireId)}
                          className="w-full py-2 bg-[#0047CC] text-white text-[12px] font-medium rounded-lg hover:bg-[#003d99] transition-all cursor-pointer"
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

          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-[#0047CC] to-[#387DFF] rounded-[18px] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest mb-2">Available Balance</p>
            <p className="text-[36px] font-medium tracking-tight leading-none mb-1">{walletEscrow.availableBalance}</p>
            <p className="text-[11px] font-medium text-white/60 mb-6">
              VORA Employer Wallet · {walletEscrow.walletHolderName}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/employer/payments')}
                className="flex-1 py-2.5 bg-white text-[#0047CC] rounded-full text-[13px] font-medium hover:scale-[1.03] transition-transform cursor-pointer"
              >
                Top Up
              </button>
              <button
                onClick={() => navigate('/employer/payments')}
                className="flex-1 py-2.5 bg-white/15 border border-white/30 text-white rounded-full text-[13px] font-medium hover:bg-white/25 transition-all cursor-pointer"
              >
                History
              </button>
            </div>
          </div>

          {/* Escrow Breakdown */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <h3 className="text-[14px] font-medium text-gray-900 mb-5">Escrow Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-medium text-gray-500">In escrow (locked)</span>
                <span className="font-medium text-gray-900">{walletEscrow.inEscrow}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-medium text-gray-500">Alignment fees pending</span>
                <span className="font-medium text-[#0047CC]">{walletEscrow.alignmentFeesPending}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-medium text-gray-500">True-up owed</span>
                <span className="font-medium text-gray-400">{walletEscrow.trueUpOwed}</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[14px] font-medium text-gray-900">Total committed</span>
                <span className="text-[16px] font-medium text-[#0047CC]">{walletEscrow.totalCommitted}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/employer/payments')}
              className="w-full mt-6 py-3 border border-gray-100 text-gray-700 text-[13px] font-medium rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              View Payment Overview
            </button>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-gray-900">Recent Activity</h3>
              <button
                onClick={() => navigate('/employer/payments')}
                className="text-[13px] font-medium text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer"
              >
                All transactions <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={InfoIcon}
                  title="No recent activity recorded yet"
                  compact
                  className="py-8"
                />
              ) : (
                recentActivity.map((act, i) => {
                  const iconConfig = mapActivityIcon(act.iconType);
                  const IconComp = iconConfig.icon;
                  return (
                    <div key={act.id || i} className="flex gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                      <div
                        className={`w-9 h-9 rounded-lg ${
                          act.iconBg || iconConfig.bg
                        } flex items-center justify-center shrink-0`}
                      >
                        <IconComp size={16} className={act.iconColor || iconConfig.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-gray-900 leading-tight truncate">{act.title}</p>
                        <p className="text-[11px] font-medium text-gray-400 mt-1">
                          {act.subtitle || act.sub || ''}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-gray-300 shrink-0">
                        {act.timestamp || act.time || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Account & Settings Tiles */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <SectionHeader title="Account & Settings" linkText="Manage" onLinkClick={() => navigate('/settings')} />
            <div className="columns-2 gap-2 space-y-2">
              {[
                { label: 'Profile', sub: `${user?.firstName || 'Employer'} · Admin`, icon: UserIcon, path: '/settings' },
                { label: 'Notifications', sub: 'Preferences', icon: BellIcon, path: '/settings' },
                { label: 'Billing', sub: 'Enterprise', icon: TrendingUpIcon, path: '/employer/payments' },
                { label: 'Payments', sub: 'Wallet & Escrow', icon: CreditCardIcon, path: '/employer/payments' },
                { label: 'Account', sub: 'Security & Sessions', icon: UsersIcon, path: '/settings' },
                { label: 'Post Job', sub: 'New listing', icon: PlusIcon, isPostJob: true },
              ].map((tile, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (tile.isPostJob) {
                      setIsPostModalOpen(true);
                    } else if (tile.path) {
                      navigate(tile.path);
                    }
                  }}
                  className="break-inside-avoid p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 rounded-xl transition-all cursor-pointer group"
                >
                  <tile.icon size={16} className="text-[#0047CC] mb-3" />
                  <p className="text-[12px] font-medium text-gray-900 leading-tight">{tile.label}</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5 truncate">{tile.sub}</p>
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
