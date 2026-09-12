import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  SearchIcon,
  MoreVerticalIcon
} from '../../components/common/Icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PostJobModal from '../../components/employer/PostJobModal';
import PostJobWizard from '../../components/employer/PostJobWizard';
import TabSlider from '../../components/common/TabSlider';
import Button from '../../components/common/Button';
import PaginationControls from '../../components/common/PaginationControls';
import Input from '../../components/common/Input';
import Tag from '../../components/common/Tag';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import type { PostJobContinueConfig } from '../../types/rolePosting';
import { useEmployerJobsQuery } from '../../services/queries/employer';
import type { EmployerJobStatus, EmployerJobBadge } from '../../services/queries/employer/types';

// Map API status keys to Tag pill variants
const STATUS_VARIANT_MAP: Record<string, string> = {
  ACTIVE: 'green',
  ONGOING: 'blue',
  SCHEDULED: 'blue',
  HIRED: 'green',
  DRAFT: 'yellow',
  UNDER_REVIEW: 'yellow',
  CLOSED: 'gray',
  EXPIRED: 'gray',
  CANCELLED: 'gray',
};

// Map badge kind to Tag variant
const BADGE_VARIANT_MAP: Record<string, string> = {
  ALIGNMENT: 'blue-light',
  INTERVIEW: 'blue-light',
  ASSESSMENT: 'blue-light',
  VIDEO: 'blue-light',
  PSYCHOMETRIC: 'blue-light',
  SCHEDULED: 'blue-light',
  HIRED: 'green',
  DRAFT: 'yellow',
};

const getStatusVariant = (status: EmployerJobStatus | string): string => {
  return STATUS_VARIANT_MAP[status] || STATUS_VARIANT_MAP[status?.toUpperCase()] || 'gray';
};

