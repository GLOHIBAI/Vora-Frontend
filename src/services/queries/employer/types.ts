export interface EmployerDashboardGreeting {
  date: string;
  welcomeMessage: string;
  unreadAlertsCount: number;
}

export type BannerAlertActionType =
  | 'COMPLETE_CHECK_IN'
  | 'SET_BENCHMARKS'
  | 'VIEW_PIPELINE'
  | 'VIEW_TRUE_UP';

export interface EmployerDashboardBannerAlert {
  hasUrgentAlert: boolean;
  alert?: {
    title?: string;
    message: string;
    actionType?: BannerAlertActionType;
    actionLabel?: string;
    hireId?: string;
    checkInId?: string;
  } | null;
}

export interface MetricCardData {
  value: number | string;
  delta?: string;
  deltaType?: 'up' | 'warn';
}

export interface EmployerDashboardMetrics {
  activeJobs: MetricCardData;
  totalApplicants: MetricCardData;
  alignmentSessions: MetricCardData;
  walletBalance: MetricCardData & { formatted?: string };
}

export type CheckInStatus = 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK' | 'BENCHMARKS_PENDING';
export type CheckInAction = 'COMPLETE_CHECK_IN' | 'SET_BENCHMARKS';

export interface EmployerDashboardCheckInItem {
  id?: string;
  hireId: string;
  checkInId?: string;
  candidateName: string;
  candidateInitials?: string;
  candidateInitialBg?: string;
  roleTitle?: string;
  dueText?: string;
  status: CheckInStatus;
  action?: CheckInAction;
  actionLabel?: string;
  daysLeft?: number;
}

export interface EmployerDashboardWalletEscrow {
  availableBalance: number | string;
  availableBalanceFormatted?: string;
  walletHolderName?: string;
  inEscrow?: number | string;
  inEscrowFormatted?: string;
  alignmentFeesPending?: number | string;
  alignmentFeesPendingFormatted?: string;
  trueUpOwed?: number | string;
  trueUpOwedFormatted?: string;
  totalCommitted?: number | string;
  totalCommittedFormatted?: string;
}

export type JobDisplayStatus =
  | 'Live'
  | 'Alignment'
  | 'Vault'
  | 'Draft'
  | 'Closed'
  | 'Under Review';

