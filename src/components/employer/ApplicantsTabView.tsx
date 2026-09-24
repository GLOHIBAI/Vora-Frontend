import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UsersIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  ChevronDownIcon,
  PlayIcon,
  LocationIcon,
  MoreVerticalIcon
} from '../common/Icons';
import Tag from '../common/Tag';
import Spinner from '../common/Spinner';
import GeoDistributionMap from './GeoDistributionMap';
import type { 
  EmployerApplicantsResponse, 
  EmployerApplicant,
  EmployerTestResultSection,
  EmployerTestResultItem 
} from '../../services/queries/employer/types';
import { toast } from 'react-hot-toast';
import { resolveAssessmentId, isCandidateEligibleForRejection } from '../../utils/assessmentDecision';

interface ApplicantsTabViewProps {
  data?: EmployerApplicantsResponse;
  isLoading?: boolean;
  onHire: (applicant: any) => void;
  jobId?: string;
  onReject?: (applicant: any) => void;
  onViewDetails?: (applicant: any) => void;
}

const AccordionItem: React.FC<{ 
  title: string; 
  icon: React.FC<any>; 
  count?: string | number;
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode 
}> = ({ title, icon: Icon, count, isOpen, onToggle, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white border-none cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="bg-[#EBF6FF] p-2 rounded-lg text-[#0047CC]">
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-medium text-gray-900 tracking-tight">{title}</span>
          {count !== undefined && (
            <span className="bg-[#F7F7F7] text-gray-500 text-[11px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
              {count}
            </span>
          )}
        </div>
      </div>
      <ChevronDownIcon 
        size={20} 
        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
    <div 
      className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
    >
      <div className="px-6 pb-6 pt-2 border-t border-gray-50">
        {children}
      </div>
    </div>
  </div>
);

const getApplicantStatusVariant = (status?: string): any => {
  const s = status?.toUpperCase();
  if (s === 'PENDING_REVIEW' || s === 'PENDING') return 'gray';
  if (s === 'UNDER_REVIEW' || s === 'IN_PROGRESS') return 'yellow';
  if (['HIRED', 'PASSED'].includes(s || '')) return 'green';
  if (s === 'REJECTED') return 'red';
  if (s === 'FAILED') return 'orange';
  if (s === 'INELIGIBLE') return 'purple';
  return 'gray';
};

const formatQualification = (q?: string): string => {
  if (!q) return '—';
  if (q === 'SENIOR_LEVEL') return 'Senior level';
  if (q === 'MID_LEVEL') return 'Mid level';
  if (q === 'ENTRY_LEVEL') return 'Entry level';
  if (q === 'STUDENT_GRADUATE') return 'Student / Graduate';
  return q.replace(/_/g, ' ');
};

const TestResultsTable: React.FC<{
  sectionName: string;
  section?: EmployerTestResultSection;
  onOpenDossier: (assessmentId: string) => void;
}> = ({ sectionName, section, onOpenDossier }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const PAGE_SIZE = 10;

  if (section?.available === false) {
    return (
      <p className="py-8 text-center text-[13px] font-medium text-gray-400">
        {sectionName} interview is not required for this role
      </p>
    );
  }

  const items: EmployerTestResultItem[] = section?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] font-medium text-gray-400">
        No {sectionName.toLowerCase()} data available yet
      </p>
    );
  }

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginatedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="pb-4 font-medium">Applicant ID</th>
            <th className="pb-4 font-medium text-center">Status</th>
            <th className="pb-4 font-medium text-center">Score</th>
            <th className="pb-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {paginatedItems.map((item, i) => {
            const score = item.score;
            return (
              <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-[14px] font-medium text-gray-900">
                  {item.applicantCode || '—'}
                </td>
                <td className="py-4 text-center">
                  <Tag 
                    label={item.status || 'PENDING'} 
                    variant={getApplicantStatusVariant(item.status)}
                    className="mx-auto min-w-[90px] justify-center"
                  />
                </td>
                <td className="py-4 text-center">
                  {score != null ? (
                    <span className="text-[13px] font-semibold text-gray-800">{score}%</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-4 text-right">
                  {item.assessmentId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(item.assessmentId!);
                      }}
                      className="px-3 py-1.5 text-[12px] font-medium text-[#0047CC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-[#0047CC]/20 bg-transparent"
                    >
                      Dossier
                    </button>
                  ) : (
                    <span className="text-gray-300 text-[12px]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-2">
          <span className="text-[12px] font-medium text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, items.length)} of {items.length} applicants
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-[12px] font-medium text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StageApplicantsTable: React.FC<{
  applicants: EmployerApplicant[];
  onOpenDossier: (applicant: EmployerApplicant) => void;
  onHire: (applicant: EmployerApplicant) => void;
  onReject?: (applicant: EmployerApplicant) => void;
  jobId?: string;
  rolePostingId?: string;
}> = ({ applicants, onOpenDossier, onHire, onReject, jobId, rolePostingId }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [openMenuIdx, setOpenMenuIdx] = React.useState<number | null>(null);
  const menuContainerRef = React.useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    if (openMenuIdx === null) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenuIdx(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMenuIdx]);

  if (applicants.length === 0) {
    return (
      <div className="py-10 text-center text-[13px] font-medium text-gray-400">
        No applicants currently in this stage
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(applicants.length / PAGE_SIZE));
  const paginated = applicants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <th className="pb-4 font-medium">Applicant ID</th>
            <th className="pb-4 font-medium">Qualification</th>
            <th className="pb-4 font-medium">Location</th>
            <th className="pb-4 font-medium">Specialization</th>
            <th className="pb-4 font-medium text-center">Score</th>
            <th className="pb-4 font-medium text-center">Status</th>
            <th className="pb-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {paginated.map((applicant, i) => {
            const statusLabel = applicant.overallStatusLabel || applicant.overallStatus || applicant.status || 'Under review';
            const score = applicant.overallScore ?? applicant.overall;
            const location = applicant.location || applicant.country || '—';
            return (
              <tr
                key={applicant.id || applicant.assessmentId || i}
                onClick={() => onOpenDossier(applicant)}
                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <td className="py-4">
                  <span className="text-[14px] font-medium text-gray-900 group-hover:text-[#0047CC] transition-colors">
                    {applicant.applicantCode}
                  </span>
                </td>
                <td className="py-4 text-[13px] font-medium text-gray-500">{formatQualification(applicant.qualification)}</td>
                <td className="py-4 text-[13px] font-medium text-gray-500">{location}</td>
                <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.specialization || '—'}</td>
                <td className="py-4 text-center">
                  {score != null ? (
                    <span className="text-[13px] font-semibold text-gray-800">{score}%</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-4 text-center">
                  <Tag
                    label={statusLabel}
                    variant={getApplicantStatusVariant(applicant.overallStatus || applicant.status)}
                    className="mx-auto min-w-[110px] justify-center"
                  />
                </td>
                <td className="py-4 text-right relative">
                  <div
                    ref={openMenuIdx === i ? menuContainerRef : undefined}
                    className="inline-block relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIdx(openMenuIdx === i ? null : i);
                      }}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative z-10"
                      aria-label="Applicant options"
                    >
                      <MoreVerticalIcon size={18} />
                    </button>
                    {openMenuIdx === i && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIdx(null);
                            onOpenDossier(applicant);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          View dossier
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIdx(null);
                            onHire(applicant);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Hire applicant
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIdx(null);
                            const eligibility = isCandidateEligibleForRejection(applicant);
                            if (!eligibility.eligible) {
                              toast.error(eligibility.message || 'Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits stay Failed, not this form.');
                              return;
                            }
                            const effectiveJobId = jobId || rolePostingId;
                            const assessmentId = resolveAssessmentId(applicant, effectiveJobId);
                            const applicantCode = applicant.applicantCode || applicant.id || applicant.talentId || 'candidate';
                            const rejectAction = applicant.actions?.find((a: any) => (a.key || '').toUpperCase() === 'REJECT_APPLICANT');
                            if (onReject) {
                              onReject(applicant);
                            } else if (effectiveJobId) {
                              navigate(`/jobs/${effectiveJobId}/reject/${encodeURIComponent(applicantCode)}${assessmentId ? `?assessmentId=${encodeURIComponent(assessmentId)}` : ''}`, {
                                state: {
                                  assessmentId,
                                  rolePostingId: effectiveJobId,
                                  applicant,
                                  actionPath: rejectAction?.path,
                                },
                              });
                            }
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Reject applicant
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-2">
          <span className="text-[12px] font-medium text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, applicants.length)} of {applicants.length} applicants
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuIdx(null);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-[12px] font-medium text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuIdx(null);
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicantsTabView: React.FC<ApplicantsTabViewProps> = ({ 
  data, 
  isLoading, 
  onHire,
  jobId,
  onReject,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>('Overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (openMenuIdx === null) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenMenuIdx(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuIdx(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuIdx]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const metrics = data?.metrics;
  const applicants = data?.applicants ?? [];
  const geo = data?.geoDistribution;
  const recommendation = data?.recommendation;
  const topCandidates = recommendation?.topCandidates ?? [];

  const stage1Applicants = useMemo(() => {
    return applicants.filter(
      (a) =>
        a.stage?.current === 1 ||
        a.stage?.name?.toLowerCase().includes('getting to know you') ||
        a.stage?.label?.toLowerCase().includes('stage 1')
    );
  }, [applicants]);

  const stage2Applicants = useMemo(() => {
    return applicants.filter(
      (a) =>
        a.stage?.current === 2 ||
        a.stage?.name?.toLowerCase().includes('professional dimension') ||
        a.stage?.label?.toLowerCase().includes('stage 2')
    );
  }, [applicants]);

  const stage3Applicants = useMemo(() => {
    return applicants.filter(
      (a) =>
        a.stage?.current === 3 ||
        a.stage?.name?.toLowerCase().includes('show up') ||
        a.stage?.label?.toLowerCase().includes('stage 3')
    );
  }, [applicants]);

  const totalPages = Math.max(1, Math.ceil(applicants.length / PAGE_SIZE));
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return applicants.slice(start, start + PAGE_SIZE);
  }, [applicants, currentPage]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Spinner size={28} className="text-[#0047CC]" />
        <p className="text-[13px] font-medium text-gray-500">Loading applicants…</p>
      </div>
    );
  }


  // Helper resolvers for metrics
  const getMetricCount = (val: any): string => {
    if (val === undefined || val === null) return '0';
    if (typeof val === 'object' && val !== null) {
      return val.count !== undefined && val.count !== null ? String(val.count) : '0';
    }
    return String(val);
  };

  const getMetricSub = (val: any, fallbackSub?: string): string => {
    if (typeof val === 'object' && val !== null && val.subtitle !== undefined) {
      return val.subtitle ?? '—';
    }
    return fallbackSub || '—';
  };

  const getTopCandidateCode = (top: any): string => {
    if (!top) return '—';
    if (typeof top === 'object') {
      return top.applicantCode ?? '—';
    }
    return typeof top === 'string' ? top : '—';
  };

  const getTopCandidateSub = (top: any): string => {
    if (typeof top === 'object' && top !== null) {
      return top.subtitle ?? (top.overallScore != null ? `Overall score ${top.overallScore}%` : '—');
    }
    return '—';
  };

  // Stats cards driven by API metrics
  const statCards = metrics ? [
    { 
      label: 'TOTAL MATCHED', 
      value: getMetricCount(metrics.totalMatched), 
      sub: getMetricSub(metrics.totalMatched, 'Across pool'), 
      icon: UsersIcon, 
      color: 'text-gray-900' 
    },
    { 
      label: 'PASSED ALL INTERVIEWS', 
      value: getMetricCount(metrics.passedAllTests), 
      sub: getMetricSub(metrics.passedAllTests, 'Ready for review'), 
      icon: CheckIcon, 
      color: 'text-green-600' 
    },
    { 
      label: 'DID NOT MEET THRESHOLD', 
      value: getMetricCount(metrics.didNotMeetThreshold), 
      sub: getMetricSub(metrics.didNotMeetThreshold, 'Below score threshold'), 
      icon: AlertTriangleIcon, 
      color: 'text-red-600' 
    },
    { 
      label: 'TOP CANDIDATE', 
      value: getTopCandidateCode(metrics.topCandidate), 
      sub: getTopCandidateSub(metrics.topCandidate), 
      icon: CheckIcon, 
      color: 'text-[#0047CC]' 
    }
  ] : [];

  // Geo countries
  const geoCountries = geo?.topCountries ?? [];
  const totalApplicants = applicants.length || Number(getMetricCount(metrics?.totalMatched)) || 0;

  const handleOpenDossier = (applicant: EmployerApplicant) => {
    if (onViewDetails) {
      onViewDetails(applicant);
    } else {
      onHire(applicant);
    }
  };

  const handleOpenDossierById = (assessmentId: string) => {
    const match = applicants.find(a => a.assessmentId === assessmentId);
    if (match) {
      handleOpenDossier(match);
    } else if (onViewDetails) {
      onViewDetails({ assessmentId } as any);
    } else {
      onHire({ assessmentId } as any);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Stats Grid */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
              <p className={`text-[24px] font-medium ${stat.color} leading-none mb-1`}>{stat.value}</p>
              <p className="text-[11px] font-medium text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* Candidate Pool Overview */}
        <AccordionItem 
          title="Candidate Pool Overview" 
          icon={UsersIcon} 
          count={applicants.length}
          isOpen={openSection === 'Overview'} 
          onToggle={() => toggleSection('Overview')}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[13px] font-medium text-gray-900 uppercase tracking-tight">Geo Distribution</h4>
                </div>
                <GeoDistributionMap geo={geo} applicants={applicants} totalApplicants={totalApplicants} />
              </div>
              <div className="space-y-4">
                <h4 className="text-[13px] font-medium text-gray-900 uppercase tracking-tight">Top Countries</h4>
                <div className="space-y-3">
                  {geoCountries.map((c, i) => {
                    const pct = totalApplicants > 0 ? Math.round((c.count / totalApplicants) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[12px] font-medium">
                          <span className="text-gray-700">{c.country}</span>
                          <span className="text-gray-400">{c.count} app(s)</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0047CC]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {geoCountries.length === 0 && (
                    <p className="text-[12px] font-medium text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 font-medium">Applicant ID</th>
                    <th className="pb-4 font-medium">Qualification</th>
                    <th className="pb-4 font-medium">Location</th>
                    <th className="pb-4 font-medium">Specialization</th>
                    <th className="pb-4 font-medium">Applied On</th>
                    <th className="pb-4 font-medium text-center">Score</th>
                    <th className="pb-4 font-medium text-center">Overall Status</th>
                    <th className="pb-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedApplicants.map((applicant: EmployerApplicant, i: number) => {
                    const statusLabel = applicant.overallStatusLabel || applicant.overallStatus || applicant.status || '—';
                    const score = applicant.overallScore ?? applicant.overall;
                    const location = applicant.location || applicant.country || '—';
                    return (
                      <tr 
                        key={i} 
                        onClick={() => handleOpenDossier(applicant)}
                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4">
                          <span className="text-[14px] font-medium text-gray-900 group-hover:text-[#0047CC] transition-colors">
                            {applicant.applicantCode}
                          </span>
                        </td>
                        <td className="py-4 text-[13px] font-medium text-gray-500">{formatQualification(applicant.qualification)}</td>
                        <td className="py-4 text-[13px] font-medium text-gray-500">{location}</td>
                        <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.specialization || '—'}</td>
                        <td className="py-4 text-[13px] font-medium text-gray-400">{applicant.appliedOn || '—'}</td>
                        <td className="py-4 text-center">
                          {score != null ? (
                            <span className="text-[13px] font-semibold text-gray-800">{score}%</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <Tag 
                            label={statusLabel} 
                            variant={getApplicantStatusVariant(applicant.overallStatus || applicant.status)}
                            className="mx-auto min-w-[110px] justify-center"
                          />
                        </td>
                        <td className="py-4 text-right relative">
                          <div 
                            ref={openMenuIdx === i ? menuContainerRef : undefined}
                            className="inline-block relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIdx(openMenuIdx === i ? null : i);
                              }}
                              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative z-10"
                              aria-label="Applicant options"
                            >
                              <MoreVerticalIcon size={18} />
                            </button>

                            {openMenuIdx === i && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-left">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuIdx(null);
                                    if (onViewDetails) {
                                      onViewDetails(applicant);
                                    } else {
                                      onHire(applicant);
                                    }
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  View details
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuIdx(null);
                                    onHire(applicant);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Hire applicant
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuIdx(null);
                                    const eligibility = isCandidateEligibleForRejection(applicant);
                                    if (!eligibility.eligible) {
                                      toast.error(eligibility.message || 'Rejection only works after Stage 3 pass (COMPLETED + overallPassed). Mid-assessment exits stay Failed, not this form.');
                                      return;
                                    }
                                    const effectiveJobId = jobId || data?.rolePostingId;
                                    const assessmentId = resolveAssessmentId(applicant, effectiveJobId);
                                    const applicantCode = applicant.applicantCode || applicant.id || applicant.talentId || 'candidate';
                                    const rejectAction = applicant.actions?.find((a: any) => (a.key || '').toUpperCase() === 'REJECT_APPLICANT');
                                    if (onReject) {
                                      onReject(applicant);
                                    } else if (effectiveJobId) {
                                      navigate(`/jobs/${effectiveJobId}/reject/${encodeURIComponent(applicantCode)}${assessmentId ? `?assessmentId=${encodeURIComponent(assessmentId)}` : ''}`, {
                                        state: {
                                          assessmentId,
                                          rolePostingId: effectiveJobId,
                                          applicant,
                                          actionPath: rejectAction?.path,
                                        },
                                      });
                                    }
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Reject applicant
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {applicants.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[13px] font-medium text-gray-400">
                        No applicants yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls for large applicant lists */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-2">
                  <span className="text-[12px] font-medium text-gray-500">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, applicants.length)} of {applicants.length} applicants
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIdx(null);
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-[12px] font-medium text-gray-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIdx(null);
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className="px-3 py-1 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>

        {/* Stage 1: Getting to know you */}
        <AccordionItem 
          title="Stage 1: Getting to know you" 
          icon={CheckIcon} 
          count={stage1Applicants.length > 0 ? stage1Applicants.length : data?.testResults?.psychometric?.passedCount ?? (data?.testResults?.psychometric?.items?.length || 0)}
          isOpen={openSection === 'Stage1' || openSection === 'Psychometric'} 
          onToggle={() => toggleSection('Stage1')}
        >
          {data?.testResults?.psychometric?.items && data.testResults.psychometric.items.length > 0 ? (
            <TestResultsTable 
              sectionName="Psychometric" 
              section={data.testResults.psychometric} 
              onOpenDossier={handleOpenDossierById}
            />
          ) : (
            <StageApplicantsTable
              applicants={stage1Applicants}
              onOpenDossier={handleOpenDossier}
              onHire={onHire}
              onReject={onReject}
              jobId={jobId}
              rolePostingId={data?.rolePostingId}
            />
          )}
        </AccordionItem>

        {/* Stage 2: Professional dimension */}
        <AccordionItem 
          title="Stage 2: Professional dimension" 
          icon={AlertTriangleIcon} 
          count={stage2Applicants.length > 0 ? stage2Applicants.length : data?.testResults?.situationalJudgement?.passedCount ?? (data?.testResults?.situationalJudgement?.items?.length || 0)}
          isOpen={openSection === 'Stage2' || openSection === 'SJT'} 
          onToggle={() => toggleSection('Stage2')}
        >
          {data?.testResults?.situationalJudgement?.items && data.testResults.situationalJudgement.items.length > 0 ? (
            <TestResultsTable 
              sectionName="Situational Judgement" 
              section={data.testResults.situationalJudgement} 
              onOpenDossier={handleOpenDossierById}
            />
          ) : (
            <StageApplicantsTable
              applicants={stage2Applicants}
              onOpenDossier={handleOpenDossier}
              onHire={onHire}
              onReject={onReject}
              jobId={jobId}
              rolePostingId={data?.rolePostingId}
            />
          )}
        </AccordionItem>

        {/* Stage 3: How you show up */}
        <AccordionItem 
          title="Stage 3: How you show up" 
          icon={PlayIcon} 
          count={stage3Applicants.length > 0 ? stage3Applicants.length : data?.testResults?.video?.passedCount ?? (data?.testResults?.video?.items?.length || 0)}
          isOpen={openSection === 'Stage3' || openSection === 'Video'} 
          onToggle={() => toggleSection('Stage3')}
        >
          {data?.testResults?.video?.items && data.testResults.video.items.length > 0 ? (
            <TestResultsTable 
              sectionName="Video Interview" 
              section={data.testResults.video} 
              onOpenDossier={handleOpenDossierById}
            />
          ) : (
            <StageApplicantsTable
              applicants={stage3Applicants}
              onOpenDossier={handleOpenDossier}
              onHire={onHire}
              onReject={onReject}
              jobId={jobId}
              rolePostingId={data?.rolePostingId}
            />
          )}
        </AccordionItem>
      </div>

      {/* Recommended Top Candidates */}
      <div className="bg-white border border-[#387DFF]/10 rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-medium text-[#0047CC] tracking-tight">VORA AI Recommendation</h3>
            <p className="text-[13px] font-medium text-[#387DFF]/70">
              {recommendation?.subtitle || 'Top candidates based on cross-sectional performance metrics'}
            </p>
          </div>
          {recommendation?.autoGenerated && (
            <Tag label="AUTO-GENERATED" variant="blue" />
          )}
        </div>

        {topCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCandidates.map((candidate, i) => {
              const score = candidate.overallScore ?? candidate.score;
              return (
                <div key={i} className="bg-white p-6 rounded-xl border border-[#387DFF]/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                    <div className="text-[24px] font-medium text-[#0047CC]/10 group-hover:text-[#0047CC]/20 transition-colors">#{i + 1}</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[14px] font-medium text-gray-900">{candidate.applicantCode}</p>
                      {candidate.reason && <p className="text-[12px] font-medium text-gray-400">{candidate.reason}</p>}
                    </div>
                    {score != null && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Overall Fit</p>
                          <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0047CC] rounded-full" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                        <span className="text-[18px] font-medium text-[#0047CC]">{score}%</span>
                      </div>
                    )}
                    <button 
                      onClick={() => onHire(candidate)}
                      className="w-full py-2.5 bg-[#0047CC] text-white rounded-xl text-[13px] font-medium hover:bg-[#387DFF] transition-all shadow-md active:scale-95 cursor-pointer border-none"
                    >
                      Hire Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
            <p className="text-[13px] font-medium text-gray-500">
              No scored candidates yet.
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              AI recommendations will populate here automatically once candidates complete and score their interviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsTabView;
