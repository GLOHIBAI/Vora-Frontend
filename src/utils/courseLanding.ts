import type { CourseDetailData, CourseModule, InstructorCourseItem } from '../types/courses';
import { displayMedia } from './media';

export interface PublicCourseLandingLesson {
  id: string | number;
  title: string;
  durationLabel?: string;
  isFreePreview?: boolean;
  videoUrl?: string;
}

export interface PublicCourseLandingModule {
  id: string | number;
  title: string;
  description?: string;
  durationLabel?: string;
  lessons: PublicCourseLandingLesson[];
}

export interface PublicCourseLandingData {
  id: string;
  slug: string;
  title: string;
  headline?: string;
  description: string;
  category: string;
  level: string;
  format: string;
  durationLabel: string;
  lessonsCount: number;
  language: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  isFree: boolean;
  priceAmount?: number;
  priceDisplay: string;
  priceSubtext: string;
  instructor: {
    name: string;
    title: string;
    organisation?: string;
    avatarUrl?: string;
    bio?: string;
    initials: string;
  };
  learningOutcomes: string[];
  prerequisites: string[];
  modules: PublicCourseLandingModule[];
  qualifyingJobs?: any[];
}

export const COURSE_LANDING_STORAGE_PREFIX = 'voraCourseLanding:';

const UUID_OR_HEX_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HASH_OR_HEX_REGEX = /^[0-9a-fA-F-]{20,}$/;

export const isUuidOrHexIdentifier = (str: string): boolean => {
  return UUID_OR_HEX_REGEX.test(str) || HASH_OR_HEX_REGEX.test(str);
};

