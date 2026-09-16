import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_TALENT_PROFILE } from '../../constants/mockData';
import { 
  ChevronLeftIcon, 
  PlayIcon, 
  ArrowUpIcon,
  CloseIcon,
  LocationIcon,
  BriefcaseIcon
} from '../../components/common/Icons';
import { toast } from 'react-hot-toast';

const TalentProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const data = SAMPLE_TALENT_PROFILE;
  const displayId = id || data.id;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1360px] mx-auto px-4 sm:px-6">
      {/* Top Back Navigation */}
      <div className="pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2.5 text-gray-900 hover:text-[#0047CC] transition-colors cursor-pointer bg-transparent border-none p-0 group font-bold text-[18px]"
        >
          <ChevronLeftIcon size={20} strokeWidth={2.5} className="text-gray-700 transition-transform group-hover:-translate-x-1" />
          <span>{displayId}</span>
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Identity, Assessment Overview, Actions) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity & Applied Job Card */}
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                  alt="Talent Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                  ID: {displayId}
                </h2>
                <p className="text-[13px] text-gray-500 font-normal">{data.role}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5 font-normal">
                  <span className="flex items-center gap-1">
                    <LocationIcon size={12} className="text-gray-400" />
                    {data.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <BriefcaseIcon size={12} className="text-gray-400" />
                    {data.experienceYears}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F0F2F5] rounded-[16px] p-4 space-y-2.5">
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium">
                <span>Applied Job</span>
                <span>Date: {data.appliedDate}</span>
              </div>
              <p className="text-[13px] font-bold text-gray-900 leading-snug">
                {data.appliedJob}
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[12px]">
                <span className="text-gray-500 font-normal">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#A16207] text-[11px] font-medium">
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          {/* Interview Overview */}
          <div className="space-y-3">
            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Interview overview</h3>
            
            <div className="space-y-3">
              {/* Psychometric Card */}
              <div className="bg-[#EFF6FF] p-5 rounded-[18px] border border-blue-100/60 space-y-1">
                <p className="text-[13px] font-medium text-gray-700">Psychometric Interview</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-[34px] font-bold text-gray-900 leading-none">{data.assessment.psychometric.score}%</span>
                  <span className="text-[12px] font-semibold text-[#16A34A] flex items-center gap-1">
                    <ArrowUpIcon size={13} className="rotate-45" /> Top 1%
                  </span>
                </div>
              </div>

              {/* Situational Card */}
              <div className="bg-[#EFF6FF] p-5 rounded-[18px] border border-blue-100/60 space-y-1">
                <p className="text-[13px] font-medium text-gray-700">Situational Interview</p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-[34px] font-bold text-gray-900 leading-none">{data.assessment.situational.score}%</span>
                  <span className="text-[12px] font-semibold text-[#16A34A] flex items-center gap-1">
                    <ArrowUpIcon size={13} className="rotate-45" /> Top 1%
                  </span>
                </div>
              </div>

              {/* Video Preview */}
              <div className="relative aspect-video rounded-[18px] overflow-hidden group cursor-pointer shadow-xs border border-gray-100 mt-3">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                  alt="Applicant Video"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-13 h-13 bg-black/40 backdrop-blur-xs rounded-full flex items-center justify-center border border-white/60 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <PlayIcon size={22} className="text-white ml-0.5 fill-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Left column, below video) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setIsHireModalOpen(true)}
              className="w-full py-3 px-6 bg-[#0052CC] hover:bg-[#0047CC] text-white rounded-full font-semibold text-[15px] shadow-xs cursor-pointer transition-all active:scale-[0.99]"
            >
              Hire applicant
            </button>
            <button 
              type="button"
              onClick={() => navigate(`/jobs/0/reject/${displayId}`)}
              className="w-full py-3 px-6 bg-[#FAFAFA] hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-full font-semibold text-[15px] cursor-pointer transition-all active:scale-[0.99]"
            >
              Reject applicant
            </button>
          </div>
        </div>

        {/* Right Column (Professional Information, Experience, Education) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Professional Information Card */}
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5">
            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Professional Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-[13px] font-bold text-gray-900">About</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {data.about}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-[13px] font-bold text-gray-900">Skills</h4>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-blue-50/60 text-blue-600 border border-blue-300">Research Analysis</span>
                  <span className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-amber-50/60 text-amber-600 border border-amber-300">Research Analysis</span>
                  <span className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-green-50/60 text-green-600 border border-green-300">Research Analysis</span>
                  <span className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-rose-50/60 text-rose-500 border border-rose-300">Research Analysis</span>
                  <span className="px-3.5 py-1 rounded-full text-[12px] font-medium bg-gray-50 text-gray-600 border border-gray-300">Research Analysis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2-Card Grid (Experience & Education) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Experience Card */}
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5 flex flex-col">
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Experience</h3>
              
              <div className="relative space-y-7 pl-6 flex-1">
                {/* Vertical line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200" />
                
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="relative space-y-2">
                    <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full bg-[#0052CC] ring-4 ring-[#FAFAFA]" />
                    <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{exp.title}</h4>
                    <span className="text-[11px] font-medium text-[#0052CC] bg-[#EBF3FE] px-2.5 py-0.5 rounded-full inline-block">{exp.period}</span>
                    <p className="text-[12px] text-gray-500 leading-relaxed pt-0.5">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Certifications Card */}
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-[20px] p-7 space-y-5 flex flex-col">
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Education & Certifications</h3>
              
              <div className="space-y-6 flex-1">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{edu.title}</h4>
                      <span className="text-[11px] text-gray-400 shrink-0">{edu.period}</span>
                    </div>
                    {edu.institution && (
                      <p className="text-[12px] text-gray-400">
                        {edu.institution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire Applicant Confirmation Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-gray-900">Hire applicant</h3>
              <button 
                onClick={() => setIsHireModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              You are about to hire <span className="font-semibold text-[#0047CC]">{displayId}</span> for this role. The applicant will be notified and the job record will be updated.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsHireModalOpen(false)}
                className="flex-1 py-3.5 px-5 rounded-full border border-gray-200 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHireModalOpen(false);
                  toast.success(`Successfully hired applicant ${displayId}!`);
                }}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#0047CC] text-white text-[15px] font-medium hover:bg-[#003d99] transition-colors shadow-lg shadow-blue-500/25 cursor-pointer"
              >
                Hire applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentProfile;
