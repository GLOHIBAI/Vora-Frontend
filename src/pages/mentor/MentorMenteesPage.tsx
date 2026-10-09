import React, { useState, useMemo } from 'react';
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
} from '../../components/common/Icons';
import ModalDialog from '../../components/common/ModalDialog';
import Tag from '../../components/common/Tag';

// --- Type Definitions ---
export type MenteeTier = 'T1' | 'T2' | 'T3';
export type MenteePathway = 'VORA Matched' | 'Direct Booking' | 'Assessment Referred';
export type MenteeStatus = 'active' | 'past' | 'referred';

export interface CompetencyScore {
  name: string;
  score: number; // 0 - 100
}

export interface SessionHistoryItem {
  id: string;
  day: string;
  month: string;
  durationMinutes: number;
  type: string;
  topic: string;
  status: 'Completed' | 'Upcoming' | 'Confirmed';
  fee: number;
  tierRateNote: string;
}

export interface MentorNote {
  id: string;
  date: string;
  text: string;
  type?: 'post-session' | 'initial' | 'general';
}

export interface MenteeItem {
  id: string;
  name: string;
  avatarInitials: string;
  avatarGradient: string;
  role: string;
  organization: string;
  country: string;
  tier: MenteeTier;
  pathway: MenteePathway;
  status: MenteeStatus;
  isUrgent?: boolean;
  alertBanner?: string;
  journeyProgress: number; // 0 - 100
  totalSessions: number;
  totalHours: number;
  earnings: number;
  tierPricingLabel: string;
  competencies: CompetencyScore[];
  sessionsHistory: SessionHistoryItem[];
  notes: MentorNote[];
  outcomeTracked?: string;
}

// --- Initial Mock Data (matching user mockup & specs) ---
const INITIAL_ACTIVE_MENTEES: MenteeItem[] = [
  {
    id: 'mc1',
    name: 'Kofi Mensah-Asante',
    avatarInitials: 'KM',
    avatarGradient: 'from-[#6EE7B7] to-[#3B82F6]',
    role: 'Health Systems Analyst',
    organization: 'Ghana Health Service',
    country: 'Ghana',
    tier: 'T3',
    pathway: 'VORA Matched',
    status: 'active',
    journeyProgress: 68,
    totalSessions: 5,
    totalHours: 2,
    earnings: 750,
    tierPricingLabel: 'T3 pricing',
    competencies: [
      { name: 'Health Systems Thinking', score: 72 },
      { name: 'Psychometric', score: 41 },
      { name: 'SJT Performance', score: 68 },
      { name: 'Executive Communication', score: 55 },
    ],
    sessionsHistory: [
      {
        id: 's1-1',
        day: '08',
        month: 'Mar',
        durationMinutes: 60,
        type: 'Deep Dive',
        topic: 'Psychometric gap analysis',
        status: 'Completed',
        fee: 220,
        tierRateNote: 'T3 rate',
      },
      {
        id: 's1-2',
        day: '22',
        month: 'Feb',
        durationMinutes: 30,
        type: 'Strategy',
        topic: 'WHO application review',
        status: 'Completed',
        fee: 150,
        tierRateNote: 'T3 rate',
      },
      {
        id: 's1-3',
        day: '15',
        month: 'Mar',
        durationMinutes: 60,
        type: 'Deep Dive',
        topic: 'Upcoming - SJT Simulation',
        status: 'Confirmed',
        fee: 220,
        tierRateNote: 'T3 rate',
      },
    ],
    notes: [
      {
        id: 'n1-1',
        date: 'Mar 8 · Post-session',
        text: 'Primary gap is in structured decision-making under ambiguity — psychometric collapse happens specifically on timed verbal reasoning. Recommended: daily 15-min timed practice sets + reframe from "test taking" to "role simulation." Next session: revisit SJT scenario approach.',
        type: 'post-session',
      },
    ],
  },
  {
    id: 'mc2',
    name: 'Dr. Nadia Benali',
    avatarInitials: 'NB',
    avatarGradient: 'from-[#FCA5A5] to-[#F87171]',
    role: 'Senior Technical Advisor',
    organization: 'WHO HQ, France',
    country: 'France',
    tier: 'T1',
    pathway: 'Direct Booking',
    status: 'active',
    journeyProgress: 90,
    totalSessions: 3,
    totalHours: 4.5,
    earnings: 4500,
    tierPricingLabel: 'T1 pricing',
    competencies: [
      { name: 'Executive Presence', score: 88 },
      { name: 'Strategic Communication', score: 92 },
      { name: 'Panel Performance', score: 85 },
    ],
    sessionsHistory: [
      {
        id: 's2-1',
        day: '04',
        month: 'Mar',
        durationMinutes: 90,
        type: 'Executive Coaching',
        topic: 'Panel advancement simulation',
        status: 'Completed',
        fee: 2200,
        tierRateNote: 'T1 rate',
      },
      {
        id: 's2-2',
        day: '18',
        month: 'Feb',
        durationMinutes: 60,
        type: 'Deep Dive',
        topic: 'Governance-level narrative translation',
        status: 'Completed',
        fee: 1500,
        tierRateNote: 'T1 rate',
      },
    ],
    notes: [
      {
        id: 'n2-1',
        date: 'Mar 4 · Post-session',
        text: 'Excellent candidate. Near-ready for panel advancement. Primary development area: translating technical expertise into governance-level narrative for non-technical panels. Three more targeted sessions should complete the journey. Outcome milestone approaching.',
        type: 'post-session',
      },
    ],
  },
  {
    id: 'mc3',
    name: 'Taiwo Adeyemi',
    avatarInitials: 'TA',
    avatarGradient: 'from-[#FCD34D] to-[#F59E0B]',
    role: 'Programme Analyst',
    organization: 'UNICEF Nigeria',
    country: 'Nigeria',
    tier: 'T3',
    pathway: 'Assessment Referred',
    status: 'referred',
    isUrgent: true,
    alertBanner:
      'Failed Psychometric ×3 + Video ×2 across WHO + UNICEF. Deep intervention required. Next session: foundational gap mapping.',
    journeyProgress: 22,
    totalSessions: 1,
    totalHours: 1,
    earnings: 150,
    tierPricingLabel: 'T3 pricing',
    competencies: [
      { name: 'Structured Reasoning', score: 35 },
      { name: 'SJT Prioritization', score: 28 },
      { name: 'Technical Domain', score: 74 },
      { name: 'Simulation Confidence', score: 30 },
    ],
    sessionsHistory: [
      {
        id: 's3-1',
        day: '07',
        month: 'Mar',
        durationMinutes: 60,
        type: 'Initial Triage',
        topic: 'Assessment triage & cognitive diagnosis',
        status: 'Completed',
        fee: 150,
        tierRateNote: 'T3 rate',
      },
    ],
    notes: [
      {
        id: 'n3-1',
        date: 'Mar 7 · Initial assessment session',
        text: 'Taiwo is highly intelligent and motivated but has a specific cognitive pattern that trips him on timed reasoning — he\'s over-indexing on "correct" answers when SJT needs prioritization of "most appropriate." Needs complete reframe of assessment approach. High-intensity intervention plan required. 6-session plan recommended.',
        type: 'initial',
      },
    ],
  },
  {
    id: 'mc4',
    name: 'Dr. Chen Wei',
    avatarInitials: 'CW',
    avatarGradient: 'from-[#93C5FD] to-[#3B82F6]',
    role: 'Health Informatics Specialist',
    organization: 'Ministry of Health Singapore',
    country: 'Singapore',
    tier: 'T1',
    pathway: 'Direct Booking',
    status: 'active',
    journeyProgress: 84,
    totalSessions: 4,
    totalHours: 5,
    earnings: 3800,
    tierPricingLabel: 'T1 pricing',
    competencies: [
      { name: 'Global Health Architecture', score: 86 },
      { name: 'Executive Presentation', score: 80 },
      { name: 'Multilateral Negotiations', score: 78 },
    ],
    sessionsHistory: [
      {
        id: 's4-1',
        day: '01',
        month: 'Mar',
        durationMinutes: 75,
        type: 'Strategy Session',
        topic: 'Digital health governance transition',
        status: 'Completed',
        fee: 1200,
        tierRateNote: 'T1 rate',
      },
    ],
    notes: [
      {
        id: 'n4-1',
        date: 'Mar 1 · Strategy Check',
        text: 'Strong technical baseline. Transitioning nicely to multilateral negotiation frameworks.',
        type: 'general',
      },
    ],
  },
];

