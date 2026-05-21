import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon
} from '../common/Icons';
import Select from '../common/Select';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Tag from '../common/Tag';
import MultiSelect from '../common/MultiSelect';

import type { PostJobWizardProps, Option, OptionGroup } from '../../types';
import {
  STEPS,
  ROLE_TYPE_GROUPS,
  EMPLOYMENT_LEVEL_OPTIONS,
  WORK_FORMAT_OPTIONS,
  INT_POLICY_OPTIONS,
  SECURITY_CLEARANCE_OPTIONS,
  WORK_PERMIT_OPTIONS,
  TZ_REGIONS,
  TZ_GROUPS,
  PREFERRED_WORKING_STYLE_OPTIONS,
  PERSONALITY_TRAITS_OPTIONS,
  WORK_ENVIRONMENT_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  EXPERIENCE_TYPES_GROUPS,
  MIN_QUALIFICATION_OPTIONS,
  SECTOR_BACKGROUND_GROUPS,
  GEOGRAPHIC_EXPERIENCE_OPTIONS,
  PUBLICATIONS_OPTIONS,
  BUDGET_MANAGEMENT_OPTIONS,
  TEAM_MANAGEMENT_OPTIONS,
  INT_POLICY_ELIGIBILITY_OPTIONS,
  SECURITY_CLEARANCE_ELIGIBILITY_OPTIONS,
  TECHNICAL_SKILLS_GROUPS,
  TOOLS_SOFTWARE_GROUPS,
  LANGUAGE_OPTIONS,
  PRE_ASSESSMENT_GROUPS
} from '../../constants/jobWizard';

