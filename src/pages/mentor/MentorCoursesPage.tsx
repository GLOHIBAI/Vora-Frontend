import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CalendarIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  GridIcon,
  ListIcon,
  CloseIcon,
} from '../../components/common/Icons';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';
import { toast } from 'react-hot-toast';
import {
  useInstructorHub,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useDeleteCourseMutation,
} from '../../services/queries/courses';
import type {
  InstructorCourseItem,
  InstructorRosterItem,
  CourseFormat,
} from '../../types/courses';
import {
  getMediaUrl,
  DEFAULT_COURSE_BANNER,
  DEFAULT_MENTOR_AVATAR,
} from '../../utils/media';

interface MentorCoursesPageProps {}

type CoursePillFilter = 'ALL' | 'PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT' | 'LIVE';
type SortOption = 'recent' | 'popular' | 'rating' | 'title';

const SORT_OPTIONS_MAP: Record<SortOption, string> = {
  recent: 'Most Recent',
  popular: 'Most Popular',
  rating: 'Highest Rated',
  title: 'Alphabetical (A-Z)',
};

const MentorCoursesPage: React.FC<MentorCoursesPageProps> = () => {
  const navigate = useNavigate();

  // Primary API Query: GET /courses/instructor/hub
  const { data: hubData, isLoading, error } = useInstructorHub();

  const publishMutation = usePublishCourseMutation();
  const unpublishMutation = useUnpublishCourseMutation();
  const deleteMutation = useDeleteCourseMutation();

  const [activeTab, setActiveTab] = useState<'my-courses' | 'students' | 'mentorship' | 'reviews'>('my-courses');
  const [statusFilter, setStatusFilter] = useState<CoursePillFilter>('PUBLISHED');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Horizontal tabs scroll & chevron state
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

  const courses: InstructorCourseItem[] = hubData?.myCourses || [];
  const roster: InstructorRosterItem[] = hubData?.roster || [];
  const mentorship = hubData?.mentorship || [];
  const metrics = hubData?.metrics;
  const tabCounts = hubData?.tabCounts;
  const filters = hubData?.filters;

  const filteredCourses = useMemo(() => {
    let list = [...courses];

    if (statusFilter === 'PUBLISHED') {
      list = list.filter((c) => c.status === 'PUBLISHED');
    } else if (statusFilter === 'DRAFT') {
      list = list.filter((c) => c.status === 'DRAFT');
    } else if (statusFilter === 'UNDER_REVIEW') {
      list = list.filter((c) => c.status === 'UNDER_REVIEW');
    } else if (statusFilter === 'LIVE') {
      list = list.filter(
        (c) =>
          c.status === 'PUBLISHED' &&
          (c.format === 'COHORT_BASED' ||
            c.format === 'WORKSHOP_SPRINT' ||
            (c as any).isMasterclass ||
            (c as any).tags?.some?.((t: string) => t.toLowerCase().includes('live')))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = (a as any).updatedAt
          ? new Date((a as any).updatedAt).getTime()
          : (a as any).createdAt
          ? new Date((a as any).createdAt).getTime()
          : 0;
        const dateB = (b as any).updatedAt
          ? new Date((b as any).updatedAt).getTime()
          : (b as any).createdAt
          ? new Date((b as any).createdAt).getTime()
          : 0;
        return dateB - dateA;
      }
      if (sortBy === 'popular') {
        return (b.students ?? 0) - (a.students ?? 0);
      }
      if (sortBy === 'rating') {
        const rateA = (a as any).averageRating ?? (a as any).rating ?? 0;
        const rateB = (b as any).averageRating ?? (b as any).rating ?? 0;
        return rateB - rateA;
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  }, [courses, statusFilter, searchQuery, sortBy]);

  const pillFilters: CoursePillFilter[] = useMemo(() => {
    return courses.some((c) => c.status === 'UNDER_REVIEW')
      ? ['ALL', 'PUBLISHED', 'UNDER_REVIEW', 'DRAFT', 'LIVE']
      : ['ALL', 'PUBLISHED', 'DRAFT', 'LIVE'];
  }, [courses]);

  const getFilterLabel = (key: CoursePillFilter) => {
    switch (key) {
      case 'ALL':
        return 'All Courses';
      case 'PUBLISHED':
        return 'Published';
      case 'UNDER_REVIEW':
        return 'In Review';
      case 'DRAFT':
        return 'Drafts';
      case 'LIVE':
        return 'Live';
    }
  };

  const handleEditCourse = (course: InstructorCourseItem) => {
    navigate(`/courses/${course.id}/edit`, { state: { course } });
  };

  const handleTogglePublish = async (course: InstructorCourseItem) => {
    try {
      if (course.status === 'PUBLISHED') {
        if (!course.actions?.unpublish?.enabled) {
          toast.error(course.actions?.unpublish?.reason || 'Cannot unpublish this course at this time');
          return;
        }
        await unpublishMutation.mutateAsync(course.id);
        toast.success(`"${course.title}" unpublished`);
      } else {
        if (!course.actions?.publish?.enabled) {
          toast.error(course.actions?.publish?.reason || 'Course needs at least one module before publishing');
          return;
        }
        await publishMutation.mutateAsync(course.id);
        toast.success(`"${course.title}" published successfully!`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update course publish status');
    }
  };

  const handleDeleteCourse = async (course: InstructorCourseItem) => {
    if (!course.actions?.delete?.enabled) {
      toast.error(course.actions?.delete?.reason || 'Cannot delete this course');
      return;
    }

    if (window.confirm(`Are you sure you want to archive "${course.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(course.id);
        toast.success('Course archived');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete course');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size={36} className="text-[#0047CC]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-sm font-semibold text-gray-800">Failed to load courses</p>
        <p className="text-xs text-gray-500">{(error as any)?.message || 'An error occurred while loading your courses hub.'}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-[#0047CC] text-white text-xs font-semibold rounded-lg hover:bg-[#003d99] transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Course Management &amp; Mentorship Hub
            </h1>
            <Tag
              variant="purple"
              label="Instructor Portal"
              className="font-bold shrink-0 text-xs"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Author, publish, and track your instructional courses, cohorts, and student progress.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            pill={false}
            onClick={() => navigate('/courses/create')}
            className="text-xs font-semibold gap-1.5 shadow-xs w-full sm:w-auto justify-center"
          >
            <PlusIcon size={14} />
            {hubData?.cta?.createCourse?.label || 'Create Course'}
          </Button>
        </div>
      </div>

      {/* KPI Instructor Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Enrolled */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 shadow-2xs">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Enrolled</p>
          <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {(metrics?.totalEnrolled ?? 0).toLocaleString()}
            </span>
            {metrics?.enrolledMoMLabel && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                {metrics.enrolledMoMLabel}
              </span>
            )}
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 shadow-2xs">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Courses</p>
          <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {metrics?.activeCourses ?? courses.filter(c => c.status === 'PUBLISHED').length}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400">
              {metrics?.activeCoursesLabel || `of ${metrics?.totalCourses ?? courses.length} total`}
            </span>
          </div>
        </div>

        {/* Average Rating (Hidden while averageRating === null per handoff spec) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 shadow-2xs">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Average Rating</p>
          <div className="flex items-center gap-1 mt-1">
            {metrics?.averageRating !== null && metrics?.averageRating != null ? (
              <>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.averageRating}</span>
                <StarIcon size={14} className="text-amber-500 fill-amber-500" />
                {metrics?.ratingsCount ? (
                  <span className="text-[10px] sm:text-xs text-gray-400 ml-0.5">({metrics.ratingsCount})</span>
                ) : null}
              </>
            ) : (
              <span className="text-sm font-medium text-gray-400">Not rated yet</span>
            )}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 shadow-2xs">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</p>
          <div className="flex flex-wrap items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-[#0047CC]">
              {metrics?.formattedRevenue || `$${(metrics?.totalRevenue ?? 0).toLocaleString()} USD`}
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</p>
          <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {metrics?.completionRatePercent != null ? `${metrics.completionRatePercent}%` : '—'}
            </span>
            {metrics?.completionLabel && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                {metrics.completionLabel}
              </span>
            )}
          </div>
        </div>
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
          className="flex-1 flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar scrollbar-hide whitespace-nowrap pb-px scroll-smooth"
        >
          <button
            type="button"
            onClick={() => setActiveTab('my-courses')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'my-courses'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Courses ({tabCounts?.myCourses ?? courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'students'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Student Roster &amp; Submissions ({tabCounts?.roster ?? roster.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mentorship')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'mentorship'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Course Mentorship &amp; Cohorts ({tabCounts?.mentorship ?? mentorship.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 ${
              activeTab === 'reviews'
                ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Reviews &amp; Q&amp;A
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

      {/* ══════════════════ TAB 1: MY COURSES ══════════════════ */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6">
          {/* ── COURSE BROWSER FEATURE TOOLBAR (All Courses | Published | Drafts | Live ... X courses | Most Recent | Grid/List) ── */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Filter Pills */}
            <div
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scrollbar-hide -mx-1 px-1 py-0.5"
            >
              {pillFilters.map((filterKey) => {
                const label = getFilterLabel(filterKey);
                const isActive = statusFilter === filterKey;

                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setStatusFilter(filterKey)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#0047CC] text-white shadow-xs font-semibold'
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Right: Counter + Sort Dropdown + Search + Grid/List View Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </span>

              {/* Sort Selector Dropdown */}
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-3.5 sm:px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{SORT_OPTIONS_MAP[sortBy]}</span>
                  <ChevronDownIcon
                    size={14}
                    className={`text-gray-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
                    {(Object.keys(SORT_OPTIONS_MAP) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSortBy(key);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          sortBy === key
                            ? 'bg-[#EBF6FF] text-[#0047CC] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{SORT_OPTIONS_MAP[key]}</span>
                        {sortBy === key && <CheckIcon size={13} className="text-[#0047CC]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Toggle / Input */}
              <div className="relative flex items-center">
                {isSearchOpen ? (
                  <div className="relative flex items-center">
                    <SearchIcon size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="pl-8 pr-7 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#0047CC] w-36 sm:w-48 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Close search"
                    >
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    title="Search courses"
                    className={`p-2 rounded-full border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-800 bg-white transition-all cursor-pointer shadow-2xs ${
                      searchQuery ? 'text-[#0047CC] border-[#0047CC]/40 bg-blue-50/50' : ''
                    }`}
                  >
                    <SearchIcon size={15} />
                  </button>
                )}
              </div>

              {/* Grid / List View Toggle */}
              <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center gap-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#EBF6FF] text-[#0047CC]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GridIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#EBF6FF] text-[#0047CC]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Courses Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                  <div className="h-40 bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 sm:p-14 text-center space-y-3 shadow-2xs">
              <p className="text-sm font-semibold text-gray-700">No courses found</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No courses match your current search query.'
                  : `You have no ${statusFilter === 'ALL' ? '' : getFilterLabel(statusFilter).toLowerCase()} courses at the moment.`}
              </p>
              {statusFilter !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="px-4 py-2 bg-[#0047CC] text-white rounded-full text-xs font-semibold hover:bg-[#0037a3] transition-colors cursor-pointer shadow-xs mt-2"
                >
                  View All Courses
                </button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  onClick={() => navigate('/courses/create')}
                  className="text-xs font-semibold mt-2"
                >
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.map((course) => {
                const rawThumbnail =
                  (course as any).coverImageS3Key ||
                  course.thumbnailS3Key ||
                  (course as any).thumbnailUrl ||
                  (course as any).coverImageUrl ||
                  (course as any).thumbnail ||
                  (course as any).coverImage;
                const banner = rawThumbnail ? getMediaUrl(rawThumbnail) : '';

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail Banner */}
                      {/* Thumbnail Banner */}
                      <div
                        onClick={() => handleEditCourse(course)}
                        className="relative h-40 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC] flex items-center justify-center cursor-pointer"
                      >
                        {banner ? (
                          <img
                            src={banner}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // If image fails to load, do NOT use fallback doctor image; hide broken img and show clean branded placeholder
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="p-4 text-center">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                              {course.category || 'VORA COURSE'}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {course.status === 'PUBLISHED' ? (
                            <span className="bg-emerald-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                              {course.statusLabel || 'PUBLISHED'}
                            </span>
                          ) : course.status === 'UNDER_REVIEW' ? (
                            <span className="bg-amber-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                              {course.statusLabel || 'UNDER REVIEW'}
                            </span>
                          ) : (
                            <span className="bg-gray-700/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                              {course.statusLabel || 'DRAFT'}
                            </span>
                          )}
                        </div>

                        {/* Price & Level */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                            {course.formattedPrice || (course.price ? `$${course.price} ${course.currency || 'USD'}` : 'Free')}
                          </span>
                          <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
                            {course.difficultyLevel}
                          </span>
                        </div>
                      </div>

                      {/* Body Info */}
                      <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                        <p className="text-[10px] sm:text-[11px] font-bold text-[#0047CC] uppercase tracking-wider">
                          {course.category}
                        </p>

                        <h3
                          onClick={() => handleEditCourse(course)}
                          className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#0047CC] transition-colors line-clamp-2 leading-snug cursor-pointer"
                        >
                          {course.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {course.description || course.subtitle}
                        </p>

                        {/* Meta numbers */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-50 text-center text-xs">
                          <div className="bg-gray-50/50 rounded-lg py-1 px-0.5">
                            <p className="text-gray-400 text-[10px]">Students</p>
                            <p className="font-bold text-gray-800 text-[11px] sm:text-xs">{course.students ?? 0}</p>
                          </div>
                          <div className="bg-gray-50/50 rounded-lg py-1 px-0.5">
                            <p className="text-gray-400 text-[10px]">Revenue</p>
                            <p className="font-bold text-emerald-600 text-[11px] sm:text-xs">
                              {course.formattedRevenue || `$${(course.revenue ?? 0).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 sm:p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                      {course.status === 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          disabled={unpublishMutation.isPending || !course.actions?.unpublish?.enabled}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-40 cursor-pointer min-h-[32px] flex items-center"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          disabled={publishMutation.isPending || !course.actions?.publish?.enabled}
                          className="text-xs font-semibold text-[#0047CC] hover:text-blue-800 disabled:opacity-40 cursor-pointer min-h-[32px] flex items-center"
                        >
                          Publish
                        </button>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          pill={false}
                          onClick={() => handleEditCourse(course)}
                          className="text-xs gap-1 py-1"
                        >
                          <PencilIcon size={12} />
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deleteMutation.isPending || !course.actions?.delete?.enabled}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 rounded-lg hover:bg-white transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                          title="Archive course"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const rawThumbnail =
                  (course as any).coverImageS3Key ||
                  course.thumbnailS3Key ||
                  (course as any).thumbnailUrl ||
                  (course as any).coverImageUrl ||
                  (course as any).thumbnail ||
                  (course as any).coverImage;
                const banner = rawThumbnail ? getMediaUrl(rawThumbnail) : '';

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs hover:border-blue-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group"
                  >
                    {/* Left: Thumbnail Banner */}
                    <div
                      onClick={() => handleEditCourse(course)}
                      className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC] flex items-center justify-center cursor-pointer"
                    >
                      {banner ? (
                        <img
                          src={banner}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="p-3 text-center">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                            {course.category || 'VORA COURSE'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Status Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {course.status === 'PUBLISHED' ? (
                          <span className="bg-emerald-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {course.statusLabel || 'PUBLISHED'}
                          </span>
                        ) : course.status === 'UNDER_REVIEW' ? (
                          <span className="bg-amber-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {course.statusLabel || 'UNDER REVIEW'}
                          </span>
                        ) : (
                          <span className="bg-gray-700/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {course.statusLabel || 'DRAFT'}
                          </span>
                        )}
                      </div>

                      {/* Price & Level */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                        <span className="font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[11px]">
                          {course.formattedPrice || (course.price ? `$${course.price} ${course.currency || 'USD'}` : 'Free')}
                        </span>
                        <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
                          {course.difficultyLevel}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag
                          variant="blue"
                          label={course.category}
                          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-0.5 px-2.5"
                        />
                        {course.format && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            • {course.format.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => handleEditCourse(course)}
                        className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#0047CC] transition-colors leading-snug cursor-pointer"
                      >
                        {course.title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {course.description || course.subtitle}
                      </p>

                      <div className="flex items-center gap-4 pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-[11px]">Students:</span>
                          <span className="font-bold text-gray-800 text-xs">{course.students ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-[11px]">Revenue:</span>
                          <span className="font-bold text-emerald-600 text-xs">
                            {course.formattedRevenue || `$${(course.revenue ?? 0).toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {course.status === 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          disabled={unpublishMutation.isPending || !course.actions?.unpublish?.enabled}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-40 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors w-full text-center"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          disabled={publishMutation.isPending || !course.actions?.publish?.enabled}
                          className="text-xs font-semibold text-[#0047CC] hover:text-blue-800 disabled:opacity-40 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors w-full text-center"
                        >
                          Publish
                        </button>
                      )}

                      <div className="flex items-center gap-1.5 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          pill={false}
                          onClick={() => handleEditCourse(course)}
                          className="text-xs gap-1 py-1 flex-1 justify-center"
                        >
                          <PencilIcon size={12} />
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deleteMutation.isPending || !course.actions?.delete?.enabled}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
                          title="Archive course"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB 2: STUDENT ROSTER & SUBMISSIONS ══════════════════ */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Enrolled Talents &amp; Project Submissions</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Track enrolled student progress and capstone deliverables.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : roster.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-gray-700">No students enrolled yet</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Enrolled students and their course completion progress will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="space-y-3 sm:hidden">
                  {roster.map((item) => (
                    <div key={item.enrollmentId} className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/30 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={DEFAULT_MENTOR_AVATAR}
                            alt={item.student?.displayName || 'Student'}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-gray-900 truncate">{item.student?.displayName || 'Talent'}</p>
                            <p className="text-[10px] text-gray-400">{item.student?.professionalTitle || 'Learner'}</p>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-[#0047CC] border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0">
                          {item.statusLabel || item.status}
                        </span>
                      </div>

                      <div className="text-xs bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="text-[11px] text-gray-500">Course</p>
                        <p className="font-semibold text-gray-800 leading-tight">{item.course?.title}</p>
                        {item.submissionTitle && (
                          <p className="text-[11px] text-gray-600 mt-1">Submission: {item.submissionTitle}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="font-bold text-[#0047CC]">{item.progressLabel || `${item.progressPercent}%`}</span>
                        </div>
                        <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#0047CC] h-full rounded-full" style={{ width: `${item.progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / Tablet Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Course</th>
                        <th className="pb-3 font-semibold">Progress</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {roster.map((item) => (
                        <tr key={item.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={DEFAULT_MENTOR_AVATAR}
                                alt={item.student?.displayName || 'Student'}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                <p className="font-bold text-gray-900">{item.student?.displayName || 'Talent'}</p>
                                <p className="text-[10px] text-gray-400">{item.student?.professionalTitle || 'Learner'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 font-medium text-gray-700">{item.course?.title}</td>
                          <td className="py-3.5 pr-4">
                            <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0047CC] h-full rounded-full" style={{ width: `${item.progressPercent}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold">
                              {item.progressLabel || `${item.progressPercent}%`}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="bg-blue-50 text-[#0047CC] border border-blue-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              {item.statusLabel || item.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right text-gray-400">
                            {item.actions?.reviewGrade?.enabled ? (
                              <Button variant="primary" size="sm" pill={false} className="text-xs py-1 px-3">
                                {item.actions.reviewGrade.label || 'Review'}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 3: COURSE MENTORSHIP & COHORTS ══════════════════ */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">1:1 Mentorship Attached to Courses</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Talents enrolled in your courses can book targeted 1:1 office hours and project reviews.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => navigate(hubData?.cta?.configureAvailability?.hrefHint || '/settings')}
                className="text-xs gap-1 w-full sm:w-auto justify-center"
              >
                {hubData?.cta?.configureAvailability?.label || 'Configure Availability & PPP Rates'}
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : mentorship.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-gray-700">No mentorship sessions scheduled</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Upcoming 1:1 booking requests and office hours with enrolled talents will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorship.map((m) => (
                  <div key={m.bookingId} className="border border-gray-200 rounded-2xl p-3.5 sm:p-5 bg-gray-50/40 space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <img
                          src={DEFAULT_MENTOR_AVATAR}
                          alt={m.mentee?.displayName || 'Mentee'}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{m.mentee?.displayName}</p>
                          <p className="text-[11px] sm:text-xs text-[#0047CC] font-medium truncate">
                            {m.course?.title || 'General Mentorship'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shrink-0">
                        {m.tierLabel || m.pppTier}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                      <p className="text-gray-500 font-medium">Session Focus:</p>
                      <p className="font-semibold text-gray-800 leading-snug">
                        {m.sessionFocus || 'Mentorship & Project Review'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-1 text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <CalendarIcon size={12} className="text-gray-400" />
                        {new Date(m.scheduledAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • {m.durationMinutes} mins
                      </span>
                      <span className="font-bold text-emerald-700">{m.formattedRate || `$${m.rate}`}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {m.actions?.startCall?.enabled && (m.actions.startCall.href || m.meetingLink) ? (
                        <Button
                          variant="primary"
                          size="sm"
                          pill={false}
                          onClick={() => {
                            const url = m.actions.startCall.href || m.meetingLink;
                            if (url) window.open(url, '_blank');
                          }}
                          className="text-xs flex-1 py-1.5 justify-center"
                        >
                          {m.actions.startCall.label || 'Start Call'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          pill={false}
                          disabled
                          className="text-xs flex-1 py-1.5 justify-center opacity-50"
                        >
                          Call Pending Link
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 4: REVIEWS & Q&A ══════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0047CC] flex items-center justify-center mx-auto text-xl">
              💬
            </div>
            <h3 className="text-base font-bold text-gray-900">Student Reviews &amp; Community Q&amp;A Coming Soon</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Student feedback, ratings, and course questions will be available in an upcoming release as talents complete modules across your published catalog.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorCoursesPage;
