import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  UserIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  InfoIcon,
  StarIcon,
  MailIcon,
  UsersIcon,
  GoogleIcon,
} from '../../components/common/Icons';
import ModalDialog from '../../components/common/ModalDialog';
import Tag from '../../components/common/Tag';

// --- Type Definitions ---
export type SessionFormat =
  | 'Deep Dive'
  | 'Strategy Session'
  | 'Executive Coaching'
  | 'Diagnostic Triage'
  | 'Mock Panel Interview';

export type SessionStatus = 'LIVE' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface MentorshipSession {
  id: string;
  menteeName: string;
  menteeAvatarInitials: string;
  menteeGradient: string;
  menteeRole: string;
  menteeOrganization: string;
  menteeCountry: string;
  tier: 'T1' | 'T2' | 'T3';
  pathway: 'VORA Matched' | 'Direct Booking' | 'Assessment Referred';
  format: SessionFormat;
  durationMinutes: number;
  dateDay: string;
  dateMonth: string;
  dateFull: string;
  timeSlot: string;
  timezone: string;
  status: SessionStatus;
  feeAmount: number;
  tierPricingLabel: string;
  topicAgenda: string;
  meetingLink?: string;
  isUrgent?: boolean;
  failureNotes?: string;
  mentorPrepNotes?: string;
  rating?: number;
  feedback?: string;
  outcome?: string;
}

// --- Initial Mock Data ---
const INITIAL_SESSIONS: MentorshipSession[] = [
  {
    id: 'sess-1',
    menteeName: 'Chiamaka Obi',
    menteeAvatarInitials: 'CO',
    menteeGradient: 'from-[#34D399] to-[#059669]',
    menteeRole: 'Health Systems Policy Analyst',
    menteeOrganization: 'Federal Ministry of Health, Nigeria',
    menteeCountry: 'Nigeria',
    tier: 'T3',
    pathway: 'Assessment Referred',
    format: 'Diagnostic Triage',
    durationMinutes: 60,
    dateDay: '09',
    dateMonth: 'OCT',
    dateFull: 'Today · Oct 9, 2026',
    timeSlot: '14:00 - 15:00 WAT',
    timezone: 'WAT (UTC+1)',
    status: 'LIVE',
    feeAmount: 150,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'SJT situational judgment triage & psychometric verbal reasoning reframe for WHO candidate.',
    meetingLink: 'https://vora.ai/room/session-co-9102',
    isUrgent: true,
    failureNotes: 'Failed Psychometric ×2 on WHO Health Systems Leadership track. Requires structured role simulation mindset.',
    mentorPrepNotes: 'Review cognitive test breakdown. Focus on "most appropriate vs strictly correct" tradeoffs.',
  },
  {
    id: 'sess-2',
    menteeName: 'Dr. Nadia Benali',
    menteeAvatarInitials: 'NB',
    menteeGradient: 'from-[#F87171] to-[#DC2626]',
    menteeRole: 'Senior Technical Advisor',
    menteeOrganization: 'WHO HQ, France',
    menteeCountry: 'France',
    tier: 'T1',
    pathway: 'Direct Booking',
    format: 'Executive Coaching',
    durationMinutes: 90,
    dateDay: '11',
    dateMonth: 'OCT',
    dateFull: 'Wednesday · Oct 11, 2026',
    timeSlot: '10:00 - 11:30 CET',
    timezone: 'CET (UTC+2)',
    status: 'CONFIRMED',
    feeAmount: 2200,
    tierPricingLabel: 'T1 rate',
    topicAgenda: 'Final multilateral governance panel simulation & non-technical stakeholder communication.',
    meetingLink: 'https://vora.ai/room/session-nb-4412',
    mentorPrepNotes: 'Candidate is technically brilliant. Needs coaching on concise executive synthesis under pressure.',
  },
  {
    id: 'sess-3',
    menteeName: 'Kofi Mensah-Asante',
    menteeAvatarInitials: 'KM',
    menteeGradient: 'from-[#60A5FA] to-[#2563EB]',
    menteeRole: 'Health Systems Analyst',
    menteeOrganization: 'Ghana Health Service',
    menteeCountry: 'Ghana',
    tier: 'T3',
    pathway: 'VORA Matched',
    format: 'Deep Dive',
    durationMinutes: 60,
    dateDay: '14',
    dateMonth: 'OCT',
    dateFull: 'Saturday · Oct 14, 2026',
    timeSlot: '15:30 - 16:30 GMT',
    timezone: 'GMT (UTC+0)',
    status: 'CONFIRMED',
    feeAmount: 220,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'Review 15-min daily timed practice sets + scenario exercise for upcoming WHO technical stage.',
    meetingLink: 'https://vora.ai/room/session-km-8831',
    mentorPrepNotes: 'Check homework from session 2. Verify progress on timed verbal reasoning accuracy.',
  },
  {
    id: 'sess-4',
    menteeName: 'Dr. Chen Wei',
    menteeAvatarInitials: 'CW',
    menteeGradient: 'from-[#818CF8] to-[#4F46E5]',
    menteeRole: 'Health Informatics Lead',
    menteeOrganization: 'MOH Singapore',
    menteeCountry: 'Singapore',
    tier: 'T1',
    pathway: 'Direct Booking',
    format: 'Strategy Session',
    durationMinutes: 45,
    dateDay: '18',
    dateMonth: 'OCT',
    dateFull: 'Wednesday · Oct 18, 2026',
    timeSlot: '09:00 - 09:45 SGT',
    timezone: 'SGT (UTC+8)',
    status: 'CONFIRMED',
    feeAmount: 1100,
    tierPricingLabel: 'T1 rate',
    topicAgenda: 'Multilateral digital health governance transition & cross-regional advisory framework.',
    meetingLink: 'https://vora.ai/room/session-cw-2190',
  },
];

