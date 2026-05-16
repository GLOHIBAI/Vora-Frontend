import React, { useState, useEffect } from 'react';
import TalentDashboard from '../components/dashboard/TalentDashboard';
import MentorDashboard from '../components/dashboard/MentorDashboard';
import EmployerDashboard from '../components/dashboard/EmployerDashboard';

const Dashboard: React.FC = () => {
  // Get role from localStorage or default to talent
  const [role, setRole] = useState<string>(localStorage.getItem('vora_role') || 'talent');

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
