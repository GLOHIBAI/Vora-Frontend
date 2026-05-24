import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';
import { useTalentOnboardingStateQuery, useMentorOnboardingStateQuery, useGetTalentProfileQuery, useGetMentorProfileQuery, useEmployerOnboardingStateQuery } from '../services/queries/onboarding';

import { 
  EMPLOYER_NAV_ITEMS,
  MENTOR_NAV_ITEMS,
  TALENT_NAV_ITEMS
} from '../constants/navigation';
import {
  getMentorOnboardingRoute,
  getMentorOnboardingProfileStep,
  isMentorOnboardingComplete,
  isMentorOnboardingPath,
  normalizeMentorOnboardingState,
} from '../utils/mentorOnboarding';
import VoraLogo from '../components/common/VoraLogo';
import { VORA_LOGO_SRC } from '../constants/brand';

const SIDEBAR_STORAGE_KEY = 'vora-sidebar-icons-only';
const SIDEBAR_WIDTH_EXPANDED = '220px';
const SIDEBAR_WIDTH_COLLAPSED = '72px';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored === null) return true;
      return stored === '1';
    } catch {
      return true;
    }
  });

  const { user, updateUser } = useAuth();
  
  const isTalent = user?.role?.toLowerCase() === 'talent';
  const isMentor = user?.role?.toLowerCase() === 'mentor';
  const isEmployer = user?.role?.toLowerCase() === 'employer';

  const navigate = useNavigate();

  useEffect(() => {
    const width = isNavCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
    document.documentElement.style.setProperty('--sidebar-width', width);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, isNavCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isNavCollapsed]);

  // Synchronize authenticated profile details in dashboard layout
  const { data: talentProfile } = useGetTalentProfileQuery(!!user && isTalent);
  const { data: talentState } = useTalentOnboardingStateQuery(!!user && isTalent);
  const { data: mentorProfile } = useGetMentorProfileQuery(!!user && isMentor);
  const { data: mentorState } = useMentorOnboardingStateQuery(!!user && isMentor);
  const { data: employerState } = useEmployerOnboardingStateQuery(!!user && isEmployer);

  useEffect(() => {
    if (user && isEmployer && employerState?.data) {
      if (!employerState.data.onboardingCompleted) {
        const nextStep = employerState.data.onboardingStep || 1;
        navigate(`/onboarding/employer?step=${nextStep}`);
      }
    }
  }, [user, isEmployer, employerState, navigate]);

  useEffect(() => {
    if (!user || !isMentor) return;

    const mentorFields = {
      onboardingStep: getMentorOnboardingProfileStep(
        mentorState?.data,
        (user as { onboardingStep?: number }).onboardingStep,
      ),
      onboardingCompleted: mentorState?.data?.onboardingCompleted,
      isOnboardingComplete: (user as { isOnboardingComplete?: boolean }).isOnboardingComplete,
    };

    const isComplete = isMentorOnboardingComplete(mentorFields);

    const onMentorOnboarding = isMentorOnboardingPath(location.pathname);

    if (isComplete) {
      if (onMentorOnboarding) {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    const target = getMentorOnboardingRoute(mentorFields.onboardingStep ?? 0, mentorFields);

    if (!onMentorOnboarding) {
      navigate(target, { replace: true });
    }
  }, [user, isMentor, mentorState, navigate, location.pathname]);

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
      const mentorOnboardingFields = normalizeMentorOnboardingState(mentorState?.data)?.fields;
      if (mentorOnboardingFields) {
        const firstName =
          typeof mentorOnboardingFields.firstName === 'string'
            ? mentorOnboardingFields.firstName
            : undefined;
        const lastName =
          typeof mentorOnboardingFields.lastName === 'string'
            ? mentorOnboardingFields.lastName
            : undefined;
        if (firstName && (user.firstName !== firstName || user.lastName !== lastName)) {
          updateUser({ firstName, lastName: lastName ?? '' });
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

  if (!user) return null;

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

  const toggleNavCollapsed = () => setIsNavCollapsed((prev) => !prev);

  const sidebarToggleButton = (className = '') => (
    <button
      type="button"
      onClick={toggleNavCollapsed}
      aria-label={isNavCollapsed ? 'Show menu labels' : 'Show icons only'}
      title={isNavCollapsed ? 'Show menu labels' : 'Icons only'}
      className={`
        flex items-center justify-center rounded-lg border border-[#E6E6E6] bg-white
        text-[#4A4A4A] p-2 shrink-0
        hover:bg-[#F7F7F7] hover:border-[#ADADAD] transition-colors cursor-pointer
        ${className}
      `}
    >
      {isNavCollapsed ? (
        <ChevronRightIcon size={18} strokeWidth={2.5} />
      ) : (
        <ChevronLeftIcon size={18} strokeWidth={2.5} />
      )}
    </button>
  );

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
      <aside
        data-nav-collapsed={isNavCollapsed ? 'true' : 'false'}
        className={`
          group/sidebar fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E6E6E6]
          transform transition-all duration-300 ease-in-out
          w-[220px]
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isNavCollapsed ? 'lg:w-[72px]' : 'lg:w-[220px]'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-5 py-6 border-b border-[#E6E6E6] group-data-[nav-collapsed=true]/sidebar:lg:px-3 group-data-[nav-collapsed=true]/sidebar:lg:py-4">
            <div className="flex items-center justify-between gap-2 group-data-[nav-collapsed=true]/sidebar:lg:flex-col group-data-[nav-collapsed=true]/sidebar:lg:items-center group-data-[nav-collapsed=true]/sidebar:lg:gap-3">
              <Link
                to="/dashboard"
                className="hidden group-data-[nav-collapsed=true]/sidebar:lg:flex items-center justify-center"
                title="VORA"
              >
                <img
                  src={VORA_LOGO_SRC}
                  alt="VORA"
                  className="h-[22px] w-auto object-contain"
                />
              </Link>
              <div className="shrink-0 group-data-[nav-collapsed=true]/sidebar:lg:hidden">
                <VoraLogo to="/dashboard" size="md" />
              </div>
              <div className="hidden lg:block">
                {sidebarToggleButton('group-data-[nav-collapsed=true]/sidebar:lg:w-full')}
              </div>
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700 p-1 cursor-pointer shrink-0"
                onClick={() => setIsSidebarOpen(false)}
              >
                <CloseIcon size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                title={isNavCollapsed ? item.name : undefined}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-150 cursor-pointer border-r-[3px]
                  group-data-[nav-collapsed=true]/sidebar:lg:justify-center group-data-[nav-collapsed=true]/sidebar:lg:px-0 group-data-[nav-collapsed=true]/sidebar:lg:gap-0
                  ${isActive(item.path) 
                    ? 'border-r-[#0047CC] bg-[#EBF6FF] text-[#0047CC]' 
                    : 'border-r-transparent text-[#4A4A4A] hover:bg-[#F7F7F7] hover:text-[#1A1A1A]'}
                `}
              >
                <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="group-data-[nav-collapsed=true]/sidebar:lg:hidden">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Bottom Section */}
          <div className="p-5 mt-auto border-t border-[#E6E6E6] group-data-[nav-collapsed=true]/sidebar:lg:p-3">
            <div
              className="flex items-center gap-3 cursor-pointer group group-data-[nav-collapsed=true]/sidebar:lg:justify-center group-data-[nav-collapsed=true]/sidebar:lg:gap-0"
              title={isNavCollapsed ? fullName : undefined}
            >
              <div className="w-9 h-9 rounded-full bg-[#0047CC] flex items-center justify-center text-white font-bold text-[13px] shrink-0 uppercase tracking-tight">
                {initials}
              </div>
              <div className="flex-1 min-w-0 group-data-[nav-collapsed=true]/sidebar:lg:hidden">
                <p className="text-[13px] font-bold text-[#1A1A1A] truncate">{fullName}</p>
                <p className="text-[11px] text-[#808080] font-medium truncate">{roleLabel === 'Employer' ? 'Admin Manager' : roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-[45]">
          <button 
            className="text-gray-900 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <VoraLogo to="/dashboard" size="md" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 lg:px-8 pb-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
