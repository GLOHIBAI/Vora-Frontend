import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import DefaultAvatar from '../../../components/common/DefaultAvatar';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CloseIcon,
} from '../../../components/common/Icons';
import type {
  TalentDashboardData,
  TalentDashboardPendingAction,
  TalentDashboardRole,
  TalentCareerMapData,
  PatchTalentProfilePayload,
} from '../../../services/queries/talent';
import { usePatchTalentProfileMutation } from '../../../services/queries/talent';
import { capitalizeName } from '../../../utils/userName';
import { formatCurrencyString } from '../../../utils/currency';
import { formatMemberSince } from '../../../utils/date';

const EditIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const GRADE_CONTINUUM = [
  { grade: 'F', label: 'Entry' },
  { grade: 'E', label: 'Developing' },
  { grade: 'D', label: 'Foundation' },
  { grade: 'C2', label: 'Emerging' },
  { grade: 'C1', label: 'Capable' },
  { grade: 'B2', label: 'Advanced' },
  { grade: 'B1', label: 'Strong' },
];

interface OverviewTabProps {
  dashboard?: TalentDashboardData;
  careerMap?: TalentCareerMapData;
  isLoading?: boolean;
  onNavigateTab: (tab: 'overview' | 'careermap' | 'ledger' | 'matches' | 'progress' | 'data') => void;
  onOpenUploadModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  dashboard,
  careerMap,
  isLoading,
  onNavigateTab,
}) => {
  const navigate = useNavigate();
  const patchProfileMutation = usePatchTalentProfileMutation();

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editHeadline, setEditHeadline] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editRtwStatus, setEditRtwStatus] = useState<'verified' | 'pending' | 'not_set'>('not_set');
  const [editWorkAuth, setEditWorkAuth] = useState('');
  const [editDocumentUrl, setEditDocumentUrl] = useState('');

  const profile = dashboard?.profile;
  const metrics = dashboard?.metrics;
  const gradeInfo = metrics?.grade;
  const currentGrade = (gradeInfo?.grade || metrics?.interviewGrade?.grade || 'B1').toUpperCase();
  const score = metrics?.careerReadinessScore?.value ?? 0;
  const circumference = 219.9;
  const strokeOffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const currentGradeIndex = GRADE_CONTINUUM.findIndex(
    (item) => item.grade.toUpperCase() === currentGrade
  );

  const fullName = profile?.firstName
    ? `${capitalizeName(profile.firstName)} ${capitalizeName(profile.lastName || '')}`.trim()
    : 'Talent Profile';
  const initials = profile?.initials || (profile?.firstName ? profile.firstName[0].toUpperCase() : 'V');

  // RTW binding from GET /talent/dashboard -> data.profile.rightToWork.profileStatus
  const rtwProfileStatus = profile?.rightToWork?.profileStatus;
  let rtwLabel = 'Right to Work not set';
  let rtwVariant: 'green' | 'yellow' | 'gray' = 'gray';

  if (rtwProfileStatus === 'verified') {
    rtwLabel = 'Right to Work verified';
    rtwVariant = 'green';
  } else if (rtwProfileStatus === 'pending') {
    rtwLabel = 'Right to Work pending';
    rtwVariant = 'yellow';
  } else if (rtwProfileStatus === 'not_set') {
    rtwLabel = 'Right to Work not set';
    rtwVariant = 'gray';
  } else if (profile?.rightToWork?.label) {
    rtwLabel = profile.rightToWork.label;
    rtwVariant = profile?.rightToWork?.status === 'verified' ? 'green' : 'yellow';
  }

  const handleOpenEdit = () => {
    setEditHeadline(profile?.headline || '');
    setEditLocation(profile?.location || '');
    setEditPhone(profile?.phone || '');
    setEditNationality(profile?.nationality || '');
    setEditRtwStatus(profile?.rightToWork?.profileStatus || 'not_set');
    setEditWorkAuth(profile?.rightToWork?.workAuthorisation?.join(', ') || '');
    setEditDocumentUrl(profile?.rightToWork?.documentUrl || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PatchTalentProfilePayload = {};

    if (editHeadline.trim() !== (profile?.headline || '')) {
      payload.headline = editHeadline.trim();
    }
    if (editLocation.trim() !== (profile?.location || '')) {
      payload.location = editLocation.trim();
    }
    if (editPhone.trim() !== (profile?.phone || '')) {
      payload.phone = editPhone.trim();
    }
    if (editNationality.trim() !== (profile?.nationality || '')) {
      payload.nationality = editNationality.trim();
    }

    const currentAuthStr = profile?.rightToWork?.workAuthorisation?.join(', ') || '';
    const currentRtwStatus = profile?.rightToWork?.profileStatus || 'not_set';
    const currentDoc = profile?.rightToWork?.documentUrl || '';

    const authChanged = editWorkAuth.trim() !== currentAuthStr;
    const statusChanged = editRtwStatus !== currentRtwStatus;
    const docChanged = editDocumentUrl.trim() !== currentDoc;

    if (authChanged || statusChanged || docChanged) {
      payload.rightToWork = {
        status: editRtwStatus,
      };
      if (authChanged) {
        payload.rightToWork.workAuthorisation = editWorkAuth
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (docChanged && editDocumentUrl.trim()) {
        payload.rightToWork.documentUrl = editDocumentUrl.trim();
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.error('Provide at least one profile field to update.');
      return;
    }

    try {
      const res = await patchProfileMutation.mutateAsync(payload);
      toast.success(res?.message || 'Profile updated successfully.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile.');
    }
  };

  const pendingActions: TalentDashboardPendingAction[] = dashboard?.pendingActions || [];
  const activitySnapshot = dashboard?.activitySnapshot;
  const matchedRoles: TalentDashboardRole[] = dashboard?.matchedRoles || [];
  const reachRoles: TalentDashboardRole[] = dashboard?.reachRoles || [];

  const handleActionClick = (action: TalentDashboardPendingAction) => {
    if (!action.cta?.enabled) return;
    if (action.cta?.hrefHint) {
      if (action.cta.hrefHint.startsWith('/talent/profile/progress') || action.cta.hrefHint === 'progress') {
        onNavigateTab('progress');
      } else if (action.cta.hrefHint.startsWith('/talent/profile/career-map') || action.cta.hrefHint === 'careermap') {
        onNavigateTab('careermap');
      } else {
        navigate(action.cta.hrefHint);
      }
    } else {
      onNavigateTab('progress');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PROFILE HERO (Single unified dark navy hero across tabs) */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#060E20] via-[#0A1628] to-[#0F1E38] text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Avatar & Meta */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1 min-w-0">
            <DefaultAvatar
              alt={fullName}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-blue-400/40 shrink-0 shadow-sm"
            />

            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-[28px] font-semibold text-white tracking-tight leading-tight">
                    {fullName}
                  </h2>
                  <p className="text-sm text-slate-300 font-normal mt-0.5">
                    {profile?.headline || 'Healthcare Professional · Data & Analytics'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  <EditIcon size={13} className="text-blue-300" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Meta items */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                {profile?.location && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinIcon size={14} className="text-blue-300" />
                      <span>{profile.location}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                  </>
                )}
                {profile?.memberSince && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon size={14} className="text-blue-300" />
                      <span>Member since {formatMemberSince(profile.memberSince)}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                  </>
                )}
                <Tag
                  variant={rtwVariant}
                  label={rtwLabel}
                />
              </div>

              {/* Hero Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-8 pt-2">
                <div>
                  <div className="text-2xl sm:text-3xl font-semibold text-white leading-none">
                    {score}%
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Career Score</div>
                </div>
                <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />
                <div>
                  <div className="text-2xl sm:text-3xl font-semibold text-white leading-none">
                    {metrics?.matchesCount ?? 0}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Matches (80%+)</div>
                </div>
                <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />
                <div>
                  <div className="text-2xl sm:text-3xl font-semibold text-white leading-none">
                    {metrics?.reachRolesCount ?? 0}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Reach Roles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grade Badge & Score Ring (Focal Point) */}
          <div className="flex items-center justify-center sm:justify-end gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div className="text-center">
              <div className="text-xs uppercase font-medium tracking-wider text-slate-400 mb-1.5">Grade</div>
              <div className="w-14 h-14 rounded-xl bg-[#0047CC] border border-blue-400/40 flex items-center justify-center font-semibold text-xl text-white shadow-sm">
                {currentGrade}
              </div>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="35"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="6"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="35"
                  fill="none"
                  stroke="#0047CC"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="219.9"
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-lg text-white leading-none">{score}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ASSESSMENT GRADE CONTINUUM (Current = solid blue, Completed = blue tint, Future = gray) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Assessment Grade Continuum</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Platform progression across validated tiers: F through B1.
            </p>
          </div>
          <Tag variant="blue" label={`Currently: Grade ${currentGrade}`} />
        </div>

        {/* Continuum Nodes: F -> B1 */}
        <div className="grid grid-cols-7 gap-2 pt-1">
          {GRADE_CONTINUUM.map((item, idx) => {
            const isCurrent = idx === currentGradeIndex;
            const isCompleted = currentGradeIndex !== -1 && idx < currentGradeIndex;

            let cardStyle = 'bg-slate-50 text-slate-400 border-slate-200';
            if (isCurrent) {
              cardStyle = 'bg-[#0047CC] text-white border-[#0047CC] shadow-xs';
            } else if (isCompleted) {
              cardStyle = 'bg-blue-50 text-[#0047CC] border-blue-200';
            }

            return (
              <div
                key={item.grade}
                className={`rounded-lg p-2.5 sm:p-3 text-center border transition-all ${cardStyle}`}
              >
                <div className="font-semibold text-sm sm:text-base">{item.grade}</div>
                <div className={`text-xs mt-0.5 truncate font-medium ${isCurrent ? 'text-white/90' : ''}`}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prescription note in info banner */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-sm leading-none shrink-0 text-[#0047CC]">↑</span>
          <span>
            {gradeInfo?.prescription ||
              'To advance your grade: complete a CV revamp, enrol in an elevated course, or combine course + mentorship + revamp.'}
          </span>
        </div>
      </div>

      {/* CAREER MAP & PROGRESSION JOURNEY SPOTLIGHT */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-semibold text-slate-900">Career Map &amp; Progression Journey</h3>
            {careerMap?.summary?.currentLevel && (
              <Tag variant="blue" label={`Level ${careerMap.summary.currentLevel} Verified`} />
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('careermap')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0047CC] hover:text-[#003bb5] hover:underline cursor-pointer self-start sm:self-auto"
          >
            <span>Explore Full Career Map</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        {/* L1 - L6 Continuum Roadmap (Done = blue check, Current = blue ring, Target = blue dashed, Future = gray, Unranked = all locked) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Technical Readiness Level</span>
            <span className="font-semibold text-[#0047CC]">
              {careerMap?.summary?.currentLevel
                ? `${careerMap.summary.currentLevel} ${careerMap.summary.currentLevelTitle || ''}`.trim()
                : 'Unranked (Locked)'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(() => {
              const hasLevel = Boolean(careerMap?.summary?.currentLevel);
              const baseLevels = (careerMap?.readinessLevels && careerMap.readinessLevels.length > 0)
                ? careerMap.readinessLevels
                : [
                    { level: 'L1', title: 'Associate', status: 'LOCKED' as const },
                    { level: 'L2', title: 'Engineer', status: 'LOCKED' as const },
                    { level: 'L3', title: 'Senior', status: 'LOCKED' as const },
                    { level: 'L4', title: 'Staff / Lead', status: 'LOCKED' as const },
                    { level: 'L5', title: 'Principal', status: 'LOCKED' as const },
                    { level: 'L6', title: 'Director', status: 'LOCKED' as const },
                  ];

              const resolvedLevels = !hasLevel
                ? baseLevels.map((lvl) => ({ ...lvl, status: 'LOCKED' as const }))
                : baseLevels;

              return resolvedLevels.map((step) => {
                const isCurrent = step.status === 'CURRENT';
                const isDone = step.status === 'COMPLETED';
                const isTarget = step.status === 'TARGET';

                let stepStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                if (isCurrent) {
                  stepStyle = 'border-2 border-[#0047CC] text-[#0047CC] bg-blue-50/30';
                } else if (isDone) {
                  stepStyle = 'bg-blue-50 border-blue-200 text-[#0047CC]';
                } else if (isTarget) {
                  stepStyle = 'border-2 border-dashed border-[#0047CC] text-[#0047CC] bg-blue-50/20';
                }

                return (
                  <div
                    key={step.level}
                    className={`p-2.5 rounded-lg border text-center transition-all ${stepStyle}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold text-xs">{step.level}</span>
                      {isDone && <CheckCircleIcon size={13} className="text-[#0047CC]" />}
                    </div>
                    <div className="text-xs font-medium truncate mt-0.5">{step.title}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Quick Highlights Grid: Gray labels, Blue key figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Milestones</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.summary?.totalMilestones ?? 0} Total
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {careerMap?.summary?.verifiedMilestones ?? 0} verified
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.summary?.inProgressCount ?? 0} Active
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active milestones
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Career Eras</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.eras?.length ?? 0} Eras
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Roadmap segments</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Review</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.summary?.pendingReviewCount ?? 0} Pending
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Audit verification</p>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: PENDING ACTIONS & ACTIVITY SNAPSHOT (Equal height, clean dividers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* PENDING ACTIONS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Pending Actions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingActions.length > 0
                  ? `${pendingActions.length} items require your attention`
                  : 'All current action items completed'}
              </p>
            </div>
            {pendingActions.length > 0 && (
              <Tag variant="yellow" label={`${pendingActions.length} pending`} />
            )}
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {pendingActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                No pending actions at this time. Your profile is up to date!
              </div>
            ) : (
              pendingActions.map((action, idx) => {
                const isCompleted = action.status === 'passed' || action.status === 'completed';
                const isLocked = action.status === 'locked' || action.status === 'not_started';
                const isEnabled = action.cta?.enabled === true;
                const isView = action.cta?.label?.toLowerCase().includes('view');

                const statusVariant = isCompleted ? 'green' : isLocked ? 'gray' : 'yellow';

                return (
                  <div
                    key={idx}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0047CC] border border-blue-200 font-semibold text-xs flex items-center justify-center shrink-0">
                      {action.stage ? `S${action.stage}` : `S${idx + 1}`}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {action.name || action.label || `Stage ${action.stage || idx + 1}`}
                      </h4>
                      {action.description && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{action.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Tag
                          variant={statusVariant}
                          label={action.statusLabel || action.status || 'Pending'}
                        />
                        {action.durationMins && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            ~{action.durationMins} mins
                          </span>
                        )}
                        {action.expiresAt && (
                          <Tag variant="yellow" label="Expires soon" />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isEnabled}
                      onClick={() => handleActionClick(action)}
                      className={`self-center px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs ${
                        !isEnabled
                          ? 'border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                          : isView
                          ? 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
                          : 'bg-[#0047CC] hover:bg-[#003bb5] text-white cursor-pointer'
                      }`}
                    >
                      {action.cta?.label || (isEnabled ? 'Start' : 'Locked')}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVITY SNAPSHOT */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col h-full space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Activity Snapshot</h3>
            <p className="text-xs text-slate-500 mt-0.5">Platform progress &amp; verification status</p>
          </div>

          {/* 3 mini stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <div className="font-semibold text-2xl text-slate-900">
                {activitySnapshot?.cvRevampsCount ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">CV Revamps</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <div className="font-semibold text-2xl text-slate-900">
                {activitySnapshot?.coursesCount ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Courses</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <div className="font-semibold text-2xl text-slate-900">
                {activitySnapshot?.mentorshipCount ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Mentorship</div>
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-2.5 pt-1 text-xs flex-1">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Hiring Decision Pending</span>
              <Tag
                variant="blue"
                label={`${activitySnapshot?.hiringDecisionPendingCount ?? 0} role(s)`}
              />
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Last Ledger Update</span>
              <span className="font-medium text-slate-700">
                {activitySnapshot?.lastLedgerUpdateAt
                  ? new Date(activitySnapshot.lastLedgerUpdateAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Next Auto-Rematch</span>
              <span className="font-medium text-slate-700">
                {activitySnapshot?.nextAutoRematch === 'on_assessment_complete'
                  ? 'On assessment complete'
                  : activitySnapshot?.nextAutoRematch || 'Automated'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Profile Completeness</span>
              <span className="font-semibold text-slate-900">
                {activitySnapshot?.profileCompletenessPercent ?? 80}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0047CC] h-full rounded-full transition-all duration-500"
                style={{ width: `${activitySnapshot?.profileCompletenessPercent ?? 80}%` }}
              />
            </div>
          </div>

          {/* Next Steps (dynamic) */}
          {activitySnapshot?.nextSteps && activitySnapshot.nextSteps.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Recommended Next Steps:</p>
              <div className="flex flex-wrap gap-2">
                {activitySnapshot.nextSteps.map((step, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      if (step.hrefHint?.startsWith('/talent/profile/progress')) {
                        onNavigateTab('progress');
                      } else if (step.hrefHint) {
                        navigate(step.hrefHint);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YOUR MATCHED ROLES (Compact rows, match % as visual anchor, neutral gray tags) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Your Matched Roles</h3>
            <p className="text-xs text-slate-500 mt-0.5">Roles where your profile scored 80%+ — you qualified for these</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
          >
            View All ({matchedRoles.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {matchedRoles.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              No matched roles found above 80% threshold yet. Progress through your assessment stages or explore Reach Roles!
            </div>
          ) : (
            matchedRoles.map((role, idx) => {
              const orgInitials = role.organisationName
                ? role.organisationName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'RO';
              return (
                <div
                  key={role.rolePostingId || idx}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0047CC] border border-blue-200 font-semibold text-xs flex items-center justify-center shrink-0">
                      {orgInitials}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{role.organisationName}</p>
                      <h4 className="text-base font-semibold text-slate-900">{role.roleTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[role.location, formatCurrencyString(role.compensationSummary)].filter(Boolean).join(' · ')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {role.tags?.map((tag, tIdx) => (
                          <Tag key={tIdx} variant="gray" label={tag} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <div className="text-2xl font-semibold text-[#0047CC]">
                      {role.matchScore ? `${role.matchScore}%` : '80%+'}
                    </div>
                    {role.pipelineStatusLabel && (
                      <Tag variant="blue" label={role.pipelineStatusLabel} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REACH ROLES PREVIEW (Compact rows, blue match score, small bar against 80%, amber gap) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Reach Roles</h3>
            <Tag variant="gray" label={`${reachRoles.length} roles`} />
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {reachRoles.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              No reach roles currently identified.
            </div>
          ) : (
            reachRoles.slice(0, 3).map((reach, rIdx) => {
              const initialsR = reach.organisationName
                ? reach.organisationName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'RR';

              const progressTo80 = Math.min(100, Math.round(((reach.matchScore || 0) / 80) * 100));

              return (
                <div
                  key={reach.rolePostingId || rIdx}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center shrink-0">
                      {initialsR}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{reach.organisationName}</p>
                      <h4 className="text-sm font-semibold text-slate-900">{reach.roleTitle}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <div className="text-base font-semibold text-[#0047CC]">
                        {reach.matchScore}%
                      </div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-[#0047CC] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressTo80}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Target: 80%</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {reach.gap && (
                        <Tag variant="yellow" label={`Gap: ${reach.gap}`} />
                      )}
                      {reach.suggestedAction && (
                        <button
                          type="button"
                          onClick={() => {
                            if (reach.hrefHint) navigate(reach.hrefHint);
                            else onNavigateTab('matches');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                        >
                          {reach.suggestedAction} {reach.projectedLift ? `→ ${reach.projectedLift}` : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL (PATCH /api/v1/talent/profile) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Edit Talent Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your professional headline, location, contact, and right to work status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="e.g. Staff Data Lead"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editNationality}
                    onChange={(e) => setEditNationality(e.target.value)}
                    placeholder="e.g. Nigerian"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +2348000000000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-semibold text-slate-900">Right to Work Authorization</div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Right to Work Status
                  </label>
                  <select
                    value={editRtwStatus}
                    onChange={(e) => setEditRtwStatus(e.target.value as 'verified' | 'pending' | 'not_set')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC] bg-white"
                  >
                    <option value="verified">Verified (Confirmed Right to Work)</option>
                    <option value="pending">Pending (Under Review / Needs Proof)</option>
                    <option value="not_set">Not Set (Unconfirmed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Work Authorisation Countries (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editWorkAuth}
                    onChange={(e) => setEditWorkAuth(e.target.value)}
                    placeholder="e.g. Nigeria, ECOWAS, United Kingdom"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verification Document URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editDocumentUrl}
                    onChange={(e) => setEditDocumentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0047CC]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={patchProfileMutation.isPending}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patchProfileMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {patchProfileMutation.isPending && <Spinner size={12} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
