import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import { CheckIcon, CloseIcon } from '../../../components/common/Icons';
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
      {/* TRANSPARENCY BANNER (Info blue-50) */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <span className="font-semibold text-base leading-none shrink-0 text-[#0047CC]">i</span>
        <span>
          <strong className="text-slate-900 font-semibold">Transparency is not optional at VORA.</strong> Every change to your ledger, every match shift, every skill contribution — visible here, always.
        </span>
      </div>

      {/* ASSESSMENT JOURNEY BY ROLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Assessment Journey by Role</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression and evaluation status per role.
          </p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
          <span className="font-semibold text-sm leading-none shrink-0 text-[#0047CC]">!</span>
          <span>
            Assessments are real interview-grade evaluations. If you fail one, you cannot proceed to the next stage for that role. VORA will then recommend a course — if completed, you may retake the assessment for eligible roles.
          </span>
        </div>

        {journeys.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
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
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
              >
                {/* Structured Block Header: Differentiates identical role titles */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0047CC] border border-blue-200 font-semibold text-xs flex items-center justify-center shrink-0">
                      {orgInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-medium text-slate-500 tracking-wider">
                          Role Track #{jIdx + 1}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600 font-medium">{journey.organisationName}</span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 leading-snug">
                        {journey.roleTitle}
                      </h4>
                    </div>
                  </div>
                  {journey.overallStatusLabel && (
                    <Tag
                      variant={
                        journey.overallStatus === 'completed' || journey.overallStatus === 'hiring_decision_pending'
                          ? 'green'
                          : journey.overallStatus === 'failed'
                          ? 'red'
                          : journey.overallStatus === 'course_recommended'
                          ? 'yellow'
                          : 'blue'
                      }
                      label={journey.overallStatusLabel}
                    />
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {journey.stages?.map((stage, sIdx) => {
                    const isPassed = stage.status === 'passed' || stage.status === 'completed';
                    const isFailed = stage.status === 'failed';
                    const isLocked = stage.status === 'locked' || stage.status === 'not_started';
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
                            className={`w-7 h-7 rounded-full font-semibold text-xs flex items-center justify-center shrink-0 ${
                              isPassed
                                ? 'bg-blue-50 text-[#0047CC] border border-blue-200'
                                : isFailed
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : isLocked
                                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                : 'bg-blue-50 text-[#0047CC] border border-blue-200'
                            }`}
                          >
                            {isPassed ? (
                              <CheckIcon size={13} className="text-[#0047CC]" />
                            ) : isFailed ? (
                              <CloseIcon size={12} className="text-red-600" />
                            ) : isLocked ? (
                              '—'
                            ) : (
                              '→'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900">
                              {stage.name || `Stage ${stage.stage || sIdx + 1}`}
                            </div>
                            {stage.label && (
                              <p className="text-xs text-slate-500 mt-0.5">{stage.label}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Tag
                                variant={
                                  isPassed
                                    ? 'green'
                                    : isFailed
                                    ? 'red'
                                    : isLocked
                                    ? 'gray'
                                    : 'blue'
                                }
                                label={stage.statusLabel || stage.status}
                              />
                            </div>
                          </div>
                        </div>

                        {stage.cta && (
                          <button
                            type="button"
                            disabled={!isCtaEnabled}
                            onClick={() => handleStageCta(stage)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs ${
                              isCtaEnabled
                                ? 'bg-[#0047CC] hover:bg-[#003bb5] text-white cursor-pointer'
                                : 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
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

      {/* FULL ACTIVITY TIMELINE (Thin neutral line with small dots) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Full Activity Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Your complete career journey on VORA</p>
        </div>

        {timeline.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {timeline.map((item, tIdx) => (
              <div key={tIdx} className="relative pl-4">
                {/* Thin neutral line with uniform blue dot */}
                <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0047CC]" />
                {item.at && <div className="text-xs text-slate-400 font-medium">{item.at}</div>}
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.subtitle}</div>
                )}

                {item.badges && item.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.badges.map((b, bIdx) => (
                      <Tag key={bIdx} variant="gray" label={b} />
                    ))}
                  </div>
                )}

                {item.hrefHint && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => navigate(item.hrefHint!)}
                      className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                    >
                      Action →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CAREER SCORE PROGRESSION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Career Score Progression</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How your match score evolved with each intervention
          </p>
        </div>

        {scoreProgression.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
            Score progression tracking will appear as activities complete.
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {scoreProgression.map((item, sIdx) => {
              const isProjected = item.kind === 'projected';
              return (
                <div key={sIdx}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className={isProjected ? 'text-[#0047CC] font-semibold' : 'text-slate-600 font-medium'}>
                      {item.label || item.at}
                    </span>
                    <span
                      className={`font-semibold ${
                        isProjected ? 'text-[#0047CC]' : 'text-slate-900'
                      }`}
                    >
                      {item.score}%{isProjected ? '+' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    {isProjected ? (
                      <div
                        className="bg-blue-300 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
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
