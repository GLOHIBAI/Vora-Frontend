import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  ArrowRightIcon
} from '../common/Icons';
import TabSlider from '../common/TabSlider';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import Tag from '../common/Tag';
import Button from '../common/Button';
import { useTalentJobsQuery } from '../../services/queries/talent';
import type { TalentJobListItem } from '../../types/talentJobs';

const STAGE_LABELS: Record<string, string> = {
  GATE_1: 'Gate 1: Culture & Context',
  GATE_2: 'Gate 2: Technical Assessment',
  GATE_3: 'Gate 3: Live Video Session',
  HIRED: 'Offer Extended / Hired',
  REJECTED: 'Application Closed',
};

const STAGE_VARIANTS: Record<string, 'blue-light' | 'yellow' | 'purple' | 'green' | 'gray'> = {
  GATE_1: 'blue-light',
  GATE_2: 'yellow',
  GATE_3: 'purple',
  HIRED: 'green',
  REJECTED: 'gray',
};

export const TalentJobsView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'applied'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  const { data: response, isLoading, isError, refetch } = useTalentJobsQuery();
  const jobsData = response?.data;

  const appliedJobs = useMemo(() => jobsData?.appliedJobs || [], [jobsData]);
  const availableJobs = useMemo(() => jobsData?.availableJobs || [], [jobsData]);

  const departments = useMemo(() => {
    const list = activeTab === 'available' ? availableJobs : appliedJobs;
    const deps = new Set<string>();
    list.forEach(j => {
      if (j.department) deps.add(j.department);
    });
    return ['ALL', ...Array.from(deps)];
  }, [activeTab, availableJobs, appliedJobs]);

  const filteredJobs = useMemo(() => {
    const list = activeTab === 'available' ? availableJobs : appliedJobs;
    return list.filter(job => {
      const matchSearch = 
        !searchQuery ||
        job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchDept = 
        selectedDepartment === 'ALL' || 
        job.department?.toLowerCase() === selectedDepartment.toLowerCase();

      return matchSearch && matchDept;
    });
  }, [activeTab, availableJobs, appliedJobs, searchQuery, selectedDepartment]);

  const formatSalary = (min?: number | null, max?: number | null, currency?: string | null) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    const sym = curr === 'USD' ? '$' : curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : `${curr} `;
    if (min && max) return `${sym}${(min / 1000).toFixed(0)}k - ${sym}${(max / 1000).toFixed(0)}k`;
    if (min) return `From ${sym}${(min / 1000).toFixed(0)}k`;
    return `Up to ${sym}${(max! / 1000).toFixed(0)}k`;
  };

  const handleJobClick = (job: TalentJobListItem) => {
    if (job.assessmentId) {
      localStorage.setItem('vora_assessment_id', job.assessmentId);
      localStorage.setItem('active_assessment_id', job.assessmentId);
    }
    const slug = job.companySlug || job.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    localStorage.setItem('active_assessment_role_slug', slug);

    navigate(`/jobs/${job.id}`);
  };

  const handleResumeAssessment = (job: TalentJobListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.assessmentId) {
      localStorage.setItem('vora_assessment_id', job.assessmentId);
      localStorage.setItem('active_assessment_id', job.assessmentId);
    }
    const slug = job.companySlug || job.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    localStorage.setItem('active_assessment_role_slug', slug);

    if (job.currentStage === 'GATE_3') {
      navigate(`/onboarding/talent/${slug}/interview/stage-3`);
    } else if (job.currentStage === 'GATE_2') {
      navigate(`/onboarding/talent/${slug}/interview/stage-2`);
    } else {
      navigate(`/onboarding/talent/${slug}/interview/journey`);
    }
  };

  const tabOptions = [`Available Roles (${availableJobs.length})`, `My Applications (${appliedJobs.length})`];
  const currentTabLabel = activeTab === 'available' ? tabOptions[0] : tabOptions[1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Opportunities & Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse verified job roles, view match compatibility, and track your assessment progress.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <TabSlider 
          tabs={tabOptions} 
          activeTab={currentTabLabel} 
          onTabChange={(tab: string) => {
            setActiveTab(tab.startsWith('Available') ? 'available' : 'applied');
            setSelectedDepartment('ALL');
          }} 
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Input 
            label=""
            placeholder="Search by role title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
          />
        </div>
        {departments.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedDepartment === dept
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-24 space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-gray-500">Loading opportunities...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white border border-red-100 rounded-2xl">
          <p className="text-red-600 font-medium">Failed to load opportunities.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title={activeTab === 'applied' ? 'No applications yet' : 'No matching opportunities found'}
          description={
            activeTab === 'applied'
              ? 'Explore available roles and apply to start your assessment journey.'
              : searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'New verified job postings are added regularly.'
          }
          action={
            activeTab === 'applied'
              ? {
                  label: 'Browse Available Roles',
                  onClick: () => setActiveTab('available'),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
            const isApplied = activeTab === 'applied' || Boolean(job.appliedAt);

            return (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar: Company & Match Score */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {job.companyLogo ? (
                        <img 
                          src={job.companyLogo} 
                          alt={job.companyName ?? 'Company'} 
                          className="w-10 h-10 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {job.companyName?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">{job.companyName ?? 'Unknown Company'}</p>
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {job.roleTitle}
                        </h3>
                      </div>
                    </div>

                    {typeof job.matchScore === 'number' && (
                      <div className="shrink-0 flex items-center bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <span>{job.matchScore}% Match</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-600">
                    {job.location && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        <MapPinIcon size={12} className="text-gray-400" />
                        {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md uppercase text-[10px] tracking-wide font-medium">
                        {job.employmentType.replace('_', ' ')}
                      </span>
                    )}
                    {job.department && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        {job.department}
                      </span>
                    )}
                    {salaryText && (
                      <span className="inline-flex items-center font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded-md">
                        {salaryText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Application Progress or Action */}
                <div className="border-t border-gray-50 pt-3 mt-2">
                  {isApplied ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Stage Progress:</span>
                        <Tag 
                          variant={(job.currentStage && STAGE_VARIANTS[job.currentStage]) || 'blue-light'} 
                          label={(job.currentStage && STAGE_LABELS[job.currentStage]) || job.currentStage || 'Application Submitted'}
                        />
                      </div>

                      {typeof job.stageProgress === 'number' && (
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, job.stageProgress))}%` }}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-400">
                          {job.appliedAt ? `Applied ${new Date(job.appliedAt).toLocaleDateString()}` : 'In progress'}
                        </span>
                        <button
                          onClick={(e) => handleResumeAssessment(job, e)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          Continue
                          <ArrowRightIcon size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Verified Role</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        View Role
                        <ArrowRightIcon size={12} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TalentJobsView;
