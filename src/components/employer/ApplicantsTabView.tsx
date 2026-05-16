import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UsersIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  MoreVerticalIcon
} from '../common/Icons';
import { SAMPLE_APPLICANTS } from '../../constants/mockData';
import Tag from '../common/Tag';

interface ApplicantsTabViewProps {
  onHire: (applicant: any) => void;
  onAlign: (applicant: any) => void;
  onReject: (applicant: any) => void;
}

const ApplicantsTabView: React.FC<ApplicantsTabViewProps> = ({ onHire, onAlign, onReject }) => {
  const navigate = useNavigate();
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL MATCHED', value: '8', sub: 'Across 8 countries', icon: UsersIcon, color: 'text-gray-900' },
          { label: 'PASSED ALL TESTS', value: '5', sub: 'Ready for review', icon: CheckIcon, color: 'text-green-600' },
          { label: 'DID NOT MEET THRESHOLD', value: '3', sub: 'Recommended for dev.', icon: AlertTriangleIcon, color: 'text-red-600' },
          { label: 'TOP CANDIDATE', value: 'APP-008', sub: 'Overall score 92%', icon: CheckIcon, color: 'text-[#0047CC]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
            <p className={`text-[24px] font-black ${stat.color} leading-none mb-1`}>{stat.value}</p>
            <p className="text-[11px] font-bold text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Minimalist Applicants List */}
      <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="w-full">
          {/* Table Header Bar */}
          <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest gap-4 border-b border-gray-50">
            <div className="flex-[2]">Applicant ID</div>
            <div className="flex-[2]">Academic level</div>
            <div className="flex-[2]">Location</div>
            <div className="flex-[2]">Course</div>
            <div className="flex-[2]">Date applied</div>
            <div className="w-40 text-right">Status</div>
          </div>

          {/* Table Content */}
          <div className="flex-1 divide-y divide-gray-50">
            {SAMPLE_APPLICANTS.map((applicant, idx) => (
              <div 
                key={idx} 
                className="px-6 lg:px-8 py-5 flex items-center justify-between hover:bg-blue-50/40 transition-colors cursor-pointer group relative"
              >
                <div 
                  className="flex-[2]"
                  onClick={() => navigate(`/talents/${applicant.id}`)}
                >
                  <p className="text-[14px] font-black text-gray-900 group-hover:text-[#0047CC] transition-colors">{applicant.id}</p>
                </div>

                {/* Desktop Only Columns */}
                <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{applicant.academicLevel}</div>
                <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{applicant.location}</div>
                <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{applicant.course}</div>
                <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{applicant.dateApplied}</div>

                <div className="flex items-center justify-end lg:w-40 relative shrink-0">
                  <Tag 
                    label={applicant.status} 
                    variant={applicant.status.toLowerCase() === 'pending review' ? 'gray' : 
                             applicant.status.toLowerCase() === 'under review' ? 'yellow' : 
                             applicant.status.toLowerCase() === 'hired' ? 'green' : 
                             applicant.status.toLowerCase() === 'rejected' ? 'red' : 'gray'}
                    className="min-w-[130px] justify-center"
                  />
                  
                  <div className="flex items-center gap-4 ml-auto">
                    <button
                      className="text-gray-300 hover:text-gray-600 p-2 relative z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                      }}
                    >
                      <MoreVerticalIcon size={18} />
                    </button>
                  </div>

                  {/* Action Menu Dropdown */}
                  {openMenuIdx === idx && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuIdx(null);
                        }}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/talents/${applicant.id}`);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                          View details
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onHire(applicant);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                        >
                          Hire applicant
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/0/reject/${applicant.id}`);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Reject applicant
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsTabView;
