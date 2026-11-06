import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TalentDashboard from '../components/talent/TalentDashboard';
import MentorDashboard from '../components/mentor/MentorDashboard';
import EmployerDashboard from '../components/employer/EmployerDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isLearner = Boolean(
    (user as any)?.isLearner ||
    user?.role?.toLowerCase() === 'learner' ||
    (typeof window !== 'undefined' && localStorage.getItem('vora_user_track') === 'learner') ||
    (typeof window !== 'undefined' && Boolean(localStorage.getItem('vora_course_enroll_context'))) ||
    (user?.role?.toLowerCase() === 'talent' && !(user as any)?.isOnboardingComplete && !(user as any)?.onboardingCompleted)
  );

  if (isLearner) {
    return <Navigate to="/courses" replace />;
  }

  // Get role from localStorage or default to talent
  const role = localStorage.getItem('vora_role') || 'talent';

  useEffect(() => {
    localStorage.setItem('vora_role', role);
  }, [role]);

  const renderDashboard = () => {
    switch (role) {
      case 'mentor':
        return <MentorDashboard />;
      case 'employer':
        return <EmployerDashboard />;
      case 'talent':
      default:
        return <TalentDashboard />;
    }
  };

  return (
    <div className="relative">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
