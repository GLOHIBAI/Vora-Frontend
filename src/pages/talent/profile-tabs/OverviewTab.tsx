import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '../../../components/common/Icons';
import type {
  TalentDashboardData,
  TalentDashboardPendingAction,
  TalentDashboardRole,
  TalentCareerMapData,
} from '../../../services/queries/talent';
import { capitalizeName } from '../../../utils/userName';
import { formatCurrencyString } from '../../../utils/currency';
import { formatMemberSince } from '../../../utils/date';

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

  const rawRtwLabel = profile?.rightToWork?.label?.trim();
  const cleanRtwLabel = rawRtwLabel
    ? rawRtwLabel.replace(/^Right to Work:\s*/i, '')
    : (profile?.rightToWork?.status === 'verified' ? 'Verified' : 'Not set');
  const isRtwVerified =
    profile?.rightToWork?.status === 'verified' ||
    cleanRtwLabel.toLowerCase() === 'verified';

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
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#112650] border-2 border-blue-400/40 flex items-center justify-center text-white font-semibold text-2xl sm:text-3xl shrink-0 shadow-sm">
              {initials}
            </div>

            <div className="space-y-2.5 min-w-0 flex-1">
              <div>
                <h2 className="text-[28px] font-semibold text-white tracking-tight leading-tight">
                  {fullName}
                </h2>
                <p className="text-sm text-slate-300 font-normal mt-0.5">
                  {profile?.headline || 'Healthcare Professional · Data & Analytics'}
                </p>
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
                  variant={isRtwVerified ? 'green' : 'yellow'}
                  label={`Right to Work: ${cleanRtwLabel}`}
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
            <Tag variant="blue" label="Stage 3 Gate 1 Verified" />
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('careermap')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0047CC] hover:text-[#003bb5] hover:underline cursor-pointer self-start sm:self-auto"
          >
            <span>Explore Full 58-Milestone Career Map</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        {/* L1 - L6 Continuum Roadmap (Done = blue check, Current = blue ring, Target = blue dashed, Future = gray) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Technical Readiness Level</span>
            <span className="font-semibold text-[#0047CC]">
              {careerMap?.summary ? `${careerMap.summary.currentLevel} ${careerMap.summary.currentLevelTitle}` : 'L4 Staff / Lead'} · Stage 3 Gate 1
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(careerMap?.readinessLevels || [
              { level: 'L1', title: 'Associate', status: 'COMPLETED' },
              { level: 'L2', title: 'Engineer', status: 'COMPLETED' },
              { level: 'L3', title: 'Senior', status: 'COMPLETED' },
              { level: 'L4', title: 'Staff / Lead', status: 'CURRENT' },
              { level: 'L5', title: 'Principal', status: 'TARGET' },
              { level: 'L6', title: 'Director', status: 'LOCKED' },
            ]).map((step) => {
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
            })}
          </div>
        </div>

        {/* Quick Highlights Grid: Gray labels, Blue key figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Milestones</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.summary?.totalMilestones || 58} Total
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {careerMap?.summary?.verifiedMilestones || 41} verified
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Target Focus</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.pathLadder?.length || careerMap?.summary?.inProgressCount || 9} Milestones
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">L4 → L5 ladder</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Career Eras</p>
            <p className="text-base sm:text-lg font-semibold text-[#0047CC] mt-0.5">
              {careerMap?.eras?.length || 5} Eras
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">2018 — 2026</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next Target</p>
            <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate" title="Multi-Region Active-Active Sharding">
              Sharding &amp; Telemetry
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Q4 2026 Target</p>
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
    </div>
  );
};
