import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayIcon, 
  CloseIcon, 
  CheckCircleIcon,
  ChevronDownIcon,
  CheckIcon,
  GridIcon,
  ListIcon,
  GraduationCapIcon,
  AwardIcon,
} from '../../components/common/Icons';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-hot-toast';
import {
  useRecommendedCourses,
  useEnrollments,
  useEnrollMutation,
} from '../../services/queries/courses';
import type {
  CourseBrowseItem,
  EnrollmentItem,
} from '../../types/courses';
import {
  mediaSrc,
  displayMedia,
  getMediaUrl,
  getYouTubeEmbedUrl,
  isYouTubeUrl,
  DEFAULT_COURSE_BANNER,
  DEFAULT_MENTOR_AVATAR,
} from '../../utils/media';
import Select from '../../components/common/Select';
import { MentorAvatar } from '../../components/mentors/MentorAvatar';

type TabType = 'ongoing' | 'completed' | 'recommended';
type SortOption = 'recommended' | 'recent' | 'popular' | 'rating' | 'title';

const SORT_OPTIONS_MAP: Record<SortOption, string> = {
  recommended: 'Recommended (Gap Priority)',
  recent: 'Most Recent',
  popular: 'Most Popular',
  rating: 'Highest Rated',
  title: 'Alphabetical (A-Z)',
};

const ENROLL_COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States (US)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'NG', label: 'Nigeria (NG)' },
  { value: 'GH', label: 'Ghana (GH)' },
  { value: 'KE', label: 'Kenya (KE)' },
  { value: 'ZA', label: 'South Africa (ZA)' },
  { value: 'IN', label: 'India (IN)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
];

