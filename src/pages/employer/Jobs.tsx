import React, { useState } from 'react';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SearchIcon,
  MoreVerticalIcon
} from '../../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_JOBS } from '../../constants/mockData';
import PostJobModal from '../../components/employer/PostJobModal';
import { JOBS_TABS } from '../../constants/tabs';
import TabSlider from '../../components/common/TabSlider';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Tag from '../../components/common/Tag';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const tabs = JOBS_TABS;

  const getJobStatusVariant = (status: string): any => {
    switch (status) {
      case 'Active': return 'green';
      case 'Scheduled': return 'blue';
      case 'Hired': return 'green';
      case 'Draft': return 'yellow';
      case 'Ongoing': return 'blue';
      default: return 'gray';
    }
  };

  const filteredJobs = SAMPLE_JOBS.filter(job => {
    const matchesTab = activeTab === 'All jobs' || job.type === activeTab || (activeTab === 'Scheduled' && job.status === 'Scheduled');
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.org.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-black text-[#0047CC] font-['Nunito_Sans'] tracking-tight">Jobs</h1>
        <Button 
          onClick={() => setIsPostModalOpen(true)}
          fullWidth={false}
          className="px-6 min-h-[48px] text-[14px]"
        >
          <PlusIcon size={14} strokeWidth={3} />
          Post a job
        </Button>
      </div>

      {/* Tabs System */}
      <TabSlider 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderTabExtra={(tab) => {
          const count = SAMPLE_JOBS.filter(j => tab === 'All jobs' || j.type === tab || (tab === 'Scheduled' && j.status === 'Scheduled')).length;
          return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
              activeTab === tab ? 'bg-blue-50 text-[#0047CC]' : 'bg-gray-100 text-gray-400'
            }`}>
              {count}
            </span>
          );
        }}
      />

      {/* Search Bar */}
      <div className="max-w-sm">
        <Input 
          label=""
          placeholder="Search jobs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={SearchIcon}
          className="rounded-xl shadow-sm border-gray-100"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm">
        <div className="w-full">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden lg:flex bg-[#F9FAFB] px-8 py-4 items-center text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <div className="flex-[3]">Job listings</div>
            <div className="flex-1">Job type</div>
            <div className="flex-[1.2]">Date posted</div>
            <div className="flex-[1.2]">Expiry date</div>
            <div className="w-32 text-center">Applicants</div>
            <div className="flex-1 pl-4">Status</div>
            <div className="w-10"></div>
          </div>

          {/* Table Body / Mobile List */}
          <div className="divide-y divide-gray-50">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-6 lg:px-8 py-6 lg:py-5 flex flex-col lg:flex-row lg:items-center hover:bg-gray-50/50 transition-colors cursor-pointer group gap-4 lg:gap-0"
                >
                  <div className="flex-[3] lg:pr-6">
                    <div className="flex items-start justify-between lg:block">
                      <p className="text-[15px] lg:text-[14px] font-black text-gray-900 group-hover:text-[#0047CC] transition-colors">{job.title}</p>
                      <div className="lg:hidden">
                        <Tag label={job.status} variant={getJobStatusVariant(job.status)} />
                      </div>
                    </div>
                    <p className="text-[12px] lg:text-[11px] font-bold text-gray-400 mt-1">{job.org} — {job.location}</p>
                    {job.subStatus && (
                      <div className="flex flex-wrap gap-2 mt-3 lg:mt-2">
                        {job.subStatus.split(' · ').map((tag, i) => (
                          <Tag 
                            key={i} 
                            label={tag} 
                            variant={tag.toLowerCase().includes('alignment') ? 'blue-light' : 
                                     tag.toLowerCase().includes('assessment') ? 'blue-light' : 'gray'} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile-only info grid */}
                  <div className="grid grid-cols-2 gap-4 lg:hidden py-2 border-y border-gray-50/50 my-1">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-[13px] font-bold text-gray-600">{job.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applicants</p>
                      <p className={`text-[13px] font-black ${job.applicants > 0 ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                        {job.applicants || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posted</p>
                      <p className="text-[13px] font-bold text-gray-400">{job.datePosted}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                      <p className="text-[13px] font-bold text-gray-400">{job.expiryDate}</p>
                    </div>
                  </div>

                  {/* Desktop columns - hidden on mobile */}
                  <div className="hidden lg:block flex-1 text-[13px] font-bold text-gray-600">{job.type}</div>
                  <div className="hidden lg:block flex-[1.2] text-[13px] font-bold text-gray-400">{job.datePosted}</div>
                  <div className="hidden lg:block flex-[1.2] text-[13px] font-bold text-gray-400">{job.expiryDate}</div>
                  <div className={`hidden lg:block w-32 text-center text-[14px] font-black ${job.applicants > 0 ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                    {job.applicants || '-'}
                  </div>
                  <div className="hidden lg:block flex-1 pl-4">
                    <Tag label={job.status} variant={getJobStatusVariant(job.status)} />
                  </div>
                  <div className="flex justify-end lg:w-10">
                    <button className="text-gray-300 hover:text-gray-600 p-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <MoreVerticalIcon size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <BriefcaseIcon size={24} className="text-[#0047CC]" />
                </div>
                <p className="text-[15px] font-black text-gray-900">No jobs found</p>
                <p className="text-[13px] font-bold text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-gray-50 px-8 py-5 flex items-center justify-between">
          <p className="text-[12px] font-bold text-gray-400 tracking-tight">
            Showing 1 - {filteredJobs.length} of {filteredJobs.length} jobs
          </p>
          <div className="flex items-center gap-6">
            <Button 
              variant="outline"
              fullWidth={false}
              disabled={true}
              className="min-h-[40px] px-6 text-[13px]"
            >
              <ChevronLeftIcon size={16} strokeWidth={3} />
              Previous
            </Button>
            <div className="w-px h-4 bg-gray-200" />
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

      <PostJobModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />
    </div>
  );
};

export default Jobs;
