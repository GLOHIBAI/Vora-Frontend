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
  value?: number | string;
  count?: number;
  delta?: string;
  changeLabel?: string;
  deltaType?: 'up' | 'warn';
  amount?: number;
  currency?: string;
  formatted?: string;
}

export interface EmployerDashboardMetrics {
  activeJobs?: MetricCardData;
  totalApplicants?: MetricCardData;
  alignmentSessions?: MetricCardData;
  walletBalance?: MetricCardData;
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

export interface EmployerDashboardEscrowBreakdown {
  inEscrowLocked?: number | string;
  alignmentFeesPending?: number | string;
  trueUpOwed?: number | string;
  totalCommitted?: number | string;
}

export interface EmployerDashboardWalletEscrow {
  availableBalance?: number | string;
  availableBalanceFormatted?: string;
  currency?: string;
  walletLabel?: string;
  walletHolderName?: string;
  inEscrow?: number | string;
  inEscrowFormatted?: string;
  alignmentFeesPending?: number | string;
  alignmentFeesPendingFormatted?: string;
  trueUpOwed?: number | string;
  trueUpOwedFormatted?: string;
  totalCommitted?: number | string;
  totalCommittedFormatted?: string;
  escrowBreakdown?: EmployerDashboardEscrowBreakdown;
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
  roleTitle?: string;
  title?: string;
  departmentOrUnit?: string | null;
  applicationCode?: string;
  location?: string;
  postedDate?: string;
  applicantCount?: number;
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
  type?: string;
  title: string;
  subtitle?: string;
  sub?: string;
  amount?: number | null;
  createdAt?: string;
  relativeTime?: string;
  timestamp?: string;
  time?: string;
  iconType?: ActivityIconType | string;
  iconBg?: string;
  iconColor?: string;
}

export interface EmployerDashboardAccount {
  profile?: {
    organisationName?: string;
    role?: string;
    email?: string;
  };
  payments?: {
    savedPaymentMethodsCount?: number;
  };
  team?: {
    memberCount?: number;
  };
  alerts?: {
    unreadCount?: number;
    mode?: string;
  };
  billing?: {
    tier?: string;
  };
  pipelineAccessPaused?: boolean;
}

export interface EmployerDashboardData {
  greeting?: EmployerDashboardGreeting;
  bannerAlert?: EmployerDashboardBannerAlert;
  metrics?: EmployerDashboardMetrics;
  checkIns?: {
    overdueCount?: number;
    totalPendingCount?: number;
    items?: EmployerDashboardCheckInItem[];
  };
  walletEscrow?: EmployerDashboardWalletEscrow;
  activeJobs?: {
    totalCount?: number;
    items?: EmployerDashboardJobItem[];
  };
  alignmentSessions?: {
    totalCount?: number;
    items?: EmployerDashboardAlignmentItem[];
  };
  recentActivity?: {
    items?: EmployerDashboardActivityItem[];
  };
  account?: EmployerDashboardAccount;
}

// -------------------------------------------------------------
// Settings Types (Boot D & Legacy)
// -------------------------------------------------------------

// 1. Organisation Profile
export interface EmployerOrganisationSettings {
  organisationName: string;
  websiteUrl: string;
  country: string;
  organisationSize: string;
  organisationType: string;
  defaultTimezone: string;
  logoStorageKey?: string | null;
  logoUrl?: string | null;
}

export type UpdateEmployerOrganisationDto = Partial<EmployerOrganisationSettings>;

// 2. Team & Seats
export type EmployerTeamMemberRole =
  | 'ADMIN'
  | 'SENIOR_RECRUITER'
  | 'RECRUITER'
  | 'HIRING_MANAGER'
  | 'VIEWER';

export type EmployerTeamMemberStatus = 'PENDING' | 'ACTIVE' | 'REMOVED';

export interface EmployerTeamMember {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: EmployerTeamMemberRole | string;
  status: EmployerTeamMemberStatus | string;
  joined?: string;
  createdAt?: string;
}

export interface EmployerTeamResponse {
  seatLimit: number;
  usedSeats: number;
  availableSeats?: number;
  members: EmployerTeamMember[];
}

export interface InviteTeamMemberDto {
  email: string;
  role: EmployerTeamMemberRole | string;
}

export interface UpdateTeamMemberDto {
  role?: EmployerTeamMemberRole | string;
  status?: EmployerTeamMemberStatus | string;
}

// 3. Roles & Permissions
export type EmployerPermissionKey =
  | 'post_jobs'
  | 'view_applicants'
  | 'hire'
  | 'reject'
  | 'alignment_sessions'
  | 'view_financials'
  | 'manage_team'
  | 'bulk_hire'
  | 'edit_job_details';

export type EmployerRolePermissions = Record<EmployerPermissionKey, boolean>;

export type EmployerRolePermissionsMatrix = Record<
  string,
  Partial<Record<EmployerPermissionKey, boolean>>
>;

export interface UpdateRolePermissionsDto {
  role: string;
  permissions: Partial<Record<EmployerPermissionKey, boolean>>;
}

// 4. Billing & Payments
export interface EmployerBillingPaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number | string;
  expYear?: number | string;
  isDefault?: boolean;
}

