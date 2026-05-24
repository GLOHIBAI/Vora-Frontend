import React from 'react';
import { Subheading } from '../common/Typography';
import type { VaultEditChange } from '../../types/vaultEdit';

interface ChangeSummaryListProps {
  title?: string;
  changes: VaultEditChange[];
}

const ChangeSummaryList: React.FC<ChangeSummaryListProps> = ({
  title = 'Changes you are submitting',
  changes,
}) => (
  <div className="bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] rounded-[10px] px-4 py-3.5">
    <Subheading as="h3" className="text-[13px] mb-2">{title}</Subheading>
    {changes.length === 0 ? (
      <p className="text-[13px] text-[#808080]">No changes detected.</p>
    ) : (
      changes.map((change) => (
        <div
          key={change.field}
          className="flex gap-2 items-start py-1.5 border-b border-[#E6E6E6] last:border-0 text-[13px]"
        >
          <span className="text-[#808080] min-w-[120px] shrink-0">{change.field}</span>
          <span className="text-[#808080] line-through flex-1">{change.oldValue}</span>
          <span className="text-[#1A1A1A] font-bold flex-1">{change.newValue}</span>
        </div>
      ))
    )}
  </div>
);

export default ChangeSummaryList;
