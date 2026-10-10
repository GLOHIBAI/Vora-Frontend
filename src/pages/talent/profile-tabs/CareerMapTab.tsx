import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import Select from '../../../components/common/Select';
import Tag from '../../../components/common/Tag';
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  FlashIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
} from '../../../components/common/Icons';
import type {
  TalentCareerMapData,
  TalentCareerMilestone,
  TalentDashboardProfile,
} from '../../../services/queries/talent';
import type { Option } from '../../../types';

interface CareerMapTabProps {
  data?: TalentCareerMapData;
  profile?: TalentDashboardProfile;
  isLoading?: boolean;
}

type FilterStatus = 'ALL' | 'VERIFIED' | 'DEMONSTRATED' | 'IN_PROGRESS' | 'PENDING_REVIEW';

// Specialized SVG Icons for Winding Road Career Map
const StarIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CompassIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const TrophyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M12 2v20" />
    <path d="M6 2h12v7a6 6 0 0 1-12 0V2z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const FlagIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" strokeWidth="2.5" stroke="currentColor" fill="none" />
  </svg>
);

// Helper to format short milestone labels on the road cards
const getMilestoneBadgeAndAction = (ms: TalentCareerMilestone) => {
  const domain = ms.competencyDomain;
  const isMentorship = domain.includes('Leadership') || ms.title.includes('Mentor');
  const isTarget = ms.isTargetRole;
  const isUpskilling = domain.includes('Documentation') || domain.includes('Innovation') || ms.title.includes('Course') || ms.title.includes('Protocol');

  const tag = isMentorship ? 'M1' : isTarget ? 'L2' : isUpskilling ? 'U1' : 'P1';

  let action = 'Checkpoint';
  if (ms.status === 'VERIFIED') action = 'Completed';
  else if (ms.status === 'IN_PROGRESS') action = isMentorship ? 'Started' : 'Enrolled';
  else if (isTarget) action = 'Joined';
  else if (ms.status === 'DEMONSTRATED') action = 'Demonstrated';
  else if (ms.status === 'PENDING_REVIEW') action = 'Audit';

  let topic = ms.competencyDomain.split('&')[0].split('-')[0].trim();
  if (topic.length > 20) {
    topic = topic.slice(0, 18).trim() + '...';
  }

  return { tag, action, topic };
};

// ============================================================================
// CONTINUOUS SERPENTINE ROAD COMPONENT (Refined with light blue & neutral palette)
// ============================================================================
interface ContinuousSerpentineRoadProps {
  milestones: TalentCareerMilestone[];
  selectedMilestoneId?: string;
  onSelectMilestone: (id: string) => void;
  startTitle?: string;
  startSubtitle?: string;
  finishTitle?: string;
  finishSubtitle?: string;
  currentStandingId?: string;
}

