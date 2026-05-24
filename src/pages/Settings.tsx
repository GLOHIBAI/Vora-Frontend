import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Tag from '../components/common/Tag';
import ModalDialog from '../components/common/ModalDialog';
import { PageTitle, SectionHeading, Subheading } from '../components/common/Typography';
import SettingsTabBar from '../components/settings/SettingsTabBar';
import SettingsSectionHeader from '../components/settings/SettingsSectionHeader';
import SettingsRow from '../components/settings/SettingsRow';
import { 
  TrashIcon, 
  PlusIcon, 
  InfoIcon, 
  VideoIcon
} from '../components/common/Icons';
import {
  COUNTRY_OPTIONS,
  TIMEZONE_OPTIONS,
  START_TIMES,
  DURATION_OPTIONS,
  MULTIPLIERS,
  TIER_INFO
} from '../constants/settings';
import { useAuth } from '../context/AuthContext';
import type { TabType, Slot, DayAvailability } from '../types';

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const profileInitials =
    `${user?.firstName?.[0] ?? 'A'}${user?.lastName?.[0] ?? 'O'}`.toUpperCase();
  const accountEmail = user?.email ?? 'adaeze.okonkwo@who.int';
  const role = user?.role?.toLowerCase() || 'mentor';

  const availableTabs: TabType[] = (() => {
    if (role === 'employer' || role === 'talent') {
      return ['profile', 'notification', 'account'];
    }
    return ['profile', 'availability', 'courses', 'mentorship', 'notification', 'account'];
  })();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab('profile');
    }
  }, [role, activeTab]);

  // --- Profile Tab State ---
  const [profile, setProfile] = useState({
    firstName: 'Adaeze',
    lastName: 'Okonkwo',
    title: 'Director of Health Systems Strengthening · WHO Geneva',
    bio: '22 years building health systems across WHO, World Bank and government. Former Deputy Health Minister of Nigeria. I help candidates close the gap between talent and opportunity in global health.'
  });
  const [expertise, setExpertise] = useState([
    'Health Systems Strengthening',
    'Global Health Policy',
    'WHO Navigation',
    'Psychometric Coaching'
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // --- Availability & Pricing Tab State ---
  const [primaryMarket, setPrimaryMarket] = useState('t3_ng');
  const [timezone, setTimezone] = useState('WAT');
  const [bufferActive, setBufferActive] = useState(true);
  const [bookingNotice, setBookingNotice] = useState('24 hours');
  const [maxSessionsPerWeek, setMaxSessionsPerWeek] = useState(10);
  const [blockManualDates, setBlockManualDates] = useState(true);
  
  const [days, setDays] = useState<Record<string, DayAvailability>>({
    mon: { 
      active: true, 
      open: true, 
      slots: [
        { id: 1, startTime: '09:00', duration: '60', rate: 150 },
        { id: 2, startTime: '14:00', duration: '30', rate: 80 }
      ] 
    },
    tue: { active: true, open: false, slots: [{ id: 3, startTime: '10:00', duration: '90', rate: 220 }] },
    wed: { active: false, open: false, slots: [] },
    thu: { active: true, open: false, slots: [{ id: 4, startTime: '11:00', duration: '60', rate: 150 }] },
    fri: { active: true, open: false, slots: [{ id: 5, startTime: '09:00', duration: '60', rate: 150 }, { id: 6, startTime: '16:00', duration: '60', rate: 150 }] },
    sat: { active: false, open: false, slots: [] },
    sun: { active: false, open: false, slots: [] },
  });

  // --- Courses Tab State ---
  const [courses, setCourses] = useState([
    { id: 1, title: 'Health Systems Strengthening for LMIC Contexts', chapters: 8, hours: 6, enrolled: 847, published: true },
    { id: 2, title: 'WHO Competency Framework: The Complete Playbook', chapters: 12, hours: 9, enrolled: 1203, published: true },
    { id: 3, title: 'Psychometric & SJT Mastery for Global Health', chapters: 5, hours: 4, enrolled: 0, published: false }
  ]);
  const [courseSettings, setCourseSettings] = useState({
    lifetimeAccess: true,
    showEnrolledCount: true,
    allowReviews: true,
    issueCertificates: true
  });

  // --- Mentorship Tab State ---
  const [mentorshipStatus, setMentorshipStatus] = useState<'accepting' | 'paused'>('accepting');
  const [mentorshipTypes, setMentorshipTypes] = useState(['1-on-1 session', 'Short-term guidance']);
  const [careerLevels, setCareerLevels] = useState(['Students', 'Early career']);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [geoReach, setGeoReach] = useState<'global' | 'regional'>('global');
  const [maxActiveMentees, setMaxActiveMentees] = useState(20);
  const [matchingEnabled, setMatchingEnabled] = useState(true);

  // --- Notifications Tab State ---
  const [emailNotifs, setEmailNotifs] = useState({
    newRequests: true,
    bookings: true,
    coursePurchases: true,
    earnings: true,
    pppUpdates: true,
    announcements: false
  });
  const [inAppNotifs, setInAppNotifs] = useState({
    showDashboard: true
  });
  const [notificationFrequency, setNotificationFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  // --- Account Tab State ---
  const [consentAiMatching, setConsentAiMatching] = useState(true);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ current: '', new: '', confirm: '' });

  // --- Helper Helpers ---
  const activeMarketTier = primaryMarket.split('_')[0] as 't1' | 't2' | 't3';
  const marketInfo = TIER_INFO[activeMarketTier];

  const calculatePPP = (localRate: number) => {
    const m = MULTIPLIERS[activeMarketTier];
    return {
      t1: Math.round(localRate * m.t1),
      t2: Math.round(localRate * m.t2),
      t3: Math.round(localRate * m.t3)
    };
  };

  // Compute stats for projection
  // Find first active 60-min rate or first slot rate
  const getBaseRateForProjection = () => {
    for (const day of Object.values(days)) {
      if (day.active) {
        const hourSlot = day.slots.find(s => s.duration === '60');
        if (hourSlot) return hourSlot.rate;
        if (day.slots.length > 0) return day.slots[0].rate;
      }
    }
    return 150; // Fallback
  };

  const baseProjRate = getBaseRateForProjection();
  const projPPP = calculatePPP(baseProjRate);
  const projectedGross = (8 * projPPP.t1) + (6 * projPPP.t2) + (6 * projPPP.t3);
  const projectedNet = Math.round(projectedGross * 0.8);
  const localOnlyProj = 20 * projPPP.t3;
  const vsLocalRatio = localOnlyProj > 0 ? Math.round((projectedGross / localOnlyProj) * 100) : 100;

  // --- Functions ---
  const handleSave = (tab: string) => {
    toast.success(`${tab} settings saved successfully`);
  };

  const handleAddExpertise = () => {
    if (newTagInput.trim() && !expertise.includes(newTagInput.trim())) {
      setExpertise([...expertise, newTagInput.trim()]);
      setNewTagInput('');
      setShowTagInput(false);
      toast.success('Expertise added');
    }
  };

  const handleRemoveExpertise = (tag: string) => {
    setExpertise(expertise.filter(t => t !== tag));
    toast.success('Expertise removed');
  };

  const toggleDayOpen = (dayKey: string) => {
    setDays(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], open: !prev[dayKey].open }
    }));
  };

  const toggleDayActive = (dayKey: string) => {
    setDays(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], active: !prev[dayKey].active }
    }));
  };

  const addSlot = (dayKey: string) => {
    setDays(prev => {
      const day = prev[dayKey];
      const newId = day.slots.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      const newSlots = [...day.slots, { id: newId, startTime: '09:00', duration: '60', rate: 150 }];
      return {
        ...prev,
        [dayKey]: { ...day, slots: newSlots, open: true }
      };
    });
    toast.success('Time slot added');
  };

  const removeSlot = (dayKey: string, slotId: number) => {
    setDays(prev => {
      const day = prev[dayKey];
      const newSlots = day.slots.filter(s => s.id !== slotId);
      return {
        ...prev,
        [dayKey]: { ...day, slots: newSlots }
      };
    });
    toast.success('Time slot removed');
  };

  const updateSlotField = (dayKey: string, slotId: number, field: keyof Slot, value: any) => {
    setDays(prev => {
      const day = prev[dayKey];
      const newSlots = day.slots.map(s => {
        if (s.id === slotId) {
          return { ...s, [field]: value };
        }
        return s;
      });
      return {
        ...prev,
        [dayKey]: { ...day, slots: newSlots }
      };
    });
  };

  const handleAddMentorshipType = () => {
    if (newTypeInput.trim() && !mentorshipTypes.includes(newTypeInput.trim())) {
      setMentorshipTypes([...mentorshipTypes, newTypeInput.trim()]);
      setNewTypeInput('');
      setShowTypeInput(false);
      toast.success('Mentorship type added');
    }
  };

  const handleRemoveMentorshipType = (type: string) => {
    setMentorshipTypes(mentorshipTypes.filter(t => t !== type));
    toast.success('Mentorship type removed');
  };

  const toggleCareerLevel = (level: string) => {
    if (careerLevels.includes(level)) {
      setCareerLevels(careerLevels.filter(l => l !== level));
    } else {
      setCareerLevels([...careerLevels, level]);
    }
  };

  const handleCoursePublishToggle = (courseId: number) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const newStatus = !c.published;
        toast.success(`Course set to ${newStatus ? 'Published' : 'Draft'}`);
        return { ...c, published: newStatus };
      }
      return c;
    }));
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
      toast.error('All fields are required');
      return;
    }
    if (passwordFields.new !== passwordFields.confirm) {
      toast.error('Confirm password does not match new password');
      return;
    }
    toast.success('Password changed successfully');
    setPwModalOpen(false);
    setPasswordFields({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-[860px] mx-auto py-9 px-4 md:px-0 pb-20">
      <PageTitle className="text-[28px] font-bold tracking-[-0.5px] mb-7">Settings</PageTitle>

      <SettingsTabBar tabs={availableTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ══════════════ 1. PROFILE TAB ══════════════ */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-200">
          <SettingsSectionHeader
            title="Profile"
            description="How you appear to mentees and on your public page."
            onSave={() => handleSave('Profile')}
          />

          <div>
            <SettingsRow label="Photo & Name">
                <div className="flex items-center gap-4 mb-4">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="w-[60px] h-[60px] rounded-full object-cover border-2 border-[#0047CC]/10" 
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] rounded-full bg-[#BEE96B] text-[#283979] text-lg font-bold flex items-center justify-center border-2 border-[#0047CC]/10">
                      {profileInitials}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfilePic(reader.result as string);
                          toast.success('Profile photo updated successfully');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth={false} 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    Change photo
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                  <Input
                    label="Last name"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
            </SettingsRow>

            <SettingsRow label="Title & Bio">
              <div className="space-y-4">
                <Input
                  label="Professional title"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                />
                <Textarea
                  label="Bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </SettingsRow>

            <SettingsRow label="Expertise">
                <div className="flex flex-wrap gap-2 mb-3">
                  {expertise.map((tag) => (
                    <Tag
                      key={tag}
                      label={tag}
                      variant="blue"
                      className="border border-[#BDD9FF] text-[12px]"
                      onRemove={() => handleRemoveExpertise(tag)}
                    />
                  ))}
                </div>
                {showTagInput ? (
                  <div className="flex items-center gap-2 max-w-xs mt-2">
                    <Input
                      label=""
                      placeholder="e.g. Health Economics"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                    />
                    <Button variant="primary" size="sm" fullWidth={false} onClick={handleAddExpertise}>
                      Add
                    </Button>
                    <Button variant="outline" size="sm" fullWidth={false} onClick={() => setShowTagInput(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center gap-1.5 text-[#0047CC] text-sm font-bold hover:underline focus:outline-none mt-2 cursor-pointer"
                  >
                    <PlusIcon size={12} />
                    Add expertise
                  </button>
                )}
            </SettingsRow>
          </div>
        </div>
      )}

      {/* ══════════════ 2. AVAILABILITY & PRICING TAB ══════════════ */}
      {activeTab === 'availability' && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Availability & Pricing</SectionHeading>
              <p className="text-xs text-gray-500">
                Set exactly when you're available, how long each slot is, and what it costs — PPP-adjusted automatically worldwide.
              </p>
            </div>
            <Button variant="primary" fullWidth={false} onClick={() => handleSave('Availability & Pricing')}>
              Save all changes
            </Button>
          </div>

          {/* STEP 1: Primary Operating Market */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <Subheading>Your Primary Operating Market</Subheading>
                <p className="text-xs text-gray-500">
                  This tells VORA where your economic reality lives — it anchors the entire global pricing engine.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Country of practice"
                value={primaryMarket}
                onChange={(e) => setPrimaryMarket(e.target.value)}
                options={COUNTRY_OPTIONS}
              />
              <Select
                label="Your timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={TIMEZONE_OPTIONS}
              />
            </div>

            {/* Market tier banner — auto-updates */}
            <div className={`flex items-start gap-2.5 p-3 rounded-lg text-xs font-bold border ${marketInfo.cls} mb-3`}>
              <InfoIcon className="shrink-0 mt-0.5" size={14} />
              <span>{marketInfo.msg}</span>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed p-2.5 bg-gray-50 rounded-lg">
              <strong className="text-gray-900">Why this matters:</strong> A mentor in Lagos charging ₦150,000 locally gets ~$1,100 from a US mentee and ~$450 from a Brazilian mentee — all automatically. A mentor in Switzerland charging CHF 900 gets ~$140 from a Nigerian mentee. VORA handles the maths so you set one rate and reach the world.
            </div>
          </div>

          {/* STEP 2: Weekly Availability & Session Pricing */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <Subheading>Weekly Availability & Session Pricing</Subheading>
                  <p className="text-xs text-gray-500">
                    For each day, add time slots with their duration and your local rate. PPP pricing auto-calculates below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={bufferActive} 
                    onChange={(e) => setBufferActive(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                </label>
                30-min buffer between slots
              </div>
            </div>

            {/* Days block */}
            <div className="space-y-3">
              {(Object.keys(days) as Array<keyof typeof days>).map((dayKey) => {
                const day = days[dayKey];
                const dayName = DAY_NAMES[dayKey] ?? dayKey;
                
                return (
                  <div key={dayKey} className="border-[1.5px] border-gray-200 rounded-xl overflow-hidden" style={{ opacity: day.active ? 1 : 0.4 }}>
                    {/* Header */}
                    <div 
                      onClick={() => toggleDayOpen(dayKey)}
                      className="flex items-center justify-between gap-4 p-3 bg-white hover:bg-gray-50 cursor-pointer select-none transition-colors"
                    >
                      <div className="text-sm font-semibold text-gray-900 w-20">{dayName}</div>
                      <div className="text-xs text-gray-500 flex-1">
                        {day.active 
                          ? `${day.slots.length} slot${day.slots.length !== 1 ? 's' : ''} · ${day.slots.map(s => s.startTime).join(', ') || 'None set'}`
                          : 'Unavailable'
                        }
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={day.active} 
                            onChange={() => toggleDayActive(dayKey)} 
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Body */}
                    {day.open && day.active && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        {day.slots.length === 0 ? (
                          <div className="text-xs text-gray-500 mb-3">No slots added yet.</div>
                        ) : (
                          <div className="space-y-4">
                            {day.slots.map((slot, slotIndex) => {
                              const ppp = calculatePPP(slot.rate);
                              const showFullPpp = slotIndex === 0;
                              return (
                                <div key={slot.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end mb-3">
                                    <Select
                                      label="Start time"
                                      value={slot.startTime}
                                      onChange={(e) => updateSlotField(dayKey, slot.id, 'startTime', e.target.value)}
                                      options={START_TIMES.map(t => ({ label: t, value: t }))}
                                    />
                                    <Select
                                      label="Duration"
                                      value={slot.duration}
                                      onChange={(e) => updateSlotField(dayKey, slot.id, 'duration', e.target.value)}
                                      options={DURATION_OPTIONS}
                                    />
                                    <div>
                                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Your rate (local)</label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                                        <input
                                          className="w-full border-[1.5px] border-gray-200 rounded-lg py-2 pl-6 pr-3 text-sm text-gray-900 bg-white focus:border-[#0047CC] focus:outline-none transition-colors"
                                          type="number"
                                          value={slot.rate}
                                          onChange={(e) => updateSlotField(dayKey, slot.id, 'rate', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => removeSlot(dayKey, slot.id)}
                                      className="p-2 border border-red-200 bg-red-50 text-[#DC2626] rounded-lg hover:bg-red-100 transition-colors shrink-0 mb-[1px] cursor-pointer"
                                    >
                                      <TrashIcon size={16} />
                                    </button>
                                  </div>

                                  {showFullPpp ? (
                                    <div className="p-3 bg-gradient-to-br from-[#F8FAFF] to-[#F3F0FF] border border-[#BFDBFE] rounded-lg">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-2">
                                        <VideoIcon size={14} className="text-[#0047CC]" />
                                        <span>
                                          Global PPP Pricing — {slot.duration} min slot · {slot.startTime}{' '}
                                          {dayName}
                                        </span>
                                      </div>
                                      <p className="text-[12px] text-[#5C5C5C] mb-3 leading-relaxed">
                                        Your ${slot.rate} local rate auto-scales globally. Mentees are billed the
                                        amount below — you keep 80% after platform fee.
                                      </p>
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-white/70 border border-[#BFDBFE] rounded-lg">
                                          <div className="text-[9px] font-semibold text-[#0047CC] uppercase tracking-wider mb-1">
                                            T1 · HIC
                                          </div>
                                          <div className="text-sm font-bold text-[#0047CC]">${ppp.t1}</div>
                                          <div className="text-[9px] text-gray-500">US · UK · Swiss</div>
                                        </div>
                                        <div className="p-2 bg-white/70 border border-[#DDD6FE] rounded-lg">
                                          <div className="text-[9px] font-semibold text-[#7C3AED] uppercase tracking-wider mb-1">
                                            T2 · UMIC
                                          </div>
                                          <div className="text-sm font-bold text-[#7C3AED]">${ppp.t2}</div>
                                          <div className="text-[9px] text-gray-500">Brazil · China</div>
                                        </div>
                                        <div className="p-2 bg-white/70 border border-[#FDE68A] rounded-lg relative">
                                          <div className="absolute -top-2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#D97706] text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                            Local
                                          </div>
                                          <div className="text-[9px] font-semibold text-[#D97706] uppercase tracking-wider mb-1 mt-1">
                                            T3 · LMIC
                                          </div>
                                          <div className="text-sm font-bold text-[#D97706]">${ppp.t3}</div>
                                          <div className="text-[9px] text-gray-500">Nigeria · Kenya</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-[#F7F7F7] rounded-lg px-3 py-2 text-[11px] text-[#5C5C5C] leading-relaxed">
                                      <strong>
                                        {slot.duration} min · ${slot.rate} local →
                                      </strong>{' '}
                                      T1: <span className="text-[#0047CC] font-bold">${ppp.t1}</span> · T2:{' '}
                                      <span className="text-[#7C3AED] font-bold">${ppp.t2}</span> · T3:{' '}
                                      <span className="text-[#D97706] font-bold">${ppp.t3}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <button
                          onClick={() => addSlot(dayKey)}
                          className="inline-flex items-center gap-1.5 text-[#0047CC] text-xs font-bold hover:underline focus:outline-none mt-3 cursor-pointer"
                        >
                          <PlusIcon size={12} />
                          Add time slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Booking settings */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <Subheading>Booking Settings</Subheading>
                <p className="text-xs text-gray-500">Control how candidates book your time.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Booking notice required"
                value={bookingNotice}
                onChange={(e) => setBookingNotice(e.target.value)}
                options={[
                  { label: '24 hours', value: '24 hours' },
                  { label: '48 hours', value: '48 hours' },
                  { label: '72 hours', value: '72 hours' },
                  { label: '1 week', value: '1 week' },
                ]}
              />
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Max sessions per week</label>
                <input
                  className="w-full border-[1.5px] border-gray-200 rounded-lg p-2 text-sm text-gray-900 bg-white focus:border-[#0047CC] focus:outline-none transition-colors"
                  type="number"
                  value={maxSessionsPerWeek}
                  min={1}
                  onChange={(e) => setMaxSessionsPerWeek(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={blockManualDates} 
                  onChange={(e) => setBlockManualDates(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
              </label>
              <span>Block out dates when I'm unavailable (manually add time-off)</span>
            </div>
          </div>

          {/* STEP 4: Global Pricing Summary */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#2CA62C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <Subheading>Global Pricing Summary</Subheading>
                <p className="text-xs text-gray-500">Review your PPP-adjusted rates across all markets.</p>
              </div>
            </div>

            {/* Visual Dynamic Card */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 mb-4">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">60-min slot · ${baseProjRate} local rate</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white border border-[#BFDBFE] rounded-lg">
                  <div className="text-[9px] font-semibold text-[#0047CC] uppercase tracking-wider mb-1">T1 · HIC</div>
                  <div className="text-xl font-bold text-[#0047CC]">${projPPP.t1}</div>
                  <div className="text-[9px] text-gray-500">US · UK · Switzerland</div>
                </div>
                <div className="p-3 bg-white border border-[#DDD6FE] rounded-lg">
                  <div className="text-[9px] font-semibold text-[#7C3AED] uppercase tracking-wider mb-1">T2 · UMIC</div>
                  <div className="text-xl font-bold text-[#7C3AED]">${projPPP.t2}</div>
                  <div className="text-[9px] text-gray-500">Brazil · China · Poland</div>
                </div>
                <div className="p-3 bg-white border border-[#FDE68A] rounded-lg">
                  <div className="text-[9px] font-semibold text-[#D97706] uppercase tracking-wider mb-1">T3 · LMIC</div>
                  <div className="text-xl font-bold text-[#D97706]">${projPPP.t3}</div>
                  <div className="text-[9px] text-gray-500">Nigeria · India · Kenya</div>
                </div>
              </div>
            </div>

            {/* Revenue Projection Card */}
            <div className="bg-gradient-to-br from-[#18234B] to-[#283979] text-white rounded-xl p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-2">Revenue Projection · 20 sessions/month</div>
              <div className="text-3xl font-semibold tracking-tight text-white mb-1.5">
                ${projectedGross.toLocaleString()} <span className="text-sm font-normal text-white/50">projected gross</span>
              </div>
              <div className="text-xs text-white/70 mb-4 leading-normal">
                8 × T1 (${(8 * projPPP.t1).toLocaleString()}) + 6 × T2 (${(6 * projPPP.t2).toLocaleString()}) + 6 × T3 (${(6 * projPPP.t3).toLocaleString()}) · 80% after 20% platform fee → <strong className="text-[#86EFAC]">${projectedNet.toLocaleString()} to you</strong>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-2.5 text-center">
                  <div className="text-base font-semibold text-white">{vsLocalRatio}%</div>
                  <div className="text-[9px] text-white/50 mt-0.5">vs. local-only</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5 text-center">
                  <div className="text-base font-semibold text-white">41</div>
                  <div className="text-[9px] text-white/50 mt-0.5">Countries served</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5 text-center">
                  <div className="text-base font-semibold text-white">100%</div>
                  <div className="text-[9px] text-white/50 mt-0.5">Quality parity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 3. COURSES TAB ══════════════ */}
      {activeTab === 'courses' && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Courses</SectionHeading>
              <p className="text-xs text-gray-500">Manage your course catalogue, visibility, and enrollment settings.</p>
            </div>
            <Button variant="primary" fullWidth={false} onClick={() => handleSave('Courses')}>
              Save changes
            </Button>
          </div>

          {/* Course Visibility */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <Subheading className="mb-1">Course Visibility</Subheading>
            <p className="text-xs text-gray-500 mb-4">Control which courses are publicly listed on your profile.</p>

            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className={`flex items-center justify-between gap-4 p-4 border rounded-xl bg-white ${course.published ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50/50'}`}>
                  <div>
                    <h4 className={`text-sm font-bold ${course.published ? 'text-gray-900' : 'text-gray-500'}`}>{course.title}</h4>
                    <p className={`text-xs ${course.published ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                      {course.chapters} chapters · {course.hours} hrs {course.published && `· ${course.enrolled} enrolled`}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none">
                    <span className="text-xs font-bold text-gray-500">{course.published ? 'Published' : 'Draft'}</span>
                    <div 
                      onClick={() => handleCoursePublishToggle(course.id)}
                      className={`width-[40px] w-10 h-[22px] rounded-full relative transition-colors cursor-pointer ${course.published ? 'bg-[#2CA62C]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all ${course.published ? 'left-[20px]' : 'left-[3px]'}`} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment Settings */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <Subheading className="mb-1">Enrollment Settings</Subheading>
            <p className="text-xs text-gray-500 mb-4">Control how learners enroll and what access they receive.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Allow lifetime access after purchase</h4>
                  <p className="text-[11px] text-gray-500">Enrolled learners can revisit course content indefinitely.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={courseSettings.lifetimeAccess} 
                    onChange={(e) => setCourseSettings({ ...courseSettings, lifetimeAccess: e.target.checked })} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2CA62C]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Show enrollment count publicly</h4>
                  <p className="text-[11px] text-gray-500">Display number of enrolled learners on your course listings.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={courseSettings.showEnrolledCount} 
                    onChange={(e) => setCourseSettings({ ...courseSettings, showEnrolledCount: e.target.checked })} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2CA62C]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Allow course reviews</h4>
                  <p className="text-[11px] text-gray-500">Learners can leave star ratings and written reviews.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={courseSettings.allowReviews} 
                    onChange={(e) => setCourseSettings({ ...courseSettings, allowReviews: e.target.checked })} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2CA62C]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Completion Certificate */}
          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <Subheading className="mb-1">Completion Certificates</Subheading>
            <p className="text-xs text-gray-500 mb-4">Automatically issue certificates when learners complete your courses.</p>

            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900">Issue VORA completion certificates</h4>
                <p className="text-[11px] text-gray-500">Learners receive a certificate with your name and course title.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={courseSettings.issueCertificates} 
                  onChange={(e) => setCourseSettings({ ...courseSettings, issueCertificates: e.target.checked })} 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2CA62C]"></div>
              </label>
            </div>
          </div>

          {/* CTA builder card */}
          <div className="bg-gradient-to-r from-[#18234B] to-[#283979] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div>
              <Subheading className="text-base mb-1">Create a new course</Subheading>
              <p className="text-xs text-white/70">Share your global health expertise with candidates worldwide.</p>
            </div>
            <button 
              onClick={() => toast('Opening course builder…')}
              className="bg-white text-[#0047CC] hover:bg-gray-50 transition-colors text-xs font-bold py-2.5 px-5 rounded-full shrink-0 cursor-pointer"
            >
              + New Course
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ 4. MENTORSHIP TAB ══════════════ */}
      {activeTab === 'mentorship' && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Mentorship</SectionHeading>
              <p className="text-xs text-gray-500">Control who you mentor and how VORA matches candidates to you.</p>
            </div>
            <Button variant="primary" fullWidth={false} onClick={() => handleSave('Mentorship')}>
              Save changes
            </Button>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Status toggle */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div>
                <div className="text-sm font-bold text-gray-900">Status</div>
                <div className="text-[11px] text-gray-500 mt-1">Toggle to pause or resume accepting new mentees</div>
              </div>
              <div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                    <input 
                      type="radio" 
                      name="mstatus" 
                      checked={mentorshipStatus === 'accepting'} 
                      onChange={() => setMentorshipStatus('accepting')} 
                      className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                    />
                    Accepting mentees
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                    <input 
                      type="radio" 
                      name="mstatus" 
                      checked={mentorshipStatus === 'paused'} 
                      onChange={() => setMentorshipStatus('paused')} 
                      className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                    />
                    Paused — not accepting new requests
                  </label>
                </div>
              </div>
            </div>

            {/* Mentorship type tags */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Mentorship type</div>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {mentorshipTypes.map((type) => (
                    <span 
                      key={type} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#EEFBEE] text-[#1D871D] border border-[#1D871D]/15 rounded-full text-xs font-bold"
                    >
                      {type}
                      <button 
                        onClick={() => handleRemoveMentorshipType(type)}
                        className="text-xs hover:text-[#1D871D]/80 focus:outline-none ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {showTypeInput ? (
                  <div className="flex items-center gap-2 max-w-xs mt-2">
                    <Input
                      label=""
                      placeholder="e.g. Long-term advising"
                      value={newTypeInput}
                      onChange={(e) => setNewTypeInput(e.target.value)}
                    />
                    <Button variant="primary" size="sm" fullWidth={false} onClick={handleAddMentorshipType}>
                      Add
                    </Button>
                    <Button variant="outline" size="sm" fullWidth={false} onClick={() => setShowTypeInput(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTypeInput(true)}
                    className="inline-flex items-center gap-1.5 text-[#0047CC] text-sm font-bold hover:underline focus:outline-none mt-2 cursor-pointer"
                  >
                    <PlusIcon size={12} />
                    + Add type
                  </button>
                )}
              </div>
            </div>

            {/* Audience control */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Audience control</div>
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Career level accepted</label>
                  <div className="flex flex-wrap gap-2">
                    {['Students', 'Early career', 'Mid-career'].map((lvl) => {
                      const active = careerLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleCareerLevel(lvl)}
                          className={`px-3 py-1 border rounded-full text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#EEFBEE] text-[#1D871D] border-[#1D871D]/20'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          {lvl} {active && '×'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Geographical reach</label>
                  <div className="flex flex-col gap-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                      <input 
                        type="radio" 
                        name="geo" 
                        checked={geoReach === 'global'} 
                        onChange={() => setGeoReach('global')} 
                        className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                      />
                      Globally (recommended — maximises your PPP revenue)
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                      <input 
                        type="radio" 
                        name="geo" 
                        checked={geoReach === 'regional'} 
                        onChange={() => setGeoReach('regional')} 
                        className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                      />
                      Region-specific
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Max active mentees */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div>
                <div className="text-sm font-bold text-gray-900">Max active mentees</div>
                <div className="text-[11px] text-gray-500 mt-1">Total mentees you can work with at once</div>
              </div>
              <div>
                <input
                  className="w-full border-[1.5px] border-gray-200 rounded-lg p-2 text-sm text-gray-900 bg-white focus:border-[#0047CC] focus:outline-none transition-colors"
                  type="number"
                  value={maxActiveMentees}
                  min={1}
                  max={50}
                  style={{ maxWidth: '120px' }}
                  onChange={(e) => setMaxActiveMentees(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* VORA matching */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div>
                <div className="text-sm font-bold text-gray-900">VORA matching</div>
                <div className="text-[11px] text-gray-500 mt-1">Allow VORA to match assessment-referred candidates to you</div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={matchingEnabled} 
                      onChange={(e) => setMatchingEnabled(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                  </label>
                  <span>Accept VORA-matched candidates (assessment referred)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
                  VORA only matches candidates whose gap profile aligns with your expertise. You still accept or decline each request individually.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 5. NOTIFICATIONS TAB ══════════════ */}
      {activeTab === 'notification' && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Notifications</SectionHeading>
              <p className="text-xs text-gray-500">Choose how you receive updates from VORA.</p>
            </div>
            <Button variant="primary" fullWidth={false} onClick={() => handleSave('Notification')}>
              Save changes
            </Button>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Email Notifs */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Email</div>
              <div className="space-y-4">
                {[
                  { key: 'newRequests', label: 'New mentorship requests' },
                  { key: 'bookings', label: 'Session bookings & confirmations' },
                  { key: 'coursePurchases', label: 'Course purchases' },
                  { key: 'earnings', label: 'Earnings & payouts' },
                  { key: 'pppUpdates', label: 'PPP pricing tier updates (country reclassifications)' },
                  { key: 'announcements', label: 'Platform announcements' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={(emailNotifs as any)[item.key]} 
                        onChange={(e) => setEmailNotifs({ ...emailNotifs, [item.key]: e.target.checked })} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* In App Notifs */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">In-app</div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-gray-800">Show dashboard notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={inAppNotifs.showDashboard} 
                      onChange={(e) => setInAppNotifs({ ...inAppNotifs, showDashboard: e.target.checked })} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Frequency options */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Frequency</div>
              <div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                    <input 
                      type="radio" 
                      name="freq" 
                      checked={notificationFrequency === 'instant'} 
                      onChange={() => setNotificationFrequency('instant')} 
                      className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                    />
                    Instant
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                    <input 
                      type="radio" 
                      name="freq" 
                      checked={notificationFrequency === 'daily'} 
                      onChange={() => setNotificationFrequency('daily')} 
                      className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                    />
                    Daily digest
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                    <input 
                      type="radio" 
                      name="freq" 
                      checked={notificationFrequency === 'weekly'} 
                      onChange={() => setNotificationFrequency('weekly')} 
                      className="accent-[#0047CC] w-4 h-4 mt-0.5" 
                    />
                    Weekly summary
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 6. ACCOUNT TAB ══════════════ */}
      {activeTab === 'account' && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Account</SectionHeading>
              <p className="text-xs text-gray-500">Manage security, privacy, and session data.</p>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Credentials credentials info */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Credentials</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Email</div>
                    <div className="text-sm font-semibold text-gray-900">{accountEmail}</div>
                  </div>
                  <Button variant="outline" size="sm" fullWidth={false} onClick={() => toast('Email change request sent to administrator.')}>
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Password</div>
                    <div className="text-sm font-semibold text-gray-900">••••••••••••</div>
                  </div>
                  <Button variant="outline" size="sm" fullWidth={false} onClick={() => setPwModalOpen(true)}>
                    Change password
                  </Button>
                </div>
              </div>
            </div>

            {/* Privacy matching */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Privacy</div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">AI Matching Consent</h4>
                    <p className="text-[11px] text-gray-500 mt-1">Allow profile to be used for VORA candidate matching.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={consentAiMatching} 
                      onChange={(e) => setConsentAiMatching(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Active sessions */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Active sessions</div>
              <div>
                <div className="space-y-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-gray-900 mb-0.5">Macbook Air 2022 M2</div>
                    <div className="text-[10px] text-gray-500">Last active: Mar 10, 2026 · 09:20</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-gray-900 mb-0.5">iPhone 15 Pro</div>
                    <div className="text-[10px] text-gray-500">Last active: Mar 9, 2026 · 22:14</div>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success('All other sessions signed out')}
                  className="text-xs font-bold text-[#DC2626] hover:bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 transition-colors cursor-pointer"
                >
                  Sign out all other sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalDialog
        open={pwModalOpen}
        title="Change password"
        subtitle="Choose a strong password you do not use elsewhere."
        onClose={() => setPwModalOpen(false)}
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" fullWidth={false} onClick={() => setPwModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="change-password-form" fullWidth={false}>
              Change password
            </Button>
          </div>
        }
      >
        <form id="change-password-form" onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            placeholder="Current password"
            value={passwordFields.current}
            onChange={(e) => setPasswordFields({ ...passwordFields, current: e.target.value })}
          />
          <Input
            label="New password"
            type="password"
            placeholder="New password"
            value={passwordFields.new}
            onChange={(e) => setPasswordFields({ ...passwordFields, new: e.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Confirm password"
            value={passwordFields.confirm}
            onChange={(e) => setPasswordFields({ ...passwordFields, confirm: e.target.value })}
          />
        </form>
      </ModalDialog>
    </div>
  );
};

export default Settings;
