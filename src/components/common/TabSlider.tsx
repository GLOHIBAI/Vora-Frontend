import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface TabSliderProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  renderTabExtra?: (tab: string) => React.ReactNode;
}

const TabSlider: React.FC<TabSliderProps> = ({ tabs, activeTab, onTabChange, renderTabExtra }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  const updateThumbWidth = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const width = (clientWidth / scrollWidth) * 100;
      setThumbWidth(width);
    }
  };

  useEffect(() => {
    updateThumbWidth();
    window.addEventListener('resize', updateThumbWidth);
    return () => window.removeEventListener('resize', updateThumbWidth);
  }, [tabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-0 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`pb-4 px-5 text-[13px] font-bold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-2 ${
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
      <div className="flex items-center gap-3 mt-4">
        <button 
          onClick={() => scroll('left')}
          className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon size={14} strokeWidth={3} />
        </button>
        
        <div className="flex-1 h-[6px] bg-gray-200 rounded-full relative overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 bg-gray-400 rounded-full transition-all duration-100 ease-out"
            style={{ 
              width: `${thumbWidth}%`, 
              left: `${(scrollProgress * (100 - thumbWidth)) / 100}%` 
            }}
          />
        </div>

        <button 
          onClick={() => scroll('right')}
          className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ChevronRightIcon size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default TabSlider;
