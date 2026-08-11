import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import ProtectedDashboardLayout from './layout/ProtectedDashboardLayout'
import EmployerRoute from './components/auth/EmployerRoute'
import { Toaster, toast } from 'react-hot-toast'
import { defaultToastOptions } from './config/toastOptions'
import FullPageSpinner from './components/common/FullPageSpinner'
import { useOnlineStatus } from './hooks/useOnlineStatus'

/** Redirect legacy /assessment/* paths to /interview/* (stage-1 intro kept distinct). */
const AssessmentToInterviewRedirect = () => {
  const location = useLocation();
  let nextPath = location.pathname.replace('/assessment/', '/interview/');
  if (/\/interview\/stage-1$/.test(nextPath)) {
    nextPath = `${nextPath}/intro`;
  }
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const Login = lazy(() => import('./pages/auth/Login'))
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'))
const EmployerOnboarding = lazy(() => import('./pages/employer/EmployerOnboarding'))
const TalentOnboarding = lazy(() => import('./pages/talent/TalentOnboarding'))
const RoleCvUpload = lazy(() => import('./pages/talent/RoleCvUpload'))
const RoleProfileMatchBuilding = lazy(() => import('./pages/talent/RoleProfileMatchBuilding'))
const RoleProfileMatchResult = lazy(() => import('./pages/talent/RoleProfileMatchResult'))
const RoleEmployerAsks = lazy(() => import('./pages/talent/RoleEmployerAsks'))
const RoleAssessmentGate1Active = lazy(() => import('./pages/talent/RoleAssessmentGate1Active'))
const RoleAssessmentGate1Review = lazy(() => import('./pages/talent/RoleAssessmentGate1Review'))
const RoleAssessmentGate1Verdict = lazy(() => import('./pages/talent/RoleAssessmentGate1Verdict'))
const RoleAssessmentIntro = lazy(() => import('./pages/talent/RoleAssessmentIntro'))
const RoleAssessmentSessionInfo = lazy(() => import('./pages/talent/RoleAssessmentSessionInfo'))
const RoleAssessmentJourney = lazy(() => import('./pages/talent/RoleAssessmentJourney'))
const RoleAssessmentSessionPsychometric = lazy(() => import('./pages/talent/RoleAssessmentSessionPsychometric'))
const RoleAssessmentSessionForcedChoice = lazy(() => import('./pages/talent/RoleAssessmentSessionForcedChoice'))
const RoleAssessmentSessionPsychometricValues = lazy(() => import('./pages/talent/RoleAssessmentSessionPsychometricValues'))
const RoleAssessmentSessionSituational = lazy(() => import('./pages/talent/RoleAssessmentSessionSituational'))
const RoleAssessmentSessionCognitive = lazy(() => import('./pages/talent/RoleAssessmentSessionCognitive'))
const RoleAssessmentSessionReading = lazy(() => import('./pages/talent/RoleAssessmentSessionReading'))
const RoleAssessmentSessionComplete = lazy(() => import('./pages/talent/RoleAssessmentSessionComplete'))
const RoleAssessmentSessionTwoInfo = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoInfo'))
const RoleAssessmentSessionTwoSituational = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoSituational'))
const RoleAssessmentSessionTwoRanking = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoRanking'))
const RoleAssessmentSessionTwoBestWorst = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoBestWorst'))
const RoleAssessmentSessionTwoCombine = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoCombine'))
const RoleAssessmentSessionTwoTradeoff = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoTradeoff'))
const RoleAssessmentSessionTwoReview = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoReview'))
const RoleAssessmentSessionTwoAnalyzing = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoAnalyzing'))
const RoleAssessmentSessionTwoResults = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoResults'))
const RoleAssessmentSessionTwoOutcome = lazy(() => import('./pages/talent/RoleAssessmentSessionTwoOutcome'))
const RoleAssessmentStageTwoIntro = lazy(() => import('./pages/talent/RoleAssessmentStageTwoIntro'))
const RoleAssessmentStageTwoPartOneIntro = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartOneIntro'))
const RoleAssessmentStageTwoPharmacology = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPharmacology'))
const RoleAssessmentStageTwoBiostatistics = lazy(() => import('./pages/talent/RoleAssessmentStageTwoBiostatistics'))
const RoleAssessmentStageTwoPartOneComplete = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartOneComplete'))
const RoleAssessmentStageTwoCompliance = lazy(() => import('./pages/talent/RoleAssessmentStageTwoCompliance'))
const RoleAssessmentStageTwoReasoning = lazy(() => import('./pages/talent/RoleAssessmentStageTwoReasoning'))
const RoleAssessmentStageTwoAppraisal = lazy(() => import('./pages/talent/RoleAssessmentStageTwoAppraisal'))
const RoleAssessmentStageTwoInterpretation = lazy(() => import('./pages/talent/RoleAssessmentStageTwoInterpretation'))
const RoleAssessmentStageTwoPartTwoIntro = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartTwoIntro'))
const RoleAssessmentStageTwoPartTwoComplete = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartTwoComplete'))
const RoleAssessmentStageTwoPartTwoExpertiseIntro = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartTwoExpertiseIntro'))
const RoleAssessmentStageTwoChildMalnutrition = lazy(() => import('./pages/talent/RoleAssessmentStageTwoChildMalnutrition'))
const RoleAssessmentStageTwoMalariaProtocol = lazy(() => import('./pages/talent/RoleAssessmentStageTwoMalariaProtocol'))
const RoleAssessmentStageTwoColdChain = lazy(() => import('./pages/talent/RoleAssessmentStageTwoColdChain'))
const RoleAssessmentStageTwoPartTwoExpertiseComplete = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartTwoExpertiseComplete'))
const RoleAssessmentStageTwoPartThreeIntro = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartThreeIntro'))
const RoleAssessmentStageTwoPartThreeSimulationOne = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartThreeSimulationOne'))
const RoleAssessmentStageTwoPartThreeSimulationTwo = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartThreeSimulationTwo'))
const RoleAssessmentStageTwoPartThreeSimulationThree = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartThreeSimulationThree'))
const RoleAssessmentStageTwoPartThreeSimulationFour = lazy(() => import('./pages/talent/RoleAssessmentStageTwoPartThreeSimulationFour'))
const RoleAssessmentStageTwoAnalyzing = lazy(() => import('./pages/talent/RoleAssessmentStageTwoAnalyzing'))
const RoleAssessmentStageTwoResults = lazy(() => import('./pages/talent/RoleAssessmentStageTwoResults'))
const RoleAssessmentStageTwoOutcome = lazy(() => import('./pages/talent/RoleAssessmentStageTwoOutcome'))
const RoleAssessmentStageThreeIntro = lazy(() => import('./pages/talent/RoleAssessmentStageThreeIntro'))
const RoleAssessmentStageThreeVideo = lazy(() => import('./pages/talent/RoleAssessmentStageThreeVideo'))
const RoleAssessmentStageThreeComplete = lazy(() => import('./pages/talent/RoleAssessmentStageThreeComplete'))
const RoleAssessmentStageFourReview = lazy(() => import('./pages/talent/RoleAssessmentStageFourReview'))
const RoleAssessmentStageFourOutcome = lazy(() => import('./pages/talent/RoleAssessmentStageFourOutcome'))
const RoleAssessmentResumeGate = lazy(() => import('./pages/talent/RoleAssessmentResumeGate'))
const RoleProfileRolesFound = lazy(() => import('./pages/talent/RoleProfileRolesFound'))
const RoleProfileMatchWaitlist = lazy(() => import('./pages/talent/RoleProfileMatchWaitlist'))
const RoleProfileMatchBlocked = lazy(() => import('./pages/talent/RoleProfileMatchBlocked'))
const RoleProfileMatchUpskill = lazy(() => import('./pages/talent/RoleProfileMatchUpskill'))
const RoleProfileMatchCvUnavailable = lazy(() => import('./pages/talent/RoleProfileMatchCvUnavailable'))
const MentorApply = lazy(() => import('./pages/mentor/MentorApply'))
const MentorProfile = lazy(() => import('./pages/mentor/MentorOnboarding'))
const Welcome = lazy(() => import('./pages/onboarding/Welcome'))
const SelectAccountType = lazy(() => import('./pages/auth/SelectAccountType'))
const Jobs = lazy(() => import('./pages/employer/Jobs'))
const Talents = lazy(() => import('./pages/talent/TalentList'))
const JobDetails = lazy(() => import('./pages/employer/JobDetails'))
const Rejection = lazy(() => import('./pages/employer/Rejection'))
const TalentProfile = lazy(() => import('./pages/talent/TalentProfile'))
const FinalAlignmentSession = lazy(() => import('./pages/employer/FinalAlignmentSession'))
const OnboardingContainer = lazy(() => import('./pages/onboarding/OnboardingContainer'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Settings = lazy(() => import('./pages/Settings'))
const Payments = lazy(() => import('./pages/employer/Payments'))
const VaultRoleConfirmation = lazy(() => import('./pages/employer/VaultRoleConfirmation'))
const EditVaultRole = lazy(() => import('./pages/employer/EditVaultRole'))
const VaultEditReview = lazy(() => import('./pages/employer/VaultEditReview'))
const RoleApplyRoute = lazy(() => import('./components/auth/RoleApplyRoute'))

const JobPostedConfirmation = lazy(() => import('./pages/employer/JobPostedConfirmation'))
const RoleLanding = lazy(() => import('./pages/public/RoleLanding'))
const RoleSignup = lazy(() => import('./pages/auth/RoleSignup'))

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window, document, and body
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTo(0, 0);
    if (document.body) document.body.scrollTo(0, 0);

    const scrollElements = () => {
      const scrollContainers = document.querySelectorAll(
        '.overflow-y-auto, main, [style*="overflow-y: auto"], [style*="overflow-y: scroll"]'
      );
      scrollContainers.forEach((container) => {
        container.scrollTo(0, 0);
      });
    };

    // Run immediately
    scrollElements();

    // Run after a short delay to account for lazy-loaded route components mounting
    const timer = setTimeout(scrollElements, 80);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

const App = () => {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOnline) {
      const isAssessmentOrInterview =
        location.pathname.includes('/interview') ||
        location.pathname.includes('/assessment');

      if (isAssessmentOrInterview) {
        // Try to trigger the 'Save & finish later' button in the page if it exists
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveButton = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('save & finish later') || text.includes('save and finish later');
        });

        if (saveButton) {
          saveButton.click();
        } else {
          // If no button is found, fall back directly to dashboard
          navigate('/dashboard');
        }
        
        toast.error('Connection lost. Saving progress and returning to the dashboard.', {
          id: 'offline-assessment-redirect',
          duration: 5000,
        });
      } else {
        // For other pages, redirect to dashboard if not already there
        if (location.pathname !== '/dashboard' && location.pathname !== '/login') {
          navigate('/dashboard');
          toast.error('Connection lost. Please check your internet connection.', {
            id: 'offline-redirect',
            duration: 5000,
          });
        }
      }
    }
  }, [isOnline, location.pathname, navigate]);

  return (
    <MainLayout>
      <ScrollToTop />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={defaultToastOptions}
      />
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/role/:slug" element={<RoleLanding />} />
          <Route path="/role/:slug/signup" element={<RoleSignup />} />
          <Route path="/role/:slug/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedDashboardLayout><Dashboard /></ProtectedDashboardLayout>} />
          <Route path="/jobs" element={<ProtectedDashboardLayout><Jobs /></ProtectedDashboardLayout>} />
          <Route path="/jobs/posted/confirmation" element={<ProtectedDashboardLayout><EmployerRoute><JobPostedConfirmation /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/vault/confirmation" element={<ProtectedDashboardLayout><EmployerRoute><VaultRoleConfirmation /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/vault/edit/:id" element={<ProtectedDashboardLayout><EmployerRoute><EditVaultRole /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/vault/review/:id?" element={<ProtectedDashboardLayout><EmployerRoute><VaultEditReview /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id" element={<ProtectedDashboardLayout><EmployerRoute><JobDetails /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id/reject/:applicantId" element={<ProtectedDashboardLayout><EmployerRoute><Rejection /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id/alignment/:candidateId" element={<ProtectedDashboardLayout><EmployerRoute><FinalAlignmentSession /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/payments/*" element={<ProtectedDashboardLayout><EmployerRoute><Payments /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/talents" element={<ProtectedDashboardLayout><Talents /></ProtectedDashboardLayout>} />
          <Route path="/talents/:id" element={<ProtectedDashboardLayout><TalentProfile /></ProtectedDashboardLayout>} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyOTP />} />
          <Route path="/select-type" element={<SelectAccountType />} />

          {/* Onboarding Routes */}
          <Route path="/onboarding" element={<OnboardingContainer />} />
          <Route path="/onboarding/welcome" element={<Welcome />} />
          <Route path="/onboarding/employer" element={<EmployerOnboarding />} />
          {/* Normal Onboarding Routes */}
          <Route path="/onboarding/talent" element={<TalentOnboarding />} />

          {/* Job-Link RoDynamic & Protected) */}
          <Route path="/onboarding/talent/:roleSlug" element={<RoleApplyRoute />}>
            <Route path="cv" element={<RoleCvUpload />} />
            <Route path="match" element={<RoleProfileMatchBuilding />} />
            <Route path="match/result" element={<RoleProfileMatchResult />} />
            <Route path="interview/asks" element={<RoleEmployerAsks />} />
            <Route path="interview/journey" element={<RoleAssessmentJourney />} />
            <Route path="interview/stage-1/intro" element={<RoleAssessmentIntro />} />
            <Route path="interview/stage-1" element={<RoleAssessmentGate1Active />} />
            <Route path="interview/gate-1/review" element={<RoleAssessmentGate1Review />} />
            <Route path="interview/gate-1/verdict" element={<RoleAssessmentGate1Verdict />} />
            <Route path="interview/session-1" element={<RoleAssessmentSessionInfo />} />
            <Route path="interview/session-1/psychometric" element={<RoleAssessmentSessionPsychometric />} />
            <Route path="interview/session-1/forced-choice" element={<RoleAssessmentSessionForcedChoice />} />
            <Route path="interview/session-1/psychometric-values" element={<RoleAssessmentSessionPsychometricValues />} />
            <Route path="interview/session-1/situational" element={<RoleAssessmentSessionSituational />} />
            <Route path="interview/session-1/cognitive" element={<RoleAssessmentSessionCognitive />} />
            <Route path="interview/session-1/reading" element={<RoleAssessmentSessionReading />} />
            <Route path="interview/session-1/complete" element={<RoleAssessmentSessionComplete />} />
            <Route path="interview/session-2" element={<RoleAssessmentSessionTwoInfo />} />
            <Route path="interview/session-2/situational" element={<RoleAssessmentSessionTwoSituational />} />
            <Route path="interview/session-2/ranking" element={<RoleAssessmentSessionTwoRanking />} />
            <Route path="interview/session-2/best-worst" element={<RoleAssessmentSessionTwoBestWorst />} />
            <Route path="interview/session-2/combine" element={<RoleAssessmentSessionTwoCombine />} />
            <Route path="interview/session-2/tradeoff" element={<RoleAssessmentSessionTwoTradeoff />} />
            <Route path="interview/session-2/review" element={<RoleAssessmentSessionTwoReview />} />
            <Route path="interview/session-2/analyzing" element={<RoleAssessmentSessionTwoAnalyzing />} />
            <Route path="interview/session-2/results" element={<RoleAssessmentSessionTwoResults />} />
            <Route path="interview/session-2/outcome" element={<RoleAssessmentSessionTwoOutcome />} />
            <Route path="interview/stage-2" element={<RoleAssessmentStageTwoIntro />} />
            <Route path="interview/stage-2/part-1/intro" element={<RoleAssessmentStageTwoPartOneIntro />} />
            <Route path="interview/stage-2/part-1/interview-1" element={<RoleAssessmentStageTwoPharmacology />} />
            <Route path="interview/stage-2/part-1/interview-2" element={<RoleAssessmentStageTwoBiostatistics />} />
            <Route path="interview/stage-2/part-1/interview-3" element={<RoleAssessmentStageTwoCompliance />} />
            <Route path="interview/stage-2/part-1/complete" element={<RoleAssessmentStageTwoPartOneComplete />} />
            
            {/* Part 2: Expertise */}
            <Route path="interview/stage-2/part-2/intro" element={<RoleAssessmentStageTwoPartTwoExpertiseIntro />} />
            <Route path="interview/stage-2/part-2/interview-1" element={<RoleAssessmentStageTwoChildMalnutrition />} />
            <Route path="interview/stage-2/part-2/interview-2" element={<RoleAssessmentStageTwoMalariaProtocol />} />
            <Route path="interview/stage-2/part-2/interview-3" element={<RoleAssessmentStageTwoColdChain />} />
            <Route path="interview/stage-2/part-2/complete" element={<RoleAssessmentStageTwoPartTwoExpertiseComplete />} />
            
            {/* Part 3: Reasoning */}
            <Route path="interview/stage-2/part-3/intro" element={<RoleAssessmentStageTwoPartTwoIntro />} />
            <Route path="interview/stage-2/part-3/interview-1" element={<RoleAssessmentStageTwoReasoning />} />
            <Route path="interview/stage-2/part-3/interview-2" element={<RoleAssessmentStageTwoAppraisal />} />
            <Route path="interview/stage-2/part-3/interview-3" element={<RoleAssessmentStageTwoInterpretation />} />
            <Route path="interview/stage-2/part-3/complete" element={<RoleAssessmentStageTwoPartTwoComplete />} />
            
            {/* Part 4: Simulation */}
            <Route path="interview/stage-2/part-4/intro" element={<RoleAssessmentStageTwoPartThreeIntro />} />
            <Route path="interview/stage-2/part-4/simulation-1" element={<RoleAssessmentStageTwoPartThreeSimulationOne />} />
            <Route path="interview/stage-2/part-4/simulation-2" element={<RoleAssessmentStageTwoPartThreeSimulationTwo />} />
            <Route path="interview/stage-2/part-4/simulation-3" element={<RoleAssessmentStageTwoPartThreeSimulationThree />} />
            <Route path="interview/stage-2/part-4/simulation-4" element={<RoleAssessmentStageTwoPartThreeSimulationFour />} />
            <Route path="interview/stage-2/analyzing" element={<RoleAssessmentStageTwoAnalyzing />} />
            <Route path="interview/stage-2/results" element={<RoleAssessmentStageTwoResults />} />
            <Route path="interview/stage-2/outcome" element={<RoleAssessmentStageTwoOutcome />} />
            <Route path="interview/stage-3" element={<RoleAssessmentStageThreeIntro />} />
            <Route path="interview/stage-3/video" element={<RoleAssessmentStageThreeVideo />} />
            <Route path="interview/stage-3/complete" element={<RoleAssessmentStageThreeComplete />} />
            <Route path="interview/stage-4/review" element={<RoleAssessmentStageFourReview />} />
            <Route path="interview/stage-4/outcome" element={<RoleAssessmentStageFourOutcome />} />
            <Route path="interview/resume" element={<RoleAssessmentResumeGate />} />
            {/* Legacy /assessment/* URLs → /interview/* */}
            <Route
              path="assessment/*"
              element={<AssessmentToInterviewRedirect />}
            />
            <Route path="match/blocked" element={<RoleProfileMatchBlocked />} />
            <Route path="match/upskill" element={<RoleProfileMatchUpskill />} />
            <Route path="match/cv-unavailable" element={<RoleProfileMatchCvUnavailable />} />
            <Route path="match/roles" element={<RoleProfileRolesFound />} />
            <Route path="match/waitlist" element={<RoleProfileMatchWaitlist />} />
          </Route>

          <Route path="/onboarding/mentor-apply/profile" element={<MentorProfile />} />
          <Route path="/onboarding/mentor-apply" element={<MentorApply />} />

          <Route path="/settings" element={<ProtectedDashboardLayout><Settings /></ProtectedDashboardLayout>} />

          {/* Wildcard Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}

export default App
