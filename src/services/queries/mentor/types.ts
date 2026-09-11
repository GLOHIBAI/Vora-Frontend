// -------------------------------------------------------------
// Mentor Settings Types (Boot D)
// -------------------------------------------------------------

export type NotificationFrequency = 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_SUMMARY';
export type GeoReach = 'GLOBAL' | 'REGION';

// 1. Profile
export interface MentorProfileSettings {
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  bio?: string;
  photoStorageKey?: string | null;
  photoUrl?: string | null;
  expertise?: string[];
}

export type UpdateMentorProfileDto = Partial<MentorProfileSettings>;

// 2. Availability & Pricing
export interface MentorWeeklySlot {
  dayOfWeek: number; // 0-6 (0=Sun or 1=Mon .. 0=Sun)
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  durationMinutes?: number;
  localRateAmount?: number;
  localRateCurrency?: string;
}

export interface MentorAvailabilitySettings {
  primaryOperatingMarket: string;
  timezone: string;
  bookingBufferMinutes: number;
  bookingNoticeHours: number;
  maxSessionsPerWeek: number;
  weeklySlots: MentorWeeklySlot[];
  blockedDates: string[]; // YYYY-MM-DD
  sessionRates?: Record<string, any>;
}

export type UpdateMentorAvailabilityDto = Partial<MentorAvailabilitySettings>;

// 3. Courses
export interface MentorCourseItem {
  courseId: string | number;
  id?: string | number;
  title?: string;
  status: 'DRAFT' | 'PUBLISHED';
  chapters?: number;
  hours?: number;
  enrolled?: number;
}

export interface MentorCoursesSettings {
  showLifetimeAccess: boolean;
  showPublicEnrollmentCount: boolean;
  reviewsEnabled: boolean;
  certificatesEnabled: boolean;
  courses?: MentorCourseItem[];
}

export type UpdateMentorCoursesDto = Partial<MentorCoursesSettings>;

// 4. Mentorship
export interface MentorMentorshipSettings {
  acceptingBookings: boolean;
  mentorshipTypes: string[];
  careerLevels: string[];
  geoReach: GeoReach;
  maxActiveMentees: number;
  voraMatchingEnabled: boolean;
}

export type UpdateMentorMentorshipDto = Partial<MentorMentorshipSettings>;

// 5. Notifications
export interface MentorNotificationsSettings {
  emailMentorshipRequests: boolean;
  emailBookings: boolean;
  emailCoursePurchases: boolean;
  emailEarningsPayouts: boolean;
  emailPppTierUpdates: boolean;
  emailPlatformAnnouncements: boolean;
  inAppDashboardNotifications: boolean;
  frequency: NotificationFrequency;
}

export type UpdateMentorNotificationsDto = Partial<MentorNotificationsSettings>;

// 6. Account
export interface PendingEmailChange {
  requestedEmail: string;
  requestedAt: string;
}

export interface MentorAccountSettings {
  email: string;
  authProvider?: string;
  canChangePassword?: boolean;
  aiMatchingConsent: boolean;
  pendingEmailChange?: PendingEmailChange | null;
}

export interface UpdateMentorAccountDto {
  aiMatchingConsent?: boolean;
}

export interface EmailChangeRequestDto {
  newEmail: string;
}
