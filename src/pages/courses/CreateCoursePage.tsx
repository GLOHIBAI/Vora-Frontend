import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Select from '../../components/common/Select';
import Tag from '../../components/common/Tag';
import type { CourseFormat } from '../../types/courses';
import {
  type BuilderLessonContentType,
  type CertificateTemplate,
  type BuilderModule,
  type BuilderLesson,
  CONTENT_TYPE_MAP,
} from '../../types/courseBuilder';
import {
  useCourseBuilder,
  useCreateDraftCourse,
  usePatchCourse,
  useUploadCourseMedia,
  usePricingPreview,
  useCreateModule,
  usePatchModule,
  useDeleteModule,
  useCreateLesson,
  usePatchLesson,
  useDeleteLesson,
  usePublishCourseBuilder,
  useUnpublishCourseBuilder,
} from '../../services/queries/courses/builder';
import { useCourseBuilderAutosave } from '../../hooks/useCourseBuilderAutosave';

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

interface WizardStepMeta {
  id: StepId;
  key: string;
  label: string;
  subtitle: string;
}

const STEPS: WizardStepMeta[] = [
  { id: 1, key: 'basics', label: 'Course Basics', subtitle: 'Title, category & overview' },
  { id: 2, key: 'format', label: 'Format & Media', subtitle: 'Delivery mode & visual assets' },
  { id: 3, key: 'curriculum', label: 'Curriculum', subtitle: 'Modules, lessons & resources' },
  { id: 4, key: 'pricing', label: 'Pricing & PPP', subtitle: 'Base rate & global parity' },
  { id: 5, key: 'certificate', label: 'Certificate & CPD', subtitle: 'Credentials & accreditation' },
  { id: 6, key: 'settings', label: 'Settings & Publish', subtitle: 'Pre-flight check & go live' },
];

const GAP_TOPICS: Record<string, { title: string; desc: string; tags: string[] }> = {
  'political-economy': {
    title: 'Political Economy Analysis & Health Sector Reform',
    desc: 'Built from critical curriculum gap data: 56 candidates assessed, 63% failure rate in Political Economy Analysis across WHO, UNICEF, and MoH advisory roles.',
    tags: ['Political Economy', 'Health Reform', 'Stakeholder Mapping', 'GH Policy'],
  },
  'crisis-decision-making': {
    title: 'Crisis-Mode Decision Frameworks for Health Systems Leaders',
    desc: 'Built from gap intelligence: 78 candidates, 73% failure rate in structured decision-making under resource scarcity across WHO AFRO, MSF, and IRC.',
    tags: ['Crisis Response', 'Health Systems', 'Decision Frameworks', 'LMIC'],
  },
  'health-financing': {
    title: 'Domestic Resource Mobilisation & Health Financing Architecture',
    desc: 'Built from gap intelligence: 44 candidates, 58% failure rate in DRM frameworks and health budget negotiation from World Bank and AfDB data.',
    tags: ['Health Financing', 'DRM', 'Budget Negotiation', 'Transition Economies'],
  },
  'advocacy-communication': {
    title: 'Data-to-Decision Advocacy for Global Health Leaders',
    desc: 'Built from gap intelligence: 38 candidates, 54% failure rate in translating evidence for non-technical audiences including ministers and donors.',
    tags: ['Advocacy', 'Data Storytelling', 'Communication', 'GH Policy'],
  },
  'implementation-science': {
    title: 'Health Policy Implementation Science: Evidence to National Scale',
    desc: 'Built from gap intelligence: 29 candidates, 47% failure rate in implementation science and policy adoption pathways.',
    tags: ['Implementation Science', 'Policy Adoption', 'Scale-Up', 'GH Systems'],
  },
};

const CATEGORIES = [
  'Global Health Policy',
  'Epidemiology',
  'Health Systems Strengthening',
  'NGO & Programme Management',
  'Global Health Financing',
  'Biostatistics & Research Methods',
  'Humanitarian Health',
  'Digital Health & Innovation',
  'Community Health & Equity',
  'Health Workforce Development',
];

const DIFFICULTY_LEVELS = ['Intermediate', 'Advanced', 'Expert / Masterclass'];
const LANGUAGES = ['English', 'French', 'Portuguese', 'Spanish', 'Arabic', 'Swahili'];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ label: c, value: c }));
const DIFFICULTY_OPTIONS = DIFFICULTY_LEVELS.map((l) => ({ label: l, value: l }));
const LANGUAGE_OPTIONS = LANGUAGES.map((lang) => ({ label: lang, value: lang }));

const LESSON_TYPE_OPTIONS = [
  { value: 'VIDEO', label: '🎬 Video Masterclass' },
  { value: 'FIELD_CASE_STUDY', label: '💼 Field Case Study' },
  { value: 'QUIZ', label: '✓ Knowledge Check' },
  { value: 'READING', label: '📄 Reading / Framework' },
  { value: 'GRADED_ASSIGNMENT', label: '✏️ Graded Assignment' },
];

const LESSON_TYPE_MODAL_OPTIONS = [
  { value: 'VIDEO', label: 'Video Masterclass' },
  { value: 'FIELD_CASE_STUDY', label: 'Field Case Study' },
  { value: 'QUIZ', label: 'Knowledge Check / Quiz' },
  { value: 'READING', label: 'Framework & Reading' },
  { value: 'GRADED_ASSIGNMENT', label: 'Graded Assignment' },
];

const BILLING_MODEL_OPTIONS = [
  { value: 'One-time payment (self-paced)', label: 'One-time payment (self-paced)' },
  { value: 'Subscription pass (coming soon)', label: 'Subscription pass (coming soon)' },
];

const CERTIFICATE_STANDARD_OPTIONS = [
  { value: 'BLOCKCHAIN', label: 'Blockchain-verified (Recommended)' },
  { value: 'VORA', label: 'VORA Verified Certificate' },
  { value: 'NONE', label: 'No Certificate' },
];

const CPD_ACCREDITATION_OPTIONS = [
  { value: 'yes', label: 'Apply for CPD Accreditation' },
  { value: 'no', label: 'Non-accredited' },
];

const ENROLLMENT_MODE_OPTIONS = [
  { value: 'Open enrollment', label: 'Open enrollment' },
  { value: 'Application review required', label: 'Application review required' },
];

const DELIVERY_MODE_OPTIONS = [
  { value: 'Self-paced (always accessible)', label: 'Self-paced (always accessible)' },
  { value: 'Cohort-scheduled', label: 'Cohort-scheduled' },
];

const DISCUSSION_FORUM_OPTIONS = [
  { value: 'Cohort Forum Enabled', label: 'Cohort Forum Enabled' },
  { value: 'Disabled', label: 'Disabled' },
];

const PEER_REVIEW_OPTIONS = [
  { value: 'Mentor Review Required', label: 'Mentor Review Required' },
  { value: 'Self-assessed', label: 'Self-assessed' },
];

