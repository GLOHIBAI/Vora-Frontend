import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTalentOnboardingStep1Mutation, useTalentOnboardingStep2Mutation, useTalentOnboardingStateQuery } from '../../services/queries/onboarding';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import SearchableSelect from '../../components/common/SearchableSelect';
import NationalityTagger from '../../components/common/NationalityTagger';
import { capitalizeFirstLetter } from '../../utils/stringUtils';
import { 
  ChevronLeftIcon, 
  ShieldIcon, 
  GraduationCapIcon, 
  InfoIcon, 
  AlertTriangleIcon 
} from '../../components/common/Icons';
import {
  INTEREST_OPTIONS,
  EXPERIENCE_OPTIONS,
  COUNTRY_OPTIONS,
  NATIONALITIES,
  POPULAR_NATIONALITIES,
  RESIDENCE_OPTIONS,
  RTW_GROUPS,
  RELOCATION_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
  STUDY_HOURS
} from '../../data/talentOnboardingData';

// RTW category helpers
const RTW_STUDY = ['study_permit'];
const RTW_PERMIT = ['work_permit', 'open_permit'];
const RTW_PR = ['ilr_uk', 'green_card', 'pr_canada', 'pr_aus_nz', 'pr_eu', 'pr_other'];

const countryToIsoMap: Record<string, string> = {
  'Australia': 'AU',
  'Belgium': 'BE',
  'Brazil': 'BR',
  'Canada': 'CA',
  'China': 'CN',
  'Denmark': 'DK',
  'Egypt': 'EG',
  'Ethiopia': 'ET',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Ghana': 'GH',
  'India': 'IN',
  'Indonesia': 'ID',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Japan': 'JP',
  'Kenya': 'KE',
  'Malaysia': 'MY',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Nigeria': 'NG',
  'Norway': 'NO',
  'Pakistan': 'PK',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Rwanda': 'RW',
  'Saudi Arabia': 'SA',
  'Singapore': 'SG',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Tanzania': 'TZ',
  'Turkey': 'TR',
  'Uganda': 'UG',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Vietnam': 'VN',
  'Zimbabwe': 'ZW',
};

const getCountryIsoCode = (name: string): string => {
  if (!name) return name;
  const normalized = name.trim();
  if (normalized.length === 2) return normalized.toUpperCase();
  return countryToIsoMap[normalized] || normalized;
};

const getCountryFullName = (code: string): string => {
  if (!code) return code;
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 2) return code;
  const entry = Object.entries(countryToIsoMap).find(([_, iso]) => iso === normalized);
  return entry ? entry[0] : code;
};

const TalentOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  
  const stepParam = Number(searchParams.get('step'));
  const initialStep = stepParam || location.state?.onboardingStep || 1;
  const [step, setStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const step1Mutation = useTalentOnboardingStep1Mutation();
  const step2Mutation = useTalentOnboardingStep2Mutation();
  const { data: onboardingState } = useTalentOnboardingStateQuery();

  useEffect(() => {
    if (onboardingState?.data) {
      const savedFields = onboardingState.data.fields || {};
      if (savedFields.firstName || savedFields.lastName) {
        setFormData({
          firstName: savedFields.firstName || '',
          lastName: savedFields.lastName || '',
        });
      }
      if (savedFields.professionalTitle) setProfessionalTitle(savedFields.professionalTitle);
      if (savedFields.areasOfInterest) setAreasOfInterest(savedFields.areasOfInterest);
      if (savedFields.country) setCountry(savedFields.country);
      if (savedFields.nationalities) setNationalities(savedFields.nationalities);
      if (savedFields.studyPermitType) setStudyPermitType(savedFields.studyPermitType);
      if (savedFields.studyCountry) setStudyCountry(getCountryFullName(savedFields.studyCountry));
      if (savedFields.studyValidity) setStudyValidity(savedFields.studyValidity);
      if (savedFields.studyHoursManual) setStudyHoursManual(savedFields.studyHoursManual);
      if (savedFields.permitType) setPermitType(savedFields.permitType);
      if (savedFields.permitCountry) setPermitCountry(getCountryFullName(savedFields.permitCountry));
      if (savedFields.permitValidity) setPermitValidity(savedFields.permitValidity);
      if (savedFields.prType) setPrType(savedFields.prType);
      if (savedFields.prCountry) setPrCountry(getCountryFullName(savedFields.prCountry));
      if (savedFields.prValidity) setPrValidity(savedFields.prValidity);

      // Map backend-specific names back to local wizard state
      if (savedFields.countryOfResidence) {
        setResidence(getCountryFullName(savedFields.countryOfResidence));
      }
      if (savedFields.residenceCity) setCity(savedFields.residenceCity);
      if (savedFields.rightToWorkStatus) {
        const rtwMap: Record<string, string> = {
          'NATIONAL_ROLE_COUNTRY_NO_VISA': 'national',
          'EU_EEA_FREEDOM_MOVEMENT': 'eu_eea',
          'STUDY_PERMIT': 'study_permit',
          'WORK_PERMIT': 'work_permit',
          'OPEN_PERMIT': 'open_permit',
          'UK_ILR_SETTLED': 'ilr_uk',
          'US_GREEN_CARD': 'green_card',
          'PR_CANADA': 'pr_canada',
          'PR_AUS_NZ': 'pr_aus_nz',
          'PR_EU': 'pr_eu',
          'PR_OTHER': 'pr_other',
          'NEED_SPONSORSHIP': 'need_sponsorship',
          'REMOTE_ONLY': 'remote_only'
        };
        const found = Object.entries(rtwMap).find(([backendVal, _]) => backendVal === savedFields.rightToWorkStatus)?.[1];
        if (found) setRightToWork(found);
      }
      if (savedFields.willingnessToRelocate) {
        const relocMap: Record<string, string> = {
          'OPEN_ANYWHERE': 'open',
          'SPECIFIC_REGIONS': 'specific',
          'STAYING_CURRENT_LOCATION': 'no',
          'REMOTE_ONLY': 'remote'
        };
        const found = relocMap[savedFields.willingnessToRelocate];
        if (found) setRelocation(found);
      }
      if (savedFields.relocateCountryCodes) {
        setRelocationDestinations(savedFields.relocateCountryCodes.join(', '));
      }
      if (savedFields.preferredWorkArrangement) {
        const arrMap: Record<string, string> = {
          'FULLY_REMOTE': 'fully-remote',
          'HYBRID': 'hybrid',
          'ONSITE': 'onsite',
          'FLEXIBLE': 'flexible'
        };
        const found = arrMap[savedFields.preferredWorkArrangement];
        if (found) setWorkArrangement(found);
      }
      if (savedFields.experienceLevel) {
        const expMap: Record<string, string> = {
          'STUDENT_GRADUATE': 'student-graduate',
          'ENTRY_LEVEL': 'entry-academic',
          'MID_LEVEL': 'mid-professional',
          'SENIOR_LEVEL': 'senior-professional'
        };
        const found = expMap[savedFields.experienceLevel];
        if (found) setExperienceLevel(found);
      }

      if (onboardingState.data.step && !stepParam && !location.state?.onboardingStep) {
        setStep(onboardingState.data.step);
      }
    }
  }, [onboardingState, stepParam, location.state]);

  // Step 1 state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  // Step 2 state — Profile
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const otherInterest = ''; // Set to empty string if not used
  const [experienceLevel, setExperienceLevel] = useState('');
  const [country, setCountry] = useState('');

  // Step 2 state — Work Authorisation
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [residence, setResidence] = useState('');
  const [city, setCity] = useState('');
  const [rightToWork, setRightToWork] = useState('');
  const [relocation, setRelocation] = useState('');
  const [relocationDestinations, setRelocationDestinations] = useState('');
  const [workArrangement, setWorkArrangement] = useState('');
  const [integrityChecked, setIntegrityChecked] = useState(false);
  const isCountryLoading = false;

  // Study permit sub-panel
  const [studyPermitType, setStudyPermitType] = useState('');
  const [studyCountry, setStudyCountry] = useState('');
  const [studyValidity, setStudyValidity] = useState('');
  const [studyHoursManual, setStudyHoursManual] = useState('');

  // Work permit sub-panel
  const [permitType, setPermitType] = useState('');
  const [permitCountry, setPermitCountry] = useState('');
  const [permitValidity, setPermitValidity] = useState('');

  // PR sub-panel
  const [prType, setPrType] = useState('');
  const [prCountry, setPrCountry] = useState('');
  const [prValidity, setPrValidity] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'firstName' || name === 'lastName') {
      value = capitalizeFirstLetter(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Conditional visibility
  const showStudyPanel = RTW_STUDY.includes(rightToWork);
  const showPermitPanel = RTW_PERMIT.includes(rightToWork);
  const showPRPanel = RTW_PR.includes(rightToWork);
  const showSponsorCallout = rightToWork === 'need_sponsorship';
  const showReloDestinations = relocation === 'specific';

  // Study hours lookup
  const studyHoursData = studyCountry ? STUDY_HOURS[studyCountry] : null;

  // Validation
  const isStep1Valid = formData.firstName && formData.lastName;

  const isStep2Valid = useMemo(() => {
    // Profile fields
    if (!professionalTitle || areasOfInterest.length === 0 || !experienceLevel || !country) return false;
    if (areasOfInterest.includes('others') && !otherInterest.trim()) return false;
    // Work auth fields
    if (nationalities.length === 0 || !residence || !city || !rightToWork || !relocation || !workArrangement || !integrityChecked) return false;
    // Conditional relocation
    if (relocation === 'specific' && !relocationDestinations.trim()) return false;
    // Conditional study permit
    if (showStudyPanel) {
      if (!studyPermitType || !studyCountry || !studyValidity) return false;
      if (!studyHoursData && !studyHoursManual.trim()) return false;
    }
    // Conditional work permit
    if (showPermitPanel) {
      if (!permitType || !permitCountry || !permitValidity) return false;
    }
    // Conditional PR
    if (showPRPanel) {
      if (!prType || !prCountry || !prValidity) return false;
    }
    return true;
  }, [professionalTitle, areasOfInterest, otherInterest, experienceLevel, country, nationalities, residence, city, rightToWork, relocation, relocationDestinations, workArrangement, integrityChecked, showStudyPanel, studyPermitType, studyCountry, studyValidity, studyHoursData, studyHoursManual, showPermitPanel, permitType, permitCountry, permitValidity, showPRPanel, prType, prCountry, prValidity]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 1 && isStep1Valid) {
      try {
        await step1Mutation.mutateAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        setStep(2);
        window.scrollTo(0, 0);
      } catch (error) {
        // Errors are automatically caught and toasted by our interceptor
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2 && isStep2Valid) {
      try {
        const payloadExperienceLevel = (() => {
          switch (experienceLevel) {
            case 'student-graduate': return 'STUDENT_GRADUATE';
            case 'entry-academic': return 'ENTRY_LEVEL';
            case 'entry-non-academic': return 'ENTRY_LEVEL';
            case 'mid-professional': return 'MID_LEVEL';
            case 'senior-professional': return 'SENIOR_LEVEL';
            case 'masters': return 'STUDENT_GRADUATE';
            case 'phd': return 'STUDENT_GRADUATE';
            case 'post-doctorate': return 'STUDENT_GRADUATE';
            default: return 'STUDENT_GRADUATE';
          }
        })();

        const payloadRightToWorkStatus = (() => {
          switch (rightToWork) {
            case 'national': return 'NATIONAL_ROLE_COUNTRY_NO_VISA';
            case 'eu_eea': return 'EU_EEA_FREEDOM_MOVEMENT';
            case 'study_permit': return 'STUDY_PERMIT';
            case 'work_permit': return 'WORK_PERMIT';
            case 'open_permit': return 'OPEN_PERMIT';
            case 'ilr_uk': return 'UK_ILR_SETTLED';
            case 'green_card': return 'US_GREEN_CARD';
            case 'pr_canada': return 'PR_CANADA';
            case 'pr_aus_nz': return 'PR_AUS_NZ';
            case 'pr_eu': return 'PR_EU';
            case 'pr_other': return 'PR_OTHER';
            case 'need_sponsorship': return 'NEED_SPONSORSHIP';
            case 'remote_only': return 'REMOTE_ONLY';
            default: return 'NATIONAL_ROLE_COUNTRY_NO_VISA';
          }
        })();

        const payloadWillingnessToRelocate = (() => {
          switch (relocation) {
            case 'open': return 'OPEN_ANYWHERE';
            case 'specific': return 'SPECIFIC_REGIONS';
            case 'no': return 'STAYING_CURRENT_LOCATION';
            case 'remote': return 'REMOTE_ONLY';
            default: return 'OPEN_ANYWHERE';
          }
        })();

        const payloadPreferredWorkArrangement = (() => {
          switch (workArrangement) {
            case 'fully-remote': return 'FULLY_REMOTE';
            case 'hybrid': return 'HYBRID';
            case 'onsite': return 'ONSITE';
            case 'flexible': return 'FLEXIBLE';
            default: return 'FULLY_REMOTE';
          }
        })();

        const payloadRelocateCountryCodes = relocation === 'specific'
          ? relocationDestinations.split(',').map(s => getCountryIsoCode(s.trim())).filter(Boolean)
          : [];

        await step2Mutation.mutateAsync({
          professionalTitle,
          areasOfInterest,
          experienceLevel: payloadExperienceLevel,
          country,
          region: country,
          nationalities,
          countryOfResidence: getCountryIsoCode(residence),
          residenceCity: city,
          rightToWorkStatus: payloadRightToWorkStatus,
          willingnessToRelocate: payloadWillingnessToRelocate,
          relocateCountryCodes: payloadRelocateCountryCodes,
          preferredWorkArrangement: payloadPreferredWorkArrangement,
          workAuthorisationConfirmed: true,

          studyPermitType: showStudyPanel ? studyPermitType : undefined,
          studyCountry: showStudyPanel ? getCountryIsoCode(studyCountry) : undefined,
          studyValidity: showStudyPanel ? studyValidity : undefined,
          studyHoursManual: (showStudyPanel && !studyHoursData) ? studyHoursManual : undefined,
          permitType: showPermitPanel ? permitType : undefined,
          permitCountry: showPermitPanel ? getCountryIsoCode(permitCountry) : undefined,
          permitValidity: showPermitPanel ? permitValidity : undefined,
          prType: showPRPanel ? prType : undefined,
          prCountry: showPRPanel ? getCountryIsoCode(prCountry) : undefined,
          prValidity: showPRPanel ? prValidity : undefined,
        });

        updateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        navigate('/onboarding/welcome', { state: { firstName: formData.firstName, role: 'talent' } });
      } catch (error) {
        // Errors are automatically caught and toasted by our interceptor
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Auto-fill PR country for deterministic statuses
  const handleRTWChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRightToWork(val);
    // Clear sub-panels when switching
    if (!RTW_STUDY.includes(val)) { setStudyPermitType(''); setStudyCountry(''); setStudyValidity(''); setStudyHoursManual(''); }
    if (!RTW_PERMIT.includes(val)) { setPermitType(''); setPermitCountry(''); setPermitValidity(''); }
    if (!RTW_PR.includes(val)) { setPrType(''); setPrCountry(''); setPrValidity(''); }
    // Auto-fill PR country
    const prMap: Record<string, string> = { ilr_uk: 'United Kingdom', green_card: 'United States', pr_canada: 'Canada' };
    if (prMap[val]) setPrCountry(prMap[val]);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#0047CC] transition-colors cursor-pointer group"
            >
              <ChevronLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
              Back
            </button>
          )}
          <span className="text-sm font-medium text-[#1C1C1C]">{step}/2</span>
        </div>
        <div className="flex gap-1 w-full h-1.5">
          <div className={`flex-1 h-full rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#0047CC]' : 'bg-[#F3F4F6]'}`} />
          <div className={`flex-1 h-full rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#0047CC]' : 'bg-[#F3F4F6]'}`} />
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-[26px] font-medium mb-2 text-[#1A1A1A] leading-[32px] tracking-tight ">
          Let's personalise your experience
        </h1>
        <p className="text-[#808080] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Tell us a bit about you so we can match you with the right mentors, jobs, and growth opportunities.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5 max-w-[470px] mx-auto">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="First name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                placeholder="First name"
                error={touched.firstName && !formData.firstName}
                helperText={touched.firstName && !formData.firstName ? 'First name is required' : ''}
              />
              <Input
                label="Last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                placeholder="Last name"
                error={touched.lastName && !formData.lastName}
                helperText={touched.lastName && !formData.lastName ? 'Last name is required' : ''}
              />
            </div>
          </>
        ) : (
          <>
            {/* ===== PROFILE FIELDS ===== */}
            <Input
              label="Professional title"
              name="professionalTitle"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(capitalizeFirstLetter(e.target.value))}
              onBlur={() => handleBlur('professionalTitle')}
              placeholder="e.g Product designer, Registered nurse, Radiologist"
              error={touched.professionalTitle && !professionalTitle}
              helperText={touched.professionalTitle && !professionalTitle ? 'Professional title is required' : ''}
            />

            <MultiSelect
              label="Areas of interest"
              options={INTEREST_OPTIONS}
              selected={areasOfInterest}
              onChange={setAreasOfInterest}
              placeholder="Select options"
              error={touched.areasOfInterest && areasOfInterest.length === 0}
              helperText={touched.areasOfInterest && areasOfInterest.length === 0 ? 'Select at least one area' : ''}
            />

            <Select
              label="Experience level"
              name="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              onBlur={() => handleBlur('experienceLevel')}
              placeholder="Select option"
              options={EXPERIENCE_OPTIONS}
              error={touched.experienceLevel && !experienceLevel}
              helperText={touched.experienceLevel && !experienceLevel ? 'Experience level is required' : ''}
            />

            <SearchableSelect
              label="Country / Region"
              options={COUNTRY_OPTIONS}
              value={country}
              onChange={setCountry}
              placeholder="Search country or city..."
              error={touched.country && !country}
              helperText={touched.country && !country ? 'Country/Region is required' : ''}
            />

            {/* ===== WORK AUTHORISATION SECTION ===== */}
            <div className="border-t border-[#E6E6E6] mt-3 pt-6">
              <div className="flex items-center gap-2 mb-1">
                <ShieldIcon stroke="#0047CC" />
                <h2 className="text-base font-medium text-[#1A1A1A]">Work authorisation</h2>
              </div>
              <p className="text-[13px] text-[#808080] leading-relaxed mb-6">
                VORA uses this to match you <em>only</em> to roles you are legally eligible to work in. Your work authorisation is verified against IP data and identity documents before any match is confirmed. False declarations result in a <strong className="text-red-600">permanent ban</strong> with no right of appeal.
              </p>
            </div>

            {/* 1. Nationality / passports held */}
            <NationalityTagger
              label="Nationality / passports held"
              hint="Add every nationality you hold, primary first, then any secondary. Multiple nationalities unlock more roles."
              selected={nationalities}
              onChange={setNationalities}
              options={NATIONALITIES}
              popularOptions={POPULAR_NATIONALITIES}
              placeholder="Search and add nationality (e.g. Nigerian, British...)"
            />

            {/* 2. Country of current residence + City */}
            <SearchableSelect
              label="Country of current residence"
              options={RESIDENCE_OPTIONS}
              value={residence}
              onChange={setResidence}
              placeholder="Search country..."
              error={touched.residence && !residence}
              helperText={touched.residence && !residence ? 'Residence country is required' : ''}
              isLoading={isCountryLoading}
            />
            {residence && (
              <div className="-mt-1">
                <Input
                  label=""
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City or metropolitan area (required)"
                />
                <p className="text-xs text-[#808080] mt-1 ml-0.5">The exact city is required; country alone is not sufficient for matching.</p>
              </div>
            )}

            {/* 3. Right-to-work status */}
            <Select
              label="Right-to-work status"
              name="rightToWork"
              value={rightToWork}
              onChange={handleRTWChange}
              placeholder="Select your right-to-work status"
              groups={RTW_GROUPS}
              hint="VORA will only surface roles your status qualifies you for."
            />

            {/* Study permit sub-panel */}
            {showStudyPanel && (
              <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-4 space-y-3.5">
                <p className="text-[13px] font-medium text-[#4A4A4A]">Study permit details</p>
                <Input
                  label="Study permit / student visa type"
                  name="studyPermitType"
                  value={studyPermitType}
                  onChange={(e) => setStudyPermitType(e.target.value)}
                  placeholder="e.g. F-1 (USA), Tier 4 / Student Route (UK), Subclass 500 (AU)"
                />
                <SearchableSelect
                  label="Country of study"
                  options={RESIDENCE_OPTIONS}
                  value={studyCountry}
                  onChange={setStudyCountry}
                  placeholder="Search country..."
                />
                <Input
                  label="Permit valid until"
                  name="studyValidity"
                  value={studyValidity}
                  onChange={(e) => setStudyValidity(e.target.value)}
                  placeholder="MM/YYYY"
                />

                {/* Per-country study hours table */}
                {studyHoursData && (
                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-[#4A4A4A] uppercase tracking-wider mb-1.5">
                      Permitted working hours in your country of study
                    </p>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left py-1.5 px-2 bg-[#E6E6E6] text-[#4A4A4A] font-medium text-[11px] uppercase tracking-wider rounded-tl-md">Country</th>
                            <th className="text-left py-1.5 px-2 bg-[#E6E6E6] text-[#4A4A4A] font-medium text-[11px] uppercase tracking-wider">Term time</th>
                            <th className="text-left py-1.5 px-2 bg-[#E6E6E6] text-[#4A4A4A] font-medium text-[11px] uppercase tracking-wider rounded-tr-md">Holidays</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-2 border-b border-[#E6E6E6] text-[#4A4A4A]">{studyCountry}</td>
                            <td className="py-2 px-2 border-b border-[#E6E6E6]">
                              <span className="inline-block bg-[#F5F3FF] border border-[#DDD6FE] text-[#4C1D95] rounded px-1.5 py-0.5 text-[11px] font-medium">
                                {studyHoursData.term}
                              </span>
                            </td>
                            <td className="py-2 px-2 border-b border-[#E6E6E6] text-[#4A4A4A]">{studyHoursData.holidays}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-[#808080] mt-1.5 leading-relaxed">
                      VORA will only match you to roles that fit within these limits. Always verify the current limit on your actual visa document.
                    </p>
                  </div>
                )}

                {/* Fallback manual hours */}
                {studyCountry && !studyHoursData && (
                  <div>
                    <Input
                      label="Maximum weekly work hours on your permit"
                      name="studyHoursManual"
                      value={studyHoursManual}
                      onChange={(e) => setStudyHoursManual(e.target.value)}
                      placeholder="e.g. 20 hours per week during term"
                    />
                    <p className="text-xs text-[#808080] mt-1">Check your visa letter or permit conditions for the exact figure.</p>
                  </div>
                )}
              </div>
            )}

            {/* Study permit callout */}
            {showStudyPanel && (
              <div className="flex gap-2.5 items-start bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-3.5">
                <GraduationCapIcon className="flex-shrink-0 mt-0.5" stroke="#4C1D95" />
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
                  <strong className="text-[#4C1D95]">Study permit matched roles only:</strong> VORA will filter your results to roles where the employer has confirmed they accept candidates on a student visa within your permitted hours.
                </p>
              </div>
            )}

            {/* Work permit sub-panel */}
            {showPermitPanel && (
              <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-4 space-y-3.5">
                <p className="text-[13px] font-medium text-[#4A4A4A]">Permit details</p>
                <Input
                  label="Permit / visa type"
                  name="permitType"
                  value={permitType}
                  onChange={(e) => setPermitType(e.target.value)}
                  placeholder="e.g. Skilled Worker visa (UK), H-1B (US), Employment Pass (SG)"
                />
                <p className="text-xs text-[#808080] -mt-1 ml-0.5">Tourist, student, or spousal visas that do not carry full right to work are not accepted.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Issuing country"
                    name="permitCountry"
                    value={permitCountry}
                    onChange={(e) => setPermitCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                  />
                  <Input
                    label="Valid until"
                    name="permitValidity"
                    value={permitValidity}
                    onChange={(e) => setPermitValidity(e.target.value)}
                    placeholder="MM/YYYY or Indefinite"
                  />
                </div>
              </div>
            )}

            {/* PR / ILR sub-panel */}
            {showPRPanel && (
              <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl p-4 space-y-3.5">
                <p className="text-[13px] font-medium text-[#4A4A4A]">Permanent status details</p>
                <Input
                  label="Status type"
                  name="prType"
                  value={prType}
                  onChange={(e) => setPrType(e.target.value)}
                  placeholder="e.g. ILR, Settled Status, Green Card, PR"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Issuing country"
                    name="prCountry"
                    value={prCountry}
                    onChange={(e) => setPrCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                  />
                  <Input
                    label="Validity"
                    name="prValidity"
                    value={prValidity}
                    onChange={(e) => setPrValidity(e.target.value)}
                    placeholder="Date granted or Indefinite"
                  />
                </div>
                <p className="text-xs text-[#808080] leading-relaxed">Providing your permanent status removes nationality-based restrictions for roles in the country of status.</p>
              </div>
            )}

            {/* PR override callout */}
            {showPRPanel && (
              <div className="flex gap-2.5 items-start bg-[#EBF6FF] border border-[#BDD9FF] rounded-lg p-3.5">
                <InfoIcon className="flex-shrink-0 mt-0.5" stroke="#0047CC" />
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
                  <strong className="text-[#182348]">Permanent Residence Override applies.</strong> VORA will treat you as fully eligible for roles in the country of your permanent status, equivalent to any other local resident.
                </p>
              </div>
            )}

            {/* Sponsorship callout */}
            {showSponsorCallout && (
              <div className="flex gap-2.5 items-start bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3.5">
                <AlertTriangleIcon className="flex-shrink-0 mt-0.5" stroke="#92400E" />
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
                  <strong className="text-[#92400E]">Sponsorship required:</strong> Only roles where the employer has confirmed they will support visa acquisition will appear in your results. This significantly limits your matched pool.
                </p>
              </div>
            )}

            {/* 4. Willingness to relocate */}
            <Select
              label="Willingness to relocate"
              name="relocation"
              value={relocation}
              onChange={(e) => setRelocation(e.target.value)}
              placeholder="Can you relocate?"
              options={RELOCATION_OPTIONS}
              hint="Relocation preferences directly affect which roles appear in your matched results."
            />
            {showReloDestinations && (
              <div className="-mt-2">
                <Input
                  label=""
                  name="relocationDestinations"
                  value={relocationDestinations}
                  onChange={(e) => setRelocationDestinations(e.target.value)}
                  placeholder="List preferred relocation countries or regions..."
                />
              </div>
            )}

            {/* 5. Preferred work arrangement */}
            <Select
              label="Preferred work arrangement"
              name="workArrangement"
              value={workArrangement}
              onChange={(e) => setWorkArrangement(e.target.value)}
              placeholder="Select preference"
              options={WORK_ARRANGEMENT_OPTIONS}
            />

            {/* Integrity declaration */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
              <input
                type="checkbox"
                id="integrityChk"
                checked={integrityChecked}
                onChange={(e) => setIntegrityChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer accent-[#0047CC]"
              />
              <label htmlFor="integrityChk" className="text-[13px] text-[#1A1A1A] leading-relaxed cursor-pointer">
                <strong className="text-[#991B1B]">I confirm this information is truthful and accurate.</strong>{' '}
                I understand VORA verifies work authorisation via IP geolocation, identity documents, and third-party checks before any match is confirmed. Providing false information will result in{' '}
                <strong className="text-[#991B1B]">permanent removal from the platform with no right of appeal</strong>, and may be reported to relevant authorities.
              </label>
            </div>
          </>
        )}

        <Button
          variant={(step === 1 ? isStep1Valid : isStep2Valid) ? 'primary' : 'secondary'}
          type="submit"
          disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
          isLoading={isLoading}
        >
          {step === 1 ? 'Next' : 'Complete Profile'}
        </Button>


      </form>
    </div>
  );
};

export default TalentOnboarding;
