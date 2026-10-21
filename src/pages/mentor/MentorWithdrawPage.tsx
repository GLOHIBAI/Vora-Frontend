import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  CreditCardIcon,
  BankIcon,
  GlobeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  InfoIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import ModalDialog from '../../components/common/ModalDialog';
import Select from '../../components/common/Select';
import type { Option } from '../../types';

const FLW_COUNTRY_OPTIONS: Option[] = [
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Rwanda', label: 'Rwanda' },
];

const FLW_BANK_OPTIONS: Option[] = [
  { value: 'GTBank', label: 'GTBank' },
  { value: 'Access Bank', label: 'Access Bank' },
  { value: 'First Bank', label: 'First Bank' },
  { value: 'Zenith Bank', label: 'Zenith Bank' },
  { value: 'UBA', label: 'UBA' },
  { value: 'Stanbic IBTC', label: 'Stanbic IBTC' },
];

const PST_COUNTRY_OPTIONS: Option[] = [
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Kenya', label: 'Kenya' },
];

const PST_BANK_OPTIONS: Option[] = [
  { value: 'GTBank', label: 'GTBank' },
  { value: 'Access Bank', label: 'Access Bank' },
  { value: 'First Bank', label: 'First Bank' },
  { value: 'Zenith Bank', label: 'Zenith Bank' },
];

const CURRENCY_OPTIONS: Option[] = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const STRIPE_COUNTRY_OPTIONS: Option[] = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
];

export interface PayoutMethodItem {
  id: string;
  provider: 'flw' | 'pst' | 'str' | 'bank';
  providerLabel: string;
  name: string;
  accountDetail: string;
  isDefault?: boolean;
}

const INITIAL_METHODS: PayoutMethodItem[] = [
  {
    id: 'flw-1',
    provider: 'flw',
    providerLabel: 'FLW',
    name: 'Flutterwave — GTBank Nigeria',
    accountDetail: 'Account: ••••••• 4821 · NGN · Dr. Adesina Oluwatobi',
    isDefault: true,
  },
  {
    id: 'pst-1',
    provider: 'pst',
    providerLabel: 'PST',
    name: 'Paystack — Access Bank Nigeria',
    accountDetail: 'Account: ••••••• 0074 · NGN · Dr. Adesina Oluwatobi',
  },
  {
    id: 'str-1',
    provider: 'str',
    providerLabel: 'STR',
    name: 'Stripe — USD Bank Account',
    accountDetail: 'Routing: •••• 0089 · Account: ••••••• 7730 · USD',
  },
];

const RECENT_PAYOUT_ROWS = [
  { date: '28 Feb 26', badge: 'FLW', bank: 'GTBank', amount: 2840, status: 'Paid' },
  { date: '31 Jan 26', badge: 'FLW', bank: 'GTBank', amount: 3100, status: 'Paid' },
  { date: '31 Dec 25', badge: 'FLW', bank: 'GTBank', amount: 4220, status: 'Paid' },
  { date: '30 Nov 25', badge: 'PST', bank: 'Access', amount: 3680, status: 'Paid' },
  { date: '31 Oct 25', badge: 'STR', bank: 'USD', amount: 2990, status: 'Paid' },
];

