import React, { useEffect } from 'react';
import TalentDashboard from '../components/talent/TalentDashboard';
import MentorDashboard from '../components/mentor/MentorDashboard';
import EmployerDashboard from '../components/employer/EmployerDashboard';

const Dashboard: React.FC = () => {
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
