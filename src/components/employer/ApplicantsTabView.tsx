import React, { useState } from 'react';
import { 
  UsersIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  ChevronDownIcon,
  PlayIcon,
  LocationIcon
} from '../common/Icons';
import { SAMPLE_APPLICANTS } from '../../constants/mockData';
import Tag from '../common/Tag';

interface ApplicantsTabViewProps {
  onHire: (applicant: any) => void;
}

const AccordionItem: React.FC<{ 
  title: string; 
  icon: React.FC<any>; 
  count?: string | number;
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode 
}> = ({ title, icon: Icon, count, isOpen, onToggle, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white border-none cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="bg-[#EBF6FF] p-2 rounded-lg text-[#0047CC]">
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-medium text-gray-900  tracking-tight">{title}</span>
          {count !== undefined && (
            <span className="bg-[#F7F7F7] text-gray-500 text-[11px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
              {count}
            </span>
          )}
        </div>
      </div>
      <ChevronDownIcon 
        size={20} 
        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
    <div 
      className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="px-6 pb-6 pt-2 border-t border-gray-50">
        {children}
      </div>
    </div>
  </div>
);

const ApplicantsTabView: React.FC<ApplicantsTabViewProps> = ({ onHire }) => {
  const [openSection, setOpenSection] = useState<string | null>('Overview');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const topCandidates = SAMPLE_APPLICANTS.filter(a => a.status === 'Passed').sort((a, b) => (b.overall || 0) - (a.overall || 0)).slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL MATCHED', value: '8', sub: 'Across 8 countries', icon: UsersIcon, color: 'text-gray-900' },
          { label: 'PASSED ALL TESTS', value: '5', sub: 'Ready for review', icon: CheckIcon, color: 'text-green-600' },
          { label: 'DID NOT MEET THRESHOLD', value: '3', sub: 'Recommended for dev.', icon: AlertTriangleIcon, color: 'text-red-600' },
          { label: 'TOP CANDIDATE', value: 'APP-VORA-008', sub: 'Overall score 92%', icon: CheckIcon, color: 'text-[#0047CC]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[14px] p-5 shadow-sm">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
            <p className={`text-[24px] font-medium ${stat.color} leading-none mb-1`}>{stat.value}</p>
            <p className="text-[11px] font-medium text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Candidate Pool Overview */}
        <AccordionItem 
          title="Candidate Pool Overview" 
          icon={UsersIcon} 
          count={SAMPLE_APPLICANTS.length}
          isOpen={openSection === 'Overview'} 
          onToggle={() => toggleSection('Overview')}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[13px] font-medium text-gray-900 uppercase tracking-tight">Geo Distribution</h4>
                </div>
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                  <div className="text-center">
                    <LocationIcon size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-[12px] font-medium text-gray-400">Interactive Map Visualization</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[13px] font-medium text-gray-900 uppercase tracking-tight">Top Countries</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Nigeria', count: 3, percentage: 37 },
                    { name: 'Kenya', count: 2, percentage: 25 },
                    { name: 'Ethiopia', count: 1, percentage: 12 },
                  ].map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[12px] font-medium">
                        <span className="text-gray-700">{c.name}</span>
                        <span className="text-gray-400">{c.count} app(s)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0047CC]" style={{ width: `${c.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4 font-medium">Applicant ID</th>
                    <th className="pb-4 font-medium">Qualification</th>
                    <th className="pb-4 font-medium">Location</th>
                    <th className="pb-4 font-medium">Specialization</th>
                    <th className="pb-4 font-medium">Applied On</th>
                    <th className="pb-4 font-medium text-right">Overall Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {SAMPLE_APPLICANTS.map((applicant, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4">
                        <span className="text-[14px] font-medium text-gray-900 group-hover:text-[#0047CC] transition-colors">{applicant.id}</span>
                      </td>
                      <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.academicLevel}</td>
                      <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.location}</td>
                      <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.course}</td>
                      <td className="py-4 text-[13px] font-medium text-gray-500">{applicant.dateApplied}</td>
                      <td className="py-4 text-right">
                        <Tag 
                          label={applicant.status} 
                          variant={applicant.status === 'Passed' ? 'green' : 'red'} 
                          className="ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AccordionItem>

        {/* Psychometric Test Results */}
        <AccordionItem 
          title="Psychometric Test Results" 
          icon={CheckIcon} 
          isOpen={openSection === 'Psychometric'} 
          onToggle={() => toggleSection('Psychometric')}
        >
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 font-medium">Applicant ID</th>
                  <th className="pb-4 font-medium">Critical Thinking</th>
                  <th className="pb-4 font-medium">Numerical Reasoning</th>
                  <th className="pb-4 font-medium">Verbal Reasoning</th>
                  <th className="pb-4 font-medium text-right">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SAMPLE_APPLICANTS.map((applicant, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 text-[14px] font-medium text-gray-900">{applicant.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${applicant.psych || 0}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{applicant.psych || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400" style={{ width: `${(applicant.psych || 0) - 5}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{(applicant.psych || 0) - 5}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{ width: `${(applicant.psych || 0) + 2}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{(applicant.psych || 0) + 2}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-[14px] font-medium ${applicant.psych && applicant.psych > 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {applicant.psych || '--'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>

        {/* Situational Judgement Results */}
        <AccordionItem 
          title="Situational Judgement Test Results" 
          icon={AlertTriangleIcon} 
          isOpen={openSection === 'SJT'} 
          onToggle={() => toggleSection('SJT')}
        >
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-medium text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4 font-medium">Applicant ID</th>
                  <th className="pb-4 font-medium">Field Safety</th>
                  <th className="pb-4 font-medium">Ethical Decision Making</th>
                  <th className="pb-4 font-medium">Crisis Management</th>
                  <th className="pb-4 font-medium text-right">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SAMPLE_APPLICANTS.map((applicant, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 text-[14px] font-medium text-gray-900">{applicant.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400" style={{ width: `${applicant.sjt || 0}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{applicant.sjt || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(applicant.sjt || 0) + 4}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{(applicant.sjt || 0) + 4}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400" style={{ width: `${(applicant.sjt || 0) - 2}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-gray-500">{(applicant.sjt || 0) - 2}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-[14px] font-medium ${applicant.sjt && applicant.sjt > 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {applicant.sjt || '--'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionItem>

        {/* Video Interview Results */}
        <AccordionItem 
          title="Video Interview/Test Results" 
          icon={PlayIcon} 
          isOpen={openSection === 'Video'} 
          onToggle={() => toggleSection('Video')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_APPLICANTS.filter(a => a.videoUrl).map((applicant, i) => (
              <div key={i} className="group relative">
                <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button className="bg-white/90 p-3 rounded-full text-[#0047CC] hover:scale-110 transition-transform shadow-lg cursor-pointer border-none">
                      <PlayIcon size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                    <div>
                      <p className="text-white text-[12px] font-medium tracking-tight">{applicant.id}</p>
                      <p className="text-white/70 text-[10px] font-medium uppercase tracking-widest">Video Response</p>
                    </div>
                    <div className="bg-green-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-lg shadow-md">
                      {applicant.video}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>
      </div>

      {/* Recommended Top Candidates */}
      <div className="bg-[#EBF6FF]/50 border border-[#387DFF]/10 rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-medium text-[#0047CC] tracking-tight">VORA AI Recommendation</h3>
            <p className="text-[13px] font-medium text-[#387DFF]/70">Top 3 candidates based on cross-sectional performance metrics</p>
          </div>
          <Tag label="AUTO-GENERATED" variant="blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topCandidates.map((candidate, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-[#387DFF]/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                <div className="text-[24px] font-medium text-[#0047CC]/10 group-hover:text-[#0047CC]/20 transition-colors">#{i + 1}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[14px] font-medium text-gray-900">{candidate.id}</p>
                  <p className="text-[12px] font-medium text-gray-400">{candidate.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Overall Fit</p>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${candidate.overall}%` }} />
                    </div>
                  </div>
                  <span className="text-[18px] font-medium text-green-600">{candidate.overall}%</span>
                </div>
                <button 
                  onClick={() => onHire(candidate)}
                  className="w-full py-2.5 bg-[#0047CC] text-white rounded-xl text-[13px] font-medium hover:bg-[#387DFF] transition-all shadow-md active:scale-95 cursor-pointer border-none"
                >
                  Hire Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsTabView;
