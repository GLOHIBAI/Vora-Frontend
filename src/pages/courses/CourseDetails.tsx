import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronDownIcon, 
  PlayIcon, 
  VideoIcon, 
  StarIcon, 
  XIcon, 
  LinkedinIcon, 
  InstagramIcon,
  CheckCircleIcon,
  LockIcon,
  CloseIcon 
} from '../../components/common/Icons';
import { toast } from 'react-hot-toast';
import { 
  useCourseDetail, 
  useEnrollMutation, 
  useProgressMutation 
} from '../../services/queries/courses';
import type { 
  CourseLesson 
} from '../../types/courses';
import {
  getMediaUrl,
  DEFAULT_COURSE_BANNER,
  DEFAULT_MENTOR_AVATAR,
} from '../../utils/media';

type TabType = 'overview' | 'instructor' | 'qa' | 'chapters';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryModuleId = searchParams.get('module');
  const queryLessonId = searchParams.get('lesson');

  const { data: detailData, isLoading, error } = useCourseDetail(id);
  const enrollMutation = useEnrollMutation();
  const progressMutation = useProgressMutation();

  const course = detailData?.course;
  const myEnrollment = detailData?.myEnrollment;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [countryError, setCountryError] = useState('');

  // Initialize selected lesson and expanded modules when course data loads
  useEffect(() => {
    if (!course || !course.modules || course.modules.length === 0) return;

    if (queryModuleId) {
      setExpandedModules(prev => prev.includes(queryModuleId) ? prev : [...prev, queryModuleId]);
    } else if (expandedModules.length === 0 && course.modules[0]) {
      setExpandedModules([course.modules[0].id]);
    }

    if (queryLessonId) {
      setSelectedLessonId(queryLessonId);
    } else if (!selectedLessonId) {
      const activeLesson = myEnrollment?.currentLessonId || course.modules[0]?.lessons[0]?.id;
      if (activeLesson) {
        setSelectedLessonId(activeLesson);
      }
    }

    // Populate initial completed lessons
    const completedFromModules = course.modules.flatMap(m => 
      m.lessons.filter(l => l.isCompleted).map(l => l.id)
    );
    const completedFromEnrollment = myEnrollment?.completedLessonIds || [];
    const combined = Array.from(new Set([...completedFromModules, ...completedFromEnrollment]));
    setCompletedLessonIds(prev => (prev.length > 0 ? prev : combined));
  }, [course, queryModuleId, queryLessonId, myEnrollment]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId) 
        : [...prev, moduleId]
    );
  };

  // Find currently selected lesson
  const allLessons: (CourseLesson & { moduleId: string })[] = 
    course?.modules?.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id }))) || [];
  
  const currentLesson = allLessons.find(l => l.id === selectedLessonId) || allLessons[0];

  const isCurrentLessonCompleted = Boolean(
    currentLesson && (
      currentLesson.isCompleted ||
      completedLessonIds.includes(currentLesson.id)
    )
  );

  const handleSelectLesson = (lesson: CourseLesson, moduleId: string) => {
    setSelectedLessonId(lesson.id);
    setIsPlayingVideo(true);
    setSearchParams({ module: moduleId, lesson: lesson.id });
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course?.id) return;
    if (!selectedCountry.trim()) {
      setCountryError('Please select your country of residence.');
      return;
    }
    setCountryError('');

    try {
      await enrollMutation.mutateAsync({
        courseId: course.id,
        payload: {
          declaredCountry: selectedCountry.trim(),
          ipCountry: selectedCountry.trim(),
          paymentCountry: selectedCountry.trim(),
          localeCountry: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        },
      });
      setIsEnrollModalOpen(false);
      toast.success('Successfully enrolled! You can now start learning.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to enroll in course');
    }
  };

  const handleMarkLessonComplete = async () => {
    if (!course?.id || !currentLesson) return;
    if (!myEnrollment) {
      toast.error('Please enroll in the course to record progress');
      setIsEnrollModalOpen(true);
      return;
    }

    try {
      const res = await progressMutation.mutateAsync({
        courseId: course.id,
        moduleId: currentLesson.moduleId,
        lessonId: currentLesson.id,
      });

      setCompletedLessonIds(prev => [...prev, currentLesson.id]);
      toast.success('Progress saved!');
      if (res?.isComplete || res?.isCourseCompleted) {
        toast.success('Congratulations! You completed the course!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update lesson progress');
    }
  };

  // Check if instructor has at least one valid social link
  const mentorSocial = course?.mentor?.social;
  const xLink = mentorSocial?.x || mentorSocial?.twitter;
  const linkedinLink = mentorSocial?.linkedin;
  const instagramLink = mentorSocial?.instagram;
  const hasSocialLinks = Boolean(xLink || linkedinLink || instagramLink);

  const bannerUrl = getMediaUrl(course?.thumbnailS3Key || course?.thumbnailUrl, DEFAULT_COURSE_BANNER);
  const mentorAvatar = getMediaUrl(course?.mentor?.photoS3Key || course?.mentor?.avatarUrl, DEFAULT_MENTOR_AVATAR);
  const mentorDisplayName = course?.mentor?.displayName || course?.mentor?.name || 'Mentor & Domain Expert';
  const mentorLabel = course?.mentor?.instructorLabel || course?.mentor?.headline;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1360px] mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[20px] p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-video bg-gray-200 rounded-[24px]" />
            <div className="h-10 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h2 className="text-[22px] font-bold text-gray-900">Course Not Found</h2>
        <p className="text-gray-500 text-[14px]">The course you requested could not be found or is not available.</p>
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="px-6 py-2.5 bg-[#0052CC] text-white rounded-full text-[13px] font-semibold hover:bg-[#0047CC] transition-colors cursor-pointer"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Header & Back Navigation */}
      <div className="space-y-1.5 pt-2">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Courses</h1>
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2.5 text-gray-900 hover:text-[#0052CC] transition-colors cursor-pointer bg-transparent border-none p-0 group font-bold text-[18px] max-w-full"
        >
          <ChevronLeftIcon size={20} strokeWidth={2.5} className="text-gray-700 transition-transform group-hover:-translate-x-1 shrink-0" />
          <span className="truncate max-w-[260px] sm:max-w-none">{course.title}</span>
        </button>
      </div>

      {/* Enrollment Callout Banner if not enrolled */}
      {!myEnrollment && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-[18px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-[14px] font-bold text-[#0052CC]">Previewing Course</h3>
            <p className="text-[12px] text-gray-600">
              Enroll to track lesson progress, record completion status, and earn a verified certificate.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEnrollModalOpen(true)}
            disabled={enrollMutation.isPending}
            className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0047CC] disabled:opacity-50 text-white rounded-full font-bold text-[13px] shadow-xs cursor-pointer whitespace-nowrap transition-all shrink-0"
          >
            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
          </button>
        </div>
      )}

      {/* Main 2-Column Grid with mobile-first ordering */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Lesson Outline (order-2 on mobile so video is first) */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-xs w-full">
          {/* Header */}
          <div className="bg-[#F9FAFB] px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-gray-900">Lesson Outline</h2>
            {myEnrollment && (
              <span className="text-[11px] text-[#0052CC] font-semibold">
                {myEnrollment.progressPercent}% completed
              </span>
            )}
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-gray-100">
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module, idx) => {
                const isExpanded = expandedModules.includes(module.id);
                const moduleNumber = module.orderIndex ?? module.order ?? idx + 1;
                const durationLabel = module.durationLabel || (module.durationMinutes ? `${module.durationMinutes} mins` : `${module.lessons?.length || 0} lessons`);

                return (
                  <div key={module.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-[11px] text-gray-400 font-medium">
                          Module {moduleNumber} • {durationLabel}
                        </span>
                        <h3 className="text-[13px] font-bold text-gray-900 truncate">
                          {module.title}
                        </h3>
                      </div>
                      <ChevronDownIcon 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {isExpanded && (
                      <div className="bg-white border-t border-gray-50 divide-y divide-gray-50/80 animate-in fade-in duration-200">
                        {module.lessons.map(lesson => {
                          const isSelected = selectedLessonId === lesson.id;
                          const isCompleted = lesson.isCompleted || completedLessonIds.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => handleSelectLesson(lesson, module.id)}
                              className={`w-full px-5 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#EFF6FF] border-l-4 border-[#0052CC]' 
                                  : 'hover:bg-gray-50/50'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {isCompleted ? (
                                  <CheckCircleIcon size={14} className="text-emerald-500" />
                                ) : (
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isSelected ? 'border-[#0052CC] bg-white' : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#0052CC]" />
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-0.5 min-w-0 flex-1">
                                <p className={`text-[12px] leading-snug font-medium truncate ${
                                  isSelected ? 'text-gray-900 font-semibold' : 'text-gray-700'
                                }`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                  <VideoIcon size={12} className="text-gray-400" />
                                  <span>{lesson.durationLabel || (lesson.durationMinutes ? `${lesson.durationMinutes} mins` : 'Video')}</span>
                                  {isCompleted && (
                                    <span className="text-emerald-600 font-medium ml-1">Completed</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-5 text-center text-gray-400 text-[13px]">
                No modules available.
              </div>
            )}
          </div>
        </div>

        {/* Right Main Area: Video Player & Tabs (order-1 on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-6 w-full">
          {/* Video Player Box */}
          <div className="aspect-video bg-[#E5E7EB] rounded-[24px] relative overflow-hidden shadow-xs flex items-center justify-center group cursor-pointer border border-gray-100">
            <img 
              src={bannerUrl} 
              alt="Course Video"
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
            />
            <div 
              onClick={() => setIsPlayingVideo(!isPlayingVideo)}
              className="absolute inset-0 bg-black/25 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border-2 border-white/80 text-white shadow-lg group-hover:scale-110 transition-all duration-300">
                <PlayIcon size={26} className="ml-1 fill-white" />
              </div>
              {currentLesson && (
                <span className="text-white text-[13px] font-semibold drop-shadow-md">
                  {currentLesson.title}
                </span>
              )}
            </div>
          </div>

          {/* Lesson Controls strip (when enrolled) */}
          {myEnrollment && currentLesson && (
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-[16px] px-5 py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] text-gray-400 font-medium">Selected Lesson</span>
                <p className="text-[13px] font-bold text-gray-800 truncate">{currentLesson.title}</p>
              </div>

              <button
                type="button"
                onClick={handleMarkLessonComplete}
                disabled={progressMutation.isPending || isCurrentLessonCompleted}
                className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrentLessonCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-[#0052CC] hover:bg-[#0047CC] text-white shadow-xs'
                }`}
              >
                {progressMutation.isPending 
                  ? 'Saving...' 
                  : isCurrentLessonCompleted 
                  ? '✓ Lesson Completed' 
                  : 'Mark as Completed'}
              </button>
            </div>
          )}

          {/* Underline Tabs */}
          <div className="border-b border-gray-200 flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'overview'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Course Overview
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'instructor'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Instructor&apos;s Information
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'qa'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Questions & Answer
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-3 text-[14px] transition-colors relative cursor-pointer font-medium ${
                activeTab === 'chapters'
                  ? 'text-[#0052CC] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0052CC]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Chapters
            </button>
          </div>

          {/* ══════════════════ TAB 1: COURSE OVERVIEW ══════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-[18px] font-bold text-gray-900">{course.title}</h2>

              {/* Metrics Strip (Ratings strictly hidden while null per backend contract) */}
              <div className="bg-[#EFF6FF] rounded-[16px] p-4 border border-blue-100/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 sm:divide-x sm:divide-blue-200/50">
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Skill level</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.stats?.skillLevel || course.difficultyLevel || 'All levels'}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Students</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.stats?.studentCount?.toLocaleString() || '0'}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Language</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.stats?.language || course.language || 'English'}</p>
                </div>
                <div className="sm:px-4 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Duration</p>
                  <p className="text-[13px] font-bold text-[#0052CC] mt-0.5">{course.stats?.videoHoursLabel || (course.stats?.videoMinutes ? `${course.stats.videoMinutes} mins` : 'Self-paced')}</p>
                </div>

                {course.stats?.ratings !== null && course.stats?.ratings != null && (
                  <div className="sm:px-4 text-center col-span-2 sm:col-span-1 pt-2 sm:pt-0">
                    <p className="text-[11px] text-gray-500 font-medium">Ratings</p>
                    <p className="text-[13px] font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                      <StarIcon size={13} filled className="text-amber-500" /> {course.stats.ratings}
                    </p>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <h3 className="text-[15px] font-bold text-gray-900">Description</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {course.description || course.subtitle || course.tagline}
                </p>
              </div>

              {/* Learning Outcomes Section (from Backend Spec) */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-[15px] font-bold text-gray-900">What You Will Learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {course.learningOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-gray-50/70 p-3 rounded-[12px] border border-gray-100">
                        <CheckCircleIcon size={16} className="text-[#0052CC] shrink-0 mt-0.5" />
                        <span className="text-[12px] text-gray-700 leading-snug">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites Section (from Backend Spec) */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[15px] font-bold text-gray-900">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1 text-[12px] text-gray-600 pl-1">
                    {course.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="leading-relaxed">{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills and Tags */}
              {course.skills && course.skills.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[15px] font-bold text-gray-900">Skills Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-[12px] font-medium bg-blue-50 text-[#0052CC]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Students Feedback / Reviews (Coming soon when reviews === null) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[15px] font-bold text-gray-900">Students Feedback</h3>

                {course.reviews === null ? (
                  <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-8 text-center space-y-2">
                    <p className="text-[14px] font-semibold text-gray-700">Course Reviews</p>
                    <p className="text-[12px] text-gray-400">
                      Student reviews and ratings will be available soon as learners complete this course.
                    </p>
                  </div>
                ) : Array.isArray(course.reviews) && course.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {course.reviews.map((review: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-[#FAFAFA] border border-gray-100 rounded-[18px] p-4 sm:p-5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-[13px] font-bold text-gray-900">{review.author}</h5>
                          <span className="text-[11px] text-gray-400">{review.timeAgo}</span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-6 text-center text-gray-400 text-[12px]">
                    No reviews yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════ TAB 2: INSTRUCTOR'S INFORMATION ══════════════════ */}
          {activeTab === 'instructor' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-xs bg-gray-100">
                  <img 
                    src={mentorAvatar} 
                    alt={mentorDisplayName}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[17px] font-bold text-gray-900">
                    {mentorDisplayName}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    {mentorLabel || [course.mentor?.professionalTitle, course.mentor?.organisation].filter(Boolean).join(' · ') || 'Mentor & Domain Expert'}
                  </p>

                  {/* Social links: strictly hidden while all null per backend spec */}
                  {hasSocialLinks && (
                    <div className="flex items-center gap-3 pt-1">
                      {xLink && (
                        <a 
                          href={xLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-gray-800 hover:text-black transition-colors"
                        >
                          <XIcon size={16} />
                        </a>
                      )}
                      {linkedinLink && (
                        <a 
                          href={linkedinLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0077B5] hover:opacity-80 transition-opacity"
                        >
                          <LinkedinIcon size={16} />
                        </a>
                      )}
                      {instagramLink && (
                        <a 
                          href={instagramLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#E1306C] hover:opacity-80 transition-opacity"
                        >
                          <InstagramIcon size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {course.mentor?.bio && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[14px] font-bold text-gray-900">About the Instructor</h4>
                  <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">
                    {course.mentor.bio}
                  </p>
                </div>
              )}

              {/* Expertise Tags */}
              {course.mentor?.expertiseTags && course.mentor.expertiseTags.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[14px] font-bold text-gray-900">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.mentor.expertiseTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[12px] font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB 3: QUESTIONS & ANSWER ══════════════════ */}
          {activeTab === 'qa' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {course.questions === null ? (
                <div className="bg-[#FAFAFA] border border-gray-100 rounded-[24px] p-10 sm:p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052CC] flex items-center justify-center mx-auto text-[20px]">
                    💬
                  </div>
                  <h4 className="text-[16px] font-bold text-gray-800">Community Q&A Coming Soon</h4>
                  <p className="text-[13px] text-gray-500 max-w-md mx-auto leading-relaxed">
                    Interactive discussions with mentors and fellow learners will be enabled in an upcoming release. You&apos;ll be able to ask module-specific questions and share solutions.
                  </p>
                </div>
              ) : Array.isArray(course.questions) && course.questions.length > 0 ? (
                <div className="space-y-3">
                  {course.questions.map((q: any) => (
                    <div
                      key={q.id}
                      className="bg-[#FAFAFA] border border-gray-100 rounded-[18px] p-4 sm:p-5 space-y-2"
                    >
                      <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{q.title}</h4>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{q.preview}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-8 text-center text-gray-400 text-[13px]">
                  No questions yet.
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ TAB 4: ALL CHAPTERS ══════════════════ */}
          {activeTab === 'chapters' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module, idx) => {
                  const enrollmentChapter = myEnrollment?.chapters?.find(c => c.moduleId === module.id);
                  const status = enrollmentChapter?.status?.toLowerCase();
                  const isCompleted = status === 'completed';
                  const isOngoing = status === 'ongoing';
                  const isUpcoming = status === 'upcoming';
                  const moduleNumber = module.orderIndex ?? module.order ?? idx + 1;
                  const durationLabel = module.durationLabel || (module.durationMinutes ? `${module.durationMinutes} mins` : '');

                  return (
                    <div
                      key={module.id}
                      onClick={() => {
                        const firstLesson = module.lessons[0];
                        if (firstLesson) {
                          handleSelectLesson(firstLesson, module.id);
                        }
                      }}
                      className="bg-white border border-gray-100 rounded-[18px] p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-100 hover:bg-gray-50/50 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                        <div className="relative w-24 h-16 sm:w-28 sm:h-20 rounded-[14px] overflow-hidden shrink-0 bg-gray-900 border border-gray-100 group">
                          <img 
                            src={bannerUrl} 
                            alt={module.title} 
                            className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/80 text-white">
                              {isUpcoming ? (
                                <LockIcon size={12} className="text-white" />
                              ) : (
                                <PlayIcon size={14} className="ml-0.5 fill-white" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <span className="text-[11px] text-gray-400 font-medium">
                            Module {moduleNumber}{durationLabel ? ` • ${durationLabel}` : ''}
                          </span>
                          <h4 className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-snug truncate">
                            {module.title}
                          </h4>
                          <div className="pt-0.5 flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 font-medium">
                              {module.lessons?.length || module.lessonCount || 0} lessons
                            </span>

                            {isCompleted && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Completed
                              </span>
                            )}
                            {isOngoing && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-100">
                                Ongoing
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-[#0052CC] font-bold text-[13px] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors hidden sm:block"
                      >
                        {isCompleted ? 'Review' : 'Play'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400">
                  Chapters outline available in Lesson Outline.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════ ENROLL CONFIRMATION MODAL ══════════════════ */}
      {isEnrollModalOpen && course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-7 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-[20px] font-bold text-gray-900">Confirm Enrollment</h3>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
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
                  <p className="font-bold text-gray-900">{course.title}</p>
                  <p className="text-gray-500 text-[12px]">Instructor: {mentorDisplayName}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  Included
                </span>
              </div>
              <div className="border-t border-gray-200/80 pt-2 space-y-1 text-[12px] text-gray-500">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-gray-900 font-medium">
                    {course.formatLabel || course.format?.replace(/_/g, ' ') || 'Masterclass'}
                  </span>
                </div>
                {course.stats?.videoHoursLabel && (
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-gray-900 font-medium">{course.stats.videoHoursLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-5">
              {/* Country Selection (PPP Body fields) */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-900">Country of Residence</label>
                <p className="text-[11px] text-gray-400">Used to localize your learning path and certificate</p>
                <select
                  value={selectedCountry}
                  onChange={e => {
                    setSelectedCountry(e.target.value);
                    if (countryError) setCountryError('');
                  }}
                  className={`w-full px-4 py-2.5 rounded-[12px] border text-[13px] focus:outline-none bg-white cursor-pointer transition-colors ${
                    countryError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0052CC]'
                  }`}
                >
                  <option value="">Select country...</option>
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
                {countryError && (
                  <p className="text-[11px] text-red-500 font-medium">{countryError}</p>
                )}
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
    </div>
  );
};

export default CourseDetails;
