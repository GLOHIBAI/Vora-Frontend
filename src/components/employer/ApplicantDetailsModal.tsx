import React, { useEffect, useState } from 'react';
import { CloseIcon, PlayIcon, DownloadIcon, FileIcon } from '../common/Icons';

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

  return (
    <div className={`fixed inset-0 z-[150] flex justify-end transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div 
        onAnimationEnd={handleAnimationEnd}
        className={`relative bg-white w-full max-w-[520px] h-full shadow-2xl overflow-hidden flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50 shrink-0">
          <h2 className="text-[20px] font-bold text-gray-900 font-['Nunito_Sans'] tracking-tight">
            {applicant.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <CloseIcon size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-10 space-y-10">
          {/* Top Stats Section */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-[#EBF6FF] p-6 rounded-[20px] space-y-2 border border-blue-100/20">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#0047CC] uppercase tracking-wide">Psychometric Test</p>
                <span className="text-[11px] font-bold text-[#2CA62C] bg-white/50 px-2 py-0.5 rounded-full border border-green-100/30">↑ 5%</span>
              </div>
              <p className="text-[36px] font-bold text-[#0047CC]">{applicant.psych || '--'}%</p>
            </div>
            <div className="bg-[#EEFBEE] p-6 rounded-[20px] space-y-2 border border-green-100/20">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-[#2CA62C] uppercase tracking-wide">Situational Test</p>
                <span className="text-[11px] font-bold text-[#2CA62C] bg-white/50 px-2 py-0.5 rounded-full border border-green-100/30">↑ 3%</span>
              </div>
              <p className="text-[36px] font-bold text-[#2CA62C]">{applicant.sjt || '--'}%</p>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">About</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Description</p>
                <p className="text-[14px] font-medium text-gray-600 leading-relaxed">
                  Lörem ipsum siler sit moressatur. Rune sed vovettar, ifall alandis fädar eljest betvåran. 
                  Ytande sedas ulkasoper vinga... <span className="text-[#0047CC] cursor-pointer hover:underline font-bold">see more</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-6 bg-gray-50/50 p-6 rounded-[24px] border border-gray-50">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Academic level</p>
                  <p className="text-[14px] font-bold text-gray-900">{applicant.academicLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Course</p>
                  <p className="text-[14px] font-bold text-gray-900">{applicant.course}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Location</p>
                  <p className="text-[14px] font-bold text-gray-900">{applicant.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Years of experience</p>
                  <p className="text-[14px] font-bold text-gray-900">3 years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-6">
            <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">Skills</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-red-50 text-red-600 border border-red-100">Research Analysis</span>
              <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">Research Analysis</span>
              <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Research Analysis</span>
              <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-green-50 text-green-600 border border-green-100">Research Analysis</span>
              <span className="px-4 py-2 rounded-full text-[12px] font-bold bg-red-50 text-red-600 border border-red-100">Research Analysis</span>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-6">
            <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">Video</h3>
            <div className="relative aspect-video rounded-[24px] overflow-hidden group cursor-pointer shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                alt="Applicant Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <PlayIcon size={28} className="text-white ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents Section */}
          <div className="space-y-6 pb-6">
            <h3 className="text-[16px] font-bold text-gray-900 uppercase tracking-wider border-l-4 border-[#0047CC] pl-4">Supporting documents</h3>
            <div className="bg-gray-50/50 rounded-[20px] p-5 flex items-center justify-between border border-gray-100 group hover:border-[#0047CC]/20 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl border border-gray-100 group-hover:border-[#0047CC]/10 transition-all shadow-sm">
                  <FileIcon size={20} className="text-gray-400 group-hover:text-[#0047CC] transition-colors" />
                </div>
                <p className="text-[14px] font-bold text-gray-700">Academic transcript.pdf</p>
              </div>
              <DownloadIcon size={20} className="text-gray-400 group-hover:text-[#0047CC] transition-colors" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-10 border-t border-gray-50 grid grid-cols-[1fr,2.5fr] gap-5 shrink-0 bg-white">
          <button 
            onClick={onReject}
            className="py-5 px-6 text-[16px] font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-gray-100 cursor-pointer active:scale-95"
          >
            Reject
          </button>
          <button 
            onClick={onHire}
            className="py-5 px-6 bg-[#0047CC] text-white rounded-full text-[16px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/30 cursor-pointer active:scale-95"
          >
            Hire applicant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailsModal;