const getInitials = (name?: string): string => {
  if (!name) return 'IN';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDisplayName = (name?: string): string => {
  if (!name) return 'Course Instructor';
  return name
    .trim()
    .split(/\s+/)
    .map(word => {
      if (word.startsWith('(') && word.length > 1) {
        return '(' + word[1].toUpperCase() + word.slice(2);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const getMentorRoleOrg = (mentor?: any): string => {
  if (!mentor) return '';
  if (mentor.professionalTitle || mentor.organisation) {
    return [mentor.professionalTitle, mentor.organisation].filter(Boolean).join(' · ');
  }
  if (mentor.instructorLabel) {
    const match = mentor.instructorLabel.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    const name = mentor.displayName || mentor.name || '';
    if (name && mentor.instructorLabel.startsWith(name)) {
      return mentor.instructorLabel.slice(name.length).replace(/^[\s·\-,]+/, '').trim();
    }
    return mentor.instructorLabel;
  }
  return '';
};

interface CourseCardItemProps {
  course: CourseBrowseItem;
  isMasterclassBadge?: boolean;
  onPreview: (course: CourseBrowseItem) => void;
  onEnroll: (course: CourseBrowseItem) => void;
  onOpen: (courseId: string, href?: string) => void;
}

const CourseCardItem: React.FC<CourseCardItemProps> = ({
  course,
  isMasterclassBadge,
  onPreview,
  onEnroll,
  onOpen,
}) => {
  const banner = course.thumbnailUrl || displayMedia(
    course.thumbnailUrl || (course as any).coverImageUrl,
    course.thumbnailS3Key || (course as any).coverImageS3Key
  );
  const mentorName = course.mentor?.displayName || course.mentor?.name || 'Instructor';
  const mentorOrg = course.mentor?.organisation || course.mentor?.professionalTitle || null;
  const mentorPhoto = course.mentor?.photoUrl || displayMedia(course.mentor?.photoUrl, course.mentor?.photoS3Key) || DEFAULT_MENTOR_AVATAR;

  return (
    <div className="bg-white border border-gray-200/90 hover:border-blue-200 rounded-[22px] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group focus-within:ring-2 focus-within:ring-[#0052CC]/20">
      <div>
        {/* Fixed 16:9 Thumbnail with Consistent Play Button & Fallback */}
        <div
          onClick={() => onPreview(course)}
          className="w-full aspect-16/9 overflow-hidden relative group cursor-pointer bg-slate-900 border-b border-gray-100"
        >
          {banner ? (
            <img
              src={banner}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC] flex flex-col items-center justify-center p-4 text-center">
              <GraduationCapIcon size={32} className="text-white/60 mb-1" />
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                {course.category || 'VORA COURSE'}
              </span>
            </div>
          )}

          {/* Unified Hover / Center Play Icon */}
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/40">
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-110 transition-transform">
              <PlayIcon size={18} className="ml-0.5 fill-white" />
            </div>
          </div>

          {/* Neutral translucent tag on top-left of thumbnail */}
          <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 flex-wrap max-w-[85%]">
            {isMasterclassBadge || course.isMasterclass ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-sm text-white tracking-wide border border-white/10 uppercase">
                Masterclass
              </span>
            ) : course.category ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-sm text-white tracking-wide border border-white/10 uppercase capitalize">
                {course.category}
              </span>
            ) : null}
          </div>
        </div>

        {/* Course Info */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Recommendation Gap Badge if prescribed or gap-linked */}
          {course.recommendation && (
            <div>
              <span
                title={course.recommendation.reason}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs"
              >
                <span>🎯</span>
                <span>
                  {course.recommendation.source === 'prescription'
                    ? 'Prescribed for Gaps'
                    : course.recommendation.source === 'gap_link' || course.recommendation.source === 'target_gap'
                    ? 'For Your Growth Gaps'
                    : 'Recommended'}
                </span>
              </span>
            </div>
          )}

          {/* Title */}
          <h4
            onClick={() => onPreview(course)}
            className="text-[16px] font-semibold text-gray-900 leading-snug group-hover:text-[#0052CC] transition-colors cursor-pointer line-clamp-2 min-h-[44px]"
            title={course.title}
          >
            {course.title}
          </h4>

          {/* Prominent Instructor with clean Secondary Org */}
          <div className="flex items-center gap-2.5 min-w-0 pt-0.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
              {mentorPhoto ? (
                <img
                  src={mentorPhoto}
                  alt={mentorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                mentorName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                {mentorName}
              </p>
              {mentorOrg && (
                <p className="text-[12px] text-gray-500 truncate -mt-0.5">
                  {mentorOrg}
                </p>
              )}
            </div>
          </div>

          {/* Meta row: duration, enrolled, rating */}
          <div className="flex items-center flex-wrap gap-2 text-[12px] text-gray-600 font-medium pt-0.5">
            {course.stats?.videoHoursLabel && (
              <span>{course.stats.videoHoursLabel}</span>
            )}
            {course.stats?.studentCount ? (
              <>
                <span className="text-gray-300">•</span>
                <span>{course.stats.studentCount.toLocaleString()} enrolled</span>
              </>
            ) : null}
            {course.stats?.ratings !== null && course.stats?.ratings != null && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  ★ {course.stats.ratings}
                  {course.stats.ratingsCount ? (
                    <span className="text-gray-400 font-normal">({course.stats.ratingsCount})</span>
                  ) : null}
                </span>
              </>
            )}
          </div>

          {/* Tag Pills */}
          {course.pills && course.pills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.pills.map((pill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-gray-100 text-gray-700 capitalize border border-gray-200/60"
                >
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer with 40px buttons */}
      <div className="p-5 sm:p-6 pt-0">
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(course)}
            className="h-10 px-3.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[13px] transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center active:scale-[0.98]"
          >
            Preview
          </button>
          {course.enrolled ? (
            <button
              type="button"
              onClick={() => onOpen(course.id, course.cta?.hrefHint)}
              className="flex-1 h-10 px-4 rounded-xl bg-[#0052CC] hover:bg-[#0047CC] text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              Continue Learning
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="flex-1 h-10 px-4 rounded-xl bg-[#0052CC] hover:bg-[#0047CC] text-white font-semibold text-[13px] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              {course.cta?.label?.replace(/→/g, '').trim() || 'Take this course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  // React Query hooks
  const { 
    data: recommendedData, 
    isLoading: isLoadingRecommended, 
    error: recommendedError 
  } = useRecommendedCourses();

  const { 
    data: enrollmentsData, 
    isLoading: isLoadingEnrollments, 
    error: enrollmentsError 
  } = useEnrollments();

  const enrollMutation = useEnrollMutation();

  // Modals state
  const [previewCourse, setPreviewCourse] = useState<CourseBrowseItem | null>(null);
  const [enrollCourse, setEnrollCourse] = useState<CourseBrowseItem | null>(null);
  const [certificateCourse, setCertificateCourse] = useState<EnrollmentItem | null>(null);

  // Enroll Country state
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [countryError, setCountryError] = useState('');

  const ongoingCourses: EnrollmentItem[] = enrollmentsData?.ongoing || [];
  const completedCourses: EnrollmentItem[] = enrollmentsData?.completed || [];
  const recommendedItems: CourseBrowseItem[] = recommendedData?.items || [];

  // Extract unique categories dynamically from recommended courses
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    recommendedItems.forEach((c) => {
      if (c.category && typeof c.category === 'string' && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set);
  }, [recommendedItems]);

  // Learner Filter & View states (All Courses | Masterclasses | Categories)
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);
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

  const displayCourses = useMemo(() => {
    let list = [...recommendedItems];

    if (selectedFilter === 'MASTERCLASS') {
      list = list.filter((c) => c.isMasterclass || c.format === 'VIDEO_MASTERCLASS');
    } else if (selectedFilter !== 'ALL') {
      list = list.filter((c) => c.category?.toLowerCase() === selectedFilter.toLowerCase());
    }

    // Preserve BE ranking (DevelopmentPrescription -> GapSignals -> targetGaps -> moduleGaps -> fallback)
    // Only re-sort if user explicitly selected a non-recommended sort option
    if (sortBy !== 'recommended') {
      list.sort((a, b) => {
        if (sortBy === 'recent') {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        }
        if (sortBy === 'popular') {
          return (b.stats?.studentCount ?? 0) - (a.stats?.studentCount ?? 0);
        }
        if (sortBy === 'rating') {
          return (b.stats?.ratings ?? 0) - (a.stats?.ratings ?? 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }

    return list;
  }, [recommendedItems, selectedFilter, sortBy]);

  const handleOpenCourse = (courseId: string, href?: string) => {
    if (href && href.startsWith('/courses/')) {
      navigate(href);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCourse) return;

    if (!selectedCountry.trim()) {
      setCountryError('Please select your country of residence.');
      return;
    }
    setCountryError('');

    try {
      await enrollMutation.mutateAsync({
        courseId: enrollCourse.id,
        payload: {
          declaredCountry: selectedCountry,
          ipCountry: selectedCountry,
          paymentCountry: selectedCountry,
          localeCountry: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        },
      });

      toast.success(`Successfully enrolled in "${enrollCourse.title}"!`);
      const targetId = enrollCourse.id;
      setEnrollCourse(null);
      setPreviewCourse(null);
      setActiveTab('ongoing');
      navigate(`/courses/${targetId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to enroll in course. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Courses</h1>
      </div>

      {/* Hero Banner: Gain Experience from the World's Best */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 md:p-12 border border-gray-200/80 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
        <div className="space-y-3 w-full lg:max-w-md z-10 text-center lg:text-left">
          <h2 className="text-[20px] sm:text-[26px] md:text-[32px] lg:text-[44px] font-bold text-gray-900 leading-[1.15] tracking-tight sm:whitespace-nowrap lg:whitespace-normal">
            Gain Experience <br className="hidden lg:inline" />
            from the <br className="hidden lg:inline" />
            World&apos;s Best
          </h2>
        </div>

        {/* Mentor Mosaic */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 z-10 justify-center">
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm mt-2 sm:mt-3">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm mt-2 sm:mt-3">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm -mt-2">
            <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm -mt-2">
            <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-[14px] sm:rounded-[16px] overflow-hidden border-2 border-blue-100 shadow-sm">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop" alt="Mentor" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION (Full width, unclipped, zero horizontal scroll needed) ── */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pb-3.5 text-[14px] sm:text-[15px] transition-colors relative cursor-pointer font-medium shrink-0 ${
              activeTab === 'ongoing'
                ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Ongoing courses
            {ongoingCourses.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] rounded-full bg-blue-50 text-[#0052CC] font-semibold">
                {ongoingCourses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3.5 text-[14px] sm:text-[15px] transition-colors relative cursor-pointer font-medium shrink-0 ${
              activeTab === 'completed'
                ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Completed courses
            {completedCourses.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[11px] rounded-full bg-blue-50 text-[#0052CC] font-semibold">
                {completedCourses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`pb-3.5 text-[14px] sm:text-[15px] transition-colors relative cursor-pointer font-medium shrink-0 ${
              activeTab === 'recommended'
                ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Recommended courses
          </button>
        </div>
      </div>

      {/* ══════════════════ TAB 1: ONGOING COURSES ══════════════════ */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {isLoadingEnrollments ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border border-gray-200/80 rounded-[24px] p-5 sm:p-7 animate-pulse space-y-5">
                  {/* Skeleton Header: Title + Instructor Line + CTA Button */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="h-6 bg-slate-200 rounded-md w-3/4 sm:w-1/2" />
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-full w-full sm:w-36 shrink-0" />
                  </div>
                  {/* Skeleton Progress Strip */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between">
                      <div className="h-5 bg-slate-200 rounded-full w-24" />
                      <div className="h-4 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full w-full" />
                  </div>
                  {/* Skeleton Media Preview */}
                  <div className="w-full aspect-16/9 sm:aspect-[21/9] max-h-[260px] sm:max-h-[280px] bg-slate-200 rounded-[20px]" />
                </div>
              ))}
            </div>
          ) : enrollmentsError ? (
            <div className="text-center py-12 bg-red-50/50 rounded-[24px] border border-red-100 p-6">
              <p className="text-red-700 font-semibold text-[14px]">Failed to load ongoing courses.</p>
              <p className="text-red-500 text-[12px] pt-1">Please refresh or check your internet connection.</p>
            </div>
          ) : ongoingCourses.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-xs">
              <EmptyState
                icon={GraduationCapIcon}
                title="No active ongoing courses"
                description="You are not enrolled in any courses right now. Explore top courses taught by industry leaders to start learning."
                variant="dashed"
                className="m-4 sm:m-6"
                action={{
                  label: 'Explore Recommended Courses',
                  onClick: () => setActiveTab('recommended'),
                }}
              />
            </div>
          ) : (
            ongoingCourses.map(enrollment => {
              const courseTitle = enrollment.course?.title || enrollment.title || 'Course';
              const courseId = enrollment.course?.id || enrollment.courseId || '';
              const mentorName = enrollment.mentor?.displayName || enrollment.mentor?.name || 'Course Instructor';
              const roleAndOrg = getMentorRoleOrg(enrollment.mentor);
              const courseBanner = displayMedia(
                enrollment.course?.thumbnailUrl || (enrollment.course as any)?.coverImageUrl,
                enrollment.course?.thumbnailS3Key || (enrollment.course as any)?.coverImageS3Key
              );
              const continueHref = enrollment.cta?.continueLearning?.hrefHint || enrollment.cta?.resumeLesson?.href || `/courses/${courseId}`;

              const progress = Math.min(100, Math.max(0, enrollment.progressPercent ?? 0));
              const isCompleted = progress >= 100 || enrollment.status === 'COMPLETED';
              const isNotStarted = progress === 0 && enrollment.status !== 'COMPLETED';
              const isInProgress = !isCompleted && !isNotStarted;

              let statusLabel = 'In progress';
              let statusChipClasses = 'bg-blue-50 text-[#0052CC] border border-blue-200/80';
              let dotColor = 'bg-[#0052CC]';

              if (isCompleted) {
                statusLabel = 'Completed';
                statusChipClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
                dotColor = 'bg-emerald-500';
              } else if (isNotStarted) {
                statusLabel = 'Not started';
                statusChipClasses = 'bg-slate-100 text-slate-600 border border-slate-200/80';
                dotColor = 'bg-slate-400';
              }

              const primaryCtaLabel = isCompleted
                ? 'Review course'
                : progress > 0
                ? 'Resume course'
                : 'Start course';

              const overlayCtaLabel = isCompleted
                ? 'Review lesson'
                : progress > 0
                ? 'Resume lesson'
                : 'Start lesson';

              return (
                <div
                  key={enrollment.enrollmentId}
                  className="bg-white border border-gray-200/80 rounded-[24px] p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#0052CC]/20"
                >
                  {/* Header Row: Course Title Heading + Instructor Line (Avatar + Name once + Role/Org) + Primary Action Button */}
                  <div className="order-2 sm:order-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      {/* Course Title (Prominent Heading: semibold, 18-20px) */}
                      <h3
                        onClick={() => handleOpenCourse(courseId, continueHref)}
                        className="text-[18px] sm:text-[20px] font-semibold text-gray-900 leading-snug hover:text-[#0052CC] transition-colors cursor-pointer line-clamp-2"
                        title={courseTitle}
                      >
                        {courseTitle}
                      </h3>

                      {/* Instructor Line (Crisp 32px Avatar + Name once + Role & Org in muted truncate) */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MentorAvatar
                          photoUrl={enrollment.mentor?.photoUrl}
                          photoS3Key={enrollment.mentor?.photoS3Key}
                          name={mentorName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200/90 shadow-2xs"
                        />
                        <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-600 min-w-0">
                          <span className="font-semibold text-gray-900 shrink-0">
                            {formatDisplayName(mentorName)}
                          </span>
                          {roleAndOrg && (
                            <>
                              <span className="text-slate-300 shrink-0">•</span>
                              <span className="text-slate-500 truncate font-medium" title={roleAndOrg}>
                                {roleAndOrg}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Current lesson context indicator if in-progress */}
                      {enrollment.cta?.resumeLesson?.lessonTitle && (
                        <p className="text-xs text-[#0052CC] font-medium pt-0.5 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0052CC] shrink-0" />
                          <span>Current Lesson: {enrollment.cta.resumeLesson.lessonTitle}</span>
                        </p>
                      )}
                    </div>

                    {/* Primary CTA Button (Consistent min-width, same blue & radius, full-width on mobile) */}
                    <div className="shrink-0 w-full sm:w-auto self-stretch sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleOpenCourse(courseId, continueHref)}
                        className="w-full sm:min-w-[150px] px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-semibold text-[14px] shadow-xs cursor-pointer transition-all active:scale-[0.98] text-center"
                      >
                        {primaryCtaLabel}
                      </button>
                    </div>
                  </div>

                  {/* Progress Strip: Status chip + percentage label + visible darker track */}
                  <div className="order-3 sm:order-2 space-y-2 pt-0.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      {/* Status Chip following status map: Not started = gray, In progress = blue-50, Completed = green */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusChipClasses}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {statusLabel}
                      </span>

                      {/* Percentage in dark slate */}
                      <span className="font-bold text-slate-800">
                        {progress}% completed
                      </span>
                    </div>

                    {/* Progress Bar with visible darker track */}
                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-[#0052CC]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Video Thumbnail Preview: Capped height, object-cover, blurred backdrop for odd ratios, legible play overlay */}
                  <div
                    onClick={() => handleOpenCourse(courseId, continueHref)}
                    className="order-1 sm:order-3 relative w-full aspect-16/9 sm:aspect-[21/9] max-h-[260px] sm:max-h-[280px] rounded-[18px] sm:rounded-[20px] overflow-hidden group cursor-pointer shadow-xs border border-gray-200/80 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${courseTitle}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenCourse(courseId, continueHref);
                      }
                    }}
                  >
                    {courseBanner ? (
                      <>
                        {/* Blurred backdrop to fill odd ratios and avoid black letterbox bars */}
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-xl scale-125 opacity-35 pointer-events-none"
                          style={{ backgroundImage: `url(${courseBanner})` }}
                        />
                        <img
                          src={courseBanner}
                          alt={courseTitle}
                          className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </>
                    ) : (
                      /* No thumbnail state: Elegant gradient with category badge & watermark */
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-2">
                          {enrollment.course?.category || 'VORA COURSE'}
                        </span>
                        <h4 className="text-white/90 text-sm sm:text-base font-semibold line-clamp-1 max-w-md">
                          {courseTitle}
                        </h4>
                      </div>
                    )}

                    {/* Dark scrim + legible, high-contrast Play overlay */}
                    <div className="absolute inset-0 z-20 bg-black/35 group-hover:bg-black/45 transition-colors flex flex-col items-center justify-center gap-2.5">
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border-2 border-white/90 text-white shadow-xl group-hover:scale-110 group-hover:bg-[#0052CC] group-hover:border-[#0052CC] transition-all duration-300">
                        <PlayIcon size={24} className="ml-1 fill-white" />
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[13px] sm:text-[14px] font-semibold shadow-md flex items-center gap-1.5">
                        {overlayCtaLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════ TAB 2: COMPLETED COURSES ══════════════════ */}
      {activeTab === 'completed' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isLoadingEnrollments ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-[20px] p-6 animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : completedCourses.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-xs">
              <EmptyState
                icon={AwardIcon}
                title="No completed courses yet"
                description="When you finish courses and earn verified certificates, they will appear here."
                variant="dashed"
                className="m-4 sm:m-6"
                action={{
                  label: 'Explore Courses',
                  onClick: () => setActiveTab('recommended'),
                }}
              />
            </div>
          ) : (
            completedCourses.map(enrollment => {
              const courseTitle = enrollment.course?.title || enrollment.title || 'Completed Course';
              const courseId = enrollment.course?.id || enrollment.courseId || '';
              const mentorName = enrollment.mentor?.displayName || enrollment.mentor?.name || 'Instructor';
              const courseBanner = displayMedia(
                enrollment.course?.thumbnailUrl || (enrollment.course as any)?.coverImageUrl,
                enrollment.course?.thumbnailS3Key || (enrollment.course as any)?.coverImageS3Key
              );

              return (
                <div
                  key={enrollment.enrollmentId}
                  className="bg-white border border-gray-100/90 rounded-[20px] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-100 transition-all"
                >
                  {/* Left Portion: Thumbnail + Meta + Progress */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    <div 
                      onClick={() => handleOpenCourse(courseId)}
                      className="w-full sm:w-36 h-28 rounded-[14px] overflow-hidden shrink-0 relative group cursor-pointer border border-gray-100 bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC]"
                    >
                      {courseBanner ? (
                        <img
                          src={courseBanner}
                          alt={courseTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center">
                          <span className="text-[9px] font-bold uppercase text-white/90">
                            {courseTitle}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/70 shadow-sm text-white">
                          <PlayIcon size={14} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h3
                        onClick={() => handleOpenCourse(courseId)}
                        className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate hover:text-[#0052CC] transition-colors cursor-pointer"
                      >
                        {courseTitle}
                      </h3>
                      <div className="flex items-center gap-2 pt-0.5 min-w-0">
                        <MentorAvatar
                          photoUrl={enrollment.mentor?.photoUrl}
                          photoS3Key={enrollment.mentor?.photoS3Key}
                          name={mentorName}
                          className="w-5 h-5 rounded-full object-cover shrink-0 border border-gray-200"
                        />
                        <span className="text-[12px] text-gray-600 truncate font-medium">
                          {formatDisplayName(mentorName)}
                        </span>
                      </div>
                      
                      {/* Progress Bar with Green Completed Chip */}
                      <div className="pt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <CheckCircleIcon size={12} className="text-emerald-500" />
                          100% completed
                        </span>
                        <div className="w-full max-w-[160px] h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Portion: Certificate CTA (strictly gated per handoff: only when enabled) */}
                  <div className="bg-[#FAFAFA] border border-gray-100/90 rounded-[16px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:w-[320px] lg:w-[360px] shrink-0">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-gray-400 font-medium">Status</span>
                      <div className="text-[16px] font-bold text-emerald-600 leading-tight flex items-center gap-1.5">
                        <CheckCircleIcon size={18} className="text-emerald-500" />
                        {enrollment.statusLabel || 'Completed'}
                      </div>
                    </div>

                    {enrollment.cta?.downloadCertificate?.enabled ? (
                      <button
                        type="button"
                        onClick={() => setCertificateCourse(enrollment)}
                        className="w-full sm:w-auto bg-[#0052CC] hover:bg-[#0047CC] text-white px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Download certificate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenCourse(courseId)}
                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-all"
                      >
                        Review Course
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════ TAB 3: RECOMMENDED COURSES ══════════════════ */}
      {activeTab === 'recommended' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Controls Toolbar: Course counter, Sort dropdown, Grid/List view toggle */}
          {!isLoadingRecommended && !recommendedError && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {displayCourses.length} {displayCourses.length === 1 ? 'course' : 'courses'}
              </span>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                {/* Sort Selector Dropdown - 40px height */}
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>{SORT_OPTIONS_MAP[sortBy]}</span>
                    <ChevronDownIcon
                      size={15}
                      className={`text-gray-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-40 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95">
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
                              ? 'bg-blue-50 text-[#0052CC] font-bold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{SORT_OPTIONS_MAP[key]}</span>
                          {sortBy === key && <CheckIcon size={13} className="text-[#0052CC]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grid / List Toggle - 40px container, 18px icons, active blue-50 */}
                <div className="h-10 bg-white border border-gray-200 rounded-xl p-1 flex items-center gap-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-blue-50 text-[#0052CC] border border-blue-200'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <GridIcon size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title="List View"
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-blue-50 text-[#0052CC] border border-blue-200'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingRecommended && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-[22px] p-4 animate-pulse space-y-3">
                  <div className="aspect-16/9 bg-gray-200 rounded-xl" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {recommendedError && !isLoadingRecommended && (
            <div className="text-center py-12 bg-red-50/50 rounded-[24px] border border-red-100 p-6">
              <p className="text-red-700 font-semibold text-[14px]">Failed to load recommended courses.</p>
              <p className="text-red-500 text-[12px] pt-1">Please check your network connection and try again.</p>
            </div>
          )}

          {/* Coaching copy / growth gap prescription banner */}
          {(recommendedData?.message || (recommendedData?.focusAreas && recommendedData.focusAreas.length > 0)) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0052CC] flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Curated For Your Assessment & Match Gaps</span>
                  </span>
                  {recommendedData?.source === 'prescriptions' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-bold">
                      Prescription Match
                    </span>
                  )}
                  {recommendedData?.source === 'gap_signals' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0052CC] text-[10px] font-bold">
                      Linked Gap Signals
                    </span>
                  )}
                </div>

                {recommendedData?.message && (
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {recommendedData.message}
                  </p>
                )}

                {recommendedData?.focusAreas && recommendedData.focusAreas.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs font-semibold text-slate-600">Prescribed Focus Areas:</span>
                    {recommendedData.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-xs font-medium text-[#0052CC]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State when no recommended courses or filter yields no results */}
          {!isLoadingRecommended && !recommendedError && displayCourses.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-xs">
              <EmptyState
                icon={GraduationCapIcon}
                title={
                  selectedFilter !== 'ALL'
                    ? `No courses found under "${selectedFilter}"`
                    : recommendedData?.emptyState?.title || 'No recommended courses yet'
                }
                description={
                  selectedFilter !== 'ALL'
                    ? 'Try switching to all courses to view all available recommendations.'
                    : recommendedData?.emptyState?.body ||
                      'When your assessment or match gaps are linked to published mentor courses, they appear here. Nothing is invented.'
                }
                variant="dashed"
                className="m-4 sm:m-6"
                action={
                  selectedFilter !== 'ALL'
                    ? {
                        label: 'View All Recommended',
                        onClick: () => setSelectedFilter('ALL'),
                      }
                    : undefined
                }
              />
            </div>
          )}

          {/* ── LIST VIEW MODE (Honest BE Ranking) ── */}
          {!isLoadingRecommended && !recommendedError && viewMode === 'list' && displayCourses.length > 0 && (
            <div className="space-y-4">
              {displayCourses.map((course) => {
                const banner = course.thumbnailUrl || displayMedia(course.thumbnailUrl || (course as any).coverImageUrl, course.thumbnailS3Key || (course as any).coverImageS3Key);
                const mentorName = course.mentor?.displayName || course.mentor?.name || 'Instructor';
                const mentorPhoto = course.mentor?.photoUrl || displayMedia(course.mentor?.photoUrl, course.mentor?.photoS3Key) || DEFAULT_MENTOR_AVATAR;

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-gray-200/90 hover:border-blue-200 rounded-[22px] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    {/* Fixed 16:9 Thumbnail with subtle dark overlay & play button */}
                    <div
                      onClick={() => setPreviewCourse(course)}
                      className="w-full md:w-60 aspect-video md:aspect-video rounded-[16px] overflow-hidden shrink-0 relative group cursor-pointer bg-slate-900 border border-gray-100"
                    >
                      {banner ? (
                        <img
                          src={banner}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC] flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider capitalize">
                            {course.category || 'Vora Course'}
                          </span>
                        </div>
                      )}

                      {/* Subtle Dark Scrim Overlay to ensure contrast with white play button */}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-110 transition-transform">
                          <PlayIcon size={18} className="ml-0.5 fill-white" />
                        </div>
                      </div>

                      {/* Subtle dark translucent badge instead of solid blue */}
                      {course.isMasterclass && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white uppercase tracking-wider border border-white/20 shadow-xs">
                          Masterclass
                        </span>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0 max-w-3xl space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {course.recommendation && (
                          <span
                            title={course.recommendation.reason}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs"
                          >
                            <span>🎯</span>
                            <span>
                              {course.recommendation.source === 'prescription'
                                ? 'Prescribed for Gaps'
                                : course.recommendation.source === 'gap_link' || course.recommendation.source === 'target_gap'
                                ? 'For Your Growth Gaps'
                                : 'Recommended'}
                            </span>
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-100/60 capitalize">
                          {course.category}
                        </span>
                        {course.formatLabel && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                            {course.formatLabel}
                          </span>
                        )}
                        {course.difficultyLevel && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="text-slate-400 font-bold">•</span>
                            <span className="text-[13px] font-medium capitalize">
                              {course.difficultyLevel}
                            </span>
                          </div>
                        )}
                      </div>

                      <h4
                        onClick={() => setPreviewCourse(course)}
                        className="text-[18px] font-semibold text-slate-900 group-hover:text-[#0052CC] transition-colors cursor-pointer leading-snug line-clamp-2"
                      >
                        {course.title}
                      </h4>

                      <p className="text-[14px] text-slate-600 line-clamp-2 leading-relaxed">
                        {course.subtitle || course.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 text-[13px] sm:text-[14px] text-slate-500 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {mentorPhoto ? (
                              <img
                                src={mentorPhoto}
                                alt={mentorName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600">
                                {getInitials(mentorName)}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-slate-800 capitalize">{mentorName}</span>
                        </div>

                        {course.stats?.videoHoursLabel && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>{course.stats.videoHoursLabel}</span>
                          </>
                        )}

                        {course.stats?.ratings !== null && course.stats?.ratings != null && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              ★ {course.stats.ratings}
                              {course.stats.ratingsCount ? (
                                <span className="text-slate-400 font-normal">({course.stats.ratingsCount})</span>
                              ) : null}
                            </span>
                          </>
                        )}

                        {course.stats?.studentCount ? (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>{course.stats.studentCount.toLocaleString()} enrolled</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-center justify-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setPreviewCourse(course)}
                        className="w-full sm:w-36 md:w-40 h-[42px] px-4 rounded-full border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[13px] transition-all cursor-pointer shadow-2xs flex items-center justify-center active:scale-[0.98]"
                      >
                        Preview
                      </button>

                      {course.enrolled ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCourse(course.id, course.cta?.hrefHint)}
                          className="w-full sm:w-36 md:w-40 h-[42px] px-5 rounded-full bg-[#0052CC] hover:bg-[#0047CC] text-white font-bold text-[13px] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                        >
                          Continue Learning
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEnrollCourse(course);
                          }}
                          className="w-full sm:w-36 md:w-40 h-[42px] px-5 rounded-full bg-[#0052CC] hover:bg-[#0047CC] text-white font-bold text-[13px] shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                        >
                          {course.cta?.label?.replace(/→/g, '').trim() || 'Take this course'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── GRID VIEW MODE (Preserving Backend Ranked Order) ── */}
          {!isLoadingRecommended && !recommendedError && viewMode === 'grid' && displayCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {displayCourses.map((course) => (
                <CourseCardItem
                  key={course.id}
                  course={course}
                  isMasterclassBadge={course.isMasterclass}
                  onPreview={setPreviewCourse}
                  onEnroll={setEnrollCourse}
                  onOpen={handleOpenCourse}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* ══════════════════ COURSE PREVIEW MODAL ══════════════════ */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative max-h-[92vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setPreviewCourse(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>

            {/* Video Player or Embed Banner */}
            {(() => {
              const promoSrc = displayMedia(previewCourse.promoVideoUrl, previewCourse.promoVideoS3Key);
              const thumbSrc = displayMedia(previewCourse.thumbnailUrl || (previewCourse as any).coverImageUrl, previewCourse.thumbnailS3Key || (previewCourse as any).coverImageS3Key);
              if (promoSrc && isYouTubeUrl(promoSrc)) {
                return (
                  <div className="relative h-48 sm:h-64 w-full bg-black shrink-0 overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(promoSrc, true, false) || ''}
                      title={previewCourse.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              if (promoSrc) {
                return (
                  <div className="relative h-48 sm:h-64 w-full bg-black shrink-0 overflow-hidden">
                    <video
                      src={promoSrc}
                      poster={thumbSrc || undefined}
                      autoPlay
                      muted
                      playsInline
                      loop
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              }
              return (
                <div className="relative h-44 sm:h-52 w-full bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0047CC] shrink-0 overflow-hidden flex items-center justify-center">
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={previewCourse.title}
                      className="w-full h-full object-cover opacity-90"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {previewCourse.category || 'VORA COURSE'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md">
                      <PlayIcon size={18} className="ml-0.5 fill-white" />
                    </div>
                    <span className="text-white text-[12px] font-semibold drop-shadow-sm">
                      Preview video coming soon
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <MentorAvatar
                    photoUrl={previewCourse.mentor?.photoUrl}
                    photoS3Key={previewCourse.mentor?.photoS3Key}
                    name={previewCourse.mentor?.displayName || previewCourse.mentor?.name}
                    className="w-12 h-12 rounded-[14px] object-cover shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                      {previewCourse.mentor?.displayName || previewCourse.mentor?.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {previewCourse.mentor?.instructorLabel || previewCourse.mentor?.professionalTitle || 'Instructor'}
                    </p>
                  </div>
                </div>

                {previewCourse.enrolled ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCourse(null);
                      handleOpenCourse(previewCourse.id, previewCourse.cta?.hrefHint);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[13px] shadow-xs cursor-pointer whitespace-nowrap transition-all active:scale-[0.98] text-center shrink-0"
                  >
                    Open Course
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollCourse(previewCourse);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[13px] shadow-xs cursor-pointer whitespace-nowrap transition-all active:scale-[0.98] text-center shrink-0"
                  >
                    Enroll Now
                  </button>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
                  {previewCourse.title}
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  {previewCourse.description || previewCourse.subtitle || previewCourse.tagline}
                </p>
              </div>

              {/* Pills & Format */}
              <div className="flex flex-wrap gap-2 pt-1">
                {previewCourse.format && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC]">
                    {previewCourse.formatLabel || previewCourse.format.replace(/_/g, ' ')}
                  </span>
                )}
                {previewCourse.pills?.map((pill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ ENROLL CONFIRMATION MODAL ══════════════════ */}
      {enrollCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-7 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-[20px] font-bold text-gray-900">Confirm Enrollment</h3>
              <button
                onClick={() => setEnrollCourse(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-[#FAFAFA] rounded-[18px] p-5 border border-gray-100 space-y-3">
              <h4 className="text-[13px] font-bold text-gray-900">Course Summary</h4>
              <div className="flex justify-between items-start text-[13px] pt-1">
                <div>
                  <p className="font-bold text-gray-900">{enrollCourse.title}</p>
                  <p className="text-gray-500 text-[12px]">Instructor: {enrollCourse.mentor?.displayName || enrollCourse.mentor?.name}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  Included
                </span>
              </div>
              <div className="border-t border-gray-200/80 pt-2 space-y-1 text-[12px] text-gray-500">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-gray-900 font-medium">
                    {enrollCourse.formatLabel || enrollCourse.format.replace(/_/g, ' ')}
                  </span>
                </div>
                {enrollCourse.stats?.videoHoursLabel && (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-gray-900 font-medium">{enrollCourse.stats.videoHoursLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-5">
              {/* Country Selection (PPP Body fields) */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Country of Residence</label>
                <p className="text-[11px] text-gray-400">Used to localize your learning path and certificate</p>
                <Select
                  hideLabel
                  placeholder="Select country..."
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    if (countryError) setCountryError('');
                  }}
                  options={ENROLL_COUNTRY_OPTIONS}
                  error={Boolean(countryError)}
                  helperText={countryError}
                  className="!py-2.5 !rounded-[12px] text-[13px] bg-white cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enrollMutation.isPending || !selectedCountry}
                  className="w-full py-3.5 px-6 bg-[#0052CC] hover:bg-[#0047CC] disabled:opacity-50 text-white rounded-full font-bold text-[14px] shadow-sm cursor-pointer transition-all active:scale-[0.99]"
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Confirm & Start Learning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ CERTIFICATE MODAL ══════════════════ */}
      {certificateCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 text-center animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setCertificateCourse(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <CloseIcon size={18} />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-[#0052CC] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircleIcon size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-[#0052CC] uppercase tracking-wider">VORA Verified Certificate</span>
              <h3 className="text-[20px] sm:text-[22px] font-bold text-gray-900">Certificate of Completion</h3>
              <p className="text-[13px] text-gray-500">Awarded for successfully mastering the curriculum of</p>
              <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 pt-1 leading-snug">
                {certificateCourse.course?.title || certificateCourse.title}
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-gray-100 rounded-[16px] p-3 sm:p-4 text-[12px] text-gray-600 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Status</p>
                <p className="font-bold text-emerald-600 text-[14px]">100% Completed</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Instructor</p>
                <p className="font-bold text-gray-800 text-[13px] truncate">
                  {certificateCourse.mentor?.displayName || certificateCourse.mentor?.name || 'Verified Mentor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const shareUrl = certificateCourse.certificate?.shareableUrl || certificateCourse.cta?.downloadCertificate?.href;
                  if (shareUrl) {
                    window.open(shareUrl, '_blank');
                    toast.success('Certificate download opened');
                  } else {
                    toast.success('Certificate verified and issued');
                  }
                  setCertificateCourse(null);
                }}
                className="flex-1 py-3 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[14px] shadow-xs cursor-pointer transition-all"
              >
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursesList;
