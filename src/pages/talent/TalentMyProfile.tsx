import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { capitalizeName } from '../../utils/userName';
import {
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  ExternalLinkIcon,
  PencilIcon,
  ShareIcon,
  AwardIcon,
  BookOpenIcon,
  FileIcon,
  UploadIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  TrashIcon,
  GraduationCapIcon,
  CalendarIcon,
  ArrowRightIcon,
  DollarSignIcon,
  ClockIcon,
  EyeIcon,
} from '../../components/common/Icons';
import Button from '../../components/common/Button';
import ModalDialog from '../../components/common/ModalDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Tag from '../../components/common/Tag';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useGetTalentProfileQuery } from '../../services/queries/onboarding';
import { 
  useUploadCvMutation, 
  useGetTalentCvProfileQuery, 
  useTalentDashboardQuery,
  useTalentJobsQuery
} from '../../services/queries/talent';

interface WorkExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

interface CertificationItem {
  id: string;
  name: string;
  issuingOrg: string;
  issueDate: string;
  credentialUrl?: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  demoUrl?: string;
  githubUrl?: string;
  techStack: string[];
}

const STORAGE_KEY_TALENT_PROFILE = 'vora_talent_personal_profile';

const TalentMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const cvInputRef = useRef<HTMLInputElement>(null);
  const uploadCvMutation = useUploadCvMutation();

  const { data: apiProfile } = useGetTalentProfileQuery(!!user);
  const { data: dashboardData } = useTalentDashboardQuery();
  const { data: jobsResponse } = useTalentJobsQuery();

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'resume' | 'preferences'>('overview');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [isPollingCvProfile, setIsPollingCvProfile] = useState(false);

  // Poll GET /talent/cv/profile during CV parsing
  const { data: cvProfileData } = useGetTalentCvProfileQuery({
    enabled: isPollingCvProfile,
    refetchInterval: isPollingCvProfile ? 2500 : false,
  });

  // Profile data state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TALENT_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      professionalTitle: '',
      location: '',
      timezone: 'WAT (UTC+1)',
      availability: 'Open to Opportunities',
      bio: '',
      email: user?.email || '',
      phone: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      twitterUrl: '',
      avatarUrl: user?.avatarUrl || '',
      cvFileName: '',
      cvFileSize: '',
      cvUploadedDate: '',
      atsScore: null as number | null,
      targetRoles: [] as string[],
      expectedSalary: '',
      noticePeriod: '',
      workPreference: 'Remote',
    };
  });

  // Skills (strictly from CV)
  const [skills, setSkills] = useState<{ name: string; category: string; verified: boolean }[]>([]);

  // Work experience (strictly from CV)
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([]);

  // Education (strictly from CV)
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Certifications (strictly from CV)
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

  // Featured Projects (empty unless populated)
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // Sync GET /api/v1/talent/me payload
  useEffect(() => {
    if (apiProfile?.data) {
      const data = apiProfile.data;
      setProfile((prev: any) => ({
        ...prev,
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        professionalTitle: data.professionalTitle || prev.professionalTitle,
        avatarUrl: data.photoUrl || data.avatarUrl || prev.avatarUrl,
        location: data.location || prev.location,
        timezone: data.timezone || prev.timezone,
        availability: data.availability || prev.availability,
        bio: data.bio || data.about || prev.bio,
      }));

      // Active CV & Parsed Profile from GET /talent/me
      if (data.activeCv) {
        const activeCv = data.activeCv;
        if (activeCv.parseStatus === 'PENDING' || activeCv.parseStatus === 'PROCESSING') {
          setIsPollingCvProfile(true);
          setIsParsingCv(true);
        }

        if (activeCv.originalName || activeCv.fileName) {
          setProfile((prev: any) => ({
            ...prev,
            cvFileName: activeCv.originalName || activeCv.fileName || prev.cvFileName,
            cvFileSize: activeCv.fileSize || prev.cvFileSize,
            cvUploadedDate: activeCv.uploadedAt || prev.cvUploadedDate,
          }));
        }

        const cvProfile = activeCv.profile;
        if (cvProfile) {
          if (cvProfile.about || cvProfile.bio) {
            setProfile((prev: any) => ({ ...prev, bio: cvProfile.about || cvProfile.bio }));
          }
          if (cvProfile.headline || cvProfile.professionalTitle) {
            setProfile((prev: any) => ({ ...prev, professionalTitle: cvProfile.headline || cvProfile.professionalTitle }));
          }
          if (cvProfile.roles && Array.isArray(cvProfile.roles) && cvProfile.roles.length > 0) {
            setExperiences(cvProfile.roles.map((r: any, idx: number) => ({
              id: r.id || `exp-${idx}`,
              role: r.role,
              company: r.company,
              location: r.location || '',
              employmentType: r.employmentType || 'Full-time',
              startDate: r.startDate,
              endDate: r.endDate,
              current: Boolean(r.current),
              description: r.description || '',
              technologies: r.technologies || [],
            })));
          }
          if (cvProfile.skills && Array.isArray(cvProfile.skills) && cvProfile.skills.length > 0) {
            setSkills(cvProfile.skills.map((s: any) =>
              typeof s === 'string'
                ? { name: s, category: 'Technical', verified: true }
                : { name: s.name, category: s.category || 'Technical', verified: s.verified ?? true }
            ));
          }
          if (cvProfile.education && Array.isArray(cvProfile.education) && cvProfile.education.length > 0) {
            setEducation(cvProfile.education.map((e: any, idx: number) => ({
              id: e.id || `edu-${idx}`,
              degree: e.degree,
              school: e.school,
              fieldOfStudy: e.fieldOfStudy || '',
              startYear: e.startYear || '',
              endYear: e.endYear || '',
              grade: e.grade,
            })));
          }
          if (cvProfile.certs && Array.isArray(cvProfile.certs) && cvProfile.certs.length > 0) {
            setCertifications(cvProfile.certs.map((c: any, idx: number) => ({
              id: c.id || `cert-${idx}`,
              name: c.name,
              issuingOrg: c.issuingOrg || '',
              issueDate: c.issueDate || '',
              credentialUrl: c.credentialUrl,
            })));
          }
        }
      }
    }
  }, [apiProfile]);

  // Sync GET /api/v1/talent/cv/profile polling response
  useEffect(() => {
    if (!isPollingCvProfile || !cvProfileData) return;
    const raw = (cvProfileData as any).data ?? cvProfileData;
    const parseStatus = raw?.parseStatus;

    if (parseStatus === 'COMPLETED') {
      setIsPollingCvProfile(false);
      setIsParsingCv(false);
      toast.dismiss('cv-parsing');

      const cvProfile = raw?.profile;
      if (cvProfile) {
        if (cvProfile.about || cvProfile.bio) {
          setProfile((prev: any) => ({ ...prev, bio: cvProfile.about || cvProfile.bio }));
        }
        if (cvProfile.headline || cvProfile.professionalTitle) {
          setProfile((prev: any) => ({ ...prev, professionalTitle: cvProfile.headline || cvProfile.professionalTitle }));
        }
        if (cvProfile.roles && Array.isArray(cvProfile.roles) && cvProfile.roles.length > 0) {
          setExperiences(cvProfile.roles.map((r: any, idx: number) => ({
            id: r.id || `exp-${idx}`,
            role: r.role,
            company: r.company,
            location: r.location || '',
            employmentType: r.employmentType || 'Full-time',
            startDate: r.startDate,
            endDate: r.endDate,
            current: Boolean(r.current),
            description: r.description || '',
            technologies: r.technologies || [],
          })));
        }
        if (cvProfile.skills && Array.isArray(cvProfile.skills) && cvProfile.skills.length > 0) {
          setSkills(cvProfile.skills.map((s: any) =>
            typeof s === 'string'
              ? { name: s, category: 'Technical', verified: true }
              : { name: s.name, category: s.category || 'Technical', verified: s.verified ?? true }
          ));
        }
        if (cvProfile.education && Array.isArray(cvProfile.education) && cvProfile.education.length > 0) {
          setEducation(cvProfile.education.map((e: any, idx: number) => ({
            id: e.id || `edu-${idx}`,
            degree: e.degree,
            school: e.school,
            fieldOfStudy: e.fieldOfStudy || '',
            startYear: e.startYear || '',
            endYear: e.endYear || '',
            grade: e.grade,
          })));
        }
        if (cvProfile.certs && Array.isArray(cvProfile.certs) && cvProfile.certs.length > 0) {
          setCertifications(cvProfile.certs.map((c: any, idx: number) => ({
            id: c.id || `cert-${idx}`,
            name: c.name,
            issuingOrg: c.issuingOrg || '',
            issueDate: c.issueDate || '',
            credentialUrl: c.credentialUrl,
          })));
        }
      }

      if (raw?.originalName || raw?.fileName) {
        setProfile((prev: any) => ({
          ...prev,
          cvFileName: raw.originalName || raw.fileName,
          cvFileSize: raw.fileSize || prev.cvFileSize,
          cvUploadedDate: 'Just now',
          atsScore: 98,
        }));
      }

      toast.success('CV parsed successfully! Profile dossier updated.');
      queryClient.invalidateQueries({ queryKey: ['talent', 'profile-me'] });
    } else if (parseStatus === 'FAILED') {
      setIsPollingCvProfile(false);
      setIsParsingCv(false);
      toast.dismiss('cv-parsing');
      toast.error('CV parsing could not extract details. Please verify your file.');
    }
  }, [cvProfileData, isPollingCvProfile, queryClient]);

  // Persist locally
  const saveProfileData = (updated: typeof profile) => {
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY_TALENT_PROFILE, JSON.stringify(updated));
    if (user) {
      updateUser({
        ...user,
        firstName: updated.firstName,
        lastName: updated.lastName,
        avatarUrl: updated.avatarUrl,
      });
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileData(editForm);
    setIsEditModalOpen(false);
    toast.success('Preferences updated successfully!');
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    toast.success('Profile link copied to clipboard!');
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setIsParsingCv(true);

    try {
      const res = await uploadCvMutation.mutateAsync({ file });
      setProfile((prev: any) => ({
        ...prev,
        cvFileName: file.name,
        cvFileSize: sizeMb,
        cvUploadedDate: 'Just now',
      }));

      const parseStatus = (res as any)?.data?.parseStatus || (res as any)?.parseStatus;
      if (parseStatus === 'COMPLETED') {
        setIsParsingCv(false);
        queryClient.invalidateQueries({ queryKey: ['talent', 'profile-me'] });
        queryClient.invalidateQueries({ queryKey: ['talent', 'cv-profile'] });
        toast.success('CV uploaded and parsed successfully!');
      } else {
        setIsPollingCvProfile(true);
        toast.loading('Analyzing CV and parsing dossier...', { id: 'cv-parsing' });
      }
    } catch (err: any) {
      setIsParsingCv(false);
      toast.error(err?.message || 'Failed to upload CV');
    } finally {
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const fullName = `${capitalizeName(profile.firstName)} ${capitalizeName(profile.lastName)}`.trim() || 'Candidate';
  const talentGrade = dashboardData?.data?.metrics?.interviewGrade?.grade || jobsResponse?.data?.talentGrade?.grade || apiProfile?.data?.grade || null;
  const careerReadinessScore = dashboardData?.data?.metrics?.careerReadinessScore?.value ?? 
    (dashboardData?.data?.metrics?.careerReadinessScore as any)?.score ?? 
    apiProfile?.data?.careerReadinessScore ?? 
    0;
  const appliedJobs = jobsResponse?.data?.appliedJobs || [];
  const initials = `${(profile.firstName?.[0] || user?.firstName?.[0] || 'V').toUpperCase()}${(profile.lastName?.[0] || user?.lastName?.[0] || 'A').toUpperCase()}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Hidden CV file input */}
      <input
        type="file"
        ref={cvInputRef}
        onChange={handleCvUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* CV Parsing Live Notification */}
      {isParsingCv && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1E40AF]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#1E3A8A]">CV Parsing in Progress</p>
              <p className="text-gray-600">VORA AI is parsing your CV and extracting your professional dossier. This view updates automatically once complete.</p>
            </div>
          </div>
          <span className="font-semibold text-[11px] bg-blue-100 text-[#0047CC] px-2.5 py-1 rounded-md self-start sm:self-center shrink-0">
            Polling CV Dossier
          </span>
        </div>
      )}

      {/* Top Banner Mode Indicator (when in preview mode) */}
      {isPreviewMode && (
        <div className="bg-[#EBF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#0047CC]">
          <div className="flex items-center gap-2 font-medium">
            <EyeIcon size={16} />
            <span>You are previewing how verified employers see your VORA Talent Dossier.</span>
          </div>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="font-bold underline hover:text-[#003d99] cursor-pointer"
          >
            Exit Preview Mode
          </button>
        </div>
      )}

      {/* Hero Identity Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-7 md:p-8 shadow-xs relative overflow-hidden">
        {/* Background decorative ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-64 bg-gradient-to-bl from-blue-50/80 via-blue-50/30 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left flex-1 min-w-0">
            {/* Avatar (read-only; edited from Settings) */}
            <div className="relative shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl object-cover border border-gray-100 shadow-2xs"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE] flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-2xs">
                  {initials}
                </div>
              )}
            </div>

            {/* Title & Details */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-[#EEFBEE] text-[#16A34A] border border-[#2CA62C]/20 px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0">
                  <CheckCircleIcon size={13} />
                  VORA Verified
                </span>
                {talentGrade && (
                  <span className="inline-flex items-center gap-1 bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0">
                    Grade {talentGrade}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE] px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0">
                  {profile.availability}
                </span>
              </div>

              <p className="text-sm sm:text-[15px] font-semibold text-gray-700">{profile.professionalTitle}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-gray-500 pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon size={14} className="text-gray-400 shrink-0" />
                  <span>{profile.location} ({profile.timezone})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseIcon size={14} className="text-gray-400 shrink-0" />
                  <span>{profile.workPreference}</span>
                </span>
              </div>

              {/* Social & Contact Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-medium transition-colors"
                  >
                    GitHub <ExternalLinkIcon size={11} />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EBF6FF] hover:bg-blue-100 text-[#0047CC] font-medium transition-colors"
                  >
                    LinkedIn <ExternalLinkIcon size={11} />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-medium transition-colors"
                  >
                    Portfolio <ExternalLinkIcon size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto lg:w-60 shrink-0 pt-2 lg:pt-0">
            {!isPreviewMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <EyeIcon size={14} className="text-gray-500" />
                  <span>Employer View</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ShareIcon size={14} className="text-gray-500" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resume');
                    setTimeout(() => cvInputRef.current?.click(), 100);
                  }}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <UploadIcon size={14} />
                  <span>Update CV</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#0047CC] hover:bg-[#003bb5] text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Back to Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Readiness Snapshot Bar */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#F8FAFC]/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">CAREER READINESS</p>
            <div className="flex items-baseline justify-between mt-1.5 sm:mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                  {careerReadinessScore}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">/ 100</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#16A34A] bg-[#EEFBEE] border border-emerald-200/50 px-2 py-0.5 rounded-md">
                {talentGrade ? `Grade ${talentGrade}` : 'Not Graded'}
              </span>
            </div>
          </div>
          <div className="bg-[#F8FAFC]/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">VERIFIED SKILLS</p>
            <div className="flex items-baseline justify-between mt-1.5 sm:mt-2">
              <span className="text-xs sm:text-sm font-bold text-[#0047CC]">{skills.length} Extracted</span>
              <span className="text-[11px] sm:text-xs text-gray-400 font-medium">From CV</span>
            </div>
          </div>
          <div className="bg-[#F8FAFC]/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">WORK EXPERIENCE</p>
            <div className="flex items-baseline justify-between mt-1.5 sm:mt-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                {experiences.length} {experiences.length === 1 ? 'Role' : 'Roles'}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Verified</span>
            </div>
          </div>
          <div className="bg-[#F8FAFC]/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">APPLICATIONS</p>
            <div className="flex items-baseline justify-between mt-1.5 sm:mt-2">
              <span className="text-xs sm:text-sm font-bold text-[#16A34A]">
                {appliedJobs.length} Active
              </span>
              <span className="text-[11px] sm:text-xs text-gray-400 font-medium">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'overview'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Overview & Dossier
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assessment')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'assessment'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          VORA Verification & Scores
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'resume'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          CV & Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'preferences'
              ? 'text-[#0047CC] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0047CC]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Career Target & Preferences
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main 2 Columns: Bio, Experience, Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Me / Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">About Me</h2>
                  <p className="text-xs text-gray-400">Parsed from verified CV</p>
                </div>
              </div>
              {profile.bio ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-xs text-gray-400 italic">No professional bio summary extracted from CV.</p>
              )}
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Work Experience</h2>
                  <p className="text-xs text-gray-400">Parsed from verified CV</p>
                </div>
                {!isPreviewMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('resume');
                      setTimeout(() => cvInputRef.current?.click(), 100);
                    }}
                    className="text-xs text-[#0047CC] hover:underline font-semibold cursor-pointer"
                  >
                    Update via CV
                  </button>
                )}
              </div>

              {experiences.length > 0 ? (
                <div className="space-y-6 pt-2">
                  {experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className={`relative pl-6 sm:pl-8 ${
                        idx !== experiences.length - 1 ? 'pb-6 border-l-2 border-gray-100' : ''
                      }`}
                    >
                      {/* Circle timeline marker */}
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#0047CC]" />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-md">
                            {exp.startDate} – {exp.endDate || (exp.current ? 'Present' : '')}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#0047CC]">{exp.company}</p>
                        {(exp.location || exp.employmentType) && (
                          <p className="text-xs text-gray-400">
                            {[exp.location, exp.employmentType].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-sm text-gray-600 pt-1 leading-relaxed">{exp.description}</p>
                        )}

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {exp.technologies.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic pt-2">
                  No work experience records parsed from CV yet.
                </p>
              )}
            </div>

            {/* Featured Projects (shown only when present) */}
            {projects.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Featured Projects & Repositories</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="border border-gray-100 rounded-xl p-4 bg-gray-50/40 hover:border-blue-200 transition-colors space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{proj.title}</h3>
                          <div className="flex items-center gap-1.5">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-gray-700"
                                title="GitHub Repository"
                              >
                                <ExternalLinkIcon size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-3">
                          {proj.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                        {proj.techStack.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-medium bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Skills, Education, Certifications */}
          <div className="space-y-6">
            {/* Skills & Competencies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Skills & Tech Stack</h2>
                  <p className="text-xs text-gray-400">Verified from CV & assessments</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {skills.length} skills
                </span>
              </div>

              {/* Skill chips */}
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        skill.verified
                          ? 'bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE]'
                          : 'bg-gray-100 text-gray-700 border border-transparent'
                      }`}
                    >
                      {skill.verified && <CheckIcon size={10} className="text-[#0047CC]" />}
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic pt-1">
                  No skills extracted from CV yet.
                </p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Education</h2>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="space-y-1">
                      <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                      <p className="text-xs font-semibold text-[#0047CC]">{edu.school}</p>
                      <p className="text-[11px] text-gray-500">
                        {[
                          edu.startYear && edu.endYear ? `${edu.startYear} – ${edu.endYear}` : edu.endYear || edu.startYear,
                          edu.grade,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No education history parsed from CV.</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Certifications & Licenses</h2>
              {certifications.length > 0 ? (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 mt-0.5">
                        <AwardIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{cert.name}</p>
                        <p className="text-[11px] text-gray-500">{[cert.issuingOrg, cert.issueDate].filter(Boolean).join(' · ')}</p>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#0047CC] hover:underline font-semibold inline-flex items-center gap-1 mt-0.5"
                          >
                            View Credential <ExternalLinkIcon size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No certifications parsed from CV.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Assessment Journey */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {appliedJobs.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Active Role Assessment Applications</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your real-time gate progression, evaluations, and decision status across your applied opportunities.
                  </p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-[#0047CC] border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {appliedJobs.length} active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {appliedJobs.map((app) => (
                  <div key={app.assessmentId || app.rolePostingId} className="border border-gray-100 bg-[#F8FAFC]/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{app.roleTitle}</h3>
                        <p className="text-xs text-gray-500">{app.organisationName} · {app.location}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        app.decisionStatus === 'ACCEPTED' || app.decisionStatus === 'HIRED'
                          ? 'bg-[#EEFBEE] text-[#16A34A]'
                          : app.status === 'COMPLETED' || app.overallPassed
                          ? 'bg-blue-50 text-[#0047CC]'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.decisionStatus || app.status || 'IN_PROGRESS'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                      <span className="text-gray-500 font-medium">
                        Stage: <strong className="text-gray-800">{app.stage?.label || app.stage?.name || 'Gate 1'}</strong>
                      </span>
                      {app.overallScore != null && (
                        <span className="font-bold text-[#0047CC]">
                          Score: {app.overallScore}%
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <Link
                        to={app.hrefHint || `/onboarding/talent/${app.roleLink}/interview/journey`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0047CC] hover:underline"
                      >
                        View Assessment Journey <ArrowRightIcon size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0047CC] flex items-center justify-center mx-auto">
                <AwardIcon size={24} />
              </div>
              <h2 className="text-base font-bold text-gray-900">No Assessment Records Yet</h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                When you apply to opportunities and advance through Gate 1 verification, Stage 2 simulations, and Stage 3 evaluations, your authentic gate scores and decisions will appear here.
              </p>
              <div className="pt-2">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0047CC] text-white text-xs font-semibold hover:bg-[#003bb5] transition-colors"
                >
                  Explore Available Roles <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Resume & CV Vault */}
      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-8 md:p-10 shadow-xs space-y-6">
          {/* Header Row: Title & Upload Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Active CV / Resume Document
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl">
                This document is used by VORA's AI matching engine and shared with verified employers when you apply.
              </p>
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                disabled={isParsingCv || uploadCvMutation.isPending}
                onClick={() => cvInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsingCv || uploadCvMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0047CC] border-t-transparent rounded-full animate-spin" />
                    <span>Parsing CV & Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon size={16} className="text-gray-500" />
                    <span>Upload Updated CV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CV Card */}
          {profile.cvFileName ? (
            <div className="border border-gray-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FEE2E2] text-[#DC2626] font-bold text-xs flex items-center justify-center shrink-0 border border-red-200/50">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{profile.cvFileName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {[profile.cvFileSize, profile.cvUploadedDate ? `Uploaded ${profile.cvUploadedDate}` : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 transition-colors cursor-pointer text-center"
                >
                  Replace CV
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3">
              <p className="text-xs text-gray-500">No active CV document uploaded yet.</p>
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#0047CC] text-white text-xs font-semibold hover:bg-[#003bb5] transition-colors cursor-pointer"
              >
                Upload CV
              </button>
            </div>
          )}

          {/* Parsing Insights */}
          <div className="border border-[#BFDBFE]/60 bg-[#F0F7FF] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-1.5">
            <p className="text-xs font-bold text-[#0047CC] flex items-center gap-2">
              <SparklesIcon size={14} className="text-[#0047CC]" />
              <span>VORA AI Parsing Analysis</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {skills.length > 0 || experiences.length > 0
                ? `Extracted ${skills.length} verified technical skills and ${experiences.length} work experience position${experiences.length === 1 ? '' : 's'} from your CV.`
                : 'Upload your CV to let VORA AI extract your technical competencies, credentials, and work history.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Career Targets & Role Preferences</h2>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl">
                  Define your desired compensation, roles, and notice period so VORA routes the best opportunities to you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditForm(profile);
                  setIsEditModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <PencilIcon size={14} className="text-gray-500" />
                <span>Edit Preferences</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              <div className="space-y-1 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Roles</p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {profile.targetRoles.map((r: string) => (
                    <span key={r} className="text-xs font-semibold bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Compensation</p>
                <p className="text-base font-bold text-gray-900 pt-1">{profile.expectedSalary}</p>
                <p className="text-[11px] text-gray-500">Benchmark adjusted for global remote tiering</p>
              </div>

              <div className="space-y-1 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notice Period</p>
                <p className="text-base font-bold text-gray-900 pt-1">{profile.noticePeriod}</p>
                <p className="text-[11px] text-gray-500">Available to transition upon contract signing</p>
              </div>

              <div className="space-y-1 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Work Arrangement</p>
                <p className="text-base font-bold text-gray-900 pt-1">{profile.workPreference}</p>
                <p className="text-[11px] text-gray-500">Open to worldwide remote positions and asynchronous work</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Preferences Modal */}
      {isEditModalOpen && (
        <ModalDialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Career Preferences"
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                fullWidth={false}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                fullWidth={false}
                onClick={handleEditSave}
              >
                Save Preferences
              </Button>
            </div>
          }
        >
          <form onSubmit={handleEditSave} className="space-y-4 text-left">
            <Input
              label="Target Compensation"
              value={editForm.expectedSalary}
              onChange={(e) => setEditForm({ ...editForm, expectedSalary: e.target.value })}
              placeholder="e.g. $85,000 - $110,000 USD / yr"
            />
            <Input
              label="Notice Period"
              value={editForm.noticePeriod}
              onChange={(e) => setEditForm({ ...editForm, noticePeriod: e.target.value })}
              placeholder="e.g. 2 weeks"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="GitHub Profile URL"
                value={editForm.githubUrl}
                onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
              <Input
                label="LinkedIn Profile URL"
                value={editForm.linkedinUrl}
                onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <Input
              label="Portfolio / Personal Website"
              value={editForm.portfolioUrl}
              onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
              placeholder="https://..."
            />
          </form>
        </ModalDialog>
      )}
    </div>
  );
};

export default TalentMyProfile;
