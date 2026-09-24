import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  ArrowRightIcon,
  SparklesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '../common/Icons';
import TabSlider from '../common/TabSlider';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import Tag from '../common/Tag';
import Button from '../common/Button';
import { useTalentJobsQuery } from '../../services/queries/talent';
import type { 
  TalentAppliedJob, 
  TalentAvailableJob 
} from '../../types/talentJobs';

const ITEMS_PER_PAGE = 9;

const formatTagLabel = (tag: string): string => {
  const map: Record<string, string> = {
    HYBRID: 'Hybrid',
    REMOTE_NO_TIMEZONE: 'Remote (Any Timezone)',
    REMOTE_TIMEZONE: 'Remote (Timezone Bound)',
    FLEXIBLE: 'Flexible',
    SENIOR: 'Senior',
    MID: 'Mid-Level',
    ENTRY: 'Entry-Level',
    STUDENT_GRADUATE: 'Student / Graduate',
    EXECUTIVE: 'Executive',
  };
  return map[tag] || tag.replace(/_/g, ' ');
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'blue-light' | 'yellow' | 'purple' | 'green' | 'gray' | 'red' | 'orange' }> = {
  IN_PROGRESS: { label: 'In Progress', variant: 'blue-light' },
  COMPLETED: { label: 'Completed', variant: 'green' },
  PASSED: { label: 'Passed', variant: 'green' },
  FAILED: { label: 'Failed', variant: 'orange' },
  REJECTED: { label: 'Rejected', variant: 'red' },
  INELIGIBLE: { label: 'Ineligible', variant: 'purple' },
  HIRED: { label: 'Hired', variant: 'green' },
};

/**
 * Grade badge colour: B1/B2 = green, C1/C2 = blue, D = yellow, E/F = gray
 */
const GRADE_VARIANT: Record<string, string> = {
  B1: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  B2: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  C1: 'bg-blue-50 text-blue-700 border-blue-200/80',
  C2: 'bg-blue-50 text-blue-700 border-blue-200/80',
  D: 'bg-amber-50 text-amber-700 border-amber-200/80',
  E: 'bg-gray-50 text-gray-600 border-gray-200/80',
  F: 'bg-gray-50 text-gray-500 border-gray-200/80',
};

