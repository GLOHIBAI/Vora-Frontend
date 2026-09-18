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
  type TalentDashboardQuickAction,
  type TalentDashboardMatchedRole,
} from '../../services/queries/talent';
import { getRoleLandingForSlug, mapApiResponseToRoleData } from '../../utils/roleLanding';

const TalentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch live Talent Dashboard data: GET /api/v1/talent/dashboard
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useTalentDashboardQuery();
  const dashboardData: TalentDashboardData | undefined = dashboardResponse?.data || (dashboardResponse as any);
  const talent = dashboardData?.talent;
  const activeAssessment = dashboardData?.activeAssessment;
  const assessmentsSummary = dashboardData?.assessmentsSummary;
  const matchedRoles: TalentDashboardMatchedRole[] | undefined = dashboardData?.matchedRoles;
  const quickActions: TalentDashboardQuickAction[] | undefined = dashboardData?.quickActions;

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
    enabled: Boolean(!activeAssessment && activeRoleSlug),
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

  const firstName = talent?.fullName?.split(' ')[0] || user?.firstName || 'Candidate';
  const profileScore = talent?.profileCompleteness ?? 0;

  // Helper to handle quick action redirection
  const handleQuickActionClick = (href?: string) => {
    if (!href) return;
    if (href === '/talent/settings/cv') {
      navigate('/onboarding/talent?step=2');
    } else {
      navigate(href);
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section>
        <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-1">Welcome, {firstName}.</h1>
        <p className="text-[13px] lg:text-sm text-gray-500 font-medium">
          {talent?.hasCv
            ? talent?.targetRole
              ? `${talent.targetRole} · Track your applications and explore matched opportunities.`
              : 'Track your career journey, assessments, and tailored job matches.'
            : 'Upload your CV to begin your career journey and unlock your score.'}
        </p>
      </section>

      {/* Active Assessment Banner (Live API or localStorage fallback) */}
      {activeAssessment ? (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          {activeAssessment.status === 'HIRED' || activeAssessment.overallPassed === true ? (
            <div className="bg-gradient-to-r from-[#0F3D0F] to-[#2CA62C] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_12px_36px_rgba(44,166,44,0.18)]">
              <div className="w-[50px] h-[50px] rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-[900] text-[16px] shrink-0">
                {activeAssessment.employerName?.slice(0, 2).toUpperCase() || 'VA'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-[800] uppercase tracking-wider text-white/70">
                  Offer Received!
                </span>
                <h2 className="text-[18px] font-bold mt-1">
                  Congratulations, you&apos;ve been hired!
                </h2>
                <p className="text-[13px] text-white/80 mt-1">
                  As {activeAssessment.roleTitle} at {activeAssessment.employerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuickActionClick(activeAssessment.resumeUrl || '/dashboard')}
                  className="bg-white text-[#1D871D] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  View Offer Details
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#0047CC] to-[#387DFF] text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_12px_36px_rgba(0,71,204,0.18)]">
              <div className="w-[50px] h-[50px] rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-[900] text-[16px] shrink-0">
                {activeAssessment.employerName?.slice(0, 2).toUpperCase() || 'VA'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-[800] uppercase tracking-wider text-white/70">
                  Active Interview Journey
                </span>
                <h2 className="text-[18px] font-bold mt-1">
                  {activeAssessment.roleTitle}
                </h2>
                <p className="text-[13px] text-white/80 mt-1">
                  {activeAssessment.employerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 font-bold uppercase tracking-wide">
                  {activeAssessment.stage === 4
                    ? 'Stage 4 · Final decision'
                    : activeAssessment.stage === 3
                    ? 'Stage 3 · Video interview'
                    : activeAssessment.stage === 2
                    ? 'Stage 2 · Professional'
                    : 'Stage 1 · Getting to know you'}
                </span>
                <button
                  onClick={() => handleQuickActionClick(activeAssessment.resumeUrl || '/dashboard')}
                  className="bg-white text-[#0047CC] hover:bg-gray-100 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {activeAssessment.stage === 4 ? 'Check Decision Status' : 'Resume Journey'}
                </button>
              </div>
            </div>
          )}
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Career Readiness / Profile Completeness Score Card */}
        <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col items-center justify-between transition-all duration-300 min-h-[190px]">
          <p className="text-[14px] font-medium text-[#0047CC] w-full text-left">Career Readiness Score</p>
          <div className="py-2">
            <CircularProgress percentage={profileScore} size={140} strokeWidth={15} />
          </div>
          <div className="text-[13px] text-gray-800 font-medium flex items-center gap-2.5 w-full">
            <span className="bg-[#0047CC] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              <InfoIcon size={12} strokeWidth={4} />
            </span>
            <span>
              {talent?.hasCv
                ? `${profileScore}% readiness score calculated from your CV.`
                : 'Upload your CV to calculate your score.'}
            </span>
          </div>
        </div>
        
        <StatCard 
          title="Seniority & Experience" 
          value={talent?.seniority || (assessmentsSummary?.passed ? `${assessmentsSummary.passed} Passed` : '--')} 
          linkText={
            talent?.experienceYears !== undefined
              ? `${talent.experienceYears} yrs experience · ${talent.skillsCount || talent.skills?.length || 0} skills`
              : 'Upload CV to unlock Grade.'
          }
          onLinkClick={() => talent?.hasCv ? navigate('/onboarding/talent?step=2') : navigate('/onboarding/talent')}
        />
        
        <StatCard 
          title="Applications & Assessments" 
          value={String(assessmentsSummary?.total ?? 0)} 
          linkText={
            assessmentsSummary?.inProgress
              ? `${assessmentsSummary.inProgress} in progress · ${assessmentsSummary.completed ?? 0} completed`
              : (talent?.hasCv ? 'Explore matched opportunities' : 'Upload CV & Build Profile')
          }
          onLinkClick={() => navigate('/talent/roles')}
        />
      </div>

      {/* Quick Actions Section */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-6">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions && quickActions.length > 0 ? (
            quickActions.map((qa: TalentDashboardQuickAction) => (
              <QuickActionCard 
                key={qa.id || qa.label}
                variant={qa.primary ? 'primary' : 'white'}
                title={qa.label || 'Action'}
                description={qa.badge ? `Status: ${qa.badge}` : qa.primary ? 'Continue your in-progress journey.' : 'Manage your profile and explore opportunities.'}
                buttonText={qa.label || 'Go'}
                onClick={() => handleQuickActionClick(qa.href)}
              />
            ))
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

      {/* Matched Opportunities / Sample Opportunities Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              {matchedRoles && matchedRoles.length > 0 ? 'Matched Opportunities' : 'Sample Opportunities on the Platform'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {matchedRoles && matchedRoles.length > 0
                ? 'Roles tailored specifically to your verified skills and profile.'
                : 'Upload your CV to get jobs tailored specifically for you.'}
            </p>
          </div>
        </div>
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {matchedRoles && matchedRoles.length > 0 ? (
            matchedRoles.map((role: TalentDashboardMatchedRole, idx: number) => (
              <div 
                key={role.rolePostingId || idx} 
                className="break-inside-avoid"
                onClick={() => {
                  if (role.roleLink) {
                    navigate(`/onboarding/talent/${role.roleLink}/match`);
                  }
                }}
              >
                <JobCard 
                  title={role.roleTitle || 'Matched Role'}
                  company={role.employerName || 'Employer'}
                  location={role.location || 'Remote'}
                  postedAt="Recent"
                  salary={role.salaryRange || 'Competitive'}
                  description={role.matchExplanation || 'Strong match based on verified skills and background.'}
                  tags={[
                    ...(role.matchScore ? [`${role.matchScore}% Match`] : []),
                    ...(role.workplaceType ? [role.workplaceType] : []),
                  ]}
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
