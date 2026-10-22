import React from 'react';
import ContentCard from '../common/ContentCard';
import type { VaultEditChange } from '../../types/vaultEdit';

interface ReviewChangesCardProps {
  title?: string;
  changes: VaultEditChange[];
  editsUsed: number;
  editsTotal: number;
  footerNote?: React.ReactNode;
}

const ReviewChangesCard: React.FC<ReviewChangesCardProps> = ({
  title = 'Changes under review',
  changes,
  editsUsed,
  editsTotal,
  footerNote,
}) => (
  <ContentCard title={title}>
    {changes.length === 0 ? (
      <p className="text-[13px] text-slate-500 mb-3">No field changes were recorded for this submission.</p>
    ) : (
      <div className="divide-y divide-slate-100 mb-4">
        {changes.map((change) => (
          <div
            key={change.field}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 text-[13px]"
          >
            <span className="text-slate-600 font-medium sm:w-40 shrink-0">{change.field}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-slate-500 font-normal truncate">{change.oldValue || 'None'}</span>
              <span className="text-slate-400 shrink-0 font-medium">→</span>
              <span className="text-slate-900 font-semibold truncate">{change.newValue}</span>
              {change.recalibrate && (
                <span className="shrink-0 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded ml-auto">
                  Matching will recalibrate
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed">
      {footerNote ?? (
        <>
          <strong className="font-semibold text-slate-900">{changes.length} field{changes.length === 1 ? '' : 's'} changed.</strong> Once this
          edit is confirmed, silent matching recalibrates against the new criteria. Pre-qualified
          candidates are re-scored. Salary or position changes trigger an automatic escrow adjustment.
          This edit uses {editsUsed} of your {editsTotal} permitted specification edits.
        </>
      )}
    </div>
  </ContentCard>
);

export default ReviewChangesCard;
