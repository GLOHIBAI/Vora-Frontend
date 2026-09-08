import { useState } from 'react';
import { Subheading } from '../../common/Typography';
import { HISTORICAL_ALIGNMENT_SESSIONS } from '../../../constants/alignmentReview';
import HistoricalAlignmentCard from './HistoricalAlignmentCard';

const HistoricalAlignmentSection: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    yusuf: false,
    kofi: false,
    adaeze: false,
  });

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="pt-4 border-t border-[#E6E6E6]">
      <Subheading className="text-base mb-1">Historical Alignment Sessions</Subheading>
      <p className="text-xs text-[#808080] mb-4">
        Past decisions, outcomes, refunds, forfeitures, and flags, with full interview detail
      </p>
      {HISTORICAL_ALIGNMENT_SESSIONS.map((session) => (
        <HistoricalAlignmentCard
          key={session.id}
          session={session}
          expanded={Boolean(expanded[session.id])}
          onToggle={() => toggle(session.id)}
        />
      ))}
    </div>
  );
};

export default HistoricalAlignmentSection;
