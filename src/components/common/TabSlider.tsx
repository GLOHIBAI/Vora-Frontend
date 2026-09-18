import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface TabSliderProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  renderTabExtra?: (tab: string) => React.ReactNode;
}

const TabSlider: React.FC<TabSliderProps> = ({ tabs, activeTab, onTabChange, renderTabExtra }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Drag state for mouse dragging
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScrollability();
    const timeout = setTimeout(checkScrollability, 100);
    window.addEventListener('resize', checkScrollability);
    return () => {
      window.removeEventListener('resize', checkScrollability);
      clearTimeout(timeout);
    };
  }, [tabs, checkScrollability]);

  // Keep active tab visible on change
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeBtn) {
        const container = scrollRef.current;
        const btnLeft = activeBtn.offsetLeft;
        const btnRight = btnLeft + activeBtn.offsetWidth;
        if (btnLeft < container.scrollLeft) {
          container.scrollTo({ left: Math.max(0, btnLeft - 24), behavior: 'smooth' });
        } else if (btnRight > container.scrollLeft + container.clientWidth) {
          container.scrollTo({ left: btnRight - container.clientWidth + 24, behavior: 'smooth' });
        }
      }
    }
  }, [activeTab]);

  const handleScroll = () => {
    checkScrollability();
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(scrollRef.current.clientWidth * 0.5, 220);
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 350);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) setHasMoved(true);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Left Arrow Button (beside first tab / 'All jobs') */}
      {hasOverflow && (
        <button
          type="button"
          disabled={!canScrollLeft}
          onClick={() => scroll('left')}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mr-1 mb-2.5 ${
            canScrollLeft
              ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer active:scale-95'
              : 'text-gray-300 opacity-25 cursor-not-allowed pointer-events-none'
          }`}
          aria-label="Scroll tabs left"
        >
          <ChevronLeftIcon size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex-1 flex items-center gap-0 overflow-x-auto scrollbar-hide select-none ${
          isDragging ? 'cursor-grabbing active:cursor-grabbing' : 'scroll-smooth cursor-grab'
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            data-active={activeTab === tab}
            onClick={() => !hasMoved && onTabChange(tab)}
            onDragStart={(e) => e.preventDefault()}
            className={`pb-4 px-5 text-[13px] font-medium transition-all relative whitespace-nowrap flex items-center gap-2 pointer-events-auto shrink-0 ${
              activeTab === tab ? 'text-[#0047CC]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {renderTabExtra && renderTabExtra(tab)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0047CC] rounded-full animate-in fade-in zoom-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Right Arrow Button (at the other end) */}
      {hasOverflow && (
        <button
          type="button"
          disabled={!canScrollRight}
          onClick={() => scroll('right')}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ml-1 mb-2.5 ${
            canScrollRight
              ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer active:scale-95'
              : 'text-gray-300 opacity-25 cursor-not-allowed pointer-events-none'
          }`}
          aria-label="Scroll tabs right"
        >
          <ChevronRightIcon size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default TabSlider;
