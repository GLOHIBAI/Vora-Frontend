import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicCourseNav from '../../components/courseLanding/PublicCourseNav';
import CourseShareModal from '../../components/courses/CourseShareModal';
import CoursePreviewVideoModal from '../../components/courses/CoursePreviewVideoModal';
import UniversalVideoPlayer from '../../components/common/UniversalVideoPlayer';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import Button from '../../components/common/Button';
import {
  BookOpenIcon,
  ClockIcon,
  GraduationCapIcon,
  GlobeIcon,
  CheckIcon,
  ChevronDownIcon,
  ShareIcon,
  ShieldIcon,
  PlayIcon,
  LockIcon,
  CloseIcon,
} from '../../components/common/Icons';
import { usePublicCourseQuery, useEnrollMutation } from '../../services/queries/courses';
import {
  mapCourseApiToLandingData,
  getCourseLandingForSlug,
  type PublicCourseLandingLesson,
} from '../../utils/courseLanding';
import { saveCourseEnrollContext } from '../../utils/courseSignup';
import {
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  isGoogleDriveUrl,
  getGoogleDriveEmbedUrl,
  displayMedia,
} from '../../utils/media';
import CourseRelatedJobs from '../../components/courses/CourseRelatedJobs';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const CourseLanding: React.FC = () => {
  const { slug = '', id = '' } = useParams<{ slug?: string; id?: string }>();
  const courseIdentifier = slug || id;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: response, isLoading } = usePublicCourseQuery(courseIdentifier);
  const enrollMutation = useEnrollMutation();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activePreviewLesson, setActivePreviewLesson] = useState<PublicCourseLandingLesson | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | number | null>('m1');

  const course = useMemo(() => {
    const apiData = (response as any)?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getCourseLandingForSlug(courseIdentifier);
    }
    return mapCourseApiToLandingData(courseIdentifier, apiData);
  }, [response, courseIdentifier]);

  const myEnrollment = response?.myEnrollment || (response as any)?.course?.myEnrollment;
  const isEnrolled = Boolean(myEnrollment);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PublicCourseNav courseSlug={courseIdentifier} />
        <div className="flex items-center justify-center pt-32">
          <FullPageSpinner isFullPage={false} />
        </div>
      </div>
    );
  }

  const handleEnrollClick = async () => {
    // 1. If user is logged in
    if (isAuthenticated && user) {
      if (isEnrolled) {
        navigate(`/courses/${course.id}`);
        return;
      }

      try {
        await enrollMutation.mutateAsync({
          courseId: course.id,
          payload: {
            paymentCountry: 'US',
            declaredCountry: 'US',
          },
        });
        toast.success(`Successfully enrolled in "${course.title}"!`);
        navigate(`/courses/${course.id}`);
      } catch (err: any) {
        toast.error(err?.message || 'Could not enroll in course. Please try again.');
      }
      return;
    }

    // 2. If guest / external user: save course context and go to lightweight signup
    saveCourseEnrollContext({
      slug: courseIdentifier,
      courseId: course.id,
      title: course.title,
      instructorName: course.instructor.name,
      thumbnailUrl: course.thumbnailUrl,
    });

    navigate(`/courses/${courseIdentifier}/signup`);
  };

  const toggleModule = (modId: string | number) => {
    setExpandedModuleId((prev) => (prev === modId ? null : modId));
  };

  const openPreviewVideo = (lesson?: PublicCourseLandingLesson) => {
    setActivePreviewLesson(lesson || null);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <div>
        <PublicCourseNav courseSlug={courseIdentifier} />

        {/* Top Breadcrumb & Share Strip */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 min-w-0">
            <Link to="/courses" className="hover:text-[#0047CC] transition-colors shrink-0">
              Courses
            </Link>
            <span>/</span>
            <span
              className="text-slate-700 font-semibold truncate max-w-[280px] sm:max-w-md"
              title={course.title}
            >
              {course.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <ShareIcon size={13} className="text-slate-500" />
            <span>Share</span>
          </button>
        </div>

        {/* Unified 2-Column Grid: Hero & Content on Left, Sticky Card on Right */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Hero Header + Flattened Content Sections */}
            <div className="min-w-0">
              
              {/* Hero Header Area */}
              <div className="space-y-4">
                {/* Meta Tags with Unified Height */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-6 px-2.5 inline-flex items-center text-xs font-semibold rounded-md bg-blue-50 text-[#0047CC] border border-blue-200/60">
                    {course.category}
                  </span>
                  <span className="h-6 px-2.5 inline-flex items-center text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                    {course.format}
                  </span>
                  <span className="h-6 px-2.5 inline-flex items-center text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                    {course.level}
                  </span>
                </div>

                {/* Course Title: Semibold at 36-40px, line-height 1.2, clamped to 2 lines */}
                <h1
                  className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.2] line-clamp-2"
                  title={course.title}
                >
                  {course.title}
                </h1>

                {/* Subtitle / Headline */}
                {course.headline && (
                  <p className="text-base text-slate-600 leading-relaxed font-normal">
                    {course.headline}
                  </p>
                )}

                {/* Instructor Row */}
                <div className="pt-1 flex items-center gap-3">
                  {course.instructor.avatarUrl ? (
                    <img
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {course.instructor.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">Taught by</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {course.instructor.name}
                      </span>
                    </div>
                    <p
                      className="text-xs text-slate-600 leading-snug line-clamp-2"
                      title={`${course.instructor.title}${course.instructor.organisation ? ` · ${course.instructor.organisation}` : ''}`}
                    >
                      {course.instructor.title}
                      {course.instructor.organisation ? ` · ${course.instructor.organisation}` : ''}
                    </p>
                  </div>
                </div>

                {/* Highlights Meta Row: Gray icons, consistent spacing, wraps cleanly */}
                <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon size={15} className="text-slate-400 shrink-0" />
                    <span>{course.durationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpenIcon size={15} className="text-slate-400 shrink-0" />
                    <span>{course.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GlobeIcon size={15} className="text-slate-400 shrink-0" />
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCapIcon size={15} className="text-slate-400 shrink-0" />
                    <span>Verifiable Certificate</span>
                  </div>
                </div>
              </div>

              {/* Flattened Content Sections: Separated by Clean Dividers & Whitespace */}
              <div className="mt-10 space-y-10">
                {/* About this Course */}
                {course.description && (
                  <section className="pt-8 border-t border-slate-200/80">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                      About this course
                    </h2>
                    <p className="text-base text-slate-700 leading-relaxed max-w-2xl whitespace-pre-line">
                      {course.description}
                    </p>
                  </section>
                )}

                {/* What You Will Learn: Flattened 2-Column List with no inner box-in-box backgrounds */}
                {course.learningOutcomes.length > 0 && (
                  <section className="pt-8 border-t border-slate-200/80">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                      What you will learn
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 max-w-2xl">
                      {course.learningOutcomes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckIcon size={17} className="text-[#0047CC] shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700 font-medium leading-relaxed">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Course Curriculum */}
                {course.modules.length > 0 && (
                  <section className="pt-8 border-t border-slate-200/80">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                        Course curriculum
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {course.modules.length} modules · {course.lessonsCount} lessons · {course.durationLabel} total length
                      </p>
                    </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                    {course.modules.map((module, mIdx) => {
                      const isExpanded = expandedModuleId === module.id;
                      return (
                        <div key={module.id} className="transition-all">
                          <button
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className="w-full px-5 py-4 bg-white hover:bg-slate-50/80 flex items-center justify-between text-left transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047CC]"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                              <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                                {mIdx + 1}
                              </span>
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {module.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {module.durationLabel && (
                                <span className="text-xs font-medium text-slate-600 hidden sm:inline-block tabular-nums">
                                  {module.durationLabel}
                                </span>
                              )}
                              <ChevronDownIcon
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="bg-slate-50/60 divide-y divide-slate-100 border-t border-slate-100">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {lesson.isFreePreview ? (
                                      <button
                                        type="button"
                                        onClick={() => openPreviewVideo(lesson)}
                                        className="inline-flex items-center gap-2 text-left group/preview cursor-pointer"
                                      >
                                        <PlayIcon size={14} className="text-[#0047CC] shrink-0" />
                                        <span className="text-slate-900 font-medium group-hover/preview:text-[#0047CC] transition-colors truncate">
                                          {lesson.title}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 shrink-0">
                                          Preview
                                        </span>
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <LockIcon size={14} className="text-slate-400 shrink-0" />
                                        <span className="text-slate-700 font-medium truncate">
                                          {lesson.title}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {lesson.durationLabel && (
                                    <span className="text-xs font-medium text-slate-600 shrink-0 tabular-nums">
                                      {lesson.durationLabel}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
                )}

                {/* Meet Your Instructor */}
                <section className="pt-8 border-t border-slate-200/80">
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                    Meet your instructor
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                    {course.instructor.avatarUrl ? (
                      <img
                        src={course.instructor.avatarUrl}
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#0047CC] text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {course.instructor.initials}
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {course.instructor.name}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {course.instructor.title}
                          {course.instructor.organisation ? ` · ${course.instructor.organisation}` : ''}
                        </p>
                      </div>
                      {course.instructor.bio && (
                        <p className="text-base text-slate-700 leading-relaxed max-w-2xl mt-2">
                          {course.instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Requirements & Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <section className="pt-8 border-t border-slate-200/80">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                      Requirements &amp; Prerequisites
                    </h2>
                    <ul className="space-y-2.5 text-base text-slate-700 list-disc list-inside max-w-2xl">
                      {course.prerequisites.map((req, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Floating Enrollment Card (CSS Sticky across sections) */}
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
                
                {/* 16:9 Clean Thumbnail with Centered Play Button & Bottom-Left Label */}
                <div
                  onClick={() => openPreviewVideo()}
                  className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 group cursor-pointer border border-slate-200 shadow-2xs"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openPreviewVideo();
                    }
                  }}
                  aria-label="Play course preview video"
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-85">
                      <div className="text-center p-4">
                        <GraduationCapIcon size={32} className="text-white/40 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-white/70 block">
                          VORA Academy Masterclass
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Single Clean Centered 56px Play Button */}
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white text-[#0047CC] shadow-lg flex items-center justify-center group-hover:scale-108 transition-transform">
                      <PlayIcon size={24} className="translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom-left small chip */}
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium tracking-wide">
                    Course Preview
                  </span>
                </div>

                {/* Enrolled Progress State (If user is already enrolled) */}
                {isEnrolled && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Course Progress</span>
                      <span className="text-[#0047CC]">Enrolled</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-blue-200/60 overflow-hidden">
                      <div className="h-full bg-[#0047CC] rounded-full w-1/4" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pick up right where you left off.
                    </p>
                  </div>
                )}

                {/* Main CTA Button */}
                <Button
                  variant="primary"
                  size="lg"
                  pill={false}
                  fullWidth
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                  className="rounded-xl font-bold text-sm shadow-xs h-12 cursor-pointer"
                >
                  {enrollMutation.isPending ? (
                    'Enrolling...'
                  ) : isEnrolled ? (
                    'Continue Learning'
                  ) : isAuthenticated ? (
                    'Enroll in Course'
                  ) : (
                    'Enroll Now · Start Learning'
                  )}
                </Button>

                {/* "New to VORA?" Reassurance Box (Blue theme, blue icon, 13-14px text, bold lead-in) */}
                {!isAuthenticated && (
                  <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-100 flex items-start gap-2.5">
                    <ShieldIcon size={16} className="text-[#0047CC] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-blue-950 leading-snug">
                      <strong className="font-semibold text-[#0047CC]">New to VORA?</strong> Fast 30-second setup. No visa checks, CV parsing, or multi-stage tests required for talents.
                    </p>
                  </div>
                )}

                {/* Benefit Checklist: Blue icons, 14px darker text */}
                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-[#0047CC] shrink-0" />
                    <span>Full lifetime access to course content</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-[#0047CC] shrink-0" />
                    <span>Verifiable certificate upon completion</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-[#0047CC] shrink-0" />
                    <span>Direct discussion &amp; feedback from mentor</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckIcon size={16} className="text-[#0047CC] shrink-0" />
                    <span>Accessible on desktop, tablet, and mobile</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Full-Width Career Pathways & Verified Roles Section (Spans all 12 columns, zero dead space) */}
        <section className="border-t border-slate-200/80 bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CourseRelatedJobs
              courseTitle={course.title}
              category={course.category}
              courseId={course.id}
              qualifyingJobs={course.qualifyingJobs}
            />
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Enroll Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-white border-t border-slate-200 shadow-xl z-40 flex items-center">
        <Button
          variant="primary"
          size="md"
          fullWidth
          pill={false}
          onClick={handleEnrollClick}
          disabled={enrollMutation.isPending}
          className="rounded-xl font-semibold text-xs sm:text-sm h-11 shadow-xs"
        >
          {isEnrolled ? 'Continue' : 'Enroll Now · Start Learning'}
        </Button>
      </div>

      {/* Discreet Copyright Line (Clean finish, no clunky marketing footer) */}
      <div className="py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} VORA Academy. All rights reserved.
      </div>

      {/* Course Preview Video Modal (Portaled, z-[9999], scroll-locked, custom controls & light footer) */}
      <CoursePreviewVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        courseTitle={course.title}
        lessonTitle={activePreviewLesson?.title}
        videoUrl={activePreviewLesson?.videoUrl || course.previewVideoUrl || ''}
        posterUrl={course.thumbnailUrl}
        totalDurationLabel={course.durationLabel}
        isEnrolled={isEnrolled}
        onEnroll={handleEnrollClick}
      />

      {/* Share Modal Dialog */}
      <CourseShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        slug={course.slug}
        status="PUBLISHED"
        thumbnailUrl={course.thumbnailUrl}
      />
    </div>
  );
};

export default CourseLanding;
