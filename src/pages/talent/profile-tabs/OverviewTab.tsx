import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '../../../components/common/Icons';
import type {
  TalentDashboardData,
  TalentDashboardPendingAction,
  TalentDashboardRole,
} from '../../../services/queries/talent';
import { capitalizeName } from '../../../utils/userName';
import { formatCurrencyString } from '../../../utils/currency';

export const GRADE_CONTINUUM = [
  { grade: 'F', label: 'Entry', bg: 'bg-slate-100 text-slate-800 border-slate-700' },
  { grade: 'E', label: 'Developing', bg: 'bg-rose-100 text-rose-800 border-rose-600' },
  { grade: 'D', label: 'Foundation', bg: 'bg-amber-100 text-amber-800 border-amber-600' },
  { grade: 'C2', label: 'Emerging', bg: 'bg-yellow-100 text-yellow-900 border-yellow-600' },
  { grade: 'C1', label: 'Capable', bg: 'bg-blue-100 text-blue-900 border-blue-600' },
  { grade: 'B2', label: 'Advanced', bg: 'bg-indigo-100 text-indigo-900 border-indigo-600' },
  { grade: 'B1', label: 'Strong', bg: 'bg-[#EBF6FF] text-[#0047CC] border-[#0047CC]' },
];

interface OverviewTabProps {
  dashboard?: TalentDashboardData;
  isLoading?: boolean;
  onNavigateTab: (tab: 'overview' | 'ledger' | 'matches' | 'progress' | 'data') => void;
  onOpenUploadModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  dashboard,
  isLoading,
  onNavigateTab,
  onOpenUploadModal,
}) => {
  const navigate = useNavigate();

  const profile = dashboard?.profile;
  const metrics = dashboard?.metrics;
  const gradeInfo = metrics?.grade;
  const currentGrade = (gradeInfo?.grade || metrics?.interviewGrade?.grade || 'B1').toUpperCase();
  const score = metrics?.careerReadinessScore?.value ?? 0;
  const circumference = 219.9;
  const strokeOffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const fullName = profile?.firstName
    ? `${capitalizeName(profile.firstName)} ${capitalizeName(profile.lastName || '')}`.trim()
    : 'Talent Profile';
  const initials = profile?.initials || (profile?.firstName ? profile.firstName[0].toUpperCase() : 'V');

  const pendingActions: TalentDashboardPendingAction[] = dashboard?.pendingActions || [];
  const activitySnapshot = dashboard?.activitySnapshot;
  const matchedRoles: TalentDashboardRole[] = dashboard?.matchedRoles || [];
  const reachRoles: TalentDashboardRole[] = dashboard?.reachRoles || [];

  const handleActionClick = (action: TalentDashboardPendingAction) => {
    if (!action.cta?.enabled) return;
    if (action.cta?.hrefHint) {
      if (action.cta.hrefHint.startsWith('/talent/profile/progress') || action.cta.hrefHint === 'progress') {
        onNavigateTab('progress');
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
      {/* PROFILE HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060E20] via-[#0A1628] to-[#112650] text-white p-6 sm:p-8 md:p-10 border border-[#1E293B] shadow-md">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Avatar & Meta */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#112650] border-2 border-blue-400/40 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shrink-0 shadow-md">
              {initials}
            </div>

            <div className="space-y-3 min-w-0 flex-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{fullName}</h2>
                <p className="text-xs sm:text-sm text-blue-200/80 font-medium mt-1">
                  {profile?.headline || 'Healthcare Professional · Data & Analytics'}
                </p>
              </div>

              {/* Meta items */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs text-white/70">
                {profile?.location && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinIcon size={13} className="text-blue-300" />
                      <span>{profile.location}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                  </>
                )}
                {profile?.memberSince && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon size={13} className="text-blue-300" />
                      <span>Member since {profile.memberSince}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                  </>
                )}
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircleIcon size={13} />
                  <span>Right to Work: {profile?.rightToWork?.label || 'Verified'}</span>
                </span>
              </div>

              {/* Hero Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-8 pt-2">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                    {score}%
                  </div>
                  <div className="text-[11px] text-white/60 font-medium mt-1">Career Score</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                    {metrics?.matchesCount ?? 0}
                  </div>
                  <div className="text-[11px] text-white/60 font-medium mt-1">Matches (80%+)</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                    {metrics?.reachRolesCount ?? 0}
                  </div>
                  <div className="text-[11px] text-white/60 font-medium mt-1">Reach Roles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grade Badge & Score Ring */}
          <div className="flex items-center justify-center sm:justify-end gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1.5">Grade</div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-extrabold text-xl text-blue-200 shadow-inner">
                {currentGrade}
              </div>
            </div>

            <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
              <svg className="w-22 h-22 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="35"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="35"
                  fill="none"
                  stroke="#4A72D1"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="219.9"
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-lg text-white leading-none">{score}</span>
                <span className="text-[9px] text-white/50">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ASSESSMENT GRADE CONTINUUM (B1 to F) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Assessment Grade Continuum</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Platform progression across validated tiers: F through B1.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0047CC] border border-blue-200">
            Currently: Grade {currentGrade}
          </span>
        </div>

        {/* Continuum Nodes: F -> B1 */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 pt-1">
          {GRADE_CONTINUUM.map((item) => {
            const isActive = currentGrade === item.grade;
            return (
              <div
                key={item.grade}
                className={`rounded-xl p-2.5 sm:p-3 text-center border transition-all ${
                  isActive
                    ? `${item.bg} border-2 shadow-sm scale-[1.03]`
                    : 'bg-slate-50 text-slate-600 border-slate-200/60 opacity-40'
                }`}
              >
                <div className="font-extrabold text-sm sm:text-base">{item.grade}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold mt-0.5 truncate">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* Prescription note from API */}
        <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1E3A8A] leading-relaxed">
          <span className="font-bold text-sm leading-none shrink-0 text-[#0047CC]">↑</span>
          <span>
            {gradeInfo?.prescription ||
              'To advance your grade: complete a CV revamp, enrol in an elevated course, or combine course + mentorship + revamp.'}
          </span>
        </div>
      </div>

      {/* 2-COLUMN SECTION: PENDING ACTIONS & ACTIVITY SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PENDING ACTIONS (DYNAMICALLY BOUND FROM API) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Pending Actions</h3>
              <p className="text-xs text-gray-500">
                {pendingActions.length > 0
                  ? `${pendingActions.length} items require your attention`
                  : 'All current action items completed'}
              </p>
            </div>
            {pendingActions.length > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {pendingActions.length} pending
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingActions.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                No pending actions at this time. Your profile is up to date!
              </div>
            ) : (
              pendingActions.map((action, idx) => {
                const isEnabled = action.cta?.enabled === true;
                const badgeLabel = action.label || (action.stage ? `Stage ${action.stage}` : `ACT`);
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3.5 sm:p-4 bg-white transition-colors flex items-start gap-3.5 ${
                      isEnabled ? 'border-gray-200/80 hover:border-blue-300' : 'border-gray-200/60 opacity-80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0047CC] font-extrabold text-xs flex items-center justify-center shrink-0 text-center leading-tight p-1">
                      {action.stage ? `S${action.stage}` : `S${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900">{action.name || badgeLabel}</h4>
                      {action.description && (
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{action.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            action.status === 'passed' || action.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : action.status === 'locked'
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {action.statusLabel || action.status || 'Pending'}
                        </span>
                        {action.durationMins && (
                          <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            ~{action.durationMins} mins
                          </span>
                        )}
                        {action.expiresAt && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            Expires soon
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isEnabled}
                      onClick={() => handleActionClick(action)}
                      className={`self-center px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-2xs ${
                        isEnabled
                          ? 'bg-[#0047CC] hover:bg-[#003bb5] text-white cursor-pointer'
                          : 'border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
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

        {/* ACTIVITY SNAPSHOT (DYNAMICALLY BOUND FROM API) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-1 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Activity Snapshot</h3>
          </div>

          {/* 3 mini stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-gray-200/70">
              <div className="font-extrabold text-2xl text-gray-900">
                {activitySnapshot?.cvRevampsCount ?? 0}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">CV Revamps</div>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-gray-200/70">
              <div className="font-extrabold text-2xl text-gray-900">
                {activitySnapshot?.coursesCount ?? 0}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Courses</div>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-gray-200/70">
              <div className="font-extrabold text-2xl text-gray-900">
                {activitySnapshot?.mentorshipCount ?? 0}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Mentorship</div>
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Hiring Decision Pending</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0047CC] font-semibold border border-blue-100">
                {activitySnapshot?.hiringDecisionPendingCount ?? 0} role(s)
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Last Ledger Update</span>
              <span className="font-semibold text-gray-800">
                {activitySnapshot?.lastLedgerUpdateAt
                  ? new Date(activitySnapshot.lastLedgerUpdateAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Next Auto-Rematch</span>
              <span className="font-semibold text-gray-800">
                {activitySnapshot?.nextAutoRematch === 'on_assessment_complete'
                  ? 'On assessment complete'
                  : activitySnapshot?.nextAutoRematch || 'Automated'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-500">Profile Completeness</span>
              <span className="font-bold text-gray-900">
                {activitySnapshot?.profileCompletenessPercent ?? 80}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0047CC] h-full rounded-full transition-all duration-500"
                style={{ width: `${activitySnapshot?.profileCompletenessPercent ?? 80}%` }}
              />
            </div>
          </div>

          {/* Next Steps (dynamic) */}
          {activitySnapshot?.nextSteps && activitySnapshot.nextSteps.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">Recommended Next Steps:</p>
              <div className="flex flex-wrap gap-2">
                {activitySnapshot.nextSteps.map((step, sIdx) => {
                  const toneClass =
                    step.tone === 'rose'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : step.tone === 'blue'
                      ? 'bg-blue-50 text-[#0047CC] border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200';
                  return (
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${toneClass} ${
                        step.hrefHint ? 'hover:brightness-95 cursor-pointer' : ''
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YOUR MATCHED ROLES (DYNAMICALLY BOUND FROM API) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Your Matched Roles</h3>
            <p className="text-xs text-gray-500">Roles where your profile scored 80%+ — you qualified for these</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
          >
            View All ({matchedRoles.length})
          </button>
        </div>

        <div className="space-y-3">
          {matchedRoles.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
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
                  className="border border-gray-200/80 hover:border-blue-300 rounded-xl p-4 bg-white transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {orgInitials}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">{role.organisationName}</p>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900">{role.roleTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[role.location, formatCurrencyString(role.compensationSummary)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-lg text-[#0047CC]">
                        {role.matchScore ? `${role.matchScore}%` : '80%+'}
                      </div>
                      {role.publishedAt && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{role.publishedAt}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1.5">
                      {role.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {role.pipelineStatusLabel && (
                      <span className="text-[11px] font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 px-2.5 py-0.5 rounded-full">
                        {role.pipelineStatusLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REACH ROLES PREVIEW (DYNAMICALLY BOUND FROM API) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Reach Roles</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {reachRoles.length} roles
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {reachRoles.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
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
              return (
                <div
                  key={reach.rolePostingId || rIdx}
                  className="border border-gray-200/80 rounded-xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initialsR}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">{reach.organisationName}</p>
                      <h4 className="text-sm font-bold text-gray-900">{reach.roleTitle}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-base text-amber-600">
                        {reach.matchScore}%
                      </div>
                      <div className="text-[10px] text-gray-400">Target 80%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reach.gap && (
                        <span className="text-xs text-gray-500 hidden sm:inline">Gap: {reach.gap}</span>
                      )}
                      {reach.suggestedAction && (
                        <button
                          type="button"
                          onClick={() => {
                            if (reach.hrefHint) navigate(reach.hrefHint);
                            else onNavigateTab('matches');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold cursor-pointer"
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
