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
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Tag from '../../components/common/Tag';
import ModalDialog from '../../components/common/ModalDialog';
import { toast } from 'react-hot-toast';
import { useGetTalentProfileQuery } from '../../services/queries/onboarding';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const { data: apiProfile } = useGetTalentProfileQuery(!!user);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'resume' | 'preferences'>('overview');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
      firstName: user?.firstName || 'Tunde',
      lastName: user?.lastName || 'Adeyemi',
      professionalTitle: 'Senior Full Stack & AI Systems Engineer',
      location: 'Lagos, Nigeria',
      timezone: 'WAT (UTC+1)',
      availability: 'Open to Opportunities',
      bio: 'Staff-level engineer with 7+ years of experience building resilient distributed backends, high-throughput microservices, and AI workflow pipelines. Passionate about health tech, fintech scalability, and mentorship in emerging tech ecosystems.',
      email: user?.email || 'tunde.adeyemi@vora.ai',
      phone: '+234 802 345 6789',
      githubUrl: 'https://github.com/tundea-eng',
      linkedinUrl: 'https://linkedin.com/in/tunde-adeyemi',
      portfolioUrl: 'https://tundea.dev',
      twitterUrl: 'https://twitter.com/tunde_codes',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      cvFileName: 'Tunde_Adeyemi_Principal_CV.pdf',
      cvFileSize: '2.4 MB',
      cvUploadedDate: 'Aug 24, 2026',
      atsScore: 94,
      targetRoles: ['Lead Backend Engineer', 'Staff Full Stack Engineer', 'AI Integration Lead'],
      expectedSalary: '$85,000 - $110,000 USD / yr',
      noticePeriod: '2 weeks',
      workPreference: 'Remote (Worldwide)',
    };
  });

  // Skills
  const [skills, setSkills] = useState<{ name: string; category: string; verified: boolean }[]>([
    { name: 'TypeScript', category: 'Languages', verified: true },
    { name: 'Node.js', category: 'Backend', verified: true },
    { name: 'Python', category: 'Languages', verified: true },
    { name: 'React', category: 'Frontend', verified: true },
    { name: 'PostgreSQL', category: 'Databases', verified: true },
    { name: 'Go', category: 'Languages', verified: false },
    { name: 'AWS & Kubernetes', category: 'DevOps', verified: true },
    { name: 'GraphQL & REST', category: 'Backend', verified: true },
    { name: 'FastAPI', category: 'Backend', verified: true },
    { name: 'Distributed Systems', category: 'Architecture', verified: true },
    { name: 'Redis', category: 'Databases', verified: false },
    { name: 'Docker', category: 'DevOps', verified: true },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');

  // Work experience
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([
    {
      id: 'exp-1',
      role: 'Senior Full Stack Engineer',
      company: 'Helios Health Technologies',
      location: 'London, UK · Remote',
      employmentType: 'Full-time',
      startDate: 'Jan 2024',
      endDate: 'Present',
      current: true,
      description: 'Architected real-time epidemiological triage pipeline serving 40k+ healthcare providers. Reduced backend payload serialization latency by 45% via asynchronous microservices.',
      technologies: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
    },
    {
      id: 'exp-2',
      role: 'Backend Systems Engineer',
      company: 'PayFlex Global',
      location: 'Lagos, Nigeria · Hybrid',
      employmentType: 'Full-time',
      startDate: 'Mar 2021',
      endDate: 'Dec 2023',
      current: false,
      description: 'Engineered cross-border multi-currency payment ledger with automated settlement reconciliation and idempotency guarantees. Maintained 99.99% uptime during peak transactions.',
      technologies: ['Python', 'FastAPI', 'PostgreSQL', 'AWS ECS', 'Kafka'],
    },
  ]);

  // Education
  const [education, setEducation] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      degree: 'B.Sc. in Computer Science (First Class Honours)',
      school: 'University of Lagos',
      fieldOfStudy: 'Computer Systems & Software Engineering',
      startYear: '2016',
      endYear: '2020',
      grade: '4.85 / 5.0 CGPA',
    },
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuingOrg: 'Amazon Web Services',
      issueDate: 'May 2024',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuingOrg: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: 'Nov 2023',
      credentialUrl: 'https://cncf.io/certification',
    },
  ]);

  // Featured Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      title: 'Vora Distributed Job Queue',
      description: 'High-throughput transactional queue built with Redis Streams, supporting fair worker distribution, exponential backoff, and dead-letter telemetry.',
      demoUrl: 'https://queue-demo.vora.ai',
      githubUrl: 'https://github.com/tundea-eng/distributed-queue',
      techStack: ['Go', 'Redis', 'Docker', 'Prometheus'],
    },
    {
      id: 'proj-2',
      title: 'Clinical Case Reasoning Engine',
      description: 'Healthcare decision-support API that extracts clinical entities from patient notes and queries guideline vectors in under 120ms.',
      githubUrl: 'https://github.com/tundea-eng/clinical-reasoning',
      techStack: ['Python', 'FastAPI', 'Qdrant', 'OpenAI'],
    },
  ]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // Sync API profile if available
  useEffect(() => {
    if (apiProfile?.data) {
      setProfile((prev: any) => ({
        ...prev,
        firstName: apiProfile.data.firstName || prev.firstName,
        lastName: apiProfile.data.lastName || prev.lastName,
        professionalTitle: apiProfile.data.professionalTitle || prev.professionalTitle,
        avatarUrl: apiProfile.data.photoUrl || apiProfile.data.avatarUrl || prev.avatarUrl,
      }));
    }
  }, [apiProfile]);

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
    toast.success('Profile updated successfully!');
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    toast.success('Profile link copied to clipboard!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updated = { ...profile, avatarUrl: url };
    saveProfileData(updated);
    toast.success('Avatar updated!');
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const updated = {
      ...profile,
      cvFileName: file.name,
      cvFileSize: sizeMb,
      cvUploadedDate: 'Just now',
      atsScore: 96,
    };
    saveProfileData(updated);
    toast.success('CV re-uploaded and verified with ATS score 96%!');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error('Skill already exists in your profile');
      return;
    }
    setSkills((prev) => [
      ...prev,
      { name: newSkillName.trim(), category: newSkillCategory, verified: false },
    ]);
    setNewSkillName('');
    toast.success(`Added "${newSkillName.trim()}"`);
  };

  const handleRemoveSkill = (name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const fullName = `${capitalizeName(profile.firstName)} ${capitalizeName(profile.lastName)}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cvInputRef}
        onChange={handleCvUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Background decorative ambient glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with hover change overlay */}
            <div className="relative group shrink-0">
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
              />
              {!isPreviewMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change avatar"
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer gap-1"
                >
                  <PencilIcon size={16} />
                  <span>Update</span>
                </button>
              )}
            </div>

            {/* Title & Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#EEFBEE] text-[#2CA62C] border border-[#2CA62C]/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <CheckCircleIcon size={12} />
                  VORA Verified
                </span>
                <span className="inline-flex items-center gap-1 bg-[#EBF6FF] text-[#0047CC] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {profile.availability}
                </span>
              </div>

              <p className="text-base font-semibold text-gray-700">{profile.professionalTitle}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon size={14} className="text-gray-400" />
                  {profile.location} ({profile.timezone})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseIcon size={14} className="text-gray-400" />
                  {profile.workPreference}
                </span>
              </div>

              {/* Social & Contact Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    GitHub <ExternalLinkIcon size={11} />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                  >
                    LinkedIn <ExternalLinkIcon size={11} />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Portfolio <ExternalLinkIcon size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0 pt-2 md:pt-0">
            {!isPreviewMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  onClick={() => setIsPreviewMode(true)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <EyeIcon size={14} />
                  Employer View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  pill={false}
                  onClick={handleShareProfile}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <ShareIcon size={14} />
                  Share
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  onClick={() => {
                    setEditForm(profile);
                    setIsEditModalOpen(true);
                  }}
                  className="gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <PencilIcon size={14} />
                  Edit Profile
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={() => setIsPreviewMode(false)}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                Back to Edit Mode
              </Button>
            )}
          </div>
        </div>

        {/* Readiness Snapshot Bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Career Readiness</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-gray-900">88</span>
              <span className="text-xs text-gray-400">/ 100</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                Tier 1
              </span>
            </div>
          </div>
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Gate 1 Context</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-emerald-700">Verified</span>
              <span className="text-xs text-gray-500 ml-auto">94% Fit</span>
            </div>
          </div>
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stage 2 Simulation</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-blue-700">92% Score</span>
              <span className="text-xs text-gray-500 ml-auto">Top 5%</span>
            </div>
          </div>
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stage 3 Deep-Dive</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-purple-700">Completed</span>
              <span className="text-xs text-gray-500 ml-auto">AI Evaluated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
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
                <h2 className="text-base font-bold text-gray-900">About Me</h2>
                {!isPreviewMode && (
                  <button
                    onClick={() => {
                      setEditForm(profile);
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs text-[#0047CC] hover:underline font-semibold"
                  >
                    Edit Bio
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Work Experience</h2>
                {!isPreviewMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    pill={false}
                    onClick={() => setIsAddExpModalOpen(true)}
                    className="text-xs gap-1 py-1"
                  >
                    <PlusIcon size={13} />
                    Add Experience
                  </Button>
                )}
              </div>

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
                          {exp.startDate} – {exp.endDate}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#0047CC]">{exp.company}</p>
                      <p className="text-xs text-gray-400">{exp.location} · {exp.employmentType}</p>
                      <p className="text-sm text-gray-600 pt-1 leading-relaxed">{exp.description}</p>

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
            </div>

            {/* Featured Projects */}
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
          </div>

          {/* Right Sidebar: Skills, Education, Certifications */}
          <div className="space-y-6">
            {/* Skills & Competencies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Skills & Tech Stack</h2>
                <span className="text-xs text-gray-400">{skills.length} skills</span>
              </div>

              {/* Skill chips */}
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
                    {!isPreviewMode && (
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-gray-400 hover:text-red-500 ml-0.5"
                      >
                        <CloseIcon size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add Skill form */}
              {!isPreviewMode && (
                <form onSubmit={handleAddSkill} className="pt-2 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Add a new skill (e.g. GraphQL)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#0047CC]"
                  />
                  <Button type="submit" variant="outline" size="sm" pill={false} className="text-xs px-3">
                    Add
                  </Button>
                </form>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Education</h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-xs font-semibold text-[#0047CC]">{edu.school}</p>
                    <p className="text-[11px] text-gray-500">
                      {edu.startYear} – {edu.endYear} {edu.grade ? `· ${edu.grade}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Certifications & Licenses</h2>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0047CC] flex items-center justify-center shrink-0 mt-0.5">
                      <AwardIcon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{cert.name}</p>
                      <p className="text-[11px] text-gray-500">{cert.issuingOrg} · {cert.issueDate}</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Assessment Journey */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">VORA Standardized Assessment Journey</h2>
              <p className="text-xs text-gray-500 mt-1">
                Your performance scores across objective clinical, architectural, and reasoning simulations verified by VORA AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1 */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    Gate 1 · Passed
                  </span>
                  <span className="text-lg font-bold text-emerald-800">94%</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">CV & Profile Context Match</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  High alignment between verified past responsibilities and senior architectural expectations. No cognitive discrepancy detected.
                </p>
              </div>

              {/* Stage 2 */}
              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-full">
                    Stage 2 · Simulation
                  </span>
                  <span className="text-lg font-bold text-blue-800">92%</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Technical & Systems Reasoning</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Demonstrated deep mastery of asynchronous throughput, edge failure mitigation, and distributed database isolation.
                </p>
              </div>

              {/* Stage 3 */}
              <div className="border border-purple-200 bg-purple-50/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 bg-purple-100/80 px-2.5 py-1 rounded-full">
                    Stage 3 · Video Analysis
                  </span>
                  <span className="text-lg font-bold text-purple-800">89%</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">Communication & Leadership</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Clear articulation of complex engineering trade-offs, structured conflict resolution, and cross-functional empathy.
                </p>
              </div>
            </div>

            {/* Competency Breakdown Matrix */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Domain Competency Ratings</h3>
              <div className="space-y-3">
                {[
                  { name: 'System Architecture & Scalability', score: 94, color: 'bg-blue-600' },
                  { name: 'API Engineering & Data Consistency', score: 92, color: 'bg-emerald-600' },
                  { name: 'Problem Formulation & Analytical Rigor', score: 89, color: 'bg-purple-600' },
                  { name: 'Technical Communication & Leadership', score: 90, color: 'bg-amber-600' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>{item.name}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Resume & CV Vault */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active CV / Resume Document</h2>
                <p className="text-xs text-gray-500 mt-1">
                  This document is used by VORA's AI matching engine and shared with verified employers when you apply.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => cvInputRef.current?.click()}
                className="gap-2 text-xs font-semibold shrink-0"
              >
                <UploadIcon size={14} />
                Upload Updated CV
              </Button>
            </div>

            {/* CV Card */}
            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm shrink-0 border border-red-100">
                  PDF
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{profile.cvFileName}</p>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ATS Match: {profile.atsScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {profile.cvFileSize} · Uploaded {profile.cvUploadedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  pill={false}
                  onClick={() => toast.success(`Downloading ${profile.cvFileName}...`)}
                  className="text-xs font-semibold flex-1 sm:flex-none"
                >
                  Download CV
                </Button>
              </div>
            </div>

            {/* Parsing Insights */}
            <div className="border border-blue-100 bg-[#EBF6FF]/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#0047CC] flex items-center gap-1.5">
                <SparklesIcon size={14} />
                VORA AI Parsing Analysis
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your CV was parsed with high structural clarity. Key technical taxonomies (Microservices, Distributed Ledger, Kubernetes) and quantified metrics (e.g. 45% latency improvement) were highlighted to hiring teams.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Career Targets & Role Preferences</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Define your desired compensation, roles, and notice period so VORA routes the best opportunities to you.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => {
                  setEditForm(profile);
                  setIsEditModalOpen(true);
                }}
                className="text-xs gap-1.5"
              >
                <PencilIcon size={13} />
                Edit Preferences
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <ModalDialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Talent Profile"
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={handleEditSave}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleEditSave} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Professional Headline / Title"
              value={editForm.professionalTitle}
              onChange={(e) => setEditForm({ ...editForm, professionalTitle: e.target.value })}
              placeholder="e.g. Senior Full Stack & AI Systems Engineer"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="e.g. Lagos, Nigeria"
              />
              <Input
                label="Timezone"
                value={editForm.timezone}
                onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                placeholder="e.g. WAT (UTC+1)"
              />
            </div>

            <Textarea
              label="Bio & Professional Summary"
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={4}
              placeholder="Write a concise overview of your background, experience, and what you build..."
            />

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
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

      {/* Add Experience Modal */}
      {isAddExpModalOpen && (
        <ModalDialog
          isOpen={isAddExpModalOpen}
          onClose={() => setIsAddExpModalOpen(false)}
          title="Add Work Experience"
          actions={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                pill={false}
                onClick={() => setIsAddExpModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill={false}
                onClick={() => {
                  toast.success('Experience record added!');
                  setIsAddExpModalOpen(false);
                }}
              >
                Save Experience
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            <Input label="Role / Job Title" placeholder="e.g. Senior Backend Engineer" required />
            <Input label="Company Name" placeholder="e.g. Stripe, Paystack" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" placeholder="e.g. Jan 2023" />
              <Input label="End Date" placeholder="e.g. Present" />
            </div>
            <Input label="Location" placeholder="e.g. Remote / Lagos" />
            <Textarea label="Responsibilities & Impact" placeholder="Describe your responsibilities, technical architecture, and quantifiable outcomes..." rows={3} />
          </div>
        </ModalDialog>
      )}
    </div>
  );
};

export default TalentMyProfile;
