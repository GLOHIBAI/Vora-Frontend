import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_TALENTS } from '../constants/mockData';
import { TALENTS_TABS } from '../constants/tabs';
import {
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  SearchIcon
} from '../components/common/Icons';
import ApplicantDetailsModal from '../components/dashboard/ApplicantDetailsModal';
import PostHireTrackingView from '../components/talents/PostHireTrackingView';
import TabSlider from '../components/common/TabSlider';

const Talents: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All talents');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  
  const tabs = TALENTS_TABS;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending review': return 'bg-gray-400';
      case 'under review': return 'bg-yellow-400';
      case 'hired': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const talents = SAMPLE_TALENTS.filter(talent => {
    const matchesTab = activeTab === 'All talents' || talent.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = talent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         talent.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenModal = (e: React.MouseEvent, talent: any) => {
    e.stopPropagation();
    setSelectedApplicant(talent);
    setIsApplicantModalOpen(true);
    setOpenMenuIdx(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black text-[#0047CC] font-['Nunito_Sans'] tracking-tight">Talents</h1>
      </div>

      {/* Tabs System */}
      <TabSlider 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderTabExtra={(tab) => {
          if (tab === 'Post-Hire Tracking') {
            return <span className="bg-[#DC2626] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">1</span>;
          }
          return null;
        }}
      />

      {activeTab !== 'Post-Hire Tracking' && (
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-full py-2.5 pl-12 pr-4 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0047CC]/5 focus:border-[#0047CC]/20 transition-all placeholder:text-gray-300 shadow-sm"
          />
        </div>
      )}

      {/* Table/View Container */}
      {activeTab === 'Post-Hire Tracking' ? (
        <PostHireTrackingView />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl min-h-[600px] flex flex-col overflow-hidden shadow-sm">
          {/* Responsive Scroll Wrapper */}
          <div className="overflow-x-auto md:overflow-x-hidden scrollbar-hide">
            <div className="min-w-max md:w-full">
              {/* Table Header Bar */}
              <div className="bg-[#F9FAFB] px-6 py-4 flex items-center justify-between text-[13px] font-medium text-gray-400 gap-4">
                <div className="flex-[2] shrink-0">Applicant ID</div>
                <div className="flex-1 shrink-0">Academic level</div>
                <div className="flex-[1.5] shrink-0">Location</div>
                <div className="flex-[1.5] shrink-0">Course</div>
                <div className="flex-[1.5] shrink-0">Date applied</div>
                <div className="w-48 text-right shrink-0">Status</div>
              </div>

              {/* Table Content */}
              <div className="flex-1">
                {talents.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {talents.map((talent, idx) => (
                      <div 
                        key={idx} 
                        className="px-6 py-6 flex items-center justify-between text-[13px] border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group gap-4 relative"
                      >
                        <div 
                          className="flex-[2] shrink-0 font-bold text-gray-800 truncate hover:text-[#0047CC] transition-colors"
                          onClick={() => navigate(`/talents/${talent.id}`)}
                        >
                          {talent.name}
                        </div>
                        <div className="flex-1 shrink-0 text-gray-500 font-medium truncate">{talent.academicLevel}</div>
                        <div className="flex-[1.5] shrink-0 text-gray-500 font-medium truncate">{talent.location}</div>
                        <div className="flex-[1.5] shrink-0 text-gray-500 font-medium truncate">{talent.course}</div>
                        <div className="flex-[1.5] shrink-0 text-gray-500 font-medium truncate">{talent.dateApplied}</div>
                        <div className="w-48 flex items-center justify-between relative shrink-0">
                          <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-full border border-gray-100 min-w-[130px]">
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(talent.status)}`} />
                            <span className="text-[11px] font-bold text-gray-500 truncate">{talent.status}</span>
                          </div>
                          <button
                            className="text-gray-300 hover:text-gray-600 ml-4 relative z-10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                            }}
                          >
                            <MoreVerticalIcon size={18} />
                          </button>

                          {/* Action Menu Dropdown */}
                          {openMenuIdx === idx && (
                            <>
                              {/* Backdrop to close menu when clicking outside */}
                              <div 
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuIdx(null);
                                }}
                              />
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <button 
                                  onClick={(e) => handleOpenModal(e, talent)}
                                  className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                >
                                  View details
                                </button>
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                >
                                  Hire applicant
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/jobs/1/reject/${talent.id}`);
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
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-16 h-16 bg-[#EBF5FF] rounded-full flex items-center justify-center mb-6">
                      <UsersIcon size={20} className="text-[#0047CC]" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900 mb-2 font-['Nunito_Sans']">You do not have any talent yet</h3>
                    <p className="text-gray-400 text-[13px] font-medium text-center max-w-sm">
                      All applied talents will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-gray-50 px-6 py-6 flex items-center justify-between mt-auto">
            <p className="text-[13px] text-gray-400 font-medium tracking-tight">Showing 1 - {talents.length} of 30 applicant</p>
            <div className="flex items-center gap-8">
              <button className="text-[13px] font-bold text-gray-300 flex items-center gap-2 cursor-not-allowed">
                <ChevronLeftIcon size={16} strokeWidth={3} />
                Previous
              </button>
              <div className="w-px h-4 bg-gray-100" />
              <button className="text-[13px] font-bold text-[#0047CC] flex items-center gap-2 hover:text-[#003d99] cursor-pointer group">
                Next
                <ChevronRightIcon size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal 
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        applicant={selectedApplicant}
        onReject={() => {
          setIsApplicantModalOpen(false);
          navigate(`/jobs/1/reject/${selectedApplicant.id}`);
        }}
        onHire={() => {
          setIsApplicantModalOpen(false);
        }}
      />
    </div>
  );
};

export default Talents;