const INITIAL_REQUESTS: MentorshipSession[] = [
  {
    id: 'req-1',
    menteeName: 'Taiwo Adeyemi',
    menteeAvatarInitials: 'TA',
    menteeGradient: 'from-[#FBBF24] to-[#D97706]',
    menteeRole: 'Programme Analyst',
    menteeOrganization: 'UNICEF Nigeria',
    menteeCountry: 'Nigeria',
    tier: 'T3',
    pathway: 'Assessment Referred',
    format: 'Diagnostic Triage',
    durationMinutes: 60,
    dateDay: '12',
    dateMonth: 'OCT',
    dateFull: 'Thursday · Oct 12, 2026',
    timeSlot: 'Proposed: 16:00 - 17:00 WAT',
    timezone: 'WAT (UTC+1)',
    status: 'PENDING',
    feeAmount: 150,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'Urgent Intervention: Failed Psychometric ×3 + Video ×2 across WHO + UNICEF applications.',
    isUrgent: true,
    failureNotes: 'Critical case: Candidate has severe timing anxiety on situational judgment tests.',
  },
  {
    id: 'req-2',
    menteeName: 'Samuel Osei',
    menteeAvatarInitials: 'SO',
    menteeGradient: 'from-[#38BDF8] to-[#0284C7]',
    menteeRole: 'Health Policy Associate',
    menteeOrganization: 'Ghana MoH',
    menteeCountry: 'Ghana',
    tier: 'T3',
    pathway: 'VORA Matched',
    format: 'Deep Dive',
    durationMinutes: 60,
    dateDay: '15',
    dateMonth: 'OCT',
    dateFull: 'Sunday · Oct 15, 2026',
    timeSlot: 'Proposed: 11:00 - 12:00 GMT',
    timezone: 'GMT (UTC+0)',
    status: 'PENDING',
    feeAmount: 220,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'Situational Judgment test breakdown & health system financing prioritization.',
  },
  {
    id: 'req-3',
    menteeName: 'Grace Kintu',
    menteeAvatarInitials: 'GK',
    menteeGradient: 'from-[#C084FC] to-[#9333EA]',
    menteeRole: 'Grants Operations Manager',
    menteeOrganization: 'Global Fund',
    menteeCountry: 'Uganda',
    tier: 'T3',
    pathway: 'Assessment Referred',
    format: 'Mock Panel Interview',
    durationMinutes: 90,
    dateDay: '17',
    dateMonth: 'OCT',
    dateFull: 'Tuesday · Oct 17, 2026',
    timeSlot: 'Proposed: 14:00 - 15:30 EAT',
    timezone: 'EAT (UTC+3)',
    status: 'PENDING',
    feeAmount: 280,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'Executive simulation preparation after panel rejection.',
    isUrgent: true,
  },
];

const INITIAL_PAST_SESSIONS: MentorshipSession[] = [
  {
    id: 'past-1',
    menteeName: 'James Okello',
    menteeAvatarInitials: 'JO',
    menteeGradient: 'from-[#A78BFA] to-[#7C3AED]',
    menteeRole: 'Programme Officer',
    menteeOrganization: 'UNICEF Kenya',
    menteeCountry: 'Kenya',
    tier: 'T3',
    pathway: 'VORA Matched',
    format: 'Deep Dive',
    durationMinutes: 60,
    dateDay: '28',
    dateMonth: 'SEP',
    dateFull: 'Sep 28, 2026',
    timeSlot: '14:00 - 15:00 EAT',
    timezone: 'EAT',
    status: 'COMPLETED',
    feeAmount: 220,
    tierPricingLabel: 'T3 rate',
    topicAgenda: 'Health systems financing analysis & final alignment interview mock.',
    rating: 5,
    feedback: 'Dr. Adaeze completely restructured how I approach policy tradeoffs. Secured the offer at UNICEF!',
    outcome: 'Got the role ✓',
  },
  {
    id: 'past-2',
    menteeName: 'Dr. Emeka Nwosu',
    menteeAvatarInitials: 'EN',
    menteeGradient: 'from-[#FB7185] to-[#E11D48]',
    menteeRole: 'Health Systems Director',
    menteeOrganization: 'WHO AFRO',
    menteeCountry: 'Switzerland',
    tier: 'T1',
    pathway: 'Direct Booking',
    format: 'Executive Coaching',
    durationMinutes: 90,
    dateDay: '22',
    dateMonth: 'SEP',
    dateFull: 'Sep 22, 2026',
    timeSlot: '10:00 - 11:30 CET',
    timezone: 'CET',
    status: 'COMPLETED',
    feeAmount: 2200,
    tierPricingLabel: 'T1 rate',
    topicAgenda: 'Director-level strategic alignment & ministerial negotiation tactics.',
    rating: 5,
    feedback: 'World-class advisory. The panel debrief was exact to the letter.',
    outcome: 'Promoted ✓',
  },
  {
    id: 'past-3',
    menteeName: 'Amina Diallo',
    menteeAvatarInitials: 'AD',
    menteeGradient: 'from-[#34D399] to-[#059669]',
    menteeRole: 'Regional Epidemiologist',
    menteeOrganization: 'West Africa Health Org',
    menteeCountry: 'Senegal',
    tier: 'T2',
    pathway: 'VORA Matched',
    format: 'Strategy Session',
    durationMinutes: 60,
    dateDay: '15',
    dateMonth: 'SEP',
    dateFull: 'Sep 15, 2026',
    timeSlot: '15:00 - 16:00 GMT',
    timezone: 'GMT',
    status: 'COMPLETED',
    feeAmount: 480,
    tierPricingLabel: 'T2 rate',
    topicAgenda: 'Field outbreak management leadership review & multilateral reporting.',
    rating: 5,
    feedback: 'Clear, compassionate, and technically formidable guidance.',
    outcome: 'Advanced to Lead ✓',
  },
];

