import React from 'react';
import type { TabType } from '../../types/settings';

const TAB_LABELS: Record<TabType, string> = {
  profile: 'Profile',
  availability: 'Availability & Pricing',
  courses: 'Courses',
  mentorship: 'Mentorship',
  notification: 'Notifications',
  account: 'Account',
};

interface SettingsTabBarProps {
  tabs: TabType[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const SettingsTabBar: React.FC<SettingsTabBarProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border-b-[1.5px] border-[#E6E6E6] mb-9 overflow-x-auto scrollbar-hide">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        className={`px-[18px] py-2.5 text-sm font-semibold border-b-[2.5px] -mb-[1.5px] transition-all whitespace-nowrap cursor-pointer bg-transparent ${
          activeTab === tab
            ? 'text-[#0047CC] border-[#0047CC] font-bold'
            : 'text-[#808080] border-transparent hover:text-[#1A1A1A]'
        }`}
      >
        {TAB_LABELS[tab]}
      </button>
    ))}
  </div>
);

export default SettingsTabBar;
