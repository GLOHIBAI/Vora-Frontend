import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  StarIcon,
  CalendarIcon,
  CheckCircleIcon,
  SearchIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ModalDialog from '../../components/common/ModalDialog';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';
import {
  useDiscoverMentors,
  useMySessions,
  useBookingPanel,
  useBookMentorMutation,
} from '../../services/queries/mentors';
import { useTalentDashboardQuery } from '../../services/queries/talent';
import { getMediaUrl, DEFAULT_MENTOR_AVATAR } from '../../utils/media';

const TalentMentorshipPage: React.FC = () => {
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'find' | 'my-sessions'>('find');

  // Discover filters
  const [selectedFocus, setSelectedFocus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // My Sessions sub-filter
  const [sessionFilter, setSessionFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Dashboard unlocks verification
  const { data: dashboardData, isLoading: isLoadingDashboard } = useTalentDashboardQuery();
  const isMentorsLocked = Boolean(dashboardData?.data?.unlocks?.mentors?.locked);

  // Primary API Query: GET /mentors/discover
  const {
    data: discoverData,
    isLoading: isLoadingDiscover,
    error: discoverError,
    refetch: refetchDiscover,
  } = useDiscoverMentors({
    page,
    limit: 12,
    q: searchQuery,
    focus: selectedFocus,
  });

  // Primary API Query: GET /mentors/my-sessions
  const {
    data: mySessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useMySessions();

  // Booking Modal State
  const [bookingMentorId, setBookingMentorId] = useState<string | null>(null);
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string>('');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [selectedScheduledAt, setSelectedScheduledAt] = useState<string>('');
  const [sessionFocus, setSessionFocus] = useState('');

  // Booking Panel Query: GET /mentors/:mentorId/booking-panel
  const {
    data: bookingPanelData,
    isLoading: isLoadingPanel,
    error: panelError,
  } = useBookingPanel(bookingMentorId, Boolean(bookingMentorId));

  // Booking Mutation: POST /mentors/:mentorId/book
  const bookMutation = useBookMentorMutation();

  // Tabs scroll & chevrons state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  const [hasTabsOverflow, setHasTabsOverflow] = useState(false);

  const checkTabsScroll = useCallback(() => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    const overflow = scrollWidth > clientWidth + 2;
    setHasTabsOverflow(overflow);
    setCanScrollTabsLeft(scrollLeft > 2);
    setCanScrollTabsRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkTabsScroll();
    const timer = setTimeout(checkTabsScroll, 100);
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      window.removeEventListener('resize', checkTabsScroll);
      clearTimeout(timer);
    };
  }, [checkTabsScroll, activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = Math.max(tabsContainerRef.current.clientWidth * 0.5, 200);
    tabsContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkTabsScroll, 350);
  };

  // Focus Filter pills from backend focusFilters
  const focusFilters = useMemo(() => {
    const raw = discoverData?.focusFilters || [];
    const withoutAll = raw.filter((f) => f.toUpperCase() !== 'ALL');
    return ['ALL', ...withoutAll];
  }, [discoverData?.focusFilters]);

  // Mentors list from API
  const mentors = discoverData?.items || [];
  const totalMentors = discoverData?.total ?? mentors.length;

  // Sessions list from API
  const allSessions = mySessionsData?.items || [];
  const upcomingSessions = mySessionsData?.upcoming || [];
  const pastSessions = mySessionsData?.past || [];
  const totalSessions = mySessionsData?.total ?? allSessions.length;

  const displayedSessions = useMemo(() => {
    if (sessionFilter === 'upcoming') return upcomingSessions;
    if (sessionFilter === 'past') return pastSessions;
    return allSessions;
  }, [sessionFilter, upcomingSessions, pastSessions, allSessions]);

  // When booking panel data loads, set initial selections
  useEffect(() => {
    if (!bookingPanelData) return;

    // Default session type
    if (bookingPanelData.sessionTypes && bookingPanelData.sessionTypes.length > 0) {
      const exists = bookingPanelData.sessionTypes.some((st) => st.id === selectedSessionTypeId);
      if (!exists) {
        setSelectedSessionTypeId(bookingPanelData.sessionTypes[0].id);
      }
    } else {
      setSelectedSessionTypeId('');
    }

    // Default day & time
    if (bookingPanelData.slotDays && bookingPanelData.slotDays.length > 0) {
      const activeDay =
        bookingPanelData.slotDays.find((d) => d.date === selectedDayDate) ||
        bookingPanelData.slotDays[0];

      setSelectedDayDate(activeDay.date);

      if (activeDay.times && activeDay.times.length > 0) {
        const timeExists = activeDay.times.some((t) => t.scheduledAt === selectedScheduledAt);
        if (!timeExists) {
          setSelectedScheduledAt(activeDay.times[0].scheduledAt);
        }
      } else {
        setSelectedScheduledAt('');
      }
    } else {
      setSelectedDayDate('');
      setSelectedScheduledAt('');
    }
  }, [bookingPanelData, selectedDayDate, selectedSessionTypeId, selectedScheduledAt]);

  const handleOpenBooking = (mentorId: string) => {
    setBookingMentorId(mentorId);
    setSessionFocus('');
  };

  const handleCloseBooking = () => {
    setBookingMentorId(null);
    setSessionFocus('');
    setSelectedSessionTypeId('');
    setSelectedDayDate('');
    setSelectedScheduledAt('');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentorId) return;

    if (!selectedSessionTypeId) {
      toast.error('Please choose a session duration');
      return;
    }

    if (!selectedScheduledAt) {
      toast.error('Please select an available time slot');
      return;
    }

    try {
      await bookMutation.mutateAsync({
        mentorId: bookingMentorId,
        payload: {
          sessionTypeId: selectedSessionTypeId,
          scheduledAt: selectedScheduledAt,
          sessionFocus: sessionFocus.trim() || undefined,
          menteeCountry: 'US',
          ipCountry: 'US',
          paymentCountry: 'US',
          localeCountry: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        },
      });

      toast.success('1:1 mentorship session booked successfully!');
      handleCloseBooking();
      setActiveTab('my-sessions');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book mentorship session');
    }
  };

  // Cross-cutting requirement 2: Respect unlocks.mentors.locked from /talent/dashboard
  if (!isLoadingDashboard && isMentorsLocked) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-14 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0047CC] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <LockIcon size={28} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {dashboardData?.data?.unlocks?.mentors?.label || 'Verified Mentorship is Locked'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Connect 1-on-1 with Staff/Principal engineers and technical leaders once your CV is uploaded and verified.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              pill={false}
              onClick={() => navigate('/profile')}
              className="text-xs font-semibold px-6 py-2.5 shadow-xs"
            >
              Upload CV to Unlock
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (Show centered blue spinner, no hardcoded data or skeleton cards)
  const isPrimaryLoading =
    isLoadingDashboard ||
    (activeTab === 'find' && isLoadingDiscover && !discoverData) ||
    (activeTab === 'my-sessions' && isLoadingSessions && !mySessionsData);

  if (isPrimaryLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size={36} className="text-[#0047CC]" />
      </div>
    );
  }

  // Active day in modal
  const activeDaySlots = bookingPanelData?.slotDays?.find((d) => d.date === selectedDayDate);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            VORA Verified Mentorship
          </h1>
          <span className="bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
            1:1 Office Hours
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Connect 1-on-1 with verified Staff/Principal engineers and leaders to elevate your technical reasoning and career trajectory.
        </p>
      </div>

      {/* Tabs with Left/Right Chevrons instead of Slider */}
      <div className="relative border-b border-gray-200 flex items-center">
        {hasTabsOverflow && (
          <button
            type="button"
            disabled={!canScrollTabsLeft}
            onClick={() => scrollTabs('left')}
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mr-1.5 mb-2.5 ${
              canScrollTabsLeft
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer active:scale-95'
                : 'text-gray-300 opacity-25 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Scroll tabs left"
          >
            <ChevronLeftIcon size={16} strokeWidth={2.5} />
          </button>
        )}

        <div
          ref={tabsContainerRef}
          onScroll={checkTabsScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scrollbar-hide whitespace-nowrap pb-px scroll-smooth"
        >
          <button
            type="button"
            onClick={() => setActiveTab('find')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'find'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Discover Mentors ({totalMentors})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-sessions')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'my-sessions'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Sessions ({totalSessions})
          </button>
        </div>

        {hasTabsOverflow && (
          <button
            type="button"
            disabled={!canScrollTabsRight}
            onClick={() => scrollTabs('right')}
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ml-1.5 mb-2.5 ${
              canScrollTabsRight
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer active:scale-95'
                : 'text-gray-300 opacity-25 cursor-not-allowed pointer-events-none'
            }`}
            aria-label="Scroll tabs right"
          >
            <ChevronRightIcon size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ══════════════════ TAB 1: DISCOVER MENTORS ══════════════════ */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Search & Domain Filter Pills */}
          <div className="space-y-3">
            <div className="relative w-full">
              <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search mentors by name, company, or focus area..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#0047CC] shadow-2xs"
              />
            </div>

            {focusFilters.length > 1 && (
              <div
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-hide -mx-3.5 px-3.5 sm:mx-0 sm:px-0 py-0.5"
              >
                {focusFilters.map((focus) => (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => {
                      setSelectedFocus(focus);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      selectedFocus === focus
                        ? 'bg-[#0047CC] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {focus === 'ALL' ? 'All Focus Areas' : focus}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mentors Grid / Empty state */}
          {discoverError ? (
            <div className="bg-red-50/60 border border-red-200 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-red-800">Failed to load verified mentors</p>
              <p className="text-xs text-red-600">
                {(discoverError as any)?.message || 'An error occurred while fetching the mentor directory.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => refetchDiscover()}
                className="text-xs mt-2"
              >
                Retry
              </Button>
            </div>
          ) : mentors.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 sm:p-16 text-center space-y-3 shadow-2xs">
              <UsersIcon size={36} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-800">No verified mentors found</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery || selectedFocus !== 'ALL'
                  ? 'No mentors match your search query or focus area. Try adjusting your filters.'
                  : 'There are currently no mentors available in this directory.'}
              </p>
              {(searchQuery || selectedFocus !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFocus('ALL');
                    setPage(1);
                  }}
                  className="text-xs font-semibold mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mentors.map((mentor) => {
                const avatar = getMediaUrl(mentor.photoS3Key, DEFAULT_MENTOR_AVATAR);
                const hasRating = mentor.rating !== null && mentor.rating != null;

                return (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top info */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={avatar}
                          alt={mentor.displayName}
                          className="w-13 h-13 rounded-2xl object-cover border border-gray-100 shadow-2xs shrink-0 bg-gray-100"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#0047CC] transition-colors truncate">
                              {mentor.displayName}
                            </h3>
                            {mentor.verified && (
                              <span title="Verified Mentor" className="inline-flex items-center text-[#0047CC]">
                                <CheckCircleIcon size={14} className="shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">
                            {mentor.professionalTitle}
                          </p>
                          <p className="text-[11px] text-[#0047CC] font-bold truncate">
                            {mentor.organisation}
                          </p>
                        </div>
                      </div>

                      {/* Rating & Sessions (Never invent ratings; HIDE stars when rating is null) */}
                      {hasRating ? (
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-50">
                          <span className="flex items-center gap-1 font-bold text-gray-900">
                            <StarIcon size={13} className="text-amber-500 fill-amber-500" />
                            {mentor.rating}
                          </span>
                          {mentor.ratingsCount ? <span>({mentor.ratingsCount} reviews)</span> : null}
                          {mentor.sessionsCompleted > 0 && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span>{mentor.sessionsCompleted} sessions</span>
                            </>
                          )}
                        </div>
                      ) : mentor.sessionsCompleted > 0 ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-50">
                          <span className="font-semibold text-gray-700">
                            {mentor.sessionsCompleted} sessions completed
                          </span>
                        </div>
                      ) : null}

                      {/* Bio or headline */}
                      {(mentor.headline || mentor.bio) && (
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {mentor.headline || mentor.bio}
                        </p>
                      )}

                      {/* Focus Tags */}
                      {mentor.focusTags && mentor.focusTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {mentor.focusTags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Footer */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Rate:</span>
                        <span className="font-bold text-gray-900">
                          {mentor.formattedRate ||
                            (mentor.rate ? `${mentor.currency || '$'}${mentor.rate}` : 'Free')}
                        </span>
                      </div>

                      {/* Next slot (null if no availability; never invent) */}
                      {mentor.nextSlotLabel && (
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>Next Slot:</span>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {mentor.nextSlotLabel}
                          </span>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        pill={false}
                        disabled={mentor.cta?.enabled === false}
                        onClick={() => handleOpenBooking(mentor.id)}
                        className="w-full text-xs font-semibold py-2 mt-2 shadow-2xs"
                      >
                        {mentor.cta?.label || 'Book 1:1 Session'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB 2: MY SESSIONS ══════════════════ */}
      {activeTab === 'my-sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Mentorship Sessions</h2>

              {/* Sub-filter pills for upcoming / past */}
              <div className="flex items-center gap-1.5 bg-gray-100/70 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setSessionFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sessionFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({totalSessions})
                </button>
                <button
                  type="button"
                  onClick={() => setSessionFilter('upcoming')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sessionFilter === 'upcoming'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({upcomingSessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSessionFilter('past')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    sessionFilter === 'past'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Past ({pastSessions.length})
                </button>
              </div>
            </div>

            {sessionsError ? (
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-red-800">Failed to load mentorship sessions</p>
                <p className="text-xs text-red-600">
                  {(sessionsError as any)?.message || 'An error occurred while fetching your sessions.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  onClick={() => refetchSessions()}
                  className="text-xs mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : displayedSessions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <CalendarIcon size={36} className="mx-auto text-gray-300" />
                <p className="text-sm font-bold text-gray-800">
                  {sessionFilter === 'upcoming'
                    ? 'No upcoming sessions'
                    : sessionFilter === 'past'
                    ? 'No past sessions'
                    : 'No scheduled sessions'}
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Browse verified mentors to schedule your first 1-on-1 office hour.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  onClick={() => setActiveTab('find')}
                  className="mt-2 text-xs font-semibold shadow-2xs"
                >
                  Discover Mentors
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedSessions.map((session) => {
                  const avatar = getMediaUrl(session.mentor?.photoS3Key, DEFAULT_MENTOR_AVATAR);
                  const isConfirmed =
                    session.status?.toLowerCase() === 'confirmed' ||
                    session.statusLabel?.toLowerCase() === 'confirmed';
                  const isCompleted =
                    session.status?.toLowerCase() === 'completed' ||
                    session.statusLabel?.toLowerCase() === 'completed';

                  return (
                    <div
                      key={session.bookingId}
                      className="border border-gray-100 rounded-2xl p-4 sm:p-5 bg-white hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <img
                          src={avatar}
                          alt={session.mentor?.displayName || 'Mentor'}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-100 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {session.mentor?.displayName}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isConfirmed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isCompleted
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {session.statusLabel || session.status}
                            </span>
                          </div>

                          <p className="text-xs text-[#0047CC] font-semibold truncate">
                            {session.mentor?.professionalTitle}
                            {session.mentor?.organisation ? ` · ${session.mentor.organisation}` : ''}
                          </p>

                          {/* Topic line (hide if null) */}
                          {session.topic && session.topic.trim() ? (
                            <p className="text-xs text-gray-700 font-medium pt-0.5 line-clamp-2">
                              <span className="text-gray-400 font-normal">Topic: </span>
                              {session.topic}
                            </p>
                          ) : null}

                          {/* Schedule detail */}
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                            <CalendarIcon size={12} className="text-gray-400 shrink-0" />
                            {session.scheduleDetail || session.scheduleLabel || session.scheduledAt}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        {/* Join Call button (enabled only if meetingLink / actions.joinCall.enabled) */}
                        {session.actions?.joinCall?.enabled && (session.actions.joinCall.href || session.meetingLink) ? (
                          <Button
                            variant="primary"
                            size="sm"
                            pill={false}
                            onClick={() => {
                              const callUrl = session.actions?.joinCall?.href || session.meetingLink;
                              if (callUrl) {
                                window.open(callUrl, '_blank', 'noopener,noreferrer');
                                toast.success('Launching meeting room...');
                              }
                            }}
                            className="text-xs font-semibold gap-1.5 shadow-2xs"
                          >
                            <ExternalLinkIcon size={13} />
                            {session.actions.joinCall.label || 'Join Call'}
                          </Button>
                        ) : null}

                        {/* Message button (disabled / coming soon per handoff spec) */}
                        <Button
                          variant="outline"
                          size="sm"
                          pill={false}
                          disabled={true}
                          title={session.actions?.message?.reason || 'Direct messaging is coming soon'}
                          className="text-xs font-semibold opacity-50 cursor-not-allowed"
                        >
                          {session.actions?.message?.label || 'Message'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ BOOK 1:1 MODAL ══════════════════ */}
      {bookingMentorId && (
        <ModalDialog
          isOpen={Boolean(bookingMentorId)}
          onClose={handleCloseBooking}
          title={`Book 1:1 Session with ${bookingPanelData?.mentor?.displayName || 'Mentor'}`}
          actions={
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={handleCloseBooking}
                disabled={bookMutation.isPending}
                className="w-full sm:w-auto justify-center text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleConfirmBooking}
                disabled={
                  bookMutation.isPending ||
                  !selectedSessionTypeId ||
                  !selectedScheduledAt ||
                  !bookingPanelData?.sessionTypes?.length ||
                  !bookingPanelData?.slotDays?.length
                }
                className="w-full sm:w-auto justify-center text-xs shadow-2xs font-semibold"
              >
                {bookMutation.isPending ? 'Booking Session...' : 'Confirm Session'}
              </Button>
            </div>
          }
        >
          {isLoadingPanel ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Spinner size={32} className="text-[#0047CC]" />
              <p className="text-xs text-gray-500">Loading availability and session types...</p>
            </div>
          ) : panelError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs space-y-2">
              <p className="font-semibold">Failed to load booking panel</p>
              <p>{(panelError as any)?.message || 'Could not fetch mentor availability.'}</p>
            </div>
          ) : bookingPanelData ? (
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-left">
              {/* Mentor Summary Header */}
              <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <img
                  src={getMediaUrl(bookingPanelData.mentor?.photoS3Key, DEFAULT_MENTOR_AVATAR)}
                  alt={bookingPanelData.mentor?.displayName}
                  className="w-11 h-11 rounded-xl object-cover bg-gray-200 border border-gray-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {bookingPanelData.mentor?.displayName}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {bookingPanelData.mentor?.professionalTitle}
                    {bookingPanelData.mentor?.organisation
                      ? ` · ${bookingPanelData.mentor.organisation}`
                      : ''}
                  </p>
                  {bookingPanelData.mentor?.timezone && (
                    <p className="text-[10px] text-gray-400">
                      Timezone: {bookingPanelData.mentor.timezone}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration toggles from sessionTypes[].durationOptionLabel */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Session Duration</label>
                {bookingPanelData.sessionTypes && bookingPanelData.sessionTypes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {bookingPanelData.sessionTypes.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedSessionTypeId(st.id)}
                        className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                          selectedSessionTypeId === st.id
                            ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC] shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {st.durationOptionLabel}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl">
                    This mentor has not configured session rates yet.
                  </div>
                )}
              </div>

              {/* Day & Time Slot Selects (Honesty: don't invent Tomorrow/3pm when empty) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Select Date &amp; Time</label>
                {bookingPanelData.slotDays && bookingPanelData.slotDays.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Day"
                      value={selectedDayDate}
                      onChange={(e) => {
                        const newDay = e.target.value;
                        setSelectedDayDate(newDay);
                        const matchDay = bookingPanelData.slotDays.find((d) => d.date === newDay);
                        if (matchDay && matchDay.times && matchDay.times.length > 0) {
                          setSelectedScheduledAt(matchDay.times[0].scheduledAt);
                        } else {
                          setSelectedScheduledAt('');
                        }
                      }}
                      options={bookingPanelData.slotDays.map((d) => ({
                        label: d.dayLabel || d.date,
                        value: d.date,
                      }))}
                    />

                    <Select
                      label="Time Slot"
                      value={selectedScheduledAt}
                      onChange={(e) => setSelectedScheduledAt(e.target.value)}
                      disabled={!activeDaySlots || !activeDaySlots.times?.length}
                      options={
                        activeDaySlots && activeDaySlots.times && activeDaySlots.times.length > 0
                          ? activeDaySlots.times.map((t) => ({
                              label: t.timeLabel,
                              value: t.scheduledAt,
                            }))
                          : [{ label: 'No time slots on this day', value: '' }]
                      }
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs p-3 rounded-xl">
                    This mentor has no available slots at this time. Please check back later.
                  </div>
                )}
              </div>

              {/* Session Focus Textarea */}
              <Textarea
                label="Session Focus &amp; Notes (Optional)"
                value={sessionFocus}
                onChange={(e) => setSessionFocus(e.target.value)}
                rows={3}
                placeholder="What topics, questions, or challenges would you like to cover during your session?"
              />
            </form>
          ) : null}
        </ModalDialog>
      )}
    </div>
  );
};

export default TalentMentorshipPage;
