import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import { CheckIcon, ClockIcon } from '../../../components/common/Icons';
import type { TalentMatchesRolesData } from '../../../services/queries/talent';
import { formatCurrencyString } from '../../../utils/currency';

interface MatchesRolesTabProps {
  data?: TalentMatchesRolesData;
  isLoading?: boolean;
}

export const MatchesRolesTab: React.FC<MatchesRolesTabProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const summary = data?.summary;
  const revampHistory = data?.revampHistory || [];
  const interventionMap = data?.interventionMap || [];
  const reachRoles = data?.reachRoles || [];

  const formatDate = (val?: string | null) => {
    if (!val) return 'Recently';
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
      {/* Top 2 summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#0047CC] font-extrabold text-xl flex items-center justify-center shrink-0">
            {summary?.matchedCount ?? 0}
          </div>
          <div>
            <div className="font-extrabold text-2xl text-gray-900 leading-none">
              {summary?.matchedCount ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Role Matches (80%+)</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xl flex items-center justify-center shrink-0">
            {summary?.reachCount ?? 0}
          </div>
          <div>
            <div className="font-extrabold text-2xl text-gray-900 leading-none">
              {summary?.reachCount ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Reach Roles (65–79%)</div>
          </div>
        </div>
      </div>

      {/* CV REVAMP HISTORY */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="pb-1 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">CV Revamp History</h3>
          <p className="text-xs text-gray-500">
            {revampHistory.length} revamps completed — before &amp; after comparison
          </p>
        </div>

        {revampHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
            No CV revamps recorded yet.
          </div>
        ) : (
          revampHistory.map((revamp, rIdx) => (
            <div key={revamp.revampNumber || rIdx} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  Revamp #{revamp.revampNumber || rIdx + 1}
                </span>
                <span className="text-xs text-gray-500">
                  Completed {formatDate(revamp.completedAt)}
                  {revamp.roleTitle ? ` · For: ${revamp.roleTitle}` : ''}
                  {revamp.organisationName ? ` (${revamp.organisationName})` : ''}
                </span>
                {typeof revamp.matchDeltaPercent === 'number' && revamp.matchDeltaPercent > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{revamp.matchDeltaPercent}% match score
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 rounded-xl border border-gray-200 overflow-hidden text-xs">
                <div className="bg-gray-50/70 p-4 space-y-2 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
                    Before Revamp
                  </div>
                  {revamp.beforeHighlights?.map((item, bIdx) => (
                    <div key={bIdx} className="text-rose-700 line-through">
                      {item}
                    </div>
                  ))}
                  {(!revamp.beforeHighlights || revamp.beforeHighlights.length === 0) && (
                    <div className="text-gray-400 italic">No previous issues noted</div>
                  )}
                </div>
                <div className="bg-blue-50/40 p-4 space-y-2">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-blue-600">
                    After Revamp
                  </div>
                  {revamp.afterHighlights?.map((item, aIdx) => (
                    <div key={aIdx} className="text-emerald-700 font-semibold">
                      {item}
                    </div>
                  ))}
                  {(!revamp.afterHighlights || revamp.afterHighlights.length === 0) && (
                    <div className="text-gray-400 italic">Updated CV parsing applied</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INTERVENTION MAP */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-1 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Intervention → Role Connection Map</h3>
          <p className="text-xs text-gray-500">What you did and what it unlocked</p>
        </div>

        <div className="space-y-3">
          {interventionMap.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No interventions mapped yet. Complete a course or CV revamp to view unlocked roles.
            </div>
          ) : (
            interventionMap.map((item, iIdx) => {
              const isCompleted = item.status === 'completed';
              return (
                <div
                  key={iIdx}
                  className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isCompleted ? <CheckIcon size={14} /> : <ClockIcon size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      {item.completedAt && (
                        <p className="text-xs text-gray-600 mt-0.5">Completed {item.completedAt}</p>
                      )}

                      {/* Unlocked Roles */}
                      {item.unlockedRoles && item.unlockedRoles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {item.unlockedRoles.map((role, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800"
                            >
                              Unlocked: {role.roleTitle} ({role.matchScore}%)
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Projected Unlocks */}
                      {item.projectedUnlocks && item.projectedUnlocks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.projectedUnlocks.map((proj, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800"
                            >
                              Will unlock: {proj.roleTitle} ({proj.matchScore}% → {proj.projectedMatchScore}%)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.cta && (
                    <button
                      type="button"
                      onClick={() => {
                        if (item.cta?.hrefHint) navigate(item.cta.hrefHint);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
                    >
                      {item.cta.label || 'View'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ALL REACH ROLES (65–79%) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-1 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">All Reach Roles (65–79%)</h3>
          <p className="text-xs text-gray-500">You're close. One intervention separates you from matching.</p>
        </div>

        <div className="space-y-3">
          {reachRoles.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No reach roles available in this band.
            </div>
          ) : (
            reachRoles.map((role, rIdx) => {
              const initials = role.organisationName
                ? role.organisationName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'RR';
              return (
                <div
                  key={role.rolePostingId || rIdx}
                  className="border border-gray-200/80 rounded-xl p-4 bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">{role.organisationName}</p>
                        <h4 className="text-sm font-bold text-gray-900">{role.roleTitle}</h4>
                        <p className="text-xs text-gray-400">
                          {[role.location, formatCurrencyString(role.compensationSummary)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-base text-amber-600">
                        {role.matchScore}%
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Need {Math.max(0, 80 - (role.matchScore || 65))}% more
                      </div>
                    </div>
                  </div>

                  {role.gap && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                      <div className="font-bold">Gap: {role.gap}</div>
                      {role.suggestedAction && (
                        <div className="text-amber-800 mt-0.5">
                          {role.suggestedAction}
                          {role.projectedLift ? ` (projected +${role.projectedLift}%)` : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {role.tags && role.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
