import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  VideoIcon,
  CheckIcon,
  AlertTriangleIcon,
  ClockIcon,
  LogOutIcon,
} from '../components/common/Icons';
import Spinner from '../components/common/Spinner';
import {
  COUNTRY_OPTIONS,
  TIMEZONE_OPTIONS,
  START_TIMES,
  DURATION_OPTIONS,
  MULTIPLIERS,
  TIER_INFO,
} from '../constants/settings';
import { validatePassword } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { useLogoutMutation } from '../services/queries/auth';
import {
  useEmployerProfileSettingsQuery,
  useUpdateEmployerProfileSettingsMutation,
  useEmployerNotificationsSettingsQuery,
  useUpdateEmployerNotificationsSettingsMutation,
  useEmployerAccountSettingsQuery,
  useUpdateEmployerAccountSettingsMutation,
  useRequestEmailChangeMutation,
  useUploadAvatarMutation,
  useAuthSessionsQuery,
  useRevokeOtherSessionsMutation,
  useChangePasswordMutation,
} from '../services/queries/employer';
import type { TabType, Slot, DayAvailability } from '../types';
import type { NotificationFrequency } from '../services/queries/employer/types';

import EmployerSettingsView from '../components/employer/EmployerSettingsView';
import MentorSettingsView from '../components/mentor/MentorSettingsView';

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const StandardSettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const role = user?.role?.toLowerCase() || localStorage.getItem('vora_role') || 'employer';
  const isEmployer = role === 'employer';

  const availableTabs: TabType[] = (() => {
    if (role === 'talent') {
      return ['profile', 'notification', 'account'];
    }
    return ['profile', 'availability', 'courses', 'mentorship', 'notification', 'account'];
  })();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // API Queries (for Employer)
  // -------------------------------------------------------------
  const { data: employerProfileData, isLoading: isProfileLoading } = useEmployerProfileSettingsQuery({ enabled: isEmployer });
  const updateProfileMutation = useUpdateEmployerProfileSettingsMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

  const { data: employerNotifsData, isLoading: isNotifsLoading } = useEmployerNotificationsSettingsQuery({ enabled: isEmployer });
  const updateNotifsMutation = useUpdateEmployerNotificationsSettingsMutation();

  const { data: employerAccountData, isLoading: isAccountLoading } = useEmployerAccountSettingsQuery({ enabled: isEmployer });
  const updateAccountMutation = useUpdateEmployerAccountSettingsMutation();
  const requestEmailChangeMutation = useRequestEmailChangeMutation();

  const { data: authSessions = [], isLoading: isSessionsLoading } = useAuthSessionsQuery({ enabled: activeTab === 'account' });
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const logoutMutation = useLogoutMutation();

  // -------------------------------------------------------------
  // Local Profile State (no mock fallbacks)
  // -------------------------------------------------------------
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [photoStorageKey, setPhotoStorageKey] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: '',
    bio: '',
  });
  const [expertise, setExpertise] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Hydrate Profile from Employer API
  useEffect(() => {
    if (isEmployer && employerProfileData) {
      setProfile({
        firstName: employerProfileData.firstName || user?.firstName || '',
        lastName: employerProfileData.lastName || user?.lastName || '',
        title: employerProfileData.professionalTitle || '',
        bio: employerProfileData.bio || '',
      });
      if (Array.isArray(employerProfileData.expertise)) {
        setExpertise(employerProfileData.expertise);
      }
      if (employerProfileData.photoUrl) {
        setProfilePic(employerProfileData.photoUrl);
      }
      if (employerProfileData.photoStorageKey) {
        setPhotoStorageKey(employerProfileData.photoStorageKey);
      }
    }
  }, [isEmployer, employerProfileData, user]);

  // -------------------------------------------------------------
  // Local Notifications State
  // -------------------------------------------------------------
  const [emailNotifs, setEmailNotifs] = useState({
    newRequests: true,
    bookings: true,
    coursePurchases: true,
    earnings: true,
    pppUpdates: true,
    announcements: false,
    newApplications: true,
    alignmentSessions: true,
    escrowWalletActivity: true,
    postHireCheckIns: true,
    platformAnnouncements: true,
  });
  const [inAppNotifs, setInAppNotifs] = useState({
    showDashboard: true,
  });
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('INSTANT');

  // Hydrate Notifications from Employer API
  useEffect(() => {
    if (isEmployer && employerNotifsData) {
      setEmailNotifs((prev) => ({
        ...prev,
        newApplications: employerNotifsData.emailNewApplications ?? true,
        alignmentSessions: employerNotifsData.emailAlignmentSessions ?? true,
        escrowWalletActivity: employerNotifsData.emailEscrowWalletActivity ?? true,
        postHireCheckIns: employerNotifsData.emailPostHireCheckIns ?? true,
        pppUpdates: employerNotifsData.emailPppTierUpdates ?? true,
        platformAnnouncements: employerNotifsData.emailPlatformAnnouncements ?? true,
      }));
      setInAppNotifs({
        showDashboard: employerNotifsData.inAppDashboardNotifications ?? true,
      });
      if (employerNotifsData.frequency) {
        setNotificationFrequency(employerNotifsData.frequency);
      }
    }
  }, [isEmployer, employerNotifsData]);

  // -------------------------------------------------------------
  // Local Account State
  // -------------------------------------------------------------
  const [consentAiMatching, setConsentAiMatching] = useState(true);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [passwordFields, setPasswordFields] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' });

  // Hydrate Account from Employer API
  useEffect(() => {
    if (isEmployer && employerAccountData) {
      if (typeof employerAccountData.aiMatchingConsent === 'boolean') {
        setConsentAiMatching(employerAccountData.aiMatchingConsent);
      }
    }
  }, [isEmployer, employerAccountData]);

  const profileInitials =
    ((profile.firstName?.[0] || user?.firstName?.[0] || user?.email?.[0] || 'U') +
    (profile.lastName?.[0] || user?.lastName?.[0] || '')).toUpperCase();
  const accountEmail = employerAccountData?.email || user?.email || '';
  const canChangePassword = employerAccountData?.canChangePassword !== false;
  const pendingEmailChange = employerAccountData?.pendingEmailChange;

  // -------------------------------------------------------------
  // Availability & Pricing Tab State (for Mentors)
  // -------------------------------------------------------------
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
        { id: 2, startTime: '14:00', duration: '30', rate: 80 },
      ],
    },
    tue: { active: true, open: false, slots: [{ id: 3, startTime: '10:00', duration: '90', rate: 220 }] },
    wed: { active: false, open: false, slots: [] },
    thu: { active: true, open: false, slots: [{ id: 4, startTime: '11:00', duration: '60', rate: 150 }] },
    fri: {
      active: true,
      open: false,
      slots: [
        { id: 5, startTime: '09:00', duration: '60', rate: 150 },
        { id: 6, startTime: '16:00', duration: '60', rate: 150 },
      ],
    },
    sat: { active: false, open: false, slots: [] },
    sun: { active: false, open: false, slots: [] },
  });

  // -------------------------------------------------------------
  // Courses Tab State (for Mentors)
  // -------------------------------------------------------------
  const [courses, setCourses] = useState([
    { id: 1, title: 'Health Systems Strengthening for LMIC Contexts', chapters: 8, hours: 6, enrolled: 847, published: true },
    { id: 2, title: 'WHO Competency Framework: The Complete Playbook', chapters: 12, hours: 9, enrolled: 1203, published: true },
    { id: 3, title: 'Psychometric & SJT Mastery for Global Health', chapters: 5, hours: 4, enrolled: 0, published: false },
  ]);
  const [courseSettings, setCourseSettings] = useState({
    lifetimeAccess: true,
    showEnrolledCount: true,
    allowReviews: true,
    issueCertificates: true,
  });

  // -------------------------------------------------------------
  // Mentorship Tab State (for Mentors)
  // -------------------------------------------------------------
  const [mentorshipStatus, setMentorshipStatus] = useState<'accepting' | 'paused'>('accepting');
  const [mentorshipTypes, setMentorshipTypes] = useState(['1-on-1 session', 'Short-term guidance']);
  const [careerLevels, setCareerLevels] = useState(['Students', 'Early career']);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [geoReach, setGeoReach] = useState<'global' | 'regional'>('global');
  const [maxActiveMentees, setMaxActiveMentees] = useState(20);
  const [matchingEnabled, setMatchingEnabled] = useState(true);

  // PPP calculations for Mentors
  const activeMarketTier = primaryMarket.split('_')[0] as 't1' | 't2' | 't3';
  const marketInfo = TIER_INFO[activeMarketTier];

  const calculatePPP = (localRate: number) => {
    const m = MULTIPLIERS[activeMarketTier];
    return {
      t1: Math.round(localRate * m.t1),
      t2: Math.round(localRate * m.t2),
      t3: Math.round(localRate * m.t3),
    };
  };

  const getBaseRateForProjection = () => {
    for (const day of Object.values(days)) {
      if (day.active) {
        const hourSlot = day.slots.find((s) => s.duration === '60');
        if (hourSlot) return hourSlot.rate;
        if (day.slots.length > 0) return day.slots[0].rate;
      }
    }
    return 150;
  };

  const baseProjRate = getBaseRateForProjection();
  const projPPP = calculatePPP(baseProjRate);
  const projectedGross = 8 * projPPP.t1 + 6 * projPPP.t2 + 6 * projPPP.t3;
  const projectedNet = Math.round(projectedGross * 0.8);
  const localOnlyProj = 20 * projPPP.t3;
  const vsLocalRatio = localOnlyProj > 0 ? Math.round((projectedGross / localOnlyProj) * 100) : 100;

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleSaveProfile = async () => {
    if (isEmployer) {
      await updateProfileMutation.mutateAsync({
        firstName: profile.firstName,
        lastName: profile.lastName,
        professionalTitle: profile.title,
        bio: profile.bio,
        expertise,
        photoStorageKey,
      });
      updateUser({ firstName: profile.firstName, lastName: profile.lastName });
    } else {
      updateUser({ firstName: profile.firstName, lastName: profile.lastName });
      toast.success('Profile settings saved successfully');
    }
  };

  const handleSaveNotifications = async () => {
    if (isEmployer) {
      await updateNotifsMutation.mutateAsync({
        emailNewApplications: emailNotifs.newApplications,
        emailAlignmentSessions: emailNotifs.alignmentSessions,
        emailEscrowWalletActivity: emailNotifs.escrowWalletActivity,
        emailPostHireCheckIns: emailNotifs.postHireCheckIns,
        emailPppTierUpdates: emailNotifs.pppUpdates,
        emailPlatformAnnouncements: emailNotifs.platformAnnouncements,
        inAppDashboardNotifications: inAppNotifs.showDashboard,
        frequency: notificationFrequency,
      });
    } else {
      toast.success('Notification settings saved successfully');
    }
  };

  const handleAiMatchingConsentChange = async (checked: boolean) => {
    setConsentAiMatching(checked);
    if (isEmployer) {
      await updateAccountMutation.mutateAsync({ aiMatchingConsent: checked });
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);

    // Show instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const uploadRes = await uploadAvatarMutation.mutateAsync(file);
      if (uploadRes?.storageKey) {
        setPhotoStorageKey(uploadRes.storageKey);
        if (isEmployer) {
          await updateProfileMutation.mutateAsync({
            photoStorageKey: uploadRes.storageKey,
          });
        }
      }
    } catch {
      // Toast already handled by mutation
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRequestEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) {
      toast.error('Please enter a valid new email address');
      return;
    }

    await requestEmailChangeMutation.mutateAsync({ newEmail: newEmailInput.trim() });
    setEmailModalOpen(false);
    setNewEmailInput('');
  };

  const getPasswordFieldsValidationMessage = (): string | null => {
    if (!passwordFields.current.trim()) {
      return 'Please enter your current password.';
    }
    if (!passwordFields.new) {
      return 'Please enter a new password.';
    }
    const strengthErr = validatePassword(passwordFields.new);
    if (strengthErr) {
      return strengthErr;
    }
    if (passwordFields.current && passwordFields.new === passwordFields.current) {
      return 'New password cannot be the same as your current password.';
    }
    if (!passwordFields.confirm) {
      return 'Please confirm your new password.';
    }
    if (passwordFields.new !== passwordFields.confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const isPasswordFieldsValid = useMemo(() => {
    return getPasswordFieldsValidationMessage() === null;
  }, [passwordFields]);

  const validatePasswordFields = () => {
    const errs = { current: '', new: '', confirm: '' };
    let isValid = true;

    if (!passwordFields.current.trim()) {
      errs.current = 'Current password is required';
      isValid = false;
    }

    if (!passwordFields.new) {
      errs.new = 'New password is required';
      isValid = false;
    } else {
      const strengthErr = validatePassword(passwordFields.new);
      if (strengthErr) {
        errs.new = strengthErr;
        isValid = false;
      } else if (passwordFields.current && passwordFields.new === passwordFields.current) {
        errs.new = 'New password cannot be the same as your current password';
        isValid = false;
      }
    }

    if (!passwordFields.confirm) {
      errs.confirm = 'Please confirm your new password';
      isValid = false;
    } else if (passwordFields.new !== passwordFields.confirm) {
      errs.confirm = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errs);
    return isValid;
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = getPasswordFieldsValidationMessage();
    if (errorMsg) {
      validatePasswordFields();
      toast.error(errorMsg);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordFields.current,
        newPassword: passwordFields.new,
        confirmNewPassword: passwordFields.confirm,
      });
      setPwModalOpen(false);
      setPasswordFields({ current: '', new: '', confirm: '' });
      setPasswordErrors({ current: '', new: '', confirm: '' });
      toast.success('Password updated successfully');
    } catch {
      // Handled in mutation onError
    }
  };

  const handleAddExpertise = () => {
    if (newTagInput.trim() && !expertise.includes(newTagInput.trim())) {
      setExpertise([...expertise, newTagInput.trim()]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveExpertise = (tag: string) => {
    setExpertise(expertise.filter((t) => t !== tag));
  };

  const handleAddMentorshipType = () => {
    if (newTypeInput.trim() && !mentorshipTypes.includes(newTypeInput.trim())) {
      setMentorshipTypes([...mentorshipTypes, newTypeInput.trim()]);
      setNewTypeInput('');
      setShowTypeInput(false);
    }
  };

  const handleRemoveMentorshipType = (type: string) => {
    setMentorshipTypes(mentorshipTypes.filter((t) => t !== type));
  };

  const toggleCareerLevel = (lvl: string) => {
    if (careerLevels.includes(lvl)) {
      setCareerLevels(careerLevels.filter((l) => l !== lvl));
    } else {
      setCareerLevels([...careerLevels, lvl]);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto py-9 px-4 md:px-0 pb-20">
      <PageTitle className="text-[28px] font-bold tracking-[-0.5px] mb-7">Settings</PageTitle>

      <SettingsTabBar tabs={availableTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ══════════════ 1. PROFILE TAB ══════════════ */}
      {activeTab === 'profile' && (
        isEmployer && isProfileLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
            <Spinner size={32} className="text-[#0047CC]" />
            <p className="text-[13px] font-medium text-gray-500">Loading profile details…</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <SettingsSectionHeader
              title="Profile"
              description={
                isEmployer
                  ? 'Your personal employer profile details and areas of expertise.'
                  : role === 'talent'
                  ? 'Your personal talent profile details and information.'
                  : 'How you appear to mentees and on your public page.'
              }
              onSave={handleSaveProfile}
              disabled={
                isUploadingPhoto ||
                uploadAvatarMutation.isPending ||
                updateProfileMutation.isPending ||
                isProfileLoading
              }
              isLoading={updateProfileMutation.isPending}
              loadingLabel="Saving…"
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
                    autoComplete="off"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                    disabled={isUploadingPhoto || uploadAvatarMutation.isPending || updateProfileMutation.isPending}
                  >
                    {isUploadingPhoto || uploadAvatarMutation.isPending ? 'Uploading…' : 'Change photo'}
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
                      placeholder="e.g. Health Systems"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="!py-2 sm:!py-2 text-sm"
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
        )
      )}

      {/* ══════════════ 2. AVAILABILITY & PRICING TAB (MENTOR) ══════════════ */}
      {activeTab === 'availability' && !isEmployer && (
        <div className="animate-fadeIn duration-200">
          <div className="flex justify-between items-start gap-4 mb-8">
            <div>
              <SectionHeading className="mb-1">Availability & Pricing</SectionHeading>
              <p className="text-xs text-gray-500">
                Set exactly when you're available, how long each slot is, and what it costs, PPP-adjusted automatically worldwide.
              </p>
            </div>
            <Button variant="primary" fullWidth={false} onClick={() => toast.success('Availability settings saved')}>
              Save all changes
            </Button>
          </div>

          <div className="bg-white border-[1.5px] border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#0047CC] text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <Subheading>Your Primary Operating Market</Subheading>
                <p className="text-xs text-gray-500">
                  This tells VORA where your economic reality lives, it anchors the entire global pricing engine.
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

            <div className={`flex items-start gap-2.5 p-3 rounded-lg text-xs font-bold border ${marketInfo.cls} mb-3`}>
              <InfoIcon className="shrink-0 mt-0.5" size={14} />
              <span>{marketInfo.msg}</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ 3. COURSES TAB (MENTOR) ══════════════ */}
      {activeTab === 'courses' && !isEmployer && (
        <div className="animate-fadeIn duration-200">
          <SectionHeading className="mb-1">Courses</SectionHeading>
          <p className="text-xs text-gray-500 mb-6">Manage your created courses and learning content.</p>
        </div>
      )}

      {/* ══════════════ 4. MENTORSHIP TAB (MENTOR) ══════════════ */}
      {activeTab === 'mentorship' && !isEmployer && (
        <div className="animate-fadeIn duration-200">
          <SectionHeading className="mb-1">Mentorship</SectionHeading>
          <p className="text-xs text-gray-500 mb-6">Control who you mentor and how VORA matches candidates to you.</p>
        </div>
      )}

      {/* ══════════════ 5. NOTIFICATIONS TAB ══════════════ */}
      {activeTab === 'notification' && (
        isEmployer && isNotifsLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
            <Spinner size={32} className="text-[#0047CC]" />
            <p className="text-[13px] font-medium text-gray-500">Loading notification preferences…</p>
          </div>
        ) : (
          <div className="animate-fadeIn duration-200">
            <div className="flex justify-between items-start gap-4 mb-8">
              <div>
                <SectionHeading className="mb-1">Notifications</SectionHeading>
                <p className="text-xs text-gray-500">Choose how you receive updates and communications from VORA.</p>
              </div>
              <Button
                variant="primary"
                fullWidth={false}
                onClick={handleSaveNotifications}
                disabled={updateNotifsMutation.isPending}
              >
                {updateNotifsMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Email Notifs */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-sm font-bold text-gray-900">Email Notifications</div>
                <div className="space-y-4">
                  {isEmployer ? (
                    [
                      { key: 'newApplications', label: 'New candidate applications' },
                      { key: 'alignmentSessions', label: 'Alignment session bookings & updates' },
                      { key: 'escrowWalletActivity', label: 'Escrow & wallet transactions' },
                      { key: 'postHireCheckIns', label: 'Post-hire check-in alerts & reminders' },
                      { key: 'pppUpdates', label: 'PPP tier updates (country reclassifications)' },
                      { key: 'platformAnnouncements', label: 'Platform & product announcements' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            autoComplete="off"
                            type="checkbox"
                            checked={(emailNotifs as any)[item.key]}
                            onChange={(e) =>
                              setEmailNotifs({ ...emailNotifs, [item.key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                        </label>
                      </div>
                    ))
                  ) : (
                    [
                      { key: 'newRequests', label: 'New mentorship requests' },
                      { key: 'bookings', label: 'Session bookings & confirmations' },
                      { key: 'coursePurchases', label: 'Course purchases' },
                      { key: 'earnings', label: 'Earnings & payouts' },
                      { key: 'pppUpdates', label: 'PPP pricing tier updates' },
                      { key: 'announcements', label: 'Platform announcements' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            autoComplete="off"
                            type="checkbox"
                            checked={(emailNotifs as any)[item.key]}
                            onChange={(e) =>
                              setEmailNotifs({ ...emailNotifs, [item.key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* In App Notifs */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-sm font-bold text-gray-900">In-app</div>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-gray-800">Show in-app dashboard notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        autoComplete="off"
                        type="checkbox"
                        checked={inAppNotifs.showDashboard}
                        onChange={(e) =>
                          setInAppNotifs({ ...inAppNotifs, showDashboard: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Frequency options */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
                <div className="text-sm font-bold text-gray-900">Delivery Frequency</div>
                <div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        autoComplete="off"
                        type="radio"
                        name="freq"
                        checked={notificationFrequency === 'INSTANT'}
                        onChange={() => setNotificationFrequency('INSTANT')}
                        className="accent-[#0047CC] w-4 h-4 mt-0.5"
                      />
                      Instant (immediate updates as events happen)
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        autoComplete="off"
                        type="radio"
                        name="freq"
                        checked={notificationFrequency === 'DAILY_DIGEST'}
                        onChange={() => setNotificationFrequency('DAILY_DIGEST')}
                        className="accent-[#0047CC] w-4 h-4 mt-0.5"
                      />
                      Daily digest (summary once per day)
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                      <input
                        autoComplete="off"
                        type="radio"
                        name="freq"
                        checked={notificationFrequency === 'WEEKLY_SUMMARY'}
                        onChange={() => setNotificationFrequency('WEEKLY_SUMMARY')}
                        className="accent-[#0047CC] w-4 h-4 mt-0.5"
                      />
                      Weekly summary (combined recap every Monday)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ══════════════ 6. ACCOUNT TAB ══════════════ */}
      {activeTab === 'account' && (
        isEmployer && isAccountLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
            <Spinner size={32} className="text-[#0047CC]" />
            <p className="text-[13px] font-medium text-gray-500">Loading account details…</p>
          </div>
        ) : (
          <div className="animate-fadeIn duration-200">
            <div className="flex justify-between items-start gap-4 mb-8">
              <div>
                <SectionHeading className="mb-1">Account</SectionHeading>
                <p className="text-xs text-gray-500">Manage your credentials, AI matching consent, and active sessions.</p>
              </div>
            </div>

          {/* Pending Email Change Banner */}
          {pendingEmailChange && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <InfoIcon size={18} className="text-[#0047CC] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-[#182348] leading-relaxed">
                <strong className="font-bold">Pending Email Change:</strong> Request to change email to{' '}
                <span className="font-semibold">{pendingEmailChange.requestedEmail}</span> is currently pending administrator review.
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {/* Credentials Info */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Credentials</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Email</div>
                    <div className="text-sm font-semibold text-gray-900">{accountEmail}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    onClick={() => setEmailModalOpen(true)}
                  >
                    Change email
                  </Button>
                </div>

                {canChangePassword && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Password</div>
                      <div className="text-sm font-semibold text-gray-900">••••••••••••</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      onClick={() => setPwModalOpen(true)}
                    >
                      Change password
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & AI Matching */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Privacy</div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">AI Matching Consent</h4>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Allow VORA to automatically analyze requirements and suggest high-fidelity candidate matches.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      autoComplete="off"
                      type="checkbox"
                      checked={consentAiMatching}
                      onChange={(e) => handleAiMatchingConsentChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0047CC]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-6">
              <div className="text-sm font-bold text-gray-900">Active Sessions</div>
              <div>
                <div className="space-y-2 mb-4">
                  {authSessions.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-gray-900 mb-0.5">Current Browser Session</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
                          Current
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">Active now</div>
                    </div>
                  ) : (
                    authSessions.map((session, i) => (
                      <div key={session.id || i} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-gray-900 mb-0.5">
                            {session.deviceName || session.userAgent || 'Web Browser'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {session.ipAddress || session.ip ? `IP: ${session.ipAddress || session.ip} · ` : ''}
                            {session.lastActiveAt
                              ? `Last active: ${new Date(session.lastActiveAt).toLocaleString()}`
                              : 'Active now'}
                          </div>
                        </div>
                        {session.isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 py-1.5 px-3 rounded-lg border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LogOutIcon size={14} />
                    {logoutMutation.isPending ? 'Logging out…' : 'Log out of this device'}
                  </button>

                  <button
                    type="button"
                    onClick={() => revokeOtherSessionsMutation.mutate()}
                    disabled={revokeOtherSessionsMutation.isPending}
                    className="text-xs font-bold text-[#DC2626] hover:bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {revokeOtherSessionsMutation.isPending ? 'Signing out…' : 'Sign out all other sessions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {/* Change Password Modal */}
      <ModalDialog
        open={pwModalOpen}
        title="Change password"
        subtitle="Choose a strong password you do not use elsewhere."
        onClose={() => setPwModalOpen(false)}
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              pill={false}
              className="rounded-xl"
              fullWidth={false}
              onClick={() => setPwModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              pill={false}
              className={`rounded-xl transition-all ${
                !isPasswordFieldsValid
                  ? '!bg-[#E6E6E6] !text-[#ADADAD] !cursor-not-allowed !shadow-none hover:!bg-[#E6E6E6]'
                  : ''
              }`}
              form="change-password-form"
              fullWidth={false}
              disabled={changePasswordMutation.isPending}
              aria-disabled={!isPasswordFieldsValid}
            >
              {changePasswordMutation.isPending ? 'Saving…' : 'Change password'}
            </Button>
          </div>
        }
      >
        <form id="change-password-form" onSubmit={handleChangePasswordSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="Current password"
            type="password"
            showPasswordToggle
            placeholder="Current password"
            value={passwordFields.current}
            error={Boolean(passwordErrors.current)}
            helperText={passwordErrors.current}
            onChange={(e) => {
              setPasswordFields({ ...passwordFields, current: e.target.value });
              if (passwordErrors.current) setPasswordErrors((prev) => ({ ...prev, current: '' }));
            }}
          />
          <Input
            label="New password"
            type="password"
            showPasswordToggle
            placeholder="New password (min. 8 characters)"
            value={passwordFields.new}
            error={Boolean(passwordErrors.new)}
            helperText={passwordErrors.new}
            onChange={(e) => {
              const val = e.target.value;
              setPasswordFields({ ...passwordFields, new: val });
              if (passwordErrors.new) setPasswordErrors((prev) => ({ ...prev, new: '' }));
              if (passwordFields.confirm && val !== passwordFields.confirm) {
                setPasswordErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
              } else if (passwordFields.confirm && val === passwordFields.confirm) {
                setPasswordErrors((prev) => ({ ...prev, confirm: '' }));
              }
            }}
          />
          <Input
            label="Confirm new password"
            type="password"
            showPasswordToggle
            placeholder="Confirm password"
            value={passwordFields.confirm}
            error={Boolean(passwordErrors.confirm)}
            helperText={passwordErrors.confirm}
            onChange={(e) => {
              const val = e.target.value;
              setPasswordFields({ ...passwordFields, confirm: val });
              if (passwordFields.new && val !== passwordFields.new) {
                setPasswordErrors((prev) => ({ ...prev, confirm: 'Passwords do not match' }));
              } else {
                setPasswordErrors((prev) => ({ ...prev, confirm: '' }));
              }
            }}
          />
        </form>
      </ModalDialog>

      {/* Change Email Request Modal */}
      <ModalDialog
        open={emailModalOpen}
        title="Request Email Change"
        subtitle="Enter the new email address for your organization account. This request will be sent to the administrator."
        onClose={() => setEmailModalOpen(false)}
        maxWidth="max-w-[480px]"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              pill={false}
              className="rounded-xl"
              fullWidth={false}
              onClick={() => setEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              pill={false}
              className="rounded-xl"
              form="change-email-form"
              fullWidth={false}
              disabled={requestEmailChangeMutation.isPending}
            >
              {requestEmailChangeMutation.isPending ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        }
      >
        <form id="change-email-form" onSubmit={handleRequestEmailSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="New Email Address"
            type="email"
            placeholder="name@company.com"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
          />
        </form>
      </ModalDialog>
    </div>
  );
};

const Settings: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || localStorage.getItem('vora_role') || 'employer';
  const isEmployer = role === 'employer';
  const isMentor = role === 'mentor';

  if (isEmployer) {
    return <EmployerSettingsView />;
  }

  if (isMentor) {
    return <MentorSettingsView />;
  }

  return <StandardSettingsView />;
};

export default Settings;
