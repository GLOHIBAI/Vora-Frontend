import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  SearchIcon,
  FilterIcon,
  BuildingIcon,
  DollarSignIcon,
  CheckIcon,
  CloseIcon,
  ArrowRightIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ModalDialog from '../../components/common/ModalDialog';
import { toast } from 'react-hot-toast';

interface MentorItem {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  sessionsCount: number;
  ratePerSession: string;
  hourlyRateNum: number;
  domains: string[];
  bio: string;
  nextAvailable: string;
  languages: string[];
}

interface ScheduledSession {
  id: string;
  mentorName: string;
  mentorTitle: string;
  mentorCompany: string;
  mentorAvatar: string;
  date: string;
  time: string;
  duration: string;
  topic: string;
  status: 'CONFIRMED' | 'COMPLETED';
  meetingLink: string;
}

const MENTORS_DATA: MentorItem[] = [
  {
    id: 'mentor-1',
    name: 'Dr. Alistair Finch',
    title: 'Principal Health Systems Architect',
    company: 'WHO Geneva / NHS England',
    location: 'Geneva, Switzerland',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    rating: 4.98,
    reviewsCount: 142,
    sessionsCount: 280,
    ratePerSession: '$85 / session',
    hourlyRateNum: 85,
    domains: ['Health Tech', 'Distributed Systems', 'Architecture'],
    bio: '15+ years architecting interoperable national healthcare databases, HL7/FHIR microservices, and epidemiological surveillance backends.',
    nextAvailable: 'Tomorrow, 2:00 PM WAT',
    languages: ['English', 'French'],
  },
  {
    id: 'mentor-2',
    name: 'Adaeze Okafor',
    title: 'Staff Distributed Systems Engineer',
    company: 'Google Cloud Platform',
    location: 'London, United Kingdom',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    rating: 4.95,
    reviewsCount: 96,
    sessionsCount: 190,
    ratePerSession: '$95 / session',
    hourlyRateNum: 95,
    domains: ['Distributed Systems', 'Cloud & DevOps', 'Career Transition'],
    bio: 'Specialist in consensus algorithms (Raft), multi-region active-active database clusters, and preparing senior engineers for Big Tech interview bars.',
    nextAvailable: 'Thursday, 4:30 PM WAT',
    languages: ['English'],
  },
  {
    id: 'mentor-3',
    name: 'Marcus Sterling',
    title: 'Head of Infrastructure & Security',
    company: 'Stripe Engineering',
    location: 'Dublin, Ireland',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    rating: 4.92,
    reviewsCount: 88,
    sessionsCount: 164,
    ratePerSession: '$90 / session',
    hourlyRateNum: 90,
    domains: ['Cloud & DevOps', 'Distributed Systems'],
    bio: 'Expert in Kubernetes disaster recovery, zero-trust infrastructure, and PCI-DSS compliant financial settlement ledgers.',
    nextAvailable: 'Friday, 11:00 AM WAT',
    languages: ['English'],
  },
  {
    id: 'mentor-4',
    name: 'Zainab Bello',
    title: 'Lead AI Engineer & Vector Search Specialist',
    company: 'DeepMind Health',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300',
    rating: 4.96,
    reviewsCount: 74,
    sessionsCount: 130,
    ratePerSession: '$65 / session',
    hourlyRateNum: 65,
    domains: ['AI & Machine Learning', 'Health Tech'],
    bio: 'Mentoring engineers transitioning into applied AI, retrieval-augmented generation (RAG) pipelines, and low-latency embeddings inference.',
    nextAvailable: 'Wednesday, 6:00 PM WAT',
    languages: ['English', 'Hausa'],
  },
  {
    id: 'mentor-5',
    name: 'Victor Vance',
    title: 'VP of Engineering',
    company: 'Paystack / Stripe',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    rating: 4.94,
    reviewsCount: 110,
    sessionsCount: 220,
    ratePerSession: '$80 / session',
    hourlyRateNum: 80,
    domains: ['Career Transition', 'Architecture', 'Leadership'],
    bio: 'Coaching senior individual contributors aiming for Staff/Principal roles, engineering management paths, and high-impact stakeholder communication.',
    nextAvailable: 'Monday, 1:00 PM WAT',
    languages: ['English'],
  },
];

