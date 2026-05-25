import { useState, useMemo, useEffect, useCallback } from 'react';
import { Country } from 'country-state-city';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { capitalizeFirstLetter } from '../../utils/stringUtils';
import {
  ORG_TYPE_OPTIONS,
  INSTITUTIONAL_MANDATE_OPTIONS,
  FUNDING_MODEL_OPTIONS,
  WORK_TYPE_OPTIONS,
  ROLE_SETTING_OPTIONS,
  LICENSING_OPTIONS,
  INT_LICENSE_OPTIONS,
  REMOTE_ELIGIBLE_OPTIONS,
  SPONSORSHIP_OPTIONS,
  FEEDBACK_OPTIONS,
  EXPERIENCE_DOC_OPTIONS,
  HIRING_PRIORITY_OPTIONS
} from '../../data/employerOnboardingData';
import Button from '../../components/common/Button';
import FullPageSpinner from '../../components/common/FullPageSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { useFullPageLoading } from '../../hooks/useFullPageLoading';
import { useOnboardingStepSubmit } from '../../hooks/useOnboardingStepSubmit';
import { useOnboardingStateHydration } from '../../hooks/useOnboardingStateHydration';
import {
  EMPLOYER_ONBOARDING_STATE_KEY,
  getOnboardingFieldsFromState,
  refetchOnboardingState,
} from '../../utils/onboardingStateQuery';
import { CloseIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from '../../components/common/Icons';
import {
  useEmployerOnboardingStep1Mutation,
  useEmployerOnboardingStep2Mutation,
  useEmployerOnboardingStep3Mutation,
  useEmployerOnboardingStep4Mutation,
  useEmployerOnboardingStateQuery
} from '../../services/queries/onboarding';

const TOTAL_STEPS = 4;

/** Map stored ISO codes to full country names for LocationAutocomplete display. */
function normalizeCountryDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length === 2) {
    return Country.getCountryByCode(trimmed.toUpperCase())?.name ?? trimmed;
  }
  return trimmed;
}

