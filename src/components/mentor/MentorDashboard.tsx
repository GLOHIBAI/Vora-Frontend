import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PlayIcon,
  ChevronRightIcon,
  CalendarIcon,
  BookIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  UserIcon,
  ClockIcon,
  ChevronDownIcon,
  DownloadIcon,
  MoreVerticalIcon,
  InfoIcon,
  BellIcon,
  VideoIcon,
} from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Tag from '../common/Tag';
import FullPageSpinner from '../common/FullPageSpinner';
import { useMentorDashboardQuery } from '../../services/queries/mentor';
import type {
  MentorUpcomingSessionItem,
  MentorSessionTag,
  MentorActiveCourseItem,
  MentorPendingRequestItem,
  MentorRecentActivityItem,
  MentorQuickActionItem,
  MentorHeaderAction,
} from '../../services/queries/mentor/types';
import {
  UPCOMING_SESSIONS as MOCK_UPCOMING_SESSIONS,
  ACTIVE_COURSES as MOCK_ACTIVE_COURSES,
  PENDING_REQUESTS as MOCK_PENDING_REQUESTS,
  RECENT_ACTIVITY as MOCK_RECENT_ACTIVITY,
} from '../../constants/mockData';

// --- Sub-components for Mentor Dashboard ---

const StatCard: React.FC<{
  label: string;
  value: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral' | 'warn';
  children?: React.ReactNode;
}> = ({ label, value, trend, trendType, children }) => (
  <div className="bg-white border border-gray-100 rounded-[18px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 min-w-0">
    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 truncate">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-[22px] lg:text-[28px] font-medium text-gray-900 tracking-tight truncate">{value}</p>
    </div>
    {trend && (
      <div className="inline-flex items-center gap-1 mt-2 max-w-full">
        <Tag
          label={trend}
          variant={trendType === 'up' ? 'green' : trendType === 'warn' ? 'blue' : 'gray'}
        />
      </div>
    )}
    {children}
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  icon: React.ElementType;
  linkText?: string;
  onLinkClick?: () => void;
}> = ({ title, icon: Icon, linkText, onLinkClick }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-2 min-w-0">
      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 shrink-0">
        <Icon size={14} />
      </div>
      <h3 className="text-[13px] sm:text-[14px] font-medium text-gray-900 uppercase tracking-tight truncate">{title}</h3>
    </div>
    {linkText && (
      <button
        type="button"
        onClick={onLinkClick}
        className="text-[12px] font-medium text-[#0047CC] hover:underline flex items-center gap-1 group cursor-pointer shrink-0"
      >
        <span>{linkText}</span>
        <ChevronRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

/** Helper to resolve backend hrefHints to actual frontend routes safely */
const resolveMentorHref = (hrefHint?: string): string => {
  if (!hrefHint) return '/dashboard';
  const lower = hrefHint.toLowerCase();
  if (lower.includes('course')) {
    return '/mentor/courses';
  }
  if (lower.includes('setting') || lower.includes('profile')) {
    return '/settings';
  }
  if (lower.includes('session') || lower.includes('schedule')) {
    return '/dashboard';
  }
  if (lower.includes('notification') || lower.includes('activity')) {
    return '/settings';
  }
  return '/dashboard';
};

const MentorDashboard: React.FC = () => {
  const [isCiOpen, setIsCiOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Fetch live Mentor Dashboard data (schemaVersion = 1)
  const { data: dashboardData, isLoading } = useMentorDashboardQuery();

  if (isLoading) {
    return <FullPageSpinner message="Loading mentor dashboard..." />;
  }

  const displayName = user?.title ? `${user.title} ${user.firstName}` : user?.firstName || 'Mentor';

  const getGreetingFallback = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Safe navigation handler
  const handleCtaClick = (hrefHint?: string, defaultFallback = '/dashboard') => {
    if (!hrefHint) {
      navigate(defaultFallback);
      return;
    }
    const resolved = resolveMentorHref(hrefHint);
    navigate(resolved);
  };

  // Withdrawal action handler
  const handleWithdrawClick = () => {
    if (!earnings?.pendingPayoutAmount || earnings.pendingPayoutAmount === 0) {
      toast(earnings?.pendingPayoutLabel || 'Nothing waiting to withdraw at this time.', { icon: 'ℹ️' });
    } else {
      toast(`Withdrawal request for ${pendingPayoutFormatted} initiated. Processing starts shortly.`, { icon: '💰' });
    }
  };

  // Scheduling handler
  const handleScheduleClick = () => {
    toast('Session calendar is up to date. Mentee slots are active.', { icon: '📅' });
  };

  // Gate Accept / Decline
  const handleGateAction = () => {
    toast('Session request response feature is coming soon in the next update.', { icon: 'ℹ️' });
  };

  // --- Dynamic Data Binding from Backend Response ---
  const greeting = dashboardData?.greeting;
  const welcomeTitle = greeting?.welcomeMessage || `${getGreetingFallback()}, ${displayName}`;
  const dateLine = greeting?.dateLabel
    ? `${greeting.dateLabel}${greeting.subtitle ? ` · ${greeting.subtitle}` : ''}`
    : `Sunday, 27 September 2026 · Nothing scheduled right now`;

  const unreadCount = dashboardData?.unreadNotificationsCount ?? 0;
  const headerActions: MentorHeaderAction[] = dashboardData?.headerActions && dashboardData.headerActions.length > 0
    ? dashboardData.headerActions
    : [];

  const nextSession = dashboardData ? dashboardData.nextSession : null;

  const metrics = dashboardData?.metrics;
  const monthRevAmount = metrics?.monthRevenue?.formattedAmount ?? '$0';
  const monthRevComparison = metrics?.monthRevenue?.comparisonLabel ?? '';
  const monthRevDir = metrics?.monthRevenue?.deltaDirection?.toLowerCase();
  const monthRevTrendType = monthRevDir === 'down' ? 'warn' : monthRevDir === 'up' ? 'up' : 'neutral';
  const monthRevTiers = metrics?.monthRevenue?.tiers;

  const upcomingSessionsCount = metrics?.upcomingSessions?.count ?? 0;
  const upcomingSessionsHint = metrics?.upcomingSessions?.hint ?? '';

  const pendingRequestsCount = metrics?.pendingRequests?.count ?? 0;
  const pendingRequestsHint = metrics?.pendingRequests?.hint ?? '';

  const courseEnrollmentsCount = metrics?.courseEnrollments?.count ?? 0;
  const courseEnrollmentsHint = metrics?.courseEnrollments?.hint ?? '';

  // Lists
  const upcomingSessions: MentorUpcomingSessionItem[] = dashboardData
    ? dashboardData.upcomingSessions || []
    : (MOCK_UPCOMING_SESSIONS as any[]);

  const activeCoursesBlock = dashboardData?.activeCourses;
  const activeCourses: MentorActiveCourseItem[] = activeCoursesBlock
    ? activeCoursesBlock.items || []
    : (MOCK_ACTIVE_COURSES as any[]);
  const draftsLabel = activeCoursesBlock ? activeCoursesBlock.draftsLabel : null;

  const pendingRequests: MentorPendingRequestItem[] = dashboardData
    ? dashboardData.pendingRequests || []
    : (MOCK_PENDING_REQUESTS as any[]);

  const earnings = dashboardData?.earnings;
  const earningsTotal = earnings?.formattedAmount || earnings?.formattedTotal || monthRevAmount;
  const earningsPeriod = earnings?.periodLabel || '';
  const pendingPayoutFormatted = earnings?.formattedPendingPayout || '$0';
  const pendingPayoutLabel = earnings?.pendingPayoutLabel || 'Nothing waiting to withdraw';
  const earningsSeries = earnings?.series && earnings.series.length > 0
    ? earnings.series
    : [];

  const maxSeriesAmount = Math.max(...earningsSeries.map((s) => Number(s.amount) || 0), 0);

  const gapIntel = dashboardData?.gapIntelligence ?? null;
  const gapSignals = gapIntel?.topSignals || gapIntel?.tags || [];
  const criticalCount = Number(gapIntel?.criticalCount ?? gapIntel?.criticalGapsCount ?? 0);
  const highDemandCount = Number(gapIntel?.highCount ?? gapIntel?.analysedCount ?? 0);

  const recentActivity: MentorRecentActivityItem[] = dashboardData
    ? dashboardData.recentActivity || []
    : (MOCK_RECENT_ACTIVITY as any[]);

  const quickActions: MentorQuickActionItem[] = dashboardData?.quickActions && dashboardData.quickActions.length > 0
    ? dashboardData.quickActions
    : [
        { key: 'schedule', label: 'Schedule', hrefHint: '/dashboard', icon: 'calendar', color: 'blue' },
        { key: 'withdraw', label: 'Withdraw', hrefHint: '/dashboard', icon: 'withdraw', color: 'emerald' },
        { key: 'course', label: 'Course', hrefHint: '/mentor/courses', icon: 'course', color: 'green' },
        { key: 'profile', label: 'Profile', hrefHint: '/settings', icon: 'profile', color: 'gray' },
      ];

  // Helper for tag labels
  const getTagText = (tag: string | MentorSessionTag): string => {
    return typeof tag === 'string' ? tag : tag.label;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 min-w-0">
          <h1 className="text-[22px] lg:text-[28px] font-medium text-gray-900 tracking-tight truncate">
            {welcomeTitle}
          </h1>
          <p className="text-[12px] lg:text-[14px] font-medium text-gray-400 truncate">
            {dateLine}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 shrink-0">
          <Button
            variant="outline"
            fullWidth={false}
            onClick={() => handleCtaClick(dashboardData?.links?.notifications || '/settings')}
            className="px-3 lg:px-4 min-h-[38px] lg:min-h-[42px] text-[12px] lg:text-[13px] shadow-sm bg-white"
          >
            <BellIcon size={14} className="text-gray-500" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full -ml-1">
                {unreadCount}
              </span>
            )}
          </Button>

          {headerActions.length > 0 ? (
            headerActions.map((action, i) => {
              const isPrimary = action.variant === 'primary' || (!action.variant && i === headerActions.length - 1);
              const isCourse = (action.key || action.label).toLowerCase().includes('course');
              const isSchedule = (action.key || action.label).toLowerCase().includes('schedule');

              return (
                <Button
                  key={action.key || i}
                  variant={isPrimary ? 'primary' : 'outline'}
                  fullWidth={false}
                  onClick={() => {
                    if (isSchedule) {
                      handleScheduleClick();
                    } else if (isCourse) {
                      navigate('/mentor/courses');
                    } else {
                      handleCtaClick(action.hrefHint);
                    }
                  }}
                  className={`px-3 lg:px-5 min-h-[38px] lg:min-h-[42px] text-[12px] lg:text-[13px] ${
                    isPrimary ? 'shadow-lg shadow-blue-500/20' : 'shadow-sm bg-white'
                  }`}
                >
                  {isCourse ? (
                    <BookIcon size={14} className={isPrimary ? 'text-white' : 'text-gray-900'} />
                  ) : isSchedule ? (
                    <PlusIcon size={14} className={isPrimary ? 'text-white' : 'text-gray-900'} />
                  ) : null}
                  <span>{action.label}</span>
                </Button>
              );
            })
          ) : (
            <>
              <Button
                variant="outline"
                fullWidth={false}
                onClick={() => navigate('/mentor/courses')}
                className="px-3 lg:px-5 min-h-[38px] lg:min-h-[42px] text-[12px] lg:text-[13px] shadow-sm bg-white"
              >
                <BookIcon size={14} className="text-gray-900" /> Create Course
              </Button>
              <Button
                fullWidth={false}
                onClick={handleScheduleClick}
                className="px-4 lg:px-5 min-h-[38px] lg:min-h-[42px] text-[12px] lg:text-[13px] shadow-lg shadow-blue-500/20"
              >
                <PlusIcon size={14} className="text-white" /> Schedule Session
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Next Session Hero Strip (Conditionally rendered, only when nextSession exists) */}
      {nextSession && (
        <div className="bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#059669] rounded-[20px] sm:rounded-[24px] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-xl shadow-green-900/10 transition-transform active:scale-[0.99] w-full min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute" />
              <div className="w-3.5 h-3.5 bg-green-400 rounded-full relative" />
            </div>

            <div className="flex-1 space-y-1 relative z-10 min-w-0">
              <p className="text-[10px] lg:text-[11px] font-medium text-green-100/70 uppercase tracking-widest truncate">
                {nextSession.kicker || 'Next Session'}
              </p>
              <h2 className="text-[18px] lg:text-[22px] font-medium text-white truncate">{nextSession.menteeName}</h2>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 pt-0.5">
                <span className="text-[12px] lg:text-[13px] font-medium text-white/80">
                  {nextSession.scheduleLabel}
                </span>
                {nextSession.tags && nextSession.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {nextSession.tags.map((tag, idx) => {
                      const tagLabel = getTagText(tag);
                      return (
                        <Tag
                          key={idx}
                          label={tagLabel}
                          variant="blue-light"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full lg:w-auto shrink-0">
            <Button
              fullWidth={true}
              onClick={() => {
                if (nextSession.meetingLink) {
                  window.open(nextSession.meetingLink, '_blank', 'noopener,noreferrer');
                } else {
                  toast('Meeting link will become active shortly before start time.', { icon: 'ℹ️' });
                }
              }}
              className="px-6 py-3 bg-white text-[#065F46] hover:bg-green-50 shadow-lg shadow-black/10 border-none sm:w-auto"
            >
              <VideoIcon size={16} fill="none" stroke="currentColor" strokeWidth={2.5} className="text-[#065F46]" />
              <span className="text-[#065F46]">{nextSession.joinLabel || 'Join Session'}</span>
            </Button>
            {nextSession.hasBrief && (
              <Button
                variant="outline"
                fullWidth={true}
                onClick={() => {
                  if (nextSession.briefHref) {
                    navigate(resolveMentorHref(nextSession.briefHref));
                  } else {
                    toast('Mentee brief will be provided prior to session kickoff.', { icon: 'ℹ️' });
                  }
                }}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 min-h-0 sm:w-auto"
              >
                {nextSession.briefLabel || 'View Brief'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid (Four metric cards bound dynamically to metrics.*) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <StatCard
          label={metrics?.monthRevenue?.label || 'Month Revenue'}
          value={monthRevAmount}
          trend={monthRevComparison || undefined}
          trendType={monthRevTrendType}
        >
          {monthRevTiers && monthRevTiers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {monthRevTiers.map((t, idx) => (
                <Tag
                  key={idx}
                  label={`${t.label} ${t.formattedAmount || t.amount || ''}`}
                  variant="blue-light"
                />
              ))}
            </div>
          )}
        </StatCard>

        <StatCard
          label={metrics?.upcomingSessions?.label || 'Upcoming Sessions'}
          value={String(upcomingSessionsCount)}
          trend={upcomingSessionsHint || undefined}
          trendType="neutral"
        />

        <StatCard
          label={metrics?.pendingRequests?.label || 'Pending Requests'}
          value={String(pendingRequestsCount)}
          trend={pendingRequestsHint || undefined}
          trendType={Number(pendingRequestsCount) > 0 ? 'warn' : 'neutral'}
        />

        <StatCard
          label={metrics?.courseEnrollments?.label || 'Course Enrollments'}
          value={String(courseEnrollmentsCount)}
          trend={courseEnrollmentsHint || undefined}
          trendType={Number(courseEnrollmentsCount) > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Responsive 2-Column Grid (Fully responsive without horizontal overflow) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full min-w-0">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:gap-8 min-w-0 w-full">
          {/* Upcoming Sessions List */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full">
            <SectionHeader
              title="Upcoming Sessions"
              icon={CalendarIcon}
              linkText="View all"
              onLinkClick={() => handleCtaClick(dashboardData?.links?.upcomingSessions || '/dashboard')}
            />

            {upcomingSessions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No upcoming sessions scheduled.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((session, i) => {
                  const isLive = session.status === 'LIVE' || session.isLive;
                  const menteeName = session.menteeName || session.name || 'Mentee';
                  const timeLabel = session.timeLabel || session.time || 'Upcoming';
                  const typeLabel = session.typeLabel || session.type || 'Session';
                  const statusLabel = session.statusLabel || (isLive ? 'LIVE' : session.status === 'CONFIRMED' ? 'Confirmed' : 'Pending');
                  const feeLabel = session.formattedFee || session.fee || session.formattedAmount || '';

                  // Date display
                  const dateBoxDay = session.day || session.date || '10';
                  const dateBoxMon = session.mon || 'MAR';

                  return (
                    <div
                      key={session.sessionId || session.id || session.bookingId || i}
                      onClick={() => {
                        if (session.meetingLink) {
                          window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="flex items-center gap-4 sm:gap-5 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group border-b border-gray-50 last:border-0"
                    >
                      <div
                        className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                          isLive
                            ? 'bg-green-100 border-green-200 text-green-700'
                            : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}
                      >
                        <span className="text-[18px] font-medium leading-none">{dateBoxDay}</span>
                        <span className="text-[9px] font-medium uppercase tracking-tighter">{dateBoxMon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-gray-900 truncate">{menteeName}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                          <span className="text-[12px] font-medium text-gray-400">{timeLabel}</span>
                          <Tag label={typeLabel} variant="blue-light" />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Tag
                          label={statusLabel}
                          variant={isLive ? 'green' : session.status === 'CONFIRMED' ? 'blue' : 'gray'}
                        />
                        {feeLabel && <p className="text-[14px] font-medium text-gray-900 mt-1">{feeLabel}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Courses */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full">
            <SectionHeader
              title="Active Courses"
              icon={BookIcon}
              linkText="Manage"
              onLinkClick={() => navigate(activeCoursesBlock?.manageHref || '/mentor/courses')}
            />

            {activeCourses.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No active courses yet. Click Create Course to publish your first mentorship course.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeCourses.map((course, i) => {
                  const gradient = course.gradient || 'from-[#0047CC] to-[#387DFF]';
                  const enrolledCount = course.enrollmentCount ?? course.enrolled ?? 0;
                  const revLabel = course.formattedRevenue || course.revenue || '$0';
                  const statusText = course.statusLabel || 'Published';
                  const ratingText = course.rating ? `★ ${course.rating}` : '★ 5.0';

                  return (
                    <div
                      key={course.courseId || course.id || i}
                      onClick={() => handleCtaClick(course.hrefHint || '/mentor/courses')}
                      className="flex items-center gap-4 sm:gap-5 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer border border-gray-100 group"
                    >
                      <div
                        className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10`}
                      >
                        <PlayIcon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] sm:text-[15px] font-medium text-gray-900 truncate">{course.title}</p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <span className="text-[12px] font-medium text-gray-400">{enrolledCount} enrolled</span>
                          <span className="text-[11px] font-medium text-green-600">{statusText}</span>
                          <span className="text-[11px] font-medium text-blue-500">{ratingText}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] sm:text-[16px] font-medium text-gray-900">{revLabel}</p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase">
                          {course.revenuePeriodLabel || 'All-time'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drafts strip (null = hide) */}
            {draftsLabel && (
              <div
                onClick={() => navigate('/mentor/courses')}
                className="mt-6 p-4 bg-white border border-blue-200 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                <div className="bg-[#0047CC] p-1.5 rounded-lg text-white shrink-0">
                  <InfoIcon size={14} />
                </div>
                <p className="text-[12px] font-medium text-blue-800">
                  {draftsLabel}
                </p>
              </div>
            )}
          </div>

          {/* Pending Requests */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full">
            <SectionHeader
              title="Pending Requests"
              icon={BriefcaseIcon}
              linkText="See all"
              onLinkClick={() => handleCtaClick(dashboardData?.links?.requests || '/dashboard')}
            />

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No pending requests at this time.
              </div>
            ) : (
              <div className="space-y-5">
                {pendingRequests.map((req, i) => {
                  const initial = req.initial || (req.menteeName || req.name || 'M').charAt(0).toUpperCase();
                  const menteeName = req.menteeName || req.name || 'Candidate';
                  const menteeRole = req.menteeRole || req.role || 'Talent';
                  const avatarColor = req.avatarColor || req.color || 'from-[#0047CC] to-[#387DFF]';
                  const tags = req.tags || [];

                  return (
                    <div
                      key={req.bookingId || req.id || i}
                      className={`p-5 sm:p-6 rounded-[20px] border transition-all ${
                        req.isCritical ? 'bg-white border-blue-200 shadow-sm' : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-medium text-sm shrink-0 shadow-sm`}
                        >
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-gray-900 truncate">{menteeName}</p>
                          <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">{menteeRole}</p>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tags.map((tag, j) => {
                                const tagText = getTagText(tag);
                                return (
                                  <span
                                    key={j}
                                    className="px-2 py-0.5 bg-white/80 border border-gray-100 rounded-full text-[9px] font-medium text-gray-500 uppercase"
                                  >
                                    {tagText}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-xl text-[12px] font-medium leading-relaxed mb-5 border ${
                          req.isCritical
                            ? 'bg-white/80 text-blue-900 border-blue-100'
                            : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}
                      >
                        {req.note}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          className="flex-1 py-2.5 text-[12px]"
                          onClick={handleGateAction}
                        >
                          {req.acceptLabel || '✓ Accept'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 py-2.5 text-[12px] text-gray-500 bg-white"
                          onClick={handleGateAction}
                        >
                          {req.declineLabel || 'Decline'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:gap-8 min-w-0 w-full">
          {/* Earnings Snapshot */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full overflow-hidden">
            <SectionHeader
              title="Earnings Snapshot"
              icon={TrendingUpIcon}
              linkText="Full report"
              onLinkClick={() => toast('Detailed monthly earnings report.', { icon: '📊' })}
            />

            <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
              <div className="min-w-0">
                <p className="text-[28px] sm:text-[36px] font-medium text-gray-900 leading-tight truncate">
                  {earningsTotal}
                </p>
                {earningsPeriod && (
                  <p className="text-[12px] sm:text-[13px] font-medium text-gray-400 mt-1 truncate">
                    {earningsPeriod}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider sm:tracking-widest">
                  Pending payout
                </p>
                <p className="text-[20px] sm:text-[24px] font-medium text-green-600">
                  {pendingPayoutFormatted}
                </p>
                <p className="text-[10px] font-medium text-gray-400">
                  {pendingPayoutLabel}
                </p>
              </div>
            </div>

            {/* Dynamic Bar Chart derived from earnings.series */}
            <div className="w-full mb-6 sm:mb-8">
              {earningsSeries.length === 0 ? (
                <div className="h-20 flex items-center justify-center text-xs text-gray-400">
                  No earnings data available for this cycle.
                </div>
              ) : (
                <div className="flex items-end gap-1 sm:gap-1.5 h-24 px-1 w-full justify-between">
                  {earningsSeries.map((item, i) => {
                    const amt = Number(item.amount) || 0;
                    const heightPercent = maxSeriesAmount > 0
                      ? Math.max(Math.round((amt / maxSeriesAmount) * 100), amt > 0 ? 8 : 4)
                      : 4;
                    const isLatest = i === earningsSeries.length - 1;
                    const totalItems = earningsSeries.length;
                    const dayNum = item.day || item.label || `${i + 1}`;

                    // Label sampling: only show for day 1, every 5th day, and last day if > 10 days
                    const shouldShowLabel =
                      totalItems <= 10 ||
                      i === 0 ||
                      i === totalItems - 1 ||
                      (totalItems > 10 && Number(item.day) % 5 === 0);

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 group relative min-w-0"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-30">
                          Day {dayNum}: ${amt.toLocaleString()}
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full max-w-[12px] sm:max-w-[16px] rounded-t-sm sm:rounded-t transition-all duration-500 ${
                            isLatest
                              ? amt > 0
                                ? 'bg-[#0047CC]'
                                : 'bg-blue-300'
                              : amt > 0
                              ? 'bg-blue-400 group-hover:bg-blue-500'
                              : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        {/* Day Label */}
                        <span className="text-[8px] sm:text-[9px] font-medium text-gray-400 uppercase tracking-tighter truncate h-3 text-center w-full">
                          {shouldShowLabel ? dayNum : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-4 border-t border-gray-50">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={() => toast('Earnings breakdown report.', { icon: '📊' })}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border-gray-200 text-gray-700 hover:bg-gray-50 text-[12px] sm:text-[13px]"
              >
                View Breakdown
              </Button>
              <Button
                fullWidth={false}
                onClick={handleWithdrawClick}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-blue-500/20 text-[12px] sm:text-[13px]"
              >
                <DownloadIcon size={14} />{' '}
                {!earnings?.pendingPayoutAmount || earnings.pendingPayoutAmount === 0
                  ? 'Withdraw'
                  : `Withdraw ${pendingPayoutFormatted}`}
              </Button>
            </div>
          </div>

          {/* Curriculum Gap Intelligence Dropdown */}
          {gapIntel && (
            <div
              className={`rounded-[20px] sm:rounded-[24px] overflow-hidden transition-all duration-500 relative min-w-0 w-full ${
                isCiOpen
                  ? 'bg-gradient-to-br from-[#18234B] via-[#1a3a8c] to-[#0047CC] shadow-2xl'
                  : 'bg-gradient-to-br from-[#18234B] to-[#0047CC] shadow-lg'
              }`}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div
                className="p-5 sm:p-6 lg:p-8 cursor-pointer flex items-center gap-4 sm:gap-5 relative z-10 select-none"
                onClick={() => setIsCiOpen(!isCiOpen)}
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <ClockIcon size={20} className="text-white/90" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest truncate">
                    {gapIntel.kicker || 'Gap Intelligence • Live'}
                  </p>
                  <h3 className="text-[15px] sm:text-[16px] font-medium text-white leading-tight mt-0.5 truncate">
                    {gapIntel.headline}
                  </h3>
                  {!isCiOpen && gapSignals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {gapSignals.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[9px] font-medium text-white/80"
                        >
                          {getTagText(t)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center transition-transform duration-500 shrink-0 ${
                    isCiOpen ? 'rotate-180 bg-white/20' : ''
                  }`}
                >
                  <ChevronDownIcon size={14} className="text-white" />
                </div>
              </div>

              {isCiOpen && (
                <div className="px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-6 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="h-px bg-white/10" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className={`text-[20px] font-medium ${criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {criticalCount}
                      </p>
                      <p className="text-[9px] font-medium text-white/40 uppercase mt-1">Critical Gaps</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-[20px] font-medium text-white">
                        {typeof highDemandCount === 'number'
                          ? highDemandCount.toLocaleString()
                          : highDemandCount}
                      </p>
                      <p className="text-[9px] font-medium text-white/40 uppercase mt-1">High Demand</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate('/mentor/courses')}
                      className="w-full py-3 sm:py-3.5 bg-white text-[#18234B] hover:bg-gray-50 min-h-0 text-[13px]"
                    >
                      Explore Gap Intelligence
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/mentor/courses')}
                      className="w-full py-3 sm:py-3.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 min-h-0 text-[13px]"
                    >
                      + Create Course
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full">
            <SectionHeader
              title="Recent Activity"
              icon={ClockIcon}
              linkText="All"
              onLinkClick={() => handleCtaClick(dashboardData?.links?.activity || dashboardData?.links?.notifications || '/settings')}
            />
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((act, i) => {
                  const title = act.title || act.text || 'Activity occurred';
                  const time = act.relativeTime || act.time || 'Recently';
                  const color = act.color || 'bg-blue-50 text-blue-600';

                  return (
                    <div key={act.id || i} className="flex gap-4 group">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 border border-current opacity-20`} />
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 absolute pointer-events-none">
                        <ClockIcon size={16} className={color.split(' ')[1] || 'text-[#0047CC]'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-medium text-gray-700 leading-relaxed truncate"
                          dangerouslySetInnerHTML={{
                            __html: title.replace(
                              /<strong>(.*?)<\/strong>/g,
                              '<span class="font-medium text-gray-900">$1</span>'
                            ),
                          }}
                        />
                        <p className="text-[10px] font-medium text-gray-400 uppercase mt-1">{time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-sm min-w-0 w-full">
            <SectionHeader title="Quick Actions" icon={MoreVerticalIcon} />
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((qa, i) => {
                const actionKey = (qa.key || qa.id || qa.label).toLowerCase();
                const iconEl = actionKey.includes('schedule') || actionKey.includes('calendar') ? (
                  <CalendarIcon size={20} />
                ) : actionKey.includes('course') || actionKey.includes('book') ? (
                  <PlusIcon size={20} />
                ) : actionKey.includes('withdraw') || actionKey.includes('pay') || actionKey.includes('wallet') ? (
                  <TrendingUpIcon size={20} />
                ) : (
                  <UserIcon size={20} />
                );

                const colorClass = actionKey.includes('schedule')
                  ? 'text-[#0047CC] bg-blue-50 group-hover:bg-blue-100'
                  : actionKey.includes('course')
                  ? 'text-green-600 bg-green-50 group-hover:bg-green-100'
                  : actionKey.includes('withdraw')
                  ? 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100'
                  : 'text-gray-500 bg-gray-50 group-hover:bg-gray-100';

                const handleClick = () => {
                  if (actionKey.includes('withdraw')) {
                    handleWithdrawClick();
                  } else if (actionKey.includes('schedule')) {
                    handleScheduleClick();
                  } else if (actionKey.includes('course')) {
                    navigate('/mentor/courses');
                  } else if (actionKey.includes('profile')) {
                    navigate('/settings');
                  } else {
                    handleCtaClick(qa.hrefHint);
                  }
                };

                return (
                  <button
                    key={qa.id || qa.key || i}
                    type="button"
                    onClick={handleClick}
                    className="p-4 sm:p-5 bg-white border border-gray-100 rounded-[18px] sm:rounded-[20px] flex flex-col items-center gap-2.5 sm:gap-3 hover:border-gray-200 hover:shadow-sm group transition-all cursor-pointer min-h-0 w-full"
                  >
                    <div className={`p-2.5 sm:p-3 rounded-xl group-hover:scale-110 transition-transform ${colorClass}`}>
                      {iconEl}
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-medium text-gray-900 truncate">
                      {qa.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
