import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from './CircularProgress';
import StatCard from '../dashboard/StatCard';
import QuickActionCard from '../dashboard/QuickActionCard';
import JobCard from '../dashboard/JobCard';
import { InfoIcon } from '../common/Icons';
import { TALENT_SAMPLE_JOBS } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { useGetPublicRoleQuery } from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Read active assessment parameters from localStorage
  const activeRoleSlug = localStorage.getItem('active_assessment_role_slug');
  const isStage2Unlocked = localStorage.getItem('vora_stage2_unlocked') === 'true';
  const isStage2Completed = localStorage.getItem('vora_stage2_completed') === 'true';
  const isStage3Unlocked = localStorage.getItem('vora_stage3_unlocked') === 'true';
  const isStage3Completed = localStorage.getItem('vora_stage3_completed') === 'true';
  const isStage4Unlocked = localStorage.getItem('vora_stage4_unlocked') === 'true';
  const isHired = localStorage.getItem('vora_hired') === 'true';

  // Fetch active role details if available
  const { data: response } = useGetPublicRoleQuery(activeRoleSlug || '');

  const appliedRole = useMemo(() => {
    if (!activeRoleSlug) return null;
    const apiData = response?.data || response;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(activeRoleSlug);
    }
    return mapApiResponseToRoleData(activeRoleSlug, apiData);
  }, [response, activeRoleSlug]);

  if (!user) return null;
  const firstName = user.firstName || 'Tobi';

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section>
        <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-1 ">Welcome, {firstName}.</h1>
        <p className="text-[13px] lg:text-sm text-gray-500 font-medium">Upload your CV to begin your career journey and unlock your score.</p>
      </section>

      {/* Active Assessment Banner */}
      {activeRoleSlug && appliedRole && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          {isHired ? (
            <div className="bg-gradient-to-r from-[#0F3D0F] to-[#2CA62C] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_12px_36px_rgba(44,166,44,0.18)]">
              <div className="w-[50px] h-[50px] rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-[900] text-[16px] shrink-0">
                {appliedRole.companyInitials || 'RA'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-[800] uppercase tracking-wider text-white/70">
                  Offer Received!
                </span>
                <h2 className="text-[18px] font-bold mt-1">
                  Congratulations, you&apos;ve been hired!
                </h2>
                <p className="text-[13px] text-white/80 mt-1">
                  As {appliedRole.roleTitle} at {appliedRole.companyName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/onboarding/talent/${activeRoleSlug}/assessment/stage-4/outcome`)}
                  className="bg-white text-[#1D871D] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  View Offer Details
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#0047CC] to-[#387DFF] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_12px_36px_rgba(0,71,204,0.18)]">
              <div className="w-[50px] h-[50px] rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-[900] text-[16px] shrink-0">
                {appliedRole.companyInitials || 'RA'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-[800] uppercase tracking-wider text-white/70">
                  Active Assessment Journey
                </span>
                <h2 className="text-[18px] font-bold mt-1">
                  {appliedRole.roleTitle}
                </h2>
                <p className="text-[13px] text-white/80 mt-1">
                  {appliedRole.companyName} · {appliedRole.companyLocation || 'Lagos'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 font-bold uppercase tracking-wide">
                  {isStage3Completed ? 'Stage 4 · Review' : isStage2Completed ? 'Stage 3 · Video interview' : isStage2Unlocked ? 'Stage 2 · Professional' : 'Stage 1 · Getting to know you'}
                </span>
                <button
                  onClick={() => navigate(`/onboarding/talent/${activeRoleSlug}/assessment/journey`)}
                  className="bg-white text-[#0047CC] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Resume Journey
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Career Readiness Score Card */}
        <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col items-center justify-between transition-all duration-300 min-h-[190px]">
          <p className="text-[14px] font-medium text-[#0047CC] w-full text-left">Career Readiness Score</p>
          <div className="py-2">
            <CircularProgress percentage={0} size={140} strokeWidth={15} />
          </div>
          <div className="text-[14px] text-gray-800 font-medium flex items-center gap-2.5 w-full">
            <span className="bg-[#0047CC] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              <InfoIcon size={12} strokeWidth={4} />
            </span>
            Upload your CV to calculate your score.
          </div>
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
        <h2 className="text-lg font-medium text-gray-900 mb-6 ">Quick actions</h2>
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
            <h2 className="text-lg font-medium text-gray-900 mb-1">Sample Opportunities on the Platform</h2>
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