const EmployerOnboarding: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updateUser, user } = useAuth();
  
  const stepParam = Number(searchParams.get('step'));
  const initialStep = stepParam || location.state?.onboardingStep || 1;
  const [step, setStep] = useState(initialStep);

  const step1Mutation = useEmployerOnboardingStep1Mutation();
  const step2Mutation = useEmployerOnboardingStep2Mutation();
  const step3Mutation = useEmployerOnboardingStep3Mutation();
  const step4Mutation = useEmployerOnboardingStep4Mutation();
  const {
    data: onboardingState,
    isPending: isStatePending,
    isFetching: isStateFetching,
  } = useEmployerOnboardingStateQuery();
  const { isSubmittingStep, runStepSubmit } = useOnboardingStepSubmit();

  useEffect(() => {
    if (!onboardingState?.data?.onboardingCompleted) return;
    const savedFields = onboardingState.data.fields || {};
    if (
      !user ||
      user.role !== 'employer' ||
      user.firstName !== (savedFields.organisationName || 'Employer')
    ) {
      updateUser({
        firstName: savedFields.organisationName || 'Employer',
        lastName: '',
      });
    }
    navigate('/dashboard');
  }, [onboardingState?.data?.onboardingCompleted, onboardingState?.data?.fields, navigate, updateUser, user]);

  useEffect(() => {
    if (onboardingState?.data?.onboardingStep && !stepParam) {
      setStep(onboardingState.data.onboardingStep);
    }
  }, [onboardingState?.data?.onboardingStep, stepParam]);

  // Step 1: Organization Info
  const [orgInfo, setOrgInfo] = useState({
    organizationName: '',
    organizationType: '',
    primaryCountry: '',
    institutionalMandate: [] as string[],
    fundingModel: '',
    linkedinCompanyUrl: '',
    websiteUrl: '',
  });

  // Step 2: Workforce Architecture
  const [workforceInfo, setWorkforceInfo] = useState({
    workTypes: [] as string[],
    roleSettings: [] as string[],
  });

  // Step 3: Regulatory & Professional Standards
  const [regulatoryInfo, setRegulatoryInfo] = useState({
    localLicensing: '',
    internationalLicensing: '',
    remoteEligibility: '',
    sponsorship: '',
  });

  // Step 4: Hiring Priority
  const [hiringPool, setHiringPool] = useState<string[]>(HIRING_PRIORITY_OPTIONS);
  const [hiringPriority, setHiringPriority] = useState<string[]>([]);
  const [otherPriority, setOtherPriority] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [experienceDocs, setExperienceDocs] = useState<string[]>([]);
  const [placementFeedback, setPlacementFeedback] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const applyEmployerStepFields = useCallback(
    (targetStep: number, savedFields: Record<string, unknown>) => {
      if (targetStep === 1) {
        if (
          savedFields.organisationName ||
          savedFields.country ||
          savedFields.organisationType ||
          savedFields.fundingModel ||
          savedFields.institutionalMandates ||
          savedFields.linkedinCompanyUrl ||
          savedFields.websiteUrl
        ) {
          setOrgInfo({
            organizationName: (savedFields.organisationName as string) || '',
            organizationType: (savedFields.organisationType as string) || '',
            primaryCountry: normalizeCountryDisplay((savedFields.country as string) || ''),
            institutionalMandate: (savedFields.institutionalMandates as string[]) || [],
            fundingModel: (savedFields.fundingModel as string) || '',
            linkedinCompanyUrl: (savedFields.linkedinCompanyUrl as string) || '',
            websiteUrl: (savedFields.websiteUrl as string) || '',
          });
        }
        return;
      }

      if (targetStep === 2) {
        if (savedFields.primaryWorkTypes || savedFields.workforceModels) {
          setWorkforceInfo({
            workTypes: (savedFields.primaryWorkTypes as string[]) || [],
            roleSettings: (savedFields.workforceModels as string[]) || [],
          });
        }
        return;
      }

      if (targetStep === 3) {
        if (
          savedFields.localProfessionalLicensing ||
          savedFields.internationallyLicensedProfessionals ||
          savedFields.remoteInternationalEligibleRoles ||
          savedFields.relocationWorkPermitsSponsorship
        ) {
          setRegulatoryInfo({
            localLicensing: (savedFields.localProfessionalLicensing as string) || '',
            internationalLicensing:
              (savedFields.internationallyLicensedProfessionals as string) || '',
            remoteEligibility: (savedFields.remoteInternationalEligibleRoles as string) || '',
            sponsorship: (savedFields.relocationWorkPermitsSponsorship as string) || '',
          });
        }
        return;
      }

      if (targetStep === 4) {
        if (
          savedFields.hiringPriorityRanking ||
          savedFields.experienceDocumentationTypes ||
          savedFields.postPlacementFeedback
        ) {
          if (savedFields.hiringPriorityRanking) {
            setHiringPriority(savedFields.hiringPriorityRanking as string[]);
          }
          if (savedFields.experienceDocumentationTypes) {
            setExperienceDocs(savedFields.experienceDocumentationTypes as string[]);
          }
          if (savedFields.postPlacementFeedback) {
            setPlacementFeedback(savedFields.postPlacementFeedback as string);
          }
        }
      }
    },
    [],
  );

  useOnboardingStateHydration({
    step,
    isStateFetching,
    stateData: onboardingState?.data,
    isComplete: onboardingState?.data?.onboardingCompleted,
    getSavedFields: getOnboardingFieldsFromState,
    hydrateStep: applyEmployerStepFields,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'organizationName') {
      value = capitalizeFirstLetter(value);
    }
    if (name === 'placementFeedback') {
      setPlacementFeedback(value);
    } else if (step === 1) {
      setOrgInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 2) {
      setWorkforceInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 3) {
      setRegulatoryInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isStep1Valid = useMemo(() => {
    return (
      orgInfo.organizationName &&
      orgInfo.organizationType &&
      orgInfo.primaryCountry &&
      orgInfo.institutionalMandate.length > 0 &&
      orgInfo.fundingModel &&
      orgInfo.linkedinCompanyUrl
    );
  }, [orgInfo]);

  const isStep2Valid = useMemo(() => {
    return (
      workforceInfo.workTypes.length > 0 &&
      workforceInfo.roleSettings.length > 0
    );
  }, [workforceInfo]);

  const isStep3Valid = useMemo(() => {
    return (
      regulatoryInfo.localLicensing &&
      regulatoryInfo.internationalLicensing &&
      regulatoryInfo.remoteEligibility &&
      regulatoryInfo.sponsorship
    );
  }, [regulatoryInfo]);

  const isStep4Valid = useMemo(() => {
    return experienceDocs.length > 0 && !!placementFeedback;
  }, [experienceDocs, placementFeedback]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await runStepSubmit(async () => {
      try {
        if (step === 1 && isStep1Valid) {
          await step1Mutation.mutateAsync({
            organisationName: orgInfo.organizationName,
            country: orgInfo.primaryCountry,
            organisationType: orgInfo.organizationType,
            institutionalMandates: orgInfo.institutionalMandate,
            fundingModel: orgInfo.fundingModel,
            linkedinCompanyUrl: orgInfo.linkedinCompanyUrl || undefined,
            websiteUrl: orgInfo.websiteUrl || undefined,
          });
          await refetchOnboardingState(queryClient, EMPLOYER_ONBOARDING_STATE_KEY);
          setStep(2);
          window.scrollTo(0, 0);
        } else if (step === 2 && isStep2Valid) {
          await step2Mutation.mutateAsync({
            primaryWorkTypes: workforceInfo.workTypes,
            workforceModels: workforceInfo.roleSettings,
          });
          await refetchOnboardingState(queryClient, EMPLOYER_ONBOARDING_STATE_KEY);
          setStep(3);
          window.scrollTo(0, 0);
        } else if (step === 3 && isStep3Valid) {
          await step3Mutation.mutateAsync({
            localProfessionalLicensing: regulatoryInfo.localLicensing,
            internationallyLicensedProfessionals: regulatoryInfo.internationalLicensing,
            remoteInternationalEligibleRoles: regulatoryInfo.remoteEligibility,
            relocationWorkPermitsSponsorship: regulatoryInfo.sponsorship,
          });
          await refetchOnboardingState(queryClient, EMPLOYER_ONBOARDING_STATE_KEY);
          setStep(4);
          window.scrollTo(0, 0);
        } else if (step === 4 && isStep4Valid) {
          await step4Mutation.mutateAsync({
            hiringPriorityRanking: hiringPriority,
            experienceDocumentationTypes: experienceDocs,
            postPlacementFeedback: placementFeedback,
          });
          await refetchOnboardingState(queryClient, EMPLOYER_ONBOARDING_STATE_KEY);
          updateUser({
            firstName: orgInfo.organizationName,
            lastName: '',
          });
          navigate('/onboarding/welcome', {
            state: { firstName: orgInfo.organizationName, role: 'employer' },
          });
        }
      } catch {
        // Errors surfaced via API client / mutation onError toasts
      }
    });
  };

  const showFullPage = useFullPageLoading(isStatePending, isSubmittingStep);
  const isStepBusy = isSubmittingStep;

  if (showFullPage) {
    return <FullPageSpinner />;
  }

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newPriority = [...hiringPriority];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPriority.length) return;

    [newPriority[index], newPriority[targetIndex]] = [newPriority[targetIndex], newPriority[index]];
    setHiringPriority(newPriority);
  };

  const togglePrioritySelection = (item: string) => {
    if (hiringPriority.includes(item)) {
      setHiringPriority(hiringPriority.filter(i => i !== item));
    } else {
      setHiringPriority([...hiringPriority, item]);
    }
  };

  const handleAddOtherPriority = () => {
    if (otherPriority.trim() && !hiringPool.includes(otherPriority.trim())) {
      const trimmed = otherPriority.trim();
      setHiringPool([...hiringPool, trimmed]);
      setHiringPriority([...hiringPriority, trimmed]);
      setOtherPriority('');
      setShowOtherInput(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep((prev: number) => prev - 1);
    }
  };

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

      {/* Step 1: Tell us about your organization */}
      {step === 1 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C]  mb-8">
            Tell us about your organization
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <Input
              label="Organization name"
              name="organizationName"
              value={orgInfo.organizationName}
              onChange={handleChange}
              onBlur={() => handleBlur('organizationName')}
              placeholder="Organization Name"
              error={touched.organizationName && !orgInfo.organizationName}
              helperText={touched.organizationName && !orgInfo.organizationName ? 'Organization name is required' : ''}
            />

            <Select
              label="Organization type"
              name="organizationType"
              value={orgInfo.organizationType}
              onChange={handleChange}
              onBlur={() => handleBlur('organizationType')}
              placeholder="Select type"
              options={ORG_TYPE_OPTIONS}
              error={touched.organizationType && !orgInfo.organizationType}
              helperText={touched.organizationType && !orgInfo.organizationType ? 'Organization type is required' : ''}
            />

            <LocationAutocomplete
              label="Primary country of operation"
              value={orgInfo.primaryCountry}
              onChange={(val) => setOrgInfo((prev) => ({ ...prev, primaryCountry: val }))}
              onBlur={() => handleBlur('primaryCountry')}
              placeholder="Search country..."
              searchMode="country"
              labelClassName="block text-sm font-medium text-[#374151] mb-2.5"
              error={touched.primaryCountry && !orgInfo.primaryCountry}
              helperText={
                touched.primaryCountry && !orgInfo.primaryCountry
                  ? 'Primary country of operation is required'
                  : ''
              }
            />

            <MultiSelect
              label="Institutional mandate"
              options={INSTITUTIONAL_MANDATE_OPTIONS}
              selected={orgInfo.institutionalMandate}
              onChange={(selected) => setOrgInfo(prev => ({ ...prev, institutionalMandate: selected }))}
              placeholder="Select option"
              error={touched.institutionalMandate && orgInfo.institutionalMandate.length === 0}
              helperText={touched.institutionalMandate && orgInfo.institutionalMandate.length === 0 ? 'Select at least one mandate' : ''}
            />

            <Select
              label="Funding model"
              name="fundingModel"
              value={orgInfo.fundingModel}
              onChange={handleChange}
              onBlur={() => handleBlur('fundingModel')}
              placeholder="Select option"
              options={FUNDING_MODEL_OPTIONS}
              error={touched.fundingModel && !orgInfo.fundingModel}
              helperText={touched.fundingModel && !orgInfo.fundingModel ? 'Funding model is required' : ''}
            />

            <Input
              label="Company LinkedIn URL"
              name="linkedinCompanyUrl"
              value={orgInfo.linkedinCompanyUrl}
              onChange={handleChange}
              onBlur={() => handleBlur('linkedinCompanyUrl')}
              placeholder="https://linkedin.com/company/your-company"
              error={touched.linkedinCompanyUrl && !orgInfo.linkedinCompanyUrl}
              helperText={touched.linkedinCompanyUrl && !orgInfo.linkedinCompanyUrl ? 'Company LinkedIn URL is required' : ''}
            />

            <Input
              label={
                <span>
                  Website URL <span className="text-gray-400 italic font-normal text-xs ml-1">optional</span>
                </span>
              }
              name="websiteUrl"
              value={orgInfo.websiteUrl}
              onChange={handleChange}
              placeholder="https://your-company.com"
            />



            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                size="md"
                disabled={isStepBusy}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isStep1Valid}
                isLoading={isStepBusy}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 2: Workforce Model */}
      {step === 2 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C]  mb-8">
            Workforce Model
          </h1>

          <form onSubmit={handleNext} className="space-y-8" autoComplete="off">
            {/* Work type MultiSelect */}
            <div className="space-y-4">
              <MultiSelect
                label="What type of work do you primarily support?"
                options={WORK_TYPE_OPTIONS}
                selected={workforceInfo.workTypes}
                onChange={(selected) => setWorkforceInfo(prev => ({ ...prev, workTypes: selected }))}
                placeholder="Select work types"
              />
            </div>

            {/* Role setting MultiSelect */}
            <div className="space-y-4">
              <MultiSelect
                label="How are most of your roles"
                options={ROLE_SETTING_OPTIONS}
                selected={workforceInfo.roleSettings}
                onChange={(selected) => setWorkforceInfo(prev => ({ ...prev, roleSettings: selected }))}
                placeholder="Select role settings"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                size="md"
                disabled={isStepBusy}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isStep2Valid}
                isLoading={isStepBusy}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 3: Regulatory and professional standards */}
      {step === 3 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C]  mb-8">
            Regulatory and professional standards
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <Select
              label="Do your roles require local professional licensing?"
              name="localLicensing"
              value={regulatoryInfo.localLicensing}
              onChange={handleChange}
              onBlur={() => handleBlur('localLicensing')}
              placeholder="Select option"
              options={LICENSING_OPTIONS}
              error={touched.localLicensing && !regulatoryInfo.localLicensing}
              helperText={touched.localLicensing && !regulatoryInfo.localLicensing ? 'This field is required' : ''}
            />

            <Select
              label="Do you accept internationally licensed professionals?"
              name="internationalLicensing"
              value={regulatoryInfo.internationalLicensing}
              onChange={handleChange}
              onBlur={() => handleBlur('internationalLicensing')}
              placeholder="Select option"
              options={INT_LICENSE_OPTIONS}
              error={touched.internationalLicensing && !regulatoryInfo.internationalLicensing}
              helperText={touched.internationalLicensing && !regulatoryInfo.internationalLicensing ? 'This field is required' : ''}
            />

            <Select
              label="Are remote international professionals eligible for most roles?"
              name="remoteEligibility"
              value={regulatoryInfo.remoteEligibility}
              onChange={handleChange}
              onBlur={() => handleBlur('remoteEligibility')}
              placeholder="Select option"
              options={REMOTE_ELIGIBLE_OPTIONS}
              error={touched.remoteEligibility && !regulatoryInfo.remoteEligibility}
              helperText={touched.remoteEligibility && !regulatoryInfo.remoteEligibility ? 'This field is required' : ''}
            />

            <Select
              label="Do you sponsor or support relocation/work permits?"
              name="sponsorship"
              value={regulatoryInfo.sponsorship}
              onChange={handleChange}
              onBlur={() => handleBlur('sponsorship')}
              placeholder="Select option"
              options={SPONSORSHIP_OPTIONS}
              error={touched.sponsorship && !regulatoryInfo.sponsorship}
              helperText={touched.sponsorship && !regulatoryInfo.sponsorship ? 'This field is required' : ''}
            />

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                size="md"
                disabled={isStepBusy}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isStep3Valid}
                isLoading={isStepBusy}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Step 4: Hiring Priority */}
      {step === 4 && (
        <>
          <h1 className="text-xl sm:text-2xl font-medium text-[#1C1C1C]  mb-2">
            Hiring Priority
          </h1>
          <p className="text-sm text-[#6B7280] mb-8 ">
            Rank in order of importance
          </p>

          <form onSubmit={handleNext} className="space-y-8" autoComplete="off">
            {/* Pool of options */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-[#374151]">
                Select priorities to rank
              </label>
              <div className="flex flex-wrap gap-2">
                {hiringPool.map((item) => {
                  const isSelected = hiringPriority.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => togglePrioritySelection(item)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected ? 'bg-[#0047CC] text-white border-[#0047CC]' : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#0047CC]'}`}
                    >
                      {item}
                    </button>
                  );
                })}
                {!showOtherInput ? (
                  <button
                    type="button"
                    onClick={() => setShowOtherInput(true)}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-[#0047CC] text-[#0047CC] hover:bg-[#ebf5ff] transition-colors"
                  >
                    + Add Other
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 animate-in fade-in slide-in-from-left-2">
                    <Input
                      label=""
                      value={otherPriority}
                      onChange={(e) => setOtherPriority(e.target.value)}
                      placeholder="Enter custom priority"
                      className="rounded-full w-full sm:w-64"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOtherPriority()}
                    />
                    <Button
                      variant="primary"
                      fullWidth={false}
                      onClick={handleAddOtherPriority}
                      className="px-6 min-h-[40px] text-sm"
                    >
                      Add
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setShowOtherInput(false); setOtherPriority(''); }}
                      className="text-[#6B7280] hover:text-[#1C1C1C] cursor-pointer"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ranked list */}
            {hiringPriority.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="text-sm font-medium text-[#374151]">
                  Ranked Order (1 is highest)
                </label>
                <div className="space-y-3">
                  {hiringPriority.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-lg group hover:border-[#0047CC] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#ebf5ff] text-[#0047CC] text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-[#374151]">{item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border-r pr-2 mr-2 border-gray-100">
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-[#6B7280] hover:text-[#0047CC]'}`}
                          >
                            <ArrowUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'down')}
                            disabled={index === hiringPriority.length - 1}
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === hiringPriority.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-[#6B7280] hover:text-[#0047CC]'}`}
                          >
                            <ArrowDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePrioritySelection(item)}
                          className="text-[#9CA3AF] hover:text-red-500 transition-colors"
                          title="Remove from ranking"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <MultiSelect
                label="Experience documentation"
                options={EXPERIENCE_DOC_OPTIONS}
                selected={experienceDocs}
                onChange={setExperienceDocs}
                placeholder="Select all option"
              />
            </div>

            <div className="pt-4">
              <Select
                label="Post-placement feedback"
                name="placementFeedback"
                value={placementFeedback}
                onChange={handleChange}
                onBlur={() => handleBlur('placementFeedback')}
                placeholder="Select option"
                options={FEEDBACK_OPTIONS}
                error={touched.placementFeedback && !placementFeedback}
                helperText={touched.placementFeedback && !placementFeedback ? 'This field is required' : ''}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                size="md"
                disabled={isStepBusy}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isStep4Valid}
                isLoading={isStepBusy}
                size="md"
              >
                Proceed
              </Button>
            </div>
          </form>
        </>
      )}

    </div>
  );
};

export default EmployerOnboarding;
