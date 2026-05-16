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

const JobEditModal: React.FC<JobEditModalProps> = ({ isOpen, onClose, section, data }) => {
  // Details Section State
  const [roleTitle, setRoleTitle] = useState(data?.title || 'Senior Epidemiologist – Field Operations');
  const [roleType, setRoleType] = useState(data?.roleDetails?.type || 'Full-time employment');
  const [level, setLevel] = useState(data?.roleDetails?.level || 'Senior level');
  const [positions, setPositions] = useState(data?.roleDetails?.positions?.replace(/\D/g, '') || '2');
  const [commitment, setCommitment] = useState(data?.roleDetails?.commitment || 'Full-time');
  const [workFormat, setWorkFormat] = useState(data?.roleDetails?.format || 'Hybrid');
  const [workLocation, setWorkLocation] = useState(data?.roleDetails?.location || 'Brazzaville, Republic of Congo');
  const [timezone, setTimezone] = useState(data?.roleDetails?.timePreference || 'UTC+1 (CET), UTC+2 (EET)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState(data?.roleDetails?.summary || "Lead field epidemiology operations for MSF's DRC-Congo corridor programme.");

  // Responsibilities State
  const [problem, setProblem] = useState(data?.responsibilities?.problem || '');
  const [core, setCore] = useState(data?.responsibilities?.core || '');
  const [skills, setSkills] = useState(data?.responsibilities?.technicalSkills?.map((s: any) => s.label).join(', ') || 'Research Analysis, Communication & Writing');
  const [tools, setTools] = useState(data?.responsibilities?.tools?.map((t: any) => t.label).join(', ') || 'Statistical Softwares, GIS Mapping Softwares');

  // Experience State
  const [minQual, setMinQual] = useState(data?.experience?.academyLevel || 'Postgraduate degree (Masters or equivalent)');
  const [fields, setFields] = useState(data?.experience?.relevantField || 'Epidemiology, Public Health, Medicine');
  const [years, setYears] = useState(data?.experience?.years || '5 to 8 years');
  const [publications, setPublications] = useState('Not required');
  const [clearance, setClearance] = useState(data?.experience?.securityClearance || 'Not required');
  const [candidatePolicy, setCandidatePolicy] = useState('Open to all nationalities');
  const [narrative, setNarrative] = useState(data?.experience?.sectorBackground || 'Experienced field epidemiologist with hands-on outbreak response experience in Sub-Saharan Africa.');

  // Compensation State
  const [compType, setCompType] = useState(data?.compensation?.type || 'Annual salary');
  const [currency, setCurrency] = useState('USD');
  const [minSalary, setMinSalary] = useState('55000');
  const [maxSalary, setMaxSalary] = useState('75000');
  const [preAssessment, setPreAssessment] = useState(data?.compensation?.preAssessment?.map((p: any) => p.label).join(', ') || 'Field report or situation report, Published research (if any)');

  // Collaboration State
  const [prefStyle, setPrefStyle] = useState(data?.collaboration?.preferredStyle?.map((s: any) => s.label).join(', ') || 'Independent, Field-oriented');
  const [collabStyle, setCollabStyle] = useState(data?.collaboration?.communicationStyle || 'Weekly check-ins');
  const [lang, setLang] = useState(data?.collaboration?.communicationLanguage || 'English');

  useEffect(() => {
    if (data) {
      setRoleTitle(data.title || '');
      setRoleType(data.roleDetails?.type || '');
      setLevel(data.roleDetails?.level || '');
      setPositions(data.roleDetails?.positions?.replace(/\D/g, '') || '2');
      setCommitment(data.roleDetails?.commitment || '');
      setWorkFormat(data.roleDetails?.format || '');
      setWorkLocation(data.roleDetails?.location || '');
      setTimezone(data.roleDetails?.timePreference || '');
      setSummary(data.roleDetails?.summary || '');

      setProblem(data.responsibilities?.problem || '');
      setCore(data.responsibilities?.core || '');
      setSkills(data.responsibilities?.technicalSkills?.map((s: any) => s.label).join(', ') || '');
      setTools(data.responsibilities?.tools?.map((t: any) => t.label).join(', ') || '');

      setMinQual(data.experience?.academyLevel || '');
      setFields(data.experience?.relevantField || '');
      setYears(data.experience?.years || '');
      setClearance(data.experience?.securityClearance || '');

      setCompType(data.compensation?.type || '');
      setPreAssessment(data.compensation?.preAssessment?.map((p: any) => p.label).join(', ') || '');

      setPrefStyle(data.collaboration?.preferredStyle?.map((s: any) => s.label).join(', ') || '');
      setCollabStyle(data.collaboration?.communicationStyle || '');
      setLang(data.collaboration?.communicationLanguage || '');
    }
  }, [data]);

  if (!isOpen) return null;

  // Options Definitions
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

            <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4 text-[13px] text-[#1e3a8a] leading-relaxed font-medium">
              <strong>Escrow note:</strong> Changing the salary band triggers an automatic escrow recalculation. Any top-up or refund will fire to your payment method within 24 hours of this edit being confirmed.
            </div>

            <Input 
              label="Pre-assessment materials required from candidates"
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