export interface EmployerDashboardJobItem {
  id: string;
  title: string;
  location?: string;
  postedDate?: string;
  applicantsCount?: number;
  applicants?: number;
  status?: string;
  displayStatus?: JobDisplayStatus;
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

export type AlignmentSessionStatus = 'SCHEDULED' | 'AWAITING_CONFIRMATION' | 'COMPLETED';

export interface EmployerDashboardAlignmentItem {
  id: string;
  candidateName?: string;
  name?: string;
  roleTitle?: string;
  role?: string;
  status?: AlignmentSessionStatus;
  statusLabel?: string;
  initial?: string;
  initialBg?: string;
  variant?: 'blue' | 'gray' | 'green' | 'yellow';
}

export type ActivityIconType =
  | 'warning'
  | 'success'
  | 'calendar'
  | 'briefcase'
  | 'wallet'
  | 'info';

export interface EmployerDashboardActivityItem {
  id?: string;
  title: string;
  subtitle?: string;
  sub?: string;
  timestamp?: string;
  time?: string;
  iconType?: ActivityIconType;
  iconBg?: string;
  iconColor?: string;
}

export interface EmployerDashboardData {
  greeting?: EmployerDashboardGreeting;
  bannerAlert?: EmployerDashboardBannerAlert;
  metrics?: EmployerDashboardMetrics;
  checkIns?: {
    items?: EmployerDashboardCheckInItem[];
  };
  walletEscrow?: EmployerDashboardWalletEscrow;
  activeJobs?: {
    items?: EmployerDashboardJobItem[];
  };
  alignmentSessions?: {
    items?: EmployerDashboardAlignmentItem[];
  };
  recentActivity?: {
    items?: EmployerDashboardActivityItem[];
  };
  account?: Record<string, any>;
}

// -------------------------------------------------------------
// Settings Types
// -------------------------------------------------------------

export interface EmployerProfileSettings {
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  bio?: string;
  photoStorageKey?: string | null;
  photoUrl?: string | null;
  expertise?: string[];
}

export type UpdateEmployerProfileDto = Partial<EmployerProfileSettings>;

export type NotificationFrequency = 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_SUMMARY';

export interface EmployerNotificationsSettings {
  emailNewApplications: boolean;
  emailAlignmentSessions: boolean;
  emailEscrowWalletActivity: boolean;
  emailPostHireCheckIns: boolean;
  emailPppTierUpdates: boolean;
  emailPlatformAnnouncements: boolean;
  inAppDashboardNotifications: boolean;
  frequency: NotificationFrequency;
}

export type UpdateEmployerNotificationsDto = Partial<EmployerNotificationsSettings>;

export interface PendingEmailChange {
  requestedEmail: string;
  requestedAt: string;
}

export interface EmployerAccountSettings {
  email: string;
  authProvider: string;
  canChangePassword: boolean;
  aiMatchingConsent: boolean;
  pendingEmailChange?: PendingEmailChange | null;
}

export interface UpdateEmployerAccountDto {
  aiMatchingConsent?: boolean;
}

export interface EmailChangeRequestDto {
  newEmail: string;
}

export interface AuthSession {
  id: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  ip?: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
  current?: string;
  new?: string;
}

export interface UploadAvatarResponse {
  storageKey: string;
  signedUrl?: string;
  provider?: string;
}

// -------------------------------------------------------------
// Employer Jobs Types
// -------------------------------------------------------------

// --- List ---

export interface EmployerJobsFilter {
  key: string;
  label: string;
  count: number;
}

export interface EmployerJobBadge {
  kind: string;
  text: string;
  variant: 'info' | 'neutral' | 'success' | 'warning';
}

export type EmployerJobStatus =
  | 'ACTIVE'
  | 'ONGOING'
  | 'SCHEDULED'
  | 'HIRED'
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'CLOSED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface EmployerJobListItem {
  id: string;
  roleTitle: string;
  organisationName?: string;
  location?: string;
  jobType?: string;
  datePosted?: string | null;
  expiryDate?: string | null;
  applicantCount?: number | null;
  status: EmployerJobStatus;
  displayStatus?: string;
  badges?: EmployerJobBadge[];
}

export interface EmployerJobsPagination {
  showingLabel?: string;
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EmployerJobsListResponse {
  filters: EmployerJobsFilter[];
  items: EmployerJobListItem[];
  pagination: EmployerJobsPagination;
}

// --- Details ---

export interface EmployerJobDetailField {
  label: string;
  value: string;
  isLongText?: boolean;
}

export interface EmployerJobDetailEdit {
  wizardStep: number;
  method: string;
  path: string;
}

export interface EmployerJobDetailCard {
  title?: string;
  fields?: EmployerJobDetailField[];
  roleSummary?: string;
  edit?: EmployerJobDetailEdit;

  // Compensation
  eligibilityPills?: string[];

  // Responsibilities
  roleGoal?: string;
  coreResponsibilities?: string;
  technicalSkills?: string[];
  toolsRequired?: string[];

