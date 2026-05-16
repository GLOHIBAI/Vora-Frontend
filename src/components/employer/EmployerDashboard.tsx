import React from 'react';
import {
  UserIcon,
  BellIcon,
  PlusIcon,
  BriefcaseIcon,
  UsersIcon,
  CreditCardIcon,
  AlertTriangleIcon,
  CheckIcon,
  TrendingUpIcon,
  ClockIcon,
  ChevronRightIcon,
  WalletIcon
} from '../common/Icons';
import PostJobWizard from './PostJobWizard';
import Tag from '../common/Tag';

// --- Sub-components for Employer Dashboard ---

const KPICard: React.FC<{ label: string; value: string; delta: string; deltaType: 'up' | 'warn'; icon: React.ElementType; bgColor: string; iconColor: string; onClick?: () => void }> = ({ label, value, delta, deltaType, icon: Icon, bgColor, iconColor, onClick }) => (
  <div 
    className={`bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group`}
    onClick={onClick}
  >
    <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={18} className={iconColor} />
    </div>
    <p className={`text-[24px] lg:text-[30px] font-black text-gray-900 leading-none mb-1`}>{value}</p>
    <p className="text-[13px] font-bold text-gray-500">{label}</p>
    <p className={`text-[11px] font-black mt-2 ${deltaType === 'up' ? 'text-green-600' : 'text-gray-400'}`}>
      {deltaType === 'up' ? '↑' : '↓'} {delta}
    </p>
  </div>
);

const QuickActionBtn: React.FC<{ label: string; sub: string; icon: React.ElementType; bgColor: string; iconColor: string; onClick?: () => void }> = ({ label, sub, icon: Icon, bgColor, iconColor, onClick }) => (
  <button 
    className="bg-white border border-gray-100 rounded-[14px] p-4 flex items-center gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all group text-left cursor-pointer"
    onClick={onClick}
  >
    <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-black text-gray-900 truncate">{label}</p>
      <p className="text-[11px] font-bold text-gray-400 truncate mt-0.5">{sub}</p>
    </div>
  </button>
);