export const MentorSessionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'requests' | 'past' | 'calendar'>('upcoming');

  // Sessions state
  const [upcomingSessions, setUpcomingSessions] = useState<MentorshipSession[]>(INITIAL_SESSIONS);
  const [pendingRequests, setPendingRequests] = useState<MentorshipSession[]>(INITIAL_REQUESTS);
  const [pastSessions, setPastSessions] = useState<MentorshipSession[]>(INITIAL_PAST_SESSIONS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [filterTier, setFilterTier] = useState('ALL');

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedSessionForDossier, setSelectedSessionForDossier] = useState<MentorshipSession | null>(null);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoCallSession, setVideoCallSession] = useState<MentorshipSession | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<MentorshipSession | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('15:00');

  // New Session Form State
  const [newSessionForm, setNewSessionForm] = useState({
    menteeName: 'Chiamaka Obi',
    format: 'Deep Dive' as SessionFormat,
    duration: '60',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '14:00',
    timezone: 'WAT (UTC+1)',
    tier: 'T3' as 'T1' | 'T2' | 'T3',
    agenda: 'Psychometric verbal reasoning practice and SJT simulation',
    meetingLink: '',
  });

  // Calendar Sync Status & Modal
  const [isCalendarSynced, setIsCalendarSynced] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(true);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [autoBlockBusySlots, setAutoBlockBusySlots] = useState(true);
  const [sendCalendarInvites, setSendCalendarInvites] = useState(true);
  const [includeVoraVideoLink, setIncludeVoraVideoLink] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Just now (4 events synced)');

  // Handle Instant Re-sync
  const handleSyncNow = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
      setLastSyncTime('Just now (4 events synced)');
      toast.success('Calendar 2-way sync complete! All 4 mentorship slots up to date.', { icon: '🔄' });
    }, 700);
  };

  // Copy Webcal Feed URL
  const handleCopyWebcalFeed = () => {
    const feedUrl = 'webcal://vora.ai/api/v1/mentors/calendar/feed.ics?token=vora_live_k8a9';
    navigator.clipboard.writeText(feedUrl);
    toast.success('Live calendar feed link copied to clipboard!');
  };

  // Filtered upcoming sessions
  const filteredUpcoming = useMemo(() => {
    return upcomingSessions.filter((s) => {
      const matchSearch =
        s.menteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.menteeOrganization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topicAgenda.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (filterFormat !== 'ALL' && s.format !== filterFormat) return false;
      if (filterTier !== 'ALL' && s.tier !== filterTier) return false;
      return true;
    });
  }, [upcomingSessions, searchQuery, filterFormat, filterTier]);

  // Handle Accept Booking Request
  const handleAcceptRequest = (request: MentorshipSession) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
    const confirmed: MentorshipSession = {
      ...request,
      status: 'CONFIRMED',
      meetingLink: `https://vora.ai/room/session-${request.id}`,
    };
    setUpcomingSessions((prev) => [confirmed, ...prev]);
    toast.success(`Booking confirmed with ${request.menteeName}! Calendar invite sent.`);
  };

  // Handle Decline Booking Request
  const handleDeclineRequest = (request: MentorshipSession) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
    toast('Request declined. Mentee notified to pick an alternative slot.', { icon: 'ℹ️' });
  };

  // Handle Launch Video
  const handleLaunchVideo = (session: MentorshipSession) => {
    setVideoCallSession(session);
    setIsVideoModalOpen(true);
  };

  // Handle Reschedule
  const handleConfirmReschedule = () => {
    if (!sessionToReschedule || !newRescheduleDate) {
      toast.error('Please choose a valid date and time');
      return;
    }
    const d = new Date(newRescheduleDate);
    const day = d.getDate().toString().padStart(2, '0');
    const mon = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    setUpcomingSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionToReschedule.id) {
          return {
            ...s,
            dateDay: day,
            dateMonth: mon,
            dateFull: `${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
            timeSlot: `${newRescheduleTime} ${s.timezone.split(' ')[0]}`,
          };
        }
        return s;
      })
    );
    toast.success(`Session with ${sessionToReschedule.menteeName} rescheduled!`);
    setIsRescheduleModalOpen(false);
  };

  // Handle Schedule New Session
  const handleCreateSession = () => {
    if (!newSessionForm.menteeName.trim() || !newSessionForm.agenda.trim()) {
      toast.error('Please complete mentee name and agenda');
      return;
    }

    const d = new Date(newSessionForm.date);
    const day = d.getDate().toString().padStart(2, '0');
    const mon = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    const created: MentorshipSession = {
      id: `sess-${Date.now()}`,
      menteeName: newSessionForm.menteeName,
      menteeAvatarInitials: newSessionForm.menteeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      menteeGradient: 'from-[#3B82F6] to-[#1D4ED8]',
      menteeRole: 'Healthcare Professional',
      menteeOrganization: 'Multilateral Applicant',
      menteeCountry: 'International',
      tier: newSessionForm.tier,
      pathway: 'Direct Booking',
      format: newSessionForm.format,
      durationMinutes: parseInt(newSessionForm.duration, 10) || 60,
      dateDay: day,
      dateMonth: mon,
      dateFull: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      timeSlot: `${newSessionForm.time} ${newSessionForm.timezone.split(' ')[0]}`,
      timezone: newSessionForm.timezone,
      status: 'CONFIRMED',
      feeAmount: newSessionForm.tier === 'T1' ? 1200 : newSessionForm.tier === 'T2' ? 500 : 200,
      tierPricingLabel: `${newSessionForm.tier} rate`,
      topicAgenda: newSessionForm.agenda,
      meetingLink: newSessionForm.meetingLink || `https://vora.ai/room/session-${Date.now()}`,
    };

    setUpcomingSessions((prev) => [created, ...prev]);
    setIsScheduleModalOpen(false);
    toast.success(`Session scheduled with ${newSessionForm.menteeName}!`);
  };

  // Calendar .ics Export
  const handleExportCalendar = () => {
    const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VORA Mentorship//Sessions Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${upcomingSessions
  .map(
    (s) => `BEGIN:VEVENT
SUMMARY:VORA Mentorship: ${s.menteeName} (${s.format})
DESCRIPTION:${s.topicAgenda}
LOCATION:${s.meetingLink || 'VORA Video Room'}
STATUS:CONFIRMED
END:VEVENT`
  )
  .join('\n')}
