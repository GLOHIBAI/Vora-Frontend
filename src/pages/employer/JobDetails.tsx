import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JOB_DETAILS_TABS } from '../../constants/tabs';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon
} from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import JobEditModal from '../../components/employer/JobEditModal';
import ApplicantDetailsModal from '../../components/employer/ApplicantDetailsModal';
import ApplicantsTabView from '../../components/employer/ApplicantsTabView';
import HiredTabView from '../../components/employer/HiredTabView';
import TabSlider from '../../components/common/TabSlider';
import Button from '../../components/common/Button';
import Tag from '../../components/common/Tag';
import Spinner from '../../components/common/Spinner';
import {
  useEmployerJobDetailQuery,
  useEmployerJobApplicantsQuery,
  useEmployerJobHiresQuery,
} from '../../services/queries/employer';
import type { EmployerJobDetailCard, EmployerJobDetailField } from '../../services/queries/employer/types';

// --- Sub-components for Job Details ---

const DetailCard: React.FC<{ title: string; children: React.ReactNode; onEdit?: () => void }> = ({ title, children, onEdit }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm relative group">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[17px] font-medium text-gray-900 tracking-tight">{title}</h3>
      {onEdit && (
        <Button 
          variant="outline"
          onClick={onEdit}
          fullWidth={false}
          className="px-4 py-1.5 min-h-[32px] text-[13px] font-medium text-gray-700"
        >
          <EditIcon size={14} className="text-gray-900" />
          Edit
        </Button>
      )}
    </div>
    {children}
  </div>
);

const InfoField: React.FC<{ label: string; value: string; isLongText?: boolean }> = ({ label, value, isLongText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CHAR_LIMIT = 200;
  const isTruncatable = Boolean(value && (isLongText || value.length > CHAR_LIMIT));
  const shouldTruncate = isTruncatable && value.length > CHAR_LIMIT;

  const displayValue = shouldTruncate && !isExpanded
    ? `${value.slice(0, CHAR_LIMIT).trim()}...`
    : value;

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">{label}</p>
      <div className="text-[14px] font-medium text-gray-800 break-words leading-relaxed whitespace-pre-line">
        <span>{displayValue}</span>
        {shouldTruncate && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="text-[#0047CC] hover:underline ml-1.5 font-medium cursor-pointer bg-transparent border-none p-0 inline text-[13px]"
          >
            {isExpanded ? 'see less' : 'see more'}
          </button>
        )}
      </div>
    </div>
  );
};

