import React from 'react';
import ContentCard from '../common/ContentCard';
import AlertBanner from '../common/AlertBanner';
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
      <p className="text-[13px] text-[#808080] mb-3">No field changes were recorded for this submission.</p>
    ) : (
      changes.map((change) => (
        <div
          key={change.field}
          className="flex gap-2.5 items-start py-2 border-b border-[#E6E6E6] last:border-0"
        >
          <span className="text-xs font-bold text-[#808080] min-w-[120px] shrink-0 pt-px">
            {change.field}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#ADADAD] line-through mb-0.5">{change.oldValue}</p>
            <p className="text-[13px] font-bold text-[#1A1A1A]">
              {change.newValue}
              {change.recalibrate && (
                <span className="text-[11px] text-[#D97706] font-bold ml-1">
                  Matching will recalibrate
                </span>
              )}
            </p>
          </div>
        </div>
      ))
    )}
    <AlertBanner variant="amber" showIcon={false} className="mt-2 !px-3.5 !py-2.5 !rounded-lg border">
      <p className="text-xs leading-relaxed">
        {footerNote ?? (
          <>
            <strong>{changes.length} field{changes.length === 1 ? '' : 's'} changed.</strong> Once this
            edit is confirmed, silent matching recalibrates against the new criteria. Pre-qualified
            candidates are re-scored. Salary or position changes trigger an automatic escrow adjustment.
            This edit uses {editsUsed} of your {editsTotal} permitted specification edits.
          </>
        )}
      </p>
    </AlertBanner>
  </ContentCard>
);

export default ReviewChangesCard;
