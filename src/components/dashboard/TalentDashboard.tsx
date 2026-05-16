import React from 'react';
import CircularProgress from './CircularProgress';
import StatCard from './StatCard';
import QuickActionCard from './QuickActionCard';
import JobCard from './JobCard';
import { InfoIcon, CloseIcon } from '../common/Icons';
import { TALENT_SAMPLE_JOBS } from '../../constants/mockData';

const TalentDashboard: React.FC = () => {
  const userStr = localStorage.getItem('vora_user');
  const user = userStr ? JSON.parse(userStr) : { firstName: 'Tobi' };
  const firstName = user.firstName || 'Tobi';

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-1 font-['Nunito_Sans']">Welcome, {firstName}.</h1>
        <p className="text-sm text-gray-500 font-medium">Upload your CV to begin your career journey and unlock your score.</p>
      </section>

      {/* Alert Banner */}
      <div className="bg-[#FFF8F1] border-l-4 border-[#FF9500] rounded-r-xl p-4 flex items-center justify-between group relative">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF9500] p-1.5 rounded-full text-white shrink-0">
            <InfoIcon size={14} strokeWidth={3} />
          </div>
          <p className="text-sm text-gray-700 font-medium">
            You are yet to upload your CV. Upload CV to get your Career Readiness Score.
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <CloseIcon size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Career Readiness Score Card */}
        <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col items-center justify-between transition-all duration-300 min-h-[190px]">
          <p className="text-[14px] font-bold text-[#0047CC] w-full text-left">Career Readiness Score</p>
          <div className="py-2">
            <CircularProgress percentage={0} size={140} strokeWidth={15} />
          </div>
          <p className="text-[14px] text-gray-800 font-medium flex items-center gap-2.5 w-full">
            <div className="bg-[#FF9500] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              <InfoIcon size={12} strokeWidth={4} />
            </div>
            Upload your CV to calculate your score.
          </p>
        </div>
        
        <StatCard 
          title="Assessment Grade" 
          value="--" 
          linkText="Upload CV to unlock Grade."
        />
        
        <StatCard 
          title="Jobs Applied" 
          value="0" 
          linkText="Upload CV & Build Profile"
        />
      </div>

      {/* Quick Actions Section */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-6 font-['Nunito_Sans']">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard 
            variant="primary"
            title="Upload CV & Build Profile"
            description="Get your personalized Career Readiness Score and unlock platform features."
            buttonText="Upload CV/resume"
          />
          <QuickActionCard 
            isLocked
            title="Access to Mentors"
            description="Gain access to mentors and get insights into your field"
            buttonText="Explore mentors"
          />
          <QuickActionCard 
            isLocked
            title="Access Jobs"
            description="Provide your CV/resume and get your career readiness score"
            buttonText="View available jobs"
          />
        </div>
      </section>

      {/* Sample Opportunities Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Sample Opportunities on the Platform</h2>
            <p className="text-sm text-gray-500 font-medium">Upload your CV to get jobs tailored specifically for you.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TALENT_SAMPLE_JOBS.map((job, idx) => (
            <JobCard key={idx} {...job} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TalentDashboard;