export const TalentJobsView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'applied'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Tag scrolling state
  const tagScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ── Data fetch ──────────────────────────────────────────────────────────────
  // When matching.queued === true, refetch after ~10s so freshly matched roles appear.
  const { data: response, isLoading, isError, refetch } = useTalentJobsQuery({
    refetchInterval: (query: { state: { data?: any } }) => {
      const d = query?.state?.data?.data ?? query?.state?.data;
      return d?.matching?.queued ? 10_000 : false;
    },
  });
  const jobsData = response?.data;

  const appliedJobs = useMemo<TalentAppliedJob[]>(() => jobsData?.appliedJobs || [], [jobsData]);
  // Available Roles — max 3 pre-matched cards from the backend (never paginated)
  const availableJobs = useMemo<TalentAvailableJob[]>(() => (jobsData?.availableJobs || []).slice(0, 3), [jobsData]);
  const matchedCount = jobsData?.metrics?.availableMatchedCount ?? availableJobs.length;
  const talentGrade = jobsData?.talentGrade;
  const matchingQueued = jobsData?.matching?.queued === true;
  const matchingHint = jobsData?.matching?.hint;

  // Dynamically extract all available tags from the active list
  const availableTags = useMemo(() => {
    // Tags filtering only relevant for applied (available tab is max 3, no need for filters)
    const list = activeTab === 'available' ? availableJobs : appliedJobs;
    const tagSet = new Set<string>();
    list.forEach(j => {
      if (Array.isArray(j.tags)) {
        j.tags.forEach(t => tagSet.add(t));
      }
    });
    return ['ALL', ...Array.from(tagSet)];
  }, [activeTab, availableJobs, appliedJobs]);

  // Check scroll position of tag filter container
  const checkTagScroll = () => {
    const el = tagScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkTagScroll();
    window.addEventListener('resize', checkTagScroll);
    return () => window.removeEventListener('resize', checkTagScroll);
  }, [availableTags]);

  const handleScrollTags = (direction: 'left' | 'right') => {
    const el = tagScrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkTagScroll, 250);
  };

  // Filter jobs by search & tag (only used for applied tab; available shows all ≤3)
  const filteredApplied = useMemo(() => {
    return appliedJobs.filter(job => {
      const orgName = job.organisationName || (job as any).companyName || '';
      const tagsString = Array.isArray(job.tags) ? job.tags.join(' ') : '';
      const compensation = job.compensationSummary || '';
      
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        job.roleTitle.toLowerCase().includes(q) ||
        orgName.toLowerCase().includes(q) ||
        (job.location && job.location.toLowerCase().includes(q)) ||
        tagsString.toLowerCase().includes(q) ||
        compensation.toLowerCase().includes(q);

      const matchTag = 
        selectedTag === 'ALL' || 
        (Array.isArray(job.tags) && job.tags.includes(selectedTag));

      return matchSearch && matchTag;
    });
  }, [appliedJobs, searchQuery, selectedTag]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, activeTab]);

  // Pagination calculations (applied tab only)
  const totalPages = Math.ceil(filteredApplied.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplied = useMemo(() => {
    return filteredApplied.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredApplied, startIndex]);

  // Navigate to resume or view assessment
  const handleResumeAssessment = (job: TalentAppliedJob, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (job.assessmentId) {
      localStorage.setItem('vora_assessment_id', job.assessmentId);
      localStorage.setItem('active_assessment_id', job.assessmentId);
    }
    if (job.rolePostingId) {
      localStorage.setItem('vora_role_posting_id', job.rolePostingId);
    }
    const slug = job.roleLink || job.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    localStorage.setItem('active_assessment_role_slug', slug);

    const stageNum = job.stage?.current;
    const stageName = (job.stage?.name || '').toLowerCase();

    if (stageNum === 3 || stageName.includes('show up') || stageName.includes('video')) {
      navigate(`/onboarding/talent/${slug}/interview/stage-3`);
    } else if (stageNum === 2 || stageName.includes('technical') || stageName.includes('knowledge')) {
      navigate(`/onboarding/talent/${slug}/interview/stage-2`);
    } else if (stageNum === 1 || stageName.includes('culture') || stageName.includes('context')) {
      navigate(`/onboarding/talent/${slug}/interview/stage-1`);
    } else {
      navigate(`/onboarding/talent/${slug}/interview/journey`);
    }
  };

  const handleAvailableJobClick = (job: TalentAvailableJob) => {
    if (job.rolePostingId) {
      localStorage.setItem('vora_role_posting_id', job.rolePostingId);
    }
    const slug = job.roleLink || job.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    localStorage.setItem('active_assessment_role_slug', slug);

    // Direct to public role landing page to review details and begin match
    navigate(`/role/${slug}`);
  };

  const tabOptions = [
    `Available Roles (${matchedCount})`, 
    `My Applications (${appliedJobs.length})`
  ];
  const currentTabLabel = activeTab === 'available' ? tabOptions[0] : tabOptions[1];

  // Whether to show search/filter UI (only for applied tab, available is ≤3 cards)
  const showFilters = activeTab === 'applied';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Opportunities & Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse verified job roles, view match compatibility, and track your assessment progress.
          </p>
        </div>
        {/* Talent Grade Badge */}
        {talentGrade?.grade && (
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${GRADE_VARIANT[talentGrade.grade] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              Grade {talentGrade.grade}
            </span>
            {talentGrade.gradePrescription && (
              <span className="text-[11px] text-gray-400 font-medium text-right max-w-[200px] line-clamp-2">
                {talentGrade.gradePrescription}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <TabSlider 
          tabs={tabOptions} 
          activeTab={currentTabLabel} 
          onTabChange={(tab: string) => {
            setActiveTab(tab.startsWith('Available') ? 'available' : 'applied');
            setSelectedTag('ALL');
          }} 
        />
      </div>

      {/* Search Bar & Tag Filter Pills — only for My Applications */}
      {showFilters && (
        <div className="space-y-3">
          {/* Full-width Search Input */}
          <div className="w-full">
            <Input 
              label=""
              placeholder="Search by role title, organization, location, compensation, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={SearchIcon}
            />
          </div>

          {/* Dynamic Tag Filter Pills with Chevron Buttons */}
          {availableTags.length > 1 && (
            <div className="relative flex items-center group/tags">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleScrollTags('left')}
                  aria-label="Scroll tags left"
                  className="absolute left-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer -translate-x-1"
                >
                  <ChevronLeftIcon size={14} />
                </button>
              )}

              <div 
                ref={tagScrollRef}
                onScroll={checkTagScroll}
                className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1 w-full"
              >
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag === 'ALL' ? 'All Roles' : formatTagLabel(tag)}
                  </button>
                ))}
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleScrollTags('right')}
                  aria-label="Scroll tags right"
                  className="absolute right-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer translate-x-1"
                >
                  <ChevronRightIcon size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Matching queued banner */}
      {activeTab === 'available' && matchingQueued && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="animate-spin shrink-0">
            <SparklesIcon size={16} className="text-blue-600" />
          </div>
          <p className="text-[13px] font-medium text-blue-700">
            {matchingHint || 'Finding your best matches… Results will refresh shortly.'}
          </p>
        </div>
      )}

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
      ) : activeTab === 'available' ? (
        /* ── Available Roles Tab ── */
        availableJobs.length === 0 ? (
          <EmptyState
            icon={SparklesIcon}
            title="No matched roles yet"
            description={
              matchingQueued
                ? "We're scanning roles for you now — check back in a moment."
                : 'Upload or update your CV so we can match you with relevant opportunities.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableJobs.map((job) => {
              const orgName = job.organisationName || (job as any).companyName || 'Verified Employer';
              const gradeStyle = job.grade ? GRADE_VARIANT[job.grade] : null;

              return (
                <div
                  key={job.rolePostingId}
                  onClick={() => handleAvailableJobClick(job)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Row: Organisation & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                          {orgName.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 leading-snug break-words">
                          {orgName}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center flex-wrap justify-end gap-1.5">
                        {/* Grade badge */}
                        {job.grade && gradeStyle && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${gradeStyle}`}>
                            {job.grade}
                          </span>
                        )}
                        {/* Match score */}
                        {typeof job.matchScore === 'number' && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                            <SparklesIcon size={11} className="text-emerald-600" />
                            <span>{job.matchScore}% Match</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full-width Role Title */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2.5">
                      {job.roleTitle}
                    </h3>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs text-gray-600">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md">
                          <MapPinIcon size={12} className="text-gray-400" />
                          {job.location}
                        </span>
                      )}
                      {job.compensationSummary && (
                        <span className="inline-flex items-center font-semibold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md">
                          {job.compensationSummary}
                        </span>
                      )}
                      {Array.isArray(job.tags) && job.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center bg-gray-50 px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-600">
                          {formatTagLabel(tag)}
                        </span>
                      ))}
                    </div>

                    {/* Grade prescription hint */}
                    {job.gradePrescription && (
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mb-2">
                        {job.gradePrescription}
                      </p>
                    )}
                  </div>

                  {/* Bottom Section */}
                  <div className="border-t border-gray-50 pt-3 mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Posted {formatDate(job.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      View Role
                      <ArrowRightIcon size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── My Applications Tab ── */
        filteredApplied.length === 0 ? (
          <EmptyState
            icon={BriefcaseIcon}
            title="No applications yet"
            description={
              searchQuery || selectedTag !== 'ALL'
                ? 'Try adjusting your search terms or filter tags.'
                : 'Explore available roles and apply to start your assessment journey.'
            }
            action={
              !searchQuery && selectedTag === 'ALL'
                ? {
                    label: 'Browse Available Roles',
                    onClick: () => {
                      setActiveTab('available');
                      setSelectedTag('ALL');
                      setSearchQuery('');
                    },
                  }
                : undefined
            }
          />
        ) : (
          <>
            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(paginatedApplied as TalentAppliedJob[]).map((job) => {
                const orgName = job.organisationName || (job as any).companyName || 'Verified Employer';
                const stageCurrent = job.stage?.current ?? 1;
                const stageTotal = job.stage?.total ?? 3;
                const progressPct = Math.min(100, Math.max(0, Math.round((stageCurrent / stageTotal) * 100)));
                const statusConfig = STATUS_CONFIG[job.status] || { label: job.status, variant: 'blue-light' as const };

                return (
                  <div
                    key={job.rolePostingId || job.assessmentId}
                    onClick={() => handleResumeAssessment(job)}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md hover:border-blue-100 transition-all cursor-pointer flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Row: Organisation (fully visible) & Badges */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                            {orgName.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-gray-700 leading-snug break-words">
                            {orgName}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center flex-wrap justify-end gap-1.5">
                          {typeof job.overallScore === 'number' && (
                            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                              {job.overallScore}% Score
                            </span>
                          )}
                          <Tag variant={statusConfig.variant} label={statusConfig.label} />
                        </div>
                      </div>

                      {/* Full-width Role Title */}
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2.5">
                        {job.roleTitle}
                      </h3>

                      {/* Metadata Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs text-gray-600">
                        {job.location && (
                          <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md">
                            <MapPinIcon size={12} className="text-gray-400" />
                            {job.location}
                          </span>
                        )}
                        {job.compensationSummary && (
                          <span className="inline-flex items-center font-semibold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-md">
                            {job.compensationSummary}
                          </span>
                        )}
                        {Array.isArray(job.tags) && job.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center bg-gray-50 px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-600">
                            {formatTagLabel(tag)}
                          </span>
                        ))}
                      </div>

                      {/* Applicant Code */}
                      {job.applicantCode && (
                        <div className="mb-3 text-[11px] font-mono text-gray-500 bg-gray-50/90 px-2.5 py-1 rounded-md inline-block">
                          Ref: {job.applicantCode}
                        </div>
                      )}
                    </div>

                    {/* Bottom Section: Stage Progress & Action */}
                    <div className="border-t border-gray-50 pt-3 mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium truncate">
                          {job.stage?.label || `Stage ${stageCurrent} of ${stageTotal}: ${job.stage?.name || 'In Progress'}`}
                        </span>
                        <span className="text-blue-700 font-bold ml-2 shrink-0">{progressPct}%</span>
                      </div>

                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-400">
                          Applied {formatDate(job.appliedAt)}
                        </span>
                        <button
                          onClick={(e) => handleResumeAssessment(job, e)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          Continue Stage {stageCurrent}
                          <ArrowRightIcon size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (applied tab only) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 mt-8">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredApplied.length)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{filteredApplied.length}</span> applications
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeftIcon size={14} />
                    Previous
                  </button>

                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        Math.abs(pageNum - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 180, behavior: 'smooth' });
                            }}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={pageNum} className="px-1 text-gray-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Next
                    <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default TalentJobsView;
