import React, { useState } from 'react';
import type { CompensationTypeId } from '../CompensationTypeSelector';
import AlertBanner from '../../common/AlertBanner';
import PreviewField from '../../common/PreviewField';
import PreviewSectionCard from '../../common/PreviewSectionCard';
import Tag from '../../common/Tag';
import { FieldLabel } from '../../common/Typography';

export interface EscrowPreviewSummary {
  total: number;
  currency: string;
  midpoint: number;
  positions: number;
  rateLabel: string;
  perPosition: number;
  compTypeLabel: string;
  salaryRangeLabel?: string;
  payPeriodLabel?: string;
}

interface PostJobPreviewStepProps {
  isScheduled: boolean;
  goLiveDate: string;
  formatDate: (dateStr: string) => string;
  onEditStep: (step: number) => void;
  escrow: EscrowPreviewSummary;
  roleType: string;
  roleTitle: string;
  level: string;
  positions: string;
  timeCommitment: string;
  workFormat: string;
  location: string;
  additionalLocations: string[];
  selectedTimezones: string[];
  startDate: string;
  endDate: string;
  summary: string;
  internationalPolicy: string;
  securityClearance: string;
  roleGoal: string;
  coreResponsibilities: string;
  technicalSkills: string[];
  tools: string[];
  languages: string[];
  preAssessments: string[];
  experienceYears: string;
  experienceTypes: string[];
  minQualification: string;
  sectorBackground: string[];
  geographicExperience: string[];
  publicationsRequired: string;
  budgetManagement: string;
  preferredWorkingStyle: string[];
  communicationRhythm: string[];
  primaryLanguage: string;
  personalityTraits: string[];
  workEnvironment: string[];
  compType: CompensationTypeId;
  expenses: string;
  fmt: (value: number, currency: string) => string;
}

function PreviewTagList({
  items,
  variant = 'blue',
}: {
  items: string[];
  variant?: 'blue' | 'green';
}) {
  if (!items.length) return <span className="text-[13px] text-[#808080]">—</span>;
  const tagVariant = variant === 'green' ? 'green' : 'blue';
  const borderClass =
    variant === 'green' ? 'border border-[#85E585]' : 'border border-[#BDD9FF]';

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item) => (
        <Tag
          key={item}
          label={item}
          variant={tagVariant}
          className={`px-2.5 py-0.5 text-[11px] ${borderClass}`}
        />
      ))}
    </div>
  );
}

function LongText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text?.trim()) return <span className="text-[13px] text-[#808080]">—</span>;
  const short = text.length > 180 && !expanded;
  return (
    <p className="text-[13px] text-[#4A4A4A] leading-relaxed mt-1">
      {short ? `${text.slice(0, 180)}…` : text}{' '}
      {text.length > 180 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[#0047CC] font-semibold hover:underline cursor-pointer"
        >
          {expanded ? 'see less' : 'see more'}
        </button>
      )}
    </p>
  );
}

