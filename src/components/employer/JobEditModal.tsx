import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../common/Icons';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

interface JobEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'details' | 'responsibilities' | 'experience' | 'compensation' | 'collaboration';
  data: any;
}

// --- Options Definitions ---
const levelOptions = [
  { label: 'Student / Graduate', value: 'Student / Graduate' },
  { label: 'Entry level', value: 'Entry level' },
  { label: 'Mid level', value: 'Mid level' },
  { label: 'Senior level', value: 'Senior level' },
  { label: 'Executive / Director', value: 'Executive / Director' },
];

const workFormatOptions = [
  { label: 'Fully onsite', value: 'Fully onsite' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Remote - specific timezone(s) required', value: 'Remote - specific timezone(s) required' },
  { label: 'Remote - no timezone restriction', value: 'Remote - no timezone restriction' },
  { label: 'Flexible / candidate preference', value: 'Flexible / candidate preference' },
];

const minQualOptions = [
  { label: 'No formal qualification required', value: 'No formal qualification required' },
  { label: 'Undergraduate degree (any field)', value: 'Undergraduate degree (any field)' },
  { label: 'Undergraduate degree (health or life science)', value: 'Undergraduate degree (health or life science)' },
  { label: 'Postgraduate degree (Masters or equivalent)', value: 'Postgraduate degree (Masters or equivalent)' },
  { label: 'Postgraduate degree in public health / epidemiology (MPH, MSc)', value: 'Postgraduate degree in public health / epidemiology (MPH, MSc)' },
  { label: 'Professional clinical qualification (MBBS, MD, RN, etc.)', value: 'Professional clinical qualification (MBBS, MD, RN, etc.)' },
  { label: 'Doctoral degree (PhD or equivalent)', value: 'Doctoral degree (PhD or equivalent)' },
];

const yearsOptions = [
  { label: 'No experience required (student / graduate)', value: 'No experience required (student / graduate)' },
  { label: 'Up to 1 year', value: 'Up to 1 year' },
  { label: '1 to 3 years', value: '1 to 3 years' },
  { label: '3 to 5 years', value: '3 to 5 years' },
  { label: '5 to 8 years', value: '5 to 8 years' },
  { label: '8 to 12 years', value: '8 to 12 years' },
  { label: '12+ years (senior / director level)', value: '12+ years (senior / director level)' },
];

const publicationsOptions = [
  { label: 'Not required', value: 'Not required' },
  { label: 'At least one peer-reviewed publication', value: 'At least one peer-reviewed publication' },
  { label: '5 or more peer-reviewed publications', value: '5 or more peer-reviewed publications' },
  { label: 'Active publication record in relevant field', value: 'Active publication record in relevant field' },
  { label: 'Policy publications or grey literature', value: 'Policy publications or grey literature' },
];

const clearanceOptions = [
  { label: 'Not required', value: 'Not required' },
  { label: 'Basic DBS / background check', value: 'Basic DBS / background check' },
  { label: 'Enhanced DBS', value: 'Enhanced DBS' },
  { label: 'National security clearance (SC level)', value: 'National security clearance (SC level)' },
  { label: 'UN security clearance', value: 'UN security clearance' },
];

const candidatePolicyOptions = [
  { label: 'Open to all nationalities', value: 'Open to all nationalities' },
  { label: 'Work permit / visa sponsorship available', value: 'Work permit / visa sponsorship available' },
  { label: 'Must already hold right to work in posting country', value: 'Must already hold right to work in posting country' },
  { label: 'US federal funding restrictions apply', value: 'US federal funding restrictions apply' },
  { label: 'EU funding restrictions apply', value: 'EU funding restrictions apply' },
  { label: 'UK ODA restrictions apply', value: 'UK ODA restrictions apply' },
];

const compTypeOptions = [
  { label: 'Annual salary', value: 'Annual salary' },
  { label: 'Contract / daily rate', value: 'Contract / daily rate' },
  { label: 'Monthly stipend / fellowship', value: 'Monthly stipend / fellowship' },
  { label: 'Unpaid / flat listing fee', value: 'Unpaid / flat listing fee' },
  { label: 'Funded PhD (year-1 stipend)', value: 'Funded PhD (year-1 stipend)' },
];

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'GBP', value: 'GBP' },
  { label: 'EUR', value: 'EUR' },
  { label: 'NGN', value: 'NGN' },
  { label: 'KES', value: 'KES' },
  { label: 'ZAR', value: 'ZAR' },
  { label: 'GHS', value: 'GHS' },
  { label: 'ETB', value: 'ETB' },
];

