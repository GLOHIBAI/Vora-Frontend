export type CourseFormat = 'VIDEO' | 'ARTICLE';

export type EnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED';

export type LessonContentType = 'VIDEO' | 'ARTICLE' | 'QUIZ';

export interface CourseRatings {
  average?: number;
  count?: number;
  distribution?: Record<number, number>;
}

export interface CourseMentorBrief {
  id?: string;
  name: string;
  avatarUrl: string | null;
  headline?: string | null;
  instructorLabel: string;
}

export interface CourseStatsBrief {
  studentCount: number;
  videoHours: number;
  videoHoursLabel: string;
  ratings: CourseRatings | null;
}

export interface CourseBrowseItem {
  id: string;
  title: string;
  tagline: string;
  thumbnailUrl: string | null;
  isMasterclass: boolean;
  format: CourseFormat;
  formatLabel: string;
  accentColor?: string;
  specialisation: string;
  pills: string[];
  mentor: CourseMentorBrief;
  stats: CourseStatsBrief;
  enrolled: boolean;
}

export interface RecommendedCoursesData {
  schemaVersion: number;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  items: CourseBrowseItem[];
}

export interface EnrollmentResumeCta {
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  href: string;
}

export interface EnrollmentCertificateCta {
  enabled: boolean;
  certificateId: string | null;
}

export interface EnrollmentCta {
  resumeLesson: EnrollmentResumeCta;
  downloadCertificate: EnrollmentCertificateCta;
}

export interface EnrollmentItem {
  enrollmentId: string;
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  progressPercent: number;
  progressLabel: string;
  status: EnrollmentStatus;
  statusLabel: string;
  estimatedCompletionAt: string | null;
  cta: EnrollmentCta;
  mentor: {
    name: string;
    avatarUrl: string | null;
    instructorLabel: string;
  };
}

export interface EnrollmentsData {
  schemaVersion: number;
  ongoing: EnrollmentItem[];
  completed: EnrollmentItem[];
}

export interface CourseSocialLinks {
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
}

export interface CourseMentorDetail {
  id: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  instructorLabel: string;
  bio: string;
  social: CourseSocialLinks;
  expertiseTags: string[];
}

export interface CourseStatsDetail {
  studentCount: number;
  videoHours: number;
  videoHoursLabel: string;
  lessonCount: number;
  moduleCount: number;
  skillLevel: string;
  ratings: CourseRatings | null;
}

export interface CourseLesson {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  durationLabel: string;
  contentS3Key: string | null;
  contentType: LessonContentType;
  isCompleted: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  durationLabel: string;
  lessons: CourseLesson[];
}

export interface CourseChapterStatus {
  moduleId: string;
  title: string;
  order: number;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
}

export interface CourseCertificateInfo {
  issued: boolean;
  certificateId: string | null;
  downloadUrl: string | null;
}

export interface MyEnrollmentInfo {
  enrollmentId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  progressLabel: string;
  currentModuleId: string | null;
  currentLessonId: string | null;
  completedLessonIds: string[];
  chapters: CourseChapterStatus[];
  certificate: CourseCertificateInfo;
}

export interface CourseDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  thumbnailUrl: string | null;
  introVideoUrl: string | null;
  isMasterclass: boolean;
  format: CourseFormat;
  formatLabel: string;
  accentColor?: string;
  specialisation: string;
  language: string;
  pills: string[];
  mentor: CourseMentorDetail;
  stats: CourseStatsDetail;
  modules: CourseModule[];
  reviews: any | null;
  questions: any | null;
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
  enrollmentId: string;
  progressPercent: number;
  progressLabel: string;
  status: EnrollmentStatus;
  isCourseCompleted: boolean;
  certificate: {
    issued: boolean;
    certificateId: string | null;
  };
}

export interface CourseApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}
