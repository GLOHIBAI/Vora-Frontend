import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  GlobeIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BankIcon,
  CoursesIcon,
  CheckIcon,
  SearchIcon,
  InfoIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import ModalDialog from '../../components/common/ModalDialog';
import Select from '../../components/common/Select';
import type { Option } from '../../types';

const PERIOD_OPTIONS: Option[] = [
  { value: 'March 2026', label: 'March 2026' },
  { value: 'February 2026', label: 'February 2026' },
  { value: 'January 2026', label: 'January 2026' },
  { value: 'Q1 2026', label: 'Q1 2026' },
  { value: 'All time', label: 'All time' },
];

// --- Types ---
export interface SessionEarning {
  id: string;
  date: string;
  mentee: string;
  pathway: 'Interview Referred' | 'Direct' | 'VORA Matched';
  tier: 'T1' | 'T2' | 'T3';
  country: string;
  listedRate: number;
  pppRate: number; // Gross amount paid
  mentorShare: number; // 80% mentor earnings
  isRecent?: boolean;
}

export interface CourseRevenue {
  id: string;
  title: string;
  enrolledCount: number;
  pathway: 'Direct' | 'VORA Matched';
  sharePercent: number;
  monthRevenue: number;
  revenueAllTime: number;
}

export interface PayoutRecord {
  id: string;
  date: string;
  periodLabel: string;
  method: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Processing';
}

// --- Reconciled Data: March 2026 ---
// Gross Sessions = $2,070
// Gross Courses = $1,870
// Total Gross = $3,940
// Platform Fee (20%) = $788
// Net Available to Withdraw = $3,152 (80%)
// Average Session Gross = $2,070 / 5 = $414
const INITIAL_SESSION_EARNINGS: SessionEarning[] = [
  {
    id: 'se-1',
    date: 'Today',
    mentee: 'Chiamaka Obi',
    pathway: 'Interview Referred',
    tier: 'T3',
    country: 'Nigeria',
    listedRate: 600,
    pppRate: 150,
    mentorShare: 120,
    isRecent: true,
  },
  {
    id: 'se-2',
    date: '21 Mar',
    mentee: 'Dr. Priya Subramaniam',
    pathway: 'Direct',
    tier: 'T2',
    country: 'India',
    listedRate: 800,
    pppRate: 500,
    mentorShare: 400,
  },
  {
    id: 'se-3',
    date: '14 Mar',
    mentee: 'Fatima Al-Rashidi',
    pathway: 'Interview Referred',
    tier: 'T3',
    country: 'Yemen',
    listedRate: 600,
    pppRate: 120,
    mentorShare: 96,
  },
  {
    id: 'se-4',
    date: '11 Mar',
    mentee: 'Dr. Emeka Nwosu',
    pathway: 'Direct',
    tier: 'T1',
    country: 'Switzerland',
    listedRate: 1200,
    pppRate: 1200,
    mentorShare: 960,
  },
  {
    id: 'se-5',
    date: '05 Mar',
    mentee: 'Kwame Boateng',
    pathway: 'VORA Matched',
    tier: 'T3',
    country: 'Ghana',
    listedRate: 500,
    pppRate: 100,
    mentorShare: 80,
  },
];

const COURSE_REVENUES: CourseRevenue[] = [
  {
    id: 'cr-1',
    title: 'Enterprise Distributed Systems & Concurrency Architecture',
    enrolledCount: 487,
    pathway: 'Direct',
    sharePercent: 49,
    monthRevenue: 920,
    revenueAllTime: 18400,
  },
  {
    id: 'cr-2',
    title: 'Principal Engineer Architecture Masterclass & Strategic Design',
    enrolledCount: 312,
    pathway: 'VORA Matched',
    sharePercent: 33,
    monthRevenue: 610,
    revenueAllTime: 14200,
  },
  {
    id: 'cr-3',
    title: 'Technical Strategy, Systems Leadership & Executive Triage',
    enrolledCount: 198,
    pathway: 'Direct',
    sharePercent: 18,
    monthRevenue: 340,
    revenueAllTime: 15600,
  },
];

