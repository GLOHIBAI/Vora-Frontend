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
  timeOfDay?: string;
  welcomeMessage: string;
  dateLabel: string;
  subtitle?: string;
  firstName?: string;
  lastName?: string;
}

export interface MentorHeaderAction {
  key?: string;
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
  label?: string;
  amount?: number;
  currency?: string;
  formattedAmount: string;
  previousAmount?: number;
  deltaAmount?: number;
  deltaDirection?: 'up' | 'down' | 'flat' | 'neutral' | string;
  comparisonLabel?: string;
  tiers?: Array<{ label: string; amount?: string | number; formattedAmount?: string }>;
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
  day: number | string;
  amount: number;
  label?: string;
}

export interface MentorEarningsSnapshot {
  monthLabel?: string;
  daysIntoMonth?: number;
  periodLabel?: string;
  amount?: number;
  currency?: string;
  formattedTotal?: string;
  formattedAmount?: string;
  pendingPayoutAmount?: number;
  pendingPayoutCurrency?: string;
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
  topSignals?: (string | { label: string })[];
  criticalCount?: number;
  highCount?: number;
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
  draftsWaiting?: number;
  draftsLabel?: string | null;
  manageHref?: string;
  items: MentorActiveCourseItem[];
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
  key?: string;
  label: string;
  hrefHint: string;
  icon?: string;
  color?: string;
}

export interface MentorDashboardLinks {
  notifications?: string;
  upcomingSessions?: string;
  requests?: string;
  activity?: string;
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
  links?: MentorDashboardLinks;
}

// -------------------------------------------------------------
// Mentor Mentees (schemaVersion = 1)
// -------------------------------------------------------------

export interface MentorMenteeSession {
  id: string;
  day?: string;
  month?: string;
  durationMinutes?: number;
  type?: string;
  topic?: string;
  status?: string;
  fee?: number;
  date?: string;
}

export interface MentorMenteeNote {
  id: string;
  date?: string;
  text: string;
  type?: string;
}

export interface MentorMenteeActionCopyLink {
  href: string;
}

export interface MentorMenteeActionItem {
  enabled: boolean;
}

export interface MentorMenteeActions {
  inviteToNextSession?: boolean;
  copyBookingLink?: MentorMenteeActionCopyLink;
  message?: MentorMenteeActionItem;
  viewFullProfile?: MentorMenteeActionItem;
  markOutcome?: MentorMenteeActionItem;
  inviteToDiagnosticInterview?: MentorMenteeActionItem;
}

export interface MentorMenteeCard {
  talentId: string;
  displayName: string;
  initials?: string;
  photoUrl?: string | null;
  professionalTitle?: string | null;
  organisation?: string | null;
  headline?: string | null;
  country?: string;
  tier?: string;
  tierLabel?: string;
  pathway?: string;
  matchingLabel?: string;
  tab?: 'active' | 'past' | 'interview_referred';
  sessionCount?: number;
  totalDurationMinutes?: number;
  sessionsSummaryLabel?: string;
  earnedAmount?: number;
  currency?: string;
  formattedEarned?: string;
  outcome?: string | null;
  outcomeLabel?: string | null;
  priority?: string | null;
  flaggedPipeline?: string | null;
  interventionFocus?: string | null;
  competencyProgress?: Array<{ name: string; score: number }>;
  journeyProgressPercent?: number | null;
  sessions?: MentorMenteeSession[];
  notes?: MentorMenteeNote[];
  actions?: MentorMenteeActions;
}

export interface MentorMenteesSummaryEarningsTier {
  tier: string;
  label: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  sessionsCompleted: number;
}

export interface MentorMenteesSummaryEarnings {
  tiers: MentorMenteesSummaryEarningsTier[];
  totalAmount: number;
  currency: string;
  formattedTotal: string;
  avgPerSession?: number | null;
  formattedAvgPerSession?: string | null;
  platformPayoutRate?: number;
  platformPayoutLabel?: string;
  fullEarningsHref?: string;
}

export interface MentorMenteesSummary {
  activeMentees: number;
  maxActiveMentees: number;
  slotsRemaining: number;
  slotsLabel: string;
  totalSessions: number;
  sessionsThisMonth: number;
  sessionsThisMonthLabel: string;
  menteeCountries: number;
  outcomesTrackedPercent?: number | null;
  outcomesLabel?: string | null;
  earningsThisMonth: MentorMenteesSummaryEarnings;
}