END:VCALENDAR`;

    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vora_mentorship_sessions.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Calendar .ics export downloaded. Compatible with Google Calendar & Outlook.');
  };

  // Active / Live Session (First Live or Confirmed Today)
  const featuredLiveSession = upcomingSessions.find((s) => s.status === 'LIVE') || upcomingSessions[0];

  return (
    <div className="w-full pb-20 max-w-full overflow-x-hidden">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
              Sessions Hub
            </h1>
            <Tag
              label="Live Booking Active"
              variant="green"
              className="font-bold text-[10px] py-0.5 px-2 border border-[#86EFAC]"
            />
          </div>
          <p className="text-[13px] sm:text-sm text-gray-500 font-medium">
            Manage your 1-on-1 coaching calendar, upcoming deep dives, booking requests, and historical session logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Calendar Sync Button */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            title="Manage 2-way Google & Outlook sync and calendar feeds"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:text-[#0047CC] hover:border-[#0047CC] hover:bg-gray-50 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <CalendarIcon size={14} className="text-[#0047CC]" />
            <span>Sync Calendar</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
          </button>

          {/* Schedule Session */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0047CC] text-[13px] font-bold text-white hover:bg-[#003d99] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
          >
            <PlusIcon size={14} strokeWidth={2.5} />
            Schedule Session
          </button>
        </div>
      </div>

      {/* ── KEY METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Stat 1: Upcoming */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Upcoming Sessions
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
              {upcomingSessions.length}
            </span>
            <span className="text-xs font-semibold text-[#0047CC] bg-[#EBF6FF] px-2 py-0.5 rounded-full">
              Confirmed
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">2 scheduled this week</p>
        </div>

        {/* Stat 2: Next Live Slot */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Next Session
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-[22px] font-extrabold text-[#15803D] leading-tight">
              Today · 14:00
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#15803D] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2CA62C] animate-ping" />
            Starts in 45 mins
          </p>
        </div>

        {/* Stat 3: Pending Booking Requests */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Pending Requests
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#D97706] leading-tight">
              {pendingRequests.length}
            </span>
            <span className="text-xs font-bold text-[#C2410C] bg-[#FFF7ED] px-2 py-0.5 rounded-full">
              Action Needed
            </span>
          </div>
          <p className="text-[11px] font-medium text-gray-500 mt-1">1 urgent referral case</p>
        </div>

        {/* Stat 4: Hours Mentored */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Coaching Impact
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
              186
            </span>
            <span className="text-xs font-semibold text-gray-400">hrs</span>
          </div>
          <p className="text-[11px] font-bold text-[#15803D] mt-1 flex items-center gap-1">
            <StarIcon size={12} className="text-amber-500 fill-amber-500" /> 4.9 ★ avg rating
          </p>
        </div>
      </div>

      {/* ── FEATURED NEXT / LIVE SESSION HERO CALLOUT ── */}
      {featuredLiveSession && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#18234B] to-[#283979] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#387DFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            {/* Left information */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {featuredLiveSession.status === 'LIVE' ? 'SESSION READY TO JOIN' : 'UPCOMING NEXT'}
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  {featuredLiveSession.dateFull} · {featuredLiveSession.timeSlot}
                </span>
                <Tag
                  label={featuredLiveSession.format}
                  variant="blue"
                  className="bg-white/10 text-white border-white/20 text-[10px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${featuredLiveSession.menteeGradient} flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-sm border border-white/30`}
                >
                  {featuredLiveSession.menteeAvatarInitials}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                    {featuredLiveSession.menteeName}
                  </h2>
                  <p className="text-xs text-blue-200 font-medium">
                    {featuredLiveSession.menteeRole} · {featuredLiveSession.menteeOrganization}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-gray-200 leading-relaxed pt-1 font-normal bg-black/15 p-3 rounded-xl border border-white/10">
                <strong className="text-white font-bold">Agenda: </strong>
                {featuredLiveSession.topicAgenda}
              </p>
            </div>

            {/* Right actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-end">
              <button
                type="button"
                onClick={() => handleLaunchVideo(featuredLiveSession)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0047CC] hover:bg-[#387DFF] text-white text-sm font-extrabold transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-98 border border-blue-400/30"
              >
                <VideoIcon size={16} /> Join VORA Video
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSessionForDossier(featuredLiveSession);
                    setIsDossierModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer border border-white/15 text-center"
                >
                  Mentee Dossier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSessionToReschedule(featuredLiveSession);
                    setIsRescheduleModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer border border-white/15 text-center"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center border-b border-gray-200 mb-5 overflow-x-auto scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Upcoming Sessions</span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              activeTab === 'upcoming' ? 'bg-[#EBF6FF] text-[#0047CC]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {upcomingSessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'text-[#D97706] border-[#D97706]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Booking Requests</span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              pendingRequests.length > 0 ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'past'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Past Sessions & Logs</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {pastSessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Weekly Availability</span>
          <Tag label="Slots Active" variant="green" className="text-[10px] py-0.2" />
        </button>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      {activeTab !== 'calendar' && (
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <SearchIcon
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentee, topic, role…"
              className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-3.5 py-2 text-[13px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>

          {/* Format Filter */}
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            aria-label="Filter by session format"
            className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 focus:outline-none focus:border-[#0047CC] cursor-pointer"
          >
            <option value="ALL">All session formats</option>
            <option value="Deep Dive">Deep Dive (60 min)</option>
            <option value="Strategy Session">Strategy Session (30/45 min)</option>
            <option value="Executive Coaching">Executive Coaching (90 min)</option>
            <option value="Diagnostic Triage">Diagnostic Triage</option>
            <option value="Mock Panel Interview">Mock Panel Interview</option>
          </select>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            aria-label="Filter by country tier"
            className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 focus:outline-none focus:border-[#0047CC] cursor-pointer"
          >
            <option value="ALL">All country tiers</option>
            <option value="T1">T1 · High Income ($1,200+)</option>
            <option value="T2">T2 · Middle Income ($450+)</option>
            <option value="T3">T3 · Low Income ($150 - $220)</option>
          </select>
        </div>
      )}

      {/* ── TAB 1: UPCOMING SESSIONS ── */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3.5">
          {filteredUpcoming.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <CalendarIcon size={32} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-base font-bold text-gray-800">No sessions match your filters</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting search query or format selection</p>
            </div>
          ) : (
            filteredUpcoming.map((session) => {
              const isLive = session.status === 'LIVE';

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isLive
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Left: Date box + Mentee info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Date Badge */}
                    <div
                      className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-2xs ${
                        isLive
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-gray-50 border-gray-200 text-gray-800'
                      }`}
                    >
                      <span className="text-xl font-black leading-none">{session.dateDay}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider mt-1 opacity-80">
                        {session.dateMonth}
                      </span>
                    </div>

                    {/* Mentee Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] sm:text-base font-extrabold text-[#1A1A1A]">
                          {session.menteeName}
                        </span>
                        {isLive ? (
                          <Tag
                            label="Live Now"
                            variant="green"
                            className="font-extrabold text-[10px] py-0.5 px-2"
                          />
                        ) : (
                          <Tag
                            label="Confirmed"
                            variant="blue"
                            className="font-extrabold text-[10px] py-0.5 px-2"
                          />
                        )}
                        <Tag
                          label={session.format}
                          variant="blue-light"
                          className="text-[10px] font-bold py-0.5 px-2"
                        />
                        <Tag
                          label={`${session.tier} · ${session.menteeCountry}`}
                          variant={session.tier === 'T1' ? 'blue' : session.tier === 'T2' ? 'purple' : 'yellow'}
                          className="text-[10px] font-bold py-0.5 px-2"
                        />
                      </div>

                      <p className="text-xs text-gray-500 font-medium truncate">
                        {session.menteeRole} · {session.menteeOrganization}
                      </p>

                      <div className="text-xs text-gray-700 font-normal pt-1 line-clamp-2">
                        <strong className="font-semibold text-gray-900">Topic: </strong>
                        {session.topicAgenda}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 flex-wrap">
                        <span className="font-semibold text-[#0047CC] flex items-center gap-1">
                          <ClockIcon size={12} /> {session.timeSlot}
                        </span>
                        <span>•</span>
                        <span>{session.durationMinutes} minutes</span>
                        <span>•</span>
                        <span className="font-bold text-[#15803D]">${session.feeAmount} ({session.tierPricingLabel})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSessionForDossier(session);
                        setIsDossierModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
                    >
                      Dossier & Notes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSessionToReschedule(session);
                        setIsRescheduleModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all cursor-pointer shadow-2xs"
                    >
                      Reschedule
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchVideo(session)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98 ${
                        isLive
                          ? 'bg-[#15803D] hover:bg-[#135813] shadow-emerald-500/20'
                          : 'bg-[#0047CC] hover:bg-[#003d99]'
                      }`}
                    >
                      <VideoIcon size={13} /> {isLive ? 'Join Live Room' : 'Launch Video'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 2: PENDING BOOKING REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5 text-xs text-[#92400E] leading-relaxed flex items-start gap-3">
            <InfoIcon size={18} className="text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-[#78350F] block mb-0.5">
                Inbound Booking Requests
              </strong>
              These candidates requested a 1-on-1 session with you based on your expertise or via VORA assessment referrals. Review their target applications and confirm or suggest an alternate slot.
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <CheckIcon size={32} className="mx-auto text-emerald-500 mb-2" />
              <h3 className="text-base font-bold text-gray-800">All booking requests cleared!</h3>
              <p className="text-xs text-gray-500 mt-1">You have no pending requests awaiting confirmation.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-[#FDBA74] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${req.menteeGradient} flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-2xs`}
                    >
                      {req.menteeAvatarInitials}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-extrabold text-gray-900">
                          {req.menteeName}
                        </span>
                        {req.isUrgent && (
                          <Tag
                            label="Critical Referral"
                            variant="red"
                            className="text-[10px] font-extrabold py-0.5 px-2"
                          />
                        )}
                        <Tag
                          label={req.format}
                          variant="blue-light"
                          className="text-[10px] font-bold py-0.5 px-2"
                        />
                        <Tag
                          label={`${req.tier} · ${req.menteeCountry}`}
                          variant="yellow"
                          className="text-[10px] font-bold py-0.5 px-2"
                        />
                      </div>

                      <p className="text-xs text-gray-500 font-medium">
                        {req.menteeRole} · {req.menteeOrganization}
                      </p>

                      <div className="text-xs text-gray-800 font-normal pt-1">
                        <strong className="text-gray-900 font-semibold">Focus: </strong>
                        {req.topicAgenda}
                      </div>

                      {req.failureNotes && (
                        <div className="bg-red-50/80 border border-red-200/60 rounded-xl p-2.5 text-xs text-red-900 font-medium mt-2">
                          <strong className="block text-[11px] font-bold text-red-800">
                            Failure Diagnostic:
                          </strong>
                          {req.failureNotes}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                        <span className="font-semibold text-[#D97706]">{req.timeSlot}</span>
                        <span>•</span>
                        <span className="font-bold text-[#15803D]">${req.feeAmount} fee</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req)}
                      className="px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req)}
                      className="px-5 py-2 rounded-full bg-[#15803D] hover:bg-[#135813] text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      Confirm Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PAST SESSIONS & LOGS ── */}
      {activeTab === 'past' && (
        <div className="space-y-3.5">
          {pastSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-14 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center shrink-0 text-gray-600">
                  <span className="text-lg font-black leading-none">{session.dateDay}</span>
                  <span className="text-[9px] font-extrabold uppercase mt-1">{session.dateMonth}</span>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-extrabold text-gray-900">
                      {session.menteeName}
                    </span>
                    <Tag
                      label="Completed"
                      variant="green"
                      className="text-[10px] font-bold py-0.5 px-2"
                    />
                    {session.outcome && (
                      <Tag
                        label={session.outcome}
                        variant="green"
                        className="text-[10px] font-extrabold py-0.5 px-2 border border-[#86EFAC]"
                      />
                    )}
                    <Tag
                      label={session.format}
                      variant="blue-light"
                      className="text-[10px] font-bold py-0.5 px-2"
                    />
                  </div>

                  <p className="text-xs text-gray-500 font-medium">
                    {session.menteeRole} · {session.menteeOrganization}
                  </p>

                  <div className="text-xs text-gray-700 font-normal">
                    {session.topicAgenda}
                  </div>

                  {session.feedback && (
                    <div className="bg-gray-50 rounded-xl p-2.5 text-xs text-gray-600 italic border border-gray-100 mt-1">
                      "{session.feedback}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    <span>{session.durationMinutes} mins completed</span>
                    <span>•</span>
                    <span className="font-bold text-[#15803D]">${session.feeAmount} earned ({session.tierPricingLabel})</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSessionForDossier(session);
                    setIsDossierModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-2xs"
                >
                  View Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 4: WEEKLY AVAILABILITY SLOTS ── */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Weekly Recurring Availability
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Your public profile allows mentees to book slots automatically within these time windows.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings?tab=availability')}
              className="px-4 py-2 rounded-full bg-[#0047CC] text-white text-xs font-bold hover:bg-[#003d99] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              Edit Availability in Settings →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { day: 'Tuesday', slots: ['14:00 - 16:00 WAT', '16:30 - 18:00 WAT'], active: true },
              { day: 'Wednesday', slots: ['10:00 - 12:00 WAT', '14:00 - 17:00 WAT'], active: true },
              { day: 'Thursday', slots: ['15:00 - 18:00 WAT'], active: true },
              { day: 'Saturday', slots: ['11:00 - 14:00 WAT'], active: true },
            ].map((schedule, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-gray-900">{schedule.day}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1 pt-1">
                  {schedule.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white text-xs font-semibold text-[#0047CC] py-1 px-2.5 rounded-lg border border-blue-100 shadow-2xs"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#EBF6FF] border border-[#BFDBFE] text-xs text-[#0047CC] font-medium flex items-center justify-between gap-3">
            <span>
              💡 <strong>Booking buffer:</strong> 24 hours advance notice required. 15-minute padding between calls.
            </span>
            <span className="font-bold shrink-0">Timezone: WAT (GMT+1)</span>
          </div>
        </div>
      )}

      {/* ── MODAL: SCHEDULE NEW SESSION ── */}
      <ModalDialog
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule 1-on-1 Mentorship Session"
        maxWidth="max-w-[500px]"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSession}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Schedule Session
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mentee Name</label>
            <input
              type="text"
              value={newSessionForm.menteeName}
              onChange={(e) => setNewSessionForm({ ...newSessionForm, menteeName: e.target.value })}
              placeholder="e.g. Chiamaka Obi"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Session Format</label>
              <select
                value={newSessionForm.format}
                onChange={(e) =>
                  setNewSessionForm({ ...newSessionForm, format: e.target.value as SessionFormat })
                }
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
              >
                <option value="Deep Dive">Deep Dive (60m)</option>
                <option value="Strategy Session">Strategy Session (30/45m)</option>
                <option value="Executive Coaching">Executive Coaching (90m)</option>
                <option value="Diagnostic Triage">Diagnostic Triage (60m)</option>
                <option value="Mock Panel Interview">Mock Panel Interview (90m)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Country Tier</label>
              <select
                value={newSessionForm.tier}
                onChange={(e) =>
                  setNewSessionForm({ ...newSessionForm, tier: e.target.value as 'T1' | 'T2' | 'T3' })
                }
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
              >
                <option value="T3">T3 · LMIC (Subsidized)</option>
                <option value="T2">T2 · UMIC (Moderate)</option>
                <option value="T1">T1 · HIC (Standard Global)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newSessionForm.date}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, date: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={newSessionForm.time}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, time: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Agenda / Focus Area</label>
            <textarea
              rows={3}
              value={newSessionForm.agenda}
              onChange={(e) => setNewSessionForm({ ...newSessionForm, agenda: e.target.value })}
              placeholder="e.g. WHO application situational judgment triage and verbal reasoning reframe"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] resize-y"
            />
          </div>

          <div className="bg-[#EBF6FF] border border-[#BFDBFE] rounded-xl p-3 text-xs text-[#0047CC] font-medium">
            🎥 A dedicated VORA Video encrypted meeting link will be created and dispatched to both calendars.
          </div>
        </div>
      </ModalDialog>

      {/* ── MODAL: MENTEE DOSSIER & PREP NOTES ── */}
      <ModalDialog
        open={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={`Session Dossier · ${selectedSessionForDossier?.menteeName || ''}`}
        maxWidth="max-w-[540px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setIsDossierModalOpen(false);
                if (selectedSessionForDossier) {
                  navigate(`/mentees`);
                }
              }}
              className="text-xs font-bold text-[#0047CC] hover:underline cursor-pointer"
            >
              Open Full Mentee Profile →
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Session prep notes updated.');
                setIsDossierModalOpen(false);
              }}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        }
      >
        {selectedSessionForDossier && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedSessionForDossier.menteeGradient} flex items-center justify-center font-extrabold text-sm text-white shrink-0`}
              >
                {selectedSessionForDossier.menteeAvatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-gray-900 truncate">
                  {selectedSessionForDossier.menteeName}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {selectedSessionForDossier.menteeRole} · {selectedSessionForDossier.menteeOrganization}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Tag
                    label={`${selectedSessionForDossier.tier} · ${selectedSessionForDossier.menteeCountry}`}
                    variant="blue"
                    className="text-[10px] py-0.2"
                  />
                  <Tag
                    label={selectedSessionForDossier.pathway}
                    variant="gray"
                    className="text-[10px] py-0.2"
                  />
                </div>
              </div>
            </div>

            {selectedSessionForDossier.failureNotes && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                <strong className="block font-bold text-red-800 mb-0.5">Assessment Triage Alert:</strong>
                {selectedSessionForDossier.failureNotes}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Session Agenda</label>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed">
                {selectedSessionForDossier.topicAgenda}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mentor Private Preparation Notes
              </label>
              <textarea
                rows={3}
                defaultValue={selectedSessionForDossier.mentorPrepNotes || ''}
                placeholder="Key questions to probe, cognitive traps to monitor, practice sets to assign…"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0047CC] leading-relaxed"
              />
            </div>
          </div>
        )}
      </ModalDialog>

      {/* ── MODAL: RESCHEDULE SESSION ── */}
      <ModalDialog
        open={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title={`Reschedule Session with ${sessionToReschedule?.menteeName || ''}`}
        maxWidth="max-w-[440px]"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReschedule}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Save New Slot
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-600">
            Select a new date and time for this session. A calendar update will be sent immediately to the mentee.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Date</label>
            <input
              type="date"
              value={newRescheduleDate}
              onChange={(e) => setNewRescheduleDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">New Start Time</label>
            <input
              type="time"
              value={newRescheduleTime}
              onChange={(e) => setNewRescheduleTime(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
            />
          </div>
        </div>
      </ModalDialog>

      {/* ── MODAL: VORA VIDEO LAUNCH PREVIEW ── */}
      <ModalDialog
        open={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="VORA Encrypted Video Room"
        maxWidth="max-w-[500px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> WebRTC Audio/Video Ready
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Joining video room…');
                  setIsVideoModalOpen(false);
                  if (videoCallSession?.meetingLink) {
                    window.open(videoCallSession.meetingLink, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="px-5 py-2 rounded-full bg-[#15803D] hover:bg-[#135813] text-xs font-extrabold text-white transition-all cursor-pointer shadow-xs active:scale-98"
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
                <h4 className="text-base font-extrabold text-white">
                  {videoCallSession.format} with {videoCallSession.menteeName}
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  Room: {videoCallSession.meetingLink?.split('/').pop() || 'room-vora-secure'}
                </p>
              </div>
              <div className="inline-block bg-black/20 text-emerald-400 font-bold text-xs py-1 px-3 rounded-full border border-emerald-500/30">
                Waiting for host to begin meeting
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">Session Outline:</div>
              <div>{videoCallSession.topicAgenda}</div>
            </div>
          </div>
        )}
      </ModalDialog>

      {/* ── MODAL: CALENDAR SYNC & INTEGRATIONS ── */}
      <ModalDialog
        open={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title="Calendar Synchronization & 2-Way Integrations"
        maxWidth="max-w-[560px]"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-gray-500 font-medium truncate max-w-[220px]">
              {lastSyncTime}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncingNow}
                className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-60 active:scale-98"
              >
                {isSyncingNow ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Syncing…</span>
                  </>
                ) : (
                  <>
                    <span>🔄 Sync Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1 text-xs">
          {/* Explanation */}
          <p className="text-gray-500 leading-relaxed">
            Keep your VORA mentorship appointments seamlessly synchronized with your primary work calendars. Changes to sessions, rescheduling, and meeting room links will sync automatically.
          </p>

          {/* Connected Services */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Connected Calendar Services
            </h4>

            {/* Google Calendar */}
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <GoogleIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-[13px]">Google Calendar</span>
                    {googleConnected && (
                      <Tag
                        label="Connected"
                        variant="green"
                        className="text-[9px] font-bold py-0.2 px-1.5 border border-[#86EFAC]"
                      />
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] font-medium">
                    {googleConnected ? 'dr.adaeze.okonkwo@gmail.com · 2-way sync enabled' : 'Not connected'}
                  </p>
                </div>
              </div>

              <div>
                {googleConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleConnected(false);
                      toast('Google Calendar disconnected.');
                    }}
                    className="text-[11px] font-bold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleConnected(true);
                      toast.success('Google Calendar connected successfully!');
                    }}
                    className="text-[11px] font-bold text-[#0047CC] hover:bg-[#EBF6FF] px-3.5 py-1.5 rounded-full border border-[#0047CC]/30 transition-all cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* Outlook / Office 365 */}
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-center shrink-0 text-[#0047CC] font-bold text-sm">
                  O
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-[13px]">Microsoft Outlook 365</span>
                    {outlookConnected ? (
                      <Tag label="Connected" variant="green" className="text-[9px] font-bold py-0.2 px-1.5" />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold">Available</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] font-medium">
                    {outlookConnected ? 'Syncing with Outlook Calendar' : 'Connect your Outlook or Office 365 work calendar'}
                  </p>
                </div>
              </div>

              <div>
                {outlookConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOutlookConnected(false);
                      toast('Outlook disconnected.');
                    }}
                    className="text-[11px] font-bold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-full border border-gray-200 transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOutlookConnected(true);
                      toast.success('Outlook Calendar connected successfully!');
                    }}
                    className="text-[11px] font-bold text-gray-700 hover:text-[#0047CC] hover:bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200 transition-all cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subscribable Live Calendar Feed */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-gray-800 text-xs">
                Subscribe via iCal / Webcal Feed
              </span>
              <span className="text-[10px] font-bold text-[#0047CC]">Apple & Outlook</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Add this live URL to Apple Calendar or any calendar client to auto-sync confirmed mentorship sessions in real time.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="webcal://vora.ai/api/v1/mentors/calendar/feed.ics?token=vora_live_k8a9"
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-mono text-gray-700 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyWebcalFeed}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-[#0047CC] transition-all cursor-pointer shadow-2xs"
              >
                Copy URL
              </button>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Need a one-time file export instead?</span>
              <button
                type="button"
                onClick={handleExportCalendar}
                className="text-[#0047CC] font-bold hover:underline cursor-pointer"
              >
                Download .ICS File →
              </button>
            </div>
          </div>

          {/* Synchronization Preferences */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              2-Way Sync Preferences
            </h4>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBlockBusySlots}
                onChange={(e) => setAutoBlockBusySlots(e.target.checked)}
                className="mt-0.5 rounded text-[#0047CC] focus:ring-[#0047CC] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-800 block">Prevent double bookings</span>
                <span className="text-gray-500 text-[11px]">
                  Automatically block out availability in VORA when events exist on your connected work calendar.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVoraVideoLink}
                onChange={(e) => setIncludeVoraVideoLink(e.target.checked)}
                className="mt-0.5 rounded text-[#0047CC] focus:ring-[#0047CC] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-800 block">Include VORA Video Room Link</span>
                <span className="text-gray-500 text-[11px]">
                  Attach the encrypted WebRTC meeting room link directly in the event location and notes.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendCalendarInvites}
                onChange={(e) => setSendCalendarInvites(e.target.checked)}
                className="mt-0.5 rounded text-[#0047CC] focus:ring-[#0047CC] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-gray-800 block">Send calendar invites to mentee email</span>
                <span className="text-gray-500 text-[11px]">
                  Dispatch automated Google/Outlook calendar invites to the mentee when bookings are confirmed.
                </span>
              </div>
            </label>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

export default MentorSessionsPage;
