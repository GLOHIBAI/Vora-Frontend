interface SessionPebbleRailProps {
  /** 0-based index of the active pebble */
  activeIndex: number;
  total?: number;
  /** Pebbles before active that are completed (filled blue) */
  completedBefore?: boolean;
}

const SessionPebbleRail: React.FC<SessionPebbleRailProps> = ({
  activeIndex,
  total = 6,
}) => (
  <div className="bg-gradient-to-b from-white to-[#FBFCFF] border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-center gap-[6px] flex-wrap">
    {Array.from({ length: total }, (_, i) => {
      const isDoneOrActive = i <= activeIndex;
      return (
        <div
          key={i}
          className={`h-[4px] w-[42px] rounded-full transition-all duration-300 ${
            isDoneOrActive ? 'bg-[#0047CC]' : 'bg-[#E6E6E6]'
          }`}
        />
      );
    })}
  </div>
);

export default SessionPebbleRail;
