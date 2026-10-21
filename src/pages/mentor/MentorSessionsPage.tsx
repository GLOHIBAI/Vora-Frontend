import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
  InfoIcon,
  StarIcon,
  GoogleIcon,
  LockRectIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import ModalDialog from '../../components/common/ModalDialog';
import Select from '../../components/common/Select';
import DateInput from '../../components/common/DateInput';
import EmptyState from '../../components/common/EmptyState';
import { toISODate } from '../../utils/date';
import type { Option } from '../../types';
import {
  useMentorSessionsQuery,
  useMentorCalendarQuery,
  useConfirmSessionMutation,
  useDeclineSessionMutation,
  useRescheduleSessionMutation,
  useScheduleSessionMutation,
  useAddBookingNotesMutation,
  useMentorSessionTypesQuery,
  useMentorMenteesQuery,
  type MentorSessionCard,
} from '../../services/queries/mentor';

// Helper to extract day and month for clean neutral calendar badge
const formatScheduleDay = (dateStr?: string) => {
  if (!dateStr) return { day: '--', month: '---' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '--', month: '---' };
    return {
      day: d.getDate().toString(),
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    };
  } catch {
    return { day: '--', month: '---' };
  }
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MentorSessionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Active Tab: upcoming | requests | past | availability
  const [activeTab, setActiveTab] = useState<'upcoming' | 'requests' | 'past' | 'availability'>('upcoming');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');

  // Query Sessions
  const { data, isLoading, isError, refetch } = useMentorSessionsQuery({
    tab: activeTab,
    q: searchQuery.trim() || undefined,
    format: filterFormat,
    region: filterRegion,
  });

  // Query Calendar info (for sync modal)
  const { data: calendarData, isLoading: isCalendarLoading } = useMentorCalendarQuery();

  // Mentees query (for schedule modal mentee selector)
  const { data: menteesData } = useMentorMenteesQuery({ tab: 'active' });

  // Session types query (for schedule modal session format selector)
  const { data: sessionTypes } = useMentorSessionTypesQuery();

  // Mutations
  const confirmMutation = useConfirmSessionMutation();
  const declineMutation = useDeclineSessionMutation();
  const rescheduleMutation = useRescheduleSessionMutation();
  const scheduleMutation = useScheduleSessionMutation();
  const notesMutation = useAddBookingNotesMutation();

  // Modals state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedSessionForDossier, setSelectedSessionForDossier] = useState<MentorSessionCard | null>(null);
  const [dossierNotesText, setDossierNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoCallSession, setVideoCallSession] = useState<MentorSessionCard | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<MentorSessionCard | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('14:00');
  const [rescheduleDateError, setRescheduleDateError] = useState('');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    talentId: '',
    sessionTypeId: '',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '14:00',
    sessionFocus: '',
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isWebcalTokenRevealed, setIsWebcalTokenRevealed] = useState(false);

  // Available formats filter options from backend
  const formatOptions: Option[] = useMemo(() => {
    const list = data?.filters?.sessionFormats || [];
    return [
      { value: 'ALL', label: 'All session formats' },
      ...list.map((fmt) => ({ value: fmt, label: fmt })),
    ];
  }, [data?.filters?.sessionFormats]);

  // Available regions filter options from backend (real country list, NOT fake T1/T2/T3)
  const regionOptions: Option[] = useMemo(() => {
    const list = data?.filters?.regions || [];
    return [
      { value: 'ALL', label: 'All countries / regions' },
      ...list.map((reg) => ({ value: reg, label: reg })),
    ];
  }, [data?.filters?.regions]);

  // Session items from current tab
  const sessionItems = data?.items || [];

  // Summary counts
  const summary = data?.summary;
  const tabsCount = data?.tabs;

  // Live session hero: show ONLY if honest data.liveSession exists or an item is currently live
  const featuredLiveSession = data?.liveSession || sessionItems.find((s) => s.status === 'live');

  // Open Dossier / Notes
  const handleOpenDossier = (session: MentorSessionCard) => {
    setSelectedSessionForDossier(session);
    setDossierNotesText('');
    setIsDossierModalOpen(true);
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!selectedSessionForDossier || !dossierNotesText.trim()) {
      setIsDossierModalOpen(false);
      return;
    }
    setIsSavingNotes(true);
    try {
      await notesMutation.mutateAsync({
        bookingId: selectedSessionForDossier.bookingId,
        text: dossierNotesText.trim(),
      });
      setIsDossierModalOpen(false);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Launch Video Call
  const handleLaunchVideo = (session: MentorSessionCard) => {
    if (session.meetingLink) {
      if (session.meetingLink.startsWith('http')) {
        window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        navigate(session.meetingLink);
      }
    } else {
      setVideoCallSession(session);
      setIsVideoModalOpen(true);
    }
  };

  // Confirm Booking Request
  const handleConfirmRequest = async (session: MentorSessionCard) => {
    try {
      await confirmMutation.mutateAsync(session.bookingId);
    } catch {
      // Handled by mutation toast
    }
  };

  // Decline Booking Request
  const handleDeclineRequest = async (session: MentorSessionCard) => {
    if (window.confirm(`Decline booking request from ${session.displayName}?`)) {
      try {
        await declineMutation.mutateAsync(session.bookingId);
      } catch {
        // Handled by mutation toast
      }
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (session: MentorSessionCard) => {
    setSessionToReschedule(session);
    setNewRescheduleDate('');
    setNewRescheduleTime('14:00');
    setRescheduleDateError('');
    setIsRescheduleModalOpen(true);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    if (!sessionToReschedule) return;
    if (!newRescheduleDate) {
      setRescheduleDateError('Please choose a valid date.');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${newRescheduleDate}T${newRescheduleTime}:00`);
      if (isNaN(scheduledDateTime.getTime()) || scheduledDateTime.getTime() <= Date.now()) {
        setRescheduleDateError('Rescheduled time must be in the future.');
        return;
      }

      await rescheduleMutation.mutateAsync({
        bookingId: sessionToReschedule.bookingId,
        payload: {
          scheduledAt: scheduledDateTime.toISOString(),
        },
      });
      setIsRescheduleModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  // Submit Schedule Session
  const handleCreateSession = async () => {
    if (!scheduleForm.talentId) {
      toast.error('Please select a mentee.');
      return;
    }
    if (!scheduleForm.sessionTypeId) {
      toast.error('Please select a session format.');
      return;
    }
    if (!scheduleForm.date) {
      toast.error('Please select a date.');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}:00`);
      if (isNaN(scheduledDateTime.getTime()) || scheduledDateTime.getTime() <= Date.now()) {
        toast.error('Session date and time must be in the future.');
        return;
      }

      await scheduleMutation.mutateAsync({
        talentId: scheduleForm.talentId,
        sessionTypeId: scheduleForm.sessionTypeId,
        scheduledAt: scheduledDateTime.toISOString(),
        sessionFocus: scheduleForm.sessionFocus.trim() || undefined,
      });

      setIsScheduleModalOpen(false);
      setScheduleForm({
        talentId: '',
        sessionTypeId: '',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '14:00',
        sessionFocus: '',
      });
    } catch {
      // Handled by mutation
    }
  };

  // Copy Webcal Feed URL
  const handleCopyWebcalFeed = () => {
    if (calendarData?.ical?.href) {
      navigator.clipboard.writeText(calendarData.ical.href);
      toast.success('Calendar feed link copied to clipboard!');
    } else {
      toast('Live calendar feed link is not available yet.');
    }
  };

  return (
    <div className="w-full pb-20 max-w-full overflow-x-hidden">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              Sessions Hub
            </h1>
            {summary?.liveBookingActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Booking Active
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Manage your 1-on-1 coaching calendar, upcoming deep dives, booking requests, and historical session logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Calendar Sync Button */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            title="Manage calendar sync and integrations"
            className="h-10 inline-flex items-center gap-2 px-4 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-[#0047CC] hover:border-[#0047CC] hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <CalendarIcon size={14} className="text-[#0047CC]" />
            <span>Sync Calendar</span>
            <span
              className={`w-2 h-2 rounded-full ${
                calendarData?.connectEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </button>

          {/* Schedule Session */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="h-10 inline-flex items-center gap-2 px-5 rounded-full bg-[#0047CC] text-xs font-bold text-white hover:bg-[#0038A8] transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-98"
          >
            <PlusIcon size={14} strokeWidth={2.5} />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* ── KEY METRIC STAT CARDS ── */}
      {/* 
        Note: Removed hardcoded coaching impact "186 hrs" and fake "4.9 rating" per handoff instructions.
        Render honest cards based on summary data.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Stat 1: Upcoming Confirmed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Upcoming Sessions
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
              {summary?.upcomingConfirmedCount ?? tabsCount?.upcoming ?? 0}
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Confirmed
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {summary?.upcomingThisWeekLabel || 'Scheduled sessions'}
          </p>
        </div>

        {/* Stat 2: Next Session */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Next Session
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-[22px] font-bold text-slate-900 leading-tight truncate">
              {summary?.nextSessionLabel || 'No sessions today'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
            {summary?.nextSessionStartsInMinutes != null ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {summary.nextSessionStartsInMinutes > 0
                    ? `Starts in ${summary.nextSessionStartsInMinutes} mins`
                    : 'Starting now'}
                </span>
              </>
            ) : (
              <span className="text-slate-400">Check your upcoming calendar</span>
            )}
          </p>
        </div>

        {/* Stat 3: Pending Booking Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Pending Requests
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
              {summary?.pendingRequestsCount ?? tabsCount?.requests ?? 0}
            </span>
            {(summary?.pendingRequestsCount ?? 0) > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Action Needed
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {summary?.pendingLabel || 'Awaiting confirmation'}
          </p>
        </div>

        {/* Optional Stat 4: Only if real coachingImpactHours or avgRating are provided by backend */}
        {summary?.coachingImpactHours != null && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Coaching Impact
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
                {summary.coachingImpactHours}
              </span>
              <span className="text-xs font-medium text-slate-400">hrs</span>
            </div>
            {summary.avgRating != null && (
              <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                <StarIcon size={13} className="text-amber-500 fill-amber-500" />
                <span>{summary.avgRating} avg rating</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── FEATURED LIVE SESSION HERO CALLOUT ── */}
      {/*
        Handoff Rule: Only render when data.liveSession exists or an item is currently live.
        Removed hardcoded Oct 9 session.
      */}
      {featuredLiveSession && (
        <div className="mb-6 rounded-2xl bg-white border border-slate-200 border-l-4 border-l-[#0047CC] p-5 sm:p-6 shadow-sm relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                {featuredLiveSession.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Upcoming Next
                  </span>
                )}
                <span className="text-xs text-slate-600 font-medium">
                  {featuredLiveSession.scheduleLabel || featuredLiveSession.timeRangeLabel}
                </span>
                {featuredLiveSession.sessionFormat && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                    {featuredLiveSession.sessionFormat}
                  </span>
                )}
                {featuredLiveSession.country && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                    {featuredLiveSession.country}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-0.5">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0047CC] border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                  {featuredLiveSession.initials || featuredLiveSession.displayName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {featuredLiveSession.displayName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {featuredLiveSession.professionalTitle || featuredLiveSession.headline || 'Mentee'}
                  </p>
                </div>
              </div>

              {featuredLiveSession.topic && (
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-500 font-semibold">Agenda: </strong>
                  <span className="text-slate-800">{featuredLiveSession.topic}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-end">
              <button
                type="button"
                onClick={() => handleLaunchVideo(featuredLiveSession)}
                className="h-10 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
              >
                <VideoIcon size={14} />
                <span>Join Video Room</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDossier(featuredLiveSession)}
                  className="h-10 flex-1 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200 text-center inline-flex items-center justify-center"
                >
                  Dossier & Notes
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenReschedule(featuredLiveSession)}
                  className="h-10 flex-1 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer border border-slate-200 text-center inline-flex items-center justify-center"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center border-b border-slate-200 mb-5 overflow-x-auto scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Upcoming Sessions</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              activeTab === 'upcoming' ? 'bg-blue-50 text-[#0047CC]' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tabsCount?.upcoming ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Booking Requests</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              activeTab === 'requests' ? 'bg-blue-50 text-[#0047CC]' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tabsCount?.requests ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'past'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Past Sessions & Logs</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              activeTab === 'past' ? 'bg-blue-50 text-[#0047CC]' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tabsCount?.past ?? 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'availability'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <span>Weekly Availability</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {tabsCount?.availabilitySlotsActive != null
              ? `${tabsCount.availabilitySlotsActive} Slots Active`
              : 'Slots Active'}
          </span>
        </button>
      </div>

      {/* ── SEARCH & FILTERS (Only on session tabs) ── */}
      {activeTab !== 'availability' && (
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <SearchIcon
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentee, topic, role…"
              className="w-full h-10 bg-white border border-slate-200 rounded-full pl-9 pr-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>

          {/* Format Filter */}
          <Select
            variant="compact"
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            options={formatOptions}
            className="!h-10 !bg-white !border-slate-200 !rounded-full !px-3.5 !text-xs !font-semibold !text-slate-700 hover:!border-slate-300 shadow-2xs"
            containerClassName="shrink-0"
          />

          {/* Region Filter: Real country strings from API */}
          <Select
            variant="compact"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            options={regionOptions}
            className="!h-10 !bg-white !border-slate-200 !rounded-full !px-3.5 !text-xs !font-semibold !text-slate-700 hover:!border-slate-300 shadow-2xs"
            containerClassName="shrink-0"
          />
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {isLoading && (
        <div className="space-y-3.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-16 rounded-xl bg-slate-100" />
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
              <div className="w-24 h-9 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {isError && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <AlertTriangleIcon size={32} className="mx-auto text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load sessions</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">An error occurred while fetching your sessions hub.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 px-4 rounded-full bg-[#0047CC] text-white text-xs font-semibold hover:bg-[#0038A8] transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── TAB 1: UPCOMING SESSIONS ── */}
      {!isLoading && !isError && activeTab === 'upcoming' && (
        <div className="space-y-3.5">
          {sessionItems.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <EmptyState
                icon={CalendarIcon}
                title={data?.emptyState?.title || 'No upcoming sessions'}
                description={
                  data?.emptyState?.description ||
                  'Confirmed sessions with your mentees will appear here.'
                }
                variant="dashed"
                className="m-4 sm:m-6"
                action={{
                  label: 'Schedule a Session',
                  onClick: () => setIsScheduleModalOpen(true),
                  icon: PlusIcon,
                }}
              />
            </div>
          ) : (
            sessionItems.map((session) => {
              const { day, month } = formatScheduleDay(session.scheduledAt);
              const isLive = session.status === 'live';

              return (
                <div
                  key={session.bookingId}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  {/* Left: Neutral Date tile + Mentee info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200 bg-slate-50 text-slate-900 shadow-2xs">
                      <span className="text-xl font-bold leading-none">{day}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 text-slate-500">
                        {month}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {session.displayName}
                        </span>

                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live now
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                            {session.statusLabel || 'Confirmed'}
                          </span>
                        )}

                        {session.sessionFormat && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {session.sessionFormat}
                          </span>
                        )}
                        {session.country && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {session.country}
                          </span>
                        )}
                        {session.tierLabel && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {session.tierLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium truncate">
                        {session.professionalTitle || session.headline || 'Mentee'}
                      </p>

                      {session.topic && (
                        <div className="text-sm text-slate-800 font-normal pt-0.5 line-clamp-2">
                          <strong className="font-medium text-slate-400">Topic: </strong>
                          {session.topic}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <ClockIcon size={13} className="text-slate-400" />
                          <span>{session.timeRangeLabel || session.scheduleLabel}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{session.durationMinutes} minutes</span>
                        {session.formattedPayout ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900">
                              {session.formattedPayout}
                            </span>
                          </>
                        ) : session.formattedAmount ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900">
                              {session.formattedAmount}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(session)}
                      className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
                    >
                      Dossier & Notes
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReschedule(session)}
                      className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
                    >
                      Reschedule
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchVideo(session)}
                      className={`h-10 px-4 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-98 ${
                        isLive
                          ? 'bg-[#0047CC] hover:bg-[#0038A8] text-white'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <VideoIcon size={14} className={isLive ? 'text-white' : 'text-[#0047CC]'} />
                      <span>Join Video</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 2: PENDING BOOKING REQUESTS ── */}
      {!isLoading && !isError && activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <InfoIcon size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900 block mb-0.5">
                Inbound Booking Requests
              </strong>
              These candidates requested a 1-on-1 session with you. Confirm to reserve the slot and generate a secure WebRTC video room, or suggest an alternate time.
            </div>
          </div>

          {sessionItems.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <EmptyState
                icon={CheckIcon}
                title={data?.emptyState?.title || 'No pending booking requests'}
                description={
                  data?.emptyState?.description ||
                  'You are all caught up on new booking requests.'
                }
                variant="dashed"
                className="m-4 sm:m-6"
              />
            </div>
          ) : (
            sessionItems.map((request) => {
              const { day, month } = formatScheduleDay(request.scheduledAt);

              return (
                <div
                  key={request.bookingId}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border border-amber-200 bg-amber-50 text-amber-900 shadow-2xs">
                      <span className="text-xl font-bold leading-none">{day}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 text-amber-600">
                        {month}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {request.displayName}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                          Action Needed
                        </span>

                        {request.isUrgentReferral && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                            <AlertTriangleIcon size={11} className="text-red-600" />
                            Urgent Referral
                          </span>
                        )}

                        {request.sessionFormat && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {request.sessionFormat}
                          </span>
                        )}

                        {request.country && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {request.country}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium truncate">
                        {request.professionalTitle || request.headline || 'Mentee'}
                      </p>

                      {request.topic && (
                        <div className="text-sm text-slate-800 font-normal pt-0.5 line-clamp-2">
                          <strong className="font-medium text-slate-400">Target Focus: </strong>
                          {request.topic}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <ClockIcon size={13} className="text-slate-400" />
                          <span>{request.timeRangeLabel || request.scheduleLabel}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{request.durationMinutes} minutes</span>
                        {request.formattedPayout ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900">
                              {request.formattedPayout}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Confirm, Decline, Reschedule */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(request)}
                      disabled={declineMutation.isPending}
                      className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
                    >
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReschedule(request)}
                      className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                      Propose Slot
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmRequest(request)}
                      disabled={confirmMutation.isPending}
                      className="h-10 px-4 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
                    >
                      <CheckIcon size={14} />
                      <span>Confirm Session</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 3: PAST SESSIONS & LOGS ── */}
      {/* 
        Handoff Rule: Hide testimonials and outcome badges when null.
      */}
      {!isLoading && !isError && activeTab === 'past' && (
        <div className="space-y-3.5">
          {sessionItems.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <EmptyState
                icon={CalendarIcon}
                title={data?.emptyState?.title || 'No past sessions logged'}
                description={
                  data?.emptyState?.description ||
                  'Completed sessions and notes will appear here.'
                }
                variant="dashed"
                className="m-4 sm:m-6"
              />
            </div>
          ) : (
            sessionItems.map((session) => {
              const { day, month } = formatScheduleDay(session.scheduledAt);

              return (
                <div
                  key={session.bookingId}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200 bg-slate-50 text-slate-500 shadow-2xs">
                      <span className="text-xl font-bold leading-none">{day}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">
                        {month}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-slate-900">
                          {session.displayName}
                        </span>

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                          {session.statusLabel || (session.status === 'cancelled' ? 'Cancelled' : 'Completed')}
                        </span>

                        {session.sessionFormat && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {session.sessionFormat}
                          </span>
                        )}

                        {session.country && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                            {session.country}
                          </span>
                        )}

                        {/* Real outcome label if present from backend, honest null otherwise */}
                        {session.outcomeLabel && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            {session.outcomeLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium truncate">
                        {session.professionalTitle || session.headline || 'Mentee'}
                      </p>

                      {session.topic && (
                        <div className="text-sm text-slate-700 font-normal pt-0.5 line-clamp-2">
                          <strong className="font-medium text-slate-400">Topic: </strong>
                          {session.topic}
                        </div>
                      )}

                      {/* Real testimonial quote if present, otherwise hidden */}
                      {session.testimonial && (
                        <div className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                          “{session.testimonial}”
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                        <span>{session.scheduleLabel || session.timeRangeLabel}</span>
                        <span className="text-slate-300">•</span>
                        <span>{session.durationMinutes} minutes</span>
                        {session.formattedPayout ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900">
                              {session.formattedPayout}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(session)}
                      className="h-10 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                      View Notes
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 4: WEEKLY AVAILABILITY ── */}
      {!isLoading && !isError && activeTab === 'availability' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Recurring Availability
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your public profile allows mentees to book slots automatically within these time windows.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(data?.availability?.editHref || '/settings?tab=availability')
              }
              className="h-10 px-5 rounded-full bg-[#0047CC] text-white text-xs font-bold hover:bg-[#0038A8] transition-all cursor-pointer shadow-xs self-start sm:self-auto inline-flex items-center justify-center"
            >
              Edit Availability in Settings →
            </button>
          </div>

          {/* Slots display */}
          {data?.availability?.slots && data.availability.slots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DAY_NAMES.map((dayName, dayIdx) => {
                const daySlots = (data?.availability?.slots || []).filter(
                  (s) => s.dayOfWeek === dayIdx
                );
                if (daySlots.length === 0) return null;

                return (
                  <div key={dayIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{dayName}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {daySlots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-white text-xs font-semibold text-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 shadow-2xs"
                        >
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ClockIcon size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active availability slots configured</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Configure your weekly time windows so candidates can book sessions directly with you.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(data?.availability?.editHref || '/settings?tab=availability')
                }
                className="h-9 px-4 rounded-full bg-[#0047CC] text-white text-xs font-semibold hover:bg-[#0038A8] transition-all cursor-pointer"
              >
                Configure Availability
              </button>
            </div>
          )}

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-[#0047CC] font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              💡 <strong>Booking buffer:</strong>{' '}
              {data?.availability?.bufferLabel ||
                '24 hours advance notice required. 15-minute padding between calls.'}
            </span>
            <span className="font-bold shrink-0">
              Timezone: {data?.availability?.timezone || 'UTC'}
            </span>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE NEW SESSION ── */}
      <ModalDialog
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule 1-on-1 Mentorship Session"
        showCloseButton={true}
        maxWidth="max-w-[520px]"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="h-10 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={scheduleMutation.isPending}
              className="h-10 px-5 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {scheduleMutation.isPending ? 'Scheduling…' : 'Schedule Session'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Select Mentee</label>
            {menteesData?.items && menteesData.items.length > 0 ? (
              <Select
                value={scheduleForm.talentId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, talentId: e.target.value })}
                options={[
                  { value: '', label: 'Choose a mentee…' },
                  ...menteesData.items.map((m) => ({
                    value: m.talentId,
                    label: `${m.displayName} (${m.professionalTitle || m.country || 'Mentee'})`,
                  })),
                ]}
                className="!h-11 !bg-white !border-slate-200 !rounded-xl !px-3 !text-sm !font-medium !text-slate-900"
              />
            ) : (
              <input
                type="text"
                value={scheduleForm.talentId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, talentId: e.target.value })}
                placeholder="Enter talent / mentee ID"
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0047CC]"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Session Format / Type</label>
            {sessionTypes && sessionTypes.length > 0 ? (
              <Select
                value={scheduleForm.sessionTypeId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, sessionTypeId: e.target.value })}
                options={[
                  { value: '', label: 'Choose session format…' },
                  ...sessionTypes.map((st: any) => ({
                    value: st.id,
                    label: `${st.customName || st.type || 'Session'} (${st.durationMinutes || 60}m)`,
                  })),
                ]}
                className="!h-11 !bg-white !border-slate-200 !rounded-xl !px-3 !text-sm !font-medium !text-slate-900"
              />
            ) : (
              <input
                type="text"
                value={scheduleForm.sessionTypeId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, sessionTypeId: e.target.value })}
                placeholder="Enter session type ID"
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0047CC]"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <DateInput
                label="Date"
                labelClassName="block text-sm font-semibold text-slate-800 mb-1.5"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                min={toISODate(new Date())}
                iconPosition="right"
                className="!h-11 !rounded-xl !border-slate-200 !py-0 !text-sm !font-medium !text-slate-900 focus:!border-[#0047CC]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Start Time</label>
              <input
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Agenda / Focus Area</label>
            <textarea
              rows={3}
              value={scheduleForm.sessionFocus}
              onChange={(e) => setScheduleForm({ ...scheduleForm, sessionFocus: e.target.value })}
              placeholder="e.g. Technical preparation, mock interview practice, or career roadmapping"
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15 resize-y"
            />
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs text-[#0047CC] font-medium">
            🎥 A dedicated VORA Video encrypted meeting link will be created and dispatched to both calendars.
          </div>
        </div>
      </ModalDialog>

      {/* ── MODAL: MENTEE DOSSIER & PREP NOTES ── */}
      <ModalDialog
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={`Session Notes · ${selectedSessionForDossier?.displayName || ''}`}
        showCloseButton={true}
        maxWidth="max-w-[560px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setIsDossierModalOpen(false);
                navigate('/mentees');
              }}
              className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
            >
              Open Full Mentee Profile →
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDossierModalOpen(false)}
                className="h-10 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="h-10 px-5 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSavingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>
        }
      >
        {selectedSessionForDossier && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0047CC] border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                {selectedSessionForDossier.initials ||
                  selectedSessionForDossier.displayName?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {selectedSessionForDossier.displayName}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {selectedSessionForDossier.professionalTitle ||
                    selectedSessionForDossier.headline ||
                    'Mentee'}
                </p>
                <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                  {selectedSessionForDossier.country && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                      {selectedSessionForDossier.country}
                    </span>
                  )}
                  {selectedSessionForDossier.pathway && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                      {selectedSessionForDossier.pathway}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedSessionForDossier.topic && (
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">Session Focus</label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {selectedSessionForDossier.topic}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <LockRectIcon size={13} className="text-slate-500" />
                <span>Mentor Preparation Notes</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  Private
                </span>
              </label>

              <textarea
                rows={4}
                value={dossierNotesText}
                onChange={(e) => setDossierNotesText(e.target.value)}
                placeholder="Key questions to probe, cognitive traps to monitor, practice sets to assign…"
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15 leading-relaxed resize-y"
              />
            </div>
          </div>
        )}
      </ModalDialog>

      {/* ── MODAL: RESCHEDULE SESSION ── */}
      <ModalDialog
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title={`Reschedule Session with ${sessionToReschedule?.displayName || ''}`}
        showCloseButton={true}
        maxWidth="max-w-[460px]"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="h-10 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReschedule}
              disabled={!newRescheduleDate || rescheduleMutation.isPending}
              className="h-10 px-5 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rescheduleMutation.isPending ? 'Saving…' : 'Save New Slot'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            Select a new date and time for this session. A calendar update will be sent to the mentee.
          </p>

          <div>
            <DateInput
              label="New Date"
              labelClassName="block text-sm font-semibold text-slate-800 mb-1.5"
              value={newRescheduleDate}
              onChange={(e) => {
                setNewRescheduleDate(e.target.value);
                setRescheduleDateError('');
              }}
              min={toISODate(new Date())}
              iconPosition="right"
              error={!!rescheduleDateError}
              helperText={rescheduleDateError}
              className="!h-11 !rounded-xl !border-slate-200 !py-0 !text-sm !font-medium !text-slate-900 focus:!border-[#0047CC]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">New Start Time</label>
            <input
              type="time"
              value={newRescheduleTime}
              onChange={(e) => setNewRescheduleTime(e.target.value)}
              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/15"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Times are in UTC. Mentee will receive the invite converted to their local time.
            </p>
          </div>
        </div>
      </ModalDialog>

      {/* ── MODAL: VIDEO LAUNCH PREVIEW ── */}
      <ModalDialog
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="VORA Encrypted Video Room"
        showCloseButton={true}
        maxWidth="max-w-[500px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Provisional Video Room
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="h-10 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Joining video room…');
                  setIsVideoModalOpen(false);
                  if (videoCallSession?.meetingLink) {
                    if (videoCallSession.meetingLink.startsWith('http')) {
                      window.open(videoCallSession.meetingLink, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(videoCallSession.meetingLink);
                    }
                  }
                }}
                className="h-10 px-5 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-xs font-bold text-white transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Enter Call
              </button>
            </div>
          </div>
        }
      >
        {videoCallSession && (
          <div className="space-y-4 pt-1">
            <div className="bg-[#18234B] text-white rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto flex items-center justify-center text-blue-300">
                <VideoIcon size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {videoCallSession.sessionFormat || 'Session'} with {videoCallSession.displayName}
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  Room: {videoCallSession.meetingLink || `/mentor/sessions/${videoCallSession.bookingId}/join`}
                </p>
              </div>
              <div className="inline-block bg-white/10 text-emerald-300 font-semibold text-xs py-1 px-3 rounded-full border border-emerald-400/30">
                Encrypted Session
              </div>
            </div>

            {videoCallSession.topic && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">Session Outline:</div>
                <div>{videoCallSession.topic}</div>
              </div>
            )}
          </div>
        )}
      </ModalDialog>

      {/* ── MODAL: CALENDAR SYNC (HONEST STUB PER HANDOFF) ── */}
      {/* 
        Handoff Rule:
        providers[].status = "available" (NOT "connected")
        connectedEmail = null, connectEnabled = false
        ical.href = null, syncNowEnabled = false
        lastSyncLabel = "Calendar sync is not connected yet"
        Do NOT show Google as Connected or “4 events synced” until OAuth lands.
      */}
      <ModalDialog
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title="Calendar Synchronization & Integrations"
        showCloseButton={true}
        maxWidth="max-w-[560px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium truncate max-w-[260px]">
              {calendarData?.lastSyncLabel || 'Calendar sync is not connected yet'}
            </span>
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(false)}
              className="h-10 px-5 rounded-full bg-[#0047CC] hover:bg-[#0038A8] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500 leading-relaxed">
            Synchronize your VORA mentorship appointments with your primary calendar. Automatic 2-way sync allows upcoming sessions and rescheduled slots to appear in your calendar.
          </p>

          {/* Calendar Providers (Honest status: "available" / not connected) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calendar Services
            </h4>

            {/* Google Calendar */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <GoogleIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Google Calendar</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                      {calendarData?.providers?.find((p) => p.id === 'google')?.status || 'Available'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">
                    {calendarData?.connectedEmail || 'OAuth integration landing soon'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!calendarData?.connectEnabled}
                onClick={() => toast('Google Calendar OAuth integration is in progress.')}
                className="h-9 px-3.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50 text-xs font-semibold cursor-not-allowed opacity-75"
              >
                Connect
              </button>
            </div>

            {/* Microsoft Outlook 365 */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-center shrink-0 text-[#0047CC] font-bold text-sm">
                  O
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Microsoft Outlook 365</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                      {calendarData?.providers?.find((p) => p.id === 'outlook')?.status || 'Available'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">
                    Connect your Outlook or Office 365 work calendar
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!calendarData?.connectEnabled}
                onClick={() => toast('Outlook Calendar OAuth integration is in progress.')}
                className="h-9 px-3.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50 text-xs font-semibold cursor-not-allowed opacity-75"
              >
                Connect
              </button>
            </div>
          </div>

          {/* iCal / Webcal Feed */}
          {calendarData?.ical?.href && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Subscribe via iCal / Webcal Feed
                </span>
                <span className="text-xs font-medium text-slate-500">Apple & Outlook</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add this live URL to Apple Calendar or your calendar client to auto-sync confirmed mentorship sessions in real time.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    isWebcalTokenRevealed
                      ? calendarData.ical.href
                      : calendarData.ical.href.replace(/(token=)([^&]+)/, '$1••••••••')
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => setIsWebcalTokenRevealed(!isWebcalTokenRevealed)}
                  className="shrink-0 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
                >
                  {isWebcalTokenRevealed ? 'Hide' : 'Reveal'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyWebcalFeed}
                  className="shrink-0 px-3 py-2 rounded-xl bg-[#0047CC] hover:bg-[#0038A8] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Copy URL
                </button>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            ℹ️ {calendarData?.lastSyncLabel || 'Calendar sync is not connected yet'}
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

export default MentorSessionsPage;
