import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AuthTopNav from '../../components/auth/AuthTopNav';
import CourseContextBanner from '../../components/auth/CourseContextBanner';
import SignupForm from '../../components/auth/SignupForm';
import AuthHeroCourse from '../../components/auth/AuthHeroCourse';
import {
  AuthPageShell,
  AuthFormCard,
} from '../../components/auth/AuthPageLayout';
import { useAuth } from '../../context/AuthContext';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';
import { usePublicCourseQuery } from '../../services/queries/courses';
import { mapCourseApiToLandingData, getCourseLandingForSlug } from '../../utils/courseLanding';
import { saveCourseEnrollContext } from '../../utils/courseSignup';
import type { PublicCourseLandingData } from '../../utils/courseLanding';

export const CourseSignup: React.FC = () => {
  const { slug = '', id = '' } = useParams<{ slug?: string; id?: string }>();
  const courseIdentifier = slug || id;
  const { isLoading: isAuthLoading } = useAuth();
  const { data: response, isLoading: isCourseLoading } = usePublicCourseQuery(courseIdentifier);

  const course: PublicCourseLandingData = useMemo(() => {
    const apiData = (response as any)?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getCourseLandingForSlug(courseIdentifier);
    }
    return mapCourseApiToLandingData(courseIdentifier, apiData);
  }, [response, courseIdentifier]);

  // Persist course enrollment context for the post-signup / OTP verification flow
  useEffect(() => {
    if (course.id) {
      saveCourseEnrollContext({
        slug: courseIdentifier,
        courseId: course.id,
        title: course.title,
        instructorName: course.instructor.name,
        thumbnailUrl: course.thumbnailUrl,
      });
    }
  }, [course, courseIdentifier]);

  const showFullPage = useFullPageLoading(isAuthLoading || isCourseLoading, false);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <AuthTopNav
        logoTo={courseIdentifier ? `/courses/${courseIdentifier}` : '/signup'}
        loginTo={courseIdentifier ? `/courses/${courseIdentifier}/login` : '/login'}
      />
      <CourseContextBanner course={course} />

      <AuthPageShell
        loading={showFullPage}
        centered={false}
        className="flex-1 !min-h-0"
        heroContent={<AuthHeroCourse category={course.category} />}
      >
        <div className="mb-3.5 sm:mb-4 text-center">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight leading-tight">
            Create your account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal max-w-sm mx-auto">
            Create your account to start learning.
          </p>
        </div>

        <AuthFormCard className="max-w-[420px]">
          <SignupForm
            courseSlug={courseIdentifier}
            showFooterLogin
            loginTo={courseIdentifier ? `/courses/${courseIdentifier}/login` : '/login'}
          />
        </AuthFormCard>
      </AuthPageShell>
    </div>
  );
};

export default CourseSignup;
