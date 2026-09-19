import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  SearchIcon,
  MoreVerticalIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
} from '../../components/common/Icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PostJobModal from '../../components/employer/PostJobModal';
import PostJobWizard from '../../components/employer/PostJobWizard';
import TabSlider from '../../components/common/TabSlider';
import Button from '../../components/common/Button';
import PaginationControls from '../../components/common/PaginationControls';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Tag from '../../components/common/Tag';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import type { PostJobContinueConfig } from '../../types/rolePosting';
import { 
  useEmployerJobsQuery,
  useCloseEmployerJobMutation,
  useDeleteEmployerJobDraftMutation,
} from '../../services/queries/employer';
import type { 
  EmployerJobStatus, 
  EmployerJobBadge, 
  EmployerJobAction 
} from '../../services/queries/employer/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'LIVE', label: 'Live' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Map API status keys to Tag pill variants
const STATUS_VARIANT_MAP: Record<string, string> = {
  LIVE: 'green',
  ACTIVE: 'green',
  ONGOING: 'blue',
  SCHEDULED: 'blue',
  VAULT: 'blue',
  HIRED: 'green',
  DRAFT: 'yellow',
  UNDER_REVIEW: 'yellow',
  CLOSED: 'gray',
  EXPIRED: 'gray',
  CANCELLED: 'gray',
};

