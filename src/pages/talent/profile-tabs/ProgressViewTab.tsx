import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import type {
  TalentProgressData,
  TalentProgressJourney,
  TalentProgressStage,
} from '../../../services/queries/talent';

interface ProgressViewTabProps {
  data?: TalentProgressData;
  isLoading?: boolean;
}

export const ProgressViewTab: React.FC<ProgressViewTabProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const journeys: TalentProgressJourney[] = data?.journeys || [];
  const timeline = data?.timeline || [];
  const scoreProgression = data?.scoreProgression || [];

  const handleStageCta = (stage: TalentProgressStage) => {
    if (!stage.cta?.enabled) return;
    if (stage.cta.hrefHint) {
      navigate(stage.cta.hrefHint);
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
      {/* TRANSPARENCY BANNER */}
      <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1E3A8A] leading-relaxed">
        <span className="font-bold text-sm leading-none shrink-0 text-[#0047CC]">T</span>
        <span>
          <strong>Transparency is not optional at VORA.</strong> Every change to your ledger, every match shift, every skill contribution — visible here, always.
        </span>
      </div>

      {/* ASSESSMENT JOURNEY BY ROLE */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Assessment Journey by Role</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Stage progression and evaluation status per role.
          </p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-2 text-xs text-[#1E3A8A]">
          <span className="font-bold">!</span>
          <span>
            Assessments are real interview-grade evaluations. If you fail one, you cannot proceed to the next stage for that role. VORA will then recommend a course — if completed, you may retake the assessment for eligible roles.
          </span>
        </div>

        {journeys.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
            No assessment journeys active at this time.
          </div>
        ) : (
          journeys.map((journey, jIdx) => {
            const orgInitials = journey.organisationName
              ? journey.organisationName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'AJ';

            return (
              <div
                key={journey.assessmentId || journey.rolePostingId || jIdx}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="bg-[#F8FAFC] border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {orgInitials}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">{journey.roleTitle}</h4>
                      <p className="text-[11px] text-gray-500">{journey.organisationName}</p>
                    </div>
                  </div>
                  {journey.overallStatusLabel && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border ${
                        journey.overallStatus === 'completed' || journey.overallStatus === 'hiring_decision_pending'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : journey.overallStatus === 'failed'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : journey.overallStatus === 'course_recommended'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-[#0047CC] border-blue-200'
                      }`}
                    >
                      {journey.overallStatusLabel}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {journey.stages?.map((stage, sIdx) => {
                    const isPassed = stage.status === 'passed' || stage.status === 'completed';
                    const isFailed = stage.status === 'failed';
                    const isLocked = stage.status === 'locked';
                    const isCtaEnabled = stage.cta?.enabled === true;

                    return (
                      <div
                        key={sIdx}
                        className={`p-4 flex items-start justify-between gap-3.5 ${
                          isCtaEnabled ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-800'
                                : isFailed
                                ? 'bg-rose-100 text-rose-800'
                                : isLocked
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-100 text-[#0047CC]'
                            }`}
                          >
                            {isPassed ? '✓' : isFailed ? '✕' : isLocked ? '—' : '→'}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* CRITICAL: Render stage.name from API */}
                            <div className="text-xs sm:text-sm font-bold text-gray-900">
                              {stage.name || `Stage ${stage.stage || sIdx + 1}`}
                            </div>
                            {stage.label && (
                              <p className="text-xs text-gray-600 mt-0.5">{stage.label}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {stage.statusLabel && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    isPassed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isFailed
                                      ? 'bg-rose-100 text-rose-800'
                                      : isLocked
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-blue-100 text-[#0047CC]'
                                  }`}
                                >
                                  {stage.statusLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {stage.cta && (
                          <button
                            type="button"
                            disabled={!isCtaEnabled}
                            onClick={() => handleStageCta(stage)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-2xs ${
                              isCtaEnabled
                                ? 'bg-[#0047CC] hover:bg-[#003bb5] text-white cursor-pointer'
                                : 'border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {stage.cta.label || (isCtaEnabled ? 'Begin' : 'Locked')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL ACTIVITY TIMELINE */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="pb-1 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Full Activity Timeline</h3>
          <p className="text-xs text-gray-500">Your complete career journey on VORA</p>
        </div>

        {timeline.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
            {timeline.map((item, tIdx) => {
              const isPending = item.type === 'pending' || item.at?.toLowerCase().includes('pending');
              return (
                <div key={tIdx} className="relative pl-4">
                  <div
                    className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full ${
                      isPending
                        ? 'bg-white border-2 border-amber-500'
                        : 'bg-[#0047CC] border-2 border-[#0047CC]'
                    }`}
                  />
                  {item.at && <div className="text-[11px] text-gray-400">{item.at}</div>}
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">{item.subtitle}</div>
                  )}

                  {item.badges && item.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#0047CC]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.hrefHint && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => navigate(item.hrefHint!)}
                        className="px-3 py-1 rounded-lg bg-[#0047CC] hover:bg-[#003bb5] text-white text-xs font-semibold cursor-pointer"
                      >
                        Action →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CAREER SCORE PROGRESSION */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Career Score Progression</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How your match score evolved with each intervention
          </p>
        </div>

        {scoreProgression.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
            Score progression tracking will appear as activities complete.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {scoreProgression.map((item, sIdx) => {
              const isProjected = item.kind === 'projected';
              return (
                <div key={sIdx}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={isProjected ? 'text-[#0047CC] font-semibold' : 'text-gray-500'}>
                      {item.label || item.at}
                    </span>
                    <span
                      className={`font-bold ${
                        isProjected ? 'text-[#0047CC]' : 'text-gray-900'
                      }`}
                    >
                      {item.score}%{isProjected ? '+' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    {isProjected ? (
                      <div
                        className="bg-[#0047CC] h-full rounded-full opacity-70"
                        style={{
                          width: `${item.score}%`,
                          backgroundImage:
                            'repeating-linear-gradient(45deg, #0047CC, #0047CC 6px, #93C5FD 6px, #93C5FD 12px)',
                        }}
                      />
                    ) : (
                      <div
                        className="bg-[#0047CC] h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
