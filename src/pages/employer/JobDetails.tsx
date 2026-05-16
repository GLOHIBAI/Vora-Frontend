import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_JOB_DETAILS } from '../../constants/mockData';
import { JOB_DETAILS_TABS } from '../../constants/tabs';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon
} from '../../components/common/Icons';
import JobEditModal from '../../components/employer/JobEditModal';
import ApplicantDetailsModal from '../../components/employer/ApplicantDetailsModal';
import ApplicantsTabView from '../../components/employer/ApplicantsTabView';
import HiredTabView from '../../components/employer/HiredTabView';
import TabSlider from '../../components/common/TabSlider';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';

// --- Sub-components for Job Details ---

const DetailCard: React.FC<{ title: string; children: React.ReactNode; onEdit?: () => void }> = ({ title, children, onEdit }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm relative group">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[17px] font-medium text-gray-900  tracking-tight">{title}</h3>
      <Button 
        variant="outline"
        onClick={onEdit}
        fullWidth={false}
        className="px-4 py-1.5 min-h-[32px] text-[13px] font-medium text-gray-700"
      >
        <EditIcon size={14} className="text-gray-900" />
        Edit
      </Button>
    </div>
    {children}
  </div>
);

const InfoField: React.FC<{ label: string; value: string; isLongText?: boolean }> = ({ label, value, isLongText }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">{label}</p>
    <div className="flex items-baseline gap-1">
      <p className={`text-[14px] font-medium text-gray-800 ${isLongText ? 'leading-relaxed' : ''}`}>
        {value}
        {isLongText && <span className="text-[#0047CC] cursor-pointer hover:underline ml-1 font-medium">see more</span>}
      </p>
    </div>
  </div>
);



const JobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Details');
  const [editSection, setEditSection] = useState<'details' | 'responsibilities' | 'experience' | 'compensation' | 'collaboration' | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);

  const tabs = JOB_DETAILS_TABS;
  const data = SAMPLE_JOB_DETAILS;

  const handleEdit = (section: any) => {
    setEditSection(section);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Breadcrumb */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-medium text-[#0047CC]  tracking-tight">Jobs</h1>
        
        <div className="flex items-center gap-3 text-[14px]">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-1 text-gray-400 hover:text-[#0047CC] transition-colors font-medium cursor-pointer bg-transparent border-none p-0 shadow-none"
          >
            <ChevronLeftIcon size={16} strokeWidth={3} />
            All jobs
          </button>
          <ChevronRightIcon size={14} className="text-gray-300" />
          <span className="text-gray-900 font-medium">{data.title}</span>
        </div>

        <TabSlider 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          renderTabExtra={(tab) => {
            if (tab === 'Hired') {
              return <span className="bg-[#0047CC] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">2</span>;
            }
            if (tab === 'Applicants') {
              return <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">8</span>;
            }
            return null;
          }}
        />
      </div>

      {activeTab === 'Applicants' ? (
        <ApplicantsTabView 
          onHire={(a: any) => {
            setSelectedApplicant(a);
            setIsApplicantModalOpen(true);
          }}
        />
      ) : activeTab === 'Hired' ? (
        <HiredTabView />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            <DetailCard 
              title="Role details" 
              onEdit={() => handleEdit('details')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <InfoField label="Role type" value={data.roleDetails.type} />
                <InfoField label="Employment level" value={data.roleDetails.level} />
                <InfoField label="Available positions" value={data.roleDetails.positions} />
                <InfoField label="Number of applicants" value={data.roleDetails.applicantsCount} />
                <InfoField label="Time commitment" value={data.roleDetails.commitment} />
                <InfoField label="Time preference" value={data.roleDetails.timePreference} />
                <InfoField label="Work format" value={data.roleDetails.format} />
                <InfoField label="Work location" value={data.roleDetails.location} />
                <InfoField label="Start date" value={data.roleDetails.startDate} />
                <InfoField label="End date" value={data.roleDetails.endDate} />
                <div className="col-span-2">
                  <InfoField 
                    label="Role summary" 
                    value={data.roleDetails.summary} 
                    isLongText 
                  />
                </div>
              </div>
            </DetailCard>

            <DetailCard 
              title="Experience & background"
              onEdit={() => handleEdit('experience')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <InfoField label="Minimum qualification" value={data.experience.academyLevel} />
                <InfoField label="Relevant field(s)" value={data.experience.relevantField} />
                <InfoField label="Years of experience" value={data.experience.years} />
                <InfoField label="Sector background" value={data.experience.sectorBackground || ''} />
                <InfoField label="Geographic experience" value={data.experience.geographicExperience || ''} />
                <InfoField label="Security clearance" value={data.experience.securityClearance || ''} />
              </div>
            </DetailCard>

            <DetailCard 
              title="Compensation & documentation"
              onEdit={() => handleEdit('compensation')}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InfoField label="Compensation type" value={data.compensation.type} />
                  <InfoField label="Salary range" value={data.compensation.range} />
                  <InfoField label="Salary midpoint" value={data.compensation.midpoint} />
                  <div className="text-[#0047CC]">
                    <InfoField label="Escrow locked" value={data.compensation.escrow} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Candidate eligibility</p>
                  <div className="flex flex-wrap gap-2">
                    {data.compensation.eligibility?.map((item, i) => (
                      <Tag key={i} label={item.label} variant={item.variant as any} />
                    ))}
                  </div>
                </div>
              </div>
            </DetailCard>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <DetailCard 
              title="Responsibilities & skills"
              onEdit={() => handleEdit('responsibilities')}
            >
              <div className="space-y-6">
                <InfoField 
                  label="Role/Problem to solve" 
                  value={data.responsibilities.problem} 
                  isLongText 
                />
                <InfoField 
                  label="Core responsibilities" 
                  value={data.responsibilities.core} 
                  isLongText 
                />
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Technical skills required</p>
                  <div className="flex flex-wrap gap-3">
                    {data.responsibilities.technicalSkills.map((skill, i) => (
                      <Tag key={i} label={skill.label} variant={skill.variant as any} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Tools required</p>
                  <div className="flex flex-wrap gap-3">
                    {data.responsibilities.tools.map((tool, i) => (
                      <Tag key={i} label={tool.label} variant={tool.variant as any} />
                    ))}
                  </div>
                </div>
              </div>
            </DetailCard>

            <DetailCard 
              title="Team collaboration & communication"
              onEdit={() => handleEdit('collaboration')}
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Preferred work style</p>
                  <div className="flex flex-wrap gap-2">
                    {data.collaboration.preferredStyle.map((style, i) => (
                      <Tag key={i} label={style.label} variant={style.variant as any} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <InfoField label="Communication style" value={data.collaboration.communicationStyle} />
                  <InfoField label="Communication language" value={data.collaboration.communicationLanguage} />
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Personality traits</p>
                  <div className="flex flex-wrap gap-2">
                    {data.collaboration.personalityTraits.map((trait, i) => (
                      <Tag key={i} label={trait.label} variant={trait.variant as any} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Work culture</p>
                  <div className="flex flex-wrap gap-2">
                    {data.collaboration.workCulture.map((culture, i) => (
                      <Tag key={i} label={culture.label} variant={culture.variant as any} />
                    ))}
                  </div>
                </div>
              </div>
            </DetailCard>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSection && (
        <JobEditModal 
          isOpen={!!editSection}
          onClose={() => setEditSection(null)}
          section={editSection}
          data={data}
        />
      )}

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal 
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        applicant={selectedApplicant}
        onReject={() => {
          setIsApplicantModalOpen(false);
          navigate(`/jobs/${id}/reject/${selectedApplicant.id}`);
        }}
        onHire={() => {
          setIsApplicantModalOpen(false);
        }}
      />
    </div>
  );
};

export default JobDetails;
