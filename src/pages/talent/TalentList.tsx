import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  UsersIcon,
  MoreVerticalIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CheckIcon,
  CloseIcon,
} from '../../components/common/Icons';
import ApplicantDetailsModal from '../../components/employer/ApplicantDetailsModal';
import PostHireTrackingView from '../../components/talent/PostHireTrackingView';
import PaginationControls from '../../components/common/PaginationControls';
import Tag from '../../components/common/Tag';
import {
  useEmployerTalentsQuery,
  type EmployerTalentItem,
  type EmployerTalentAction,
} from '../../services/queries/employer';

const STATUS_FILTERS = ['All talents', 'Pending review', 'Under review', 'Hired', 'Rejected'];

const Talents: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All talents');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map activeTab to API status param
  const apiStatus = useMemo(() => {
    switch (activeTab) {
      case 'Pending review':
        return 'PENDING_REVIEW';
      case 'Under review':
        return 'UNDER_REVIEW';
      case 'Hired':
        return 'HIRED';
      case 'Rejected':
        return 'REJECTED';
      default:
        return undefined;
    }
  }, [activeTab]);

  // Employer talents query
  const { data: talentsData, isLoading: isTalentsLoading } = useEmployerTalentsQuery({
    search: debouncedSearch,
    status: apiStatus,
    page,
    limit: 20,
    enabled: activeTab !== 'Post-Hire Tracking',
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close action menu on click outside or Escape
  useEffect(() => {
    if (openMenuIdx === null) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenMenuIdx(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuIdx(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuIdx]);

  const getStatusDotColor = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('PENDING')) return 'bg-gray-400';
    if (s.includes('UNDER') || s.includes('PROGRESS')) return 'bg-yellow-400';
    if (s.includes('HIRED') || s.includes('PASSED')) return 'bg-green-500';
    if (s.includes('REJECTED') || s.includes('FAILED')) return 'bg-red-500';
    return 'bg-[#0047CC]';
  };

  const getStatusVariant = (status?: string): 'gray' | 'yellow' | 'green' | 'red' => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING_REVIEW' || s === 'PENDING REVIEW' || s === 'PENDING') return 'gray';
    if (s === 'UNDER_REVIEW' || s === 'UNDER REVIEW' || s === 'IN_PROGRESS') return 'yellow';
    if (s === 'HIRED' || s === 'PASSED') return 'green';
    if (s === 'REJECTED' || s === 'FAILED') return 'red';
    return 'gray';
  };

  // Score FE colour: green ≥80, yellow 60–79, gray <60; null -> '—'
  const getScoreColor = (score: number | null | undefined) => {
    if (score == null) return 'text-gray-300';
    if (score >= 80) return 'text-[#16A34A]';
    if (score >= 60) return 'text-[#D97706]';
    return 'text-gray-500';
  };

  // Resolve talent items directly from backend API response
  const talents: EmployerTalentItem[] = useMemo(() => {
    return talentsData?.items ?? [];
  }, [talentsData]);

  const pagination = talentsData?.pagination;
  const totalCount = pagination?.total ?? talents.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / 20));
  const showingLabel =
    pagination?.showingLabel ||
    (talents.length > 0
      ? `Showing ${(page - 1) * 20 + 1} - ${Math.min(page * 20, totalCount)} of ${totalCount} applicants`
      : 'Showing 0 applicants');

  const resolveTalentActions = (talent: EmployerTalentItem): EmployerTalentAction[] => {
    if (talent.actions && Array.isArray(talent.actions) && talent.actions.length > 0) {
      return talent.actions;
    }

    const isHiredOrRejected =
      talent.overallStatus === 'HIRED' ||
      talent.overallStatus === 'REJECTED' ||
      (talent as any).status === 'Hired' ||
      (talent as any).status === 'Rejected';

    return [
      {
        key: 'VIEW_DETAILS',
        label: 'View details',
        method: 'GET',
        path: `/api/v1/assessments/${talent.assessmentId || talent.id}/employer-report?rolePostingId=${talent.rolePostingId || ''}`,
        enabled: true,
      },
      {
        key: 'HIRE_APPLICANT',
        label: 'Hire applicant',
        method: 'POST',
        path: `/api/v1/assessments/${talent.assessmentId || talent.id}/decision/hire`,
        enabled: !isHiredOrRejected,
      },
      {
        key: 'REJECT_APPLICANT',
        label: 'Reject applicant',
        method: 'POST',
        path: `/api/v1/assessments/${talent.assessmentId || talent.id}/decision/reject`,
        enabled: !isHiredOrRejected,
        destructive: true,
      },
    ];
  };

  const openTalentProfile = (talent: EmployerTalentItem) => {
    const applicantIdentifier = talent.applicantCode || talent.id || 'candidate';
    const assessmentId = talent.assessmentId || talent.id || '';
    const rolePostingId = talent.rolePostingId || '';
    navigate(`/talents/${applicantIdentifier}?assessmentId=${encodeURIComponent(assessmentId)}${rolePostingId ? `&rolePostingId=${encodeURIComponent(rolePostingId)}` : ''}`);
  };

  const handleActionClick = (action: EmployerTalentAction, talent: EmployerTalentItem) => {
    if (action.enabled === false) return;
    setOpenMenuIdx(null);

    const key = (action.key || '').toUpperCase();
    const label = (action.label || '').toLowerCase();
    const applicantIdentifier = talent.applicantCode || talent.id;

    if (key === 'VIEW_DETAILS' || label.includes('view details') || label.includes('view')) {
      openTalentProfile(talent);
      return;
    }

    if (key === 'HIRE_APPLICANT' || label.includes('hire')) {
      setSelectedApplicant(talent);
      setIsApplicantModalOpen(true);
      return;
    }

    if (key === 'REJECT_APPLICANT' || label.includes('reject')) {
      const jobId = talent.rolePostingId || '1';
      navigate(`/jobs/${jobId}/reject/${applicantIdentifier}`);
      return;
    }

    // Default fallback
    if (action.method === 'GET') {
      openTalentProfile(talent);
    } else {
      setSelectedApplicant(talent);
      setIsApplicantModalOpen(true);
    }
  };

  const isFilterActive =
    (activeTab !== 'All talents' && activeTab !== 'Post-Hire Tracking') || searchQuery.trim() !== '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-medium text-[#0047CC] tracking-tight">Talents</h1>

        {/* Post-Hire Tracking Button at Top Right */}
        <button
          type="button"
          onClick={() => {
            setActiveTab(activeTab === 'Post-Hire Tracking' ? 'All talents' : 'Post-Hire Tracking');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
            activeTab === 'Post-Hire Tracking'
              ? 'bg-[#0047CC] text-white hover:bg-[#003cb0]'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>Post-Hire Tracking</span>
          <span
            className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
              activeTab === 'Post-Hire Tracking' ? 'bg-white text-[#0047CC]' : 'bg-[#DC2626] text-white'
            }`}
          >
            1
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar (only shown when on talent list view) */}
      {activeTab !== 'Post-Hire Tracking' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <SearchIcon
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by applicant code, role, course, location, or qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-full border border-gray-200 text-[13px] bg-white text-gray-800 placeholder-gray-400 shadow-xs focus:outline-none focus:border-[#0047CC] focus:ring-1 focus:ring-[#0047CC] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  <CloseIcon size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative shrink-0" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto px-5 py-3 rounded-full border text-[13px] font-medium flex items-center justify-between sm:justify-start gap-2.5 transition-all cursor-pointer shadow-xs ${
                  activeTab !== 'All talents'
                    ? 'border-[#0047CC] bg-[#F0F5FF] text-[#0047CC]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-expanded={isFilterOpen}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FilterIcon
                    size={15}
                    className={activeTab !== 'All talents' ? 'text-[#0047CC]' : 'text-gray-400'}
                  />
                  <span className="truncate">
                    {activeTab === 'All talents' ? 'Filter status' : activeTab}
                  </span>
                </div>

                {totalCount !== undefined ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      activeTab !== 'All talents' ? 'bg-[#0047CC] text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {totalCount}
                  </span>
                ) : null}

                <ChevronDownIcon
                  size={14}
                  className={`transition-transform duration-200 text-gray-400 ${
                    isFilterOpen ? 'rotate-180 text-gray-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Filter by Status
                    </span>
                    {activeTab !== 'All talents' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('All talents');
                          setPage(1);
                          setIsFilterOpen(false);
                        }}
                        className="text-[11px] font-semibold text-[#0047CC] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {STATUS_FILTERS.map((tab) => {
                      const isSelected = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab);
                            setPage(1);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0047CC] text-white font-medium shadow-xs'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSelected ? 'bg-white' : getStatusDotColor(tab)
                              }`}
                            />
                            <span className="truncate">{tab}</span>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-2 shrink-0">
                              {totalCount !== undefined && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white">
                                  {totalCount}
                                </span>
                              )}
                              <CheckIcon size={12} strokeWidth={3} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {isFilterActive && (
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 pt-0.5">
              <span>Filtered by:</span>
              {activeTab !== 'All talents' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-100">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(activeTab)}`} />
                  {activeTab}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('All talents');
                      setPage(1);
                    }}
                    className="ml-1 hover:text-blue-900 cursor-pointer"
                    aria-label="Clear status filter"
                  >
                    <CloseIcon size={10} strokeWidth={2.5} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-gray-900 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <CloseIcon size={10} strokeWidth={2.5} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('All talents');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
              <span className="text-gray-400 ml-auto hidden sm:inline">
                {talents.length} {talents.length === 1 ? 'candidate' : 'candidates'} found
              </span>
            </div>
          )}
        </div>
      )}

      {/* Table/View Container */}
      {activeTab === 'Post-Hire Tracking' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveTab('All talents')}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0047CC] hover:underline cursor-pointer"
          >
            <ChevronLeftIcon size={14} strokeWidth={2.5} />
            Back to talent list
          </button>
          <PostHireTrackingView />
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col shadow-sm">
          <div className="w-full">
            {/* Table Header Bar - Hidden on mobile */}
            <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center text-[11px] font-medium text-gray-400 uppercase tracking-widest gap-4 border-b border-gray-50 rounded-t-2xl">
              <div className="flex-[2.2] min-w-0">Applicant</div>
              <div className="flex-[2.5] min-w-0">Role applied</div>
              <div className="flex-[1] min-w-0 text-center">Score</div>
              <div className="flex-[1.3] min-w-0">Stage</div>
              <div className="flex-[1.5] min-w-0 text-center">Date applied</div>
              <div className="w-48 shrink-0">Status</div>
            </div>

            {/* Table Content / Mobile List */}
            <div className="flex-1">
              {isTalentsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#0047CC] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px] text-gray-400 font-medium">Loading talents...</p>
                </div>
              ) : talents.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {talents.map((talent, idx) => {
                    const applicantCode = talent.applicantCode || talent.id;
                    const qualification =
                      talent.qualification || (talent as any).academicLevel || (talent as any).course || '—';
                    const roleApplied = talent.roleApplied || '—';
                    const overallScore = talent.overallScore ?? (talent as any).overall;
                    const stageLabel = talent.stage?.label || '—';
                    const appliedOn = talent.appliedOn || (talent as any).dateApplied || '—';
                    const statusLabel =
                      talent.overallStatusLabel || (talent as any).status || talent.overallStatus || 'Pending review';
                    const statusVariant = getStatusVariant(talent.overallStatus || (talent as any).status);
                    const actions = resolveTalentActions(talent);

                    return (
                      <div
                        key={talent.id || applicantCode || idx}
                        className="px-6 lg:px-8 py-5 lg:py-5 flex flex-col lg:flex-row lg:items-center border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group gap-3 lg:gap-4 relative"
                      >
                        {/* Applicant — applicantCode + qualification subtitle */}
                        <div
                          className="flex-[2.2] flex items-center justify-between lg:block min-w-0"
                          onClick={() => openTalentProfile(talent)}
                        >
                          <div>
                            <p className="text-[14px] font-semibold text-gray-900 group-hover:text-[#0047CC] transition-colors tracking-tight">
                              {applicantCode}
                            </p>
                            <p className="text-[12px] text-gray-400 font-medium mt-0.5 truncate">
                              {qualification}
                            </p>
                          </div>
                          <div className="lg:hidden">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(statusLabel)}`} />
                          </div>
                        </div>

                        {/* Role Applied */}
                        <div
                          className="hidden lg:block flex-[2.5] min-w-0"
                          onClick={() => openTalentProfile(talent)}
                        >
                          <p className="text-[13px] font-medium text-gray-700 truncate" title={roleApplied}>
                            {roleApplied}
                          </p>
                        </div>

                        {/* Score: overallScore (null → —; FE colour: green ≥80, yellow 60–79, gray <60) */}
                        <div
                          className="hidden lg:flex flex-[1] min-w-0 justify-center"
                          onClick={() => openTalentProfile(talent)}
                        >
                          {overallScore != null ? (
                            <span
                              className={`inline-flex items-center justify-center text-[14px] font-semibold tracking-tight ${getScoreColor(
                                overallScore
                              )}`}
                            >
                              {overallScore}%
                            </span>
                          ) : (
                            <span className="text-[13px] text-gray-300 font-medium">—</span>
                          )}
                        </div>

                        {/* Stage: bound to stage.label (not Stage N / 3) */}
                        <div
                          className="hidden lg:flex flex-[1.3] min-w-0 items-center gap-2"
                          onClick={() => openTalentProfile(talent)}
                        >
                          {talent.stage ? (
                            <>
                              <div className="flex gap-1 shrink-0">
                                {[1, 2, 3].map((step) => {
                                  const isFilled =
                                    talent.stage.completed ||
                                    (talent.stage.current != null && step <= talent.stage.current);
                                  return (
                                    <div
                                      key={step}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isFilled ? 'bg-gray-800' : 'bg-gray-200'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              <span
                                className="text-[12px] font-medium text-gray-500 truncate"
                                title={stageLabel}
                              >
                                {stageLabel}
                              </span>
                            </>
                          ) : (
                            <span className="text-[12px] text-gray-300 font-medium">—</span>
                          )}
                        </div>

                        {/* Date Applied: appliedOn */}
                        <div
                          className="hidden lg:block flex-[1.5] min-w-0 text-[13px] font-medium text-gray-500 text-center"
                          onClick={() => openTalentProfile(talent)}
                        >
                          {appliedOn}
                        </div>

                        {/* Status + Actions */}
                        <div className="hidden lg:flex items-center justify-between lg:w-48 relative shrink-0">
                          <Tag
                            label={statusLabel}
                            variant={statusVariant}
                            className="min-w-[110px] justify-center"
                          />

                          {/* Dynamic Actions Menu rendered from actions[] */}
                          <div
                            ref={openMenuIdx === idx ? actionMenuRef : undefined}
                            className="relative flex items-center gap-4 ml-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="text-gray-300 hover:text-gray-600 p-2 relative z-10 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                              }}
                              aria-label="Actions menu"
                            >
                              <MoreVerticalIcon size={18} />
                            </button>

                            {/* Action Menu Dropdown */}
                            {openMenuIdx === idx && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                                {actions.map((action, actionIdx) => {
                                  const isDisabled = action.enabled === false;
                                  const isDestructive =
                                    action.destructive ||
                                    action.key === 'REJECT_APPLICANT' ||
                                    action.label.toLowerCase().includes('reject');

                                  return (
                                    <button
                                      key={action.key || actionIdx}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(action, talent);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors border-b border-gray-50 last:border-b-0 ${
                                        isDisabled
                                          ? 'text-gray-300 cursor-not-allowed bg-transparent'
                                          : isDestructive
                                          ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                                          : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                                      }`}
                                    >
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 bg-[#EBF5FF] rounded-full flex items-center justify-center mb-6">
                    <UsersIcon size={20} className="text-[#0047CC]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[17px] font-medium text-gray-900 mb-2">
                    {isFilterActive ? 'No talents match your criteria' : 'You do not have any talent yet'}
                  </h3>
                  <p className="text-gray-400 text-[13px] font-medium text-center max-w-sm mb-4">
                    {isFilterActive
                      ? 'Try adjusting your search terms or clearing the status filter to see more candidates.'
                      : 'All applied talents will appear here.'}
                  </p>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('All talents');
                        setSearchQuery('');
                        setPage(1);
                      }}
                      className="px-4 py-2 bg-[#0047CC] hover:bg-[#003cb0] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pagination Footer: bound to pagination.showingLabel */}
          <div className="border-t border-gray-50 px-6 py-6 flex items-center justify-between mt-auto">
            <p className="text-[13px] text-gray-400 font-medium tracking-tight">
              {showingLabel}
            </p>
            <PaginationControls
              currentPage={page - 1}
              disablePrev={page <= 1}
              disableNext={page >= totalPages}
              onPageChange={(delta) => setPage((prev) => Math.max(1, Math.min(totalPages, prev + delta)))}
            />
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        applicant={selectedApplicant}
        onReject={() => {
          setIsApplicantModalOpen(false);
          const jobId = selectedApplicant?.rolePostingId || '1';
          const applicantId = selectedApplicant?.applicantCode || selectedApplicant?.id;
          navigate(`/jobs/${jobId}/reject/${applicantId}`);
        }}
        onHire={() => {
          setIsApplicantModalOpen(false);
        }}
      />
    </div>
  );
};

export default Talents;
