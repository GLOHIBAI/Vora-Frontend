import React, { useState } from 'react';
import { 
  PlusIcon, 
  BriefcaseIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SearchIcon,
  MoreVerticalIcon
} from '../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_JOBS } from '../constants/mockData';
import PostJobModal from '../components/dashboard/PostJobModal';
import { JOBS_TABS } from '../constants/tabs';
import TabSlider from '../components/common/TabSlider';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const tabs = JOBS_TABS;

  const filteredJobs = SAMPLE_JOBS.filter(job => {
    const matchesTab = activeTab === 'All jobs' || job.type === activeTab || (activeTab === 'Scheduled' && job.status === 'Scheduled');
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.org.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-[28px] font-black text-[#0047CC] font-['Nunito_Sans'] tracking-tight">Jobs</h1>
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="bg-[#0047CC] text-white px-6 py-3 rounded-full font-black text-[14px] flex items-center gap-2 hover:bg-[#003d99] transition-all cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <PlusIcon size={14} strokeWidth={3} />
          Post a job
        </button>
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
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300">
          <SearchIcon size={16} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="Search jobs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#0047CC] transition-all placeholder:text-gray-300 shadow-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="bg-[#F9FAFB] px-8 py-3.5 flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest border-bottom border-gray-50">
              <div className="flex-[3]">Job listings</div>
              <div className="flex-1">Job type</div>
              <div className="flex-[1.2]">Date posted</div>
              <div className="flex-[1.2]">Expiry date</div>
              <div className="w-24 text-center">Applicants</div>
              <div className="flex-1">Status</div>
              <div className="w-10"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="px-8 py-5 flex items-center hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-[3] pr-6">
                      <p className="text-[14px] font-black text-gray-900 group-hover:text-[#0047CC] transition-colors">{job.title}</p>
                      <p className="text-[11px] font-bold text-gray-400 mt-1">{job.org} — {job.location}</p>
                      {job.subStatus && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.subStatus.split(' · ').map((tag, i) => (
                            <span key={i} className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusTagStyles(tag)}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-[13px] font-bold text-gray-600">{job.type}</div>
                    <div className="flex-[1.2] text-[13px] font-bold text-gray-400">{job.datePosted}</div>
                    <div className="flex-[1.2] text-[13px] font-bold text-gray-400">{job.expiryDate}</div>
                    <div className={`w-24 text-center text-[14px] font-black ${job.applicants > 0 ? 'text-[#0047CC]' : 'text-gray-300'}`}>
                      {job.applicants || '-'}
                    </div>
                    <div className="flex-1">
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="w-10 flex justify-end">
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
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-gray-50 px-8 py-5 flex items-center justify-between">
          <p className="text-[12px] font-bold text-gray-400 tracking-tight">
            Showing 1 - {filteredJobs.length} of {filteredJobs.length} jobs
          </p>
          <div className="flex items-center gap-6">
            <button className="text-[13px] font-black text-gray-300 flex items-center gap-2 cursor-not-allowed">
              <ChevronLeftIcon size={16} strokeWidth={3} />
              Previous
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button className="text-[13px] font-black text-[#0047CC] flex items-center gap-2 hover:text-[#003d99] cursor-pointer group">
              Next
              <ChevronRightIcon size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'Active': 'bg-green-50 text-green-700 border-green-100',
    'Scheduled': 'bg-blue-50 text-[#0047CC] border-blue-100',
    'Hired': 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
    'Draft': 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
    'Ongoing': 'bg-[#E0E9FF] text-[#18234B] border-[#C7D7F7]',
  };
  const dotColors: Record<string, string> = {
    'Active': 'bg-green-500',
    'Scheduled': 'bg-[#0047CC]',
    'Hired': 'bg-[#059669]',
    'Draft': 'bg-[#D97706]',
    'Ongoing': 'bg-[#344DA1]',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${styles[status] || styles['Active']}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors['Active']}`} />
      <span className="text-[11px] font-black tracking-tight">{status}</span>
    </div>
  );
};

const getStatusTagStyles = (tag: string) => {
  if (tag.includes('alignment')) return 'bg-indigo-50 text-indigo-800 border-indigo-100';
  if (tag.includes('assessment')) return 'bg-blue-50 text-blue-800 border-blue-100';
  if (tag.includes('hired')) return 'bg-green-50 text-green-800 border-green-100';
  if (tag.includes('Draft')) return 'bg-amber-50 text-amber-800 border-amber-100';
  return 'bg-gray-50 text-gray-600 border-gray-100';
};

export default Jobs;
