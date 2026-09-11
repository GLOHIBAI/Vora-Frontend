import React, { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import EmptyState from '../common/EmptyState';
import ModalDialog from '../common/ModalDialog';
import ToggleSwitch from '../settings/ToggleSwitch';
import Spinner from '../common/Spinner';
import {
  TrashIcon,
  PlusIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  UploadSimpleIcon,
  AlertTriangleIcon,
  UsersIcon,
  FileIcon,
} from '../common/Icons';
import { validatePassword } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import {
  useEmployerOrganisationQuery,
  useUpdateEmployerOrganisationMutation,
  useEmployerProfileSettingsQuery,
  useUpdateEmployerProfileSettingsMutation,
  useEmployerTeamQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useEmployerRolesMatrixQuery,
  useUpdateRolePermissionsMutation,
  useEmployerBillingSettingsQuery,
  useEmployerNotificationsSettingsQuery,
  useUpdateEmployerNotificationsSettingsMutation,
  useEmployerSecuritySettingsQuery,
  useAuthSessionsQuery,
  useRevokeOtherSessionsMutation,
  useChangePasswordMutation,
  useDataPrivacyExportMutation,
  useDataPrivacyDeletionMutation,
  useDataPrivacyAuditTrailQuery,
  useEmployerOfferTemplatesQuery,
  useCreateOfferTemplateMutation,
  useUpdateOfferTemplateMutation,
  useDeleteOfferTemplateMutation,
  useUploadAvatarMutation,
} from '../../services/queries/employer';
import type {
  EmployerPermissionKey,
  EmployerTeamMemberRole,
  EmployerNotificationsSettings,
  OfferTemplateItem,
} from '../../services/queries/employer/types';

export type EmployerSettingsSection =
  | 'org'
  | 'profile'
  | 'team'
  | 'roles'
  | 'billing'
  | 'notifications'
  | 'security'
  | 'data'
  | 'templates';

interface PermissionDef {
  key: EmployerPermissionKey;
  label: string;
  desc: string;
}

const PERM_DEFS: PermissionDef[] = [
  { key: 'post_jobs', label: 'Post new job listings', desc: 'Can create and publish roles' },
  { key: 'view_applicants', label: 'View applicants', desc: 'Can see candidate pool and assessment results' },
  { key: 'hire', label: 'Confirm hire', desc: 'Can click hire and dispatch offer letters' },
  { key: 'reject', label: 'Reject candidates', desc: 'Can submit documented rejections' },
  { key: 'alignment_sessions', label: 'Request alignment sessions', desc: 'Can request video or in-person sessions' },
  { key: 'view_financials', label: 'View fee calculations', desc: 'Can see VORA fee breakdowns and escrow details' },
  { key: 'manage_team', label: 'Manage team members', desc: 'Can invite, edit, and remove team seats' },
  { key: 'bulk_hire', label: 'Bulk hire', desc: 'Can initiate multi-candidate hiring' },
  { key: 'edit_job_details', label: 'Edit job details', desc: 'Can modify role details after posting' },
];

const ROLE_OPTIONS: { role: EmployerTeamMemberRole; label: string }[] = [
  { role: 'ADMIN', label: 'Admin' },
  { role: 'SENIOR_RECRUITER', label: 'Senior Recruiter' },
  { role: 'RECRUITER', label: 'Recruiter' },
  { role: 'HIRING_MANAGER', label: 'Hiring Manager' },
  { role: 'VIEWER', label: 'Viewer' },
];

const ROLE_LABEL_TO_ENUM: Record<string, EmployerTeamMemberRole> = {
  Admin: 'ADMIN',
  ADMIN: 'ADMIN',
  'Senior Recruiter': 'SENIOR_RECRUITER',
  SENIOR_RECRUITER: 'SENIOR_RECRUITER',
  Recruiter: 'RECRUITER',
  RECRUITER: 'RECRUITER',
  'Hiring Manager': 'HIRING_MANAGER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  Viewer: 'VIEWER',
  VIEWER: 'VIEWER',
};

const ROLE_ENUM_TO_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  SENIOR_RECRUITER: 'Senior Recruiter',
  RECRUITER: 'Recruiter',
  HIRING_MANAGER: 'Hiring Manager',
  VIEWER: 'Viewer',
};

const DEFAULT_PERMS: Record<string, Record<EmployerPermissionKey, boolean>> = {
  ADMIN: {
    post_jobs: true,
    view_applicants: true,
    hire: true,
    reject: true,
    alignment_sessions: true,
    view_financials: true,
    manage_team: true,
    bulk_hire: true,
    edit_job_details: true,
  },
  SENIOR_RECRUITER: {
    post_jobs: true,
    view_applicants: true,
    hire: true,
    reject: true,
    alignment_sessions: true,
    view_financials: true,
    manage_team: false,
    bulk_hire: true,
    edit_job_details: true,
  },
  RECRUITER: {
    post_jobs: true,
    view_applicants: true,
    hire: false,
    reject: false,
    alignment_sessions: true,
    view_financials: false,
    manage_team: false,
    bulk_hire: false,
    edit_job_details: true,
  },
  HIRING_MANAGER: {
    post_jobs: false,
    view_applicants: true,
    hire: true,
    reject: true,
    alignment_sessions: true,
    view_financials: true,
    manage_team: false,
    bulk_hire: false,
    edit_job_details: false,
  },
  VIEWER: {
    post_jobs: false,
    view_applicants: true,
    hire: false,
    reject: false,
    alignment_sessions: false,
    view_financials: false,
    manage_team: false,
    bulk_hire: false,
    edit_job_details: false,
  },
};

const NOTIF_ITEMS: { key: keyof EmployerNotificationsSettings; label: string; desc: string }[] = [
  { key: 'emailHireConfirmed', label: 'Hire confirmed', desc: 'When a hire is confirmed and offer dispatched' },
  { key: 'emailNewApplications', label: 'New applicant', desc: 'When a new candidate applies to a role' },
  { key: 'emailAssessmentCompleted', label: 'Assessment completed', desc: 'When a candidate completes a VORA test' },
  { key: 'emailAlignmentSessions', label: 'Alignment session booked', desc: 'When a final alignment session is scheduled' },
  { key: 'emailRejectionFlagged', label: 'Rejection flagged for review', desc: 'When a rejection triggers VORA compliance review' },
  { key: 'emailFeeProcessed', label: 'Fee processed', desc: 'When a VORA fee or true-up is charged or refunded' },
  { key: 'emailWeeklyActivitySummary', label: 'Weekly activity summary', desc: 'A weekly digest of all hiring activity' },
];

const TEMPLATE_CATEGORIES = ['All', 'Standard', 'Clinical', 'Executive', 'Contract'];

const EmployerSettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<EmployerSettingsSection>('org');

  // ══════════════════════════════════════════
  // 1. ORGANISATION PROFILE
  // ══════════════════════════════════════════
  const { data: orgData, isLoading: isOrgLoading } = useEmployerOrganisationQuery();
  const updateOrgMutation = useUpdateEmployerOrganisationMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();

  const [orgProfile, setOrgProfile] = useState({
    organisationName: user?.organisationName || '',
    websiteUrl: '',
    country: '',
    organisationSize: '51-200',
    organisationType: 'government-agency',
    defaultTimezone: 'GMT+1',
    logoStorageKey: null as string | null,
    logoUrl: null as string | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (orgData) {
      setOrgProfile({
        organisationName: orgData.organisationName ?? user?.organisationName ?? '',
        websiteUrl: orgData.websiteUrl ?? '',
        country: orgData.country ?? '',
        organisationSize: orgData.organisationSize ?? '51-200',
        organisationType: orgData.organisationType ?? 'government-agency',
        defaultTimezone: orgData.defaultTimezone ?? 'GMT+1',
        logoStorageKey: orgData.logoStorageKey ?? null,
        logoUrl: orgData.logoUrl ?? null,
      });
      if (orgData.logoUrl) {
        setLogoPreview(orgData.logoUrl);
      }
    }
  }, [orgData, user]);

  const handleSaveOrg = async () => {
    await updateOrgMutation.mutateAsync({
      organisationName: orgProfile.organisationName,
      websiteUrl: orgProfile.websiteUrl,
      country: orgProfile.country,
      organisationSize: orgProfile.organisationSize,
      organisationType: orgProfile.organisationType,
      defaultTimezone: orgProfile.defaultTimezone,
      logoStorageKey: orgProfile.logoStorageKey,
    });
    updateUser({ organisationName: orgProfile.organisationName });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadAvatarMutation.mutateAsync(file);
      if (res?.storageKey) {
        setOrgProfile((prev) => ({ ...prev, logoStorageKey: res.storageKey }));
        await updateOrgMutation.mutateAsync({ logoStorageKey: res.storageKey });
        toast.success('Organisation logo updated');
      }
    } catch {
      // Handled in mutation onError
    }
  };

  // ══════════════════════════════════════════
  // PERSONAL PROFILE
  // ══════════════════════════════════════════
  const { data: profileData, isLoading: isProfileLoading } = useEmployerProfileSettingsQuery();
  const updateProfileMutation = useUpdateEmployerProfileSettingsMutation();

  const [personalProfile, setPersonalProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    professionalTitle: user?.title || 'Admin',
    bio: '',
    photoStorageKey: null as string | null,
    photoUrl: null as string | null,
  });
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState<string | null>(null);
  const personalPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setPersonalProfile({
        firstName: profileData.firstName || user?.firstName || '',
        lastName: profileData.lastName || user?.lastName || '',
        professionalTitle: profileData.professionalTitle || user?.title || 'Admin',
        bio: profileData.bio || '',
        photoStorageKey: profileData.photoStorageKey || null,
        photoUrl: profileData.photoUrl || null,
      });
      if (profileData.photoUrl) {
        setPersonalPhotoPreview(profileData.photoUrl);
      }
    } else if (user) {
      setPersonalProfile((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        professionalTitle: user.title || prev.professionalTitle,
      }));
    }
  }, [profileData, user]);

  const handleSavePersonalProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: personalProfile.firstName,
        lastName: personalProfile.lastName,
        professionalTitle: personalProfile.professionalTitle,
        bio: personalProfile.bio,
        photoStorageKey: personalProfile.photoStorageKey,
      });
    } catch {
      // Gracefully handle if profile endpoint fails
    }
    updateUser({
      firstName: personalProfile.firstName,
      lastName: personalProfile.lastName,
      title: personalProfile.professionalTitle,
    });
    toast.success('Personal profile updated');
  };

  const handlePersonalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPersonalPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const res = await uploadAvatarMutation.mutateAsync(file);
      if (res?.storageKey) {
        setPersonalProfile((prev) => ({ ...prev, photoStorageKey: res.storageKey }));
        await updateProfileMutation.mutateAsync({ photoStorageKey: res.storageKey });
        toast.success('Profile photo updated');
      }
    } catch {
      // Handled in mutation onError
    }
  };

  // ══════════════════════════════════════════
  // 2. TEAM & SEATS
  // ══════════════════════════════════════════
  const { data: teamData, isLoading: isTeamLoading } = useEmployerTeamQuery();
  const inviteMemberMutation = useInviteTeamMemberMutation();
  const updateMemberMutation = useUpdateTeamMemberMutation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<EmployerTeamMemberRole>('SENIOR_RECRUITER');

  const members = useMemo(() => {
    if (teamData?.members && Array.isArray(teamData.members)) {
      return teamData.members;
    }
    return [];
  }, [teamData]);

  const usedSeats = teamData?.usedSeats ?? members.filter((m) => m.status !== 'REMOVED').length;
  const seatLimit = teamData?.seatLimit ?? 10;
  const availableSeats = teamData?.availableSeats ?? Math.max(0, seatLimit - usedSeats);
  const seatPercentage = Math.min(100, Math.round((usedSeats / seatLimit) * 100));

  const handleRemoveMember = async (memberId: string, role: string) => {
    const adminCount = members.filter(
      (m) => (m.role === 'ADMIN' || m.role === 'Admin') && m.status !== 'REMOVED'
    ).length;
    if ((role === 'ADMIN' || role === 'Admin') && adminCount <= 1) {
      toast.error('Cannot remove the last Admin member.');
      return;
    }
    await updateMemberMutation.mutateAsync({ memberId, status: 'REMOVED' });
  };

  const handleUpdateMemberRole = async (memberId: string, currentRole: string, newRole: string) => {
    const adminCount = members.filter(
      (m) => (m.role === 'ADMIN' || m.role === 'Admin') && m.status !== 'REMOVED'
    ).length;
    if ((currentRole === 'ADMIN' || currentRole === 'Admin') && newRole !== 'ADMIN' && adminCount <= 1) {
      toast.error('Cannot reassign the last remaining Admin.');
      return;
    }
    const roleEnum = ROLE_LABEL_TO_ENUM[newRole] || (newRole as EmployerTeamMemberRole);
    await updateMemberMutation.mutateAsync({ memberId, role: roleEnum });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    await inviteMemberMutation.mutateAsync({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  // ══════════════════════════════════════════
  // 3. ROLES & PERMISSIONS
  // ══════════════════════════════════════════
  const { data: rolesMatrixData, isLoading: isRolesLoading } = useEmployerRolesMatrixQuery();
  const updateRolePermsMutation = useUpdateRolePermissionsMutation();
  const [activeRole, setActiveRole] = useState<EmployerTeamMemberRole>('SENIOR_RECRUITER');

  const rolePerms = useMemo(() => {
    const matrix: Record<string, Record<EmployerPermissionKey, boolean>> = {};
    const roles: EmployerTeamMemberRole[] = ['ADMIN', 'SENIOR_RECRUITER', 'RECRUITER', 'HIRING_MANAGER', 'VIEWER'];
    roles.forEach((r) => {
      const serverRoleData = rolesMatrixData?.[r] || rolesMatrixData?.[ROLE_ENUM_TO_LABEL[r]] || {};
      const fallback = DEFAULT_PERMS[r];
      matrix[r] = {
        post_jobs: Boolean(serverRoleData.post_jobs ?? fallback.post_jobs),
        view_applicants: Boolean(serverRoleData.view_applicants ?? fallback.view_applicants),
        hire: Boolean(serverRoleData.hire ?? fallback.hire),
        reject: Boolean(serverRoleData.reject ?? fallback.reject),
        alignment_sessions: Boolean(
          serverRoleData.alignment_sessions ?? (serverRoleData as any).alignment_session ?? fallback.alignment_sessions
        ),
        view_financials: Boolean(serverRoleData.view_financials ?? fallback.view_financials),
        manage_team: Boolean(serverRoleData.manage_team ?? fallback.manage_team),
        bulk_hire: Boolean(serverRoleData.bulk_hire ?? fallback.bulk_hire),
        edit_job_details: Boolean(serverRoleData.edit_job_details ?? fallback.edit_job_details),
      };
    });
    return matrix;
  }, [rolesMatrixData]);

  const togglePerm = async (permKey: EmployerPermissionKey) => {
    if (activeRole === 'ADMIN') return;
    const currentRoleMap = rolePerms[activeRole];
    const newPermissions = {
      ...currentRoleMap,
      [permKey]: !currentRoleMap[permKey],
    };
    await updateRolePermsMutation.mutateAsync({
      role: activeRole,
      permissions: newPermissions,
    });
  };

  // ══════════════════════════════════════════
  // 4. BILLING & PAYMENTS
  // ══════════════════════════════════════════
  const { data: billingData, isLoading: isBillingLoading } = useEmployerBillingSettingsQuery();

  // ══════════════════════════════════════════
  // 5. NOTIFICATIONS
  // ══════════════════════════════════════════
  const { data: notifsData, isLoading: isNotifsLoading } = useEmployerNotificationsSettingsQuery();
  const updateNotifsMutation = useUpdateEmployerNotificationsSettingsMutation();

  const [notifPreferences, setNotifPreferences] = useState<Record<string, boolean>>({
    emailHireConfirmed: true,
    emailNewApplications: true,
    emailAssessmentCompleted: true,
    emailAlignmentSessions: true,
    emailRejectionFlagged: true,
    emailFeeProcessed: false,
    emailWeeklyActivitySummary: true,
  });
  const [deliveryFrequency, setDeliveryFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  useEffect(() => {
    if (notifsData) {
      setNotifPreferences({
        emailHireConfirmed: notifsData.emailHireConfirmed ?? true,
        emailNewApplications: notifsData.emailNewApplications ?? true,
        emailAssessmentCompleted: notifsData.emailAssessmentCompleted ?? true,
        emailAlignmentSessions: notifsData.emailAlignmentSessions ?? true,
        emailRejectionFlagged: notifsData.emailRejectionFlagged ?? true,
        emailFeeProcessed: notifsData.emailFeeProcessed ?? false,
        emailWeeklyActivitySummary: notifsData.emailWeeklyActivitySummary ?? true,
      });
      if (notifsData.frequency) {
        const freq = notifsData.frequency.toLowerCase();
        if (freq.includes('daily')) setDeliveryFrequency('daily');
        else if (freq.includes('weekly')) setDeliveryFrequency('weekly');
        else setDeliveryFrequency('instant');
      }
    }
  }, [notifsData]);

  const toggleNotifItem = (key: string) => {
    setNotifPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    const freqMap: Record<string, 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_SUMMARY'> = {
      instant: 'INSTANT',
      daily: 'DAILY_DIGEST',
      weekly: 'WEEKLY_SUMMARY',
    };
    await updateNotifsMutation.mutateAsync({
      ...notifPreferences,
      frequency: freqMap[deliveryFrequency] || 'INSTANT',
    });
  };

  // ══════════════════════════════════════════
  // 6. SECURITY
  // ══════════════════════════════════════════
  const { data: securityData, isLoading: isSecurityLoading } = useEmployerSecuritySettingsQuery();
  const { data: authSessions = [], isLoading: isSessionsLoading } = useAuthSessionsQuery();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' });

  const getPasswordValidationMessage = (): string | null => {
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

  const isPasswordFormValid = useMemo(() => {
    return getPasswordValidationMessage() === null;
  }, [passwords]);

  const validatePasswordForm = () => {
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
    const errorMsg = getPasswordValidationMessage();
    if (errorMsg) {
      validatePasswordForm();
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
      toast.success('Password updated successfully');
    } catch {
      // Handled in mutation onError
    }
  };

  // ══════════════════════════════════════════
  // 7. DATA & PRIVACY
  // ══════════════════════════════════════════
  const exportMutation = useDataPrivacyExportMutation();
  const deletionMutation = useDataPrivacyDeletionMutation();
  const { data: auditData, isLoading: isAuditLoading } = useDataPrivacyAuditTrailQuery();
  const [deletionConfirmOpen, setDeletionConfirmOpen] = useState(false);

  const handleExportRequest = async () => {
    await exportMutation.mutateAsync();
  };

  const handleConfirmDeletion = async () => {
    await deletionMutation.mutateAsync();
    setDeletionConfirmOpen(false);
  };

  const handleDownloadAuditTrail = () => {
    if (auditData?.downloadUrl) {
      window.open(auditData.downloadUrl, '_blank');
      return;
    }
    const rows = auditData?.items;
    if (!rows || rows.length === 0) {
      toast.error('No audit records available to download');
      return;
    }
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'ID,Action,Actor,Timestamp\n' +
      rows.map((r: any) => `${r.id},"${r.action}","${r.actorRole || r.actorEmail || ''}","${r.createdAt}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vora_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit trail downloaded');
  };

  // ══════════════════════════════════════════
  // 8. OFFER TEMPLATES
  // ══════════════════════════════════════════
  const [templateCategory, setTemplateCategory] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Standard');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  const { data: offerTemplates = [], isLoading: isTemplatesLoading } = useEmployerOfferTemplatesQuery({
    category: templateCategory !== 'All' ? templateCategory : '',
    q: templateSearch,
  });

  const createTemplateMutation = useCreateOfferTemplateMutation();
  const updateTemplateMutation = useUpdateOfferTemplateMutation();
  const deleteTemplateMutation = useDeleteOfferTemplateMutation();

  const handleToggleTemplateActive = async (template: OfferTemplateItem) => {
    await updateTemplateMutation.mutateAsync({
      id: template.id,
      isActive: !template.isActive,
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplateMutation.mutateAsync(templateId);
  };

  const handleUploadTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!templateFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploadingTemplate(true);
    try {
      const uploadRes = await uploadAvatarMutation.mutateAsync(templateFile);
      await createTemplateMutation.mutateAsync({
        name: newTemplateName.trim(),
        category: newTemplateCategory,
        storageKey: uploadRes.storageKey || `templates/${Date.now()}_${templateFile.name}`,
        mimeType: templateFile.type || 'application/pdf',
      });
      setUploadModalOpen(false);
      setNewTemplateName('');
      setTemplateFile(null);
    } catch {
      // Error handled by mutation
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  // Navigation Items
  const navItems: { key: EmployerSettingsSection; label: string }[] = [
    { key: 'org', label: 'Organisation Profile' },
    { key: 'profile', label: 'Personal Profile' },
    { key: 'team', label: 'Team & Seats' },
    { key: 'roles', label: 'Roles & Permissions' },
    { key: 'billing', label: 'Billing & Payments' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
    { key: 'data', label: 'Data & Privacy' },
    { key: 'templates', label: 'Offer Templates' },
  ];

  const activeRolePermCount = Object.values(rolePerms[activeRole] || {}).filter(Boolean).length;

  return (
    <div className="w-full max-w-[1100px] mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in duration-200">
      <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px] mb-6">
        Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Settings Navigation Sidebar */}
        <aside className="w-full md:w-[210px] shrink-0 bg-white border border-[#E6E6E6] rounded-xl overflow-hidden shadow-sm">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-hide">
            {navItems.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`px-4 py-3 text-[13px] text-left border-b md:border-b-0 md:border-b-[#F7F7F7] last:border-b-0 border-l-[3px] transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF6FF] text-[#0047CC] font-bold border-l-[#0047CC]'
                      : 'bg-transparent text-[#4A4A4A] font-medium border-l-transparent hover:bg-[#F7F7F7] hover:text-[#1A1A1A]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 w-full min-w-0">
          {/* ══════════════════════════════════════════
              1. ORGANISATION PROFILE
          ══════════════════════════════════════════ */}
          {activeSection === 'org' && (
            <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F7F7F7]">
                <h2 className="text-[16px] font-bold text-[#1A1A1A]">Organisation Profile</h2>
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={handleSaveOrg}
                  disabled={updateOrgMutation.isPending || uploadAvatarMutation.isPending || isOrgLoading}
                  className="text-xs px-4"
                >
                  {updateOrgMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>

              {isOrgLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner size={24} className="text-[#0047CC]" />
                  <span className="text-xs text-[#808080]">Loading organisation details…</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Input
                      label="Organisation name"
                      value={orgProfile.organisationName}
                      onChange={(e) => setOrgProfile({ ...orgProfile, organisationName: e.target.value })}
                    />
                    <Input
                      label="Website"
                      value={orgProfile.websiteUrl}
                      onChange={(e) => setOrgProfile({ ...orgProfile, websiteUrl: e.target.value })}
                    />
                    <Input
                      label="Country of registration"
                      value={orgProfile.country}
                      onChange={(e) => setOrgProfile({ ...orgProfile, country: e.target.value })}
                    />
                    <Select
                      label="Organisation size"
                      value={orgProfile.organisationSize}
                      onChange={(e) => setOrgProfile({ ...orgProfile, organisationSize: e.target.value })}
                      options={[
                        { value: '1-10', label: '1-10 employees' },
                        { value: '11-50', label: '11-50 employees' },
                        { value: '51-200', label: '51-200 employees' },
                        { value: '201-500', label: '201-500 employees' },
                        { value: '500+', label: '500+ employees' },
                      ]}
                    />
                    <Select
                      label="Organisation type"
                      value={orgProfile.organisationType}
                      onChange={(e) => setOrgProfile({ ...orgProfile, organisationType: e.target.value })}
                      options={[
                        { value: 'government-agency', label: 'Government Agency' },
                        { value: 'ngo', label: 'NGO / Non-profit' },
                        { value: 'healthcare-provider', label: 'Healthcare Provider' },
                        { value: 'private-corporation', label: 'Private Corporation' },
                        { value: 'academic-research', label: 'Academic / Research' },
                      ]}
                    />
                    <Select
                      label="Default timezone"
                      value={orgProfile.defaultTimezone}
                      onChange={(e) => setOrgProfile({ ...orgProfile, defaultTimezone: e.target.value })}
                      options={[
                        { value: 'GMT+1', label: 'GMT+1 (West Africa Time)' },
                        { value: 'WAT', label: 'WAT (Lagos, Kinshasa)' },
                        { value: 'GMT+0', label: 'GMT+0 (UTC, Accra, London)' },
                        { value: 'GMT+2', label: 'GMT+2 (Cairo, Johannesburg)' },
                        { value: 'EST', label: 'EST (GMT-5 New York)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                      Organisation Logo
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg"
                      className="hidden"
                    />

                    {logoPreview ? (
                      <div className="flex items-center gap-4 p-4 border border-[#E6E6E6] rounded-xl bg-[#F7F7F7]">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded-lg border border-[#E6E6E6] bg-white p-1"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#1A1A1A]">Organisation logo</div>
                          <div className="text-[11px] text-[#808080] mt-0.5">PNG / JPG file</div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploadAvatarMutation.isPending || updateOrgMutation.isPending}
                              className="text-xs font-bold text-[#0047CC] hover:underline cursor-pointer"
                            >
                              {uploadAvatarMutation.isPending ? 'Uploading…' : 'Change'}
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setOrgProfile((prev) => ({ ...prev, logoStorageKey: null, logoUrl: null }));
                              }}
                              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E6E6E6] hover:border-[#0047CC]/50 rounded-xl p-8 text-center cursor-pointer bg-[#F7F7F7] hover:bg-[#EBF6FF]/20 transition-all"
                      >
                        <UploadSimpleIcon size={28} className="mx-auto text-[#ADADAD] mb-2" />
                        <div className="text-[13px] font-semibold text-[#4A4A4A]">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-[11px] text-[#ADADAD] mt-1">PNG, JPG up to 2MB</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              PERSONAL PROFILE
          ══════════════════════════════════════════ */}
          {activeSection === 'profile' && (
            <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F7F7F7]">
                <div>
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Personal Profile</h2>
                  <p className="text-xs text-[#808080] mt-0.5">Manage your personal details and account role</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={handleSavePersonalProfile}
                  disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending || isProfileLoading}
                  className="text-xs px-4"
                >
                  {updateProfileMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>

              {isProfileLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner size={24} className="text-[#0047CC]" />
                  <span className="text-xs text-[#808080]">Loading profile…</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Input
                      label="First name"
                      value={personalProfile.firstName}
                      onChange={(e) => setPersonalProfile({ ...personalProfile, firstName: e.target.value })}
                    />
                    <Input
                      label="Last name"
                      value={personalProfile.lastName}
                      onChange={(e) => setPersonalProfile({ ...personalProfile, lastName: e.target.value })}
                    />
                    <Input
                      label="Professional title / Role"
                      value={personalProfile.professionalTitle}
                      placeholder="e.g. Admin Manager, Head of Talent"
                      onChange={(e) => setPersonalProfile({ ...personalProfile, professionalTitle: e.target.value })}
                    />
                    <Input
                      label="Email address"
                      value={user?.email || ''}
                      disabled
                      className="opacity-70 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      ref={personalPhotoInputRef}
                      onChange={handlePersonalPhotoUpload}
                      accept="image/png,image/jpeg"
                      className="hidden"
                    />

                    {personalPhotoPreview ? (
                      <div className="flex items-center gap-4 p-4 border border-[#E6E6E6] rounded-xl bg-[#F7F7F7]">
                        <img
                          src={personalPhotoPreview}
                          alt="Profile preview"
                          className="w-16 h-16 object-cover rounded-full border border-[#E6E6E6] bg-white"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#1A1A1A]">Your profile picture</div>
                          <div className="text-[11px] text-[#808080] mt-0.5">PNG / JPG file</div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => personalPhotoInputRef.current?.click()}
                              disabled={uploadAvatarMutation.isPending || updateProfileMutation.isPending}
                              className="text-xs font-bold text-[#0047CC] hover:underline cursor-pointer"
                            >
                              {uploadAvatarMutation.isPending ? 'Uploading…' : 'Change'}
                            </button>
                            <span className="text-gray-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPersonalPhotoPreview(null);
                                setPersonalProfile((prev) => ({ ...prev, photoStorageKey: null, photoUrl: null }));
                              }}
                              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => personalPhotoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E6E6E6] hover:border-[#0047CC]/50 rounded-xl p-8 text-center cursor-pointer bg-[#F7F7F7] hover:bg-[#EBF6FF]/20 transition-all"
                      >
                        <UploadSimpleIcon size={28} className="mx-auto text-[#ADADAD] mb-2" />
                        <div className="text-[13px] font-semibold text-[#4A4A4A]">
                          Click to upload profile photo
                        </div>
                        <div className="text-[11px] text-[#ADADAD] mt-1">PNG, JPG up to 2MB</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              2. TEAM & SEATS
          ══════════════════════════════════════════ */}
          {activeSection === 'team' && (
            <div className="space-y-4">
              {/* Seat Usage Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Seat Usage</h2>
                </div>

                <div className="flex items-center gap-6 mb-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex justify-between text-[13px] mb-2">
                      <span className="text-[#4A4A4A] font-medium">
                        {usedSeats} of {seatLimit} seats used
                      </span>
                      <span className="font-bold text-[#0047CC]">
                        {availableSeats} available
                      </span>
                    </div>
                    <div className="h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0047CC] rounded-full transition-all duration-300"
                        style={{ width: `${seatPercentage}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={() => toast('Seat upgrades can be requested via your account manager.', { icon: '💼' })}
                    className="border-[#0047CC] text-[#0047CC] hover:bg-[#EBF6FF] text-xs font-bold whitespace-nowrap"
                  >
                    Upgrade Seats
                  </Button>
                </div>

                <div className="bg-[#EBF6FF] border border-[#BDD9FF]/60 rounded-lg px-4 py-3 text-xs text-[#0047CC] flex items-center justify-between gap-3">
                  <span>
                    Your current plan includes {seatLimit} recruiter seats. Each seat grants platform access per the role assigned.
                  </span>
                  <a
                    href="#billing"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection('billing');
                    }}
                    className="font-bold underline shrink-0 hover:text-[#0038A8]"
                  >
                    View plans
                  </a>
                </div>
              </div>

              {/* Team Members Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F7F7F7]">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Team Members</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={() => setInviteModalOpen(true)}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <PlusIcon size={13} />
                    Invite Member
                  </Button>
                </div>

                {isTeamLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Spinner size={24} className="text-[#0047CC]" />
                    <span className="text-xs text-[#808080]">Loading team members…</span>
                  </div>
                ) : members.filter((m) => m.status !== 'REMOVED').length === 0 ? (
                  <EmptyState
                    icon={UsersIcon}
                    title="No team members yet"
                    description="Invite recruiters, hiring managers, and admins to collaborate on roles and assessments."
                    action={{
                      label: 'Invite Member',
                      icon: PlusIcon,
                      onClick: () => setInviteModalOpen(true),
                    }}
                    className="my-2"
                  />
                ) : (
                  <div className="overflow-x-auto min-h-[280px] pb-16">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E6E6E6] text-[11px] font-bold text-[#808080] uppercase tracking-wider">
                          <th className="pb-3 pr-4">Member</th>
                          <th className="pb-3 px-3">Role</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Joined</th>
                          <th className="pb-3 pl-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F7F7F7]">
                        {members
                          .filter((m) => m.status !== 'REMOVED')
                          .map((m) => {
                            const roleKey = ROLE_LABEL_TO_ENUM[m.role] || (m.role as EmployerTeamMemberRole);
                            const displayRole = ROLE_ENUM_TO_LABEL[roleKey] || m.role;
                            const isLastAdmin =
                              roleKey === 'ADMIN' &&
                              members.filter((x) => (ROLE_LABEL_TO_ENUM[x.role] || x.role) === 'ADMIN' && x.status !== 'REMOVED').length <= 1;

                            const statusDisplay =
                              m.status === 'ACTIVE' || m.status === 'Active'
                                ? 'Active'
                                : m.status === 'PENDING' || m.status === 'Pending'
                                ? 'Pending'
                                : m.status;

                            const memberDisplayName =
                              m.name ||
                              (m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.email.split('@')[0]);

                            return (
                              <tr key={m.id} className="hover:bg-[#F7F7F7]/50 transition-colors">
                                <td className="py-3.5 pr-4">
                                  <div className="font-bold text-[13px] text-[#1A1A1A]">
                                    {memberDisplayName}
                                  </div>
                                  <div className="text-[11px] text-[#808080]">{m.email}</div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <Select
                                    variant="compact"
                                    hideLabel
                                    value={roleKey}
                                    disabled={updateMemberMutation.isPending}
                                    options={ROLE_OPTIONS.map((r) => ({
                                      value: r.role,
                                      label: r.label,
                                    }))}
                                    onChange={(e) => handleUpdateMemberRole(String(m.id), roleKey, e.target.value)}
                                  />
                                </td>
                                <td className="py-3.5 px-3">
                                  <span
                                    className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                      statusDisplay === 'Active'
                                        ? 'bg-[#EEFBEE] text-[#135813]'
                                        : 'bg-[#FFFBEB] text-[#D97706]'
                                    }`}
                                  >
                                    {statusDisplay}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-[#808080] font-medium">
                                  {m.joined || (m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '–')}
                                </td>
                                <td className="py-3.5 pl-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(String(m.id), roleKey)}
                                    disabled={isLastAdmin || updateMemberMutation.isPending}
                                    title={isLastAdmin ? 'Cannot remove the last Admin' : 'Remove member'}
                                    className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                                      isLastAdmin
                                        ? 'text-[#ADADAD] opacity-40 cursor-not-allowed'
                                        : 'text-[#808080] hover:text-[#DC2626] hover:bg-red-50 cursor-pointer'
                                    }`}
                                  >
                                    <TrashIcon size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              3. ROLES & PERMISSIONS
          ══════════════════════════════════════════ */}
          {activeSection === 'roles' && (
            <div className="space-y-4">
              <div className="bg-[#EBF6FF] border border-[#387DFF]/50 rounded-xl p-4 text-[13px] text-[#0047CC] leading-relaxed">
                Define what each role can do on VORA. Permissions apply to all team members assigned that role. Only Admins can modify role permissions.
              </div>

              {/* Role selector buttons */}
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setActiveRole(item.role)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeRole === item.role
                        ? 'bg-[#0047CC] text-white shadow-sm'
                        : 'bg-white border border-[#E6E6E6] text-[#4A4A4A] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Permissions Checklist Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F7F7F7]">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1A1A1A]">
                      {ROLE_ENUM_TO_LABEL[activeRole]} — Permissions
                    </h2>
                    <p className="text-xs text-[#808080] mt-0.5">
                      {activeRolePermCount} of {PERM_DEFS.length} permissions enabled
                    </p>
                  </div>
                  {activeRole === 'ADMIN' && (
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EBF6FF] text-[#0047CC] rounded-full">
                      Full Access
                    </span>
                  )}
                </div>

                <div className="divide-y divide-[#F7F7F7]">
                  {PERM_DEFS.map((p) => {
                    const isEnabled = Boolean(rolePerms[activeRole]?.[p.key]);
                    const isAdmin = activeRole === 'ADMIN';
                    return (
                      <div key={p.key} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-[#1A1A1A]">{p.label}</div>
                          <div className="text-[11px] text-[#808080] mt-0.5">{p.desc}</div>
                        </div>
                        <ToggleSwitch
                          checked={isAdmin || isEnabled}
                          disabled={isAdmin || updateRolePermsMutation.isPending}
                          onChange={() => togglePerm(p.key)}
                        />
                      </div>
                    );
                  })}
                </div>

                {activeRole === 'ADMIN' && (
                  <div className="mt-4 p-3 rounded-lg bg-[#F7F7F7] text-[12px] text-[#808080]">
                    Admin permissions cannot be restricted. Admins always have full platform access.
                  </div>
                )}
              </div>

              {/* Role Comparison Table */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm overflow-x-auto">
                <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Role Comparison Matrix</h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E6E6] text-[11px] font-bold text-[#808080] uppercase tracking-wider">
                      <th className="pb-3 pr-4">Permission</th>
                      {ROLE_OPTIONS.map((r) => (
                        <th key={r.role} className="pb-3 px-2 text-center whitespace-nowrap">
                          {r.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F7F7]">
                    {PERM_DEFS.map((p) => (
                      <tr key={p.key} className="hover:bg-[#F7F7F7]/50">
                        <td className="py-3 pr-4 font-medium text-[#1A1A1A] text-[12px]">{p.label}</td>
                        {ROLE_OPTIONS.map((r) => {
                          const hasIt = r.role === 'ADMIN' ? true : Boolean(rolePerms[r.role]?.[p.key]);
                          return (
                            <td key={r.role} className="py-3 px-2 text-center">
                              {hasIt ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EBF6FF] text-[#0047CC]">
                                  <CheckIcon size={11} />
                                </span>
                              ) : (
                                <span className="text-[#ADADAD] text-sm font-bold">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              4. BILLING & PAYMENTS
          ══════════════════════════════════════════ */}
          {activeSection === 'billing' && (
            <div className="space-y-4">
              {/* Current Plan */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Current Plan</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEFBEE] text-[#135813]">
                    {billingData?.plan?.status
                      ? billingData.plan.status.charAt(0).toUpperCase() + billingData.plan.status.slice(1).toLowerCase()
                      : billingData?.planStatus || 'Active'}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-[#1A1A1A]">
                    {billingData?.plan?.name
                      ? (billingData.plan.name.toLowerCase().includes('plan') ? billingData.plan.name : `${billingData.plan.name} Plan`)
                      : billingData?.planName || 'Growth Plan'}
                  </div>
                  <div className="text-xs text-[#808080] mt-1">
                    Up to {billingData?.plan?.seatLimit ?? billingData?.seatLimit ?? 10} seats · Unlimited job postings · Full VORA assessment suite
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={() => toast.success('Upgrade options sent to your registered email.')}
                  className="border-[#0047CC] text-[#0047CC] hover:bg-[#EBF6FF] text-xs font-bold"
                >
                  Upgrade Plan
                </Button>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Payment Method</h2>
                </div>
                {billingData?.paymentMethods && billingData.paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {billingData.paymentMethods.map((pm) => (
                      <div key={pm.id} className="flex items-center gap-4 flex-wrap p-3 border border-[#E6E6E6] rounded-lg">
                        <div className="w-12 h-8 bg-[#F7F7F7] border border-[#E6E6E6] rounded-md flex items-center justify-center text-xs font-extrabold text-[#1A1A1A]">
                          {pm.brand || 'CARD'}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#1A1A1A]">
                            {pm.brand || 'Card'} ending ••••{pm.last4 || '••••'}
                          </div>
                          <div className="text-[11px] text-[#808080]">
                            Expires {pm.expMonth || '00'}/{pm.expYear || '00'}
                          </div>
                        </div>
                        {pm.isDefault && (
                          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 bg-[#EEFBEE] text-[#135813] rounded">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E6E6E6] rounded-lg flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EBF6FF] flex items-center justify-center text-[#0047CC] shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#1A1A1A]">No payment method on file</div>
                        <div className="text-[11px] text-[#808080]">Add a credit or debit card to fund escrow and pay true-ups</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      fullWidth={false}
                      onClick={() => toast('Payment gateway integration in progress', { icon: '💳' })}
                      className="text-xs border-[#0047CC] text-[#0047CC] hover:bg-[#EBF6FF] font-bold"
                    >
                      + Add Card
                    </Button>
                  </div>
                )}
              </div>

              {/* Escrow Account & Wallet */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Escrow & Wallet Summary</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6]/60 rounded-xl p-4">
                    <div className="text-[11px] font-medium text-[#808080] mb-1">Current escrow balance</div>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#1A1A1A]">
                      ${Number(
                        billingData?.escrowSummary?.balance ??
                        billingData?.escrowSummary?.escrowBalance ??
                        billingData?.escrow?.balance ??
                        billingData?.escrow?.escrowBalance ??
                        0
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6]/60 rounded-xl p-4">
                    <div className="text-[11px] font-medium text-[#808080] mb-1">Pending true-up</div>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#387DFF]">
                      ${Number(
                        billingData?.escrowSummary?.pendingTrueUp ??
                        billingData?.escrow?.pendingTrueUp ??
                        0
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-[#F7F7F7] border border-[#E6E6E6]/60 rounded-xl p-4">
                    <div className="text-[11px] font-medium text-[#808080] mb-1">Wallet balance</div>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0047CC]">
                      ${Number(billingData?.walletBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={() => setActiveSection('data')}
                  className="text-xs border-[#0047CC] text-[#0047CC] hover:bg-[#EBF6FF] font-bold"
                >
                  View Audit Trail
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              5. NOTIFICATIONS
          ══════════════════════════════════════════ */}
          {activeSection === 'notifications' && (
            <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F7F7F7]">
                <h2 className="text-[16px] font-bold text-[#1A1A1A]">Notification Preferences</h2>
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  fullWidth={false}
                  onClick={handleSaveNotifications}
                  disabled={updateNotifsMutation.isPending || isNotifsLoading}
                  className="text-xs"
                >
                  {updateNotifsMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>

              {isNotifsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner size={24} className="text-[#0047CC]" />
                  <span className="text-xs text-[#808080]">Loading notification preferences…</span>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#F7F7F7]">
                    {NOTIF_ITEMS.map((item) => (
                      <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-[#1A1A1A]">{item.label}</div>
                          <div className="text-[11px] text-[#808080] mt-0.5">{item.desc}</div>
                        </div>
                        <ToggleSwitch
                          checked={Boolean(notifPreferences[item.key])}
                          onChange={() => toggleNotifItem(item.key)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E6E6E6]">
                    <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">
                      Delivery Frequency
                    </h3>
                    <div className="space-y-2.5 text-xs text-[#4A4A4A]">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryFreq"
                          checked={deliveryFrequency === 'instant'}
                          onChange={() => setDeliveryFrequency('instant')}
                          className="accent-[#0047CC] w-4 h-4"
                        />
                        <span>Instant (immediate alerts for critical hiring events)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryFreq"
                          checked={deliveryFrequency === 'daily'}
                          onChange={() => setDeliveryFrequency('daily')}
                          className="accent-[#0047CC] w-4 h-4"
                        />
                        <span>Daily digest (combined summary once per day at 09:00)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryFreq"
                          checked={deliveryFrequency === 'weekly'}
                          onChange={() => setDeliveryFrequency('weekly')}
                          className="accent-[#0047CC] w-4 h-4"
                        />
                        <span>Weekly summary (comprehensive activity report every Monday)</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              6. SECURITY
          ══════════════════════════════════════════ */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              {/* Password Card */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-4">Password</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-[420px]" autoComplete="off">
                  <Input
                    label="Current password"
                    type="password"
                    showPasswordToggle
                    placeholder="Enter current password"
                    value={passwords.current}
                    error={Boolean(passwordErrors.current)}
                    helperText={passwordErrors.current}
                    onChange={(e) => {
                      setPasswords({ ...passwords, current: e.target.value });
                      if (passwordErrors.current) {
                        setPasswordErrors((prev) => ({ ...prev, current: '' }));
                      }
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
                      if (passwordErrors.new) {
                        setPasswordErrors((prev) => ({ ...prev, new: '' }));
                      }
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
                    placeholder="Re-enter new password"
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
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    disabled={changePasswordMutation.isPending}
                    aria-disabled={!isPasswordFormValid}
                    className={`text-xs mt-2 transition-all ${
                      !isPasswordFormValid
                        ? '!bg-[#E6E6E6] !text-[#ADADAD] !cursor-not-allowed !shadow-none hover:!bg-[#E6E6E6]'
                        : ''
                    }`}
                  >
                    {changePasswordMutation.isPending ? 'Updating…' : 'Update Password'}
                  </Button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-3">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[13px] font-bold text-[#1A1A1A]">Authenticator app</div>
                    <div className="text-xs text-[#808080] mt-0.5">
                      Use an authenticator app to generate secure one-time verification codes.
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                    securityData?.twoFactorEnabled
                      ? 'bg-[#EEFBEE] text-[#135813] border-[#2CA62C]/40'
                      : 'bg-[#F7F7F7] text-[#808080] border-[#E6E6E6]'
                  }`}>
                    {securityData?.twoFactorEnabled ? 'Enabled' : 'Disabled (Coming Soon)'}
                  </span>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Active Sessions</h2>
                  {authSessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      pill={false}
                      fullWidth={false}
                      onClick={() => revokeOtherSessionsMutation.mutate()}
                      disabled={revokeOtherSessionsMutation.isPending}
                      className="text-xs border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      {revokeOtherSessionsMutation.isPending ? 'Signing out…' : 'Sign out other sessions'}
                    </Button>
                  )}
                </div>

                {isSessionsLoading ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size={20} className="text-[#0047CC]" />
                  </div>
                ) : (
                  <div className="divide-y divide-[#F7F7F7]">
                    {authSessions.length > 0 ? (
                      authSessions.map((s) => (
                        <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-[13px] font-bold text-[#1A1A1A]">
                              {s.deviceName || s.userAgent || 'Web Browser'}
                            </div>
                            <div className="text-xs text-[#808080]">
                              {s.ipAddress || s.ip || 'Unknown IP'} ·{' '}
                              {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : 'Active now'}
                            </div>
                          </div>
                          {s.isCurrent ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#EEFBEE] text-[#135813] rounded-full">
                              Current
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => revokeOtherSessionsMutation.mutate()}
                              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Sign out
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[13px] font-bold text-[#1A1A1A]">Current Session</div>
                          <div className="text-xs text-[#808080]">Active now</div>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-[#EEFBEE] text-[#135813] rounded-full">
                          Current
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              7. DATA & PRIVACY
          ══════════════════════════════════════════ */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              {/* Data Retention */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-2">Data Retention & Requests</h2>
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed mb-4">
                  VORA retains candidate assessment data for a minimum of 24 months to support audit trail compliance. You may request an export or deletion of organisation records where legally permitted.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={handleExportRequest}
                    disabled={exportMutation.isPending}
                    className="text-xs border-[#0047CC] text-[#0047CC] hover:bg-[#EBF6FF] font-bold"
                  >
                    {exportMutation.isPending ? 'Queuing Export…' : 'Request Data Export'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={() => setDeletionConfirmOpen(true)}
                    className="text-xs border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] font-bold"
                  >
                    Request Deletion
                  </Button>
                </div>
              </div>

              {/* Audit Trail Access */}
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-[16px] font-bold text-[#1A1A1A]">Audit Trail Access</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={handleDownloadAuditTrail}
                    className="text-xs font-bold"
                  >
                    Download Full Audit Trail
                  </Button>
                </div>
                <p className="text-[13px] text-[#4A4A4A] leading-relaxed mb-4">
                  Your full financial and hiring audit trail is recorded securely. This includes all fee calculations, escrow movements, hire confirmations, and rejection records with timestamps.
                </p>

                {isAuditLoading ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size={20} className="text-[#0047CC]" />
                  </div>
                ) : auditData?.items && auditData.items.length > 0 ? (
                  <div className="overflow-x-auto border border-[#E6E6E6] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F7F7] border-b border-[#E6E6E6]">
                        <tr>
                          <th className="py-2.5 px-3 font-bold text-[#4A4A4A]">Action</th>
                          <th className="py-2.5 px-3 font-bold text-[#4A4A4A]">Actor</th>
                          <th className="py-2.5 px-3 font-bold text-[#4A4A4A]">Details</th>
                          <th className="py-2.5 px-3 font-bold text-[#4A4A4A]">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F7F7F7]">
                        {auditData.items.slice(0, 10).map((log) => (
                          <tr key={log.id} className="hover:bg-[#F7F7F7]/50">
                            <td className="py-2.5 px-3 font-semibold text-[#1A1A1A]">{log.action}</td>
                            <td className="py-2.5 px-3 text-[#808080]">{log.actorEmail || log.actorRole || 'System'}</td>
                            <td className="py-2.5 px-3 text-[#4A4A4A]">{log.details || '—'}</td>
                            <td className="py-2.5 px-3 text-[#808080]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F7F7F7] rounded-lg text-xs text-[#808080] text-center">
                    No recent audit trail events recorded.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              8. OFFER TEMPLATES (Boot D)
          ══════════════════════════════════════════ */}
          {activeSection === 'templates' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E6E6E6] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F7F7F7] flex-wrap">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1A1A1A]">Offer Templates</h2>
                    <p className="text-xs text-[#808080] mt-0.5">
                      Manage library and custom contract templates for offer dispatches.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    pill={false}
                    fullWidth={false}
                    onClick={() => setUploadModalOpen(true)}
                    className="text-xs font-bold flex items-center gap-1.5"
                  >
                    <PlusIcon size={13} />
                    Upload Custom Template
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          templateCategory === cat
                            ? 'bg-[#0047CC] text-white'
                            : 'bg-[#F7F7F7] text-[#4A4A4A] hover:bg-[#E6E6E6]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Search templates…"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full sm:w-48 text-xs py-1.5 px-3 border border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#0047CC]"
                  />
                </div>

                {/* Template List */}
                {isTemplatesLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <Spinner size={24} className="text-[#0047CC]" />
                    <span className="text-xs text-[#808080]">Loading offer templates…</span>
                  </div>
                ) : offerTemplates.length > 0 ? (
                  <div className="divide-y divide-[#F7F7F7]">
                    {offerTemplates.map((tpl) => (
                      <div key={tpl.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#1A1A1A]">{tpl.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6FF] text-[#0047CC]">
                              {tpl.category}
                            </span>
                            {tpl.isCustom && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED]">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#808080] mt-0.5">
                            {tpl.createdAt ? `Added ${new Date(tpl.createdAt).toLocaleDateString()}` : 'VORA Standard Library'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#808080]">
                            {tpl.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          <ToggleSwitch
                            checked={tpl.isActive !== false}
                            onChange={() => handleToggleTemplateActive(tpl)}
                            disabled={updateTemplateMutation.isPending}
                          />
                          {tpl.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              disabled={deleteTemplateMutation.isPending}
                              title="Delete custom template"
                              className="p-1.5 text-[#808080] hover:text-[#DC2626] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileIcon}
                    title="No offer templates found"
                    description="Upload or manage contract templates for dispatching offer letters to candidates."
                    action={{
                      label: 'Upload Custom Template',
                      icon: PlusIcon,
                      onClick: () => setUploadModalOpen(true),
                    }}
                    className="my-2"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}

      {/* Invite Member Modal */}
      <ModalDialog
        open={inviteModalOpen}
        title="Invite Team Member"
        subtitle="Add a new team member and assign their platform permissions."
        onClose={() => setInviteModalOpen(false)}
        maxWidth="max-w-[460px]"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setInviteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={handleSendInvite}
              disabled={inviteMemberMutation.isPending}
              className="text-xs font-bold"
            >
              {inviteMemberMutation.isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSendInvite} className="space-y-4" autoComplete="off">
          <Input
            label="Email address"
            type="email"
            placeholder="recruiter@yourorg.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Assign role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as EmployerTeamMemberRole)}
            options={ROLE_OPTIONS.filter((r) => r.role !== 'ADMIN').map((r) => ({
              value: r.role,
              label: r.label,
            }))}
          />

          {/* Dynamic Role Hint */}
          <div className="bg-[#F7F7F7] border border-[#E6E6E6] rounded-lg p-3 text-xs text-[#4A4A4A] leading-relaxed">
            <strong className="text-[#1A1A1A]">{ROLE_ENUM_TO_LABEL[inviteRole]}:</strong>{' '}
            {PERM_DEFS.filter((p) => rolePerms[inviteRole]?.[p.key])
              .map((p) => p.label)
              .join(', ')}
          </div>
        </form>
      </ModalDialog>

      {/* Upload Custom Offer Template Modal */}
      <ModalDialog
        open={uploadModalOpen}
        title="Upload Custom Offer Template"
        subtitle="Upload a standard offer letter (.pdf or .docx) for your organization."
        onClose={() => setUploadModalOpen(false)}
        maxWidth="max-w-[460px]"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setUploadModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={handleUploadTemplateSubmit}
              disabled={isUploadingTemplate || createTemplateMutation.isPending}
              className="text-xs font-bold"
            >
              {isUploadingTemplate || createTemplateMutation.isPending ? 'Uploading…' : 'Upload Template'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadTemplateSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="Template name"
            placeholder="e.g. Senior Medical Officer Offer"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={newTemplateCategory}
            onChange={(e) => setNewTemplateCategory(e.target.value)}
            options={[
              { value: 'Standard', label: 'Standard' },
              { value: 'Clinical', label: 'Clinical' },
              { value: 'Executive', label: 'Executive' },
              { value: 'Contract', label: 'Contract' },
            ]}
          />

          <div>
            <label className="block text-xs font-bold text-[#4A4A4A] mb-1.5">
              Upload document (.pdf, .docx)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-[#4A4A4A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#EBF6FF] file:text-[#0047CC] hover:file:bg-[#BDD9FF]/40 cursor-pointer"
            />
          </div>
        </form>
      </ModalDialog>

      {/* Deletion Request Confirmation Modal */}
      <ModalDialog
        open={deletionConfirmOpen}
        title="Confirm Deletion Request"
        subtitle="Are you sure you want to request organization account and data deletion?"
        onClose={() => setDeletionConfirmOpen(false)}
        maxWidth="max-w-[420px]"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={() => setDeletionConfirmOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              pill={false}
              fullWidth={false}
              onClick={handleConfirmDeletion}
              disabled={deletionMutation.isPending}
              className="text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none"
            >
              {deletionMutation.isPending ? 'Submitting…' : 'Submit Deletion Request'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-[#4A4A4A] leading-relaxed">
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-[#DC2626] flex items-start gap-2.5">
            <AlertTriangleIcon size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> This request will be queued for compliance review. Certain assessment and transaction records are preserved for the statutory 24-month retention window.
            </div>
          </div>
          <p>
            You will be contacted by our data privacy compliance team once the request has been received and verified.
          </p>
        </div>
      </ModalDialog>
    </div>
  );
};

export default EmployerSettingsView;
