import React from 'react';
import Spinner from '../../../components/common/Spinner';
import Tag from '../../../components/common/Tag';
import {
  CheckCircleIcon,
  RefreshIcon,
  ShieldIcon,
  ClockIcon,
  CheckIcon,
} from '../../../components/common/Icons';
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

  // Clear 3-level confidence meter
  const renderConfidenceMeter = (item: TalentSkillItem) => {
    const weight =
      item.barWeight ??
      (item.status === 'VERIFIED'
        ? 3
        : item.status === 'EVIDENCED'
        ? 2
        : item.status === 'CLAIMED'
        ? 1
        : 0);

    if (item.isMissing || weight === 0) {
      return (
        <div className="flex items-center gap-1 w-20 justify-center">
          <div className="h-2 w-5 rounded-xs bg-amber-200" />
          <div className="h-2 w-5 rounded-xs bg-slate-100" />
          <div className="h-2 w-5 rounded-xs bg-slate-100" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 w-20 justify-center">
        {/* Level 1: Claimed (light gray-blue) */}
        <div className={`h-2 w-5 rounded-xs ${weight >= 1 ? 'bg-blue-200' : 'bg-slate-100'}`} />
        {/* Level 2: Evidenced (mid blue) */}
        <div className={`h-2 w-5 rounded-xs ${weight >= 2 ? 'bg-blue-400' : 'bg-slate-100'}`} />
        {/* Level 3: Verified (solid blue) */}
        <div className={`h-2 w-5 rounded-xs ${weight >= 3 ? 'bg-[#0047CC]' : 'bg-slate-100'}`} />
      </div>
    );
  };

  const renderStatusBadge = (item: TalentSkillItem) => {
    if (item.isMissing || item.status === 'MISSING') {
      return <Tag variant="yellow" label={item.statusLabel || 'Missing'} />;
    }
    if (item.status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200">
          <CheckIcon size={12} className="text-[#0047CC]" />
          <span>{item.statusLabel || 'Verified'}</span>
        </span>
      );
    }
    if (item.status === 'EVIDENCED') {
      return <Tag variant="blue" label={item.statusLabel || 'Evidenced'} />;
    }
    return <Tag variant="gray" label={item.statusLabel || 'Claimed'} />;
  };

  return (
    <div className="space-y-6">
      {/* BANNER (Standard info banner: blue-50) */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <span className="font-semibold text-base leading-none shrink-0 text-[#0047CC]">+</span>
        <span>
          {data?.banner?.message || (
            <>
              <strong className="text-slate-900 font-semibold">Your Skills Ledger is live.</strong> Every skill here automatically contributes to your match score across all roles. Skills marked Verified carry the highest weight.
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Capability Profile */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Capability Profile — {totals?.skillsCount ?? 0} Skills
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Source-weighted, permanently cumulative</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-200" /> Claimed ({totals?.claimed ?? 0})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Evidenced ({totals?.evidenced ?? 0})
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-[#0047CC]" /> Verified ({totals?.verified ?? 0})
              </span>
            </div>
          </div>

          {/* Dynamic Categories */}
          {categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              No skills loaded in ledger yet.
            </div>
          ) : (
            categories.map((cat, cIdx) => (
              <div key={cat.key || cIdx} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span>{cat.label || cat.key}</span>
                  <span className="text-xs text-slate-400 font-medium">{cat.items?.length ?? 0} items</span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 text-xs font-medium text-slate-500 uppercase tracking-wider py-1 px-2 border-b border-slate-100">
                  <span className="col-span-6 sm:col-span-7">Skill &amp; Source</span>
                  <span className="col-span-3 sm:col-span-3 text-center">Meter</span>
                  <span className="col-span-3 sm:col-span-2 text-right">Status</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {cat.items?.map((item, iIdx) => (
                    <div
                      key={item.skillKey || iIdx}
                      className="py-2.5 px-2 hover:bg-slate-50/70 rounded-lg transition-colors grid grid-cols-12 items-center gap-2"
                    >
                      <div className="col-span-6 sm:col-span-7 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {item.displayName}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            item.isMissing ? 'text-amber-800 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {item.isMissing
                            ? item.missingReason || 'Not yet in ledger — this is your Reach Role gap'
                            : item.sourceLabel || 'Validated credential'}
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-3 flex justify-center">
                        {renderConfidenceMeter(item)}
                      </div>

                      <div className="col-span-3 sm:col-span-2 flex justify-end">
                        {renderStatusBadge(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Confidence Breakdown & How It Works */}
        <div className="space-y-6">
          {/* Confidence Breakdown with consistent 3 blues */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Confidence Breakdown</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-[#0047CC]">Verified</span>
                  <span className="text-slate-700 font-medium">
                    {confidence?.verified ?? totals?.verified ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0047CC] h-full rounded-full transition-all duration-300"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.verified ?? totals.verified ?? 0) / totals.skillsCount) * 100))}%`
                        : '50%',
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">Carries weight equal to professional certification</div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-blue-600">Evidenced</span>
                  <span className="text-slate-700 font-medium">
                    {confidence?.evidenced ?? totals?.evidenced ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.evidenced ?? totals.evidenced ?? 0) / totals.skillsCount) * 100))}%`
                        : '35%',
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">Demonstrated through course or assessment</div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">Claimed</span>
                  <span className="text-slate-700 font-medium">
                    {confidence?.claimed ?? totals?.claimed ?? 0} skills
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-200 h-full rounded-full transition-all duration-300"
                    style={{
                      width: totals?.skillsCount
                        ? `${Math.min(100, Math.round(((confidence?.claimed ?? totals.claimed ?? 0) / totals.skillsCount) * 100))}%`
                        : '20%',
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">Self-reported from CV — lowest matching weight</div>
              </div>
            </div>

            {confidence?.elevateHint && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-xs text-slate-700">
                <span className="font-semibold text-[#0047CC]">!</span>
                <span>{confidence.elevateHint}</span>
              </div>
            )}
          </div>

          {/* How Your Ledger Works (Unified clean icons from Lucide/Icons) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-slate-900">How Your Ledger Works</h3>

            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              {howItWorks.map((bullet, bIdx) => {
                const iconElements = [
                  <RefreshIcon key={0} size={15} className="text-[#0047CC]" />,
                  <ShieldIcon key={1} size={15} className="text-[#0047CC]" />,
                  <CheckCircleIcon key={2} size={15} className="text-[#0047CC]" />,
                  <ClockIcon key={3} size={15} className="text-[#0047CC]" />,
                ];
                const icon = iconElements[bIdx % iconElements.length];

                return (
                  <div key={bIdx} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">
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
