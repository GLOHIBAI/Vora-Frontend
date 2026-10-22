import React from 'react';
import type { VaultEditChange } from '../../types/vaultEdit';

interface ChangeSummaryListProps {
  title?: string;
  changes: VaultEditChange[];
}

const ChangeSummaryList: React.FC<ChangeSummaryListProps> = ({
  title = 'Changes you are submitting',
  changes,
}) => (
  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
    {title && <h3 className="text-[13px] font-semibold text-slate-900 mb-3">{title}</h3>}
    {changes.length === 0 ? (
      <p className="text-[13px] text-slate-500">No changes detected.</p>
    ) : (
      <div className="space-y-2.5">
        {changes.map((change) => (
          <div
            key={change.field}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 border-b border-slate-200/70 last:border-0 text-[13px]"
          >
            <span className="text-slate-600 font-medium sm:w-36 shrink-0">{change.field}</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-slate-500 font-normal truncate">{change.oldValue || 'None'}</span>
              <span className="text-slate-400 shrink-0 font-medium">→</span>
              <span className="text-slate-900 font-semibold truncate">{change.newValue}</span>
              {change.recalibrate && (
                <span className="shrink-0 text-[10px] font-medium text-slate-600 bg-slate-200/80 border border-slate-300/80 px-1.5 py-0.5 rounded ml-auto">
                  Recalibrates
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ChangeSummaryList;