const PAYOUT_HISTORY: PayoutRecord[] = [
  {
    id: 'po-1',
    date: '28 Feb 2026',
    periodLabel: 'Feb 2026 payout',
    method: 'Flutterwave · GTBank Nigeria (•••• 4821)',
    amount: 2840,
    status: 'Paid',
  },
  {
    id: 'po-2',
    date: '31 Jan 2026',
    periodLabel: 'Jan 2026 payout',
    method: 'Flutterwave · GTBank Nigeria (•••• 4821)',
    amount: 3100,
    status: 'Paid',
  },
  {
    id: 'po-3',
    date: '31 Dec 2025',
    periodLabel: 'Dec 2025 payout',
    method: 'Flutterwave · GTBank Nigeria (•••• 4821)',
    amount: 4220,
    status: 'Paid',
  },
  {
    id: 'po-4',
    date: '30 Nov 2025',
    periodLabel: 'Nov 2025 payout',
    method: 'Paystack · Access Bank (•••• 0074)',
    amount: 3680,
    status: 'Paid',
  },
  {
    id: 'po-5',
    date: '31 Oct 2025',
    periodLabel: 'Oct 2025 payout',
    method: 'Paystack · Access Bank (•••• 0074)',
    amount: 2990,
    status: 'Paid',
  },
];

// Reconciled Chart Data:
// Weekly aggregate view sums exactly to $2,070 Sessions and $1,870 Courses ($3,940 Total Gross)
const MONTH_CHART_DATA = [
  { label: '1–7 Mar', sessions: 1200, courses: 460 },
  { label: '8–14 Mar', sessions: 120, courses: 480 },
  { label: '15–21 Mar', sessions: 500, courses: 450 },
  { label: '22–28 Mar', sessions: 250, courses: 480 },
];

const WEEK_CHART_DATA = [
  { label: 'Mon 20', sessions: 0, courses: 60 },
  { label: 'Tue 21', sessions: 500, courses: 80 },
  { label: 'Wed 22', sessions: 0, courses: 70 },
  { label: 'Thu 23', sessions: 0, courses: 65 },
  { label: 'Fri 24', sessions: 100, courses: 90 },
  { label: 'Sat 25', sessions: 0, courses: 85 },
  { label: 'Today', sessions: 150, courses: 90 },
];

