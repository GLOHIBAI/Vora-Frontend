import { useState, useMemo, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import Button from '../../components/common/Button';
import { capitalizeFirstLetter } from '../../utils/stringUtils';
import {
  getNextMentorOnboardingStepAfterSave,
  getMentorWizardUiStep,
  isMentorOnboardingComplete,
  normalizeMentorOnboardingState,
} from '../../utils/mentorOnboarding';
import type { CompleteMentorOnboardingResponse } from '../../services/queries/onboarding';
import type { ApiResponse } from '../../services/queries/auth/types';
import { validatePortfolioUrl } from '../../utils/validation';
import type { MentorOnboardingSavedFields } from '../../services/queries/onboarding';
import {
  useMentorOnboardingStep1Mutation,
  useMentorOnboardingStep2Mutation,
  useMentorOnboardingStep3Mutation,
  useMentorOnboardingStep4Mutation,
  useMentorOnboardingStep5Mutation,
  useMentorOnboardingStateQuery,
  useUploadMentorCertificationMutation,
} from '../../services/queries/onboarding';
import {
  TITLE_OPTIONS,
  PRIMARY_EXPERTISE_OPTIONS,
  FUNCTIONAL_STRENGTH_OPTIONS,
  MENTORSHIP_FOCUS_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
  LICENSE_OPTIONS,
  MENTORSHIP_FORMAT_OPTIONS,
  SESSIONS_PER_MONTH_OPTIONS,
  SESSION_LENGTH_OPTIONS,
  CANDIDATE_ACCESS_OPTIONS,
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS,
  COURSE_TYPE_OPTIONS,
  PREFERRED_FORMAT_OPTIONS
} from '../../data/mentorOnboardingData';
import { UploadIcon, TrashIcon, FileIcon } from '../../components/common/Icons';

const TOTAL_STEPS = 5;

const MentorProfile: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const isMentor = user?.role?.toLowerCase() === 'mentor';
  const [searchParams, setSearchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const parsedUrlStep = stepParam ? parseInt(stepParam, 10) : NaN;
  /** URL ?step= is the source of truth so Back/forward always match what is rendered. */
  const step =
    Number.isFinite(parsedUrlStep) && parsedUrlStep >= 1 && parsedUrlStep <= TOTAL_STEPS
      ? parsedUrlStep
      : 1;

  const hasSetInitialStepFromApi = useRef(false);
  const [redirectToWelcome, setRedirectToWelcome] = useState(false);

  const step1Mutation = useMentorOnboardingStep1Mutation();
  const step2Mutation = useMentorOnboardingStep2Mutation();
  const step3Mutation = useMentorOnboardingStep3Mutation();
  const uploadCertMutation = useUploadMentorCertificationMutation();
  const step4Mutation = useMentorOnboardingStep4Mutation();
  const step5Mutation = useMentorOnboardingStep5Mutation();
  const { data: onboardingState, isError: isStateError, error: stateError } =
    useMentorOnboardingStateQuery(isMentor);

  const isSavingStep =
    (step === 1 && step1Mutation.isPending) ||
    (step === 2 && step2Mutation.isPending) ||
    (step === 3 && step3Mutation.isPending) ||
    (step === 4 && step4Mutation.isPending) ||
    (step === 5 && step5Mutation.isPending);

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    title: '',
    professionalTitle: '',
    firstName: '',
    lastName: '',
  });

  // Step 2: Expertise and Focus Area
  const [expertiseInfo, setExpertiseInfo] = useState({
    primaryExpertise: [] as string[],
    functionalStrength: [] as string[],
    mentorshipFocus: [] as string[],
  });

  // Step 3: Professional Experience
  const [experienceInfo, setExperienceInfo] = useState({
    currentRole: '',
    organization: '',
    yearsOfExperience: '',
    websitePortfolio: '',
  });
  const [currentCertType, setCurrentCertType] = useState('');
  const [otherCertName, setOtherCertName] = useState('');
  const [certificates, setCertificates] = useState<{
    id: string;
    type: string;
    displayLabel: string;
    files: { name: string; size: number; key?: string; isUploading?: boolean }[];
  }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Availability and Engagement Preferences
  const [availabilityInfo, setAvailabilityInfo] = useState({
    mentorshipFormat: [] as string[],
    sessionsPerMonth: '',
    sessionLength: [] as string[],
    candidateAccess: [] as string[],
    timezone: '',
    preferredLanguage: '',
    regionalEquityPricing: true,
  });

  // Step 5: Course Interest
  const [courseInterest, setCourseInterest] = useState<'later' | 'interested' | ''>('');
  const [courseDetails, setCourseDetails] = useState({
    courseType: [] as string[],
    preferredFormat: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const normalizedOnboardingState = useMemo(
    () => normalizeMentorOnboardingState(onboardingState?.data),
    [onboardingState?.data],
  );

  const userOnboardingFields = user as {
    isOnboardingComplete?: boolean;
    onboardingCompleted?: boolean;
    firstName?: string;
  } | null;

  const isOnboardingDone = useMemo(() => {
    const stateForbidden = isStateError && (stateError as { status?: number })?.status === 403;
    return (
      redirectToWelcome ||
      isMentorOnboardingComplete({
        onboardingCompleted:
          normalizedOnboardingState?.onboardingCompleted ??
          userOnboardingFields?.onboardingCompleted,
        isOnboardingComplete: userOnboardingFields?.isOnboardingComplete,
      }) ||
      (stateForbidden && userOnboardingFields?.isOnboardingComplete)
    );
  }, [
    redirectToWelcome,
    normalizedOnboardingState?.onboardingCompleted,
    userOnboardingFields?.onboardingCompleted,
    userOnboardingFields?.isOnboardingComplete,
    isStateError,
    stateError,
  ]);

  // First visit without ?step=: resume at the correct wizard step from API (once).
  useEffect(() => {
    if (stepParam || hasSetInitialStepFromApi.current) return;

    const normalized = normalizeMentorOnboardingState(onboardingState?.data);
    if (!normalized || normalized.onboardingCompleted) return;

    hasSetInitialStepFromApi.current = true;
    const resumeUiStep = getMentorWizardUiStep(normalized.step, normalized.fields);
    setSearchParams({ step: String(resumeUiStep) }, { replace: true });
    updateUser({ onboardingStep: resumeUiStep } as Parameters<typeof updateUser>[0]);
  }, [onboardingState?.data, stepParam, setSearchParams, updateUser]);

  // Keep stored user step aligned with URL when user navigates (e.g. Back).
  useEffect(() => {
    if (!stepParam) return;
    updateUser({ onboardingStep: step } as Parameters<typeof updateUser>[0]);
  }, [step, stepParam, updateUser]);

  // Hydrate form fields from API (does not change wizard step).
  useEffect(() => {
    const normalized = normalizeMentorOnboardingState(onboardingState?.data);
    if (!normalized || normalized.onboardingCompleted) return;

    const savedFields = normalized.fields as MentorOnboardingSavedFields;
    if (Object.keys(savedFields).length === 0) return;

      // Step 1
      if (savedFields.title || savedFields.firstName || savedFields.lastName || savedFields.professionalTitle) {
        setPersonalInfo({
          title: savedFields.title || '',
          firstName: savedFields.firstName || '',
          lastName: savedFields.lastName || '',
          professionalTitle: savedFields.professionalTitle || '',
        });
      }

      // Step 2
      if (savedFields.primaryExpertise || savedFields.functionalStrength || savedFields.mentorshipFocus) {
        setExpertiseInfo({
          primaryExpertise: savedFields.primaryExpertise || [],
          functionalStrength: savedFields.functionalStrength || [],
          mentorshipFocus: savedFields.mentorshipFocus || [],
        });
      }

      // Step 3
      if (savedFields.currentRole || savedFields.organization || savedFields.yearsOfExperienceBand || savedFields.websiteOrPortfolioUrl) {
        setExperienceInfo({
          currentRole: savedFields.currentRole || '',
          organization: savedFields.organization || '',
          yearsOfExperience: savedFields.yearsOfExperienceBand || '',
          websitePortfolio: savedFields.websiteOrPortfolioUrl || '',
        });
      }

      // Step 4
      if (savedFields.mentorshipFormat || savedFields.sessionsPerMonth || savedFields.preferredSessionLength || savedFields.talentAccess || savedFields.timezone || savedFields.preferredLanguage) {
        setAvailabilityInfo({
          mentorshipFormat: savedFields.mentorshipFormat || [],
          sessionsPerMonth: savedFields.sessionsPerMonth ? String(savedFields.sessionsPerMonth) : '',
          sessionLength: savedFields.preferredSessionLength || [],
          candidateAccess: savedFields.talentAccess || [],
          timezone: savedFields.timezone || '',
          preferredLanguage: savedFields.preferredLanguage || '',
          regionalEquityPricing: savedFields.regionalEquityPricingEnabled ?? true,
        });
      }

      // Step 5
      const backendCourseIntent = savedFields.courseIntent || (savedFields as any).courseInterest;
      if (backendCourseIntent) {
        const localInterest = backendCourseIntent === 'explore_later' || backendCourseIntent === 'later' ? 'later' : 'interested';
        setCourseInterest(localInterest as any);
        if (localInterest === 'interested') {
          setCourseDetails({
            courseType: savedFields.typeOfInterest || (savedFields as any).courseType || [],
            preferredFormat: savedFields.preferredFormat || '',
          });
        }
      }
  }, [onboardingState?.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'organization' || name === 'firstName' || name === 'lastName') {
      value = capitalizeFirstLetter(value);
    }
    if (step === 1) {
      setPersonalInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 2) {
      setExpertiseInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 3) {
      setExperienceInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 4) {
      setAvailabilityInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0 || !currentCertType) return;

    const certLabel = currentCertType === 'other' 
      ? otherCertName || 'Other Certification'
      : LICENSE_OPTIONS.find(o => o.value === currentCertType)?.label || '';

    const filesToUpload = newFiles.map(f => ({
      name: f.name,
      size: f.size,
      isUploading: true
    }));

    setCertificates(prev => {
      const existing = prev.find(c => 
        c.type === currentCertType && 
        (currentCertType !== 'other' || c.displayLabel === otherCertName)
      );
      
      if (existing) {
        return prev.map(c => 
          c.id === existing.id 
            ? { ...c, files: [...c.files, ...filesToUpload] } 
            : c
        );
      }
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        type: currentCertType, 
        displayLabel: certLabel,
        files: filesToUpload 
      }];
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';

    for (const file of newFiles) {
      try {
        const response = await uploadCertMutation.mutateAsync(file);
        const backendDocKey = response.data.docs;
        
        setCertificates(prev => prev.map(c => {
          const hasFile = c.files.some(f => f.name === file.name);
          if (hasFile) {
            return {
              ...c,
              files: c.files.map(f => f.name === file.name ? { ...f, isUploading: false, key: backendDocKey } : f)
            };
          }
          return c;
        }));
      } catch (err) {
        setCertificates(prev => prev.map(c => {
          return {
            ...c,
            files: c.files.filter(f => f.name !== file.name)
          };
        }).filter(c => c.files.length > 0));
      }
    }
  };

  const removeCertFile = (certId: string, fileName: string) => {
    setCertificates(prev => prev.map(c => {
      if (c.id === certId) {
        const remaining = c.files.filter(f => f.name !== fileName);
        return { ...c, files: remaining };
      }
      return c;
    }).filter(c => c.files.length > 0));
  };

  const removeCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
  };

  const portfolioError = useMemo(() => {
    if (!touched.websitePortfolio) return '';
    return validatePortfolioUrl(experienceInfo.websitePortfolio);
  }, [experienceInfo.websitePortfolio, touched.websitePortfolio]);

  const isStep1Valid = useMemo(() => {
    return (
      personalInfo.title &&
      personalInfo.firstName &&
      personalInfo.lastName
    );
  }, [personalInfo]);

  const isStep2Valid = useMemo(() => {
    return (
      expertiseInfo.primaryExpertise.length > 0 &&
      expertiseInfo.functionalStrength.length > 0 &&
      expertiseInfo.mentorshipFocus.length > 0
    );
  }, [expertiseInfo]);

  const isStep3Valid = useMemo(() => {
    return (
      experienceInfo.currentRole &&
      experienceInfo.organization &&
      experienceInfo.yearsOfExperience &&
      !validatePortfolioUrl(experienceInfo.websitePortfolio) &&
      certificates.length > 0 &&
      certificates.every(c => c.files.every(f => !f.isUploading))
    );
  }, [experienceInfo, certificates]);

  const isStep4Valid = useMemo(() => {
    return (
      availabilityInfo.mentorshipFormat.length > 0 &&
      availabilityInfo.sessionsPerMonth &&
      availabilityInfo.sessionLength.length > 0 &&
      availabilityInfo.candidateAccess.length > 0 &&
      availabilityInfo.timezone &&
      availabilityInfo.preferredLanguage
    );
  }, [availabilityInfo]);

  const getStepValidity = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    if (step === 4) return isStep4Valid;
    if (step === 5) {
      if (courseInterest === 'later') return true;
      if (courseInterest === 'interested') return !!(courseDetails.courseType.length > 0 && courseDetails.preferredFormat);
      return false;
    }
    return false;
  };

  const goToStep = (nextStep: number) => {
    setSearchParams({ step: String(nextStep) }, { replace: true });
    window.scrollTo(0, 0);
  };

  const advanceAfterStepSave = async (
    savedWizardStep: number,
    response: ApiResponse<CompleteMentorOnboardingResponse>,
  ) => {
    const nextStep = getNextMentorOnboardingStepAfterSave(
      savedWizardStep,
      response.data?.onboardingStep,
    );
    goToStep(nextStep);
    updateUser({ onboardingStep: nextStep } as Parameters<typeof updateUser>[0]);
    await queryClient.invalidateQueries({ queryKey: ['mentor-onboarding', 'state'] });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (step === 1 && isStep1Valid) {
        const step1Response = await step1Mutation.mutateAsync({
          title: personalInfo.title,
          professionalTitle: personalInfo.professionalTitle || undefined,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
        });
        await advanceAfterStepSave(1, step1Response);
      } else if (step === 2 && isStep2Valid) {
        const step2Response = await step2Mutation.mutateAsync({
          primaryExpertise: expertiseInfo.primaryExpertise,
          functionalStrength: expertiseInfo.functionalStrength,
          mentorshipFocus: expertiseInfo.mentorshipFocus,
        });
        await advanceAfterStepSave(2, step2Response);
      } else if (step === 3 && isStep3Valid) {
        const uploadedCertifications = certificates.flatMap(cert => 
          cert.files
            .filter(f => f.key && !f.isUploading)
            .map(f => ({
              title: cert.displayLabel,
              docs: f.key!
            }))
        );

        const step3Response = await step3Mutation.mutateAsync({
          currentRole: experienceInfo.currentRole,
          organization: experienceInfo.organization,
          yearsOfExperienceBand: experienceInfo.yearsOfExperience.endsWith(' years')
            ? experienceInfo.yearsOfExperience
            : `${experienceInfo.yearsOfExperience} years`,
          websiteOrPortfolioUrl: experienceInfo.websitePortfolio || undefined,
          certifications: uploadedCertifications,
        });
        await advanceAfterStepSave(3, step3Response);
      } else if (step === 4 && isStep4Valid) {
        const mappedMentorshipFormat = availabilityInfo.mentorshipFormat.map(f => {
          if (f === '1-on-1-sessions') return '1-on-1 sessions';
          if (f === 'group-sessions') return 'Group sessions';
          return f;
        });

        const mappedSessionLength = availabilityInfo.sessionLength.map(l => {
          if (l === '30mins') return '30 mins';
          if (l === '45mins') return '45 mins';
          if (l === '1hour') return '1 hour';
          if (l === '2hours') return '2 hours';
          return l;
        });

        const mappedTalentAccess = availabilityInfo.candidateAccess.map(a => {
          if (a === 'open-matched' || a === 'Open to matched candidates' || a === 'Open to matched talent') {
            return 'Open to matched talent';
          }
          if (a === 'invite-only' || a === 'Invite-only') {
            return 'Invite-only';
          }
          if (a === 'employer-referred' || a === 'Employer-referred only') {
            return 'Employer-referred only';
          }
          return a;
        });

        const mappedTimezone = (() => {
          const tz = availabilityInfo.timezone;
          if (tz === 'WAT') return 'WAT (West Africa Time)';
          if (tz === 'GMT') return 'GMT (Greenwich Mean Time)';
          if (tz === 'EST') return 'EST (Eastern Standard Time)';
          if (tz === 'CST') return 'CST (Central Standard Time)';
          if (tz === 'PST') return 'PST (Pacific Standard Time)';
          if (tz === 'EAT') return 'EAT (East Africa Time)';
          return tz;
        })();

        const mappedLanguage = (() => {
          const lang = availabilityInfo.preferredLanguage;
          if (lang === 'english') return 'en';
          if (lang === 'french') return 'fr';
          if (lang === 'spanish') return 'es';
          if (lang === 'arabic') return 'ar';
          if (lang === 'portuguese') return 'pt';
          return lang;
        })();

        const step4Response = await step4Mutation.mutateAsync({
          mentorshipFormat: mappedMentorshipFormat,
          sessionsPerMonth: availabilityInfo.sessionsPerMonth,
          preferredSessionLength: mappedSessionLength,
          talentAccess: mappedTalentAccess,
          timezone: mappedTimezone,
          preferredLanguage: mappedLanguage,
          regionalEquityPricingEnabled: availabilityInfo.regionalEquityPricing,
        });
        await advanceAfterStepSave(4, step4Response);
      } else if (step === 5 && courseInterest) {
        const mappedTypeOfInterest = courseInterest === 'interested' && courseDetails.courseType
          ? courseDetails.courseType.map(t => {
              if (t === 'career-readiness') return 'Career readiness & professional judgment';
              if (t === 'technical-domain') return 'Technical / domain-specific skills';
              if (t === 'leadership-decision') return 'Leadership & decision-making';
              if (t === 'research-policy') return 'Research, policy, or practice-focused';
              return t;
            })
          : undefined;

        const mappedPreferredFormat = courseInterest === 'interested' && courseDetails.preferredFormat
          ? (() => {
              const f = courseDetails.preferredFormat;
              if (f === 'short-structured') return 'Short structured course';
              if (f === 'deep-dive') return 'Deep-dive series';
              if (f === 'case-based') return 'Case-based learning';
              return f;
            })()
          : undefined;

        const step5Response = await step5Mutation.mutateAsync({
          courseIntent: courseInterest === 'later' ? 'explore_later' : 'interested',
          typeOfInterest: mappedTypeOfInterest,
          preferredFormat: mappedPreferredFormat,
        });

        const completed = step5Response.data?.onboardingCompleted ?? true;

        updateUser({
          title: personalInfo.title,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          isOnboardingComplete: completed,
          onboardingCompleted: completed,
          onboardingStep: step5Response.data?.onboardingStep ?? 5,
        } as Parameters<typeof updateUser>[0]);

        setRedirectToWelcome(true);
        void queryClient.invalidateQueries({ queryKey: ['mentor-onboarding', 'state'] });
      }
    } catch {
      // Errors surfaced via API client / mutation onError toasts
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/onboarding/mentor-apply');
    } else {
      goToStep(step - 1);
    }
  };

  if (isOnboardingDone) {
    const welcomeFirstName =
      personalInfo.firstName ||
      userOnboardingFields?.firstName ||
      (normalizedOnboardingState?.fields?.firstName as string | undefined) ||
      'there';

    return (
      <Navigate
        to="/onboarding/welcome"
        replace
        state={{ firstName: welcomeFirstName, role: 'mentor' }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center mb-3">
          <span className="text-sm font-medium text-[#1C1C1C]">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-2 w-full h-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full rounded-full transition-all duration-500 ${i < step ? 'bg-[#0047CC]' : 'bg-[#F3F4F6]'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C] mb-8">
            Personal Information
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Select
                label="Title"
                name="title"
                value={personalInfo.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                placeholder="Select title"
                options={TITLE_OPTIONS}
                error={touched.title && !personalInfo.title}
                helperText={touched.title && !personalInfo.title ? 'Title is required' : ''}
              />
              <Input
                label="Professional title/Role (optional)"
                name="professionalTitle"
                value={personalInfo.professionalTitle}
                onChange={handleChange}
                onBlur={() => handleBlur('professionalTitle')}
                placeholder="Professional title/Role"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="First name"
                name="firstName"
                value={personalInfo.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                placeholder="First name"
                error={touched.firstName && !personalInfo.firstName}
                helperText={touched.firstName && !personalInfo.firstName ? 'First name is required' : ''}
              />
              <Input
                label="Last name"
                name="lastName"
                value={personalInfo.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                placeholder="Last name"
                error={touched.lastName && !personalInfo.lastName}
                helperText={touched.lastName && !personalInfo.lastName ? 'Last name is required' : ''}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                size="md"
              >
                Back
              </Button>
              <Button
                variant={isStep1Valid ? 'primary' : 'secondary'}
                type="submit"
                disabled={!isStep1Valid}
                isLoading={isSavingStep}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 2: Expertise and Focus Area */}
      {step === 2 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C] mb-8">
            Expertise and Focus Area
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <MultiSelect
              label="Primary Expertise"
              options={PRIMARY_EXPERTISE_OPTIONS}
              selected={expertiseInfo.primaryExpertise}
              onChange={(selected) => setExpertiseInfo(prev => ({ ...prev, primaryExpertise: selected }))}
              placeholder="Select options"
              error={touched.primaryExpertise && expertiseInfo.primaryExpertise.length === 0}
              helperText={touched.primaryExpertise && expertiseInfo.primaryExpertise.length === 0 ? 'Select at least one primary expertise' : ''}
            />

            <MultiSelect
              label="Functional Strength"
              options={FUNCTIONAL_STRENGTH_OPTIONS}
              selected={expertiseInfo.functionalStrength}
              onChange={(selected) => setExpertiseInfo(prev => ({ ...prev, functionalStrength: selected }))}
              placeholder="Select options"
              error={touched.functionalStrength && expertiseInfo.functionalStrength.length === 0}
              helperText={touched.functionalStrength && expertiseInfo.functionalStrength.length === 0 ? 'Select at least one functional strength' : ''}
            />

            <MultiSelect
              label="Mentorship Focus"
              options={MENTORSHIP_FOCUS_OPTIONS}
              selected={expertiseInfo.mentorshipFocus}
              onChange={(selected) => setExpertiseInfo(prev => ({ ...prev, mentorshipFocus: selected }))}
              placeholder="Select options"
              error={touched.mentorshipFocus && expertiseInfo.mentorshipFocus.length === 0}
              helperText={touched.mentorshipFocus && expertiseInfo.mentorshipFocus.length === 0 ? 'Select at least one mentorship focus' : ''}
            />

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                size="md"
              >
                Back
              </Button>
              <Button
                variant={isStep2Valid ? 'primary' : 'secondary'}
                type="submit"
                disabled={!isStep2Valid}
                isLoading={isSavingStep}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 3: Professional Experience */}
      {step === 3 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C] mb-8">
            Professional Experience
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <Input
              label="Current role"
              name="currentRole"
              value={experienceInfo.currentRole}
              onChange={handleChange}
              onBlur={() => handleBlur('currentRole')}
              placeholder="Input Current role"
              error={touched.currentRole && !experienceInfo.currentRole}
              helperText={touched.currentRole && !experienceInfo.currentRole ? 'Current role is required' : ''}
            />

            <Input
              label="Organization"
              name="organization"
              value={experienceInfo.organization}
              onChange={handleChange}
              onBlur={() => handleBlur('organization')}
              placeholder="Organization"
              error={touched.organization && !experienceInfo.organization}
              helperText={touched.organization && !experienceInfo.organization ? 'Organization is required' : ''}
            />

            <Select
              label="Years of experience"
              name="yearsOfExperience"
              value={experienceInfo.yearsOfExperience}
              onChange={handleChange}
              onBlur={() => handleBlur('yearsOfExperience')}
              placeholder="Select option"
              options={YEARS_OF_EXPERIENCE_OPTIONS}
              error={touched.yearsOfExperience && !experienceInfo.yearsOfExperience}
              helperText={touched.yearsOfExperience && !experienceInfo.yearsOfExperience ? 'Years of experience is required' : ''}
            />

            <Input
              label="Website/Portfolio"
              name="websitePortfolio"
              value={experienceInfo.websitePortfolio}
              onChange={handleChange}
              onBlur={() => handleBlur('websitePortfolio')}
              placeholder="Link to website or portfolio"
              error={!!portfolioError}
              helperText={portfolioError}
            />

            <div className="pt-2 space-y-4">
              <Select
                label="Professional license or certification"
                name="licenseCertification"
                value={currentCertType}
                onChange={(e) => {
                  setCurrentCertType(e.target.value);
                  if (e.target.value !== 'other') setOtherCertName('');
                }}
                placeholder="Select certification type first"
                options={LICENSE_OPTIONS}
                hint="Select a type below, then upload one or more files for it."
              />
              
              {currentCertType === 'other' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input
                    label="Certification name"
                    name="otherCertName"
                    value={otherCertName}
                    onChange={(e) => setOtherCertName(e.target.value)}
                    placeholder="Enter the name of your certification"
                  />
                </div>
              )}
            </div>

            {/* Upload Document Section */}
            {currentCertType && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-[#374151] mb-2.5">
                  Upload files for {currentCertType === 'other' ? (otherCertName || 'this certification') : LICENSE_OPTIONS.find(o => o.value === currentCertType)?.label}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer hover:border-[#0047CC] hover:bg-blue-50/20 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="w-8 h-8 text-gray-400 group-hover:text-[#0047CC] transition-colors" />
                    <span className="text-sm font-medium text-[#374151]">Click to upload or drag and drop</span>
                    <span className="text-xs text-[#9CA3AF]">PDF, DOCX (Max 10MB per file)</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
              </div>
            )}

            {/* List of Added Certificates */}
            {certificates.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#F3F4F6]">
                <h4 className="text-sm font-medium text-[#1C1C1C]">Added Certifications</h4>
                <div className="grid gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                      <div className="bg-[#F9FAFB] px-4 py-2 flex justify-between items-center border-b border-[#E5E7EB]">
                        <span className="text-xs font-medium text-[#4A4A4A] uppercase tracking-wider">
                          {cert.displayLabel}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeCertificate(cert.id)}
                          className="text-[#6B7280] hover:text-red-500 transition-colors cursor-pointer p-1"
                          title="Remove section"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                      <div className="p-3 space-y-2">
                        {cert.files.map((file) => (
                          <div key={file.name} className="flex items-center gap-3 p-2 rounded-lg bg-[#F3F4F6] group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                              {file.isUploading ? (
                                <div className="w-4 h-4 border-2 border-[#0047CC] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FileIcon className="w-4 h-4 text-[#0047CC]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#1C1C1C] truncate">{file.name}</p>
                              <p className="text-[10px] text-[#9CA3AF]">
                                {file.isUploading ? 'Uploading...' : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertFile(cert.id, file.name)}
                              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                              title="Remove file"
                              disabled={file.isUploading}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                size="md"
              >
                Back
              </Button>
              <Button
                variant={isStep3Valid ? 'primary' : 'secondary'}
                type="submit"
                disabled={!isStep3Valid}
                isLoading={isSavingStep}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 4: Availability and Engagement Preferences */}
      {step === 4 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C] mb-8">
            Availability and Engagement Preferences
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <MultiSelect
              label="Mentorship format"
              options={MENTORSHIP_FORMAT_OPTIONS}
              selected={availabilityInfo.mentorshipFormat}
              onChange={(selected) => setAvailabilityInfo(prev => ({ ...prev, mentorshipFormat: selected }))}
              placeholder="Select options"
              error={touched.mentorshipFormat && availabilityInfo.mentorshipFormat.length === 0}
              helperText={touched.mentorshipFormat && availabilityInfo.mentorshipFormat.length === 0 ? 'Select at least one format' : ''}
            />

            <Select
              label="Sessions per month"
              name="sessionsPerMonth"
              value={availabilityInfo.sessionsPerMonth}
              onChange={handleChange}
              onBlur={() => handleBlur('sessionsPerMonth')}
              placeholder="Select options"
              options={SESSIONS_PER_MONTH_OPTIONS}
              error={touched.sessionsPerMonth && !availabilityInfo.sessionsPerMonth}
              helperText={touched.sessionsPerMonth && !availabilityInfo.sessionsPerMonth ? 'Sessions per month is required' : ''}
            />

            <MultiSelect
              label="Preferred session length"
              options={SESSION_LENGTH_OPTIONS}
              selected={availabilityInfo.sessionLength}
              onChange={(selected) => setAvailabilityInfo(prev => ({ ...prev, sessionLength: selected }))}
              placeholder="Select options"
              error={touched.sessionLength && availabilityInfo.sessionLength.length === 0}
              helperText={touched.sessionLength && availabilityInfo.sessionLength.length === 0 ? 'Select at least one session length' : ''}
            />

            <MultiSelect
              label="Candidate access"
              options={CANDIDATE_ACCESS_OPTIONS}
              selected={availabilityInfo.candidateAccess}
              onChange={(selected) => setAvailabilityInfo(prev => ({ ...prev, candidateAccess: selected }))}
              placeholder="Select options"
              error={touched.candidateAccess && availabilityInfo.candidateAccess.length === 0}
              helperText={touched.candidateAccess && availabilityInfo.candidateAccess.length === 0 ? 'Select at least one access type' : ''}
            />

            <Select
              label="Timezone"
              name="timezone"
              value={availabilityInfo.timezone}
              onChange={handleChange}
              onBlur={() => handleBlur('timezone')}
              placeholder="Select options"
              options={TIMEZONE_OPTIONS}
              error={touched.timezone && !availabilityInfo.timezone}
              helperText={touched.timezone && !availabilityInfo.timezone ? 'Timezone is required' : ''}
            />

            <Select
              label="Preferred language"
              name="preferredLanguage"
              value={availabilityInfo.preferredLanguage}
              onChange={handleChange}
              onBlur={() => handleBlur('preferredLanguage')}
              placeholder="Select options"
              options={LANGUAGE_OPTIONS}
              error={touched.preferredLanguage && !availabilityInfo.preferredLanguage}
              helperText={touched.preferredLanguage && !availabilityInfo.preferredLanguage ? 'Preferred language is required' : ''}
            />

            {/* Regional Equity Pricing Toggle */}
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-sm font-medium text-[#374151]">Regional Equity Pricing</span>
                <button
                  type="button"
                  onClick={() => setAvailabilityInfo(prev => ({ ...prev, regionalEquityPricing: !prev.regionalEquityPricing }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                    availabilityInfo.regionalEquityPricing ? 'bg-[#0047CC]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      availabilityInfo.regionalEquityPricing ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-normal">
                Adjust your rates automatically for emerging markets to increase accessibility
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                size="md"
              >
                Back
              </Button>
              <Button
                variant={isStep4Valid ? 'primary' : 'secondary'}
                type="submit"
                disabled={!isStep4Valid}
                isLoading={isSavingStep}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 5: Teach at Scale */}
      {step === 5 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C] mb-2">
            Teach at Scale, On your Terms
          </h1>

          <form onSubmit={handleNext} className="space-y-6 mt-6">
            <p className="text-sm text-[#374151] leading-relaxed">
              Beyond 1-on-1 mentorship, VORA enables selected mentors to turn their expertise into structured learning experiences for global talent.
            </p>

            <div>
              <h3 className="text-sm font-medium text-[#1C1C1C] mb-2">Courses help candidates:</h3>
              <ul className="space-y-1.5 text-sm text-[#374151]">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  build job-ready skills
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  close readiness gaps
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  learn directly from leaders in the field
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#1C1C1C] mb-2">You will decide:</h3>
              <ul className="space-y-1.5 text-sm text-[#374151]">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  if you want to create a course
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  what you will teach
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0"></span>
                  when you will publish the course
                </li>
              </ul>
            </div>

            {/* Choice Cards */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setCourseInterest('later')}
                className={`flex-1 py-4 px-4 rounded-lg border-2 text-sm font-medium text-center transition-all cursor-pointer ${
                  courseInterest === 'later'
                    ? 'border-[#0047CC] bg-[#EBF0FA] text-[#0047CC]'
                    : 'border-[#E5E7EB] text-[#374151] hover:border-gray-300'
                }`}
              >
                Explore creating a course later
              </button>
              <button
                type="button"
                onClick={() => setCourseInterest('interested')}
                className={`flex-1 py-4 px-4 rounded-lg border-2 text-sm font-medium text-center transition-all cursor-pointer ${
                  courseInterest === 'interested'
                    ? 'border-[#0047CC] bg-[#EBF0FA] text-[#0047CC]'
                    : 'border-[#E5E7EB] text-[#374151] hover:border-gray-300'
                }`}
              >
                I'm interested in creating a course
              </button>
            </div>

            {/* Conditional fields when interested */}
            {courseInterest === 'interested' && (
              <>
                <MultiSelect
                  label="Type of interest"
                  options={COURSE_TYPE_OPTIONS}
                  selected={courseDetails.courseType}
                  onChange={(selected) => setCourseDetails(prev => ({ ...prev, courseType: selected }))}
                  placeholder="Select options"
                />

                <Select
                  label="Preferred format"
                  name="preferredFormat"
                  value={courseDetails.preferredFormat}
                  onChange={(e) => setCourseDetails(prev => ({ ...prev, preferredFormat: e.target.value }))}
                  onBlur={() => handleBlur('preferredFormat')}
                  placeholder="Select options"
                  options={PREFERRED_FORMAT_OPTIONS}
                />
              </>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                size="md"
              >
                Back
              </Button>
              <Button
                variant={getStepValidity() ? 'primary' : 'secondary'}
                type="submit"
                disabled={!getStepValidity()}
                isLoading={isSavingStep}
                size="md"
              >
                Save & Continue
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MentorProfile;