const roleTypeGroups = [
  {
    label: 'Employment',
    options: [
      { label: 'Full-time employment', value: 'Full-time employment' },
      { label: 'Part-time employment', value: 'Part-time employment' },
    ]
  },
  {
    label: 'Contract & Consultancy',
    options: [
      { label: 'Contract', value: 'Contract' },
      { label: 'Consultancy', value: 'Consultancy' },
      { label: 'Locum / Agency shift', value: 'Locum / Agency shift' },
      { label: 'Secondment', value: 'Secondment' },
    ]
  },
  {
    label: 'Internships & Placements',
    options: [
      { label: 'Internship (paid)', value: 'Internship (paid)' },
      { label: 'Internship (unpaid)', value: 'Internship (unpaid)' },
      { label: 'Academic placement (degree requirement)', value: 'Academic placement (degree requirement)' },
      { label: 'Traineeship', value: 'Traineeship' },
      { label: 'Volunteer placement', value: 'Volunteer placement' },
    ]
  },
  {
    label: 'Fellowships',
    options: [
      { label: 'Fellowship', value: 'Fellowship' },
      { label: 'Postdoctoral fellowship', value: 'Postdoctoral fellowship' },
    ]
  },
  {
    label: 'Academic & Research',
    options: [
      { label: 'PhD studentship (funded)', value: 'PhD studentship (funded)' },
      { label: 'PhD studentship (self-funded)', value: 'PhD studentship (self-funded)' },
      { label: 'Research associate / postdoc', value: 'Research associate / postdoc' },
      { label: 'Teaching post', value: 'Teaching post' },
    ]
  },
  {
    label: 'Clinical Training',
    options: [
      { label: 'Residency / Foundation year placement', value: 'Residency / Foundation year placement' },
      { label: 'Government / VSO placement', value: 'Government / VSO placement' },
    ]
  }
];

// --- Helpers to extract field values from dynamic cards/fields array ---
const getFieldValue = (card?: any, labelMatches: string[] = []): string => {
  if (!card) return '';
  const lowerMatches = labelMatches.map(l => l.toLowerCase().trim());

  if (card.fields && Array.isArray(card.fields)) {
    // Try exact match first
    const exact = card.fields.find((f: any) => {
      const fieldLabel = (f.label || '').toLowerCase().trim();
      return lowerMatches.includes(fieldLabel);
    });
    if (exact?.value !== undefined && exact?.value !== null) return String(exact.value).trim();

    // Fall back to startsWith
    const found = card.fields.find((f: any) => {
      const fieldLabel = (f.label || '').toLowerCase().trim();
      return lowerMatches.some(m => fieldLabel.startsWith(m) || m.startsWith(fieldLabel));
    });
    if (found?.value !== undefined && found?.value !== null) return String(found.value).trim();
  }
  return '';
};

const formatTagList = (list: any): string => {
  if (!list) return '';
  if (Array.isArray(list)) {
    return list
      .map(item => {
        if (typeof item === 'string') return item;
        return item?.label || item?.name || '';
      })
      .filter(Boolean)
      .join(', ');
  }
  return String(list).trim();
};

const matchOption = (val: string, options: Array<{ label: string; value: string }>): string => {
  if (!val) return '';
  const trimmed = val.trim().toLowerCase();
  const exact = options.find(o => o.value.toLowerCase() === trimmed || o.label.toLowerCase() === trimmed);
  if (exact) return exact.value;
  const partial = options.find(o => 
    o.value.toLowerCase().includes(trimmed) || 
    trimmed.includes(o.value.toLowerCase()) ||
    o.label.toLowerCase().includes(trimmed) ||
    trimmed.includes(o.label.toLowerCase())
  );
  if (partial) return partial.value;
  return val;
};

const matchGroupOption = (val: string, groups: Array<{ label: string; options: Array<{ label: string; value: string }> }>): string => {
  if (!val) return '';
  const allOptions = groups.flatMap(g => g.options);
  return matchOption(val, allOptions);
};

