import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularProgress from './CircularProgress';
import StatCard from '../dashboard/StatCard';
import QuickActionCard from '../dashboard/QuickActionCard';
import JobCard from '../dashboard/JobCard';
import { InfoIcon } from '../common/Icons';
import { TALENT_SAMPLE_JOBS } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  useGetPublicRoleQuery,
  useTalentDashboardQuery,
  type TalentDashboardData,
  type TalentDashboardActivity,
  type TalentDashboardSampleOpportunity,
} from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch live Talent Dashboard data: GET /api/v1/talent/dashboard
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useTalentDashboardQuery();
  const dashboardData: TalentDashboardData | undefined = dashboardResponse?.data || (dashboardResponse as any);

  const greeting = dashboardData?.greeting;
  const metrics = dashboardData?.metrics;
  const unlocks = dashboardData?.unlocks;
  const activities = dashboardData?.activities;
  const sampleOpportunities = dashboardData?.sampleOpportunities;

  // Primary active activity (assessment or application step)
  const primaryActivity = activities?.primary || (activities?.activities && activities.activities[0]);

  // 2. Fallback to localStorage active assessment parameters if not provided by API
  const activeRoleSlug = localStorage.getItem('active_assessment_role_slug');
  const isStage2Unlocked = localStorage.getItem('vora_stage2_unlocked') === 'true';
  const isStage2Completed = localStorage.getItem('vora_stage2_completed') === 'true';
  const isStage3Unlocked = localStorage.getItem('vora_stage3_unlocked') === 'true';
  const isStage3Completed = localStorage.getItem('vora_stage3_completed') === 'true';
  const isStage4Unlocked = localStorage.getItem('vora_stage4_unlocked') === 'true';
  const isHired = localStorage.getItem('vora_hired') === 'true';

  // Fetch active role details if available for fallback
  const { data: roleResponse } = useGetPublicRoleQuery(activeRoleSlug || '', {
    enabled: Boolean(!primaryActivity && activeRoleSlug),
  });

  const appliedRole = useMemo(() => {
    if (!activeRoleSlug) return null;
    const apiData = roleResponse?.data || roleResponse;
    if (!apiData || Object.keys(apiData).length === 0) {
      return getRoleLandingForSlug(activeRoleSlug);
    }
    return mapApiResponseToRoleData(activeRoleSlug, apiData);
  }, [roleResponse, activeRoleSlug]);

  if (!user && !isDashboardLoading) return null;

  const firstName = greeting?.firstName || user?.firstName || 'Candidate';
  const welcomeTitle = greeting?.welcomeMessage || `Welcome, ${firstName}.`;
  const welcomeSubtitle = greeting?.subtitle || 'Track your career journey, assessments, and tailored job matches.';

  const scoreValue = metrics?.careerReadinessScore?.value ?? 0;
  const scoreHint = metrics?.careerReadinessScore?.hint || 'Upload your CV to calculate your score.';

  const gradeValue = metrics?.interviewGrade?.grade || metrics?.interviewGrade?.label || '--';
  const gradeHint = metrics?.interviewGrade?.hint || 'Upload CV to unlock Grade.';

  const jobsAppliedCount = metrics?.jobsApplied?.count ?? 0;
  const jobsAppliedHint = metrics?.jobsApplied?.hint || (jobsAppliedCount > 0 ? `${jobsAppliedCount} application active` : 'Explore available roles');

  // Handle primary activity navigation
  const handleActivityClick = (activity: TalentDashboardActivity) => {
    // 1. Resolve role slug
    let roleSlug = activeRoleSlug;
    if (!roleSlug && activity.context?.rolePostingId && sampleOpportunities) {
      const matchingOpp = sampleOpportunities.find(
        (o) => o.rolePostingId === activity.context?.rolePostingId
      );
      if (matchingOpp?.roleLink) {
        roleSlug = matchingOpp.roleLink;
      }
    }
    if (!roleSlug && activity.context?.roleTitle) {
      roleSlug = activity.context.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (!roleSlug) {
      roleSlug = 'backend-engineer';
    }

    // 2. Persist assessment session parameters
    const assessmentId = activity.context?.assessmentId;
    const rolePostingId = activity.context?.rolePostingId;
    if (assessmentId) {
      localStorage.setItem('vora_assessment_id', assessmentId);
      localStorage.setItem('active_assessment_id', assessmentId);
    }
    if (rolePostingId) {
      localStorage.setItem('vora_role_posting_id', rolePostingId);
    }
    if (roleSlug) {
      localStorage.setItem('active_assessment_role_slug', roleSlug);
    }

    const stage = activity.context?.stage;
    if (stage === 2) {
      localStorage.setItem('vora_stage1_completed', 'true');
      localStorage.setItem('vora_stage2_unlocked', 'true');
    } else if (stage === 3) {
      localStorage.setItem('vora_stage2_completed', 'true');
      localStorage.setItem('vora_stage3_unlocked', 'true');
    } else if (stage === 4) {
      localStorage.setItem('vora_stage3_completed', 'true');
      localStorage.setItem('vora_stage4_unlocked', 'true');
    }

    // 3. Navigate directly to the corresponding interview stage or journey
    if (stage === 4) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-4/decision`);
    } else if (stage === 3) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-3`);
    } else if (stage === 2) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-2`);
    } else if (stage === 1) {
      navigate(`/onboarding/talent/${roleSlug}/interview/stage-1`);
    } else {
      navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
    }
  };

  // Helper to handle unlock action redirection
  const handleUnlockClick = (hrefHint?: string) => {
    if (!hrefHint) return;
    if (hrefHint === '/talent/settings/cv') {
      navigate('/onboarding/talent?step=2');
    } else if (hrefHint === '/talent/jobs' || hrefHint === '/talent/roles') {
      navigate('/jobs');
    } else if (hrefHint === '/talent/mentors') {
      navigate('/courses');
    } else {
      navigate(hrefHint);
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section>
        <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-1">{welcomeTitle}</h1>
        <p className="text-[13px] lg:text-sm text-gray-500 font-medium">{welcomeSubtitle}</p>
      </section>

      {/* Active Assessment Banner (Live API Primary Activity or localStorage fallback) */}
      {primaryActivity ? (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-[#0047CC] to-[#387DFF] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_12px_36px_rgba(0,71,204,0.18)]">
            <div className="w-[50px] h-[50px] rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-[900] text-[16px] shrink-0">
              {primaryActivity.context?.roleTitle?.slice(0, 2).toUpperCase() || 'VA'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-[800] uppercase tracking-wider text-white/70">
                {primaryActivity.subtitle || 'Active Interview Journey'}
              </span>
              <h2 className="text-[18px] font-bold mt-1">
                {primaryActivity.context?.roleTitle || primaryActivity.title}
              </h2>
              <p className="text-[13px] text-white/80 mt-1">
                {primaryActivity.subtitle || `${primaryActivity.title} · Stage ${primaryActivity.context?.stage ?? 1}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 font-bold uppercase tracking-wide">
                Stage {primaryActivity.context?.stage ?? 1} · In progress
              </span>
              <button
                onClick={() => handleActivityClick(primaryActivity)}
                className="bg-white text-[#0047CC] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
              >
                Resume Journey
              </button>
            </div>
          </div>
        </section>
      ) : activeRoleSlug && appliedRole ? (
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
                  onClick={() => navigate(`/onboarding/talent/${activeRoleSlug}/interview/stage-4/decision`)}
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
                  Active Interview Journey
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
                  {isStage3Completed || isStage4Unlocked ? 'Stage 4 · Final decision' : isStage2Completed ? 'Stage 3 · Video interview' : isStage2Unlocked ? 'Stage 2 · Professional' : 'Stage 1 · Getting to know you'}
                </span>
                <button
                  onClick={() => navigate(`/onboarding/talent/${activeRoleSlug}/interview/${isStage3Completed || isStage4Unlocked ? 'stage-4/decision' : 'journey'}`)}
                  className="bg-white text-[#0047CC] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {isStage3Completed || isStage4Unlocked ? 'Check Decision Status' : 'Resume Journey'}
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {/* Stats / Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Career Readiness Score Card */}
        <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col items-center justify-between transition-all duration-300 min-h-[190px]">
          <p className="text-[14px] font-medium text-[#0047CC] w-full text-left">Career Readiness Score</p>
          <div className="py-2">
            <CircularProgress percentage={scoreValue} size={140} strokeWidth={15} />
          </div>
          <div className="text-[13px] text-gray-800 font-medium flex items-center gap-2.5 w-full">
            <span className="bg-[#0047CC] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              <InfoIcon size={12} strokeWidth={4} />
            </span>
            <span className="truncate">{scoreHint}</span>
          </div>
        </div>
        
        {/* Interview Grade Card */}
        <StatCard 
          title="Interview Grade" 
          value={gradeValue} 
          linkText={gradeHint}
          onLinkClick={() => navigate('/onboarding/talent?step=2')}
        />
        
        {/* Jobs Applied Card */}
        <StatCard 
          title="Jobs Applied" 
          value={String(jobsAppliedCount)} 
          linkText={jobsAppliedHint}
          onLinkClick={() => navigate('/jobs')}
        />
      </div>

      {/* Quick Actions / Unlocks Section */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-6">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlocks ? (
            <>
              {/* Upload CV */}
              <QuickActionCard 
                variant="primary"
                title={unlocks.uploadCv?.label || 'Upload CV & Build Profile'}
                description="Get your personalized Career Readiness Score and unlock platform features."
                buttonText={unlocks.uploadCv?.label || 'Upload CV/resume'}
                isLocked={unlocks.uploadCv?.locked ?? false}
                onClick={() => handleUnlockClick(unlocks.uploadCv?.hrefHint || '/talent/settings/cv')}
              />

              {/* Mentors */}
              <QuickActionCard 
                variant="white"
                title={unlocks.mentors?.label || 'Access to Mentors'}
                description="Gain access to mentors and get insights into your field."
                buttonText="Explore mentors"
                isLocked={unlocks.mentors?.locked ?? false}
                onClick={() => handleUnlockClick(unlocks.mentors?.hrefHint || '/talent/mentors')}
              />

              {/* Jobs */}
              <QuickActionCard 
                variant="white"
                title={unlocks.jobs?.label || 'Access Jobs'}
                description="Explore available verified job roles matching your skill set."
                buttonText="View available jobs"
                isLocked={unlocks.jobs?.locked ?? false}
                onClick={() => handleUnlockClick(unlocks.jobs?.hrefHint || '/talent/jobs')}
              />
            </>
          ) : (
            <>
              <QuickActionCard 
                variant="primary"
                title="Upload CV & Build Profile"
                description="Get your personalized Career Readiness Score and unlock platform features."
                buttonText="Upload CV/resume"
                onClick={() => navigate('/onboarding/talent')}
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
            </>
          )}
        </div>
      </section>

      {/* Sample Opportunities / Matched Roles Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Sample Opportunities on the Platform
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Upload your CV to get jobs tailored specifically for you.
            </p>
          </div>
        </div>
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {sampleOpportunities && sampleOpportunities.length > 0 ? (
            sampleOpportunities.map((opp: TalentDashboardSampleOpportunity, idx: number) => (
              <div 
                key={opp.rolePostingId || idx} 
                className="break-inside-avoid"
                onClick={() => {
                  if (opp.roleLink) {
                    navigate(`/onboarding/talent/${opp.roleLink}/match`);
                  } else if (opp.hrefHint) {
                    navigate(opp.hrefHint);
                  }
                }}
              >
                <JobCard 
                  title={opp.roleTitle || 'Opportunity'}
                  company={opp.organisationName || opp.employerName || 'Employer'}
                  location={opp.location || 'Lagos, Nigeria'}
                  postedAt="Recent"
                  salary={opp.compensationSummary || opp.salaryRange || 'Competitive'}
                  description="Opportunity tailored for qualified talent."
                  tags={opp.tags || ['HYBRID', 'SENIOR']}
                />
              </div>
            ))
          ) : (
            TALENT_SAMPLE_JOBS.map((job, idx) => (
              <div key={idx} className="break-inside-avoid">
                <JobCard {...job} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TalentDashboard;
