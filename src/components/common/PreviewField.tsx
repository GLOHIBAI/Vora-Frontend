import React from 'react';
import { FieldLabel } from './Typography';

interface PreviewFieldProps {
  label: string;
  value?: React.ReactNode;
}

const PreviewField: React.FC<PreviewFieldProps> = ({ label, value }) => {
  const empty =
    value === undefined ||
    value === null ||
    value === '' ||
    value === '--' ||
    (Array.isArray(value) && value.length === 0);
  if (empty) return null;

  return (
    <div>
      <FieldLabel className="mb-1">{label}</FieldLabel>
      <div className="text-[13px] text-[#1A1A1A] font-medium leading-snug">{value}</div>
    </div>
  );
};

export default PreviewField;
