export type CourseFormat =
  | 'VIDEO_MASTERCLASS'
  | 'HYBRID'
  | 'COHORT_BASED'
  | 'CASE_STUDY_SERIES'
  | 'WORKSHOP_SPRINT'
  | 'WRITTEN_TEXT';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';

export type CourseStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type LessonContentType = 'VIDEO' | 'ARTICLE' | 'QUIZ';

export type ChapterStatus = 'completed' | 'ongoing' | 'upcoming';

export interface CourseRatings {
  average?: number | null;
  count?: number | null;
  distribution?: Record<number, number>;
}

export interface CourseMentorBrief {
  id?: string;
  displayName: string;
  instructorLabel: string;
  professionalTitle?: string | null;
  organisation?: string | null;
  photoS3Key: string | null;
  // Compatibility aliases
  name?: string;
  avatarUrl?: string | null;
  headline?: string | null;
}

export interface CourseStatsBrief {
  studentCount: number;
  lessonCount?: number;
  moduleCount?: number;
  videoMinutes: number;
  videoHoursLabel: string | null;
  ratings: number | null;
  ratingsCount: number | null;
  // Compatibility
  videoHours?: number;
}

export interface CourseBrowseCta {
  label: string;
  hrefHint: string;
}

export interface CourseBrowseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  format: CourseFormat;
  formatLabel?: string;
  isMasterclass: boolean;
  difficultyLevel: string;
  language: string;
  thumbnailS3Key: string | null;
  promoVideoS3Key: string | null;
  publishedAt: string;
  skills: string[];
  tags: string[];
  mentor: CourseMentorBrief;
  stats: CourseStatsBrief;
  pills: string[];
  cta?: CourseBrowseCta;
  enrolled?: boolean;
  // Compatibility aliases
  tagline?: string;
  thumbnailUrl?: string | null;
  accentColor?: string;
  specialisation?: string;
}

export interface RecommendedCoursesData {
  schemaVersion: number;
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasMore?: boolean;
  items: CourseBrowseItem[];
}

export interface CourseNestedBrief {
  id: string;
  title: string;
  subtitle: string;
  thumbnailS3Key: string | null;
  format: CourseFormat;
  difficultyLevel: string;
  category: string;
  thumbnailUrl?: string | null;
}

export interface CourseChapterLesson {
  id: string;
  title: string;
  orderIndex?: number;
  durationMinutes?: number;
  durationLabel?: string;
  contentType?: LessonContentType;
  contentS3Key?: string | null;
  isCompleted?: boolean;
}

export interface CourseChapterItem {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonCount: number;
  durationMinutes: number;
  lessons: CourseChapterLesson[];
  status: 'completed' | 'ongoing' | 'upcoming';
  statusLabel: string; // 'Completed' | 'Ongoing' | 'Upcoming'
}

export interface EnrollmentCertificate {
  id: string;
  shareableUrl: string | null;
  issuedAt: string;
  blockchainVerified?: boolean;
}

export interface EnrollmentCta {
  downloadCertificate: {
    enabled: boolean;
    href: string | null;
  };
  continueLearning: {
    enabled: boolean;
    hrefHint: string;
  };
  // Compatibility alias
  resumeLesson?: {
    moduleId?: string;
    lessonId?: string;
    lessonTitle?: string;
    href?: string;
  };
}

export interface EnrollmentItem {
  enrollmentId: string;
  status: EnrollmentStatus;
  tab?: 'ongoing' | 'completed';
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  progressLabel: string; // "8% completed" / "100% completed"
  completedLessonCount: number;
  totalLessonCount: number;
  totalMinutes: number;
  totalTimeLabel: string;
  estimatedCompletionAt?: string | null; // HIDE - not computed
  interviewScore?: number | null; // HIDE - DO NOT RENDER
  course: CourseNestedBrief;
  mentor: CourseMentorBrief;
  chapters: CourseChapterItem[];
  certificate: EnrollmentCertificate | null;
  cta: EnrollmentCta;
  // Root compatibility properties
  courseId?: string;
  title?: string;
  thumbnailUrl?: string | null;
  statusLabel?: string;
}

export interface EnrollmentsData {
  schemaVersion: number;
  ongoing: EnrollmentItem[];
  completed: EnrollmentItem[];
  items?: EnrollmentItem[];
}

export interface CourseSocialLinks {
  x: string | null;
  linkedin: string | null;
  instagram: string | null;
  // Compatibility aliases
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
}

export interface CourseMentorDetail {
  id: string;
  displayName: string;
  instructorLabel: string;
  professionalTitle?: string | null;
  organisation?: string | null;
  bio: string | null;
  photoS3Key: string | null;
  expertiseTags: string[];
  social: CourseSocialLinks;
  // Compatibility aliases
  name?: string;
  avatarUrl?: string | null;
  headline?: string | null;
}

export interface CourseStatsDetail {
  skillLevel: string; // ← difficultyLevel
  studentCount: number;
  language: string;
  ratings: number | null;
  ratingsCount: number | null;
  videoMinutes: number;
  videoHoursLabel: string | null;
  lessonCount: number;
  moduleCount: number;
  // Compatibility
  videoHours?: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  contentType: LessonContentType;
  contentS3Key: string | null;
  durationMinutes: number;
  orderIndex: number;
  durationLabel: string; // e.g. "Video (2 minutes)"
  isCompleted?: boolean;
  order?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonCount: number;
  durationMinutes: number;
  durationLabel?: string;
  lessons: CourseLesson[];
  order?: number;
}

export interface CourseChapterStatus {
  moduleId: string;
  title: string;
  order: number;
  status: 'completed' | 'ongoing' | 'upcoming';
  progressPercent: number;
}

