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
  completedBefore = true,
}) => (
  <div className="bg-gradient-to-b from-white to-[#FBFCFF] border-b border-[#E6E6E6] px-[20px] sm:px-[32px] py-[14px] flex items-center justify-center gap-[6px] flex-wrap">
    {Array.from({ length: total }, (_, i) => {
      const isActive = i === activeIndex;
      const isDone = completedBefore && i < activeIndex;
      return (
        <div
          key={i}
          className={`h-[5px] rounded-full transition-all duration-300 ${
            isActive ? 'bg-[#0047CC] w-[64px]' : isDone ? 'bg-[#387DFF] w-[38px]' : 'bg-[#E6E6E6] w-[38px]'
          }`}
        />
      );
    })}
  </div>
);

export default SessionPebbleRail;
