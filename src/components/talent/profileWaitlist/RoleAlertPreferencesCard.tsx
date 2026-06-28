import Button from '../../common/Button';
import { BellIcon, CheckIcon, EditIcon, InfoIcon, AlertTriangleIcon } from '../../common/Icons';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import AlertBanner from '../../common/AlertBanner';
import type { RoleAlertPreferences } from '../../../types/profileMatchWaitlist';

interface RoleAlertPreferencesCardProps {
  preferences: RoleAlertPreferences;
  draft: RoleAlertPreferences;
  isEditing: boolean;
  alertSet: boolean;
  matchThreshold?: number;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSetAlert: () => void;
  onDraftChange: (field: keyof RoleAlertPreferences, value: string) => void;
}

const preferenceFields: {
  key: keyof RoleAlertPreferences;
  label: string;
  placeholder: string;
  fullWidth?: boolean;
}[] = [
  { key: 'roleType', label: 'Role type', placeholder: 'e.g. Research, Health Policy, Data Science…' },
  {
    key: 'experienceLevel',
    label: 'Experience level',
    placeholder: 'e.g. Entry level, Masters, Senior…',
  },
  { key: 'location', label: 'Location / Region', placeholder: 'e.g. Remote, Lagos, EMEA, Global…' },
  {
    key: 'salaryExpectation',
    label: 'Salary expectation',
    placeholder: 'e.g. $2,000/mo, negotiable…',
  },
  {
    key: 'otherPreferences',
    label: 'Anything else VORA should know?',
    placeholder:
      'Contract type, sector preferences, visa requirements, or anything else that matters to you…',
    fullWidth: true,
  },
];

const RoleAlertPreferencesCard: React.FC<RoleAlertPreferencesCardProps> = ({
  preferences,
  draft,
  isEditing,
  alertSet,
  matchThreshold = 80,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSetAlert,
  onDraftChange,
}) => (
  <div className="bg-white border border-[#E6E6E6] rounded-[10px] px-5 sm:px-[26px] py-6 mb-[18px]">
    <h3 className="text-base font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
      <BellIcon size={18} strokeWidth={2.5} className="text-[#0047CC]" />
      Be the first to know when your role goes live
    </h3>
    <p className="text-sm text-[#4A4A4A] leading-relaxed mb-2.5">
      Tell us what you are looking for. The moment a role is posted that matches your full profile at{' '}
      {matchThreshold}% or above, you will be notified instantly and can go straight into assessment, no
      re-uploading, no re-onboarding.
    </p>

    <div className="text-[13px] text-[#0047CC] font-bold mb-[18px] flex items-center gap-2">
      <InfoIcon size={14} strokeWidth={2.5} className="shrink-0" />
      You are already signed up, your profile is live and working for you 24/7.
    </div>

    {!isEditing ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        {preferenceFields.map((field) => (
          <div
            key={field.key}
            className={`bg-[#F7F7F7] border-[1.5px] border-[#E6E6E6] rounded-lg px-3.5 py-3 ${
              field.fullWidth ? 'sm:col-span-2' : ''
            }`}
          >
            <p className="text-[11px] font-bold text-[#808080] uppercase tracking-wide mb-1">
              {field.label}
            </p>
            <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{preferences[field.key]}</p>
          </div>
        ))}
      </div>
    ) : (
      <>
        <AlertBanner variant="amber" showIcon={false} className="mb-4 !rounded-lg !px-4 !py-3.5">
          <AlertTriangleIcon size={16} strokeWidth={2.5} className="shrink-0 mt-0.5 text-[#D97706]" />
          <div>
            <p className="text-sm font-bold text-[#92400E] mb-1.5">
              Your current profile is why VORA flagged you as a strong fit
            </p>
            <p className="text-[13px] text-[#78350F] leading-relaxed [&_strong]:font-bold [&_strong]:text-[#92400E]">
              Changing these preferences updates the criteria VORA uses to match you.{' '}
              <strong>We will still alert you</strong>, but we will re-run the matching process from
              scratch against your updated profile. This means a fresh scan, a new match score, and
              potentially a different outcome. <strong>Your current profile data stays on file either way.</strong>
            </p>
          </div>
        </AlertBanner>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          {preferenceFields.map((field) => (
            <div key={field.key} className={field.fullWidth ? 'sm:col-span-2' : ''}>
              {field.fullWidth ? (
                <Textarea
                  label={field.label}
                  value={draft[field.key]}
                  onChange={(e) => onDraftChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                />
              ) : (
                <Input
                  label={field.label}
                  value={draft[field.key]}
                  onChange={(e) => onDraftChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </>
    )}

    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-2">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {!isEditing ? (
          <Button
            type="button"
            variant="primary-outline"
            fullWidth={false}
            onClick={onStartEdit}
            className="!text-[13px] !px-[18px] !py-2.5 !min-h-0 !font-bold"
          >
            <EditIcon size={14} strokeWidth={2.5} />
            Edit preferences
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              fullWidth={false}
              onClick={onSaveEdit}
              className="!text-[13px] !px-[18px] !py-2.5 !min-h-0 !font-bold"
            >
              <CheckIcon size={14} strokeWidth={2.5} />
              Save &amp; update matching
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              onClick={onCancelEdit}
              className="!text-[13px] !px-[18px] !py-2.5 !min-h-0 !font-bold"
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth={false}
        onClick={onSetAlert}
        disabled={alertSet}
        className="gap-2 !text-[13px] !px-[18px] !py-2.5 !min-h-0 !font-bold"
      >
        {alertSet ? (
          <>
            <CheckIcon size={14} strokeWidth={2.5} />
            Alert set
          </>
        ) : (
          <>
            <BellIcon size={14} strokeWidth={2.5} />
            Alert me when my role goes live
          </>
        )}
      </Button>
    </div>
  </div>
);

export default RoleAlertPreferencesCard;
