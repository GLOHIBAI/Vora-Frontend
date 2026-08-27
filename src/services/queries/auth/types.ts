export interface LoginRequest {
  email: string;
  password?: string;
  roleLink?: string;
}

export interface SignupRequest {
  email: string;
  password?: string;
  role?: 'TALENT' | 'EMPLOYER' | 'MENTOR';
  roleLink?: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  acknowledged: boolean;
}

export type ForgotPasswordResponse = ApiResponse<ForgotPasswordResponseData>;

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponseData {
  acknowledged: boolean;
}

export type ResetPasswordResponse = ApiResponse<ResetPasswordResponseData>;

export interface ApplyContext {
  roleLink: string;
  source: string;
}

export type CvParseStatus = 'NONE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ActiveCv {
  cvUploadId: string;
  originalName?: string;
  parseStatus: CvParseStatus;
  parsedData?: any;
}

export interface User {
  id?: string;
  email?: string;
  role?: 'TALENT' | 'EMPLOYER' | 'MENTOR';
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  isOnboardingComplete?: boolean;
  applyContext?: ApplyContext;
  activeCv?: ActiveCv;
  [key: string]: any;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthData {
  accessToken: string;
  user: User;
}

export type AuthResponse = ApiResponse<AuthData>;

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

export type OAuthAuthResponse = ApiResponse<OAuthAuthData>;


export interface GoogleLoginRequest {
  idToken: string;
  roleLink?: string;
}

export interface OAuthSelectRoleRequest {
  role: 'TALENT' | 'EMPLOYER' | 'MENTOR';
}

export interface OAuthVerifyEmailRequest {
  code: string;
}

export interface OAuthStatusResponse {
  isEmailVerified: boolean;
  hasRole: boolean;
  role?: 'TALENT' | 'EMPLOYER' | 'MENTOR';
  email?: string;
}

