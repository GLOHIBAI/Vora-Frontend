import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firstName, role } = location.state || { firstName: 'there', role: 'talent' };

  const isMentor = role === 'mentor';
  const isEmployer = role === 'employer';
  const isSpecialRole = isMentor || isEmployer;

  const handleGoHome = () => {
    navigate('/');
  };

  const getHeading = () => {
    if (isMentor) return 'Your Mentor Profile Is Live';
    if (isEmployer) return 'Your Employer Profile Is Live';
    return `Welcome to VORA, ${firstName}`;
  };

  const getDescription = () => {
    if (isMentor) {
      return 'Your profile is now live and you can now mentor career-ready candidates, guide readiness and growth, explore teaching opportunities when you\'re ready.';
    }
    if (isEmployer) {
      return 'Your profile is now live and you can now hire career-ready candidates, guide readiness and growth, and build your specialized workforce when you\'re ready.';
    }
    return 'You\'re now part of a growing global community in public health & wellness. Start your journey by exploring jobs, start mentorships, and building your Career Readiness Score.';
  };

  const getButtonText = () => {
    return isSpecialRole ? 'Proceed to Dashboard' : 'Go to Home';
  };

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 flex flex-col items-center justify-center text-center -mt-10 sm:-mt-16">
      <h1 className="text-2xl sm:text-[28px] font-bold mb-4 text-[#1C1C1C] leading-[36px] tracking-[-1%] font-['Nunito_Sans']">
        {getHeading()}
      </h1>
      <p className="text-[#6B7280] text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-10">
        {getDescription()}
      </p>

      <div className="w-full max-w-[480px]">
        <Button variant="primary" onClick={handleGoHome}>
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
