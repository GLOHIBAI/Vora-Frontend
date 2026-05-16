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
  <div className={`bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {title && <h3 className="text-[13px] font-black text-gray-900 mb-8 uppercase tracking-[0.2em]">{title}</h3>}
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1440px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <h1 className="text-[32px] font-black text-[#0047CC] font-['Nunito_Sans'] tracking-tight">Talents</h1>
        
        <button
          onClick={() => navigate('/talents')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0047CC] transition-colors group cursor-pointer self-start"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
            <ChevronLeftIcon size={16} strokeWidth={3} className="text-gray-400 group-hover:text-[#0047CC]" />
          </div>
          <span className="text-[14px] font-black tracking-tight">{id || data.id}</span>
        </button>
      </div>

      {/* Masonry Grid Layout */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
        {/* Left Column (Main Identity & Job Card) */}
        <div className="break-inside-avoid mb-8">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all duration-500 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[24px] overflow-hidden border-4 border-gray-50 shadow-sm shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                  alt="Talent Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h2 className="text-[26px] font-black text-gray-900 leading-tight truncate">ID: {data.id}</h2>
                <p className="text-[16px] font-bold text-gray-400 truncate">{data.role}</p>
                <div className="flex items-center gap-4 text-[12px] font-black text-gray-400 pt-2">
                  <span className="flex items-center gap-1.5 shrink-0 bg-gray-50 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {data.location}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0 bg-gray-50 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {data.experienceYears}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-[24px] p-6 space-y-4 border border-gray-50">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Applied job</p>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Date: {data.appliedDate}</p>
              </div>
              <p className="text-[15px] font-black text-gray-800 leading-snug">
                {data.appliedJob}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Status:</span>
                <span className="px-3 py-1 rounded-full bg-[#FFF8F1] text-[#FF9500] text-[11px] font-black border border-[#FF9500]/10">
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Overview */}
        <div className="break-inside-avoid mb-8">
          <div className="space-y-6">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.15em] ml-2">Assessment overview</h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-[#EBF6FF] p-8 rounded-[32px] space-y-4 relative overflow-hidden group border border-blue-100/20 shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[13px] font-black text-[#0047CC] uppercase tracking-widest">Pyschometric Test</p>
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#2CA62C] bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-green-100/30">
                    <ArrowUpIcon size={14} strokeWidth={3} className="rotate-45" />
                    Top 1%
                  </div>
                </div>
                <p className="text-[48px] font-black text-[#0047CC] relative z-10 tracking-tight">{data.assessment.psychometric.score}%</p>
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <BriefcaseIcon size={120} />
                </div>
              </div>

              <div className="bg-[#F0F7FF] p-8 rounded-[32px] space-y-4 relative overflow-hidden group border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[13px] font-black text-[#0047CC] uppercase tracking-widest">Situational Test</p>
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#2CA62C] bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-green-100/30">
                    <ArrowUpIcon size={14} strokeWidth={3} className="rotate-45" />
                    Top 1%
                  </div>
                </div>
                <p className="text-[48px] font-black text-[#0047CC] relative z-10 tracking-tight">{data.assessment.situational.score}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Intro */}
        <div className="break-inside-avoid mb-8">
          <div className="relative aspect-video rounded-[32px] overflow-hidden group cursor-pointer shadow-md border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
              alt="Applicant Video"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 bg-white/30 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                <PlayIcon size={32} className="text-white ml-1.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="break-inside-avoid mb-8">
          <ProfileCard title="Professional Information">
            <div className="space-y-10 pt-4">
              <div className="space-y-4">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0047CC]" /> About
                </p>
                <p className="text-[16px] text-gray-600 leading-relaxed font-medium">
                  {data.about}
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0047CC]" /> Skills
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {data.skills.map((skill, idx) => (
                    <SkillPill key={idx} label={skill.label} variant={skill.variant} />
                  ))}
                </div>
              </div>
            </div>
          </ProfileCard>
        </div>

        {/* Action Buttons */}
        <div className="break-inside-avoid mb-8">
          <div className="flex flex-col gap-4">
            <button className="w-full py-6 bg-[#0047CC] text-white rounded-full text-[18px] font-black hover:bg-[#003d99] transition-all shadow-xl shadow-blue-500/20 cursor-pointer active:scale-[0.98] transform">
              Hire applicant
            </button>
            <button 
              onClick={() => navigate(`/jobs/0/reject/${id || data.id}`)}
              className="w-full py-6 bg-white text-gray-700 rounded-full text-[18px] font-black hover:bg-gray-50 transition-all border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transform"
            >
              Reject applicant
            </button>
          </div>
        </div>

        {/* Experience */}
        <div className="break-inside-avoid mb-8">
          <ProfileCard title="Experience">
            <div className="relative space-y-12 pl-8 pt-6">
              {/* Timeline Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-50" />
              
              {data.experience.map((exp, idx) => (
                <div key={idx} className="relative space-y-3">
                  <div className="absolute -left-[30px] top-1.5 w-5 h-5 rounded-full bg-[#0047CC] border-4 border-white ring-1 ring-gray-100 z-10 shadow-sm" />
                  <h4 className="text-[18px] font-black text-gray-900 leading-tight tracking-tight">{exp.title}</h4>
                  <p className="text-[12px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">{exp.period}</p>
                  <p className="text-[15px] text-gray-500 leading-relaxed pt-2 font-medium">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </ProfileCard>
        </div>

        {/* Education & Certifications */}
        <div className="break-inside-avoid mb-8">
          <ProfileCard title="Education & Certifications">
            <div className="space-y-12 pt-6">
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-4 group">
                  <div className="flex items-start justify-between">
                    <h4 className="text-[17px] font-black text-gray-900 leading-tight group-hover:text-[#0047CC] transition-colors">{edu.title}</h4>
                    <span className="text-[11px] font-black text-gray-400 border border-gray-100 px-3 py-1 rounded-full shrink-0 uppercase tracking-widest">{edu.period}</span>
                  </div>
                  {edu.institution && (
                    <p className="text-[15px] font-bold text-gray-400 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gray-200" /> {edu.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ProfileCard>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
