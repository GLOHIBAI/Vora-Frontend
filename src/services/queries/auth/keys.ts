export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  login: () => [...authKeys.all, 'login'] as const,
  signup: () => [...authKeys.all, 'signup'] as const,
  verifyOTP: () => [...authKeys.all, 'verifyOTP'] as const,
  oauthStatus: () => [...authKeys.all, 'oauthStatus'] as const,
  googleLogin: () => [...authKeys.all, 'googleLogin'] as const,
  oauthSelectRole: () => [...authKeys.all, 'oauthSelectRole'] as const,
  oauthVerify: () => [...authKeys.all, 'oauthVerify'] as const,
  oauthResendOtp: () => [...authKeys.all, 'oauthResendOtp'] as const,
};
