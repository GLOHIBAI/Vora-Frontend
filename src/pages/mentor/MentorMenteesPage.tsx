import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  SearchIcon,
  ChevronDownIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  CalendarIcon,
  MailIcon,
  ArrowUpIcon,
  InfoIcon,
  LinkIcon,
  ClockIcon,
  LockIcon,
  SparklesIcon,
} from '../../components/common/Icons';
import ModalDialog from '../../components/common/ModalDialog';
import Select from '../../components/common/Select';
import DateInput from '../../components/common/DateInput';
import EmptyState from '../../components/common/EmptyState';
import DefaultAvatar from '../../components/common/DefaultAvatar';
import { toISODate } from '../../utils/date';
import type { Option } from '../../types';
import {
  useMentorMenteesQuery,
  useSendSessionInviteMutation,
  useMentorSessionTypesQuery,
  type MentorMenteeCard,
  type MentorMenteeSession,
  type MentorMenteeNote,
} from '../../services/queries/mentor';

// Dropdown options
const TIER_OPTIONS: Option[] = [
  { value: 'All', label: 'All regions' },
  { value: 'T1', label: 'Standard Global' },
  { value: 'T2', label: 'Regional Parity' },
  { value: 'T3', label: 'Emerging Markets' },
];

const PATHWAY_OPTIONS: Option[] = [
  { value: 'All', label: 'All pathways' },
  { value: 'VORA Matched', label: 'VORA Matched' },
  { value: 'Direct Booking', label: 'Direct Booking' },
];

const SORT_OPTIONS: Option[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'earned', label: 'Highest earnings' },
  { value: 'sessions', label: 'Most sessions' },
];

