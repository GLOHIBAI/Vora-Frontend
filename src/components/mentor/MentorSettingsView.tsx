import React, { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Tag from '../common/Tag';
import ModalDialog from '../common/ModalDialog';
import EmptyState from '../common/EmptyState';
import ToggleSwitch from '../settings/ToggleSwitch';
import Spinner from '../common/Spinner';
import {
  TrashIcon,
  PlusIcon,
  CheckIcon,
  InfoIcon,
  BookIcon,
  ClockIcon,
  VideoIcon,
} from '../common/Icons';
import { validatePassword } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import {
  useMentorProfileSettingsQuery,
  useUpdateMentorProfileSettingsMutation,
  useMentorAvailabilitySettingsQuery,
  useUpdateMentorAvailabilitySettingsMutation,
  useMentorCoursesSettingsQuery,
  useUpdateMentorCoursesSettingsMutation,
  useMentorMentorshipSettingsQuery,
  useUpdateMentorMentorshipSettingsMutation,
  useMentorNotificationsSettingsQuery,
  useUpdateMentorNotificationsSettingsMutation,
  useMentorAccountSettingsQuery,
  useUpdateMentorAccountSettingsMutation,
  useMentorRequestEmailChangeMutation,
} from '../../services/queries/mentor';
import type { MentorWeeklySlot } from '../../services/queries/mentor/types';
import {
  useUploadAvatarMutation,
  useAuthSessionsQuery,
  useRevokeOtherSessionsMutation,
  useChangePasswordMutation,
} from '../../services/queries/employer';

export type MentorSettingsTab =
  | 'profile'
  | 'availability'
  | 'courses'
  | 'mentorship'
  | 'notification'
  | 'account';

interface TimeSlot {
  id: string;
  startTime: string;
  duration: string;
  rate: number;
}

interface DayPlan {
  name: string;
  active: boolean;
  open: boolean;
  slots: TimeSlot[];
}

const TIER_DATA: Record<string, { cls: string; name: string; msg: string; mult: { t1: number; t2: number; t3: number } }> = {
  t1: {
    cls: 'bg-[#EBF6FF] text-[#0047CC] border-[#BFDBFE]',
    name: 'Tier 1 (HIC)',
    msg: 'You are in a Tier 1 (HIC) market. Your local rate is the global baseline — VORA scales it down for T2/T3 mentees using PPP, expanding your reach to candidates worldwide.',
    mult: { t1: 1.0, t2: 0.42, t3: 0.14 },
  },
  t2: {
    cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
    name: 'Tier 2 (UMIC)',
    msg: 'You are in a Tier 2 (UMIC) market. VORA scales your rate up for T1 mentees and down for T3 mentees — maximising both your income and global accessibility.',
    mult: { t1: 2.38, t2: 1.0, t3: 0.33 },
  },
  t3: {
    cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    name: 'Tier 3 (LMIC)',
    msg: 'You are in a Tier 3 (LMIC) market. Your local rate anchors global pricing — VORA scales it up for T1/T2 mentees so you earn globally competitive rates while remaining accessible locally.',
    mult: { t1: 7.33, t2: 3.07, t3: 1.0 },
  },
};

const DAY_KEY_TO_NUM: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const NUM_TO_DAY_KEY: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  7: 'sun',
};

const NOTICE_TO_HOURS: Record<string, number> = {
  '24 hours': 24,
  '48 hours': 48,
  '72 hours': 72,
  '1 week': 168,
};

const HOURS_TO_NOTICE: Record<number, string> = {
  24: '24 hours',
  48: '48 hours',
  72: '72 hours',
  168: '1 week',
};

const FREQ_MAP_TO_SERVER: Record<string, 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_SUMMARY'> = {
  instant: 'INSTANT',
  daily: 'DAILY_DIGEST',
  weekly: 'WEEKLY_SUMMARY',
};

const FREQ_MAP_FROM_SERVER: Record<string, string> = {
  INSTANT: 'instant',
  DAILY_DIGEST: 'daily',
  WEEKLY_SUMMARY: 'weekly',
};

const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [h, m] = (startTime || '09:00').split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor((totalMinutes / 60) % 24);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const calculateDuration = (startTime: string, endTime: string): number => {
  const [sh, sm] = (startTime || '09:00').split(':').map(Number);
  const [eh, em] = (endTime || '10:00').split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff : 60;
};

const INITIAL_DAYS: Record<string, DayPlan> = {
  mon: { name: 'Monday', active: false, open: false, slots: [] },
  tue: { name: 'Tuesday', active: false, open: false, slots: [] },
  wed: { name: 'Wednesday', active: false, open: false, slots: [] },
  thu: { name: 'Thursday', active: false, open: false, slots: [] },
  fri: { name: 'Friday', active: false, open: false, slots: [] },
  sat: { name: 'Saturday', active: false, open: false, slots: [] },
  sun: { name: 'Sunday', active: false, open: false, slots: [] },
};

const MentorSettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<MentorSettingsTab>('profile');

  // ══════════════════════════════════════════
  // 1. PROFILE TAB
  // ══════════════════════════════════════════
  const { data: profileData, isLoading: isProfileLoading } = useMentorProfileSettingsQuery();
  const updateProfileMutation = useUpdateMentorProfileSettingsMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: '',
    bio: '',
  });
  const [expertise, setExpertise] = useState<string[]>([]);
  const [photoStorageKey, setPhotoStorageKey] = useState<string | null>(null);
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  const [newExpertiseInput, setNewExpertiseInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setProfile({
        firstName: profileData.firstName || user?.firstName || '',
        lastName: profileData.lastName || user?.lastName || '',
        title: profileData.professionalTitle || '',
        bio: profileData.bio || '',
      });
      if (Array.isArray(profileData.expertise)) {
        setExpertise(profileData.expertise);
      }
      if (profileData.photoUrl) {
        setAvatarPreview(profileData.photoUrl);
      }
      if (profileData.photoStorageKey) {
        setPhotoStorageKey(profileData.photoStorageKey);
      }
    }
  }, [profileData, user]);

  const handleSaveProfile = async () => {
    const updateRes = await updateProfileMutation.mutateAsync({
      firstName: profile.firstName,
      lastName: profile.lastName,
      professionalTitle: profile.title,
      bio: profile.bio,
      expertise,
      photoStorageKey,
    });
    updateUser({
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      ...(updateRes?.photoUrl || avatarPreview ? { avatarUrl: updateRes?.photoUrl || avatarPreview } : {}),
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let previewUrl = '';
    const reader = new FileReader();
    reader.onloadend = () => {
      previewUrl = reader.result as string;
      setAvatarPreview(previewUrl);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadAvatarMutation.mutateAsync(file);
      if (res?.storageKey) {
        setPhotoStorageKey(res.storageKey);
        const updateRes = await updateProfileMutation.mutateAsync({ photoStorageKey: res.storageKey });
        const newAvatarUrl = updateRes?.photoUrl || res?.signedUrl || previewUrl;
        if (newAvatarUrl) {
          updateUser({ avatarUrl: newAvatarUrl });
        }
        toast.success('Photo updated');
      }
    } catch {
      // Handled in mutation onError
    }
  };

  const handleAddExpertise = () => {
    if (newExpertiseInput.trim() && !expertise.includes(newExpertiseInput.trim())) {
      setExpertise([...expertise, newExpertiseInput.trim()]);
      setNewExpertiseInput('');
      setShowAddExpertise(false);
    }
  };

  const handleRemoveExpertise = (tag: string) => {
    setExpertise(expertise.filter((t) => t !== tag));
  };

  // ══════════════════════════════════════════
  // 2. AVAILABILITY & PRICING TAB
  // ══════════════════════════════════════════
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useMentorAvailabilitySettingsQuery();
  const updateAvailabilityMutation = useUpdateMentorAvailabilitySettingsMutation();

  const [primaryMarket, setPrimaryMarket] = useState('t3_ng');
  const [timezone, setTimezone] = useState('GMT+1');
  const [bufferBetweenSlots, setBufferBetweenSlots] = useState(true);
  const [days, setDays] = useState<Record<string, DayPlan>>(INITIAL_DAYS);
  const [bookingNotice, setBookingNotice] = useState('24 hours');
  const [maxSessionsPerWeek, setMaxSessionsPerWeek] = useState(10);
  const [blockOutDates, setBlockOutDates] = useState(true);

  useEffect(() => {
    if (availabilityData) {
      if (availabilityData.primaryOperatingMarket) {
        setPrimaryMarket(availabilityData.primaryOperatingMarket);
      }
      if (availabilityData.timezone) {
        setTimezone(availabilityData.timezone);
      }
      if (typeof availabilityData.bookingBufferMinutes === 'number') {
        setBufferBetweenSlots(availabilityData.bookingBufferMinutes > 0);
      }
      if (typeof availabilityData.bookingNoticeHours === 'number') {
        setBookingNotice(HOURS_TO_NOTICE[availabilityData.bookingNoticeHours] || '24 hours');
      }
      if (typeof availabilityData.maxSessionsPerWeek === 'number') {
        setMaxSessionsPerWeek(availabilityData.maxSessionsPerWeek);
      }
      if (Array.isArray(availabilityData.blockedDates)) {
        setBlockOutDates(availabilityData.blockedDates.length > 0);
      }

      if (Array.isArray(availabilityData.weeklySlots) && availabilityData.weeklySlots.length > 0) {
        const newDays: Record<string, DayPlan> = { ...INITIAL_DAYS };
        Object.keys(newDays).forEach((k) => {
          newDays[k] = { ...newDays[k], active: false, slots: [] };
        });

        availabilityData.weeklySlots.forEach((slot, idx) => {
          const dayKey = NUM_TO_DAY_KEY[slot.dayOfWeek];
          if (dayKey && newDays[dayKey]) {
            newDays[dayKey].active = true;
            newDays[dayKey].open = true;
            const duration = String(slot.durationMinutes || calculateDuration(slot.startTime, slot.endTime));
            newDays[dayKey].slots.push({
              id: `${dayKey}-${idx}-${slot.startTime}`,
              startTime: slot.startTime,
              duration,
              rate: slot.localRateAmount || 150,
            });
          }
        });
        setDays(newDays);
      }
    }
  }, [availabilityData]);

  const handleSaveAvailability = async () => {
    const weeklySlots: MentorWeeklySlot[] = [];
    Object.entries(days).forEach(([dayKey, plan]) => {
      if (plan.active && plan.slots.length > 0) {
        const dayNum = DAY_KEY_TO_NUM[dayKey] ?? 1;
        plan.slots.forEach((s) => {
          const dur = parseInt(s.duration) || 60;
          weeklySlots.push({
            dayOfWeek: dayNum,
            startTime: s.startTime,
            endTime: calculateEndTime(s.startTime, dur),
            durationMinutes: dur,
            localRateAmount: s.rate,
            localRateCurrency: 'USD',
          });
        });
      }
    });

    await updateAvailabilityMutation.mutateAsync({
      primaryOperatingMarket: primaryMarket,
      timezone,
      bookingBufferMinutes: bufferBetweenSlots ? 30 : 0,
      bookingNoticeHours: NOTICE_TO_HOURS[bookingNotice] || 24,
      maxSessionsPerWeek,
      weeklySlots,
      blockedDates: blockOutDates ? ['2026-12-25'] : [],
    });
  };

  const toggleDayOpen = (dayKey: string) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], open: !prev[dayKey].open },
    }));
  };

  const toggleDayActive = (dayKey: string, active: boolean) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], active },
    }));
  };

  const addSlot = (dayKey: string) => {
    const newSlot: TimeSlot = {
      id: `${dayKey}-${Date.now()}`,
      startTime: '10:00',
      duration: '60',
      rate: 150,
    };
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        open: true,
        slots: [...prev[dayKey].slots, newSlot],
      },
    }));
    toast.success('Slot added');
  };

  const removeSlot = (dayKey: string, slotId: string) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.filter((s) => s.id !== slotId),
      },
    }));
    toast.success('Slot removed');
  };

  const updateSlotRate = (dayKey: string, slotId: string, rate: number) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((s) => (s.id === slotId ? { ...s, rate } : s)),
      },
    }));
  };

  const updateSlotDuration = (dayKey: string, slotId: string, duration: string) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((s) => (s.id === slotId ? { ...s, duration } : s)),
      },
    }));
  };

  const updateSlotStartTime = (dayKey: string, slotId: string, startTime: string) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: prev[dayKey].slots.map((s) => (s.id === slotId ? { ...s, startTime } : s)),
      },
    }));
  };

  // ══════════════════════════════════════════
  // 3. COURSES TAB
  // ══════════════════════════════════════════
  const { data: coursesData, isLoading: isCoursesLoading } = useMentorCoursesSettingsQuery();
  const updateCoursesMutation = useUpdateMentorCoursesSettingsMutation();

  const [courses, setCourses] = useState<
    { id: number; title: string; chapters: number; hours: number; enrolled: number; published: boolean }[]
  >([]);
  const [courseSettings, setCourseSettings] = useState({
    lifetimeAccess: true,
    showEnrolledCount: true,
    allowReviews: true,
    issueCertificates: true,
  });

  useEffect(() => {
    if (coursesData) {
      setCourseSettings({
        lifetimeAccess: coursesData.showLifetimeAccess ?? true,
        showEnrolledCount: coursesData.showPublicEnrollmentCount ?? true,
        allowReviews: coursesData.reviewsEnabled ?? true,
        issueCertificates: coursesData.certificatesEnabled ?? true,
      });
      if (Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses.map((c, i) => ({
          id: Number(c.courseId ?? c.id ?? i + 1),
          title: c.title || `Course ${i + 1}`,
          chapters: c.chapters || 8,
          hours: c.hours || 6,
          enrolled: c.enrolled || 0,
          published: c.status === 'PUBLISHED',
        })));
      } else {
        setCourses([]);
      }
    }
  }, [coursesData]);

  const toggleCoursePublished = (id: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, published: !c.published } : c))
    );
  };

  const handleSaveCourses = async () => {
    await updateCoursesMutation.mutateAsync({
      showLifetimeAccess: courseSettings.lifetimeAccess,
      showPublicEnrollmentCount: courseSettings.showEnrolledCount,
      reviewsEnabled: courseSettings.allowReviews,
      certificatesEnabled: courseSettings.issueCertificates,
      courses: courses.map((c) => ({
        courseId: c.id,
        status: c.published ? 'PUBLISHED' : 'DRAFT',
      })),
    });
  };

  // ══════════════════════════════════════════
  // 4. MENTORSHIP TAB
  // ══════════════════════════════════════════
  const { data: mentorshipData, isLoading: isMentorshipLoading } = useMentorMentorshipSettingsQuery();
  const updateMentorshipMutation = useUpdateMentorMentorshipSettingsMutation();

  const [mentorshipStatus, setMentorshipStatus] = useState<'accepting' | 'paused'>('accepting');
  const [mentorshipTypes, setMentorshipTypes] = useState(['1-on-1 session', 'Short-term guidance']);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [careerLevels, setCareerLevels] = useState(['Students', 'Early career', 'Mid-career']);
  const [geoReach, setGeoReach] = useState<'global' | 'regional'>('global');
  const [maxActiveMentees, setMaxActiveMentees] = useState(20);
  const [voraMatchingEnabled, setVoraMatchingEnabled] = useState(true);

  useEffect(() => {
    if (mentorshipData) {
      setMentorshipStatus(mentorshipData.acceptingBookings !== false ? 'accepting' : 'paused');
      if (Array.isArray(mentorshipData.mentorshipTypes)) {
        setMentorshipTypes(mentorshipData.mentorshipTypes);
      }
      if (Array.isArray(mentorshipData.careerLevels)) {
        setCareerLevels(mentorshipData.careerLevels);
      }
      if (mentorshipData.geoReach) {
        setGeoReach(mentorshipData.geoReach === 'REGION' ? 'regional' : 'global');
      }
      if (typeof mentorshipData.maxActiveMentees === 'number') {
        setMaxActiveMentees(mentorshipData.maxActiveMentees);
      }
      if (typeof mentorshipData.voraMatchingEnabled === 'boolean') {
        setVoraMatchingEnabled(mentorshipData.voraMatchingEnabled);
      }
    }
  }, [mentorshipData]);

  const handleAddMentorshipType = () => {
    if (newTypeInput.trim() && !mentorshipTypes.includes(newTypeInput.trim())) {
      setMentorshipTypes([...mentorshipTypes, newTypeInput.trim()]);
      setNewTypeInput('');
      setShowAddType(false);
    }
  };

  const handleRemoveMentorshipType = (type: string) => {
    setMentorshipTypes(mentorshipTypes.filter((t) => t !== type));
  };

  const handleSaveMentorship = async () => {
    await updateMentorshipMutation.mutateAsync({
      acceptingBookings: mentorshipStatus === 'accepting',
      mentorshipTypes,
      careerLevels,
      geoReach: geoReach === 'global' ? 'GLOBAL' : 'REGION',
      maxActiveMentees,
      voraMatchingEnabled,
    });
  };

  // ══════════════════════════════════════════
  // 5. NOTIFICATIONS TAB
  // ══════════════════════════════════════════
  const { data: notifsData, isLoading: isNotifsLoading } = useMentorNotificationsSettingsQuery();
  const updateNotifsMutation = useUpdateMentorNotificationsSettingsMutation();

  const [notifs, setNotifs] = useState({
    newRequests: true,
    bookings: true,
    coursePurchases: true,
    earnings: true,
    pppUpdates: true,
    announcements: false,
    showDashboard: true,
    freq: 'instant',
  });

  useEffect(() => {
    if (notifsData) {
      setNotifs({
        newRequests: notifsData.emailMentorshipRequests ?? true,
        bookings: notifsData.emailBookings ?? true,
        coursePurchases: notifsData.emailCoursePurchases ?? true,
        earnings: notifsData.emailEarningsPayouts ?? true,
        pppUpdates: notifsData.emailPppTierUpdates ?? true,
        announcements: notifsData.emailPlatformAnnouncements ?? false,
        showDashboard: notifsData.inAppDashboardNotifications ?? true,
        freq: FREQ_MAP_FROM_SERVER[notifsData.frequency] || 'instant',
      });
    }
  }, [notifsData]);

  const handleSaveNotifications = async () => {
    await updateNotifsMutation.mutateAsync({
      emailMentorshipRequests: notifs.newRequests,
      emailBookings: notifs.bookings,
      emailCoursePurchases: notifs.coursePurchases,
      emailEarningsPayouts: notifs.earnings,
      emailPppTierUpdates: notifs.pppUpdates,
      emailPlatformAnnouncements: notifs.announcements,
      inAppDashboardNotifications: notifs.showDashboard,
      frequency: FREQ_MAP_TO_SERVER[notifs.freq] || 'INSTANT',
    });
  };

  // ══════════════════════════════════════════
  // 6. ACCOUNT TAB
  // ══════════════════════════════════════════
  const { data: accountData, isLoading: isAccountLoading } = useMentorAccountSettingsQuery();
  const updateAccountMutation = useUpdateMentorAccountSettingsMutation();
  const requestEmailChangeMutation = useMentorRequestEmailChangeMutation();

  const { data: authSessions = [], isLoading: isSessionsLoading } = useAuthSessionsQuery({
    enabled: activeTab === 'account',
  });
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' });
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [aiMatchingConsent, setAiMatchingConsent] = useState(true);

  useEffect(() => {
    if (accountData) {
      if (typeof accountData.aiMatchingConsent === 'boolean') {
        setAiMatchingConsent(accountData.aiMatchingConsent);
      }
    }
  }, [accountData]);

  const handleAiMatchingConsentToggle = async (checked: boolean) => {
    setAiMatchingConsent(checked);
    await updateAccountMutation.mutateAsync({ aiMatchingConsent: checked });
  };

  const getMentorPasswordValidationMessage = (): string | null => {
    if (!passwords.current.trim()) {
      return 'Please enter your current password.';
    }
    if (!passwords.new) {
      return 'Please enter a new password.';
    }
    const strengthErr = validatePassword(passwords.new);
    if (strengthErr) {
      return strengthErr;
    }
    if (passwords.current && passwords.new === passwords.current) {
      return 'New password cannot be the same as your current password.';
    }
    if (!passwords.confirm) {
      return 'Please confirm your new password.';
    }
    if (passwords.new !== passwords.confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const isMentorPasswordFormValid = useMemo(() => {
    return getMentorPasswordValidationMessage() === null;
  }, [passwords]);

  const validateMentorPasswordForm = () => {
    const errs = { current: '', new: '', confirm: '' };
    let isValid = true;

    if (!passwords.current.trim()) {
      errs.current = 'Current password is required';
      isValid = false;
    }

    if (!passwords.new) {
      errs.new = 'New password is required';
      isValid = false;
    } else {
      const strengthErr = validatePassword(passwords.new);
      if (strengthErr) {
        errs.new = strengthErr;
        isValid = false;
      } else if (passwords.current && passwords.new === passwords.current) {
        errs.new = 'New password cannot be the same as your current password';
        isValid = false;
      }
    }

    if (!passwords.confirm) {
      errs.confirm = 'Please confirm your new password';
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      errs.confirm = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errs);
    return isValid;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = getMentorPasswordValidationMessage();
    if (errorMsg) {
      validateMentorPasswordForm();
      toast.error(errorMsg);
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmNewPassword: passwords.confirm,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({ current: '', new: '', confirm: '' });
      setPwModalOpen(false);
      toast.success('Password changed successfully');
    } catch {
      // Handled in mutation onError
    }
  };

  const handleRequestEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    await requestEmailChangeMutation.mutateAsync({ newEmail: newEmail.trim() });
    setEmailModalOpen(false);
    setNewEmail('');
  };

  // PPP Calculation helper
  const currentTier = primaryMarket.split('_')[0] as 't1' | 't2' | 't3';
  const tierInfo = TIER_DATA[currentTier] || TIER_DATA.t3;

  const calculatePPP = (localRate: number) => {
    const mult = tierInfo.mult;
    return {
      t1: Math.round(localRate * mult.t1),
      t2: Math.round(localRate * mult.t2),
      t3: Math.round(localRate * mult.t3),
    };
  };

  const tabs: { key: MentorSettingsTab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'availability', label: 'Availability & Pricing' },
    { key: 'courses', label: 'Courses' },
    { key: 'mentorship', label: 'Mentorship' },
    { key: 'notification', label: 'Notifications' },
    { key: 'account', label: 'Account' },
  ];

  const initials = (profile.firstName[0] || 'D') + (profile.lastName[0] || 'A');

  return (
    <div className="w-full max-w-[920px] mx-auto py-8 px-4 sm:px-6 pb-24 animate-in fade-in duration-200">
      <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px] mb-6">Settings</h1>

      {/* Settings Tab Navigation Bar */}
      <div className="flex border-b border-[#E6E6E6] mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3.5 px-4 text-[13px] font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#0047CC] border-[#0047CC]'
                  : 'text-[#808080] border-transparent hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          1. PROFILE TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Profile</h2>
              <p className="text-xs text-[#808080] mt-1">
                How you appear to mentees and on your public page.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending || isProfileLoading}
              className="text-xs font-bold px-5"
            >
              {updateProfileMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          {isProfileLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6E6] border-t border-[#E6E6E6]">
              {/* Photo & Name */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Photo & Name</div>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-[60px] h-[60px] rounded-full object-cover border-2 border-[#0047CC]/15"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-full bg-[#BEE96B] text-[#283979] text-lg font-bold flex items-center justify-center border-2 border-[#0047CC]/15">
                        {initials}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending || updateProfileMutation.isPending || isProfileLoading}
                      className="text-xs"
                    >
                      {uploadAvatarMutation.isPending ? 'Uploading…' : 'Change photo'}
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
                </div>
              </div>

              {/* Title & Bio */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Title & Bio</div>
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
                  />
                </div>
              </div>

              {/* Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Expertise</div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {expertise.map((tag) => (
                      <Tag
                        key={tag}
                        label={tag}
                        variant="blue"
                        className="border border-[#BDD9FF] text-[12px] py-1 px-2.5"
                        onRemove={() => handleRemoveExpertise(tag)}
                      />
                    ))}
                  </div>

                  {showAddExpertise ? (
                    <div className="flex items-center gap-2 max-w-sm mt-2">
                      <Input
                        label=""
                        placeholder="e.g. Health Systems"
                        value={newExpertiseInput}
                        onChange={(e) => setNewExpertiseInput(e.target.value)}
                        className="!py-2 sm:!py-2 text-sm"
                      />
                      <Button variant="primary" size="sm" pill={false} fullWidth={false} onClick={handleAddExpertise}>
                        Add
                      </Button>
                      <Button variant="outline" size="sm" pill={false} fullWidth={false} onClick={() => setShowAddExpertise(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddExpertise(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0047CC] hover:underline cursor-pointer mt-1"
                    >
                      <PlusIcon size={12} />
                      Add expertise
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          2. AVAILABILITY & PRICING TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Availability & Pricing</h2>
              <p className="text-xs text-[#808080] mt-1">
                Set exactly when you're available, how long each slot is, and what it costs — PPP-adjusted automatically worldwide.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={handleSaveAvailability}
              disabled={updateAvailabilityMutation.isPending || isAvailabilityLoading}
              className="text-xs font-bold px-5"
            >
              {updateAvailabilityMutation.isPending ? 'Saving…' : 'Save all changes'}
            </Button>
          </div>

          {isAvailabilityLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <>
              {/* STEP 1: Primary Operating Market */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1A1A1A]">Your Primary Operating Market</h3>
                    <p className="text-xs text-[#808080]">
                      This tells VORA where your economic reality lives — it anchors the entire global pricing engine.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <Select
                    label="Country of practice"
                    value={primaryMarket}
                    onChange={(e) => setPrimaryMarket(e.target.value)}
                    options={[
                      { value: 't1_ch', label: 'Switzerland (T1 · HIC)' },
                      { value: 't1_us', label: 'United States (T1 · HIC)' },
                      { value: 't1_uk', label: 'United Kingdom (T1 · HIC)' },
                      { value: 't1_de', label: 'Germany (T1 · HIC)' },
                      { value: 't2_br', label: 'Brazil (T2 · UMIC)' },
                      { value: 't2_cn', label: 'China (T2 · UMIC)' },
                      { value: 't2_pl', label: 'Poland (T2 · UMIC)' },
                      { value: 't2_za', label: 'South Africa (T2 · UMIC)' },
                      { value: 't3_ng', label: 'Nigeria (T3 · LMIC)' },
                      { value: 't3_in', label: 'India (T3 · LMIC)' },
                      { value: 't3_ke', label: 'Kenya (T3 · LMIC)' },
                      { value: 't3_gh', label: 'Ghana (T3 · LMIC)' },
                    ]}
                  />
                  <Select
                    label="Your timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    options={[
                      { value: 'GMT+1', label: 'GMT+1 (WAT · Lagos)' },
                      { value: 'GMT+0', label: 'GMT+0 (UTC · Geneva)' },
                      { value: 'GMT-5', label: 'GMT-5 (EST · New York)' },
                      { value: 'GMT+5:30', label: 'GMT+5:30 (IST · Mumbai)' },
                      { value: 'GMT+3', label: 'GMT+3 (EAT · Nairobi)' },
                    ]}
                  />
                </div>

                {/* Dynamic Tier Banner */}
                <div className={`p-3 rounded-lg border text-xs leading-relaxed mb-3 flex items-start gap-2.5 ${tierInfo.cls}`}>
                  <InfoIcon size={16} className="shrink-0 mt-0.5" />
                  <span>{tierInfo.msg}</span>
                </div>

                <div className="p-3 bg-[#F7F7F7] rounded-lg text-[11px] text-[#808080] leading-relaxed">
                  <strong className="text-[#1A1A1A]">Why this matters:</strong> A mentor in Lagos charging ₦150,000 locally gets ~$1,100 from a US mentee and ~$450 from a Brazilian mentee — all automatically. A mentor in Switzerland charging CHF 900 gets ~$140 from a Nigerian mentee. VORA handles the maths so you set one rate and reach the world.
                </div>
              </div>

              {/* STEP 2: Weekly Availability & Session Pricing */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1A1A1A]">Weekly Availability & Session Pricing</h3>
                      <p className="text-xs text-[#808080]">
                        For each day, add time slots with their duration and your local rate. PPP pricing auto-calculates below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#4A4A4A]">
                    <ToggleSwitch checked={bufferBetweenSlots} onChange={setBufferBetweenSlots} />
                    <span>30-min buffer between slots</span>
                  </div>
                </div>

                {/* Day by Day Accordions */}
                <div className="space-y-3">
                  {Object.entries(days).map(([dayKey, dayPlan]) => {
                    const hasSlots = dayPlan.slots.length > 0;
                    return (
                      <div
                        key={dayKey}
                        className="border border-[#E6E6E6] rounded-xl overflow-hidden bg-white"
                      >
                        {/* Accordion header */}
                        <div className="p-4 flex items-center justify-between gap-4 flex-wrap bg-white hover:bg-[#F7F7F7]/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <ToggleSwitch
                              checked={dayPlan.active}
                              onChange={(active) => toggleDayActive(dayKey, active)}
                            />
                            <div>
                              <span className="text-sm font-bold text-[#1A1A1A]">{dayPlan.name}</span>
                              <span className="text-xs text-[#808080] ml-2">
                                {dayPlan.active
                                  ? hasSlots
                                    ? `${dayPlan.slots.length} slot${dayPlan.slots.length > 1 ? 's' : ''}`
                                    : 'No slots configured'
                                  : 'Day off'}
                              </span>
                            </div>
                          </div>

                          {dayPlan.active && (
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                pill={false}
                                fullWidth={false}
                                onClick={() => addSlot(dayKey)}
                                className="text-xs py-1 px-2.5 h-auto border-[#0047CC] text-[#0047CC]"
                              >
                                + Add slot
                              </Button>
                              <button
                                type="button"
                                onClick={() => toggleDayOpen(dayKey)}
                                className="text-xs font-bold text-[#808080] hover:text-[#1A1A1A] cursor-pointer"
                              >
                                {dayPlan.open ? 'Hide' : 'Edit'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Accordion body: slot editor */}
                        {dayPlan.active && dayPlan.open && (
                          <div className="p-4 bg-[#F7F7F7] border-t border-[#E6E6E6] space-y-3">
                            {dayPlan.slots.map((slot) => {
                              const slotPPP = calculatePPP(slot.rate);
                              return (
                                <div
                                  key={slot.id}
                                  className="bg-white border border-[#E6E6E6] rounded-xl p-3.5 space-y-3"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <Input
                                      label="Start time"
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => updateSlotStartTime(dayKey, slot.id, e.target.value)}
                                    />
                                    <Select
                                      label="Duration"
                                      value={slot.duration}
                                      onChange={(e) => updateSlotDuration(dayKey, slot.id, e.target.value)}
                                      options={[
                                        { value: '30', label: '30 minutes' },
                                        { value: '45', label: '45 minutes' },
                                        { value: '60', label: '60 minutes' },
                                        { value: '90', label: '90 minutes' },
                                      ]}
                                    />
                                    <Input
                                      label="Your local rate ($)"
                                      type="number"
                                      value={slot.rate}
                                      onChange={(e) => updateSlotRate(dayKey, slot.id, Number(e.target.value) || 0)}
                                    />
                                    <div className="flex justify-end pb-1">
                                      <button
                                        type="button"
                                        onClick={() => removeSlot(dayKey, slot.id)}
                                        className="p-2 text-[#808080] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                                        title="Remove slot"
                                      >
                                        <TrashIcon size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Dynamic PPP pill strip */}
                                  <div className="pt-2 border-t border-[#F7F7F7] flex items-center justify-between gap-3 text-xs flex-wrap">
                                    <span className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">
                                      PPP Rates:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded bg-[#EBF6FF] text-[#0047CC] font-bold text-[11px]">
                                        T1: ${slotPPP.t1}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#F5F3FF] text-[#7C3AED] font-bold text-[11px]">
                                        T2: ${slotPPP.t2}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] font-bold text-[11px]">
                                        T3 (You): ${slotPPP.t3}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Booking Settings */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1A1A1A]">Booking Settings</h3>
                    <p className="text-xs text-[#808080]">Control how candidates book your time.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Booking notice required"
                      value={bookingNotice}
                      onChange={(e) => setBookingNotice(e.target.value)}
                      options={[
                        { value: '24 hours', label: '24 hours' },
                        { value: '48 hours', label: '48 hours' },
                        { value: '72 hours', label: '72 hours' },
                        { value: '1 week', label: '1 week' },
                      ]}
                    />
                    <p className="text-[11px] text-[#808080] mt-1">Minimum time before a session a mentee can book.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1.5">
                      Max sessions per week
                    </label>
                    <input
                      type="number"
                      value={maxSessionsPerWeek}
                      onChange={(e) => setMaxSessionsPerWeek(parseInt(e.target.value) || 1)}
                      min={1}
                      max={40}
                      className="w-full border-[1.5px] border-[#E6E6E6] rounded-lg px-3 py-2 text-sm focus:border-[#0047CC] outline-none"
                    />
                    <p className="text-[11px] text-[#808080] mt-1">Cap total bookings across all tiers.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <ToggleSwitch checked={blockOutDates} onChange={setBlockOutDates} />
                  <span className="text-xs text-[#4A4A4A]">Block out dates when I'm unavailable (manually add time-off)</span>
                </div>
              </div>

              {/* STEP 4: Global Pricing Summary */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#2CA62C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1A1A1A]">Global Pricing Summary</h3>
                    <p className="text-xs text-[#808080]">Review your PPP-adjusted rates across all markets. These are what mentees see and pay.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-[#E6E6E6] rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">60-min slot · $150 local rate</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-[#EBF6FF] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#0047CC]">T1 · HIC</div>
                        <div className="text-base font-extrabold text-[#0047CC] mt-0.5">$1,100</div>
                      </div>
                      <div className="bg-[#F5F3FF] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#7C3AED]">T2 · UMIC</div>
                        <div className="text-base font-extrabold text-[#7C3AED] mt-0.5">$460</div>
                      </div>
                      <div className="bg-[#FFFBEB] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#D97706]">T3 · LMIC</div>
                        <div className="text-base font-extrabold text-[#D97706] mt-0.5">$150</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#E6E6E6] rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">30-min slot · $80 local rate</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-[#EBF6FF] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#0047CC]">T1 · HIC</div>
                        <div className="text-base font-extrabold text-[#0047CC] mt-0.5">$590</div>
                      </div>
                      <div className="bg-[#F5F3FF] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#7C3AED]">T2 · UMIC</div>
                        <div className="text-base font-extrabold text-[#7C3AED] mt-0.5">$245</div>
                      </div>
                      <div className="bg-[#FFFBEB] p-2 rounded-lg">
                        <div className="text-[9px] font-bold text-[#D97706]">T3 · LMIC</div>
                        <div className="text-base font-extrabold text-[#D97706] mt-0.5">$80</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Projection Card */}
                <div className="bg-gradient-to-br from-[#18234B] to-[#283979] text-white rounded-xl p-5 space-y-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">
                    Revenue Projection · 20 sessions/month
                  </div>
                  <div>
                    <div className="text-[28px] font-extrabold tracking-tight">$13,500 <span className="text-sm font-normal text-white/60">projected</span></div>
                    <p className="text-xs text-white/70 mt-0.5">
                      8 × T1 ($8,800) + 6 × T2 ($2,760) + 6 × T3 ($900) · 80% after 20% platform fee → <strong className="text-[#86EFAC]">$10,800 to you</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    <div className="bg-white/10 p-2.5 rounded-lg">
                      <div className="text-sm font-bold">450%</div>
                      <div className="text-[10px] text-white/60 mt-0.5">vs. local-only</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-lg">
                      <div className="text-sm font-bold">41</div>
                      <div className="text-[10px] text-white/60 mt-0.5">Countries served</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-lg">
                      <div className="text-sm font-bold">100%</div>
                      <div className="text-[10px] text-white/60 mt-0.5">Quality parity</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          3. COURSES TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Courses</h2>
              <p className="text-xs text-[#808080] mt-1">
                Manage your course catalogue, visibility, and enrollment settings.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={handleSaveCourses}
              disabled={updateCoursesMutation.isPending || isCoursesLoading}
              className="text-xs font-bold px-5"
            >
              {updateCoursesMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          {isCoursesLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <>
              {/* Course Visibility */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A1A]">Course Visibility</h3>
                <p className="text-xs text-[#808080]">Control which courses are publicly listed on your profile.</p>

                {courses.length === 0 ? (
                  <EmptyState
                    icon={BookIcon}
                    title="No courses created yet"
                    description="Create and publish courses to share your global health expertise with candidates worldwide."
                    compact
                    className="my-2"
                  />
                ) : (
                  <div className="space-y-2.5 pt-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          course.published
                            ? 'border-[#E6E6E6] bg-white'
                            : 'border-dashed border-[#ADADAD] bg-[#F7F7F7]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[#1A1A1A]">{course.title}</div>
                          <div className="text-xs text-[#808080] mt-0.5">
                            {course.chapters} chapters · {course.hours} hrs ·{' '}
                            {course.published ? `${course.enrolled} enrolled` : 'Draft'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-medium text-[#808080]">
                            {course.published ? 'Published' : 'Draft'}
                          </span>
                          <ToggleSwitch
                            checked={course.published}
                            onChange={() => toggleCoursePublished(course.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrollment Settings */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Enrollment Settings</h3>
                  <p className="text-xs text-[#808080]">Control how learners enroll and what access they receive.</p>
                </div>

                <div className="divide-y divide-[#F7F7F7]">
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">Allow lifetime access after purchase</div>
                      <div className="text-[11px] text-[#808080]">Enrolled learners can revisit course content indefinitely.</div>
                    </div>
                    <ToggleSwitch
                      checked={courseSettings.lifetimeAccess}
                      onChange={(c) => setCourseSettings({ ...courseSettings, lifetimeAccess: c })}
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">Show enrollment count publicly</div>
                      <div className="text-[11px] text-[#808080]">Display number of enrolled learners on your course listings.</div>
                    </div>
                    <ToggleSwitch
                      checked={courseSettings.showEnrolledCount}
                      onChange={(c) => setCourseSettings({ ...courseSettings, showEnrolledCount: c })}
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">Allow course reviews</div>
                      <div className="text-[11px] text-[#808080]">Learners can leave star ratings and written reviews.</div>
                    </div>
                    <ToggleSwitch
                      checked={courseSettings.allowReviews}
                      onChange={(c) => setCourseSettings({ ...courseSettings, allowReviews: c })}
                    />
                  </div>
                </div>
              </div>

              {/* Course Completion Certificate */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-5 shadow-sm space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Completion Certificates</h3>
                  <p className="text-xs text-[#808080]">Automatically issue certificates when learners complete your courses.</p>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">Issue VORA completion certificates</div>
                    <div className="text-[11px] text-[#808080]">Learners receive a certificate with your name and course title.</div>
                  </div>
                  <ToggleSwitch
                    checked={courseSettings.issueCertificates}
                    onChange={(c) => setCourseSettings({ ...courseSettings, issueCertificates: c })}
                  />
                </div>
              </div>

              {/* Create new course CTA */}
              <div className="bg-gradient-to-r from-[#18234B] to-[#283979] rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap text-white">
                <div>
                  <h3 className="text-[16px] font-bold">Create a new course</h3>
                  <p className="text-xs text-white/70 mt-1">Share your global health expertise with candidates worldwide.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={() => toast('Opening course builder…', { icon: '🎓' })}
                  className="bg-white text-[#0047CC] hover:bg-gray-100 border-none font-bold text-xs"
                >
                  + New Course
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          4. MENTORSHIP TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Mentorship</h2>
              <p className="text-xs text-[#808080] mt-1">
                Control who you mentor and how VORA matches candidates to you.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={handleSaveMentorship}
              disabled={updateMentorshipMutation.isPending || isMentorshipLoading}
              className="text-xs font-bold px-5"
            >
              {updateMentorshipMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          {isMentorshipLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6E6] border-t border-[#E6E6E6]">
              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div>
                  <div className="text-[13px] font-bold text-[#1A1A1A]">Status</div>
                  <p className="text-[11px] text-[#808080] mt-0.5">Toggle to pause or resume accepting new mentees</p>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mentorshipStatus"
                      checked={mentorshipStatus === 'accepting'}
                      onChange={() => setMentorshipStatus('accepting')}
                      className="accent-[#0047CC] w-4 h-4"
                    />
                    <span className="font-semibold text-[#1A1A1A]">Accepting mentees</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mentorshipStatus"
                      checked={mentorshipStatus === 'paused'}
                      onChange={() => setMentorshipStatus('paused')}
                      className="accent-[#0047CC] w-4 h-4"
                    />
                    <span className="font-semibold text-[#1A1A1A]">Paused — not accepting new requests</span>
                  </label>
                </div>
              </div>

              {/* Mentorship Type */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Mentorship type</div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mentorshipTypes.map((type) => (
                      <Tag
                        key={type}
                        label={type}
                        variant="green"
                        className="border border-[#A7F3D0] text-[12px] py-1 px-2.5"
                        onRemove={() => handleRemoveMentorshipType(type)}
                      />
                    ))}
                  </div>

                  {showAddType ? (
                    <div className="flex items-center gap-2 max-w-sm mt-2">
                      <Input
                        label=""
                        placeholder="e.g. Group Mentoring"
                        value={newTypeInput}
                        onChange={(e) => setNewTypeInput(e.target.value)}
                      />
                      <Button variant="primary" size="sm" pill={false} fullWidth={false} onClick={handleAddMentorshipType}>
                        Add
                      </Button>
                      <Button variant="outline" size="sm" pill={false} fullWidth={false} onClick={() => setShowAddType(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddType(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0047CC] hover:underline cursor-pointer mt-1"
                    >
                      <PlusIcon size={12} />
                      Add type
                    </button>
                  )}
                </div>
              </div>

              {/* Audience Control */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Audience control</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A4A4A] mb-2">Career level accepted</label>
                    <div className="flex flex-wrap gap-2">
                      {['Students', 'Early career', 'Mid-career', 'Senior'].map((lvl) => {
                        const selected = careerLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setCareerLevels(
                                selected ? careerLevels.filter((l) => l !== lvl) : [...careerLevels, lvl]
                              )
                            }
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              selected
                                ? 'bg-[#EEFBEE] text-[#135813] border border-[#A7F3D0]'
                                : 'bg-[#F7F7F7] text-[#808080] border border-[#E6E6E6]'
                            }`}
                          >
                            {lvl} {selected && '×'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4A4A] mb-2">Geographical reach</label>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="geoReach"
                          checked={geoReach === 'global'}
                          onChange={() => setGeoReach('global')}
                          className="accent-[#0047CC] w-4 h-4"
                        />
                        <span className="font-semibold text-[#1A1A1A]">Globally (recommended — maximises your PPP revenue)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="geoReach"
                          checked={geoReach === 'regional'}
                          onChange={() => setGeoReach('regional')}
                          className="accent-[#0047CC] w-4 h-4"
                        />
                        <span className="font-semibold text-[#1A1A1A]">Region-specific</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Max Active Mentees */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div>
                  <div className="text-[13px] font-bold text-[#1A1A1A]">Max active mentees</div>
                  <p className="text-[11px] text-[#808080] mt-0.5">Total mentees you can work with at once</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={maxActiveMentees}
                    onChange={(e) => setMaxActiveMentees(parseInt(e.target.value) || 1)}
                    min={1}
                    max={50}
                    className="w-28 border border-[#E6E6E6] rounded-lg p-2 text-xs focus:border-[#0047CC] outline-none"
                  />
                </div>
              </div>

              {/* VORA Matching */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div>
                  <div className="text-[13px] font-bold text-[#1A1A1A]">VORA matching</div>
                  <p className="text-[11px] text-[#808080] mt-0.5">Allow VORA to match interview-referred candidates</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch checked={voraMatchingEnabled} onChange={setVoraMatchingEnabled} />
                    <span className="text-xs text-[#1A1A1A] font-semibold">Accept VORA-matched candidates (interview referred)</span>
                  </div>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    VORA only matches candidates whose gap profile aligns with your expertise. You still accept or decline each request individually.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          5. NOTIFICATIONS TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'notification' && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1A1A]">Notifications</h2>
              <p className="text-xs text-[#808080] mt-1">
                Choose how you receive updates from VORA.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={handleSaveNotifications}
              disabled={updateNotifsMutation.isPending || isNotifsLoading}
              className="text-xs font-bold px-5"
            >
              {updateNotifsMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>

          {isNotifsLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6E6] border-t border-[#E6E6E6]">
              {/* Email Notifications */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Email</div>
                <div className="space-y-3.5">
                  {[
                    { key: 'newRequests', label: 'New mentorship requests' },
                    { key: 'bookings', label: 'Session bookings & confirmations' },
                    { key: 'coursePurchases', label: 'Course purchases' },
                    { key: 'earnings', label: 'Earnings & payouts' },
                    { key: 'pppUpdates', label: 'PPP pricing tier updates (country reclassifications)' },
                    { key: 'announcements', label: 'Platform announcements' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#4A4A4A] font-medium">{item.label}</span>
                      <ToggleSwitch
                        checked={(notifs as any)[item.key]}
                        onChange={(c) => setNotifs({ ...notifs, [item.key]: c })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* In-app */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">In-app</div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#4A4A4A] font-medium">Show dashboard notifications</span>
                  <ToggleSwitch
                    checked={notifs.showDashboard}
                    onChange={(c) => setNotifs({ ...notifs, showDashboard: c })}
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Frequency</div>
                <div className="space-y-2.5 text-xs text-[#4A4A4A]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="notifFreq"
                      checked={notifs.freq === 'instant'}
                      onChange={() => setNotifs({ ...notifs, freq: 'instant' })}
                      className="accent-[#0047CC] w-4 h-4"
                    />
                    <span className="font-semibold text-[#1A1A1A]">Instant</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="notifFreq"
                      checked={notifs.freq === 'daily'}
                      onChange={() => setNotifs({ ...notifs, freq: 'daily' })}
                      className="accent-[#0047CC] w-4 h-4"
                    />
                    <span className="font-semibold text-[#1A1A1A]">Daily digest</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="notifFreq"
                      checked={notifs.freq === 'weekly'}
                      onChange={() => setNotifs({ ...notifs, freq: 'weekly' })}
                      className="accent-[#0047CC] w-4 h-4"
                    />
                    <span className="font-semibold text-[#1A1A1A]">Weekly summary</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          6. ACCOUNT TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">Account</h2>
            <p className="text-xs text-[#808080] mt-1">Manage security, privacy, and session data.</p>
          </div>

          {isAccountLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={24} className="text-[#0047CC]" />
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6E6] border-t border-[#E6E6E6]">
              {/* Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Credentials</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F7F7F7] pb-3 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">Email</div>
                      <div className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
                        {accountData?.email || user?.email || 'adaeze@globalhealth.org'}
                      </div>
                      {accountData?.pendingEmailChange && (
                        <div className="text-[11px] text-[#D97706] mt-0.5 font-medium">
                          Pending confirmation: {accountData.pendingEmailChange.requestedEmail}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      fullWidth={false}
                      onClick={() => setEmailModalOpen(true)}
                      className="text-xs"
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">Password</div>
                      <div className="text-sm font-semibold text-[#1A1A1A] mt-0.5">••••••••••••</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      fullWidth={false}
                      onClick={() => setPwModalOpen(true)}
                      className="text-xs"
                    >
                      Change password
                    </Button>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Privacy</div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A]">AI Matching Consent</div>
                    <div className="text-[11px] text-[#808080] mt-0.5">Allow profile to be used for VORA candidate matching.</div>
                  </div>
                  <ToggleSwitch
                    checked={aiMatchingConsent}
                    onChange={handleAiMatchingConsentToggle}
                    disabled={updateAccountMutation.isPending}
                  />
                </div>
              </div>

              {/* Active Sessions */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-[13px] font-bold text-[#1A1A1A]">Active sessions</div>
                <div className="space-y-3">
                  {isSessionsLoading ? (
                    <div className="py-4 flex justify-center">
                      <Spinner size={20} className="text-[#0047CC]" />
                    </div>
                  ) : authSessions.length > 0 ? (
                    authSessions.map((s) => (
                      <div key={s.id} className="bg-[#F7F7F7] rounded-xl p-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-[#1A1A1A]">
                            {s.deviceName || s.userAgent || 'Web Browser'}
                          </div>
                          <div className="text-[11px] text-[#808080] mt-0.5">
                            {s.ipAddress || s.ip || 'Unknown IP'} ·{' '}
                            {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : 'Active now'}
                          </div>
                        </div>
                        {s.isCurrent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EEFBEE] text-[#135813] rounded-full">
                            Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => revokeOtherSessionsMutation.mutate()}
                            className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#F7F7F7] rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Current Browser Session</div>
                        <div className="text-[11px] text-[#808080] mt-0.5">Active now</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EEFBEE] text-[#135813] rounded-full">
                        Current
                      </span>
                    </div>
                  )}

                  {authSessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      fullWidth={false}
                      onClick={() => revokeOtherSessionsMutation.mutate()}
                      disabled={revokeOtherSessionsMutation.isPending}
                      className="text-xs text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2] mt-2 font-bold"
                    >
                      {revokeOtherSessionsMutation.isPending ? 'Signing out…' : 'Sign out all other sessions'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      <ModalDialog
        open={pwModalOpen}
        title="Change password"
        subtitle="Choose a strong password you do not use elsewhere."
        onClose={() => setPwModalOpen(false)}
        maxWidth="max-w-[460px]"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setPwModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={handleUpdatePassword}
              disabled={changePasswordMutation.isPending}
              aria-disabled={!isMentorPasswordFormValid}
              className={`text-xs font-bold transition-all ${
                !isMentorPasswordFormValid
                  ? '!bg-[#E6E6E6] !text-[#ADADAD] !cursor-not-allowed !shadow-none hover:!bg-[#E6E6E6]'
                  : ''
              }`}
            >
              {changePasswordMutation.isPending ? 'Saving…' : 'Change password'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUpdatePassword} className="space-y-3.5" autoComplete="off">
          <Input
            label="Current password"
            type="password"
            showPasswordToggle
            placeholder="Current password"
            value={passwords.current}
            error={Boolean(passwordErrors.current)}
            helperText={passwordErrors.current}
            onChange={(e) => {
              setPasswords({ ...passwords, current: e.target.value });
              if (passwordErrors.current) setPasswordErrors((prev) => ({ ...prev, current: '' }));
            }}
          />
          <Input
            label="New password"
            type="password"
            showPasswordToggle
            placeholder="Min. 8 characters"
            value={passwords.new}
            error={Boolean(passwordErrors.new)}
            helperText={passwordErrors.new}
            onChange={(e) => {
              const val = e.target.value;
              setPasswords({ ...passwords, new: val });
              if (passwordErrors.new) setPasswordErrors((prev) => ({ ...prev, new: '' }));
              if (passwords.confirm && val !== passwords.confirm) {
                setPasswordErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
              } else if (passwords.confirm && val === passwords.confirm) {
                setPasswordErrors((prev) => ({ ...prev, confirm: '' }));
              }
            }}
          />
          <Input
            label="Confirm new password"
            type="password"
            showPasswordToggle
            placeholder="Confirm password"
            value={passwords.confirm}
            error={Boolean(passwordErrors.confirm)}
            helperText={passwordErrors.confirm}
            onChange={(e) => {
              const val = e.target.value;
              setPasswords({ ...passwords, confirm: val });
              if (passwords.new && val !== passwords.new) {
                setPasswordErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
              } else {
                setPasswordErrors((prev) => ({ ...prev, confirm: '' }));
              }
            }}
          />
        </form>
      </ModalDialog>

      {/* Change Email Modal */}
      <ModalDialog
        open={emailModalOpen}
        title="Change email"
        subtitle="Enter your new email address. A confirmation link will be sent."
        onClose={() => setEmailModalOpen(false)}
        maxWidth="max-w-[460px]"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setEmailModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={handleRequestEmailSubmit}
              disabled={requestEmailChangeMutation.isPending}
              className="text-xs font-bold"
            >
              {requestEmailChangeMutation.isPending ? 'Sending…' : 'Send Verification'}
            </Button>
          </div>
        }
      >
        <form
          onSubmit={handleRequestEmailSubmit}
          className="space-y-3.5"
          autoComplete="off"
        >
          <Input
            label="New email address"
            type="email"
            placeholder="newemail@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </form>
      </ModalDialog>
    </div>
  );
};

export default MentorSettingsView;
