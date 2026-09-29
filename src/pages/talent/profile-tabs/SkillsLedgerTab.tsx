import React from 'react';
import Spinner from '../../../components/common/Spinner';
import type {
  TalentSkillsLedgerData,
  TalentSkillCategory,
  TalentSkillItem,
} from '../../../services/queries/talent';

interface SkillsLedgerTabProps {
  data?: TalentSkillsLedgerData;
  isLoading?: boolean;
}

export const SkillsLedgerTab: React.FC<SkillsLedgerTabProps> = ({ data, isLoading }) => {
  const totals = data?.totals;
  const categories: TalentSkillCategory[] = data?.categories || [];
  const confidence = data?.confidenceBreakdown;
  const howItWorks = data?.howItWorks || [
    'Always live. Complete a course, upload a cert, or finish a mentorship — your ledger updates and all roles are automatically re-evaluated.',
    'Permanent & compound. A skill added months ago may be why you match a role posted today.',
    'Portable. Mentor endorsements and verified credentials follow you across every future role on VORA.',
    'No repeats. Once a skill is in your ledger, you will never be asked to prove it again for the same gap.',
  ];

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  const getWeightStyle = (item: TalentSkillItem) => {
    const weight = item.barWeight ?? (item.status === 'VERIFIED' ? 3 : item.status === 'EVIDENCED' ? 2 : item.status === 'CLAIMED' ? 1 : 0);
    switch (weight) {
      case 3:
        return {
          width: '100%',
          barBg: 'bg-[#0047CC]',
          textClass: 'text-xs font-bold text-[#0047CC]',
          label: item.statusLabel || 'Verified',
        };
      case 2:
        return {
          width: '66%',
          barBg: 'bg-blue-500',
          textClass: 'text-xs font-semibold text-blue-600',
          label: item.statusLabel || 'Evidenced',
        };
      case 1:
        return {
          width: '33%',
          barBg: 'bg-blue-300',
          textClass: 'text-xs font-medium text-gray-500',
          label: item.statusLabel || 'Claimed',
        };
      case 0:
      default:
        return {
          width: '0%',
          barBg: 'bg-rose-500',
          textClass: 'text-xs font-bold text-rose-600',
          label: item.statusLabel || 'Missing',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1E3A8A] leading-relaxed">
        <span className="font-bold text-sm leading-none shrink-0 text-[#0047CC]">+</span>
        <span>
          {data?.banner?.message || (
            <>
              <strong>Your Skills Ledger is live.</strong> Every skill here automatically contributes to your match score across all roles. Skills marked Verified carry the highest weight.
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Capability Profile */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Capability Profile — {totals?.skillsCount ?? 0} Skills
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Source-weighted, permanently cumulative</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-300" /> Claimed ({totals?.claimed ?? 0})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Evidenced ({totals?.evidenced ?? 0})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF6FF] text-[#0047CC]">
                <span className="w-2 h-2 rounded-full bg-[#0047CC]" /> Verified ({totals?.verified ?? 0})
              </span>
            </div>
          </div>

          {/* Dynamic Categories */}
          {categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No skills loaded in ledger yet.
            </div>
          ) : (
            categories.map((cat, cIdx) => (
              <div key={cat.key || cIdx} className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-1 border-b border-gray-100 flex items-center justify-between">
                  <span>{cat.label || cat.key}</span>
                  <span className="text-[10px] text-gray-400">{cat.items?.length ?? 0} items</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {cat.items?.map((item, iIdx) => {
                    const style = getWeightStyle(item);
                    return (
                      <div
                        key={item.skillKey || iIdx}
                        className="py-2.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {item.displayName}
                          </div>
                          <div
                            className={`text-[11px] ${
                              item.isMissing ? 'text-rose-600 font-medium' : 'text-gray-400'
                            }`}
                          >
                            {item.isMissing
                              ? item.missingReason || 'Not yet in ledger — this is your Reach Role gap'
                              : item.sourceLabel || 'Validated credential'}
                          </div>
                        </div>

                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${style.barBg} h-full rounded-full transition-all duration-300`}
                            style={{ width: style.width }}
                          />
                        </div>

                        <div className={`${style.textClass} w-20 text-right`}>{style.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Confidence Breakdown & How It Works */}
        <div className="space-y-6">
          {/* Confidence Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Confidence Breakdown</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-[#0047CC]">Verified</span>
                  <span className="text-gray-700 font-semibold">
                    {confidence?.verified ?? totals?.verified ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0047CC] h-full rounded-full"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.verified ?? totals.verified ?? 0) / totals.skillsCount) * 100))}%`
                        : '50%',
                    }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Carries weight equal to professional certification</div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-blue-600">Evidenced</span>
                  <span className="text-gray-700 font-semibold">
                    {confidence?.evidenced ?? totals?.evidenced ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.evidenced ?? totals.evidenced ?? 0) / totals.skillsCount) * 100))}%`
                        : '35%',
                    }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Demonstrated through course or assessment</div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-gray-600">Claimed</span>
                  <span className="text-gray-700 font-semibold">
                    {confidence?.claimed ?? totals?.claimed ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-200 h-full rounded-full"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.claimed ?? totals.claimed ?? 0) / totals.skillsCount) * 100))}%`
                        : '20%',
                    }}
                  />
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Self-reported from CV — lowest matching weight</div>
              </div>
            </div>

            {confidence?.elevateHint && (
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-start gap-2 text-xs text-[#1E3A8A]">
                <span className="font-bold">!</span>
                <span>{confidence.elevateHint}</span>
              </div>
            )}
          </div>

          {/* How Your Ledger Works */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">How Your Ledger Works</h3>

            <div className="space-y-3.5 text-xs text-gray-700 leading-relaxed">
              {howItWorks.map((bullet, bIdx) => {
                const icons = ['↻', '∞', '✦', '∅'];
                const icon = icons[bIdx % icons.length];
                return (
                  <div key={bIdx} className="flex items-start gap-3">
                    <span className="font-bold text-base text-[#0047CC] leading-none shrink-0 mt-0.5">
                      {icon}
                    </span>
                    <span>{bullet}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
