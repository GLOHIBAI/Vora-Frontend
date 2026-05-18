import React, { useState, useEffect } from 'react';
import { 
  CloseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon,
  InfoIcon,
  BriefcaseIcon,
  TrendingUpIcon
} from '../common/Icons';
import Select from '../common/Select';
import Button from '../common/Button';
import Input from '../common/Input';

interface PostJobWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    isScheduled: boolean;
    goLiveDate: string;
    isPrefilled: boolean;
  };
}

const STEPS = [
  { id: 1, title: 'Role details', sub: 'Title, level & location' },
  { id: 2, title: 'Responsibilities & skills', sub: 'What they will do' },
  { id: 3, title: 'Experience & background', sub: 'Qualifications & languages' },
  { id: 4, title: 'Team collaboration & communication', sub: 'Culture & style' },
  { id: 5, title: 'Compensation & documentation', sub: 'Budget & benefits' },
  { id: 6, title: 'Preview', sub: 'Final review' }
];

const ROLE_TYPE_GROUPS = [
  {
    label: 'Employment',
    options: [
      { label: 'Full-time employment', value: 'Full-time employment' },
      { label: 'Part-time employment', value: 'Part-time employment' }
    ]
  },
  {
    label: 'Contract & Consultancy',
    options: [
      { label: 'Contract', value: 'Contract' },
      { label: 'Consultancy', value: 'Consultancy' },
      { label: 'Locum / Agency shift', value: 'Locum / Agency shift' },
      { label: 'Secondment', value: 'Secondment' }
    ]
  },
  {
    label: 'Internships & Placements',
    options: [
      { label: 'Internship (paid)', value: 'Internship (paid)' },
      { label: 'Internship (unpaid)', value: 'Internship (unpaid)' },
      { label: 'Academic placement (degree requirement)', value: 'Academic placement (degree requirement)' },
      { label: 'Traineeship', value: 'Traineeship' },
      { label: 'Volunteer placement', value: 'Volunteer placement' }
    ]
  },
  {
    label: 'Fellowships & Scholarships',
    options: [
      { label: 'Fellowship', value: 'Fellowship' },
      { label: 'Postdoctoral fellowship', value: 'Postdoctoral fellowship' }
    ]
  },
  {
    label: 'Academic & Research',
    options: [
      { label: 'PhD studentship (funded)', value: 'PhD studentship (funded)' },
      { label: 'PhD studentship (self-funded)', value: 'PhD studentship (self-funded)' },
      { label: 'Research associate / postdoc', value: 'Research associate / postdoc' },
      { label: 'Teaching post', value: 'Teaching post' }
    ]
  },
  {
    label: 'Clinical Training',
    options: [
      { label: 'Residency / Foundation year placement', value: 'Residency / Foundation year placement' },
      { label: 'Government / VSO placement', value: 'Government / VSO placement' },
      { label: 'Clinical elective (student observership)', value: 'Clinical elective (student observership)' },
      { label: 'Pre-registration placement (pharmacy / allied health)', value: 'Pre-registration placement (pharmacy / allied health)' }
    ]
  },
  {
    label: 'University — Student Matching',
    options: [
      { label: 'Offer of admission — undergraduate programme', value: 'Offer of admission — undergraduate programme' },
      { label: 'Offer of admission — postgraduate taught (MSc / MPH / MBA)', value: 'Offer of admission — postgraduate taught (MSc / MPH / MBA)' },
      { label: 'Offer of admission — PhD / doctoral programme', value: 'Offer of admission — PhD / doctoral programme' },
      { label: 'Scholarship offer — full or partial funding', value: 'Scholarship offer — full or partial funding' },
      { label: 'Short course / CPD / professional certificate', value: 'Short course / CPD / professional certificate' },
      { label: 'Exchange / visiting student placement', value: 'Exchange / visiting student placement' },
      { label: 'Intercalating year / BSc placement (medical student)', value: 'Intercalating year / BSc placement (medical student)' },
      { label: 'Summer school / intensive programme', value: 'Summer school / intensive programme' }
    ]
  },
  {
    label: 'Health-Adjacent — Operations & Support',
    options: [
      { label: 'Finance / Accounting', value: 'Finance / Accounting' },
      { label: 'Human Resources (HR)', value: 'Human Resources (HR)' },
      { label: 'Procurement / Supply Chain / Logistics', value: 'Procurement / Supply Chain / Logistics' },
      { label: 'Legal / Compliance / Regulatory Affairs', value: 'Legal / Compliance / Regulatory Affairs' },
      { label: 'Administration / Office Management', value: 'Administration / Office Management' },
      { label: 'Customer Service / Patient Services', value: 'Customer Service / Patient Services' },
      { label: 'Facilities / Estates / Engineering', value: 'Facilities / Estates / Engineering' },
      { label: 'Catering / Nutrition Support Services', value: 'Catering / Nutrition Support Services' },
      { label: 'Security / Safeguarding Officer', value: 'Security / Safeguarding Officer' },
      { label: 'Driver / Transport Coordinator', value: 'Driver / Transport Coordinator' }
    ]
  },
  {
    label: 'Health-Adjacent — Technology & Data',
    options: [
      { label: 'Software Engineer / Developer', value: 'Software Engineer / Developer' },
      { label: 'Data Engineer / Analyst', value: 'Data Engineer / Analyst' },
      { label: 'IT Support / Systems Administrator', value: 'IT Support / Systems Administrator' },
      { label: 'Cybersecurity Specialist', value: 'Cybersecurity Specialist' },
      { label: 'UX / Product Designer', value: 'UX / Product Designer' }
    ]
  },
  {
    label: 'Health-Adjacent — Communications & Creative',
    options: [
      { label: 'Graphic Designer', value: 'Graphic Designer' },
      { label: 'Videographer / Photographer', value: 'Videographer / Photographer' },
      { label: 'Social Media Manager', value: 'Social Media Manager' },
      { label: 'Copywriter / Content Creator', value: 'Copywriter / Content Creator' },
      { label: 'Translator / Interpreter', value: 'Translator / Interpreter' },
      { label: 'Fundraising / Development Officer', value: 'Fundraising / Development Officer' },
      { label: 'Grant Writer', value: 'Grant Writer' }
    ]
  }
];

