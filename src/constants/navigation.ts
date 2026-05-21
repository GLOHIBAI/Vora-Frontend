import { 
  BriefcaseIcon, 
  UsersIcon, 
  GraduationCapIcon, 
  UserCircleIcon,
  GridIcon,
  UserIcon,
  WalletIcon,
  CoursesIcon,
  CalendarIcon,
  GearIcon
} from '../components/common/Icons';

export const EMPLOYER_NAV_ITEMS = [
  { name: 'Dashboard', icon: GridIcon, path: '/dashboard' },
  { name: 'Jobs', icon: BriefcaseIcon, path: '/jobs' },
  { name: 'Talents', icon: UserIcon, path: '/talents' },
  { name: 'Payments', icon: WalletIcon, path: '/payments' },
  { name: 'Settings', icon: GearIcon, path: '/settings' },
];

export const MENTOR_NAV_ITEMS = [
  { name: 'Dashboard', icon: GridIcon, path: '/dashboard' },
  { name: 'Courses', icon: CoursesIcon, path: '/courses' },
  { name: 'Sessions', icon: CalendarIcon, path: '/sessions' },
  { name: 'Finances', icon: WalletIcon, path: '/finances' },
  { name: 'Settings', icon: GearIcon, path: '/settings' },
];

export const TALENT_NAV_ITEMS = [
  { name: 'Dashboard', icon: GridIcon, path: '/dashboard' },
  { name: 'Jobs', icon: BriefcaseIcon, path: '/jobs' },
  { name: 'Mentors', icon: UsersIcon, path: '/mentors' },
  { name: 'Courses', icon: GraduationCapIcon, path: '/courses' },
  { name: 'Profile', icon: UserCircleIcon, path: '/profile' },
  { name: 'Settings', icon: GearIcon, path: '/settings' },
];
