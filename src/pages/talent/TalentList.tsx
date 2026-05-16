import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_TALENTS } from '../../constants/mockData';
import { TALENTS_TABS } from '../../constants/tabs';
import {
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  SearchIcon
} from '../../components/common/Icons';
import ApplicantDetailsModal from '../../components/employer/ApplicantDetailsModal';
import PostHireTrackingView from '../../components/talent/PostHireTrackingView';
import TabSlider from '../../components/common/TabSlider';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';

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
    const currentTab = activeTab.toLowerCase().trim();
    const matchesTab = currentTab === 'all talents' || 
                      talent.status.toLowerCase().trim() === currentTab;
    
    const search = searchQuery.toLowerCase().trim();
    const matchesSearch = search === '' || 
                         talent.id.toLowerCase().includes(search) ||
                         talent.name.toLowerCase().includes(search) || 
                         talent.course.toLowerCase().includes(search);
    
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
        <div className="max-w-lg">
          <Input 
            label=""
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
            className="rounded-full shadow-sm"
          />
        </div>
      )}

      {/* Table/View Container */}
      {activeTab === 'Post-Hire Tracking' ? (
        <PostHireTrackingView />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="w-full">
            {/* Table Header Bar - Hidden on mobile */}
            <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest gap-4 border-b border-gray-50">
              <div className="flex-[2]">Applicant ID</div>
              <div className="flex-[2]">Academic level</div>
              <div className="flex-[2]">Location</div>
              <div className="flex-[2]">Course</div>
              <div className="flex-[2]">Date applied</div>
              <div className="w-40 text-right">Status</div>
            </div>

            {/* Table Content / Mobile List */}
            <div className="flex-1">
              {talents.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {talents.map((talent, idx) => (
                    <div 
                      key={idx} 
                      className="px-6 lg:px-8 py-6 lg:py-6 flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer group gap-4 lg:gap-4 relative"
                    >
                      <div 
                        className="flex-[2] flex items-center justify-between lg:block"
                        onClick={() => navigate(`/talents/${talent.id}`)}
                      >
                        <div>
                          <p className="text-[15px] lg:text-[14px] font-black text-gray-900 group-hover:text-[#0047CC] transition-colors">{talent.id}</p>
                        </div>
                        <div className="lg:hidden">
                          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(talent.status)}`} />
                        </div>
                      </div>

                      {/* Desktop Only Columns */}
                      <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{talent.academicLevel}</div>
                      <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{talent.location}</div>
                      <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{talent.course}</div>
                      <div className="hidden lg:block flex-[2] text-[14px] font-bold text-gray-500">{talent.dateApplied}</div>

                      <div className="hidden lg:flex items-center justify-end lg:w-40 relative shrink-0">
                        <Tag 
                          label={talent.status} 
                          variant={talent.status.toLowerCase() === 'pending review' ? 'gray' : 
                                   talent.status.toLowerCase() === 'under review' ? 'yellow' : 
                                   talent.status.toLowerCase() === 'hired' ? 'green' : 
                                   talent.status.toLowerCase() === 'rejected' ? 'red' : 'gray'}
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
                                  navigate(`/talents/${talent.id}`);
                                }}
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
                                  navigate(`/jobs/0/reject/${talent.id}`);
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

          {/* Pagination Footer */}
          <div className="border-t border-gray-50 px-6 py-6 flex items-center justify-between mt-auto">
            <p className="text-[13px] text-gray-400 font-medium tracking-tight">Showing 1 - {talents.length} of 30 applicant</p>
            <div className="flex items-center gap-8">
              <Button 
                variant="outline" 
                fullWidth={false} 
                disabled={true} 
                className="min-h-[40px] px-6 text-[13px]"
              >
                <ChevronLeftIcon size={16} strokeWidth={3} />
                Previous
              </Button>
              <div className="w-px h-4 bg-gray-100" />
              <Button 
                variant="outline" 
                fullWidth={false} 
                className="min-h-[40px] px-6 text-[13px] border-[#0047CC] text-[#0047CC] hover:bg-blue-50"
              >
                Next
                <ChevronRightIcon size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
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