const PostJobWizard: React.FC<PostJobWizardProps> = ({ isOpen, onClose, initialConfig }) => {
  // const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobStepNavOpen, setIsMobStepNavOpen] = useState(false);
  // const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

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

  // Timezone search filter query
  const [tzSearchQuery, setTzSearchQuery] = useState('');

  const getFilteredTzGroups = (): OptionGroup[] => {
    if (!tzSearchQuery.trim()) return TZ_GROUPS;
    const query = tzSearchQuery.toLowerCase();
    return TZ_GROUPS.map((grp: OptionGroup) => {
      const filteredOptions = grp.options.filter((opt: Option) => 
        opt.label.toLowerCase().includes(query) || 
        opt.value.toLowerCase().includes(query)
      );
      return {
        ...grp,
        options: filteredOptions
      };
    }).filter((grp: OptionGroup) => grp.options.length > 0);
  };

  // Step 2 state
  const [roleGoal, setRoleGoal] = useState('');
  const [coreResponsibilities, setCoreResponsibilities] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [preAssessments, setPreAssessments] = useState<string[]>([]);

  // Step 3 state
  const [experienceYears, setExperienceYears] = useState('');
  const [experienceTypes, setExperienceTypes] = useState<string[]>([]);
  const [minQualification, setMinQualification] = useState('');
  const [preferredQualifications, setPreferredQualifications] = useState('');
  const [sectorBackground, setSectorBackground] = useState<string[]>([]);
  const [geographicExperience, setGeographicExperience] = useState<string[]>([]);
  const [publicationsRequired, setPublicationsRequired] = useState('');
  const [budgetManagement, setBudgetManagement] = useState('');
  const [teamManagement, setTeamManagement] = useState('');
  const [eligibilityIntPolicy, setEligibilityIntPolicy] = useState('');
  const [eligibilitySecClearance, setEligibilitySecClearance] = useState('');
  const [preferredProfile, setPreferredProfile] = useState('');

  // Step 4 state
  const [preferredWorkingStyle, setPreferredWorkingStyle] = useState<string[]>([]);
  const [communicationRhythm, setCommunicationRhythm] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [workEnvironment, setWorkEnvironment] = useState<string[]>([]);
  const [additionalTeamContext, setAdditionalTeamContext] = useState('');

  // Step 5: Compensation & Documentation
  const [compType, setCompType] = useState<'sal' | 'con' | 'sti' | 'unp' | 'phd' | 'uni'>('sal');

  // Currencies for each panel
  const [salCur, setSalCur] = useState('USD');
  const [conCur, setConCur] = useState('USD');
  const [stiCur, setStiCur] = useState('USD');
  const [phdCur, setPhdCur] = useState('GBP');
  const [uniCur, setUniCur] = useState('USD');

  // Values/Ranges
  const [salMin, setSalMin] = useState('');
  const [salMax, setSalMax] = useState('');
  const [conMin, setConMin] = useState('');
  const [conMax, setConMax] = useState('');
  const [stiVal, setStiVal] = useState('');
  const [phdVal, setPhdVal] = useState('');
  const [uniTuition, setUniTuition] = useState('');

  // Contract/Placement Durations
  const [conDuration, setConDuration] = useState(220); // standard 1 year in working days
  const [stiDuration, setStiDuration] = useState(12);   // standard 12 months for stipend
  const [durationPreset, setDurationPreset] = useState('220'); // '22' | '65' | '110' | '165' | '220' | '330' | '440' | 'custom'

  // University admissions
  const [uniProg, setUniProg] = useState('');
  const [uniStudentCount, setUniStudentCount] = useState('1');
  const [isUniProgOpen, setIsUniProgOpen] = useState(false);

  // Unpaid expenses/allowances
  const [expenses, setExpenses] = useState('');

  // Documentation / Support documents
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uniProgRef = useRef<HTMLDivElement>(null);

  // Internal notes
  const [internalNotes, setInternalNotes] = useState('');

  // Click away listener for university programme dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (uniProgRef.current && !uniProgRef.current.contains(e.target as Node)) {
        setIsUniProgOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // LMIC Currency Map
  const LMIC_CURRENCIES: Record<string, boolean> = {
    NGN: true, GHS: true, XOF: true, XAF: true, SLL: true, LRD: true, GMD: true, GNF: true, // West Africa
    KES: true, TZS: true, UGX: true, ETB: true, RWF: true, BIF: true, DJF: true, ERN: true, SOS: true, SDG: true, SSP: true, // East Africa
    ZMW: true, MWK: true, BWP: true, NAD: true, LSL: true, SZL: true, // Southern Africa (excl ZAR)
    MAD: true, DZD: true, TND: true, LYD: true, // North Africa
    MUR: true, MGA: true, KMF: true, // Indian Ocean
    INR: true, PKR: true, BDT: true, LKR: true, NPR: true, // South Asia
    MMK: true, KHR: true, VND: true, IDR: true, PHP: true, // Lower-income SE Asia
    EGP: true, LBP: true, YER: true // Lower-income MENA
  };

  const checkIsLMIC = (type: string, cur: string) => {
    if (type === 'unp') return false; // Unpaid defaults to non-LMIC
    return !!LMIC_CURRENCIES[cur];
  };

  const getActiveCurrency = (): string => {
    if (compType === 'sal') return salCur;
    if (compType === 'con') return conCur;
    if (compType === 'sti') return stiCur;
    if (compType === 'phd') return phdCur;
    if (compType === 'uni') return uniCur;
    return 'USD';
  };

  const isLmicActive = checkIsLMIC(compType, getActiveCurrency());

  const getFeeRate = (type: string, lmic: boolean): number => {
    if (type === 'sal' || type === 'con') return lmic ? 0.10 : 0.15;
    if (type === 'sti' || type === 'phd') return lmic ? 0.07 : 0.10;
    return 0;
  };

  const getFeeLabel = (type: string, lmic: boolean): string => {
    if (type === 'sal' || type === 'con') return lmic ? '10% (LMIC rate)' : '15%';
    if (type === 'sti' || type === 'phd') return lmic ? '7% (LMIC rate)' : '10%';
    return '';
  };

  const getFlatFee = () => (isLmicActive ? 50 : 500);

  const getUniFee = (tuition: number, prog: string, lmic: boolean): number => {
    let fee = 0;
    if (lmic) {
      if (tuition < 5000) fee = 75;
      else if (tuition < 15000) fee = 125;
      else if (tuition < 30000) fee = 200;
      else if (tuition < 50000) fee = 350;
      else fee = 500;
      if (prog.includes('Short course')) fee = 50;
      if (prog.includes('Self-funded PhD')) fee = fee * 1.5;
    } else {
      if (tuition < 15000) fee = 750;
      else if (tuition < 30000) fee = 1200;
      else if (tuition < 50000) fee = 1800;
      else fee = 2500;
      if (prog.includes('Short course')) fee = 350;
      if (prog.includes('Self-funded PhD')) fee = fee * 1.5;
    }
    return fee;
  };

  const applyLMICFloorCap = (fee: number, pos: number, lmic: boolean): number => {
    if (!lmic) return fee;
    const positionsCount = pos || 1;
    let perPos = fee / positionsCount;
    perPos = Math.max(200, Math.min(3000, perPos));
    return perPos * positionsCount;
  };

  const fmt = (value: number, currency: string): string => {
    const rounded = Math.round(value);
    const formatted = rounded.toLocaleString('en-US');
    const syms: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', CHF: 'CHF ', JPY: '¥', CAD: 'CA$', AUD: 'A$', NZD: 'NZ$',
      SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв', TRY: '₺',
      AED: 'AED ', SAR: 'SAR ', QAR: 'QAR ', KWD: 'KD', BHD: 'BD', OMR: 'OMR ', JOD: 'JD', ILS: '₪', EGP: 'E£', LBP: 'L£',
      NGN: '₦', GHS: 'GH₵', XOF: 'CFA ', XAF: 'FCFA ', SLL: 'Le', LRD: 'L$', GMD: 'D', GNF: 'FG',
      KES: 'KSh', TZS: 'TSh', UGX: 'USh', ETB: 'Br', RWF: 'RF', BIF: 'FBu', DJF: 'Fdj', ERN: 'Nfk', SOS: 'Sh', SDG: 'SDG ', SSP: 'SSP ',
      ZAR: 'R', ZMW: 'ZK', MWK: 'MK', BWP: 'P', NAD: 'N$', LSL: 'L', SZL: 'L',
      MAD: 'MAD ', DZD: 'DZD ', TND: 'TND ', LYD: 'LYD ',
      MUR: 'Rs', SCR: 'SCR ', MGA: 'Ar', KMF: 'CF',
      INR: '₹', PKR: 'Rs', BDT: '৳', LKR: 'Rs', NPR: 'Rs',
      SGD: 'S$', MYR: 'RM', PHP: '₱', IDR: 'Rp', THB: '฿', VND: '₫', KHR: 'CR', MMK: 'K',
      CNY: '¥', HKD: 'HK$', TWD: 'NT$', KRW: '₩',
      BRL: 'R$', MXN: 'MX$', COP: 'COP$', PEN: 'S/', CLP: 'CLP$', ARS: '$', UYU: '$U', BOB: 'Bs',
      GTQ: 'Q', DOP: 'RD$', JMD: 'J$', TTD: 'TT$'
    };
    return (syms[currency] || (currency + ' ')) + formatted;
  };

  const showEscrow = (type: string) => {
    if (type === 'sal') return !!salMin || !!salMax;
    if (type === 'con') return !!conMin || !!conMax;
    if (type === 'sti') return !!stiVal;
    if (type === 'phd') return !!phdVal;
    if (type === 'uni') return !!uniTuition && !!uniProg;
    return false;
  };

  const renderEscrowBox = (type: 'sal' | 'con' | 'sti' | 'phd' | 'uni') => {
    const cur = getActiveCurrency();
    const lmic = isLmicActive;
    const pos = parseInt(positions) || 1;

    if (type === 'sal') {
      const mn = parseFloat(salMin) || 0;
      const mx = parseFloat(salMax) || 0;
      const mid = mn && mx ? (mn + mx) / 2 : (mn || mx);
      const rate = getFeeRate('sal', lmic);
      const total = applyLMICFloorCap(mid * pos * rate, pos, lmic);

      return (
        <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4.5 mt-4">
          <div className="text-[13px] font-extrabold text-[#182348] mb-2.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#182348" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Escrow calculation (VORA fee)
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Salary midpoint</span>
              <span className="text-[#182348] font-bold">{fmt(mid, cur)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Available positions</span>
              <span className="text-[#182348] font-bold">{pos} position{pos > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Fee rate (locked at submission)</span>
              <span className="text-[#182348] font-bold">{getFeeLabel('sal', lmic)}</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-extrabold">
              <span className="text-[#0047CC]">Total escrow to lock</span>
              <span className="text-[#0047CC]">{fmt(total, cur)}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#1e3a8a] mt-2.5 leading-relaxed bg-white/50 rounded-lg p-2 font-medium">
            This amount will be charged to your payment method and held in escrow. On a confirmed hire, the true-up fires: if the actual agreed salary differs from the midpoint, VORA charges or refunds the difference. If no hire occurs, escrow minus the non-refundable search fee is returned to your wallet. The search fee is 5% for LMIC employers and 10% otherwise.
          </div>
        </div>
      );
    }

    if (type === 'con') {
      const mn = parseFloat(conMin) || 0;
      const mx = parseFloat(conMax) || 0;
      const mid = mn && mx ? (mn + mx) / 2 : (mn || mx);
      const ann = mid * conDuration;
      const rate = getFeeRate('con', lmic);
      const total = applyLMICFloorCap(ann * pos * rate, pos, lmic);

      return (
        <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4.5 mt-4">
          <div className="text-[13px] font-extrabold text-[#182348] mb-2.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#182348" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Escrow calculation (contract)
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Daily rate midpoint</span>
              <span className="text-[#182348] font-bold">{fmt(mid, cur)}/day</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Contract duration</span>
              <span className="text-[#182348] font-bold">{conDuration} working days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Total contract value (midpoint)</span>
              <span className="text-[#182348] font-bold">{fmt(ann, cur)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Available positions</span>
              <span className="text-[#182348] font-bold">{pos} position{pos > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Fee rate</span>
              <span className="text-[#182348] font-bold">{getFeeLabel('con', lmic)}</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-extrabold">
              <span className="text-[#0047CC]">Total escrow to lock</span>
              <span className="text-[#0047CC]">{fmt(total, cur)}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#1e3a8a] mt-2.5 leading-relaxed bg-white/50 rounded-lg p-2 font-medium">
            Escrow is based on daily rate × working days × positions × your applicable fee rate (10% LMIC / 15% other regions). True-up fires at hire. Escrow minus search fee returned to wallet if no hire occurs.
          </div>
        </div>
      );
    }

    if (type === 'sti') {
      const v = parseFloat(stiVal) || 0;
      const rate = getFeeRate('sti', lmic);
      const total = v * pos * rate;

      return (
        <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4.5 mt-4">
          <div className="text-[13px] font-extrabold text-[#182348] mb-2.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#182348" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Escrow calculation (stipend)
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Stipend value</span>
              <span className="text-[#182348] font-bold">{fmt(v, cur)} ({stiDuration} months)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Available positions</span>
              <span className="text-[#182348] font-bold">{pos} position{pos > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Fee rate (stipend tier)</span>
              <span className="text-[#182348] font-bold">{getFeeLabel('sti', lmic)}</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-extrabold">
              <span className="text-[#0047CC]">Total escrow to lock</span>
              <span className="text-[#0047CC]">{fmt(total, cur)}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#1e3a8a] mt-2.5 leading-relaxed bg-white/50 rounded-lg p-2 font-medium">
            The fee (5% LMIC / 10% other regions) applies to the full stipend value. Additional benefits or top-ups do not factor into the escrow calculation.
          </div>
        </div>
      );
    }

    if (type === 'phd') {
      const v = parseFloat(phdVal) || 0;
      const rate = getFeeRate('phd', lmic);
      const total = v * rate;

      return (
        <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4.5 mt-4">
          <div className="text-[13px] font-extrabold text-[#182348] mb-2.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#182348" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Escrow calculation (PhD)
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Year-1 stipend</span>
              <span className="text-[#182348] font-bold">{fmt(v, cur)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Fee rate (PhD tier)</span>
              <span className="text-[#182348] font-bold">{getFeeLabel('phd', lmic)}</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-extrabold">
              <span className="text-[#0047CC]">Total escrow to lock</span>
              <span className="text-[#0047CC]">{fmt(total, cur)}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#1e3a8a] mt-2.5 leading-relaxed bg-white/50 rounded-lg p-2 font-medium">
            One position only for PhD roles. True-up fires at acceptance against the confirmed stipend. Tuition fees and bench fees are excluded from the calculation.
          </div>
        </div>
      );
    }

    if (type === 'uni') {
      const tuition = parseFloat(uniTuition) || 0;
      const fee = getUniFee(tuition, uniProg, lmic);
      const students = parseInt(uniStudentCount) || 1;
      const total = fee * students;

      return (
        <div className="bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl p-4.5 mt-4">
          <div className="text-[13px] font-extrabold text-[#182348] mb-2.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#182348" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Placement fee calculation
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Programme type</span>
              <span className="text-[#182348] font-bold">{uniProg}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Annual tuition</span>
              <span className="text-[#182348] font-bold">{fmt(tuition, cur)} per year</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Fee tier</span>
              <span className="text-[#182348] font-bold">{fmt(fee, 'USD')} per enrolled student</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#BDD9FF]/60 text-[13px]">
              <span className="text-[#182348]/80 font-medium">Positions / students</span>
              <span className="text-[#182348] font-bold">{students} student{students > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between pt-2 text-[14px] font-extrabold">
              <span className="text-[#0047CC]">Total placement fee to lock</span>
              <span className="text-[#0047CC]">{fmt(total, 'USD')}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#1e3a8a] mt-2.5 leading-relaxed bg-white/50 rounded-lg p-2 font-medium">
            This flat fee is locked at application submission and released on confirmed student enrolment. If the student does not enrol, a non-refundable search fee is retained (5% for LMIC employers, 10% otherwise) and the remainder returned to your wallet. No annual renewal required — single fee per enrolled student.
          </div>
        </div>
      );
    }

    return null;
  };

  const handleDurationPresetClick = (presetDays: number, presetId: string) => {
    setDurationPreset(presetId);
    if (presetDays > 0) {
      setConDuration(presetDays);
      setStiDuration(Math.round(presetDays / 22));
    }
  };

  const handleCustomDurationChange = (val: string) => {
    const days = parseInt(val) || 0;
    setConDuration(days);
    setStiDuration(Math.round(days / 22));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size <= 10 * 1024 * 1024) {
        setJdFile(file);
      } else {
        alert("File size must be under 10MB");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size <= 10 * 1024 * 1024) {
        setJdFile(file);
      } else {
        alert("File size must be under 10MB");
      }
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJdFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  const renderGlobalCurrencyOptions = () => (
    <>
      <optgroup label="Major Global">
        <option value="USD">USD — US Dollar $</option>
        <option value="EUR">EUR — Euro €</option>
        <option value="GBP">GBP — British Pound £</option>
        <option value="CHF">CHF — Swiss Franc</option>
        <option value="JPY">JPY — Japanese Yen ¥</option>
        <option value="CAD">CAD — Canadian Dollar CA$</option>
        <option value="AUD">AUD — Australian Dollar A$</option>
        <option value="NZD">NZD — New Zealand Dollar NZ$</option>
      </optgroup>
      <optgroup label="Europe">
        <option value="SEK">SEK — Swedish Krona kr</option>
        <option value="NOK">NOK — Norwegian Krone kr</option>
        <option value="DKK">DKK — Danish Krone kr</option>
        <option value="PLN">PLN — Polish Złoty zł</option>
        <option value="CZK">CZK — Czech Koruna Kč</option>
        <option value="HUF">HUF — Hungarian Forint Ft</option>
        <option value="RON">RON — Romanian Leu lei</option>
        <option value="BGN">BGN — Bulgarian Lev лв</option>
        <option value="TRY">TRY — Turkish Lira ₺</option>
      </optgroup>
      <optgroup label="Gulf & Middle East">
        <option value="AED">AED — UAE Dirham</option>
        <option value="SAR">SAR — Saudi Riyal</option>
        <option value="QAR">QAR — Qatari Riyal</option>
        <option value="KWD">KWD — Kuwaiti Dinar</option>
        <option value="BHD">BHD — Bahraini Dinar</option>
        <option value="OMR">OMR — Omani Rial</option>
        <option value="JOD">JOD — Jordanian Dinar</option>
        <option value="ILS">ILS — Israeli Shekel ₪</option>
        <option value="EGP">EGP — Egyptian Pound</option>
        <option value="LBP">LBP — Lebanese Pound</option>
      </optgroup>
      <optgroup label="West Africa">
        <option value="NGN">NGN — Nigerian Naira ₦</option>
        <option value="GHS">GHS — Ghanaian Cedi GH₵</option>
        <option value="XOF">XOF — West African CFA Franc</option>
        <option value="XAF">XAF — Central African CFA Franc</option>
        <option value="SLL">SLL — Sierra Leonean Leone</option>
        <option value="LRD">LRD — Liberian Dollar</option>
        <option value="GMD">GMD — Gambian Dalasi</option>
        <option value="GNF">GNF — Guinean Franc</option>
      </optgroup>
      <optgroup label="East Africa">
        <option value="KES">KES — Kenyan Shilling KSh</option>
        <option value="TZS">TZS — Tanzanian Shilling TSh</option>
        <option value="UGX">UGX — Ugandan Shilling USh</option>
        <option value="ETB">ETB — Ethiopian Birr Br</option>
        <option value="RWF">RWF — Rwandan Franc RF</option>
        <option value="BIF">BIF — Burundian Franc</option>
        <option value="DJF">DJF — Djiboutian Franc</option>
        <option value="ERN">ERN — Eritrean Nakfa</option>
        <option value="SOS">SOS — Somali Shilling</option>
        <option value="SDG">SDG — Sudanese Pound</option>
        <option value="SSP">SSP — South Sudanese Pound</option>
      </optgroup>
      <optgroup label="Southern Africa">
        <option value="ZAR">ZAR — South African Rand R</option>
        <option value="ZMW">ZMW — Zambian Kwacha ZK</option>
        <option value="MWK">MWK — Malawian Kwacha</option>
        <option value="BWP">BWP — Botswana Pula</option>
        <option value="NAD">NAD — Namibian Dollar N$</option>
        <option value="LSL">LSL — Lesotho Loti</option>
        <option value="SZL">SZL — Swazi Lilangeni</option>
      </optgroup>
      <optgroup label="North Africa">
        <option value="MAD">MAD — Moroccan Dirham</option>
        <option value="DZD">DZD — Algerian Dinar</option>
        <option value="TND">TND — Tunisian Dinar</option>
      </optgroup>
      <optgroup label="Indian Ocean">
        <option value="MUR">MUR — Mauritian Rupee</option>
        <option value="SCR">SCR — Seychellois Rupee</option>
        <option value="MGA">MGA — Malagasy Ariary</option>
        <option value="KMF">KMF — Comorian Franc</option>
      </optgroup>
      <optgroup label="South Asia">
        <option value="INR">INR — Indian Rupee ₹</option>
        <option value="PKR">PKR — Pakistani Rupee Rs</option>
        <option value="BDT">BDT — Bangladeshi Taka ৳</option>
        <option value="LKR">LKR — Sri Lankan Rupee</option>
        <option value="NPR">NPR — Nepalese Rupee</option>
      </optgroup>
      <optgroup label="Southeast Asia">
        <option value="SGD">SGD — Singapore Dollar S$</option>
        <option value="MYR">MYR — Malaysian Ringgit RM</option>
        <option value="PHP">PHP — Philippine Peso ₱</option>
        <option value="IDR">IDR — Indonesian Rupiah Rp</option>
        <option value="THB">THB — Thai Baht ฿</option>
        <option value="VND">VND — Vietnamese Dong ₫</option>
        <option value="KHR">KHR — Cambodian Riel</option>
        <option value="MMK">MMK — Myanmar Kyat</option>
      </optgroup>
      <optgroup label="East Asia">
        <option value="CNY">CNY — Chinese Yuan Renminbi ¥</option>
        <option value="HKD">HKD — Hong Kong Dollar HK$</option>
        <option value="TWD">TWD — Taiwan Dollar NT$</option>
        <option value="KRW">KRW — South Korean Won ₩</option>
      </optgroup>
      <optgroup label="Latin America">
        <option value="BRL">BRL — Brazilian Real R$</option>
        <option value="MXN">MXN — Mexican Peso MX$</option>
        <option value="COP">COP — Colombian Peso COP$</option>
        <option value="PEN">PEN — Peruvian Sol S/</option>
        <option value="CLP">CLP — Chilean Peso CLP$</option>
        <option value="ARS">ARS — Argentine Peso $</option>
        <option value="UYU">UYU — Uruguayan Peso</option>
        <option value="BOB">BOB — Bolivian Boliviano Bs</option>
        <option value="GTQ">GTQ — Guatemalan Quetzal Q</option>
        <option value="DOP">DOP — Dominican Peso RD$</option>
        <option value="JMD">JMD — Jamaican Dollar J$</option>
        <option value="TTD">TTD — Trinidad & Tobago Dollar TT$</option>
      </optgroup>
    </>
  );

  const renderPhdCurrencyOptions = () => (
    <>
      <option value="GBP">GBP — British Pound £</option>
      <option value="USD">USD — US Dollar $</option>
      <option value="EUR">EUR — Euro €</option>
      <option value="CHF">CHF — Swiss Franc</option>
      <option value="SEK">SEK — Swedish Krona kr</option>
      <option value="NOK">NOK — Norwegian Krone kr</option>
      <option value="DKK">DKK — Danish Krone kr</option>
      <option value="AUD">AUD — Australian Dollar A$</option>
      <option value="CAD">CAD — Canadian Dollar CA$</option>
    </>
  );

  const renderUniCurrencyOptions = () => (
    <>
      <option value="USD">USD — US Dollar $</option>
      <option value="GBP">GBP — British Pound £</option>
      <option value="EUR">EUR — Euro €</option>
      <option value="CAD">CAD — Canadian Dollar CA$</option>
      <option value="AUD">AUD — Australian Dollar A$</option>
      <option value="NZD">NZD — New Zealand Dollar NZ$</option>
      <option value="CHF">CHF — Swiss Franc</option>
      <option value="SEK">SEK — Swedish Krona kr</option>
      <option value="SGD">SGD — Singapore Dollar S$</option>
    </>
  );

  // Sync roleType selection to sessionStorage and compType state for Step 5
  useEffect(() => {
    if (roleType) {
      const hint = getCompTypeHint(roleType);
      sessionStorage?.setItem('compTypeHint', hint);
      const map: Record<string, 'sal' | 'con' | 'sti' | 'unp' | 'phd' | 'uni'> = {
        salaried: 'sal',
        contract: 'con',
        stipend: 'sti',
        flat: 'unp',
        phd: 'phd',
        uni: 'uni'
      };
      if (map[hint]) {
        setCompType(map[hint]);
      }
    }
  }, [roleType]);

  // Helper to map role type to compensation type hint
  const getCompTypeHint = (type: string): string => {
    const salaried = [
      'Full-time employment', 'Part-time employment', 'Postdoctoral fellowship',
      'Research associate / postdoc', 'Teaching post', 'Finance / Accounting',
      'Human Resources (HR)', 'Procurement / Supply Chain / Logistics',
      'Legal / Compliance / Regulatory Affairs', 'Administration / Office Management',
      'Customer Service / Patient Services', 'Facilities / Estates / Engineering',
      'Catering / Nutrition Support Services', 'Security / Safeguarding Officer',
      'Driver / Transport Coordinator', 'Software Engineer / Developer',
      'Data Engineer / Analyst', 'IT Support / Systems Administrator',
      'Cybersecurity Specialist', 'UX / Product Designer', 'Social Media Manager',
      'Fundraising / Development Officer'
    ];
    const contract = [
      'Contract', 'Consultancy', 'Locum / Agency shift', 'Secondment',
      'Graphic Designer', 'Videographer / Photographer', 'Copywriter / Content Creator',
      'Translator / Interpreter', 'Grant Writer'
    ];
    const stipend = [
      'Internship (paid)', 'Traineeship', 'Fellowship', 'Residency / Foundation year placement'
    ];

    if (salaried.includes(type)) return 'salaried';
    if (contract.includes(type)) return 'contract';
    if (stipend.includes(type)) return 'stipend';
    return 'flat';
  };

  // Sync roleType selection to sessionStorage for Step 5
  useEffect(() => {
    if (roleType) {
      const hint = getCompTypeHint(roleType);
      sessionStorage?.setItem('compTypeHint', hint);
    }
  }, [roleType]);

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

  // Removed manual addSkill / removeSkill helpers since we use MultiSelect now

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
    <div className={`fixed inset-y-0 right-0 left-0 lg:left-[220px] z-[50] flex flex-col bg-[#F7F7F7] font-nunito transition-all duration-500 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-[#E6E6E6] px-6 flex items-center justify-between shrink-0">
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step Navigation Sidebar (Desktop) */}
        <div className="w-[256px] bg-white border-r border-[#E6E6E6] py-8 hidden lg:flex flex-col overflow-y-auto shrink-0">
          <div className="space-y-0">
            {STEPS.map((step) => {
              const isDone = currentStep > step.id;
              const isCur = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-3 px-6 py-3">
                  <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
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
                    <p className={`text-sm tracking-tight leading-tight font-semibold ${isCur ? 'text-[#0047CC]' : isDone ? 'text-[#4A4A4A]' : 'text-[#ADADAD]'}`}>
                      {step.title}
                    </p>
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

          <div className="flex-1 p-6 md:p-10 space-y-6">
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
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Role details</h2>
                  <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                    Core information about this role. VORA uses these fields to determine geopolitical eligibility, match candidates to your timezone, and score candidates on role fit.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-[18px]">
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
                    <div className="space-y-2.5 p-4 bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Additional hiring locations <span className="text-[11px] text-[#808080] font-normal italic">if hiring across multiple offices or cities</span>
                      </label>
                      <p className="text-xs text-[#808080] leading-relaxed">
                        Add each location separately. VORA will match candidates eligible to work in each location and route applications accordingly.
                      </p>
                      
                      <div className="flex flex-wrap gap-2.5 min-h-[32px] pt-1">
                        {additionalLocations.map((loc) => (
                          <Tag 
                            key={loc}
                            label={loc}
                            onRemove={() => handleRemoveLocation(loc)}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input 
                            label=""
                            placeholder="e.g. Nairobi, Kenya"
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLocation();
                              }
                            }}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline"
                          fullWidth={false}
                          onClick={() => handleAddLocation()}
                          className="px-6 min-h-[44px] border-[#E6E6E6] text-[#0047CC] hover:bg-[#EBF6FF] hover:border-[#0047CC] rounded-full font-bold text-xs"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Timezones multi-select with shortcuts (Unfurls when remote/hybrid/flexible) */}
                  {showTzSection && (
                    <div className="space-y-3.5 p-4 bg-[#F7F7F7] border border-[#E6E6E6] rounded-xl animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Timezone requirement(s) <span className="text-[11px] text-[#808080] font-normal italic">select all that apply</span>
                      </label>
                      <p className="text-xs text-[#808080] leading-relaxed">
                        VORA matches candidates who can sustainably overlap with <em>any</em> timezone you select. Select multiple for regional or global roles. Use the region shortcuts to quickly select an entire zone.
                      </p>

                      {/* Search Bar */}
                      <Input
                        label=""
                        placeholder="Search timezones (e.g. GMT, EST, Paris)..."
                        value={tzSearchQuery}
                        onChange={(e) => setTzSearchQuery(e.target.value)}
                        className="bg-white"
                      />

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
                          <Tag 
                            key={tz}
                            label={tz}
                            onRemove={() => handleRemoveTimezone(tz)}
                          />
                        ))}
                        {selectedTimezones.length === 0 && (
                          <p className="text-[12px] font-medium text-gray-300 italic pt-1">No timezones selected yet</p>
                        )}
                      </div>

                      {/* Scrollable multi-timezone selector list */}
                      <div className="border border-[#E6E6E6] bg-white rounded-lg p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {getFilteredTzGroups().map((grp: OptionGroup) => (
                          <div key={grp.label} className="mb-3.5 last:mb-0">
                            <h4 className="text-[10px] font-extrabold text-[#ADADAD] uppercase tracking-wider px-3.5 py-1.5 bg-gray-50/50 rounded">{grp.label}</h4>
                            <div className="space-y-0.5 mt-1">
                              {grp.options.map((opt: Option) => {
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
                        {getFilteredTzGroups().length === 0 && (
                          <p className="text-xs text-gray-400 font-medium italic text-center py-4">No matching timezones found</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Date */}
                  <Input 
                    label="Start date"
                    type="date"
                    icon={CalendarIcon}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  {/* End Date */}
                  <Input 
                    label={
                      <div className="flex items-center gap-1">
                        <span>End date</span>
                        <span className="text-[11px] text-gray-400 font-normal italic">(optional)</span>
                      </div>
                    }
                    type="date"
                    icon={CalendarIcon}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />

                  {/* Role Summary */}
                  <div>
                    <Textarea 
                      label="Role summary"
                      placeholder="Briefly describe what this role is for and its primary purpose within your organisation. e.g. 'We are a specialist fertility clinic recruiting an experienced embryologist to lead our IVF laboratory.' or 'We are hiring a field epidemiologist to lead outbreak response in three provinces.'"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      className="resize-y min-h-[96px] leading-relaxed"
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

                  <div className="grid grid-cols-1 gap-[18px]">
                    {/* International policy */}
                    <div>
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
                      label={
                        <div className="flex items-center gap-1">
                          <span>Security clearance required</span>
                          <span className="text-[11px] text-gray-400 font-normal italic">(optional)</span>
                        </div>
                      }
                      value={securityClearance}
                      placeholder="Select option"
                      options={SECURITY_CLEARANCE_OPTIONS}
                      onChange={(e) => setSecurityClearance(e.target.value)}
                    />

                    {/* Work permits accepted */}
                    <MultiSelect 
                      label={
                        <div className="flex items-center gap-1">
                          <span>Work permit types accepted</span>
                          <span className="text-[11px] text-gray-400 font-normal italic">(optional)</span>
                        </div>
                      }
                      options={WORK_PERMIT_OPTIONS}
                      selected={selectedWorkPermits}
                      onChange={setSelectedWorkPermits}
                      placeholder="Select all that apply..."
                    />
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

                      <div className="grid grid-cols-1 gap-[18px]">
                        {/* Go Live Date */}
                        <div className="flex flex-col w-full space-y-2">
                          <label className="block text-sm font-semibold text-[#1A1A1A]">Go-live date</label>
                          <div className="relative w-full">
                            <Input 
                              type="date"
                              icon={CalendarIcon}
                              value={goLiveDate}
                              onChange={(e) => setGoLiveDate(e.target.value)}
                              label=""
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
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Step 02</span>
                  <h3 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">What will they do?</h3>
                  <p className="text-[13px] text-[#808080] leading-relaxed">Define the core responsibilities and technical requirements.</p>
                </div>

                <div className="space-y-6">
                  {/* Role Goal / Problem to solve */}
                  <Textarea 
                    label="Role goal / problem to solve"
                    placeholder="What is this person being hired to achieve? What problem do they solve, or what outcome does their work drive? e.g. 'To reduce surgical complication rates by improving pre-operative assessment protocols.' or 'To build the organisation's health economics modelling capability from scratch.'"
                    value={roleGoal}
                    onChange={(e) => setRoleGoal(e.target.value)}
                    className="h-24 resize-y leading-relaxed"
                  />

                  {/* Core Responsibilities */}
                  <Textarea 
                    label="Core responsibilities"
                    placeholder="List the main deliverables and day-to-day activities for this role. e.g. for a consultant dermatologist: 'Conduct outpatient skin cancer clinics, perform skin biopsies and excisions, supervise registrar trainees, contribute to MDT meetings.' for a health economist: 'Develop cost-effectiveness models, liaise with health technology assessment bodies, write technical reports for payers.'"
                    value={coreResponsibilities}
                    onChange={(e) => setCoreResponsibilities(e.target.value)}
                    className="h-32 resize-y leading-relaxed"
                  />

                  {/* Technical Skills Required */}
                  <MultiSelect 
                    label={
                      <div className="flex items-center gap-1.5">
                        <span>Technical skills required</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="2">
                          <title>These feed directly into VORA's skills match scoring dimension</title>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                    }
                    groups={TECHNICAL_SKILLS_GROUPS}
                    selected={technicalSkills}
                    onChange={setTechnicalSkills}
                    placeholder="Select option(s)"
                  />

                  {/* Tools / Software */}
                  <MultiSelect 
                    label="Tools / software"
                    groups={TOOLS_SOFTWARE_GROUPS}
                    selected={tools}
                    onChange={setTools}
                    placeholder="Select option(s)"
                  />

                  {/* Language requirements */}
                  <MultiSelect 
                    label="Language requirements"
                    options={LANGUAGE_OPTIONS}
                    selected={languages}
                    onChange={setLanguages}
                    placeholder="Select option(s)"
                  />

                  {/* Pre-assessment submission */}
                  <div className="space-y-2">
                    <MultiSelect 
                      label={
                        <div className="flex items-center gap-1">
                          <span>Pre-assessment submission required from candidates</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                        </div>
                      }
                      groups={PRE_ASSESSMENT_GROUPS}
                      selected={preAssessments}
                      onChange={setPreAssessments}
                      placeholder="Select document type(s) to request"
                    />
                    <div className="p-3 bg-[#EBF6FF] border border-[#BDD9FF] rounded-lg mt-2">
                      <p className="text-xs text-[#1e3a8a] leading-relaxed">
                        <strong>How this works:</strong> After a candidate clears the geopolitical and match threshold filter, but before their assessment begins, VORA prompts them to upload the material(s) you specify here. VORA's assessment engine then generates deep, role-specific questions drawn directly from what they submitted. A candidate who did not produce the work cannot answer convincingly. Any significant gap between the sophistication of the submission and the quality of the answers is flagged in their report. Leave blank if you do not require pre-assessment submissions.
                      </p>
                    </div>
                    <p className="text-[11px] text-[#808080] leading-relaxed pt-1">
                      You may select multiple. Candidates will be shown your selections before they submit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE & BACKGROUND */}
            {currentStep === 3 && (
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Step 03</span>
                  <h3 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Experience & background</h3>
                  <p className="text-[13px] text-[#808080] leading-relaxed">Tell us what this person must have done and who they need to be. These fields feed VORA's qualifications, sector background, and experience matching dimensions. VORA applies these equally to clinical, academic, operational, and technical health roles.</p>
                </div>

                <div className="grid grid-cols-1 gap-[18px]">
                  <Select 
                    label="Years of relevant experience required"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    options={EXPERIENCE_YEARS_OPTIONS}
                    placeholder="Select option"
                  />

                  <MultiSelect 
                    label={
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span>Type of experience required</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">select all that apply</span>
                        </div>
                        <span className="text-xs text-[#808080] font-normal">Helps VORA distinguish between clinical, research, policy, and operational backgrounds.</span>
                      </div>
                    }
                    groups={EXPERIENCE_TYPES_GROUPS}
                    selected={experienceTypes}
                    onChange={setExperienceTypes}
                    placeholder="Select option(s)"
                  />

                  <Select 
                    label="Minimum qualification required"
                    value={minQualification}
                    onChange={(e) => setMinQualification(e.target.value)}
                    options={MIN_QUALIFICATION_OPTIONS}
                    placeholder="Select option"
                  />

                  <Textarea 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Preferred qualifications</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">optional - beyond the minimum</span>
                      </div>
                    }
                    placeholder="e.g. MPH from an accredited institution; membership of LSTM, LSHTM, or equivalent; board certification in relevant specialism..."
                    value={preferredQualifications}
                    onChange={(e) => setPreferredQualifications(e.target.value)}
                    className="h-24 resize-y leading-relaxed"
                  />

                  <MultiSelect 
                    label={
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span>Sector background</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">select all that apply</span>
                        </div>
                        <span className="text-xs text-[#808080] font-normal">Where has this person worked before? VORA uses this to assess institutional fit.</span>
                      </div>
                    }
                    groups={SECTOR_BACKGROUND_GROUPS}
                    selected={sectorBackground}
                    onChange={setSectorBackground}
                    placeholder="Select option(s)"
                  />

                  <MultiSelect 
                    label={
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span>Geographic experience</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">optional</span>
                        </div>
                        <span className="text-xs text-[#808080] font-normal">Regions where prior work experience is valued or required. Leave blank if not a factor.</span>
                      </div>
                    }
                    options={GEOGRAPHIC_EXPERIENCE_OPTIONS}
                    selected={geographicExperience}
                    onChange={setGeographicExperience}
                    placeholder="Select option(s)"
                  />

                  <div className="border-t-[1.5px] border-[#E6E6E6] my-6"></div>
                  <h4 className="text-[13px] font-bold text-[#4A4A4A] mb-[-4px]">Research & publications</h4>

                  <Select 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Publications or research outputs required?</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">optional</span>
                      </div>
                    }
                    value={publicationsRequired}
                    onChange={(e) => setPublicationsRequired(e.target.value)}
                    options={PUBLICATIONS_OPTIONS}
                    placeholder="Select option"
                  />

                  <Select 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Budget management experience required?</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">optional</span>
                      </div>
                    }
                    value={budgetManagement}
                    onChange={(e) => setBudgetManagement(e.target.value)}
                    options={BUDGET_MANAGEMENT_OPTIONS}
                    placeholder="Select option"
                  />

                  <Select 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Team or line management experience required?</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">optional</span>
                      </div>
                    }
                    value={teamManagement}
                    onChange={(e) => setTeamManagement(e.target.value)}
                    options={TEAM_MANAGEMENT_OPTIONS}
                    placeholder="Select option"
                  />

                  <div className="border-t-[1.5px] border-[#E6E6E6] my-6"></div>
                  <h4 className="text-[13px] font-bold text-[#4A4A4A] mb-[-4px]">Eligibility requirements</h4>

                  <Select 
                    label={
                      <div className="flex flex-col gap-1">
                        <span>International candidate policy</span>
                        <span className="text-xs text-[#808080] font-normal">Controls whether VORA runs the geopolitical eligibility filter. If your role is funded by a specific donor, select the matching restriction so VORA can screen for funding-linked nationality rules.</span>
                      </div>
                    }
                    value={eligibilityIntPolicy}
                    onChange={(e) => setEligibilityIntPolicy(e.target.value)}
                    options={INT_POLICY_ELIGIBILITY_OPTIONS}
                    placeholder="Select option"
                  />

                  <Select 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Security clearance required?</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">optional</span>
                      </div>
                    }
                    value={eligibilitySecClearance}
                    onChange={(e) => setEligibilitySecClearance(e.target.value)}
                    options={SECURITY_CLEARANCE_ELIGIBILITY_OPTIONS}
                    placeholder="Select option"
                  />

                  <div className="flex flex-col gap-1">
                    <Textarea 
                      label={
                        <div className="flex items-center gap-1">
                          <span>Preferred candidate profile</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">optional - narrative</span>
                        </div>
                      }
                      placeholder="Add any additional context about the ideal candidate that the structured fields above do not capture. e.g. 'We are looking for someone who has worked at the intersection of aesthetic medicine and patient safety, ideally in a regulated private practice setting.' or 'A background in both laboratory science and clinical application would be strongly preferred.' Keep it factual and role-specific."
                      value={preferredProfile}
                      onChange={(e) => setPreferredProfile(e.target.value)}
                      className="h-24 resize-y leading-relaxed"
                    />
                    <span className="text-xs text-[#808080] font-normal mt-1">This is shared verbatim with VORA's matching engine. Keep it factual and role-specific.</span>
                  </div>

                  <div className="flex items-start gap-2.5 p-3.5 bg-[#EBF6FF] border-[1.5px] border-[#BDD9FF] rounded-lg mt-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-[13px] text-[#1e3a8a] leading-relaxed">
                      VORA weights qualifications, sector background, and contextual experience together. A candidate who is 90% qualified with deep, directly relevant experience in your type of setting will score higher than a candidate with perfect credentials and no contextual fit. For clinical roles, VORA also accounts for registration status and scope of practice alongside formal qualifications.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 4: TEAM COLLABORATION & COMMUNICATION */}
            {currentStep === 4 && (
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <span className="bg-blue-50 text-[#0047CC] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Step 04</span>
                  <h3 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Team collaboration & communication</h3>
                  <p className="text-[13px] text-[#808080] leading-relaxed">Helps VORA match on culture fit and working style. Applies equally to clinical teams, research groups, remote roles, and field environments.</p>
                </div>

                <div className="grid grid-cols-1 gap-[18px]">
                  <MultiSelect 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Preferred working style</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">(select all that apply)</span>
                      </div>
                    }
                    options={PREFERRED_WORKING_STYLE_OPTIONS}
                    selected={preferredWorkingStyle}
                    onChange={setPreferredWorkingStyle}
                    placeholder="Select option(s)"
                  />

                  <Input 
                    label="Communication / check-in rhythm"
                    placeholder="e.g. Weekly team meetings, Daily handovers, Async by default"
                    value={communicationRhythm}
                    onChange={(e) => setCommunicationRhythm(e.target.value)}
                  />

                  <Select 
                    label="Primary working language"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    options={LANGUAGE_OPTIONS}
                    placeholder="Select option"
                  />

                  <MultiSelect 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Personality traits sought</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">(select all that apply)</span>
                      </div>
                    }
                    options={PERSONALITY_TRAITS_OPTIONS}
                    selected={personalityTraits}
                    onChange={setPersonalityTraits}
                    placeholder="Select option(s)"
                  />

                  <MultiSelect 
                    label={
                      <div className="flex items-center gap-1">
                        <span>Work environment / culture</span>
                        <span className="text-[11px] text-[#808080] font-normal italic">(select all that apply)</span>
                      </div>
                    }
                    options={WORK_ENVIRONMENT_OPTIONS}
                    selected={workEnvironment}
                    onChange={setWorkEnvironment}
                    placeholder="Select option(s)"
                  />

                  <div className="flex flex-col gap-1">
                    <Textarea 
                      label={
                        <div className="flex items-center gap-1">
                          <span>Anything else about your team or working environment</span>
                          <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                        </div>
                      }
                      placeholder="e.g. We are a small fertility clinic with a closely-knit team of 8. The role reports directly to the clinic director. We prioritise patient discretion and work with a predominantly international patient base."
                      value={additionalTeamContext}
                      onChange={(e) => setAdditionalTeamContext(e.target.value)}
                      className="h-20 resize-y leading-relaxed"
                    />
                    <span className="text-xs text-[#808080] font-normal mt-1">This text is shared verbatim with VORA's matching engine and influences the culture-fit dimension of candidate scoring.</span>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 5: COMPENSATION & DOCUMENTATION */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* COMPENSATION CARD */}
                <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                  <div>
                    <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Compensation</h2>
                    <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                      Select the compensation structure for this role. Your escrow is VORA's fee, not a salary deposit. It is calculated as a percentage of the compensation figure and locked at submission.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      {
                        id: 'sal',
                        title: 'Salaried',
                        desc: 'Full-time, part-time, postdoc, research post, teaching post',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2"/>
                            <path d="M16 7V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2"/>
                            <line x1="12" y1="12" x2="12" y2="16"/>
                            <line x1="10" y1="14" x2="14" y2="14"/>
                          </svg>
                        )
                      },
                      {
                        id: 'con',
                        title: 'Contract / Daily rate',
                        desc: 'Contract, consultancy, locum / agency shift, secondment, short-term gig, per diem, retainer',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        )
                      },
                      {
                        id: 'sti',
                        title: 'Stipend / Fellowship',
                        desc: 'Fellowship, traineeship, internship (paid), residency',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                          </svg>
                        )
                      },
                      {
                        id: 'unp',
                        title: 'Unpaid / Flat-fee',
                        desc: 'Unpaid internship, volunteer, academic placement, VSO',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                          </svg>
                        )
                      },
                      {
                        id: 'phd',
                        title: 'Funded PhD studentship',
                        desc: 'Fee calculated on year-1 stipend value only (tuition waiver excluded)',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        )
                      },
                      {
                        id: 'uni',
                        title: 'University admissions (flat fee)',
                        desc: 'Self-funded student placement — MSc, MPH, undergraduate, short course. VORA charges a flat placement fee, not a percentage.',
                        icon: (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        )
                      }
                    ].map((t) => {
                      const isSel = compType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCompType(t.id as any)}
                          className={`w-full text-left p-4.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-start ${
                            isSel
                              ? 'border-[#0047CC] bg-[#EBF6FF]'
                              : 'border-[#E6E6E6] bg-white hover:border-[#ADADAD]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                            isSel ? 'bg-white text-[#0047CC] shadow-xs' : 'bg-[#F7F7F7] text-[#4A4A4A]'
                          }`}>
                            {t.icon}
                          </div>
                          <span className={`text-[13px] font-extrabold ${isSel ? 'text-[#0047CC]' : 'text-[#1A1A1A]'}`}>
                            {t.title}
                          </span>
                          <span className="text-[11px] text-[#808080] mt-1 leading-relaxed">
                            {t.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SALARIED PANEL */}
                  {compType === 'sal' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Annual salary range</label>
                        <p className="text-xs text-[#808080] leading-relaxed">
                          VORA calculates your escrow on the midpoint of this range. The midpoint is the figure used for the true-up calculation when a hire is confirmed.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-[125px_1fr_auto_1fr] gap-2.5 items-center mt-2.5">
                          <div>
                            <select
                              value={salCur}
                              onChange={(e) => setSalCur(e.target.value)}
                              className="w-full pl-2.5 pr-6 py-3 border border-[#E6E6E6] focus:border-[#0047CC] rounded-lg text-xs bg-white outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23808080%27%20stroke-width%3D%271.5%27%20fill%3D%27none%27%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat transition-colors font-bold text-[#1A1A1A]"
                            >
                              {renderGlobalCurrencyOptions()}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Minimum"
                              value={salMin}
                              onChange={(e) => setSalMin(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                          <div className="text-xs font-bold text-[#808080] text-center px-1 hidden sm:block">to</div>
                          <div>
                            <input
                              type="number"
                              placeholder="Maximum"
                              value={salMax}
                              onChange={(e) => setSalMax(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                        </div>
                      </div>

                      {showEscrow('sal') && renderEscrowBox('sal')}

                      <div className="flex items-start gap-2.5 p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl mt-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" className="shrink-0 mt-0.5 text-[#D97706]">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p className="text-xs text-[#92400E] leading-relaxed">
                          The escrow is VORA's fee, not a salary deposit. You pay this once per role, regardless of whether the hire completes at the exact midpoint. The true-up at hire confirms the final fee against the actual salary agreed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CONTRACT PANEL */}
                  {compType === 'con' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Daily rate range</label>
                        <p className="text-xs text-[#808080] leading-relaxed">
                          VORA annualises the daily rate at 220 working days to calculate the escrow midpoint. Your fee rate is shown in the escrow breakdown below and depends on your registered country.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-[125px_1fr_auto_1fr] gap-2.5 items-center mt-2.5">
                          <div>
                            <select
                              value={conCur}
                              onChange={(e) => setConCur(e.target.value)}
                              className="w-full pl-2.5 pr-6 py-3 border border-[#E6E6E6] focus:border-[#0047CC] rounded-lg text-xs bg-white outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23808080%27%20stroke-width%3D%271.5%27%20fill%3D%27none%27%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat transition-colors font-bold text-[#1A1A1A]"
                            >
                              {renderGlobalCurrencyOptions()}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Min per day"
                              value={conMin}
                              onChange={(e) => setConMin(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                          <div className="text-xs font-bold text-[#808080] text-center px-1 hidden sm:block">to</div>
                          <div>
                            <input
                              type="number"
                              placeholder="Max per day"
                              value={conMax}
                              onChange={(e) => setConMax(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                        </div>
                      </div>

                      {showEscrow('con') && renderEscrowBox('con')}
                    </div>
                  )}

                  {/* STIPEND PANEL */}
                  {compType === 'sti' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Annual stipend or fellowship value</label>
                        <p className="text-xs text-[#808080] leading-relaxed">
                          Enter the annual stipend value. For paid internships shorter than 12 months, enter the full value of the placement. VORA applies a fee on stipend roles — the rate shown in the escrow breakdown depends on your registered country.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-[125px_1fr] gap-2.5 items-center mt-2.5">
                          <div>
                            <select
                              value={stiCur}
                              onChange={(e) => setStiCur(e.target.value)}
                              className="w-full pl-2.5 pr-6 py-3 border border-[#E6E6E6] focus:border-[#0047CC] rounded-lg text-xs bg-white outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23808080%27%20stroke-width%3D%271.5%27%20fill%3D%27none%27%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat transition-colors font-bold text-[#1A1A1A]"
                            >
                              {renderGlobalCurrencyOptions()}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Annual stipend value"
                              value={stiVal}
                              onChange={(e) => setStiVal(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                        </div>
                      </div>

                      {showEscrow('sti') && renderEscrowBox('sti')}
                    </div>
                  )}

                  {/* UNPAID PANEL */}
                  {compType === 'unp' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-2.5 p-3.5 bg-[#EEFBEE] border border-[#2CA62C] rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#135813" strokeWidth="2" className="shrink-0 mt-0.5 text-[#1D871D]">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <p className="text-xs text-[#135813] leading-relaxed">
                          <strong>Flat listing fee applies.</strong> For unpaid placements, volunteer roles, academic observerships, and similar arrangements, VORA charges a flat listing and matching fee — <strong>USD 50 for LMIC employers</strong> or <strong>USD 500 for other regions</strong>. No escrow is held. Payment is processed on go-live. This covers the full matching and assessment process regardless of outcome.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mt-3.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">
                          Expenses, allowances or benefits provided <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Travel and accommodation covered; daily subsistence allowance; free meals on shift"
                          value={expenses}
                          onChange={(e) => setExpenses(e.target.value)}
                          className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                        />
                      </div>
                    </div>
                  )}

                  {/* PHD PANEL */}
                  {compType === 'phd' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Year-1 stipend value</label>
                        <p className="text-xs text-[#808080] leading-relaxed">
                          VORA fees on funded PhDs are calculated on the year-1 stipend only. Tuition fee waivers and bench fees do not factor into the escrow.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-[125px_1fr] gap-2.5 items-center mt-2.5">
                          <div>
                            <select
                              value={phdCur}
                              onChange={(e) => setPhdCur(e.target.value)}
                              className="w-full pl-2.5 pr-6 py-3 border border-[#E6E6E6] focus:border-[#0047CC] rounded-lg text-xs bg-white outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23808080%27%20stroke-width%3D%271.5%27%20fill%3D%27none%27%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat transition-colors font-bold text-[#1A1A1A]"
                            >
                              {renderPhdCurrencyOptions()}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Year-1 stipend"
                              value={phdVal}
                              onChange={(e) => setPhdVal(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                        </div>
                      </div>

                      {showEscrow('phd') && renderEscrowBox('phd')}
                    </div>
                  )}

                  {/* UNIVERSITY PANEL */}
                  {compType === 'uni' && (
                    <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-2.5 p-3.5 bg-[#EBF6FF] border border-[#BDD9FF] rounded-xl">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0 mt-0.5 text-[#0047CC]">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p className="text-xs text-[#1e3a8a] leading-relaxed">
                          <strong>University admissions (self-funded students):</strong> For programmes where students pay tuition, VORA charges a flat placement fee to the university — not a percentage of tuition. You are replacing the education agent model with a quality-controlled matching system. For <em>funded</em> PhD or research roles, use the PhD or Stipend types above.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-3.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Annual tuition / programme value</label>
                        <p className="text-xs text-[#808080] leading-relaxed">
                          Used to determine your flat placement fee tier. VORA charges a fixed fee per confirmed enrolled student — not a percentage of tuition. The fee is locked at application and released on confirmed enrolment.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-[125px_1fr] gap-2.5 items-center mt-2.5">
                          <div>
                            <select
                              value={uniCur}
                              onChange={(e) => setUniCur(e.target.value)}
                              className="w-full pl-2.5 pr-6 py-3 border border-[#E6E6E6] focus:border-[#0047CC] rounded-lg text-xs bg-white outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2710%27%20height%3D%276%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201L5%205L9%201%27%20stroke%3D%27%23808080%27%20stroke-width%3D%271.5%27%20fill%3D%27none%27%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat transition-colors font-bold text-[#1A1A1A]"
                            >
                              {renderUniCurrencyOptions()}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="Annual tuition value"
                              value={uniTuition}
                              onChange={(e) => setUniTuition(e.target.value)}
                              className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-3.5 relative">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Programme type</label>
                        <div className="relative" ref={uniProgRef}>
                          <button
                            type="button"
                            onClick={() => setIsUniProgOpen(!isUniProgOpen)}
                            className={`w-full px-4 py-3 border rounded-lg text-left text-sm cursor-pointer flex items-center justify-between transition-colors bg-white ${
                              uniProg ? 'border-[#0047CC] text-[#1A1A1A] font-medium' : 'border-[#E6E6E6] text-gray-400'
                            }`}
                          >
                            <span>{uniProg || 'Select programme type'}</span>
                            <svg
                              width="12"
                              height="7"
                              viewBox="0 0 12 7"
                              fill="none"
                              className={`transition-transform duration-150 ${isUniProgOpen ? 'rotate-180' : ''}`}
                            >
                              <path d="M1 1L6 6L11 1" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>

                          {isUniProgOpen && (
                            <div className="absolute top-[105%] left-0 right-0 bg-white border border-[#E6E6E6] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto animate-in fade-in duration-100">
                              <div className="px-4.5 py-2 text-[10px] font-extrabold text-[#ADADAD] uppercase tracking-wider bg-gray-50/50">Taught Programmes</div>
                              {[
                                'MSc / MA / MPhil (1 year)',
                                'MPH / MBA / MPA (1–2 years)',
                                'Undergraduate BSc / BM / BDS (3–6 years)',
                                'Short course / CPD certificate (under 6 months)'
                              ].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => {
                                    setUniProg(p);
                                    setIsUniProgOpen(false);
                                  }}
                                  className="w-full text-left px-4.5 py-2.5 text-xs hover:bg-[#F7F7F7] text-[#1A1A1A] transition-colors"
                                >
                                  {p}
                                </button>
                              ))}
                              <div className="px-4.5 py-2 text-[10px] font-extrabold text-[#ADADAD] uppercase tracking-wider bg-gray-50/50">Research Programmes</div>
                              <button
                                type="button"
                                onClick={() => {
                                  setUniProg('Self-funded PhD (3–4 years)');
                                  setIsUniProgOpen(false);
                                }}
                                className="w-full text-left px-4.5 py-2.5 text-xs hover:bg-[#F7F7F7] text-[#1A1A1A] transition-colors"
                              >
                                Self-funded PhD (3–4 years)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {showEscrow('uni') && renderEscrowBox('uni')}

                      <div className="flex items-start gap-2.5 p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl mt-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" className="shrink-0 mt-0.5 text-[#D97706]">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                        <p className="text-xs text-[#92400E] leading-relaxed">
                          For students from Global South countries, VORA applies a 40% reduction to the placement fee to support equitable access to international education. Global South is defined by the World Bank country income classification at the time of application.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LMIC Badge */}
                  {isLmicActive && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-[#EEFBEE] border border-[#2CA62C] rounded-xl mt-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#135813" strokeWidth="2" className="shrink-0 mt-0.5 text-[#1D871D]">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <div className="text-xs text-[#135813] leading-relaxed">
                        <strong>LMIC fee rates applied.</strong> Your currency qualifies for VORA's lower-income country pricing — 10% for salaried and contract roles, 7% for stipends and PhDs, and USD 50 flat fee for unpaid/volunteer roles. These rates are research-grounded — below the 10–17% charged by local recruitment agencies across Sub-Saharan Africa, South Asia, and Southeast Asia. This rate is locked at submission.
                      </div>
                    </div>
                  )}
                </div>

                {/* POSITIONS CARD (shown for salaried, contract, stipend) */}
                {['sal', 'con', 'sti'].includes(compType) && (
                  <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                    <div>
                      <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Positions available</h2>
                      <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                        How many people are you hiring into this role? Each position is covered by the escrow calculation above.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Number of positions</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={positions}
                          onChange={(e) => setPositions(e.target.value)}
                          className="w-full max-w-[180px] px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all"
                        />
                        <p className="text-xs text-[#808080] mt-1 leading-relaxed">
                          Each additional position multiplies the escrow requirement proportionally.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DURATION CARD (shown for contract and stipend) */}
                {['con', 'sti'].includes(compType) && (
                  <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                    <div>
                      <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Contract / placement duration</h2>
                      <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                        Used to calculate the total contract value and escrow. Choose the expected working duration — this does not need to be a full year. Six-month locum contracts, 3-month fellowships, and single-project consultancies all work the same way.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">Duration — contract or placement</label>
                      <div className="flex flex-wrap gap-2.5 mb-3">
                        {[
                          { id: '22', label: '1 month', days: 22 },
                          { id: '65', label: '3 months', days: 65 },
                          { id: '110', label: '6 months', days: 110 },
                          { id: '165', label: '9 months', days: 165 },
                          { id: '220', label: '1 year (standard)', days: 220 },
                          { id: '330', label: '18 months', days: 330 },
                          { id: '440', label: '2 years', days: 440 },
                          { id: 'custom', label: 'Custom…', days: 0 }
                        ].map((preset) => {
                          const isSel = durationPreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleDurationPresetClick(preset.days, preset.id)}
                              className={`px-3.5 py-2 rounded-full border border-[#E6E6E6] text-xs font-bold transition-all cursor-pointer ${
                                isSel
                                  ? 'border-[#0047CC] bg-[#EBF6FF] text-[#0047CC]'
                                  : 'border-[#E6E6E6] bg-white text-[#4A4A4A] hover:border-[#ADADAD]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      {durationPreset === 'custom' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <input
                            type="number"
                            min="1"
                            max="2000"
                            placeholder="Working days (e.g. 110 = 6 months)"
                            value={conDuration}
                            onChange={(e) => handleCustomDurationChange(e.target.value)}
                            className="w-full max-w-[260px] px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all"
                          />
                          <p className="text-[11px] text-[#808080] leading-relaxed">
                            Working days only — exclude weekends and public holidays. 22 days/month is a reasonable estimate.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PLACES AVAILABLE CARD (shown only for university admissions) */}
                {compType === 'uni' && (
                  <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                    <div>
                      <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Places available</h2>
                      <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                        How many students are you seeking to enrol through VORA for this programme? Each confirmed enrolled student triggers the flat placement fee.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#1A1A1A]">Number of student places</label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={uniStudentCount}
                          onChange={(e) => setUniStudentCount(e.target.value)}
                          className="w-full max-w-[180px] px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all"
                        />
                        <p className="text-xs text-[#808080] mt-1 leading-relaxed">
                          VORA charges one flat placement fee per confirmed enrolled student. If fewer students enrol than this number, only the confirmed placements are charged. You are not committed to filling all places.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENTATION CARD */}
                <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                  <div>
                    <h2 className="text-xl md:text-[22px] font-extrabold text-[#1A1A1A] tracking-tight">Documentation</h2>
                    <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                      Attach any supporting documents for this role. These are only visible to VORA staff during review and are not shared with candidates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Full job description <span className="text-[11px] text-[#808080] font-normal italic">(optional if posted manually)</span>
                      </label>
                      
                      {!jdFile ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-6.5 text-center cursor-pointer transition-all bg-white ${
                            isDragging
                              ? 'border-[#387DFF] bg-[#EBF6FF]'
                              : 'border-[#E6E6E6] hover:border-[#387DFF] hover:bg-[#F7F9FF]'
                          }`}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1.5" className="mx-auto mb-2 text-[#ADADAD]">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <div className="text-[13px] font-bold text-[#4A4A4A] mb-1">Upload job description</div>
                          <div className="text-xs text-[#808080]">PDF, DOC, DOCX up to 10MB</div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 bg-[#EEFBEE] border border-[#85E585] rounded-lg p-3 animate-in fade-in duration-200">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#135813" strokeWidth="2" className="shrink-0">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span className="text-[13px] font-bold text-[#135813] flex-1 truncate">{jdFile.name}</span>
                          <span className="text-xs text-[#1D871D]">{formatFileSize(jdFile.size)}</span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-[#1D871D] hover:text-[#135813] font-bold text-lg leading-none cursor-pointer px-1.5 py-0.5"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 mt-3.5">
                      <label className="text-[13px] font-bold text-[#1A1A1A]">
                        Internal notes for VORA <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Anything you want VORA's team to know that is not captured in the form. This is never shared with candidates."
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="w-full px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all placeholder:text-[#ADADAD] resize-y min-h-[80px]"
                      />
                    </div>
                  </div>
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
                          {technicalSkills.length > 0 ? (
                            technicalSkills.map((skill, idx) => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Compensation type</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">
                          {compType === 'sal' && 'Salaried'}
                          {compType === 'con' && 'Contract / Daily rate'}
                          {compType === 'sti' && 'Stipend / Fellowship'}
                          {compType === 'unp' && 'Unpaid / Flat-fee'}
                          {compType === 'phd' && 'Funded PhD studentship'}
                          {compType === 'uni' && 'University admissions (flat fee)'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Compensation details</p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">
                          {compType === 'sal' && (salMin || salMax ? `${fmt((parseFloat(salMin) || 0) && (parseFloat(salMax) || 0) ? ((parseFloat(salMin) || 0) + (parseFloat(salMax) || 0)) / 2 : (parseFloat(salMin) || parseFloat(salMax) || 0), salCur)} midpoint (${salMin ? fmt(parseFloat(salMin), salCur) : '--'} to ${salMax ? fmt(parseFloat(salMax), salCur) : '--'})` : '--')}
                          {compType === 'con' && (conMin || conMax ? `${fmt((parseFloat(conMin) || 0) && (parseFloat(conMax) || 0) ? ((parseFloat(conMin) || 0) + (parseFloat(conMax) || 0)) / 2 : (parseFloat(conMin) || parseFloat(conMax) || 0), conCur)}/day midpoint (${conMin ? fmt(parseFloat(conMin), conCur) : '--'} to ${conMax ? fmt(parseFloat(conMax), conCur) : '--'}) for ${conDuration} working days` : '--')}
                          {compType === 'sti' && (stiVal ? `${fmt(parseFloat(stiVal), stiCur)} (${stiDuration} months)` : '--')}
                          {compType === 'unp' && (expenses ? `Unpaid (${expenses})` : 'Unpaid')}
                          {compType === 'phd' && (phdVal ? `${fmt(parseFloat(phdVal), phdCur)}` : '--')}
                          {compType === 'uni' && (uniTuition || uniProg ? `${uniProg || 'Programme'} — ${uniTuition ? fmt(parseFloat(uniTuition), uniCur) : '--'}/year tuition` : '--')}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          {compType === 'uni' ? 'Places / students' : 'Positions available'}
                        </p>
                        <p className="text-[13px] font-medium text-gray-900 mt-1">
                          {compType === 'uni' ? `${uniStudentCount} student place${parseInt(uniStudentCount) > 1 ? 's' : ''}` : ''}
                          {compType === 'phd' ? '1 position' : ''}
                          {['sal', 'con', 'sti', 'unp'].includes(compType) ? `${positions} position${parseInt(positions) > 1 ? 's' : ''}` : ''}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escrow / platform fee</p>
                        <p className="text-[13px] font-bold text-[#0047CC] mt-1">
                          {(() => {
                            const cur = getActiveCurrency();
                            const lmic = isLmicActive;
                            if (compType === 'sal') {
                              const mn = parseFloat(salMin) || 0;
                              const mx = parseFloat(salMax) || 0;
                              const mid = mn && mx ? (mn + mx) / 2 : (mn || mx);
                              const pos = parseInt(positions) || 1;
                              const total = applyLMICFloorCap(mid * pos * getFeeRate('sal', lmic), pos, lmic);
                              return mid ? `${fmt(total, cur)} (escrow)` : '--';
                            }
                            if (compType === 'con') {
                              const mn = parseFloat(conMin) || 0;
                              const mx = parseFloat(conMax) || 0;
                              const mid = mn && mx ? (mn + mx) / 2 : (mn || mx);
                              const pos = parseInt(positions) || 1;
                              const total = applyLMICFloorCap(mid * conDuration * pos * getFeeRate('con', lmic), pos, lmic);
                              return mid ? `${fmt(total, cur)} (escrow)` : '--';
                            }
                            if (compType === 'sti') {
                              const v = parseFloat(stiVal) || 0;
                              const pos = parseInt(positions) || 1;
                              const total = v * pos * getFeeRate('sti', lmic);
                              return v ? `${fmt(total, cur)} (escrow)` : '--';
                            }
                            if (compType === 'unp') {
                              const fee = getFlatFee();
                              return `USD ${fee} (flat listing fee)`;
                            }
                            if (compType === 'phd') {
                              const v = parseFloat(phdVal) || 0;
                              const total = v * getFeeRate('phd', lmic);
                              return v ? `${fmt(total, cur)} (escrow)` : '--';
                            }
                            if (compType === 'uni') {
                              const tuition = parseFloat(uniTuition) || 0;
                              const students = parseInt(uniStudentCount) || 1;
                              const total = getUniFee(tuition, uniProg, lmic) * students;
                              return tuition && uniProg ? `USD ${total} (placement fee)` : '--';
                            }
                            return '--';
                          })()}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Supporting document</p>
                        {jdFile ? (
                          <div className="flex items-center gap-2 mt-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D871D" strokeWidth="2" className="text-[#1D871D]">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span className="text-[13px] font-medium text-gray-800">{jdFile.name} ({formatFileSize(jdFile.size)})</span>
                          </div>
                        ) : (
                          <p className="text-[13px] font-medium text-gray-500 mt-1 italic">No document attached</p>
                        )}
                      </div>

                      {internalNotes && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Internal notes for VORA</p>
                          <p className="text-[13px] font-medium text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{internalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="h-16 bg-white border-t border-[#E6E6E6] px-8 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
            {currentStep > 1 ? (
              <Button 
                variant="outline"
                fullWidth={false}
                onClick={prevStep}
                className="px-6 min-h-[38px] border-[#E6E6E6] text-[#4A4A4A] font-bold text-xs rounded-full flex items-center gap-1 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <ChevronLeftIcon size={14} strokeWidth={3} /> Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={handleClose}
                className="px-6 min-h-[38px] border-[#E6E6E6] text-[#4A4A4A] font-bold text-xs rounded-full hover:bg-gray-50 transition-all cursor-pointer"
              >
                Save as draft
              </Button>
              <Button 
                onClick={currentStep === 6 ? handleClose : nextStep}
                fullWidth={false}
                className="px-7 min-h-[38px] bg-[#0047CC] hover:bg-[#003d99] text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-none"
              >
                {currentStep === 6 ? 'Continue to payment' : 'Proceed'}
                {currentStep !== 6 && <ChevronRightIcon size={14} strokeWidth={3} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobWizard;