export const getPersonInitials = (name?: string): string => {
  if (!name) return 'V';
  // Remove degrees / qualifications after comma (e.g. ", MD, MSc")
  const baseName = name.split(',')[0].trim();
  // Remove titles like Dr., Prof., Doctor, Professor, Mr., Mrs., Ms.
  const withoutTitle = baseName.replace(/^(dr\.|dr|prof\.|prof|doctor|professor|mr\.|mr|mrs\.|mrs|ms\.|ms)\s+/i, '').trim();
  const parts = withoutTitle.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.charAt(0).toUpperCase() || 'V';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const humanizeSlug = (slug: string): string => {
  if (!slug) return DEFAULT_PUBLIC_COURSE_LANDING.title;
  if (isUuidOrHexIdentifier(slug)) {
    return DEFAULT_PUBLIC_COURSE_LANDING.title;
  }
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const DEFAULT_PUBLIC_COURSE_LANDING: PublicCourseLandingData = {
  id: 'c-intro-global-health',
  slug: 'intro-to-global-health-systems',
  title: 'Global Health Systems, Epidemiology & Field Intervention',
  headline: 'A comprehensive, practice-grounded masterclass designed by leading health researchers for practitioners and aspiring leaders.',
  description:
    'Gain an in-depth understanding of international healthcare infrastructure, pandemic surveillance architectures, and community intervention strategies across Sub-Saharan Africa and LMIC regions. Designed to bridge academic theory and real-world implementation.',
  category: 'Epidemiology & Health Systems',
  level: 'All Levels',
  format: 'Self-paced',
  durationLabel: '6.5 hours',
  lessonsCount: 14,
  language: 'English',
  isFree: true,
  priceDisplay: 'Free',
  priceSubtext: 'Full access to all course materials & certificate',
  previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-medical-laboratory-research-analysis-41270-large.mp4',
  instructor: {
    name: 'Dr. Amara Osei, MD, MSc',
    title: 'Lead Health Systems Researcher & Senior Mentor',
    organisation: 'West Africa Health Collaborative',
    bio: 'Dr. Osei has over 14 years of clinical and epidemiological field experience across Ghana, Nigeria, and the UK. She advises international NGOs on health equity and primary healthcare resilience.',
    initials: 'AO',
  },
  learningOutcomes: [
    'Analyze healthcare infrastructure models across lower-to-middle income settings',
    'Design resilient surveillance and rapid-response workflows for localized outbreaks',
    'Evaluate clinical trial data with modern biostatistical and epidemiological tools',
    'Navigate health governance, multilateral donor funding, and cross-border ethics',
  ],
  prerequisites: [
    'Basic interest in public health, global health, or biomedical sciences',
    'No prior statistical software experience required; all toolkits are provided',
  ],
  modules: [
    {
      id: 'm1',
      title: 'Module 1: Foundations of Global Health Infrastructure',
      durationLabel: '1 hr 45 mins',
      lessons: [
        { id: 'l1', title: 'Healthcare delivery frameworks in low-resource settings', durationLabel: '20 mins', isFreePreview: true },
        { id: 'l2', title: 'Community health worker deployment & supply-chain realities', durationLabel: '35 mins', isFreePreview: false },
        { id: 'l3', title: 'Health economics and funding mechanisms', durationLabel: '50 mins', isFreePreview: false },
      ],
    },
    {
      id: 'm2',
      title: 'Module 2: Epidemiological Surveillance & Disease Outbreak Response',
      durationLabel: '2 hrs 30 mins',
      lessons: [
        { id: 'l4', title: 'Disease surveillance architectures & real-time telemetry', durationLabel: '40 mins', isFreePreview: false },
        { id: 'l5', title: 'Contact tracing workflows and community engagement', durationLabel: '45 mins', isFreePreview: false },
        { id: 'l6', title: 'Data hygiene and field reporting during active outbreaks', durationLabel: '65 mins', isFreePreview: false },
      ],
    },
    {
      id: 'm3',
      title: 'Module 3: Capstone Case Study & Applied Intervention',
      durationLabel: '2 hrs 15 mins',
      lessons: [
        { id: 'l7', title: 'Case scenario analysis: Pediatric malnutrition intervention', durationLabel: '55 mins', isFreePreview: false },
        { id: 'l8', title: 'Presenting policy briefs to multi-agency steering groups', durationLabel: '40 mins', isFreePreview: false },
        { id: 'l9', title: 'Summary assessment and certificate generation', durationLabel: '40 mins', isFreePreview: false },
      ],
    },
  ],
};

export const mapCourseApiToLandingData = (
  slugOrId: string,
  apiData: any
): PublicCourseLandingData => {
  const c = apiData?.course || apiData || {};
  const instructorData = c.instructor || c.creator || c.mentor || {};

  const modules: CourseModule[] = Array.isArray(c.modules) ? c.modules : [];
  let totalLessons = 0;
  modules.forEach((m) => {
    totalLessons += Array.isArray(m.lessons) ? m.lessons.length : 0;
  });

  const durationStr =
    c.stats?.videoHoursLabel ||
    (c.stats?.videoMinutes ? `${Math.round(c.stats.videoMinutes / 60)} hours` : '6.5 hours');

  const banner = displayMedia(
    c.thumbnailUrl || c.coverImageUrl,
    c.thumbnailS3Key || c.coverImageS3Key
  );

  const instructorAvatar = displayMedia(
    instructorData.photoUrl || instructorData.avatarUrl,
    instructorData.photoS3Key
  );

  // Price resolution: check tier1Price, price, priceAmount
  const numericPrice = Number(c.tier1Price ?? c.price ?? c.priceAmount ?? 0);
  const isFree = !numericPrice || numericPrice <= 0 || c.isFree === true;
  const priceDisplay = isFree ? 'Free' : `$${numericPrice}`;
  const priceSubtext = isFree
    ? 'Full access to all course materials & certificate'
    : 'One-time payment · Lifetime access';

  const instructorName =
    instructorData.displayName ||
    `${instructorData.firstName || ''} ${instructorData.lastName || ''}`.trim() ||
    '';

  const outcomes: string[] =
    Array.isArray(c.learningOutcomes) && c.learningOutcomes.length > 0
      ? c.learningOutcomes
      : Array.isArray(c.objectives) && c.objectives.length > 0
      ? c.objectives
      : [];

  const prerequisites: string[] =
    Array.isArray(c.prerequisites) && c.prerequisites.length > 0
      ? c.prerequisites
      : [];

  // Resolve title cleanly
  let resolvedTitle = c.title || '';
  if (!resolvedTitle || isUuidOrHexIdentifier(resolvedTitle)) {
    resolvedTitle = humanizeSlug(slugOrId);
  }

  return {
    id: String(c.id || slugOrId),
    slug: c.slug || slugOrId,
    title: resolvedTitle,
    headline: c.shortDescription || c.headline || '',
    description: c.description || '',
    category: c.category || c.focusArea || '',
    level: c.difficultyLevel || c.level || 'All Levels',
    format: c.format === 'COHORT_BASED' ? 'Cohort-based' : 'Self-paced',
    durationLabel: durationStr,
    lessonsCount: totalLessons,
    language: c.language || 'English',
    thumbnailUrl: banner || undefined,
    previewVideoUrl:
      c.previewVideoUrl ||
      c.promoVideoUrl ||
      c.introVideoUrl ||
      c.videoUrl ||
      ((modules[0]?.lessons?.[0] as any)?.videoUrl || (modules[0]?.lessons?.[0] as any)?.contentUrl) ||
      undefined,
    isFree,
    priceAmount: isFree ? 0 : numericPrice,
    priceDisplay,
    priceSubtext,
    instructor: {
      name: instructorName,
      title: instructorData.professionalTitle || instructorData.title || '',
      organisation: instructorData.organisation || instructorData.organization || '',
      avatarUrl: instructorAvatar || undefined,
      bio: instructorData.bio || '',
      initials: getPersonInitials(instructorName),
    },
    learningOutcomes: outcomes,
    prerequisites,
    modules:
      modules.length > 0
        ? modules.map((m, idx) => ({
            id: m.id || `mod-${idx}`,
            title: m.title || `Module ${idx + 1}`,
            description: m.description,
            durationLabel: m.durationLabel || (m.durationMinutes ? `${m.durationMinutes} mins` : undefined),
            lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
              id: l.id || `les-${idx}-${lIdx}`,
              title: l.title || `Lesson ${lIdx + 1}`,
              durationLabel: l.durationLabel || (l.durationMinutes ? `${l.durationMinutes} mins` : undefined),
              isFreePreview: Boolean(l.isFreePreview || (idx === 0 && lIdx === 0)),
              videoUrl: l.videoUrl || l.contentUrl || l.mediaUrl || l.url,
            })),
          }))
        : [],
    qualifyingJobs: Array.isArray(c.qualifyingJobs)
      ? c.qualifyingJobs
      : Array.isArray(apiData?.qualifyingJobs)
      ? apiData.qualifyingJobs
      : [],
  };
};

export const getCourseLandingForSlug = (slugOrId: string): PublicCourseLandingData => {
  const resolvedTitle = isUuidOrHexIdentifier(slugOrId)
    ? DEFAULT_PUBLIC_COURSE_LANDING.title
    : humanizeSlug(slugOrId);

  return {
    ...DEFAULT_PUBLIC_COURSE_LANDING,
    id: slugOrId,
    slug: slugOrId,
    title: resolvedTitle,
  };
};
