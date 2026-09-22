import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BuildingIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  DollarSignIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  ClockIcon
} from '../common/Icons';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Tag from '../common/Tag';
import { useTalentJobDetailQuery } from '../../services/queries/talent';

const STAGE_TITLES: Record<string, string> = {
  GATE_1: 'Gate 1: Culture & Context (Async Assessment)',
  GATE_2: 'Gate 2: Technical Knowledge & Reasoning',
  GATE_3: 'Gate 3: Live Video Session',
  HIRED: 'Hired / Offer Received',
  REJECTED: 'Application Closed',
};

export const TalentJobDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useTalentJobDetailQuery(id || '');
  const job = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-gray-500">Loading role details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xs">
          <p className="text-gray-900 font-medium text-lg">Job posting not found</p>
          <p className="text-gray-500 text-sm mt-1">This role may have been closed or removed.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  const roleSlug = job.company?.companySlug || job.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const formatSalary = (min?: number | null, max?: number | null, currency?: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const sym = curr === 'USD' ? '$' : curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : `${curr} `;
    if (min && max) return `${sym}${(min / 1000).toFixed(0)}k - ${sym}${(max / 1000).toFixed(0)}k / year`;
    if (min) return `From ${sym}${(min / 1000).toFixed(0)}k / year`;
    return `Up to ${sym}${(max! / 1000).toFixed(0)}k / year`;
  };

  const handleApplyOrContinue = () => {
    if (job.application?.assessmentId) {
      localStorage.setItem('vora_assessment_id', job.application.assessmentId);
      localStorage.setItem('active_assessment_id', job.application.assessmentId);
    }
    const rolePostingId = job.rolePostingId || job.id;
    if (rolePostingId) {
      localStorage.setItem('vora_role_posting_id', rolePostingId);
    }
    localStorage.setItem('active_assessment_role_slug', roleSlug);

    if (job.hasApplied && job.application) {
      const stage = job.application.currentStage;
      if (stage === 'GATE_3') {
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-3`);
      } else if (stage === 'GATE_2') {
        navigate(`/onboarding/talent/${roleSlug}/interview/stage-2`);
      } else {
        navigate(`/onboarding/talent/${roleSlug}/interview/journey`);
      }
    } else {
      navigate(`/onboarding/talent/${roleSlug}/match`);
    }
  };

  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  // Normalize requirements / responsibilities if they are strings vs arrays
  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === 'string'
    ? job.requirements.split('\n').filter(Boolean)
    : [];

  const responsibilitiesList = Array.isArray(job.responsibilities)
    ? job.responsibilities
    : typeof job.responsibilities === 'string'
    ? job.responsibilities.split('\n').filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon size={16} />
        Back to Opportunities
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {job.company?.companyLogo ? (
              <img 
                src={job.company.companyLogo} 
                alt={job.company.companyName} 
                className="w-16 h-16 rounded-2xl object-contain bg-gray-50 border border-gray-100 p-2 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                {job.company?.companyName ? job.company.companyName.charAt(0) : 'V'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-blue-600">{job.company?.companyName || 'Verified Employer'}</p>
                {job.company?.website && (
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLinkIcon size={12} />
                  </a>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">{job.roleTitle}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-600">
                {job.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon size={14} className="text-gray-400" />
                    {job.location}
                  </span>
                )}
                {job.department && (
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon size={14} className="text-gray-400" />
                    {job.department}
                  </span>
                )}
                {job.employmentType && (
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {job.experienceLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            {salaryText && (
              <p className="text-lg sm:text-xl font-bold text-gray-900">{salaryText}</p>
            )}
            <Button
              variant="primary"
              onClick={handleApplyOrContinue}
              className="px-6 py-2.5 shadow-sm hover:shadow font-semibold"
            >
              {job.hasApplied ? (
                <>
                  Continue Assessment
                  <ArrowRightIcon size={16} />
                </>
              ) : (
                <>
                  Apply & Assess Compatibility
                  <ArrowRightIcon size={16} />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Application Status Banner (if applied) */}
        {job.hasApplied && job.application && (
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <CheckCircleIcon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Application in Progress</p>
                <p className="text-xs text-blue-700">
                  Current: {job.application.currentStage ? STAGE_TITLES[job.application.currentStage] || job.application.currentStage : 'Under Assessment'}
                </p>
              </div>
            </div>

            {typeof job.application.stageProgress === 'number' && (
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className="flex-1 bg-blue-200/60 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, Math.max(0, job.application.stageProgress))}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-blue-800">{job.application.stageProgress}%</span>
              </div>
            )}
          </div>
        )}

        {/* Match compatibility info (if available) */}
        {typeof job.matchScore === 'number' && (
          <div className="bg-green-50/70 border border-green-200/60 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <SparklesIcon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                {job.matchScore}% Match with your verified profile
              </p>
              <p className="text-xs text-green-700">
                Your skills and background strongly align with the requirements for this role.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {job.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-gray-900">About the Role</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {responsibilitiesList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-gray-900">Key Responsibilities</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {responsibilitiesList.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {requirementsList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-gray-900">Requirements & Qualifications</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {requirementsList.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Skills & Company Details */}
        <div className="space-y-6">
          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-gray-900">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span 
                    key={i}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Details */}
          {job.company && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-gray-900">About {job.company.companyName}</h2>
              {job.company.industry && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Industry</p>
                  <p className="text-sm font-semibold text-gray-800">{job.company.industry}</p>
                </div>
              )}
              {job.company.website && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">Website</p>
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    {job.company.website.replace(/^https?:\/\//, '')}
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Bottom CTA Card */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white space-y-4 shadow-sm">
            <h3 className="text-base font-bold">Ready to take the next step?</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Complete the structured assessment gates to demonstrate your domain mastery directly to hiring teams.
            </p>
            <button
              type="button"
              onClick={handleApplyOrContinue}
              className="w-full py-2.5 px-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-xs flex items-center justify-center cursor-pointer text-sm"
            >
              {job.hasApplied ? 'Continue Assessment' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentJobDetailsView;
