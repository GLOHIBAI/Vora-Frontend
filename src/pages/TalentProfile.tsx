import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_TALENT_PROFILE } from '../constants/mockData';
import { 
  ChevronLeftIcon, 
  PlayIcon, 
  ArrowUpIcon,
  BriefcaseIcon
} from '../components/common/Icons';

// --- Sub-components ---

const ProfileCard: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm ${className}`}>
    {title && <h3 className="text-[16px] font-bold text-gray-900 mb-8 uppercase tracking-tight">{title}</h3>}
    {children}
  </div>
);

const SkillPill: React.FC<{ label: string; variant: string }> = ({ label, variant }) => {
  const styles: Record<string, string> = {
    blue: 'bg-[#EBF6FF] text-[#0047CC] border-transparent',
    green: 'bg-[#EEFBEE] text-[#2CA62C] border-transparent',
    'green-light': 'bg-[#F0FFF4] text-[#38A169] border-[#C6F6D5]',
    red: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
    gray: 'bg-[#F9FAFB] text-gray-600 border-gray-200',
    'blue-light': 'bg-[#EBF6FF] text-[#0047CC] border-transparent',
  };

  return (
    <span className={`px-4 py-2 rounded-full text-[12px] font-bold border ${styles[variant] || styles.gray}`}>
      {label}
    </span>
  );
};

const TalentProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = SAMPLE_TALENT_PROFILE;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-[28px] font-bold text-gray-900 font-['Nunito_Sans'] tracking-tight">Talents</h1>
        
        <button
          onClick={() => navigate('/talents')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group cursor-pointer"
        >
          <ChevronLeftIcon size={18} strokeWidth={2.5} className="text-gray-400" />
          <span className="text-[15px] font-bold">{id || data.id}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[380px,1fr] gap-8 items-start">
        {/* Left Column (Sidebar) */}
        <div className="space-y-8">
          {/* Main Identity & Job Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                  alt="Talent Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h2 className="text-[22px] font-bold text-gray-900 leading-tight truncate">ID: {data.id}</h2>
                <p className="text-[15px] font-bold text-gray-500 truncate">{data.role}</p>
                <div className="flex items-center gap-4 text-[12px] font-bold text-gray-400 pt-1">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {data.location}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {data.experienceYears}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-6 space-y-4 border border-gray-50">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Applied job</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Date: {data.appliedDate}</p>
              </div>
              <p className="text-[14px] font-bold text-gray-800 leading-snug">
                {data.appliedJob}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400">Status:</span>
                <span className="px-3 py-1 rounded-full bg-[#FFF8F1] text-[#FF9500] text-[11px] font-bold border border-[#FF9500]/10">
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Overview */}
          <div className="space-y-5">
            <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-tight ml-2">Assessment overview</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#EBF6FF] p-6 rounded-[24px] space-y-2 relative overflow-hidden group border border-blue-100/20">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[13px] font-bold text-[#0047CC] uppercase tracking-wide">Pyschometric Test</p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#2CA62C] bg-white/50 px-2 py-0.5 rounded-full border border-green-100/30">
                    <ArrowUpIcon size={14} strokeWidth={3} className="rotate-45" />
                    Top 1%
                  </div>
                </div>
                <p className="text-[36px] font-bold text-[#0047CC] relative z-10">{data.assessment.psychometric.score}%</p>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <BriefcaseIcon size={100} />
                </div>
              </div>

              <div className="bg-[#F0F7FF] p-6 rounded-[24px] space-y-2 relative overflow-hidden group border border-blue-50">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[13px] font-bold text-[#0047CC] uppercase tracking-wide">Situational Test</p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#2CA62C] bg-white/50 px-2 py-0.5 rounded-full border border-green-100/30">
                    <ArrowUpIcon size={14} strokeWidth={3} className="rotate-45" />
                    Top 1%
                  </div>
                </div>
                <p className="text-[36px] font-bold text-[#0047CC] relative z-10">{data.assessment.situational.score}%</p>
              </div>
            </div>
          </div>

          {/* Video Intro */}
          <div className="relative aspect-video rounded-[24px] overflow-hidden group cursor-pointer shadow-sm border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
              alt="Applicant Video"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <PlayIcon size={28} className="text-white ml-1" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <button className="w-full py-5 bg-[#0047CC] text-white rounded-full text-[16px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]">
              Hire applicant
            </button>
            <button 
              onClick={() => navigate(`/jobs/0/reject/${id || data.id}`)}
              className="w-full py-5 bg-[#F9FAFB] text-gray-700 rounded-full text-[16px] font-bold hover:bg-gray-100 transition-all border border-gray-100 cursor-pointer active:scale-[0.98]"
            >
              Reject applicant
            </button>
          </div>
        </div>

        {/* Right Column (Main Content) */}
        <div className="space-y-8 min-w-0">
          {/* Professional Information */}
          <ProfileCard title="Professional Information">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">About</p>
                <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                  {data.about}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">Skills</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {data.skills.map((skill, idx) => (
                    <SkillPill key={idx} label={skill.label} variant={skill.variant} />
                  ))}
                </div>
              </div>
            </div>
          </ProfileCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Experience */}
            <ProfileCard title="Experience">
              <div className="relative space-y-12 pl-6">
                {/* Timeline Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" />
                
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="relative space-y-3">
                    <div className="absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full bg-[#0047CC] border-4 border-white ring-1 ring-gray-100 z-10" />
                    <h4 className="text-[16px] font-bold text-gray-900 leading-tight">{exp.title}</h4>
                    <p className="text-[12px] font-bold text-gray-400">{exp.period}</p>
                    <p className="text-[14px] text-gray-500 leading-relaxed pt-1 font-medium">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </ProfileCard>

            {/* Education & Certifications */}
            <ProfileCard title="Education & Certifications">
              <div className="space-y-10">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-[15px] font-bold text-gray-900 leading-tight">{edu.title}</h4>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tight">{edu.period}</p>
                    {edu.institution && (
                      <p className="text-[14px] font-bold text-gray-500">{edu.institution}</p>
                    )}
                  </div>
                ))}
              </div>
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
