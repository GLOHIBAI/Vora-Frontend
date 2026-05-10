import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import SearchableSelect from '../../components/common/SearchableSelect';

const ORG_TYPE_OPTIONS = [
  { label: 'Government Agency', value: 'government-agency' },
  { label: 'Multilateral Organization', value: 'multilateral-org' },
  { label: 'Non-Governmental Organization (NGO)', value: 'ngo' },
  { label: 'Research Institution', value: 'research-institution' },
  { label: 'Healthcare Provider', value: 'healthcare-provider' },
  { label: 'Private Health Partner', value: 'private-health-partner' },
];

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Nigeria', value: 'NG' },
  { label: 'Canada', value: 'CA' },
  { label: 'Germany', value: 'DE' },
  { label: 'South Africa', value: 'ZA' },
  { label: 'Kenya', value: 'KE' },
  { label: 'Ghana', value: 'GH' },
  { label: 'India', value: 'IN' },
  { label: 'Australia', value: 'AU' },
  { label: 'France', value: 'FR' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Switzerland', value: 'CH' },
];

const INSTITUTIONAL_MANDATE_OPTIONS = [
  { label: 'Service Delivery', value: 'service-delivery' },
  { label: 'Emergency Response', value: 'emergency-response' },
  { label: 'Policy & Governance', value: 'policy-governance' },
  { label: 'Research & Evidence Generation', value: 'research-evidence' },
  { label: 'Health Systems Strengthening', value: 'health-systems' },
  { label: 'Multi-sector Health Programming', value: 'multi-sector' },
];

const FUNDING_MODEL_OPTIONS = [
  { label: 'Publicly Funded', value: 'publicly-funded' },
  { label: 'Donor-Funded', value: 'donor-funded' },
  { label: 'Privately Funded', value: 'privately-funded' },
  { label: 'Hybrid Funding Model', value: 'hybrid' },
];

const WORK_TYPE_OPTIONS = [
  'Clinical service delivery',
  'Community health programs',
  'Disease surveillance & epidemiology',
  'Policy & health systems strengthening',
  'Research & data analysis',
  'Emergency / outbreak response',
  'Monitoring & evaluation',
  'Health education & advocacy',
];

const ROLE_SETTING_OPTIONS = [
  'Facility-based',
  'Field-based',
  'Office-based',
  'Remote / advisory',
];

const LICENSING_OPTIONS = [
  { label: 'Yes, always', value: 'yes-always' },
  { label: 'For specific roles', value: 'specific-roles' },
  { label: 'Not typically', value: 'not-typically' },
];

const INT_LICENSE_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Case-by-case', value: 'case-by-case' },
  { label: 'No', value: 'no' },
];

const REMOTE_ELIGIBLE_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Only advisory roles', value: 'advisory-only' },
  { label: 'No', value: 'no' },
];

const SPONSORSHIP_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Occasionally', value: 'occasionally' },
  { label: 'No', value: 'no' },
];