const FORMATS: Array<{
  id: CourseFormat;
  name: string;
  icon: string;
  desc: string;
  recommended?: boolean;
}> = [
  {
    id: 'VIDEO_MASTERCLASS',
    name: 'Video Masterclass',
    icon: '🎬',
    desc: 'High-production recorded video lessons with field case studies and knowledge checks. CPD accreditation eligible.',
    recommended: true,
  },
  {
    id: 'HYBRID',
    name: 'Hybrid Masterclass',
    icon: '📚',
    desc: 'Blend of high-impact video lectures and structured policy readings, frameworks, and practical assignments.',
  },
  {
    id: 'COHORT_BASED',
    name: 'Cohort-Based Experience',
    icon: '👥',
    desc: 'Fixed-schedule group learning with live mentor sessions, collaborative case breakouts, and capstone presentation.',
  },
  {
    id: 'CASE_STUDY_SERIES',
    name: 'Case Study Series',
    icon: '🌍',
    desc: 'Immersive field scenarios simulating real institutional dilemmas in ministry, NGO, and donor settings.',
  },
  {
    id: 'WORKSHOP_SPRINT',
    name: 'Workshop / Sprint',
    icon: '🔬',
    desc: 'Intensive tool-specific sprint focused on a single execution framework or technical method.',
  },
  {
    id: 'WRITTEN_TEXT',
    name: 'Executive Frameworks',
    icon: '📝',
    desc: 'Deep-dive structured readings, policy briefings, and analytical assignments. No video required.',
  },
];

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeCourseId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Active Course ID
  const [courseId, setCourseId] = useState<string | null>(routeCourseId || null);

  // Queries & Mutations
  const {
    data: builderData,
    refetch: refetchBuilder,
  } = useCourseBuilder(courseId || undefined);

  const createDraftMutation = useCreateDraftCourse();
  const patchCourseMutation = usePatchCourse();
  const uploadMediaMutation = useUploadCourseMedia();
  const createModuleMutation = useCreateModule();
  const patchModuleMutation = usePatchModule();
  const deleteModuleMutation = useDeleteModule();
  const createLessonMutation = useCreateLesson();
  const patchLessonMutation = usePatchLesson();
  const deleteLessonMutation = useDeleteLesson();
  const publishMutation = usePublishCourseBuilder();
  const unpublishMutation = useUnpublishCourseBuilder();

  const instructorName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.title ? user.title + ' ' : ''}${user.firstName} ${user.lastName}`;
    }
    return 'Dr. Adesina Oluwatobi';
  }, [user]);

  // Active Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [language, setLanguage] = useState('English');
  const [prerequisites, setPrerequisites] = useState('');
  const [tags, setTags] = useState<string[]>(['Global Health', 'WHO', 'Health Policy']);
  const [tagInput, setTagInput] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([
    'Design context-appropriate health financing strategies for resource-limited settings',
  ]);

  const [format, setFormat] = useState<CourseFormat>('VIDEO_MASTERCLASS');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailFileName, setThumbnailFileName] = useState<string>('');
  const [thumbnailS3Key, setThumbnailS3Key] = useState<string | null>(null);
  const [promoVideoFileName, setPromoVideoFileName] = useState<string>('');
  const [promoVideoS3Key, setPromoVideoS3Key] = useState<string | null>(null);

  const [modules, setModules] = useState<BuilderModule[]>([]);

  // Pricing
  const [basePrice, setBasePrice] = useState<string>('40');
  const [enablePppPricing, setEnablePppPricing] = useState<boolean>(true);
  const [pricingModel, setPricingModel] = useState('One-time payment (self-paced)');

  // Pricing preview query (tier1Price param)
  const parsedPrice = parseFloat(basePrice) || 0;
  const {
    data: pricingPreviewData,
    isLoading: isPricingLoading,
    isError: isPricingError,
  } = usePricingPreview(parsedPrice);

  // Real response JSON consumption (zero hardcoded fallback math)
  const normalizedPricingTiers = useMemo(() => {
    if (!pricingPreviewData) return [];

    if (Array.isArray(pricingPreviewData.tiers)) {
      return pricingPreviewData.tiers.map((tier: any, idx: number) => {
        const price = tier.discountedPrice ?? tier.price ?? tier.amount ?? tier.originalPrice ?? 0;
        const currency = tier.currency || pricingPreviewData.currency || pricingPreviewData.baseCurrency || 'USD';
        const label = tier.name || tier.tierName || tier.label || tier.countryName || (idx === 0 ? 'High Income' : idx === 1 ? 'Middle Income' : 'LMIC');
        const icon = idx === 0 ? '🌍' : idx === 1 ? '🌏' : '🌱';
        const sub = tier.countryName && tier.countryName !== label ? `${tier.countryName} (${currency})` : tier.countries || tier.description || currency;

        return {
          id: tier.countryCode || tier.id || String(idx),
          badge: `${icon} ${label}`,
          priceDisplay: typeof price === 'number' ? `$${price}` : `${currency} ${price}`,
          subtext: sub,
        };
      });
    }

    if (Array.isArray(pricingPreviewData)) {
      return (pricingPreviewData as any[]).map((tier: any, idx: number) => {
        const price = tier.discountedPrice ?? tier.price ?? tier.amount ?? tier.originalPrice ?? 0;
        const currency = tier.currency || 'USD';
        const label = tier.name || tier.tierName || tier.label || `Tier ${idx + 1}`;
        const icon = idx === 0 ? '🌍' : idx === 1 ? '🌏' : '🌱';
        return {
          id: tier.id || String(idx),
          badge: `${icon} ${label}`,
          priceDisplay: typeof price === 'number' ? `$${price}` : `${currency} ${price}`,
          subtext: tier.countryName || tier.countries || currency,
        };
      });
    }

    if (pricingPreviewData.tiers && typeof pricingPreviewData.tiers === 'object') {
      return Object.entries(pricingPreviewData.tiers).map(([key, val]: [string, any], idx) => {
        const price = typeof val === 'number' ? val : (val.discountedPrice ?? val.price ?? val.amount ?? 0);
        const currency = typeof val === 'object' && val.currency ? val.currency : (pricingPreviewData.currency || 'USD');
        const label = typeof val === 'object' && val.label ? val.label : key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        const icon = idx === 0 ? '🌍' : idx === 1 ? '🌏' : '🌱';
        const sub = typeof val === 'object' && val.examples ? val.examples : (typeof val === 'object' && val.countries ? val.countries : (typeof val === 'object' && val.countryName ? `${val.countryName} (${currency})` : currency));

        return {
          id: key,
          badge: `${icon} ${label}`,
          priceDisplay: typeof price === 'number' ? `$${price}` : `${currency} ${price}`,
          subtext: sub,
        };
      });
    }

    return [];
  }, [pricingPreviewData]);

  // Certificate & CPD
  const [certificateTemplate, setCertificateTemplate] = useState<CertificateTemplate>('BLOCKCHAIN');
  const [isCpdAccredited, setIsCpdAccredited] = useState<boolean>(true);
  const [contactHours, setContactHours] = useState<string>('8.3');
  const [cpdBody, setCpdBody] = useState<string>('VORA Global Health CPD Board');

  // Step 6: Settings (Unpersisted / local with Coming Soon badge)
  const [enrollmentMode, setEnrollmentMode] = useState('Open enrollment');
  const [deliveryMode, setDeliveryMode] = useState('Self-paced (always accessible)');
  const [discussionForum, setDiscussionForum] = useState('Enabled');
  const [peerReview, setPeerReview] = useState('Required for certificate');
  const [seoSlugPreview, setSeoSlugPreview] = useState('');

  // Status & Validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Lesson modal state
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lesson: BuilderLesson;
  } | null>(null);

  // Gap intelligence banner
  const [gapBannerInfo, setGapBannerInfo] = useState<{ title: string; desc: string } | null>(null);

  // Refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const promoVideoInputRef = useRef<HTMLInputElement>(null);
  const topContainerRef = useRef<HTMLDivElement>(null);
  const hasLoadedInitialBuilderData = useRef(false);

  // Hydrate from builderData
  useEffect(() => {
    if (builderData && !hasLoadedInitialBuilderData.current) {
      hasLoadedInitialBuilderData.current = true;
      if (builderData.title) setTitle(builderData.title);
      if (builderData.subtitle) setSubtitle(builderData.subtitle);
      if (builderData.description) setDescription(builderData.description);
      if (builderData.category) setCategory(builderData.category);
      if (builderData.difficulty) setDifficultyLevel(builderData.difficulty);
      if (builderData.language) setLanguage(builderData.language);
      if (builderData.format) setFormat(builderData.format);
      if (builderData.coverImageS3Key) {
        setThumbnailS3Key(builderData.coverImageS3Key);
        setThumbnailPreview(
          builderData.coverImageS3Key.startsWith('http')
            ? builderData.coverImageS3Key
            : `https://vora-media-bucket.s3.amazonaws.com/${builderData.coverImageS3Key}`
        );
      }
      if (builderData.promotionalVideoS3Key) {
        setPromoVideoS3Key(builderData.promotionalVideoS3Key);
        setPromoVideoFileName('Uploaded Promotional Video');
      }
      if ((builderData as any).tier1Price != null) {
        setBasePrice(String((builderData as any).tier1Price));
      } else if (builderData.priceAmount != null) {
        setBasePrice(String(builderData.priceAmount));
      }
      if (builderData.enablePppPricing != null) setEnablePppPricing(builderData.enablePppPricing);
      if (builderData.certificateTemplate) setCertificateTemplate(builderData.certificateTemplate);
      if (builderData.isCpdAccredited != null) setIsCpdAccredited(builderData.isCpdAccredited);
      if (builderData.cpdCredits != null) setContactHours(String(builderData.cpdCredits));
      if (builderData.cpdBody) setCpdBody(builderData.cpdBody);
      if (builderData.seoSlugPreview) setSeoSlugPreview(builderData.seoSlugPreview);
      if (builderData.modules) setModules(builderData.modules);
    } else if (builderData?.modules) {
      setModules(builderData.modules);
    }
  }, [builderData]);

  // Load from Gap parameter
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const topicParam = searchParams.get('topic');

    if (fromParam === 'gap' && topicParam && GAP_TOPICS[topicParam]) {
      const gap = GAP_TOPICS[topicParam];
      setGapBannerInfo({ title: gap.title, desc: gap.desc });
      setTitle(gap.title);
      setDescription(gap.desc);
      setTags(gap.tags);
      setCategory('Global Health Policy');
      setDifficultyLevel('Advanced');
    }
  }, [searchParams]);

  // Current PATCH Payload for debounced autosave
  const currentPatchPayload = useMemo(() => {
    return {
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      category: category || undefined,
      difficulty: difficultyLevel || undefined,
      language: language || undefined,
      format,
      tier1Price: parsedPrice,
      certificateTemplate,
      isCpdAccredited,
      cpdCredits: parseFloat(contactHours) || 0,
      cpdBody,
    };
  }, [
    title,
    subtitle,
    description,
    category,
    difficultyLevel,
    language,
    format,
    parsedPrice,
    certificateTemplate,
    isCpdAccredited,
    contactHours,
    cpdBody,
  ]);

  // Debounced Autosave Hook
  const { autosaveStatus, flushSave } = useCourseBuilderAutosave({
    courseId,
    payload: currentPatchPayload,
    enabled: Boolean(courseId && title.trim()),
    debounceMs: 1500,
  });

  const parsedHours = parseFloat(contactHours) || 0;
  const calculatedCEU = parsedHours > 0 ? (parsedHours / 10).toFixed(1) : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollContainer = document.querySelector('main.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const changeStep = async (step: StepId) => {
    if (courseId) {
      await flushSave();
    }
    setCurrentStep(step);
    scrollToTop();
  };

  // Ensure draft exists on server
  const ensureDraftCourse = useCallback(async (): Promise<string | null> => {
    if (courseId) return courseId;

    if (!title.trim()) {
      toast.error('Please enter at least a course title to continue.');
      setCurrentStep(1);
      return null;
    }

    try {
      const created = await createDraftMutation.mutateAsync({
        title: title.trim(),
        format,
        tier1Price: parsedPrice || 0,
      });

      if (created?.id) {
        setCourseId(created.id);
        toast.success('Course draft created on server.', { icon: '✨' });
        window.history.replaceState(null, '', `/courses/${created.id}/edit`);
        return created.id;
      }
    } catch (err: any) {
      console.error('[CreateCourse] Error creating draft:', err);
      toast.error(err?.message || 'Failed to initialize course draft.');
    }
    return null;
  }, [courseId, title, format, parsedPrice, createDraftMutation]);

  // Tags helper
  const commitTag = (valueToCommit?: string) => {
    const raw = typeof valueToCommit === 'string' ? valueToCommit : tagInput;
    const trimmed = raw.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (tagInput.trim()) {
        e.preventDefault();
        commitTag();
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Learning Outcomes helper
  const handleAddOutcome = () => {
    setOutcomes([...outcomes, '']);
  };

  const handleOutcomeChange = (index: number, val: string) => {
    const next = [...outcomes];
    next[index] = val;
    setOutcomes(next);
    if (formErrors.outcomes) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.outcomes;
        return copy;
      });
    }
  };

  const handleRemoveOutcome = (index: number) => {
    if (outcomes.length <= 1) {
      setOutcomes(['']);
      return;
    }
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  // Thumbnail File Handler
  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG or PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB.');
      return;
    }

    setThumbnailFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);

    try {
      const activeId = await ensureDraftCourse();
      if (!activeId) return;

      const uploadToast = toast.loading('Uploading course thumbnail…');
      const uploaded = await uploadMediaMutation.mutateAsync(file);

      if (uploaded?.s3Key) {
        setThumbnailS3Key(uploaded.s3Key);
        await patchCourseMutation.mutateAsync({
          courseId: activeId,
          payload: { coverImageS3Key: uploaded.s3Key },
        });
        toast.dismiss(uploadToast);
        toast.success('Course thumbnail saved.', { icon: '🖼️' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload thumbnail.');
    }
  };

  // Promo Video File Handler
  const handlePromoVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file (MP4).');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video size must be less than 500 MB.');
      return;
    }

    setPromoVideoFileName(file.name);

    try {
      const activeId = await ensureDraftCourse();
      if (!activeId) return;

      const uploadToast = toast.loading('Uploading promo video…');
      const uploaded = await uploadMediaMutation.mutateAsync(file);

      if (uploaded?.s3Key) {
        setPromoVideoS3Key(uploaded.s3Key);
        await patchCourseMutation.mutateAsync({
          courseId: activeId,
          payload: { promotionalVideoS3Key: uploaded.s3Key },
        });
        toast.dismiss(uploadToast);
        toast.success('Promo video saved.', { icon: '🎬' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload promo video.');
    }
  };

  // Curriculum Modules & Lessons
  const handleAddModule = async () => {
    const activeId = await ensureDraftCourse();
    if (!activeId) return;

    const nextOrder = modules.length;
    const moduleTitle = `Module ${nextOrder + 1}: `;

    try {
      const createdMod = await createModuleMutation.mutateAsync({
        courseId: activeId,
        payload: {
          title: moduleTitle,
          orderIndex: nextOrder,
        },
      });

      if (createdMod?.id) {
        await createLessonMutation.mutateAsync({
          courseId: activeId,
          moduleId: createdMod.id,
          payload: {
            title: 'Welcome & Foundations',
            contentType: 'VIDEO',
            durationMinutes: 15,
            orderIndex: 0,
          },
        });
      }

      toast.success('New module added.');
      refetchBuilder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add module.');
    }
  };

  const handleModuleTitleBlur = async (moduleId: string, newTitle: string) => {
    if (!courseId) return;
    try {
      await patchModuleMutation.mutateAsync({
        courseId,
        moduleId,
        payload: { title: newTitle },
      });
    } catch (err: any) {
      console.error('Failed to update module title:', err);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (modules.length <= 1) {
      toast.error('Your course must include at least one curriculum module.');
      return;
    }
    if (!courseId) return;

    try {
      await deleteModuleMutation.mutateAsync({
        courseId,
        moduleId,
      });
      toast.success('Module removed.');
      refetchBuilder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete module.');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!courseId) return;
    const targetModule = modules.find((m) => m.id === moduleId);
    const nextOrder = targetModule?.lessons?.length || 0;

    try {
      await createLessonMutation.mutateAsync({
        courseId,
        moduleId,
        payload: {
          title: 'New Lesson',
          contentType: 'VIDEO',
          durationMinutes: 15,
          orderIndex: nextOrder,
        },
      });
      toast.success('Lesson added.');
      refetchBuilder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add lesson.');
    }
  };

  const handleLessonUpdate = async (
    moduleId: string,
    lessonId: string,
    updates: Partial<BuilderLesson>
  ) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((les) =>
            les.id === lessonId ? { ...les, ...updates } : les
          ),
        };
      })
    );

    if (!courseId) return;
    try {
      await patchLessonMutation.mutateAsync({
        courseId,
        moduleId,
        lessonId,
        payload: updates,
      });
    } catch (err: any) {
      console.error('Failed to update lesson:', err);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!courseId) return;
    try {
      await deleteLessonMutation.mutateAsync({
        courseId,
        moduleId,
        lessonId,
      });
      toast.success('Lesson deleted.');
      refetchBuilder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete lesson.');
    }
  };

  // Step Validation
  const validateStep = (step: StepId): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim()) {
        errors.title = 'Course title is required';
      } else if (title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters long';
      } else if (title.trim().length > 100) {
        errors.title = 'Title must not exceed 100 characters';
      }

      if (!description.trim()) {
        errors.description = 'Course description is required';
      } else if (description.trim().length < 20) {
        errors.description = 'Description should be at least 20 characters long';
      }

      if (!category) {
        errors.category = 'Please select a course category';
      }
      if (!difficultyLevel) {
        errors.difficultyLevel = 'Please select a difficulty level';
      }

      const validOutcomes = outcomes.filter((o) => o.trim().length > 0);
      if (validOutcomes.length === 0) {
        errors.outcomes = 'Please provide at least one learning outcome';
      }
    } else if (step === 2) {
      if (!format) {
        errors.format = 'Please select a course format';
      }
    } else if (step === 3) {
      if (modules.length === 0) {
        errors.curriculum = 'Please add at least one curriculum module';
      } else {
        let hasEmptyModTitle = false;
        let hasEmptyLessonTitle = false;
        let totalLessonsCount = 0;

        modules.forEach((mod) => {
          if (!mod.title.trim()) hasEmptyModTitle = true;
          totalLessonsCount += (mod.lessons || []).length;
          (mod.lessons || []).forEach((les) => {
            if (!les.title.trim()) hasEmptyLessonTitle = true;
          });
        });

        if (hasEmptyModTitle) {
          errors.curriculum = 'All modules must have a title';
        } else if (totalLessonsCount === 0) {
          errors.curriculum = 'Please add at least one lesson to your modules';
        } else if (hasEmptyLessonTitle) {
          errors.curriculum = 'All lessons must have a title';
        }
      }
    } else if (step === 4) {
      if (basePrice === '' || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
        errors.basePrice = 'Please enter a valid base price (0 or greater)';
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 1 && !courseId) {
      const activeId = await ensureDraftCourse();
      if (!activeId) return;
    } else if (courseId) {
      await flushSave();
    }

    if (currentStep < 6) {
      changeStep((currentStep + 1) as StepId);
    }
  };

  const handlePrevStep = async () => {
    if (courseId) {
      await flushSave();
    }
    if (currentStep > 1) {
      changeStep((currentStep - 1) as StepId);
    }
  };

  // Pre-publish checklist driven by backend
  const backendChecklist = builderData?.publishChecklist;
  const isPublishReady = backendChecklist
    ? backendChecklist.ready
    : title.trim().length >= 3 &&
      description.trim().length >= 20 &&
      Boolean(format) &&
      modules.length > 0 &&
      parsedPrice >= 0;

  // Step Completion Indicators for Left Nav
  const isStepDone = (stepId: StepId): boolean => {
    if (backendChecklist?.items) {
      const stepItems = backendChecklist.items.filter((item) => item.stepNumber === stepId);
      if (stepItems.length > 0) {
        return stepItems.every((item) => item.passed);
      }
    }
    if (stepId === 1) return title.trim().length >= 3 && description.trim().length >= 20 && Boolean(category) && Boolean(difficultyLevel);
    if (stepId === 2) return Boolean(format);
    if (stepId === 3) return modules.length > 0 && modules.some((m) => (m.lessons || []).length > 0);
    if (stepId === 4) return parsedPrice >= 0;
    if (stepId === 5) return Boolean(calculatedCEU);
    if (stepId === 6) return isPublishReady;
    return false;
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    const activeId = await ensureDraftCourse();
    if (!activeId) return;

    try {
      await flushSave();
      toast.success('Course draft saved.', { icon: '💾' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save draft.');
    }
  };

  // Open Publish Modal
  const handleOpenPublish = () => {
    if (!isPublishReady) {
      toast.error('Please complete all requirements before publishing.');
      return;
    }
    setIsPublishModalOpen(true);
  };

  // Final Publish Handler
  const handlePublishCourse = async () => {
    if (!courseId) return;
    setIsPublishModalOpen(false);

    try {
      await flushSave();
      await publishMutation.mutateAsync(courseId);
      toast.success('Course published successfully! Your curriculum is now live.', {
        duration: 4000,
        icon: '🎉',
      });

      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err?.message || 'Failed to publish course.');
    }
  };

  // Unpublish Handler
  const handleUnpublishCourse = async () => {
    if (!courseId) return;
    try {
      await unpublishMutation.mutateAsync(courseId);
      toast.success('Course unpublished. Now in DRAFT state.', { icon: '📦' });
      refetchBuilder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unpublish course.');
    }
  };

  // Brand Status Chip
  const statusLabel = useMemo(() => {
    if (builderData?.status === 'PUBLISHED') return 'Published';
    if (autosaveStatus === 'saving') return 'Saving…';
    if (autosaveStatus === 'error') return 'Save failed';
    if (courseId || autosaveStatus === 'saved') return 'Draft saved';
    return 'Unsaved';
  }, [builderData?.status, autosaveStatus, courseId]);

  const statusBadgeClass = useMemo(() => {
    if (builderData?.status === 'PUBLISHED') {
      return 'bg-[#0047CC]/10 text-[#0047CC] border-[#0047CC]/30 font-semibold';
    }
    if (autosaveStatus === 'saving') {
      return 'bg-[#EBF6FF] text-[#0047CC] border-[#0047CC]/40 animate-pulse font-semibold';
    }
    if (autosaveStatus === 'error') {
      return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    }
    if (courseId || autosaveStatus === 'saved') {
      return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
    return 'bg-slate-50 text-slate-500 border-slate-200 font-medium';
  }, [builderData?.status, autosaveStatus, courseId]);

  return (
    <div
      ref={topContainerRef}
      className="min-h-full bg-[#F8FAFC] text-[#1E293B] font-['Raleway',sans-serif] flex flex-col"
    >
      {/* ── TOP HEADER (CLEAN VORA BRANDING) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#64748B] min-w-0">
          <Link
            to="/courses"
            className="hover:text-[#0047CC] font-semibold transition-colors shrink-0 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Courses
          </Link>
          <span className="text-[#CBD5E1]">/</span>
          <span className="font-bold text-[#0F172A] truncate max-w-[200px] sm:max-w-md">
            {title.trim() || 'New Course'}
          </span>
          {courseId && (
            <span className="hidden md:inline text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
              ID: {courseId.slice(0, 8)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Badge */}
          <span
            className={`text-xs px-3 py-1 rounded-full border transition-all ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>

          {/* Preview Action */}
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                toast('Please provide a course title to preview.', { icon: 'ℹ️' });
                return;
              }
              setIsPreviewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0047CC] hover:bg-[#EBF6FF] rounded-lg transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="hidden sm:inline">Learner Preview</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-bold bg-white text-[#334155] border border-[#CBD5E1] hover:border-[#0047CC] hover:text-[#0047CC] hover:bg-[#F8FAFC] rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>

          {/* Publish Action (VORA Brand Blue) */}
          {builderData?.status === 'PUBLISHED' ? (
            <button
              type="button"
              onClick={handleUnpublishCourse}
              disabled={unpublishMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white rounded-full transition-all cursor-pointer shadow-xs"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenPublish}
              disabled={!isPublishReady}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 text-xs font-bold bg-[#0047CC] hover:bg-[#0037a3] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" />
              </svg>
              Publish Course
            </button>
          )}
        </div>
      </header>

      {/* ── BUILDER WORKSPACE ── */}
      <div className="flex-1 flex w-full">
        {/* ── LEFT STEPPER NAVIGATION ── */}
        <aside className="hidden lg:block w-72 bg-white border-r border-[#E2E8F0] py-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto shrink-0 select-none">
          <div className="px-6 pb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0047CC]">
              Course Authoring
            </span>
            <h3 className="text-sm font-bold text-[#0F172A] mt-0.5">Wizard Navigation</h3>
          </div>

          <div className="space-y-1 px-3">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isDone = isStepDone(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => changeStep(step.id)}
                  className={`w-full flex items-start gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#EBF6FF] text-[#0047CC] shadow-xs'
                      : 'hover:bg-[#F8FAFC] text-[#475569]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isDone
                        ? 'bg-[#0047CC] text-white shadow-2xs'
                        : isCurrent
                        ? 'border-2 border-[#0047CC] text-[#0047CC] bg-white font-extrabold'
                        : 'border border-[#CBD5E1] text-[#94A3B8] bg-[#F8FAFC]'
                    }`}
                  >
                    {isDone ? '✓' : step.id}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div
                      className={`text-xs font-bold leading-tight truncate ${
                        isCurrent ? 'text-[#0047CC]' : 'text-[#1E293B] group-hover:text-[#0047CC]'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {step.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics in Sidebar */}
          <div className="mt-8 mx-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
              Course Summary
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#475569]">
                <span>Modules</span>
                <span className="font-bold text-[#0F172A]">{modules.length}</span>
              </div>
              <div className="flex items-center justify-between text-[#475569]">
                <span>Total Lessons</span>
                <span className="font-bold text-[#0F172A]">
                  {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#475569]">
                <span>Format</span>
                <span className="font-semibold text-[#0047CC]">
                  {FORMATS.find((f) => f.id === format)?.name || 'Masterclass'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <span>Checklist</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPublishReady
                      ? 'bg-blue-100 text-[#0047CC]'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPublishReady ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN WIZARD CONTENT ── */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto flex flex-col justify-between">
          <div>
            {/* Mobile Horizontal Stepper */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide border-b border-[#E2E8F0]">
              {STEPS.map((st) => {
                const isCurrent = currentStep === st.id;
                const isDone = isStepDone(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => changeStep(st.id)}
                    className={`flex flex-col items-center gap-1 min-w-[70px] px-2 py-1.5 rounded-xl text-xs shrink-0 cursor-pointer ${
                      isCurrent ? 'bg-[#EBF6FF] text-[#0047CC]' : 'text-[#64748B]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-[#0047CC] text-white'
                          : isCurrent
                          ? 'border-2 border-[#0047CC] text-[#0047CC] bg-white'
                          : 'border border-[#CBD5E1] text-[#94A3B8]'
                      }`}
                    >
                      {isDone ? '✓' : st.id}
                    </span>
                    <span className="text-[11px] font-semibold whitespace-nowrap">{st.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Gap Intelligence Banner (if loaded from gap query) */}
            {gapBannerInfo && currentStep === 1 && (
              <div className="bg-gradient-to-r from-[#0F1E36] via-[#1A2E5A] to-[#0047CC] rounded-2xl p-4 sm:p-5 text-white mb-6 shadow-sm flex items-start sm:items-center gap-3.5 border border-blue-900/30">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                    Curriculum Gap Intelligence
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mb-0.5">
                    {gapBannerInfo.title}
                  </div>
                  <div className="text-xs text-blue-100/90 leading-relaxed">
                    {gapBannerInfo.desc}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 1: BASICS
            ══════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 1 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Course Basics &amp; Overview
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Set up the title, overview, and core positioning for learners and institutional buyers.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  {/* Course Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#1E293B]">
                        Course Title <span className="text-[#0047CC]">*</span>
                      </label>
                      <span className="text-[11px] text-[#94A3B8] font-mono">{title.length} / 100</span>
                    </div>
                    <input
                      id="titleInput"
                      type="text"
                      value={title}
                      maxLength={100}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formErrors.title) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.title;
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. Epidemiology in Crisis Response: Field Methods for Outbreak Control"
                      className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none transition-all ${
                        formErrors.title
                          ? 'border-rose-400 ring-2 ring-rose-100'
                          : 'border-[#CBD5E1] focus:border-[#0047CC] focus:ring-3 focus:ring-[#0047CC]/15'
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                      Executive Subtitle{' '}
                      <span className="text-[#64748B] font-normal text-[11px] ml-1">
                        One-line hook shown in search &amp; catalog cards
                      </span>
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Master the strategic frameworks for navigating complex health systems at national and global scale."
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0047CC] focus:ring-3 focus:ring-[#0047CC]/15 transition-all"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                      Full Description &amp; Scope <span className="text-[#0047CC]">*</span>
                    </label>
                    <textarea
                      id="descInput"
                      rows={5}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (formErrors.description) {
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.description;
                            return next;
                          });
                        }
                      }}
                      placeholder="Who is this course for? What strategic challenges will learners be equipped to solve? Which real-world field experiences inform this syllabus?"
                      className={`w-full bg-white border rounded-xl p-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none transition-all leading-relaxed ${
                        formErrors.description
                          ? 'border-rose-400 ring-2 ring-rose-100'
                          : 'border-[#CBD5E1] focus:border-[#0047CC] focus:ring-3 focus:ring-[#0047CC]/15'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Category & Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Primary Category <span className="text-[#0047CC]">*</span>
                      </label>
                      <Select
                        hideLabel
                        placeholder="Select category…"
                        value={category}
                        options={CATEGORY_OPTIONS}
                        error={!!formErrors.category}
                        helperText={formErrors.category}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (formErrors.category) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.category;
                              return copy;
                            });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Target Seniority Level <span className="text-[#0047CC]">*</span>
                      </label>
                      <Select
                        hideLabel
                        placeholder="Select level…"
                        value={difficultyLevel}
                        options={DIFFICULTY_OPTIONS}
                        error={!!formErrors.difficultyLevel}
                        helperText={formErrors.difficultyLevel}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) => {
                          setDifficultyLevel(e.target.value);
                          if (formErrors.difficultyLevel) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.difficultyLevel;
                              return copy;
                            });
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Language & Prerequisites */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Instruction Language</label>
                      <Select
                        hideLabel
                        placeholder="Select language…"
                        value={language}
                        options={LANGUAGE_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) => setLanguage(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Prerequisites <span className="text-[#64748B] font-normal text-[11px] ml-1">Optional</span>
                      </label>
                      <input
                        type="text"
                        value={prerequisites}
                        onChange={(e) => setPrerequisites(e.target.value)}
                        placeholder="e.g. 3+ years field experience, MPH or equivalent…"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0047CC] transition-all"
                      />
                    </div>
                  </div>

                  {/* Skills & Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#1E293B]">
                        Competency Tags
                      </label>
                      <span className="text-[11px] text-[#64748B]">
                        Press Enter or comma to add
                      </span>
                    </div>
                    <div
                      className="bg-white border border-[#CBD5E1] focus-within:border-[#0047CC] focus-within:ring-2 focus-within:ring-[#0047CC]/10 rounded-xl p-2.5 flex flex-wrap gap-2 items-center min-h-[48px] transition-all cursor-text"
                      onClick={() => document.getElementById('tagInputEl')?.focus()}
                    >
                      {tags.map((tg) => (
                        <Tag
                          key={tg}
                          label={tg}
                          variant="blue"
                          onRemove={() => handleRemoveTag(tg)}
                          className="border border-[#BDD9FF] text-xs font-semibold py-1 px-3 shrink-0"
                        />
                      ))}
                      <div className="flex-1 flex items-center min-w-[180px] gap-1.5">
                        <input
                          id="tagInputEl"
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          onBlur={() => {
                            if (tagInput.trim()) {
                              commitTag();
                            }
                          }}
                          placeholder={tags.length === 0 ? "Type a skill/tag and press Enter…" : "Add more…"}
                          className="bg-transparent border-none text-xs text-[#0F172A] outline-none flex-1 py-1 placeholder:text-[#94A3B8]"
                        />
                        {tagInput.trim() && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              commitTag();
                            }}
                            className="text-[11px] font-bold text-white bg-[#0047CC] hover:bg-[#003d99] px-2.5 py-0.5 rounded-full cursor-pointer transition-all shrink-0 active:scale-95"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">
                      Target Learning Outcomes <span className="text-[#0047CC]">*</span>
                    </label>
                    <p className="text-xs text-[#64748B] mb-3">
                      List observable capabilities learners will gain after completing this curriculum.
                    </p>

                    <div className="space-y-2.5">
                      {outcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                            placeholder="e.g. Design context-appropriate health financing strategies for resource-limited settings"
                            className="flex-1 bg-white border border-[#CBD5E1] focus:border-[#0047CC] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOutcome(idx)}
                            title="Remove outcome"
                            className="p-2.5 text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {formErrors.outcomes && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.outcomes}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleAddOutcome}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-[#CBD5E1] hover:border-[#0047CC] text-[#64748B] hover:text-[#0047CC] hover:bg-[#EBF6FF] rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add learning outcome
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 2: FORMAT & MEDIA
            ══════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 2 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Delivery Format &amp; Media Assets
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Select the structure of your learning experience and attach branded visual materials.
                  </p>
                </div>

                {/* Format Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-3">
                    Course Delivery Architecture <span className="text-[#0047CC]">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {FORMATS.map((fmt) => {
                      const isSelected = format === fmt.id;
                      return (
                        <div
                          key={fmt.id}
                          onClick={() => setFormat(fmt.id)}
                          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#0047CC] bg-[#F0F6FF] shadow-xs'
                              : 'border-[#E2E8F0] hover:border-blue-300 hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#0047CC] text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}

                          <div>
                            {fmt.recommended && (
                              <span className="inline-block bg-[#EBF6FF] text-[#0047CC] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider mb-2.5 border border-[#0047CC]/20">
                                Recommended
                              </span>
                            )}
                            <span className="text-2xl block mb-2">{fmt.icon}</span>
                            <h4 className="text-sm font-bold text-[#0F172A] mb-1">{fmt.name}</h4>
                            <p className="text-xs text-[#64748B] leading-relaxed">{fmt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Media Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Thumbnail */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                    <label className="block text-xs font-bold text-[#1E293B] mb-2">
                      Course Cover Thumbnail <span className="text-[#0047CC]">*</span>
                    </label>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleThumbnailSelect}
                    />
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0047CC] hover:bg-[#F0F6FF] rounded-xl p-6 text-center cursor-pointer transition-all bg-[#F8FAFC]"
                    >
                      {thumbnailPreview ? (
                        <div>
                          <img
                            src={thumbnailPreview}
                            alt="Course thumbnail"
                            className="w-full h-32 object-cover rounded-lg mb-2 shadow-2xs"
                          />
                          <div className="text-xs font-semibold text-[#0F172A] truncate">
                            {thumbnailFileName || 'Cover image attached'}
                          </div>
                          <span className="text-[11px] text-[#0047CC] font-bold underline mt-1 inline-block">
                            Change image
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 bg-[#EBF6FF] text-[#0047CC] rounded-xl flex items-center justify-center mx-auto mb-2.5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                          <div className="text-sm font-bold text-[#1E293B] mb-0.5">Upload Course Banner</div>
                          <div className="text-[11px] text-[#64748B]">JPG, PNG or WebP · Up to 5 MB</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promo Video */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
                    <label className="block text-xs font-bold text-[#1E293B] mb-2">
                      Promotional Teaser Video
                    </label>
                    <input
                      ref={promoVideoInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={handlePromoVideoSelect}
                    />
                    <div
                      onClick={() => promoVideoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0047CC] hover:bg-[#F0F6FF] rounded-xl p-6 text-center cursor-pointer transition-all bg-[#F8FAFC]"
                    >
                      {promoVideoFileName || promoVideoS3Key ? (
                        <div>
                          <div className="w-12 h-12 bg-[#EBF6FF] text-[#0047CC] rounded-xl flex items-center justify-center mx-auto mb-2.5 font-bold">
                            🎬
                          </div>
                          <div className="text-xs font-bold text-[#0F172A] truncate mb-1">
                            {promoVideoFileName || 'Video attached'}
                          </div>
                          <span className="text-[11px] text-[#0047CC] font-bold underline inline-block">
                            Change video
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 bg-[#EBF6FF] text-[#0047CC] rounded-xl flex items-center justify-center mx-auto mb-2.5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                          </div>
                          <div className="text-sm font-bold text-[#1E293B] mb-0.5">Upload 3-Minute Teaser</div>
                          <div className="text-[11px] text-[#64748B]">MP4 or WebM · Up to 500 MB</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 3: CURRICULUM
            ══════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 3 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Curriculum Architecture
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Build your modules and lessons. Assign content formats, durations, and resources.
                  </p>
                </div>

                {/* Modules Container */}
                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div
                      key={mod.id}
                      className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs"
                    >
                      {/* Module Header */}
                      <div className="flex items-center gap-3 px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <span className="text-xs font-mono font-bold text-[#0047CC] bg-[#EBF6FF] px-2 py-0.5 rounded-md">
                          0{modIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModules((prev) =>
                              prev.map((m) => (m.id === mod.id ? { ...m, title: val } : m))
                            );
                          }}
                          onBlur={(e) => handleModuleTitleBlur(mod.id, e.target.value)}
                          placeholder={`Module ${modIdx + 1} Title…`}
                          className="flex-1 bg-transparent border-none text-sm font-bold text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                        />
                        <span className="text-xs text-[#64748B] font-semibold">
                          {(mod.lessons || []).length} {(mod.lessons || []).length === 1 ? 'lesson' : 'lessons'}
                        </span>
                        <button
                          type="button"
                          title="Delete module"
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-[#94A3B8] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      {/* Module Body */}
                      <div className="p-4 space-y-2.5">
                        {(mod.lessons || []).map((les) => (
                          <div
                            key={les.id}
                            className="flex items-center gap-2.5 p-2.5 px-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-all"
                          >
                            {/* Type Dropdown */}
                            <div className="shrink-0 w-44 sm:w-48">
                              <Select
                                hideLabel
                                variant="compact"
                                value={les.contentType}
                                options={LESSON_TYPE_OPTIONS}
                                className="!bg-[#F8FAFC] !border-[#CBD5E1] !text-xs font-bold !text-[#1E293B] !rounded-lg"
                                onChange={(e) =>
                                  handleLessonUpdate(mod.id, les.id, {
                                    contentType: e.target.value as BuilderLessonContentType,
                                  })
                                }
                              />
                            </div>

                            {/* Lesson Title */}
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setModules((prev) =>
                                  prev.map((m) =>
                                    m.id === mod.id
                                      ? {
                                          ...m,
                                          lessons: m.lessons.map((l) =>
                                            l.id === les.id ? { ...l, title: val } : l
                                          ),
                                        }
                                      : m
                                  )
                                );
                              }}
                              onBlur={(e) =>
                                handleLessonUpdate(mod.id, les.id, { title: e.target.value })
                              }
                              placeholder="Lesson Title…"
                              className="flex-1 bg-transparent border-none text-xs text-[#0F172A] outline-none font-semibold placeholder:text-[#94A3B8]"
                            />

                            {/* Duration */}
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={les.durationMinutes || 15}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 1;
                                  setModules((prev) =>
                                    prev.map((m) =>
                                      m.id === mod.id
                                        ? {
                                            ...m,
                                            lessons: m.lessons.map((l) =>
                                              l.id === les.id ? { ...l, durationMinutes: val } : l
                                            ),
                                          }
                                        : m
                                    )
                                  );
                                }}
                                onBlur={(e) =>
                                  handleLessonUpdate(mod.id, les.id, {
                                    durationMinutes: parseInt(e.target.value, 10) || 15,
                                  })
                                }
                                className="w-14 text-center text-xs text-[#475569] border border-[#CBD5E1] rounded-lg px-1.5 py-1 outline-none font-mono"
                              />
                              <span className="text-[11px] text-[#64748B]">min</span>
                            </div>

                            {/* Edit content modal */}
                            <button
                              type="button"
                              title="Edit lesson details"
                              onClick={() => setEditingLesson({ moduleId: mod.id, lesson: les })}
                              className="p-1.5 text-[#64748B] hover:text-[#0047CC] hover:bg-[#EBF6FF] rounded-lg transition-colors cursor-pointer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>

                            {/* Remove lesson */}
                            <button
                              type="button"
                              title="Delete lesson"
                              onClick={() => handleDeleteLesson(mod.id, les.id)}
                              className="p-1.5 text-[#94A3B8] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddLesson(mod.id)}
                          className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-[#CBD5E1] hover:border-[#0047CC] hover:bg-[#F0F6FF] text-[#64748B] hover:text-[#0047CC] rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {formErrors.curriculum && (
                  <p className="text-xs text-rose-600 font-semibold">{formErrors.curriculum}</p>
                )}

                <button
                  type="button"
                  onClick={handleAddModule}
                  className="w-full py-3.5 px-4 border-2 border-dashed border-[#CBD5E1] hover:border-[#0047CC] hover:bg-[#F0F6FF] text-[#475569] hover:text-[#0047CC] rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Curriculum Module
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 4: PRICING & PPP
            ══════════════════════════════════════ */}
            {currentStep === 4 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 4 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Pricing &amp; Global Parity (PPP)
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Set your base baseline tuition. VORA's dynamic pricing engine computes equitable local pricing across international economies.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Base Price */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Tier 1 Baseline Price (USD) <span className="text-[#0047CC]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">
                          $
                        </span>
                        <input
                          id="basePriceInput"
                          type="number"
                          min="0"
                          value={basePrice}
                          onChange={(e) => {
                            setBasePrice(e.target.value);
                            if (formErrors.basePrice) {
                              setFormErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.basePrice;
                                return copy;
                              });
                            }
                          }}
                          placeholder="40"
                          className={`w-full bg-white border rounded-xl pl-9 pr-4 py-3 text-sm text-[#0F172A] font-semibold outline-none transition-all ${
                            formErrors.basePrice
                              ? 'border-rose-400'
                              : 'border-[#CBD5E1] focus:border-[#0047CC] focus:ring-3 focus:ring-[#0047CC]/15'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-1.5">
                        High Income Country (Tier 1) standard rate.
                      </p>
                    </div>

                    {/* Pricing Model */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">Billing Model</label>
                      <Select
                        hideLabel
                        value={pricingModel}
                        options={BILLING_MODEL_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) => setPricingModel(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Real Dynamic PPP Preview (Direct API JSON consumption, zero fallback math) */}
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                          Global Pricing Engine Breakdown
                        </h4>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Real-time localized price tiers computed by the VORA Pricing Engine
                        </p>
                      </div>
                      {isPricingLoading && (
                        <span className="text-[11px] font-bold text-[#0047CC] animate-pulse">
                          Fetching live rates…
                        </span>
                      )}
                    </div>

                    {isPricingLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 shadow-2xs animate-pulse"
                          >
                            <div className="h-3 w-24 bg-slate-200 rounded mb-2.5"></div>
                            <div className="h-7 w-20 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-slate-100 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : isPricingError ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700">
                        Unable to connect to VORA Pricing Engine. Please check your baseline price.
                      </div>
                    ) : normalizedPricingTiers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {normalizedPricingTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 shadow-2xs hover:border-[#0047CC] transition-colors"
                          >
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0047CC] mb-1.5">
                              {tier.badge}
                            </div>
                            <div className="text-2xl font-black text-[#0F172A]">
                              {tier.priceDisplay}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-1 truncate">
                              {tier.subtext}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl p-6 text-center text-xs text-[#64748B]">
                        Enter a baseline tuition above to compute equitable regional tiers.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 5: CERTIFICATE & CPD
            ══════════════════════════════════════ */}
            {currentStep === 5 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 5 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Credentials &amp; CPD Accreditation
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Configure institutional accreditation and digital certificate verification.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Certificate Standard
                      </label>
                      <Select
                        hideLabel
                        value={certificateTemplate}
                        options={CERTIFICATE_STANDARD_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) =>
                          setCertificateTemplate(e.target.value as CertificateTemplate)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        CPD Accreditation Status
                      </label>
                      <Select
                        hideLabel
                        value={isCpdAccredited ? 'yes' : 'no'}
                        options={CPD_ACCREDITATION_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A]"
                        onChange={(e) => setIsCpdAccredited(e.target.value === 'yes')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Estimated Contact Hours
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={contactHours}
                        onChange={(e) => setContactHours(e.target.value)}
                        placeholder="e.g. 8.3"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0047CC] transition-all"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1.5">
                        CEUs = contact hours ÷ 10 (University of Washington metric).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                        Accreditation Body
                      </label>
                      <input
                        type="text"
                        value={cpdBody}
                        onChange={(e) => setCpdBody(e.target.value)}
                        placeholder="e.g. VORA Global Health Accreditation Board"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0047CC] transition-all"
                      />
                    </div>
                  </div>

                  {/* Executive Certificate Preview Card (Branded Navy/Blue) */}
                  <div className="pt-3">
                    <label className="block text-xs font-bold text-[#1E293B] mb-2.5">
                      Learner Credential Preview
                    </label>
                    <div className="bg-gradient-to-br from-[#0F1E36] via-[#15284F] to-[#1E3A8A] rounded-2xl p-7 sm:p-9 text-white relative overflow-hidden shadow-md border border-blue-900/40">
                      <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-2">
                        Certificate of Completion
                      </div>
                      <div className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white">
                        {title.trim() || 'Your Course Title'}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-100/80 mb-5">
                        Issued by VORA · {instructorName} ·{' '}
                        <span className="font-semibold text-white">
                          {calculatedCEU ? `${calculatedCEU} CPD Credits` : 'Accredited'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <span className="bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-md">
                          VORA Global
                        </span>
                        {isCpdAccredited && (
                          <span className="bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-md">
                            CPD Accredited
                          </span>
                        )}
                        {certificateTemplate === 'BLOCKCHAIN' && (
                          <span className="bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-md">
                            🔗 Blockchain Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 6: SETTINGS & PUBLISH
            ══════════════════════════════════════ */}
            {currentStep === 6 && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0047CC]">
                    Step 6 of 6
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
                    Settings &amp; Pre-Publish Verification
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                    Review access controls, SEO routing, and requirements checklist before making your course live.
                  </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E293B]">Enrollment Mode</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0047CC]">
                          Coming Soon
                        </span>
                      </div>
                      <Select
                        hideLabel
                        value={enrollmentMode}
                        options={ENROLLMENT_MODE_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A] !bg-[#F8FAFC]"
                        onChange={(e) => setEnrollmentMode(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E293B]">Delivery Schedule</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0047CC]">
                          Coming Soon
                        </span>
                      </div>
                      <Select
                        hideLabel
                        value={deliveryMode}
                        options={DELIVERY_MODE_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A] !bg-[#F8FAFC]"
                        onChange={(e) => setDeliveryMode(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E293B]">Discussion Space</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0047CC]">
                          Coming Soon
                        </span>
                      </div>
                      <Select
                        hideLabel
                        value={discussionForum}
                        options={DISCUSSION_FORUM_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A] !bg-[#F8FAFC]"
                        onChange={(e) => setDiscussionForum(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E293B]">Capstone Review</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0047CC]">
                          Coming Soon
                        </span>
                      </div>
                      <Select
                        hideLabel
                        value={peerReview}
                        options={PEER_REVIEW_OPTIONS}
                        className="!py-2.5 !rounded-xl !border-[#CBD5E1] text-sm text-[#0F172A] !bg-[#F8FAFC]"
                        onChange={(e) => setPeerReview(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Course Slug URL */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                      Platform URL Routing
                    </label>
                    <div className="flex items-center">
                      <span className="bg-[#F1F5F9] border border-r-0 border-[#CBD5E1] rounded-l-xl px-4 py-2.5 text-xs text-[#64748B] font-mono">
                        vora.ai/courses/
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={seoSlugPreview || courseId || 'your-course'}
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-r-xl px-4 py-2.5 text-sm text-[#0F172A] font-mono outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Backend Pre-Publish Checklist */}
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-3.5">
                      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                        Pre-Publish Verification
                      </h4>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isPublishReady
                            ? 'bg-blue-100 text-[#0047CC]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPublishReady ? 'Ready for Publish' : 'Requirements Pending'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {(backendChecklist?.items || [
                        {
                          key: 'title',
                          label: 'Course title configured (min 3 characters)',
                          passed: title.trim().length >= 3,
                          stepNumber: 1,
                        },
                        {
                          key: 'description',
                          label: 'Overview description written (min 20 characters)',
                          passed: description.trim().length >= 20,
                          stepNumber: 1,
                        },
                        {
                          key: 'format',
                          label: 'Delivery format selected',
                          passed: Boolean(format),
                          stepNumber: 2,
                        },
                        {
                          key: 'curriculum',
                          label: 'At least 1 curriculum module with titled lessons',
                          passed: modules.length > 0 && modules.some((m) => (m.lessons || []).length > 0),
                          stepNumber: 3,
                        },
                        {
                          key: 'pricing',
                          label: 'Baseline price established',
                          passed: parsedPrice >= 0,
                          stepNumber: 4,
                        },
                      ]).map((item, i) => (
                        <div
                          key={item.key || i}
                          className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                item.passed
                                  ? 'bg-[#0047CC] text-white'
                                  : 'border border-[#CBD5E1] text-transparent'
                              }`}
                            >
                              {item.passed ? '✓' : ''}
                            </span>
                            <span
                              className={item.passed ? 'text-[#0F172A] font-semibold' : 'text-[#64748B]'}
                            >
                              {item.label}
                            </span>
                          </div>
                          {!item.passed && item.stepNumber && (
                            <button
                              type="button"
                              onClick={() => changeStep(item.stepNumber as StepId)}
                              className="text-[11px] font-bold text-[#0047CC] hover:underline"
                            >
                              Jump to Step {item.stepNumber} →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── STEP BOTTOM NAVIGATION ACTIONS ── */}
          <div className="mt-8 pt-5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Previous Step
                </button>
              ) : (
                <Link
                  to="/courses"
                  className="px-4 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] rounded-xl transition-colors inline-block"
                >
                  Exit to Courses
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-[#334155] border border-[#CBD5E1] hover:border-[#0047CC] hover:text-[#0047CC] rounded-full transition-all cursor-pointer shadow-2xs"
              >
                Save Draft
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-[#0047CC] hover:bg-[#0037a3] text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <span>Continue</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenPublish}
                  disabled={!isPublishReady}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-[#0047CC] hover:bg-[#0037a3] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22 11 13 2 9l20-7z" />
                  </svg>
                  Publish Course
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── EDIT LESSON CONTENT MODAL ── */}
      {editingLesson && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setEditingLesson(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">Lesson Configuration</h3>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Title</label>
                <input
                  type="text"
                  value={editingLesson.lesson.title}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      lesson: { ...editingLesson.lesson, title: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] outline-none focus:border-[#0047CC]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E293B] mb-1">Content Delivery Type</label>
                <Select
                  hideLabel
                  value={editingLesson.lesson.contentType}
                  options={LESSON_TYPE_MODAL_OPTIONS}
                  className="!py-2 !rounded-xl !border-[#CBD5E1] text-xs text-[#0F172A]"
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      lesson: {
                        ...editingLesson.lesson,
                        contentType: e.target.value as BuilderLessonContentType,
                      },
                    })
                  }
                />
              </div>

              {editingLesson.lesson.contentType === 'READING' && (
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    Reading & Framework Content (Markdown supported)
                  </label>
                  <textarea
                    rows={5}
                    value={editingLesson.lesson.articleBody || ''}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, articleBody: e.target.value },
                      })
                    }
                    placeholder="Enter analytical brief, references, and core reading material…"
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#0F172A] outline-none focus:border-[#0047CC]"
                  />
                </div>
              )}

              {editingLesson.lesson.contentType === 'FIELD_CASE_STUDY' && (
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    Field Scenario Brief
                  </label>
                  <textarea
                    rows={5}
                    value={editingLesson.lesson.fieldCaseBrief || ''}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, fieldCaseBrief: e.target.value },
                      })
                    }
                    placeholder="Institutional context, dilemma background, stakeholder tradeoffs, and key decision questions…"
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#0F172A] outline-none focus:border-[#0047CC]"
                  />
                </div>
              )}

              {editingLesson.lesson.contentType === 'QUIZ' && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900">
                  <div className="font-bold mb-0.5 text-xs text-[#0047CC]">Interactive Knowledge Check</div>
                  <div className="text-[11px] leading-relaxed text-blue-900/80">
                    Question authoring will be linked via the VORA Assessment Studio.
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLesson.lesson.isPreview || false}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, isPreview: e.target.checked },
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#0047CC]"
                  />
                  <span className="font-semibold text-[#1E293B]">Free Preview Access</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLesson.lesson.isOptional || false}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lesson: { ...editingLesson.lesson, isOptional: e.target.checked },
                      })
                    }
                    className="rounded border-[#CBD5E1] text-[#0047CC]"
                  />
                  <span className="font-semibold text-[#1E293B]">Optional Material</span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#E2E8F0] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (editingLesson) {
                    await handleLessonUpdate(
                      editingLesson.moduleId,
                      editingLesson.lesson.id,
                      editingLesson.lesson
                    );
                    setEditingLesson(null);
                    toast.success('Lesson updated.');
                  }
                }}
                className="px-5 py-2 text-xs font-bold bg-[#0047CC] text-white rounded-full hover:bg-[#0037a3]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PUBLISH CONFIRMATION MODAL ── */}
      {isPublishModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPublishModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">Publish Course Live?</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-6">
              Your course will become visible in the VORA catalog and open for enrollment. CPD accreditation review will be initiated.
            </p>

            <div className="bg-[#EBF6FF] border border-[#0047CC]/20 rounded-xl p-4 text-xs font-semibold text-[#0047CC] mb-6 flex items-center gap-2.5">
              <span>✓</span>
              <span>All pre-flight checks verified. Ready for launch.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isPublishReady || publishMutation.isPending}
                onClick={handlePublishCourse}
                className="px-5 py-2 text-xs font-bold bg-[#0047CC] hover:bg-[#0037a3] disabled:opacity-50 text-white rounded-full transition-all cursor-pointer shadow-xs"
              >
                {publishMutation.isPending ? 'Publishing…' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNER PREVIEW MODAL ── */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0047CC] bg-[#EBF6FF] px-3 py-1 rounded-full">
                  Learner Catalog Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Course preview"
                className="w-full h-48 object-cover rounded-2xl mb-4 shadow-xs"
              />
            )}

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#0047CC]">
                  {category || 'Global Health'} · {difficultyLevel || 'Intermediate'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
                  {title.trim() || 'Untitled Course'}
                </h2>
                {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#64748B]">
                <span>
                  Taught by <strong className="text-[#0F172A]">{instructorName}</strong>
                </span>
                <span>•</span>
                <span>{calculatedCEU ? `${calculatedCEU} CEUs` : 'CPD Accredited'}</span>
                <span>•</span>
                <span className="font-bold text-[#0047CC]">
                  {parsedPrice ? `$${parsedPrice} USD` : 'Free'}
                </span>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {tags.map((tg) => (
                    <Tag key={tg} label={tg} variant="blue" className="text-[11px]" />
                  ))}
                </div>
              )}

              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  What you will learn
                </h4>
                <ul className="space-y-1.5 text-xs text-[#334155]">
                  {outcomes
                    .filter((o) => o.trim())
                    .map((out, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#0047CC] font-bold">✓</span>
                        <span>{out}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Curriculum ({modules.length} Modules)
                </h4>
                <div className="space-y-2 text-xs">
                  {modules.map((m, idx) => (
                    <div
                      key={m.id}
                      className="border border-[#E2E8F0] rounded-xl p-3.5 flex items-center justify-between bg-white"
                    >
                      <span className="font-bold text-[#0F172A]">
                        {m.title || `Module ${idx + 1}`}
                      </span>
                      <span className="text-[#64748B]">
                        {(m.lessons || []).length} lessons
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 text-xs font-bold bg-[#0047CC] text-white rounded-full hover:bg-[#0037a3] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCoursePage;
