import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MenuIcon,
  CloseIcon,
} from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';
import { useTalentOnboardingStateQuery, useMentorOnboardingStateQuery, useGetTalentProfileQuery, useGetMentorProfileQuery, useEmployerOnboardingStateQuery } from '../services/queries/onboarding';

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

  const { user, updateUser, login } = useAuth();
  
  const isTalent = user?.role?.toLowerCase() === 'talent';
  const isMentor = user?.role?.toLowerCase() === 'mentor';
  const isEmployer = user?.role?.toLowerCase() === 'employer';


  // Synchronize authenticated profile details in dashboard layout
  const { data: talentProfile } = useGetTalentProfileQuery(!!user && isTalent);
  const { data: talentState } = useTalentOnboardingStateQuery(!!user && isTalent);
  const { data: mentorProfile } = useGetMentorProfileQuery(!!user && isMentor);
  const { data: mentorState } = useMentorOnboardingStateQuery(!!user && isMentor);
  const { data: employerState } = useEmployerOnboardingStateQuery(!!user && isEmployer);

  // DEV BYPASS: Employer onboarding redirect disabled — backend not ready
  // useEffect(() => {
  //   if (user && isEmployer && employerState?.data) {
  //     if (!employerState.data.onboardingCompleted) {
  //       const nextStep = employerState.data.onboardingStep || 1;
  //       navigate(`/onboarding/employer?step=${nextStep}`);
  //     }
  //   }
  // }, [user, isEmployer, employerState, navigate]);

  useEffect(() => {
    if (user && isTalent) {
      if (talentProfile?.data) {
        const { firstName, lastName } = talentProfile.data;
        if (firstName && (user.firstName !== firstName || user.lastName !== lastName)) {
          updateUser({ firstName, lastName });
          return;
        }
      }
      if (talentState?.data?.fields) {
        const { firstName, lastName } = talentState.data.fields;
        if (firstName && (user.firstName !== firstName || user.lastName !== lastName)) {
          updateUser({ firstName, lastName });
        }
      }
    }
  }, [talentProfile, talentState, isTalent, user, updateUser]);

  useEffect(() => {
    if (user && isMentor) {
      if (mentorProfile?.data) {
        const { firstName, lastName } = mentorProfile.data;
        if (firstName && (user.firstName !== firstName || user.lastName !== lastName)) {
          updateUser({ firstName, lastName });
          return;
        }
      }
      if (mentorState?.data?.fields) {
        const { firstName, lastName } = mentorState.data.fields;
        if (firstName && (user.firstName !== firstName || user.lastName !== lastName)) {
          updateUser({ firstName, lastName });
        }
      }
    }
  }, [mentorProfile, mentorState, isMentor, user, updateUser]);

  useEffect(() => {
    if (user && isEmployer && employerState?.data?.fields?.organisationName) {
      const orgName = employerState.data.fields.organisationName;
      if (orgName && user.firstName !== orgName) {
        updateUser({ firstName: orgName, lastName: '' });
      }
    }
  }, [employerState, isEmployer, user, updateUser]);

  // DEV BYPASS: Auto-inject a mock employer session if no user found so dashboard always renders
  if (!user) {
    const mockUser = {
      firstName: 'Mock',
      lastName: 'Employer',
      role: 'employer' as const,
      email: 'mock@vora.com',
    };
    login(mockUser, 'mock-access-token');
    return null; // re-render triggered by login()
  }

  const fullName = user.title 
    ? `${user.title} ${user.firstName || ''} ${user.lastName || ''}`.trim()
    : (user.lastName ? `${user.firstName || ''} ${user.lastName}` : (user.firstName || user.email || 'User'));
  const initials = ((user.firstName || user.email || 'U').charAt(0) + (user.lastName ? user.lastName.charAt(0) : '')).toUpperCase();
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
        fixed inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-[#E6E6E6] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-5 py-6 flex items-center justify-between border-b border-[#E6E6E6]">
            <Link to="/dashboard" className="text-[22px] font-black text-[#0047CC] no-underline tracking-tight cursor-pointer">
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
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-150 cursor-pointer border-l-[3px]
                  ${isActive(item.path) 
                    ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]' 
                    : 'border-transparent text-[#4A4A4A] hover:bg-[#F7F7F7] hover:text-[#1A1A1A]'}
                `}
              >
                <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Bottom Section */}
          <div className="p-5 mt-auto border-t border-[#E6E6E6]">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-[#0047CC] flex items-center justify-center text-white font-bold text-[13px] shrink-0 uppercase tracking-tight">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A1A] truncate">{fullName}</p>
                <p className="text-[11px] text-[#808080] font-medium truncate">{roleLabel === 'Employer' ? 'Admin Manager' : roleLabel}</p>
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
