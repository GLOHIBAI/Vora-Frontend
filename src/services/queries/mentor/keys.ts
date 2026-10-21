export const mentorKeys = {
  all: ['mentor'] as const,
  dashboard: () => [...mentorKeys.all, 'dashboard'] as const,
  mentees: (params?: any) => [...mentorKeys.all, 'mentees', params] as const,
  sessions: (params?: any) => [...mentorKeys.all, 'sessions', params] as const,
  sessionsCalendar: () => [...mentorKeys.all, 'sessions-calendar'] as const,
  settings: () => [...mentorKeys.all, 'settings'] as const,
  settingsProfile: () => [...mentorKeys.settings(), 'profile'] as const,
  settingsAvailability: () => [...mentorKeys.settings(), 'availability'] as const,
  settingsCourses: () => [...mentorKeys.settings(), 'courses'] as const,
  settingsMentorship: () => [...mentorKeys.settings(), 'mentorship'] as const,
  settingsNotifications: () => [...mentorKeys.settings(), 'notifications'] as const,
  settingsAccount: () => [...mentorKeys.settings(), 'account'] as const,
};
