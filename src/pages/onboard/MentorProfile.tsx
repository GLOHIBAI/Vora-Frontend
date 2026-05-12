import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import { capitalizeFirstLetter } from '../../utils/stringUtils';
import { validatePassword, validatePortfolioUrl } from '../../utils/validation';
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

const TOTAL_STEPS = 5;

const MentorProfile: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    title: '',
    lastName: '',
    firstName: '',
    email: '',
    professionalTitle: '',
    password: '',
    confirmPassword: '',
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
  const [certificates, setCertificates] = useState<{ id: string; type: string; displayLabel: string; files: File[] }[]>([]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'organization') {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0 || !currentCertType) return;

    const certLabel = currentCertType === 'other' 
      ? otherCertName || 'Other Certification'
      : LICENSE_OPTIONS.find(o => o.value === currentCertType)?.label || '';

    setCertificates(prev => {
      // Check if we already have a certificate of this type (and name if other)
      const existing = prev.find(c => 
        c.type === currentCertType && 
        (currentCertType !== 'other' || c.displayLabel === otherCertName)
      );
      
      if (existing) {
        return prev.map(c => 
          c.id === existing.id 
            ? { ...c, files: [...c.files, ...newFiles] } 
            : c
        );
      }
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        type: currentCertType, 
        displayLabel: certLabel,
        files: newFiles 
      }];
    });
    
    // Reset file input and type selection if desired, or keep type selected for more uploads
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const passwordError = useMemo(() => {
    if (!touched.password) return '';
    return validatePassword(personalInfo.password);
  }, [personalInfo.password, touched.password]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return '';
    if (!personalInfo.confirmPassword) return 'Please confirm your password';
    if (personalInfo.password !== personalInfo.confirmPassword) return 'Passwords do not match';
    return '';
  }, [personalInfo.password, personalInfo.confirmPassword, touched.confirmPassword]);

  const portfolioError = useMemo(() => {
    if (!touched.websitePortfolio) return '';
    return validatePortfolioUrl(experienceInfo.websitePortfolio);
  }, [experienceInfo.websitePortfolio, touched.websitePortfolio]);

  const isStep1Valid = useMemo(() => {
    return (
      personalInfo.title &&
      personalInfo.lastName &&
      personalInfo.firstName &&
      personalInfo.email &&
      personalInfo.professionalTitle &&
      personalInfo.password &&
      personalInfo.confirmPassword &&
      !validatePassword(personalInfo.password) &&
      personalInfo.password === personalInfo.confirmPassword
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
      certificates.length > 0
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
    } else if (step === 5 && courseInterest) {
      console.log('Mentor Onboarding Completed:', { personalInfo, expertiseInfo, experienceInfo, availabilityInfo, courseInterest });
      navigate('/onboard/welcome', { state: { firstName: `${personalInfo.firstName} ${personalInfo.lastName}`, role: 'mentor' } });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/onboard/mentor-apply');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const isValid = getStepValidity();

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

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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
                label="Email address"
                name="email"
                type="email"
                value={personalInfo.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="test@vora.com"
                error={touched.email && !personalInfo.email}
                helperText={touched.email && !personalInfo.email ? 'Email is required' : ''}
              />
            </div>

            <Input
              label="Professional title/Role"
              name="professionalTitle"
              value={personalInfo.professionalTitle}
              onChange={handleChange}
              onBlur={() => handleBlur('professionalTitle')}
              placeholder="Professional title/Role"
              error={touched.professionalTitle && !personalInfo.professionalTitle}
              helperText={touched.professionalTitle && !personalInfo.professionalTitle ? 'Professional title is required' : ''}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={personalInfo.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Password"
                  showPasswordToggle
                  error={!!passwordError}
                />
              </div>
              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={personalInfo.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm password"
                showPasswordToggle
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
            </div>
            <p className={`text-[11px] sm:text-xs leading-normal -mt-2 ${personalInfo.password && validatePassword(personalInfo.password) ? 'text-red-500 font-medium' : 'text-[#6B7280]'}`}>
              Password must contain at least one uppercase, lowercase, number and special character
            </p>

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

      {/* Step 2: Expertise and Focus Area */}
      {step === 2 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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

      {/* Step 3: Professional Experience */}
      {step === 3 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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
                <label className="block text-sm font-semibold text-[#374151] mb-2.5">
                  Upload files for {currentCertType === 'other' ? (otherCertName || 'this certification') : LICENSE_OPTIONS.find(o => o.value === currentCertType)?.label}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer hover:border-[#0052cc] hover:bg-blue-50/20 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-[#0052cc] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
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
                <h4 className="text-sm font-bold text-[#1C1C1C]">Added Certifications</h4>
                <div className="grid gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                      <div className="bg-[#F9FAFB] px-4 py-2 flex justify-between items-center border-b border-[#E5E7EB]">
                        <span className="text-xs font-extrabold text-[#4A4A4A] uppercase tracking-wider">
                          {cert.displayLabel}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeCertificate(cert.id)}
                          className="text-[#6B7280] hover:text-red-500 transition-colors cursor-pointer p-1"
                          title="Remove section"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="p-3 space-y-2">
                        {cert.files.map((file) => (
                          <div key={file.name} className="flex items-center gap-3 p-2 rounded-lg bg-[#F3F4F6] group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                              <svg className="w-4 h-4 text-[#0052cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#1C1C1C] truncate">{file.name}</p>
                              <p className="text-[10px] text-[#9CA3AF]">{(file.size / (1024 * 1024)).toFixed(1)}MB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertFile(cert.id, file.name)}
                              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                              title="Remove file"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
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

      {/* Step 4: Availability and Engagement Preferences */}
      {step === 4 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-8">
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
                <span className="text-sm font-semibold text-[#374151]">Regional Equity Pricing</span>
                <button
                  type="button"
                  onClick={() => setAvailabilityInfo(prev => ({ ...prev, regionalEquityPricing: !prev.regionalEquityPricing }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                    availabilityInfo.regionalEquityPricing ? 'bg-[#0052cc]' : 'bg-gray-300'
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
      {/* Step 5: Teach at Scale */}
      {step === 5 && (
        <>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C] font-['Nunito_Sans'] mb-2">
            Teach at Scale, On your Terms
          </h1>

          <form onSubmit={handleNext} className="space-y-6 mt-6">
            <p className="text-sm text-[#374151] leading-relaxed">
              Beyond 1-on-1 mentorship, VORA enables selected mentors to turn their expertise into structured learning experiences for global talent.
            </p>

            <div>
              <h3 className="text-sm font-bold text-[#1C1C1C] mb-2">Courses help candidates:</h3>
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
              <h3 className="text-sm font-bold text-[#1C1C1C] mb-2">You will decide:</h3>
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
                    ? 'border-[#0052cc] bg-[#EBF0FA] text-[#0052cc]'
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
                    ? 'border-[#0052cc] bg-[#EBF0FA] text-[#0052cc]'
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
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-full border border-[#E5E7EB] text-sm font-semibold text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!getStepValidity()}
                className={`flex-1 py-3.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${getStepValidity() ? 'bg-[#0052cc] text-white hover:bg-[#003d99]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              >
                Save & Continue
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MentorProfile;