const INITIAL_SCHEDULED: ScheduledSession[] = [
  {
    id: 'session-1',
    mentorName: 'Dr. Alistair Finch',
    mentorTitle: 'Principal Health Systems Architect',
    mentorCompany: 'WHO Geneva',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    date: 'Sep 24, 2026',
    time: '2:00 PM WAT',
    duration: '45 mins',
    topic: 'Stage 2 Simulation: High-Scale Epidemiological Data Ingestion Strategy',
    status: 'CONFIRMED',
    meetingLink: 'https://meet.vora.ai/room/finch-adeyemi-821',
  },
];

const DOMAINS = [
  'ALL',
  'Distributed Systems',
  'Health Tech',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Career Transition',
  'Architecture',
];

const TalentMentorshipPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'find' | 'my-sessions'>('find');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [mentors, setMentors] = useState<MentorItem[]>(MENTORS_DATA);
  const [mySessions, setMySessions] = useState<ScheduledSession[]>(INITIAL_SCHEDULED);

  // Booking Modal
  const [bookingMentor, setBookingMentor] = useState<MentorItem | null>(null);
  const [sessionType, setSessionType] = useState<'30' | '45' | '60'>('45');
  const [sessionDate, setSessionDate] = useState('Tomorrow');
  const [sessionTime, setSessionTime] = useState('3:00 PM WAT');
  const [sessionGoal, setSessionGoal] = useState('');
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  const filteredMentors = mentors.filter((m) => {
    if (selectedDomain !== 'ALL' && !m.domains.includes(selectedDomain)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.domains.some((d) => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenBooking = (mentor: MentorItem) => {
    setBookingMentor(mentor);
    setSessionGoal(`Guidance on ${mentor.domains[0]} and VORA assessment preparation`);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;

    setIsProcessingBooking(true);
    setTimeout(() => {
      setIsProcessingBooking(false);
      const newSession: ScheduledSession = {
        id: `session-${Date.now()}`,
        mentorName: bookingMentor.name,
        mentorTitle: bookingMentor.title,
        mentorCompany: bookingMentor.company,
        mentorAvatar: bookingMentor.avatarUrl,
        date: sessionDate,
        time: sessionTime,
        duration: `${sessionType} mins`,
        topic: sessionGoal || 'Career & Technical Mentorship',
        status: 'CONFIRMED',
        meetingLink: `https://meet.vora.ai/room/${bookingMentor.id}-${Date.now()}`,
      };
      setMySessions((prev) => [newSession, ...prev]);
      toast.success(`Session with ${bookingMentor.name} confirmed! Calendar invite sent.`);
      setBookingMentor(null);
      setActiveTab('my-sessions');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            VORA Verified Mentorship
          </h1>
          <span className="bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-xs font-bold">
            1:1 Office Hours
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Connect 1-on-1 with Staff/Principal engineers and leaders from Google, Stripe, WHO, and NHS to elevate your technical reasoning and career trajectory.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('find')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'find'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Discover Mentors ({mentors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-sessions')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'my-sessions'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Sessions ({mySessions.length})
        </button>
      </div>

      {/* Tab 1: Discover Mentors */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Search & Domain Filter Pills */}
          <div className="space-y-3">
            <div className="relative w-full">
              <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company (Google, Stripe, WHO), or focus area..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#0047CC] shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDomain === domain
                      ? 'bg-[#0047CC] text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0047CC] transition-colors truncate">
                          {mentor.name}
                        </h3>
                        <CheckCircleIcon size={14} className="text-[#0047CC] shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 truncate">{mentor.title}</p>
                      <p className="text-[11px] text-[#0047CC] font-bold mt-0.5 truncate">{mentor.company}</p>
                    </div>
                  </div>

                  {/* Rating & Sessions */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-50">
                    <span className="flex items-center gap-1 font-bold text-gray-900">
                      <StarIcon size={13} className="text-amber-500 fill-amber-500" />
                      {mentor.rating}
                    </span>
                    <span>({mentor.reviewsCount} reviews)</span>
                    <span className="text-gray-300">·</span>
                    <span>{mentor.sessionsCount} sessions</span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Focus Domains */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {mentor.domains.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Rate:</span>
                    <span className="font-bold text-gray-900">{mentor.ratePerSession}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Next Slot:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mentor.nextAvailable}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    pill={false}
                    onClick={() => handleOpenBooking(mentor)}
                    className="w-full text-xs font-semibold py-2 mt-2 shadow-xs"
                  >
                    Book 1:1 Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Booked Sessions */}
      {activeTab === 'my-sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Upcoming & Past Mentorship Bookings</h2>

            {mySessions.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CalendarIcon size={32} className="mx-auto text-gray-400" />
                <p className="text-sm font-bold text-gray-900">No scheduled sessions</p>
                <p className="text-xs text-gray-500">Browse verified mentors to schedule your first 1-on-1 session.</p>
                <Button variant="primary" size="sm" pill={false} onClick={() => setActiveTab('find')} className="mt-2 text-xs">
                  Find a Mentor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mySessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={session.mentorAvatar}
                        alt={session.mentorName}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{session.mentorName}</h3>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {session.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#0047CC] font-semibold">
                          {session.mentorTitle} · {session.mentorCompany}
                        </p>
                        <p className="text-xs text-gray-700 font-medium pt-1">
                          Topic: {session.topic}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <CalendarIcon size={12} className="text-gray-400" />
                          {session.date} at {session.time} ({session.duration})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        pill={false}
                        onClick={() => {
                          window.open(session.meetingLink, '_blank');
                          toast.success('Launching meeting room...');
                        }}
                        className="text-xs font-semibold gap-1.5"
                      >
                        <ExternalLinkIcon size={13} />
                        Join Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        pill={false}
                        onClick={() => toast.success(`Chat opened with ${session.mentorName}`)}
                        className="text-xs font-semibold"
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Session Modal */}
      {bookingMentor && (
        <ModalDialog
          isOpen={Boolean(bookingMentor)}
          onClose={() => setBookingMentor(null)}
          title={`Book 1:1 Session with ${bookingMentor.name}`}
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setBookingMentor(null)}
                disabled={isProcessingBooking}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleConfirmBooking}
                disabled={isProcessingBooking}
              >
                {isProcessingBooking ? 'Booking...' : 'Confirm Session'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4 text-left">
            <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <img
                src={bookingMentor.avatarUrl}
                alt={bookingMentor.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs font-bold text-gray-900">{bookingMentor.name}</p>
                <p className="text-[11px] text-gray-500">{bookingMentor.title} · {bookingMentor.company}</p>
                <p className="text-[11px] font-bold text-[#0047CC]">{bookingMentor.ratePerSession}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Session Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '30 Mins ($45)', val: '30' },
                  { label: '45 Mins ($65)', val: '45' },
                  { label: '60 Mins ($85)', val: '60' },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setSessionType(d.val as any)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      sessionType === d.val
                        ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Select Day"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                options={[
                  { label: 'Tomorrow', value: 'Tomorrow' },
                  { label: 'Wednesday, Sep 24', value: 'Wednesday, Sep 24' },
                  { label: 'Thursday, Sep 25', value: 'Thursday, Sep 25' },
                  { label: 'Friday, Sep 26', value: 'Friday, Sep 26' },
                ]}
              />
              <Select
                label="Time Slot (WAT)"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                options={[
                  { label: '11:00 AM WAT', value: '11:00 AM WAT' },
                  { label: '2:00 PM WAT', value: '2:00 PM WAT' },
                  { label: '4:30 PM WAT', value: '4:30 PM WAT' },
                  { label: '6:00 PM WAT', value: '6:00 PM WAT' },
                ]}
              />
            </div>

            <Textarea
              label="Session Focus & Notes"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              rows={3}
              placeholder="What questions or challenges would you like to cover during your session?"
            />
          </form>
        </ModalDialog>
      )}
    </div>
  );
};

export default TalentMentorshipPage;