const EMPLOYMENT_LEVEL_OPTIONS = [
  { label: 'Student / Graduate', value: 'Student / Graduate' },
  { label: 'Entry level', value: 'Entry level' },
  { label: 'Mid level', value: 'Mid level' },
  { label: 'Senior level', value: 'Senior level' },
  { label: 'Executive / Director', value: 'Executive / Director' }
];

const WORK_FORMAT_OPTIONS = [
  { label: 'Fully onsite', value: 'Fully onsite' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Remote - specific timezone(s) required', value: 'Remote - specific timezone(s) required' },
  { label: 'Remote - no timezone restriction', value: 'Remote - no timezone restriction' },
  { label: 'Flexible / candidate preference', value: 'Flexible / candidate preference' }
];

const INT_POLICY_OPTIONS = [
  { label: 'Local candidates only - no international applicants', value: 'Local candidates only - no international applicants' },
  { label: 'Open to international - visa sponsorship offered', value: 'Open to international - visa sponsorship offered' },
  { label: 'Open to international - candidate must have their own right to work', value: 'Open to international - candidate must have their own right to work' },
  { label: 'Global remote - no country-of-residence restriction whatsoever', value: 'Global remote - no country-of-residence restriction' }
];

const SECURITY_CLEARANCE_OPTIONS = [
  { label: 'None required', value: 'None required' },
  { label: 'Basic background check only', value: 'Basic background check only' },
  { label: 'Government / national security clearance', value: 'Government / national security clearance' },
  { label: 'Five Eyes / allied clearance required', value: 'Five Eyes / allied clearance required' }
];

const WORK_PERMIT_OPTIONS = [
  { label: 'Full right to work required', value: 'Full right to work required' },
  { label: 'Skilled worker / sponsored visa', value: 'Skilled worker / sponsored visa' },
  { label: 'Student visa with work rights', value: 'Student visa with work rights' },
  { label: 'Open / unrestricted work permit', value: 'Open / unrestricted work permit' },
  { label: 'Permanent residency / settled status', value: 'Permanent residency / settled status' },
  { label: 'Consultancy / self-employed arrangement possible', value: 'Consultancy / self-employed arrangement possible' }
];

const TZ_REGIONS: Record<string, string[]> = {
  EMEA: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)'
  ],
  AMER: [
    'UTC-8 (PST – Los Angeles, Vancouver)',
    'UTC-7 (MST – Denver, Phoenix)',
    'UTC-6 (CST – Chicago, Mexico City)',
    'UTC-5 (EST – New York, Toronto)',
    'UTC-4 (AST – Caracas, La Paz, Halifax)',
    'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)'
  ],
  APAC: [
    'UTC+5:30 (IST – Mumbai, New Delhi)',
    'UTC+6 (BST – Dhaka, Almaty)',
    'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)',
    'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)',
    'UTC+9 (JST/KST – Tokyo, Seoul)',
    'UTC+10 (AEST – Sydney, Melbourne, Brisbane)',
    'UTC+12 (NZST – Auckland, Fiji)'
  ],
  AFRICA: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)'
  ],
  MENA: [
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)',
    'UTC+3:30 (IRST – Tehran)',
    'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)',
    'UTC+5 (PKT – Islamabad, Karachi, Tashkent)'
  ],
  ALL: [
    'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)',
    'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)',
    'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)',
    'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)',
    'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)',
    'UTC+5:30 (IST – Mumbai, New Delhi)',
    'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)',
    'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)',
    'UTC-5 (EST – New York, Toronto)',
    'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)',
    'UTC+10 (AEST – Sydney, Melbourne, Brisbane)'
  ]
};

