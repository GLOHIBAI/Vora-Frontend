import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import StepValidationAlert from '../common/StepValidationAlert';
import {
  validatePostJobStep,
  validateJobDocumentFile,
  firstValidationMessage,
  isValidAmountRange,
  type FieldErrors,
} from '../../utils/postJobValidation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CloseIcon
} from '../common/Icons';
import Select from '../common/Select';
import Button from '../common/Button';
import Input from '../common/Input';
import TimeCommitmentInput from '../common/TimeCommitmentInput';
import LocationAutocomplete from '../common/LocationAutocomplete';
import {
  blockNegativeNumberKeys,
  formatTimeCommitmentDisplay,
  sanitizePositiveDecimalInput,
  sanitizePositiveIntInput,
} from '../../utils/numericInput';
import Textarea from '../common/Textarea';
import Tag from '../common/Tag';
import MultiSelect from '../common/MultiSelect';
import WizardStepNav from '../common/WizardStepNav';
import TimezoneMultiSelect from '../common/TimezoneMultiSelect';
import CurrencyAmountRange from '../common/CurrencyAmountRange';
import EscrowCalculationCard from '../common/EscrowCalculationCard';
import AlertBanner from '../common/AlertBanner';
import PageTopBackBar from '../common/PageTopBackBar';
import {
  SectionDescription,
  SectionTitle,
  SubsectionTitle,
  WizardStepTitle,
} from '../common/Typography';
import CompensationTypeSelector, {
  type CompensationTypeId,
} from './CompensationTypeSelector';
import {
  PHD_CURRENCY_OPTIONS,
  UNI_CURRENCY_OPTIONS,
  UNI_PROGRAMME_GROUPS,
} from '../../constants/currencies';

