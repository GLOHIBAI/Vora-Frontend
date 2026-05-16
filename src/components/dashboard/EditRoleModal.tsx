import React from 'react';
import { CloseIcon, ChevronDownIcon } from '../common/Icons';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, initialData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-[18px] font-bold text-gray-900 font-['Nunito_Sans']">Edit Role Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <CloseIcon size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Role Title */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Role title</label>
              <input 
                type="text" 
                placeholder="e.g. Global Health Research Intern"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300"
                defaultValue={initialData?.title}
              />
            </div>

            {/* Role Type */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Role type</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer text-gray-700">
                  <option value="">Select options</option>
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Employment Level */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Employment level</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer text-gray-700">
                  <option value="">Select option</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Available Positions */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Available positions</label>
              <input 
                type="text" 
                placeholder="e.g. 1, 2, 3 etc"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300"
              />
            </div>

            {/* Time Commitment */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Time commitment</label>
              <input 
                type="text" 
                placeholder="e.g. 20hrs per week"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300"
              />
            </div>

            {/* Time zone preference */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Time zone preference</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer text-gray-700">
                  <option value="">Select option</option>
                  <option value="gmt+1">GMT + 1</option>
                  <option value="gmt+0">GMT + 0</option>
                  <option value="est">EST</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Work format */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Work format</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer text-gray-700">
                  <option value="">Select option</option>
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Work location */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Work location</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer text-gray-700">
                  <option value="">Search location</option>
                  <option value="lagos">Lagos, Nigeria</option>
                  <option value="london">London, UK</option>
                  <option value="new-york">New York, USA</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">Start date</label>
              <input 
                type="text" 
                placeholder="Select date"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300"
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
              />
            </div>

            {/* End date */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900">End date</label>
              <input 
                type="text" 
                placeholder="End date"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300"
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => e.target.type = 'text'}
              />
            </div>

            {/* Role summary */}
            <div className="col-span-2 space-y-2 pt-2">
              <label className="text-[13px] font-bold text-gray-900">Role summary</label>
              <textarea 
                rows={4}
                placeholder="Briefly describe what the role is about"
                className="w-full px-4 py-4 rounded-[20px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all text-[14px] font-medium placeholder:text-gray-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-8">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#0047CC] text-white rounded-full text-[15px] font-bold hover:bg-[#003d99] transition-all shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