const FEEDBACK_OPTIONS = [
  { label: 'One time feedback', value: 'one-time' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const VISIBILITY_OPTIONS = [
  { label: 'Fully qualified professionals', value: 'fully-qualified' },
  { label: 'Fully qualified + near-qualified professionals', value: 'near-qualified' },
  { label: 'A broad pool including developing professionals', value: 'developing' },
];

const TRAINING_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Limited', value: 'limited' },
  { label: 'No', value: 'no' },
];

const EXPERIENCE_DOC_OPTIONS = [
  { label: 'Licenses & Certifications', value: 'licenses' },
  { label: 'Institutional Work History', value: 'work-history' },
  { label: 'Published Research', value: 'research' },
  { label: 'Program Impact Metrics', value: 'impact-metrics' },
  { label: 'References', value: 'references' },
  { label: 'Skills Assessments', value: 'assessments' },
];

const TOTAL_STEPS = 5;

const EmployerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Organization Info
  const [orgInfo, setOrgInfo] = useState({
    organizationName: '',
    organizationType: '',
    primaryCountry: '',
    institutionalMandate: [] as string[],
    fundingModel: '',
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
  const [hiringPriority, setHiringPriority] = useState([
    'Technical / Clinical Competence',
    'Regulatory Knowledge',
    'Field Experience',
    'Research Capability',
    'Leadership',
    'Ethical Standards',
  ]);
  const [experienceDocs, setExperienceDocs] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Step 5: Matching Preferences
  const [matchInfo, setMatchInfo] = useState({
    candidateVisibility: '',
    structuredTraining: '',
    placementFeedback: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (step === 1) {
      setOrgInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 2) {
      setWorkforceInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 3) {
      setRegulatoryInfo(prev => ({ ...prev, [name]: value }));
    } else if (step === 5) {
      setMatchInfo(prev => ({ ...prev, [name]: value }));
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
      orgInfo.fundingModel
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
    return experienceDocs.length > 0;
  }, [experienceDocs]);

  const isStep5Valid = useMemo(() => {
    return (
      matchInfo.candidateVisibility &&
      matchInfo.structuredTraining &&
      matchInfo.placementFeedback
    );
  }, [matchInfo]);

  const getStepValidity = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    if (step === 4) return isStep4Valid;
    if (step === 5) return isStep5Valid;
    return false;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      setStep(3);
    } else if (step === 3 && isStep3Valid) {
      setStep(4);
    } else if (step === 4 && isStep4Valid) {
      setStep(5);
    } else if (step === 5 && isStep5Valid) {
      console.log('Employer Onboarding Completed:', { orgInfo, workforceInfo, regulatoryInfo, hiringPriority, experienceDocs, matchInfo });
      navigate('/onboard/welcome', { state: { firstName: orgInfo.organizationName, role: 'employer' } });
    }
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newPriority = [...hiringPriority];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPriority.length) return;

    [newPriority[index], newPriority[targetIndex]] = [newPriority[targetIndex], newPriority[index]];
    setHiringPriority(newPriority);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newPriority = [...hiringPriority];
    const item = newPriority.splice(draggedIndex, 1)[0];
    newPriority.splice(index, 0, item);

    setHiringPriority(newPriority);
    setDraggedIndex(null);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center mb-3">
          <span className="text-sm font-bold text-[#1C1C1C]">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-2 w-full h-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full rounded-full transition-all duration-500 ${i < step ? 'bg-[#0052cc]' : 'bg-[#F3F4F6]'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Step 1: Tell us about your organization */}
      {step === 1 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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

            <SearchableSelect
              label="Primary country of operation"
              options={COUNTRY_OPTIONS}
              value={orgInfo.primaryCountry}
              onChange={(val) => setOrgInfo(prev => ({ ...prev, primaryCountry: val }))}
              placeholder="Select country"
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

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep1Valid}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${isStep1Valid ? 'bg-[#0052cc] text-white hover:bg-[#003d99]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Proceed
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 2: Workforce Model */}
      {step === 2 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
            Workforce Model
          </h1>

          <form onSubmit={handleNext} className="space-y-8" autoComplete="off">
            {/* Work type checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-4">
                What type of work do you primarily support?
              </label>
              <div className="space-y-3">
                {WORK_TYPE_OPTIONS.map((option) => {
                  const isSelected = workforceInfo.workTypes.includes(option);
                  return (
                    <div
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => {
                        setWorkforceInfo(prev => ({
                          ...prev,
                          workTypes: isSelected
                            ? prev.workTypes.filter(w => w !== option)
                            : [...prev.workTypes, option]
                        }));
                      }}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue' : 'border-[#D1D5DB] bg-white group-hover:border-brand-blue'}`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-text-secondary group-hover:text-text-main transition-colors">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role setting checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-4">
                How are most of your roles
              </label>
              <div className="space-y-3">
                {ROLE_SETTING_OPTIONS.map((option) => {
                  const isSelected = workforceInfo.roleSettings.includes(option);
                  return (
                    <div
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => {
                        setWorkforceInfo(prev => ({
                          ...prev,
                          roleSettings: isSelected
                            ? prev.roleSettings.filter(r => r !== option)
                            : [...prev.roleSettings, option]
                        }));
                      }}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0052cc] border-[#0052cc]' : 'border-[#D1D5DB] bg-white group-hover:border-[#0052cc]'}`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#374151] group-hover:text-[#1C1C1C] transition-colors">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep2Valid}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${isStep2Valid ? 'bg-[#0052cc] text-white hover:bg-[#003d99]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Proceed
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 3: Regulatory and professional standards */}
      {step === 3 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep3Valid}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${isStep3Valid ? 'bg-[#0052cc] text-white hover:bg-[#003d99]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Proceed
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 4: Hiring Priority */}
      {step === 4 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-2">
            Hiring Priority
          </h1>
          <p className="text-sm text-[#6B7280] mb-8 font-['Nunito_Sans']">
            Rank in order of importance
          </p>

          <form onSubmit={handleNext} className="space-y-8" autoComplete="off">
            {/* Ranking list */}
            <div className="space-y-3">
              {hiringPriority.map((item, index) => (
                <div
                  key={item}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  className={`flex items-center justify-between px-4 py-3.5 bg-white border rounded-lg group transition-all cursor-move ${draggedIndex === index ? 'opacity-40 border-brand-blue' : 'border-border-default hover:border-brand-blue'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                    <span className="text-sm font-medium text-text-secondary">{item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); movePriority(index, 'up'); }}
                      disabled={index === 0}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-brand-blue'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); movePriority(index, 'down'); }}
                      disabled={index === hiringPriority.length - 1}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === hiringPriority.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-brand-blue'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <MultiSelect
                label="Experience documentation"
                options={EXPERIENCE_DOC_OPTIONS}
                selected={experienceDocs}
                onChange={setExperienceDocs}
                placeholder="Select all option"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep4Valid}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${isStep4Valid ? 'bg-[#0052cc] text-white hover:bg-[#003d99]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Proceed
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 5: How should VORA match professionals to you? */}
      {step === 5 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
            How should VORA match professionals to you?
          </h1>

          <form onSubmit={handleNext} className="space-y-6" autoComplete="off">
            <Select
              label="Preffered candidate visibility"
              name="candidateVisibility"
              value={matchInfo.candidateVisibility}
              onChange={handleChange}
              onBlur={() => handleBlur('candidateVisibility')}
              placeholder="Select an option"
              options={VISIBILITY_OPTIONS}
              error={touched.candidateVisibility && !matchInfo.candidateVisibility}
              helperText={touched.candidateVisibility && !matchInfo.candidateVisibility ? 'This field is required' : ''}
            />

            <Select
              label="Do you provide structured training or CPD?"
              name="structuredTraining"
              value={matchInfo.structuredTraining}
              onChange={handleChange}
              onBlur={() => handleBlur('structuredTraining')}
              placeholder="Select an option"
              options={TRAINING_OPTIONS}
              error={touched.structuredTraining && !matchInfo.structuredTraining}
              helperText={touched.structuredTraining && !matchInfo.structuredTraining ? 'This field is required' : ''}
            />

            <Select
              label="Post-placement feedback"
              name="placementFeedback"
              value={matchInfo.placementFeedback}
              onChange={handleChange}
              onBlur={() => handleBlur('placementFeedback')}
              placeholder="Select option"
              options={FEEDBACK_OPTIONS}
              error={touched.placementFeedback && !matchInfo.placementFeedback}
              helperText={touched.placementFeedback && !matchInfo.placementFeedback ? 'This field is required' : ''}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isStep5Valid}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${isStep5Valid ? 'bg-brand-blue text-white hover:bg-brand-blue-hover' : 'bg-border-default text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Proceed
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default EmployerOnboarding;
