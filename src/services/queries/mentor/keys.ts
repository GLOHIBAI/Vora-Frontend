export const mentorKeys = {
  all: ['mentor'] as const,
  settings: () => [...mentorKeys.all, 'settings'] as const,
  settingsProfile: () => [...mentorKeys.settings(), 'profile'] as const,
  settingsAvailability: () => [...mentorKeys.settings(), 'availability'] as const,
  settingsCourses: () => [...mentorKeys.settings(), 'courses'] as const,
  settingsMentorship: () => [...mentorKeys.settings(), 'mentorship'] as const,
  settingsNotifications: () => [...mentorKeys.settings(), 'notifications'] as const,
  settingsAccount: () => [...mentorKeys.settings(), 'account'] as const,
};
