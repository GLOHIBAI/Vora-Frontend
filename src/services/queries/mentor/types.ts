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

// -------------------------------------------------------------
// Mentor Home Dashboard Types (schemaVersion = 1)
// -------------------------------------------------------------

export interface MentorDashboardGreeting {
  welcomeMessage: string;
  dateLabel: string;
  subtitle: string;
}

export interface MentorHeaderAction {
  label: string;
  hrefHint?: string;
  variant?: 'primary' | 'outline' | 'secondary' | string;
  icon?: string;
}

export interface MentorSessionTag {
  label: string;
  variant?: string;
}

export interface MentorNextSession {
  bookingId?: string;
  id?: string;
  kicker: string;
  menteeName: string;
  menteeAvatarUrl?: string;
  scheduleLabel: string;
  tags?: (MentorSessionTag | string)[];
  meetingLink?: string;
  joinLabel?: string;
  hasBrief?: boolean;
  briefLabel?: string;
  briefHref?: string;
  status?: 'LIVE' | 'CONFIRMED' | 'PENDING' | string;
}

export interface MentorMonthRevenueMetric {
  formattedAmount: string;
  rawAmount?: number;
  comparisonLabel?: string;
  deltaDirection?: 'UP' | 'DOWN' | 'NEUTRAL' | 'up' | 'down' | 'neutral';
  label?: string;
  tiers?: Array<{ label: string; amount?: string; formattedAmount?: string }>;
}

export interface MentorMetricCount {
  count: number | string;
  hint?: string;
  label?: string;
}

export interface MentorDashboardMetrics {
  monthRevenue: MentorMonthRevenueMetric;
  upcomingSessions: MentorMetricCount;
  pendingRequests: MentorMetricCount;
  courseEnrollments: MentorMetricCount;
}

export type MentorSessionStatus = 'LIVE' | 'CONFIRMED' | 'PENDING';

export interface MentorUpcomingSessionItem {
  id?: string;
  sessionId?: string;
  bookingId?: string;
  name?: string;
  menteeName?: string;
  date?: string;
  dateLabel?: string;
  mon?: string;
  day?: string;
  time?: string;
  timeLabel?: string;
  type?: string;
  typeLabel?: string;
  status: MentorSessionStatus | string;
  statusLabel?: string;
  fee?: string;
  formattedFee?: string;
  formattedAmount?: string;
  meetingLink?: string;
  isLive?: boolean;
}

export interface MentorEarningsSeriesItem {
  day: string;
  amount: number;
  label?: string;
}

export interface MentorEarningsSnapshot {
  formattedTotal?: string;
  formattedAmount?: string;
  periodLabel?: string;
  pendingPayoutAmount?: number;
  formattedPendingPayout: string;
  pendingPayoutLabel: string;
  series: MentorEarningsSeriesItem[];
  breakdownHref?: string;
  withdrawHref?: string;
  canWithdraw?: boolean;
}

export interface MentorGapIntelligence {
  headline: string;
  kicker?: string;
  tags?: (string | { label: string })[];
  criticalGapsCount?: number | string;
  analysedCount?: number | string;
  hrefHint?: string;
  createCourseHrefHint?: string;
}

export interface MentorActiveCourseItem {
  id?: string | number;
  courseId?: string | number;
  title: string;
  enrolled?: number | string;
  enrollmentCount?: number | string;
  enrolledLabel?: string;
  status?: string;
  statusLabel?: string;
  rating?: number | string;
  revenue?: string;
  formattedRevenue?: string;
  revenuePeriodLabel?: string;
  gradient?: string;
  hrefHint?: string;
}

export interface MentorActiveCoursesBlock {
  items: MentorActiveCourseItem[];
  draftsLabel?: string | null;
  draftsHrefHint?: string;
}

export interface MentorPendingRequestItem {
  bookingId: string;
  id?: string;
  name?: string;
  menteeName?: string;
  role?: string;
  menteeRole?: string;
  initial?: string;
  avatarColor?: string;
  color?: string;
  tags?: (string | { label: string })[];
  note: string;
  isCritical?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
}

export interface MentorRecentActivityItem {
  id?: string;
  title?: string;
  text?: string;
  relativeTime?: string;
  time?: string;
  icon?: string;
  color?: string;
  type?: string;
}

export interface MentorQuickActionItem {
  id?: string;
  label: string;
  hrefHint: string;
  icon?: string;
  color?: string;
}

export interface MentorDashboardHomeResponse {
  schemaVersion: number;
  timezone?: string;
  unreadNotificationsCount?: number;
  greeting: MentorDashboardGreeting;
  headerActions?: MentorHeaderAction[];
  nextSession: MentorNextSession | null;
  metrics: MentorDashboardMetrics;
  upcomingSessions: MentorUpcomingSessionItem[];
  earnings: MentorEarningsSnapshot;
  gapIntelligence?: MentorGapIntelligence | null;
  activeCourses: MentorActiveCoursesBlock;
  pendingRequests: MentorPendingRequestItem[];
  recentActivity: MentorRecentActivityItem[];
  quickActions: MentorQuickActionItem[];
}