const MentorWithdrawPage: React.FC = () => {
  const navigate = useNavigate();

  // Financial balance state (reconciled: $3,940 gross - 20% platform fee $788 = $3,152 available)
  const [availableBalance, setAvailableBalance] = useState(3152.0);

  // Amount input state
  const [amountInput, setAmountInput] = useState('3152');
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected payout method
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodItem[]>(INITIAL_METHODS);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('flw-1');

  // Schedule selection ('now' | 'auto')
  const [scheduleType, setScheduleType] = useState<'now' | 'auto'>('now');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isWithdrawSuccess, setIsWithdrawSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteMethod, setPendingDeleteMethod] = useState<PayoutMethodItem | null>(null);

  // Add Method Form state
  const [activeAddTab, setActiveAddTab] = useState<'flw' | 'pst' | 'str' | 'bank'>('flw');
  const [newMethodBank, setNewMethodBank] = useState('GTBank');
  const [newMethodCountry, setNewMethodCountry] = useState('Nigeria');
  const [newMethodAccountNum, setNewMethodAccountNum] = useState('');
  const [newMethodAccountName, setNewMethodAccountName] = useState('Dr. Adesina Oluwatobi');
  const [isNewDefault, setIsNewDefault] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  // Active method helper
  const selectedMethod = payoutMethods.find((m) => m.id === selectedMethodId) || payoutMethods[0];

  // Numeric parsing and validation
  const numericAmount = parseFloat(amountInput.replace(/,/g, '')) || 0;
  const isOverLimit = numericAmount > availableBalance;
  const isBelowMin = numericAmount > 0 && numericAmount < 10;
  const isEmpty = !amountInput || numericAmount <= 0;
  const hasValidationError = isOverLimit || isBelowMin;

  const clampedAmount = Math.min(Math.max(numericAmount, 0), availableBalance);
  const fee = clampedAmount > 2000 ? 0 : clampedAmount > 500 ? clampedAmount * 0.005 : 1.5;
  const netAmount = Math.max(0, clampedAmount - fee);

  const handleSetQuickAmount = (val: number) => {
    setAmountInput(String(val));
  };

  // Add method verify action
  const handleVerifyNewAccount = () => {
    setIsVerifyingAccount(true);
    setTimeout(() => {
      setIsVerifyingAccount(false);
      setIsAccountVerified(true);
      toast.success('Account verified: DR. ADESINA OLUWATOBI — ' + newMethodBank);
    }, 600);
  };

  // Save new method
  const handleSaveNewMethod = () => {
    if (!newMethodAccountNum && activeAddTab !== 'str' && activeAddTab !== 'bank') {
      toast.error('Please enter an account number');
      return;
    }

    const providerNames: Record<string, string> = {
      flw: `Flutterwave — ${newMethodBank} ${newMethodCountry}`,
      pst: `Paystack — ${newMethodBank} ${newMethodCountry}`,
      str: `Stripe — USD Bank Account`,
      bank: `International Wire — ${newMethodBank}`,
    };

    const newId = `pm-${Date.now()}`;
    const newMethod: PayoutMethodItem = {
      id: newId,
      provider: activeAddTab,
      providerLabel: activeAddTab.toUpperCase(),
      name: providerNames[activeAddTab] || 'Bank Payout',
      accountDetail: `Account: ••••••• ${newMethodAccountNum.slice(-4) || '5821'} · ${newMethodCountry}`,
      isDefault: isNewDefault,
    };

    let updated = isNewDefault ? payoutMethods.map((m) => ({ ...m, isDefault: false })) : [...payoutMethods];
    updated = [newMethod, ...updated];
    setPayoutMethods(updated);
    setSelectedMethodId(newId);
    setIsAddModalOpen(false);
    setIsAccountVerified(false);
    setNewMethodAccountNum('');
    toast.success('New payout method added and selected!');
  };

  // Confirm delete method
  const handleDeleteClick = (method: PayoutMethodItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingDeleteMethod(method);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteMethod) return;
    setPayoutMethods((prev) => prev.filter((m) => m.id !== pendingDeleteMethod.id));
    if (selectedMethodId === pendingDeleteMethod.id) {
      const remaining = payoutMethods.filter((m) => m.id !== pendingDeleteMethod.id);
      if (remaining.length > 0) {
        setSelectedMethodId(remaining[0].id);
      }
    }
    setIsDeleteModalOpen(false);
    toast.success(`Removed ${pendingDeleteMethod.name}`);
    setPendingDeleteMethod(null);
  };

  // Execute withdrawal
  const handleProcessWithdrawal = () => {
    if (hasValidationError || isEmpty) {
      toast.error('Please enter a valid amount within your available balance');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsWithdrawSuccess(true);
      const newBal = availableBalance - clampedAmount;
      setAvailableBalance(newBal);
      setAmountInput(String(newBal));
      toast.success(`Withdrawal of $${clampedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} initiated!`);
    }, 900);
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-20">
      {/* ─── Breadcrumb ────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-wrap">
        <Link to="/dashboard" className="hover:text-[#0047CC] transition-colors">
          Dashboard
        </Link>
        <ChevronRightIcon size={12} className="shrink-0 text-slate-400" />
        <Link to="/finances" className="hover:text-[#0047CC] transition-colors">
          Finances
        </Link>
        <ChevronRightIcon size={12} className="shrink-0 text-slate-400" />
        <span className="text-slate-900 font-semibold">Withdraw Funds</span>
      </nav>

      {/* ─── Page Header with Compact Ghost Back Link ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Withdraw Funds
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Send your earnings to any registered payout method
          </p>
        </div>

        {/* Compact ghost text link with arrow */}
        <Link
          to="/finances"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0047CC] py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors self-start sm:self-center"
        >
          <ChevronLeftIcon size={14} />
          Back to Finances
        </Link>
      </div>

      {/* ─── Compact Balance Hero Card ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18234B] via-[#283979] to-[#0047CC] p-5 sm:p-6 text-white shadow-md">
        {/* Subtle backdrop shapes */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">
            Available to Withdraw
          </span>

          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums lining-nums">
            ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <p className="text-xs text-white/70 font-medium">
            After VORA's 20% platform fee · Updates in real-time
          </p>

          <div className="flex items-center gap-6 pt-3 flex-wrap border-t border-white/10 text-xs text-white/80">
            <div className="flex items-center gap-1.5">
              <ClockIcon size={13} className="text-white/70" />
              <span>
                Gross earned: <strong className="text-white font-semibold tabular-nums lining-nums">$3,940.00</strong> (March)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <BankIcon size={13} className="text-white/70" />
              <span>
                Platform fee: <strong className="text-white font-semibold tabular-nums lining-nums">$788.00</strong> (20%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircleIcon size={13} className="text-white/70" />
              <span>
                Processing: <strong className="text-white font-semibold">1–3 business days</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Withdrawal Form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Card 1: Amount */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-[#0047CC] font-bold">$</span>
                  Withdrawal Amount
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Maximum available: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Big Amount Input with validation styling */}
            <div className="space-y-1.5">
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold pointer-events-none ${
                  hasValidationError ? 'text-red-400' : 'text-slate-400'
                }`}>
                  $
                </span>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    setAmountInput(raw);
                  }}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-3.5 text-2xl sm:text-3xl font-bold text-slate-900 bg-white rounded-xl border-2 transition-colors tabular-nums lining-nums ${
                    hasValidationError
                      ? 'border-red-400 bg-red-50/20 text-red-950 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:outline-none focus:border-[#0047CC] focus:ring-2 focus:ring-blue-100 shadow-2xs'
                  }`}
                />
              </div>

              {/* Error messages */}
              {isOverLimit && (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <span>•</span> Amount exceeds your available balance of ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.
                </p>
              )}
              {isBelowMin && (
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <span>•</span> Minimum withdrawal amount is $10.00.
                </p>
              )}
            </div>

            {/* Quick buttons with unified selected state */}
            <div className="flex items-center gap-2 flex-wrap">
              {[500, 1000, 2000].map((val) => {
                const isSelected = numericAmount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSetQuickAmount(val)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'border-[#0047CC] bg-blue-50 text-[#0047CC] font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                );
              })}

              {/* Withdraw all chip matching the same chip pattern */}
              <button
                type="button"
                onClick={() => handleSetQuickAmount(availableBalance)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer shadow-2xs ${
                  numericAmount === availableBalance
                    ? 'border-[#0047CC] bg-blue-50 text-[#0047CC] font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                Withdraw all (${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </button>
            </div>

            {/* Fee Breakdown Card with dark slate tabular numbers */}
            <div className="bg-slate-50/90 rounded-xl p-3.5 space-y-2 border border-slate-200/60 text-xs font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span>Withdrawal amount</span>
                <span className="font-semibold text-slate-900 tabular-nums lining-nums">
                  ${clampedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Processing fee</span>
                <span className={fee === 0 ? 'text-slate-500' : 'text-slate-900 font-semibold tabular-nums lining-nums'}>
                  {fee === 0 ? '$0.00 (waived)' : `$${fee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-semibold">
                <span className="text-slate-900">You receive</span>
                <span className="text-slate-900 font-bold tabular-nums lining-nums">
                  ${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Payout Method with 40px hit areas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                  <CreditCardIcon size={18} className="text-[#0047CC] shrink-0" />
                  <span>Payout Method</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                  Select where your funds go
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <PlusIcon size={12} strokeWidth={2.5} />
                <span>Add Method</span>
              </button>
            </div>

            {/* Methods List */}
            <div className="space-y-3">
              {payoutMethods.map((pm) => {
                const isSelected = pm.id === selectedMethodId;
                const badgeGrad =
                  pm.provider === 'flw'
                    ? 'from-amber-500 to-amber-600'
                    : pm.provider === 'pst'
                    ? 'from-emerald-500 to-emerald-600'
                    : pm.provider === 'str'
                    ? 'from-indigo-600 to-indigo-700'
                    : 'from-slate-700 to-slate-800';

                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-[#0047CC] bg-[#EBF6FF]/40 shadow-sm'
                        : 'border-slate-200 hover:border-blue-200 bg-white'
                    }`}
                  >
                    {pm.isDefault && (
                      <span className="absolute -top-2.5 right-4 text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-900 text-white rounded-full shadow-2xs">
                        Default
                      </span>
                    )}

                    {/* Logo Pill */}
                    <div
                      className={`w-11 h-8 rounded-lg bg-gradient-to-br ${badgeGrad} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs`}
                    >
                      {pm.providerLabel}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {pm.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                        {pm.accountDetail}
                      </p>
                    </div>

                    {/* Actions with 40px hit areas */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Editing ${pm.name}`);
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0047CC] hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                        title="Edit method"
                        aria-label={`Edit ${pm.name}`}
                      >
                        <EditIcon size={14} />
                      </button>

                      {!pm.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(pm, e)}
                          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                          title="Remove method"
                          aria-label={`Remove ${pm.name}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}

                      {/* Explicit selection check circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ml-1 ${
                          isSelected
                            ? 'bg-[#0047CC] border-[#0047CC] text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckIcon size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add another method dashed box with clear hover & focus states */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0047CC] hover:bg-blue-50/40 text-slate-600 hover:text-[#0047CC] focus:outline-none focus:ring-2 focus:ring-[#0047CC] transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <div className="w-8 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                  <PlusIcon size={12} strokeWidth={2.5} />
                </div>
                Add another payout method
              </button>
            </div>

            {/* Standardized Info Box: Dark slate text with blue icon on blue-50 background */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium flex items-start gap-2.5 leading-relaxed">
              <InfoIcon size={16} className="shrink-0 text-[#0047CC] mt-0.5" />
              <span>
                Flutterwave and Paystack support local currency payouts across Nigeria, Kenya, Ghana, South Africa,
                Rwanda, Uganda, and Tanzania. Stripe handles international USD, EUR, and GBP bank transfers.
              </span>
            </div>
          </div>

          {/* Card 3: When to Process with unified neutral icons and radio indicators */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ClockIcon size={18} className="text-[#0047CC]" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                When to Process
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Withdraw Now */}
              <div
                onClick={() => setScheduleType('now')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                  scheduleType === 'now'
                    ? 'border-[#0047CC] bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <ClockIcon size={16} />
                  </div>
                  {/* Explicit radio indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    scheduleType === 'now' ? 'border-[#0047CC] bg-[#0047CC]' : 'border-slate-300'
                  }`}>
                    {scheduleType === 'now' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">Withdraw Now</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">1–3 business days</div>
                </div>
              </div>

              {/* Option 2: Auto Monthly */}
              <div
                onClick={() => setScheduleType('auto')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 ${
                  scheduleType === 'auto'
                    ? 'border-[#0047CC] bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <CalendarIcon size={16} />
                  </div>
                  {/* Explicit radio indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    scheduleType === 'auto' ? 'border-[#0047CC] bg-[#0047CC]' : 'border-slate-300'
                  }`}>
                    {scheduleType === 'auto' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">Auto Monthly</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Every month-end</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-900 font-semibold">Auto Monthly</strong> processes on the last business day of each month for a
              clean reconciliation cycle. You can still initiate manual withdrawals anytime.
            </div>
          </div>

          {/* Main Action Button (48px height, rounded-xl, multi-state) */}
          <div>
            <button
              type="button"
              disabled={hasValidationError || isEmpty || isProcessing}
              onClick={() => setIsConfirmModalOpen(true)}
              className="w-full h-12 rounded-xl text-sm sm:text-base font-semibold bg-[#0047CC] hover:bg-[#003bb3] text-white shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DownloadIcon size={18} strokeWidth={2.5} />
                  <span>
                    Withdraw ${clampedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} via{' '}
                    {selectedMethod?.name.split('—')[0].trim()}
                  </span>
                </>
              )}
            </button>

            {/* Darker helper text */}
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">
              Funds typically arrive within 1–3 business days. You'll receive email confirmation immediately.
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Informational How it Works & Payout History */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Informational How It Works (All 4 steps same neutral style) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-[#0047CC]">
                <CheckCircleIcon size={18} />
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                How It Works
              </h3>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">You initiate withdrawal</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Select amount &amp; method, confirm</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">VORA deducts platform fee</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">20% retained · 80% queued for payout</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Payment processor picks up</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Flutterwave / Paystack / Stripe processes</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Funds land in your account</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">1–3 business days · Email confirmation sent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payout History Mini Card with dark slate tabular amounts and 12px text */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClockIcon size={18} className="text-[#0047CC]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Payout History
                </h3>
              </div>

              <Link to="/finances" className="text-xs font-semibold text-[#0047CC] hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {RECENT_PAYOUT_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                              row.badge === 'FLW'
                                ? 'bg-amber-500'
                                : row.badge === 'PST'
                                ? 'bg-emerald-500'
                                : 'bg-indigo-600'
                            }`}
                          >
                            {row.badge}
                          </span>
                          <span className="text-xs text-slate-500">{row.bank}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 whitespace-nowrap tabular-nums lining-nums">
                        ${row.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100 font-medium">
              All-time paid: <strong className="text-slate-900 font-bold tabular-nums lining-nums">$38,560</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD PAYOUT METHOD MODAL ─────────────────────────────────── */}
      <ModalDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Payout Method"
        subtitle="Choose how you want to receive your VORA earnings"
        maxWidth="max-w-lg"
        actions={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              onClick={handleSaveNewMethod}
              className="text-xs font-semibold shadow-2xs gap-1.5 rounded-lg"
            >
              <CheckIcon size={12} strokeWidth={3} />
              Save Method
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {/* Method Type Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveAddTab('flw')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeAddTab === 'flw'
                  ? 'bg-white text-[#0047CC] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Flutterwave
            </button>
            <button
              type="button"
              onClick={() => setActiveAddTab('pst')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeAddTab === 'pst'
                  ? 'bg-white text-[#0047CC] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Paystack
            </button>
            <button
              type="button"
              onClick={() => setActiveAddTab('str')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeAddTab === 'str'
                  ? 'bg-white text-[#0047CC] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Stripe
            </button>
            <button
              type="button"
              onClick={() => setActiveAddTab('bank')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeAddTab === 'bank'
                  ? 'bg-white text-[#0047CC] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              Bank Wire
            </button>
          </div>

          {/* Form details per tab */}
          {activeAddTab === 'flw' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-xs p-3 rounded-xl font-medium">
                <strong className="font-semibold text-slate-900">Flutterwave</strong> supports Nigeria 🇳🇬, Kenya 🇰🇪, Ghana 🇬🇭, Uganda 🇺🇬,
                South Africa 🇿🇦, Rwanda 🇷🇼, and more.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <Select
                  value={newMethodCountry}
                  onChange={(e) => setNewMethodCountry(e.target.value)}
                  options={FLW_COUNTRY_OPTIONS}
                  className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank</label>
                <Select
                  value={newMethodBank}
                  onChange={(e) => setNewMethodBank(e.target.value)}
                  options={FLW_BANK_OPTIONS}
                  className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={newMethodAccountNum}
                    onChange={(e) => setNewMethodAccountNum(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    readOnly
                    value={isAccountVerified ? newMethodAccountName : 'Auto-fetched on verify'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={handleVerifyNewAccount}
                  disabled={isVerifyingAccount || !newMethodAccountNum}
                  className="!w-auto text-xs font-semibold rounded-lg shrink-0"
                >
                  {isVerifyingAccount ? 'Verifying...' : 'Verify Account'}
                </Button>
                <span className="text-xs text-slate-500 font-medium">Verify to confirm ownership</span>
              </div>
            </div>
          )}

          {activeAddTab === 'pst' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-xs p-3 rounded-xl font-medium">
                <strong className="font-semibold text-slate-900">Paystack</strong> supports Nigeria 🇳🇬, Ghana 🇬🇭, South Africa 🇿🇦, and Kenya 🇰🇪.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <Select
                  value={newMethodCountry}
                  onChange={(e) => setNewMethodCountry(e.target.value)}
                  options={PST_COUNTRY_OPTIONS}
                  className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank</label>
                <Select
                  value={newMethodBank}
                  onChange={(e) => setNewMethodBank(e.target.value)}
                  options={PST_BANK_OPTIONS}
                  className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={newMethodAccountNum}
                    onChange={(e) => setNewMethodAccountNum(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    readOnly
                    value={isAccountVerified ? newMethodAccountName : 'Auto-fetched on verify'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                pill={false}
                fullWidth={false}
                onClick={handleVerifyNewAccount}
                disabled={isVerifyingAccount || !newMethodAccountNum}
                className="!w-auto text-xs font-semibold rounded-lg"
              >
                {isVerifyingAccount ? 'Verifying...' : 'Verify Account'}
              </Button>
            </div>
          )}

          {activeAddTab === 'str' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-xs p-3 rounded-xl font-medium">
                <strong className="font-semibold text-slate-900">Stripe</strong> supports USD, EUR, GBP, CAD, AUD bank accounts in 40+ countries.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Full legal name"
                  defaultValue="Dr. Adesina Oluwatobi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <Select
                    value="USD"
                    options={CURRENCY_OPTIONS}
                    className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <Select
                    value="United States"
                    options={STRIPE_COUNTRY_OPTIONS}
                    className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Routing Number / Sort Code</label>
                <input
                  type="text"
                  placeholder="•••• 0089"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number / IBAN</label>
                <input
                  type="text"
                  placeholder="Account number or full IBAN"
                  value={newMethodAccountNum}
                  onChange={(e) => setNewMethodAccountNum(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC] tabular-nums"
                />
              </div>
            </div>
          )}

          {activeAddTab === 'bank' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-xs p-3 rounded-xl font-medium">
                <strong className="font-semibold text-slate-900">International Bank Wire via SWIFT</strong>. Works for any country with SWIFT support.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Chartered Bank"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    placeholder="SCBLUS33"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <Select
                    value="USD"
                    options={CURRENCY_OPTIONS}
                    className="!w-full !px-3.5 !py-2 !rounded-xl !border-slate-200 !text-xs !bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IBAN / Account Number</label>
                <input
                  type="text"
                  placeholder="Account number"
                  value={newMethodAccountNum}
                  onChange={(e) => setNewMethodAccountNum(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0047CC] tabular-nums"
                />
              </div>
            </div>
          )}

          {/* Default Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewDefault}
                onChange={(e) => setIsNewDefault(e.target.checked)}
                className="w-4 h-4 rounded text-[#0047CC] focus:ring-[#0047CC]"
              />
              Set as default payout method
            </label>
          </div>
        </div>
      </ModalDialog>

      {/* ─── CONFIRM WITHDRAWAL MODAL ───────────────────────────────── */}
      <ModalDialog
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setIsWithdrawSuccess(false);
        }}
        title={isWithdrawSuccess ? '' : 'Confirm Withdrawal'}
        maxWidth="max-w-md"
        actions={
          isWithdrawSuccess ? (
            <div className="flex items-center justify-center gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => navigate('/finances')}
                className="text-xs font-semibold rounded-lg"
              >
                View Finances
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setIsWithdrawSuccess(false);
                }}
                className="text-xs font-semibold rounded-lg"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-xs font-semibold rounded-lg"
              >
                Go Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleProcessWithdrawal}
                className="text-xs font-semibold shadow-2xs gap-1.5 rounded-lg"
              >
                <CheckIcon size={12} strokeWidth={3} />
                Confirm Withdrawal
              </Button>
            </div>
          )
        }
      >
        {isWithdrawSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-700">
              <CheckIcon size={28} strokeWidth={3} />
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums lining-nums">
              ${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <h4 className="text-base font-bold text-slate-900">Withdrawal Initiated!</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
              Your funds are on their way to {selectedMethod?.name.split('—')[1]?.trim() || 'your account'} via{' '}
              {selectedMethod?.name.split('—')[0]?.trim() || 'processor'}. You'll receive email confirmation
              and funds within 1–3 business days.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="text-center pb-2">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider block">
                Total Withdrawal
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1 tabular-nums lining-nums">
                ${clampedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                via {selectedMethod?.name}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-xs font-medium">
              <div className="flex items-center justify-between text-slate-600">
                <span>Withdrawal amount</span>
                <span className="font-semibold text-slate-900 tabular-nums lining-nums">
                  ${clampedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Processing fee</span>
                <span className="text-slate-900 font-semibold tabular-nums lining-nums">{fee === 0 ? '$0.00 (waived)' : `$${fee.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Expected arrival</span>
                <span>1–3 business days</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-semibold text-sm">
                <span className="text-slate-900">You receive</span>
                <span className="text-slate-900 font-bold tabular-nums lining-nums">
                  ${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="font-semibold text-slate-900">This action is irreversible.</strong> Funds will be dispatched to your selected account.
              Please ensure your account details are accurate before continuing.
            </div>
          </div>
        )}
      </ModalDialog>

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────── */}
      <ModalDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Payout Method?"
        maxWidth="max-w-sm"
        actions={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              onClick={handleConfirmDelete}
              className="text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Remove Method
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Are you sure you want to remove <strong className="font-semibold text-slate-900">{pendingDeleteMethod?.name}</strong> from your account? You can always add it back later.
        </p>
      </ModalDialog>
    </div>
  );
};

export default MentorWithdrawPage;