const PostJobPreviewStep: React.FC<PostJobPreviewStepProps> = ({
  isScheduled,
  goLiveDate,
  formatDate,
  onEditStep,
  escrow,
  roleType,
  roleTitle,
  level,
  positions,
  timeCommitment,
  workFormat,
  location,
  additionalLocations,
  selectedTimezones,
  startDate,
  endDate,
  summary,
  internationalPolicy,
  securityClearance,
  roleGoal,
  coreResponsibilities,
  technicalSkills,
  tools,
  languages,
  preAssessments,
  experienceYears,
  experienceTypes,
  minQualification,
  sectorBackground,
  geographicExperience,
  publicationsRequired,
  budgetManagement,
  preferredWorkingStyle,
  communicationRhythm,
  primaryLanguage,
  personalityTraits,
  workEnvironment,
  compType,
  expenses,
  fmt,
}) => {
  const locationLabel = [location, ...additionalLocations].filter(Boolean).join('; ') || '—';
  const timezoneLabel = selectedTimezones.length ? selectedTimezones.join(', ') : '—';

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      <AlertBanner variant="blue">
        Click any <strong>checkmark</strong> in the sidebar to go back and edit that section. Click{' '}
        <strong>Edit</strong> on any card below to jump directly to that section. Nothing is posted or
        charged until you confirm payment.
      </AlertBanner>

      {isScheduled && (
        <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#BDD9FF] bg-[#EBF6FF] px-4 py-1.5 text-[13px] font-semibold text-[#0047CC]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Scheduled Hiring — role enters Vault on submission, goes live{' '}
          <span className="font-bold">{goLiveDate ? formatDate(goLiveDate) : '—'}</span>
        </div>
      )}

      <PreviewSectionCard title="Role details" onEdit={() => onEditStep(1)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <PreviewField label="Role type" value={roleType || '—'} />
          <PreviewField label="Role title" value={roleTitle || '—'} />
          <PreviewField
            label="Employment level"
            value={level ? level.charAt(0).toUpperCase() + level.slice(1) : '—'}
          />
          <PreviewField
            label="Available positions"
            value={positions ? `${positions} position${parseInt(positions, 10) > 1 ? 's' : ''}` : '—'}
          />
          <PreviewField label="Work format" value={workFormat || '—'} />
          <PreviewField label="Timezone requirement" value={timezoneLabel} />
          <PreviewField label="Work location" value={locationLabel} />
          <PreviewField label="Start date" value={startDate ? formatDate(startDate) : '—'} />
          {endDate && <PreviewField label="End date" value={formatDate(endDate)} />}
          <PreviewField label="International policy" value={internationalPolicy || '—'} />
          <PreviewField label="Security clearance" value={securityClearance || '—'} />
          {timeCommitment && <PreviewField label="Time commitment" value={timeCommitment} />}
        </div>
        <div className="border-t border-[#E6E6E6] mt-4 pt-4">
          <FieldLabel className="mb-1">Role summary</FieldLabel>
          <LongText text={summary} />
        </div>
      </PreviewSectionCard>

      <PreviewSectionCard title="Responsibilities & skills" onEdit={() => onEditStep(2)}>
        <div className="space-y-4">
          <div>
            <FieldLabel className="mb-1">Role goal</FieldLabel>
            <LongText text={roleGoal} />
          </div>
          <div>
            <FieldLabel className="mb-1">Core responsibilities</FieldLabel>
            <LongText text={coreResponsibilities} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#E6E6E6]">
            <div>
              <FieldLabel>Technical skills</FieldLabel>
              <PreviewTagList items={technicalSkills} variant="blue" />
            </div>
            <div>
              <FieldLabel>Tools / software</FieldLabel>
              <PreviewTagList items={tools} variant="blue" />
            </div>
            <div>
              <FieldLabel>Language requirements</FieldLabel>
              <PreviewTagList items={languages} variant="blue" />
            </div>
            <div>
              <FieldLabel>Pre-assessment submission</FieldLabel>
              <PreviewTagList items={preAssessments} variant="blue" />
            </div>
          </div>
        </div>
      </PreviewSectionCard>

      <PreviewSectionCard title="Experience & background" onEdit={() => onEditStep(3)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <PreviewField label="Minimum qualification" value={minQualification || '—'} />
          <PreviewField
            label="Relevant field(s)"
            value={experienceTypes.length ? experienceTypes.join(', ') : '—'}
          />
          <PreviewField label="Years of experience" value={experienceYears || '—'} />
          <PreviewField
            label="Sector background"
            value={sectorBackground.length ? sectorBackground.join(', ') : '—'}
          />
          <PreviewField
            label="Geographic experience"
            value={geographicExperience.length ? geographicExperience.join(', ') : '—'}
          />
          <PreviewField label="Publications" value={publicationsRequired || '—'} />
          <PreviewField label="Budget management" value={budgetManagement || '—'} />
        </div>
      </PreviewSectionCard>

      <PreviewSectionCard title="Team collaboration & communication" onEdit={() => onEditStep(4)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div>
            <FieldLabel>Preferred working style</FieldLabel>
            <PreviewTagList items={preferredWorkingStyle} variant="green" />
          </div>
          <PreviewField
            label="Check-in rhythm"
            value={communicationRhythm.length ? communicationRhythm.join(', ') : '—'}
          />
          <PreviewField label="Working language" value={primaryLanguage || '—'} />
          <div>
            <FieldLabel>Personality traits</FieldLabel>
            <PreviewTagList items={personalityTraits} variant="green" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <FieldLabel>Work environment</FieldLabel>
            <PreviewTagList items={workEnvironment} variant="green" />
          </div>
        </div>
      </PreviewSectionCard>

      <PreviewSectionCard title="Compensation & documentation" onEdit={() => onEditStep(5)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <PreviewField label="Compensation type" value={escrow.compTypeLabel} />
          {escrow.salaryRangeLabel && (
            <PreviewField label="Salary range" value={escrow.salaryRangeLabel} />
          )}
          {escrow.payPeriodLabel && <PreviewField label="Pay period" value={escrow.payPeriodLabel} />}
          {expenses && compType === 'unp' && (
            <PreviewField label="Benefits / allowances" value={expenses} />
          )}
        </div>
        <div className="mt-4 rounded-lg bg-[#EBF6FF] px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div>
            <FieldLabel className="text-[12px] normal-case tracking-normal text-[#808080]">
              Escrow locked today
            </FieldLabel>
            <div className="text-xl font-bold text-[#0047CC] mt-0.5">{fmt(escrow.total, escrow.currency)}</div>
            <div className="text-[11px] text-[#808080] mt-1">
              Based on midpoint {fmt(escrow.midpoint, escrow.currency)} × {escrow.positions} position
              {escrow.positions > 1 ? 's' : ''} × {escrow.rateLabel}
            </div>
          </div>
          <div className="text-[11px] text-[#182348] bg-white border border-[#BDD9FF] rounded-lg px-3 py-2 max-w-[220px] leading-relaxed">
            True-up fires on hire confirmation. Difference charged or refunded automatically.
          </div>
        </div>
      </PreviewSectionCard>
    </div>
  );
};

export default PostJobPreviewStep;
