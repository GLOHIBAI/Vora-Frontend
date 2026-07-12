interface SessionChapterRailProps {
  activeSession: 1 | 2;
  labels?: [string, string];
  leftContent?: React.ReactNode;
}

const SessionChapterRail: React.FC<SessionChapterRailProps> = ({
  activeSession,
  labels = ['How you think', 'Your instincts'],
  leftContent,
}) => (
  <div className="relative bg-white px-[16px] sm:px-[32px] py-[12px] flex items-center justify-center">
    {leftContent && (
      <div className="fixed left-[16px] sm:left-[32px] top-[44px] z-[100]">
        {leftContent}
      </div>
    )}
    <div className="flex items-center justify-center gap-[12px] flex-wrap pl-[120px] sm:pl-0 w-full">
      <div className="flex items-center gap-[7px]">
        <div
          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-[800] text-white ${
            activeSession === 1
              ? 'bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)]'
              : 'bg-[#E6E6E6]'
          }`}
        >
          1
        </div>
        <div
          className={`text-[11.5px] font-[700] ${activeSession === 1 ? 'text-[#0047CC]' : 'text-[#ADADAD]'}`}
        >
          {labels[0]}
        </div>
      </div>
      <div className="w-[36px] h-[2px] bg-[#E6E6E6] rounded-[2px] hidden sm:block" />
      <div className="flex items-center gap-[7px]">
        <div
          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-[800] text-white ${
            activeSession === 2
              ? 'bg-[#0047CC] shadow-[0_0_0_4px_rgba(0,71,204,0.12)]'
              : 'bg-[#E6E6E6]'
          }`}
        >
          2
        </div>
        <div
          className={`text-[11.5px] font-[700] ${activeSession === 2 ? 'text-[#0047CC]' : 'text-[#ADADAD]'}`}
        >
          {labels[1]}
        </div>
      </div>
    </div>
  </div>
);

export default SessionChapterRail;
