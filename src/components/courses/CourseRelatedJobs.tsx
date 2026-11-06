import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getRelatedJobsForCourse,
  getCleanCompanyInitials,
  formatSalaryRange,
  type CourseRelatedJob,
} from '../../utils/courseJobs';
import { useQualifyingJobsQuery } from '../../services/queries/courses';
import {
  BriefcaseIcon,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon,
  ArrowRightIcon,
  CloseIcon,
  DollarSignIcon,
  SparklesIcon,
} from '../common/Icons';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';

interface CourseRelatedJobsProps {
  courseTitle?: string;
  category?: string;
  courseId?: string;
  isCompact?: boolean;
  qualifyingJobs?: any[];
  limit?: number;
}

export const CourseRelatedJobs: React.FC<CourseRelatedJobsProps> = ({
  courseTitle,
  category,
  courseId,
  isCompact = false,
  qualifyingJobs,
  limit = 3,
}) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { data: fetchedQualifyingJobs } = useQualifyingJobsQuery(courseId, 12);

  const rawQualifyingJobs = (qualifyingJobs && qualifyingJobs.length > 0)
    ? qualifyingJobs
    : (fetchedQualifyingJobs && fetchedQualifyingJobs.length > 0)
    ? fetchedQualifyingJobs
    : null;

  const jobs: CourseRelatedJob[] = useMemo(() => {
    if (!rawQualifyingJobs || rawQualifyingJobs.length === 0) {
      return [];
    }

    return rawQualifyingJobs.map((bj: any, idx: number) => {
      const employer = bj.employer || {};
      const company = employer.organisationName || bj.company || bj.companyName || 'Verified Employer';
      const roleLink = bj.roleLink || bj.slug || bj.id || `role-${idx}`;
      const title = bj.roleTitle || bj.title || 'Role Opportunity';
      const initials = employer.initials || getCleanCompanyInitials(company);
      const logoUrl = employer.logoUrl || bj.companyLogo || bj.companyLogoUrl || null;
      const isVerified = employer.verified ?? bj.isVerifiedEmployer ?? true;
      const salaryFormatted = bj.salaryFormatted || bj.salary || '';

      const workFormat = bj.workFormat;
      const workArrangement: 'Remote' | 'Hybrid' | 'On-site' =
        workFormat === 'HYBRID' ? 'Hybrid' : workFormat === 'ON_SITE' ? 'On-site' : 'Remote';

      const location = bj.locationFormatted || bj.location || 'Remote';

      const badgeRaw = String(bj.badge || '').toLowerCase();
      const badgeType: 'top_match' | 'actively_hiring' | null =
        badgeRaw.includes('top')
          ? 'top_match'
          : badgeRaw.includes('active')
          ? 'actively_hiring'
          : null;

      const matchedSkills = Array.isArray(bj.matchedSkills) && bj.matchedSkills.length > 0
        ? bj.matchedSkills
        : (Array.isArray(bj.skills) ? bj.skills : (Array.isArray(bj.allRequiredSkills) ? bj.allRequiredSkills.slice(0, 3) : []));

      return {
        id: bj.id || roleLink,
        slug: roleLink,
        title,
        companyName: company,
        companyInitials: initials,
        companyLogoUrl: logoUrl || undefined,
        isVerifiedEmployer: isVerified,
        salaryMin: bj.salaryMin,
        salaryMax: bj.salaryMax,
        salaryFormatted: salaryFormatted || undefined,
        salaryPeriod: bj.salaryPeriod || 'year',
        currency: bj.currency || 'USD',
        location,
        workArrangement,
        matchedSkills,
        description: bj.description || bj.summary || '',
        badgeType,
        badgeLabel: bj.badge || 'Target Role',
        isApplied: false,
      };
    });
  }, [rawQualifyingJobs]);

  const displayedJobs = useMemo(() => jobs.slice(0, limit), [jobs, limit]);

  const [selectedJobForUpgrade, setSelectedJobForUpgrade] =
    useState<CourseRelatedJob | null>(null);

  if (jobs.length === 0) {
    return null;
  }

  const isLearner = Boolean(
    (user as any)?.isLearner ||
    (typeof window !== 'undefined' && localStorage.getItem('vora_user_track') === 'learner')
  );

  const handleCardClick = (job: CourseRelatedJob) => {
    navigate(`/role/${job.slug}`);
  };

  const handleViewJobClick = (e: React.MouseEvent, job: CourseRelatedJob) => {
    e.stopPropagation();
    navigate(`/role/${job.slug}`);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedJobForUpgrade) return;
    const job = selectedJobForUpgrade;

    // 1. Preserve course bookmark / context so they never lose their course progress
    if (courseId) {
      try {
        localStorage.setItem('vora_active_learning_course_id', courseId);
      } catch {
        /* ignore */
      }
    }

    // 2. Seamlessly graduate user to full Talent status
    if (user) {
      updateUser({
        ...user,
        isLearner: false,
      });
      try {
        localStorage.setItem('vora_user_track', 'talent');
      } catch {
        /* ignore */
      }
    }

    // 3. Close modal and route directly to CV upload for this specific role
    setSelectedJobForUpgrade(null);
    toast.success(
      `Course progress saved! Upload your CV to complete your application for ${job.title}.`,
      { duration: 4500 }
    );
    navigate(`/onboarding/talent/${job.slug}/cv`);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100 text-xs font-semibold mb-2">
            <BriefcaseIcon size={14} className="text-[#0047CC]" />
            <span>Career Pathways &amp; Verified Roles</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Jobs You Can Qualify For With This Course
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mt-1">
            Employers partner directly with VORA to hire talent based on the verified skills taught in this curriculum. Complete your course to unlock fast-track interview representation.
          </p>
        </div>
      </div>

      {/* Jobs Grid: Equal heights and fixed vertical alignment */}
      <div
        className={`grid grid-cols-1 ${
          isCompact ? 'gap-4' : 'sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch'
        }`}
      >
        {displayedJobs.map((job) => {
          const visibleSkills = job.matchedSkills.slice(0, 3);
          const hiddenSkillsCount = Math.max(0, job.matchedSkills.length - 3);

          return (
            <div
              key={job.id}
              onClick={() => handleCardClick(job)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(job);
                }
              }}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20 text-left"
            >
              <div className="flex flex-col">
                {/* Slot 1: Top Row with Logo & Badge (Fixed height to guarantee baseline alignment) */}
                <div className="flex items-center justify-between gap-3 mb-3.5 min-h-[36px]">
                  {/* Employer Logo / Contained Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {job.companyLogoUrl ? (
                      <img
                        src={job.companyLogoUrl}
                        alt={job.companyName}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-bold text-xs text-slate-700">
                        {job.companyInitials}
                      </span>
                    )}
                  </div>

                  {/* Badge System (Priority: Top Skill Match > Actively Hiring) */}
                  <div className="min-h-[26px] flex items-center">
                    {job.badgeType === 'top_match' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                        <SparklesIcon size={12} className="text-indigo-600" />
                        <span>Top Skill Match</span>
                      </span>
                    ) : job.badgeType === 'actively_hiring' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200/60 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0047CC] animate-pulse" />
                        <span>Actively Hiring</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/70">
                        {job.badgeLabel || 'Target Role'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Slot 2: Company Name Row with Full Width + Verified Check Icon */}
                <div
                  className="flex items-center gap-1.5 mb-1.5 min-w-0"
                  title={`${job.companyName}${job.isVerifiedEmployer ? ' (Verified Employer on VORA)' : ''}`}
                >
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {job.companyName}
                  </span>
                  {job.isVerifiedEmployer && (
                    <span
                      title="Verified Employer on VORA"
                      className="text-[#0047CC] inline-flex items-center shrink-0"
                    >
                      <CheckCircleIcon size={14} className="text-[#0047CC]" />
                    </span>
                  )}
                </div>

                {/* Slot 3: Role Title (Fixed 2-line height so titles always line up) */}
                <h3
                  className="text-[17px] sm:text-[18px] font-semibold text-slate-900 group-hover:text-[#0047CC] transition-colors leading-snug line-clamp-2 h-[48px] mb-3"
                  title={job.title}
                >
                  {job.title}
                </h3>

                {/* Slot 4: Unified Salary & Work Mode (Consistent plain text lines with icons) */}
                <div className="space-y-1 text-xs mb-4 min-h-[44px]">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <DollarSignIcon size={13} className="text-slate-400 shrink-0" />
                    <span>
                      {job.salaryFormatted ||
                        formatSalaryRange(
                          job.salaryMin,
                          job.salaryMax,
                          job.salaryPeriod,
                          job.currency
                        )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-normal">
                    <MapPinIcon size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {job.workArrangement} · {job.location}
                    </span>
                  </div>
                </div>

                {/* Slot 5: Skills Taught In This Course (Neutral, inline flow, zero green) */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Skills taught in this course
                  </p>
                  <div className="flex flex-wrap gap-1.5 min-h-[56px] content-start">
                    {visibleSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700 font-medium"
                      >
                        <CheckIcon size={10} className="text-slate-400 shrink-0 stroke-[2.5]" />
                        <span>{skill}</span>
                      </span>
                    ))}
                    {hiddenSkillsCount > 0 && (
                      <span
                        className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-500 font-medium border border-slate-200"
                        title={job.matchedSkills.slice(3).join(', ')}
                      >
                        +{hiddenSkillsCount} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot 6: Single Divider + Consistent 44px–48px Action Button */}
              <div className="pt-3.5 border-t border-slate-100 mt-auto">
                {job.isApplied ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckIcon size={12} className="text-slate-500" />
                    <span>Applied</span>
                  </button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    pill={false}
                    onClick={(e) => handleViewJobClick(e, job)}
                    className="rounded-xl font-semibold text-xs sm:text-sm h-11 bg-[#0047CC] hover:bg-[#0039A6] active:scale-[0.99] text-white flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20"
                  >
                    <span>View Job</span>
                    <ArrowRightIcon size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion & Upgrade Modal: Smooth transition to Full Talent without losing course progress */}
      {selectedJobForUpgrade && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedJobForUpgrade(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <CloseIcon size={18} />
            </button>

            {/* Header Icon & Title */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0047CC] border border-blue-100 flex items-center justify-center shadow-2xs">
                <BriefcaseIcon size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
                Fast-Track Interview Representation
              </h3>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                You&apos;re learning verified skills for this position! Complete your talent profile (upload your CV &amp; work eligibility) to submit your application for <strong className="font-semibold text-slate-800">{selectedJobForUpgrade.title}</strong> at <strong className="font-semibold text-slate-800">{selectedJobForUpgrade.companyName}</strong> and unlock direct employer representation.
              </p>
            </div>

            {/* Reassurance Checklist */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={11} strokeWidth={3} className="text-[#0047CC]" />
                </div>
                <div>
                  <strong className="font-semibold text-slate-900 block">Your course progress is 100% saved</strong>
                  <span className="text-slate-600">You keep full access to your lessons, notes, and completion certificate.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={11} strokeWidth={3} className="text-[#0047CC]" />
                </div>
                <div>
                  <strong className="font-semibold text-slate-900 block">Unlocks verified employer representation</strong>
                  <span className="text-slate-600">Uploading your CV activates your full Talent Profile so employers can interview and hire you.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={11} strokeWidth={3} className="text-[#0047CC]" />
                </div>
                <div>
                  <strong className="font-semibold text-slate-900 block">Instant Match Score generation</strong>
                  <span className="text-slate-600">VORA compares your CV and course competencies against this role in seconds.</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                pill={false}
                onClick={handleConfirmUpgrade}
                className="rounded-xl font-bold text-sm h-12 bg-[#0047CC] hover:bg-[#0039A6] text-white shadow-xs cursor-pointer"
              >
                Complete Profile &amp; Apply
              </Button>
              <button
                type="button"
                onClick={() => setSelectedJobForUpgrade(null)}
                className="w-full py-2.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
              >
                Continue as Talent &amp; Decide Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRelatedJobs;
