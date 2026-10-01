import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayIcon, 
  CloseIcon, 
  StarIcon,
  CheckCircleIcon
} from '../../components/common/Icons';
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

type TabType = 'ongoing' | 'completed' | 'recommended';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

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

  const ongoingCourses: EnrollmentItem[] = enrollmentsData?.ongoing || [];
  const completedCourses: EnrollmentItem[] = enrollmentsData?.completed || [];
  const recommendedItems: CourseBrowseItem[] = recommendedData?.items || [];

  const masterclassCourses = recommendedItems.filter(c => c.isMasterclass);
  const catalogCourses = recommendedItems.filter(c => !c.isMasterclass);

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

      {/* Tabs: Ongoing courses | Completed courses | Recommended courses */}
      <div className="border-b border-gray-200 flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
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
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
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
          className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
            activeTab === 'recommended'
              ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Recommended courses
        </button>
      </div>

      {/* ══════════════════ TAB 1: ONGOING COURSES ══════════════════ */}
      {activeTab === 'ongoing' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isLoadingEnrollments ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-[24px] p-6 animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-32 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : ongoingCourses.length === 0 ? (
            <div className="text-center py-16 bg-[#FAFAFA] rounded-[24px] border border-gray-100 space-y-3">
              <p className="text-gray-500 text-[15px] font-medium">You have no active ongoing courses.</p>
              <button
                type="button"
                onClick={() => setActiveTab('recommended')}
                className="px-6 py-2.5 bg-[#0052CC] text-white rounded-full text-[13px] font-semibold hover:bg-[#0047CC] transition-colors cursor-pointer"
              >
                Explore Recommended Courses
              </button>
            </div>
          ) : (
            ongoingCourses.map(course => (
              <div
                key={course.enrollmentId}
                className="bg-white border border-gray-100 rounded-[24px] p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 shadow-xs hover:border-blue-100 transition-all"
              >
                {/* Header Row: Instructor Avatar + Info + Resume Button */}
                <div className="order-2 sm:order-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 bg-gray-100">
                      <img
                        src={course.mentor?.avatarUrl || DEFAULT_AVATAR}
                        alt={course.mentor?.name || 'Instructor'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 leading-tight">
                        {course.mentor?.name || 'Course Instructor'}
                      </h3>
                      <h4 className="text-[13px] sm:text-[14px] font-semibold text-gray-700">
                        {course.title}
                      </h4>
                      {course.mentor?.instructorLabel && (
                        <p className="text-[11px] text-gray-400 font-medium">
                          {course.mentor.instructorLabel}
                        </p>
                      )}
                      {course.cta?.resumeLesson?.lessonTitle && (
                        <p className="text-[12px] text-[#0052CC] font-semibold pt-0.5">
                          Current Lesson • {course.cta.resumeLesson.lessonTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resume Course Button */}
                  <div className="shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenCourse(course.courseId, course.cta?.resumeLesson?.href)}
                      className="w-full sm:w-auto px-7 py-3 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-semibold text-[14px] shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                    >
                      {course.progressPercent > 0 ? 'Resume course' : 'Start course'}
                    </button>
                  </div>
                </div>

                {/* Progress Strip */}
                <div className="order-3 sm:order-2 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-600 font-medium">
                      {course.progressLabel || `${course.progressPercent}% completed`}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {course.statusLabel || 'In Progress'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0052CC] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }}
                    />
                  </div>
                </div>

                {/* Wide Video Banner with "Watch lesson" overlay */}
                <div
                  onClick={() => handleOpenCourse(course.courseId, course.cta?.resumeLesson?.href)}
                  className="order-1 sm:order-3 relative aspect-16/9 sm:aspect-21/9 md:aspect-24/9 rounded-[20px] overflow-hidden group cursor-pointer shadow-xs border border-gray-100 bg-gray-100"
                >
                  <img
                    src={course.thumbnailUrl || DEFAULT_BANNER}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <PlayIcon size={22} className="ml-0.5 fill-white" />
                    </div>
                    <span className="text-white text-[12px] sm:text-[13px] font-semibold drop-shadow-sm">
                      {course.progressPercent > 0 ? 'Continue learning' : 'Start lesson'}
                    </span>
                  </div>
                </div>
              </div>
            ))
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
            <div className="text-center py-16 bg-[#FAFAFA] rounded-[24px] border border-gray-100 space-y-3">
              <p className="text-gray-500 text-[15px] font-medium">You have no completed courses yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('recommended')}
                className="px-6 py-2.5 bg-[#0052CC] text-white rounded-full text-[13px] font-semibold hover:bg-[#0047CC] transition-colors cursor-pointer"
              >
                Explore Courses
              </button>
            </div>
          ) : (
            completedCourses.map(course => (
              <div
                key={course.enrollmentId}
                className="bg-white border border-gray-100/90 rounded-[20px] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-100 transition-all"
              >
                {/* Left Portion: Thumbnail + Meta + Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  <div 
                    onClick={() => handleOpenCourse(course.courseId)}
                    className="w-full sm:w-36 h-28 rounded-[14px] overflow-hidden shrink-0 relative group cursor-pointer border border-gray-100 bg-gray-100"
                  >
                    <img
                      src={course.thumbnailUrl || DEFAULT_BANNER}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/70 shadow-sm text-white">
                        <PlayIcon size={14} className="ml-0.5 fill-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3
                      onClick={() => handleOpenCourse(course.courseId)}
                      className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate hover:text-[#0052CC] transition-colors cursor-pointer"
                    >
                      {course.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 truncate">
                      {course.mentor?.name || 'Instructor'}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="pt-1.5">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {course.progressLabel || '100% completed'}
                      </span>
                      <div className="w-full max-w-[260px] h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#0052CC] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, course.progressPercent || 100))}%` }}
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
                      {course.statusLabel || 'Completed'}
                    </div>
                  </div>

                  {course.cta?.downloadCertificate?.enabled ? (
                    <button
                      type="button"
                      onClick={() => setCertificateCourse(course)}
                      className="w-full sm:w-auto bg-[#0052CC] hover:bg-[#0047CC] text-white px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                    >
                      Download certificate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCourse(course.courseId)}
                      className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-all"
                    >
                      Review Course
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════ TAB 3: RECOMMENDED COURSES ══════════════════ */}
      {activeTab === 'recommended' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Hero Banner: Gain Experience from the World's Best */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 md:p-12 border border-gray-200/80 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="space-y-3 max-w-md z-10 w-full text-center lg:text-left">
              <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                Gain Experience <br className="hidden sm:inline" />
                from the <br className="hidden sm:inline" />
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

          {/* Section 1: Masterclasses (filtered from API items) */}
          {!isLoadingRecommended && masterclassCourses.length > 0 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">
                  Masterclasses
                </h3>
                <p className="text-[13px] text-gray-500">
                  Comprehensive masterclasses led by domain leaders shaping their fields worldwide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {masterclassCourses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => setPreviewCourse(course)}
                    className="group cursor-pointer space-y-3"
                  >
                    <div className="aspect-4/5 rounded-[22px] overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300 bg-gray-900">
                      <img
                        src={course.thumbnailUrl || DEFAULT_BANNER}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                        <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                          Masterclass
                        </span>
                        <h4 className="text-[16px] font-bold leading-snug pt-1">
                          {course.title}
                        </h4>
                        <p className="text-[12px] text-gray-300 line-clamp-2 pt-1 font-normal">
                          {course.tagline}
                        </p>
                        <p className="text-[11px] text-gray-400 pt-2 font-medium">
                          {course.mentor?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Catalog / Curated Courses from API */}
          {!isLoadingRecommended && (
            <div className="space-y-5">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">
                Recommended for you
              </h3>

              {catalogCourses.length === 0 && masterclassCourses.length === 0 ? (
                <div className="text-center py-16 bg-[#FAFAFA] rounded-[24px] border border-gray-100">
                  <p className="text-gray-500 text-[14px]">No recommended courses currently available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(catalogCourses.length > 0 ? catalogCourses : masterclassCourses).map(course => (
                    <div
                      key={course.id}
                      className="bg-white border border-gray-100 rounded-[22px] overflow-hidden shadow-xs flex flex-col hover:border-blue-100 hover:shadow-md transition-all duration-300 group"
                    >
                      {/* Thumbnail with Play button */}
                      <div 
                        onClick={() => setPreviewCourse(course)}
                        className="w-full aspect-16/9 overflow-hidden relative group cursor-pointer bg-gray-100"
                      >
                        <img
                          src={course.thumbnailUrl || DEFAULT_BANNER}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/35">
                          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md group-hover:scale-110 transition-transform">
                            <PlayIcon size={18} className="ml-0.5 fill-white" />
                          </div>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 
                            onClick={() => setPreviewCourse(course)}
                            className="text-[15px] sm:text-[16px] font-bold text-gray-900 leading-snug group-hover:text-[#0052CC] transition-colors cursor-pointer"
                          >
                            {course.title}
                          </h4>
                          <p className="text-[12px] text-gray-500 font-medium">
                            {course.mentor?.name}
                            {course.mentor?.instructorLabel ? ` (${course.mentor.instructorLabel})` : ''}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            {course.stats?.videoHoursLabel && (
                              <span>{course.stats.videoHoursLabel}</span>
                            )}
                            {course.stats?.ratings !== null && course.stats?.ratings?.average != null && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                  ★ {course.stats.ratings.average} 
                                  {course.stats.ratings.count ? (
                                    <span className="text-gray-400 font-normal">({course.stats.ratings.count} reviews)</span>
                                  ) : null}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Dynamic Pills */}
                          {course.pills && course.pills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {course.pills.map((pill, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600"
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          {course.enrolled ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCourse(course.id)}
                              className="text-[12px] font-bold text-[#0052CC] hover:text-[#003d99] flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              Go to course →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPreviewCourse(course)}
                              className="text-[12px] font-bold text-[#0052CC] hover:text-[#003d99] flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              Take this course →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Video Banner */}
            <div className="relative h-44 sm:h-52 w-full bg-gray-900 shrink-0 overflow-hidden">
              <img
                src={previewCourse.thumbnailUrl || DEFAULT_BANNER}
                alt={previewCourse.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center gap-1.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-md">
                  <PlayIcon size={18} className="ml-0.5 fill-white" />
                </div>
                <span className="text-white text-[12px] font-semibold drop-shadow-sm">
                  Course Preview
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <img
                      src={previewCourse.mentor?.avatarUrl || DEFAULT_AVATAR}
                      alt={previewCourse.mentor?.name || 'Instructor'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                      {previewCourse.mentor?.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {previewCourse.mentor?.instructorLabel || previewCourse.mentor?.headline || 'Instructor'}
                    </p>
                  </div>
                </div>

                {previewCourse.enrolled ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCourse(null);
                      handleOpenCourse(previewCourse.id);
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
                  {previewCourse.tagline}
                </p>
              </div>

              {/* Pills & Format */}
              <div className="flex flex-wrap gap-2 pt-1">
                {previewCourse.formatLabel && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC]">
                    {previewCourse.formatLabel}
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
                  <p className="text-gray-500 text-[12px]">Instructor: {enrollCourse.mentor?.name}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  Included
                </span>
              </div>
              <div className="border-t border-gray-200/80 pt-2 space-y-1 text-[12px] text-gray-500">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-gray-900 font-medium">{enrollCourse.formatLabel}</span>
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
              {/* Country Selection */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Country of Residence</label>
                <p className="text-[11px] text-gray-400">Used to localize your learning path and certificate</p>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-[13px] focus:outline-none focus:border-[#0052CC] bg-white cursor-pointer"
                >
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="NG">Nigeria (NG)</option>
                  <option value="GH">Ghana (GH)</option>
                  <option value="KE">Kenya (KE)</option>
                  <option value="ZA">South Africa (ZA)</option>
                  <option value="IN">India (IN)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="FR">France (FR)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enrollMutation.isPending}
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
              <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 pt-1 leading-snug">{certificateCourse.title}</p>
            </div>

            <div className="bg-[#F8FAFC] border border-gray-100 rounded-[16px] p-3 sm:p-4 text-[12px] text-gray-600 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Status</p>
                <p className="font-bold text-emerald-600 text-[14px]">100% Completed</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-[11px]">Instructor</p>
                <p className="font-bold text-gray-800 text-[13px] truncate">{certificateCourse.mentor?.name || 'Verified Mentor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Certificate download initiated');
                  setCertificateCourse(null);
                }}
                className="flex-1 py-3 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-bold text-[14px] shadow-xs cursor-pointer transition-all"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursesList;
