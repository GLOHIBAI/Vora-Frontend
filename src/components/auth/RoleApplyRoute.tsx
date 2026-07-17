import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTalentOnboardingStateQuery } from '../../services/queries/onboarding';
import FullPageSpinner from '../common/FullPageSpinner';

const RoleApplyRoute: React.FC = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const { user } = useAuth();
  const { data: stateData, isLoading, error } = useTalentOnboardingStateQuery(!!user);

  if (!user) {
    return <Navigate to={`/role/${roleSlug}/login`} replace />;
  }

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F7] p-6 text-center">
        <div className="w-[80px] h-[80px] rounded-full bg-[#FEE2E2] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Connection Issues</h1>
        <p className="text-sm text-[#666] max-w-sm mb-6 leading-relaxed">
          We encountered a connection issue while fetching your profile state. Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#0047CC] hover:bg-[#344DA1] text-white font-bold rounded-lg shadow-sm transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const step = stateData?.data?.step || 0;
  const onboardingCompleted = stateData?.data?.onboardingCompleted === true;
  const activeCvStatus = stateData?.data?.activeCv?.parseStatus || stateData?.data?.applyContext?.parseStatus;

  // Step 1: Ensure user has completed basic demographic onboarding (Steps 1 & 2).
  // We treat step >= 2 as "done enough" because onboardingCompleted is optional in the
  // API response and may come back undefined even for fully-onboarded users.
  const isOnboardingDone = onboardingCompleted || step >= 2;
  if (!isOnboardingDone) {
    // If they haven't finished basic onboarding, bump them back to the general onboarding screen
    return <Navigate to={`/onboarding/talent?step=${step + 1}`} replace />;
  }

  // We expose the activeCvStatus via Outlet context so child routes can do additional filtering if needed.
  return <Outlet context={{ activeCvStatus, roleSlug }} />;
};

export default RoleApplyRoute;