export interface EmployerBillingPlan {
  name?: string;
  status?: string;
  seatLimit?: number;
}

export interface EmployerBillingEscrow {
  balance?: number | string;
  escrowBalance?: number | string;
  pendingTrueUp?: number | string;
  currency?: string;
}

export interface EmployerBillingSettings {
  plan?: EmployerBillingPlan;
  planName?: string;
  planStatus?: string;
  seatLimit?: number;
  paymentMethods?: EmployerBillingPaymentMethod[];
  escrow?: EmployerBillingEscrow;
  escrowSummary?: EmployerBillingEscrow;
  walletBalance?: number | string;
}

// 5. Notifications
export type NotificationFrequency = 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_SUMMARY';

export interface EmployerNotificationsSettings {
  // HTML-aligned keys
  emailHireConfirmed?: boolean;
  emailNewApplications?: boolean;
  emailAssessmentCompleted?: boolean;
  emailAlignmentSessions?: boolean;
  emailRejectionFlagged?: boolean;
  emailFeeProcessed?: boolean;
  emailWeeklyActivitySummary?: boolean;

  // Legacy / extra keys
  emailEscrowWalletActivity?: boolean;
  emailPostHireCheckIns?: boolean;
  emailPppTierUpdates?: boolean;
  emailPlatformAnnouncements?: boolean;
  inAppDashboardNotifications?: boolean;
  frequency?: NotificationFrequency;
}

export type UpdateEmployerNotificationsDto = Partial<EmployerNotificationsSettings>;

// 6. Security
export interface EmployerSecuritySettings {
  twoFactorEnabled: boolean;
  sessionsCount?: number;
  lastPasswordChange?: string;
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
  confirmNewPassword?: string;
  confirmPassword?: string;
  confirm?: string;
  current?: string;
  new?: string;
}

// 7. Data & Privacy
export interface AuditTrailItem {
  id: string;
  action: string;
  details?: string;
  actorEmail?: string;
  actorRole?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditTrailResponse {
  items: AuditTrailItem[];
  total?: number;
  downloadUrl?: string;
}

// 8. Offer Templates
export interface OfferTemplateItem {
  id: string;
  name: string;
  category: string;
  storageKey?: string;
  mimeType?: string;
  isCustom?: boolean;
  isActive?: boolean;
  libraryTemplateId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
}

export interface CreateOfferTemplateDto {
  name: string;
  category: string;
  storageKey: string;
  mimeType?: string;
}

export interface UpdateOfferTemplateDto {
  isActive?: boolean;
  libraryTemplateId?: string | null;
}

// 9. Person profile & account (still supported)
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

export type EmployerJobActionType =
  | 'VIEW_DETAILS'
  | 'EDIT'
  | 'CONTINUE_DRAFT'
  | 'COPY_LINK'
  | 'CLOSE_ROLE'
  | 'DELETE_DRAFT'
  | string;

export interface EmployerJobAction {
  id?: string;
  type?: EmployerJobActionType;
  label: string;
  action?: string;
  url?: string;
  enabled?: boolean;
  destructive?: boolean;
}

export type EmployerJobStatus =
  | 'LIVE'
  | 'ACTIVE'
  | 'ONGOING'
  | 'SCHEDULED'
  | 'VAULT'
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
  shareUrl?: string;
  roleLink?: string;
  actions?: EmployerJobAction[];
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
  stage?: EmployerTalentStage;
  actions?: EmployerTalentAction[];
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

// -------------------------------------------------------------
// Talents (/api/v1/employers/talents)
// -------------------------------------------------------------

export interface EmployerTalentStage {
  current: number | null;
  name: string | null;
  label: string;
  completed: boolean;
  total?: number;
}

export type EmployerTalentActionKey =
  | 'VIEW_DETAILS'
  | 'HIRE_APPLICANT'
  | 'REJECT_APPLICANT'
  | string;

export interface EmployerTalentAction {
  key: EmployerTalentActionKey;
  label: string;
  method: 'GET' | 'POST' | string;
  path: string;
  enabled: boolean;
  destructive?: boolean;
}

export type EmployerTalentStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'HIRED'
  | 'REJECTED';

export interface EmployerTalentItem {
  id?: string;
  assessmentId?: string;
  applicantCode: string;
  qualification?: string;
  roleApplied: string;
  rolePostingId?: string;
  overallScore?: number | null;
  stage: EmployerTalentStage;
  appliedOn?: string;
  overallStatus: EmployerTalentStatus | string;
  overallStatusLabel: string;
  actions: EmployerTalentAction[];
}

export interface EmployerTalentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  showingLabel?: string;
}

export interface EmployerTalentsResponse {
  items: EmployerTalentItem[];
  pagination: EmployerTalentsPagination;
}

export interface EmployerTalentsQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

