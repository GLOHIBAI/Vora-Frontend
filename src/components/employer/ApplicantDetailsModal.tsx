import React, { useEffect, useState } from 'react';
import { CloseIcon, PlayIcon, ArrowUpIcon } from '../common/Icons';

interface ApplicantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any;
  onReject: () => void;
  onHire: () => void;
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  applicant, 
  onReject, 
  onHire 
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender || !applicant) return null;

  const code = applicant.applicantCode || applicant.name || applicant.id || 'APP-12345345';
  const academicLevel = applicant.qualification ? (applicant.qualification === 'SENIOR_LEVEL' ? 'Senior level' : applicant.qualification === 'STUDENT_GRADUATE' ? 'Graduate' : applicant.qualification) : (applicant.academicLevel || 'Graduate');
  const course = applicant.specialization || applicant.course || 'Medicine & Surgery';
  const location = applicant.location || applicant.country || 'Johannesburg, South Africa';
  const psychScore = applicant.psych ?? applicant.overallScore ?? 94;
  const sjtScore = applicant.sjt ?? 89;

  return (
    <div className={`fixed inset-0 z-[150] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div 
        onAnimationEnd={handleAnimationEnd}
        className={`relative bg-white w-full max-w-[480px] h-full shadow-2xl overflow-hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h2 className="text-[17px] sm:text-[18px] font-semibold text-gray-900 tracking-tight">
            {code}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <CloseIcon size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Top Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1E2E6B] p-5 rounded-[16px] text-white space-y-3">
              <p className="text-[13px] font-medium text-white/90">Psychometric Interview</p>
              <div className="flex items-baseline justify-between">
                <span className="text-[34px] font-bold text-white leading-none">{psychScore}%</span>
                <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
                  <ArrowUpIcon size={12} className="rotate-45 text-white" /> Top 1%
                </span>
              </div>
            </div>
            <div className="bg-[#188038] p-5 rounded-[16px] text-white space-y-3">
              <p className="text-[13px] font-medium text-white/90">Situational Interview</p>
              <div className="flex items-baseline justify-between">
                <span className="text-[34px] font-bold text-white leading-none">{sjtScore}%</span>
                <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
                  <ArrowUpIcon size={12} className="rotate-45 text-white" /> Top 1%
                </span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">About</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-gray-500">Description</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Nunc sed ornare at bibendum mauris tellus ullamcorper vitae magna... <span className="font-semibold text-gray-900 cursor-pointer hover:underline">see more</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-1">
                <div>
                  <p className="text-[11px] text-gray-400">Academic level</p>
                  <p className="text-[13px] font-medium text-gray-900">{academicLevel}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Course</p>
                  <p className="text-[13px] font-medium text-gray-900">{course}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Experience</p>
                  <p className="text-[13px] font-medium text-gray-900">3 years</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Location</p>
                  <p className="text-[13px] font-medium text-gray-900">{location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Skills</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100">Research Analysis</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">Research Analysis</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-100">Research Analysis</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-100">Research Analysis</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">Research Analysis</span>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Video</h3>
            <div className="relative aspect-video rounded-[16px] overflow-hidden group cursor-pointer shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                alt="Applicant Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300">
                  <PlayIcon size={24} className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents Section */}
          <div className="space-y-3 pb-4">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">Supporting documents</h3>
            <div className="bg-[#F8F9FB] rounded-[12px] p-4 flex items-center justify-between border border-gray-100 group hover:border-[#0047CC]/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">📎</span>
                <p className="text-[13px] font-medium text-gray-800">Academic transcript.pdf</p>
              </div>
              <span className="text-gray-400 group-hover:text-[#0047CC] transition-colors text-sm">↗</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 flex items-center justify-end gap-4 sm:gap-5 shrink-0 bg-white">
          <button 
            type="button"
            onClick={onReject}
            className="text-[14px] font-medium text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            Reject
          </button>
          <button 
            type="button"
            onClick={onHire}
            className="py-2.5 px-6 bg-[#0047CC] text-white rounded-full text-[14px] font-medium hover:bg-[#003d99] transition-all shadow-sm cursor-pointer"
          >
            Hire applicant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailsModal;
