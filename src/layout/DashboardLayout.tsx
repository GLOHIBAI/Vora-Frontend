import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
} from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';
import { useLogoutMutation } from '../services/queries/auth';
import { useEmployerProfileSettingsQuery, useEmployerOrganisationQuery, useEmployerTeamQuery } from '../services/queries/employer';
import { useTalentOnboardingStateQuery, useMentorOnboardingStateQuery, useGetTalentProfileQuery, useGetMentorProfileQuery, useEmployerOnboardingStateQuery } from '../services/queries/onboarding';
import { useMentorProfileSettingsQuery } from '../services/queries/mentor';

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
import { capitalizeName } from '../utils/userName';

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
      if (stored === null) return false;
      return stored === '1';
    } catch {
      return false;
    }
  });

  const { user, updateUser } = useAuth();
  const logoutMutation = useLogoutMutation();
  
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
  const { data: mentorSettingsProfile } = useMentorProfileSettingsQuery({ enabled: !!user && isMentor });
  const { data: mentorState } = useMentorOnboardingStateQuery(!!user && isMentor);
  const { data: employerState } = useEmployerOnboardingStateQuery(!!user && isEmployer);
  const { data: employerProfile } = useEmployerProfileSettingsQuery({ enabled: !!user && isEmployer });
  const { data: employerOrg } = useEmployerOrganisationQuery({ enabled: !!user && isEmployer });
  const { data: employerTeam } = useEmployerTeamQuery({ enabled: !!user && isEmployer });

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

  const hasSyncedTalentRef = useRef(false);
  const hasSyncedMentorRef = useRef(false);
  const hasSyncedEmployerRef = useRef(false);

  useEffect(() => {
    if (user && isTalent && !hasSyncedTalentRef.current) {
      if (talentProfile?.data) {
        const { firstName, lastName } = talentProfile.data;
        if (firstName) {
          const cleanFn = capitalizeName(firstName);
          const cleanLn = capitalizeName(lastName || '');
          hasSyncedTalentRef.current = true;
          if (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn) {
            updateUser({ firstName: cleanFn, lastName: cleanLn });
            return;
          }
        }
      }
      if (talentState?.data?.fields) {
        const { firstName, lastName } = talentState.data.fields;
        if (firstName) {
          const cleanFn = capitalizeName(firstName);
          const cleanLn = capitalizeName(lastName || '');
          hasSyncedTalentRef.current = true;
          if (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn) {
            updateUser({ firstName: cleanFn, lastName: cleanLn });
          }
        }
      }
    }
  }, [talentProfile, talentState, isTalent, user, updateUser]);

  useEffect(() => {
    if (user && isMentor) {
      if (mentorSettingsProfile && !hasSyncedMentorRef.current) {
        const cleanFn = capitalizeName(mentorSettingsProfile.firstName || '');
        const cleanLn = capitalizeName(mentorSettingsProfile.lastName ?? '');
        const title = mentorSettingsProfile.professionalTitle;
        const photoUrl = mentorSettingsProfile.photoUrl;
        if (
          (cleanFn && (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn)) ||
          (title && user.title !== title) ||
          (photoUrl && user.avatarUrl !== photoUrl)
        ) {
          hasSyncedMentorRef.current = true;
          updateUser({
            ...(cleanFn ? { firstName: cleanFn, lastName: cleanLn } : {}),
            ...(title ? { title } : {}),
            ...(photoUrl ? { avatarUrl: photoUrl } : {}),
          });
          return;
        }
      } else if (mentorProfile?.data && !hasSyncedMentorRef.current) {
        const cleanFn = capitalizeName(mentorProfile.data.firstName || '');
        const cleanLn = capitalizeName(mentorProfile.data.lastName || '');
        const photoUrl = (mentorProfile.data as any).photoUrl || (mentorProfile.data as any).avatarUrl;
        if (
          (cleanFn && (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn)) ||
          (photoUrl && user.avatarUrl !== photoUrl)
        ) {
          hasSyncedMentorRef.current = true;
          updateUser({
            ...(cleanFn ? { firstName: cleanFn, lastName: cleanLn } : {}),
            ...(photoUrl ? { avatarUrl: photoUrl } : {}),
          });
          return;
        }
      }
      const mentorOnboardingFields = normalizeMentorOnboardingState(mentorState?.data)?.fields;
      if (mentorOnboardingFields && !hasSyncedMentorRef.current) {
        const firstName =
          typeof mentorOnboardingFields.firstName === 'string'
            ? mentorOnboardingFields.firstName
            : undefined;
        const lastName =
          typeof mentorOnboardingFields.lastName === 'string'
            ? mentorOnboardingFields.lastName
            : undefined;
        if (firstName) {
          const cleanFn = capitalizeName(firstName);
          const cleanLn = capitalizeName(lastName || '');
          hasSyncedMentorRef.current = true;
          if (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn) {
            updateUser({ firstName: cleanFn, lastName: cleanLn });
          }
        }
      }
    }
  }, [mentorSettingsProfile, mentorProfile, mentorState, isMentor, user, updateUser]);

  useEffect(() => {
    if (user && isEmployer) {
      if (employerProfile && !hasSyncedEmployerRef.current) {
        const cleanFn = capitalizeName(employerProfile.firstName || '');
        const cleanLn = capitalizeName(employerProfile.lastName ?? '');
        const title = employerProfile.professionalTitle;
        const photoUrl = employerProfile.photoUrl;
        if (
          (cleanFn && (user.firstName !== cleanFn || (user.lastName || '') !== cleanLn)) ||
          (title && user.title !== title) ||
          (photoUrl && user.avatarUrl !== photoUrl)
        ) {
          hasSyncedEmployerRef.current = true;
          updateUser({
            ...(cleanFn ? { firstName: cleanFn, lastName: cleanLn } : {}),
            ...(title ? { title } : {}),
            ...(photoUrl ? { avatarUrl: photoUrl } : {}),
          });
        }
      }
      if (employerOrg?.organisationName) {
        if (user.organisationName !== employerOrg.organisationName) {
          updateUser({ organisationName: employerOrg.organisationName });
        }
      }
      if (!user.firstName && !user.lastName && employerState?.data?.fields?.organisationName) {
        const orgName = employerState.data.fields.organisationName;
        if (orgName && user.organisationName !== orgName) {
          updateUser({ firstName: capitalizeName(orgName), lastName: '', organisationName: orgName });
        }
      }
    }
  }, [employerProfile, employerOrg, employerState, isEmployer, user, updateUser]);

  if (!user) return null;

  const currentOrgName = isEmployer
    ? (employerOrg?.organisationName || user.organisationName || employerState?.data?.fields?.organisationName || '')
    : '';

  const firstName = capitalizeName(employerProfile?.firstName || (isMentor ? mentorSettingsProfile?.firstName : null) || user.firstName || '');
  const lastName = capitalizeName(employerProfile?.lastName ?? (isMentor ? mentorSettingsProfile?.lastName : null) ?? user.lastName ?? '');
  const userPersonalName = [firstName, lastName].filter(Boolean).join(' ').trim() 
    || (user.email ? capitalizeName(user.email.split('@')[0]) : 'User');

  // Sidebar bottom widget represents the logged-in user's personal profile
  const displayName = capitalizeName(userPersonalName);

  // Derive user's role/title
  let userRoleInOrg = employerProfile?.professionalTitle || (isMentor ? mentorSettingsProfile?.professionalTitle : null) || user.title || 'Admin';
  if (isEmployer && employerTeam?.members && user.email) {
    const selfMember = employerTeam.members.find(
      (m: any) => m.email?.toLowerCase() === user.email?.toLowerCase()
    );
    if (selfMember?.role) {
      userRoleInOrg = selfMember.role === 'ADMIN' ? 'Admin' : (selfMember.role.charAt(0) + selfMember.role.slice(1).toLowerCase().replace('_', ' '));
    }
  }

  const isTalentMatchFlow = location.pathname.includes('/talent/match');
  let roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  if (isTalentMatchFlow) {
    roleLabel = 'Job Seeker';
  } else if (isEmployer) {
    roleLabel = employerProfile?.professionalTitle || user.title || userRoleInOrg;
  } else if (isMentor) {
    roleLabel = mentorSettingsProfile?.professionalTitle || user.title || 'Mentor';
  }

  const initials = ((firstName || user.email || 'U').charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();

  const avatarUrl = isEmployer
    ? (employerProfile?.photoUrl || user?.avatarUrl || employerOrg?.logoUrl)
    : (isMentor 
        ? (mentorSettingsProfile?.photoUrl || mentorProfile?.data?.photoUrl || (mentorProfile?.data as any)?.avatarUrl || user?.avatarUrl) 
        : user?.avatarUrl);

  const getNavItems = () => {
    if (user.role === 'employer') return EMPLOYER_NAV_ITEMS;
    if (user.role === 'mentor') return MENTOR_NAV_ITEMS;
    return TALENT_NAV_ITEMS;
  };

  const navItems = getNavItems();

  const useFullWidthContent =
    location.pathname.startsWith('/payments') ||
    location.pathname.includes('/jobs/vault/');

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    if (path === '/jobs' && isTalentMatchFlow) return true;
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
          <div className="p-4 mt-auto border-t border-[#E6E6E6] group-data-[nav-collapsed=true]/sidebar:lg:p-3">
            <div className="flex items-center justify-between gap-3 group-data-[nav-collapsed=true]/sidebar:lg:flex-col group-data-[nav-collapsed=true]/sidebar:lg:gap-2">
              <Link
                to="/settings"
                className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity cursor-pointer group-data-[nav-collapsed=true]/sidebar:lg:justify-center group-data-[nav-collapsed=true]/sidebar:lg:gap-0"
                title={isNavCollapsed ? `${displayName} (Settings)` : 'Manage settings'}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 shadow-xs border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0047CC] flex items-center justify-center text-white font-bold text-[13px] shrink-0 uppercase tracking-tight shadow-xs">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0 group-data-[nav-collapsed=true]/sidebar:lg:hidden">
                  <p className="text-[13px] font-bold text-[#1A1A1A] truncate leading-tight" title={displayName}>{displayName}</p>
                  <p className="text-[11px] text-[#808080] font-medium truncate" title={roleLabel}>{roleLabel}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                title="Log out of this device"
                aria-label="Log out"
                className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <LogOutIcon size={18} />
              </button>
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
          <div className={useFullWidthContent ? 'w-full max-w-none' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
