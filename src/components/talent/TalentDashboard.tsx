import React from 'react';
import CircularProgress from './CircularProgress';
import StatCard from '../dashboard/StatCard';
import QuickActionCard from '../dashboard/QuickActionCard';
import JobCard from '../dashboard/JobCard';
import { InfoIcon } from '../common/Icons';
import { TALENT_SAMPLE_JOBS } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  const firstName = user.firstName || 'Tobi';

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 font-['Nunito_Sans']">Welcome, {firstName}.</h1>
        <p className="text-[13px] lg:text-sm text-gray-500 font-medium">Upload your CV to begin your career journey and unlock your score.</p>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Career Readiness Score Card */}
        <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col items-center justify-between transition-all duration-300 min-h-[190px]">
          <p className="text-[14px] font-bold text-[#0047CC] w-full text-left">Career Readiness Score</p>
          <div className="py-2">
            <CircularProgress percentage={0} size={140} strokeWidth={15} />
          </div>
          <p className="text-[14px] text-gray-800 font-medium flex items-center gap-2.5 w-full">
            <div className="bg-[#0047CC] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <div className="break-inside-avoid">
            <QuickActionCard 
              variant="primary"
              title="Upload CV & Build Profile"
              description="Get your personalized Career Readiness Score and unlock platform features."
              buttonText="Upload CV/resume"
            />
          </div>
          <div className="break-inside-avoid">
            <QuickActionCard 
              isLocked
              title="Access to Mentors"
              description="Gain access to mentors and get insights into your field"
              buttonText="Explore mentors"
            />
          </div>
          <div className="break-inside-avoid">
            <QuickActionCard 
              isLocked
              title="Access Jobs"
              description="Provide your CV/resume and get your career readiness score"
              buttonText="View available jobs"
            />
          </div>
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
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {TALENT_SAMPLE_JOBS.map((job, idx) => (
            <div key={idx} className="break-inside-avoid">
              <JobCard {...job} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TalentDashboard;