import type { PostJobWizardProps } from '../../types';
import {
  STEPS,
  WIZARD_STEP_COUNT,
  clampWizardStep,
  parseRolePostingCurrentStep,
  getWizardStepTitle,
  ROLE_TYPE_GROUPS,
  EMPLOYMENT_LEVEL_OPTIONS,
  WORK_FORMAT_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  INT_POLICY_OPTIONS,
  SECURITY_CLEARANCE_OPTIONS,
  WORK_PERMIT_OPTIONS,
  TZ_REGION_API_LABELS,
  getTimezoneValuesForRegionKey,
  TZ_GROUPS,
  COMMUNICATION_RHYTHM_OPTIONS,
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
import { buildVaultConfirmationData, saveVaultConfirmation } from '../../utils/vaultConfirmation';
import {
  buildJobPostedConfirmationData,
  saveJobPostedConfirmation,
} from '../../utils/jobPostedConfirmation';
import {
  clearRolePostingDraft,
  saveRolePostingDraft,
  updateRolePostingDraftStep,
} from '../../utils/rolePostingDraft';
import {
  useUpdateRolePostingStepFiveMutation,
  useUpdateRolePostingStepFourMutation,
  useUpdateRolePostingStepOneMutation,
  useUpdateRolePostingStepThreeMutation,
  useUpdateRolePostingStepTwoMutation,
  useGetRolePostingQuery,
  useGetRolePostingPrefillQuery,
} from '../../services/queries/rolePostings';
import { buildUpdateRolePostingStepOneBody } from '../../utils/rolePostingStepOne';
import { buildUpdateRolePostingStepTwoBody } from '../../utils/rolePostingStepTwo';
import { buildUpdateRolePostingStepThreeBody } from '../../utils/rolePostingStepThree';
import { buildUpdateRolePostingStepFourBody } from '../../utils/rolePostingStepFour';
import { buildUpdateRolePostingStepFiveBody } from '../../utils/rolePostingStepFive';
import { resolveWizardStepAfterSave } from '../../utils/rolePostingWizardStep';
import type { RolePostingHiringMode } from '../../types/rolePosting';
import type { ApiError } from '../../services/api';
import PostJobPreviewStep, { type EscrowPreviewSummary } from './postJob/PostJobPreviewStep';
import PostJobCheckoutDrawer from './postJob/PostJobCheckoutDrawer';

const PostJobWizard: React.FC<PostJobWizardProps> = ({ isOpen, onClose, initialConfig }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = user?.role?.toLowerCase() === 'employer';
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isClosing, setIsClosing] = useState(false);
  const [isMobStepNavOpen, setIsMobStepNavOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Form State
  const [roleType, setRoleType] = useState('');
  const [customRoleText, setCustomRoleText] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [level, setLevel] = useState('');
  const [positions, setPositions] = useState('1');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [workFormat, setWorkFormat] = useState('');
  const [location, setLocation] = useState('');
  const [additionalLocations, setAdditionalLocations] = useState<string[]>([]);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [selectedTimezoneRegions, setSelectedTimezoneRegions] = useState<string[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');

  // Eligibility state
  const [internationalPolicy, setInternationalPolicy] = useState('');
  const [securityClearance, setSecurityClearance] = useState('');
  const [selectedWorkPermits, setSelectedWorkPermits] = useState<string[]>([]);

  // Scheduled Hiring state
  const [rolePostingId, setRolePostingId] = useState<string | null>(null);
  const [hiringMode, setHiringMode] = useState<RolePostingHiringMode>('LIVE_NOW');
  const [isProceeding, setIsProceeding] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const updateStepOneMutation = useUpdateRolePostingStepOneMutation();
  const updateStepTwoMutation = useUpdateRolePostingStepTwoMutation();
  const updateStepThreeMutation = useUpdateRolePostingStepThreeMutation();
  const updateStepFourMutation = useUpdateRolePostingStepFourMutation();
  const updateStepFiveMutation = useUpdateRolePostingStepFiveMutation();
  const [isScheduled, setIsScheduled] = useState(false);
  const [goLiveDate, setGoLiveDate] = useState('');
  const [editsCount, setEditsCount] = useState(0);

  // Prefill Banner State
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);
  const [isPollingFinished, setIsPollingFinished] = useState(false);
  const [parseStatus, setParseStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('PENDING');

  const { data: prefillRes } = useGetRolePostingPrefillQuery(rolePostingId || '', {
    enabled: isOpen && !!rolePostingId && !!initialConfig?.isPrefilled && !isPollingFinished,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (prefillRes?.data) {
      const p = prefillRes.data as any;
      const status = p.parseStatus || p.jdParseStatus;
      if (status) {
        setParseStatus(status);
      }

      const isStillProcessing = status === 'PENDING' || status === 'PROCESSING';

      if (!isStillProcessing) {
        if (status === 'FAILED') {
          // Keep the polling screen up, but it will show the FAILED state because of `parseStatus`
          toast.error('Failed to extract job details.');
          setShowPrefillBanner(false);
        } else {
          setIsPollingFinished(true);
          setShowPrefillBanner(true);
        }
      }
    }
  }, [prefillRes]);

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
  const [communicationRhythm, setCommunicationRhythm] = useState<string[]>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [workEnvironment, setWorkEnvironment] = useState<string[]>([]);
  const [additionalTeamContext, setAdditionalTeamContext] = useState('');

  // Step 5: Compensation & Documentation
  const [compType, setCompType] = useState<CompensationTypeId>('sal');

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

  // Unpaid expenses/allowances
  const [expenses, setExpenses] = useState('');

  // Documentation / Support documents
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Internal notes
  const [internalNotes, setInternalNotes] = useState('');

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
    if (type === 'sal') return isValidAmountRange(salMin, salMax);
    if (type === 'con') return isValidAmountRange(conMin, conMax);
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
      const mid = mn && mx ? (mn + mx) / 2 : mn || mx;
      const rate = getFeeRate('sal', lmic);
      const total = applyLMICFloorCap(mid * pos * rate, pos, lmic);

      return (
        <EscrowCalculationCard
          title="Escrow calculation (VORA fee)"
          rows={[
            { label: 'Salary midpoint', value: fmt(mid, cur) },
            {
              label: 'Available positions',
              value: `${pos} position${pos > 1 ? 's' : ''}`,
            },
            {
              label: 'Fee rate (locked at submission)',
              value: getFeeLabel('sal', lmic),
            },
          ]}
          totalLabel="Total escrow to lock"
          totalValue={fmt(total, cur)}
          footnote="This amount will be charged to your payment method and held in escrow. On a confirmed hire, the true-up fires: if the actual agreed salary differs from the midpoint, VORA charges or refunds the difference. If no hire occurs, escrow minus the non-refundable search fee is returned to your wallet. The search fee is 5% for LMIC employers and 10% otherwise."
        />
      );
    }

    if (type === 'con') {
      const mn = parseFloat(conMin) || 0;
      const mx = parseFloat(conMax) || 0;
      const mid = mn && mx ? (mn + mx) / 2 : mn || mx;
      const ann = mid * conDuration;
      const rate = getFeeRate('con', lmic);
      const total = applyLMICFloorCap(ann * pos * rate, pos, lmic);

      return (
        <EscrowCalculationCard
          title="Escrow calculation (contract)"
          rows={[
            { label: 'Daily rate midpoint', value: `${fmt(mid, cur)}/day` },
            {
              label: 'Contract duration',
              value: `${conDuration} working days`,
            },
            {
              label: 'Total contract value (midpoint)',
              value: fmt(ann, cur),
            },
            {
              label: 'Available positions',
              value: `${pos} position${pos > 1 ? 's' : ''}`,
            },
            { label: 'Fee rate', value: getFeeLabel('con', lmic) },
          ]}
          totalLabel="Total escrow to lock"
          totalValue={fmt(total, cur)}
          footnote="Escrow is based on daily rate × working days × positions × your applicable fee rate (10% LMIC / 15% other regions). True-up fires at hire. Escrow minus search fee returned to wallet if no hire occurs."
        />
      );
    }

    if (type === 'sti') {
      const v = parseFloat(stiVal) || 0;
      const rate = getFeeRate('sti', lmic);
      const total = v * pos * rate;

      return (
        <EscrowCalculationCard
          title="Escrow calculation (stipend)"
          rows={[
            {
              label: 'Stipend value',
              value: `${fmt(v, cur)} (${stiDuration} months)`,
            },
            {
              label: 'Available positions',
              value: `${pos} position${pos > 1 ? 's' : ''}`,
            },
            {
              label: 'Fee rate (stipend tier)',
              value: getFeeLabel('sti', lmic),
            },
          ]}
          totalLabel="Total escrow to lock"
          totalValue={fmt(total, cur)}
          footnote="The fee (5% LMIC / 10% other regions) applies to the full stipend value. Additional benefits or top-ups do not factor into the escrow calculation."
        />
      );
    }

    if (type === 'phd') {
      const v = parseFloat(phdVal) || 0;
      const rate = getFeeRate('phd', lmic);
      const total = v * rate;

      return (
        <EscrowCalculationCard
          title="Escrow calculation (PhD)"
          rows={[
            { label: 'Year-1 stipend', value: fmt(v, cur) },
            { label: 'Fee rate (PhD tier)', value: getFeeLabel('phd', lmic) },
          ]}
          totalLabel="Total escrow to lock"
          totalValue={fmt(total, cur)}
          footnote="One position only for PhD roles. True-up fires at acceptance against the confirmed stipend. Tuition fees and bench fees are excluded from the calculation."
        />
      );
    }

    if (type === 'uni') {
      const tuition = parseFloat(uniTuition) || 0;
      const fee = getUniFee(tuition, uniProg, lmic);
      const students = parseInt(uniStudentCount) || 1;
      const total = fee * students;

      return (
        <EscrowCalculationCard
          title="Placement fee calculation"
          rows={[
            { label: 'Programme type', value: uniProg },
            {
              label: 'Annual tuition',
              value: `${fmt(tuition, cur)} per year`,
            },
            {
              label: 'Fee tier',
              value: `${fmt(fee, 'USD')} per enrolled student`,
            },
            {
              label: 'Positions / students',
              value: `${students} student${students > 1 ? 's' : ''}`,
            },
          ]}
          totalLabel="Total placement fee to lock"
          totalValue={fmt(total, 'USD')}
          footnote="This flat fee is locked at application submission and released on confirmed student enrolment. If the student does not enrol, a non-refundable search fee is retained (5% for LMIC employers, 10% otherwise) and the remainder returned to your wallet. No annual renewal required â€” single fee per enrolled student."
        />
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
    const sanitized = sanitizePositiveIntInput(val, 2000);
    if (!sanitized) {
      setConDuration(0);
      setStiDuration(0);
      return;
    }
    const days = parseInt(sanitized, 10);
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
      const fileErr = validateJobDocumentFile(file);
      if (fileErr) {
        setFieldErrors((prev) => ({ ...prev, jdFile: fileErr }));
        toast.error(fileErr);
        return;
      }
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.jdFile;
        return next;
      });
      setJdFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileErr = validateJobDocumentFile(file);
      if (fileErr) {
        setFieldErrors((prev) => ({ ...prev, jdFile: fileErr }));
        toast.error(fileErr);
        return;
      }
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.jdFile;
        return next;
      });
      setJdFile(file);
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
      setRolePostingId(initialConfig.rolePostingId);
      setHiringMode(initialConfig.hiringMode);
      setIsScheduled(initialConfig.isScheduled);
      setGoLiveDate(initialConfig.goLiveDate || '');
      setShowPrefillBanner(initialConfig.isPrefilled);
      setCurrentStep(parseRolePostingCurrentStep(initialConfig.currentStep) ?? 1);

      if (!initialConfig.isPrefilled) {
        setRoleTitle('');
        setRoleType('');
        setShowCustomRoleInput(false);
        setCustomRoleText('');
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
    if (prefillRes?.data) {
      const p = prefillRes.data as any;

      // Helpers to map parsed strings to valid options or leave empty if no match is found
      const mapPrefillRoleType = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();

        // Direct matches or key terms mapping
        if (normalized.includes('full-time') || normalized.includes('fulltime') || normalized === 'full time') {
          return 'Full-time employment';
        }
        if (normalized.includes('part-time') || normalized.includes('parttime') || normalized === 'part time') {
          return 'Part-time employment';
        }

        const allRoleTypes = ROLE_TYPE_GROUPS.flatMap(g => g.options.map(o => o.value));
        const matched = allRoleTypes.find(opt => opt.toLowerCase() === normalized);
        if (matched) return matched;

        const partialMatched = allRoleTypes.find(opt => normalized.includes(opt.toLowerCase()) || opt.toLowerCase().includes(normalized));
        if (partialMatched) return partialMatched;

        return '';
      };

      const mapPrefillEmploymentLevel = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();
        if (normalized.includes('senior')) return 'Senior level';
        if (normalized.includes('mid') || normalized === 'middle') return 'Mid level';
        if (normalized.includes('entry')) return 'Entry level';
        if (normalized.includes('student') || normalized.includes('graduate')) return 'Student / Graduate';
        if (normalized.includes('executive') || normalized.includes('director') || normalized.includes('lead')) return 'Executive / Director';

        const matched = EMPLOYMENT_LEVEL_OPTIONS.find(o => o.value.toLowerCase() === normalized);
        return matched ? matched.value : '';
      };

      const mapPrefillTimeCommitment = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();
        if (normalized.includes('full-time') || normalized.includes('fulltime') || normalized === 'full time') {
          return 'Full-time';
        }
        if (normalized.includes('part-time') || normalized.includes('parttime') || normalized === 'part time') {
          return 'Part-time';
        }
        const matched = TIME_COMMITMENT_OPTIONS.find(o => o.value.toLowerCase() === normalized || o.value.toLowerCase().includes(normalized));
        return matched ? matched.value : '';
      };

      const mapPrefillWorkFormat = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();
        if (normalized === 'hybrid' || normalized.includes('hybrid')) return 'Hybrid';
        if (normalized === 'onsite' || normalized.includes('onsite') || normalized.includes('on-site') || normalized.includes('fully onsite')) return 'Fully onsite';
        if (normalized.includes('remote')) {
          if (normalized.includes('timezone')) return 'Remote - specific timezone(s) required';
          return 'Remote - no timezone restriction';
        }
        if (normalized.includes('flexible')) return 'Flexible / candidate preference';

        const matched = WORK_FORMAT_OPTIONS.find(o => o.value.toLowerCase() === normalized);
        return matched ? matched.value : '';
      };

      const mapPrefillExperienceYears = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();

        // Match range: e.g., "5 to 8"
        const rangeMatch = normalized.match(/(\d+)\s*(to|-)\s*(\d+)/);
        if (rangeMatch) {
          const min = parseInt(rangeMatch[1]);
          const max = parseInt(rangeMatch[3]);
          if (min >= 12 || max >= 12) return '12+ years (senior / director level)';
          if (min >= 8) return '8 to 12 years';
          if (min >= 5) return '5 to 8 years';
          if (min >= 3) return '3 to 5 years';
          if (min >= 1) return '1 to 3 years';
        }

        // Match single number: e.g., "5 years"
        const singleMatch = normalized.match(/(\d+)/);
        if (singleMatch) {
          const years = parseInt(singleMatch[1]);
          if (years >= 12) return '12+ years (senior / director level)';
          if (years >= 8) return '8 to 12 years';
          if (years >= 5) return '5 to 8 years';
          if (years >= 3) return '3 to 5 years';
          if (years >= 1) return '1 to 3 years';
        }

        if (normalized.includes('no experience') || normalized.includes('student') || normalized.includes('graduate')) {
          return 'No experience required (student / graduate)';
        }
        if (normalized.includes('up to 1') || normalized.includes('under 1') || normalized.includes('less than 1')) {
          return 'Up to 1 year';
        }

        const matched = EXPERIENCE_YEARS_OPTIONS.find(o => o.value.toLowerCase() === normalized);
        return matched ? matched.value : '';
      };

      const mapPrefillMinimumQualification = (val: string): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();
        if (normalized.includes('phd') || normalized.includes('doctorate') || normalized.includes('doctoral')) {
          return 'Doctoral degree (PhD or equivalent)';
        }
        if (normalized.includes('master') || normalized.includes('msc') || normalized.includes('mph') || normalized.includes('mba') || normalized.includes('postgraduate')) {
          return 'Postgraduate degree (Masters or equivalent)';
        }
        if (normalized.includes('bachelor') || normalized.includes('bsc') || normalized.includes('undergraduate') || normalized.includes('degree')) {
          return 'Undergraduate degree (any field)';
        }
        if (normalized.includes('no formal') || normalized.includes('none required')) {
          return 'No formal qualification required';
        }
        if (normalized.includes('certificate') || normalized.includes('vocational') || normalized.includes('diploma')) {
          return 'Professional certificate or vocational qualification';
        }

        const matched = MIN_QUALIFICATION_OPTIONS.find(o => o.value.toLowerCase() === normalized || o.value.toLowerCase().includes(normalized));
        return matched ? matched.value : '';
      };

      const mapPrefillSingleSelect = (val: string, validOptions: string[]): string => {
        if (!val) return '';
        const normalized = val.trim().toLowerCase();
        const matched = validOptions.find(
          opt => opt.toLowerCase() === normalized ||
            opt.toLowerCase().includes(normalized) ||
            normalized.includes(opt.toLowerCase())
        );
        return matched || '';
      };

      const mapPrefillMultiSelect = (vals: string[], validOptions: string[]): string[] => {
        if (!Array.isArray(vals)) return [];
        const matched = vals
          .map(v => {
            const normalized = v.trim().toLowerCase();
            const found = validOptions.find(
              opt => opt.toLowerCase() === normalized ||
                opt.toLowerCase().includes(normalized) ||
                normalized.includes(opt.toLowerCase())
            );
            return found || v;
          })
          .filter(Boolean);
        return [...new Set(matched)];
      };

      const normalizeNewlines = (text: string): string => {
        if (!text) return '';
        return text
          .split(/\n\s*\n/)
          .map(paragraph => paragraph.replace(/\s*\n\s*/g, ' '))
          .join('\n\n');
      };

      // Extract from nested prefill object or fall back to top-level properties
      const step1 = p.prefill?.step1 || p;
      const step2 = p.prefill?.step2 || p;
      const step3 = p.prefill?.step3 || p;
      const step4 = p.prefill?.step4 || p;
      const step5 = p.prefill?.step5 || p;

      // Step 1
      if (step1.roleTitle) setRoleTitle(step1.roleTitle);
      if (step1.roleType) {
        const mappedRoleType = mapPrefillRoleType(step1.roleType);
        if (mappedRoleType) {
          setRoleType(mappedRoleType);
          setShowCustomRoleInput(false);
          setCustomRoleText('');
        } else {
          // If no standard option match is found, show custom role type input box
          setRoleType(step1.roleType);
          setShowCustomRoleInput(true);
          setCustomRoleText(step1.roleType);
        }
      }
      if (step1.employmentLevel) setLevel(mapPrefillEmploymentLevel(step1.employmentLevel));
      if (step1.positionsAvailable) setPositions(step1.positionsAvailable.toString());
      if (step1.timeCommitment) setTimeCommitment(mapPrefillTimeCommitment(step1.timeCommitment));
      if (step1.workFormat) setWorkFormat(mapPrefillWorkFormat(step1.workFormat));
      if (step1.workLocationPrimary) setLocation(step1.workLocationPrimary);
      if (step1.additionalHiringLocations) setAdditionalLocations(step1.additionalHiringLocations);
      if (step1.timezoneRegions) setSelectedTimezoneRegions(step1.timezoneRegions);
      if (step1.timezoneRequirements) setSelectedTimezones(step1.timezoneRequirements);
      if (step1.startDate) setStartDate(step1.startDate);
      if (step1.closingDate) setEndDate(step1.closingDate);
      else if (step1.endDate) setEndDate(step1.endDate);
      if (step1.roleSummary) setSummary(normalizeNewlines(step1.roleSummary));
      if (step1.internationalTalentPolicy) setInternationalPolicy(step1.internationalTalentPolicy);
      if (step1.securityClearanceRequirement) setSecurityClearance(step1.securityClearanceRequirement);
      if (step1.workPermitTypesAccepted) setSelectedWorkPermits(step1.workPermitTypesAccepted);

      // Step 2
      if (step2.roleGoal) setRoleGoal(normalizeNewlines(step2.roleGoal));
      if (step2.coreResponsibilities) setCoreResponsibilities(step2.coreResponsibilities);
      if (step2.technicalSkills) {
        const validSkills = TECHNICAL_SKILLS_GROUPS.flatMap(g => g.options.map(o => o.value));
        setTechnicalSkills(mapPrefillMultiSelect(step2.technicalSkills, validSkills));
      }
      if (step2.toolsRequired) {
        const validTools = TOOLS_SOFTWARE_GROUPS.flatMap(g => g.options.map(o => o.value));
        setTools(mapPrefillMultiSelect(step2.toolsRequired, validTools));
      }
      if (step2.languageRequirements) {
        const validLanguages = LANGUAGE_OPTIONS.map(o => o.value);
        setLanguages(mapPrefillMultiSelect(step2.languageRequirements, validLanguages));
      }

      // Step 3
      if (step3.yearsExperienceRequired) setExperienceYears(mapPrefillExperienceYears(step3.yearsExperienceRequired));
      if (step3.typeOfExperience) {
        const validExpTypes = EXPERIENCE_TYPES_GROUPS.flatMap(g => g.options.map(o => o.value));
        setExperienceTypes(mapPrefillMultiSelect(step3.typeOfExperience, validExpTypes));
      }
      if (step3.minimumQualification) setMinQualification(mapPrefillMinimumQualification(step3.minimumQualification));
      if (step3.preferredQualifications) setPreferredQualifications(step3.preferredQualifications);
      if (step3.sectorBackground) {
        const validSectors = SECTOR_BACKGROUND_GROUPS.flatMap(g => g.options.map(o => o.value));
        setSectorBackground(mapPrefillMultiSelect(step3.sectorBackground, validSectors));
      }
      if (step3.geographicExperience) {
        const validGeos = GEOGRAPHIC_EXPERIENCE_OPTIONS.map(o => o.value);
        setGeographicExperience(mapPrefillMultiSelect(step3.geographicExperience, validGeos));
      }
      if (step3.publicationsRequired) {
        const validPubs = PUBLICATIONS_OPTIONS.map(o => o.value);
        setPublicationsRequired(mapPrefillSingleSelect(step3.publicationsRequired, validPubs));
      }
      if (step3.budgetManagementRequired) {
        const validBudgets = BUDGET_MANAGEMENT_OPTIONS.map(o => o.value);
        setBudgetManagement(mapPrefillSingleSelect(step3.budgetManagementRequired, validBudgets));
      }
      if (step3.teamManagementRequired) {
        const validTeams = TEAM_MANAGEMENT_OPTIONS.map(o => o.value);
        setTeamManagement(mapPrefillSingleSelect(step3.teamManagementRequired, validTeams));
      }

      // Step 4
      if (step4.preferredWorkingStyle) {
        const validStyles = PREFERRED_WORKING_STYLE_OPTIONS.map(o => o.value);
        setPreferredWorkingStyle(mapPrefillMultiSelect(step4.preferredWorkingStyle, validStyles));
      }
      if (step4.communicationRhythm) {
        const validRhythms = COMMUNICATION_RHYTHM_OPTIONS.map(o => o.value);
        setCommunicationRhythm(mapPrefillMultiSelect(step4.communicationRhythm, validRhythms));
      }
      if (step4.primaryWorkingLanguage) setPrimaryLanguage(step4.primaryWorkingLanguage);
      if (step4.personalityTraits) {
        const validTraits = PERSONALITY_TRAITS_OPTIONS.map(o => o.value);
        setPersonalityTraits(mapPrefillMultiSelect(step4.personalityTraits, validTraits));
      }
      if (step4.workEnvironmentDescriptors) {
        const validEnvs = WORK_ENVIRONMENT_OPTIONS.map(o => o.value);
        setWorkEnvironment(mapPrefillMultiSelect(step4.workEnvironmentDescriptors, validEnvs));
      }
      if (step4.teamCultureFreeText) setAdditionalTeamContext(normalizeNewlines(step4.teamCultureFreeText));

      // Step 5
      if (step5.compensationType) {
        const typeMap: Record<string, 'sal' | 'con' | 'sti' | 'unp' | 'phd' | 'uni'> = {
          "SALARIED": 'sal',
          "CONTRACT_DAILY_RATE": 'con',
          "STIPEND_FELLOWSHIP": 'sti',
          "UNPAID_FLAT_FEE": 'unp',
          "FUNDED_PHD": 'phd',
          "UNIVERSITY_ADMISSIONS": 'uni',
          "GIG_PROJECT": 'unp'
        };
        const mappedType = typeMap[step5.compensationType];
        if (mappedType) setCompType(mappedType);
      }
      if (step5.compensationCurrency) {
        setSalCur(step5.compensationCurrency);
        setConCur(step5.compensationCurrency);
        setStiCur(step5.compensationCurrency);
        setPhdCur(step5.compensationCurrency);
        setUniCur(step5.compensationCurrency);
      }
      if (step5.salaryMin !== undefined && step5.salaryMin !== null) setSalMin(step5.salaryMin.toString());
      if (step5.salaryMax !== undefined && step5.salaryMax !== null) setSalMax(step5.salaryMax.toString());
      if (step5.dailyRateMin !== undefined && step5.dailyRateMin !== null) setConMin(step5.dailyRateMin.toString());
      if (step5.dailyRateMax !== undefined && step5.dailyRateMax !== null) setConMax(step5.dailyRateMax.toString());
      if (step5.dailyRate !== undefined && step5.dailyRate !== null) setConMin(step5.dailyRate.toString());
      if (step5.contractDurationMonths !== undefined && step5.contractDurationMonths !== null) setConDuration(step5.contractDurationMonths * 22);
      if (step5.stipendValue) setStiVal(step5.stipendValue);
      if (step5.yearOneStipend !== undefined && step5.yearOneStipend !== null) setPhdVal(step5.yearOneStipend.toString());
      if (step5.annualTuitionValue !== undefined && step5.annualTuitionValue !== null) setUniTuition(step5.annualTuitionValue.toString());
      if (step5.expensesAllowancesBenefits) setExpenses(step5.expensesAllowancesBenefits);
      if (step5.internalNotes) setInternalNotes(step5.internalNotes);

      // Keep the prefill banner visible to inform the employer
      setShowPrefillBanner(true);
    }
  }, [prefillRes]);

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
      setRolePostingId(null);
    }, 400);
  };

  const fieldErrorProps = (key: string) => ({
    error: !!fieldErrors[key],
    helperText: fieldErrors[key] || '',
  });

  const getWizardValues = () => ({
    step1: {
      roleType,
      roleTitle,
      level,
      positions,
      timeCommitment,
      workFormat,
      location,
      selectedTimezoneRegions,
      selectedTimezones,
      startDate,
      endDate,
      summary,
      internationalPolicy,
      isScheduled,
      goLiveDate,
    },
    step2: {
      roleGoal,
      coreResponsibilities,
      technicalSkills,
      tools,
      languages,
      preAssessments,
    },
    step3: {
      experienceYears,
      experienceTypes,
      minQualification,
      sectorBackground,
      eligibilityIntPolicy,
    },
    step4: {
      preferredWorkingStyle,
      communicationRhythm,
      primaryLanguage,
      personalityTraits,
      workEnvironment,
    },
    step5: {
      compType,
      salCur,
      conCur,
      stiCur,
      phdCur,
      uniCur,
      salMin,
      salMax,
      conMin,
      conMax,
      stiVal,
      phdVal,
      uniTuition,
      uniProg,
      positions,
      uniStudentCount,
      conDuration,
      stiDuration,
      durationPreset,
      expenses,
      internalNotes,
      jdFile,
    },
  });

  const runStepValidation = (step: number): boolean => {
    const errors = validatePostJobStep(step, getWizardValues());
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const msg = firstValidationMessage(errors);
      if (msg) toast.error(msg);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const ensureRolePostingDraft = (): boolean => {
    if (!rolePostingId) {
      toast.error('Job draft not found. Please close and start again from Post a Job.');
      return false;
    }
    return true;
  };

  const persistDraftStep = async (advanceStep: boolean): Promise<number> => {
    const id = rolePostingId!;

    if (currentStep === 1) {
      const body = buildUpdateRolePostingStepOneBody(
        {
          roleType,
          roleTitle,
          level,
          positions,
          timeCommitment,
          workFormat,
          location,
          additionalLocations,
          selectedTimezoneRegions,
          selectedTimezones,
          startDate,
          endDate,
          summary,
          internationalPolicy,
          securityClearance,
          selectedWorkPermits,
          isScheduled,
          goLiveDate,
          hiringMode,
        },
        { advanceStep }
      );
      const response = await updateStepOneMutation.mutateAsync({ id, body });
      return resolveWizardStepAfterSave(
        response.data?.currentStep,
        currentStep,
        advanceStep
      );
    }

    if (currentStep === 2) {
      const body = buildUpdateRolePostingStepTwoBody(
        {
          roleGoal,
          coreResponsibilities,
          technicalSkills,
          tools,
          languages,
          preAssessments,
        },
        { advanceStep }
      );
      const response = await updateStepTwoMutation.mutateAsync({ id, body });
      return resolveWizardStepAfterSave(
        response.data?.currentStep,
        currentStep,
        advanceStep
      );
    }

    if (currentStep === 3) {
      const body = buildUpdateRolePostingStepThreeBody(
        {
          experienceYears,
          experienceTypes,
          minQualification,
          preferredQualifications,
          sectorBackground,
          geographicExperience,
          publicationsRequired,
          budgetManagement,
          teamManagement,
          eligibilityIntPolicy,
          eligibilitySecClearance,
          preferredProfile,
        },
        { advanceStep }
      );
      const response = await updateStepThreeMutation.mutateAsync({ id, body });
      return resolveWizardStepAfterSave(
        response.data?.currentStep,
        currentStep,
        advanceStep
      );
    }

    if (currentStep === 4) {
      const body = buildUpdateRolePostingStepFourBody(
        {
          preferredWorkingStyle,
          communicationRhythm,
          primaryLanguage,
          personalityTraits,
          workEnvironment,
          additionalTeamContext,
        },
        { advanceStep }
      );
      const response = await updateStepFourMutation.mutateAsync({ id, body });
      return resolveWizardStepAfterSave(
        response.data?.currentStep,
        currentStep,
        advanceStep
      );
    }

    if (currentStep === 5) {
      const body = buildUpdateRolePostingStepFiveBody(
        {
          compType,
          salCur,
          conCur,
          stiCur,
          phdCur,
          uniCur,
          salMin,
          salMax,
          conMin,
          conMax,
          stiVal,
          phdVal,
          uniTuition,
          uniProg,
          positions,
          uniStudentCount,
          conDuration,
          stiDuration,
          durationPreset,
          expenses,
          internalNotes,
        },
        { advanceStep }
      );
      const response = await updateStepFiveMutation.mutateAsync({
        id,
        body,
        jobDescriptionFile: jdFile,
      });
      return resolveWizardStepAfterSave(
        response.data?.currentStep,
        currentStep,
        advanceStep
      );
    }

    return advanceStep ? currentStep + 1 : currentStep;
  };

  const syncDraftSessionStep = (step: number) => {
    if (initialConfig) {
      saveRolePostingDraft({ ...initialConfig, currentStep: step });
    } else {
      updateRolePostingDraftStep(step);
    }
  };

  const handleSaveDraft = async () => {
    if (!ensureRolePostingDraft()) return;

    setIsSavingDraft(true);
    try {
      if (currentStep >= 1 && currentStep <= 5) {
        const stepFromApi = await persistDraftStep(false);
        const step = clampWizardStep(stepFromApi);
        setCurrentStep(step);
        syncDraftSessionStep(step);
      } else {
        syncDraftSessionStep(currentStep);
      }
      toast.success('Draft saved');
      handleClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.message) toast.error(apiErr.message);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleNextStep = async () => {
    if (!ensureRolePostingDraft()) return;
    if (!runStepValidation(currentStep)) return;

    setIsProceeding(true);
    try {
      if (currentStep >= 1 && currentStep <= 5) {
        const nextFromApi = await persistDraftStep(true);
        const nextStep = clampWizardStep(nextFromApi);
        setCurrentStep(nextStep);
        syncDraftSessionStep(nextStep);
        return;
      }

      const nextStep = clampWizardStep(currentStep + 1);
      setCurrentStep(nextStep);
      syncDraftSessionStep(nextStep);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.message) toast.error(apiErr.message);
    } finally {
      setIsProceeding(false);
    }
  };

  const buildEscrowPreview = (): EscrowPreviewSummary => {
    const cur = getActiveCurrency();
    const lmic = isLmicActive;
    const pos = parseInt(positions, 10) || 1;
    const rateLabel = getFeeLabel(compType, lmic);

    const compTypeLabel =
      compType === 'sal'
        ? 'Salaried'
        : compType === 'con'
          ? 'Contract / Daily rate'
          : compType === 'sti'
            ? 'Stipend / Fellowship'
            : compType === 'unp'
              ? 'Unpaid / Flat-fee'
              : compType === 'phd'
                ? 'Funded PhD studentship'
                : 'University admissions (flat fee)';

    let midpoint = 0;
    let total = 0;
    let perPosition = 0;
    let salaryRangeLabel: string | undefined;
    let payPeriodLabel: string | undefined;

    if (compType === 'sal') {
      const mn = parseFloat(salMin) || 0;
      const mx = parseFloat(salMax) || 0;
      midpoint = mn && mx ? (mn + mx) / 2 : mn || mx;
      perPosition = Math.round(midpoint * getFeeRate('sal', lmic));
      total = applyLMICFloorCap(perPosition * pos, pos, lmic);
      salaryRangeLabel =
        mn || mx
          ? `${fmt(mn, cur)} to ${fmt(mx, cur)}`
          : undefined;
      payPeriodLabel = 'Annual';
    } else if (compType === 'con') {
      const mn = parseFloat(conMin) || 0;
      const mx = parseFloat(conMax) || 0;
      const daily = mn && mx ? (mn + mx) / 2 : mn || mx;
      midpoint = daily * conDuration;
      perPosition = Math.round(midpoint * getFeeRate('con', lmic));
      total = applyLMICFloorCap(perPosition * pos, pos, lmic);
      salaryRangeLabel = daily ? `${fmt(daily, cur)}/day` : undefined;
    } else if (compType === 'sti') {
      midpoint = parseFloat(stiVal) || 0;
      perPosition = Math.round(midpoint * getFeeRate('sti', lmic));
      total = perPosition * pos;
    } else if (compType === 'phd') {
      midpoint = parseFloat(phdVal) || 0;
      perPosition = Math.round(midpoint * getFeeRate('phd', lmic));
      total = perPosition;
    } else if (compType === 'uni') {
      const tuition = parseFloat(uniTuition) || 0;
      perPosition = getUniFee(tuition, uniProg, lmic);
      total = perPosition * (parseInt(uniStudentCount, 10) || 1);
      midpoint = tuition;
    } else if (compType === 'unp') {
      total = getFlatFee();
      perPosition = total;
      midpoint = 0;
    }

    return {
      total,
      currency: compType === 'unp' ? 'USD' : cur,
      midpoint,
      positions: compType === 'uni' ? parseInt(uniStudentCount, 10) || 1 : pos,
      rateLabel,
      perPosition,
      compTypeLabel,
      salaryRangeLabel,
      payPeriodLabel,
    };
  };

  const jumpToStep = (step: number) => {
    setFieldErrors({});
    setCurrentStep(clampWizardStep(step));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalStep = () => {
    if (!ensureRolePostingDraft()) return;
    if (!runStepValidation(6)) return;
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async () => {
    if (!ensureRolePostingDraft()) return;

    setIsProceeding(true);
    try {
      const escrow = buildEscrowPreview();
      const vaultMode = isScheduled;
      const vaultGoLiveDate = vaultMode ? (goLiveDate || initialConfig?.goLiveDate) : undefined;

      // Submit role
      const res = await apiClient.post({
        url: `/role-postings/${rolePostingId}/submit`,
        body: { vaultMode, vaultGoLiveDate }
      });

      if (vaultMode) {
        saveVaultConfirmation(
          buildVaultConfirmationData({
            roleTitle: roleTitle || undefined,
            goLiveDate: vaultGoLiveDate,
            positions: String(escrow.positions),
            salaryMidpoint: escrow.midpoint,
            currency: escrow.currency,
            feeRateLabel: escrow.rateLabel,
            feePerPosition: escrow.perPosition,
            totalEscrow: escrow.total,
            isLmic: isLmicActive,
          })
        );

        clearRolePostingDraft();
        setIsCheckoutOpen(false);
        setIsClosing(true);
        setTimeout(() => {
          onClose();
          setIsClosing(false);
          setRolePostingId(null);
          navigate('/jobs/vault/confirmation');
        }, 400);
        return;
      }

      const responseData = (res as any)?.data || {};
      const returnedSlug = responseData.roleLink;
      const returnedShareUrl = responseData.shareUrl;

      saveJobPostedConfirmation(
        buildJobPostedConfirmationData({
          jobId: rolePostingId,
          roleTitle,
          workFormat,
          location,
          positions,
          summary,
          roleGoal,
          coreResponsibilities,
          slug: returnedSlug,
          shareUrl: returnedShareUrl,
        }),
      );

      clearRolePostingDraft();
      setIsCheckoutOpen(false);
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
        setRolePostingId(null);
        navigate('/jobs/posted/confirmation');
      }, 400);
    } finally {
      setIsProceeding(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    document.body.style.overflow = 'hidden';
  }, [isCheckoutOpen]);

  if (!isOpen && !isClosing) return null;
  if (!isEmployer) return null;

  const prevStep = () => {
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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

  // Timezone shortcuts helper â€” region tag selects all timezones in that zone
  const handleAddTZRegion = (regionKey: string) => {
    const label = TZ_REGION_API_LABELS[regionKey];
    if (!label) return;

    const regionTimezones = getTimezoneValuesForRegionKey(regionKey);

    setSelectedTimezoneRegions((prev) =>
      prev.includes(label) ? prev : [...prev, label]
    );
    setSelectedTimezones((prev) => [
      ...new Set([...prev, ...regionTimezones]),
    ]);
  };

  const handleRemoveTimezoneRegion = (region: string) => {
    const regionKey = Object.entries(TZ_REGION_API_LABELS).find(
      ([, apiLabel]) => apiLabel === region
    )?.[0];

    setSelectedTimezoneRegions((prev) => prev.filter((r) => r !== region));

    if (regionKey) {
      const toRemove = new Set(getTimezoneValuesForRegionKey(regionKey));
      setSelectedTimezones((prev) => prev.filter((tz) => !toRemove.has(tz)));
    }
  };

  const handleClearTimezones = () => {
    setSelectedTimezoneRegions([]);
    setSelectedTimezones([]);
  };

  const handleRemoveTimezone = (tz: string) => {
    setSelectedTimezones(selectedTimezones.filter(t => t !== tz));
  };

  const handleAddTimezone = (tz: string) => {
    if (!selectedTimezones.includes(tz)) {
      setSelectedTimezones([...selectedTimezones, tz]);
    }
  };

  // Work format helpers
  const showLocSection = workFormat === 'Fully onsite' || workFormat === 'Hybrid';
  // Match HTML mockup: timezone section visible by default; hidden only for fully onsite
  const showTzSection = workFormat !== 'Fully onsite';

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
    <div
      className={`fixed inset-y-0 right-0 left-0 lg:left-[var(--sidebar-width)] z-40 flex flex-col bg-[#F7F7F7] transition-all duration-500 ease-in-out ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <PageTopBackBar label="Post a job" onClick={handleClose} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Step Navigation Sidebar (Desktop) */}
        <div className="w-[256px] bg-white border-r border-[#E6E6E6] py-6 hidden lg:flex flex-col overflow-y-auto shrink-0">
          <WizardStepNav
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(stepId) => {
              if (stepId < currentStep) jumpToStep(stepId);
            }}
          />
        </div>

        {/* Form Body Area, scrollable content + fixed footer */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-[#F7F7F7]">
          <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {/* Mobile Step Nav Dropdown */}
            <button
              onClick={() => setIsMobStepNavOpen(!isMobStepNavOpen)}
              className="mt-4 flex lg:hidden items-center justify-between px-6 py-3.5 bg-white border-b border-[#E6E6E6] text-[13px] font-medium text-[#4A4A4A] w-full cursor-pointer"
            >
              <span>
                Step {currentStep} of {WIZARD_STEP_COUNT}: {getWizardStepTitle(currentStep)}
                {currentStep < WIZARD_STEP_COUNT ? ', tap a completed step to edit' : ''}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${isMobStepNavOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isMobStepNavOpen && (
              <div className="lg:hidden bg-white border-b border-[#E6E6E6] py-3 space-y-1 animate-in slide-in-from-top duration-250">
                <WizardStepNav
                  steps={STEPS}
                  currentStep={currentStep}
                  size="sm"
                  onStepClick={(stepId) => {
                    if (stepId < currentStep) jumpToStep(stepId);
                    setIsMobStepNavOpen(false);
                  }}
                />
              </div>
            )}

            <div className="px-5 py-6 md:px-10 md:py-8 space-y-5">
              {initialConfig?.isPrefilled && !isPollingFinished ? (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-300 bg-white border border-[#E6E6E6] rounded-xl shadow-sm">
                  {parseStatus === 'FAILED' ? (
                    <>
                      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
                        <CloseIcon size={28} strokeWidth={2.5} className="text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Extraction failed</h3>
                      <p className="text-[13px] text-gray-500 mt-2 max-w-md mx-auto mb-6">
                        We encountered an issue while analyzing your document. You can continue to manually fill in the role details.
                      </p>
                      <Button
                        onClick={() => setIsPollingFinished(true)}
                        className="bg-[#0047CC] hover:bg-[#003d99] text-white font-bold text-xs px-6 min-h-[38px] rounded-full flex items-center justify-center transition-all cursor-pointer shadow-none"
                        fullWidth={false}
                      >
                        Continue manually
                      </Button>
                    </>
                  ) : (
                    <>
                      <svg className="animate-spin h-10 w-10 text-[#0047CC] mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <h3 className="text-xl font-bold text-gray-900">Extracting job details...</h3>
                      <p className="text-[13px] text-gray-500 mt-2 max-w-md mx-auto">
                        VORA is analyzing your uploaded document to instantly pre-fill your role requirements. This usually takes just a few seconds.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Prefill Notification Banner */}
                  {showPrefillBanner && (
                    <AlertBanner
                      variant="blue"
                      className="animate-in fade-in duration-300"
                      onDismiss={() => setShowPrefillBanner(false)}
                    >
                      We have pre-filled your job post using your uploaded document. Review each section and make
                      any changes before publishing.
                    </AlertBanner>
                  )}

                  {/* STEP 1: ROLE DETAILS */}
                  {currentStep === 1 && (
                    <div className="bg-white border border-[#E6E6E6] rounded-xl px-5 py-7 md:px-8 md:py-7 space-y-6 animate-in fade-in duration-300">
                      <StepValidationAlert errors={fieldErrors} />
                      <div>
                        <WizardStepTitle>Role details</WizardStepTitle>
                        <SectionDescription className="mt-1">
                          Core information about this role. VORA uses these fields to determine geopolitical eligibility, match candidates to your timezone, and score candidates on role fit.
                        </SectionDescription>
                      </div>

                      <div className="grid grid-cols-1 gap-[18px]">
                        {/* Role Type */}
                        <Select
                          label="Role type"
                          value={showCustomRoleInput ? 'other' : roleType}
                          placeholder="Select option"
                          groups={ROLE_TYPE_GROUPS}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'other') {
                              const standardOptions = ROLE_TYPE_GROUPS.flatMap(g => g.options.map(o => o.value)).filter(v => v !== 'other');
                              const isStandard = standardOptions.includes(roleType);
                              const initialText = isStandard ? '' : roleType;
                              setCustomRoleText(initialText);
                              setShowCustomRoleInput(true);
                            } else {
                              setRoleType(val);
                              setShowCustomRoleInput(false);
                            }
                          }}
                          {...fieldErrorProps('roleType')}
                        />

                        {/* Specify Custom Role Type */}
                        {showCustomRoleInput && (
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <Input
                                label="Specify custom role type"
                                placeholder="e.g. Specialized Nurse Coordinator"
                                value={customRoleText}
                                onChange={(e) => setCustomRoleText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (customRoleText.trim()) {
                                      setRoleType(customRoleText.trim());
                                      setShowCustomRoleInput(false);
                                    }
                                  }
                                }}
                                className="h-[50px] sm:h-[54px] py-0"
                                {...fieldErrorProps('roleType')}
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => {
                                if (customRoleText.trim()) {
                                  setRoleType(customRoleText.trim());
                                  setShowCustomRoleInput(false);
                                }
                              }}
                              disabled={!customRoleText.trim()}
                              size="md"
                              pill={false}
                              variant="primary"
                              fullWidth={false}
                              className="h-[50px] sm:h-[54px] min-h-0 py-0"
                            >
                              Add
                            </Button>
                          </div>
                        )}

                        {/* Role Title */}
                        <Input
                          label="Role title"
                          placeholder="e.g. Global Health Research Intern"
                          value={roleTitle}
                          onChange={(e) => setRoleTitle(e.target.value)}
                          {...fieldErrorProps('roleTitle')}
                        />

                        {/* Employment Level */}
                        <Select
                          label="Employment level"
                          value={level}
                          placeholder="Select option"
                          options={EMPLOYMENT_LEVEL_OPTIONS}
                          onChange={(e) => setLevel(e.target.value)}
                          {...fieldErrorProps('level')}
                        />

                        {/* Available Positions */}
                        <Input
                          label="Available positions"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 1, 2, 3 etc"
                          value={positions}
                          onKeyDown={blockNegativeNumberKeys}
                          onChange={(e) =>
                            setPositions(sanitizePositiveIntInput(e.target.value, 999))
                          }
                          {...fieldErrorProps('positions')}
                        />

                        {/* Time Commitment */}
                        <TimeCommitmentInput
                          label="Time commitment"
                          value={timeCommitment}
                          onChange={setTimeCommitment}
                          {...fieldErrorProps('timeCommitment')}
                        />

                        {/* Work Format */}
                        <Select
                          label="Work format"
                          value={workFormat}
                          placeholder="Select option"
                          options={WORK_FORMAT_OPTIONS}
                          onChange={(e) => setWorkFormat(e.target.value)}
                          {...fieldErrorProps('workFormat')}
                        />

                        {/* Work Location (primary) */}
                        <LocationAutocomplete
                          label={
                            <>
                              Work location{' '}
                              <span className="text-[11px] text-[#808080] font-normal">
                                (primary)
                              </span>
                            </>
                          }
                          placeholder="e.g. Lagos State, Nigeria, or 'Multiple locations'"
                          searchMode="state"
                          value={location}
                          onChange={setLocation}
                          {...fieldErrorProps('location')}
                        />

                        {/* Multi-location Field (Unfurls when onsite or hybrid) */}
                        {showLocSection && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[13px] font-medium text-[#1A1A1A] block">
                              Additional hiring locations{' '}
                              <span className="text-[11px] text-[#808080] font-normal italic">
                                if hiring across multiple offices or cities
                              </span>
                            </label>
                            <p className="text-xs text-[#808080] leading-relaxed mb-2">
                              Add each location separately. VORA will match candidates eligible to work in each location and route applications accordingly.
                            </p>

                            {additionalLocations.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {additionalLocations.map((loc) => (
                                  <Tag
                                    key={loc}
                                    label={loc}
                                    variant="blue"
                                    onRemove={() => handleRemoveLocation(loc)}
                                    className="text-xs border border-[#BDD9FF]"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 items-center">
                              <input autoComplete="off"
                                type="text"
                                placeholder="e.g. Nairobi, Kenya"
                                value={newLocationInput}
                                onChange={(e) => setNewLocationInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddLocation();
                                  }
                                }}
                                className="flex-1 min-w-0 px-3.5 py-2.5 border border-[#E6E6E6] rounded-lg text-sm text-[#1A1A1A] bg-white outline-none transition-all placeholder:text-[#ADADAD] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddLocation()}
                                className="shrink-0 px-4 py-2.5 rounded-lg bg-[#0047CC] text-white text-[13px] font-bold cursor-pointer hover:bg-[#003d99] transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Timezone requirement(s) â€” remote, hybrid, or flexible work format */}
                        {showTzSection && (
                          <TimezoneMultiSelect
                            selected={selectedTimezones}
                            selectedRegions={selectedTimezoneRegions}
                            groups={TZ_GROUPS}
                            onAdd={handleAddTimezone}
                            onRemove={handleRemoveTimezone}
                            onRemoveRegion={handleRemoveTimezoneRegion}
                            onClear={handleClearTimezones}
                            onAddRegion={handleAddTZRegion}
                            error={!!fieldErrors.selectedTimezones}
                            errorMessage={fieldErrors.selectedTimezones}
                          />
                        )}

                        {/* Start Date */}
                        <Input
                          label="Start date"
                          type="date"
                          icon={CalendarIcon}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          {...fieldErrorProps('startDate')}
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
                          {...fieldErrorProps('endDate')}
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
                            error={!!fieldErrors.summary}
                            helperText={fieldErrors.summary}
                          />
                        </div>
                      </div>

                      {/* ELIGIBILITY & GEOPOLITICAL SECTION */}
                      <div className="pt-4 border-t border-[#E6E6E6] space-y-6">
                        <div className="flex items-center gap-2">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2.3" className="shrink-0 text-[#0047CC]">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <SubsectionTitle>Eligibility and geopolitical settings</SubsectionTitle>
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
                              {...fieldErrorProps('internationalPolicy')}
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
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                              </svg>
                              <SubsectionTitle as="span">Scheduled Hiring</SubsectionTitle>
                            </div>
                            <p className="text-[11px] text-[#808080] font-semibold leading-relaxed">
                              Not hiring right now? Submit the role today and set the exact date it should go live.
                            </p>
                          </div>

                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input autoComplete="off"
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
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <p className="text-xs md:text-[13px] leading-relaxed text-[#1e3a8a]">
                                <strong>How Scheduled Hiring works:</strong> Your role enters Vault state immediately on submission. It is completely invisible â€” no candidate sees it, no candidate knows it exists. VORA locks your platform fee in escrow at today's rate. During the vault period, every candidate who joins VORA and completes onboarding is silently matched against your specification in the background. Those who score 80% or above are pre-qualified internally â€” they are never told about the role. On go-live day, the role publishes publicly, pre-qualified candidates are notified instantly, and any other qualified candidates in the pool are matched in real time.
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
                                    {...fieldErrorProps('goLiveDate')}
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
                                        className={`flex-1 h-full rounded-full transition-all duration-300 cursor-pointer ${seg < editsRemaining ? 'bg-[#0047CC]' : 'bg-[#E6E6E6]'
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
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-semibold text-[#182348]">Vault lifecycle</h4>
                                  <p className="text-[11px] text-[#808080] font-semibold mt-0.5">What happens between submission and go-live</p>
                                </div>
                              </div>

                              <div className="space-y-4 pt-1">
                                {[
                                  { num: 1, title: 'Submission today:', text: 'Role enters Vault state. Invisible to all candidates. Fee locked in escrow at today\'s rate. You receive a submission confirmation and vault reference number.' },
                                  { num: 2, title: 'Vault period â€” silent matching:', text: 'No candidate sees this role or knows it exists. Every new candidate who joins VORA and completes their profile is silently matched against your specification. Those who score 80% or above are flagged internally as pre-qualified â€” they are not contacted, not told about the role. You can see the live count of pre-qualified candidates in your Vault dashboard at any time.' },
                                  { num: 3, title: '72 hours before go-live:', text: 'VORA sends you a reminder. You can cancel with a full refund to your wallet up until 24 hours before go-live.' },
                                  { num: 4, title: 'Go-live:', text: 'Role publishes publicly. Pre-qualified candidates are notified instantly â€” because matching already ran during the vault period, there is no processing delay. Any other qualified candidates in the pool are matched and notified in real time.' },
                                  { num: 5, title: 'If you cancel before go-live:', text: 'Full fee refund to your VORA wallet. No questions asked if cancelled more than 24 hours before go-live.' }
                                ].map((step) => (
                                  <div key={step.num} className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#0047CC] text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
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
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
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
                      <StepValidationAlert errors={fieldErrors} />
                      <div className="space-y-1.5">
                        <SectionTitle as="h3">What will they do?</SectionTitle>
                        <p className="text-[13px] text-[#808080] leading-relaxed">Define the core responsibilities and technical requirements.</p>
                      </div>

                      <div className="space-y-6">
                        {/* Role Goal / Problem to solve */}
                        <Textarea
                          label="Role goal / problem to solve"
                          placeholder="What is this person being hired to achieve? What problem do they solve, or what outcome does their work drive? e.g. 'To reduce surgical complication rates by improving pre-operative assessment protocols.' or 'To build the organisation's health economics modelling capability from scratch.'"
                          value={roleGoal}
                          onChange={(e) => setRoleGoal(e.target.value)}
                          className="h-24 leading-relaxed"
                          error={!!fieldErrors.roleGoal}
                          helperText={fieldErrors.roleGoal}
                        />

                        {/* Core Responsibilities */}
                        <Textarea
                          label="Core responsibilities"
                          placeholder="List the main deliverables and day-to-day activities for this role. e.g. for a consultant dermatologist: 'Conduct outpatient skin cancer clinics, perform skin biopsies and excisions, supervise registrar trainees, contribute to MDT meetings.' for a health economist: 'Develop cost-effectiveness models, liaise with health technology assessment bodies, write technical reports for payers.'"
                          value={coreResponsibilities}
                          onChange={(e) => setCoreResponsibilities(e.target.value)}
                          className="h-32 leading-relaxed"
                          error={!!fieldErrors.coreResponsibilities}
                          helperText={fieldErrors.coreResponsibilities}
                        />

                        {/* Technical Skills Required */}
                        <MultiSelect
                          label={
                            <div className="flex items-center gap-1.5">
                              <span>Technical skills required</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="2">
                                <title>These feed directly into VORA's skills match scoring dimension</title>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                            </div>
                          }
                          groups={TECHNICAL_SKILLS_GROUPS}
                          selected={technicalSkills}
                          onChange={setTechnicalSkills}
                          placeholder="Select option(s)"
                          {...fieldErrorProps('technicalSkills')}
                        />

                        {/* Tools / Software */}
                        <MultiSelect
                          label="Tools / software"
                          groups={TOOLS_SOFTWARE_GROUPS}
                          selected={tools}
                          onChange={setTools}
                          placeholder="Select option(s)"
                          {...fieldErrorProps('tools')}
                        />

                        {/* Language requirements */}
                        <MultiSelect
                          label="Language requirements"
                          options={LANGUAGE_OPTIONS}
                          selected={languages}
                          onChange={setLanguages}
                          placeholder="Select option(s)"
                          {...fieldErrorProps('languages')}
                        />

                        {/* Pre-assessment submission */}
                        <div className="space-y-2">
                          <MultiSelect
                            label={
                              <div className="flex items-center gap-1">
                                <span>Pre-assessment submission required from candidates</span>
                              </div>
                            }
                            groups={PRE_ASSESSMENT_GROUPS}
                            selected={preAssessments}
                            onChange={setPreAssessments}
                            placeholder="Select document type(s) to request"
                            {...fieldErrorProps('preAssessments')}
                          />
                          <div className="p-3 bg-white border border-[#BDD9FF] rounded-lg mt-2">
                            <p className="text-xs text-[#1e3a8a] leading-relaxed">
                              <strong>How this works:</strong> After a candidate clears the geopolitical and match threshold filter, but before their assessment begins, VORA prompts them to upload the material(s) you specify here. VORA's assessment engine then generates deep, role-specific questions drawn directly from what they submitted. A candidate who did not produce the work cannot answer convincingly. Any significant gap between the sophistication of the submission and the quality of the answers is flagged in their report. At least one pre-assessment submission type must be requested.
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
                      <StepValidationAlert errors={fieldErrors} />
                      <div className="space-y-1.5">
                        <SectionTitle as="h3">Experience & background</SectionTitle>
                        <p className="text-[13px] text-[#808080] leading-relaxed">Tell us what this person must have done and who they need to be. These fields feed VORA's qualifications, sector background, and experience matching dimensions. VORA applies these equally to clinical, academic, operational, and technical health roles.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-[18px]">
                        <Select
                          label="Years of relevant experience required"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          options={EXPERIENCE_YEARS_OPTIONS}
                          placeholder="Select option"
                          {...fieldErrorProps('experienceYears')}
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
                          {...fieldErrorProps('experienceTypes')}
                        />

                        <Select
                          label="Minimum qualification required"
                          value={minQualification}
                          onChange={(e) => setMinQualification(e.target.value)}
                          options={MIN_QUALIFICATION_OPTIONS}
                          placeholder="Select option"
                          {...fieldErrorProps('minQualification')}
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
                          className="h-24 leading-relaxed"
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
                          {...fieldErrorProps('sectorBackground')}
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
                        <h4 className="text-[13px] font-medium text-[#4A4A4A] mb-[-4px]">Research & publications</h4>

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
                        <h4 className="text-[13px] font-medium text-[#4A4A4A] mb-[-4px]">Eligibility requirements</h4>

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
                          {...fieldErrorProps('eligibilityIntPolicy')}
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
                            className="h-24 leading-relaxed"
                          />
                          <span className="text-xs text-[#808080] font-normal mt-1">This is shared verbatim with VORA's matching engine. Keep it factual and role-specific.</span>
                        </div>

                        <div className="flex items-start gap-2.5 p-3.5 bg-white border-[1.5px] border-[#BDD9FF] rounded-lg mt-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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
                      <StepValidationAlert errors={fieldErrors} />
                      <div className="space-y-1.5">
                        <SectionTitle as="h3">Team collaboration & communication</SectionTitle>
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
                          {...fieldErrorProps('preferredWorkingStyle')}
                        />

                        <MultiSelect
                          label={
                            <div className="flex items-center gap-1">
                              <span>Communication / check-in rhythm</span>
                              <span className="text-[11px] text-[#808080] font-normal italic">
                                (select all that apply)
                              </span>
                            </div>
                          }
                          options={COMMUNICATION_RHYTHM_OPTIONS}
                          selected={communicationRhythm}
                          onChange={setCommunicationRhythm}
                          placeholder="Select option(s)"
                          {...fieldErrorProps('communicationRhythm')}
                        />

                        <Select
                          label="Primary working language"
                          value={primaryLanguage}
                          onChange={(e) => setPrimaryLanguage(e.target.value)}
                          options={LANGUAGE_OPTIONS}
                          placeholder="Select option"
                          {...fieldErrorProps('primaryLanguage')}
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
                          {...fieldErrorProps('personalityTraits')}
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
                          {...fieldErrorProps('workEnvironment')}
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
                      <StepValidationAlert errors={fieldErrors} />
                      {/* COMPENSATION CARD */}
                      <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                        <div>
                          <SectionTitle>Compensation</SectionTitle>
                          <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                            Select the compensation structure for this role. Your escrow is VORA's fee, not a salary deposit. It is calculated as a percentage of the compensation figure and locked at submission.
                          </p>
                        </div>

                        <CompensationTypeSelector value={compType} onChange={setCompType} />

                        {/* SALARIED PANEL */}
                        {compType === 'sal' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <CurrencyAmountRange
                              label="Annual salary range"
                              hint="Set the lowest and highest salary you would realistically offer they must be different. VORA locks escrow on the midpoint of this band. At hire, if the agreed salary differs from that midpoint, VORA true-ups the fee (charge or refund the difference)."
                              currency={salCur}
                              onCurrencyChange={setSalCur}
                              minValue={salMin}
                              maxValue={salMax}
                              onMinChange={(v) => setSalMin(sanitizePositiveDecimalInput(v))}
                              onMaxChange={(v) => setSalMax(sanitizePositiveDecimalInput(v))}
                              minError={fieldErrors.salMin}
                              maxError={fieldErrors.salMax}
                            />

                            {showEscrow('sal') && renderEscrowBox('sal')}

                            <AlertBanner variant="blue" className="mt-3 !text-[13px]" showIcon={false}>
                              The escrow is VORA&apos;s fee, not a salary deposit. You pay this once per role, regardless of whether the hire completes at the exact midpoint. The true-up at hire confirms the final fee against the actual salary agreed.
                            </AlertBanner>
                          </div>
                        )}

                        {/* CONTRACT PANEL */}
                        {compType === 'con' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <CurrencyAmountRange
                              label="Daily rate range"
                              hint="Set the lowest and highest daily rate you would pay they must be different. VORA annualises at 220 working days and locks escrow on the midpoint of that band."
                              currency={conCur}
                              onCurrencyChange={setConCur}
                              minValue={conMin}
                              maxValue={conMax}
                              onMinChange={(v) => setConMin(sanitizePositiveDecimalInput(v))}
                              onMaxChange={(v) => setConMax(sanitizePositiveDecimalInput(v))}
                              minPlaceholder="Min per day"
                              maxPlaceholder="Max per day"
                              minError={fieldErrors.conMin}
                              maxError={fieldErrors.conMax || fieldErrors.conDuration}
                            />

                            {showEscrow('con') && renderEscrowBox('con')}
                          </div>
                        )}

                        {/* STIPEND PANEL */}
                        {compType === 'sti' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <CurrencyAmountRange
                              mode="single"
                              label="Annual stipend or fellowship value"
                              hint="Enter the annual stipend value. For paid internships shorter than 12 months, enter the full value of the placement. VORA applies a fee on stipend roles â€” the rate shown in the escrow breakdown depends on your registered country."
                              currency={stiCur}
                              onCurrencyChange={setStiCur}
                              singleValue={stiVal}
                              onSingleChange={(v) => setStiVal(sanitizePositiveDecimalInput(v))}
                              singlePlaceholder="Annual stipend value"
                              singleError={fieldErrors.stiVal}
                            />

                            {showEscrow('sti') && renderEscrowBox('sti')}
                          </div>
                        )}

                        {/* UNPAID PANEL */}
                        {compType === 'unp' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <AlertBanner variant="blue" className="!text-xs">
                              <strong>Flat listing fee applies.</strong> For unpaid placements, volunteer roles, academic observerships, and similar arrangements, VORA charges a flat listing and matching fee â€” <strong>USD 50 for LMIC employers</strong> or <strong>USD 500 for other regions</strong>. No escrow is held. Payment is processed on go-live. This covers the full matching and assessment process regardless of outcome.
                            </AlertBanner>

                            <Input
                              label={
                                <>
                                  Expenses, allowances or benefits provided{' '}
                                  <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                                </>
                              }
                              placeholder="e.g. Travel and accommodation covered; daily subsistence allowance; free meals on shift"
                              value={expenses}
                              onChange={(e) => setExpenses(e.target.value)}
                            />
                          </div>
                        )}

                        {/* PHD PANEL */}
                        {compType === 'phd' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <CurrencyAmountRange
                              mode="single"
                              label="Year-1 stipend value"
                              hint="VORA fees on funded PhDs are calculated on the year-1 stipend only. Tuition fee waivers and bench fees do not factor into the escrow."
                              currency={phdCur}
                              onCurrencyChange={setPhdCur}
                              currencyOptions={PHD_CURRENCY_OPTIONS}
                              singleValue={phdVal}
                              onSingleChange={(v) => setPhdVal(sanitizePositiveDecimalInput(v))}
                              singlePlaceholder="Year-1 stipend"
                              singleError={fieldErrors.phdVal}
                            />

                            {showEscrow('phd') && renderEscrowBox('phd')}
                          </div>
                        )}

                        {/* UNIVERSITY PANEL */}
                        {compType === 'uni' && (
                          <div className="space-y-4.5 mt-6 animate-in slide-in-from-top-2 duration-300">
                            <AlertBanner variant="blue" className="!text-xs">
                              <strong>University admissions (self-funded students):</strong> For programmes where students pay tuition, VORA charges a flat placement fee to the university â€” not a percentage of tuition. You are replacing the education agent model with a quality-controlled matching system. For <em>funded</em> PhD or research roles, use the PhD or Stipend types above.
                            </AlertBanner>

                            <CurrencyAmountRange
                              mode="single"
                              label="Annual tuition / programme value"
                              hint="Used to determine your flat placement fee tier. VORA charges a fixed fee per confirmed enrolled student â€” not a percentage of tuition. The fee is locked at application and released on confirmed enrolment."
                              currency={uniCur}
                              onCurrencyChange={setUniCur}
                              currencyOptions={UNI_CURRENCY_OPTIONS}
                              singleValue={uniTuition}
                              onSingleChange={(v) => setUniTuition(sanitizePositiveDecimalInput(v))}
                              singlePlaceholder="Annual tuition value"
                              singleError={fieldErrors.uniTuition}
                            />

                            <Select
                              label="Programme type"
                              value={uniProg}
                              placeholder="Select programme type"
                              groups={UNI_PROGRAMME_GROUPS}
                              onChange={(e) => setUniProg(e.target.value)}
                              error={!!fieldErrors.uniProg}
                              helperText={fieldErrors.uniProg}
                            />

                            {showEscrow('uni') && renderEscrowBox('uni')}

                            <AlertBanner variant="blue" className="mt-3 !text-[13px]" showIcon={false}>
                              For students from Global South countries, VORA applies a 40% reduction to the placement fee to support equitable access to international education. Global South is defined by the World Bank country income classification at the time of application.
                            </AlertBanner>
                          </div>
                        )}

                        {/* LMIC Badge */}
                        {isLmicActive && (
                          <AlertBanner variant="green" className="mt-3 !text-xs">
                            <strong>LMIC fee rates applied.</strong> Your currency qualifies for VORA&apos;s lower-income country pricing â€” 10% for salaried and contract roles, 7% for stipends and PhDs, and USD 50 flat fee for unpaid/volunteer roles. These rates are research-grounded â€” below the 10â€“17% charged by local recruitment agencies across Sub-Saharan Africa, South Asia, and Southeast Asia. This rate is locked at submission.
                          </AlertBanner>
                        )}
                      </div>

                      {/* POSITIONS CARD (shown for salaried, contract, stipend) */}
                      {['sal', 'con', 'sti'].includes(compType) && (
                        <div className="bg-white border border-[#E6E6E6] rounded-xl p-8 space-y-6">
                          <div>
                            <SectionTitle>Positions available</SectionTitle>
                            <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                              How many people are you hiring into this role? Each position is covered by the escrow calculation above.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-medium text-[#1A1A1A]">Number of positions</label>
                              <input autoComplete="off"
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 1, 2, 3"
                                value={positions}
                                onKeyDown={blockNegativeNumberKeys}
                                onChange={(e) =>
                                  setPositions(sanitizePositiveIntInput(e.target.value, 999))
                                }
                                className={`w-full max-w-[180px] px-3.5 py-3 border focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all ${fieldErrors.positions ? 'border-red-500' : 'border-[#E6E6E6]'}`}
                              />
                              {fieldErrors.positions && (
                                <p className="text-xs text-red-600 font-medium">{fieldErrors.positions}</p>
                              )}
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
                            <SectionTitle>Contract / placement duration</SectionTitle>
                            <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                              Used to calculate the total contract value and escrow. Choose the expected working duration â€” this does not need to be a full year. Six-month locum contracts, 3-month fellowships, and single-project consultancies all work the same way.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[13px] font-medium text-[#1A1A1A]">Duration â€” contract or placement</label>
                            <div className="flex flex-wrap gap-2.5 mb-3">
                              {[
                                { id: '22', label: '1 month', days: 22 },
                                { id: '65', label: '3 months', days: 65 },
                                { id: '110', label: '6 months', days: 110 },
                                { id: '165', label: '9 months', days: 165 },
                                { id: '220', label: '1 year (standard)', days: 220 },
                                { id: '330', label: '18 months', days: 330 },
                                { id: '440', label: '2 years', days: 440 },
                                { id: 'custom', label: 'Customâ€¦', days: 0 }
                              ].map((preset) => {
                                const isSel = durationPreset === preset.id;
                                return (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleDurationPresetClick(preset.days, preset.id)}
                                    className={`px-3.5 py-2 rounded-full border border-[#E6E6E6] text-xs font-bold transition-all cursor-pointer ${isSel
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
                                <input autoComplete="off"
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Working days (e.g. 110 = 6 months)"
                                  value={conDuration || ''}
                                  onKeyDown={blockNegativeNumberKeys}
                                  onChange={(e) => handleCustomDurationChange(e.target.value)}
                                  className="w-full max-w-[260px] px-3.5 py-3 border border-[#E6E6E6] focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all"
                                />
                                <p className="text-[11px] text-[#808080] leading-relaxed">
                                  Working days only â€” exclude weekends and public holidays. 22 days/month is a reasonable estimate.
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
                            <SectionTitle>Places available</SectionTitle>
                            <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                              How many students are you seeking to enrol through VORA for this programme? Each confirmed enrolled student triggers the flat placement fee.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-medium text-[#1A1A1A]">Number of student places</label>
                              <input autoComplete="off"
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 1, 5, 10"
                                value={uniStudentCount}
                                onKeyDown={blockNegativeNumberKeys}
                                onChange={(e) =>
                                  setUniStudentCount(
                                    sanitizePositiveIntInput(e.target.value, 500)
                                  )
                                }
                                className={`w-full max-w-[180px] px-3.5 py-3 border focus:border-[#0047CC] focus:ring-2 focus:ring-[#0047CC]/20 rounded-lg text-sm bg-white outline-none transition-all ${fieldErrors.uniStudentCount ? 'border-red-500' : 'border-[#E6E6E6]'}`}
                              />
                              {fieldErrors.uniStudentCount && (
                                <p className="text-xs text-red-600 font-medium">{fieldErrors.uniStudentCount}</p>
                              )}
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
                          <SectionTitle>Documentation</SectionTitle>
                          <p className="text-[13px] text-[#808080] mt-1.5 leading-relaxed">
                            Attach any supporting documents for this role. These are only visible to VORA staff during review and are not shared with candidates.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-medium text-[#1A1A1A]">
                              Full job description <span className="text-[11px] text-[#808080] font-normal italic">(optional if posted manually)</span>
                            </label>
                            {fieldErrors.jdFile && (
                              <p className="text-xs text-red-600 font-medium">{fieldErrors.jdFile}</p>
                            )}

                            {!jdFile ? (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-6.5 text-center cursor-pointer transition-all bg-white ${isDragging
                                    ? 'border-[#387DFF] bg-[#EBF6FF]'
                                    : 'border-[#E6E6E6] hover:border-[#387DFF] hover:bg-[#F7F9FF]'
                                  }`}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ADADAD" strokeWidth="1.5" className="mx-auto mb-2 text-[#ADADAD]">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <div className="text-[13px] font-medium text-[#4A4A4A] mb-1">Upload job description</div>
                                <div className="text-xs text-[#808080]">PDF, DOC, DOCX up to 10MB</div>
                                <input autoComplete="off"
                                  type="file"
                                  ref={fileInputRef}
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 bg-white border border-[#BDD9FF] rounded-lg p-3 animate-in fade-in duration-200">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0047CC" strokeWidth="2" className="shrink-0">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span className="text-[13px] font-bold text-[#0047CC] flex-1 truncate">{jdFile.name}</span>
                                <span className="text-xs text-[#4A4A4A]">{formatFileSize(jdFile.size)}</span>
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="text-[#0047CC] hover:text-[#003399] font-bold text-lg leading-none cursor-pointer px-1.5 py-0.5"
                                >
                                  &times;
                                </button>
                              </div>
                            )}
                          </div>

                          <Textarea
                            label={
                              <>
                                Internal notes for VORA{' '}
                                <span className="text-[11px] text-[#808080] font-normal italic">(optional)</span>
                              </>
                            }
                            rows={3}
                            placeholder="Anything you want VORA's team to know that is not captured in the form. This is never shared with candidates."
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            className="mt-3.5 min-h-[80px] resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: PREVIEW */}
                  {currentStep === 6 && (
                    <>
                      <StepValidationAlert errors={fieldErrors} />
                      <PostJobPreviewStep
                        isScheduled={isScheduled}
                        goLiveDate={goLiveDate}
                        formatDate={formatDate}
                        onEditStep={jumpToStep}
                        escrow={buildEscrowPreview()}
                        roleType={roleType}
                        roleTitle={roleTitle}
                        level={level}
                        positions={positions}
                        timeCommitment={timeCommitment ? formatTimeCommitmentDisplay(timeCommitment) : ''}
                        workFormat={workFormat}
                        location={location}
                        additionalLocations={additionalLocations}
                        selectedTimezones={selectedTimezones}
                        startDate={startDate}
                        endDate={endDate}
                        summary={summary}
                        internationalPolicy={internationalPolicy}
                        securityClearance={securityClearance}
                        roleGoal={roleGoal}
                        coreResponsibilities={coreResponsibilities}
                        technicalSkills={technicalSkills}
                        tools={tools}
                        languages={languages}
                        preAssessments={preAssessments}
                        experienceYears={experienceYears}
                        experienceTypes={experienceTypes}
                        minQualification={minQualification}
                        sectorBackground={sectorBackground}
                        geographicExperience={geographicExperience}
                        publicationsRequired={publicationsRequired}
                        budgetManagement={budgetManagement}
                        preferredWorkingStyle={preferredWorkingStyle}
                        communicationRhythm={communicationRhythm}
                        primaryLanguage={primaryLanguage}
                        personalityTraits={personalityTraits}
                        workEnvironment={workEnvironment}
                        compType={compType}
                        expenses={expenses}
                        fmt={fmt}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom actions, always visible; form scrolls above */}
          <div className="min-h-[64px] bg-white border-t border-[#E6E6E6] px-6 md:px-8 py-4 flex items-center justify-between shrink-0 z-[5]">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                fullWidth={false}
                onClick={prevStep}
                className="px-6 min-h-[38px] border-[#E6E6E6] text-[#4A4A4A] font-bold text-xs rounded-full flex items-center gap-1 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                fullWidth={false}
                onClick={handleSaveDraft}
                disabled={isProceeding || isSavingDraft}
                className="px-6 min-h-[38px] border-[#E6E6E6] text-[#4A4A4A] font-bold text-xs rounded-full hover:bg-gray-50 transition-all cursor-pointer"
              >
                Save as draft
              </Button>
              <Button
                onClick={currentStep === 6 ? handleFinalStep : handleNextStep}
                isLoading={isProceeding}
                loadingLabel="Proceeding"
                disabled={isProceeding || isSavingDraft}
                fullWidth={false}
                className="px-7 min-h-[38px] bg-[#0047CC] hover:bg-[#003d99] text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-none"
              >
                {currentStep === 6 ? 'Continue to payment' : 'Proceed'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PostJobCheckoutDrawer
        isOpen={isCheckoutOpen}
        isScheduled={isScheduled}
        roleTitle={roleTitle}
        escrow={buildEscrowPreview()}
        fmt={fmt}
        isSubmitting={isProceeding}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
};

export default PostJobWizard;
