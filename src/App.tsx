import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layout/MainLayout'

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

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-8 h-8 border-4 border-[#0052cc] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

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