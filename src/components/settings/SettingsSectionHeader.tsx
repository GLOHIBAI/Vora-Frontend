import React from 'react';
import Button from '../common/Button';
import { SectionDescription, SectionHeading } from '../common/Typography';

interface SettingsSectionHeaderProps {
  title: string;
  description?: string;
  saveLabel?: string;
  onSave?: () => void;
}

const SettingsSectionHeader: React.FC<SettingsSectionHeaderProps> = ({
  title,
  description,
  saveLabel = 'Save changes',
  onSave,
}) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <SectionHeading className="mb-1">{title}</SectionHeading>
      {description && <SectionDescription className="text-[13px]">{description}</SectionDescription>}
    </div>
    {onSave && (
      <Button variant="primary" fullWidth={false} onClick={onSave} className="shrink-0 text-[13px] font-bold">
        {saveLabel}
      </Button>
    )}
  </div>
);

export default SettingsSectionHeader;