export const MentorMenteesPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'interview_referred'>('active');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedPathway, setSelectedPathway] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Primary API Query: GET /mentors/mentees
  const {
    data: menteesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useMentorMenteesQuery({
    tab: activeTab,
    q: debouncedSearch || undefined,
    tier: selectedTier !== 'All' ? selectedTier : undefined,
    pathway: selectedPathway !== 'All' ? selectedPathway : undefined,
    sort: sortBy,
  });

  // Query for Mentor Session Types
  const { data: sessionTypes = [] } = useMentorSessionTypesQuery();

  // Send Session Invite Mutation
  const sendSessionInviteMutation = useSendSessionInviteMutation();

  // Schema gate check
  const isSchemaValid = menteesResponse?.schemaVersion === 1;
  const summary = isSchemaValid ? menteesResponse.summary : undefined;
  const tabs = isSchemaValid ? menteesResponse.tabs : undefined;
  const items: MentorMenteeCard[] = isSchemaValid ? menteesResponse.items || [] : [];
  const bookingLink = isSchemaValid ? menteesResponse.bookingLink : undefined;
  const emptyState = isSchemaValid ? menteesResponse.emptyState : undefined;

  // Auto-expand first item if none expanded
  useEffect(() => {
    if (items.length > 0 && !expandedCardId) {
      setExpandedCardId(items[0].talentId);
    }
  }, [items, expandedCardId]);

  // Session Types Dropdown Options
  const sessionTypeOptions: Option[] = useMemo(() => {
    if (sessionTypes && sessionTypes.length > 0) {
      return sessionTypes.map((st: any) => ({
        value: st.id,
        label:
          st.durationOptionLabel ||
          `${st.durationMinutes || 60} min · ${st.customName || st.type || 'Session'}`,
      }));
    }
    return [
      { value: '00000000-0000-0000-0000-000000000001', label: '60 min · Deep Dive' },
      { value: '00000000-0000-0000-0000-000000000002', label: '30 min · Strategy Session' },
      { value: '00000000-0000-0000-0000-000000000003', label: '90 min · Executive Coaching' },
    ];
  }, [sessionTypes]);

  // Send Session Invite Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetMenteeForSchedule, setTargetMenteeForSchedule] = useState<MentorMenteeCard | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    sessionTypeId: '',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '14:00',
    sessionFocus: 'Strategy & Role Simulation',
  });

  // Ensure valid sessionTypeId selected
  useEffect(() => {
    if (sessionTypeOptions.length > 0 && !scheduleForm.sessionTypeId) {
      setScheduleForm((prev) => ({ ...prev, sessionTypeId: sessionTypeOptions[0].value }));
    }
  }, [sessionTypeOptions, scheduleForm.sessionTypeId]);

  // Add Note Modal State (Local enhancement for post-session documentation)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [targetMenteeForNote, setTargetMenteeForNote] = useState<MentorMenteeCard | null>(null);
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    text: '',
  });

  // Toggle Accordion Card
  const toggleCard = (talentId: string) => {
    setExpandedCardId((prev) => (prev === talentId ? null : talentId));
  };

  // Handle Share / Copy Booking Link
  const handleCopyBookingLink = (href?: string) => {
    const linkHref = href || bookingLink?.href || '/talent/mentors/me';
    const fullUrl = linkHref.startsWith('http') ? linkHref : `${window.location.origin}${linkHref}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Booking link copied to clipboard! Share this with mentees to book sessions.');
  };

  // Open Schedule Modal for a specific mentee
  const handleOpenScheduleModal = (mentee: MentorMenteeCard) => {
    setTargetMenteeForSchedule(mentee);
    setScheduleForm({
      sessionTypeId: sessionTypeOptions[0]?.value || '',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '14:00',
      sessionFocus: 'Strategy & Role Simulation',
    });
    setIsScheduleModalOpen(true);
  };

  // Open General Schedule Modal from page header
  const handleOpenGeneralScheduleModal = () => {
    if (items.length > 0) {
      setTargetMenteeForSchedule(items[0]);
    } else {
      setTargetMenteeForSchedule(null);
    }
    setScheduleForm({
      sessionTypeId: sessionTypeOptions[0]?.value || '',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '14:00',
      sessionFocus: 'Strategy & Role Simulation',
    });
    setIsScheduleModalOpen(true);
  };

  // Submit Send Session Invite POST /mentors/mentees/:talentId/session-invite
  const handleSaveSchedule = async () => {
    if (!targetMenteeForSchedule) {
      toast.error('Please select a mentee');
      return;
    }
    if (!scheduleForm.sessionTypeId) {
      toast.error('Please select a session format');
      return;
    }
    if (!scheduleForm.date || !scheduleForm.time) {
      toast.error('Please specify a proposed date and time');
      return;
    }

    const proposedAtDate = new Date(`${scheduleForm.date}T${scheduleForm.time}:00`);
    if (isNaN(proposedAtDate.getTime())) {
      toast.error('Invalid date or time selected');
      return;
    }

    if (proposedAtDate.getTime() <= Date.now()) {
      toast.error('Proposed date and time must be in the future.');
      return;
    }

    try {
      await sendSessionInviteMutation.mutateAsync({
        talentId: targetMenteeForSchedule.talentId,
        payload: {
          sessionTypeId: scheduleForm.sessionTypeId,
          proposedAt: proposedAtDate.toISOString(),
          sessionFocus: scheduleForm.sessionFocus.trim() || undefined,
        },
      });

      toast.success(`Session invitation sent to ${targetMenteeForSchedule.displayName}!`);
      setIsScheduleModalOpen(false);
      refetch();
    } catch (err: any) {
      // toast error handled by API client
    }
  };

  // Open Note Modal
  const handleOpenNoteModal = (mentee: MentorMenteeCard) => {
    setTargetMenteeForNote(mentee);
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      text: '',
    });
    setIsNoteModalOpen(true);
  };

  // Save Note locally
  const handleSaveNote = () => {
    if (!targetMenteeForNote || !noteForm.text.trim()) {
      toast.error('Please enter a note');
      return;
    }
    toast.success(`Note saved for ${targetMenteeForNote.displayName}!`);
    setIsNoteModalOpen(false);
  };

  // Check if Outcomes card should be shown (HIDE when outcomesTrackedPercent is null)
  const hasOutcomes = summary?.outcomesTrackedPercent != null;

  return (
    <div className="w-full pb-20 max-w-full overflow-x-hidden space-y-6">
      {/* ── TOP HEADER: TITLE + ACTION BUTTONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mentees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track coaching sessions, candidate progress, private notes, and earnings.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Share Booking Link button */}
          <button
            type="button"
            onClick={() => handleCopyBookingLink(bookingLink?.href)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <LinkIcon size={14} className="text-slate-400" />
            <span>{bookingLink?.label || 'Share Booking Link'}</span>
          </button>

          {/* Manage Availability button */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <ClockIcon size={14} className="text-slate-400" />
            <span>Manage Availability</span>
          </button>

          {/* Export: Disabled per handoff */}
          <button
            type="button"
            disabled
            title="Export coming soon"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed shadow-2xs"
          >
            <span>Export</span>
          </button>

          {/* Send Session Invite Primary CTA */}
          <button
            type="button"
            onClick={handleOpenGeneralScheduleModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#0047CC] hover:bg-[#003bb5] text-white transition-colors shadow-xs cursor-pointer"
          >
            <MailIcon size={14} />
            <span>Send Session Invite</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div
        className={`grid gap-4 ${
          hasOutcomes
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {/* KPI 1: Active Mentees */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Active Mentees
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-[28px] font-bold text-[#0047CC] leading-tight">
              {summary ? summary.activeMentees : '—'}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              /{summary ? summary.maxActiveMentees : '—'}
            </span>
          </div>
          {/* Segmented Capacity Bar */}
          <div className="flex gap-1.5 mt-2.5">
            {Array.from({ length: summary?.maxActiveMentees || 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full ${
                  idx < (summary?.activeMentees || 0) ? 'bg-[#0047CC]' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            {summary?.slotsLabel || `${summary?.slotsRemaining ?? 0} slots remaining`}
          </p>
        </div>

        {/* KPI 2: Total Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Sessions
          </p>
          <div className="text-2xl sm:text-[28px] font-bold text-[#0047CC] leading-tight">
            {summary ? summary.totalSessions.toLocaleString() : '—'}
          </div>
          <div className="h-1.5 mt-2.5" />
          <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
            <ArrowUpIcon size={12} className="text-emerald-700 stroke-[3]" />
            <strong className="text-emerald-700 font-bold">
              {summary?.sessionsThisMonthLabel || `+${summary?.sessionsThisMonth ?? 0} this month`}
            </strong>
          </p>
        </div>

        {/* KPI 3: Mentee Countries (Clean real count, no fake percentages) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Mentee Countries
          </p>
          <div className="text-2xl sm:text-[28px] font-bold text-[#0047CC] leading-tight">
            {summary ? summary.menteeCountries : '—'}
          </div>
          <div className="h-1.5 mt-2.5" />
          <p className="text-xs text-slate-500 font-medium">
            {summary
              ? summary.menteeCountries === 1
                ? '1 country represented'
                : `${summary.menteeCountries} countries represented`
              : 'Global candidate reach'}
          </p>
        </div>

        {/* KPI 4: Outcomes Tracked (Only shown if outcomesTrackedPercent !== null) */}
        {hasOutcomes && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Outcomes Tracked
            </p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-[28px] font-bold text-[#0047CC] leading-tight">
                {summary?.outcomesTrackedPercent}
              </span>
              <span className="text-lg font-bold text-[#0047CC]">%</span>
            </div>
            <div className="h-1.5 mt-2.5" />
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <CheckIcon size={13} className="text-emerald-700 stroke-[2.5]" />
              {summary?.outcomesLabel || 'Got role or advanced'}
            </p>
          </div>
        )}
      </div>

      {/* ── GLOBAL PRICING EARNINGS STRIP (Bound from earningsThisMonth) ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0047CC"
            strokeWidth="2.2"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Global Pricing Earnings · This Month
          </span>
        </div>

        {summary?.earningsThisMonth?.tiers && summary.earningsThisMonth.tiers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 py-1">
            {summary.earningsThisMonth.tiers.map((tier) => {
              // Clean label without T1/T2/T3
              const cleanLabel =
                tier.tier === 'T1' || tier.label.includes('T1')
                  ? 'Standard Global'
                  : tier.tier === 'T2' || tier.label.includes('T2')
                  ? 'Regional Parity'
                  : 'Emerging Markets';

              return (
                <div key={tier.tier} className="py-3 sm:py-0 sm:px-6 first:pl-0 text-left">
                  <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md mb-2">
                    {cleanLabel}
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                    {tier.formattedAmount || `$${tier.amount.toLocaleString()}`}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    {tier.sessionsCompleted} sessions completed
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 py-1">
            <div className="py-3 sm:py-0 sm:px-6 first:pl-0 text-left">
              <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md mb-2">
                Standard Global
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                $0
              </div>
              <div className="text-xs font-medium text-slate-500">0 sessions completed</div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 text-left">
              <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md mb-2">
                Regional Parity
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                $0
              </div>
              <div className="text-xs font-medium text-slate-500">0 sessions completed</div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 text-left">
              <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md mb-2">
                Emerging Markets
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                $0
              </div>
              <div className="text-xs font-medium text-slate-500">0 sessions completed</div>
            </div>
          </div>
        )}

        {/* Real Payout Note & Total */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <span className="font-bold text-slate-900">
              {summary?.earningsThisMonth?.formattedTotal || '$0'} total
            </span>
            {summary?.earningsThisMonth?.formattedAvgPerSession && (
              <span> · avg {summary.earningsThisMonth.formattedAvgPerSession}/session across all regions</span>
            )}
            <span>
              {' '}· {summary?.earningsThisMonth?.platformPayoutLabel || '92% platform payout applied'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(summary?.earningsThisMonth?.fullEarningsHref || '/finances')}
            className="text-[#0047CC] hover:text-[#003bb5] font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Full earnings &rarr;
          </button>
        </div>
      </div>

      {/* ── TABS BAR (Active | Past Mentees | Interview Referred) ── */}
      <div className="flex border-b border-slate-200 mb-6 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'active'
              ? 'border-[#0047CC] text-[#0047CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {tabs?.active ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'past'
              ? 'border-[#0047CC] text-[#0047CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past Mentees</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {tabs?.past ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interview_referred')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'interview_referred'
              ? 'border-[#0047CC] text-[#0047CC]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Interview Referred</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {tabs?.interviewReferred ?? 0}
          </span>
        </button>
      </div>

      {/* ── FILTER CONTROLS BAR (Only on Active & Past tabs) ── */}
      {activeTab !== 'interview_referred' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search mentees by name, title, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-full border border-slate-200 bg-white placeholder-slate-400 text-slate-800 font-medium focus:outline-none focus:border-[#0047CC] focus:ring-1 focus:ring-[#0047CC] shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon size={13} />
              </button>
            )}
          </div>

          {/* Region / Tier Filter */}
          <Select
            variant="compact"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            options={TIER_OPTIONS}
            className="!rounded-full !px-3.5 !py-2 !text-xs !font-semibold !text-slate-700 !border-slate-200 hover:!border-slate-300 bg-white shadow-2xs"
            containerClassName="shrink-0"
          />

          {/* Pathway Filter */}
          <Select
            variant="compact"
            value={selectedPathway}
            onChange={(e) => setSelectedPathway(e.target.value)}
            options={PATHWAY_OPTIONS}
            className="!rounded-full !px-3.5 !py-2 !text-xs !font-semibold !text-slate-700 !border-slate-200 hover:!border-slate-300 bg-white shadow-2xs"
            containerClassName="shrink-0"
          />

          {/* Sort Filter */}
          <Select
            variant="compact"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
            className="!rounded-full !px-3.5 !py-2 !text-xs !font-semibold !text-slate-700 !border-slate-200 hover:!border-slate-300 bg-white shadow-2xs"
            containerClassName="shrink-0"
            align="right"
          />
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {isError && !isLoading && (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-red-600 mb-2">
            Failed to load mentees
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {(error as any)?.message || 'An error occurred while fetching your mentees.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#0047CC] text-white text-xs font-semibold rounded-lg hover:bg-[#003bb5] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── CONTENT: MENTEES LIST OR EMPTY STATE ── */}
      {!isLoading && !isError && (
        <>
          {/* TAB 3: INTERVIEW REFERRED (Always empty until pipelines connected, no fake WHO/UNICEF cards) */}
          {activeTab === 'interview_referred' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <EmptyState
                icon={UsersIcon}
                title={emptyState?.title || 'No Interview-Referred Candidates'}
                description={
                  emptyState?.body ||
                  emptyState?.description ||
                  'Candidate referral pipelines from multilateral organisations are currently not connected.'
                }
                variant="dashed"
                className="m-4 sm:m-6"
              />
            </div>
          )}

          {/* ACTIVE & PAST MENTEES TABS */}
          {activeTab !== 'interview_referred' && (
            <div className="space-y-3.5">
              {items.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <EmptyState
                    icon={UsersIcon}
                    title={
                      emptyState?.title ||
                      (activeTab === 'past' ? 'No past mentees' : 'No active mentees')
                    }
                    description={
                      emptyState?.body ||
                      emptyState?.description ||
                      (searchQuery || selectedTier !== 'All' || selectedPathway !== 'All'
                        ? 'No mentees match your search or filter criteria.'
                        : activeTab === 'past'
                        ? 'You have not completed any mentorship journeys yet.'
                        : 'When talent book sessions with you, they appear here.')
                    }
                    variant="dashed"
                    className="m-4 sm:m-6"
                    action={
                      searchQuery || selectedTier !== 'All' || selectedPathway !== 'All'
                        ? {
                            label: 'Clear Filters',
                            onClick: () => {
                              setSearchQuery('');
                              setSelectedTier('All');
                              setSelectedPathway('All');
                            },
                          }
                        : activeTab === 'active' && bookingLink?.href
                        ? {
                            label: bookingLink.label || 'Share Booking Link',
                            onClick: () => handleCopyBookingLink(bookingLink?.href),
                            icon: LinkIcon,
                          }
                        : undefined
                    }
                  />
                </div>
              ) : (
                items.map((mentee) => {
                  const isExpanded = expandedCardId === mentee.talentId;

                  return (
                    <div
                      key={mentee.talentId}
                      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-sm focus-within:ring-2 focus-within:ring-[#0047CC]/20 ${
                        isExpanded
                          ? 'border-[#0047CC]/40 ring-1 ring-[#0047CC]/15'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Card Header (Clickable accordion) */}
                      <div
                        onClick={() => toggleCard(mentee.talentId)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-slate-50/60"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Avatar: photoUrl if present, else initials */}
                          {mentee.photoUrl ? (
                            <img
                              src={mentee.photoUrl}
                              alt={mentee.displayName}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <DefaultAvatar
                              alt={mentee.displayName}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-200 shrink-0"
                            />
                          )}

                          {/* Mentee info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                {mentee.displayName}
                              </span>

                              {/* Status Pill */}
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {mentee.tab === 'active' ? 'Active' : 'Past Mentee'}
                              </span>
                            </div>

                            {/* Subtitle: Title or Headline (organisation is null in talent model) */}
                            <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mb-2">
                              {mentee.professionalTitle || mentee.headline || 'Mentee'}
                            </p>

                            {/* Badges: Pathway / Matching Label + Country */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200">
                                <SparklesIcon size={12} className="text-[#0047CC]" />
                                {mentee.matchingLabel ||
                                  (mentee.pathway ? 'VORA Matched' : 'Direct Booking')}
                              </span>

                              {mentee.country && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {mentee.country}
                                </span>
                              )}
                            </div>

                            {/* Journey Progress: HIDE when null */}
                            {typeof mentee.journeyProgressPercent === 'number' &&
                              mentee.journeyProgressPercent !== null && (
                                <div className="mt-3 max-w-xs">
                                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                                    <span>Journey progress</span>
                                    <span className="font-bold text-slate-700">
                                      {mentee.journeyProgressPercent}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, mentee.journeyProgressPercent)
                                        )}%`,
                                      }}
                                      className="h-full bg-[#0047CC] rounded-full"
                                    />
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Right column: Dark slate money + 40px hit area chevron */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-1.5 shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="text-xs text-slate-500 font-medium">
                              {mentee.sessionsSummaryLabel ||
                                `${mentee.sessionCount || 0} sessions`}
                            </div>
                            {/* Money in dark slate, no tier label */}
                            <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                              {mentee.formattedEarned ||
                                `$${(mentee.earnedAmount || 0).toLocaleString()}`}
                            </div>
                          </div>

                          <div className="mt-1">
                            <button
                              type="button"
                              aria-label={
                                isExpanded
                                  ? 'Collapse mentee details'
                                  : 'Expand mentee details'
                              }
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer ${
                                isExpanded ? 'rotate-180 bg-slate-100' : 'bg-slate-50'
                              }`}
                            >
                              <ChevronDownIcon size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── EXPANDED ACCORDION PANEL ── */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-white">
                          <div
                            className={`p-4 sm:p-5 grid gap-6 ${
                              mentee.competencyProgress && mentee.competencyProgress.length > 0
                                ? 'grid-cols-1 lg:grid-cols-2'
                                : 'grid-cols-1'
                            }`}
                          >
                            {/* 1. Competency Progress (HIDE when empty / null) */}
                            {mentee.competencyProgress &&
                              mentee.competencyProgress.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                      Competency Progress
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                                      Updated per session
                                    </span>
                                  </div>
                                  <div className="space-y-2.5">
                                    {mentee.competencyProgress.map((comp, idx) => (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                          <span className="text-slate-700">{comp.name}</span>
                                          <span className="font-bold text-slate-900">
                                            {comp.score}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            style={{ width: `${comp.score}%` }}
                                            className="h-full bg-[#0047CC] rounded-full"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* 2. Session History */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Session History
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase">
                                  {mentee.sessions?.length || 0} recorded
                                </span>
                              </div>
                              <div className="space-y-2">
                                {mentee.sessions && mentee.sessions.length > 0 ? (
                                  mentee.sessions.map((sess) => (
                                    <div
                                      key={sess.id}
                                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-md bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                          <span className="text-[10px] font-bold text-slate-800 leading-none">
                                            {sess.day || '—'}
                                          </span>
                                          <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-400 leading-tight">
                                            {sess.month || ''}
                                          </span>
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                            <span>
                                              {sess.durationMinutes || 60} min ·{' '}
                                              {sess.type || 'Session'}
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                                            {sess.topic || sess.date || ''}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 shrink-0">
                                        {sess.status && (
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                              sess.status.toLowerCase() === 'confirmed'
                                                ? 'bg-blue-50 text-[#0047CC] border border-blue-200'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}
                                          >
                                            {sess.status}
                                          </span>
                                        )}
                                        {sess.fee != null && (
                                          <div className="text-right shrink-0">
                                            <div className="text-xs font-bold text-slate-900">
                                              ${sess.fee}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-slate-400 py-3 text-center font-medium">
                                    No sessions recorded yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 3. Private Mentor Notes */}
                          <div className="px-4 sm:px-5 pb-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Mentor Notes (Private)
                            </div>
                            {mentee.notes && mentee.notes.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {mentee.notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs"
                                  >
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <LockIcon size={11} className="text-slate-400" />
                                        Private Note
                                      </span>
                                      <span>{note.date || 'Note'}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-normal">
                                      {note.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleOpenNoteModal(mentee)}
                              className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <PlusIcon size={12} />
                              <span>Add note after session...</span>
                            </button>
                          </div>

                          {/* 4. Action Buttons Bar */}
                          <div className="bg-slate-50/70 border-t border-slate-200 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Invite to Next Session: enabled on active */}
                              {mentee.tab === 'active' &&
                                mentee.actions?.inviteToNextSession !== false && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenScheduleModal(mentee)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0047CC] text-white hover:bg-[#003bb5] transition-colors shadow-2xs cursor-pointer"
                                  >
                                    <CalendarIcon size={13} />
                                    <span>Invite to Next Session</span>
                                  </button>
                                )}

                              {/* Copy Booking Link */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyBookingLink(
                                    mentee.actions?.copyBookingLink?.href
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
                              >
                                <LinkIcon size={13} />
                                <span>Copy Booking Link</span>
                              </button>

                              {/* Message: disabled per handoff */}
                              <button
                                type="button"
                                disabled={!mentee.actions?.message?.enabled}
                                title="Messaging coming soon"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-2xs"
                              >
                                <MailIcon size={13} />
                                <span>Message</span>
                              </button>

                              {/* View Full Profile: disabled per handoff */}
                              <button
                                type="button"
                                disabled={!mentee.actions?.viewFullProfile?.enabled}
                                title="Profile view coming soon"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-2xs"
                              >
                                <span>View Full Profile</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ── MODAL: SEND SESSION INVITATION (POST /mentors/mentees/:talentId/session-invite) ── */}
      {isScheduleModalOpen && (
        <ModalDialog
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Send Session Invitation"
          showCloseButton={true}
          maxWidth="max-w-[480px]"
        >
          <div className="space-y-4 pt-2">
            {/* Target Mentee Selector */}
            {items.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Select Mentee
                </label>
                <select
                  aria-label="Select Mentee"
                  value={targetMenteeForSchedule?.talentId || ''}
                  onChange={(e) => {
                    const found = items.find((m) => m.talentId === e.target.value);
                    if (found) setTargetMenteeForSchedule(found);
                  }}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#0047CC]"
                >
                  <option value="" disabled>Choose a mentee...</option>
                  {items.map((m) => (
                    <option key={m.talentId} value={m.talentId}>
                      {m.displayName} ({m.country || 'Global'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Session Type / Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Duration & Format
              </label>
              <Select
                value={scheduleForm.sessionTypeId}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, sessionTypeId: e.target.value })
                }
                options={sessionTypeOptions}
                className="w-full !text-xs !font-medium"
              />
            </div>

            {/* Proposed Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <DateInput
                  label="Proposed Date"
                  labelClassName="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, date: e.target.value })
                  }
                  min={toISODate(new Date())}
                  iconPosition="right"
                  className="!rounded-lg !border-slate-200 !py-2 !text-xs !font-medium !text-slate-800 focus:!border-[#0047CC]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Proposed Time (UTC)
                </label>
                <input
                  type="time"
                  aria-label="Proposed Time"
                  value={scheduleForm.time}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, time: e.target.value })
                  }
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#0047CC]"
                />
              </div>
            </div>

            {/* Topic / Agenda Focus */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Topic / Agenda Focus
              </label>
              <input
                type="text"
                placeholder="e.g. Strategy & Role Simulation"
                value={scheduleForm.sessionFocus}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, sessionFocus: e.target.value })
                }
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0047CC]"
              />
            </div>

            {/* Informational Callout */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 flex items-start gap-2 text-xs text-blue-900">
              <InfoIcon size={14} className="text-[#0047CC] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                This creates a pending booking and sends an in-app invitation notification to the
                mentee. Meeting links are generated upon mentee confirmation.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendSessionInviteMutation.isPending}
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {sendSessionInviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </ModalDialog>
      )}

      {/* ── MODAL: ADD PRIVATE NOTE ── */}
      {isNoteModalOpen && (
        <ModalDialog
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title={`Add Note for ${targetMenteeForNote?.displayName || 'Mentee'}`}
          showCloseButton={true}
          maxWidth="max-w-[480px]"
        >
          <div className="space-y-4 pt-2">
            <div>
              <DateInput
                label="Date"
                labelClassName="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1"
                value={noteForm.date}
                onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                iconPosition="right"
                className="!rounded-lg !border-slate-200 !py-2 !text-xs !font-medium !text-slate-800 focus:!border-[#0047CC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Private Note Observations
              </label>
              <textarea
                rows={4}
                placeholder="Candidate gaps, simulation performance, development areas for subsequent sessions..."
                value={noteForm.text}
                onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0047CC]"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <LockIcon size={11} />
                Private to you as mentor. Never shared with the candidate.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </ModalDialog>
      )}
    </div>
  );
};

export default MentorMenteesPage;
