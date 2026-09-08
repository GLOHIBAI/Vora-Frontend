export const employerKeys = {
  all: ['employer'] as const,
  dashboard: () => [...employerKeys.all, 'dashboard'] as const,
  settings: () => [...employerKeys.all, 'settings'] as const,
  settingsProfile: () => [...employerKeys.settings(), 'profile'] as const,
  settingsNotifications: () => [...employerKeys.settings(), 'notifications'] as const,
  settingsAccount: () => [...employerKeys.settings(), 'account'] as const,
  authSessions: () => ['auth', 'sessions'] as const,

  // Jobs
  jobs: (filter?: string, search?: string, page?: number, limit?: number) =>
    [...employerKeys.all, 'jobs', { filter, search, page, limit }] as const,
  jobDetail: (id: string) =>
    [...employerKeys.all, 'jobs', 'detail', id] as const,
  jobApplicants: (id: string) =>
    [...employerKeys.all, 'jobs', 'applicants', id] as const,
  jobHires: (id: string) =>
    [...employerKeys.all, 'jobs', 'hires', id] as const,
};
