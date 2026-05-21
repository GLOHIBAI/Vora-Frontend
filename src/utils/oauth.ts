import type { User } from '../services/queries/auth/types';
import type { User as ContextUser } from '../types/auth';
import { startTokenRefreshSchedule } from '../services/api/scheduleRefreshToken';
import { routeAfterAuth } from './auth';

export type OAuthNextStep = 'VERIFY_EMAIL' | 'SELECT_ROLE' | 'COMPLETE';

export interface OAuthAuthData {
  accessToken?: string;
  setupToken?: string;
  nextStep?: OAuthNextStep;
  user?: User;
  allowedRoles?: Array<'TALENT' | 'EMPLOYER' | 'MENTOR'>;
  emailSent?: boolean;
  otpExpiresInMinutes?: number;
}

export const SETUP_TOKEN_KEY = 'oauth_setup_token';

export function getSetupToken(): string | null {
  return localStorage.getItem(SETUP_TOKEN_KEY);
}

export function setSetupToken(token: string): void {
  localStorage.setItem(SETUP_TOKEN_KEY, token);
  localStorage.removeItem('auth_token');
}

export function clearSetupToken(): void {
  localStorage.removeItem(SETUP_TOKEN_KEY);
}

export function mapApiUserToContextUser(user?: User): ContextUser {
  const mappedRole = ['talent', 'mentor', 'employer'].includes(user?.role?.toLowerCase() || '')
    ? (user!.role!.toLowerCase() as ContextUser['role'])
    : 'talent';

  let firstName = user?.firstName || '';
  if (!firstName || firstName === 'User') {
    firstName = user?.organisationName || user?.organizationName || user?.employerProfile?.organisationName || user?.employerProfile?.organizationName || '';
  }
  if (!firstName || firstName === 'User') {
    if (user?.email) {
      firstName = user.email.split('@')[0];
    }
  }
  if (!firstName) {
    firstName = mappedRole === 'employer' ? '' : 'User';
  }

  const contextUser: ContextUser = {
    firstName,
    lastName: user?.lastName || '',
    role: mappedRole,
    email: user?.email,
  };

  return {
    ...user,
    ...contextUser,
  } as unknown as ContextUser;
}

export function completeOAuthSession(
  data: OAuthAuthData,
  login: (userData: ContextUser, token?: string) => void,
): boolean {
  if (!data.accessToken) return false;

  clearSetupToken();
  login(mapApiUserToContextUser(data.user), data.accessToken);
  startTokenRefreshSchedule();
  return true;
}

export interface OAuthNavigationResult {
  route: string;
  state?: Record<string, unknown>;
}

const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com'];

/** Consumer domains that skip OAuth OTP on Google sign-in (backend sets nextStep). */
export function isGoogleOtpExemptEmail(email?: string): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && GMAIL_DOMAINS.includes(domain);
}

/**
 * Route after POST /auth/google or POST /auth/oauth/verify.
 * Gmail → SELECT_ROLE (no OTP). Work/custom domain → VERIFY_EMAIL first.
 */
export function resolveOAuthNavigation(
  data: OAuthAuthData,
  login: (userData: ContextUser, token?: string) => void,
  storeSetup: (token: string) => void,
): OAuthNavigationResult {
  if (data.accessToken && data.user) {
    completeOAuthSession(data, login);
    return {
      route: routeAfterAuth(data.user),
      state: { email: data.user.email, accountType: data.user.role },
    };
  }

  if (data.setupToken) {
    storeSetup(data.setupToken);
  }

  switch (data.nextStep) {
    case 'VERIFY_EMAIL':
      // Non-Gmail / work email on Google — OTP required before role selection
      return {
        route: '/verify-email',
        state: {
          email: data.user?.email,
          oauth: true,
          otpExpiresInMinutes: data.otpExpiresInMinutes ?? 10,
        },
      };
    case 'SELECT_ROLE':
      // Gmail (and Yahoo on Google) — auto-verified, pick TALENT or MENTOR only
      return {
        route: '/select-type',
        state: {
          email: data.user?.email,
          oauth: true,
          allowedRoles: data.allowedRoles ?? ['TALENT', 'MENTOR'],
        },
      };
    default:
      return { route: '/login' };
  }
}

export const ROLE_LABELS: Record<'TALENT' | 'EMPLOYER' | 'MENTOR', string> = {
  TALENT: 'Talent',
  EMPLOYER: 'Employer',
  MENTOR: 'Mentor',
};