const TZ_GROUPS = [
  {
    label: 'Americas (AMER)',
    options: [
      { label: 'UTC-8 (PST – Los Angeles, Vancouver)', value: 'UTC-8 (PST – Los Angeles, Vancouver)' },
      { label: 'UTC-7 (MST – Denver, Phoenix)', value: 'UTC-7 (MST – Denver, Phoenix)' },
      { label: 'UTC-6 (CST – Chicago, Mexico City)', value: 'UTC-6 (CST – Chicago, Mexico City)' },
      { label: 'UTC-5 (EST – New York, Toronto)', value: 'UTC-5 (EST – New York, Toronto)' },
      { label: 'UTC-4 (AST – Caracas, La Paz, Halifax)', value: 'UTC-4 (AST – Caracas, La Paz, Halifax)' },
      { label: 'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)', value: 'UTC-3 (BRT – São Paulo, Buenos Aires, Montevideo)' }
    ]
  },
  {
    label: 'Western Europe & West Africa (part of EMEA)',
    options: [
      { label: 'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)', value: 'UTC+0 (GMT – London, Dublin, Accra, Dakar, Abidjan)' },
      { label: 'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)', value: 'UTC+1 (CET – Paris, Berlin, Rome, Lagos, Kinshasa, Tunis)' }
    ]
  },
  {
    label: 'Eastern Europe & East/Southern Africa (part of EMEA)',
    options: [
      { label: 'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)', value: 'UTC+2 (EET – Cairo, Johannesburg, Harare, Lusaka, Helsinki, Athens)' },
      { label: 'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)', value: 'UTC+3 (EAT – Nairobi, Addis Ababa, Mogadishu, Moscow, Riyadh, Kuwait)' }
    ]
  },
  {
    label: 'Middle East & Central/South Asia (MENA / part of APAC)',
    options: [
      { label: 'UTC+3:30 (IRST – Tehran)', value: 'UTC+3:30 (IRST – Tehran)' },
      { label: 'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)', value: 'UTC+4 (GST – Dubai, Abu Dhabi, Baku, Tbilisi)' },
      { label: 'UTC+4:30 (AFT – Kabul)', value: 'UTC+4:30 (AFT – Kabul)' },
      { label: 'UTC+5 (PKT – Islamabad, Karachi, Tashkent)', value: 'UTC+5 (PKT – Islamabad, Karachi, Tashkent)' },
      { label: 'UTC+5:30 (IST – Mumbai, New Delhi, Colombo)', value: 'UTC+5:30 (IST – Mumbai, New Delhi, Colombo)' },
      { label: 'UTC+5:45 (NPT – Kathmandu)', value: 'UTC+5:45 (NPT – Kathmandu)' },
      { label: 'UTC+6 (BST – Dhaka, Almaty)', value: 'UTC+6 (BST – Dhaka, Almaty)' }
    ]
  },
  {
    label: 'Southeast & East Asia (APAC)',
    options: [
      { label: 'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)', value: 'UTC+7 (ICT – Bangkok, Jakarta, Hanoi, Phnom Penh)' },
      { label: 'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)', value: 'UTC+8 (SGT/CST – Singapore, Beijing, Manila, Kuala Lumpur, Perth)' },
      { label: 'UTC+9 (JST/KST – Tokyo, Seoul)', value: 'UTC+9 (JST/KST – Tokyo, Seoul)' },
      { label: 'UTC+9:30 (ACST – Darwin, Adelaide)', value: 'UTC+9:30 (ACST – Darwin, Adelaide)' },
      { label: 'UTC+10 (AEST – Sydney, Melbourne, Brisbane)', value: 'UTC+10 (AEST – Sydney, Melbourne, Brisbane)' },
      { label: 'UTC+12 (NZST – Auckland, Fiji)', value: 'UTC+12 (NZST – Auckland, Fiji)' }
    ]
  }
];

