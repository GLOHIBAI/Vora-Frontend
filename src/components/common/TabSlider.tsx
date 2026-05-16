import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface TabSliderProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  renderTabExtra?: (tab: string) => React.ReactNode;
}

const TabSlider: React.FC<TabSliderProps> = ({ tabs, activeTab, onTabChange, renderTabExtra }) => {
  const [showSlider, setShowSlider] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);

  // Drag state for content
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

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
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) setHasMoved(true);
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(isNaN(progress) ? 0 : progress);
    }
  };

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowSlider(scrollWidth > clientWidth + 2);
      const width = (clientWidth / scrollWidth) * 100;
      setThumbWidth(width);
    }
  };

  useEffect(() => {
    updateScrollState();
    const timeout = setTimeout(updateScrollState, 100);
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.removeEventListener('resize', updateScrollState);
      clearTimeout(timeout);
    };
  }, [tabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current || !scrollRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetScroll = clickPos * (scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-0 overflow-x-auto scrollbar-hide select-none ${
          isDragging ? 'cursor-grabbing active:cursor-grabbing' : 'scroll-smooth cursor-grab'
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => !hasMoved && onTabChange(tab)}
            onDragStart={(e) => e.preventDefault()}
            className={`pb-4 px-5 text-[13px] font-medium transition-all relative whitespace-nowrap flex items-center gap-2 pointer-events-auto ${
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

      {/* Visual Slider Bar (The "Yellow Mouse" component) */}
      {showSlider && (
        <div className="flex items-center gap-3 mt-[-8px]">
          <button 
            onClick={() => scroll('left')}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          >
            <ChevronLeftIcon size={14} strokeWidth={3} />
          </button>
          
          <div 
            ref={trackRef}
            onClick={handleTrackClick}
            className="flex-1 h-[3px] bg-gray-100 rounded-full relative cursor-pointer group"
          >
            <div 
              className="absolute top-[-1px] bottom-[-1px] bg-[#0047CC] lg:bg-gray-400 rounded-full transition-all duration-150 ease-out shadow-sm group-hover:bg-[#0047CC]"
              style={{ 
                width: `${thumbWidth}%`, 
                left: `${(scrollProgress * (100 - thumbWidth)) / 100}%` 
              }}
            />
          </div>

          <button 
            onClick={() => scroll('right')}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          >
            <ChevronRightIcon size={14} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TabSlider;
