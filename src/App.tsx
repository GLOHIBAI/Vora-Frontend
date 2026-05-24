import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import ProtectedDashboardLayout from './layout/ProtectedDashboardLayout'
import EmployerRoute from './components/auth/EmployerRoute'
import { Toaster } from 'react-hot-toast'
import { defaultToastOptions } from './config/toastOptions'

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const Login = lazy(() => import('./pages/auth/Login'))
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'))
const EmployerOnboarding = lazy(() => import('./pages/employer/EmployerOnboarding'))
const TalentOnboarding = lazy(() => import('./pages/talent/TalentOnboarding'))
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

const App = () => {
  return (
    <MainLayout>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={defaultToastOptions}
      />
      <Suspense fallback={
        <div className="fixed inset-0 flex justify-center items-center bg-white z-[9999]">
          <div className="w-10 h-10 border-4 border-[#0047CC] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedDashboardLayout><Dashboard /></ProtectedDashboardLayout>} />
          <Route path="/jobs" element={<ProtectedDashboardLayout><Jobs /></ProtectedDashboardLayout>} />
          <Route path="/jobs/vault/confirmation" element={<ProtectedDashboardLayout><EmployerRoute><VaultRoleConfirmation /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/vault/edit/:id" element={<ProtectedDashboardLayout><EmployerRoute><EditVaultRole /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id" element={<ProtectedDashboardLayout><EmployerRoute><JobDetails /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id/reject/:applicantId" element={<ProtectedDashboardLayout><EmployerRoute><Rejection /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/jobs/:id/alignment/:candidateId" element={<ProtectedDashboardLayout><EmployerRoute><FinalAlignmentSession /></EmployerRoute></ProtectedDashboardLayout>} />
          <Route path="/payments" element={<ProtectedDashboardLayout><EmployerRoute><Payments /></EmployerRoute></ProtectedDashboardLayout>} />
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
          <Route path="/onboarding/talent" element={<TalentOnboarding />} />
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