const extractSalaryInfo = (card?: any) => {
  // Specifically look for salary range / rate fields, ignoring 'Compensation type', 'midpoint', and 'escrow'
  let salaryStr = getFieldValue(card, ['Salary range', 'Salary band', 'Rate range', 'Salary']);
  if (!salaryStr && card?.fields && Array.isArray(card.fields)) {
    const rangeField = card.fields.find((f: any) => {
      const l = (f.label || '').toLowerCase();
      return (l.includes('range') || l.includes('salary') || l.includes('rate')) &&
             !l.includes('type') && !l.includes('midpoint') && !l.includes('escrow');
    });
    if (rangeField?.value) salaryStr = String(rangeField.value);
  }
  if (!salaryStr) salaryStr = card?.salary || '';

  let currency = 'USD';
  if (salaryStr.includes('£') || salaryStr.includes('GBP')) currency = 'GBP';
  else if (salaryStr.includes('€') || salaryStr.includes('EUR')) currency = 'EUR';
  else if (salaryStr.includes('₦') || salaryStr.includes('NGN')) currency = 'NGN';
  else if (salaryStr.includes('KES')) currency = 'KES';
  else if (salaryStr.includes('ZAR')) currency = 'ZAR';
  else if (salaryStr.includes('GHS')) currency = 'GHS';
  else if (salaryStr.includes('ETB')) currency = 'ETB';
  else if (salaryStr.includes('USD') || salaryStr.includes('$')) currency = 'USD';
  else if (card?.currency) currency = card.currency;

  const numbers = salaryStr.match(/\d[\d,]*/g)?.map((n: string) => n.replace(/,/g, '')) || [];
  let minSalary = card?.minSalary || '';
  let maxSalary = card?.maxSalary || '';
  if (numbers.length >= 2) {
    minSalary = minSalary || numbers[0];
    maxSalary = maxSalary || numbers[1];
  } else if (numbers.length === 1) {
    minSalary = minSalary || numbers[0];
    maxSalary = maxSalary || numbers[0];
  }
  return { currency, minSalary, maxSalary };
};

