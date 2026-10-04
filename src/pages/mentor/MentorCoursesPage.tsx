import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from '../../components/common/Icons';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ModalDialog from '../../components/common/ModalDialog';
import { toast } from 'react-hot-toast';
import {
  useInstructorHub,
  useCreateCourseMutation,
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

const MentorCoursesPage: React.FC<MentorCoursesPageProps> = () => {
  const navigate = useNavigate();

  // Primary API Query: GET /courses/instructor/hub
  const { data: hubData, isLoading, error } = useInstructorHub();

  const createCourseMutation = useCreateCourseMutation();
  const publishMutation = usePublishCourseMutation();
  const unpublishMutation = useUnpublishCourseMutation();
  const deleteMutation = useDeleteCourseMutation();

  const [activeTab, setActiveTab] = useState<'my-courses' | 'students' | 'mentorship' | 'reviews'>('my-courses');
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Create Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    category: string;
    level: string;
    format: CourseFormat;
    price: number;
    description: string;
    thumbnail: string;
  }>({
    title: '',
    category: 'Backend & Systems',
    level: 'Intermediate',
    format: 'VIDEO_MASTERCLASS',
    price: 69,
    description: '',
    thumbnail: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const courses: InstructorCourseItem[] = hubData?.myCourses || [];
  const roster: InstructorRosterItem[] = hubData?.roster || [];
  const mentorship = hubData?.mentorship || [];
  const metrics = hubData?.metrics;
  const tabCounts = hubData?.tabCounts;
  const filters = hubData?.filters;

  const filteredCourses = courses.filter((c) => {
    if (courseFilter !== 'ALL' && c.status !== courseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const validateCourseForm = () => {
    const errors: Record<string, string> = {};

    const trimmedTitle = courseForm.title.trim();
    if (!trimmedTitle) {
      errors.title = 'Course title is required';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    } else if (trimmedTitle.length > 120) {
      errors.title = 'Title must not exceed 120 characters';
    }

    if (!courseForm.category) {
      errors.category = 'Please select a course category';
    }

    if (!courseForm.level) {
      errors.level = 'Please select a difficulty level';
    }

    if (!courseForm.format) {
      errors.format = 'Please select a course format';
    }

    if (isNaN(courseForm.price) || courseForm.price < 0) {
      errors.price = 'Price must be 0 (Free) or greater';
    } else if (courseForm.price > 10000) {
      errors.price = 'Price cannot exceed $10,000 USD';
    }

    if (courseForm.description.trim() && courseForm.description.trim().length < 10) {
      errors.description = 'Description should be at least 10 characters long';
    }

    if (courseForm.thumbnail.trim()) {
      const thumb = courseForm.thumbnail.trim();
      const isUrl = /^https?:\/\//i.test(thumb);
      const isS3Key = /^[a-zA-Z0-9_\-./]+$/i.test(thumb);
      if (!isUrl && !isS3Key) {
        errors.thumbnail = 'Must be a valid URL or S3 storage key path';
      }
    }

    return errors;
  };

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setFormErrors({});
    setCourseForm({
      title: '',
      category: 'Backend & Systems',
      level: 'Intermediate',
      format: 'VIDEO_MASTERCLASS',
      price: 69,
      description: '',
      thumbnail: '',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditModal = (c: InstructorCourseItem) => {
    setEditingCourseId(c.id);
    setFormErrors({});
    setCourseForm({
      title: c.title,
      category: c.category,
      level: c.difficultyLevel || 'Intermediate',
      format: c.format || 'VIDEO_MASTERCLASS',
      price: c.price || 0,
      description: c.description || c.subtitle || '',
      thumbnail: c.thumbnailS3Key || '',
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCourseForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    setFormErrors({});

    try {
      await createCourseMutation.mutateAsync({
        title: courseForm.title,
        category: courseForm.category,
        difficultyLevel: courseForm.level,
        format: courseForm.format,
        tier1Price: Number(courseForm.price),
        description: courseForm.description,
        thumbnailS3Key: courseForm.thumbnail.trim() || null,
      });

      toast.success(editingCourseId ? 'Course updated successfully!' : 'Course draft created successfully!');
      setIsCourseModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save course. Please try again.');
    }
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
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0">
              Instructor Portal
            </span>
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
            onClick={handleOpenCreateModal}
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
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter pills */}
            <div
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-hide -mx-3.5 px-3.5 sm:mx-0 sm:px-0 py-0.5"
            >
              {(['ALL', 'PUBLISHED', 'UNDER_REVIEW', 'DRAFT'] as const).map((filterKey) => {
                const count =
                  filterKey === 'ALL'
                    ? filters?.all ?? courses.length
                    : filterKey === 'PUBLISHED'
                    ? filters?.published ?? courses.filter((c) => c.status === 'PUBLISHED').length
                    : filterKey === 'UNDER_REVIEW'
                    ? filters?.underReview ?? courses.filter((c) => c.status === 'UNDER_REVIEW').length
                    : filters?.drafts ?? courses.filter((c) => c.status === 'DRAFT').length;

                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setCourseFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      courseFilter === filterKey
                        ? 'bg-[#0047CC] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {filterKey === 'ALL'
                      ? `All (${count})`
                      : filterKey === 'PUBLISHED'
                      ? `Published (${count})`
                      : filterKey === 'UNDER_REVIEW'
                      ? `In Review (${count})`
                      : `Drafts (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your courses..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#0047CC]"
              />
            </div>
          </div>

          {/* Courses Grid */}
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
                  : 'You have not created any courses yet. Author your first course to begin mentoring.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleOpenCreateModal}
                className="text-xs font-semibold mt-2"
              >
                Create Your First Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.map((course) => {
                const banner = getMediaUrl(course.thumbnailS3Key, DEFAULT_COURSE_BANNER);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail Banner */}
                      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-gray-100">
                        <img
                          src={banner}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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

                        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug">
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
                          onClick={() => handleOpenEditModal(course)}
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

      {/* ══════════════════ CREATE COURSE MODAL ══════════════════ */}
      {isCourseModalOpen && (
        <ModalDialog
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          title={editingCourseId ? 'Edit Course Details' : 'Create New Course'}
          actions={
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setIsCourseModalOpen(false)}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleSaveCourse}
                disabled={createCourseMutation.isPending}
                className="w-full sm:w-auto justify-center"
              >
                {createCourseMutation.isPending ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Draft'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveCourse} className="space-y-4 text-left">
            <Input
              label="Course Title"
              value={courseForm.title}
              onChange={(e) => {
                setCourseForm({ ...courseForm, title: e.target.value });
                if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
              }}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title}
              placeholder="e.g. Asynchronous Distributed Architecture"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                value={courseForm.category}
                onChange={(e) => {
                  setCourseForm({ ...courseForm, category: e.target.value });
                  if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                }}
                error={Boolean(formErrors.category)}
                helperText={formErrors.category}
                options={[
                  { label: 'Backend & Systems', value: 'Backend & Systems' },
                  { label: 'DevOps & Cloud', value: 'DevOps & Cloud' },
                  { label: 'Health Tech & AI', value: 'Health Tech & AI' },
                  { label: 'Career & Leadership', value: 'Career & Leadership' },
                ]}
              />
              <Select
                label="Difficulty Level"
                value={courseForm.level}
                onChange={(e) => {
                  setCourseForm({ ...courseForm, level: e.target.value });
                  if (formErrors.level) setFormErrors({ ...formErrors, level: '' });
                }}
                error={Boolean(formErrors.level)}
                helperText={formErrors.level}
                options={[
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Advanced', value: 'Advanced' },
                  { label: 'All Levels', value: 'All Levels' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Course Format"
                value={courseForm.format}
                onChange={(e) => {
                  setCourseForm({ ...courseForm, format: e.target.value as CourseFormat });
                  if (formErrors.format) setFormErrors({ ...formErrors, format: '' });
                }}
                error={Boolean(formErrors.format)}
                helperText={formErrors.format}
                options={[
                  { label: 'Video Masterclass', value: 'VIDEO_MASTERCLASS' },
                  { label: 'Hybrid', value: 'HYBRID' },
                  { label: 'Cohort-Based', value: 'COHORT_BASED' },
                  { label: 'Case Study Series', value: 'CASE_STUDY_SERIES' },
                  { label: 'Workshop Sprint', value: 'WORKSHOP_SPRINT' },
                  { label: 'Written Text', value: 'WRITTEN_TEXT' },
                ]}
              />
              <Input
                label="Price (USD)"
                type="number"
                value={courseForm.price.toString()}
                onChange={(e) => {
                  setCourseForm({ ...courseForm, price: Number(e.target.value) });
                  if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                }}
                error={Boolean(formErrors.price)}
                helperText={formErrors.price}
                min="0"
                step="1"
              />
            </div>

            <Textarea
              label="Course Description & Overview"
              value={courseForm.description}
              onChange={(e) => {
                setCourseForm({ ...courseForm, description: e.target.value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
              }}
              error={Boolean(formErrors.description)}
              helperText={formErrors.description}
              placeholder="Describe what talents will master, prerequisites, and target learning outcomes..."
              rows={3}
            />

            <Input
              label="Cover Thumbnail S3 Key / URL (Optional)"
              value={courseForm.thumbnail}
              onChange={(e) => {
                setCourseForm({ ...courseForm, thumbnail: e.target.value });
                if (formErrors.thumbnail) setFormErrors({ ...formErrors, thumbnail: '' });
              }}
              error={Boolean(formErrors.thumbnail)}
              helperText={formErrors.thumbnail}
              placeholder="e.g. courses/thumbnails/intro.jpg"
            />
          </form>
        </ModalDialog>
      )}
    </div>
  );
};

export default MentorCoursesPage;
