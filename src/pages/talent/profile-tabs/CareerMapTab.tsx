import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import Select from '../../../components/common/Select';
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  BriefcaseIcon,
  FlashIcon,
  RefreshIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  ChevronDownIcon,
  MapPinIcon,
  FileIcon,
  UploadIcon,
  CheckIcon,
} from '../../../components/common/Icons';
import type {
  TalentCareerMapData,
  TalentCareerMilestone,
  TalentCareerEra,
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

// Helper to format short, elegant milestone labels on the road cards
const getMilestoneBadgeAndAction = (ms: TalentCareerMilestone) => {
  const domain = ms.competencyDomain;
  const isMentorship = domain.includes('Leadership') || ms.title.includes('Mentor');
  const isTarget = ms.isTargetRole;
  const isUpskilling = domain.includes('Documentation') || domain.includes('Innovation') || ms.title.includes('Course') || ms.title.includes('Protocol');

  // Tag
  const tag = isMentorship ? 'M1' : isTarget ? 'L2' : isUpskilling ? 'U1' : 'P1';

  // Action prefix
  let action = 'Checkpoint';
  if (ms.status === 'VERIFIED') action = 'Completed';
  else if (ms.status === 'IN_PROGRESS') action = isMentorship ? 'Started' : 'Enrolled';
  else if (isTarget) action = 'Joined';
  else if (ms.status === 'DEMONSTRATED') action = 'Demonstrated';
  else if (ms.status === 'PENDING_REVIEW') action = 'Audit';

  // Concise topic
  let topic = ms.competencyDomain.split('&')[0].split('-')[0].trim();
  if (topic.length > 20) {
    topic = topic.slice(0, 18).trim() + '...';
  }

  return { tag, action, topic };
};

// ============================================================================
// CONTINUOUS SERPENTINE ROAD COMPONENT
// Renders an unbroken, continuous winding highway where every row joins the next
// via smooth highway U-turn loops, starting at Departure and finishing at Destination!
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
  // Slicing milestones into alternating rows of up to 3 milestones per row
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

  // The last row determines where the finish line sits
  const lastRowIndex = rowCount - 1;
  const lastRowIsLTR = lastRowIndex % 2 === 0;
  const finishX = lastRowIsLTR ? 930 : 70;
  const finishY = Y0 + lastRowIndex * deltaY;

  // Generate single continuous highway path
  const highwayPath = useMemo(() => {
    let d = `M ${startX},${Y0} `;
    const loopOffset = 150;

    for (let r = 0; r < rowCount; r++) {
      const yCurrent = Y0 + r * deltaY;
      const isLTR = r % 2 === 0;
      const isLastRow = r === rowCount - 1;

      if (isLTR) {
        // Traveling Left to Right
        d += `L ${xRight},${yCurrent} `;

        if (!isLastRow) {
          // U-turn loop to next row on the right
          const yNext = yCurrent + deltaY;
          d += `C ${xRight + loopOffset},${yCurrent} ${xRight + loopOffset},${yNext} ${xRight},${yNext} `;
        } else {
          // Final stretch into finish gate
          d += `L ${finishX},${yCurrent} `;
        }
      } else {
        // Traveling Right to Left
        d += `L ${xLeft},${yCurrent} `;

        if (!isLastRow) {
          // U-turn loop to next row on the left
          const yNext = yCurrent + deltaY;
          d += `C ${xLeft - loopOffset},${yCurrent} ${xLeft - loopOffset},${yNext} ${xLeft},${yNext} `;
        } else {
          // Final stretch into finish gate
          d += `L ${finishX},${yCurrent} `;
        }
      }
    }

    return d;
  }, [rowCount, Y0, deltaY, xLeft, xRight, startX, finishX]);

  // Compute exact coordinates for each milestone stop along the road
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
    <div className="relative w-full rounded-3xl bg-linear-to-b from-blue-50/40 via-white/80 to-blue-50/20 p-2 sm:p-4 border border-blue-100 shadow-2xs">
      {/* SVG Canvas for the Continuous Highway */}
      <div className="relative w-full" style={{ paddingBottom: `${(totalHeight / 1000) * 100}%` }}>
        <svg
          viewBox={`0 0 1000 ${totalHeight}`}
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none select-none"
          preserveAspectRatio="none"
        >
          {/* Ambient Road Bed Glow */}
          <path
            d={highwayPath}
            fill="none"
            stroke="rgba(0, 71, 204, 0.08)"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highway Curbs & Border (Crisp Primary Blue) */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#60A5FA"
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

          {/* Road Interior Asphalt Highlight */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Dividing Highway Dashed Line (flows through all U-turns seamlessly!) */}
          <path
            d={highwayPath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="9 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* Painted Start Line Grid at Departure Gate */}
          <line
            x1="70"
            y1={Y0 - 21}
            x2="70"
            y2={Y0 + 21}
            stroke="#3B82F6"
            strokeWidth="4"
            strokeDasharray="5 3"
          />

          {/* Painted Checkered Finish Line at Destination Gate */}
          <line
            x1={finishX}
            y1={finishY - 21}
            x2={finishX}
            y2={finishY + 21}
            stroke="#0B1739"
            strokeWidth="6"
            strokeDasharray="4 4"
          />
          <line
            x1={finishX}
            y1={finishY - 21}
            x2={finishX}
            y2={finishY + 21}
            stroke="#F59E0B"
            strokeWidth="6"
            strokeDasharray="4 4"
            strokeDashoffset="4"
          />
        </svg>

        {/* 1. START / DEPARTURE GATE STATION */}
        <div
          style={{
            left: `${(startX / 1000) * 100}%`,
            top: `${(Y0 / totalHeight) * 100}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none"
        >
          {/* Start Circular Pin */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white ring-4 ring-emerald-500/20">
            <CompassIcon size={18} className="text-white" />
          </div>

          {/* Start Tag & Subtitle */}
          <div className="mt-2 px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-center shadow-xs">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 leading-tight">
              {startTitle}
            </div>
            <div className="text-[9px] text-gray-500 font-semibold truncate max-w-[110px]">
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
              {/* Optional: 'YOU ARE HERE' Beacon for Candidate Current Standing */}
              {isCurrentStanding && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-[#0047CC] text-white text-[9px] font-extrabold shadow-sm animate-pulse whitespace-nowrap border border-white">
                  You Are Here
                </div>
              )}

              {/* Stop Circular Badge */}
              <div
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-[#0047CC] ring-4 ring-[#0047CC]/30 shadow-lg scale-110'
                    : 'bg-white border-2 border-[#3B82F6] hover:border-[#0047CC] hover:scale-105 shadow-md'
                }`}
              >
                {/* Icon */}
                {isStar ? (
                  <StarIcon size={18} className="text-[#0047CC]" />
                ) : ms.status === 'VERIFIED' ? (
                  <CheckIcon size={16} className="text-[#0047CC]" />
                ) : ms.status === 'IN_PROGRESS' ? (
                  <ArrowRightIcon size={16} className="text-[#0047CC]" />
                ) : (
                  <CheckIcon size={16} className="text-[#0047CC]" />
                )}

                {/* Tag Pill on top-right */}
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#0B1739] text-white border border-white shadow-2xs">
                  {tag}
                </span>
              </div>

              {/* Attached White Milestone Card */}
              <div
                className={`mt-2 px-2.5 py-1.5 rounded-xl border text-center transition-all shadow-xs max-w-[130px] sm:max-w-[155px] ${
                  isSelected
                    ? 'bg-white border-[#0047CC] shadow-md ring-2 ring-[#0047CC]/20'
                    : 'bg-white/95 border-gray-200/90 group-hover:border-blue-300'
                }`}
              >
                <div className="text-[10px] sm:text-[11px] font-extrabold text-gray-900 truncate leading-tight">
                  {action} · {topic}
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 font-semibold mt-0.5">
                  {ms.date}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. FINISH / DESTINATION SUMMIT TERMINAL */}
        <div
          style={{
            left: `${(finishX / 1000) * 100}%`,
            top: `${(finishY / totalHeight) * 100}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none"
        >
          {/* Finish Circular Pin */}
          <div className="w-11 h-11 rounded-full bg-linear-to-tr from-amber-500 to-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 ring-amber-500/25">
            <TrophyIcon size={18} className="text-white" />
          </div>

          {/* Finish Tag & Destination Label */}
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-center shadow-md max-w-[150px]">
            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 leading-tight">
              <span>Finish Up</span>
              <FlagIcon size={11} className="text-amber-600" />
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-900 font-bold truncate mt-0.5">
              {finishTitle}
            </div>
            <div className="text-[8px] text-amber-600 font-semibold">
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

  // Local additions to supplement live state
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

  // Flattened list of all currently filtered milestones for prev/next indexing
  const allFilteredMilestones = useMemo(() => {
    const list: TalentCareerMilestone[] = [];
    filteredEras.forEach((era) => {
      list.push(...era.filteredMilestones);
    });
    return list;
  }, [filteredEras]);

  // Selected Milestone for detail card
  const selectedMilestone = useMemo(() => {
    const fromLocal = localMilestones.find((m) => m.id === selectedMilestoneId);
    if (fromLocal) return fromLocal;

    for (const era of eras) {
      const found = era.milestones.find((m) => m.id === selectedMilestoneId);
      if (found) return found;
    }
    return allFilteredMilestones[0] || eras[0]?.milestones[0];
  }, [eras, localMilestones, selectedMilestoneId, allFilteredMilestones]);

  // Selected milestone index in filtered sequence
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
    // On small screens, smoothly scroll down so user sees the inspector
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const el = document.getElementById('milestone-inspector-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Helper: metadata & stages for Inspector
  const selectedMilestoneStageInfo = useMemo(() => {
    if (!selectedMilestone) {
      return {
        tag: 'U1',
        category: 'Upskilling',
        badgeBg: 'bg-blue-600',
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
    const badgeBg = isMentorship ? 'bg-indigo-600' : isTarget ? 'bg-[#0047CC]' : isUpskilling ? 'bg-blue-600' : 'bg-emerald-600';

    let activeStageIndex = 0;
    if (selectedMilestone.status === 'VERIFIED') activeStageIndex = 2;
    else if (selectedMilestone.status === 'IN_PROGRESS' || selectedMilestone.status === 'DEMONSTRATED') activeStageIndex = 1;
    else activeStageIndex = 0;

    return {
      tag,
      category,
      badgeBg,
      pathTitle: domain || selectedMilestone.title,
      activeStageIndex,
      stages: [
        { name: 'Enrolled', date: selectedMilestone.date },
        { name: 'Checkpoint', date: selectedMilestone.date },
        { name: 'Completed', date: selectedMilestone.date },
      ],
    };
  }, [selectedMilestone]);

  // Compute calculated readiness at this stop
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
      {/* 1. TOP HERO: CANDIDATE PROFILE & TARGET ROLE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0047CC] via-[#003bb5] to-[#0B1739] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/20">
              <ShieldIcon size={13} className="text-blue-200" />
              <span>{stageGateBadge} Verified Candidate Profile</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {candidateName}
            </h2>

            <p className="text-sm text-blue-100/90 leading-relaxed">
              <strong className="text-white">{candidateRole}</strong> (Level {summary.currentLevel}) transitioning toward{' '}
              <strong className="text-white">{targetRole}</strong> (Level {summary.targetLevel}).
              Chronological competencies audited by clinical supervisors and trial boards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#0047CC] text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <PlusIcon size={14} />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CAREER MAP SUMMARY KPI STATS (6-COLUMN GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Readiness */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Overall Readiness
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0047CC] leading-tight">
            {summary.readinessProgressPercent}%
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span>Level {summary.currentLevel} → {summary.targetLevel}</span>
          </div>
        </div>

        {/* Card 2: Total Milestones */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Total Milestones
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {summary.totalMilestones + localMilestones.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircleIcon size={11} />
            <span>{summary.verifiedMilestones} verified</span>
          </div>
        </div>

        {/* Card 3: Relevancy */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Relevancy
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {summary.relevancyCount}
          </div>
          <div className="mt-1 text-[11px] font-medium text-gray-500">
            2 direct · 6 evolving
          </div>
        </div>

        {/* Card 4: Demonstrated */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Demonstrated
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {summary.demonstratedCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <FlashIcon size={11} />
            <span>Evidence confirmed</span>
          </div>
        </div>

        {/* Card 5: In Progress */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            In Progress
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {summary.inProgressCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
            <ClockIcon size={11} />
            <span>Active evaluation</span>
          </div>
        </div>

        {/* Card 6: Pending Review */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:border-blue-200 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Pending Review
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 leading-tight">
            {summary.pendingReviewCount + localMilestones.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            <span>Awaiting audit</span>
          </div>
        </div>
      </div>

      {/* 3. READINESS ROADMAP (COMPETENCY LEVEL CONTINUUM) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Readiness Roadmap</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0047CC] border border-blue-200">
                {summary.readinessProgressPercent}% Overall Score
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Trajectory through L1–L6 competency milestones across candidate career history and target goals.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="inline-flex items-center gap-1 text-[#0047CC] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0047CC]" /> Current (L4)
            </span>
            <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Target (L5)
            </span>
          </div>
        </div>

        {/* Linear Level Track */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-2">
          {readinessLevels.map((lvl) => {
            const isCompleted = lvl.status === 'COMPLETED';
            const isCurrent = lvl.status === 'CURRENT';
            const isTarget = lvl.status === 'TARGET';

            let cardBg = 'bg-gray-50/70 border-gray-200 text-gray-600';
            let barBg = 'bg-gray-300';
            let badgeBg = 'bg-gray-100 text-gray-500';

            if (isCompleted) {
              cardBg = 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950';
              barBg = 'bg-emerald-500';
              badgeBg = 'bg-emerald-100 text-emerald-700 font-bold';
            } else if (isCurrent) {
              cardBg = 'bg-blue-50/80 border-[#0047CC] ring-1 ring-[#0047CC]/20 text-[#1E3A8A]';
              barBg = 'bg-[#0047CC]';
              badgeBg = 'bg-[#0047CC] text-white font-bold';
            } else if (isTarget) {
              cardBg = 'bg-indigo-50/60 border-indigo-300 text-indigo-950';
              barBg = 'bg-indigo-500';
              badgeBg = 'bg-indigo-100 text-indigo-700 font-bold';
            }

            return (
              <div
                key={lvl.level}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${badgeBg}`}>
                      {lvl.level}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {lvl.yearRange}
                    </span>
                  </div>
                  <div className="text-xs font-bold line-clamp-1 leading-snug">
                    {lvl.title}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 mb-1">
                    <span>{isCurrent ? 'Current' : isTarget ? 'Target' : isCompleted ? 'Verified' : 'Next'}</span>
                    <span>{lvl.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                      style={{ width: `${lvl.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CAREER MAP EXPLORER: SEARCH (LEFT) + REUSABLE SELECT DROPDOWNS (RIGHT) + FULL-HEIGHT STICKY INSPECTOR */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Header with Title & Target Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Career Map</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Interactive winding career highway connecting candidate milestones, upskilling moments, and mentorship across eras.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-gray-700 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={targetOnly}
              onChange={(e) => setTargetOnly(e.target.checked)}
              className="rounded text-[#0047CC] focus:ring-blue-500 h-4 w-4"
            />
            <span>Focus Target Role Milestones Only</span>
          </label>
        </div>

        {/* FILTER TOOLBAR: Search Bar on LEFT, Reusable Dropdown Filters on RIGHT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 pt-1 pb-3 border-b border-gray-100 relative z-30">
          {/* SEARCH BAR (LEFT) */}
          <div className="relative flex-1 max-w-sm sm:max-w-md">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search milestones, skills, evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] bg-gray-50/70 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <CloseIcon size={12} />
              </button>
            )}
          </div>

          {/* REUSABLE SELECT DROPDOWNS (RIGHT) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Filter by Milestone Type / Status Dropdown */}
            <div className="w-full sm:w-[195px] relative">
              <Select
                hideLabel={true}
                variant="compact"
                align="right"
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="w-full rounded-xl border-gray-200 bg-white font-bold text-xs py-2 px-3 shadow-2xs hover:border-blue-400 cursor-pointer"
                menuClassName="!left-auto !right-0 !min-w-[220px] !max-w-[280px] shadow-2xl z-50 rounded-2xl"
              />
            </div>

            {/* Filter by Era Dropdown */}
            <div className="w-full sm:w-[210px] relative">
              <Select
                hideLabel={true}
                variant="compact"
                align="right"
                value={selectedEraId}
                options={eraOptions}
                onChange={(e) => setSelectedEraId(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-white font-bold text-xs py-2 px-3 shadow-2xs hover:border-blue-400 cursor-pointer"
                menuClassName="!left-auto !right-0 !min-w-[260px] !max-w-[340px] shadow-2xl z-50 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* VIEW MODE TOGGLE (When All Eras is selected) */}
        {selectedEraId === 'ALL' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">
              <button
                type="button"
                onClick={() => setViewMode('BY_CHAPTER')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'BY_CHAPTER' ? 'bg-white text-[#0047CC] shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Chapters Itinerary
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CONTINUOUS_HIGHWAY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'CONTINUOUS_HIGHWAY' ? 'bg-white text-[#0047CC] shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Full Continuous Highway
              </button>
            </div>

            <div className="text-xs font-semibold text-gray-500">
              Continuous winding highway connecting {allFilteredMilestones.length} milestones
            </div>
          </div>
        )}

        {/* MAIN SPLIT: RESPONSIVE WINDING ROAD (LEFT) + FULLY STICKY DETAILS INSPECTOR (RIGHT) */}
        {/* Notice: items-stretch (default) allows right column to stretch the entire height of the road so sticky tracks all eras! */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* LEFT: THE WINDING ROAD HIGHWAY CANVAS */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 space-y-8">
            {filteredEras.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-xs bg-gray-50/60 rounded-3xl border border-dashed border-gray-200">
                No milestones match the selected filter. Try selecting "All milestones" or clearing your search.
              </div>
            ) : selectedEraId === 'ALL' && viewMode === 'CONTINUOUS_HIGHWAY' ? (
              /* VIEW MODE 1: SINGLE GRAND CONTINUOUS CAREER HIGHWAY ACROSS ALL ERAS */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-xs font-extrabold text-[#0047CC] uppercase tracking-wider">
                      Complete Journey Route
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900">
                      Career Launchpad → Target Goal Highway
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
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
              /* VIEW MODE 2: CHAPTER BY CHAPTER - EACH WITH ITS OWN CONTINUOUS ROAD THAT JOINS ROWS AND FINISHES UP */
              <div className="space-y-8">
                {filteredEras.map((era, eraIndex) => {
                  const chapterNumber = eraIndex + 1;

                  return (
                    <div key={era.id} className="bg-slate-50/50 rounded-3xl border border-gray-100 p-4 sm:p-5 space-y-4">
                      {/* Chapter Title Badge & Year Range */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                            {era.yearRange}
                          </span>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#0B1739] text-white shadow-2xs">
                            <span>CH {chapterNumber} {era.roleTitle.split('(')[0].trim()}</span>
                          </div>
                          {era.isTarget && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Target Goal
                            </span>
                          )}
                          {era.isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Current Standing
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-gray-500">
                          {era.filteredMilestones.length} milestones on path
                        </span>
                      </div>

                      {/* Continuous Winding Highway for this Chapter */}
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

          {/* RIGHT: THE MILESTONE DETAILS INSPECTOR PANEL (MATCHING IMAGE 2) */}
          {/* Note: Stretches full height of left column, sticky tracks down all eras! */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full">
            <div id="milestone-inspector-panel" className="sticky top-6 bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              {selectedMilestone ? (
                <>
                  {/* Top Bar: Category Pill & Moment X of Total & Prev/Next Arrows */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-2xs ${selectedMilestoneStageInfo.badgeBg}`}>
                        {selectedMilestoneStageInfo.category}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        Moment {currentMilestoneIndex + 1} of {allFilteredMilestones.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMilestone}
                        disabled={currentMilestoneIndex === 0}
                        aria-label="Previous milestone moment"
                        className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Previous moment"
                      >
                        <ChevronLeftIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMilestone}
                        disabled={currentMilestoneIndex >= allFilteredMilestones.length - 1}
                        aria-label="Next milestone moment"
                        className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Next moment"
                      >
                        <ChevronRightIcon size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Milestone inspector active.')}
                        aria-label="Close inspector"
                        className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Title, Date & Description */}
                  <div className="space-y-1">
                    <h4 className="text-lg sm:text-xl font-extrabold text-[#0B1739] leading-snug">
                      {selectedMilestone.title}
                    </h4>
                    <div className="text-xs font-semibold text-gray-500">
                      {selectedMilestone.date}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pt-1.5">
                      {selectedMilestone.description}
                    </p>
                  </div>

                  {/* Readiness Progress Meter at this Stop */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-500">Readiness at this stop</span>
                      <span className="font-extrabold text-gray-900">
                        {readinessAtStop.score}{' '}
                        <span className="text-[#0047CC] font-bold">({readinessAtStop.lift})</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-blue-100/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0047CC] transition-all duration-500"
                        style={{ width: `${readinessAtStop.score}%` }}
                      />
                    </div>
                  </div>

                  {/* EVERY STAGE ON THIS PATH SECTION */}
                  <div className="pt-2 space-y-3">
                    <div className="text-[11px] font-extrabold tracking-wider text-gray-400 uppercase">
                      EVERY STAGE ON THIS PATH
                    </div>

                    <div className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-4 space-y-3">
                      {/* Path Card Header */}
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#0B1739] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                            {selectedMilestoneStageInfo.tag}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-gray-900 line-clamp-1">
                              {selectedMilestoneStageInfo.pathTitle}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              {selectedMilestoneStageInfo.category} · stage {selectedMilestoneStageInfo.activeStageIndex + 1} of {selectedMilestoneStageInfo.stages.length}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {selectedMilestone.status === 'VERIFIED' ? 'Completed' : selectedMilestone.statusLabel}
                        </span>
                      </div>

                      {/* Vertical Stages List */}
                      <div className="space-y-1.5 pt-1">
                        {selectedMilestoneStageInfo.stages.map((stg, stgIdx) => {
                          const isCurrent = stgIdx === selectedMilestoneStageInfo.activeStageIndex;

                          return (
                            <div
                              key={stg.name}
                              className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                                isCurrent
                                  ? 'bg-blue-50/90 border border-blue-200/80 shadow-2xs'
                                  : 'text-gray-700'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isCurrent
                                      ? 'border-[#0047CC] bg-[#0047CC]'
                                      : 'border-blue-400 bg-white'
                                  }`}
                                >
                                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                {stgIdx < selectedMilestoneStageInfo.stages.length - 1 && (
                                  <span className="w-0.5 h-6 bg-blue-200 my-0.5" />
                                )}
                              </div>
                              <div>
                                <div className={`text-xs font-bold ${isCurrent ? 'text-[#0047CC]' : 'text-gray-900'}`}>
                                  {stg.name}
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium">
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
                  <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex items-start justify-between py-1 gap-2">
                      <span className="text-gray-500 font-medium">Evidence</span>
                      <span className="font-semibold text-gray-900 text-right line-clamp-2">
                        {selectedMilestone.evidenceSubmitted || 'Clinical audit log & trial record'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-1 gap-2">
                      <span className="text-gray-500 font-medium">Reviewer</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {selectedMilestone.reviewer || 'VORA Lead Clinical Assessment Committee'}
                      </span>
                    </div>
                    {selectedMilestone.scoreLift && (
                      <div className="flex items-start justify-between py-1 gap-2">
                        <span className="text-gray-500 font-medium">Projected Lift</span>
                        <span className="font-bold text-emerald-600">
                          {selectedMilestone.scoreLift}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success('Dossier evidence file opened for inspection.')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileIcon size={14} className="text-[#0047CC]" />
                      <span>View Evidence Document</span>
                    </button>
                    {selectedMilestone.status === 'PENDING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => toast.success('Priority review requested from clinical mentor board.')}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <CheckCircleIcon size={14} />
                        <span>Expedite Verification</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  Select any milestone stop on the road to view its details and stage path.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Quick Inspector Drawer (shown only on screens < lg) */}
        {selectedMilestone && (
          <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shrink-0 ${selectedMilestoneStageInfo.badgeBg}`}>
                {selectedMilestoneStageInfo.tag}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {selectedMilestone.title}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
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
              className="px-3.5 py-1.5 rounded-xl bg-[#0047CC] text-white text-xs font-bold shrink-0 hover:bg-[#003bb5] shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              View Details ↓
            </button>
          </div>
        )}
      </div>

      {/* 5. CAREER PATH MILESTONES LADDER (DEDICATED SECTION BELOW THE CAREER MAP) */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <h4 className="text-base font-extrabold text-gray-900">Career Path Milestones Ladder</h4>
          <p className="text-xs text-gray-500 mt-0.5">
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
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isTarget
                    ? 'bg-amber-50/50 border-amber-200/80'
                    : isCurrent
                    ? 'bg-blue-50/60 border-blue-200/80'
                    : 'bg-emerald-50/40 border-emerald-200/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${
                        isTarget
                          ? 'bg-amber-100 text-amber-800'
                          : isCurrent
                          ? 'bg-blue-100 text-[#0047CC]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isTarget
                          ? 'bg-amber-100 text-amber-800'
                          : isCurrent
                          ? 'bg-blue-100 text-[#0047CC]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                    {item.roleTitle}
                  </div>
                </div>
                <div className="text-[10px] font-semibold text-gray-400 mt-2">
                  {item.era}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. MODAL: ADD MILESTONE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add Career Milestone</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Trial Protocol Design & Quality Governance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Associated Role
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Era / Year
                  </label>
                  <input
                    type="text"
                    value={newEra}
                    onChange={(e) => setNewEra(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Competency Domain
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Evidence Submitted / Documentation Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Uploaded GCP Audit completion log, sponsor signoff, or certification ID"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0047CC]/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-white font-bold shadow-xs transition-colors cursor-pointer"
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