const JobEditModal: React.FC<JobEditModalProps> = ({ isOpen, onClose, section, data }) => {
  // Details Section State
  const [roleTitle, setRoleTitle] = useState('');
  const [roleType, setRoleType] = useState('');
  const [level, setLevel] = useState('');
  const [positions, setPositions] = useState('');
  const [commitment, setCommitment] = useState('');
  const [workFormat, setWorkFormat] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');

  // Responsibilities State
  const [problem, setProblem] = useState('');
  const [core, setCore] = useState('');
  const [skills, setSkills] = useState('');
  const [tools, setTools] = useState('');

  // Experience State
  const [minQual, setMinQual] = useState('');
  const [fields, setFields] = useState('');
  const [years, setYears] = useState('');
  const [publications, setPublications] = useState('Not required');
  const [clearance, setClearance] = useState('Not required');
  const [candidatePolicy, setCandidatePolicy] = useState('Open to all nationalities');
  const [narrative, setNarrative] = useState('');

  // Compensation State
  const [compType, setCompType] = useState('Annual salary');
  const [currency, setCurrency] = useState('USD');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [candidateEligibility, setCandidateEligibility] = useState('Open to all nationalities');
  const [preAssessment, setPreAssessment] = useState('');

  // Collaboration State
  const [prefStyle, setPrefStyle] = useState('');
  const [collabStyle, setCollabStyle] = useState('');
  const [lang, setLang] = useState('English');

  useEffect(() => {
    if (data && isOpen) {
      // 1. Role Details
      setRoleTitle(data.roleTitle || data.title || '');
      
      const rawRoleType = getFieldValue(data.roleDetails, ['Role type', 'Job type', 'Type']) || data.roleDetails?.type || data.jobType || '';
      setRoleType(matchGroupOption(rawRoleType, roleTypeGroups) || rawRoleType);

      const rawLevel = getFieldValue(data.roleDetails, ['Employment level', 'Level', 'Seniority']) || data.roleDetails?.level || '';
      setLevel(matchOption(rawLevel, levelOptions) || rawLevel);

      const rawPos = getFieldValue(data.roleDetails, ['Available positions', 'Positions', 'Openings']) || data.roleDetails?.positions || '';
      const numPos = String(rawPos).replace(/\D/g, '');
      setPositions(numPos || (rawPos ? String(rawPos) : ''));

      setCommitment(getFieldValue(data.roleDetails, ['Time commitment', 'Commitment']) || data.roleDetails?.commitment || '');
      
      const rawFormat = getFieldValue(data.roleDetails, ['Work format', 'Format']) || data.roleDetails?.format || '';
      setWorkFormat(matchOption(rawFormat, workFormatOptions) || rawFormat);

      setWorkLocation(getFieldValue(data.roleDetails, ['Work location', 'Location']) || data.roleDetails?.location || data.location || '');
      setTimezone(getFieldValue(data.roleDetails, ['Timezone requirement(s)', 'Timezone requirements', 'Timezone', 'Time preference']) || data.roleDetails?.timePreference || '');
      setStartDate(getFieldValue(data.roleDetails, ['Start date']) || data.roleDetails?.startDate || '');
      setEndDate(getFieldValue(data.roleDetails, ['End date', 'Closing date', 'Expiry date']) || data.roleDetails?.endDate || data.expiryDate || '');
      setSummary(data.roleDetails?.roleSummary || getFieldValue(data.roleDetails, ['Role summary', 'Summary']) || data.roleDetails?.summary || '');

      // 2. Responsibilities
      setProblem(data.responsibilities?.roleGoal || getFieldValue(data.responsibilities, ['Role/Problem to solve', 'Role problem to solve', 'Problem to solve', 'Role goal']) || data.responsibilities?.problem || '');
      setCore(data.responsibilities?.coreResponsibilities || getFieldValue(data.responsibilities, ['Core responsibilities', 'Responsibilities']) || data.responsibilities?.core || '');
      setSkills(formatTagList(data.responsibilities?.technicalSkills) || getFieldValue(data.responsibilities, ['Technical skills required', 'Technical skills', 'Skills']) || data.responsibilities?.skills || '');
      setTools(formatTagList(data.responsibilities?.toolsRequired || data.responsibilities?.tools) || getFieldValue(data.responsibilities, ['Tools required', 'Tools']) || '');

      // 3. Experience
      const rawMinQual = getFieldValue(data.experience, ['Minimum qualification', 'Academy level', 'Qualification', 'Degree']) || data.experience?.academyLevel || '';
      setMinQual(matchOption(rawMinQual, minQualOptions) || rawMinQual);

      setFields(getFieldValue(data.experience, ['Relevant field(s)', 'Relevant fields', 'Relevant field', 'Field(s)', 'Field']) || data.experience?.relevantField || '');

      const rawYears = getFieldValue(data.experience, ['Years of experience', 'Experience', 'Years']) || data.experience?.years || '';
      setYears(matchOption(rawYears, yearsOptions) || rawYears);

      const rawPubs = getFieldValue(data.experience, ['Publications required', 'Publications']) || data.experience?.publications || '';
      setPublications(matchOption(rawPubs, publicationsOptions) || rawPubs || 'Not required');

      const rawClearance = getFieldValue(data.experience, ['Security clearance', 'Clearance']) || data.experience?.securityClearance || '';
      setClearance(matchOption(rawClearance, clearanceOptions) || rawClearance || 'Not required');

      const rawPolicy = getFieldValue(data.experience, ['International candidate policy', 'Candidate policy', 'Nationality policy']) || data.experience?.candidatePolicy || '';
      setCandidatePolicy(matchOption(rawPolicy, candidatePolicyOptions) || rawPolicy || 'Open to all nationalities');

      setNarrative(getFieldValue(data.experience, ['Preferred candidate profile (narrative)', 'Preferred candidate profile', 'Candidate profile', 'Sector background']) || data.experience?.sectorBackground || data.experience?.narrative || '');

      // 4. Compensation
      const rawCompType = getFieldValue(data.compensation, ['Compensation type']) || data.compensation?.type || '';
      setCompType(matchOption(rawCompType, compTypeOptions) || rawCompType || 'Annual salary');

      const salInfo = extractSalaryInfo(data.compensation);
      setCurrency(salInfo.currency);
      setMinSalary(salInfo.minSalary);
      setMaxSalary(salInfo.maxSalary);

      const rawEligibility =
        formatTagList(data.compensation?.eligibilityPills) ||
        getFieldValue(data.compensation, ['Candidate eligibility', 'Eligibility', 'International candidate policy']);
      setCandidateEligibility(
        matchOption(rawEligibility, candidatePolicyOptions) || rawEligibility || 'Open to all nationalities'
      );

      const rawPreMat =
        getFieldValue(data.compensation, [
          'Pre-interview materials required from candidates',
          'Pre-interview materials',
          'Pre-assessment',
          'Materials required',
        ]) || data.compensation?.preAssessment || '';
      setPreAssessment(rawPreMat);

      // 5. Collaboration / Team
      setPrefStyle(formatTagList(data.team?.preferredWorkingStyle || data.collaboration?.preferredStyle) || getFieldValue(data.team || data.collaboration, ['Preferred work style', 'Work style', 'Preferred style']) || '');
      setCollabStyle(data.team?.communicationStyle || getFieldValue(data.team || data.collaboration, ['Collaboration style', 'Communication style']) || data.collaboration?.communicationStyle || '');
      setLang(data.team?.communicationLanguage || getFieldValue(data.team || data.collaboration, ['Communication language', 'Language']) || data.collaboration?.communicationLanguage || 'English');
    }
  }, [data, isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (section) {
      case 'details':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Role title"
                type="text" 
                value={roleTitle} 
                onChange={(e) => setRoleTitle(e.target.value)}
              />
              <Select 
                label="Role type"
                groups={roleTypeGroups}
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select 
                label="Employment level"
                options={levelOptions}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
              <Input 
                label="Available positions"
                type="number" 
                min="1" 
                value={positions} 
                onChange={(e) => setPositions(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Time commitment"
                type="text" 
                value={commitment} 
                onChange={(e) => setCommitment(e.target.value)}
              />
              <Select 
                label="Work format"
                options={workFormatOptions}
                value={workFormat}
                onChange={(e) => setWorkFormat(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Work location"
                type="text" 
                value={workLocation} 
                onChange={(e) => setWorkLocation(e.target.value)}
              />
              <Input 
                label="Timezone requirement(s)"
                type="text" 
                value={timezone} 
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Start date"
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input 
                label="End date / closing date"
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Textarea 
              label="Role summary"
              rows={3} 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        );

      case 'responsibilities':
        return (
          <div className="space-y-4">
            <Textarea 
              label="Role/Problem to solve"
              rows={3} 
              value={problem} 
              onChange={(e) => setProblem(e.target.value)}
            />
            <Textarea 
              label="Core responsibilities"
              rows={3} 
              value={core} 
              onChange={(e) => setCore(e.target.value)}
            />
            <Input 
              label="Technical skills required"
              type="text" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Add skills..." 
            />
            <Input 
              label="Tools required"
              type="text" 
              value={tools} 
              onChange={(e) => setTools(e.target.value)}
              placeholder="Add tools..." 
            />
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select 
                label="Minimum qualification"
                options={minQualOptions}
                value={minQual}
                onChange={(e) => setMinQual(e.target.value)}
              />
              <Input 
                label="Relevant field(s)"
                type="text" 
                value={fields} 
                onChange={(e) => setFields(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select 
                label="Years of experience"
                options={yearsOptions}
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
              <Select 
                label="Publications required"
                options={publicationsOptions}
                value={publications}
                onChange={(e) => setPublications(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select 
                label="Security clearance"
                options={clearanceOptions}
                value={clearance}
                onChange={(e) => setClearance(e.target.value)}
              />
              <Select 
                label="International candidate policy"
                options={candidatePolicyOptions}
                value={candidatePolicy}
                onChange={(e) => setCandidatePolicy(e.target.value)}
              />
            </div>

            <Textarea 
              label="Preferred candidate profile (narrative)"
              rows={3} 
              value={narrative} 
              onChange={(e) => setNarrative(e.target.value)}
            />
          </div>
        );

      case 'compensation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Select 
                label="Compensation type"
                options={compTypeOptions}
                value={compType}
                onChange={(e) => setCompType(e.target.value)}
              />
              <Select 
                label="Currency"
                options={currencyOptions}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Minimum salary / rate"
                type="number" 
                value={minSalary} 
                onChange={(e) => setMinSalary(e.target.value)}
              />
              <Input 
                label="Maximum salary / rate"
                type="number" 
                value={maxSalary} 
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>

            <div className="bg-white border border-[#BDD9FF] rounded-xl p-4 text-[13px] text-[#1e3a8a] leading-relaxed font-medium">
              <strong>Escrow note:</strong> Changing the salary band triggers an automatic escrow recalculation. Any top-up or refund will fire to your payment method within 24 hours of this edit being confirmed.
            </div>

            <Select 
              label="Candidate eligibility"
              options={candidatePolicyOptions}
              value={candidateEligibility}
              onChange={(e) => setCandidateEligibility(e.target.value)}
            />

            <Input 
              label="Pre-interview materials required from candidates"
              type="text" 
              value={preAssessment} 
              onChange={(e) => setPreAssessment(e.target.value)}
              placeholder="Leave blank if not required" 
            />
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-4">
            <Input 
              label="Preferred work style"
              type="text" 
              value={prefStyle} 
              onChange={(e) => setPrefStyle(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input 
                label="Collaboration style"
                type="text" 
                value={collabStyle} 
                onChange={(e) => setCollabStyle(e.target.value)}
              />
              <Input 
                label="Communication language"
                type="text" 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (section) {
      case 'details': return 'Edit Role Details';
      case 'responsibilities': return 'Edit Responsibilities & Skills';
      case 'experience': return 'Edit Experience & Background';
      case 'compensation': return 'Edit Compensation & Documentation';
      case 'collaboration': return 'Edit Team Collaboration';
      default: return 'Edit Spec';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[560px] rounded-[16px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h2 className="text-[18px] font-medium text-gray-900 ">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
            <CloseIcon size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-grow">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex-shrink-0">
          <Button 
            onClick={onClose}
            pill={false}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobEditModal;

