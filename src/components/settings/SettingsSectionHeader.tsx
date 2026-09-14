import React from 'react';
import Button from '../common/Button';
import { SectionDescription, SectionHeading } from '../common/Typography';

interface SettingsSectionHeaderProps {
  title: string;
  description?: string;
  saveLabel?: string;
  onSave?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

const SettingsSectionHeader: React.FC<SettingsSectionHeaderProps> = ({
  title,
  description,
  saveLabel = 'Save changes',
  onSave,
  disabled = false,
  isLoading = false,
  loadingLabel = 'Saving…',
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-6">
    <div className="min-w-0">
      <SectionHeading className="mb-1">{title}</SectionHeading>
      {description && <SectionDescription className="text-[13px]">{description}</SectionDescription>}
    </div>
    {onSave && (
      <Button
        variant="primary"
        fullWidth={false}
        onClick={onSave}
        disabled={disabled || isLoading}
        isLoading={isLoading}
        loadingLabel={loadingLabel}
        className="shrink-0 text-[13px] font-bold w-full sm:w-auto"
      >
        {saveLabel}
      </Button>
    )}
  </div>
);

export default SettingsSectionHeader;
