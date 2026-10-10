import type { CourseFormat } from './courses';

export type BuilderLessonContentType =
  | 'VIDEO'
  | 'FIELD_CASE_STUDY'
  | 'QUIZ'
  | 'READING'
  | 'GRADED_ASSIGNMENT';

export type CertificateTemplate = 'NONE' | 'VORA' | 'BLOCKCHAIN';

export interface LessonResourceItem {
  label: string;
  url: string;
}

export interface BuilderLesson {
  id: string;
  moduleId?: string;
  title: string;
  contentType: BuilderLessonContentType;
  orderIndex: number;
  durationMinutes: number;
  videoS3Key?: string | null;
  articleBody?: string | null;
  fieldCaseBrief?: string | null;
  isOptional?: boolean;
  isPreview?: boolean;
  resources?: LessonResourceItem[];
}

export interface BuilderModule {
  id: string;
  courseId?: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  lessons: BuilderLesson[];
}

export interface PublishChecklistItem {
  key: string;
  label: string;
  passed: boolean;
  stepNumber: number;
}

export interface PublishChecklist {
  ready: boolean;
  items: PublishChecklistItem[];
}

export interface CourseBuilderData {
  schemaVersion: number;
  id: string;
  status: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  difficultyLevel?: string | null;
  language?: string | null;
  format?: CourseFormat | null;
  coverImageS3Key?: string | null;
  promotionalVideoS3Key?: string | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  enablePppPricing?: boolean;
  certificateTemplate?: CertificateTemplate | null;
  isCpdAccredited?: boolean;
  cpdCredits?: number | null;
  cpdBody?: string | null;
  seoSlugPreview?: string | null;
  seoPathHint?: string | null;
  modules: BuilderModule[];
  publishChecklist: PublishChecklist;
}

export interface PricingPreviewTier {
  countryCode?: string;
  countryName?: string;
  tier?: string;
  tierName?: string;
  name?: string;
  label?: string;
  originalPrice?: number;
  discountedPrice?: number;
  price?: number;
  currency?: string;
  factor?: number;
  description?: string;
  countries?: string;
}

export interface PricingPreviewData {
  schemaVersion?: number;
  tier1Price?: number;
  basePrice?: number;
  baseCurrency?: string;
  currency?: string;
  tiers?: PricingPreviewTier[] | Record<string, any>;
  [key: string]: any;
}

export interface UploadMediaResponseData {
  s3Key: string;
  url?: string;
}

// Request DTOs
export interface CreateDraftCourseDto {
  title: string;
  format?: CourseFormat;
  tier1Price?: number;
  priceAmount?: number;
}

export interface PatchCourseDto {
  title?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  topic?: string;
  difficultyLevel?: string;
  language?: string;
  format?: CourseFormat;
  coverImageS3Key?: string | null;
  promotionalVideoS3Key?: string | null;
  tier1Price?: number;
  priceAmount?: number;
  enablePppPricing?: boolean;
  certificateTemplate?: CertificateTemplate;
  isCpdAccredited?: boolean;
  cpdCredits?: number;
  cpdBody?: string;
}

export interface CreateModuleDto {
  title: string;
  description?: string;
  orderIndex?: number;
}

export interface PatchModuleDto {
  title?: string;
  description?: string;
  orderIndex?: number;
}

export interface CreateLessonDto {
  title: string;
  contentType: BuilderLessonContentType;
  durationMinutes?: number;
  videoS3Key?: string | null;
  articleBody?: string | null;
  fieldCaseBrief?: string | null;
  isOptional?: boolean;
  isPreview?: boolean;
  resources?: LessonResourceItem[];
  orderIndex?: number;
}

export interface PatchLessonDto {
  title?: string;
  contentType?: BuilderLessonContentType;
  durationMinutes?: number;
  videoS3Key?: string | null;
  articleBody?: string | null;
  fieldCaseBrief?: string | null;
  isOptional?: boolean;
  isPreview?: boolean;
  resources?: LessonResourceItem[];
  orderIndex?: number;
}

export interface ReorderModulesDto {
  orderedModuleIds: string[];
}

export interface ReorderLessonsDto {
  orderedLessonIds: string[];
}

export const CONTENT_TYPE_MAP: Record<
  string,
  { contentType: BuilderLessonContentType; label: string; icon: string; badge: string; badgeBg: string }
> = {
  video: {
    contentType: 'VIDEO',
    label: 'Video Masterclass',
    icon: 'PlayCircle',
    badge: 'Video',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  case: {
    contentType: 'FIELD_CASE_STUDY',
    label: 'Field Case Study',
    icon: 'Briefcase',
    badge: 'Field Case',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  quiz: {
    contentType: 'QUIZ',
    label: 'Knowledge Check / Quiz',
    icon: 'HelpCircle',
    badge: 'Quiz',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  reading: {
    contentType: 'READING',
    label: 'Framework & Reading',
    icon: 'FileText',
    badge: 'Reading',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  assignment: {
    contentType: 'GRADED_ASSIGNMENT',
    label: 'Graded Assignment',
    icon: 'ClipboardCheck',
    badge: 'Assignment',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const REVERSE_CONTENT_TYPE_MAP: Record<BuilderLessonContentType, string> = {
  VIDEO: 'video',
  FIELD_CASE_STUDY: 'case',
  QUIZ: 'quiz',
  READING: 'reading',
  GRADED_ASSIGNMENT: 'assignment',
};