const getBadgeVariant = (badge: EmployerJobBadge): string => {
  if (badge.variant === 'success') return 'green';
  if (badge.variant === 'warning') return 'yellow';
  if (badge.variant === 'info') return 'blue-light';
  return BADGE_VARIANT_MAP[badge.kind] || 'gray';
};

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const isEmployer = user?.role?.toLowerCase() === 'employer';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPostWizardOpen, setIsPostWizardOpen] = useState(false);
  const [wizardConfig, setWizardConfig] = useState<PostJobContinueConfig | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync URL tab param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveFilter(tab);
  }, [searchParams]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const { data: jobsData, isLoading } = useEmployerJobsQuery({
    filter: activeFilter,
    search: debouncedSearch,
    page: currentPage,
    limit: 20,
    enabled: isEmployer,
  });

  const filters = jobsData?.filters ?? [];
  const items = jobsData?.items ?? [];
  const pagination = jobsData?.pagination;

  // Build tab labels from API filters
  const filterTabs = useMemo(() => filters.map(f => f.label), [filters]);
  const filterKeyMap = useMemo(() => {
    const map: Record<string, string> = {};
    filters.forEach(f => { map[f.label] = f.key; });
    return map;
  }, [filters]);

  const activeTabLabel = useMemo(() => {
    return filters.find(f => f.key === activeFilter)?.label || filters[0]?.label || 'All jobs';
  }, [filters, activeFilter]);

  const handleTabChange = (label: string) => {
    const key = filterKeyMap[label] || 'all';
    setActiveFilter(key);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-medium text-[#0047CC] tracking-tight">Jobs</h1>
        {isEmployer && (
          <Button 
            onClick={() => setIsPostModalOpen(true)}
            fullWidth={false}
            size="md" className="px-6 text-[14px]"
          >
            <PlusIcon size={14} strokeWidth={3} />
            Post a job
          </Button>
        )}
      </div>

      {/* Filter Chips */}
      {filterTabs.length > 0 && (
        <TabSlider 
          tabs={filterTabs}
          activeTab={activeTabLabel}
          onTabChange={handleTabChange}
          renderTabExtra={(tab) => {
            const filter = filters.find(f => f.label === tab);
            if (!filter) return null;
            return (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                activeTabLabel === tab ? 'bg-blue-50 text-[#0047CC]' : 'bg-gray-100 text-gray-400'
              }`}>
                {filter.count}
              </span>
            );
          }}
        />
      )}

      {/* Search Bar */}
      <div className="w-full">
        <Input 
          label=""
          placeholder="Search jobs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={SearchIcon}
          className="rounded-xl shadow-sm border-gray-100"
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size={32} className="text-[#0047CC]" />
          <p className="text-[13px] font-medium text-gray-500">Loading jobs…</p>
        </div>
      ) : (
        <>
          {/* Table Container */}
          <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm">
            <div className="w-full">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <div className="flex-[3]">Job listings</div>
                <div className="flex-1">Job type</div>
                <div className="flex-[1.2]">Date posted</div>
                <div className="flex-[1.2]">Expiry date</div>
                <div className="w-32 text-center">Applicants</div>
                <div className="flex-1 pl-4">Status</div>
                <div className="w-10"></div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                {items.length > 0 ? (
                  items.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="px-6 lg:px-8 py-6 lg:py-5 flex flex-col lg:flex-row lg:items-center hover:bg-gray-50/50 transition-colors cursor-pointer group gap-4 lg:gap-0"
                    >
                      <div className="flex-[3] lg:pr-6">
                        <div className="flex items-start justify-between lg:block">
                          <p className="text-[15px] lg:text-[14px] font-medium text-gray-900 group-hover:text-[#0047CC] transition-colors">{job.roleTitle}</p>
                          <div className="lg:hidden">
                            <Tag label={job.displayStatus || job.status} variant={getStatusVariant(job.status) as any} />
                          </div>
                        </div>
                        {(job.organisationName || job.location) && (
                          <p className="text-[12px] lg:text-[11px] font-medium text-gray-400 mt-1">
                            {[job.organisationName, job.location].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {job.badges && job.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 lg:mt-2">
                            {job.badges.map((badge, i) => (
                              <Tag 
                                key={i} 
                                label={badge.text} 
                                variant={getBadgeVariant(badge) as any} 
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mobile-only info grid */}
                      <div className="grid grid-cols-2 gap-4 lg:hidden py-2 border-y border-gray-50/50 my-1">
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Type</p>
                          <p className="text-[13px] font-medium text-gray-600">{job.jobType || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Applicants</p>
                          <p className={`text-[13px] font-medium ${job.applicantCount ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                            {job.applicantCount ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Posted</p>
                          <p className="text-[13px] font-medium text-gray-400">{job.datePosted || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                          <p className="text-[13px] font-medium text-gray-400">{job.expiryDate || '—'}</p>
                        </div>
                      </div>

                      {/* Desktop columns */}
                      <div className="hidden lg:block flex-1 text-[13px] font-medium text-gray-600">{job.jobType || '—'}</div>
                      <div className="hidden lg:block flex-[1.2] text-[13px] font-medium text-gray-400">{job.datePosted || '—'}</div>
                      <div className="hidden lg:block flex-[1.2] text-[13px] font-medium text-gray-400">{job.expiryDate || '—'}</div>
                      <div className={`hidden lg:block w-32 text-center text-[14px] font-medium ${job.applicantCount ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                        {job.applicantCount ?? '—'}
                      </div>
                      <div className="hidden lg:block flex-1 pl-4">
                        <Tag label={job.displayStatus || job.status} variant={getStatusVariant(job.status) as any} />
                      </div>
                      <div className="flex justify-end lg:w-10">
                        <button className="text-gray-300 hover:text-gray-600 p-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <MoreVerticalIcon size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={BriefcaseIcon}
                    title="No jobs found"
                    description="Try adjusting your search or filters"
                  />
                )}
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-50 px-8 py-5 flex items-center justify-between">
              <p className="text-[12px] font-medium text-gray-400 tracking-tight">
                {pagination?.showingLabel || `Showing ${items.length} jobs`}
              </p>
              <PaginationControls
                currentPage={currentPage - 1}
                disablePrev={!pagination?.hasPreviousPage}
                disableNext={!pagination?.hasNextPage}
                onPageChange={(newPage) => setCurrentPage(newPage + 1)}
              />
            </div>
          </div>
        </>
      )}

      {isEmployer && (
        <>
          <PostJobModal 
            isOpen={isPostModalOpen} 
            onClose={() => setIsPostModalOpen(false)} 
            onContinue={(config) => {
              setIsPostModalOpen(false);
              setWizardConfig(config);
              setIsPostWizardOpen(true);
            }}
          />

          <PostJobWizard 
            isOpen={isPostWizardOpen} 
            onClose={() => setIsPostWizardOpen(false)} 
            initialConfig={wizardConfig}
          />
        </>
      )}
    </div>
  );
};

export default Jobs;
