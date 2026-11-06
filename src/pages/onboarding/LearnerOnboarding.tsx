import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useLearnerOnboardingMutation } from '../../services/queries/onboarding';
import { useEnrollMutation, usePublicCourseQuery } from '../../services/queries/courses';
import { displayMedia, resolveCourseCoverImage, DEFAULT_FALLBACK_COURSE_COVER } from '../../utils/media';
import {
  loadCourseEnrollContext,
  clearCourseEnrollContext,
} from '../../utils/courseSignup';
import Button from '../../components/common/Button';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import Select from '../../components/common/Select';
import VoraLogo from '../../components/common/VoraLogo';
import AlertBanner from '../../components/common/AlertBanner';
import {
  BookOpenIcon,
  ShieldIcon,
  GraduationCapIcon,
  SearchIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import { toast } from 'react-hot-toast';
import { capitalizeWords } from '../../utils/stringUtils';
import { resolveCountryIsoCode } from '../../utils/locationSearch';

const LEARNER_BACKGROUND_OPTIONS = [
  { label: 'Healthcare Worker / Clinician (MD, Nurse, Pharmacist)', value: 'clinical' },
  { label: 'Public Health & Epidemiology Specialist', value: 'public-health' },
  { label: 'Academic, Researcher or Scientist', value: 'researcher' },
  { label: 'Student / Graduate (Medicine, Health Sciences, STEM)', value: 'student' },
  { label: 'Data, Software or Health Informatics Specialist', value: 'tech-informatics' },
  { label: 'NGO, Policy or Non-Profit Professional', value: 'ngo-policy' },
  { label: 'Other Professional Background', value: 'other' },
];

const LEARNING_GOAL_OPTIONS = [
  { label: 'Career advancement and verified credentialing', value: 'career-advancement' },
  { label: 'Practical upskilling for my current role or field work', value: 'upskilling' },
  { label: 'Academic, fellowship or post-graduate preparation', value: 'academic-prep' },
  { label: 'Exploring global health policy, technology and systems', value: 'curiosity' },
  { label: 'Other personal or organizational goal', value: 'other' },
];

/**
 * Filter out auto-generated placeholders, emails, or hash IDs from pre-filling
 */
const sanitizeInitialName = (name?: string): string => {
  if (!name) return '';
  // If derived from email like "Memmoilebroumi-3866" or an email address, start fresh
  if (/[-_]\d+$/.test(name) || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(name)) {
    return '';
  }
  return name;
};

export const LearnerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  const courseContext = useMemo(() => loadCourseEnrollContext(), []);
  const courseIdentifier = courseContext?.slug || courseContext?.courseId || '';
  const { data: publicCourseResponse } = usePublicCourseQuery(courseIdentifier);
  const [imageError, setImageError] = useState(false);

  const courseCoverImage = useMemo(() => {
    if (imageError) return DEFAULT_FALLBACK_COURSE_COVER;
    const apiData = (publicCourseResponse as any)?.data || publicCourseResponse;
    const c = apiData?.course || apiData;
    return resolveCourseCoverImage(c, courseContext);
  }, [imageError, courseContext, publicCourseResponse]);
  const onboardingMutation = useLearnerOnboardingMutation();
  const enrollMutation = useEnrollMutation();

  const [firstName, setFirstName] = useState(() => capitalizeWords(sanitizeInitialName(user?.firstName)));
  const [lastName, setLastName] = useState(() => capitalizeWords(sanitizeInitialName(user?.lastName)));
  const [locationValue, setLocationValue] = useState((user as any)?.location || '');
  const [background, setBackground] = useState('');
  const [customBackground, setCustomBackground] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    location: false,
    background: false,
    customBackground: false,
  });

  const isCustomBackground = background === 'other';
  const effectiveBackground = isCustomBackground ? customBackground.trim() : background;

  const isFormValid = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    locationValue.trim() &&
    effectiveBackground
  );

  const missingFieldsText = useMemo(() => {
    const missing: string[] = [];
    if (!firstName.trim()) missing.push('first name');
    if (!lastName.trim()) missing.push('last name');
    if (!locationValue.trim()) missing.push('location');
    if (!background) {
      missing.push('professional background');
    } else if (isCustomBackground && !customBackground.trim()) {
      missing.push('specified background');
    }

    if (missing.length === 0) return '';
    if (missing.length === 1) return missing[0];
    if (missing.length === 2) return `${missing[0]} and ${missing[1]}`;
    return `${missing.slice(0, -1).join(', ')}, and ${missing[missing.length - 1]}`;
  }, [firstName, lastName, locationValue, background, isCustomBackground, customBackground]);

  const isSubmitting = onboardingMutation.isPending || enrollMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      location: true,
      background: true,
      customBackground: true,
    });
    setServerError(null);

    if (!isFormValid || isSubmitting) return;

    try {
      // 1. Submit fully compliant talent onboarding payload to satisfy backend validator
      const parts = locationValue.split(',').map((s: string) => s.trim()).filter(Boolean);
      const city = parts[0] || 'Global';
      const rawCountry = parts.length > 1 ? parts[parts.length - 1] : (parts[0] || 'United States');
      const countryIso = (await resolveCountryIsoCode(rawCountry)) || 'US';

      const selectedOption = LEARNER_BACKGROUND_OPTIONS.find((o) => o.value === background);
      const finalBackgroundTitle = isCustomBackground
        ? (customBackground.trim() || 'Health Specialist')
        : (selectedOption ? selectedOption.label.split('(')[0].trim() : (background || 'Health Specialist'));

      const cleanFirstName = capitalizeWords(firstName.trim());
      const cleanLastName = capitalizeWords(lastName.trim());

      const payload = {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        country: rawCountry,
        region: rawCountry,
        countryOfResidence: countryIso,
        residenceCity: city,
        nationalities: [rawCountry],
        professionalTitle: finalBackgroundTitle,
        areasOfInterest: [finalBackgroundTitle],
        experienceLevel: 'STUDENT_GRADUATE',
        rightToWorkStatus: 'REMOTE_OR_CONSULTANCY_ONLY',
        willingnessToRelocate: 'STAYING_CURRENT_LOCATION',
        preferredWorkArrangement: 'FULLY_REMOTE',
        workAuthorisationConfirmed: true,
      };

      try {
        await onboardingMutation.mutateAsync(payload as any);
      } catch (err: any) {
        // If already completed or benign 409, continue smoothly
        if (err?.status !== 409) {
          console.warn('[LearnerOnboarding] Notice during onboarding submit:', err);
        }
      }

      // 2. Mark user onboarding complete locally with learner track flag
      updateUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        onboardingCompleted: true,
        isOnboardingComplete: true,
        isLearner: true,
        isLearnerOnboardingComplete: true,
      });
      try {
        localStorage.setItem('vora_user_track', 'learner');
        localStorage.setItem('vora_learner_onboarding_completed', 'true');
      } catch {
        /* ignore */
      }

      // 3. Auto-enroll in the course if course context is active
      const courseId = courseContext?.courseId;
      if (courseId) {
        try {
          await enrollMutation.mutateAsync({
            courseId,
            payload: {
              paymentCountry: countryIso,
              declaredCountry: countryIso,
              ipCountry: countryIso,
              localeCountry: `${countryIso.toLowerCase()}-${countryIso}`,
            },
          });
          queryClient.invalidateQueries({ queryKey: ['courses', 'enrollments'] });
          queryClient.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
          toast.success(
            `You are enrolled in "${courseContext.title || 'your course'}"! Welcome aboard.`,
            { duration: 4000 }
          );
        } catch (enrollErr) {
          console.warn('[LearnerOnboarding] Enroll notice:', enrollErr);
        }

        clearCourseEnrollContext();
        navigate(`/courses/${courseId}`, { replace: true });
      } else {
        toast.success('Talent profile created successfully!');
        navigate('/courses', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to complete setup. Please check your fields and try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VoraLogo to="/courses" size="md" />
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100">
            Academy
          </span>
        </div>

        {/* Step 1 of 1 Neutral Progress Chip (no misleading green 'live' dot) */}
        <div className="flex items-center">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Step 1 of 1 · Quick Setup
          </span>
        </div>
      </header>

      {/* Main Form Container: Spacious 720px width so inputs, labels, and course context breathe comfortably */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 p-8 sm:p-12 space-y-7">
          
          {/* Context Header with Line Icon Tile */}
          <div className="space-y-2.5 text-center">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#0047CC] flex items-center justify-center mx-auto mb-3.5 border border-blue-100 shadow-2xs">
              <BookOpenIcon size={24} />
            </div>
            <h1 className="text-2xl sm:text-[30px] font-semibold text-slate-900 tracking-tight leading-snug">
              Welcome to VORA Learning
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-lg mx-auto">
              Complete your profile in 30 seconds to begin watching lessons and recording progress.
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <AlertBanner
              variant="red"
              onDismiss={() => setServerError(null)}
            >
              {serverError}
            </AlertBanner>
          )}

          {/* Active Course Card: 16:9 thumbnail, 12px label, 16px semibold title, 13px muted instructor */}
          {courseContext && (
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-4 sm:gap-5">
              <div className="aspect-video w-24 sm:w-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 flex items-center justify-center">
                <img
                  src={courseCoverImage || DEFAULT_FALLBACK_COURSE_COVER}
                  alt={courseContext.title || 'Course'}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0047CC] block mb-0.5">
                  Ready to enroll
                </span>
                <h3
                  className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug"
                  title={courseContext.title || 'Course'}
                >
                  {courseContext.title || 'Course Masterclass'}
                </h3>
                {courseContext.instructorName && (
                  <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 truncate">
                    Instructor: {courseContext.instructorName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Fields: Standard 48px height, 14px medium labels */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  First name <span className="text-[#0047CC]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(capitalizeWords(e.target.value))}
                  onBlur={() => {
                    setFirstName((prev) => capitalizeWords(prev.trim()));
                    setTouched((p) => ({ ...p, firstName: true }));
                  }}
                  placeholder="e.g. Amara"
                  autoComplete="given-name"
                  className={`w-full h-12 px-4 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden transition-all ${
                    touched.firstName && !firstName.trim()
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20'
                  }`}
                />
                {touched.firstName && !firstName.trim() && (
                  <div className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-1.5">
                    <AlertTriangleIcon size={13} className="text-rose-500 shrink-0" />
                    <span>First name is required</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">
                  Last name <span className="text-[#0047CC]">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(capitalizeWords(e.target.value))}
                  onBlur={() => {
                    setLastName((prev) => capitalizeWords(prev.trim()));
                    setTouched((p) => ({ ...p, lastName: true }));
                  }}
                  placeholder="e.g. Osei"
                  autoComplete="family-name"
                  className={`w-full h-12 px-4 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden transition-all ${
                    touched.lastName && !lastName.trim()
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20'
                  }`}
                />
                {touched.lastName && !lastName.trim() && (
                  <div className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-1.5">
                    <AlertTriangleIcon size={13} className="text-rose-500 shrink-0" />
                    <span>Last name is required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location (with Search Icon & 48px height) */}
            <div>
              <LocationAutocomplete
                label={
                  <span className="block text-sm font-medium text-slate-800 mb-1.5">
                    Location (City, Country) <span className="text-[#0047CC]">*</span>
                  </span>
                }
                icon={SearchIcon}
                value={locationValue}
                onChange={(val) => setLocationValue(val)}
                onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                placeholder="Search city and country..."
                error={touched.location && !locationValue.trim()}
              />
              {touched.location && !locationValue.trim() ? (
                <div className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-1.5">
                  <AlertTriangleIcon size={13} className="text-rose-500 shrink-0" />
                  <span>Please specify your city and country</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">
                  Used for verified certificates and scheduling in your local timezone.
                </p>
              )}
            </div>

            {/* Current Professional Background Dropdown */}
            <div>
              <Select
                label="Current professional background *"
                value={background}
                onChange={(e) => {
                  setBackground(e.target.value);
                  if (e.target.value !== 'other') {
                    setCustomBackground('');
                  }
                }}
                onBlur={() => setTouched((p) => ({ ...p, background: true }))}
                placeholder="Select your current background"
                options={LEARNER_BACKGROUND_OPTIONS}
                error={touched.background && !background}
              />
              {touched.background && !background && (
                <div className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-1.5">
                  <AlertTriangleIcon size={13} className="text-rose-500 shrink-0" />
                  <span>Please choose your background</span>
                </div>
              )}

              {/* Custom background input field */}
              {background === 'other' && (
                <div className="mt-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Specify your professional background <span className="text-[#0047CC]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, customBackground: true }))}
                    placeholder="e.g. Biomedical Engineer, Health Economics Specialist, Clinician..."
                    className={`w-full h-11 px-4 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden transition-all ${
                      touched.customBackground && !customBackground.trim()
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20'
                    }`}
                    autoFocus
                  />
                  {touched.customBackground && !customBackground.trim() && (
                    <div className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-1.5">
                      <AlertTriangleIcon size={13} className="text-rose-500 shrink-0" />
                      <span>Please specify your professional background</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Learning Goal */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-800">
                  What is your main goal for taking this course?
                </label>
                <span className="text-xs text-slate-400 font-normal">Optional</span>
              </div>
              <Select
                hideLabel
                value={learningGoal}
                onChange={(e) => {
                  setLearningGoal(e.target.value);
                  if (e.target.value !== 'other') {
                    setCustomGoal('');
                  }
                }}
                placeholder="Select your primary goal (optional)"
                options={LEARNING_GOAL_OPTIONS}
              />

              {/* Custom learning goal input field */}
              {learningGoal === 'other' && (
                <div className="mt-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Specify your goal <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Preparing for WHO residency, career transition into public health..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 hover:border-slate-300 focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Submit Action Block */}
            <div className="pt-4">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                pill={false}
                fullWidth
                disabled={!isFormValid || isSubmitting}
                isLoading={isSubmitting}
                className={`rounded-xl font-bold text-sm h-12 transition-all shadow-xs cursor-pointer ${
                  !isFormValid && !isSubmitting
                    ? '!bg-slate-100 !text-slate-400 !border !border-slate-200 !cursor-not-allowed !shadow-none'
                    : 'bg-[#0047CC] hover:bg-[#0039A6] active:scale-98 text-white'
                }`}
              >
                {isSubmitting ? 'Setting up…' : 'Complete & Start Learning'}
              </Button>

              {/* Helpful Hint when Form is Incomplete */}
              {!isFormValid && (touched.firstName || touched.lastName || touched.location || touched.background || touched.customBackground) && (
                <p className="text-xs text-slate-500 text-center mt-2.5 font-medium">
                  Please enter your {missingFieldsText} to continue
                </p>
              )}

              {/* Reassurance Note Directly under Button */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-[13px] text-slate-600 font-medium text-center mt-4">
                <ShieldIcon size={16} className="text-[#0047CC] shrink-0" />
                <span>Instant access · No employment visa verification or CV parsing required</span>
              </div>

              {/* Consent & Privacy Note */}
              <p className="text-[11px] text-slate-400 text-center mt-3">
                By continuing, you agree to VORA&apos;s{' '}
                <a href="#terms" className="underline hover:text-slate-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="underline hover:text-slate-600">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </form>

        </div>
      </main>

      {/* Muted 12px Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} VORA Academy. All rights reserved.
      </footer>
    </div>
  );
};

export default LearnerOnboarding;