const formatStatusLabel = (status?: string, displayStatus?: string): string => {
  if (displayStatus) {
    const dUpper = displayStatus.toUpperCase().replace(/\s+/g, '_');
    if (dUpper === 'VAULT') return 'Scheduled';
    if (dUpper === 'ACTIVE') return 'Live';
    return displayStatus;
  }
  if (!status) return '—';
  const sUpper = status.toUpperCase().replace(/\s+/g, '_');
  switch (sUpper) {
    case 'LIVE':
    case 'ACTIVE':
      return 'Live';
    case 'VAULT':
    case 'SCHEDULED':
      return 'Scheduled';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'DRAFT':
      return 'Draft';
    case 'CLOSED':
      return 'Closed';
    case 'HIRED':
      return 'Hired';
    case 'ONGOING':
      return 'Ongoing';
    case 'EXPIRED':
      return 'Expired';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
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

const resolveJobActions = (job: any): EmployerJobAction[] => {
  if (job.actions && Array.isArray(job.actions) && job.actions.length > 0) {
    return job.actions;
  }

  const s = (job.status || '').toUpperCase();
  const isDraft = s === 'DRAFT';
  const isLive = s === 'LIVE' || s === 'ACTIVE';

  const actions: EmployerJobAction[] = [
    {
      type: 'VIEW_DETAILS',
      label: 'View details',
      enabled: true,
    },
    {
      type: isDraft ? 'CONTINUE_DRAFT' : 'EDIT',
      label: isDraft ? 'Continue draft' : 'Edit role',
      enabled: true,
    },
    {
      type: 'COPY_LINK',
      label: 'Copy link',
      url: job.shareUrl || job.roleLink || (isDraft ? undefined : `${window.location.origin}/jobs/${job.id}`),
      enabled: isDraft ? Boolean(job.shareUrl || job.roleLink) : true,
    },
  ];

  if (isLive) {
    actions.push({
      type: 'CLOSE_ROLE',
      label: 'Close role',
      enabled: true,
      destructive: true,
    });
  } else if (isDraft) {
    actions.push({
      type: 'DELETE_DRAFT',
      label: 'Delete draft',
      enabled: true,
      destructive: true,
    });
  } else {
    actions.push({
      type: 'CLOSE_ROLE',
      label: 'Close role',
      enabled: s !== 'CLOSED',
      destructive: true,
    });
  }

  return actions;
};

import TalentJobsView from '../../components/talent/TalentJobsView';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const isTalent = user?.role?.toUpperCase() === 'TALENT';

  if (isTalent) {
    return <TalentJobsView />;
  }

  const isEmployer = user?.role?.toLowerCase() === 'employer';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(() => {
    const s = searchParams.get('status')?.toUpperCase();
    if (s === 'VAULT') return 'SCHEDULED';
    if (s === 'ACTIVE') return 'LIVE';
    return s || 'ALL';
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPostWizardOpen, setIsPostWizardOpen] = useState(false);
  const [wizardConfig, setWizardConfig] = useState<PostJobContinueConfig | undefined>(undefined);
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const closeJobMutation = useCloseEmployerJobMutation();
  const deleteDraftMutation = useDeleteEmployerJobDraftMutation();

  // Close menu on click outside or Escape key, without an overlay that blocks scrolling
  useEffect(() => {
    if (!openMenuJobId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenuJobId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuJobId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuJobId]);

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, jobId: string) => {
    e.stopPropagation();
    setOpenMenuJobId((prev) => (prev === jobId ? null : jobId));
  };

  const handleActionClick = (action: EmployerJobAction, job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuJobId(null);

    if (action.enabled === false) return;

    const actionType = (action.type || '').toUpperCase();
    const actionLabel = (action.label || '').toLowerCase();

    if (actionType === 'VIEW_DETAILS' || actionLabel.includes('view details') || actionLabel.includes('view')) {
      navigate(`/jobs/${job.id}`);
      return;
    }

    if (
      actionType === 'EDIT' ||
      actionType === 'CONTINUE_DRAFT' ||
      actionLabel.includes('edit') ||
      actionLabel.includes('continue')
    ) {
      navigate(`/jobs/${job.id}?edit=true`);
      return;
    }

    if (actionType === 'COPY_LINK' || actionLabel.includes('copy link')) {
      const url = action.url || job.shareUrl || job.roleLink || `${window.location.origin}/jobs/${job.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Role link copied to clipboard!');
      return;
    }

    if (actionType === 'CLOSE_ROLE' || actionType === 'CLOSE' || actionLabel.includes('close')) {
      closeJobMutation.mutate(job.id);
      return;
    }

    if (actionType === 'DELETE_DRAFT' || actionType === 'DELETE' || actionLabel.includes('delete')) {
      deleteDraftMutation.mutate(job.id);
      return;
    }

    if (action.url) {
      window.open(action.url, '_blank');
    }
  };

  const renderOverflowMenu = (job: any) => {
    if (openMenuJobId !== job.id) return null;
    const actions = resolveJobActions(job);

    return (
      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-left">
        {actions.map((action, actionIdx) => {
          const isDestructive =
            action.destructive ||
            (action.type || '').toUpperCase().includes('DELETE') ||
            (action.type || '').toUpperCase().includes('CLOSE') ||
            (action.label || '').toLowerCase().includes('delete') ||
            (action.label || '').toLowerCase().includes('close');
          const isDisabled = action.enabled === false;

          const getActionIcon = () => {
            const t = (action.type || '').toUpperCase();
            const l = (action.label || '').toLowerCase();
            if (t === 'VIEW_DETAILS' || l.includes('view')) return <EyeIcon size={16} className="text-gray-400" />;
            if (t === 'EDIT' || t === 'CONTINUE_DRAFT' || l.includes('edit') || l.includes('continue'))
              return <EditIcon size={16} className="text-gray-400" />;
            if (t === 'COPY_LINK' || l.includes('copy'))
              return <LinkIcon size={16} className={isDisabled ? 'text-gray-300' : 'text-gray-400'} />;
            if (isDestructive) return <TrashIcon size={16} className={isDisabled ? 'text-gray-300' : 'text-red-500'} />;
            return <MoreVerticalIcon size={16} className="text-gray-400" />;
          };

          return (
            <React.Fragment key={action.id || `${action.type}-${actionIdx}`}>
              {isDestructive && actionIdx > 0 && <div className="border-t border-gray-100 my-1" />}
              <button
                type="button"
                disabled={isDisabled}
                onClick={(e) => handleActionClick(action, job, e)}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-[13px] font-medium transition-colors text-left ${
                  isDisabled
                    ? 'text-gray-300 cursor-not-allowed bg-transparent'
                    : isDestructive
                    ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                    : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {getActionIcon()}
                <span>{action.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const newParams = new URLSearchParams(searchParams);
    if (newStatus && newStatus !== 'ALL') {
      newParams.set('status', newStatus);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync URL tab and status params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveFilter(tab);
    const status = searchParams.get('status');
    if (status) {
      const sNorm = status.toUpperCase();
      if (sNorm === 'VAULT') setStatusFilter('SCHEDULED');
      else if (sNorm === 'ACTIVE') setStatusFilter('LIVE');
      else setStatusFilter(sNorm);
    }
  }, [searchParams]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, statusFilter]);

  const { data: jobsData, isLoading } = useEmployerJobsQuery({
    filter: activeFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: debouncedSearch,
    page: currentPage,
    limit: 20,
    enabled: isEmployer,
  });

  const filters = jobsData?.filters ?? [];
  const items = jobsData?.items ?? [];
  const pagination = jobsData?.pagination;

  // Filter items by status on client-side (fallback when offline/mocked)
  const filteredItems = useMemo(() => {
    if (!statusFilter || statusFilter === 'ALL') return items;
    const normFilter = statusFilter.toUpperCase().replace(/\s+/g, '_');
    return items.filter((job) => {
      const s = (job.status || '').toUpperCase().replace(/\s+/g, '_');
      const d = (job.displayStatus || '').toUpperCase().replace(/\s+/g, '_');
      if (normFilter === 'LIVE' || normFilter === 'ACTIVE') {
        return s === 'LIVE' || s === 'ACTIVE' || d === 'LIVE' || d === 'ACTIVE';
      }
      if (normFilter === 'SCHEDULED' || normFilter === 'VAULT') {
        return s === 'SCHEDULED' || s === 'VAULT' || d === 'SCHEDULED' || d === 'VAULT';
      }
      return s === normFilter || d === normFilter;
    });
  }, [items, statusFilter]);

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

      {/* Search Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <div className="flex-1">
          <Input 
            label=""
            placeholder="Search jobs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
            className="rounded-xl shadow-sm border-gray-100"
          />
        </div>
        <div className="w-full sm:w-52 shrink-0">
          <Select
            label=""
            hideLabel
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            options={STATUS_OPTIONS}
            className="rounded-xl shadow-sm border-gray-100 py-3 text-[14px] bg-white"
            menuClassName="z-50 shadow-xl border-gray-100 rounded-xl"
          />
        </div>
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
          <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="w-full">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50 rounded-t-[24px]">
                <div className="flex-[3]">Job listings</div>
                <div className="flex-1 text-center">Job type</div>
                <div className="flex-[1.2] text-center">Date posted</div>
                <div className="flex-[1.2] text-center">Expiry date</div>
                <div className="w-32 text-center">Applicants</div>
                <div className="flex-1 text-right pr-2">Status</div>
                <div className="w-8"></div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                {filteredItems.length > 0 ? (
                  filteredItems.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="px-6 lg:px-8 py-6 lg:py-5 flex flex-col lg:flex-row lg:items-center hover:bg-gray-50/50 transition-colors cursor-pointer group gap-4 lg:gap-0"
                    >
                      <div className="flex-[3] lg:pr-6">
                        <div className="flex items-start justify-between gap-2 lg:block">
                          <p className="text-[15px] lg:text-[14px] font-medium text-gray-900 group-hover:text-[#0047CC] transition-colors">{job.roleTitle}</p>
                          <div className="flex items-center gap-2 shrink-0 lg:hidden" onClick={(e) => e.stopPropagation()}>
                            <Tag label={formatStatusLabel(job.status, job.displayStatus)} variant={getStatusVariant(job.status) as any} />
                            <div 
                              ref={openMenuJobId === job.id ? menuContainerRef : undefined}
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => handleToggleMenu(e, job.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="More options"
                              >
                                <MoreVerticalIcon size={18} />
                              </button>

                              {renderOverflowMenu(job)}
                            </div>
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
                      <div className="hidden lg:block flex-1 text-center text-[13px] font-medium text-gray-600">{job.jobType || '—'}</div>
                      <div className="hidden lg:block flex-[1.2] text-center text-[13px] font-medium text-gray-400">{job.datePosted || '—'}</div>
                      <div className="hidden lg:block flex-[1.2] text-center text-[13px] font-medium text-gray-400">{job.expiryDate || '—'}</div>
                      <div className={`hidden lg:block w-32 text-center text-[14px] font-medium ${job.applicantCount ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                        {job.applicantCount ?? '—'}
                      </div>
                      <div className="hidden lg:flex flex-1 justify-end">
                        <Tag label={formatStatusLabel(job.status, job.displayStatus)} variant={getStatusVariant(job.status) as any} />
                      </div>

                      {/* Desktop 3-dots Action Menu */}
                      <div 
                        ref={openMenuJobId === job.id ? menuContainerRef : undefined}
                        className="hidden lg:flex items-center justify-end w-8 ml-2 relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleToggleMenu(e, job.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <MoreVerticalIcon size={18} />
                        </button>

                        {renderOverflowMenu(job)}
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
            <div className="border-t border-gray-50 px-8 py-5 flex items-center justify-between rounded-b-[24px]">
              <p className="text-[12px] font-medium text-gray-400 tracking-tight">
                {statusFilter !== 'ALL'
                  ? `Showing ${filteredItems.length} of ${items.length} jobs`
                  : pagination?.showingLabel || `Showing ${items.length} jobs`}
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
