import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  PlusIcon,
  PlayIcon,
  ChevronRightIcon,
  CalendarIcon,
  BookIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  UserIcon,
  ClockIcon,
  FileIcon,
  ChevronDownIcon,
  CheckIcon,
  DownloadIcon,
  InfoIcon,
  MoreVerticalIcon
} from '../common/Icons';

// --- Sub-components for Mentor Dashboard ---

const StatCard: React.FC<{ label: string; value: string; trend?: string; trendType?: 'up' | 'down' | 'neutral' | 'warn'; children?: React.ReactNode }> = ({ label, value, trend, trendType, children }) => (
  <div className="bg-white border border-gray-100 rounded-[18px] p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className={`text-[28px] font-extrabold text-gray-900 tracking-tight ${trendType === 'warn' ? 'text-amber-600' : ''}`}>{value}</p>
    </div>
    {trend && (
      <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-2 ${
        trendType === 'up' ? 'bg-green-50 text-green-600' : 
        trendType === 'warn' ? 'bg-amber-50 text-amber-600' : 
        'bg-gray-50 text-gray-500'
      }`}>
        {trend}
      </div>
    )}
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string; icon: React.ElementType; linkText?: string; onLinkClick?: () => void }> = ({ title, icon: Icon, linkText, onLinkClick }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
        <Icon size={14} />
      </div>
      <h3 className="text-[14px] font-extrabold text-gray-900 uppercase tracking-tight">{title}</h3>
    </div>
    {linkText && (
      <button 
        onClick={onLinkClick}
        className="text-[12px] font-bold text-[#0047CC] hover:underline flex items-center gap-1 group cursor-pointer"
      >
        {linkText}
        <ChevronRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isCiOpen, setIsCiOpen] = useState(false);

  // Mock data based on provided HTML
  const upcomingSessions = [
    { name: 'Chiamaka Obi', time: 'Today · 14:00 WAT', status: 'Live', type: 'Assessment Referred', tier: 'T3 · Nigeria', fee: '$150', date: '8', mon: 'MAR', isLive: true },
    { name: 'Dr. Emeka Nwosu', time: 'Wed · 10:00 CET', status: 'Confirmed', type: 'Direct', tier: 'T1 · Switzerland', fee: '$1,200', date: '11', mon: 'MAR' },
    { name: 'Fatima Al-Rashidi', time: 'Sat · 11:00 AST', status: 'Confirmed', type: 'Assessment Referred', tier: 'T3 · Yemen', fee: '$120', date: '14', mon: 'MAR' },
    { name: 'Kofi Mensah-Asante', time: 'Wed · TBC', status: 'Pending', type: 'VORA Matched', tier: 'T3 · Ghana', fee: '$150', date: '18', mon: 'MAR' }
  ];

  const activeCourses = [
    { title: 'Global Health Policy Masterclass', enrolled: 487, status: 'Published', rating: '4.9', revenue: '$19,480', gradient: 'from-[#18234B] to-[#387DFF]' },
    { title: 'Epidemiology in Crisis Response', enrolled: 312, status: 'Published', rating: '4.8', revenue: '$12,480', gradient: 'from-[#135813] to-[#2CA62C]' }
  ];

  const pendingRequests = [
    { name: 'Kofi Mensah-Asante', role: 'Health Systems Analyst · GHS Ghana', tags: ['VORA Matched', 'T3 · Ghana'], note: 'Failed Psychometric (41%) after passing SJT (68%). VORA matched him to you for executive reasoning coaching.', initial: 'KM', color: 'from-red-300 to-red-500' },
    { name: 'Taiwo Adeyemi', role: 'Programme Analyst · UNICEF Nigeria', tags: ['Assessment Referred', 'T3 · Nigeria'], note: 'Failed Psychometric ×3 and Video ×2 across WHO + UNICEF applications. Critical case.', initial: 'TA', color: 'from-amber-300 to-amber-500', isCritical: true }
  ];

  const recentActivity = [
    { text: 'James Okello rated your session ★★★★★ and left a review', time: '2 hours ago', icon: UserIcon, color: 'bg-green-50 text-green-600' },
    { text: '34 new enrollments in Epidemiology in Crisis Response', time: '5 hours ago', icon: BookIcon, color: 'bg-blue-50 text-blue-600' },
    { text: 'Taiwo Adeyemi sent a new mentorship request — critical priority', time: '8 hours ago', icon: InfoIcon, color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[28px] font-black text-gray-900 font-['Nunito_Sans'] tracking-tight">
            Good afternoon, Dr. Eric 👋
          </h1>
          <p className="text-[14px] font-bold text-gray-400">
            Tuesday, 10 March 2026 · You have 1 live session in 42 minutes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-full text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm cursor-pointer">
            <BookIcon size={14} /> Create Course
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0047CC] text-white rounded-full text-[13px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
            <PlusIcon size={14} /> Schedule Session
          </button>
        </div>
      </div>

      {/* Live Session Hero Strip */}
      <div className="bg-gradient-to-r from-[#064E3B] via-[#065F46] to-[#059669] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-green-900/10 transition-transform active:scale-[0.99]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute" />
          <div className="w-3.5 h-3.5 bg-green-400 rounded-full relative" />
        </div>

        <div className="flex-1 space-y-1 relative z-10 text-center md:text-left">
          <p className="text-[11px] font-bold text-green-100/70 uppercase tracking-widest">Next Session — Live in 42 minutes</p>
          <h2 className="text-[22px] font-extrabold text-white">Chiamaka Obi</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <span className="text-[13px] font-bold text-white/80">Today · 14:00 WAT · 60 min</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white uppercase">⚠ Assessment Referred</span>
              <span className="px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] font-bold text-amber-200 uppercase">T3 · Nigeria · $150</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#065F46] rounded-full text-[14px] font-black hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-black/10">
            <PlayIcon size={16} fill="currentColor" /> Join Session
          </button>
          <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-full text-[14px] font-bold hover:bg-white/20 transition-all cursor-pointer">
            View Brief
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="March Revenue" value="$3,940">
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0047CC] border border-blue-100 text-[9px] font-bold">T1 $2,400</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-[9px] font-bold">T2 $1,000</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold">T3 $540</span>
          </div>
        </StatCard>
        <StatCard label="Upcoming Sessions" value="5" trend="1 live today" trendType="neutral" />
        <StatCard label="Pending Requests" value="3" trend="Needs review" trendType="warn" />
        <StatCard label="Course Enrollments" value="1,284" trend="↑ 12% this month" trendType="up" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Upcoming Sessions List */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Upcoming Sessions" icon={CalendarIcon} linkText="View all" onLinkClick={() => {}} />
            
            <div className="space-y-2">
              {upcomingSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-5 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group border-b border-gray-50 last:border-0">
                  <div className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    session.isLive ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-500'
                  }`}>
                    <span className="text-[18px] font-black leading-none">{session.date}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{session.mon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 truncate">{session.name}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-[12px] font-bold text-gray-400">{session.time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        session.type === 'Assessment Referred' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        session.type === 'Direct' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      session.isLive ? 'bg-green-50 text-green-600 animate-pulse' : 'bg-blue-50 text-[#0047CC]'
                    }`}>
                      {session.isLive ? '● Live' : session.status}
                    </span>
                    <p className="text-[14px] font-black text-gray-900 mt-1">{session.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Courses */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Active Courses" icon={BookIcon} linkText="Manage" onLinkClick={() => {}} />
            
            <div className="grid grid-cols-1 gap-4">
              {activeCourses.map((course, i) => (
                <div key={i} className="flex items-center gap-5 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer border border-gray-100 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10`}>
                    <PlayIcon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-black text-gray-900 truncate">{course.title}</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-[12px] font-bold text-gray-400">{course.enrolled} enrolled</span>
                      <span className="text-[11px] font-bold text-green-600">Published</span>
                      <span className="text-[11px] font-black text-amber-500">★ {course.rating}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[16px] font-black text-gray-900">{course.revenue}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">All-time</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <div className="bg-amber-400 p-1.5 rounded-lg text-white">
                <InfoIcon size={14} />
              </div>
              <p className="text-[12px] font-bold text-amber-800">
                2 drafts waiting to be published — <span className="underline cursor-pointer">review now</span>
              </p>
            </div>
          </div>

          {/* Earnings Snapshot */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Earnings Snapshot" icon={TrendingUpIcon} linkText="Full report" onLinkClick={() => {}} />
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[36px] font-black text-gray-900 leading-tight">$3,940</p>
                <p className="text-[13px] font-bold text-gray-400 mt-1">March 2026 · 10 days in</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending payout</p>
                <p className="text-[24px] font-black text-green-600">$3,152</p>
                <p className="text-[10px] font-bold text-gray-400">after 20% platform fee</p>
              </div>
            </div>

            {/* Simple Bar Chart Mockup */}
            <div className="flex items-end gap-3 h-20 mb-8 px-2">
              {[40, 65, 30, 85, 70, 100, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-1000 ${i === 5 ? 'bg-[#0047CC]' : 'bg-blue-100'}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-black text-gray-300 uppercase">{i === 6 ? 'TOD' : `${i + 5} MAR`}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <button className="px-6 py-3 border border-gray-100 rounded-full text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                View Breakdown
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#0047CC] text-white rounded-full text-[14px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20 cursor-pointer">
                <DownloadIcon size={14} /> Withdraw $3,152
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Pending Requests */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Pending Requests" icon={BriefcaseIcon} linkText="See all" onLinkClick={() => {}} />
            
            <div className="space-y-5">
              {pendingRequests.map((req, i) => (
                <div key={i} className={`p-6 rounded-[20px] border transition-all ${req.isCritical ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${req.color} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}>
                      {req.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-gray-900 truncate">{req.name}</p>
                      <p className="text-[11px] font-bold text-gray-400 truncate mt-0.5">{req.role}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.tags.map((tag, j) => (
                          <span key={j} className="px-2 py-0.5 bg-white/80 border border-gray-100 rounded-full text-[9px] font-black text-gray-500 uppercase">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl text-[12px] font-medium leading-relaxed mb-5 border ${
                    req.isCritical ? 'bg-white/80 text-amber-900 border-amber-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {req.note}
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex-1 py-2.5 bg-[#0047CC] text-white rounded-full text-[12px] font-black hover:bg-[#003d99] transition-all cursor-pointer">
                      ✓ Accept
                    </button>
                    <button className="flex-1 py-2.5 bg-white border border-gray-100 text-gray-500 rounded-full text-[12px] font-bold hover:bg-gray-50 transition-all cursor-pointer">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Gap Intelligence Dropdown */}
          <div className={`rounded-[24px] overflow-hidden transition-all duration-500 relative ${isCiOpen ? 'bg-gradient-to-br from-[#18234B] via-[#1a3a8c] to-[#0047CC] shadow-2xl' : 'bg-gradient-to-br from-[#18234B] to-[#0047CC] shadow-lg'}`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div 
              className="p-8 cursor-pointer flex items-center gap-5 relative z-10 select-none"
              onClick={() => setIsCiOpen(!isCiOpen)}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ClockIcon size={20} className="text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Gap Intelligence &bull; Live</p>
                <h3 className="text-[16px] font-black text-white leading-tight mt-0.5">7 critical gaps identified</h3>
                {!isCiOpen && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[9px] font-bold text-white/80">89 failures</span>
                    <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[9px] font-bold text-white/80">114 psych gaps</span>
                  </div>
                )}
              </div>
              <div className={`w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center transition-transform duration-500 ${isCiOpen ? 'rotate-180 bg-white/20' : ''}`}>
                <ChevronDownIcon size={14} className="text-white" />
              </div>
            </div>

            {isCiOpen && (
              <div className="px-8 pb-8 space-y-6 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="h-px bg-white/10" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[20px] font-black text-red-400">7</p>
                    <p className="text-[9px] font-black text-white/40 uppercase mt-1">Critical Gaps</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[20px] font-black text-white">1,847</p>
                    <p className="text-[9px] font-black text-white/40 uppercase mt-1">Analysed</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full py-3.5 bg-white text-[#18234B] rounded-full text-[13px] font-black hover:scale-[1.02] transition-transform cursor-pointer">
                    Explore Gap Intelligence
                  </button>
                  <button className="w-full py-3.5 bg-white/10 border border-white/20 text-white rounded-full text-[13px] font-black hover:bg-white/20 transition-all cursor-pointer">
                    + Create Course
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Recent Activity" icon={ClockIcon} linkText="All" onLinkClick={() => {}} />
            <div className="space-y-6">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center shrink-0 border border-current opacity-20`} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 absolute pointer-events-none">
                    <act.icon size={16} className={act.color.split(' ')[1]} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: act.text.replace(/<strong>(.*?)<\/strong>/g, '<span class="font-black text-gray-900">$1</span>') }} />
                    <p className="text-[10px] font-black text-gray-400 uppercase mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm">
            <SectionHeader title="Quick Actions" icon={MoreVerticalIcon} />
            <div className="grid grid-cols-2 gap-3">
              <button className="p-5 bg-white border border-gray-100 rounded-[20px] flex flex-col items-center gap-3 hover:border-[#0047CC] hover:bg-blue-50 transition-all group cursor-pointer shadow-sm">
                <div className="p-3 bg-blue-50 rounded-xl text-[#0047CC] group-hover:scale-110 transition-transform">
                  <CalendarIcon size={20} />
                </div>
                <span className="text-[12px] font-black text-gray-900">Schedule</span>
              </button>
              <button className="p-5 bg-white border border-gray-100 rounded-[20px] flex flex-col items-center gap-3 hover:border-green-600 hover:bg-green-50 transition-all group cursor-pointer shadow-sm">
                <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                  <PlusIcon size={20} />
                </div>
                <span className="text-[12px] font-black text-gray-900">Course</span>
              </button>
              <button className="p-5 bg-white border border-gray-100 rounded-[20px] flex flex-col items-center gap-3 hover:border-emerald-600 hover:bg-emerald-50 transition-all group cursor-pointer shadow-sm">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <TrendingUpIcon size={20} />
                </div>
                <span className="text-[12px] font-black text-gray-900">Withdraw</span>
              </button>
              <button className="p-5 bg-white border border-gray-100 rounded-[20px] flex flex-col items-center gap-3 hover:border-amber-600 hover:bg-amber-50 transition-all group cursor-pointer shadow-sm">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                  <UserIcon size={20} />
                </div>
                <span className="text-[12px] font-black text-gray-900">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
