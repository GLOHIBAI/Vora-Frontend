import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import DashboardLayout from './layout/DashboardLayout'

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const Login = lazy(() => import('./pages/auth/Login'))
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'))
const EmployerOnboarding = lazy(() => import('./pages/onboard/EmployerOnboarding'))
const TalentOnboarding = lazy(() => import('./pages/onboard/TalentOnboarding'))
const MentorApply = lazy(() => import('./pages/onboard/MentorApply'))
const MentorProfile = lazy(() => import('./pages/onboard/MentorProfile'))
const Welcome = lazy(() => import('./pages/onboard/Welcome'))
const SelectAccountType = lazy(() => import('./pages/auth/SelectAccountType'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Talents = lazy(() => import('./pages/Talents'))
const JobDetails = lazy(() => import('./pages/JobDetails'))
const Rejection = lazy(() => import('./pages/Rejection'))
const TalentProfile = lazy(() => import('./pages/TalentProfile'))

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="fixed inset-0 flex justify-center items-center bg-white z-[9999]">
          <div className="w-10 h-10 border-4 border-[#0047CC] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/jobs" element={<DashboardLayout><Jobs /></DashboardLayout>} />
          <Route path="/jobs/:id" element={<DashboardLayout><JobDetails /></DashboardLayout>} />
          <Route path="/jobs/:id/reject/:applicantId" element={<DashboardLayout><Rejection /></DashboardLayout>} />
          <Route path="/talents" element={<DashboardLayout><Talents /></DashboardLayout>} />
          <Route path="/talents/:id" element={<DashboardLayout><TalentProfile /></DashboardLayout>} />
          <Route path="/payments" element={<DashboardLayout><div className="text-center py-20 text-gray-500 text-lg font-bold">Payments Page (Coming Soon)</div></DashboardLayout>} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/select-type" element={<SelectAccountType />} />

          {/* Onboarding Routes */}
          <Route path="/onboard/employer" element={<EmployerOnboarding />} />
          <Route path="/onboard/talent" element={<TalentOnboarding />} />
          <Route path="/onboard/mentor-apply" element={<MentorApply />} />
          <Route path="/onboard/mentor-apply/profile" element={<MentorProfile />} />
          <Route path="/onboard/welcome" element={<Welcome />} />

          <Route path="/settings" element={<div className="text-center py-20 text-gray-500 text-lg">Settings Page (Coming Soon)</div>} />
        </Routes>
      </Suspense>
    </MainLayout>
  )
}

export default App
