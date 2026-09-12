export interface AuthData {
  email: string;
  password?: string;
  accountType?: string;
}

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  role: 'talent' | 'mentor' | 'employer';
  title?: string;
  email?: string;
  avatarUrl?: string;
  organisationName?: string;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  isOnboardingComplete?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSetupToken: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setSetupToken: (token: string) => void;
  clearSetupToken: () => void;
}

// OAuth role selection types
export type OAuthRole = 'TALENT' | 'EMPLOYER' | 'MENTOR';

export interface VerifyLocationState {
  email?: string;
  accountType?: string;
  oauth?: boolean;
  otpExpiresInMinutes?: number;
  roleSlug?: string;
  flow?: 'signup' | 'oauth' | 'reset-password';
  isResetPassword?: boolean;
  /** UI-only flow: skip auth API calls until backend endpoints are wired. */
  mockAuth?: boolean;
}

export interface SelectTypeLocationState {
  email?: string;
  oauth?: boolean;
  allowedRoles?: OAuthRole[];
}