const ContinuousSerpentineRoad: React.FC<ContinuousSerpentineRoadProps> = ({
  milestones,
  selectedMilestoneId,
  onSelectMilestone,
  startTitle = 'Start of Trip',
  startSubtitle = 'Departure Point',
  finishTitle = 'Senior Clinical Operations Lead',
  finishSubtitle = 'Target Goal Summit',
  currentStandingId,
}) => {
  const rowChunks = useMemo(() => {
    const chunks: TalentCareerMilestone[][] = [];
    for (let i = 0; i < milestones.length; i += 3) {
      chunks.push(milestones.slice(i, i + 3));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [milestones]);

  const rowCount = Math.max(1, rowChunks.length);
  const Y0 = 120;
  const deltaY = 260;
  const totalHeight = Y0 + (rowCount - 1) * deltaY + 140;
  const xLeft = 160;
  const xRight = 840;
  const startX = 70;

  const lastRowIndex = rowCount - 1;
  const lastRowIsLTR = lastRowIndex % 2 === 0;
  const finishX = lastRowIsLTR ? 930 : 70;
  const finishY = Y0 + lastRowIndex * deltaY;

  const highwayPath = useMemo(() => {
    let d = `M ${startX},${Y0} `;
    const loopOffset = 150;

    for (let r = 0; r < rowCount; r++) {
      const yCurrent = Y0 + r * deltaY;
      const isLTR = r % 2 === 0;
      const isLastRow = r === rowCount - 1;

      if (isLTR) {
        d += `L ${xRight},${yCurrent} `;
        if (!isLastRow) {
          const yNext = yCurrent + deltaY;
          d += `C ${xRight + loopOffset},${yCurrent} ${xRight + loopOffset},${yNext} ${xRight},${yNext} `;
        } else {
          d += `L ${finishX},${yCurrent} `;
        }
      } else {
        d += `L ${xLeft},${yCurrent} `;
        if (!isLastRow) {
          const yNext = yCurrent + deltaY;
          d += `C ${xLeft - loopOffset},${yCurrent} ${xLeft - loopOffset},${yNext} ${xLeft},${yNext} `;
        } else {
          d += `L ${finishX},${yCurrent} `;
        }
      }
    }

    return d;
  }, [rowCount, Y0, deltaY, xLeft, xRight, startX, finishX]);

  const milestoneNodes = useMemo(() => {
    const nodes: Array<{
      milestone: TalentCareerMilestone;
      x: number;
      y: number;
      xPercent: number;
      yPercent: number;
    }> = [];

    rowChunks.forEach((chunk, r) => {
      const yCurrent = Y0 + r * deltaY;
      const isLTR = r % 2 === 0;
      const m = chunk.length;

      chunk.forEach((ms, idx) => {
        let x = 500;
        if (m === 1) {
          x = 500;
        } else if (m === 2) {
          x = isLTR
            ? idx === 0 ? 360 : 640
            : idx === 0 ? 640 : 360;
        } else {
          x = isLTR
            ? idx === 0 ? 280 : idx === 1 ? 500 : 720
            : idx === 0 ? 720 : idx === 1 ? 500 : 280;
        }

        nodes.push({
          milestone: ms,
          x,
          y: yCurrent,
          xPercent: (x / 1000) * 100,
          yPercent: (yCurrent / totalHeight) * 100,
        });
      });
    });

    return nodes;
  }, [rowChunks, Y0, deltaY, totalHeight]);

  return (
    <div className="relative w-full rounded-xl bg-slate-50/60 p-2 sm:p-4 border border-slate-200 shadow-xs">
      <div className="relative w-full" style={{ paddingBottom: `${(totalHeight / 1000) * 100}%` }}>
        <svg
          viewBox={`0 0 1000 ${totalHeight}`}
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none select-none"
          preserveAspectRatio="none"
        >
          {/* Ambient Road Bed */}
          <path
            d={highwayPath}
            fill="none"
            stroke="rgba(0, 71, 204, 0.05)"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highway Curbs & Border (Light Blue) */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#93C5FD"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clean Road Surface Asphalt (Luminous Light Blue) */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#EFF6FF"
            strokeWidth="42"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road Interior Highlight */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Dividing Highway Dashed Line in light blue */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="9 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Painted Start Line */}
          <line
            x1="70"
            y1={Y0 - 21}
            x2="70"
            y2={Y0 + 21}
            stroke="#3B82F6"
            strokeWidth="4"
            strokeDasharray="5 3"
          />

          {/* Painted Destination Gate */}
          <line
            x1={finishX}
            y1={finishY - 21}
            x2={finishX}
            y2={finishY + 21}
            stroke="#0047CC"
            strokeWidth="6"
            strokeDasharray="4 4"
          />
        </svg>

        {/* 1. START / DEPARTURE GATE (Neutral container with blue accent) */}
        <div
          style={{
            left: `${(startX / 1000) * 100}%`,
            top: `${(Y0 / totalHeight) * 100}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none"
        >
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0047CC] shadow-xs flex items-center justify-center text-[#0047CC] ring-4 ring-blue-500/10">
            <CompassIcon size={18} className="text-[#0047CC]" />
          </div>

          <div className="mt-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {startTitle}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
              {startSubtitle}
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE MILESTONE CHECKPOINTS ALONG THE ROAD */}
        {milestoneNodes.map(({ milestone: ms, xPercent, yPercent }) => {
          const isSelected = selectedMilestoneId === ms.id;
          const { tag, action, topic } = getMilestoneBadgeAndAction(ms);
          const isStar = ms.isTargetRole || ms.title.includes('Lead') || ms.title.includes('Joined') || ms.title.includes('Level');
          const isCurrentStanding = currentStandingId === ms.id || (ms.role.includes('Specialist') && ms.status === 'VERIFIED' && ms.id === 'ms-curr-1');

          return (
            <div
              key={ms.id}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer select-none"
              onClick={() => onSelectMilestone(ms.id)}
            >
              {/* 'YOU ARE HERE' Beacon for Candidate Current Standing */}
              {isCurrentStanding && (
                <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-[#0047CC] text-white text-xs font-semibold shadow-xs whitespace-nowrap border border-white">
                  You Are Here
                </div>
              )}

              {/* Stop Circular Badge */}
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-[#0047CC] ring-4 ring-blue-500/20 shadow-md scale-110'
                    : 'bg-white border-2 border-slate-300 hover:border-[#0047CC] hover:scale-105 shadow-xs'
                }`}
              >
                {/* Icon */}
                {isStar ? (
                  <StarIcon size={16} className="text-[#0047CC]" />
                ) : ms.status === 'VERIFIED' ? (
                  <CheckIcon size={16} className="text-[#0047CC]" />
                ) : ms.status === 'IN_PROGRESS' ? (
                  <ArrowRightIcon size={16} className="text-[#0047CC]" />
                ) : (
                  <CheckIcon size={16} className="text-[#0047CC]" />
                )}

                {/* Tag Pill on top-right (blue-50 with blue text, no black) */}
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 shadow-2xs">
                  {tag}
                </span>
              </div>

              {/* Attached White Milestone Card */}
              <div
                className={`mt-2 px-2.5 py-1.5 rounded-lg border text-center transition-all shadow-xs max-w-[140px] sm:max-w-[160px] ${
                  isSelected
                    ? 'bg-white border-[#0047CC] shadow-sm ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 group-hover:border-blue-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {action} · {topic}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {ms.date}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. FINISH / DESTINATION SUMMIT (Neutral container with blue accent) */}
        <div
          style={{
            left: `${(finishX / 1000) * 100}%`,
            top: `${(finishY / totalHeight) * 100}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none"
        >
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0047CC] shadow-xs flex items-center justify-center text-[#0047CC] ring-4 ring-blue-500/10">
            <TrophyIcon size={18} className="text-[#0047CC]" />
          </div>

          <div className="mt-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-center shadow-xs max-w-[150px]">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-800 leading-tight">
              <span>Finish Up</span>
              <FlagIcon size={12} className="text-[#0047CC]" />
            </div>
            <div className="text-xs text-slate-900 font-semibold truncate mt-0.5">
              {finishTitle}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {finishSubtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CareerMapTab: React.FC<CareerMapTabProps> = ({
  data,
  profile,
  isLoading,
}) => {
  // Filter States
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [selectedEraId, setSelectedEraId] = useState<string>('ALL');
  const [targetOnly, setTargetOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CONTINUOUS_HIGHWAY' | 'BY_CHAPTER'>('BY_CHAPTER');

  // Milestone selection for Inspector
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    data?.eras?.[0]?.milestones?.[0]?.id || 'ms-target-1'
  );

  // Modal: Add Milestone
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('Senior Clinical Operations Lead');
  const [newEra, setNewEra] = useState('2025 - 2026');
  const [newDomain, setNewDomain] = useState('Regulatory & Audit Oversight');
  const [newEvidence, setNewEvidence] = useState('');

  // Local additions
  const [localMilestones, setLocalMilestones] = useState<TalentCareerMilestone[]>([]);

  // Candidate identity
  const candidateName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : data?.candidateName || 'Adaeze Nwosu';
  const candidateRole = profile?.headline || data?.candidateRole || 'Clinical Operations Specialist';
  const targetRole = data?.targetRole || 'Senior Clinical Operations Lead';
  const stageGateBadge = data?.stageGateBadge || 'Stage 3 Gate';

  const summary = data?.summary || {
    currentLevel: 'L4',
    currentLevelTitle: 'Advanced · Clinical Operations Specialist',
    targetLevel: 'L5',
    targetLevelTitle: 'Principal · Senior Clinical Operations Lead',
    totalMilestones: 58,
    verifiedMilestones: 45,
    relevancyCount: 8,
    demonstratedCount: 11,
    inProgressCount: 3,
    pendingReviewCount: 2,
    readinessProgressPercent: 78,
  };

  const readinessLevels = data?.readinessLevels || [];
  const eras = data?.eras || [];
  const pathLadder = data?.pathLadder || [];

  // Dropdown Options
  const statusOptions: Option[] = useMemo(() => [
    { label: `All milestones (${summary.totalMilestones + localMilestones.length})`, value: 'ALL' },
    { label: `Verified (${summary.verifiedMilestones})`, value: 'VERIFIED' },
    { label: `Demonstrated (${summary.demonstratedCount})`, value: 'DEMONSTRATED' },
    { label: `In-progress (${summary.inProgressCount})`, value: 'IN_PROGRESS' },
    { label: `Pending review (${summary.pendingReviewCount + localMilestones.length})`, value: 'PENDING_REVIEW' },
  ], [summary, localMilestones.length]);

  const eraOptions: Option[] = useMemo(() => [
    { label: 'All career eras', value: 'ALL' },
    ...eras.map((era) => ({
      label: `${era.yearRange} (${era.roleTitle.split('(')[0].trim()})`,
      value: era.id,
    })),
  ], [eras]);

  // Filtered Eras & Milestones
  const filteredEras = useMemo(() => {
    return eras.map((era) => {
      const combined = [
        ...era.milestones,
        ...localMilestones.filter((m) => m.era === era.yearRange),
      ];

      const matches = combined.filter((m) => {
        if (targetOnly && !m.isTargetRole) return false;
        if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
        if (selectedEraId !== 'ALL' && era.id !== selectedEraId) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchDomain = m.competencyDomain.toLowerCase().includes(q);
          const matchDesc = m.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDomain && !matchDesc) return false;
        }
        return true;
      });

      return {
        ...era,
        filteredMilestones: matches,
      };
    }).filter((era) => (selectedEraId === 'ALL' || era.id === selectedEraId) && era.filteredMilestones.length > 0);
  }, [eras, localMilestones, targetOnly, statusFilter, selectedEraId, searchQuery]);

  const allFilteredMilestones = useMemo(() => {
    const list: TalentCareerMilestone[] = [];
    filteredEras.forEach((era) => {
      list.push(...era.filteredMilestones);
    });
    return list;
  }, [filteredEras]);

  const selectedMilestone = useMemo(() => {
    const fromLocal = localMilestones.find((m) => m.id === selectedMilestoneId);
    if (fromLocal) return fromLocal;

    for (const era of eras) {
      const found = era.milestones.find((m) => m.id === selectedMilestoneId);
      if (found) return found;
    }
    return allFilteredMilestones[0] || eras[0]?.milestones[0];
  }, [eras, localMilestones, selectedMilestoneId, allFilteredMilestones]);

  const currentMilestoneIndex = useMemo(() => {
    if (!selectedMilestone) return 0;
    const idx = allFilteredMilestones.findIndex((m) => m.id === selectedMilestone.id);
    return idx >= 0 ? idx : 0;
  }, [allFilteredMilestones, selectedMilestone]);

  const handlePrevMilestone = () => {
    if (currentMilestoneIndex > 0) {
      setSelectedMilestoneId(allFilteredMilestones[currentMilestoneIndex - 1].id);
    }
  };

  const handleNextMilestone = () => {
    if (currentMilestoneIndex < allFilteredMilestones.length - 1) {
      setSelectedMilestoneId(allFilteredMilestones[currentMilestoneIndex + 1].id);
    }
  };

  const handleSelectMilestone = (id: string) => {
    setSelectedMilestoneId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const el = document.getElementById('milestone-inspector-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const selectedMilestoneStageInfo = useMemo(() => {
    if (!selectedMilestone) {
      return {
        tag: 'U1',
        category: 'Upskilling',
        pathTitle: 'Clinical Documentation',
        activeStageIndex: 0,
        stages: [
          { name: 'Enrolled', date: '10 April 2025' },
          { name: 'Checkpoint', date: '21 April 2025' },
          { name: 'Completed', date: '1 May 2025' },
        ],
      };
    }

    const domain = selectedMilestone.competencyDomain;
    const isMentorship = domain.includes('Leadership') || selectedMilestone.title.includes('Mentor');
    const isTarget = selectedMilestone.isTargetRole || selectedMilestone.title.includes('Lead');
    const isUpskilling = domain.includes('Documentation') || domain.includes('Innovation') || selectedMilestone.title.includes('Course') || selectedMilestone.title.includes('Protocol');

    const tag = isMentorship ? 'M1' : isTarget ? 'L2' : isUpskilling ? 'U1' : 'P1';
    const category = isMentorship ? 'Mentorship' : isTarget ? 'Promotion' : isUpskilling ? 'Upskilling' : 'Milestone';

    let activeStageIndex = 0;
    if (selectedMilestone.status === 'VERIFIED') activeStageIndex = 2;
    else if (selectedMilestone.status === 'IN_PROGRESS' || selectedMilestone.status === 'DEMONSTRATED') activeStageIndex = 1;
    else activeStageIndex = 0;

    return {
      tag,
      category,
      pathTitle: domain || selectedMilestone.title,
      activeStageIndex,
      stages: [
        { name: 'Enrolled', date: selectedMilestone.date },
        { name: 'Checkpoint', date: selectedMilestone.date },
        { name: 'Completed', date: selectedMilestone.date },
      ],
    };
  }, [selectedMilestone]);

  const readinessAtStop = useMemo(() => {
    const total = allFilteredMilestones.length || 1;
    const progress = Math.min(88, Math.max(18, Math.round(20 + (currentMilestoneIndex / total) * 62)));
    const liftStr = selectedMilestone?.scoreLift?.match(/\+[\d.]+/)?.[0] || '+2';
    return {
      score: progress,
      lift: liftStr,
    };
  }, [allFilteredMilestones.length, currentMilestoneIndex, selectedMilestone]);

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }

    const created: TalentCareerMilestone = {
      id: `ms-custom-${Date.now()}`,
      title: newTitle.trim(),
      role: newRole,
      era: newEra,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'PENDING_REVIEW',
      statusLabel: 'Pending review',
      competencyDomain: newDomain,
      description: 'Self-reported candidate milestone submitted with verification evidence for review.',
      evidenceSubmitted: newEvidence.trim() || 'Uploaded certificate & clinical documentation reference',
      reviewer: 'Pending VORA Clinical Review Board Assignment',
      scoreLift: '+2.5% Projected Career Lift',
      isTargetRole: newEra.includes('Target') || newEra.includes('2025') || newEra.includes('2026'),
    };

    setLocalMilestones((prev) => [created, ...prev]);
    setSelectedMilestoneId(created.id);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewEvidence('');
    toast.success('Career milestone recorded and submitted for audit verification.');
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO: Unified Dark Navy Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#060E20] via-[#0A1628] to-[#0F1E38] text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <Tag variant="blue" label={`${stageGateBadge} Verified Candidate Profile`} />
            </div>

            <h2 className="text-[28px] font-semibold tracking-tight text-white leading-tight">
              {candidateName}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              <strong className="text-white font-medium">{candidateRole}</strong> (Level {summary.currentLevel}) transitioning toward{' '}
              <strong className="text-white font-medium">{targetRole}</strong> (Level {summary.targetLevel}).
              Chronological competencies audited by clinical supervisors and trial boards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <PlusIcon size={14} className="text-[#0047CC]" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CAREER MAP SUMMARY KPI STATS (Gray labels, Blue key figures, Gray sublabels) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Readiness */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Overall Readiness
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.readinessProgressPercent}%
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            Level {summary.currentLevel} → {summary.targetLevel}
          </div>
        </div>

        {/* Card 2: Total Milestones */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Total Milestones
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.totalMilestones + localMilestones.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <CheckCircleIcon size={12} className="text-[#0047CC]" />
            <span>{summary.verifiedMilestones} verified</span>
          </div>
        </div>

        {/* Card 3: Relevancy */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Relevancy
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.relevancyCount}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            2 direct · 6 evolving
          </div>
        </div>

        {/* Card 4: Demonstrated */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Demonstrated
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.demonstratedCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <FlashIcon size={12} className="text-[#0047CC]" />
            <span>Evidence confirmed</span>
          </div>
        </div>

        {/* Card 5: In Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            In Progress
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.inProgressCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
            <ClockIcon size={12} className="text-[#0047CC]" />
            <span>Active evaluation</span>
          </div>
        </div>

        {/* Card 6: Pending Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
            Pending Review
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0047CC] leading-tight">
            {summary.pendingReviewCount + localMilestones.length}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            Awaiting audit
          </div>
        </div>
      </div>

      {/* 3. READINESS ROADMAP (Done = blue check, Current = blue ring, Target = blue dashed, Future = gray) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span>Readiness Roadmap</span>
              <Tag variant="blue" label={`${summary.readinessProgressPercent}% Overall Score`} />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trajectory through L1–L6 competency milestones across candidate career history and target goals.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#0047CC] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0047CC]" /> Completed
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#0047CC] font-medium">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#0047CC]" /> Current (L4)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#0047CC] font-medium">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#0047CC]" /> Target (L5)
            </span>
          </div>
        </div>

        {/* Linear Level Track */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
          {readinessLevels.map((lvl) => {
            const isCompleted = lvl.status === 'COMPLETED';
            const isCurrent = lvl.status === 'CURRENT';
            const isTarget = lvl.status === 'TARGET';

            let cardStyle = 'bg-slate-50 border-slate-200 text-slate-500';
            if (isCompleted) {
              cardStyle = 'bg-blue-50 border-blue-200 text-[#0047CC]';
            } else if (isCurrent) {
              cardStyle = 'border-2 border-[#0047CC] bg-blue-50/20 text-[#0047CC]';
            } else if (isTarget) {
              cardStyle = 'border-2 border-dashed border-[#0047CC] bg-blue-50/20 text-[#0047CC]';
            }

            return (
              <div
                key={lvl.level}
                className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${cardStyle}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-semibold text-xs">
                      {lvl.level}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {lvl.yearRange}
                    </span>
                  </div>
                  <div className="text-xs font-semibold line-clamp-1 leading-snug">
                    {lvl.title}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-[#0047CC] h-full rounded-full transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : isCurrent ? '75%' : isTarget ? '35%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CAREER MAP EXPLORER: SEARCH + SELECT + STICKY INSPECTOR */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Header with Title & Target Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Career Map</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive winding career highway connecting candidate milestones, upskilling moments, and mentorship across eras.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={targetOnly}
              onChange={(e) => setTargetOnly(e.target.checked)}
              className="rounded text-[#0047CC] focus:ring-[#0047CC] h-3.5 w-3.5"
            />
            <span>Focus Target Role Milestones Only</span>
          </label>
        </div>

        {/* FILTER TOOLBAR: Search Bar on LEFT, Reusable Dropdown Filters on RIGHT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pt-1 pb-3 border-b border-slate-100 relative z-30">
          {/* SEARCH BAR (LEFT) */}
          <div className="relative flex-1 max-w-sm sm:max-w-md">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search milestones, skills, evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0047CC] bg-slate-50/70 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>

          {/* REUSABLE SELECT DROPDOWNS (RIGHT) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="w-full sm:w-[195px] relative">
              <Select
                hideLabel={true}
                variant="compact"
                align="right"
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="w-full rounded-lg border-slate-200 bg-white font-medium text-xs py-2 px-3 shadow-2xs hover:border-slate-300 cursor-pointer"
                menuClassName="!left-auto !right-0 !min-w-[220px] !max-w-[280px] shadow-lg z-50 rounded-xl"
              />
            </div>

            <div className="w-full sm:w-[210px] relative">
              <Select
                hideLabel={true}
                variant="compact"
                align="right"
                value={selectedEraId}
                options={eraOptions}
                onChange={(e) => setSelectedEraId(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-white font-medium text-xs py-2 px-3 shadow-2xs hover:border-slate-300 cursor-pointer"
                menuClassName="!left-auto !right-0 !min-w-[260px] !max-w-[340px] shadow-lg z-50 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* VIEW MODE TOGGLE */}
        {selectedEraId === 'ALL' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('BY_CHAPTER')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'BY_CHAPTER' ? 'bg-white text-[#0047CC] font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Chapters Itinerary
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CONTINUOUS_HIGHWAY')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'CONTINUOUS_HIGHWAY' ? 'bg-white text-[#0047CC] font-semibold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Full Continuous Highway
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Continuous winding highway connecting {allFilteredMilestones.length} milestones
            </div>
          </div>
        )}

        {/* MAIN SPLIT: WINDING ROAD (LEFT) + STICKY DETAILS INSPECTOR (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* LEFT: HIGHWAY CANVAS */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 space-y-8">
            {filteredEras.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No milestones match the selected filter. Try selecting "All milestones" or clearing your search.
              </div>
            ) : selectedEraId === 'ALL' && viewMode === 'CONTINUOUS_HIGHWAY' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-xs font-semibold text-[#0047CC] uppercase tracking-wider">
                      Complete Journey Route
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Career Launchpad → Target Goal Highway
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {allFilteredMilestones.length} Stops · 5 Chapters
                  </span>
                </div>

                <ContinuousSerpentineRoad
                  milestones={allFilteredMilestones}
                  selectedMilestoneId={selectedMilestoneId}
                  onSelectMilestone={handleSelectMilestone}
                  startTitle="Career Origin"
                  startSubtitle="2018 Launchpad"
                  finishTitle="Senior Clinical Operations Lead"
                  finishSubtitle="L5 Target Summit Reached"
                  currentStandingId="ms-curr-1"
                />
              </div>
            ) : (
              <div className="space-y-8">
                {filteredEras.map((era, eraIndex) => {
                  const chapterNumber = eraIndex + 1;

                  return (
                    <div key={era.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
                      {/* Chapter Title Badge & Year Range */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#0047CC] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            {era.yearRange}
                          </span>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 shadow-2xs">
                            <span>CH {chapterNumber} {era.roleTitle.split('(')[0].trim()}</span>
                          </div>
                          {era.isTarget && (
                            <Tag variant="yellow" label="Target Goal" />
                          )}
                          {era.isCurrent && (
                            <Tag variant="blue" label="Current Standing" />
                          )}
                        </div>

                        <span className="text-xs font-medium text-slate-500">
                          {era.filteredMilestones.length} milestones on path
                        </span>
                      </div>

                      <ContinuousSerpentineRoad
                        milestones={era.filteredMilestones}
                        selectedMilestoneId={selectedMilestoneId}
                        onSelectMilestone={handleSelectMilestone}
                        startTitle={era.isTarget ? 'Era Launch' : era.isCurrent ? 'Current Phase' : 'Era Origin'}
                        startSubtitle={era.yearRange.split('-')[0].trim()}
                        finishTitle={era.roleTitle.split('(')[0].trim()}
                        finishSubtitle={era.isTarget ? 'Target Goal Summit · L5' : `${era.statusLabel}`}
                        currentStandingId="ms-curr-1"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: THE MILESTONE DETAILS INSPECTOR PANEL */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full">
            <div id="milestone-inspector-panel" className="sticky top-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              {selectedMilestone ? (
                <>
                  {/* Top Bar: Category Pill & Moment X of Total & Prev/Next Arrows */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Tag variant="blue" label={selectedMilestoneStageInfo.category} />
                      <span className="text-xs font-medium text-slate-500">
                        Moment {currentMilestoneIndex + 1} of {allFilteredMilestones.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMilestone}
                        disabled={currentMilestoneIndex === 0}
                        aria-label="Previous milestone moment"
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Previous moment"
                      >
                        <ChevronLeftIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMilestone}
                        disabled={currentMilestoneIndex >= allFilteredMilestones.length - 1}
                        aria-label="Next milestone moment"
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Next moment"
                      >
                        <ChevronRightIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Milestone inspector active.')}
                        aria-label="Close inspector"
                        className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Title, Date & Description */}
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                      {selectedMilestone.title}
                    </h4>
                    <div className="text-xs text-slate-500 font-medium">
                      {selectedMilestone.date}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pt-1">
                      {selectedMilestone.description}
                    </p>
                  </div>

                  {/* Readiness Progress Meter at this Stop */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Readiness at this stop</span>
                      <span className="font-semibold text-slate-900">
                        {readinessAtStop.score}%{' '}
                        <span className="text-[#0047CC]">({readinessAtStop.lift})</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0047CC] transition-all duration-500"
                        style={{ width: `${readinessAtStop.score}%` }}
                      />
                    </div>
                  </div>

                  {/* EVERY STAGE ON THIS PATH SECTION */}
                  <div className="pt-2 space-y-3">
                    <div className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                      EVERY STAGE ON THIS PATH
                    </div>

                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                      {/* Path Card Header */}
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0047CC] border border-blue-200 text-xs font-semibold flex items-center justify-center shrink-0">
                            {selectedMilestoneStageInfo.tag}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                              {selectedMilestoneStageInfo.pathTitle}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {selectedMilestoneStageInfo.category} · stage {selectedMilestoneStageInfo.activeStageIndex + 1} of {selectedMilestoneStageInfo.stages.length}
                            </div>
                          </div>
                        </div>

                        <Tag
                          variant={selectedMilestone.status === 'VERIFIED' ? 'green' : 'blue'}
                          label={selectedMilestone.status === 'VERIFIED' ? 'Completed' : selectedMilestone.statusLabel}
                        />
                      </div>

                      {/* Vertical Stages List */}
                      <div className="space-y-1.5 pt-1">
                        {selectedMilestoneStageInfo.stages.map((stg, stgIdx) => {
                          const isCurrent = stgIdx === selectedMilestoneStageInfo.activeStageIndex;

                          return (
                            <div
                              key={stg.name}
                              className={`flex items-start gap-3 p-2 rounded-lg transition-all ${
                                isCurrent
                                  ? 'bg-blue-50/70 border border-blue-200'
                                  : 'text-slate-700'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isCurrent
                                      ? 'border-[#0047CC] bg-[#0047CC]'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                {stgIdx < selectedMilestoneStageInfo.stages.length - 1 && (
                                  <span className="w-0.5 h-6 bg-slate-200 my-0.5" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-900">
                                  {stg.name}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                  {stg.date}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Verification Dossier Audit Details */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-start justify-between py-1 gap-2">
                      <span className="text-slate-500 font-medium">Evidence</span>
                      <span className="font-semibold text-slate-900 text-right line-clamp-2">
                        {selectedMilestone.evidenceSubmitted || 'Clinical audit log & trial record'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-1 gap-2">
                      <span className="text-slate-500 font-medium">Reviewer</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {selectedMilestone.reviewer || 'VORA Lead Clinical Assessment Committee'}
                      </span>
                    </div>
                    {selectedMilestone.scoreLift && (
                      <div className="flex items-start justify-between py-1 gap-2">
                        <span className="text-slate-500 font-medium">Projected Lift</span>
                        <span className="font-semibold text-[#0047CC]">
                          {selectedMilestone.scoreLift}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Select any milestone stop on the road to view its details and stage path.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Quick Inspector Drawer */}
        {selectedMilestone && (
          <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 shrink-0">
                {selectedMilestoneStageInfo.tag}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {selectedMilestone.title}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Readiness: {readinessAtStop.score}% ({readinessAtStop.lift})
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('milestone-inspector-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#0047CC] text-white text-xs font-semibold shrink-0 hover:bg-[#003bb5] shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              View Details ↓
            </button>
          </div>
        )}
      </div>

      {/* 5. CAREER PATH MILESTONES LADDER (White cards, neutral borders, only Current has blue border) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Career Path Milestones Ladder</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked progression sequence across candidate clinical career history and target promotions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {pathLadder.map((item) => {
            const isTarget = item.status === 'PENDING_REVIEW';
            const isCurrent = item.status === 'IN_PROGRESS';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between bg-white shadow-xs ${
                  isCurrent
                    ? 'border-[#0047CC] ring-1 ring-blue-500/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                        isCurrent
                          ? 'bg-blue-50 text-[#0047CC]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <Tag
                      variant={isTarget ? 'yellow' : isCurrent ? 'blue' : 'green'}
                      label={item.statusLabel}
                    />
                  </div>
                  <div className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
                    {item.roleTitle}
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-2">
                  {item.era}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. MODAL: ADD MILESTONE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Add Career Milestone</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Trial Protocol Design & Quality Governance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0047CC] text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Associated Role
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0047CC] text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Era / Year
                  </label>
                  <input
                    type="text"
                    value={newEra}
                    onChange={(e) => setNewEra(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0047CC] text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Competency Domain
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0047CC] text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Evidence Submitted / Documentation Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Uploaded GCP Audit completion log, sponsor signoff, or certification ID"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0047CC] text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0047CC] hover:bg-[#003bb5] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