// Renders a card dynamically from API data
const DynamicDetailCard: React.FC<{
  title: string;
  card: EmployerJobDetailCard;
  isEmployer: boolean;
  onEdit?: () => void;
}> = ({ title, card, isEmployer, onEdit }) => {
  return (
    <DetailCard 
      title={title} 
      onEdit={isEmployer && card.edit ? onEdit : undefined}
    >
      <div className="space-y-6">
        {/* Fields grid */}
        {card.fields && card.fields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {card.fields.map((field: EmployerJobDetailField, i: number) => {
              const isFieldLong = field.isLongText || (field.value && field.value.length > 200);
              if (isFieldLong) {
                return (
                  <div key={i} className="col-span-1 sm:col-span-2">
                    <InfoField label={field.label} value={field.value} isLongText />
                  </div>
                );
              }
              return <InfoField key={i} label={field.label} value={field.value} />;
            })}
          </div>
        )}

        {/* Role summary */}
        {card.roleSummary && (
          <InfoField label="Role summary" value={card.roleSummary} isLongText />
        )}

        {/* Role goal & core responsibilities */}
        {card.roleGoal && <InfoField label="Role/Problem to solve" value={card.roleGoal} isLongText />}
        {card.coreResponsibilities && <InfoField label="Core responsibilities" value={card.coreResponsibilities} isLongText />}

        {/* Technical skills */}
        {card.technicalSkills && card.technicalSkills.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Technical skills required</p>
            <div className="flex flex-wrap gap-3">
              {card.technicalSkills.map((skill, i) => (
                <Tag key={i} label={typeof skill === 'string' ? skill : (skill as any).label} variant="blue" />
              ))}
            </div>
          </div>
        )}

        {/* Tools required */}
        {card.toolsRequired && card.toolsRequired.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Tools required</p>
            <div className="flex flex-wrap gap-3">
              {card.toolsRequired.map((tool, i) => (
                <Tag key={i} label={typeof tool === 'string' ? tool : (tool as any).label} variant="blue" />
              ))}
            </div>
          </div>
        )}

        {/* Eligibility pills */}
        {card.eligibilityPills && card.eligibilityPills.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Candidate eligibility</p>
            <div className="flex flex-wrap gap-2">
              {card.eligibilityPills.map((item, i) => (
                <Tag key={i} label={typeof item === 'string' ? item : (item as any).label} variant="blue" />
              ))}
            </div>
          </div>
        )}

        {/* Preferred working style */}
        {card.preferredWorkingStyle && card.preferredWorkingStyle.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Preferred work style</p>
            <div className="flex flex-wrap gap-2">
              {card.preferredWorkingStyle.map((style, i) => (
                <Tag key={i} label={typeof style === 'string' ? style : (style as any).label} variant="blue" />
              ))}
            </div>
          </div>
        )}

        {/* Communication style & language */}
        {(card.communicationStyle || card.communicationLanguage) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {card.communicationStyle && <InfoField label="Communication style" value={card.communicationStyle} />}
            {card.communicationLanguage && <InfoField label="Communication language" value={card.communicationLanguage} />}
          </div>
        )}

        {/* Personality traits */}
        {card.personalityTraits && card.personalityTraits.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Personality traits</p>
            <div className="flex flex-wrap gap-2">
              {card.personalityTraits.map((trait, i) => (
                <Tag key={i} label={typeof trait === 'string' ? trait : (trait as any).label} variant="green" />
              ))}
            </div>
          </div>
        )}

        {/* Work culture */}
        {card.workCulture && card.workCulture.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Work culture</p>
            <div className="flex flex-wrap gap-2">
              {card.workCulture.map((culture, i) => (
                <Tag key={i} label={typeof culture === 'string' ? culture : (culture as any).label} variant="green" />
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailCard>
  );
};

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = user?.role?.toLowerCase() === 'employer';
  const [activeTab, setActiveTab] = useState('Details');
  const [editSection, setEditSection] = useState<'details' | 'responsibilities' | 'experience' | 'compensation' | 'collaboration' | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);

  const tabs = isEmployer ? JOB_DETAILS_TABS : ['Details'];

  // API queries
  const { data: jobDetail, isLoading: detailLoading } = useEmployerJobDetailQuery(id || '');
  const { data: applicantsData, isLoading: applicantsLoading } = useEmployerJobApplicantsQuery(
    id || '',
    { enabled: isEmployer && activeTab === 'Applicants' }
  );
  const { data: hiresData, isLoading: hiresLoading } = useEmployerJobHiresQuery(
    id || '',
    { enabled: isEmployer && activeTab === 'Hired' }
  );

  const handleEdit = (section: any) => {
    if (!isEmployer) return;
    setEditSection(section);
  };

  // Loading state
  if (detailLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size={32} className="text-[#0047CC]" />
        <p className="text-[13px] font-medium text-gray-500">Loading job details…</p>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbItems = jobDetail?.breadcrumb ?? [
    { label: 'All jobs', href: '/jobs' },
    { label: jobDetail?.roleTitle || 'Job details', href: null },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Breadcrumb */}
      <div className="space-y-6">
        <h1 className="text-[28px] font-medium text-[#0047CC] tracking-tight">Jobs</h1>
        
        <div className="flex items-center gap-3 text-[14px]">
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRightIcon size={14} className="text-gray-300" />}
              {item.href ? (
                <button
                  onClick={() => navigate(item.href!)}
                  className="flex items-center gap-1 text-gray-400 hover:text-[#0047CC] transition-colors font-medium cursor-pointer bg-transparent border-none p-0 shadow-none"
                >
                  {idx === 0 && <ChevronLeftIcon size={16} strokeWidth={3} />}
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <TabSlider 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          renderTabExtra={(tab) => {
            if (!isEmployer) return null;
            if (tab === 'Hired') {
              const count = jobDetail?.tabs?.hiredCount ?? 0;
              return count > 0 ? (
                <span className="bg-[#0047CC] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">{count}</span>
              ) : null;
            }
            if (tab === 'Applicants') {
              const count = jobDetail?.tabs?.applicantsCount ?? 0;
              return (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">{count}</span>
              );
            }
            return null;
          }}
        />
      </div>

      {isEmployer && activeTab === 'Applicants' ? (
        <ApplicantsTabView 
          data={applicantsData}
          isLoading={applicantsLoading}
          onHire={(a: any) => {
            setSelectedApplicant(a);
            setIsApplicantModalOpen(true);
          }}
        />
      ) : isEmployer && activeTab === 'Hired' ? (
        <HiredTabView 
          data={hiresData}
          isLoading={hiresLoading}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            {jobDetail?.roleDetails && (
              <DynamicDetailCard 
                title="Role details"
                card={jobDetail.roleDetails} 
                isEmployer={isEmployer}
                onEdit={() => handleEdit('details')}
              />
            )}

            {jobDetail?.experience && (
              <DynamicDetailCard 
                title="Experience & background"
                card={jobDetail.experience} 
                isEmployer={isEmployer}
                onEdit={() => handleEdit('experience')}
              />
            )}

            {jobDetail?.compensation && (
              <DynamicDetailCard 
                title="Compensation & documentation"
                card={jobDetail.compensation} 
                isEmployer={isEmployer}
                onEdit={() => handleEdit('compensation')}
              />
            )}
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {jobDetail?.responsibilities && (
              <DynamicDetailCard 
                title="Responsibilities & skills"
                card={jobDetail.responsibilities} 
                isEmployer={isEmployer}
                onEdit={() => handleEdit('responsibilities')}
              />
            )}

            {jobDetail?.team && (
              <DynamicDetailCard 
                title="Team collaboration & communication"
                card={jobDetail.team} 
                isEmployer={isEmployer}
                onEdit={() => handleEdit('collaboration')}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSection && (
        <JobEditModal 
          isOpen={!!editSection}
          onClose={() => setEditSection(null)}
          section={editSection}
          data={jobDetail as any}
        />
      )}

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal 
        isOpen={isApplicantModalOpen}
        onClose={() => setIsApplicantModalOpen(false)}
        applicant={selectedApplicant}
        onReject={() => {
          setIsApplicantModalOpen(false);
          navigate(`/jobs/${id}/reject/${selectedApplicant.id || selectedApplicant.assessmentId}`);
        }}
        onHire={() => {
          setIsApplicantModalOpen(false);
        }}
      />
    </div>
  );
};

export default JobDetails;