  // Team
  preferredWorkingStyle?: string[];
  communicationStyle?: string;
  communicationLanguage?: string;
  personalityTraits?: string[];
  workCulture?: string[];
}

export interface EmployerJobDetailTabs {
  applicantsCount: number;
  hiredCount: number;
}

export interface EmployerJobBreadcrumb {
  label: string;
  href: string | null;
}

export interface EmployerJobDetailsResponse {
  id: string;
  roleTitle: string;
  organisationName?: string;
  breadcrumb?: EmployerJobBreadcrumb[];
  tabs: EmployerJobDetailTabs;
  roleDetails: EmployerJobDetailCard;
  experience: EmployerJobDetailCard;
  compensation: EmployerJobDetailCard;
  responsibilities: EmployerJobDetailCard;
  team: EmployerJobDetailCard;
}

// --- Applicants ---

export interface EmployerMetricCount {
  count: number | string;
  subtitle?: string;
}

export interface EmployerTopCandidateMetric {
  applicantCode: string;
  assessmentId?: string;
  overallScore?: number | string;
  subtitle?: string;
}

export interface EmployerApplicantMetrics {
  totalMatched: EmployerMetricCount | number | string;
  totalMatchedSub?: string;
  passedAllTests: EmployerMetricCount | number | string;
  passedAllTestsSub?: string;
  didNotMeetThreshold: EmployerMetricCount | number | string;
  didNotMeetThresholdSub?: string;
  topCandidate: EmployerTopCandidateMetric | string;
  topCandidateSub?: string;
}

export interface EmployerGeoCountry {
  country: string;
  code?: string;
  count: number;
}

export interface EmployerGeoDistribution {
  topCountries: EmployerGeoCountry[];
  countryCodes?: string[];
}

export type EmployerApplicantStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'HIRED'
  | 'REJECTED';

export interface EmployerApplicant {
  id?: string;
  assessmentId?: string;
  talentId?: string;
  applicantCode: string;
  qualification?: string;
  location?: string;
  country?: string;
  specialization?: string;
  appliedOn?: string;
  overallStatus?: string;
  overallStatusLabel?: string;
  status?: EmployerApplicantStatus | string;
  overallScore?: number;
  overall?: number;
}

export interface EmployerTestResultItem {
  assessmentId?: string;
  applicantCode?: string;
  label?: string;
  score?: number | string | null;
  status?: string;
}

export interface EmployerTestResultSection {
  available?: boolean;
  passedCount?: number;
  title?: string;
  items?: EmployerTestResultItem[];
}

export interface EmployerRecommendationCandidate {
  assessmentId?: string;
  applicantCode: string;
  overallScore?: number | string;
  score?: number | string;
  reason?: string;
}

export interface EmployerRecommendation {
  autoGenerated?: boolean;
  subtitle?: string;
  topCandidates: EmployerRecommendationCandidate[];
}

export interface EmployerApplicantsResponse {
  rolePostingId?: string;
  roleTitle?: string;
  breadcrumb?: EmployerJobBreadcrumb[];
  tabs?: EmployerJobDetailTabs;
  metrics: EmployerApplicantMetrics;
  geoDistribution?: EmployerGeoDistribution;
  applicants: EmployerApplicant[];
  testResults?: {
    psychometric?: EmployerTestResultSection;
    situationalJudgement?: EmployerTestResultSection;
    video?: EmployerTestResultSection;
  };
  recommendation?: EmployerRecommendation;
}

// --- Hired ---

export type HiredActionType = 'COMPLETE_CHECK_IN' | 'SET_BENCHMARKS' | 'VIEW_HIRE';

export interface EmployerHiresBannerAlert {
  hasUrgentAlert: boolean;
  message?: string;
  ctaText?: string;
  actionType?: string;
  actionLabel?: string;
  checkInId?: string;
  hireId?: string;
}

export interface EmployerHireNextCheckIn {
  label: string;
  dueLabel?: string;
  overdue?: boolean;
}

export interface EmployerHireAction {
  label: string;
  type: HiredActionType | string;
  hireId?: string;
  checkInId?: string;
}

export interface EmployerHireItem {
  id?: string;
  hireId: string;
  talentId?: string;
  talentName: string;
  talentInitials?: string;
  applicantCode?: string;
  assessmentScore?: string | number;
  hiredOn?: string;
  nextCheckIn?: EmployerHireNextCheckIn | string;
  nextCheckInSub?: string;
  trackingStatus?: string;
  trackingStatusLabel?: string;
  trackingStatusVariant?: 'green' | 'red' | 'yellow' | 'gray';
  action?: EmployerHireAction | HiredActionType | string;
  actionLabel?: string;
  checkInId?: string;
  overdue?: boolean;
}

export interface EmployerOpenPositions {
  advertised: number;
  hired: number;
  stillOpen: number;
  label: string;
  canHireAnother: boolean;
}

export interface EmployerHiresResponse {
  rolePostingId?: string;
  roleTitle?: string;
  breadcrumb?: EmployerJobBreadcrumb[];
  tabs?: EmployerJobDetailTabs;
  bannerAlert?: EmployerHiresBannerAlert;
  items: EmployerHireItem[];
  openPositions?: EmployerOpenPositions | number;
  totalPositions?: number;
  canHireAnother?: boolean;
}
