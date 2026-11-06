import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import ProtectedDashboardLayout from '../../layout/ProtectedDashboardLayout';

const CourseLanding = lazy(() => import('../public/CourseLanding'));
const CourseDetails = lazy(() => import('./CourseDetails'));

/**
 * Smart Course Route handler for `vora.ai/courses/:slugOrId`.
 * - If user is not authenticated (external guest / public visitor): Renders the public Course Landing Page.
 * - If user is authenticated: Renders the authenticated Course Learning Player inside DashboardLayout.
 */
export const CourseViewRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If visiting an external course without completed talent profile, ensure learner track is set
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const isTalent = user.role?.toLowerCase() === 'talent' || user.role?.toLowerCase() === 'learner';
      const isComplete = Boolean((user as any)?.isOnboardingComplete || (user as any)?.onboardingCompleted);
      if (isTalent && !isComplete) {
        try {
          localStorage.setItem('vora_user_track', 'learner');
        } catch {}
      }
    }
  }, [isAuthenticated, user]);
  const { id, slug } = useParams<{ id?: string; slug?: string }>();

  if (isLoading) {
    return <FullPageSpinner isFullPage message="Loading course..." />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<FullPageSpinner isFullPage message="Loading course preview..." />}>
        <CourseLanding />
      </Suspense>
    );
  }

  // If authenticated external learner has not completed the learner onboarding page, send them there
  const isLearnerOnboardingDone =
    (user as any)?.isLearnerOnboardingComplete === true ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('vora_learner_onboarding_completed') === 'true');

  const isComplete = Boolean((user as any)?.isOnboardingComplete || (user as any)?.onboardingCompleted);
  const isTalentUser = !user?.role || user?.role?.toLowerCase() === 'talent' || user?.role?.toLowerCase() === 'learner';

  if (isTalentUser && !isLearnerOnboardingDone && !isComplete) {
    return <Navigate to="/onboarding/learner" replace />;
  }

  return (
    <ProtectedDashboardLayout>
      <Suspense fallback={<FullPageSpinner isFullPage message="Loading course..." />}>
        <CourseDetails />
      </Suspense>
    </ProtectedDashboardLayout>
  );
};

export default CourseViewRouter;