const INITIAL_PAST_MENTEES: MenteeItem[] = [
  {
    id: 'pm1',
    name: 'James Okello',
    avatarInitials: 'JO',
    avatarGradient: 'from-[#A5B4FC] to-[#6366F1]',
    role: 'Programme Officer',
    organization: 'UNICEF Kenya',
    country: 'Kenya',
    tier: 'T3',
    pathway: 'VORA Matched',
    status: 'past',
    journeyProgress: 100,
    totalSessions: 8,
    totalHours: 10,
    earnings: 1200,
    tierPricingLabel: 'T3 pricing',
    outcomeTracked: 'Got the role ✓',
    competencies: [
      { name: 'Health Systems Thinking', score: 90 },
      { name: 'SJT Performance', score: 88 },
    ],
    sessionsHistory: [],
    notes: [],
  },
  {
    id: 'pm2',
    name: 'Dr. Emeka Nwosu',
    avatarInitials: 'EN',
    avatarGradient: 'from-[#FCA5A5] to-[#FB923C]',
    role: 'Health Systems Director',
    organization: 'WHO AFRO',
    country: 'Switzerland',
    tier: 'T1',
    pathway: 'Direct Booking',
    status: 'past',
    journeyProgress: 100,
    totalSessions: 6,
    totalHours: 9,
    earnings: 13200,
    tierPricingLabel: 'T1 pricing',
    outcomeTracked: 'Promoted ✓',
    competencies: [
      { name: 'Executive Presence', score: 94 },
      { name: 'Policy Leadership', score: 92 },
    ],
    sessionsHistory: [],
    notes: [],
  },
  {
    id: 'pm3',
    name: 'Amina Diallo',
    avatarInitials: 'AD',
    avatarGradient: 'from-[#C4B5FD] to-[#8B5CF6]',
    role: 'Regional Epidemiologist',
    organization: 'West Africa Health Org',
    country: 'Senegal',
    tier: 'T2',
    pathway: 'VORA Matched',
    status: 'past',
    journeyProgress: 100,
    totalSessions: 10,
    totalHours: 12,
    earnings: 2800,
    tierPricingLabel: 'T2 pricing',
    outcomeTracked: 'Advanced to Lead ✓',
    competencies: [
      { name: 'Field Epidemiology', score: 92 },
      { name: 'Stakeholder Influence', score: 86 },
    ],
    sessionsHistory: [],
    notes: [],
  },
];