const PostJobWizard: React.FC<PostJobWizardProps> = ({ isOpen, onClose, initialConfig }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobStepNavOpen, setIsMobStepNavOpen] = useState(false);

  // Form State
  const [roleType, setRoleType] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [level, setLevel] = useState('');
  const [positions, setPositions] = useState('1');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [workFormat, setWorkFormat] = useState('');
  const [location, setLocation] = useState('');
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([]);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');

  // Eligibility state
  const [internationalPolicy, setInternationalPolicy] = useState('');
  const [securityClearance, setSecurityClearance] = useState('');
  const [selectedWorkPermits, setSelectedWorkPermits] = useState<string[]>([]);

  // Scheduled Hiring state
  const [isScheduled, setIsScheduled] = useState(false);
  const [goLiveDate, setGoLiveDate] = useState('');
  const [editsCount, setEditsCount] = useState(0);

  // Prefill Banner State
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);

  // Step 2 placeholder state
  const [responsibilities, setResponsibilities] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Sync initial config from post modal choices
  useEffect(() => {
    if (isOpen && initialConfig) {
      setIsScheduled(initialConfig.isScheduled);
      setGoLiveDate(initialConfig.goLiveDate || '');
      setShowPrefillBanner(initialConfig.isPrefilled);
      setCurrentStep(1);

      if (initialConfig.isPrefilled) {
        setRoleTitle('Global Health Research Intern');
        setRoleType('Internship (paid)');
        setLevel('student');
        setPositions('3');
        setTimeCommitment('20');
        setWorkFormat('Fully onsite');
        setLocation('Lagos, Nigeria');
        setStartDate('2025-10-21');
        setEndDate('2026-01-21');
        setSummary('Lorem ipsum dolor sit amet consectetur. Vierra lectus rutrum luesnh...');
      } else {
        setRoleTitle('');
        setRoleType('');
        setLevel('');
        setPositions('1');
        setTimeCommitment('');
        setWorkFormat('');
        setLocation('');
        setStartDate('');
        setEndDate('');
        setSummary('');
      }
    }
  }, [isOpen, initialConfig]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  if (!isOpen && !isClosing) return null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Additional locations logic
  const handleAddLocation = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = newLocationInput.trim();
    if (clean && !additionalLocations.includes(clean)) {
      setAdditionalLocations([...additionalLocations, clean]);
    }
    setNewLocationInput('');
  };

  const handleRemoveLocation = (loc: string) => {
    setAdditionalLocations(additionalLocations.filter(l => l !== loc));
  };

  // Timezone shortcuts helper
  const handleAddTZRegion = (region: string) => {
    const list = TZ_REGIONS[region] || [];
    const merged = [...selectedTimezones];
    list.forEach(tz => {
      if (!merged.includes(tz)) merged.push(tz);
    });
    setSelectedTimezones(merged);
  };

  const handleClearTimezones = () => {
    setSelectedTimezones([]);
  };

  const handleRemoveTimezone = (tz: string) => {
    setSelectedTimezones(selectedTimezones.filter(t => t !== tz));
  };

  const handleToggleTimezone = (tz: string) => {
    if (selectedTimezones.includes(tz)) {
      handleRemoveTimezone(tz);
    } else {
      setSelectedTimezones([...selectedTimezones, tz]);
    }
  };

  // Work format helpers
  const showLocSection = workFormat === 'Fully onsite' || workFormat === 'Hybrid';
  const showTzSection = workFormat === 'Remote - specific timezone(s) required' || workFormat === 'Remote - no timezone restriction' || workFormat === 'Hybrid' || workFormat === 'Flexible / candidate preference';

  // Step 2 placeholder helper functions
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Scheduled Hiring version segments
  const editsRemaining = 3 - editsCount;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const day = d.getDate();
      let suffix = 'th';
      if (day === 1 || day === 21 || day === 31) suffix = 'st';
      else if (day === 2 || day === 22) suffix = 'nd';
      else if (day === 3 || day === 23) suffix = 'rd';
      return `${months[d.getMonth()]} ${day}${suffix} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 left-0 lg:left-72 z-[40] flex flex-col bg-[#F7F7F7] font-nunito transition-all duration-500 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      {/* Top Header */}
      <div className="h-[72px] bg-white border-b border-[#E6E6E6] px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleClose} 
            className="flex items-center gap-1.5 text-sm font-bold text-[#4A4A4A] hover:text-[#0047CC] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Post a job
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold text-[#808080]">Draft saved automatically</span>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors group cursor-pointer"
          >
            <CloseIcon size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step Navigation Sidebar (Desktop) */}
        <div className="w-[280px] bg-white border-r border-[#E6E6E6] py-6 hidden lg:flex flex-col overflow-y-auto shrink-0">
          <div className="space-y-1">
            {STEPS.map((step) => {
              const isDone = currentStep > step.id;
              const isCur = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-start gap-3.5 px-6 py-2.5">
                  <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                    isDone 
                      ? 'bg-[#2CA62C] border-[#2CA62C]' 
                      : isCur 
                        ? 'border-[#0047CC] bg-[#EBF6FF]' 
                        : 'border-[#E6E6E6] bg-white'
                  }`}>
                    {isDone ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : isCur ? (
                      <div className="w-2 h-2 rounded-full bg-[#0047CC]" />
                    ) : null}
                  </div>
                  <div>
                    <p className={`text-sm tracking-tight leading-tight ${isCur ? 'text-[#0047CC] font-bold' : isDone ? 'text-[#4A4A4A] font-semibold' : 'text-[#ADADAD] font-semibold'}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F7F7F7]">
          {/* Mobile Step Nav Dropdown */}
          <button 
            onClick={() => setIsMobStepNavOpen(!isMobStepNavOpen)}
            className="flex lg:hidden items-center justify-between px-6 py-3.5 bg-white border-b border-[#E6E6E6] text-[13px] font-bold text-[#4A4A4A] w-full cursor-pointer"
          >
            <span>Step {currentStep} of 6: {STEPS[currentStep - 1].title}</span>
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform duration-200 ${isMobStepNavOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {isMobStepNavOpen && (
            <div className="lg:hidden bg-white border-b border-[#E6E6E6] py-3 space-y-1 animate-in slide-in-from-top duration-250">
              {STEPS.map((step) => {
                const isDone = currentStep > step.id;
                const isCur = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setCurrentStep(step.id);
                      setIsMobStepNavOpen(false);
                    }}
                    className="flex items-center gap-3 px-6 py-2 w-full text-left hover:bg-gray-50 cursor-pointer"
                  >
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isDone 
                        ? 'bg-[#2CA62C] border-[#2CA62C]' 
                        : isCur 
                          ? 'border-[#0047CC] bg-[#EBF6FF]' 
                          : 'border-[#E6E6E6]'
                    }`}>
                      {isDone ? (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : isCur ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0047CC]" />
                      ) : null}
                    </div>
                    <span className={`text-[13px] ${isCur ? 'text-[#0047CC] font-bold' : 'text-[#4A4A4A]'}`}>{step.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex-1 p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            {/* Prefill Notification Banner */}
            {showPrefillBanner && (
              <div className="flex items-start gap-3 p-4 bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl animate-in fade-in duration-300">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div className="flex-1">
                  <p className="text-[13px] leading-relaxed text-[#1e3a8a]">
                    We have pre-filled your job post using your uploaded document. Review each section and make any changes before publishing.
                  </p>
                </div>
                <button 
                  onClick={() => setShowPrefillBanner(false)}
                  className="text-[#387DFF] hover:text-[#0047CC] p-0.5 cursor-pointer shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* STEP 1: ROLE DETAILS */}
            {currentStep === 1 && (
              <div className="bg-white border border-[#E6E6E6] rounded-[20px] p-6 md:p-9 shadow-sm space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Role details</h2>
                  <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                    Core information about this role. VORA uses these fields to determine geopolitical eligibility, match candidates to your timezone, and score candidates on role fit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role Type */}
                  <Select 
                    label="Role type"
                    value={roleType}
                    placeholder="Select option"
                    groups={ROLE_TYPE_GROUPS}
                    onChange={(e) => setRoleType(e.target.value)}
                  />

                  {/* Role Title */}
                  <Input 
                    label="Role title"
                    placeholder="e.g. Global Health Research Intern"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                  />

                  {/* Employment Level */}
                  <Select 
                    label="Employment level"
                    value={level}
                    placeholder="Select option"
                    options={EMPLOYMENT_LEVEL_OPTIONS}
                    onChange={(e) => setLevel(e.target.value)}
                  />

                  {/* Available Positions */}
                  <Input 
                    label="Available positions"
                    type="number"
                    min="1"
                    placeholder="e.g. 1, 2, 3 etc"
                    value={positions}
                    onChange={(e) => setPositions(e.target.value)}
                  />

                  {/* Time Commitment */}
                  <Input 
                    label="Time commitment"
                    placeholder="e.g. 20hrs per week / Full-time"
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                  />

                  {/* Work Format */}
                  <Select 
                    label="Work format"
                    value={workFormat}
                    placeholder="Select option"
                    options={WORK_FORMAT_OPTIONS}
                    onChange={(e) => setWorkFormat(e.target.value)}
                  />

                  {/* Work Location (primary) */}
                  <Input 
                    label="Work location (primary)"
                    placeholder="e.g. Lagos, Nigeria — or 'Multiple locations'"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />

                  {/* Multi-location Field (Unfurls when onsite or hybrid) */}
                  {showLocSection && (
                    <div className="col-span-1 md:col-span-2 space-y-2.5 p-4 bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Additional hiring locations <span className="text-[11px] text-[#808080] font-normal italic">if hiring across multiple offices or cities</span>
                      </label>
                      <p className="text-xs text-[#808080] leading-relaxed">
                        Add each location separately. VORA will match candidates eligible to work in each location and route applications accordingly.
                      </p>
                      
                      <div className="flex flex-wrap gap-2.5 min-h-[32px] pt-1">
                        {additionalLocations.map((loc) => (
                          <span key={loc} className="inline-flex items-center gap-1.5 bg-[#EBF6FF] text-[#0047CC] border border-[#BDD9FF] rounded-full px-3 py-1 text-xs font-bold">
                            {loc}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveLocation(loc)}
                              className="text-[#387DFF] hover:text-[#0047CC] font-bold text-sm cursor-pointer ml-0.5"
                            >
                              &#215;
                            </button>
                          </span>
                        ))}
                      </div>

                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleAddLocation(); }} 
                        className="flex gap-2"
                      >
                        <input 
                          type="text" 
                          placeholder="e.g. Nairobi, Kenya"
                          value={newLocationInput}
                          onChange={(e) => setNewLocationInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-[#E6E6E6] bg-white outline-none focus:border-[#0047CC] transition-all text-sm font-semibold"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddLocation()}
                          className="px-6 min-h-[42px] bg-white border border-[#E6E6E6] hover:border-[#0047CC] hover:bg-[#EBF6FF] text-[#0047CC] font-medium text-[13px] rounded-full transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Timezones multi-select with shortcuts (Unfurls when remote/hybrid/flexible) */}
                  {showTzSection && (
                    <div className="col-span-1 md:col-span-2 space-y-3.5 p-4 bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Timezone requirement(s) <span className="text-[11px] text-[#808080] font-normal italic">select all that apply</span>
                      </label>
                      <p className="text-xs text-[#808080] leading-relaxed">
                        VORA matches candidates who can sustainably overlap with <em>any</em> timezone you select. Select multiple for regional or global roles. Use the region shortcuts to quickly select an entire zone.
                      </p>

                      {/* Shortcut Buttons */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['EMEA', 'AMER', 'APAC', 'AFRICA', 'MENA'].map((reg) => (
                          <button 
                            key={reg}
                            type="button" 
                            onClick={() => handleAddTZRegion(reg)}
                            className="px-3.5 py-1.5 rounded-full border border-[#E6E6E6] bg-white hover:bg-[#EBF6FF] hover:border-[#0047CC] hover:text-[#0047CC] text-[11px] font-bold text-[#4A4A4A] transition-all cursor-pointer"
                          >
                            {reg}
                          </button>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => handleAddTZRegion('ALL')}
                          className="px-3.5 py-1.5 rounded-full border border-[#0047CC] bg-[#EBF6FF] hover:bg-blue-100 text-[#0047CC] text-[11px] font-bold transition-all cursor-pointer"
                        >
                          All regions
                        </button>
                        <button 
                          type="button" 
                          onClick={handleClearTimezones}
                          className="px-3.5 py-1.5 rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>

                      {/* Displayed Selected Timezone Tags */}
                      <div className="flex flex-wrap gap-2 pt-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {selectedTimezones.map((tz) => (
                          <span key={tz} className="inline-flex items-center gap-1.5 bg-[#EBF6FF] text-[#0047CC] border border-[#BDD9FF] rounded-full px-3 py-1 text-[11px] font-bold">
                            {tz}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTimezone(tz)}
                              className="text-[#387DFF] hover:text-[#0047CC] font-bold text-sm cursor-pointer ml-0.5"
                            >
                              &#215;
                            </button>
                          </span>
                        ))}
                        {selectedTimezones.length === 0 && (
                          <p className="text-[12px] font-medium text-gray-300 italic pt-1">No timezones selected yet</p>
                        )}
                      </div>

                      {/* Scrollable multi-timezone selector list */}
                      <div className="border border-[#E6E6E6] bg-white rounded-lg p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {TZ_GROUPS.map((grp) => (
                          <div key={grp.label} className="mb-3.5 last:mb-0">
                            <h4 className="text-[10px] font-extrabold text-[#ADADAD] uppercase tracking-wider px-3.5 py-1.5 bg-gray-50/50 rounded">{grp.label}</h4>
                            <div className="space-y-0.5 mt-1">
                              {grp.options.map((opt) => {
                                const isSel = selectedTimezones.includes(opt.value);
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleToggleTimezone(opt.value)}
                                    className={`w-full text-left px-3.5 py-2 text-xs rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                                      isSel 
                                        ? 'bg-[#EBF6FF] text-[#0047CC] font-bold' 
                                        : 'text-[#4A4A4A] hover:bg-gray-50'
                                    }`}
                                  >
                                    <span>{opt.label}</span>
                                    {isSel && (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Start Date */}
                  <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-text-secondary mb-2.5">Start date</label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-semibold text-sm text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  {/* End Date (optional) */}
                  <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-text-secondary mb-2.5">
                      End date <span className="text-[11px] text-gray-400 font-normal italic">optional</span>
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-semibold text-sm text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  {/* Role Summary */}
                  <div className="col-span-1 md:col-span-2 flex flex-col w-full">
                    <label className="block text-sm font-medium text-text-secondary mb-2.5">Role summary</label>
                    <textarea 
                      placeholder="Briefly describe what this role is for and its primary purpose within your organisation. e.g. 'We are a specialist fertility clinic recruiting an experienced embryologist to lead our IVF laboratory.' or 'We are hiring a field epidemiologist to lead outbreak response in three provinces.'"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all placeholder:text-gray-400 text-sm font-semibold text-[#1A1A1A] resize-y min-h-[96px] leading-relaxed"
                    />
                  </div>
                </div>

                {/* ELIGIBILITY & GEOPOLITICAL SECTION */}
                <div className="pt-4 border-t border-[#E6E6E6] space-y-6">
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.3" className="shrink-0 text-[#0047CC]">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <h3 className="text-[15px] font-extrabold text-[#1A1A1A] tracking-tight">Eligibility and geopolitical settings</h3>
                  </div>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    These fields power VORA's geopolitical filter. Accurate answers here directly determine which candidates are legally eligible to see this role.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* International policy */}
                    <div className="col-span-1 md:col-span-2">
                      <Select 
                        label="International candidate policy"
                        value={internationalPolicy}
                        placeholder="Select option"
                        options={INT_POLICY_OPTIONS}
                        onChange={(e) => setInternationalPolicy(e.target.value)}
                        hint="This determines whether the geopolitical filter runs in standard or modified mode per VORA's matching rules."
                      />
                    </div>

                    {/* Security clearance */}
                    <Select 
                      label="Security clearance required (optional)"
                      value={securityClearance}
                      placeholder="Select option"
                      options={SECURITY_CLEARANCE_OPTIONS}
                      onChange={(e) => setSecurityClearance(e.target.value)}
                    />

                    {/* Work permits accepted */}
                    <div className="flex flex-col w-full">
                      <label className="block text-sm font-medium text-[#374151] mb-2.5">
                        Work permit types accepted <span className="text-[11px] text-gray-400 font-normal italic">optional</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {selectedWorkPermits.map((pm) => (
                          <span key={pm} className="inline-flex items-center gap-1 bg-[#EBF6FF] text-[#0047CC] border border-[#BDD9FF] rounded-full px-2.5 py-1 text-[11px] font-bold">
                            {pm.length > 25 ? pm.substring(0, 25) + '...' : pm}
                            <button 
                              type="button" 
                              onClick={() => setSelectedWorkPermits(selectedWorkPermits.filter(p => p !== pm))}
                              className="text-[#387DFF] hover:text-[#0047CC] font-bold cursor-pointer"
                            >
                              &#215;
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !selectedWorkPermits.includes(val)) {
                              setSelectedWorkPermits([...selectedWorkPermits, val]);
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-semibold text-sm text-[#1A1A1A]"
                        >
                          <option value="">Select all that apply...</option>
                          {WORK_PERMIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULED HIRING SECTION */}
                <div className="pt-6 border-t border-[#E6E6E6] space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="text-[#0047CC]">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-[15px] font-extrabold text-[#1A1A1A]">Scheduled Hiring</span>
                      </div>
                      <p className="text-[11px] text-[#808080] font-semibold leading-relaxed">
                        Not hiring right now? Submit the role today and set the exact date it should go live.
                      </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={isScheduled} 
                        onChange={() => setIsScheduled(!isScheduled)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[#E6E6E6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0047CC] after:shadow-sm"></div>
                    </label>
                  </div>

                  {isScheduled && (
                    <div className="space-y-6 pt-4 border-t border-blue-100 bg-[#EBF6FF]/30 border border-[#BDD9FF] rounded-xl p-5 md:p-6 animate-in slide-in-from-top-2 duration-300">
                      {/* Explainer Box */}
                      <div className="flex items-start gap-3 p-4 bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0 mt-0.5 text-[#0047CC]">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p className="text-xs md:text-[13px] leading-relaxed text-[#1e3a8a]">
                          <strong>How Scheduled Hiring works:</strong> Your role enters Vault state immediately on submission. It is completely invisible — no candidate sees it, no candidate knows it exists. VORA locks your platform fee in escrow at today's rate. During the vault period, every candidate who joins VORA and completes onboarding is silently matched against your specification in the background. Those who score 80% or above are pre-qualified internally — they are never told about the role. On go-live day, the role publishes publicly, pre-qualified candidates are notified instantly, and any other qualified candidates in the pool are matched in real time.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Go Live Date */}
                        <div className="flex flex-col w-full space-y-2">
                          <label className="block text-sm font-semibold text-[#1A1A1A]">Go-live date</label>
                          <div className="relative w-full">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                            </div>
                            <input 
                              type="date"
                              value={goLiveDate}
                              onChange={(e) => setGoLiveDate(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0047CC]/20 focus:border-[#0047CC] transition-all font-semibold text-sm text-[#1A1A1A]"
                            />
                          </div>
                          <span className="text-[11px] text-[#808080] leading-relaxed mt-1 font-semibold">
                            The role becomes visible to candidates and matching fires on this date. There is no minimum or maximum lead time - you choose when you are ready to hire.
                          </span>
                        </div>

                        {/* Specification Version Meter */}
                        <div className="space-y-3.5">
                          <label className="block text-sm font-semibold text-[#1A1A1A]">
                            Role specification version <span className="text-[11px] text-gray-400 font-normal italic">edit allowance</span>
                          </label>
                          <div className="space-y-2">
                            <div className="text-[12px] font-bold text-[#4A4A4A]">
                              Edits remaining before go-live: <strong className="text-[#0047CC]" id="editsLeft">{editsRemaining} of 3</strong>
                            </div>
                            <div className="flex gap-1.5 h-1.5">
                              {[0, 1, 2].map((seg) => (
                                <button
                                  key={seg}
                                  type="button"
                                  onClick={() => {
                                    if (seg >= editsRemaining - 1) {
                                      setEditsCount(3 - seg);
                                    } else {
                                      setEditsCount(2 - seg);
                                    }
                                  }}
                                  className={`flex-1 h-full rounded-full transition-all duration-300 cursor-pointer ${
                                    seg < editsRemaining ? 'bg-[#0047CC]' : 'bg-[#E6E6E6]'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-[#808080] leading-relaxed font-semibold">
                              You may edit the role specification up to 3 times before it goes live. Each edit triggers a 48-hour internal review window before the updated spec is locked.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vault Lifecycle Steps */}
                      <div className="border border-blue-100 bg-white rounded-xl p-5 md:p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[#0047CC] shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2"/>
                              <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-[14px] font-extrabold text-[#182348]">Vault lifecycle</h4>
                            <p className="text-[11px] text-[#808080] font-semibold mt-0.5">What happens between submission and go-live</p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-1">
                          {[
                            { num: 1, title: 'Submission today:', text: 'Role enters Vault state. Invisible to all candidates. Fee locked in escrow at today\'s rate. You receive a submission confirmation and vault reference number.' },
                            { num: 2, title: 'Vault period — silent matching:', text: 'No candidate sees this role or knows it exists. Every new candidate who joins VORA and completes their profile is silently matched against your specification. Those who score 80% or above are flagged internally as pre-qualified — they are not contacted, not told about the role. You can see the live count of pre-qualified candidates in your Vault dashboard at any time.' },
                            { num: 3, title: '72 hours before go-live:', text: 'VORA sends you a reminder. You can cancel with a full refund to your wallet up until 24 hours before go-live.' },
                            { num: 4, title: 'Go-live:', text: 'Role publishes publicly. Pre-qualified candidates are notified instantly — because matching already ran during the vault period, there is no processing delay. Any other qualified candidates in the pool are matched and notified in real time.' },
                            { num: 5, title: 'If you cancel before go-live:', text: 'Full fee refund to your VORA wallet. No questions asked if cancelled more than 24 hours before go-live.' }
                          ].map((step) => (
                            <div key={step.num} className="flex gap-3">
                              <div className="w-5 h-5 rounded-full bg-[#0047CC] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                {step.num}
                              </div>
                              <p className="text-[12px] leading-relaxed text-[#4A4A4A]">
                                <strong>{step.title}</strong> {step.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fee Locked Warning */}
                      <div className="flex items-start gap-3 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" className="shrink-0 mt-0.5 text-[#D97706]">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p className="text-xs md:text-[13px] leading-relaxed text-[#92400E]">
                          <strong>Fee rate locked today.</strong> Your escrow amount is calculated at submission using the current VORA fee rate. If VORA reprices before your go-live date, you pay the rate that was in force on the day you submitted. This is your protection for committing early.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: RESPONSIBILITIES & SKILLS */}
            {currentStep === 2 && (
              <div className="bg-white border border-[#E6E6E6] rounded-[20px] p-6 md:p-9 shadow-sm space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Step 02</span>
                  <h3 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">What will they do?</h3>
                  <p className="text-[13px] text-[#808080] leading-relaxed">Define the core responsibilities and technical requirements.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-900">Core Responsibilities</label>
                    <textarea 
                      placeholder="Enter responsibilities, one per line..."
                      className="w-full px-4 py-3 rounded-lg border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all placeholder:text-gray-400 text-sm font-semibold text-[#1A1A1A] h-48 resize-none mt-2 leading-relaxed"
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[13px] font-bold text-gray-900">Required Skills</label>
                    <div className="flex gap-2">
                      <input 
                        placeholder="e.g. Data Analysis, Stata, Python"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[#E6E6E6] bg-white outline-none focus:border-[#0047CC] transition-all text-sm font-semibold"
                      />
                      <button 
                        type="button" 
                        onClick={addSkill}
                        className="px-6 min-h-[42px] bg-white border border-[#E6E6E6] hover:border-[#0047CC] hover:bg-[#EBF6FF] text-[#0047CC] font-medium text-[13px] rounded-full transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1.5 bg-[#EBF6FF] text-[#0047CC] border border-[#BDD9FF] rounded-full px-3 py-1 text-xs font-bold">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)} 
                            className="text-[#387DFF] hover:text-[#0047CC] font-bold text-sm ml-0.5 cursor-pointer"
                          >
                            &#215;
                          </button>
                        </span>
                      ))}
                      {skills.length === 0 && (
                        <p className="text-[12px] font-semibold text-gray-300 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEPS 3, 4, 5: UI IN PROGRESS */}
            {currentStep > 2 && currentStep < 6 && (
              <div className="bg-white border border-[#E6E6E6] rounded-[20px] p-12 text-center shadow-sm space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUpIcon size={40} className="text-gray-300" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Step {currentStep} UI In Progress</h3>
                  <p className="text-[13px] font-semibold text-gray-400 leading-relaxed">
                    We're building the specialized inputs for this step. Click Continue to advance or Back to modify your role details!
                  </p>
                </div>
              </div>
            )}

            {/* STEP 6: PREVIEW */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight">Job Preview</h3>

                <div className="bg-white border border-[#E6E6E6] rounded-[24px] p-6 md:p-8 space-y-6">
                  {/* SECTION 1: Role details */}
                  <div className="space-y-4">
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] pb-2 border-b border-gray-100">Role details</h4>
                    <div className="grid grid-cols-3 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role type</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{roleType || 'Internship'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role title</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{roleTitle || 'Global Health Research Intern'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Employment level</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{level ? (level.charAt(0).toUpperCase() + level.slice(1)) : '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Available positions</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{positions ? `${positions} positions` : '3 positions'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Time commitment</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{timeCommitment ? `${timeCommitment}hrs/week` : '20hrs/week'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Time preference</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">GMT + 1</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Work format</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{workFormat || 'Onsite'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Work location</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{location || 'Lagos, Nigeria'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Start date</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{formatDate(startDate) || 'October 21st, 2025'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">End date</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">{formatDate(endDate) || 'January 21st 2026'}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role summary</p>
                      <p className="text-[13px] font-medium text-gray-700 mt-1 leading-relaxed">
                        {summary || 'Lorem ipsum dolor sit amet consectetur. Vierra lectus rutrum luesnh...'} <span className="text-[#0047CC] font-bold cursor-pointer hover:underline">see more</span>
                      </p>
                    </div>
                  </div>

                  {/* SECTION 2: Responsibilities & skills */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] pb-2 border-b border-gray-100">Responsibilities & skills</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role/Problem to solve</p>
                        <p className="text-[13px] font-medium text-gray-700 mt-1 leading-relaxed">
                          Lorem ipsum dolor sit amet consectetur. Viverra lectus rutrum lorem sit amet. Amet morbi massa proin... <span className="text-[#0047CC] font-bold cursor-pointer hover:underline">see more</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Core responsibilities</p>
                        <p className="text-[13px] font-medium text-gray-700 mt-1 leading-relaxed">
                          Lorem ipsum dolor sit amet consectetur. Viverra lectus rutrum lorem sit amet... <span className="text-[#0047CC] font-bold cursor-pointer hover:underline">see more</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Technical skills required</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {skills.length > 0 ? (
                            skills.map((skill, idx) => (
                              <span key={skill} className={`px-3 py-1 border rounded-full text-xs font-semibold ${
                                idx % 2 === 0 
                                  ? 'bg-[#EBF6FF] border-[#BDD9FF] text-[#0047CC]' 
                                  : 'bg-[#EEFBEE] border-[#85E585] text-[#1D871D]'
                              }`}>
                                {skill}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Research Analysis</span>
                              <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Communication & Writing</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tools required</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Statistical Softwares</span>
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">GIS Mapping Softwares</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Experience & background */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] pb-2 border-b border-gray-100">Experience & background</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Academic level</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">Undergraduate</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Relevant field</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">Nursing, Midwifery</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Years of experience</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">0 - 6 months</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Team collaboration & communication */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] pb-2 border-b border-gray-100">Team collaboration & communication</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Preferred work style</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Independent</span>
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Field-oriented</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Communication/collaboration style</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">Weekly check-ins</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Communication language</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">English</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Personality traits</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Empathetic</span>
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Curious</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Work culture</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Collaborative</span>
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Remote-first</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: Compensation & documentation */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] pb-2 border-b border-gray-100">Compensation & documentation</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Duration</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">Weekly</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Amount</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">120 USD</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Personality traits</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Empathetic</span>
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Curious</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Work culture</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-3 py-1 bg-[#EEFBEE] border border-[#85E585] rounded-full text-xs font-semibold text-[#1D871D]">Collaborative</span>
                          <span className="px-3 py-1 bg-[#EBF6FF] border border-[#BDD9FF] rounded-full text-xs font-semibold text-[#0047CC]">Remote-first</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="h-[96px] bg-white border-t border-[#E6E6E6] px-8 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
            <Button 
              variant="outline"
              fullWidth={false}
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 min-h-[44px] text-sm font-extrabold flex items-center gap-1.5 ${
                currentStep === 1 ? 'text-gray-300 border-none' : 'text-[#4A4A4A] border-[#E6E6E6]'
              }`}
            >
              <ChevronLeftIcon size={18} /> Back
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={handleClose}
                className="px-6 min-h-[44px] text-sm font-bold text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Save as draft
              </Button>
              <Button 
                onClick={currentStep === 6 ? handleClose : nextStep}
                fullWidth={false}
                className="px-8 min-h-[48px] text-sm font-bold shadow-lg shadow-blue-500/20"
              >
                {currentStep === 6 ? 'Continue to payment' : 'Proceed'}
                {currentStep !== 6 && <ChevronRightIcon size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobWizard;