export interface CourseCertificateInfo {
  issued: boolean;
  certificateId: string | null;
  downloadUrl: string | null;
}

export interface MyEnrollmentInfo {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  // Compatibility properties
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  completedLessonIds?: string[];
  chapters?: CourseChapterStatus[];
  certificate?: CourseCertificateInfo;
  enrollmentId?: string;
  progressLabel?: string;
}

export interface CourseDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  format: CourseFormat;
  difficultyLevel: string;
  language: string;
  prerequisites: string[];
  skills: string[];
  tags: string[];
  learningOutcomes: string[];
  thumbnailS3Key: string | null;
  promoVideoS3Key: string | null;
  status: CourseStatus;
  isCpdAccredited?: boolean;
  publishedAt: string;
  mentor: CourseMentorDetail;
  stats: CourseStatsDetail;
  modules: CourseModule[];
  reviews: any | null; // null today -> Coming soon
  questions: any | null; // null today -> Coming soon
  // Compatibility aliases
  tagline?: string;
  thumbnailUrl?: string | null;
  introVideoUrl?: string | null;
  formatLabel?: string;
  isMasterclass?: boolean;
  accentColor?: string;
  specialisation?: string;
  pills?: string[];
}

export interface CourseDetailData {
  schemaVersion: number;
  course: CourseDetail;
  myEnrollment: MyEnrollmentInfo | null;
}

export interface EnrollCoursePayload {
  declaredCountry?: string;
  ipCountry?: string;
  paymentCountry?: string;
  localeCountry?: string;
}

export interface EnrollCourseResponseData {
  schemaVersion: number;
  enrollmentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface RecordProgressParams {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export interface RecordProgressResponseData {
  schemaVersion: number;
  progress: number;
  isComplete: boolean;
  progressPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  // Compatibility aliases
  enrollmentId?: string;
  status?: EnrollmentStatus;
  isCourseCompleted?: boolean;
  certificate?: {
    issued: boolean;
    certificateId: string | null;
  };
}

export interface CourseApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ============================================================================
// INSTRUCTOR PORTAL (MENTOR HUB) TYPES
// ============================================================================

export interface InstructorHubMetrics {
  totalEnrolled: number;
  enrolledMoMPercent: number | null;
  enrolledMoMLabel: string | null;
  activeCourses: number;
  totalCourses: number;
  activeCoursesLabel: string;
  averageRating: number | null;
  ratingsCount: number | null;
  totalRevenue: number;
  currency: string;
  formattedRevenue: string;
  completionRatePercent: number | null;
  completionLabel: string | null;
}

export interface InstructorHubTabCounts {
  myCourses: number;
  roster: number;
  mentorship: number;
  reviewsQa: number;
}

export interface InstructorHubFilters {
  all: number;
  published: number;
  underReview: number;
  drafts: number;
  archived: number;
}

export interface InstructorCourseAction {
  enabled: boolean;
  hrefHint?: string;
  label?: string;
  reason?: string;
}

export interface InstructorCourseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  format: CourseFormat;
  difficultyLevel: string;
  thumbnailS3Key: string | null;
  status: CourseStatus;
  statusLabel: string;
  price: number;
  currency: string;
  formattedPrice: string;
  students: number;
  revenue: number;
  formattedRevenue: string;
  rating: number | null;
  ratingsCount: number | null;
  publishedAt: string | null;
  updatedAt: string;
  actions: {
    publish: InstructorCourseAction;
    unpublish: InstructorCourseAction;
    edit: InstructorCourseAction;
    delete: InstructorCourseAction;
  };
}

export interface InstructorRosterStudent {
  talentId: string;
  displayName: string;
  professionalTitle?: string | null;
  lastActiveAt?: string | null;
}

export interface InstructorRosterItem {
  enrollmentId: string;
  student: InstructorRosterStudent;
  course: {
    id: string;
    title: string;
  };
  progressPercent: number;
  progressLabel: string;
  submission: string | null;
  submissionTitle: string | null;
  gradePercent: number | null;
  status: 'active' | 'in_progress' | 'completed';
  statusLabel: string;
  actions: {
    reviewGrade: {
      enabled: boolean;
      label: string;
      reason?: string;
    };
    message: {
      enabled: boolean;
      label: string;
      reason?: string;
    };
  };
}

export interface InstructorMentorshipItem {
  bookingId: string;
  mentee: {
    talentId: string;
    displayName: string;
  };
  course: {
    id: string;
    title: string;
  } | null;
  pppTier: string;
  tierLabel: string;
  sessionFocus: string | null;
  scheduledAt: string;
  durationMinutes: number;
  rate: number;
  currency: string;
  formattedRate: string;
  meetingLink: string | null;
  actions: {
    startCall: {
      enabled: boolean;
      href?: string | null;
      label: string;
    };
    message: {
      enabled: boolean;
      label?: string;
      reason?: string;
    };
    configureAvailabilityHrefHint?: string;
  };
}

export interface InstructorHubCta {
  createCourse: {
    label: string;
    hrefHint: string;
  };
  configureAvailability: {
    label: string;
    hrefHint: string;
  };
}

export interface InstructorHubData {
  schemaVersion: number;
  metrics: InstructorHubMetrics;
  tabCounts: InstructorHubTabCounts;
  filters: InstructorHubFilters;
  myCourses: InstructorCourseItem[];
  roster: InstructorRosterItem[];
  mentorship: InstructorMentorshipItem[];
  reviews: any[];
  questions: any[];
  cta: InstructorHubCta;
}

export interface CreateCourseDto {
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  format?: CourseFormat;
  difficultyLevel?: string;
  tier1Price?: number;
  price?: number;
  currency?: string;
  language?: string;
  skills?: string[];
  tags?: string[];
  thumbnailS3Key?: string | null;
}