const INITIAL_REFERRED_CANDIDATES = [
  {
    id: 'ref1',
    name: 'Taiwo Adeyemi',
    avatarInitials: 'TA',
    role: 'Programme Analyst · UNICEF Nigeria',
    country: 'Nigeria (T3)',
    reason: 'Failed Psychometric ×3 + Video ×2 across WHO + UNICEF',
    urgency: 'Critical',
    recommendation: 'Foundational cognitive reframe + 6-session structured intervention',
  },
  {
    id: 'ref2',
    name: 'Samuel Osei',
    avatarInitials: 'SO',
    role: 'Health Policy Associate · Ghana MoH',
    country: 'Ghana (T3)',
    reason: 'Failed SJT ×2 on WHO AFRO Leadership Pipeline',
    urgency: 'High',
    recommendation: 'Situational Judgment scenario prioritization coaching',
  },
  {
    id: 'ref3',
    name: 'Grace Kintu',
    avatarInitials: 'GK',
    role: 'Grants Operations Manager · Global Fund',
    country: 'Uganda (T3)',
    reason: 'Failed Executive Panel Simulation ×2',
    urgency: 'High',
    recommendation: 'Panel presentation structuring & confidence building',
  },
];

export const MentorMenteesPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'referred'>('active');
  const [mentees, setMentees] = useState<MenteeItem[]>(INITIAL_ACTIVE_MENTEES);
  const [pastMentees, setPastMentees] = useState<MenteeItem[]>(INITIAL_PAST_MENTEES);
  const [expandedCardId, setExpandedCardId] = useState<string | null>('mc1'); // Default open first card
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedPathway, setSelectedPathway] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Add Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [targetMenteeForNote, setTargetMenteeForNote] = useState<MenteeItem | null>(null);
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sessionType: '60 min · Deep Dive',
    text: '',
    competency: '',
    score: '',
  });

  // Schedule Session Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetMenteeForSchedule, setTargetMenteeForSchedule] = useState<MenteeItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    time: '14:00',
    duration: '60',
    type: 'Deep Dive',
    topic: 'Strategy & Mock Simulation',
  });

  // Mark Outcome Modal State
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [targetMenteeForOutcome, setTargetMenteeForOutcome] = useState<MenteeItem | null>(null);
  const [outcomeForm, setOutcomeForm] = useState({
    outcome: 'Got the role ✓',
    details: 'Offered permanent role as Technical Advisor',
  });

  // Message Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [targetMenteeForMessage, setTargetMenteeForMessage] = useState<MenteeItem | null>(null);
  const [messageText, setMessageText] = useState('');

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  // Filtered and Sorted Active Mentees
  const filteredActiveMentees = useMemo(() => {
    return mentees.filter((m) => {
      // Search
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.country.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Tier
      if (selectedTier !== 'All') {
        if (!m.tier.includes(selectedTier)) return false;
      }

      // Pathway
      if (selectedPathway !== 'All') {
        if (m.pathway !== selectedPathway) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'earnings') return b.earnings - a.earnings;
      if (sortBy === 'sessions') return b.totalSessions - a.totalSessions;
      if (sortBy === 'progress') return b.journeyProgress - a.journeyProgress;
      return 0; // Default order
    });
  }, [mentees, searchQuery, selectedTier, selectedPathway, sortBy]);

  // Handle Note Save
  const handleSaveNote = () => {
    if (!targetMenteeForNote) return;
    if (!noteForm.text.trim()) {
      toast.error('Please enter a note description');
      return;
    }

    const newNote: MentorNote = {
      id: `n-${Date.now()}`,
      date: `${new Date(noteForm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Post-session`,
      text: noteForm.text.trim(),
      type: 'post-session',
    };

    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === targetMenteeForNote.id) {
          let updatedCompetencies = [...m.competencies];
          if (noteForm.competency && noteForm.score) {
            const numScore = parseInt(noteForm.score, 10);
            if (!isNaN(numScore)) {
              const compIndex = updatedCompetencies.findIndex((c) => c.name === noteForm.competency);
              if (compIndex >= 0) {
                updatedCompetencies[compIndex] = { ...updatedCompetencies[compIndex], score: numScore };
              } else {
                updatedCompetencies.push({ name: noteForm.competency, score: numScore });
              }
            }
          }
          return {
            ...m,
            notes: [newNote, ...m.notes],
            competencies: updatedCompetencies,
          };
        }
        return m;
      })
    );

    toast.success(`Note saved for ${targetMenteeForNote.name}!`);
    setIsNoteModalOpen(false);
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      sessionType: '60 min · Deep Dive',
      text: '',
      competency: '',
      score: '',
    });
  };

  // Handle Schedule Session
  const handleSaveSchedule = () => {
    if (!targetMenteeForSchedule) return;

    const newSession: SessionHistoryItem = {
      id: `s-${Date.now()}`,
      day: new Date(scheduleForm.date).getDate().toString().padStart(2, '0'),
      month: new Date(scheduleForm.date).toLocaleString('en-US', { month: 'short' }),
      durationMinutes: parseInt(scheduleForm.duration, 10) || 60,
      type: scheduleForm.type,
      topic: scheduleForm.topic,
      status: 'Confirmed',
      fee: targetMenteeForSchedule.tier === 'T1' ? 1500 : targetMenteeForSchedule.tier === 'T2' ? 550 : 220,
      tierRateNote: `${targetMenteeForSchedule.tier} rate`,
    };

    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === targetMenteeForSchedule.id) {
          return {
            ...m,
            sessionsHistory: [newSession, ...m.sessionsHistory],
            totalSessions: m.totalSessions + 1,
          };
        }
        return m;
      })
    );

    toast.success(`Session scheduled with ${targetMenteeForSchedule.name}!`);
    setIsScheduleModalOpen(false);
  };

  // Handle Mark Outcome
  const handleSaveOutcome = () => {
    if (!targetMenteeForOutcome) return;

    // Move mentee to past mentees
    const completedMentee: MenteeItem = {
      ...targetMenteeForOutcome,
      status: 'past',
      outcomeTracked: outcomeForm.outcome,
      journeyProgress: 100,
    };

    setMentees((prev) => prev.filter((m) => m.id !== targetMenteeForOutcome.id));
    setPastMentees((prev) => [completedMentee, ...prev]);

    toast.success(`Outcome marked: "${outcomeForm.outcome}" for ${targetMenteeForOutcome.name}!`);
    setIsOutcomeModalOpen(false);
  };

  // Handle Send Message
  const handleSendMessage = () => {
    if (!targetMenteeForMessage || !messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`Message sent to ${targetMenteeForMessage.name}!`);
    setMessageText('');
    setIsMessageModalOpen(false);
  };

  // Export CSV Report
  const handleExportReport = () => {
    const rows = [
      ['Name', 'Role', 'Organization', 'Country', 'Tier', 'Pathway', 'Status', 'Sessions', 'Hours', 'Earnings', 'Progress (%)'],
      ...mentees.map((m) => [
        `"${m.name}"`,
        `"${m.role}"`,
        `"${m.organization}"`,
        `"${m.country}"`,
        m.tier,
        `"${m.pathway}"`,
        m.status,
        m.totalSessions,
        m.totalHours,
        m.earnings,
        m.journeyProgress,
      ]),
      ...pastMentees.map((m) => [
        `"${m.name}"`,
        `"${m.role}"`,
        `"${m.organization}"`,
        `"${m.country}"`,
        m.tier,
        `"${m.pathway}"`,
        'completed',
        m.totalSessions,
        m.totalHours,
        m.earnings,
        100,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vora_mentees_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Mentee progress and earnings report exported successfully!');
  };

  // Helper for competency bar color
  const getCompetencyBarColor = (score: number) => {
    if (score >= 70) return 'bg-[#2CA62C]'; // Green
    if (score >= 50) return 'bg-[#0047CC]'; // Blue
    if (score >= 40) return 'bg-[#D97706]'; // Amber
    return 'bg-[#DC2626]'; // Red
  };

  const getCompetencyTextColor = (score: number) => {
    if (score >= 70) return 'text-[#1D871D]';
    if (score >= 50) return 'text-[#0047CC]';
    if (score >= 40) return 'text-[#D97706]';
    return 'text-[#DC2626]';
  };

  return (
    <div className="w-full pb-16">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
            My Mentees
          </h1>
          <p className="text-[13px] sm:text-sm text-gray-500 mt-1 font-medium">
            Track sessions, progress, notes and earnings across your global mentee base.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:text-[#0047CC] hover:border-[#0047CC] hover:bg-gray-50 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetMenteeForSchedule(mentees[0]);
              setIsScheduleModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0047CC] text-[13px] font-bold text-white hover:bg-[#003d99] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
          >
            <PlusIcon size={14} strokeWidth={2.5} />
            Schedule Session
          </button>
        </div>
      </div>

      {/* ── STATS ROW (4 Cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Active Mentees */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Active Mentees
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
              {mentees.length}
            </span>
            <span className="text-sm font-semibold text-gray-400">/20</span>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 mt-1">2 slots remaining</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Total Sessions
          </p>
          <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
            312
          </span>
          <p className="text-[11px] font-bold text-[#15803D] mt-1 flex items-center gap-0.5">
            <ArrowUpIcon size={12} strokeWidth={3} /> 24 this month
          </p>
        </div>

        {/* Mentee Countries */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Mentee Countries
          </p>
          <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
            41
          </span>
          <p className="text-[11px] font-medium text-gray-500 mt-1 truncate">
            T1: 40% · T2: 35% · T3: 25%
          </p>
        </div>

        {/* Outcomes Tracked */}
        <div className="bg-white border border-gray-100 rounded-[16px] p-4 sm:p-5 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
            Outcomes Tracked
          </p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl sm:text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
              67
            </span>
            <span className="text-lg font-extrabold text-[#15803D]">%</span>
          </div>
          <p className="text-[11px] font-bold text-[#15803D] mt-1">
            Got role or advanced
          </p>
        </div>
      </div>

      {/* ── PPP EARNINGS BREAKDOWN BANNER ── */}
      <div className="bg-gradient-to-br from-[#EBF6FF] via-[#F0F5FF] to-[#F5F3FF] border border-[#BFDBFE] rounded-[16px] p-4 sm:p-5 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3.5">
          <svg
            width="15"
            height="15"
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
          <span className="text-xs sm:text-[13px] font-extrabold text-[#1A1A1A] tracking-tight">
            Global Pricing Earnings · This Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          {/* T1 */}
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 text-center border border-blue-100">
            <div className="text-lg sm:text-xl font-extrabold text-[#0047CC] tracking-tight">
              $9,600
            </div>
            <div className="inline-block text-[10px] font-bold text-[#0047CC] bg-[#EBF6FF] px-2 py-0.5 rounded-full mt-1">
              T1 · 8 sessions
            </div>
          </div>
          {/* T2 */}
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 text-center border border-purple-100">
            <div className="text-lg sm:text-xl font-extrabold text-[#7C3AED] tracking-tight">
              $3,360
            </div>
            <div className="inline-block text-[10px] font-bold text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full mt-1">
              T2 · 8 sessions
            </div>
          </div>
          {/* T3 */}
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 text-center border border-amber-100">
            <div className="text-lg sm:text-xl font-extrabold text-[#D97706] tracking-tight">
              $1,200
            </div>
            <div className="inline-block text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full mt-1">
              T3 · 8 sessions
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-600 font-medium gap-1.5 pt-1 border-t border-blue-100/60">
          <span>
            <strong className="text-gray-900 font-bold">$14,160 total</strong> · avg $590/session across all tiers · 80% platform payout applied
          </span>
          <button
            type="button"
            onClick={() => navigate('/finances')}
            className="text-[11px] font-bold text-[#0047CC] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Full earnings →
          </button>
        </div>
      </div>

      {/* ── TABS (Active / Past / Referred) ── */}
      <div className="flex items-center border-b border-gray-200 mb-5 overflow-x-auto scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'active'
              ? 'text-[#0047CC] border-[#0047CC]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Active</span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              activeTab === 'active' ? 'bg-[#EBF6FF] text-[#0047CC]' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {mentees.length}
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
          <span>Past Mentees</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {pastMentees.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('referred')}
          className={`pb-3 px-3 text-[13.5px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'referred'
              ? 'text-[#C2410C] border-[#C2410C]'
              : 'text-gray-500 border-transparent hover:text-gray-800'
          }`}
        >
          <span>Assessment Referred</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#C2410C]">
            {INITIAL_REFERRED_CANDIDATES.length}
          </span>
        </button>
      </div>

      {/* ── FILTERS ROW ── */}
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
            placeholder="Search mentees…"
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

        {/* Tier Filter */}
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          aria-label="Filter mentees by country tier"
          className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 focus:outline-none focus:border-[#0047CC] cursor-pointer"
        >
          <option value="All">All tiers</option>
          <option value="T1">T1 · HIC</option>
          <option value="T2">T2 · UMIC</option>
          <option value="T3">T3 · LMIC</option>
        </select>

        {/* Pathway Filter */}
        <select
          value={selectedPathway}
          onChange={(e) => setSelectedPathway(e.target.value)}
          aria-label="Filter mentees by matching pathway"
          className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 focus:outline-none focus:border-[#0047CC] cursor-pointer"
        >
          <option value="All">All pathways</option>
          <option value="VORA Matched">VORA Matched</option>
          <option value="Direct Booking">Direct Booking</option>
          <option value="Assessment Referred">Assessment Referred</option>
        </select>

        {/* Sort Filter */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort mentees"
          className="bg-white border border-gray-200 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 focus:outline-none focus:border-[#0047CC] cursor-pointer"
        >
          <option value="recent">Most recent</option>
          <option value="earnings">Highest earnings</option>
          <option value="sessions">Most sessions</option>
          <option value="progress">Journey progress</option>
        </select>
      </div>

      {/* ── TAB 1: ACTIVE MENTEES ── */}
      {activeTab === 'active' && (
        <div className="space-y-3.5">
          {filteredActiveMentees.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <UsersIcon size={32} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-base font-bold text-gray-800">No mentees found</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting your search or filter options</p>
            </div>
          ) : (
            filteredActiveMentees.map((mentee) => {
              const isExpanded = expandedCardId === mentee.id;

              return (
                <div
                  key={mentee.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md ${
                    mentee.isUrgent
                      ? 'border-[#FDBA74] shadow-xs'
                      : isExpanded
                      ? 'border-[#0047CC]/30 ring-1 ring-[#0047CC]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Card Header (Clickable accordion) */}
                  <div
                    onClick={() => toggleCard(mentee.id)}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer select-none transition-colors ${
                      mentee.isUrgent ? 'bg-[#FFFBEB]/40' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${mentee.avatarGradient} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-xs border-2 border-white`}
                      >
                        {mentee.avatarInitials}
                      </div>

                      {/* Mentee info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[15px] sm:text-base font-extrabold text-[#1A1A1A]">
                            {mentee.name}
                          </span>
                          {/* Status dot */}
                          <span className="relative flex h-2 w-2">
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                mentee.isUrgent ? 'bg-red-400' : 'bg-[#2CA62C]'
                              }`}
                            />
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${
                                mentee.isUrgent ? 'bg-[#DC2626]' : 'bg-[#2CA62C]'
                              }`}
                            />
                          </span>
                          {mentee.isUrgent && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                              Highest Priority
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 font-medium truncate mb-2">
                          {mentee.role} · {mentee.organization}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                          {mentee.pathway === 'VORA Matched' && (
                            <Tag
                              label="⚡ VORA Matched"
                              variant="blue"
                              className="text-[10px] font-extrabold border border-[#A5B4FC] bg-[#EEF2FF] text-[#4338CA] py-0.5 px-2"
                            />
                          )}
                          {mentee.pathway === 'Direct Booking' && (
                            <Tag
                              label="Direct Booking"
                              variant="green"
                              className="text-[10px] font-extrabold border border-[#86EFAC] bg-[#F0FDF4] text-[#15803D] py-0.5 px-2"
                            />
                          )}
                          {mentee.pathway === 'Assessment Referred' && (
                            <Tag
                              label="⚠ Assessment Referred"
                              variant="orange"
                              className="text-[10px] font-extrabold border border-[#FDBA74] bg-[#FFF7ED] text-[#C2410C] py-0.5 px-2"
                            />
                          )}

                          {/* Tier Badge */}
                          <Tag
                            label={`${mentee.tier} · ${mentee.country}`}
                            variant={mentee.tier === 'T1' ? 'blue' : mentee.tier === 'T2' ? 'purple' : 'yellow'}
                            className="text-[10px] font-extrabold py-0.5 px-2 border"
                          />
                        </div>

                        {/* Journey mini-progress bar */}
                        <div className="flex items-center gap-3 max-w-sm">
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                              <span>Journey progress</span>
                              <span
                                className={
                                  mentee.isUrgent
                                    ? 'text-[#DC2626]'
                                    : mentee.journeyProgress >= 80
                                    ? 'text-[#1D871D]'
                                    : 'text-[#0047CC]'
                                }
                              >
                                {mentee.journeyProgress}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  mentee.isUrgent
                                    ? 'bg-gradient-to-r from-red-500 to-amber-500'
                                    : 'bg-gradient-to-r from-[#1D871D] to-[#2CA62C]'
                                }`}
                                style={{ width: `${mentee.journeyProgress}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                            {mentee.totalSessions} sessions · {mentee.totalHours} hrs total
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right column stats + Chevron */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 gap-1 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-extrabold text-[#1A1A1A]">
                          {mentee.totalSessions}{' '}
                          <span className="text-xs text-gray-500 font-semibold">sessions</span>
                        </div>
                        <div className="text-[13px] font-extrabold text-[#1D871D]">
                          ${mentee.earnings.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold">
                          {mentee.tierPricingLabel}
                        </div>
                      </div>

                      <div className="mt-1">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 text-gray-400 hover:text-gray-600 ${
                            isExpanded ? 'rotate-180 bg-gray-100' : 'bg-gray-50'
                          }`}
                        >
                          <ChevronDownIcon size={14} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Urgent Alert Banner (for Referred / Critical candidates) */}
                  {mentee.alertBanner && (
                    <div className="bg-[#FEF2F2] border-t border-b border-[#FECACA] px-4 sm:px-5 py-2.5 text-xs text-[#991B1B] font-semibold flex items-center gap-2">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        className="shrink-0"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{mentee.alertBanner}</span>
                    </div>
                  )}

                  {/* ── EXPANDED DETAILS ACCORDION ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-white">
                      {/* Grid: Competency Progress & Session History */}
                      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Competency Progress */}
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
                            <span>Competency Progress</span>
                            <span className="text-[10px] text-gray-400 font-normal">Updated per session</span>
                          </div>
                          <div className="space-y-3">
                            {mentee.competencies.map((comp, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-gray-700 truncate max-w-[200px]">
                                    {comp.name}
                                  </span>
                                  <span
                                    className={`font-extrabold text-[11px] ${getCompetencyTextColor(
                                      comp.score
                                    )}`}
                                  >
                                    {comp.score}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${getCompetencyBarColor(
                                      comp.score
                                    )}`}
                                    style={{ width: `${comp.score}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Session History */}
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
                            <span>Session History</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {mentee.sessionsHistory.length} recorded
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            {mentee.sessionsHistory.map((sess) => (
                              <div
                                key={sess.id}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/80 transition-colors border border-gray-100"
                              >
                                {/* Date badge */}
                                <div className="w-10 h-11 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                                  <span className="text-sm font-extrabold text-gray-900 leading-none">
                                    {sess.day}
                                  </span>
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-gray-400 mt-0.5">
                                    {sess.month}
                                  </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12.5px] font-bold text-gray-900 truncate">
                                    {sess.durationMinutes} min · {sess.type}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                                    <span className="truncate max-w-[170px]">{sess.topic}</span>
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                        sess.status === 'Completed'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-amber-50 text-amber-700'
                                      }`}
                                    >
                                      {sess.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Fee */}
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-extrabold text-gray-900">
                                    ${sess.fee}
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-medium">
                                    {sess.tierRateNote}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 3. Private Mentor Notes */}
                      <div className="px-4 sm:px-5 pb-4">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                          Mentor Notes (Private)
                        </div>
                        <div className="space-y-2 mb-3">
                          {mentee.notes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-3 rounded-xl border text-xs text-gray-800 leading-relaxed ${
                                note.type === 'initial'
                                  ? 'bg-[#FFF7ED] border-[#FDBA74]'
                                  : mentee.tier === 'T1'
                                  ? 'bg-[#EBF6FF] border-[#BFDBFE]'
                                  : 'bg-[#FFFBEB] border-[#FDE68A]'
                              }`}
                            >
                              <div
                                className={`text-[10px] font-bold mb-1 ${
                                  note.type === 'initial'
                                    ? 'text-[#C2410C]'
                                    : mentee.tier === 'T1'
                                    ? 'text-[#0047CC]'
                                    : 'text-[#D97706]'
                                }`}
                              >
                                {note.date}
                              </div>
                              <p>{note.text}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetMenteeForNote(mentee);
                            setIsNoteModalOpen(true);
                          }}
                          className="w-full bg-gray-50 hover:bg-[#EBF6FF] hover:border-[#0047CC] hover:text-[#0047CC] border border-dashed border-gray-300 rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <PlusIcon size={13} strokeWidth={2.5} /> Add note after session…
                        </button>
                      </div>

                      {/* 4. Footer Actions */}
                      <div className="px-4 sm:px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 flex-wrap justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {mentee.isUrgent ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetMenteeForSchedule(mentee);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-1.5"
                            >
                              <CalendarIcon size={13} /> Schedule Urgent Session
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setTargetMenteeForSchedule(mentee);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-1.5"
                            >
                              <PlusIcon size={12} strokeWidth={2.5} /> Book Next Session
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setTargetMenteeForMessage(mentee);
                              setIsMessageModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <MailIcon size={13} /> Message
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toast(`Viewing full candidate profile for ${mentee.name}`);
                            }}
                            className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
                          >
                            View Full Profile
                          </button>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetMenteeForOutcome(mentee);
                              setIsOutcomeModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-full bg-[#EEFBEE] hover:bg-emerald-100 border border-[#A7F3D0] text-xs font-bold text-[#15803D] transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckIcon size={12} strokeWidth={3} /> Mark Outcome
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Load More Button */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => toast('All current mentees loaded.')}
              className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:text-[#0047CC] hover:border-[#0047CC] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
            >
              Load more mentees (15 more)
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: PAST MENTEES ── */}
      {activeTab === 'past' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pastMentees.map((mentee) => (
            <div
              key={mentee.id}
              onClick={() => toast(`Viewing completed journey for ${mentee.name}`)}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer hover:border-[#0047CC]/40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${mentee.avatarGradient} flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs`}
                >
                  {mentee.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-[#1A1A1A] truncate">
                    {mentee.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium truncate">
                    {mentee.role} · {mentee.organization}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <Tag
                  label={mentee.pathway}
                  variant={mentee.pathway === 'VORA Matched' ? 'blue' : 'green'}
                  className="text-[10px] font-extrabold py-0.5 px-2 border"
                />
                <Tag
                  label={`${mentee.tier} · ${mentee.country}`}
                  variant={mentee.tier === 'T1' ? 'blue' : mentee.tier === 'T2' ? 'purple' : 'yellow'}
                  className="text-[10px] font-extrabold py-0.5 px-2 border"
                />
                {mentee.outcomeTracked && (
                  <Tag
                    label={mentee.outcomeTracked}
                    variant="green"
                    className="text-[10px] font-extrabold py-0.5 px-2 border border-[#A7F3D0]"
                  />
                )}
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-gray-600 border-t border-gray-100 pt-2.5">
                <span>
                  {mentee.totalSessions} sessions · {mentee.totalHours} hrs
                </span>
                <span className="text-[#15803D] font-extrabold">
                  ${mentee.earnings.toLocaleString()} earned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: ASSESSMENT REFERRED ── */}
      {activeTab === 'referred' && (
        <div className="space-y-4">
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 sm:p-5 text-xs text-[#991B1B] leading-relaxed flex items-start gap-3">
            <InfoIcon size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-[#7F1D1D] block mb-0.5">
                Assessment-referred mentees
              </strong>
              These are candidates VORA flagged after multiple assessment failures across organizations like WHO, UNICEF, or Global Fund. They require your highest-intervention coaching approach. VORA provides full failure analytics to guide your sessions.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {INITIAL_REFERRED_CANDIDATES.map((cand) => (
              <div
                key={cand.id}
                className="bg-white border border-[#FDBA74] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {cand.country}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      {cand.urgency}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mb-0.5">
                    {cand.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    {cand.role}
                  </p>

                  <div className="bg-red-50/70 border border-red-100 rounded-xl p-2.5 text-xs text-red-900 font-medium mb-3">
                    <strong className="block text-[11px] font-bold text-red-800 mb-0.5">
                      Failure Profile:
                    </strong>
                    {cand.reason}
                  </div>

                  <div className="text-[11px] text-gray-600 mb-4">
                    <strong className="font-bold text-gray-800">Action Plan: </strong>
                    {cand.recommendation}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      const matched = mentees.find((m) => m.name === cand.name);
                      if (matched) {
                        setTargetMenteeForSchedule(matched);
                        setIsScheduleModalOpen(true);
                      } else {
                        toast.success(`Opening diagnostic triage for ${cand.name}`);
                      }
                    }}
                    className="w-full py-2 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                  >
                    Schedule Diagnostic
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('active');
                      setSearchQuery(cand.name);
                    }}
                    className="w-full py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    View in Active List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADD NOTE MODAL ── */}
      <ModalDialog
        open={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={`Add Session Note · ${targetMenteeForNote?.name || ''}`}
        maxWidth="max-w-[520px]"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Save Note
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Session date
            </label>
            <input
              type="date"
              value={noteForm.date}
              onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Session type
            </label>
            <select
              value={noteForm.sessionType}
              onChange={(e) => setNoteForm({ ...noteForm, sessionType: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
            >
              <option>30 min · Strategy Session</option>
              <option>60 min · Deep Dive</option>
              <option>90 min · Executive Coaching</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Private mentor notes
            </label>
            <textarea
              rows={4}
              value={noteForm.text}
              onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
              placeholder="Observations, key breakthroughs, areas to revisit, homework assigned…"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] leading-relaxed resize-y"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              These notes are private and only visible to you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Competency updated
              </label>
              <select
                value={noteForm.competency}
                onChange={(e) => setNoteForm({ ...noteForm, competency: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
              >
                <option value="">— Optional —</option>
                <option>Health Systems Thinking</option>
                <option>Psychometric</option>
                <option>SJT Performance</option>
                <option>Executive Communication</option>
                <option>Structured Reasoning</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                New score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={noteForm.score}
                onChange={(e) => setNoteForm({ ...noteForm, score: e.target.value })}
                placeholder="e.g. 78"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>
        </div>
      </ModalDialog>

      {/* ── SCHEDULE SESSION MODAL ── */}
      <ModalDialog
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule Session with ${targetMenteeForSchedule?.name || ''}`}
        maxWidth="max-w-[480px]"
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
              onClick={handleSaveSchedule}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Confirm & Schedule
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Duration</label>
              <select
                value={scheduleForm.duration}
                onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Session Format</label>
              <select
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] cursor-pointer"
              >
                <option>Deep Dive</option>
                <option>Strategy Session</option>
                <option>Simulation / Mock Interview</option>
                <option>Executive Coaching</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Topic / Agenda</label>
            <input
              type="text"
              value={scheduleForm.topic}
              onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
              placeholder="e.g. SJT verbal reasoning triage & scenario review"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC]"
            />
          </div>

          <div className="bg-[#EBF6FF] border border-[#BFDBFE] rounded-xl p-3 text-xs text-[#0047CC] font-medium">
            💡 A calendar invite with VORA Video link will be sent automatically to the mentee upon confirmation.
          </div>
        </div>
      </ModalDialog>

      {/* ── MARK OUTCOME MODAL ── */}
      <ModalDialog
        open={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        title={`Record Career Outcome · ${targetMenteeForOutcome?.name || ''}`}
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsOutcomeModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOutcome}
              className="px-5 py-2 rounded-full bg-[#15803D] hover:bg-[#135813] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Record & Archive
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Outcome Status</label>
            <select
              value={outcomeForm.outcome}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#15803D] cursor-pointer"
            >
              <option>Got the role ✓</option>
              <option>Promoted ✓</option>
              <option>Advanced to Final Stage ✓</option>
              <option>Completed Program ✓</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Details & Note</label>
            <textarea
              rows={3}
              value={outcomeForm.details}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, details: e.target.value })}
              placeholder="e.g. Offered Senior Health Economist position at WHO HQ"
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#15803D] resize-y"
            />
          </div>

          <div className="bg-[#EEFBEE] border border-[#A7F3D0] rounded-xl p-3 text-xs text-[#15803D] font-medium">
            🎉 Recording an outcome marks this candidate's mentorship cycle as complete and contributes to your platform impact rating.
          </div>
        </div>
      </ModalDialog>

      {/* ── MESSAGE MODAL ── */}
      <ModalDialog
        open={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title={`Message ${targetMenteeForMessage?.name || ''}`}
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsMessageModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              className="px-5 py-2 rounded-full bg-[#0047CC] hover:bg-[#003d99] text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
            >
              Send Message
            </button>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Write a direct note to ${targetMenteeForMessage?.name || 'candidate'}...`}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0047CC] resize-y"
            />
          </div>
        </div>
      </ModalDialog>
    </div>
  );
};

export default MentorMenteesPage;