const SectionHeader: React.FC<{ title: string; linkText?: string; onLinkClick?: () => void }> = ({ title, linkText, onLinkClick }) => (
  <div className="flex items-center justify-between mb-5 px-1">
    <h3 className="text-[16px] font-black text-gray-900 tracking-tight">{title}</h3>
    {linkText && (
      <button 
        onClick={onLinkClick}
        className="text-[13px] font-bold text-[#0047CC] hover:underline flex items-center gap-1 group cursor-pointer bg-transparent border-none"
      >
        {linkText}
        <ChevronRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

const EmployerDashboard: React.FC = () => {
  const [isPostJobOpen, setIsPostJobOpen] = React.useState(false);

  // Mock data based on provided HTML
  const activeJobs = [
    { title: 'Global Health Policy Analyst Intern – Malaria Program', id: 'JOB-001', loc: 'Addis Ababa', date: 'Jan 8', applicants: 42, status: 'Live', variant: 'green' },
    { title: 'Senior Epidemiologist – TB Response Unit', id: 'JOB-002', loc: 'Nairobi', date: 'Jan 12', applicants: 18, status: 'Alignment', variant: 'blue' },
    { title: 'Community Health Nurse – Kano State Programme', id: 'JOB-003', loc: 'Kano', date: 'Jan 15', applicants: 31, status: 'Live', variant: 'green' },
    { title: 'M&E Officer – Nutrition Programme', id: 'JOB-004', loc: 'Accra', date: 'Jan 18', applicants: 27, status: 'Live', variant: 'green' },
    { title: 'Research Fellow – One Health Initiative', id: 'JOB-005', loc: 'Remote', date: 'Draft', applicants: 0, status: 'Draft', variant: 'yellow' }
  ];

  const recentActivity = [
    { title: 'True-up #TU-2025-0008 awaiting payment', sub: '$750.00 due · Dr. Kofi Mensah hire confirmed', time: '2h ago', icon: AlertTriangleIcon, iconBg: 'bg-blue-50', iconColor: 'text-[#0047CC]' },
    { title: 'Dr. Yusuf Ibrahim — Hire confirmed', sub: 'Public Health Advisor · $150 alignment fee refunded', time: 'Yesterday', icon: CheckIcon, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { title: 'Alignment session scheduled — Priya Sharma', sub: 'Senior Epidemiologist · Session #ALN-2025-0014', time: 'Yesterday', icon: BellIcon, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { title: 'New job posted — Senior Epidemiologist', sub: 'JOB-002 · TB Response Unit · 18 applicants', time: 'Jan 12', icon: BriefcaseIcon, iconBg: 'bg-blue-50', iconColor: 'text-[#0047CC]' }
  ];

  const alignmentSessions = [
    { name: 'Priya Sharma', role: 'Senior Epidemiologist', id: '#ALN-2025-0014', status: 'Scheduled – Jan 22', variant: 'blue', initial: 'PS', initialBg: 'bg-blue-500' },
    { name: 'Dr. Amara Osei', role: 'Public Health Advisor', id: '#ALN-2025-0015', status: 'Awaiting confirmation', variant: 'gray', initial: 'AO', initialBg: 'bg-purple-500' },
    { name: 'Dr. Kofi Mensah', role: 'Field Epidemiologist', id: '#ALN-2025-0013', status: 'Completed', variant: 'green', initial: 'KM', initialBg: 'bg-blue-500' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[20px] lg:text-[26px] font-black text-[#0047CC] font-['Nunito_Sans'] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[12px] lg:text-[14px] font-bold text-gray-400">
            Tuesday, 10 March 2026 · Welcome back, Eric
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <button className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-white border border-gray-100 rounded-full text-[11px] lg:text-[13px] font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm cursor-pointer">
            <BellIcon size={14} /> Alerts <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">3</span>
          </button>
          <button 
            onClick={() => setIsPostJobOpen(true)}
            className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-[#0047CC] text-white rounded-full text-[11px] lg:text-[13px] font-black hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <PlusIcon size={14} /> Post a Job
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[14px] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="p-2 bg-white rounded-full">
          <AlertTriangleIcon size={18} className="text-[#DC2626]" />
        </div>
        <p className="text-[13px] font-bold text-[#991B1B] flex-1">
          <strong>Post-hire check-in overdue:</strong> Amaka Okonkwo's 30-day check-in (Malaria Program Intern) was due Feb 15. Completing this keeps your candidate pipeline access active.
        </p>
        <button className="px-5 py-2 bg-[#DC2626] text-white text-[12px] font-black rounded-full hover:bg-[#b91c1c] transition-all whitespace-nowrap cursor-pointer">
          Complete Check-in
        </button>
      </div>

      {/* Main Masonry Grid */}
      <div className="columns-1 lg:columns-2 xl:columns-2 gap-6 space-y-6">
        {/* KPI Grid - Full Width equivalent in masonry */}
        <div className="break-inside-avoid space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KPICard 
              label="Active Jobs" value="12" delta="3 this month" deltaType="up" 
              icon={BriefcaseIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" 
            />
            <KPICard 
              label="Total Applicants" value="247" delta="34 new this week" deltaType="up" 
              icon={UsersIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" 
            />
            <KPICard 
              label="Alignment Sessions" value="5" delta="2 awaiting confirmation" deltaType="warn" 
              icon={ClockIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" 
            />
            <KPICard 
              label="Wallet Balance" value="$3,240" delta="$750 true-up due" deltaType="warn" 
              icon={WalletIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickActionBtn label="Post a Job" sub="Create a new listing" icon={PlusIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" onClick={() => setIsPostJobOpen(true)} />
            <QuickActionBtn label="Confirm Hire" sub="Send offer & lock escrow" icon={CheckIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" />
            <QuickActionBtn label="Bulk Hire" sub="Confirm multiple hires" icon={UsersIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" />
            <QuickActionBtn label="Top Up Wallet" sub="Add funds for escrow" icon={TrendingUpIcon} bgColor="bg-blue-50" iconColor="text-[#0047CC]" />
          </div>

          {/* Active Jobs Card */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-gray-900">Active Jobs</h3>
              <button className="text-[13px] font-bold text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer">
                View all <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {activeJobs.map((job, i) => (
                <div key={i} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate group-hover:text-[#0047CC] transition-colors">{job.title}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{job.id} · {job.loc} · Posted {job.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-black text-gray-700">{job.applicants} applicants</p>
                    <Tag label={job.status} variant={job.variant as any} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alignment Sessions */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-gray-900">Alignment Sessions</h3>
              <button className="text-[13px] font-bold text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer">
                Full View <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {alignmentSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-full ${session.initialBg} text-white flex items-center justify-center font-black text-[12px] shrink-0`}>
                    {session.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 truncate group-hover:text-[#0047CC] transition-colors">{session.name}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{session.role} · {session.id}</p>
                  </div>
                  <Tag label={session.status} variant={session.variant as any} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 Items */}
        <div className="break-inside-avoid space-y-6">
          {/* Post-Hire Tracking Widget */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-black text-gray-900">Post-Hire Check-ins</h3>
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">1 overdue</span>
              </div>
              <button className="text-[12px] font-bold text-[#0047CC] hover:underline bg-transparent border-none cursor-pointer">View all</button>
            </div>

            <div className="space-y-3">
              {/* Overdue */}
              <div className="p-4 rounded-[14px] bg-[#FEF2F2] border border-[#FECACA]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">AO</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-gray-900 truncate">Amaka Okonkwo</p>
                    <p className="text-[10px] font-bold text-gray-500 truncate">30-day check-in overdue</p>
                  </div>
                  <span className="text-[9px] font-black text-red-600 uppercase">Overdue</span>
                </div>
                <button className="w-full py-2 bg-red-600 text-white text-[12px] font-black rounded-lg hover:bg-red-700 transition-all cursor-pointer">
                  Complete 30-Day Check-in
                </button>
              </div>

              {/* Pending */}
              <div className="p-4 rounded-[14px] bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#0047CC] text-white flex items-center justify-center text-[11px] font-black shrink-0">FC</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-gray-900 truncate">Fatou Camara</p>
                    <p className="text-[10px] font-bold text-gray-500 truncate">Benchmarks not yet set</p>
                  </div>
                  <span className="text-[9px] font-black text-[#0047CC] uppercase">3 days left</span>
                </div>
                <button className="w-full py-2 bg-[#0047CC] text-white text-[12px] font-black rounded-lg hover:bg-[#003d99] transition-all cursor-pointer">
                  Set Benchmarks
                </button>
              </div>

              {/* On track */}
              <div className="p-4 rounded-[14px] bg-white border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-[11px] font-black shrink-0">KO</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-gray-900 truncate">Kwame Osei</p>
                  <p className="text-[10px] font-bold text-gray-500 truncate">60-day due Mar 19</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-100 rounded-full shrink-0">
                  <span className="text-[9px] font-black text-green-700 uppercase">On track</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-[#0047CC] to-[#387DFF] rounded-[18px] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-2">Available Balance</p>
            <p className="text-[36px] font-black tracking-tight leading-none mb-1">$3,240.00</p>
            <p className="text-[11px] font-bold text-white/60 mb-6">VORA Employer Wallet · Eric Nelson</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-white text-[#0047CC] rounded-full text-[13px] font-black hover:scale-[1.03] transition-transform cursor-pointer">
                Top Up
              </button>
              <button className="flex-1 py-2.5 bg-white/15 border border-white/30 text-white rounded-full text-[13px] font-black hover:bg-white/25 transition-all cursor-pointer">
                History
              </button>
            </div>
          </div>

          {/* Escrow Breakdown */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <h3 className="text-[14px] font-black text-gray-900 mb-5">Escrow Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-gray-500">In escrow (locked)</span>
                <span className="font-black text-gray-900">$2,550.00</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-gray-500">Alignment fees pending</span>
                <span className="font-black text-[#0047CC]">$300.00</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-bold text-gray-500">True-up owed</span>
                <span className="font-black text-gray-400">$750.00</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[14px] font-black text-gray-900">Total committed</span>
                <span className="text-[16px] font-black text-[#0047CC]">$3,600.00</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-gray-100 text-gray-700 text-[13px] font-black rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
              View Payment Overview
            </button>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white border border-gray-100 rounded-[18px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-gray-900">Recent Activity</h3>
              <button className="text-[13px] font-bold text-[#0047CC] flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer">
                All transactions <ChevronRightIcon size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex gap-4 p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className={`w-9 h-9 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0`}>
                    <act.icon size={16} className={act.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-900 leading-tight truncate">{act.title}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-1">{act.sub}</p>
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account & Settings Tiles */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm">
            <SectionHeader title="Account & Settings" linkText="Manage" onLinkClick={() => {}} />
            <div className="columns-2 gap-2 space-y-2">
              {[
                { label: 'Profile', sub: 'Eric · Admin', icon: UserIcon },
                { label: 'Team', sub: '3 members', icon: UsersIcon },
                { label: 'Billing', sub: 'Enterprise', icon: TrendingUpIcon },
                { label: 'Payments', sub: '4 saved', icon: CreditCardIcon },
                { label: 'Alerts', sub: 'In-app', icon: BellIcon },
                { label: 'Post Job', sub: 'New listing', icon: PlusIcon }
              ].map((tile, i) => (
                <div key={i} className="break-inside-avoid p-4 bg-gray-50/50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all cursor-pointer group">
                  <tile.icon size={16} className="text-[#0047CC] mb-3" />
                  <p className="text-[12px] font-black text-gray-900 leading-tight">{tile.label}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">{tile.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PostJobWizard isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} />
    </div>
  );
};

export default EmployerDashboard;
