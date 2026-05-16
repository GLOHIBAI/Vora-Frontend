import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MenuIcon,
  CloseIcon,
} from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';

import { 
  EMPLOYER_NAV_ITEMS,
  MENTOR_NAV_ITEMS,
  TALENT_NAV_ITEMS
} from '../constants/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useAuth();
  
  if (!user) return null; // Or a loading state

  const fullName = user.title 
    ? `${user.title} ${user.firstName} ${user.lastName}`.trim()
    : (user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName);
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const getNavItems = () => {
    if (user.role === 'employer') return EMPLOYER_NAV_ITEMS;
    if (user.role === 'mentor') return MENTOR_NAV_ITEMS;
    return TALENT_NAV_ITEMS;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#F9FAFB] border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-8 py-10 flex items-center justify-between">
            <Link to="/dashboard" className="text-[32px] font-medium text-[#0047CC] no-underline tracking-tight cursor-pointer ">
              VORA
            </Link>
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1 cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            >
              <CloseIcon size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-8 py-4 text-[15px] font-medium transition-all duration-200 cursor-pointer relative group
                  ${isActive(item.path) 
                    ? 'bg-[#E8EFFF] text-[#0047CC]' 
                    : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {isActive(item.path) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0047CC]" />
                )}
                <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Bottom Section */}
          <div className="p-8 mt-auto border-t border-gray-200">
            <div className="flex items-center gap-3.5 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-[#0047CC] flex items-center justify-center text-white font-medium text-[13px] shrink-0 uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-900 truncate ">{fullName}</p>
                <p className="text-[12px] text-gray-400 font-medium truncate">{roleLabel === 'Employer' ? 'Admin Manager' : roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Top Header (Fixed at top for mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-[45]">
          <button 
            className="text-gray-900 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          <Link to="/dashboard" className="text-[22px] font-medium text-[#0047CC] tracking-tight  no-underline">
            VORA
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-8 pb-8 pt-6 lg:pt-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