const MentorFinancesPage: React.FC = () => {
  const navigate = useNavigate();

  // Period filter
  const [selectedPeriod, setSelectedPeriod] = useState('March 2026');

  // Chart view toggle ('week' | 'month')
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('month');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Table search & filter
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'All' | 'T1' | 'T2' | 'T3'>('All');

  // Available balance
  const [availableBalance] = useState(3152);

  // Modals state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Quick withdrawal form state in modal
  const [withdrawAmountInput, setWithdrawAmountInput] = useState('3152');
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'flutterwave' | 'paystack' | 'wire'>('flutterwave');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Chart data calculation
  const activeChartData = chartPeriod === 'week' ? WEEK_CHART_DATA : MONTH_CHART_DATA;
  const maxChartValue = useMemo(() => {
    return Math.max(...activeChartData.map((d) => d.sessions + d.courses), 1500);
  }, [activeChartData]);

  // Filtered session records
  const filteredSessions = useMemo(() => {
    return INITIAL_SESSION_EARNINGS.filter((sess) => {
      const matchSearch =
        sess.mentee.toLowerCase().includes(tableSearch.toLowerCase()) ||
        sess.country.toLowerCase().includes(tableSearch.toLowerCase()) ||
        sess.pathway.toLowerCase().includes(tableSearch.toLowerCase());
      const matchTier = selectedTierFilter === 'All' || sess.tier === selectedTierFilter;
      return matchSearch && matchTier;
    });
  }, [tableSearch, selectedTierFilter]);

  // Table totals
  const totalGrossSessions = useMemo(
    () => filteredSessions.reduce((acc, curr) => acc + curr.pppRate, 0),
    [filteredSessions]
  );
  const totalMentorShare = useMemo(
    () => filteredSessions.reduce((acc, curr) => acc + curr.mentorShare, 0),
    [filteredSessions]
  );

  // Export session earnings to CSV
  const handleExportCsv = () => {
    const headers = ['Date', 'Mentee', 'Pathway', 'Country', 'Tier', 'Listed Rate (USD)', 'PPP Rate (USD)', 'Mentor Share 80% (USD)'];
    const rows = filteredSessions.map((s) => [
      `"${s.date}"`,
      `"${s.mentee}"`,
      `"${s.pathway}"`,
      `"${s.country}"`,
      `"${s.tier}"`,
      s.listedRate,
      s.pppRate,
      s.mentorShare,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vora_finances_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Session earnings CSV exported successfully!');
  };

  // Confirm withdrawal inside modal
  const handleConfirmWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmountInput);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount to withdraw');
      return;
    }
    if (amount > availableBalance) {
      toast.error(`Amount exceeds your available balance of $${availableBalance.toLocaleString()}`);
      return;
    }

    setIsWithdrawing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsWithdrawModalOpen(false);

      const methodLabel =
        selectedPayoutMethod === 'flutterwave'
          ? 'Flutterwave (GTB Nigeria)'
          : selectedPayoutMethod === 'paystack'
          ? 'Paystack (Access Bank)'
          : 'International Wire / SWIFT';

      toast.success(
        `Withdrawal of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} initiated via ${methodLabel}! Funds arrive in 1–3 business days.`,
        { duration: 5000 }
      );
    } catch {
      toast.error('Withdrawal request failed. Please try again or contact support.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-16">
      {/* ─── Page Header: Aligned in single row ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            Finances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Earnings, payouts, and PPP-adjusted revenue across all global tiers
          </p>
        </div>

        {/* Action Controls in One Row */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          <Select
            variant="compact"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              toast.success(`Period updated to ${e.target.value}`);
            }}
            options={PERIOD_OPTIONS}
            className="!h-10 !border-slate-200 !rounded-full !px-4 !text-xs sm:!text-sm !font-semibold !bg-white !text-slate-700 shadow-2xs hover:!border-slate-300"
            containerClassName="shrink-0"
            align="right"
          />

          {/* Solid Primary CTA (The ONLY solid primary withdraw button) */}
          <Button
            variant="primary"
            size="md"
            pill={true}
            fullWidth={false}
            onClick={() => navigate('/finances/withdraw')}
            className="!w-auto h-10 text-xs sm:text-sm font-semibold shadow-2xs gap-1.5 shrink-0 whitespace-nowrap"
          >
            <DownloadIcon size={14} className="shrink-0" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* ─── Hero Balance Card ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18234B] via-[#283979] to-[#0047CC] p-5 sm:p-7 text-white shadow-lg w-full min-w-0">
        {/* Decorative backdrop shapes */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 border-b border-white/10">
            {/* Metric 1: Available */}
            <div className="sm:border-r sm:border-white/10 sm:pr-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Available to Withdraw
              </span>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1 tabular-nums lining-nums break-words">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-white/70 font-medium">
                After 20% platform fee · Ready now
              </span>
            </div>

            {/* Metric 2: Total Earned this Month */}
            <div className="lg:border-r lg:border-white/10 lg:pr-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                Total Gross ({selectedPeriod.split(' ')[0]})
              </span>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1 tabular-nums lining-nums break-words">
                $3,940.00
              </div>
              <span className="text-xs text-white/70 font-medium">
                Sessions ($2,070) + Courses ($1,870)
              </span>
            </div>

            {/* Metric 3: All-Time */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                All-Time Gross Earnings
              </span>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1 tabular-nums lining-nums break-words">
                $48,200.00
              </div>
              <span className="text-xs text-white/70 font-medium">
                Since joining VORA · 127 mentees
              </span>
            </div>
          </div>

          {/* Hero Bottom Row: Withdraw & Payout History buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/finances/withdraw')}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs sm:text-sm font-semibold active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <DownloadIcon size={14} strokeWidth={2.5} />
              Withdraw ${availableBalance.toLocaleString()}
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs sm:text-sm font-medium active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <ClockIcon size={14} />
              Payout History
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row: Standardized Icon + Text (No Pills) ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
        {/* Stat 1: Sessions Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sessions Revenue
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums lining-nums">
            $2,070
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <ArrowUpIcon size={12} strokeWidth={2.5} />
            <span>8% vs Feb</span>
          </div>
        </div>

        {/* Stat 2: Courses Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Courses Revenue
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums lining-nums">
            $1,870
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <ArrowUpIcon size={12} strokeWidth={2.5} />
            <span>14% vs Feb</span>
          </div>
        </div>

        {/* Stat 3: Platform Fee */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Platform Fee (20%)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums lining-nums">
            $788
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
            <CheckCircleIcon size={12} className="text-slate-400" />
            <span>Fixed 20% platform share</span>
          </div>
        </div>

        {/* Stat 4: Average Session Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Avg Session Rate
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight tabular-nums lining-nums">
            $414
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
            <GlobeIcon size={12} className="text-slate-400" />
            <span>Across global candidate regions</span>
          </div>
        </div>
      </div>

      {/* ─── Content Grid: Balanced Height Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column (7 cols lg, 7 xl): Chart + Sessions Table + PPP Revenue Split */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 w-full min-w-0">
          {/* Revenue Over Time Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[#0047CC]">
                  <TrendingUpIcon size={18} />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Revenue Over Time
                </h3>
              </div>

              {/* Segmented Control matching standard design */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setChartPeriod('month');
                    toast.success('Switched to Weekly Aggregate view');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    chartPeriod === 'month'
                      ? 'bg-white text-[#0047CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChartPeriod('week');
                    toast.success('Switched to Daily view');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    chartPeriod === 'week'
                      ? 'bg-white text-[#0047CC] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>

            {/* Bar Chart Canvas with Baseline Gridlines & Y-Axis */}
            <div className="pt-2 w-full overflow-hidden">
              <div className="relative h-44 sm:h-48 flex items-end gap-2 sm:gap-6 pb-6 pt-4 pl-10 sm:pl-12 border-b border-slate-200 w-full min-w-0">
                {/* Horizontal Baseline Gridlines */}
                <div className="absolute left-0 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-b border-dashed border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium -translate-y-2">$1,500</span>
                  </div>
                  <div className="w-full border-b border-dashed border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium -translate-y-2">$1,000</span>
                  </div>
                  <div className="w-full border-b border-dashed border-slate-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium -translate-y-2">$500</span>
                  </div>
                  <div className="w-full border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium -translate-y-2">$0</span>
                  </div>
                </div>

                {/* Bars */}
                {activeChartData.map((d, idx) => {
                  const total = d.sessions + d.courses;
                  const heightPercent = Math.min(Math.max(Math.round((total / maxChartValue) * 100), 6), 100);
                  const coursesPercent = total > 0 ? Math.round((d.courses / total) * 100) : 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative z-10"
                    >
                      {/* Rich Hover Tooltip */}
                      {isHovered && (
                        <div className="pointer-events-none transition-all duration-150 absolute -top-14 px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl whitespace-nowrap z-30 animate-in fade-in zoom-in-95 text-xs">
                          <p className="font-semibold text-slate-200">{d.label}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] tabular-nums">
                            <span className="flex items-center gap-1 text-slate-300">
                              <span className="w-2 h-2 rounded-xs bg-[#0047CC]" />
                              Sessions: ${d.sessions}
                            </span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <span className="w-2 h-2 rounded-xs bg-[#93C5FD]" />
                              Courses: ${d.courses}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white border-t border-slate-700/80 mt-1 pt-0.5 tabular-nums">
                            Total: ${total.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Stacked Bar with Two Blues (Sessions: Dark #0047CC, Courses: Soft #93C5FD) */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[36px] sm:max-w-[42px] rounded-t-md overflow-hidden transition-all duration-300 cursor-pointer shadow-2xs group-hover:brightness-105 flex flex-col justify-end"
                      >
                        {d.sessions > 0 && (
                          <div
                            style={{ height: `${100 - coursesPercent}%` }}
                            className="w-full bg-[#0047CC]"
                            title={`Sessions: $${d.sessions}`}
                          />
                        )}
                        <div
                          style={{ height: `${coursesPercent}%` }}
                          className="w-full bg-[#93C5FD]"
                          title={`Courses: $${d.courses}`}
                        />
                      </div>

                      {/* Meaningful X-Axis Label */}
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend with Two Blues */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-400">
                  {chartPeriod === 'month' ? 'March 2026 (Weekly Total: $3,940)' : 'Last 7 Days (Sessions + Courses)'}
                </span>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#0047CC] shrink-0" />
                    Sessions (Dark Blue)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#93C5FD] shrink-0" />
                    Courses (Light Blue)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Session Earnings Table Card (Sticky Header, Mobile Scroll, Row Hover) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[#0047CC]">
                  <CalendarIcon size={18} />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Per-Session Earnings
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Strict reverse chronological log of completed sessions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <DownloadIcon size={13} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter sessions by mentee or country..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0047CC] shadow-2xs font-medium"
                />
              </div>

              {/* Region Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'All', label: 'All Regions' },
                  { key: 'T1', label: 'Standard Global' },
                  { key: 'T2', label: 'Regional Parity' },
                  { key: 'T3', label: 'Emerging Markets' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTierFilter(key as 'All' | 'T1' | 'T2' | 'T3')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedTierFilter === key
                        ? 'bg-[#0047CC] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Table Container with Sticky Header */}
            <div className="overflow-x-auto max-h-[380px] custom-scrollbar rounded-xl border border-slate-100 w-full min-w-0">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 shadow-2xs">
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Mentee</th>
                    <th className="py-2.5 px-3">Pathway</th>
                    <th className="py-2.5 px-3">Country / Tier</th>
                    <th className="py-2.5 px-3 text-right">Listed</th>
                    <th className="py-2.5 px-3 text-right">PPP Rate</th>
                    <th className="py-2.5 px-3 text-right">Your 80%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Neutral Date Text */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                          {sess.isRecent ? (
                            <span className="font-semibold text-slate-900">Today</span>
                          ) : (
                            sess.date
                          )}
                        </td>

                        {/* Mentee with Title Tooltip for Long Names */}
                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap max-w-[150px] truncate" title={sess.mentee}>
                          {sess.mentee}
                        </td>

                        {/* Neutral Pathway Chip */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {sess.pathway}
                          </span>
                        </td>

                        {/* Neutral Country Chip */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {sess.country}
                          </span>
                        </td>

                        {/* Listed Rate: Dark slate, right-aligned, tabular */}
                        <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap tabular-nums lining-nums">
                          ${sess.listedRate.toLocaleString()}
                        </td>

                        {/* PPP Rate: Dark slate, right-aligned, tabular (Never colored) */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums lining-nums">
                          ${sess.pppRate.toLocaleString()}
                        </td>

                        {/* Your 80%: Dark slate, right-aligned, tabular (Never green or colored) */}
                        <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap tabular-nums lining-nums">
                          ${sess.mentorShare.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                        No sessions match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reconciled Table Footer */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} listed
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-900 tabular-nums">
                <span>
                  Gross: <strong className="font-bold text-slate-900">${totalGrossSessions.toLocaleString()}</strong>
                </span>
                <span>
                  Your 80%: <strong className="font-bold text-slate-900">${totalMentorShare.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ─── PPP Global Revenue Split Card: Rebalanced under Table ──── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-[#0047CC]">
                <GlobeIcon size={18} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  PPP Revenue Split
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  World Bank purchasing power parity distribution ($3,940 combined gross)
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Standard Global */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Standard Global</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    $2,400 <span className="text-slate-400 font-normal">(61%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: '61%' }} className="h-full bg-[#0047CC] rounded-full" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Switzerland, US, UK · 1 session ($1,200) + courses ($1,200)
                </p>
              </div>

              {/* Regional Parity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Regional Parity</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    $1,000 <span className="text-slate-400 font-normal">(25%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: '25%' }} className="h-full bg-[#387DFF] rounded-full" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  India, Brazil · 1 session ($500) + courses ($500)
                </p>
              </div>

              {/* Emerging Markets */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Emerging Markets / Equity</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    $540 <span className="text-slate-400 font-normal">(14%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: '14%' }} className="h-full bg-[#93C5FD] rounded-full" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Nigeria, Yemen, Ghana · 3 sessions ($370) + courses ($170)
                </p>
              </div>
            </div>

            {/* Reconciled PPP explanation */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-600 leading-relaxed font-medium">
              All tier rates are calibrated against World Bank purchasing power parity data. Mentors receive 80% of every transaction regardless of country tier.
            </div>
          </div>
        </div>

        {/* Right Column (5 cols lg, 5 xl): Per-Course Revenue + Recent Payouts */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6 w-full min-w-0">
          {/* Per-Course Revenue Breakdown (Unified Single Brand Blue) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-[#0047CC]">
                <CoursesIcon size={18} />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Per-Course Revenue
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  March gross: $1,870 across 3 active curricula
                </p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {COURSE_REVENUES.map((course, idx) => (
                <div key={course.id} className={idx > 0 ? 'pt-4' : ''}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Neutral Slate Icon Tile (No arbitrary colors) */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/60 mt-0.5">
                        <CoursesIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        {/* 2-Line Wrap with Tooltip */}
                        <p
                          className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug"
                          title={course.title}
                        >
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 font-medium">
                            {course.enrolledCount} enrolled
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {course.pathway}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 block tabular-nums">
                        ${course.monthRevenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium tabular-nums">
                        ${course.revenueAllTime.toLocaleString()} all-time
                      </span>
                    </div>
                  </div>

                  {/* Single Unified Brand Blue Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      style={{ width: `${course.sharePercent}%` }}
                      className="h-full rounded-full bg-[#0047CC]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PPP Note Callout: Dark Slate Text with Only Icon Blue */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-2.5">
              <span className="text-[#0047CC] shrink-0 mt-0.5">
                <InfoIcon size={16} />
              </span>
              <div>
                <strong className="font-semibold text-slate-900">PPP note:</strong> Course revenues reflect the blended purchasing power rate across all enrolled global learners. Each learner contributes their tier-adjusted tuition — maintaining equal educational access while compensating mentors fairly.
              </div>
            </div>
          </div>

          {/* Recent Payouts Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[#0047CC]">
                  <ClockIcon size={18} />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Recent Payouts
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-xs font-semibold text-[#0047CC] hover:underline cursor-pointer"
              >
                Full history
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 space-y-2">
              {PAYOUT_HISTORY.slice(0, 3).map((po, idx) => (
                <div key={po.id} className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-2.5' : ''}`}>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{po.periodLabel}</p>
                    <p className="text-xs text-slate-500 font-medium">{po.method}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block tabular-nums">
                      ${po.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tertiary / Outline CTA Button in Card (Not a duplicate solid primary) */}
            <Button
              variant="outline"
              size="sm"
              pill={false}
              onClick={() => navigate('/finances/withdraw')}
              className="w-full text-xs font-semibold py-2.5 shadow-2xs justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <DownloadIcon size={14} />
              Withdraw ${availableBalance.toLocaleString()} Now
            </Button>
          </div>

          {/* Quick Payout Guarantee Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 font-medium space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <CheckCircleIcon size={14} className="text-emerald-600" />
              <span>Next Scheduled Payout</span>
            </div>
            <p className="text-slate-500">
              Auto-monthly payout runs on <strong className="text-slate-700 font-semibold">31 March 2026</strong>. You can initiate instant withdrawals anytime to any verified method.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Payout History Modal ────────────────────────────────────── */}
      <ModalDialog
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Payout History"
        showCloseButton={true}
        maxWidth="max-w-xl"
        actions={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium">
              All-time paid out: <strong className="text-slate-900 font-bold tabular-nums">$38,560.00</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setIsHistoryModalOpen(false)}
              className="text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="overflow-x-auto max-h-[360px] custom-scrollbar rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {PAYOUT_HISTORY.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-800">{po.date}</td>
                    <td className="py-3 px-3 text-slate-500 font-medium">{po.method}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                      ${po.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ModalDialog>

      {/* ─── Withdraw Funds Modal ───────────────────────────────────── */}
      <ModalDialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Funds"
        showCloseButton={true}
        maxWidth="max-w-md"
        actions={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              disabled={isWithdrawing}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              disabled={
                isWithdrawing ||
                !withdrawAmountInput ||
                parseFloat(withdrawAmountInput) <= 0 ||
                parseFloat(withdrawAmountInput) > availableBalance
              }
              onClick={handleConfirmWithdrawal}
              className="text-xs font-semibold shadow-2xs"
            >
              {isWithdrawing
                ? 'Processing...'
                : `Confirm Withdrawal ($${Number(withdrawAmountInput || 0).toLocaleString()})`}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmWithdrawal} className="space-y-4 text-left">
          {/* Balance Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-[#0047CC] tracking-wider block">
                Available to Withdraw
              </span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums lining-nums">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
              Zero fee on withdrawal
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Withdrawal Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                min="1"
                max={availableBalance}
                value={withdrawAmountInput}
                onChange={(e) => setWithdrawAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#0047CC] shadow-2xs tabular-nums"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWithdrawAmountInput(String(Math.round(availableBalance * 0.25)))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setWithdrawAmountInput(String(Math.round(availableBalance * 0.5)))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setWithdrawAmountInput(String(availableBalance))}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0047CC] transition-colors cursor-pointer"
              >
                100% (Max)
              </button>
            </div>
          </div>

          {/* Destination Payout Method */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Select Payout Account
            </label>

            <div
              onClick={() => setSelectedPayoutMethod('flutterwave')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedPayoutMethod === 'flutterwave'
                  ? 'border-[#0047CC] bg-blue-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                  <BankIcon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Flutterwave · GTBank Nigeria</p>
                  <p className="text-xs text-slate-500 font-medium">Account •••• 4821 (NGN / USD)</p>
                </div>
              </div>
              {selectedPayoutMethod === 'flutterwave' && (
                <span className="text-[#0047CC]">
                  <CheckIcon size={14} />
                </span>
              )}
            </div>

            <div
              onClick={() => setSelectedPayoutMethod('paystack')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedPayoutMethod === 'paystack'
                  ? 'border-[#0047CC] bg-blue-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                  <CreditCardIcon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Paystack · Access Bank</p>
                  <p className="text-xs text-slate-500 font-medium">Account •••• 0074 (NGN)</p>
                </div>
              </div>
              {selectedPayoutMethod === 'paystack' && (
                <span className="text-[#0047CC]">
                  <CheckIcon size={14} />
                </span>
              )}
            </div>

            <div
              onClick={() => setSelectedPayoutMethod('wire')}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedPayoutMethod === 'wire'
                  ? 'border-[#0047CC] bg-blue-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                  <GlobeIcon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">International Wire / SWIFT</p>
                  <p className="text-xs text-slate-500 font-medium">Domiciliary USD Account</p>
                </div>
              </div>
              {selectedPayoutMethod === 'wire' && (
                <span className="text-[#0047CC]">
                  <CheckIcon size={14} />
                </span>
              )}
            </div>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};

export default MentorFinancesPage;