export interface MentorMenteesTabsCount {
  active: number;
  past: number;
  interviewReferred: number;
}

export interface MentorMenteesBookingLink {
  href: string;
  label: string;
}

export interface MentorMenteesResponse {
  schemaVersion: 1;
  tab: 'active' | 'past' | 'interview_referred';
  tabs: MentorMenteesTabsCount;
  summary: MentorMenteesSummary;
  bookingLink?: MentorMenteesBookingLink;
  emptyState?: {
    title?: string;
    description?: string;
    body?: string;
  } | null;
  items: MentorMenteeCard[];
}

export interface SendSessionInviteDto {
  sessionTypeId: string;
  proposedAt: string; // ISO UTC
  sessionFocus?: string;
}

export interface SendSessionInviteResponse {
  bookingId: string;
  talentId: string;
  proposedAt: string;
  durationMinutes: number;
  sessionTypeId: string;
  sessionFocus?: string;
  status: string;
  statusLabel: string;
}

// -------------------------------------------------------------
// Mentor Sessions Hub (schemaVersion = 1)
// -------------------------------------------------------------

export interface MentorSessionActions {
  joinVideo?: boolean;
  dossierNotes?: boolean;
  reschedule?: boolean;
  confirm?: boolean;
  decline?: boolean;
  viewNotes?: boolean;
}

export interface MentorSessionCard {
  bookingId: string;
  talentId: string;
  displayName: string;
  initials?: string;
  photoUrl?: string | null;
  professionalTitle?: string | null;
  organisation?: string | null;
  headline?: string | null;
  country?: string;
  tier?: string;
  tierLabel?: string;
  pathway?: string;
  sessionFormat?: string;
  topic?: string;
  scheduledAt: string;
  endsAt?: string;
  scheduleLabel?: string;
  timeRangeLabel?: string;
  durationMinutes: number;
  status: 'live' | 'confirmed' | 'pending' | 'completed' | 'ended' | 'cancelled';
  statusLabel?: string;
  chargedAmount?: number;
  currency?: string;
  formattedAmount?: string;
  mentorPayout?: number;
  formattedPayout?: string;
  meetingLink?: string | null;
  outcome?: string | null;
  outcomeLabel?: string | null;
  testimonial?: string | null;
  isUrgentReferral?: boolean;
  actions?: MentorSessionActions;
}

export interface MentorSessionsSummary {
  liveBookingActive?: boolean;
  upcomingConfirmedCount: number;
  upcomingThisWeekLabel?: string;
  nextSessionLabel?: string;
  nextSessionStartsInMinutes?: number | null;
  pendingRequestsCount: number;
  pendingLabel?: string;
  coachingImpactHours?: number | null;
  coachingImpactLabel?: string | null;
  avgRating?: number | null;
  avgRatingLabel?: string | null;
}

export interface MentorSessionsTabsCount {
  upcoming: number;
  requests: number;
  past: number;
  availabilitySlotsActive?: number;
}

export interface MentorSessionsFilters {
  sessionFormats: string[];
  regions: string[];
}

export interface MentorAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
}

export interface MentorAvailabilityView {
  slots: MentorAvailabilitySlot[];
  timezone: string;
  bufferLabel?: string;
  editHref?: string;
}

export interface MentorSessionsResponse {
  schemaVersion: 1;
  tab: 'upcoming' | 'requests' | 'past' | 'availability';
  tabs: MentorSessionsTabsCount;
  summary: MentorSessionsSummary;
  liveSession?: MentorSessionCard | null;
  filters: MentorSessionsFilters;
  availability?: MentorAvailabilityView | null;
  emptyState?: {
    title?: string;
    description?: string;
  } | null;
  items: MentorSessionCard[];
}

export interface CalendarProvider {
  id: string;
  name: string;
  status: string;
}

export interface MentorCalendarResponse {
  schemaVersion: 1;
  providers: CalendarProvider[];
  connectedEmail?: string | null;
  connectEnabled?: boolean;
  ical?: {
    href?: string | null;
    label?: string;
  } | null;
  syncNowEnabled?: boolean;
  lastSyncLabel?: string;
}

export interface ScheduleSessionDto {
  talentId: string;
  sessionTypeId: string;
  scheduledAt: string; // ISO-UTC
  sessionFocus?: string;
}

export interface RescheduleSessionDto {
  scheduledAt: string; // ISO-UTC
}

