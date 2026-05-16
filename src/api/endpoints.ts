export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
  },
  JOBS: {
    BASE: '/jobs',
    BY_ID: (id: string) => `/jobs/${id}`,
    APPLICANTS: (id: string) => `/jobs/${id}/applicants`,
  },
  TALENTS: {
    BASE: '/talents',
    BY_ID: (id: string) => `/talents/${id}`,
    PROFILE: '/talents/profile',
  },
  PAYMENTS: {
    BASE: '/payments',
    HISTORY: '/payments/history',
  }
} as const;
